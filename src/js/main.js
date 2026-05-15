/**
 * main.js — Bootstrap de l'application.
 *
 * - Liste statique des apps (sans Python ni Géométrie : retirées sur
 *   décision projet).
 * - Routeur : mount/unmount.
 * - Branchement boutons globaux + raccourcis.
 */
(function (GR) {
  'use strict';

  // 12 apps, ordre type NumWorks adapté.
  const APP_REGISTRY = [
    { id:'calculs',     name:'Calculs',          icon:'∑',  shortcut:'Ctrl+1' },
    { id:'fonctions',   name:'Fonctions',        icon:'ƒ',  shortcut:'Ctrl+2' },
    { id:'equations',   name:'Équations',        icon:'=',  shortcut:'Ctrl+3' },
    { id:'statistiques',name:'Statistiques',     icon:'σ',  shortcut:'Ctrl+4' },
    { id:'probabilites',name:'Probabilités',     icon:'P',  shortcut:'Ctrl+5' },
    { id:'regressions', name:'Régressions',      icon:'⤢',  shortcut:'Ctrl+6' },
    { id:'suites',      name:'Suites',           icon:'uₙ', shortcut:'Ctrl+7' },
    { id:'tableur',     name:'Tableur',          icon:'⊞',  shortcut:'Ctrl+8' },
    { id:'unites',      name:'Unités',           icon:'⇌',  shortcut:'Ctrl+9' },
    { id:'constantes',  name:'Constantes',       icon:'ℏ' },
    { id:'periodique',  name:'Tableau périodique', icon:'P̲e' },
    { id:'reglages',    name:'Réglages',         icon:'⚙' },
  ];

  let currentApp = null;
  let elMain, elSidebarList, elVkb, elVkbToggle, elThemeToggle;

  function start() {
    elMain        = document.getElementById('main');
    elSidebarList = document.getElementById('app-list');
    elVkb         = document.getElementById('vkb');
    elVkbToggle   = document.getElementById('vkb-toggle');
    elThemeToggle = document.getElementById('theme-toggle');

    const s = GR.state.get();
    document.body.dataset.theme = s.theme;
    if (GR.engine && s.angleMode) GR.engine.setAngleMode(s.angleMode);

    buildSidebar();
    bindGlobalControls();
    registerShortcuts();
    GR.keyboard.init();

    const initial = GR.apps[s.currentApp] ? s.currentApp : 'calculs';
    activate(initial);
    setVkb(s.vkbOpen);
  }

  function buildSidebar() {
    elSidebarList.innerHTML = '';
    APP_REGISTRY.forEach(meta => {
      const impl = GR.apps[meta.id];
      const btn = document.createElement('button');
      btn.className = 'app-link';
      btn.dataset.app = meta.id;
      btn.innerHTML = `
        <span class="icon">${meta.icon}</span>
        <span class="label">${meta.name}</span>
        ${meta.shortcut ? `<span class="shortcut">${meta.shortcut.replace('Ctrl+','⌃')}</span>` : ''}
      `;
      if (!impl || !impl.available) {
        btn.classList.add('disabled');
        btn.title = 'Bientôt disponible';
      }
      btn.addEventListener('click', () => activate(meta.id));
      elSidebarList.appendChild(btn);
    });
  }

  function activate(appId) {
    const impl = GR.apps[appId];
    if (currentApp && currentApp.unmount) { try { currentApp.unmount(); } catch {} }
    currentApp = null;

    elSidebarList.querySelectorAll('.app-link').forEach(b =>
      b.classList.toggle('active', b.dataset.app === appId));

    if (!impl || !impl.available) {
      renderComingSoon(appId);
      GR.state.set({ currentApp: appId });
      return;
    }

    impl.mount(elMain);
    currentApp = impl;
    GR.state.set({ currentApp: appId });

    if (impl.renderVKB) impl.renderVKB(elVkb);
    else elVkb.innerHTML = '<p style="color:var(--ink-4);padding:var(--s-4);text-align:center">Pas de clavier virtuel pour cette app.</p>';
  }

  function renderComingSoon(appId) {
    const meta = APP_REGISTRY.find(a => a.id === appId) || { name: appId };
    elMain.innerHTML = `
      <div class="app-header"><span class="app-title">${meta.name}</span></div>
      <div class="coming-soon">
        <h2>Bientôt</h2>
        <p>Cette application n'est pas encore implémentée.</p>
        <p style="margin-top:12px;font-size:12px">
          Retour à <strong>Calculs</strong> avec <kbd>Ctrl</kbd>+<kbd>1</kbd> ou <kbd>Échap</kbd>.
        </p>
      </div>
    `;
  }

  function bindGlobalControls() {
    elThemeToggle.addEventListener('click', toggleTheme);
    elVkbToggle.addEventListener('click', () => setVkb(!GR.state.get().vkbOpen));
  }

  function toggleTheme() {
    const cur = GR.state.get().theme;
    const next = cur === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = next;
    GR.state.set({ theme: next });
  }

  function setVkb(open) {
    elVkb.hidden = !open;
    elVkbToggle.classList.toggle('active', open);
    GR.state.set({ vkbOpen: open });
    if (open && currentApp && currentApp.renderVKB) currentApp.renderVKB(elVkb);
  }

  function registerShortcuts() {
    APP_REGISTRY.forEach(meta => {
      if (!meta.shortcut) return;
      GR.keyboard.register(meta.shortcut, meta.name, () => activate(meta.id));
    });
    GR.keyboard.register('Esc',    'Retour Calculs',  () => activate('calculs'));
    GR.keyboard.register('Ctrl+T', 'Thème',           toggleTheme);
    GR.keyboard.register('Ctrl+K', 'Clavier virtuel', () => setVkb(!GR.state.get().vkbOpen));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

})(window.GR = window.GR || {});
