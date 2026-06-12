/* IIC – Advanced Admin CMS v3 */
(function () {
  'use strict';

  const STORAGE_KEY = 'iic-cms-v2';
  const AUTH_KEY = 'iic-admin-authorized';
  let editMode = false;

  // ── Admin Authorization System ──
  // Usa sessionStorage para que o acesso expire ao fechar o separador/navegador.
  // O lápis ✏️ só aparece na sessão em que se acede com ?edit=1.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit') === '1') {
    sessionStorage.setItem(AUTH_KEY, 'true');
    // Limpar o parâmetro da URL para manter o endereço limpo
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  const isAdminAuthorized = sessionStorage.getItem(AUTH_KEY) === 'true';
  if (!isAdminAuthorized) {
    return; // Sair imediatamente se não autorizado. O UI admin não será carregado.
  }

  /* ── SVG icons for cards (service section) ── */
  const DEFAULT_ICON = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="16" width="32" height="32" rx="4" stroke="#C9A84C" stroke-width="2.5"/><path d="M24 32 L28 36 L40 24" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* ════════════════════════════════════════
     TOOLBAR UI
  ════════════════════════════════════════ */
  function buildUI() {
    const toggle = el('button', { id: 'admin-toggle', title: 'Editar Site', innerHTML: '✏️' });
    const toolbar = el('div', { id: 'admin-toolbar', innerHTML: `
      <div class="atb-inner">
        <div class="atb-left">
          <span class="atb-badge">✏️ Modo Edição</span>
          <span class="atb-hint">Clique nos textos para editar · <strong>+ Adicionar</strong> para novos blocos · <strong>✕</strong> para eliminar · <strong>🗂 Secções</strong> para gerir secções</span>
        </div>
        <div class="atb-right">
          <button id="adm-sections" class="abtn abtn-secondary">🗂 Secções</button>
          <button id="adm-menu" class="abtn abtn-secondary">🔗 Menu</button>
          <button id="adm-save" class="abtn abtn-gold">💾 Guardar</button>
          <button id="adm-export" class="abtn abtn-gold" title="Descarregar ficheiro index.html limpo com as edições aplicadas">📥 Exportar HTML</button>
          <button id="adm-reset" class="abtn abtn-danger">🔄 Repor</button>
          <button id="adm-logout" class="abtn abtn-danger" title="Sair do modo Administrador e ocultar o botão ✏️">🚪 Sair</button>
          <button id="adm-close" class="abtn abtn-close">✕</button>
        </div>
      </div>` });

    document.body.append(toggle, toolbar);

    toggle.onclick = () => enableEdit();
    document.getElementById('adm-close').onclick = disableEdit;
    document.getElementById('adm-save').onclick = save;
    document.getElementById('adm-export').onclick = exportHTML;
    document.getElementById('adm-reset').onclick = reset;
    document.getElementById('adm-logout').onclick = logoutAdmin;
    document.getElementById('adm-sections').onclick = openSectionPanel;
    document.getElementById('adm-menu').onclick = openMenuPanel;
  }

  function el(tag, props = {}) {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'innerHTML') e.innerHTML = v;
      else if (k === 'class') e.className = v;
      else e.setAttribute(k, v);
    });
    return e;
  }

  /* ════════════════════════════════════════
     EDIT MODE
  ════════════════════════════════════════ */
  function enableEdit() {
    editMode = true;
    document.body.classList.add('edit-mode');
    document.getElementById('admin-toggle').style.display = 'none';
    document.getElementById('admin-toolbar').classList.add('visible');
    makeTextsEditable();
    injectAddButtons();
    injectItemControls();
  }

  function disableEdit() {
    editMode = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('admin-toggle').style.display = '';
    document.getElementById('admin-toolbar').classList.remove('visible');
    document.querySelectorAll('[contenteditable]').forEach(e => {
      e.removeAttribute('contenteditable');
      e.classList.remove('editable', 'editing');
    });
    document.querySelectorAll('.adm-add-row, .item-ctrl').forEach(e => e.remove());
    closePanel();
  }

  /* ════════════════════════════════════════
     TEXT EDITING
  ════════════════════════════════════════ */
  function makeTextsEditable() {
    const sel = 'h1,h2,h3,h4,h5,p,span,a,.hero-badge,.section-tag,.featured-badge,.stat-num,.stat-label';
    document.querySelectorAll(sel).forEach(e => {
      if (e.closest('#admin-toolbar,#admin-panel,.adm-add-row,.item-ctrl')) return;
      if (e.querySelector('img')) return;
      if (e.hasAttribute('contenteditable')) return;
      e.setAttribute('contenteditable', 'true');
      e.classList.add('editable');
      if (e.tagName === 'A') e.addEventListener('click', ev => { if (editMode) ev.preventDefault(); });
      e.addEventListener('focus', () => e.classList.add('editing'));
      e.addEventListener('blur', () => e.classList.remove('editing'));
      e.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); e.blur(); } });
    });
  }

  /* ════════════════════════════════════════
     ADD BUTTONS (per section)
  ════════════════════════════════════════ */
  function injectAddButtons() {
    document.querySelectorAll('.adm-add-row').forEach(e => e.remove());
    addRowBtn('#services .services-grid', 'Serviço', addServiceCard);
    addRowBtn('#areas .areas-grid', 'Área de Negócio', addAreaItem);
    addRowBtn('#team .team-grid', 'Membro de Equipa', addTeamCard);
  }

  function addRowBtn(containerSel, label, handler) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    const row = el('div', { class: 'adm-add-row' });
    const btn = el('button', { class: 'adm-add-btn', innerHTML: `+ Adicionar ${label}` });
    btn.onclick = () => { handler(container); injectItemControls(); makeTextsEditable(); };
    row.appendChild(btn);
    container.parentElement.appendChild(row);
  }

  /* ════════════════════════════════════════
     ITEM CONTROLS (delete / duplicate)
  ════════════════════════════════════════ */
  function injectItemControls() {
    document.querySelectorAll('.item-ctrl').forEach(e => e.remove());
    const targets = [
      ...document.querySelectorAll('.service-card'),
      ...document.querySelectorAll('.area-item'),
      ...document.querySelectorAll('.team-card'),
    ];
    targets.forEach(card => {
      const ctrl = el('div', { class: 'item-ctrl' });
      const dup = el('button', { class: 'ic-btn ic-dup', innerHTML: '⧉', title: 'Duplicar' });
      const del = el('button', { class: 'ic-btn ic-del', innerHTML: '✕', title: 'Eliminar' });
      dup.onclick = ev => { ev.stopPropagation(); duplicateItem(card); };
      del.onclick = ev => { ev.stopPropagation(); deleteItem(card); };
      ctrl.append(dup, del);
      card.style.position = 'relative';
      card.appendChild(ctrl);
    });
  }

  function duplicateItem(card) {
    const clone = card.cloneNode(true);
    clone.querySelectorAll('.item-ctrl').forEach(e => e.remove());
    card.parentElement.insertBefore(clone, card.nextSibling);
    injectItemControls();
    makeTextsEditable();
    updateAreaNumbers();
  }

  function deleteItem(card) {
    if (!confirm('Remover este elemento?')) return;
    card.remove();
    updateAreaNumbers();
  }

  function updateAreaNumbers() {
    document.querySelectorAll('.area-item .area-number').forEach((n, i) => {
      n.textContent = String(i + 1).padStart(2, '0');
    });
  }

  /* ════════════════════════════════════════
     ADD: SERVICE CARD
  ════════════════════════════════════════ */
  function addServiceCard(grid) {
    const card = el('div', { class: 'service-card animate-in' });
    card.innerHTML = `<div class="service-card-inner">
      <div class="service-icon-wrap">${DEFAULT_ICON}</div>
      <h3>Novo Serviço</h3>
      <p>Descrição do serviço. Clique para editar.</p>
      <a href="#contact" class="service-link">Saber mais →</a>
    </div>`;
    grid.appendChild(card);
  }

  /* ════════════════════════════════════════
     ADD: AREA ITEM
  ════════════════════════════════════════ */
  function addAreaItem(grid) {
    const count = grid.querySelectorAll('.area-item').length + 1;
    const item = el('div', { class: 'area-item animate-in' });
    item.innerHTML = `
      <div class="area-number">${String(count).padStart(2, '0')}</div>
      <div class="area-content">
        <h4>Nova Área</h4>
        <p>Descrição da área de negócio.</p>
      </div>`;
    grid.appendChild(item);
  }

  /* ════════════════════════════════════════
     ADD: TEAM CARD
  ════════════════════════════════════════ */
  function addTeamCard(grid) {
    const card = el('div', { class: 'team-card animate-in' });
    card.innerHTML = `
      <div class="team-avatar">
        <div class="avatar-placeholder">AA</div>
        <div class="team-gold-ring"></div>
      </div>
      <div class="team-info">
        <h4>Nome Completo</h4>
        <span class="team-role">Cargo / Especialidade</span>
        <p>Breve descrição do consultor e experiência.</p>
        <a href="#contact" class="team-cv-btn">Descarregar CV</a>
      </div>`;
    grid.appendChild(card);
  }

  /* ════════════════════════════════════════
     PANEL SYSTEM
  ════════════════════════════════════════ */
  function closePanel() {
    const p = document.getElementById('admin-panel');
    if (p) p.remove();
  }

  function openPanel(title, content) {
    closePanel();
    const panel = el('div', { id: 'admin-panel' });
    panel.innerHTML = `
      <div class="ap-backdrop"></div>
      <div class="ap-box">
        <div class="ap-header">
          <h3>${title}</h3>
          <button class="ap-close">✕</button>
        </div>
        <div class="ap-body">${content}</div>
      </div>`;
    panel.querySelector('.ap-backdrop').onclick = closePanel;
    panel.querySelector('.ap-close').onclick = closePanel;
    document.body.appendChild(panel);
    return panel;
  }

  /* ════════════════════════════════════════
     SECTION MANAGER
  ════════════════════════════════════════ */
  function openSectionPanel() {
    function renderSectionPanel() {
      const sections = [...document.querySelectorAll('body > section, body > .about-strip, body > .cta-banner')];
      const rows = sections.map(sec => {
        const id = sec.id || sec.className.split(' ')[0];
        const label = sec.querySelector('h2')?.textContent?.trim() || id;
        const hidden = sec.style.display === 'none';
        return `<div class="sp-row" data-sec-id="${id}">
          <span class="sp-label">${escHtml(label)}</span>
          <div class="sp-actions">
            <label class="sp-toggle">
              <input type="checkbox" data-sec="${escHtml(id)}" ${hidden ? '' : 'checked'}>
              <span class="sp-slider"></span>
            </label>
            <button class="sp-del ic-btn ic-del" data-sec="${escHtml(id)}" title="Apagar secção permanentemente">🗑</button>
          </div>
        </div>`;
      }).join('');

      const panel = openPanel('🗂 Gerir Secções', `
        <p class="ap-desc">Ative/desative ou apague permanentemente secções do site.</p>
        <div class="sp-list">${rows}</div>`);

      panel.querySelectorAll('input[data-sec]').forEach(chk => {
        chk.onchange = () => {
          const target = document.getElementById(chk.dataset.sec)
            || document.querySelector(`.${chk.dataset.sec}`);
          if (target) target.style.display = chk.checked ? '' : 'none';
        };
      });

      panel.querySelectorAll('.sp-del').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.sec;
          const target = document.getElementById(id) || document.querySelector(`.${id}`);
          if (!target) return;
          const label = target.querySelector('h2')?.textContent?.trim() || id;
          if (!confirm(`Apagar permanentemente a secção "${label}"?\n\nEsta ação remove a secção do site. Pode ser revertida com "🔄 Repor".`)) return;
          target.remove();
          renderSectionPanel();
          showToast('🗑 Secção apagada!');
        };
      });
    }

    renderSectionPanel();
  }

  /* ════════════════════════════════════════
     MENU MANAGER — in-memory state
  ════════════════════════════════════════ */
  function openMenuPanel() {
    /* Read current DOM state into an array */
    let menuItems = [...document.querySelectorAll('#nav-menu li')].map(li => {
      const a = li.querySelector('a');
      return {
        text: a?.textContent?.trim() || '',
        href: a?.getAttribute('href') || '#'
      };
    });

    function renderPanel() {
      closePanel();

      const rows = menuItems.length
        ? menuItems.map((item, i) => `
          <div class="mp-row" data-idx="${i}">
            <div class="mp-order">
              <button class="mp-up ic-btn" data-idx="${i}" title="Mover para cima" ${i === 0 ? 'disabled' : ''}>↑</button>
              <button class="mp-dn ic-btn" data-idx="${i}" title="Mover para baixo" ${i === menuItems.length - 1 ? 'disabled' : ''}>↓</button>
            </div>
            <input class="mp-text" type="text" data-idx="${i}" value="${escHtml(item.text)}" placeholder="Texto do link">
            <input class="mp-href" type="text" data-idx="${i}" value="${escHtml(item.href)}" placeholder="#secção ou URL">
            <button class="mp-del ic-btn ic-del" data-idx="${i}" title="Remover">✕</button>
          </div>`).join('')
        : `<p class="ap-empty">Sem itens de menu. Adicione um abaixo.</p>`;

      const panel = openPanel('🔗 Gerir Menu de Navegação', `
        <p class="ap-desc">Adicione, edite, remova ou reordene os links de navegação. Clique em <strong>Aplicar</strong> para ver as alterações no site.</p>
        <div id="mp-list">${rows}</div>
        <div class="ap-actions">
          <button id="mp-add" class="abtn abtn-gold">+ Adicionar Link</button>
          <button id="mp-apply" class="abtn abtn-secondary">✓ Aplicar ao Site</button>
        </div>`);

      /* Sync text changes back to state */
      panel.querySelectorAll('.mp-text').forEach(inp => {
        inp.oninput = () => { menuItems[+inp.dataset.idx].text = inp.value; };
      });
      panel.querySelectorAll('.mp-href').forEach(inp => {
        inp.oninput = () => { menuItems[+inp.dataset.idx].href = inp.value; };
      });

      /* Delete */
      panel.querySelectorAll('.mp-del').forEach(btn => {
        btn.onclick = () => {
          menuItems.splice(+btn.dataset.idx, 1);
          renderPanel();
        };
      });

      /* Move up */
      panel.querySelectorAll('.mp-up').forEach(btn => {
        btn.onclick = () => {
          const i = +btn.dataset.idx;
          if (i > 0) {
            [menuItems[i - 1], menuItems[i]] = [menuItems[i], menuItems[i - 1]];
            renderPanel();
          }
        };
      });

      /* Move down */
      panel.querySelectorAll('.mp-dn').forEach(btn => {
        btn.onclick = () => {
          const i = +btn.dataset.idx;
          if (i < menuItems.length - 1) {
            [menuItems[i], menuItems[i + 1]] = [menuItems[i + 1], menuItems[i]];
            renderPanel();
          }
        };
      });

      /* Add new item */
      panel.querySelector('#mp-add').onclick = () => {
        menuItems.push({ text: 'Novo Link', href: '#' });
        renderPanel();
      };

      /* Apply to DOM */
      panel.querySelector('#mp-apply').onclick = () => {
        applyMenuToDOM();
        closePanel();
        showToast('✅ Menu atualizado!');
      };
    }

    function applyMenuToDOM() {
      const navMenu = document.getElementById('nav-menu');
      if (!navMenu) return;
      navMenu.innerHTML = menuItems
        .map(item => `<li><a href="${escHtml(item.href)}" class="nav-link">${escHtml(item.text)}</a></li>`)
        .join('');
      if (editMode) {
        makeTextsEditable();
        injectItemControls();
      }
    }

    renderPanel();
  }

  /* ════════════════════════════════════════
     UTILITY
  ════════════════════════════════════════ */
  function escHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ════════════════════════════════════════
     SAVE / RESET
  ════════════════════════════════════════ */
  function save() {
    const clone = document.body.cloneNode(true);
    ['#admin-toolbar', '#admin-toggle', '#admin-panel', '.adm-add-row', '.item-ctrl', '.admin-toast'].forEach(sel => {
      clone.querySelectorAll(sel).forEach(e => e.remove());
    });
    clone.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
    clone.querySelectorAll('.editable,.editing').forEach(e => { e.classList.remove('editable', 'editing'); });
    localStorage.setItem(STORAGE_KEY, clone.innerHTML);
    showToast('✅ Alterações guardadas!');
  }

  function reset() {
    if (!confirm('Repor conteúdo original? Perderá todas as alterações.')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function logoutAdmin() {
    if (!confirm('Tem a certeza que deseja sair do modo de administração? O botão ✏️ será ocultado até aceder novamente com o link secreto.')) return;
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
  }

  function exportHTML() {
    save(); // Guardar as alterações mais recentes antes de exportar
    
    // Clonar o documento inteiro a partir da raiz (HTML)
    const docClone = document.documentElement.cloneNode(true);
    
    // Lista de elementos de administração a remover do ficheiro final
    const adminElements = [
      '#admin-toolbar', 
      '#admin-toggle', 
      '#admin-panel', 
      '.adm-add-row', 
      '.item-ctrl', 
      '.admin-toast',
      'script[src="admin.js"]', 
      'link[href="admin.css"]'
    ];
    
    adminElements.forEach(sel => {
      docClone.querySelectorAll(sel).forEach(e => e.remove());
    });
    
    // Remover atributos de edição visual
    docClone.querySelectorAll('[contenteditable]').forEach(e => {
      e.removeAttribute('contenteditable');
    });
    
    // Limpar classes de edição
    docClone.querySelectorAll('.editable, .editing').forEach(e => {
      e.classList.remove('editable', 'editing');
      if (e.classList.length === 0) {
        e.removeAttribute('class');
      }
    });

    // Repor a classe de animação para garantir que os novos elementos animam corretamente ao scroll
    docClone.querySelectorAll('.service-card, .area-item, .team-card, .reveal').forEach(e => {
      e.classList.remove('animate-in');
    });

    // Limpar o estilo position:relative temporário adicionado aos cards pelo CMS
    docClone.querySelectorAll('.service-card, .area-item, .team-card').forEach(e => {
      if (e.style.position === 'relative') {
        e.style.position = '';
        if (e.style.length === 0) {
          e.removeAttribute('style');
        }
      }
    });
    
    // Construir a string HTML completa com DOCTYPE
    const htmlContent = '<!DOCTYPE html>\n' + docClone.outerHTML;
    
    // Criar download do ficheiro
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = el('a', { href: url, download: 'index.html' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 Ficheiro index.html descarregado!');
  }

  function loadSaved() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = saved;
    [
      '#nav-menu',
      '#services .services-grid',
      '#areas .areas-grid',
      '#team .team-grid',
      '#home',
      '#contact',
      '.footer-inner',
      '.about-strip .container',
      '.cta-content'
    ].forEach(sel => {
      const src = tmp.querySelector(sel);
      const dst = document.querySelector(sel);
      if (src && dst) dst.innerHTML = src.innerHTML;
    });
    /* Restore section visibility */
    document.querySelectorAll('body > section, body > .about-strip, body > .cta-banner').forEach(sec => {
      const id = sec.id || sec.className.split(' ')[0];
      const savedSec = tmp.querySelector(`#${id}`) || tmp.querySelector(`.${id}`);
      if (savedSec) sec.style.display = savedSec.style.display || '';
    });
  }

  /* ════════════════════════════════════════
     TOAST
  ════════════════════════════════════════ */
  function showToast(msg) {
    let t = document.querySelector('.admin-toast');
    if (!t) { t = el('div', { class: 'admin-toast' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('visible'), 2500);
  }

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    buildUI();
    loadSaved();
  });

})();
