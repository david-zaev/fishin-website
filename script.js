(() => {
  const root = document.documentElement;
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Theme: follows the computer until the visitor picks one. Picking the same as the
  // computer goes back to following it, so a later system switch still applies.
  const themeBtn = document.getElementById('themeToggle');
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  const labelTheme = () => {
    if (themeBtn) themeBtn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      const system = systemDark.matches ? 'dark' : 'light';
      try {
        if (next === system) {
          delete root.dataset.theme;
          localStorage.removeItem('theme');
        } else {
          root.dataset.theme = next;
          localStorage.setItem('theme', next);
        }
      } catch (e) {
        root.dataset.theme = next;
      }
      labelTheme();
    });
    systemDark.addEventListener('change', labelTheme);
    labelTheme();
  }

  if (nav) {
    const toTop = document.getElementById('toTop');
    const dock = document.getElementById('dock');
    const hero = document.querySelector('.hero-ctas');
    const footer = document.querySelector('.footer');
    let queued = false;
    const onScroll = () => {
      queued = false;
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 8);
      if (toTop) toTop.classList.toggle('show', y > window.innerHeight * 1.2);
      if (dock && hero) {
        const pastHero = hero.getBoundingClientRect().bottom < 0;
        const atFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
        dock.classList.toggle('show', pastHero && !atFooter);
      }
    };
    onScroll();
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Highlight the nav link for the section on screen.
    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    if (navLinks.length && 'IntersectionObserver' in window) {
      const linkFor = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
      const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          // The features wrapper section holds #map/#forecast/#coach; let those decide.
          if (!e.target.id && e.target.querySelector('#map')) return;
          navLinks.forEach(a => a.classList.remove('active'));
          const a = linkFor.get(e.target.id);
          if (a) a.classList.add('active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      // Watch every section, so ones without a nav link clear the highlight.
      document.querySelectorAll('main section, #map, #forecast, #coach').forEach(el => spy.observe(el));
    }
  }

  if (menuBtn) {
    const setOpen = open => {
      nav.classList.toggle('open', open);
      root.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    document.querySelectorAll('#mobileMenu a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  // Reveal on scroll; bar charts grow when they come into view.
  const targets = document.querySelectorAll('.reveal, .bars');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('in'));
  }

  // Demo tabs: click or arrow keys switch the phone screen.
  const tabs = [...document.querySelectorAll('.demo-tab')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });

  // Only one FAQ answer open at a time.
  const items = document.querySelectorAll('.faq details');
  items.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) items.forEach(o => { if (o !== d) o.open = false; });
  }));

  // Legal pages: highlight the section being read in the contents list.
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('active'));
          const link = byId.get(e.target.id);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // Hero phones drift apart a little as the page scrolls.
  const stage = document.querySelector('.stage');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (stage && !calm.matches) {
    const sides = [...stage.querySelectorAll('.phone.side')];
    const centre = stage.querySelector('.phone:not(.side)');
    let ticking = false;
    const move = () => {
      ticking = false;
      const y = Math.min(window.scrollY, 700);
      sides.forEach(p => { p.style.transform = `translateY(${110 - y * 0.12}px) scale(.9)`; });
      if (centre) centre.style.transform = `translateY(${y * 0.04}px)`;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
  }

  // Final banner rings.
  const rings = document.querySelector('.final-rings');
  if (rings) {
    [400, 640, 920, 1240].forEach(size => {
      const i = document.createElement('i');
      i.style.width = i.style.height = size + 'px';
      rings.appendChild(i);
    });
  }

  document.querySelectorAll('.year').forEach(y => { y.textContent = new Date().getFullYear(); });
})();
