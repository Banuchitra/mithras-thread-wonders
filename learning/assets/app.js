// Learning hub — theme toggle, scroll reveal, progress checklist, tabs.
(function () {
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
  };

  // Theme: explicit choice wins, otherwise follow the OS.
  const root = document.documentElement;
  const saved = store.get('lh-theme', null);
  if (saved) root.dataset.theme = saved;
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const label = () => {
      const dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches;
      btn.textContent = dark ? '☀ Light' : '☾ Dark';
    };
    label();
    btn.addEventListener('click', () => {
      const dark = btn.textContent.includes('Light');
      root.dataset.theme = dark ? 'light' : 'dark';
      store.set('lh-theme', root.dataset.theme);
      label();
    });
  });

  // Scroll reveal
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 })
    : null;
  document.querySelectorAll('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  // Progress checklist (index page)
  const checklist = document.querySelector('[data-checklist]');
  if (checklist) {
    const state = store.get('lh-progress', {});
    const boxes = checklist.querySelectorAll('input[type="checkbox"]');
    const bar = document.querySelector('[data-progress-bar]');
    const count = document.querySelector('[data-progress-count]');
    const update = () => {
      const done = [...boxes].filter((b) => b.checked).length;
      if (bar) bar.style.width = `${Math.round((done / boxes.length) * 100)}%`;
      if (count) count.textContent = `${done} of ${boxes.length} topics`;
    };
    boxes.forEach((b) => {
      if (b.id in state) b.checked = state[b.id];
      b.addEventListener('change', () => { state[b.id] = b.checked; store.set('lh-progress', state); update(); });
    });
    update();
  }

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const buttons = group.querySelectorAll('[role="tab"]');
    const show = (btn) => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-selected', String(on));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
    };
    buttons.forEach((b) => b.addEventListener('click', () => show(b)));
    if (buttons[0]) show(buttons[0]);
  });
})();
