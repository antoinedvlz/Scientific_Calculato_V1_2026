/**
 * apps/tableur.js — Tableur minimaliste.
 *
 * Grille A1:Z50, formules style « =A1+B2*2 », « =SUM(A1:A10) ».
 *   - Une cellule contient soit une valeur (parsée comme nombre),
 *     soit une formule commençant par '='.
 *   - Recalcul à chaque édition (l'ensemble du tableau, simple et suffisant
 *     pour cette taille).
 *
 * Fonctions reconnues : SUM, AVG, MIN, MAX, COUNT, ainsi que toutes celles
 * de math.js (sin, cos, sqrt…). Plages : A1:A10 → [A1, A2, …, A10].
 */
(function (GR) {
  'use strict';

  const STORAGE = 'grace.tableur.v1';
  const COLS = 12; // A..L (suffisant en initial, on peut étendre)
  const ROWS = 30;
  const COL_NAMES = Array.from({length:COLS}, (_,i) => String.fromCharCode(65 + i));

  let cells; // map "A1" -> string brute
  let elBody;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) { cells = JSON.parse(raw); return; }
    } catch {}
    cells = {};
  }
  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(cells)); } catch {} }

  function mount(container) {
    container.innerHTML = '';
    load();
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Tableur</span>
      <span class="app-subtitle">A1:${COL_NAMES[COLS-1]}${ROWS} — formules « =A1+B2 », « =SUM(A1:A10) »</span>
      <div class="app-tools">
        <button class="btn danger" id="clear">Vider</button>
      </div>
    `;
    container.appendChild(head);

    elBody = document.createElement('div');
    elBody.className = 'spreadsheet';
    container.appendChild(elBody);

    head.querySelector('#clear').addEventListener('click', () => {
      if (confirm('Vider toutes les cellules ?')) { cells = {}; save(); render(); }
    });
    render();
  }
  function unmount() {}

  function render() {
    const tbl = document.createElement('table');
    let h = '<tr><th class="corner"></th>';
    for (const c of COL_NAMES) h += `<th class="col">${c}</th>`;
    h += '</tr>';
    tbl.innerHTML = h;
    const computed = computeAll();
    for (let r = 1; r <= ROWS; r++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<th class="row">${r}</th>`;
      for (const c of COL_NAMES) {
        const key = c + r;
        const raw = cells[key] ?? '';
        const isFormula = raw.startsWith('=');
        const td = document.createElement('td');
        if (isFormula) td.classList.add('computed');
        const input = document.createElement('input');
        input.value = raw;
        input.dataset.k = key;
        // Affiche la valeur calculée quand non focus, la formule en édition.
        input.addEventListener('focus', () => { input.value = cells[key] ?? ''; });
        input.addEventListener('blur', () => {
          cells[key] = input.value;
          save();
          render();
        });
        if (document.activeElement && document.activeElement.dataset?.k === key) {
          // garde la formule
        } else if (isFormula) {
          const v = computed[key];
          input.value = v === null ? '' : v.error ? '#ERR' : fmt(v.value);
        }
        td.appendChild(input);
        tr.appendChild(td);
      }
      tbl.appendChild(tr);
    }
    elBody.innerHTML = '';
    elBody.appendChild(tbl);
  }

  // ---------- Calcul ----------
  function computeAll() {
    const out = {};
    const stack = new Set();
    function val(k) {
      if (out[k]) return out[k];
      if (stack.has(k)) { out[k] = { error:true, msg:'cycle' }; return out[k]; }
      const raw = cells[k];
      if (!raw) { out[k] = null; return null; }
      if (!raw.startsWith('=')) {
        const n = Number(raw);
        out[k] = isNaN(n) ? { value: raw } : { value: n };
        return out[k];
      }
      stack.add(k);
      try {
        const result = window.math.evaluate(transform(raw.slice(1), val));
        out[k] = { value: result };
      } catch (e) {
        out[k] = { error:true, msg:e.message };
      }
      stack.delete(k);
      return out[k];
    }
    for (const k of Object.keys(cells)) val(k);
    // Petit hack : on inclut les non-formules pour l'affichage uniforme.
    return out;
  }

  // Transforme la formule : étend les plages A1:A10 et remplace les
  // références par leur valeur (récursive via `get`).
  function transform(expr, getVal) {
    // Étend les plages
    expr = expr.replace(/\b([A-Z])(\d+):([A-Z])(\d+)\b/g, (_, c1, r1, c2, r2) => {
      const a = c1.charCodeAt(0), b = c2.charCodeAt(0);
      const list = [];
      for (let cc = Math.min(a,b); cc <= Math.max(a,b); cc++) {
        for (let rr = Math.min(+r1, +r2); rr <= Math.max(+r1, +r2); rr++) {
          list.push(String.fromCharCode(cc) + rr);
        }
      }
      return '[' + list.join(',') + ']';
    });
    // Remplace références A1 par leur valeur numérique (0 si vide / non num).
    expr = expr.replace(/\b([A-Z])(\d+)\b/g, (_, c, r) => {
      const v = getVal(c + r);
      if (!v || v.error || typeof v.value !== 'number') return '0';
      return '(' + v.value + ')';
    });
    // Alias français/maj
    expr = expr.replace(/\bSUM\b/g, 'sum')
               .replace(/\bAVG\b/g, 'mean')
               .replace(/\bAVERAGE\b/g, 'mean')
               .replace(/\bMIN\b/g, 'min')
               .replace(/\bMAX\b/g, 'max')
               .replace(/\bCOUNT\b/g, 'length');
    return expr;
  }

  function fmt(x) {
    if (typeof x !== 'number') return String(x);
    if (Number.isInteger(x)) return String(x);
    return parseFloat(x.toPrecision(8)).toString();
  }

  GR.apps = GR.apps || {};
  GR.apps.tableur = {
    id:'tableur', name:'Tableur', icon:'⊞', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
