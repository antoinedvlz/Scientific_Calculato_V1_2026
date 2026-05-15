/**
 * apps/statistiques.js — Statistiques 1 et 2 variables.
 *
 * 1 variable : table de valeurs (+ effectifs optionnels) → moyenne,
 *   médiane, écart-type (n et n−1), min/max/Q1/Q3, IQR, somme, variance.
 * 2 variables : couples (x, y) → covariance, corrélation, droite de
 *   régression linéaire y = a x + b et R².
 */
(function (GR) {
  'use strict';

  let mode = '1var';
  let elBody;

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Statistiques</span>
      <span class="app-subtitle">une ou deux variables</span>
      <div class="app-tools">
        <div class="seg" id="st-mode">
          <button data-m="1var" class="active">1 variable</button>
          <button data-m="2var">2 variables</button>
        </div>
      </div>
    `;
    container.appendChild(head);
    elBody = document.createElement('div');
    elBody.className = 'app-body';
    container.appendChild(elBody);

    head.querySelector('#st-mode').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-m]'); if (!b) return;
      mode = b.dataset.m;
      head.querySelectorAll('#st-mode button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render();
    });
    render();
  }
  function unmount() {}

  function render() { mode === '1var' ? render1() : render2(); }

  function render1() {
    elBody.innerHTML = `
      <div class="card" style="max-width:680px">
        <h3>Données (séparées par virgules ou espaces)</h3>
        <input class="field" id="data" value="3, 7, 7, 8, 9, 12, 13, 14, 18, 21" style="width:100%">
        <div style="display:flex;gap:8px;margin-top:8px">
          <input class="field" id="freq" placeholder="Effectifs (optionnel, mêmes longueurs)" style="flex:1">
          <button class="btn primary" id="go">Calculer</button>
        </div>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const xs = parseList(elBody.querySelector('#data').value);
      const fs = parseList(elBody.querySelector('#freq').value);
      const out = elBody.querySelector('#out');
      if (!xs.length) { out.innerHTML = err('Pas de données.'); return; }
      const data = (fs.length === xs.length)
        ? expand(xs, fs)
        : xs;
      out.innerHTML = stats1(data);
    });
  }

  function stats1(arr) {
    const m = window.math;
    const sorted = arr.slice().sort((a,b) => a-b);
    const n = arr.length;
    const sum = arr.reduce((a,b) => a+b, 0);
    const mean = sum / n;
    const variance = arr.reduce((s,x) => s + (x-mean)**2, 0) / n;
    const varN_1 = n > 1 ? arr.reduce((s,x) => s + (x-mean)**2, 0) / (n-1) : NaN;
    const std = Math.sqrt(variance);
    const stdN_1 = Math.sqrt(varN_1);
    const median = sorted[Math.floor(n/2)] * (n%2 ? 1 : 0.5) + (n%2 ? 0 : sorted[n/2 - 1] * 0.5);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    return `
      <div class="split">
        ${stat('Effectif n', n)}
        ${stat('Somme Σx', fmt(sum))}
        ${stat('Moyenne x̄', fmt(mean))}
        ${stat('Médiane', fmt(median))}
        ${stat('Min / Max', `${fmt(sorted[0])}  /  ${fmt(sorted[n-1])}`)}
        ${stat('Q1 / Q3', `${fmt(q1)}  /  ${fmt(q3)}`)}
        ${stat('IQR', fmt(q3-q1))}
        ${stat('Variance (σ²)', fmt(variance))}
        ${stat('Écart-type σ (n)', fmt(std))}
        ${stat('Écart-type s (n−1)', fmt(stdN_1))}
      </div>
    `;
  }

  function render2() {
    elBody.innerHTML = `
      <div class="card" style="max-width:680px">
        <h3>Couples (x, y)</h3>
        <div style="display:grid;grid-template-columns:60px 1fr;gap:8px;align-items:center">
          <label>x =</label><input class="field" id="xs" value="1, 2, 3, 4, 5">
          <label>y =</label><input class="field" id="ys" value="2.1, 4.0, 6.2, 7.9, 10.1">
        </div>
        <button class="btn primary" id="go" style="margin-top:8px">Régresser</button>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const xs = parseList(elBody.querySelector('#xs').value);
      const ys = parseList(elBody.querySelector('#ys').value);
      const out = elBody.querySelector('#out');
      if (xs.length !== ys.length || !xs.length) { out.innerHTML = err('Les deux listes doivent avoir la même taille.'); return; }
      out.innerHTML = stats2(xs, ys);
    });
  }

  function stats2(xs, ys) {
    const n = xs.length;
    const mx = xs.reduce((a,b)=>a+b,0)/n;
    const my = ys.reduce((a,b)=>a+b,0)/n;
    let sxx=0, syy=0, sxy=0;
    for (let i=0; i<n; i++) {
      sxx += (xs[i]-mx)**2;
      syy += (ys[i]-my)**2;
      sxy += (xs[i]-mx)*(ys[i]-my);
    }
    const cov = sxy/n;
    const corr = sxy / Math.sqrt(sxx*syy);
    const a = sxy/sxx;
    const b = my - a*mx;
    const r2 = corr*corr;
    return `
      <div class="split">
        ${stat('n', n)}
        ${stat('Moyennes x̄ / ȳ', `${fmt(mx)}  /  ${fmt(my)}`)}
        ${stat('Covariance', fmt(cov))}
        ${stat('Corrélation r', fmt(corr))}
        ${stat('Coeff. R²', fmt(r2))}
        ${stat('Régression', `y = ${fmt(a)} x + ${fmt(b)}`)}
      </div>
    `;
  }

  function expand(xs, fs) {
    const out = [];
    for (let i = 0; i < xs.length; i++) for (let j = 0; j < fs[i]; j++) out.push(xs[i]);
    return out;
  }
  function quantile(sorted, p) {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }
  function parseList(s) {
    if (!s.trim()) return [];
    return s.split(/[,\s]+/).map(Number).filter(x => !isNaN(x));
  }
  function fmt(x) {
    if (typeof x !== 'number') return String(x);
    if (Number.isInteger(x)) return String(x);
    return parseFloat(x.toPrecision(8)).toString();
  }
  function stat(k, v) { return `<div class="card"><h3>${k}</h3><div class="res">${v}</div></div>`; }
  function err(m) { return `<div class="card" style="color:var(--bad)">${m}</div>`; }

  GR.apps = GR.apps || {};
  GR.apps.statistiques = {
    id:'statistiques', name:'Statistiques', icon:'σ', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
