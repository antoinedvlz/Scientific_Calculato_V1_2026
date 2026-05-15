/**
 * apps/fonctions.js — Fonctions (table de valeurs uniquement, sans grapheur).
 *
 * On peut définir f, g, h, i (max 4 fonctions). Pour chacune, on saisit
 * l'expression en x. On choisit ensuite un intervalle [x_min, x_max] et
 * un pas, et on génère un tableau de valeurs.
 *
 * Note : le grapheur est laissé pour une étape future. La table seule
 * couvre déjà la majorité des usages "voir comment varie f".
 */
(function (GR) {
  'use strict';

  const STORAGE = 'grace.fonctions.v1';
  let funcs;
  let table = { xmin:-5, xmax:5, step:0.5 };
  let elBody;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const s = JSON.parse(raw);
        funcs = s.funcs || ['x^2','2*x+1','',''];
        table = s.table || table;
        return;
      }
    } catch {}
    funcs = ['x^2', '2*x+1', '', ''];
  }
  function save() {
    try { localStorage.setItem(STORAGE, JSON.stringify({ funcs, table })); } catch {}
  }

  function mount(container) {
    container.innerHTML = '';
    load();
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Fonctions</span>
      <span class="app-subtitle">définition + table de valeurs (sans grapheur)</span>
    `;
    container.appendChild(head);

    elBody = document.createElement('div');
    elBody.className = 'app-body';
    container.appendChild(elBody);

    render();
  }
  function unmount() {}

  function render() {
    elBody.innerHTML = `
      <div class="card" style="max-width:680px">
        <h3>Définitions</h3>
        <div style="display:grid;grid-template-columns:40px 1fr;gap:8px;align-items:center">
          ${['f','g','h','i'].map((nm,i) => `
            <label>${nm}(x) =</label>
            <input class="field" data-fi="${i}" value="${escape(funcs[i])}">
          `).join('')}
        </div>
      </div>

      <div class="card" style="max-width:680px;margin-top:var(--s-3)">
        <h3>Intervalle</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end">
          <div><div style="font-size:11px;color:var(--ink-3)">x min</div><input class="field" id="xmin" value="${table.xmin}"></div>
          <div><div style="font-size:11px;color:var(--ink-3)">x max</div><input class="field" id="xmax" value="${table.xmax}"></div>
          <div><div style="font-size:11px;color:var(--ink-3)">pas</div><input class="field" id="step" value="${table.step}"></div>
          <button class="btn primary" id="go">Calculer</button>
        </div>
      </div>

      <div id="tbl" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelectorAll('[data-fi]').forEach(inp => {
      inp.addEventListener('input', e => { funcs[+e.target.dataset.fi] = e.target.value; save(); });
    });
    elBody.querySelector('#go').addEventListener('click', () => {
      table.xmin = parseFloat(elBody.querySelector('#xmin').value);
      table.xmax = parseFloat(elBody.querySelector('#xmax').value);
      table.step = parseFloat(elBody.querySelector('#step').value);
      save();
      renderTable();
    });
    renderTable();
  }

  function renderTable() {
    const tbl = elBody.querySelector('#tbl');
    const m = window.math;
    // Compile chaque fonction pour évaluer rapidement.
    const compiled = funcs.map(src => {
      if (!src.trim()) return null;
      try { return m.compile(src); } catch { return { error:true }; }
    });
    const xs = [];
    for (let x = table.xmin; x <= table.xmax + 1e-12; x += table.step) xs.push(round(x));
    let head = '<th>x</th>' + ['f','g','h','i'].map((nm,i) => funcs[i].trim() ? `<th>${nm}(x)</th>` : '').join('');
    let rows = xs.map(x => {
      const cells = compiled.map((c,i) => {
        if (!funcs[i].trim()) return '';
        if (!c || c.error) return '<td class="num">⚠</td>';
        try { return `<td class="num">${fmt(c.evaluate({ x }))}</td>`; }
        catch { return '<td class="num">⚠</td>'; }
      }).join('');
      return `<tr><td class="num">${fmt(x)}</td>${cells}</tr>`;
    }).join('');
    tbl.innerHTML = `<table class="gtable"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function round(x) { return Math.round(x * 1e10) / 1e10; }
  function fmt(x) {
    if (typeof x === 'object' && x !== null && 're' in x) return `${fmt(x.re)}${x.im>=0?'+':''}${fmt(x.im)}i`;
    if (typeof x !== 'number') return String(x);
    if (Number.isInteger(x)) return String(x);
    return parseFloat(x.toPrecision(8)).toString();
  }
  function escape(s) { return (s||'').replace(/"/g, '&quot;'); }

  GR.apps = GR.apps || {};
  GR.apps.fonctions = {
    id:'fonctions', name:'Fonctions', icon:'ƒ', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
