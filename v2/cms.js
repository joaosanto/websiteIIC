/* IIC – cms.js
   1) Lê o conteúdo publicado no Supabase e aplica-o à página
   2) Arranca o site (main.js)
   3) Carrega o editor (admin.js) apenas para quem pede acesso (?edit=1) ou já tem sessão
   Se o Supabase não estiver configurado ou falhar, o site mostra o HTML base. */
(function () {
  'use strict';

  const cfg = window.IIC_CONFIG || {};
  const slug = cfg.pageSlug || 'home';

  /* Blocos editáveis: chave guardada na BD → seletor na página */
  const BLOCKS = {
    nav: '#nav-menu',
    home: '#home',
    about: '.about-strip',
    services: '#services',
    areas: '#areas',
    team: '#team',
    cta: '.cta-banner',
    contact: '#contact',
    footer: '.footer-inner'
  };
  const HIDEABLE = ['home', 'about', 'services', 'areas', 'team', 'cta', 'contact'];

  let sb = null;
  try {
    if (cfg.supabaseUrl && cfg.supabaseKey && window.supabase) {
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
      });
    }
  } catch (e) { console.warn('[IIC] Supabase indisponível', e); }

  /* Remove scripts e atributos on*="" do HTML vindo da BD (defesa extra) */
  function sanitize(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('script,iframe,object,embed').forEach(n => n.remove());
    tpl.content.querySelectorAll('*').forEach(n => {
      [...n.attributes].forEach(a => {
        if (/^on/i.test(a.name)) n.removeAttribute(a.name);
        if (/^(href|src)$/i.test(a.name) && /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
      });
    });
    return tpl.innerHTML;
  }

  function applySections(data) {
    if (!data || typeof data !== 'object') return;
    const blocks = data.blocks || {};
    Object.entries(BLOCKS).forEach(([key, sel]) => {
      const dst = document.querySelector(sel);
      if (dst && typeof blocks[key] === 'string') dst.innerHTML = sanitize(blocks[key]);
    });
    const hidden = Array.isArray(data.hidden) ? data.hidden : [];
    const removed = Array.isArray(data.removed) ? data.removed : [];
    HIDEABLE.forEach(key => {
      const node = document.querySelector(BLOCKS[key]);
      if (!node) return;
      if (removed.includes(key)) { node.remove(); return; }
      node.style.display = hidden.includes(key) ? 'none' : '';
    });
  }

  /* Gera o objeto a guardar a partir da página atual (usado pelo editor) */
  function collectSections() {
    const out = { version: 2, blocks: {}, hidden: [], removed: [] };
    Object.entries(BLOCKS).forEach(([key, sel]) => {
      const node = document.querySelector(sel);
      if (!node) { if (HIDEABLE.includes(key)) out.removed.push(key); return; }
      const clone = node.cloneNode(true);
      clone.querySelectorAll('.adm-add-row,.item-ctrl,.admin-toast').forEach(e => e.remove());
      clone.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
      clone.querySelectorAll('.editable,.editing,.animate-in').forEach(e => e.classList.remove('editable', 'editing', 'animate-in'));
      clone.querySelectorAll('.service-card,.area-item,.team-card,.hero-bg-img').forEach(e => {
        e.style.removeProperty('position'); e.style.removeProperty('transform'); e.style.removeProperty('transform-style');
        if (!e.getAttribute('style')) e.removeAttribute('style');
      });
      clone.querySelectorAll('.stat-num[data-count]').forEach(e => { e.textContent = e.dataset.count + (e.dataset.suffix || ''); });
      out.blocks[key] = clone.innerHTML;
      if (HIDEABLE.includes(key) && node.style.display === 'none') out.hidden.push(key);
    });
    return out;
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.body.appendChild(s);
    });
  }
  function loadCss(href) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
  }
  function withTimeout(p, ms) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  }

  window.IIC = { sb, cfg, slug, BLOCKS, HIDEABLE, applySections, collectSections, sanitize, status: 'static' };

  async function boot() {
    document.documentElement.classList.add('cms-loading');
    if (sb) {
      try {
        const { data, error } = await withTimeout(
          sb.from('site_content').select('sections, updated_at').eq('slug', slug).maybeSingle(), 3500);
        if (error) throw error;
        if (data && data.sections) { applySections(data.sections); window.IIC.status = 'remote'; window.IIC.updatedAt = data.updated_at; }
      } catch (e) { console.warn('[IIC] A usar conteúdo base:', e.message || e); }
    }
    document.documentElement.classList.remove('cms-loading');
    await loadScript('main.js');

    /* Editor: só com ?edit=1, regresso do link de login, ou sessão já existente */
    const params = new URLSearchParams(location.search);
    let wantsEditor = params.get('edit') === '1' || params.has('code') || /access_token|error_description/.test(location.hash);
    if (!wantsEditor && sb) {
      try { const { data } = await sb.auth.getSession(); wantsEditor = !!data.session; } catch (_) {}
    }
    if (wantsEditor) { loadCss('admin.css'); loadScript('admin.js'); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
