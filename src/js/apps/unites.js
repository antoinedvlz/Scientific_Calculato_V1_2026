/**
 * apps/unites.js — Convertisseur d'unités + table des préfixes SI.
 *
 * Trois zones :
 *   - Catégories à gauche (Longueur, Masse, …)
 *   - Ligne « valeur + unité source → unité cible + résultat » en haut
 *   - Liste des unités de la catégorie en grille (un clic = sélectionne)
 *   - Sous : table de tous les préfixes SI (référence)
 *
 * On délègue toute la conversion à math.js via GR.engine.convertUnit().
 */
(function (GR) {
  'use strict';

  let activeCat = 'longueur';
  let unitFrom  = 'm';
  let unitTo    = 'cm';
  let value     = '1';
  let elValue, elResult, elFromName, elToName, elCatList, elUnitList;

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Unités</span>
      <span class="app-subtitle">conversion + analyse dimensionnelle gratuite via Calculs</span>
    `;
    container.appendChild(head);

    const root = document.createElement('div');
    root.className = 'units';
    container.appendChild(root);

    // ---- colonne gauche : catégories
    elCatList = document.createElement('div');
    elCatList.className = 'units-cats';
    GR.data.units.categories.forEach(cat => {
      const b = document.createElement('div');
      b.className = 'units-cat' + (cat.id === activeCat ? ' active' : '');
      b.textContent = cat.nm;
      b.dataset.id = cat.id;
      b.addEventListener('click', () => {
        activeCat = cat.id;
        // Réinitialise les unités sur la 1re et 2e de la catégorie.
        const cat0 = GR.data.units.categories.find(c => c.id === activeCat);
        unitFrom = cat0.units[0].sym;
        unitTo   = (cat0.units[1] || cat0.units[0]).sym;
        renderAll();
      });
      elCatList.appendChild(b);
    });
    root.appendChild(elCatList);

    // ---- colonne droite : panneau de conversion
    const panel = document.createElement('div');
    panel.className = 'units-panel';
    panel.innerHTML = `
      <div class="units-input">
        <input class="value-in" id="u-val" value="${value}" autocomplete="off">
        <div>
          <div class="field" id="u-from" style="display:flex;align-items:center;justify-content:center;cursor:default">m</div>
          <div id="u-from-nm" style="font-size:11px;color:var(--ink-3);text-align:center;margin-top:2px">mètre</div>
        </div>
        <div class="arrow">→</div>
        <div>
          <div class="field" id="u-to" style="display:flex;align-items:center;justify-content:center;cursor:default">cm</div>
          <div id="u-to-nm" style="font-size:11px;color:var(--ink-3);text-align:center;margin-top:2px">centimètre</div>
        </div>
      </div>
      <div class="units-input" style="margin-top:var(--s-2);grid-template-columns:1fr">
        <div class="result" id="u-result">—</div>
      </div>

      <h3 style="margin:var(--s-5) 0 var(--s-2);font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3)">
        Unités disponibles
      </h3>
      <p style="font-size:12px;color:var(--ink-3);margin:0 0 var(--s-2)">
        Clic gauche : choisir l'unité <strong>source</strong>. Maj+clic ou clic droit : unité <strong>cible</strong>.
      </p>
      <div class="units-list" id="u-list"></div>

      <h3 style="margin:var(--s-5) 0 var(--s-2);font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3)">
        Préfixes SI
      </h3>
      <p style="font-size:12px;color:var(--ink-3);margin:0 0 var(--s-2)">
        Référence complète. À combiner avec n'importe quelle unité de base : MHz, μC, GPa, nF…
      </p>
      <div class="units-prefix-table">
        <div class="units-prefix-row head">
          <div>Préfixe</div><div>Symbole</div><div>Facteur</div><div>Exemple</div>
        </div>
        ${GR.data.units.prefixes.map(([s, nm, f]) => `
          <div class="units-prefix-row">
            <div>${nm}</div>
            <div>${s || '—'}</div>
            <div>${formatFactor(f)}</div>
            <div>${exampleFor(s)}</div>
          </div>
        `).join('')}
      </div>
    `;
    root.appendChild(panel);

    elValue    = panel.querySelector('#u-val');
    elResult   = panel.querySelector('#u-result');
    elFromName = panel.querySelector('#u-from-nm');
    elToName   = panel.querySelector('#u-to-nm');
    elUnitList = panel.querySelector('#u-list');
    elValue.addEventListener('input', recompute);

    renderAll();
  }

  function unmount() {}

  function renderAll() {
    // Met à jour la liste des catégories (active class)
    elCatList.querySelectorAll('.units-cat').forEach(c => {
      c.classList.toggle('active', c.dataset.id === activeCat);
    });
    // Met à jour les libellés et la liste d'unités
    document.querySelector('#u-from').textContent = unitFrom;
    document.querySelector('#u-to').textContent   = unitTo;
    const cat = GR.data.units.categories.find(c => c.id === activeCat);
    elFromName.textContent = cat.units.find(u => u.sym === unitFrom)?.nm ?? '';
    elToName.textContent   = cat.units.find(u => u.sym === unitTo)?.nm ?? '';

    elUnitList.innerHTML = '';
    cat.units.forEach(u => {
      const it = document.createElement('div');
      it.className = 'uitem' + (u.sym === unitFrom ? ' active' : '');
      it.innerHTML = `<span>${u.sym}</span><span class="unit-name">${u.nm}</span>`;
      it.addEventListener('click', (ev) => {
        if (ev.shiftKey) unitTo = u.sym; else unitFrom = u.sym;
        renderAll();
      });
      it.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        unitTo = u.sym; renderAll();
      });
      elUnitList.appendChild(it);
    });
    recompute();
  }

  function recompute() {
    value = elValue.value;
    const r = GR.engine.convertUnit(value, unitFrom, unitTo);
    if (!r.ok) {
      elResult.textContent = '⚠ ' + r.error;
      elResult.style.color = 'var(--bad)';
    } else {
      elResult.textContent = r.text;
      elResult.style.color = '';
    }
  }

  function formatFactor(f) {
    if (f === 1) return '1';
    const exp = Math.round(Math.log10(f));
    return `10${supExp(exp)}`;
  }
  function supExp(n) {
    const sup = { '-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
    return String(n).split('').map(c => sup[c] ?? c).join('');
  }
  function exampleFor(prefix) {
    const map = { Y:'YJ', Z:'Zm', E:'EW', P:'PB', T:'THz', G:'GHz', M:'MΩ',
      k:'kg', h:'hPa', da:'daL', d:'dL', c:'cm', m:'mm', μ:'μF', n:'nm',
      p:'ps', f:'fs', a:'aJ', z:'zg', y:'yg' };
    return map[prefix] || '';
  }

  GR.apps = GR.apps || {};
  GR.apps.unites = {
    id:'unites', name:'Unités', icon:'⇌', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
