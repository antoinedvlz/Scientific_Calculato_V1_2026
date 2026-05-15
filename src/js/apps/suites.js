/**
 * apps/suites.js — Suites explicites et récurrentes.
 *
 * Explicite : u(n) en fonction de n.
 * Récurrente d'ordre 1 : u(n) = expr(u(n-1)), avec u(0) donné.
 * Récurrente d'ordre 2 : u(n) = expr(u(n-1), u(n-2)), avec u(0), u(1).
 *
 * Table de valeurs uniquement, sans grapheur. n est entier ≥ 0.
 */
(function (GR) {
  'use strict';

  const STORAGE = 'grace.suites.v1';
  let s = null;
  let elBody;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) { s = JSON.parse(raw); return; }
    } catch {}
    s = {
      kind: 'explicit',                  // 'explicit' | 'rec1' | 'rec2'
      expr: '2*n + 1',
      u0: 1, u1: 1,
      nMin: 0, nMax: 15,
    };
  }
  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(s)); } catch {} }

  function mount(container) {
    container.innerHTML = '';
    load();
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Suites</span>
      <span class="app-subtitle">explicites et récurrentes (table de valeurs)</span>
      <div class="app-tools">
        <div class="seg" id="k-seg">
          <button data-k="explicit" class="${s.kind==='explicit'?'active':''}">Explicite u(n)</button>
          <button data-k="rec1" class="${s.kind==='rec1'?'active':''}">Récurrente ordre 1</button>
          <button data-k="rec2" class="${s.kind==='rec2'?'active':''}">Récurrente ordre 2</button>
        </div>
      </div>
    `;
    container.appendChild(head);
    elBody = document.createElement('div');
    elBody.className = 'app-body';
    container.appendChild(elBody);

    head.querySelector('#k-seg').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-k]'); if (!b) return;
      s.kind = b.dataset.k; save();
      head.querySelectorAll('#k-seg button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render();
    });
    render();
  }
  function unmount() {}

  function render() {
    let extra = '';
    if (s.kind === 'explicit') {
      extra = `<label>u(n) =</label><input class="field" id="expr" value="${esc(s.expr)}">`;
    } else if (s.kind === 'rec1') {
      extra = `
        <label>u(0) =</label><input class="field" id="u0" value="${s.u0}">
        <label>u(n) =</label><input class="field" id="expr" value="${esc(s.expr)}" placeholder="ex: u + 2">
      `;
    } else {
      extra = `
        <label>u(0) =</label><input class="field" id="u0" value="${s.u0}">
        <label>u(1) =</label><input class="field" id="u1" value="${s.u1}">
        <label>u(n) =</label><input class="field" id="expr" value="${esc(s.expr)}" placeholder="ex: u + v">
      `;
    }
    elBody.innerHTML = `
      <div class="card" style="max-width:680px">
        <h3>Définition</h3>
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;align-items:center">
          ${extra}
        </div>
        ${s.kind !== 'explicit' ? `<p style="font-size:11px;color:var(--ink-3);margin-top:8px">
          Dans l'expression, <code>u</code> = u(n−1) ; ${s.kind==='rec2'?'<code>v</code> = u(n−2) ;':''} <code>n</code> = indice courant.
        </p>` : ''}
      </div>
      <div class="card" style="max-width:680px;margin-top:var(--s-3)">
        <h3>Intervalle d'indices</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end">
          <div><div style="font-size:11px;color:var(--ink-3)">n min</div><input class="field" id="nMin" value="${s.nMin}"></div>
          <div><div style="font-size:11px;color:var(--ink-3)">n max</div><input class="field" id="nMax" value="${s.nMax}"></div>
          <button class="btn primary" id="go">Calculer</button>
        </div>
      </div>
      <div id="tbl" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      s.expr = elBody.querySelector('#expr').value;
      if (elBody.querySelector('#u0')) s.u0 = parseFloat(elBody.querySelector('#u0').value);
      if (elBody.querySelector('#u1')) s.u1 = parseFloat(elBody.querySelector('#u1').value);
      s.nMin = parseInt(elBody.querySelector('#nMin').value, 10);
      s.nMax = parseInt(elBody.querySelector('#nMax').value, 10);
      save();
      renderTable();
    });
    renderTable();
  }

  function renderTable() {
    const tbl = elBody.querySelector('#tbl');
    const m = window.math;
    let row = '';
    try {
      const compiled = m.compile(s.expr);
      if (s.kind === 'explicit') {
        for (let n = s.nMin; n <= s.nMax; n++) {
          let v;
          try { v = compiled.evaluate({ n }); } catch { v = '⚠'; }
          row += `<tr><td class="num">${n}</td><td class="num">${fmt(v)}</td></tr>`;
        }
      } else if (s.kind === 'rec1') {
        let u = s.u0;
        for (let n = 0; n <= s.nMax; n++) {
          if (n >= s.nMin) row += `<tr><td class="num">${n}</td><td class="num">${fmt(u)}</td></tr>`;
          if (n < s.nMax) { try { u = compiled.evaluate({ u, n: n+1 }); } catch { u = NaN; } }
        }
      } else {
        let prev2 = s.u0, prev1 = s.u1;
        if (0 >= s.nMin) row += `<tr><td class="num">0</td><td class="num">${fmt(prev2)}</td></tr>`;
        if (1 >= s.nMin) row += `<tr><td class="num">1</td><td class="num">${fmt(prev1)}</td></tr>`;
        for (let n = 2; n <= s.nMax; n++) {
          let next;
          try { next = compiled.evaluate({ u:prev1, v:prev2, n }); } catch { next = NaN; }
          if (n >= s.nMin) row += `<tr><td class="num">${n}</td><td class="num">${fmt(next)}</td></tr>`;
          prev2 = prev1; prev1 = next;
        }
      }
    } catch (e) {
      tbl.innerHTML = `<div class="card" style="color:var(--bad)">Expression invalide : ${e.message}</div>`;
      return;
    }
    tbl.innerHTML = `<table class="gtable"><thead><tr><th>n</th><th>u(n)</th></tr></thead><tbody>${row}</tbody></table>`;
  }

  function fmt(x) {
    if (typeof x !== 'number') return String(x);
    if (Number.isInteger(x)) return String(x);
    return parseFloat(x.toPrecision(8)).toString();
  }
  function esc(s) { return (s||'').replace(/"/g, '&quot;'); }

  GR.apps = GR.apps || {};
  GR.apps.suites = {
    id:'suites', name:'Suites', icon:'uₙ', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
