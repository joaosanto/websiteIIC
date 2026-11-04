/* IIC – main.js (v2): idioma, navegação, animações */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Tema ── */
  if (localStorage.getItem('iic-theme') === 'light') document.documentElement.classList.add('light-theme');

  /* ── Idioma ── */
  let currentLang = 'pt';
  try { currentLang = localStorage.getItem('iic-lang') || 'pt'; } catch (_) {}

  function setLang(lang) {
    currentLang = lang;
    try { localStorage.setItem('iic-lang', lang); } catch (_) {}
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-pt]').forEach(el => {
      if (el.children.length > 0) return;              // preserva spans internos
      if (el.isContentEditable && el === document.activeElement) return;
      const val = el.getAttribute('data-' + lang) || el.getAttribute('data-pt'); // EN em falta → PT
      if (val) el.textContent = val;
    });
    document.querySelectorAll('.lang-btn').forEach(b => {
      const on = b.id === 'lang-' + lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('iic:lang', { detail: lang }));
  }
  window.setLang = setLang;
  window.getLang = () => currentLang;

  /* ── Menu hambúrguer ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  function closeMenu() {
    navMenu.classList.remove('open'); hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navMenu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu(); });
  }

  /* ── Navbar ao fazer scroll ── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Animações de entrada ── */
  const animObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = reduceMotion ? 0 : parseInt(el.getAttribute('data-delay') || 0, 10);
      setTimeout(() => el.classList.add('animate-in'), delay);
      animObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeAnimated(root) {
    (root || document).querySelectorAll('.service-card, .area-item, .team-card, .reveal').forEach(el => {
      if (reduceMotion) el.classList.add('animate-in'); else animObserver.observe(el);
    });
  }
  observeAnimated();
  window.IIC_observeAnimated = observeAnimated;

  /* ── Contadores ── */
  function prepCounter(el) {
    if (!el.dataset.count) {
      const txt = el.textContent.trim();
      el.dataset.count = parseInt(txt.replace(/\D/g, ''), 10) || 0;
      el.dataset.suffix = txt.replace(/[0-9]/g, '');
    }
  }
  function animateCounter(el, duration = 1600) {
    prepCounter(el);
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) {
    statsEl.querySelectorAll('.stat-num').forEach(prepCounter);
    const so = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        if (!document.body.classList.contains('edit-mode')) statsEl.querySelectorAll('.stat-num').forEach(el => animateCounter(el));
        so.disconnect();
      }
    }, { threshold: 0.5 });
    so.observe(statsEl);
  }

  /* ── Link ativo no menu ── */
  const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
      const a = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active-link');
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section[id]').forEach(s => activeObserver.observe(s));

  /* ── Parallax do hero (desativado em "reduzir movimento") ── */
  const heroBgImg = document.querySelector('.hero-bg-img');
  if (heroBgImg && !reduceMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        if (window.scrollY < window.innerHeight * 1.2) heroBgImg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Efeito tilt nos cartões (só rato) ── */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', e => {
      const card = e.target.closest && e.target.closest('.service-card');
      if (!card || document.body.classList.contains('edit-mode')) return;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
      card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    document.addEventListener('mouseout', e => {
      const card = e.target.closest && e.target.closest('.service-card');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
  }

  setLang(currentLang);
})();
