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
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

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

    // Hero S23 Ultra Phone Mockup Parallax Slide UPWARDS on Scroll (Desktop & Mobile)
    if (phoneWrapper) {
      if (window.innerWidth > 992) {
        // Desktop: slides upward with 3D perspective and mouse tracking
        const translateY = - Math.min(curY * 0.28, 220);
        const rotX = (mouseRelY * -3.5) - Math.min(curY * 0.008, 4);
        const rotY = mouseRelX * 4.5;
        phoneWrapper.style.transform = `perspective(1200px) translate3d(0, ${translateY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      } else {
        // Mobile: smoothly slides upward on scroll with hardware acceleration
        const translateY = - Math.min(curY * 0.22, 130);
        phoneWrapper.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
    }
  }, { passive: true });

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

