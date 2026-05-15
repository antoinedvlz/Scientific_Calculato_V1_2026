/**
 * math-engine.js — Wrapper autour de math.js.
 *
 * Responsabilités :
 *   - Scope persistant de variables (ans, A..Z).
 *   - Mode angulaire (rad/deg) via override des fonctions trig dans le scope.
 *   - Alias francophones (pgcd, ppcm, frac).
 *   - Injection des constantes physiques (data/constants.js) dans le scope.
 *   - Évaluation d'expressions avec unités natives (math.js gère « 5 m + 3 cm »).
 */
(function (GR) {
  'use strict';

  let parser = null;
  let angleMode = 'rad';
  let nativeTrig = null;
  // On garde la liste des id de constantes pour pouvoir les exclure du
  // panneau "variables utilisateur" (qui ne montre que A..Z et ans).
  const constantIds = new Set();

  function ensureReady() {
    if (parser) return;
    if (!window.math) throw new Error('math.js non chargé');
    parser = window.math.parser();
    nativeTrig = {
      sin: window.math.sin, cos: window.math.cos, tan: window.math.tan,
      asin: window.math.asin, acos: window.math.acos, atan: window.math.atan,
      atan2: window.math.atan2,
    };
    installAliases();
    installConstants();
    applyAngleMode();
    restoreVarsFromState();
  }

  function installAliases() {
    parser.set('pgcd', (...a) => window.math.gcd(...a));
    parser.set('ppcm', (...a) => window.math.lcm(...a));
    parser.set('frac', x => window.math.subtract(x, window.math.floor(x)));
  }

  // Charge toutes les constantes (data/constants.js) dans le scope parser.
  // On évalue chaque chaîne « value » avec math.evaluate pour obtenir un
  // Unit, un BigNumber ou un nombre — selon ce que contient la chaîne.
  function installConstants() {
    if (!GR.data || !GR.data.constants) return;
    GR.data.constants.list.forEach(c => {
      // pi et e sont déjà natifs dans math.js — on les saute pour ne pas
      // shadow leur définition.
      if (c.id === 'pi_const' || c.id === 'e_const') return;
      try {
        const v = window.math.evaluate(c.value);
        parser.set(c.id, v);
        constantIds.add(c.id);
      } catch (e) {
        console.warn(`Constante ${c.id} non injectée :`, e.message);
      }
    });
  }

  function applyAngleMode() {
    const deg2rad = window.math.unit(1, 'deg').toNumber('rad');
    const rad2deg = 1 / deg2rad;
    if (angleMode === 'deg') {
      parser.set('sin',  x => nativeTrig.sin(x * deg2rad));
      parser.set('cos',  x => nativeTrig.cos(x * deg2rad));
      parser.set('tan',  x => nativeTrig.tan(x * deg2rad));
      parser.set('asin', x => nativeTrig.asin(x) * rad2deg);
      parser.set('acos', x => nativeTrig.acos(x) * rad2deg);
      parser.set('atan', x => nativeTrig.atan(x) * rad2deg);
      parser.set('atan2',(y,x)=> nativeTrig.atan2(y,x) * rad2deg);
    } else {
      parser.set('sin',  nativeTrig.sin);
      parser.set('cos',  nativeTrig.cos);
      parser.set('tan',  nativeTrig.tan);
      parser.set('asin', nativeTrig.asin);
      parser.set('acos', nativeTrig.acos);
      parser.set('atan', nativeTrig.atan);
      parser.set('atan2', nativeTrig.atan2);
    }
  }

  function setAngleMode(mode) {
    angleMode = (mode === 'deg') ? 'deg' : 'rad';
    if (parser) applyAngleMode();
  }
  function getAngleMode() { return angleMode; }

  // Évalue. Toujours résilient (jamais de throw vers l'appelant).
  function evaluate(expr) {
    ensureReady();
    const trimmed = (expr || '').trim();
    if (!trimmed) return { ok:false, error:'Expression vide' };

    let tex;
    try {
      tex = window.math.parse(trimmed).toTex({ parenthesis:'keep', implicit:'show' });
    } catch (e) {
      return { ok:false, error:e.message, expr:trimmed };
    }

    let result;
    try { result = parser.evaluate(trimmed); }
    catch (e) { return { ok:false, error:e.message, expr:trimmed, tex }; }

    if (result && result.entries) result = result.entries[result.entries.length - 1];
    if (typeof result === 'undefined') {
      return { ok:true, expr:trimmed, tex, result:null, resultLatex:'' };
    }
    parser.set('ans', result);

    const resultLatex = GR.latex.valueToLatex(result);
    syncVarsToState();
    return { ok:true, expr:trimmed, tex, result, resultLatex };
  }

  // ---------- Variables utilisateur ----------
  function isUserVarName(name) {
    if (constantIds.has(name)) return false;
    return /^[A-Z]$/.test(name) || name === 'ans';
  }

  function syncVarsToState() {
    if (!parser) return;
    const all = parser.getAll();
    const out = {};
    for (const k of Object.keys(all)) {
      if (!isUserVarName(k)) continue;
      try { out[k] = window.math.format(all[k], { precision: 14 }); } catch {}
    }
    GR.state.set({ vars: out });
  }

  function restoreVarsFromState() {
    const saved = GR.state.get().vars || {};
    for (const [name, value] of Object.entries(saved)) {
      try { parser.set(name, window.math.evaluate(value)); }
      catch (e) { console.warn(`Variable ${name} non restaurable :`, e.message); }
    }
  }

  function listVars() {
    if (!parser) return {};
    const all = parser.getAll();
    const out = {};
    for (const k of Object.keys(all)) if (isUserVarName(k)) out[k] = all[k];
    return out;
  }

  function clearVars() {
    if (!parser) return;
    for (const k of Object.keys(parser.getAll())) {
      if (isUserVarName(k)) parser.remove(k);
    }
    GR.state.set({ vars: {} });
  }

  // Helper : convertir une valeur (chaîne avec unité) vers une autre unité.
  // Renvoie { ok, valueLatex, valueText } ou { ok:false, error }.
  function convertUnit(value, fromUnit, toUnit) {
    ensureReady();
    try {
      const v = window.math.evaluate(`(${value} ${fromUnit}) to ${toUnit}`);
      return { ok:true, value:v, text:window.math.format(v, { precision:10 }) };
    } catch (e) {
      return { ok:false, error:e.message };
    }
  }

  GR.engine = {
    evaluate,
    setAngleMode, getAngleMode,
    listVars, clearVars,
    convertUnit,
    constantIds,   // exposé pour Réglages / debug
  };

})(window.GR = window.GR || {});
