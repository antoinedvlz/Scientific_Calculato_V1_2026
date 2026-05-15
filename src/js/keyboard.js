/**
 * keyboard.js — Raccourcis clavier globaux.
 *
 * On centralise les raccourcis ici pour pouvoir les afficher dans la sidebar
 * et éviter les conflits entre apps. Une app peut ajouter ses propres
 * raccourcis locaux dans son mount(), mais le routeur d'apps reste maître.
 */
(function (GR) {
  'use strict';

  // Liste des raccourcis globaux. Chaque entrée :
  //   { combo: 'Ctrl+1', label: 'Calculs', handler: () => ... }
  const handlers = [];

  function register(combo, label, handler) {
    handlers.push({ combo, label, handler });
  }

  // Convertit un évènement clavier en chaîne canonique : "Ctrl+Shift+K"
  function eventToCombo(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl'); // on traite Cmd ≡ Ctrl
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    // Touches lettres/chiffres : on prend la valeur "key" en majuscule.
    let k = e.key;
    if (k === 'Escape') k = 'Esc';
    if (k.length === 1) k = k.toUpperCase();
    parts.push(k);
    return parts.join('+');
  }

  function init() {
    window.addEventListener('keydown', (e) => {
      const combo = eventToCombo(e);
      // On ignore les raccourcis simples si l'utilisateur tape dans un input.
      // Mais on autorise les Ctrl+xxx même dans un input (ex : Ctrl+1).
      const inField = e.target.matches?.('input, textarea, [contenteditable="true"]');
      const isModified = e.ctrlKey || e.metaKey || e.altKey;

      for (const h of handlers) {
        if (h.combo === combo) {
          if (inField && !isModified && h.combo !== 'Esc') continue;
          e.preventDefault();
          h.handler();
          return;
        }
      }
    });
  }

  function list() { return handlers.slice(); }

  GR.keyboard = { register, init, list };

})(window.GR = window.GR || {});
