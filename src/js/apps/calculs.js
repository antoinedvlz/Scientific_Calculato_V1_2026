/**
 * apps/calculs.js — Application "Calculs".
 *
 * Supporte directement les unités (math.js le fait nativement) et les
 * constantes physiques (injectées via data/constants.js).
 *
 * Exemples utilisables :
 *   2*sin(pi/4) + sqrt(2)
 *   (1/2) * 2 kg * (3 m/s)^2   →  9 J  (analyse dimensionnelle gratuite)
 *   c * 1 ns to mm             →  299.79… mm
 *   h * 5e14 Hz to eV          →  énergie d'un photon visible
 *   N_A * k_B                  →  R (constante des gaz)
 *   3 m + 25 cm                →  3.25 m
 *   A = 5,  A^2 + 3            →  28
 */
(function (GR) {
  'use strict';

  const VKB_SECTIONS = [
    { title:'Nombres & opérateurs', keys:[
      ['7','7'],['8','8'],['9','9'],['÷','/'],
      ['4','4'],['5','5'],['6','6'],['×','*'],
      ['1','1'],['2','2'],['3','3'],['−','-'],
      ['0','0'],['.','.'],['(','('],[')',')'],
      ['+','+'],['^','^'],['=','='],['ans','ans'],
    ]},
    { title:'Fonctions', keys:[
      ['sin','sin('],['cos','cos('],['tan','tan('],['π','pi'],
      ['asin','asin('],['acos','acos('],['atan','atan('],['e','e'],
      ['ln','ln('],['log','log10('],['exp','exp('],['√','sqrt('],
      ['x²','^2'],['xⁿ','^'],['1/x','1/'],['|x|','abs('],
      ['n!','!'],['mod','mod'],['⌊⌋','floor('],['⌈⌉','ceil('],
    ]},
    { title:'Unités usuelles', keys:[
      ['m','m'],['cm','cm'],['mm','mm'],['km','km'],
      ['kg','kg'],['g','g'],['s','s'],['Hz','Hz'],
      ['N','N'],['J','J'],['W','W'],['Pa','Pa'],
      ['V','V'],['A','A'],['Ω','ohm'],['°C','degC'],
      ['to','to'],['°','deg'],['rad','rad'],['eV','eV'],
    ]},
    { title:'Constantes', keys:[
      ['c','c'],['h','h'],['ℏ','hbar'],['G','G_const'],
      ['e⁻','e_charge'],['k_B','k_B'],['N_A','N_A'],['R','R_gas'],
      ['ε₀','epsilon_0'],['μ₀','mu_0'],['mₑ','m_e'],['m_p','m_p'],
      ['g₀','g_0'],['σ','sigma_SB'],['α','alpha'],['φ','phi'],
    ]},
    { title:'Variables', keys:[
      ['A','A'],['B','B'],['C','C'],['D','D'],
      ['X','X'],['Y','Y'],['Z','Z'],['ans','ans'],
    ]},
  ];

  let elInput, elPreview, elHistory, elVarsPanel, elAngleToggle;
  let unsubscribe = null;
  let histCursor = -1;

  function mount(container) {
    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = `
      <span class="app-title">Calculs</span>
      <span class="app-subtitle">unités &amp; constantes prises en charge</span>
      <div class="app-tools">
        <div class="seg" aria-label="Mode angulaire">
          <button data-mode="rad">RAD</button>
          <button data-mode="deg">DEG</button>
        </div>
        <button class="btn danger" id="clear-history" title="Effacer l'historique">Effacer</button>
      </div>
    `;
    container.appendChild(header);
    elAngleToggle = header.querySelector('.seg');
    elAngleToggle.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-mode]'); if (!b) return;
      GR.engine.setAngleMode(b.dataset.mode);
      GR.state.set({ angleMode: b.dataset.mode });
      updateAngleToggle();
    });
    header.querySelector('#clear-history').addEventListener('click', () => {
      if (confirm('Effacer tout l\'historique ?')) GR.state.clearHistory();
    });

    const body = document.createElement('div');
    body.className = 'calculs-body';
    body.innerHTML = `
      <div class="history" id="history"></div>
      <div class="vars-panel" id="vars-panel"></div>
      <div class="input-area">
        <div class="input-preview empty" id="input-preview">Tapez une expression…</div>
        <div class="input-row">
          <input type="text" class="input-line" id="input-line"
                 autocomplete="off" autocorrect="off" autocapitalize="off"
                 spellcheck="false" placeholder="ex : (1/2) * 2 kg * (3 m/s)^2">
          <button class="btn primary" id="btn-eval">Entrée ⏎</button>
        </div>
      </div>
    `;
    container.appendChild(body);

    elInput     = body.querySelector('#input-line');
    elPreview   = body.querySelector('#input-preview');
    elHistory   = body.querySelector('#history');
    elVarsPanel = body.querySelector('#vars-panel');

    elInput.addEventListener('input', updatePreview);
    elInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')     { e.preventDefault(); doEval(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); navigateHistory(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); navigateHistory(+1); }
    });
    body.querySelector('#btn-eval').addEventListener('click', doEval);

    unsubscribe = GR.state.subscribe(() => {
      renderHistory(); renderVars(); updateAngleToggle();
    });
    updateAngleToggle();
    renderHistory();
    renderVars();
    setTimeout(() => elInput.focus(), 0);
  }

  function unmount() { if (unsubscribe) { unsubscribe(); unsubscribe = null; } }

  function updateAngleToggle() {
    const mode = GR.engine.getAngleMode();
    elAngleToggle.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  }

  function updatePreview() {
    const expr = elInput.value;
    if (!expr.trim()) {
      elPreview.className = 'input-preview empty';
      elPreview.textContent = 'Tapez une expression…';
      return;
    }
    const tex = GR.latex.exprToLatex(expr);
    if (tex === null) {
      elPreview.className = 'input-preview error';
      elPreview.textContent = expr;
    } else {
      elPreview.className = 'input-preview';
      GR.latex.render(elPreview, tex);
    }
  }

  function navigateHistory(direction) {
    const hist = GR.state.get().history;
    if (!hist.length) return;
    if (histCursor === -1 && direction < 0) histCursor = hist.length;
    histCursor = Math.max(0, Math.min(hist.length, histCursor + direction));
    if (histCursor === hist.length) elInput.value = '';
    else elInput.value = hist[histCursor].expr;
    updatePreview();
  }

  function doEval() {
    const expr = elInput.value;
    if (!expr.trim()) return;
    const r = GR.engine.evaluate(expr);
    if (!r.ok) {
      GR.state.pushHistory({ expr, latex:r.tex||null, isError:true, error:r.error });
    } else {
      GR.state.pushHistory({
        expr:r.expr, latex:r.tex,
        result: typeof r.result === 'object' ? null : r.result,
        resultLatex: r.resultLatex,
        isError:false,
      });
    }
    elInput.value = '';
    histCursor = -1;
    updatePreview();
  }

  function renderHistory() {
    const hist = GR.state.get().history;
    elHistory.innerHTML = '';
    if (!hist.length) {
      const empty = document.createElement('div');
      empty.className = 'history-empty';
      empty.innerHTML = `
        <p>Tape une expression. Quelques pistes :</p>
        <div class="tips">
          <div>2*sin(pi/4) + sqrt(2)</div>
          <div>3 m + 25 cm</div>
          <div>(1/2) * 2 kg * (3 m/s)^2</div>
          <div>c * 1 ns to mm</div>
          <div>h * 5e14 Hz to eV</div>
          <div>A = 5,  A^2 + 3</div>
        </div>`;
      elHistory.appendChild(empty);
      return;
    }
    for (let i = hist.length - 1; i >= 0; i--) {
      elHistory.appendChild(renderEntry(hist[i]));
    }
  }

  function renderEntry(entry) {
    const div = document.createElement('div');
    div.className = 'hist-entry';
    const inp = document.createElement('div');
    inp.className = 'hist-input';
    inp.title = 'Cliquer pour réutiliser';
    if (entry.latex) GR.latex.render(inp, entry.latex);
    else inp.textContent = entry.expr;
    inp.addEventListener('click', () => {
      elInput.value = entry.expr; elInput.focus(); updatePreview();
    });
    div.appendChild(inp);

    if (entry.isError) {
      const err = document.createElement('div');
      err.className = 'hist-error';
      err.textContent = '⚠ ' + entry.error;
      div.appendChild(err);
    } else {
      const out = document.createElement('div');
      out.className = 'hist-output';
      out.title = 'Cliquer pour insérer';
      if (entry.resultLatex) GR.latex.render(out, '= ' + entry.resultLatex);
      else out.textContent = '= ' + (entry.result ?? '');
      out.addEventListener('click', () => {
        insertAtCursor(elInput, '(' + entry.expr + ')');
        elInput.focus(); updatePreview();
      });
      div.appendChild(out);
    }
    return div;
  }

  function renderVars() {
    const vars = GR.state.get().vars || {};
    elVarsPanel.innerHTML = '';
    const keys = Object.keys(vars).sort();
    if (!keys.length) {
      elVarsPanel.innerHTML = '<span style="opacity:.6">Aucune variable. Tape « A = 5 » pour en créer.</span>';
      return;
    }
    keys.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'var-chip';
      chip.textContent = `${k} = ${vars[k]}`;
      chip.title = `Insérer « ${k} »`;
      chip.addEventListener('click', () => {
        insertAtCursor(elInput, k); elInput.focus(); updatePreview();
      });
      elVarsPanel.appendChild(chip);
    });
  }

  function renderVKB(container) {
    container.innerHTML = '';
    VKB_SECTIONS.forEach(sec => {
      const s = document.createElement('div');
      s.className = 'vkb-section';
      const h = document.createElement('h4');
      h.textContent = sec.title;
      s.appendChild(h);
      const grid = document.createElement('div');
      grid.className = 'vkb-grid';
      sec.keys.forEach(([label, value]) => {
        const b = document.createElement('button');
        b.className = 'vkb-key';
        b.textContent = label;
        b.addEventListener('click', () => {
          if (!elInput) return;
          insertAtCursor(elInput, value);
          elInput.focus(); updatePreview();
        });
        grid.appendChild(b);
      });
      s.appendChild(grid);
      container.appendChild(s);
    });
  }

  function insertAtCursor(input, text) {
    const s = input.selectionStart ?? input.value.length;
    const e = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, s) + text + input.value.slice(e);
    input.setSelectionRange(s + text.length, s + text.length);
  }

  GR.apps = GR.apps || {};
  GR.apps.calculs = {
    id:'calculs', name:'Calculs', icon:'∑', available:true,
    mount, unmount, renderVKB,
  };

})(window.GR = window.GR || {});
