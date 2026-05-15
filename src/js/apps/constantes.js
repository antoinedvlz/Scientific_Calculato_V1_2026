/**
 * apps/constantes.js — Navigateur de constantes physiques.
 *
 * Affiche les constantes du catalogue avec recherche live et filtres
 * par catégorie. Un click sur une constante :
 *   - L'insère dans le presse-papier (et l'affiche en notif éphémère).
 *   - (En option future : envoi vers Calculs en activant l'app.)
 */
(function (GR) {
  'use strict';

  let activeCat = null;
  let query = '';
  let elList, elSearch;

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Constantes</span>
      <span class="app-subtitle">CODATA + SI 2019 — utilisables directement dans Calculs</span>
    `;
    container.appendChild(head);

    const root = document.createElement('div');
    root.className = 'constants';
    container.appendChild(root);

    const search = document.createElement('div');
    search.className = 'constants-search';
    search.innerHTML = `
      <input id="c-search" placeholder="Rechercher (Planck, Avogadro, gravité, μ₀…)">
      <div class="seg" id="c-seg">
        <button data-c="" class="active">TOUTES</button>
        ${GR.data.constants.categories.map(([id, nm]) =>
          `<button data-c="${id}">${nm}</button>`).join('')}
      </div>
    `;
    root.appendChild(search);

    elList = document.createElement('div');
    elList.className = 'constants-list';
    root.appendChild(elList);

    elSearch = search.querySelector('#c-search');
    elSearch.addEventListener('input', () => { query = elSearch.value.toLowerCase(); render(); });
    search.querySelector('#c-seg').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-c]'); if (!b) return;
      activeCat = b.dataset.c || null;
      search.querySelectorAll('#c-seg button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render();
    });

    render();
  }

  function unmount() {}

  function match(c) {
    if (activeCat && c.cat !== activeCat) return false;
    if (!query) return true;
    return c.id.toLowerCase().includes(query)
        || c.nm.toLowerCase().includes(query)
        || c.sym.toLowerCase().includes(query);
  }

  function render() {
    elList.innerHTML = '';
    const list = GR.data.constants.list.filter(match);
    if (!list.length) {
      elList.innerHTML = '<p style="color:var(--ink-3);text-align:center;padding:var(--s-5)">Aucune constante ne correspond.</p>';
      return;
    }
    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'const-card';
      card.innerHTML = `
        <div class="sym">${c.sym}</div>
        <div class="desc">
          <div><span class="nm">${c.nm}</span> <span class="cat">${c.cat}</span></div>
          <div style="font-size:11px;color:var(--ink-3);margin-top:2px;font-family:var(--font-mono)">id : <strong>${c.id}</strong>${c.exact ? ' · valeur exacte (SI)' : ''}</div>
          ${c.desc ? `<div style="font-size:11px;color:var(--ink-3);margin-top:2px;font-style:italic">${c.desc}</div>` : ''}
        </div>
        <div class="val">${c.value}${c.unit ? '' : ''}</div>
      `;
      card.addEventListener('click', () => {
        // Copie l'id dans le presse-papier pour usage immédiat dans Calculs.
        try { navigator.clipboard.writeText(c.id); } catch {}
        flash(card);
      });
      elList.appendChild(card);
    });
  }

  function flash(el) {
    const old = el.style.background;
    el.style.background = 'var(--mark)';
    setTimeout(() => { el.style.background = old; }, 350);
    // Notification globale courte.
    toast(`« ${el.querySelector('strong').textContent} » copié → colle-le dans Calculs.`);
  }

  function toast(msg) {
    let t = document.getElementById('grace-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'grace-toast';
      t.style.cssText = `
        position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
        background:var(--ink);color:var(--bg);padding:8px 16px;border-radius:6px;
        font-size:13px;z-index:100;opacity:0;transition:opacity .2s`;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 1800);
  }

  GR.apps = GR.apps || {};
  GR.apps.constantes = {
    id:'constantes', name:'Constantes', icon:'ℏ', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
