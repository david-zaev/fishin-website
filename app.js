/**
 * FishIn - Interactive Angling Intelligence Engine & Ambient Canvas
 * High-performance, zero-dependency, pure JavaScript
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Ambient Background Canvas: Bathymetric Wave & Sonar Simulation
  // =========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let dpr = 1;
    let animationFrameId;
    let time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    // Realistic Underwater Rising Bubbles
    const bubbles = [];

    function initBubbles() {
      bubbles.length = 0;
      const count = width < 768 ? 24 : 55;
      for (let i = 0; i < count; i++) {
        const radius = Math.random() < 0.25 
          ? Math.random() * (width < 768 ? 8 : 12) + 7
          : Math.random() * 5 + 2.5;
        bubbles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: radius,
          speedY: (radius * 0.04) + 0.4 + Math.random() * 0.5,
          wobbleOffset: Math.random() * Math.PI * 2,
          wobbleAmp: Math.random() * 2.5 + 1.2,
          alpha: Math.random() * 0.3 + 0.18
        });
      }
    }

    function resize() {
      const container = canvas.parentElement;
      width = Math.max(container ? container.clientWidth : 0, window.innerWidth);
      height = container ? container.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 3);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      initBubbles();
    }

    window.addEventListener('resize', resize);
    resize();

    // Scroll Momentum & Parallax Tracking
    let scrollY = window.scrollY || 0;
    let targetScrollY = window.scrollY || 0;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY || 0;

    window.addEventListener('scroll', function () {
      const cur = window.scrollY || 0;
      const diff = cur - lastScrollY;
      scrollVelocity += diff * 0.18;
      lastScrollY = cur;
      targetScrollY = cur;
    }, { passive: true });

    window.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    });

    // Mobile touch interaction
    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });

    // Click & Touch shockwave ripples
    const ripples = [];
    function addRipple(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      ripples.push({
        x: clientX - rect.left,
        y: clientY - rect.top,
        radius: 0,
        maxRadius: Math.max(width, height) * (width < 768 ? 0.45 : 0.65),
        alpha: 0.8
      });
    }

    window.addEventListener('click', function (e) {
      addRipple(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
        addRipple(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    function draw() {
      time += 0.005;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse / touch tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      // Smooth fluid scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.08;
      scrollVelocity *= 0.91; // natural water viscosity damping

      // 1. Draw Rising Underwater Bubbles with Scroll Momentum
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y -= (b.speedY + scrollVelocity * 0.15);

        // Reset bubble to bottom with randomized x when it reaches the top
        if (b.y < -30) {
          b.y = height + 30 + Math.random() * 40;
          b.x = Math.random() * width;
        } else if (b.y > height + 60) {
          b.y = -20;
          b.x = Math.random() * width;
        }

        // Sinusoidal wobble motion
        const currentX = b.x + Math.sin(time * 3 + b.wobbleOffset) * b.wobbleAmp;

        // Subtle mouse repulsion deflection
        const dx = currentX - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const force = (1 - dist / 160) * 2.2;
          b.x += (dx / (dist || 1)) * force;
        }

        // Outer membrane
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.75})`;
        ctx.lineWidth = Math.max(1, b.radius * 0.08);
        ctx.stroke();

        // Translucent spherical body fill
        const grad = ctx.createRadialGradient(
          currentX - b.radius * 0.3,
          b.y - b.radius * 0.3,
          b.radius * 0.1,
          currentX,
          b.y,
          b.radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.22})`);
        grad.addColorStop(0.7, `rgba(255, 255, 255, ${b.alpha * 0.04})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Specular glint highlight
        if (b.radius > 4.5) {
          ctx.beginPath();
          ctx.arc(
            currentX - b.radius * 0.36,
            b.y - b.radius * 0.36,
            Math.max(1.2, b.radius * 0.22),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.85})`;
          ctx.fill();
        }
      }

      // 2. Draw Bathymetric Waves with Adaptive Mobile Harmonics & Quadratic Splines
      const isMobile = width < 768;
      const activeLines = isMobile ? 8 : 15;
      const activePoints = isMobile ? 44 : 72;
      const ampMult = isMobile ? 0.38 : 1.0;

      for (let i = 0; i < activeLines; i++) {
        const parallaxSpeed = 0.05 + (i / activeLines) * 0.15;
        const lineOffset = (i / activeLines) * (height * 1.04) - 10 - (scrollY * parallaxSpeed * 0.35);
        
        const dyLine = Math.abs(lineOffset - mouse.y);
        const lineProximity = Math.max(0, 1 - dyLine / (isMobile ? 220 : 400));
        const alpha = Math.min(0.65, (0.12 + (i / activeLines) * 0.14) + (lineProximity * 0.35));
        
        const pts = [];

        for (let j = 0; j <= activePoints; j++) {
          const normX = j / activePoints;
          const x = normX * width;
          
          // Normalized spatial wave harmonics: smooth broad oceanic curves on both mobile & desktop
          const wave1 = Math.sin(normX * Math.PI * 1.8 + time * 1.1 + i * 0.42) * (34 * ampMult);
          const wave2 = Math.cos(normX * Math.PI * 1.2 - time * 0.65 + i * 0.28) * (20 * ampMult);
          const wave3 = Math.sin(normX * Math.PI * 2.8 + time * 0.85 + i * 0.55) * (14 * ampMult);

          // Scroll momentum swell
          const scrollSurge = Math.sin(normX * Math.PI * 2.0 + time * 1.6) * Math.min(scrollVelocity, 40) * (isMobile ? 0.55 : 1.1);

          // Cursor / touch influence (smooth cosine bell falloff)
          const dx = x - mouse.x;
          const dy = (lineOffset + wave1) - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInfluenceDist = isMobile ? 220 : 420;
          let mouseInfluence = 0;
          if (dist < maxInfluenceDist) {
            const norm = dist / maxInfluenceDist;
            const bell = 0.5 * (1 + Math.cos(norm * Math.PI));
            mouseInfluence = bell * (isMobile ? 24 : 48) * Math.sin(time * 2.0 + normX * 2.5);
          }

          // Ripple shockwave influence
          let rippleInfluence = 0;
          for (let r = 0; r < ripples.length; r++) {
            const rip = ripples[r];
            const rdx = x - rip.x;
            const rdy = (lineOffset + wave1) - rip.y;
            const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
            const waveDist = Math.abs(rDist - rip.radius);
            if (waveDist < 80) {
              const rBell = 0.5 * (1 + Math.cos((waveDist / 80) * Math.PI));
              rippleInfluence += rBell * (isMobile ? 15 : 26) * rip.alpha;
            }
          }

          const y = lineOffset + wave1 + wave2 + wave3 + scrollSurge + mouseInfluence + rippleInfluence;
          pts.push({ x: x, y: y });
        }

        // Draw line with quadratic curve midpoint smoothing (100% curved, zero straight segments!)
        if (pts.length > 2) {
          ctx.beginPath();
          ctx.lineWidth = (isMobile ? 1.2 : 1.4) + lineProximity * 0.8;
          ctx.strokeStyle = `rgba(240, 240, 245, ${alpha})`;

          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 0; k < pts.length - 1; k++) {
            const midX = (pts[k].x + pts[k + 1].x) * 0.5;
            const midY = (pts[k].y + pts[k + 1].y) * 0.5;
            ctx.quadraticCurveTo(pts[k].x, pts[k].y, midX, midY);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
        }
      }


      // Update & Draw Click Shockwave Rings
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 7;
        rip.alpha *= 0.96;

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (rip.alpha < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(r, 1);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    // Pause when page is hidden to preserve battery
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        draw();
      }
    });
  }

  // =========================================================================
  // 2. Interactive Scrolling & Parallax Engine
  // =========================================================================
  const siteNav = document.querySelector('.site-nav');
  const phoneWrapper = document.querySelector('.phone-wrapper');

  let mouseRelX = 0;
  let mouseRelY = 0;
  window.addEventListener('mousemove', function (e) {
    mouseRelX = (e.clientX - window.innerWidth * 0.5) / (window.innerWidth * 0.5);
    mouseRelY = (e.clientY - window.innerHeight * 0.5) / (window.innerHeight * 0.5);
  });

  window.addEventListener('scroll', function () {
    const curY = window.scrollY || 0;

    // Nav blur background
    if (siteNav) {
      if (curY > 30) {
        siteNav.classList.add('scrolled');
      } else {
        siteNav.classList.remove('scrolled');
      }
    }

    // Hero S23 Ultra Phone Mockup 3D Float & Tilt on Scroll (Desktop only)
    if (phoneWrapper && window.innerWidth > 992 && curY < 1200) {
      const translateY = curY * 0.12;
      const rotX = (mouseRelY * -3.5) + Math.min(curY * 0.012, 5);
      const rotY = mouseRelX * 4.5;
      phoneWrapper.style.transform = `translateY(${translateY}px) perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
  }, { passive: true });

  // =========================================================================
  // 3. Interactive Intelligence Demo Terminal (Mode Tabs Navigation)
  // =========================================================================
  const tabPanes = document.querySelectorAll('.tab-pane');
  const modeTabBtns = document.querySelectorAll('.mode-tab-btn');

  let resizeHydroCanvasFn = null;

  function setActiveDemoTab(targetTabId) {
    if (!targetTabId) return;

    modeTabBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-tab') === targetTabId;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });

    if (targetTabId === 'tab-brief' && typeof resizeHydroCanvasFn === 'function') {
      setTimeout(resizeHydroCanvasFn, 20);
    }
  }

  modeTabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab');
      setActiveDemoTab(tabId);
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tabId = this.getAttribute('data-tab');
        setActiveDemoTab(tabId);
      }
    });
  });

  // Tab 1: AI Tactical Brief Simulator
  const chipOptions = document.querySelectorAll('.demo-form .chip-option');
  const briefHeadline = document.getElementById('brief-headline');
  const briefSummary = document.getElementById('brief-summary');
  const briefScore = document.getElementById('brief-score');
  const briefWindow = document.getElementById('brief-window');
  const briefTackle = document.getElementById('brief-tackle');
  const briefTactics = document.getElementById('brief-tactics');

  const tacticalDatabase = {
    'bass': {
      name: 'Largemouth Bass',
      falling: {
        score: '91 / 100',
        headline: 'Aggressive Pre-Front Feed on Weedlines & Drop-Offs',
        summary: 'Barometer dropping 2.8 hPa over 3 hours. Feeding activity elevated across shallow windblown flats. Fish are aggressively ambushing baitfish before the incoming low-pressure front.',
        window: '06:15 - 08:45 AM (Major)',
        tackle: '110mm Suspending Jerkbait & 3/8oz Black/Blue Jig',
        tactics: 'Erratic twitch-twitch-pause (3s pause cadence). Target secondary points and submerged timber edges.'
      },
      stable: {
        score: '68 / 100',
        headline: 'High-Sky Post-Front Suspension: Tight Structure Focus',
        summary: 'High pressure ridge settling at 1022 hPa. Sunlight penetration high. Bass are holding tight to dense shade and bottom structure. Finesse presentation required.',
        window: '05:30 - 06:45 AM (Sunrise Minor)',
        tackle: '5" Green Pumpkin Senko (Weightless) or Ned Rig',
        tactics: 'Dead-sticking on bottom with subtle 2-inch hops. Emphasize natural colorways in high-clarity water.'
      },
      overcast: {
        score: '84 / 100',
        headline: 'Low-Light Roaming Feed: Active Reaction Baits',
        summary: 'Heavy overcast cover and light chop. Bass are wandering away from heavy cover to cruise flats for schooling shad. Reaction strikes favored.',
        window: '14:20 - 17:15 PM (Major Solar Transit)',
        tackle: '1/2oz Double Willow Spinnerbait or Squarebill Crankbait',
        tactics: 'Steady medium-fast retrieve deflecting off stumps and rip-rap rocks to trigger reactionary strikes.'
      }
    },
    'pike': {
      name: 'Northern Pike',
      falling: {
        score: '94 / 100',
        headline: 'Apex Frenzy: High Barometric Gradient Feeding',
        summary: 'Pike respond rapidly to pre-frontal drops. Apex predators active in transitional cabbage beds and weedline drop-offs. Water displacement is critical.',
        window: '07:00 - 09:30 AM (Major Window)',
        tackle: '6" Glide Bait (Perch pattern) + 40lb Wire/Fluorocarbon Leader',
        tactics: 'Wide lateral S-curve glides with deliberate pauses. Ensure strike-ready grip on line pause.'
      },
      stable: {
        score: '62 / 100',
        headline: 'Deep Cabbage Retreat: Slow Vertical Jigging',
        summary: 'Bright sun pushing pike down into deeper weed pockets and breaklines. Reluctant to chase fast presentations across open water.',
        window: '17:45 - 19:15 PM (Sunset)',
        tackle: 'Heavy Paddle Tail Swimbait (5") on 1/2oz Jighead',
        tactics: 'Slow rolling inches above deep vegetation. Bump weed tops to provoke territorial reaction.'
      },
      overcast: {
        score: '87 / 100',
        headline: 'Mid-Water Shallows Prowl: High-Visibility Spoons',
        summary: 'Dispersed light levels allow pike to roam without eye fatigue. Hunting roaming panfish along weed edges.',
        window: '11:30 AM - 13:45 PM (Minor Window)',
        tackle: 'Silver Weedless Casting Spoon (1oz) or Chatterbait',
        tactics: 'Rhythmic fluttering retrieve allowing spoon to wobble during periodic rod-tip drops.'
      }
    },
    'trout': {
      name: 'Brown Trout',
      falling: {
        score: '88 / 100',
        headline: 'Active Stream Drift & Terrestrial Surge',
        summary: 'Barometer drop triggering nymph activity and streamer aggression in current seams, undercut banks, and tail-outs.',
        window: '06:00 - 08:15 AM (Dawn Major)',
        tackle: 'Olive Woolly Bugger (Size 6) or 50mm Minnow Plug',
        tactics: 'Cast upstream across current seam; strip erratically across the hydraulic divide.'
      },
      stable: {
        score: '72 / 100',
        headline: 'Pocket Water Stealth: Finesse Micro-Nymphing',
        summary: 'Trout tucked tightly under turbulent rapids and shade lines to escape aerial predators. Delicate drift essential.',
        window: '18:30 - 20:00 PM (Evening Rise)',
        tackle: 'Size 16 Pheasant Tail Nymph under Indicator or Floating Micro-Crank',
        tactics: 'Dead drift with zero surface drag. 4lb fluorocarbon tippet required for wary fish.'
      },
      overcast: {
        score: '86 / 100',
        headline: 'Shallow Bank Ambush: Aggressive Streamer Pursuit',
        summary: 'Overcast skies eliminate shadows, encouraging trophy browns to leave deep holes and hunt open runs.',
        window: '13:00 - 15:30 PM (Midday Minor)',
        tackle: 'Articulated Streamer (Black/Gold) on Sink-Tip Line',
        tactics: 'Fast, aggressive pulsing retrieve with rod tip low to the water.'
      }
    },
    'walleye': {
      name: 'Walleye / Zander',
      falling: {
        score: '93 / 100',
        headline: 'Twilight Reef Assault: Active Shiner Pursuit',
        summary: 'Low light optics advantage in full effect. Walleye moving onto 8-12ft rocky humps and sandbars as pressure falls.',
        window: '19:15 - 21:45 PM (Dusk Major)',
        tackle: 'Deep Husky Jerk (Silver/Blue) & 3/8oz Walleye Jig',
        tactics: 'Slow rolling along structure edge. Long pauses keep bait right in the strike zone.'
      },
      stable: {
        score: '65 / 100',
        headline: 'Bottom Hugging on Deep Mud Flats',
        summary: 'Fish glued to bottom transitions in 24-32ft. Vertical presentation and sonar tracking recommended.',
        window: '20:30 - 22:00 PM (Night Window)',
        tackle: 'Live Bait Rig with Leech/Nightcrawler or Jigging Rap',
        tactics: 'Sharp 6-inch vertical snap followed by a controlled glide back to bottom.'
      },
      overcast: {
        score: '85 / 100',
        headline: 'Midday Walleye Chop: Windward Reef Bite',
        summary: 'Wind-driven surface chop breaks light refraction, allowing daylight feeding over shallow rocky shelves.',
        window: '12:45 - 14:45 PM (Solar Noon Window)',
        tackle: 'Blade Bait (1/2oz Gold) or Soft Plastic Minnow',
        tactics: 'Ripping cadence 1 foot off bottom, letting bait vibrate strongly on the lift.'
      }
    }
  };

  let selectedSpecies = 'bass';
  let selectedWeather = 'falling';
  let currentSimMinutes = 390; // 06:30 AM (Dawn Major default)
  let isSimRunning = false;
  let simRafId = null;
  let displayedScore = 91;

  // Species and Weather Selector Buttons
  const specBtns = document.querySelectorAll('.motion-spec-btn');
  const weathBtns = document.querySelectorAll('.motion-weath-btn');

  specBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      specBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedSpecies = this.getAttribute('data-val');
      updateTacticalBrief();
    });
  });

  weathBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      weathBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedWeather = this.getAttribute('data-val');
      updateTacticalBrief();
    });
  });

  const briefScoreNum = document.getElementById('brief-score-num');
  const briefScoreStatus = document.getElementById('brief-score-status');
  const briefGaugeBar = document.getElementById('brief-gauge-bar');

  const statusMap = {
    'falling': 'PRE-FRONT FEEDING AMBUSH',
    'stable': 'DEEP STRUCTURE SUSPENDED',
    'overcast': 'ACTIVE ROAMING FEED'
  };

  // Smooth Rolling Digit Odometer
  let scoreAnimRaf = null;
  function animateScoreTo(targetVal) {
    if (!briefScoreNum) return;
    if (scoreAnimRaf) cancelAnimationFrame(scoreAnimRaf);

    const startVal = displayedScore;
    const startTime = performance.now();
    const duration = 280;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(startVal + (targetVal - startVal) * ease);

      displayedScore = current;
      briefScoreNum.textContent = current;

      if (briefGaugeBar) {
        const circumference = 125.66;
        const offset = circumference - (current / 100) * circumference;
        briefGaugeBar.style.strokeDashoffset = offset.toFixed(2);
      }

      if (progress < 1) {
        scoreAnimRaf = requestAnimationFrame(step);
      }
    }
    scoreAnimRaf = requestAnimationFrame(step);
  }

  // Calculate dynamic score depending on hour of day
  function calculateTimeScore(baseScore, minutes) {
    // Dawn peak ~390 (06:30 AM), Dusk peak ~1170 (07:30 PM)
    const dawnDist = Math.abs(minutes - 390);
    const duskDist = Math.abs(minutes - 1170);
    const nearestPeakDist = Math.min(dawnDist, duskDist);

    let multiplier = 1.0;
    if (nearestPeakDist < 120) {
      multiplier = 1.0 - (nearestPeakDist / 120) * 0.08;
    } else if (minutes > 600 && minutes < 900) {
      multiplier = 0.78; // Solar noon slump
    } else {
      multiplier = 0.65; // Night or off-peak
    }
    return Math.max(48, Math.min(98, Math.round(baseScore * multiplier)));
  }

  function formatMinutes(min) {
    const h = Math.floor(min / 60) % 24;
    const m = Math.floor(min % 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? '0' + m : m;
    return `${displayH}:${displayM} ${ampm}`;
  }

  function updateTacticalBrief() {
    const data = tacticalDatabase[selectedSpecies]?.[selectedWeather] || tacticalDatabase['bass']['falling'];
    if (briefHeadline) briefHeadline.textContent = data.headline;
    if (briefSummary) briefSummary.textContent = data.summary;

    const baseVal = parseInt(data.score.match(/\d+/)[0], 10);
    const dynamicScore = calculateTimeScore(baseVal, currentSimMinutes);
    animateScoreTo(dynamicScore);

    if (briefScoreStatus) {
      if (currentSimMinutes >= 330 && currentSimMinutes <= 510) {
        briefScoreStatus.textContent = 'DAWN MAJOR AMBUSH';
      } else if (currentSimMinutes >= 1110 && currentSimMinutes <= 1260) {
        briefScoreStatus.textContent = 'DUSK MAJOR FEEDING';
      } else if (currentSimMinutes >= 660 && currentSimMinutes <= 840) {
        briefScoreStatus.textContent = 'SOLAR NOON SUSPENDED';
      } else {
        briefScoreStatus.textContent = statusMap[selectedWeather] || 'FEEDING ELEVATED';
      }
    }

    if (briefWindow) {
      briefWindow.textContent = `${formatMinutes(currentSimMinutes)} (${data.window.split('(')[1] || 'Real-Time'})`;
    }
    if (briefTackle) briefTackle.textContent = data.tackle;
    if (briefTactics) briefTactics.textContent = data.tactics;
  }

  // =========================================================================
  // Kinetic 24-Hour Solunar Hydro-Wave Canvas
  // =========================================================================
  const hydroCanvas = document.getElementById('hydro-motion-canvas');
  const simSlider = document.getElementById('sim-time-slider');
  const btnToggleSim = document.getElementById('btn-toggle-sim');
  const simBtnText = document.getElementById('sim-btn-text');
  const scrubberJumps = document.querySelectorAll('.scrubber-quick-jump');

  let hydroCtx = null;
  let wavePhase = 0;

  if (hydroCanvas) {
    hydroCtx = hydroCanvas.getContext('2d');

    function resizeHydroCanvas() {
      if (!hydroCanvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = hydroCanvas.parentElement.getBoundingClientRect();
      hydroCanvas.width = rect.width * dpr;
      hydroCanvas.height = 120 * dpr;
      hydroCtx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeHydroCanvas);
    resizeHydroCanvas();
    resizeHydroCanvasFn = resizeHydroCanvas;

    function renderHydroWave() {
      if (!hydroCtx) return;
      const w = hydroCanvas.parentElement.clientWidth;
      const h = 120;

      hydroCtx.clearRect(0, 0, w, h);
      wavePhase += 0.025;

      // Draw subtle horizontal grid lines
      hydroCtx.strokeStyle = '#1e1e22';
      hydroCtx.lineWidth = 1;
      for (let y = 25; y < h; y += 30) {
        hydroCtx.beginPath();
        hydroCtx.moveTo(0, y);
        hydroCtx.lineTo(w, y);
        hydroCtx.stroke();
      }

      // Compute Curve Points across 24h (0 to w)
      hydroCtx.beginPath();
      hydroCtx.moveTo(0, h);

      const points = [];
      const steps = 70;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * w;
        const minVal = (i / steps) * 1440;

        // Gaussian peaks for Dawn (~390) and Dusk (~1170)
        const d1 = Math.exp(-Math.pow((minVal - 390) / 140, 2)) * 52;
        const d2 = Math.exp(-Math.pow((minVal - 1170) / 150, 2)) * 46;
        const noon = Math.exp(-Math.pow((minVal - 740) / 100, 2)) * 14;
        const ripple = Math.sin(wavePhase + i * 0.18) * 3.5;

        // Invert to canvas Y coordinate (high activity = lower Y / near top)
        const peakHeight = d1 + d2 + noon + ripple + 22;
        const y = Math.max(16, h - 18 - peakHeight);
        points.push({ x, y });
      }

      // Draw smooth curve using cardinal spline / bezier
      hydroCtx.beginPath();
      hydroCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        hydroCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      hydroCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

      // Line Stroke
      hydroCtx.strokeStyle = '#ffffff';
      hydroCtx.lineWidth = 2.2;
      hydroCtx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      hydroCtx.shadowBlur = 8;
      hydroCtx.stroke();
      hydroCtx.shadowBlur = 0;

      // Fill beneath curve
      hydroCtx.lineTo(w, h);
      hydroCtx.lineTo(0, h);
      hydroCtx.closePath();
      const grad = hydroCtx.createLinearGradient(0, 20, 0, h);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      hydroCtx.fillStyle = grad;
      hydroCtx.fill();

      // Draw Live Scrubber Needle
      const needleX = (currentSimMinutes / 1440) * w;
      hydroCtx.strokeStyle = '#ffffff';
      hydroCtx.lineWidth = 2;
      hydroCtx.setLineDash([4, 3]);
      hydroCtx.beginPath();
      hydroCtx.moveTo(needleX, 0);
      hydroCtx.lineTo(needleX, h);
      hydroCtx.stroke();
      hydroCtx.setLineDash([]);

      // Beacon Dot at needle intersection
      const sampleIdx = Math.min(steps, Math.max(0, Math.round((currentSimMinutes / 1440) * steps)));
      const needleY = points[sampleIdx] ? points[sampleIdx].y : 40;

      hydroCtx.fillStyle = '#ffffff';
      hydroCtx.beginPath();
      hydroCtx.arc(needleX, needleY, 5, 0, Math.PI * 2);
      hydroCtx.fill();
      hydroCtx.strokeStyle = '#0a0a0b';
      hydroCtx.lineWidth = 2;
      hydroCtx.stroke();

      // Continuous loop
      requestAnimationFrame(renderHydroWave);
    }
    renderHydroWave();
  }

  // Interactive Time Scrubber Input Handler
  if (simSlider) {
    simSlider.addEventListener('input', function () {
      if (isSimRunning) stopSimulation();
      currentSimMinutes = parseInt(this.value, 10);
      updateTacticalBrief();
      updateQuickJumpActive();
    });
  }

  function updateQuickJumpActive() {
    scrubberJumps.forEach(function (btn) {
      const timeVal = parseInt(btn.getAttribute('data-time'), 10);
      if (Math.abs(timeVal - currentSimMinutes) < 40) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  scrubberJumps.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (isSimRunning) stopSimulation();
      const timeVal = parseInt(this.getAttribute('data-time'), 10);
      currentSimMinutes = timeVal;
      if (simSlider) simSlider.value = timeVal;
      updateQuickJumpActive();
      updateTacticalBrief();
    });
  });

  // Auto-Simulate 24h Loop
  function startSimulation() {
    isSimRunning = true;
    if (btnToggleSim) btnToggleSim.classList.add('is-playing');
    if (simBtnText) simBtnText.textContent = 'Pause Simulation';

    let lastTime = performance.now();
    function simTick(now) {
      if (!isSimRunning) return;
      const delta = now - lastTime;
      lastTime = now;

      // Advance ~4 minutes per frame for a smooth 10s 24-hour cycle
      currentSimMinutes = (currentSimMinutes + 2.8) % 1440;
      if (simSlider) simSlider.value = Math.round(currentSimMinutes);

      updateQuickJumpActive();
      updateTacticalBrief();

      simRafId = requestAnimationFrame(simTick);
    }
    simRafId = requestAnimationFrame(simTick);
  }

  function stopSimulation() {
    isSimRunning = false;
    if (simRafId) cancelAnimationFrame(simRafId);
    if (btnToggleSim) btnToggleSim.classList.remove('is-playing');
    if (simBtnText) simBtnText.textContent = 'Auto-Simulate 24h';
  }

  if (btnToggleSim) {
    btnToggleSim.addEventListener('click', function () {
      if (isSimRunning) {
        stopSimulation();
      } else {
        startSimulation();
      }
    });
  }

  // Initialize brief on load
  updateTacticalBrief();

  // =========================================================================
  // Tab 2: Multimodal Lure Scanner Demo (Laser Viewfinder)
  // =========================================================================
  const lurePillBtns = document.querySelectorAll('.lure-pill-btn');
  const scanName = document.getElementById('scan-name');
  const scanCategory = document.getElementById('scan-category');
  const scanDepth = document.getElementById('scan-depth');
  const scanContrast = document.getElementById('scan-contrast');
  const scanAction = document.getElementById('scan-action');
  const scanConfidence = document.getElementById('scan-confidence');
  const scanTargetLock = document.getElementById('scan-target-lock');
  const wireframeName = document.getElementById('wireframe-name');

  const lureSpecs = {
    'jerkbait': {
      name: 'Vision 110 Suspending Jerkbait',
      category: 'HARD PLASTIC / MINNOW',
      depth: '1.2 - 2.1m (Suspended)',
      contrast: 'High Contrast Silver/Black Flake',
      action: 'Darting Lateral Slash + Flat Wobble',
      confidence: '99.4% Multimodal Match',
      caption: 'VISION 110 SUSPENDING JERKBAIT'
    },
    'paddletail': {
      name: 'Keitech 4.8" Fat Swing Impact',
      category: 'SOFT PLASTIC / SWIMBAIT',
      depth: '0.5 - 6.0m (Weight Dependent)',
      contrast: 'Ayu / Ghost Smoke Translucent',
      action: 'Vigorous Tail Kick + Body Roll',
      confidence: '98.8% Multimodal Match',
      caption: 'KEITECH 4.8" FAT SWING SWIMBAIT'
    },
    'spinnerbait': {
      name: 'Booyah Tandem Willow Spinnerbait',
      category: 'WIRE BAIT / BLADED',
      depth: '1.0 - 3.5m (Subsurface)',
      contrast: 'Nickel Double Willow / White Skirt',
      action: 'High-Frequency Vibration + Flash',
      confidence: '99.1% Multimodal Match',
      caption: 'BOOYAH TANDEM WILLOW BLADE'
    },
    'frog': {
      name: 'Hollow Body Topwater Walking Frog',
      category: 'TOPWATER / WEEDLESS',
      depth: '0.0m (Surface Film)',
      contrast: 'Matte Black / Green Silhouette',
      action: 'Walk-the-Dog + Weed Mat Slither',
      confidence: '99.7% Multimodal Match',
      caption: 'HOLLOW BODY WEEDLESS FROG'
    }
  };

  lurePillBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      lurePillBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const key = this.getAttribute('data-lure');
      const spec = lureSpecs[key];
      if (spec) {
        if (scanName) scanName.textContent = spec.name;
        if (scanCategory) scanCategory.textContent = spec.category;
        if (scanDepth) scanDepth.textContent = spec.depth;
        if (scanContrast) scanContrast.textContent = spec.contrast;
        if (scanAction) scanAction.textContent = spec.action;
        if (scanConfidence) scanConfidence.textContent = spec.confidence;
        if (wireframeName) wireframeName.textContent = spec.caption;

        if (scanTargetLock) {
          scanTargetLock.textContent = 'ACQUIRING RETICLE...';
          setTimeout(function () {
            scanTargetLock.textContent = `TARGET LOCKED: ${spec.confidence.split(' ')[0]}`;
          }, 240);
        }
      }
    });
  });

  // =========================================================================
  // Tab 3: Dynamic Rig Studio & Tension Vector Simulator
  // =========================================================================
  const rigBtns = document.querySelectorAll('.motion-rig-btn');
  const rigName = document.getElementById('rig-name');
  const rigKnot = document.getElementById('rig-knot');
  const rigLeader = document.getElementById('rig-leader');
  const rigSinker = document.getElementById('rig-sinker');
  const rigApplication = document.getElementById('rig-application');

  const rigTensionSlider = document.getElementById('rig-tension-slider');
  const tensionLoadVal = document.getElementById('tension-load-val');
  const svgLinePath = document.getElementById('svg-line-path');
  const svgWeightNode = document.getElementById('svg-weight-node');
  const svgBeadNode = document.getElementById('svg-bead-node');
  const svgHookNode = document.getElementById('svg-hook-node');
  const svgTensionText = document.getElementById('svg-tension-text');

  const rigSpecs = {
    'texas': {
      name: 'Texas Rig (Weedless Bullet)',
      knot: 'Palomar Knot (95% Knot Strength)',
      leader: '12-16 lb 100% Fluorocarbon',
      sinker: '3/16 oz Tungsten Bullet (Unpegged)',
      application: 'Thick hydrilla, lily pads, submerged timber brush piles'
    },
    'dropshot': {
      name: 'Finesse Drop Shot Rig',
      knot: 'Special Palomar with Hook Point Facing Up',
      leader: '6-8 lb Fluorocarbon (18" Tag End)',
      sinker: '1/4 oz Cylinder Quick-Clip Weight',
      application: 'Deep rocky humps, suspended pressured bass, clear water'
    },
    'carolina': {
      name: 'Carolina Rig (Wide Sweep)',
      knot: 'Uni-to-Uni Line Join + Palomar at Swivel',
      leader: '10-12 lb Fluorocarbon (36" Leader)',
      sinker: '1/2 - 3/4 oz Egg Sinker + Glass Bead',
      application: 'Deep sand/gravel flats, sweeping large structure expanses'
    },
    'paternoster': {
      name: 'Feeder Paternoster Rig',
      knot: 'Double Loop Dropper + Figure-8 Knot',
      leader: '4-6 lb Monofilament Mainline',
      sinker: '1 oz Cage Feeder / Swivel Pear Lead',
      application: 'River current feeder fishing, lake bottom carp & coarse fish'
    }
  };

  rigBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      rigBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const key = this.getAttribute('data-rig');
      const spec = rigSpecs[key];
      if (spec) {
        if (rigName) rigName.textContent = spec.name;
        if (rigKnot) rigKnot.textContent = spec.knot;
        if (rigLeader) rigLeader.textContent = spec.leader;
        if (rigSinker) rigSinker.textContent = spec.sinker;
        if (rigApplication) rigApplication.textContent = spec.application;
      }
    });
  });

  // Dynamic SVG Deflection Math on Tension Slider
  if (rigTensionSlider) {
    rigTensionSlider.addEventListener('input', function () {
      const tension = parseFloat(this.value);
      if (tensionLoadVal) tensionLoadVal.textContent = `${tension.toFixed(1)} lbs`;

      // Bow curve: higher tension = line straightens closer to Y=20; lower tension = deep bow down to Y=65
      const deflectionY = Math.round(70 - (tension / 18) * 36);
      const hookY = Math.round(80 - (tension / 18) * 20);

      if (svgLinePath) {
        svgLinePath.setAttribute('d', `M 20 20 Q 200 ${deflectionY} 370 ${hookY}`);
      }
      if (svgWeightNode) {
        svgWeightNode.setAttribute('cy', deflectionY);
      }
      if (svgBeadNode) {
        svgBeadNode.setAttribute('cy', deflectionY + 3);
      }
      if (svgHookNode) {
        svgHookNode.setAttribute('d', `M 370 ${hookY} L 380 ${hookY + 12} A 6 6 0 0 1 372 ${hookY + 20} L 368 ${hookY + 15}`);
      }
      if (svgTensionText) {
        const mm = Math.round((20 - tension) * 2.8);
        svgTensionText.textContent = `DEFLECTION: ${mm}mm · STRAIN: ${(tension * 5.2).toFixed(0)}%`;
      }
    });
  }

  // =========================================================================
  // 5. Interactive 3D Card Hover Tilt (Instant Zero-Lag Reaction on Desktop)
  // =========================================================================
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer) {
    const tiltCards = document.querySelectorAll('.feature-card, .pricing-card, .pitch-card, .policy-card, .scope-box');
    
    tiltCards.forEach(function (card) {
      let isHovering = false;
      let rafId = null;

      card.addEventListener('mouseenter', function () {
        isHovering = true;
        // Kill CSS transition immediately so tilt tracks cursor with 0ms lag
        card.style.transition = 'none';
        card.style.willChange = 'transform';
      });

      card.addEventListener('mousemove', function (e) {
        if (!isHovering) return;
        
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(function () {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Instant 0ms reaction angle with tactile 3D perspective
          const rotX = ((y - centerY) / centerY) * -5.0;
          const rotY = ((x - centerX) / centerX) * 5.0;
          
          card.style.transform = `perspective(850px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px)`;
        });
      });

      card.addEventListener('mouseleave', function () {
        isHovering = false;
        if (rafId) cancelAnimationFrame(rafId);
        
        // Smooth snappy release back to flat resting state
        card.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(850px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        
        setTimeout(function () {
          if (!isHovering) {
            card.style.transition = '';
            card.style.transform = '';
            card.style.willChange = '';
          }
        }, 300);
      });
    });
  }

  // Target all core content sections to reveal as user scrolls down
  const revealTargets = document.querySelectorAll(
    '.section-header, .demo-terminal, .feature-card, .arch-node, .pitch-card, .pricing-card, .download-banner'
  );

  revealTargets.forEach(function (el) {
    el.classList.add('scroll-reveal');
    if (el.classList.contains('demo-terminal') || el.classList.contains('download-banner')) {
      el.classList.add('reveal-scale');
    }
  });

  // Assign sequential cascade delay to cards inside grids
  const staggerGrids = ['.features-grid', '.arch-flow', '.claude-pitch-grid', '.pricing-grid'];
  staggerGrids.forEach(function (sel) {
    const parent = document.querySelector(sel);
    if (parent) {
      const children = parent.querySelectorAll('.scroll-reveal');
      children.forEach(function (child, idx) {
        child.style.setProperty('--reveal-delay', `${(idx % 4) * 110}ms`);
      });
    }
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  // =========================================================================
  // 6. Interactive Subpages: Real-Time Policy Search & Category Filtering
  // =========================================================================
  const policySearchInput = document.getElementById('policy-search');
  const policyPills = document.querySelectorAll('.filter-pill');
  const policyCards = document.querySelectorAll('.policy-card');

  if (policyCards.length > 0) {
    let activeCategory = 'all';

    function filterPolicyCards() {
      const query = policySearchInput ? policySearchInput.value.trim().toLowerCase() : '';

      policyCards.forEach(function (card) {
        const category = card.getAttribute('data-category') || '';
        const searchTerms = (card.getAttribute('data-search') || '').toLowerCase();
        const cardText = card.textContent.toLowerCase();

        const matchesCategory = (activeCategory === 'all') || (category === activeCategory);
        const matchesQuery = !query || searchTerms.includes(query) || cardText.includes(query);

        if (matchesCategory && matchesQuery) {
          card.style.display = '';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    }

    if (policySearchInput) {
      policySearchInput.addEventListener('input', filterPolicyCards);
    }

    policyPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        policyPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        activeCategory = this.getAttribute('data-filter') || 'all';
        filterPolicyCards();
      });
    });
  }

  // =========================================================================
  // 7. Interactive Account Deletion Hub Switcher & Copy Template
  // =========================================================================
  const deletionMethodBtns = document.querySelectorAll('.deletion-method-btn');
  const deletionPanels = document.querySelectorAll('.deletion-panel');

  if (deletionMethodBtns.length > 0) {
    deletionMethodBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        deletionMethodBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        deletionPanels.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        const targetId = this.getAttribute('data-target');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  const btnCopyTemplate = document.getElementById('btn-copy-template');
  const copyTextSpan = document.getElementById('copy-text');
  if (btnCopyTemplate) {
    btnCopyTemplate.addEventListener('click', function () {
      const templateText = 'Subject: FishIn Account Deletion Request\n\nPlease permanently delete my FishIn account and all associated catch logs, tackle box entries, and cloud photo backups.';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(templateText).then(function () {
          if (copyTextSpan) copyTextSpan.textContent = 'Template Copied!';
          setTimeout(function () {
            if (copyTextSpan) copyTextSpan.textContent = 'Copy Email Template';
          }, 2500);
        });
      }
    });
  }

  // =========================================================================
  // 8. Interactive Features Grid Filter Bar (Main Page)
  // =========================================================================
  const featFilterBtns = document.querySelectorAll('.feat-filter-btn');
  const featureCards = document.querySelectorAll('.feature-card');

  if (featFilterBtns.length > 0 && featureCards.length > 0) {
    featFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        featFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-feat') || 'all';
        featureCards.forEach(function (card) {
          const cardCat = card.getAttribute('data-category');
          if (filter === 'all' || cardCat === filter) {
            card.classList.remove('is-dimmed');
          } else {
            card.classList.add('is-dimmed');
          }
        });
      });
    });
  }

  // =========================================================================
  // 9. Interactive Billing Toggle (Main Page Pro Section)
  // =========================================================================
  const btnMonthly = document.getElementById('pricing-monthly-btn');
  const btnAnnual = document.getElementById('pricing-annual-btn');
  const proPriceDisplay = document.getElementById('pro-price-display');

  if (btnMonthly && btnAnnual && proPriceDisplay) {
    btnMonthly.addEventListener('click', function () {
      btnMonthly.classList.add('active');
      btnAnnual.classList.remove('active');
      proPriceDisplay.innerHTML = '$4.99 <span id="pro-price-period">/ mo ($49.99/yr)</span>';
    });

    btnAnnual.addEventListener('click', function () {
      btnAnnual.classList.add('active');
      btnMonthly.classList.remove('active');
      proPriceDisplay.innerHTML = '$49.99 <span id="pro-price-period">/ yr ($4.16/mo)</span>';
    });
  }

})();

