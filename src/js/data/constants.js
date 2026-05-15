/**
 * data/constants.js — Catalogue de constantes physiques.
 *
 * Chaque constante :
 *   id      : identifiant utilisable dans Calculs (ex: 'c', 'h', 'hbar')
 *   sym     : symbole d'affichage (LaTeX léger)
 *   nm      : nom français
 *   value   : valeur (nombre OU chaîne avec unité au format math.js, ex: '299792458 m/s')
 *   unit    : unité (chaîne, vide si sans dimension)
 *   cat     : catégorie ('universelles' | 'EM' | 'atomique' | 'thermo' | 'usuelles' | 'maths')
 *   exact   : true si valeur définie par convention SI, false si mesurée
 *   desc    : courte description
 *
 * Note : on stocke la "value" comme string contenant l'unité math.js, car
 * c'est cette même chaîne qu'on va injecter dans le scope du parser via
 * math.evaluate(value) au démarrage.
 *
 * Sources : CODATA 2018, SI Brochure 9e éd.
 */
(function (GR) {
  'use strict';

  const CONSTS = [
    // --- Universelles ---
    { id:'c',         sym:'c',         nm:'Vitesse de la lumière dans le vide',
      value:'299792458 m/s', unit:'m/s', cat:'universelles', exact:true,
      desc:'Définition exacte du mètre depuis 1983.' },
    { id:'h',         sym:'h',         nm:'Constante de Planck',
      value:'6.62607015e-34 J s', unit:'J·s', cat:'universelles', exact:true,
      desc:'Quantum d\'action ; définit le kilogramme depuis 2019.' },
    { id:'hbar',      sym:'ℏ',         nm:'Constante de Planck réduite',
      value:'1.054571817e-34 J s', unit:'J·s', cat:'universelles', exact:false,
      desc:'h / (2π).' },
    { id:'G_const',   sym:'G',         nm:'Constante gravitationnelle',
      value:'6.67430e-11 N m^2 / kg^2', unit:'m³·kg⁻¹·s⁻²', cat:'universelles', exact:false,
      desc:'Constante de Newton.' },
    { id:'g_0',       sym:'g₀',        nm:'Pesanteur standard',
      value:'9.80665 m/s^2', unit:'m/s²', cat:'universelles', exact:true,
      desc:'Accélération de pesanteur conventionnelle.' },
    { id:'atm',       sym:'atm',       nm:'Atmosphère standard',
      value:'101325 Pa', unit:'Pa', cat:'universelles', exact:true,
      desc:'Pression de référence.' },

    // --- Électromagnétisme ---
    { id:'e_charge',  sym:'e',         nm:'Charge élémentaire',
      value:'1.602176634e-19 C', unit:'C', cat:'EM', exact:true,
      desc:'Définit le coulomb depuis 2019.' },
    { id:'mu_0',      sym:'μ₀',        nm:'Perméabilité du vide',
      value:'1.25663706212e-6 N/A^2', unit:'N·A⁻²', cat:'EM', exact:false,
      desc:'≈ 4π × 10⁻⁷ (mesurée depuis 2019).' },
    { id:'epsilon_0', sym:'ε₀',        nm:'Permittivité du vide',
      value:'8.8541878128e-12 F/m', unit:'F/m', cat:'EM', exact:false,
      desc:'1 / (μ₀ c²).' },
    { id:'k_e',       sym:'kₑ',        nm:'Constante de Coulomb',
      value:'8.9875517873681764e9 N m^2 / C^2', unit:'N·m²·C⁻²', cat:'EM', exact:false,
      desc:'1 / (4π ε₀).' },
    { id:'mu_B',      sym:'μ_B',       nm:'Magnéton de Bohr',
      value:'9.2740100783e-24 J/T', unit:'J/T', cat:'EM', exact:false,
      desc:'eℏ / (2 mₑ).' },
    { id:'mu_N',      sym:'μ_N',       nm:'Magnéton nucléaire',
      value:'5.0507837461e-27 J/T', unit:'J/T', cat:'EM', exact:false,
      desc:'eℏ / (2 m_p).' },
    { id:'Phi_0',     sym:'Φ₀',        nm:'Quantum de flux magnétique',
      value:'2.067833848e-15 Wb', unit:'Wb', cat:'EM', exact:false,
      desc:'h / (2e).' },

    // --- Atomique / quantique ---
    { id:'m_e',       sym:'mₑ',        nm:'Masse de l\'électron',
      value:'9.1093837015e-31 kg', unit:'kg', cat:'atomique', exact:false, desc:null },
    { id:'m_p',       sym:'m_p',       nm:'Masse du proton',
      value:'1.67262192369e-27 kg', unit:'kg', cat:'atomique', exact:false, desc:null },
    { id:'m_n',       sym:'m_n',       nm:'Masse du neutron',
      value:'1.67492749804e-27 kg', unit:'kg', cat:'atomique', exact:false, desc:null },
    { id:'m_u',       sym:'u',         nm:'Unité de masse atomique unifiée',
      value:'1.66053906660e-27 kg', unit:'kg', cat:'atomique', exact:false, desc:null },
    { id:'a_0',       sym:'a₀',        nm:'Rayon de Bohr',
      value:'5.29177210903e-11 m', unit:'m', cat:'atomique', exact:false, desc:null },
    { id:'Ry',        sym:'R_∞',       nm:'Constante de Rydberg',
      value:'10973731.568160 1/m', unit:'1/m', cat:'atomique', exact:false, desc:null },
    { id:'alpha',     sym:'α',         nm:'Constante de structure fine',
      value:'7.2973525693e-3', unit:'', cat:'atomique', exact:false,
      desc:'Sans dimension.' },
    { id:'r_e',       sym:'rₑ',        nm:'Rayon classique de l\'électron',
      value:'2.8179403262e-15 m', unit:'m', cat:'atomique', exact:false, desc:null },
    { id:'lambda_C',  sym:'λ_C',       nm:'Longueur d\'onde Compton de l\'électron',
      value:'2.42631023867e-12 m', unit:'m', cat:'atomique', exact:false, desc:null },

    // --- Thermodynamique ---
    { id:'k_B',       sym:'k_B',       nm:'Constante de Boltzmann',
      value:'1.380649e-23 J/K', unit:'J/K', cat:'thermo', exact:true,
      desc:'Définit le kelvin depuis 2019.' },
    { id:'N_A',       sym:'N_A',       nm:'Nombre d\'Avogadro',
      value:'6.02214076e23 1/mol', unit:'1/mol', cat:'thermo', exact:true,
      desc:'Définit la mole depuis 2019.' },
    { id:'R_gas',     sym:'R',         nm:'Constante des gaz parfaits',
      value:'8.314462618 J/(mol K)', unit:'J·mol⁻¹·K⁻¹', cat:'thermo', exact:false,
      desc:'N_A × k_B.' },
    { id:'F_const',   sym:'F',         nm:'Constante de Faraday',
      value:'96485.33212 C/mol', unit:'C/mol', cat:'thermo', exact:false,
      desc:'N_A × e.' },
    { id:'sigma_SB',  sym:'σ',         nm:'Constante de Stefan-Boltzmann',
      value:'5.670374419e-8 W/(m^2 K^4)', unit:'W·m⁻²·K⁻⁴', cat:'thermo', exact:false,
      desc:null },
    { id:'b_wien',    sym:'b',         nm:'Constante de déplacement de Wien',
      value:'2.897771955e-3 m K', unit:'m·K', cat:'thermo', exact:false, desc:null },
    { id:'V_m',       sym:'V_m',       nm:'Volume molaire d\'un gaz parfait (STP)',
      value:'22.41396954e-3 m^3 / mol', unit:'m³/mol', cat:'thermo', exact:false,
      desc:'À T = 273.15 K et p = 100 kPa.' },

    // --- Mathématiques ---
    { id:'pi_const',  sym:'π',         nm:'Pi', value:'pi', unit:'', cat:'maths', exact:false,
      desc:'Disponible via « pi » dans Calculs.' },
    { id:'e_const',   sym:'e',         nm:'Constante d\'Euler', value:'e', unit:'', cat:'maths', exact:false,
      desc:'Disponible via « e » dans Calculs.' },
    { id:'phi',       sym:'φ',         nm:'Nombre d\'or',
      value:'1.6180339887498948', unit:'', cat:'maths', exact:false,
      desc:'(1 + √5) / 2.' },
    { id:'gamma_em',  sym:'γ',         nm:'Constante d\'Euler-Mascheroni',
      value:'0.5772156649015329', unit:'', cat:'maths', exact:false, desc:null },
  ];

  GR.data = GR.data || {};
  GR.data.constants = {
    list: CONSTS,
    byId: Object.fromEntries(CONSTS.map(c => [c.id, c])),
    categories: [
      ['universelles', 'Universelles'],
      ['EM',           'Électromagnétisme'],
      ['atomique',     'Atomique & quantique'],
      ['thermo',       'Thermodynamique'],
      ['maths',        'Mathématiques'],
    ],
  };

})(window.GR = window.GR || {});
