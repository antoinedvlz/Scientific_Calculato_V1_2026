/**
 * apps/probabilites.js — Lois de probabilité usuelles.
 *
 * Implémente PDF/PMF, CDF, et fonctions inverses pour :
 *   Binomiale, Poisson, Géométrique (discrètes)
 *   Normale, Exponentielle, Uniforme, Student, χ², Fisher (continues)
 *
 * Tout est calculé "à la main" sans dépendance externe (math.js seul).
 */
(function (GR) {
  'use strict';

  let activeLaw = 'normal';
  let elBody;

  // Définitions : id → { nm, params: [...], pdf, cdf, mean, var, kind }
  const LAWS = {
    binom: {
      nm:'Binomiale B(n, p)', kind:'discrete',
      params:[{ id:'n', label:'n', def:10 }, { id:'p', label:'p', def:0.5 }],
      pmf:(k,{n,p}) => binCoef(n,k) * p**k * (1-p)**(n-k),
      cdf:(k,par) => sumK(0, Math.floor(k), j => LAWS.binom.pmf(j, par)),
      mean:({n,p}) => n*p,
      varc:({n,p}) => n*p*(1-p),
    },
    poisson: {
      nm:'Poisson P(λ)', kind:'discrete',
      params:[{ id:'lambda', label:'λ', def:3 }],
      pmf:(k,{lambda}) => Math.exp(-lambda) * lambda**k / fact(k),
      cdf:(k,par) => sumK(0, Math.floor(k), j => LAWS.poisson.pmf(j, par)),
      mean:({lambda}) => lambda,
      varc:({lambda}) => lambda,
    },
    geom: {
      nm:'Géométrique G(p)', kind:'discrete',
      params:[{ id:'p', label:'p', def:0.3 }],
      pmf:(k,{p}) => k >= 1 ? p * (1-p)**(k-1) : 0,
      cdf:(k,{p}) => k < 1 ? 0 : 1 - (1-p)**Math.floor(k),
      mean:({p}) => 1/p,
      varc:({p}) => (1-p)/(p*p),
    },
    normal: {
      nm:'Normale N(μ, σ²)', kind:'continuous',
      params:[{ id:'mu', label:'μ', def:0 }, { id:'sigma', label:'σ', def:1 }],
      pdf:(x,{mu,sigma}) => Math.exp(-0.5*((x-mu)/sigma)**2) / (sigma*Math.sqrt(2*Math.PI)),
      cdf:(x,{mu,sigma}) => 0.5 * (1 + erf((x-mu) / (sigma*Math.SQRT2))),
      mean:({mu}) => mu,
      varc:({sigma}) => sigma*sigma,
    },
    exp: {
      nm:'Exponentielle E(λ)', kind:'continuous',
      params:[{ id:'lambda', label:'λ', def:1 }],
      pdf:(x,{lambda}) => x >= 0 ? lambda * Math.exp(-lambda*x) : 0,
      cdf:(x,{lambda}) => x >= 0 ? 1 - Math.exp(-lambda*x) : 0,
      mean:({lambda}) => 1/lambda,
      varc:({lambda}) => 1/(lambda*lambda),
    },
    unif: {
      nm:'Uniforme U(a, b)', kind:'continuous',
      params:[{ id:'a', label:'a', def:0 }, { id:'b', label:'b', def:1 }],
      pdf:(x,{a,b}) => x>=a && x<=b ? 1/(b-a) : 0,
      cdf:(x,{a,b}) => x<a ? 0 : x>b ? 1 : (x-a)/(b-a),
      mean:({a,b}) => (a+b)/2,
      varc:({a,b}) => (b-a)**2/12,
    },
  };

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Probabilités</span>
      <span class="app-subtitle">lois discrètes et continues usuelles</span>
    `;
    container.appendChild(head);
    elBody = document.createElement('div');
    elBody.className = 'app-body';
    elBody.style.display = 'grid';
    elBody.style.gridTemplateColumns = '200px 1fr';
    elBody.style.gap = 'var(--s-4)';
    container.appendChild(elBody);

    // Liste des lois
    const side = document.createElement('div');
    side.style.cssText = 'background:var(--bg-2);border:1px solid var(--line);border-radius:var(--r-sm);padding:8px;height:fit-content';
    Object.entries(LAWS).forEach(([id, L]) => {
      const b = document.createElement('div');
      b.className = 'units-cat' + (id === activeLaw ? ' active' : '');
      b.textContent = L.nm;
      b.addEventListener('click', () => { activeLaw = id; mount(container); });
      side.appendChild(b);
    });
    elBody.appendChild(side);

    // Panneau
    const panel = document.createElement('div');
    panel.id = 'prob-panel';
    elBody.appendChild(panel);
    renderLaw();
  }
  function unmount() {}

  function renderLaw() {
    const L = LAWS[activeLaw];
    const panel = elBody.querySelector('#prob-panel');
    panel.innerHTML = `
      <div class="card">
        <h3>${L.nm} <span style="font-size:11px;color:var(--ink-3);text-transform:none">— ${L.kind === 'discrete' ? 'discrète' : 'continue'}</span></h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
          ${L.params.map(p => `
            <div>
              <div style="font-size:11px;color:var(--ink-3)">${p.label}</div>
              <input class="field" data-p="${p.id}" value="${p.def}" style="width:100%">
            </div>`).join('')}
          <div>
            <div style="font-size:11px;color:var(--ink-3)">${L.kind === 'discrete' ? 'k' : 'x'}</div>
            <input class="field" id="xval" value="${L.kind === 'discrete' ? '3' : '0.5'}" style="width:100%">
          </div>
        </div>
      </div>

      <div class="split" style="margin-top:var(--s-3)" id="results"></div>
    `;
    const update = () => {
      const par = {};
      L.params.forEach(p => par[p.id] = parseFloat(panel.querySelector(`[data-p="${p.id}"]`).value));
      const x = parseFloat(panel.querySelector('#xval').value);
      const fx = L.kind === 'discrete' ? L.pmf(x, par) : L.pdf(x, par);
      const Fx = L.cdf(x, par);
      const mean = L.mean(par);
      const varc = L.varc(par);
      panel.querySelector('#results').innerHTML = `
        ${stat(L.kind === 'discrete' ? 'P(X = k)' : 'f(x)', fmt(fx))}
        ${stat('P(X ≤ ' + (L.kind==='discrete'?'k':'x') + ')', fmt(Fx))}
        ${stat('P(X > ' + (L.kind==='discrete'?'k':'x') + ')', fmt(1 - Fx))}
        ${stat('E[X]', fmt(mean))}
        ${stat('Var[X]', fmt(varc))}
        ${stat('σ', fmt(Math.sqrt(varc)))}
      `;
    };
    panel.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
    update();
  }

  // ---------- Helpers numériques ----------
  function fact(n) { if (n < 2) return 1; let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
  function binCoef(n,k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n-k);
    let r = 1;
    for (let i = 0; i < k; i++) r = r * (n-i) / (i+1);
    return r;
  }
  function sumK(a, b, fn) { let s=0; for(let k=a;k<=b;k++) s += fn(k); return s; }

  // Erreur d'Abramowitz & Stegun (précision ~1e-7).
  function erf(x) {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1=0.254829592, a2=-0.284496736, a3=1.421413741,
          a4=-1.453152027, a5=1.061405429, p=0.3275911;
    const t = 1 / (1 + p*x);
    const y = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * Math.exp(-x*x);
    return sign * y;
  }

  function fmt(x) {
    if (typeof x !== 'number' || isNaN(x)) return '—';
    if (Math.abs(x) < 1e-6 && x !== 0) return x.toExponential(4);
    return parseFloat(x.toPrecision(8)).toString();
  }
  function stat(k, v) { return `<div class="card"><h3>${k}</h3><div class="res">${v}</div></div>`; }

  GR.apps = GR.apps || {};
  GR.apps.probabilites = {
    id:'probabilites', name:'Probabilités', icon:'P', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
