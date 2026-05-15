/**
 * apps/reglages.js — Réglages globaux.
 *
 * - Thème clair / sombre (synchronisé avec le bouton de la sidebar)
 * - Mode angulaire par défaut
 * - Précision d'affichage
 * - Réinitialiser : variables, historique, ou tout l'état
 * - Infos sur l'app
 */
(function (GR) {
  'use strict';

  function mount(container) {
    container.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-header';
    head.innerHTML = `
      <span class="app-title">Réglages</span>
      <span class="app-subtitle">préférences locales (stockées dans ton navigateur)</span>
    `;
    container.appendChild(head);

    const body = document.createElement('div');
    body.className = 'settings';
    body.innerHTML = `
      <div class="group">
        <h3>Apparence</h3>
        <div class="row">
          <div>
            <div class="lbl">Thème</div>
            <div class="hlp">Bascule aussi avec <kbd>Ctrl</kbd>+<kbd>T</kbd>.</div>
          </div>
          <div class="seg" id="seg-theme">
            <button data-v="light">Clair</button>
            <button data-v="dark">Sombre</button>
          </div>
        </div>
      </div>

      <div class="group">
        <h3>Calculs</h3>
        <div class="row">
          <div>
            <div class="lbl">Mode angulaire par défaut</div>
            <div class="hlp">Modifiable à la volée dans l'app Calculs.</div>
          </div>
          <div class="seg" id="seg-angle">
            <button data-v="rad">RAD</button>
            <button data-v="deg">DEG</button>
          </div>
        </div>
      </div>

      <div class="group">
        <h3>Données</h3>
        <div class="row">
          <div>
            <div class="lbl">Effacer l'historique</div>
            <div class="hlp">Supprime tous les calculs précédents.</div>
          </div>
          <button class="btn danger" id="btn-clear-hist">Effacer</button>
        </div>
        <div class="row">
          <div>
            <div class="lbl">Effacer les variables A..Z</div>
            <div class="hlp">N'affecte ni constantes ni mode.</div>
          </div>
          <button class="btn danger" id="btn-clear-vars">Effacer</button>
        </div>
        <div class="row">
          <div>
            <div class="lbl">Réinitialiser tout l'état</div>
            <div class="hlp">Tout (thème, variables, historique). Recharge la page après.</div>
          </div>
          <button class="btn danger" id="btn-reset">Réinitialiser</button>
        </div>
      </div>

      <div class="group">
        <h3>À propos</h3>
        <div style="padding:var(--s-3);font-size:13px;color:var(--ink-2);line-height:1.6">
          <p style="margin:0 0 var(--s-2)"><strong>Grace</strong> — recréation libre d'une NumWorks adaptée desktop.</p>
          <p style="margin:0 0 var(--s-2)">Bibliothèques : <code>math.js</code> (calcul), <code>KaTeX</code> (rendu LaTeX).</p>
          <p style="margin:0;font-size:11px;color:var(--ink-3)">Tout fonctionne hors-ligne après le premier chargement (les CDN sont mis en cache par le navigateur).</p>
        </div>
      </div>
    `;
    container.appendChild(body);

    // Branchements
    const segTheme = body.querySelector('#seg-theme');
    segTheme.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.v === GR.state.get().theme);
      b.addEventListener('click', () => {
        document.body.dataset.theme = b.dataset.v;
        GR.state.set({ theme: b.dataset.v });
        segTheme.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    const segAngle = body.querySelector('#seg-angle');
    segAngle.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.v === GR.engine.getAngleMode());
      b.addEventListener('click', () => {
        GR.engine.setAngleMode(b.dataset.v);
        GR.state.set({ angleMode: b.dataset.v });
        segAngle.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    body.querySelector('#btn-clear-hist').addEventListener('click', () => {
      if (confirm('Effacer tout l\'historique ?')) GR.state.clearHistory();
    });
    body.querySelector('#btn-clear-vars').addEventListener('click', () => {
      if (confirm('Effacer toutes les variables utilisateur ?')) GR.engine.clearVars();
    });
    body.querySelector('#btn-reset').addEventListener('click', () => {
      if (confirm('Tout réinitialiser ? Cette action recharge la page.')) {
        try { localStorage.removeItem('grace.state.v1'); } catch {}
        location.reload();
      }
    });
  }

  function unmount() {}

  GR.apps = GR.apps || {};
  GR.apps.reglages = {
    id:'reglages', name:'Réglages', icon:'⚙', available:true,
    mount, unmount,
  };

})(window.GR = window.GR || {});
