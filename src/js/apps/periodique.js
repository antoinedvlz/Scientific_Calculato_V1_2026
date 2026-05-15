/**
 * apps/periodique.js — Tableau périodique enrichi.
 *
 * Grille 18 × 7 + lanthanides/actinides en dessous. Click sur un élément
 * ouvre un panneau de détails (à droite) avec toutes les propriétés
 * disponibles (cf. data/periodic.js).
 *
 * Filtres : par catégorie (via la légende), par bloc s/p/d/f, et
 * recherche par nom ou symbole.
 */
(function (GR) {
  'use strict';

  let elGrid, elDetail, elSearch;
  let activeFilter = null;     // 'alcalin' | 'transition' | ... ou null
  let activeBlock  = null;     // 's' | 'p' | 'd' | 'f' | null

  function mount(container) {
    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'periodique';
    container.appendChild(root);

    // Header
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Tableau périodique</span>
      <span class="app-subtitle">118 éléments — clic pour les détails</span>
      <div class="app-tools">
        <div class="seg" id="block-seg">
          <button data-b="" class="active">TOUS</button>
          <button data-b="s">s</button>
          <button data-b="p">p</button>
          <button data-b="d">d</button>
          <button data-b="f">f</button>
        </div>
        <input class="field" id="pt-search" placeholder="Rechercher (nom ou symbole)" style="width:220px">
      </div>
    `;
    root.appendChild(head);

    // Toolbar / légende
    const tb = document.createElement('div');
    tb.className = 'periodique-toolbar';
    tb.innerHTML = `
      <div class="legend">${GR.data.periodic.categories.map(([id, nm]) =>
        `<span class="legend-dot ${id}" data-cat="${id}" style="cursor:pointer">${nm}</span>`).join('')}
      </div>
    `;
    root.appendChild(tb);

    // Grille
    elGrid = document.createElement('div');
    elGrid.className = 'periodique-grid';
    root.appendChild(elGrid);

    // Panneau de détails (initialement masqué)
    elDetail = document.createElement('div');
    elDetail.className = 'el-detail';
    elDetail.innerHTML = '';
    document.body.appendChild(elDetail);

    // Évènements
    elSearch = head.querySelector('#pt-search');
    elSearch.addEventListener('input', renderGrid);
    head.querySelector('#block-seg').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-b]'); if (!b) return;
      activeBlock = b.dataset.b || null;
      head.querySelectorAll('#block-seg button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderGrid();
    });
    tb.querySelectorAll('.legend-dot').forEach(d => {
      d.addEventListener('click', () => {
        activeFilter = (activeFilter === d.dataset.cat) ? null : d.dataset.cat;
        tb.querySelectorAll('.legend-dot').forEach(x => x.style.fontWeight = '');
        if (activeFilter) d.style.fontWeight = '700';
        renderGrid();
      });
    });

    renderGrid();
  }

  function unmount() {
    // On retire le panneau de détail du DOM en sortant de l'app.
    if (elDetail && elDetail.parentNode) elDetail.parentNode.removeChild(elDetail);
  }

  function isVisible(el) {
    if (activeBlock && el.block !== activeBlock) return false;
    if (activeFilter && el.cat !== activeFilter) return false;
    const q = (elSearch?.value || '').trim().toLowerCase();
    if (q) {
      return el.sym.toLowerCase().includes(q)
          || el.nm.toLowerCase().includes(q)
          || (el.nmEn && el.nmEn.toLowerCase().includes(q))
          || String(el.z) === q;
    }
    return true;
  }

  function renderGrid() {
    elGrid.innerHTML = '';
    // On crée 10 rangées (1..7 + ligne vide + 2 séries Ln/Ac).
    const cells = {};
    GR.data.periodic.elements.forEach(e => {
      const pos = GR.data.periodic.gridPosition(e);
      const cell = document.createElement('button');
      cell.className = 'el';
      cell.dataset.cat = e.cat;
      cell.dataset.z = e.z;
      cell.style.gridRow = pos.row;
      cell.style.gridColumn = pos.col;
      cell.innerHTML = `
        <span class="z">${e.z}</span>
        <span class="sym">${e.sym}</span>
        <span class="mass">${formatMass(e.mass)}</span>
      `;
      if (!isVisible(e)) cell.classList.add('dim');
      cell.addEventListener('click', () => showDetail(e));
      cell.title = `${e.nm} (${e.sym}) — Z = ${e.z}`;
      cells[e.z] = cell;
      elGrid.appendChild(cell);
    });

    // Petits marqueurs « 57-71 » et « 89-103 » dans les vraies cases de groupe 3.
    // Ces marqueurs sont remplacés par La/Ac (gridPosition les y met) mais
    // on garde une étiquette discrète sur la ligne du dessous.
    const ln = document.createElement('div');
    ln.style.cssText = 'grid-row:9;grid-column:2;font-size:10px;color:var(--ink-3);text-align:right;align-self:center;padding-right:6px';
    ln.textContent = '57-71';
    elGrid.appendChild(ln);
    const ac = document.createElement('div');
    ac.style.cssText = 'grid-row:10;grid-column:2;font-size:10px;color:var(--ink-3);text-align:right;align-self:center;padding-right:6px';
    ac.textContent = '89-103';
    elGrid.appendChild(ac);
  }

  function formatMass(m) {
    if (Array.isArray(m)) return `[${m[0]}]`;
    if (typeof m !== 'number') return '';
    if (m < 100) return m.toFixed(3);
    return m.toFixed(2);
  }

  // ----------------- Détail d'un élément -----------------
  function showDetail(e) {
    const valence = computeValence(e.cfg);
    const quantum = formatQuantum(valence);
    elDetail.innerHTML = `
      <button class="close" aria-label="Fermer">✕</button>
      <div style="display:flex;align-items:flex-start;gap:18px">
        <div>
          <p class="symbig" style="color:${catColor(e.cat)}">${e.sym}</p>
          <p class="nm">${e.nm}</p>
          <p style="margin:0;color:var(--ink-3);font-size:12px">${e.nmEn || ''}</p>
        </div>
        <div style="flex:1"></div>
      </div>

      <h3>Identité</h3>
      ${row('Numéro atomique (Z)', e.z)}
      ${row('Masse atomique', Array.isArray(e.mass) ? `${e.mass[0]} u (isotope stable)` : `${e.mass} u`)}
      ${row('Catégorie', categoryLabel(e.cat))}
      ${row('Bloc', e.block + ' (' + blockLabel(e.block) + ')')}
      ${row('Période / Groupe', `${e.period} / ${e.group ?? '—'}`)}
      ${row('Découverte', e.discYr ?? 'antiquité')}

      <h3>Structure électronique</h3>
      ${row('Configuration', e.cfg)}
      ${row('Électrons de valence', valence.count ?? '—')}
      ${row('Nombres quantiques (val.)', quantum)}
      ${row('Spin (chaque e⁻)', '±½')}
      ${row('Électronégativité (Pauling)', e.en ?? '—')}
      ${row('États d\'oxydation', (e.ox && e.ox.length) ? e.ox.map(o => o > 0 ? '+'+o : o).join(', ') : '—')}

      <h3>Propriétés physiques</h3>
      ${row('Rayon atomique', e.ar ? e.ar + ' pm' : '—')}
      ${row('Rayon covalent', e.cr ? e.cr + ' pm' : '—')}
      ${row('Rayon de Van der Waals', e.vdwr ? e.vdwr + ' pm' : '—')}
      ${row('Point de fusion', e.mp ? `${e.mp} K (${(e.mp-273.15).toFixed(1)} °C)` : '—')}
      ${row('Point d\'ébullition', e.bp ? `${e.bp} K (${(e.bp-273.15).toFixed(1)} °C)` : '—')}
      ${row('Densité (STP)', e.dens ? `${e.dens} g/cm³` : '—')}
      ${row('Structure cristalline', e.xtal ?? '—')}

      <h3>Isotopes</h3>
      ${(e.iso && e.iso.length) ? e.iso.map(i =>
        `<div class="row"><span class="k">${e.sym}-${i.a}</span>` +
        `<span class="v">${i.ab !== null && i.ab !== undefined ? i.ab + ' %' : 'radioactif'}</span></div>`
      ).join('') : '<div class="row"><span class="k">—</span><span class="v">aucun listé</span></div>'}

      ${e.notes ? `<h3>Note</h3><p style="font-size:13px;color:var(--ink-2);margin:0">${e.notes}</p>` : ''}
    `;
    elDetail.classList.add('open');
    elDetail.querySelector('.close').addEventListener('click', hideDetail);
  }

  function hideDetail() { elDetail.classList.remove('open'); }

  function row(k, v) {
    return `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  }

  function categoryLabel(cat) {
    const c = GR.data.periodic.categories.find(([id]) => id === cat);
    return c ? c[1] : cat;
  }
  function blockLabel(b) {
    return { s:'alcalins/alc-terreux', p:'principaux', d:'transition', f:'lanth/actin' }[b] || '';
  }
  function catColor(cat) {
    // Repris des couleurs des dots dans theme.css.
    return ({
      'alcalin':'#d4452b','alcalino-terreux':'#c47514','transition':'#9c6a3a',
      'post-transition':'#6b7e4a','metalloide':'#3e7a4a','non-metal':'#2e6bd4',
      'halogene':'#5a4eb0','gaz-noble':'#a04a90','lanthanide':'#c44676',
      'actinide':'#c45a30','inconnu':'#777'
    })[cat] || 'var(--ink)';
  }

  // Calcule, à partir de la configuration condensée (« [Ar] 3d⁵ 4s¹ »),
  // les électrons de valence et leur(s) nombre(s) quantique(s).
  // Logique simple : on regarde la dernière coquille (max n) et on
  // compte les électrons dont le n est ce maximum.
  function computeValence(cfg) {
    if (!cfg) return { count: null, shells: [] };
    // Tokens type "4s¹", "3d¹⁰", "2p⁶", "4f¹⁴"…
    const tokens = cfg.replace(/\[[^\]]+\]\s*/, '').trim().split(/\s+/);
    const sup = { '⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9 };
    const parsed = tokens.map(t => {
      const m = t.match(/^(\d+)([spdf])([⁰-⁹¹]+)$/);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      const l = m[2];
      const num = [...m[3]].reduce((a,c) => a*10 + (sup[c] ?? 0), 0);
      return { n, l, num };
    }).filter(Boolean);
    if (!parsed.length) return { count: null, shells: [] };
    const maxN = Math.max(...parsed.map(p => p.n));
    const valence = parsed.filter(p => p.n === maxN);
    return {
      count: valence.reduce((s,p) => s + p.num, 0),
      shells: valence,
    };
  }

  function formatQuantum(val) {
    if (!val.shells.length) return '—';
    const lMap = { s:0, p:1, d:2, f:3 };
    return val.shells.map(s => {
      const l = lMap[s.l];
      const mlRange = `[${-l}…${l}]`;
      return `n=${s.n}, ℓ=${l} (${s.l}), mₗ ∈ ${mlRange}`;
    }).join(' ; ');
  }

  GR.apps = GR.apps || {};
  GR.apps.periodique = {
    id:'periodique', name:'Tableau périodique', icon:'P̲e', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
