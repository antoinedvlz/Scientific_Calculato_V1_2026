/**
 * data/units.js — Catalogue d'unités par grandeur physique.
 *
 * Chaque catégorie a :
 *   id, nm, units: [ { sym, nm } ]
 * où sym est l'identifiant math.js (ex: 'km/h') et nm le libellé français.
 *
 * Pour les unités composées (km/h, kWh, N·m…), math.js sait les manipuler
 * directement, donc on peut les exposer comme n'importe quelle autre unité.
 *
 * Préfixes SI : liste complète pour la table de référence dans l'app.
 */
(function (GR) {
  'use strict';

  const CATS = [
    { id:'longueur', nm:'Longueur', units: [
      { sym:'pm',  nm:'picomètre' },
      { sym:'nm',  nm:'nanomètre' },
      { sym:'um',  nm:'micromètre' },
      { sym:'mm',  nm:'millimètre' },
      { sym:'cm',  nm:'centimètre' },
      { sym:'m',   nm:'mètre' },
      { sym:'km',  nm:'kilomètre' },
      { sym:'inch',nm:'pouce' },
      { sym:'ft',  nm:'pied' },
      { sym:'yd',  nm:'yard' },
      { sym:'mi',  nm:'mile' },
      { sym:'nmi', nm:'mile nautique' },
      { sym:'angstrom', nm:'ångström' },
      { sym:'lightyear',nm:'année-lumière' },
      { sym:'parsec',   nm:'parsec' },
    ]},
    { id:'masse', nm:'Masse', units: [
      { sym:'ug',  nm:'microgramme' },
      { sym:'mg',  nm:'milligramme' },
      { sym:'g',   nm:'gramme' },
      { sym:'kg',  nm:'kilogramme' },
      { sym:'tonne',nm:'tonne (1000 kg)' },
      { sym:'lbm', nm:'livre (avoirdupois)' },
      { sym:'oz',  nm:'once' },
      { sym:'grain',nm:'grain' },
    ]},
    { id:'temps', nm:'Temps', units: [
      { sym:'ns',  nm:'nanoseconde' },
      { sym:'us',  nm:'microseconde' },
      { sym:'ms',  nm:'milliseconde' },
      { sym:'s',   nm:'seconde' },
      { sym:'min', nm:'minute' },
      { sym:'h',   nm:'heure' },
      { sym:'day', nm:'jour' },
      { sym:'week',nm:'semaine' },
      { sym:'month',nm:'mois (30 j)' },
      { sym:'year',nm:'année (365.25 j)' },
    ]},
    { id:'vitesse', nm:'Vitesse', units: [
      { sym:'m/s',  nm:'mètres par seconde' },
      { sym:'km/h', nm:'kilomètres par heure' },
      { sym:'mph',  nm:'miles par heure' },
      { sym:'knot', nm:'nœud' },
      { sym:'ft/s', nm:'pieds par seconde' },
    ]},
    { id:'acceleration', nm:'Accélération', units: [
      { sym:'m/s^2',  nm:'m·s⁻²' },
      { sym:'g_0',    nm:'pesanteur standard (9.80665 m·s⁻²)' },
      { sym:'gal',    nm:'gal (cm·s⁻²)' },
    ]},
    { id:'force', nm:'Force', units: [
      { sym:'mN',  nm:'millinewton' },
      { sym:'N',   nm:'newton' },
      { sym:'kN',  nm:'kilonewton' },
      { sym:'dyn', nm:'dyne' },
      { sym:'lbf', nm:'livre-force' },
      { sym:'kgf', nm:'kilogramme-force' },
    ]},
    { id:'energie', nm:'Énergie / Travail / Chaleur', units: [
      { sym:'mJ',   nm:'millijoule' },
      { sym:'J',    nm:'joule' },
      { sym:'kJ',   nm:'kilojoule' },
      { sym:'MJ',   nm:'mégajoule' },
      { sym:'cal',  nm:'calorie' },
      { sym:'kcal', nm:'kilocalorie (Cal)' },
      { sym:'Wh',   nm:'watt-heure' },
      { sym:'kWh',  nm:'kilowatt-heure' },
      { sym:'eV',   nm:'électron-volt' },
      { sym:'erg',  nm:'erg' },
      { sym:'BTU',  nm:'British thermal unit' },
    ]},
    { id:'puissance', nm:'Puissance', units: [
      { sym:'mW',  nm:'milliwatt' },
      { sym:'W',   nm:'watt' },
      { sym:'kW',  nm:'kilowatt' },
      { sym:'MW',  nm:'mégawatt' },
      { sym:'hp',  nm:'horsepower' },
    ]},
    { id:'pression', nm:'Pression', units: [
      { sym:'Pa',   nm:'pascal' },
      { sym:'hPa',  nm:'hectopascal' },
      { sym:'kPa',  nm:'kilopascal' },
      { sym:'MPa',  nm:'mégapascal' },
      { sym:'bar',  nm:'bar' },
      { sym:'mbar', nm:'millibar' },
      { sym:'atm',  nm:'atmosphère' },
      { sym:'mmHg', nm:'mmHg (torr)' },
      { sym:'psi',  nm:'livre par pouce² (psi)' },
    ]},
    { id:'temperature', nm:'Température', units: [
      { sym:'K',     nm:'kelvin' },
      { sym:'degC',  nm:'degré Celsius' },
      { sym:'degF',  nm:'degré Fahrenheit' },
      { sym:'degR',  nm:'degré Rankine' },
    ]},
    { id:'angle', nm:'Angle', units: [
      { sym:'rad',   nm:'radian' },
      { sym:'mrad',  nm:'milliradian' },
      { sym:'deg',   nm:'degré' },
      { sym:'grad',  nm:'grade' },
      { sym:'cycle', nm:'tour complet' },
      { sym:'arcmin',nm:'minute d\'arc' },
      { sym:'arcsec',nm:'seconde d\'arc' },
    ]},
    { id:'surface', nm:'Surface', units: [
      { sym:'mm^2',  nm:'millimètre²' },
      { sym:'cm^2',  nm:'centimètre²' },
      { sym:'m^2',   nm:'mètre²' },
      { sym:'km^2',  nm:'kilomètre²' },
      { sym:'are',   nm:'are (100 m²)' },
      { sym:'hectare',nm:'hectare' },
      { sym:'acre',  nm:'acre' },
      { sym:'inch^2',nm:'pouce²' },
      { sym:'ft^2',  nm:'pied²' },
    ]},
    { id:'volume', nm:'Volume', units: [
      { sym:'mm^3',  nm:'millimètre³' },
      { sym:'cm^3',  nm:'centimètre³ (= mL)' },
      { sym:'L',     nm:'litre' },
      { sym:'cl',    nm:'centilitre' },
      { sym:'dl',    nm:'décilitre' },
      { sym:'m^3',   nm:'mètre³' },
      { sym:'gallon',nm:'gallon US' },
      { sym:'inch^3',nm:'pouce³' },
    ]},
    { id:'frequence', nm:'Fréquence', units: [
      { sym:'Hz',  nm:'hertz' },
      { sym:'kHz', nm:'kilohertz' },
      { sym:'MHz', nm:'mégahertz' },
      { sym:'GHz', nm:'gigahertz' },
      { sym:'rpm', nm:'tours par minute' },
    ]},
    { id:'charge', nm:'Charge électrique', units: [
      { sym:'C',   nm:'coulomb' },
      { sym:'mC',  nm:'millicoulomb' },
      { sym:'uC',  nm:'microcoulomb' },
      { sym:'nC',  nm:'nanocoulomb' },
      { sym:'pC',  nm:'picocoulomb' },
    ]},
    { id:'courant', nm:'Courant', units: [
      { sym:'uA',  nm:'microampère' },
      { sym:'mA',  nm:'milliampère' },
      { sym:'A',   nm:'ampère' },
      { sym:'kA',  nm:'kiloampère' },
    ]},
    { id:'tension', nm:'Tension / DDP', units: [
      { sym:'uV',  nm:'microvolt' },
      { sym:'mV',  nm:'millivolt' },
      { sym:'V',   nm:'volt' },
      { sym:'kV',  nm:'kilovolt' },
      { sym:'MV',  nm:'mégavolt' },
    ]},
    { id:'resistance', nm:'Résistance', units: [
      { sym:'ohm', nm:'ohm' },
      { sym:'kohm',nm:'kiloohm' },
      { sym:'Mohm',nm:'mégaohm' },
    ]},
    { id:'capacite', nm:'Capacité', units: [
      { sym:'pF',  nm:'picofarad' },
      { sym:'nF',  nm:'nanofarad' },
      { sym:'uF',  nm:'microfarad' },
      { sym:'mF',  nm:'millifarad' },
      { sym:'F',   nm:'farad' },
    ]},
    { id:'inductance', nm:'Inductance', units: [
      { sym:'nH',  nm:'nanohenry' },
      { sym:'uH',  nm:'microhenry' },
      { sym:'mH',  nm:'millihenry' },
      { sym:'H',   nm:'henry' },
    ]},
    { id:'magnetique', nm:'Champ magnétique', units: [
      { sym:'uT',  nm:'microtesla' },
      { sym:'mT',  nm:'millitesla' },
      { sym:'T',   nm:'tesla' },
      { sym:'gauss',nm:'gauss' },
    ]},
    { id:'flux', nm:'Flux magnétique', units: [
      { sym:'Wb',  nm:'weber' },
      { sym:'maxwell', nm:'maxwell' },
    ]},
    { id:'intensite_lum', nm:'Intensité lumineuse', units: [
      { sym:'cd',  nm:'candela' },
      { sym:'lm',  nm:'lumen (cd·sr)' },
      { sym:'lx',  nm:'lux (lm/m²)' },
    ]},
    { id:'matiere', nm:'Quantité de matière', units: [
      { sym:'mol',  nm:'mole' },
      { sym:'mmol', nm:'millimole' },
      { sym:'umol', nm:'micromole' },
    ]},
    { id:'donnees', nm:'Données informatiques', units: [
      { sym:'b',   nm:'bit' },
      { sym:'B',   nm:'octet (byte)' },
      { sym:'kB',  nm:'kilobyte (10³)' },
      { sym:'KiB', nm:'kibioctet (2¹⁰)' },
      { sym:'MB',  nm:'mégabyte (10⁶)' },
      { sym:'MiB', nm:'mébioctet (2²⁰)' },
      { sym:'GB',  nm:'gigabyte (10⁹)' },
      { sym:'GiB', nm:'gibioctet (2³⁰)' },
      { sym:'TB',  nm:'terabyte (10¹²)' },
      { sym:'TiB', nm:'tébioctet (2⁴⁰)' },
    ]},
  ];

  // Préfixes SI complets, du plus grand au plus petit.
  const SI_PREFIXES = [
    ['Y','yotta',  1e24], ['Z','zetta', 1e21], ['E','exa',   1e18],
    ['P','peta',   1e15], ['T','téra',  1e12], ['G','giga',  1e9],
    ['M','méga',   1e6],  ['k','kilo',  1e3],  ['h','hecto', 1e2],
    ['da','déca',  1e1],
    ['',  '(unité)',1],
    ['d','déci',   1e-1], ['c','centi', 1e-2], ['m','milli', 1e-3],
    ['μ','micro',  1e-6], ['n','nano',  1e-9], ['p','pico',  1e-12],
    ['f','femto',  1e-15],['a','atto',  1e-18],['z','zepto', 1e-21],
    ['y','yocto',  1e-24],
  ];

  GR.data = GR.data || {};
  GR.data.units = {
    categories: CATS,
    prefixes: SI_PREFIXES,
  };

})(window.GR = window.GR || {});
