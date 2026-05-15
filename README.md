# Grace

Webapp calculatrice scientifique inspirée de la NumWorks, adaptée à un usage desktop (souris + clavier), avec des fonctionnalités supplémentaires (analyse dimensionnelle, conversions d'unités étendues, tableau périodique enrichi, etc.).

## Lancer en dev
Ouvrir `src/index.html` dans le navigateur. En `file://` direct ça marche grâce au pattern IIFE (pas d'ES modules), tu peux donc juste **double-cliquer**.
Si jamais ton navigateur bloque les CDN sur `file://`, lance un petit serveur :

```sh
cd src
python3 -m http.server 8000
# puis http://localhost:8000
```

## Builder le fichier unique
Concatène tout le CSS/JS local dans un seul HTML auto-suffisant (les CDN restent en lien externe) :

```sh
python3 build/build.py
# → dist/grace.html
```

(Une version Node équivalente existe : `node build/build.mjs`, si tu installes Node un jour.)

Le `dist/grace.html` est doubleclickable et fonctionne hors-ligne **après** le premier chargement (les CDN sont mis en cache par le navigateur).

## Structure
```
src/
  index.html           # shell HTML + imports
  styles/
    theme.css          # variables CSS (clair/sombre)
    base.css           # layout et composants
  js/
    state.js           # store + localStorage
    latex.js           # wrapper KaTeX
    math-engine.js     # wrapper math.js (variables, rad/deg, alias FR)
    keyboard.js        # raccourcis globaux
    main.js            # bootstrap + routeur d'apps
    apps/
      calculs.js       # app Calculs (étape 1)
build/
  build.mjs            # script de concat → dist/grace.html
```

## Raccourcis
- `Ctrl+1` … `Ctrl+9` — ouvrir une application
- `Échap` — retour à Calculs
- `Ctrl+T` — basculer thème
- `Ctrl+K` — afficher / cacher le clavier virtuel
- `Entrée` — évaluer
- `↑` / `↓` (dans la saisie) — naviguer dans l'historique

## État d'avancement
- ✅ Calculs (avec unités et constantes natives)
- ✅ Tableau périodique enrichi (118 éléments + détails)
- ✅ Unités (convertisseur + préfixes SI)
- ✅ Constantes physiques (catalogue CODATA + recherche)
- ✅ Fonctions (sans grapheur, table de valeurs)
- ✅ Suites (sans grapheur, table de valeurs)
- ✅ Équations (linéaire, quadratique, polynômes, systèmes)
- ✅ Statistiques (1 et 2 variables)
- ✅ Probabilités (lois usuelles)
- ✅ Régressions (linéaire, polynômes, puissance, exp, log)
- ✅ Tableur (formules avec plages)
- ✅ Réglages
- ⬜ Grapheur (à venir, étape future)
- ❌ Python — retiré du périmètre
- ❌ Géométrie — retiré du périmètre

## Exemples à essayer dans Calculs
```
2*sin(pi/4) + sqrt(2)
3 m + 25 cm                       → 3.25 m
(1/2) * 2 kg * (3 m/s)^2          → 9 J
c * 1 ns to mm                    → 299.79 mm
h * 5e14 Hz to eV                 → énergie d'un photon visible
N_A * k_B                         → R (constante des gaz)
A = 5,  A^2 + 3                   → 28
```
