/**
 * state.js — Store global + persistance localStorage.
 *
 * Pattern : "store" minimaliste. On garde un objet d'état mutable, on déclenche
 * save() après chaque changement, et les composants peuvent s'abonner via
 * subscribe() pour réagir aux changements.
 *
 * Pourquoi pas Redux/etc. : surdimensionné pour un projet single-file. Cette
 * approche tient en 60 lignes et fait le travail.
 */
(function (GR) {
  'use strict';

  const STORAGE_KEY = 'grace.state.v1';

  // État par défaut. Toute nouvelle clé doit être ajoutée ici.
  const DEFAULT = {
    theme: 'light',          // 'light' | 'dark'
    currentApp: 'calculs',   // id de l'app affichée
    angleMode: 'rad',        // 'rad' | 'deg' (mode trigonométrique)
    history: [],             // [{ expr, latex, result, resultLatex, isError, ts }]
    vars: {},                // variables utilisateur sérialisées { A: 5, B: ... }
    vkbOpen: false,          // clavier virtuel visible ?
  };

  // Charge le state depuis localStorage, fusionne avec DEFAULT (au cas où on
  // ajoute des clés dans une future version sans casser les sauvegardes).
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT, ...parsed };
    } catch (e) {
      console.warn('Impossible de charger le state, reset.', e);
      return { ...DEFAULT };
    }
  }

  const state = load();
  const subscribers = new Set();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Quota dépassé : on tronque l'historique au pire des cas.
      console.warn('Sauvegarde échouée, tentative de nettoyage.', e);
      state.history = state.history.slice(-50);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    }
  }

  // Met à jour l'état (patch superficiel) et notifie les abonnés.
  function set(patch) {
    Object.assign(state, patch);
    save();
    subscribers.forEach(fn => fn(state));
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  // Helpers ciblés pour l'historique (évite de dupliquer Array.prototype.push partout).
  function pushHistory(entry) {
    state.history.push({ ts: Date.now(), ...entry });
    // Garde-fou : limiter à 500 entrées max pour éviter ballonnement localStorage.
    if (state.history.length > 500) state.history.shift();
    save();
    subscribers.forEach(fn => fn(state));
  }

  function clearHistory() {
    state.history = [];
    save();
    subscribers.forEach(fn => fn(state));
  }

  GR.state = {
    get: () => state,
    set,
    subscribe,
    pushHistory,
    clearHistory,
    save,
  };

})(window.GR = window.GR || {});
