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
    let animationFrameId;
    let time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    // Realistic Underwater Rising Bubbles
    const bubbleCount = 60;
    const bubbles = [];

    function initBubbles() {
      bubbles.length = 0;
      for (let i = 0; i < bubbleCount; i++) {
        const radius = Math.random() < 0.25 
          ? Math.random() * 12 + 10    // Large bubbles (10px - 22px)
          : Math.random() * 6 + 3;     // Small & medium bubbles (3px - 9px)
        bubbles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: radius,
          speedY: (radius * 0.04) + 0.45 + Math.random() * 0.6,
          wobbleOffset: Math.random() * Math.PI * 2,
          wobbleAmp: Math.random() * 3 + 1.5,
          alpha: Math.random() * 0.35 + 0.22
        });
      }
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBubbles();
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', function (e) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    // Bathymetric Depth Contour Lines
    const numLines = 15;
    const pointsPerLine = 36;

    function draw() {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.save();

      // 1. Draw Rising Underwater Bubbles
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y -= b.speedY;

        // Reset bubble to bottom with randomized x when it reaches the top
        if (b.y < -30) {
          b.y = height + 30 + Math.random() * 40;
          b.x = Math.random() * width;
        }

        // Sinusoidal wobble motion
        const currentX = b.x + Math.sin(time * 3 + b.wobbleOffset) * b.wobbleAmp;

        // Subtle mouse repulsion deflection
        const dx = currentX - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (1 - dist / 140) * 1.8;
          b.x += (dx / (dist || 1)) * force;
        }

        // Outer membrane
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.7})`;
        ctx.lineWidth = Math.max(1, b.radius * 0.07);
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
        grad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.18})`);
        grad.addColorStop(0.7, `rgba(255, 255, 255, ${b.alpha * 0.03})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Specular glint highlight (top-left reflection)
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

      // 2. Draw Bathymetric depth contours
      ctx.lineWidth = 1;
      for (let i = 0; i < numLines; i++) {
        const lineOffset = (i / numLines) * (height * 1.1) - 40;
        const alpha = 0.025 + (i / numLines) * 0.06;
        ctx.strokeStyle = `rgba(245, 245, 245, ${alpha})`;

        ctx.beginPath();
        for (let j = 0; j <= pointsPerLine; j++) {
          const x = (j / pointsPerLine) * width;
          
          // Organic undulating wave calculation
          const wave1 = Math.sin(j * 0.22 + time * 1.4 + i * 0.55) * 32;
          const wave2 = Math.cos(j * 0.16 - time * 0.8 + i * 0.28) * 20;
          const wave3 = Math.sin((x / width) * 3.5 + time + i * 0.8) * 14;

          // Mouse proximity ripple
          const dx = x - mouse.x;
          const dy = (lineOffset + wave1) - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let mouseInfluence = 0;
          if (dist < 280) {
            mouseInfluence = Math.sin((1 - dist / 280) * Math.PI) * 26;
          }

          const y = lineOffset + wave1 + wave2 + wave3 + mouseInfluence;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 3. Sonar Pulse Ring (originating from depth center)
      const sonarPeriod = (time * 0.6) % 1;
      const sonarRadius = sonarPeriod * Math.max(width, height) * 0.7;
      const sonarAlpha = (1 - sonarPeriod) * 0.07;

      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.4, sonarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${sonarAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

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
  // 2. Navigation Scroll Effect
  // =========================================================================
  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 30) {
        siteNav.classList.add('scrolled');
      } else {
        siteNav.classList.remove('scrolled');
      }
    });
  }

  // =========================================================================
  // 3. Interactive Intelligence Demo Terminal
  // =========================================================================
  const tabButtons = document.querySelectorAll('.demo-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
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

  chipOptions.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const parent = this.closest('.chip-select');
      const groupType = parent.getAttribute('data-group');

      parent.querySelectorAll('.chip-option').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');

      const val = this.getAttribute('data-val');
      if (groupType === 'species') selectedSpecies = val;
      if (groupType === 'weather') selectedWeather = val;

      updateTacticalBrief();
    });
  });

  function updateTacticalBrief() {
    const data = tacticalDatabase[selectedSpecies]?.[selectedWeather] || tacticalDatabase['bass']['falling'];
    if (briefHeadline) briefHeadline.textContent = data.headline;
    if (briefSummary) briefSummary.textContent = data.summary;
    if (briefScore) briefScore.textContent = data.score;
    if (briefWindow) briefWindow.textContent = data.window;
    if (briefTackle) briefTackle.textContent = data.tackle;
    if (briefTactics) briefTactics.textContent = data.tactics;
  }

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
  // 4. Smooth Anchor Scrolling
  // =========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

})();
