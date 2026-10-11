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
  let selectedSolunar = 'dawn';

  const solunarWindows = {
    'dawn': '06:15 - 08:45 AM (Dawn Major)',
    'midday': '12:30 - 14:00 PM (Midday Minor)',
    'dusk': '18:45 - 21:00 PM (Dusk Major)'
  };

  chipOptions.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const parent = this.closest('.chip-select');
      const groupType = parent.getAttribute('data-group');

      parent.querySelectorAll('.chip-option').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');

      const val = this.getAttribute('data-val');
      if (groupType === 'species') selectedSpecies = val;
      if (groupType === 'weather') selectedWeather = val;
      if (groupType === 'solunar') selectedSolunar = val;

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

  function updateTacticalBrief() {
    const data = tacticalDatabase[selectedSpecies]?.[selectedWeather] || tacticalDatabase['bass']['falling'];
    if (briefHeadline) briefHeadline.textContent = data.headline;
    if (briefSummary) briefSummary.textContent = data.summary;
    if (briefScore) briefScore.textContent = data.score;
    if (briefScoreNum) {
      const match = data.score.match(/\d+/);
      const scoreVal = match ? parseInt(match[0], 10) : 91;
      briefScoreNum.textContent = scoreVal;

      if (briefGaugeBar) {
        // Radius is 20 -> 2 * PI * 20 = 125.66
        const circumference = 125.66;
        const offset = circumference - (scoreVal / 100) * circumference;
        briefGaugeBar.style.strokeDashoffset = offset.toFixed(2);

        if (scoreVal >= 85) {
          briefGaugeBar.style.stroke = '#10b981';
          if (briefScoreStatus) briefScoreStatus.style.color = '#10b981';
        } else if (scoreVal >= 70) {
          briefGaugeBar.style.stroke = '#06b6d4';
          if (briefScoreStatus) briefScoreStatus.style.color = '#06b6d4';
        } else {
          briefGaugeBar.style.stroke = '#f59e0b';
          if (briefScoreStatus) briefScoreStatus.style.color = '#f59e0b';
        }
      }
    }
    if (briefScoreStatus) {
      briefScoreStatus.textContent = statusMap[selectedWeather] || 'FEEDING ELEVATED';
    }
    if (briefWindow) briefWindow.textContent = solunarWindows[selectedSolunar] || data.window;
    if (briefTackle) briefTackle.textContent = data.tackle;
    if (briefTactics) briefTactics.textContent = data.tactics;
  }

  // Initialize brief readout on load
  updateTacticalBrief();

  // Tab 2: Multimodal Lure Scanner Demo
  const lureCards = document.querySelectorAll('.lure-select-card');
  const scanName = document.getElementById('scan-name');
  const scanCategory = document.getElementById('scan-category');
  const scanDepth = document.getElementById('scan-depth');
  const scanContrast = document.getElementById('scan-contrast');
  const scanAction = document.getElementById('scan-action');
  const scanConfidence = document.getElementById('scan-confidence');

  const lureSpecs = {
    'jerkbait': {
      name: 'Vision 110 Suspending Jerkbait',
      category: 'HARD PLASTIC / MINNOW',
      depth: '1.2 - 2.1m (Suspended)',
      contrast: 'High Contrast Silver/Black Flake',
      action: 'Darting Lateral Slash + Flat Wobble',
      confidence: '99.4% Multimodal Match'
    },
    'paddletail': {
      name: 'Keitech 4.8" Fat Swing Impact',
      category: 'SOFT PLASTIC / SWIMBAIT',
      depth: '0.5 - 6.0m (Weight Dependent)',
      contrast: 'Ayu / Ghost Smoke Translucent',
      action: 'Vigorous Tail Kick + Body Roll',
      confidence: '98.8% Multimodal Match'
    },
    'spinnerbait': {
      name: 'Booyah Tandem Willow Spinnerbait',
      category: 'WIRE BAIT / BLADED',
      depth: '1.0 - 3.5m (Subsurface)',
      contrast: 'Nickel Double Willow / White Skirt',
      action: 'High-Frequency Vibration + Flash',
      confidence: '99.1% Multimodal Match'
    },
    'frog': {
      name: 'Hollow Body Topwater Walking Frog',
      category: 'TOPWATER / WEEDLESS',
      depth: '0.0m (Surface Film)',
      contrast: 'Matte Black / Green Silhouette',
      action: 'Walk-the-Dog + Weed Mat Slither',
      confidence: '99.7% Multimodal Match'
    }
  };

  lureCards.forEach(function (card) {
    card.addEventListener('click', function () {
      lureCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      const key = this.getAttribute('data-lure');
      const spec = lureSpecs[key];
      if (spec) {
        if (scanName) scanName.textContent = spec.name;
        if (scanCategory) scanCategory.textContent = spec.category;
        if (scanDepth) scanDepth.textContent = spec.depth;
        if (scanContrast) scanContrast.textContent = spec.contrast;
        if (scanAction) scanAction.textContent = spec.action;
        if (scanConfidence) scanConfidence.textContent = spec.confidence;
      }
    });
  });

  // Tab 3: Rig Studio Demo
  const rigChips = document.querySelectorAll('.rig-option');
  const rigName = document.getElementById('rig-name');
  const rigKnot = document.getElementById('rig-knot');
  const rigLeader = document.getElementById('rig-leader');
  const rigSinker = document.getElementById('rig-sinker');
  const rigApplication = document.getElementById('rig-application');

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

  rigChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      rigChips.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
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

  // =========================================================================
  // 5. Interactive 3D Card Hover Tilt & Scroll Reveal Animations
  // =========================================================================
  const tiltCards = document.querySelectorAll('.feature-card, .pricing-card, .pitch-card');
  tiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -3.5;
      const rotY = ((x - centerX) / centerX) * 3.5;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

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

})();
