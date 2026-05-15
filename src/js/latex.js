/**
 * latex.js — Petit wrapper autour de KaTeX.
 *
 * Deux usages :
 *   - render(target, tex)           → rend le LaTeX final dans un élément.
 *   - exprToLatex(expr) → string|null → essaie de convertir une expression
 *     math.js en LaTeX (sert à l'aperçu live au-dessus de la zone de saisie).
 */
(function (GR) {
  'use strict';

  function render(target, tex, opts) {
    if (!window.katex) {
      target.textContent = tex;
      return;
    }
    try {
      window.katex.render(tex, target, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        ...opts,
      });
    } catch (e) {
      // Filet de sécurité : on n'a pas envie qu'une erreur LaTeX casse la page.
      target.textContent = tex;
    }
  }

  // Convertit une expression utilisateur en LaTeX via math.js.
  // Retourne null si la saisie n'est pas (encore) parsable — l'UI affichera
  // alors la chaîne brute en mode "code".
  function exprToLatex(expr) {
    if (!window.math) return null;
    if (!expr || !expr.trim()) return null;
    try {
      const node = window.math.parse(expr);
      // toTex({ parenthesis: 'keep' }) garde les parenthèses telles qu'écrites.
      return node.toTex({ parenthesis: 'keep', implicit: 'show' });
    } catch (e) {
      return null;
    }
  }

  // Convertit un résultat (number, Complex, BigNumber, Unit…) en LaTeX.
  function valueToLatex(value) {
    if (!window.math) return String(value);
    try {
      // math.format gère proprement la précision et les types spéciaux.
      const formatted = window.math.format(value, { precision: 12 });
      // On reparse le résultat formaté pour obtenir un LaTeX propre.
      return window.math.parse(formatted).toTex({ parenthesis: 'keep' });
    } catch {
      return String(value);
    }
  }

  GR.latex = { render, exprToLatex, valueToLatex };

})(window.GR = window.GR || {});
