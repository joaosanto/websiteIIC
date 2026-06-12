/* =============================================
   IIC – main.js
   Language switching, scroll animations,
   navbar behaviour, form handling
   ============================================= */

(function () {
  'use strict';

  /* ── Theme System (load saved theme) ── */
  const savedTheme = localStorage.getItem('iic-theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  }

  /* ── Language System ── */
  let currentLang = localStorage.getItem('iic-lang') || 'pt';

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('iic-lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt' : 'en';

    document.querySelectorAll('[data-pt]').forEach(el => {
      // Skip elements with child elements to avoid destroying inner HTML (e.g. gold-text spans)
      if (el.children.length > 0) return;
      const val = el.getAttribute(`data-${lang}`);
      if (val) el.textContent = val;
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Keep form placeholder text separate (not affected by data attrs)
    updatePlaceholders(lang);
  }

  function updatePlaceholders(lang) {
    const placeholders = {
      pt: { name: 'João Silva', email: 'joao@empresa.com' },
      en: { name: 'John Smith', email: 'john@company.com' }
    };
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    if (nameInput) nameInput.placeholder = placeholders[lang].name;
    if (emailInput) emailInput.placeholder = placeholders[lang].email;
  }

  // Expose to global (called from HTML onclick)
  window.setLang = setLang;

  /* ── Hamburger Menu ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Navbar Scroll Effect ── */
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Intersection Observer for Scroll Animations ── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || 0);
        setTimeout(() => {
          el.classList.add('animate-in');
        }, delay);
        animObserver.unobserve(el);
      }
    });
  }, observerOptions);

  // Observe service cards, area items, team cards, reveal elements
  document.querySelectorAll(
    '.service-card, .area-item, .team-card, .reveal'
  ).forEach(el => animObserver.observe(el));

  /* ── Smooth Number Counter Animation ── */
  function animateCounter(el, target, duration = 1600) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        el.textContent = target + (el.dataset.suffix || '');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start) + (el.dataset.suffix || '');
      }
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(el => {
          const val = parseInt(el.textContent.replace(/\D/g, ''));
          const suffix = el.textContent.replace(/[0-9]/g, '');
          el.dataset.suffix = suffix;
          animateCounter(el, val);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) statsObserver.observe(statsEl);

  /* ── Active Nav Link on Scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active-link'));
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => activeObserver.observe(s));

  /* ── Contact Form ── */
  window.handleSubmit = function (event) {
    event.preventDefault();
    const btn = document.getElementById('submit-btn');
    const successEl = document.getElementById('form-success');

    btn.textContent = currentLang === 'pt' ? 'A enviar...' : 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = currentLang === 'pt' ? 'Enviado ✓' : 'Sent ✓';
      btn.style.background = 'linear-gradient(135deg, #2d6a4f, #40916c)';
      if (successEl) {
        successEl.style.display = 'block';
        const msg = successEl.getAttribute(`data-${currentLang}`);
        if (msg) successEl.textContent = msg;
      }
      document.getElementById('contact-form').reset();
    }, 1200);
  };

  /* ── Parallax on Hero Background ── */
  const heroBgImg = document.querySelector('.hero-bg-img');
  if (heroBgImg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroBgImg.style.transform = `translateY(${scrolled * 0.35}px)`;
    }, { passive: true });
  }

  /* ── Tilt Effect on Service Cards ── */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
      card.style.transformStyle = 'preserve-3d';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transformStyle = '';
    });
  });

  /* ── Init language on load ── */
  document.addEventListener('DOMContentLoaded', () => {
    setLang(currentLang);
  });

  // Also call immediately for elements already in the DOM
  setLang(currentLang);

})();
