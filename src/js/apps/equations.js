/**
 * apps/equations.js — Résolveur d'équations.
 *
 * Trois modes :
 *   - Linéaire / quadratique : saisie ax+b=0 ou ax²+bx+c=0 (formules fermées).
 *   - Polynôme : entrée des coefficients → racines via math.js (Aberth/eig).
 *   - Système linéaire : matrice A et vecteur b → résolution math.lusolve.
 *
 * On reste sur du numérique. Pour les racines symboliques, math.js a
 * math.simplify mais pas un solveur symbolique général.
 */
(function (GR) {
  'use strict';

  let mode = 'poly';
  let elBody;

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Équations</span>
      <span class="app-subtitle">linéaires, polynomiales, systèmes</span>
      <div class="app-tools">
        <div class="seg" id="eq-mode">
          <button data-m="poly" class="active">Polynôme</button>
          <button data-m="lin">Linéaire</button>
          <button data-m="quad">Quadratique</button>
          <button data-m="sys">Système</button>
        </div>
      </div>
    `;
    container.appendChild(head);
    elBody = document.createElement('div');
    elBody.className = 'app-body';
    container.appendChild(elBody);

    head.querySelector('#eq-mode').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-m]'); if (!b) return;
      mode = b.dataset.m;
      head.querySelectorAll('#eq-mode button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render();
    });
    render();
  }
  function unmount() {}

  function render() {
    if (mode === 'lin') renderLin();
    if (mode === 'quad') renderQuad();
    if (mode === 'poly') renderPoly();
    if (mode === 'sys') renderSys();
  }

  // ---- Linéaire ax + b = 0
  function renderLin() {
    elBody.innerHTML = `
      <p style="color:var(--ink-3);margin:0 0 var(--s-3)">Résolution de <em>ax + b = 0</em>.</p>
      <div class="card" style="display:grid;grid-template-columns:120px 1fr;gap:8px;align-items:center;max-width:520px">
        <label>a =</label><input class="field" id="a" value="2">
        <label>b =</label><input class="field" id="b" value="-6">
        <div></div><button class="btn primary" id="go">Résoudre</button>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const a = num('#a'), b = num('#b');
      const out = elBody.querySelector('#out');
      if (a === 0) {
        out.innerHTML = b === 0 ? card('Infinité de solutions (0 = 0).') : card('Aucune solution (b ≠ 0).');
      } else {
        const x = -b/a;
        out.innerHTML = card(`x = ${fmt(x)}`);
      }
    });
  }

  // ---- Quadratique ax² + bx + c = 0
  function renderQuad() {
    elBody.innerHTML = `
      <p style="color:var(--ink-3);margin:0 0 var(--s-3)">Résolution de <em>ax² + bx + c = 0</em> dans ℂ.</p>
      <div class="card" style="display:grid;grid-template-columns:120px 1fr;gap:8px;align-items:center;max-width:520px">
        <label>a =</label><input class="field" id="a" value="1">
        <label>b =</label><input class="field" id="b" value="-3">
        <label>c =</label><input class="field" id="c" value="2">
        <div></div><button class="btn primary" id="go">Résoudre</button>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const a = num('#a'), b = num('#b'), c = num('#c');
      const out = elBody.querySelector('#out');
      if (a === 0) { out.innerHTML = card('a = 0 : utilise le mode Linéaire.'); return; }
      const d = b*b - 4*a*c;
      let res;
      if (d > 0) {
        const sq = Math.sqrt(d);
        res = `Δ = ${fmt(d)} (deux racines réelles)
               <div class="res">x₁ = ${fmt((-b + sq)/(2*a))}</div>
               <div class="res">x₂ = ${fmt((-b - sq)/(2*a))}</div>`;
      } else if (d === 0) {
        res = `Δ = 0 (racine double)
               <div class="res">x = ${fmt(-b/(2*a))}</div>`;
      } else {
        const sq = Math.sqrt(-d);
        const re = -b/(2*a), im = sq/(2*a);
        res = `Δ = ${fmt(d)} (deux racines complexes)
               <div class="res">x₁ = ${fmt(re)} + ${fmt(im)}i</div>
               <div class="res">x₂ = ${fmt(re)} − ${fmt(im)}i</div>`;
      }
      out.innerHTML = `<div class="card">${res}</div>`;
    });
  }

  // ---- Polynôme général de degré n
  function renderPoly() {
    elBody.innerHTML = `
      <p style="color:var(--ink-3);margin:0 0 var(--s-3)">
        Entre les coefficients du plus haut degré au degré 0, séparés par des virgules.<br>
        Ex : <code>1, -6, 11, -6</code> pour <em>x³ − 6x² + 11x − 6</em>.
      </p>
      <div class="card" style="display:grid;gap:8px;max-width:600px">
        <input class="field" id="coefs" value="1, -6, 11, -6">
        <button class="btn primary" id="go">Trouver les racines</button>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const raw = elBody.querySelector('#coefs').value.trim();
      const out = elBody.querySelector('#out');
      const coefs = raw.split(',').map(s => parseFloat(s));
      if (coefs.some(isNaN) || coefs.length < 2) {
        out.innerHTML = card('Liste de coefficients invalide.', 'bad'); return;
      }
      // math.js : polynomialRoot existe en v13.
      try {
        let roots;
        if (typeof window.math.polynomialRoot === 'function') {
          // Format math.js : coef du degré 0 au degré n.
          roots = window.math.polynomialRoot(...coefs.slice().reverse());
          if (!Array.isArray(roots)) roots = [roots];
        } else {
          // Fallback : matrice compagnon + valeurs propres.
          roots = companionRoots(coefs);
        }
        const list = roots.map(r => `<div class="res">x = ${fmtRoot(r)}</div>`).join('');
        out.innerHTML = `<div class="card">${list || '<p>Aucune racine trouvée.</p>'}</div>`;
      } catch (e) {
        out.innerHTML = card('Erreur : ' + e.message, 'bad');
      }
    });
  }

  function companionRoots(coefs) {
    const n = coefs.length - 1;
    const a0 = coefs[0];
    // Construit la matrice compagnon n×n (forme "transposée" usuelle).
    const M = Array.from({length:n}, () => Array(n).fill(0));
    for (let i = 1; i < n; i++) M[i][i-1] = 1;
    for (let i = 0; i < n; i++) M[i][n-1] = -coefs[n-i] / a0;
    const eig = window.math.eigs(M, { precision: 1e-10 });
    return eig.values.toArray ? eig.values.toArray() : eig.values;
  }

  // ---- Système linéaire AX = B
  function renderSys() {
    elBody.innerHTML = `
      <p style="color:var(--ink-3);margin:0 0 var(--s-3)">
        Entre la matrice <strong>A</strong> (lignes séparées par des points-virgules, valeurs par virgules)
        et le vecteur <strong>B</strong>.
      </p>
      <div class="card" style="display:grid;grid-template-columns:80px 1fr;gap:8px;max-width:680px">
        <label>A =</label><input class="field" id="A" value="2,1,-1; -3,-1,2; -2,1,2">
        <label>B =</label><input class="field" id="B" value="8; -11; -3">
        <div></div><button class="btn primary" id="go">Résoudre</button>
      </div>
      <div id="out" style="margin-top:var(--s-4)"></div>
    `;
    elBody.querySelector('#go').addEventListener('click', () => {
      const Astr = elBody.querySelector('#A').value;
      const Bstr = elBody.querySelector('#B').value;
      const out = elBody.querySelector('#out');
      try {
        const A = parseMatrix(Astr);
        const B = parseMatrix(Bstr);
        const x = window.math.lusolve(A, B);
        const arr = x.toArray ? x.toArray() : x;
        const list = arr.map((row, i) => {
          const v = Array.isArray(row) ? row[0] : row;
          return `<div class="res">x<sub>${i+1}</sub> = ${fmt(v)}</div>`;
        }).join('');
        out.innerHTML = `<div class="card">${list}</div>`;
      } catch (e) {
        out.innerHTML = card('Erreur : ' + e.message, 'bad');
      }
    });
  }

  function parseMatrix(s) {
    return s.split(';').map(row => row.split(',').map(v => parseFloat(v.trim())));
  }

  // ---- Helpers communs
  function num(sel) { return parseFloat(elBody.querySelector(sel).value) || 0; }
  function card(html, kind) {
    return `<div class="card" style="color:${kind==='bad'?'var(--bad)':'inherit'}">${html}</div>`;
  }
  function fmt(x) {
    if (typeof x !== 'number') return String(x);
    if (Number.isInteger(x)) return String(x);
    return parseFloat(x.toPrecision(10)).toString();
  }
  function fmtRoot(r) {
    if (typeof r === 'object' && r !== null && 're' in r) {
      const re = r.re, im = r.im;
      if (Math.abs(im) < 1e-10) return fmt(re);
      return `${fmt(re)} ${im > 0 ? '+' : '−'} ${fmt(Math.abs(im))}i`;
    }
    return fmt(r);
  }

  GR.apps = GR.apps || {};
  GR.apps.equations = {
    id:'equations', name:'Équations', icon:'=', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
