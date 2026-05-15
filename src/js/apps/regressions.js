/**
 * apps/regressions.js — Ajustements de modèles à des données (x, y).
 *
 * Modèles :
 *   - linéaire        : y = a x + b
 *   - affine pondéré  : y = a x + b (idem ; gardé en alias)
 *   - polynomiale     : y = sum a_k x^k (degré au choix)
 *   - puissance       : y = a x^b           (log-log)
 *   - exponentielle   : y = a e^(bx)        (log linéaire en y)
 *   - logarithmique   : y = a + b ln(x)
 *
 * Les modèles non linéaires sont linéarisés par changement de variable
 * puis ajustés par moindres carrés.
 */
(function (GR) {
  'use strict';

  const MODELS = [
    ['lin',  'Linéaire (y = a x + b)'],
    ['poly', 'Polynomiale (degré n)'],
    ['pow',  'Puissance (y = a · x^b)'],
    ['exp',  'Exponentielle (y = a · e^{b x})'],
    ['log',  'Logarithmique (y = a + b · ln x)'],
  ];

  let model = 'lin';
  let elBody;

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Régressions</span>
      <span class="app-subtitle">moindres carrés (linéarisations gérées en interne)</span>
      <div class="app-tools">
        <div class="seg" id="m-seg">
          ${MODELS.map(([id, nm], i) =>
            `<button data-m="${id}" ${i===0?'class="active"':''}>${nm.split(' ')[0]}</button>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(head);
    elBody = document.createElement('div');
    elBody.className = 'app-body';
    container.appendChild(elBody);

    head.querySelector('#m-seg').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-m]'); if (!b) return;
      model = b.dataset.m;
      head.querySelectorAll('#m-seg button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render();
    });
    render();
  }
  function unmount() {}

  function render() {
    elBody.innerHTML = `
      <div class="card" style="max-width:680px">
        <h3>Données (couples x, y)</h3>
        <div style="display:grid;grid-template-columns:60px 1fr;gap:8px;align-items:center">
          <label>x =</label><input class="field" id="xs" value="1,2,3,4,5,6,7,8">
          <label>y =</label><input class="field" id="ys" value="2.1,4.0,8.9,16.1,25.2,36.0,49.1,63.9">
        </div>
        ${model === 'poly' ? `<div style="display:grid;grid-template-columns:60px 1fr;gap:8px;margin-top:8px"><label>degré</label><input class="field" id="deg" value="2"></div>` : ''}
        <button class="btn primary" id="go" style="margin-top:8px">Ajuster</button>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const xs = parseList(elBody.querySelector('#xs').value);
      const ys = parseList(elBody.querySelector('#ys').value);
      const out = elBody.querySelector('#out');
      if (xs.length !== ys.length || xs.length < 2) { out.innerHTML = err('Listes invalides.'); return; }
      try {
        if (model === 'lin')   return show(out, fitLinear(xs, ys));
        if (model === 'poly')  return show(out, fitPoly(xs, ys, parseInt(elBody.querySelector('#deg').value, 10)));
        if (model === 'pow')   return show(out, fitPower(xs, ys));
        if (model === 'exp')   return show(out, fitExp(xs, ys));
        if (model === 'log')   return show(out, fitLog(xs, ys));
      } catch (e) {
        out.innerHTML = err(e.message);
      }
    });
  }

  function show(out, r) {
    const { eq, params, r2, residual } = r;
    out.innerHTML = `
      <div class="split">
        <div class="card"><h3>Équation</h3><div class="res">${eq}</div></div>
        <div class="card"><h3>R²</h3><div class="res">${fmt(r2)}</div></div>
      </div>
      <div class="card" style="margin-top:var(--s-3)">
        <h3>Coefficients</h3>
        <div style="font-family:var(--font-mono);font-size:13px">${
          Object.entries(params).map(([k,v]) => `${k} = ${fmt(v)}`).join('  ·  ')
        }</div>
        ${residual ? `<div style="margin-top:8px;font-size:11px;color:var(--ink-3)">Somme des résidus² = ${fmt(residual)}</div>` : ''}
      </div>
    `;
  }

  // ---- Moindres carrés linéaire
  function fitLinear(xs, ys) {
    const n = xs.length;
    const mx = mean(xs), my = mean(ys);
    let sxx=0, sxy=0;
    for (let i=0;i<n;i++){ sxx += (xs[i]-mx)**2; sxy += (xs[i]-mx)*(ys[i]-my); }
    const a = sxy/sxx, b = my - a*mx;
    return wrapFit(xs, ys, x => a*x + b, { a, b }, `y = ${fmt(a)} · x + ${fmt(b)}`);
  }

  // ---- Polynômes : résolution normale équations via math.js
  function fitPoly(xs, ys, deg) {
    const n = xs.length;
    const m = window.math;
    // Matrice de Vandermonde
    const X = xs.map(x => Array.from({length:deg+1}, (_,k) => x**k));
    const XT = m.transpose(X);
    const A = m.multiply(XT, X);
    const B = m.multiply(XT, ys);
    const coefs = m.lusolve(A, B).map(r => r[0] || r);
    const fy = x => coefs.reduce((s, c, k) => s + c * x**k, 0);
    const eq = coefs.map((c, k) => `${fmt(c)}·x^${k}`).reverse().join(' + ');
    const params = {};
    coefs.forEach((c, k) => params[`a_${k}`] = c);
    return wrapFit(xs, ys, fy, params, 'y = ' + eq);
  }

  function fitPower(xs, ys) {
    if (xs.some(x => x <= 0) || ys.some(y => y <= 0)) throw new Error('Puissance : x et y doivent être > 0.');
    const lx = xs.map(Math.log), ly = ys.map(Math.log);
    const r = fitLinear(lx, ly);
    const b = r.params.a, a = Math.exp(r.params.b);
    return wrapFit(xs, ys, x => a * x**b, { a, b }, `y = ${fmt(a)} · x^{${fmt(b)}}`);
  }
  function fitExp(xs, ys) {
    if (ys.some(y => y <= 0)) throw new Error('Exponentielle : y doit être > 0.');
    const ly = ys.map(Math.log);
    const r = fitLinear(xs, ly);
    const b = r.params.a, a = Math.exp(r.params.b);
    return wrapFit(xs, ys, x => a * Math.exp(b*x), { a, b }, `y = ${fmt(a)} · e^{${fmt(b)}·x}`);
  }
  function fitLog(xs, ys) {
    if (xs.some(x => x <= 0)) throw new Error('Logarithmique : x doit être > 0.');
    const lx = xs.map(Math.log);
    const r = fitLinear(lx, ys);
    return wrapFit(xs, ys, x => r.params.b + r.params.a * Math.log(x),
      { a:r.params.b, b:r.params.a }, `y = ${fmt(r.params.b)} + ${fmt(r.params.a)} · ln(x)`);
  }

  function wrapFit(xs, ys, fy, params, eq) {
    const my = mean(ys);
    let ssr = 0, sst = 0;
    for (let i = 0; i < xs.length; i++) {
      ssr += (ys[i] - fy(xs[i]))**2;
      sst += (ys[i] - my)**2;
    }
    return { eq, params, r2: 1 - ssr/sst, residual: ssr };
  }
  function mean(a) { return a.reduce((s,x)=>s+x,0)/a.length; }
  function parseList(s) { return s.split(/[,\s]+/).map(Number).filter(x => !isNaN(x)); }
  function fmt(x) {
    if (typeof x !== 'number') return String(x);
    if (Number.isInteger(x)) return String(x);
    return parseFloat(x.toPrecision(8)).toString();
  }
  function err(m) { return `<div class="card" style="color:var(--bad)">${m}</div>`; }

  GR.apps = GR.apps || {};
  GR.apps.regressions = {
    id:'regressions', name:'Régressions', icon:'⤢', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
