/**
 * data/periodic.js — Données du tableau périodique.
 *
 * Pour chaque élément :
 *   z       : numéro atomique
 *   sym     : symbole
 *   nm      : nom français
 *   nmEn    : nom anglais
 *   mass    : masse atomique standard (u). Crochets = nombre de masse de
 *             l'isotope le plus stable si pas d'atomes standards.
 *   cfg     : configuration électronique (notation condensée)
 *   en      : électronégativité Pauling (null si indéfinie)
 *   period  : période (1–7)
 *   group   : groupe IUPAC (1–18) ; null pour lanthanides/actinides
 *   block   : 's' | 'p' | 'd' | 'f'
 *   cat     : catégorie pour la couleur (voir base.css)
 *   ar, cr, vdwr : rayon atomique / covalent / Van der Waals (pm)
 *   mp, bp  : points de fusion / d'ébullition (K) — null si inconnu/sublime
 *   dens    : densité (g/cm³ à STP)
 *   ox      : états d'oxydation usuels (du plus négatif au plus positif)
 *   xtal    : structure cristalline standard
 *   discYr  : année de découverte
 *   iso     : isotopes principaux [{a: nombre de masse, ab: abondance %}]
 *   notes   : remarque courte (optionnelle)
 *
 * Sources principales : CIAAW 2021, CRC Handbook, NIST. Les valeurs sont
 * arrondies à un nombre raisonnable de chiffres significatifs pour la
 * lecture. Pour les éléments transuraniens lourds, certaines valeurs
 * sont prédites ou estimées.
 */
(function (GR) {
  'use strict';

  // Format ultra-compact : on stocke un tableau de tableaux, puis on
  // remappe en objets nommés. Cela réduit la taille du fichier et garde
  // la définition lisible (chaque ligne = un élément).
  const KEYS = ['z','sym','nm','nmEn','mass','cfg','en','period','group','block','cat',
                'ar','cr','vdwr','mp','bp','dens','ox','xtal','discYr','iso','notes'];

  // Quelques abréviations pour les structures cristallines.
  const FCC='cubique à faces centrées', BCC='cubique centrée', HCP='hexagonale compacte',
        DC='cubique diamant', RH='rhomboédrique', OR='orthorhombique', TG='tétragonale',
        SC='cubique simple', MO='monoclinique', HX='hexagonale', TR='triclinique';

  const D = [
    // z, sym, nm, nmEn, mass, cfg, en, p, g, blk, cat, ar, cr, vdwr, mp, bp, dens, ox, xtal, year, iso, notes
    [1,'H','Hydrogène','Hydrogen',1.008,'1s¹',2.20,1,1,'s','non-metal',53,31,120,13.99,20.27,0.0000899,[-1,1],HX,1766,[{a:1,ab:99.985},{a:2,ab:0.015}],'L\'élément le plus abondant de l\'univers.'],
    [2,'He','Hélium','Helium',4.0026,'1s²',null,1,18,'s','gaz-noble',31,28,140,0.95,4.22,0.0001785,[0],HCP,1868,[{a:4,ab:99.99986},{a:3,ab:0.00014}],null],
    [3,'Li','Lithium','Lithium',6.94,'[He] 2s¹',0.98,2,1,'s','alcalin',167,128,182,453.65,1603,0.534,[1],BCC,1817,[{a:7,ab:92.4},{a:6,ab:7.6}],null],
    [4,'Be','Béryllium','Beryllium',9.0122,'[He] 2s²',1.57,2,2,'s','alcalino-terreux',112,96,153,1560,2742,1.85,[2],HCP,1798,[{a:9,ab:100}],'Toxique.'],
    [5,'B','Bore','Boron',10.81,'[He] 2s² 2p¹',2.04,2,13,'p','metalloide',87,84,192,2349,4200,2.34,[3],RH,1808,[{a:11,ab:80.1},{a:10,ab:19.9}],null],
    [6,'C','Carbone','Carbon',12.011,'[He] 2s² 2p²',2.55,2,14,'p','non-metal',67,76,170,3823,4098,2.267,[-4,-3,-2,-1,1,2,3,4],HX,null,[{a:12,ab:98.9},{a:13,ab:1.1}],'Sublime ; mp/bp = graphite.'],
    [7,'N','Azote','Nitrogen',14.007,'[He] 2s² 2p³',3.04,2,15,'p','non-metal',56,71,155,63.15,77.36,0.001251,[-3,-2,-1,1,2,3,4,5],HX,1772,[{a:14,ab:99.6},{a:15,ab:0.4}],null],
    [8,'O','Oxygène','Oxygen',15.999,'[He] 2s² 2p⁴',3.44,2,16,'p','non-metal',48,66,152,54.36,90.20,0.001429,[-2,-1,1,2],SC,1774,[{a:16,ab:99.76},{a:18,ab:0.20},{a:17,ab:0.04}],null],
    [9,'F','Fluor','Fluorine',18.998,'[He] 2s² 2p⁵',3.98,2,17,'p','halogene',42,57,147,53.53,85.03,0.001696,[-1],SC,1886,[{a:19,ab:100}],'Le plus électronégatif.'],
    [10,'Ne','Néon','Neon',20.180,'[He] 2s² 2p⁶',null,2,18,'p','gaz-noble',38,58,154,24.56,27.07,0.0008999,[0],FCC,1898,[{a:20,ab:90.5},{a:22,ab:9.3},{a:21,ab:0.27}],null],
    [11,'Na','Sodium','Sodium',22.990,'[Ne] 3s¹',0.93,3,1,'s','alcalin',190,166,227,370.95,1156,0.971,[1],BCC,1807,[{a:23,ab:100}],null],
    [12,'Mg','Magnésium','Magnesium',24.305,'[Ne] 3s²',1.31,3,2,'s','alcalino-terreux',145,141,173,923,1363,1.738,[2],HCP,1755,[{a:24,ab:79.0},{a:26,ab:11.0},{a:25,ab:10.0}],null],
    [13,'Al','Aluminium','Aluminium',26.982,'[Ne] 3s² 3p¹',1.61,3,13,'p','post-transition',118,121,184,933.47,2792,2.70,[3],FCC,1825,[{a:27,ab:100}],null],
    [14,'Si','Silicium','Silicon',28.085,'[Ne] 3s² 3p²',1.90,3,14,'p','metalloide',111,111,210,1687,3538,2.3296,[-4,4],DC,1824,[{a:28,ab:92.2},{a:29,ab:4.7},{a:30,ab:3.1}],'Base de l\'électronique.'],
    [15,'P','Phosphore','Phosphorus',30.974,'[Ne] 3s² 3p³',2.19,3,15,'p','non-metal',98,107,180,317.30,553.65,1.82,[-3,3,5],TR,1669,[{a:31,ab:100}],null],
    [16,'S','Soufre','Sulfur',32.06,'[Ne] 3s² 3p⁴',2.58,3,16,'p','non-metal',88,105,180,388.36,717.87,2.067,[-2,2,4,6],OR,null,[{a:32,ab:95.0},{a:34,ab:4.3},{a:33,ab:0.75}],null],
    [17,'Cl','Chlore','Chlorine',35.45,'[Ne] 3s² 3p⁵',3.16,3,17,'p','halogene',79,102,175,171.65,239.11,0.003214,[-1,1,3,5,7],OR,1774,[{a:35,ab:75.78},{a:37,ab:24.22}],null],
    [18,'Ar','Argon','Argon',39.948,'[Ne] 3s² 3p⁶',null,3,18,'p','gaz-noble',71,106,188,83.81,87.30,0.001784,[0],FCC,1894,[{a:40,ab:99.6},{a:36,ab:0.34},{a:38,ab:0.063}],null],
    [19,'K','Potassium','Potassium',39.098,'[Ar] 4s¹',0.82,4,1,'s','alcalin',243,203,275,336.53,1032,0.862,[1],BCC,1807,[{a:39,ab:93.3},{a:41,ab:6.7}],null],
    [20,'Ca','Calcium','Calcium',40.078,'[Ar] 4s²',1.00,4,2,'s','alcalino-terreux',194,176,231,1115,1757,1.54,[2],FCC,1808,[{a:40,ab:96.94},{a:44,ab:2.09}],null],
    [21,'Sc','Scandium','Scandium',44.956,'[Ar] 3d¹ 4s²',1.36,4,3,'d','transition',184,170,211,1814,3109,2.989,[3],HCP,1879,[{a:45,ab:100}],null],
    [22,'Ti','Titane','Titanium',47.867,'[Ar] 3d² 4s²',1.54,4,4,'d','transition',176,160,null,1941,3560,4.54,[2,3,4],HCP,1791,[{a:48,ab:73.7}],null],
    [23,'V','Vanadium','Vanadium',50.942,'[Ar] 3d³ 4s²',1.63,4,5,'d','transition',171,153,null,2183,3680,6.11,[2,3,4,5],BCC,1801,[{a:51,ab:99.75}],null],
    [24,'Cr','Chrome','Chromium',51.996,'[Ar] 3d⁵ 4s¹',1.66,4,6,'d','transition',166,139,null,2180,2944,7.15,[2,3,6],BCC,1797,[{a:52,ab:83.79}],'Exception : configuration 3d⁵ 4s¹.'],
    [25,'Mn','Manganèse','Manganese',54.938,'[Ar] 3d⁵ 4s²',1.55,4,7,'d','transition',161,139,null,1519,2334,7.44,[2,3,4,6,7],BCC,1774,[{a:55,ab:100}],null],
    [26,'Fe','Fer','Iron',55.845,'[Ar] 3d⁶ 4s²',1.83,4,8,'d','transition',156,132,null,1811,3134,7.874,[2,3,6],BCC,null,[{a:56,ab:91.75}],null],
    [27,'Co','Cobalt','Cobalt',58.933,'[Ar] 3d⁷ 4s²',1.88,4,9,'d','transition',152,126,null,1768,3200,8.86,[2,3],HCP,1735,[{a:59,ab:100}],null],
    [28,'Ni','Nickel','Nickel',58.693,'[Ar] 3d⁸ 4s²',1.91,4,10,'d','transition',149,124,163,1728,3186,8.912,[2,3],FCC,1751,[{a:58,ab:68.08}],null],
    [29,'Cu','Cuivre','Copper',63.546,'[Ar] 3d¹⁰ 4s¹',1.90,4,11,'d','transition',145,132,140,1357.77,2835,8.96,[1,2],FCC,null,[{a:63,ab:69.15}],'Exception : 3d¹⁰ 4s¹.'],
    [30,'Zn','Zinc','Zinc',65.38,'[Ar] 3d¹⁰ 4s²',1.65,4,12,'d','transition',142,122,139,692.68,1180,7.134,[2],HCP,null,[{a:64,ab:48.27}],null],
    [31,'Ga','Gallium','Gallium',69.723,'[Ar] 3d¹⁰ 4s² 4p¹',1.81,4,13,'p','post-transition',136,122,187,302.91,2477,5.907,[3],OR,1875,[{a:69,ab:60.1}],null],
    [32,'Ge','Germanium','Germanium',72.630,'[Ar] 3d¹⁰ 4s² 4p²',2.01,4,14,'p','metalloide',125,120,211,1211.40,3106,5.323,[2,4],DC,1886,[{a:74,ab:36.7}],null],
    [33,'As','Arsenic','Arsenic',74.922,'[Ar] 3d¹⁰ 4s² 4p³',2.18,4,15,'p','metalloide',114,119,185,887,887,5.776,[-3,3,5],RH,null,[{a:75,ab:100}],'Sublime à pression normale.'],
    [34,'Se','Sélénium','Selenium',78.971,'[Ar] 3d¹⁰ 4s² 4p⁴',2.55,4,16,'p','non-metal',103,120,190,494,958,4.809,[-2,2,4,6],MO,1817,[{a:80,ab:49.6}],null],
    [35,'Br','Brome','Bromine',79.904,'[Ar] 3d¹⁰ 4s² 4p⁵',2.96,4,17,'p','halogene',94,120,185,265.8,332.0,3.122,[-1,1,3,5,7],OR,1826,[{a:79,ab:50.69}],null],
    [36,'Kr','Krypton','Krypton',83.798,'[Ar] 3d¹⁰ 4s² 4p⁶',3.00,4,18,'p','gaz-noble',88,116,202,115.79,119.93,0.003733,[0,2],FCC,1898,[{a:84,ab:57.0}],null],
    [37,'Rb','Rubidium','Rubidium',85.468,'[Kr] 5s¹',0.82,5,1,'s','alcalin',265,220,303,312.46,961,1.532,[1],BCC,1861,[{a:85,ab:72.17}],null],
    [38,'Sr','Strontium','Strontium',87.62,'[Kr] 5s²',0.95,5,2,'s','alcalino-terreux',219,195,249,1050,1655,2.64,[2],FCC,1790,[{a:88,ab:82.58}],null],
    [39,'Y','Yttrium','Yttrium',88.906,'[Kr] 4d¹ 5s²',1.22,5,3,'d','transition',212,190,null,1799,3609,4.469,[3],HCP,1794,[{a:89,ab:100}],null],
    [40,'Zr','Zirconium','Zirconium',91.224,'[Kr] 4d² 5s²',1.33,5,4,'d','transition',206,175,null,2128,4682,6.506,[4],HCP,1789,[{a:90,ab:51.45}],null],
    [41,'Nb','Niobium','Niobium',92.906,'[Kr] 4d⁴ 5s¹',1.6,5,5,'d','transition',198,164,null,2750,5017,8.57,[3,5],BCC,1801,[{a:93,ab:100}],null],
    [42,'Mo','Molybdène','Molybdenum',95.95,'[Kr] 4d⁵ 5s¹',2.16,5,6,'d','transition',190,154,null,2896,4912,10.22,[2,3,4,5,6],BCC,1781,[{a:98,ab:24.39}],null],
    [43,'Tc','Technétium','Technetium',[98],'[Kr] 4d⁵ 5s²',1.9,5,7,'d','transition',183,147,null,2430,4538,11.5,[4,5,6,7],HCP,1937,[{a:98,ab:null}],'Tous isotopes radioactifs.'],
    [44,'Ru','Ruthénium','Ruthenium',101.07,'[Kr] 4d⁷ 5s¹',2.2,5,8,'d','transition',178,146,null,2607,4423,12.37,[2,3,4,6,8],HCP,1844,[{a:102,ab:31.6}],null],
    [45,'Rh','Rhodium','Rhodium',102.91,'[Kr] 4d⁸ 5s¹',2.28,5,9,'d','transition',173,142,null,2237,3968,12.41,[3],FCC,1803,[{a:103,ab:100}],null],
    [46,'Pd','Palladium','Palladium',106.42,'[Kr] 4d¹⁰',2.20,5,10,'d','transition',169,139,163,1828.05,3236,12.02,[2,4],FCC,1803,[{a:106,ab:27.33}],null],
    [47,'Ag','Argent','Silver',107.87,'[Kr] 4d¹⁰ 5s¹',1.93,5,11,'d','transition',165,145,172,1234.93,2435,10.501,[1],FCC,null,[{a:107,ab:51.84}],null],
    [48,'Cd','Cadmium','Cadmium',112.41,'[Kr] 4d¹⁰ 5s²',1.69,5,12,'d','transition',161,144,158,594.22,1040,8.69,[2],HCP,1817,[{a:114,ab:28.73}],null],
    [49,'In','Indium','Indium',114.82,'[Kr] 4d¹⁰ 5s² 5p¹',1.78,5,13,'p','post-transition',156,142,193,429.75,2345,7.31,[3],TG,1863,[{a:115,ab:95.7}],null],
    [50,'Sn','Étain','Tin',118.71,'[Kr] 4d¹⁰ 5s² 5p²',1.96,5,14,'p','post-transition',145,139,217,505.08,2875,7.287,[2,4],TG,null,[{a:120,ab:32.58}],null],
    [51,'Sb','Antimoine','Antimony',121.76,'[Kr] 4d¹⁰ 5s² 5p³',2.05,5,15,'p','metalloide',133,139,206,903.78,1860,6.685,[-3,3,5],RH,null,[{a:121,ab:57.21}],null],
    [52,'Te','Tellure','Tellurium',127.60,'[Kr] 4d¹⁰ 5s² 5p⁴',2.1,5,16,'p','metalloide',123,138,206,722.66,1261,6.232,[-2,2,4,6],HX,1782,[{a:130,ab:34.08}],null],
    [53,'I','Iode','Iodine',126.90,'[Kr] 4d¹⁰ 5s² 5p⁵',2.66,5,17,'p','halogene',115,139,198,386.85,457.4,4.93,[-1,1,3,5,7],OR,1811,[{a:127,ab:100}],null],
    [54,'Xe','Xénon','Xenon',131.29,'[Kr] 4d¹⁰ 5s² 5p⁶',2.6,5,18,'p','gaz-noble',108,140,216,161.36,165.03,0.005887,[0,2,4,6,8],FCC,1898,[{a:132,ab:26.9}],null],
    [55,'Cs','Césium','Caesium',132.91,'[Xe] 6s¹',0.79,6,1,'s','alcalin',298,244,343,301.59,944,1.873,[1],BCC,1860,[{a:133,ab:100}],null],
    [56,'Ba','Baryum','Barium',137.33,'[Xe] 6s²',0.89,6,2,'s','alcalino-terreux',253,215,268,1000,2170,3.62,[2],BCC,1808,[{a:138,ab:71.7}],null],
    [57,'La','Lanthane','Lanthanum',138.91,'[Xe] 5d¹ 6s²',1.10,6,null,'d','lanthanide',null,207,null,1193,3737,6.146,[3],HX,1839,[{a:139,ab:99.91}],null],
    [58,'Ce','Cérium','Cerium',140.12,'[Xe] 4f¹ 5d¹ 6s²',1.12,6,null,'f','lanthanide',null,204,null,1071,3633,6.770,[3,4],FCC,1803,[{a:140,ab:88.45}],null],
    [59,'Pr','Praséodyme','Praseodymium',140.91,'[Xe] 4f³ 6s²',1.13,6,null,'f','lanthanide',null,203,null,1204,3563,6.773,[3,4],HX,1885,[{a:141,ab:100}],null],
    [60,'Nd','Néodyme','Neodymium',144.24,'[Xe] 4f⁴ 6s²',1.14,6,null,'f','lanthanide',null,201,null,1294,3373,7.007,[2,3],HX,1885,[{a:142,ab:27.2}],null],
    [61,'Pm','Prométhium','Promethium',[145],'[Xe] 4f⁵ 6s²',1.13,6,null,'f','lanthanide',null,199,null,1315,3273,7.26,[3],HX,1945,[{a:145,ab:null}],'Radioactif.'],
    [62,'Sm','Samarium','Samarium',150.36,'[Xe] 4f⁶ 6s²',1.17,6,null,'f','lanthanide',null,198,null,1347,2076,7.52,[2,3],RH,1879,[{a:152,ab:26.75}],null],
    [63,'Eu','Europium','Europium',151.96,'[Xe] 4f⁷ 6s²',1.2,6,null,'f','lanthanide',null,198,null,1095,1800,5.243,[2,3],BCC,1901,[{a:153,ab:52.19}],null],
    [64,'Gd','Gadolinium','Gadolinium',157.25,'[Xe] 4f⁷ 5d¹ 6s²',1.20,6,null,'f','lanthanide',null,196,null,1586,3523,7.895,[3],HCP,1880,[{a:158,ab:24.84}],null],
    [65,'Tb','Terbium','Terbium',158.93,'[Xe] 4f⁹ 6s²',1.2,6,null,'f','lanthanide',null,194,null,1629,3503,8.229,[3,4],HCP,1843,[{a:159,ab:100}],null],
    [66,'Dy','Dysprosium','Dysprosium',162.50,'[Xe] 4f¹⁰ 6s²',1.22,6,null,'f','lanthanide',null,192,null,1685,2840,8.55,[3],HCP,1886,[{a:164,ab:28.26}],null],
    [67,'Ho','Holmium','Holmium',164.93,'[Xe] 4f¹¹ 6s²',1.23,6,null,'f','lanthanide',null,192,null,1747,2973,8.795,[3],HCP,1878,[{a:165,ab:100}],null],
    [68,'Er','Erbium','Erbium',167.26,'[Xe] 4f¹² 6s²',1.24,6,null,'f','lanthanide',null,189,null,1802,3141,9.066,[3],HCP,1842,[{a:166,ab:33.50}],null],
    [69,'Tm','Thulium','Thulium',168.93,'[Xe] 4f¹³ 6s²',1.25,6,null,'f','lanthanide',null,190,null,1818,2223,9.321,[3],HCP,1879,[{a:169,ab:100}],null],
    [70,'Yb','Ytterbium','Ytterbium',173.05,'[Xe] 4f¹⁴ 6s²',1.1,6,null,'f','lanthanide',null,187,null,1097,1469,6.965,[2,3],FCC,1878,[{a:174,ab:31.83}],null],
    [71,'Lu','Lutécium','Lutetium',174.97,'[Xe] 4f¹⁴ 5d¹ 6s²',1.27,6,null,'d','lanthanide',null,187,null,1925,3675,9.84,[3],HCP,1907,[{a:175,ab:97.41}],null],
    [72,'Hf','Hafnium','Hafnium',178.49,'[Xe] 4f¹⁴ 5d² 6s²',1.3,6,4,'d','transition',208,175,null,2506,4876,13.31,[4],HCP,1923,[{a:180,ab:35.08}],null],
    [73,'Ta','Tantale','Tantalum',180.95,'[Xe] 4f¹⁴ 5d³ 6s²',1.5,6,5,'d','transition',200,170,null,3290,5731,16.654,[5],BCC,1802,[{a:181,ab:99.99}],null],
    [74,'W','Tungstène','Tungsten',183.84,'[Xe] 4f¹⁴ 5d⁴ 6s²',2.36,6,6,'d','transition',193,162,null,3695,5828,19.25,[2,3,4,5,6],BCC,1783,[{a:184,ab:30.64}],null],
    [75,'Re','Rhénium','Rhenium',186.21,'[Xe] 4f¹⁴ 5d⁵ 6s²',1.9,6,7,'d','transition',188,151,null,3459,5869,21.02,[-1,2,4,6,7],HCP,1925,[{a:187,ab:62.6}],null],
    [76,'Os','Osmium','Osmium',190.23,'[Xe] 4f¹⁴ 5d⁶ 6s²',2.2,6,8,'d','transition',185,144,null,3306,5285,22.61,[2,3,4,6,8],HCP,1803,[{a:192,ab:40.78}],'Métal le plus dense.'],
    [77,'Ir','Iridium','Iridium',192.22,'[Xe] 4f¹⁴ 5d⁷ 6s²',2.20,6,9,'d','transition',180,141,null,2719,4701,22.56,[1,2,3,4,6],FCC,1803,[{a:193,ab:62.7}],null],
    [78,'Pt','Platine','Platinum',195.08,'[Xe] 4f¹⁴ 5d⁹ 6s¹',2.28,6,10,'d','transition',177,136,175,2041.4,4098,21.46,[2,4],FCC,1735,[{a:195,ab:33.83}],null],
    [79,'Au','Or','Gold',196.97,'[Xe] 4f¹⁴ 5d¹⁰ 6s¹',2.54,6,11,'d','transition',174,136,166,1337.33,3129,19.282,[1,3],FCC,null,[{a:197,ab:100}],null],
    [80,'Hg','Mercure','Mercury',200.59,'[Xe] 4f¹⁴ 5d¹⁰ 6s²',2.00,6,12,'d','transition',171,132,155,234.32,629.88,13.5336,[1,2],RH,null,[{a:202,ab:29.86}],'Liquide à T ambiante.'],
    [81,'Tl','Thallium','Thallium',204.38,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹',1.62,6,13,'p','post-transition',156,145,196,577,1746,11.85,[1,3],HCP,1861,[{a:205,ab:70.48}],null],
    [82,'Pb','Plomb','Lead',207.2,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',2.33,6,14,'p','post-transition',154,146,202,600.61,2022,11.342,[2,4],FCC,null,[{a:208,ab:52.4}],null],
    [83,'Bi','Bismuth','Bismuth',208.98,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³',2.02,6,15,'p','post-transition',143,148,207,544.7,1837,9.807,[3,5],RH,null,[{a:209,ab:100}],null],
    [84,'Po','Polonium','Polonium',[209],'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴',2.0,6,16,'p','metalloide',135,140,197,527,1235,9.32,[-2,2,4,6],SC,1898,[{a:209,ab:null}],null],
    [85,'At','Astate','Astatine',[210],'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵',2.2,6,17,'p','halogene',null,150,202,575,610,null,[-1,1,3,5,7],null,1940,[{a:210,ab:null}],null],
    [86,'Rn','Radon','Radon',[222],'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶',null,6,18,'p','gaz-noble',120,150,220,202,211.45,0.00973,[0,2],FCC,1900,[{a:222,ab:null}],null],
    [87,'Fr','Francium','Francium',[223],'[Rn] 7s¹',0.7,7,1,'s','alcalin',null,260,348,300,950,1.87,[1],BCC,1939,[{a:223,ab:null}],null],
    [88,'Ra','Radium','Radium',[226],'[Rn] 7s²',0.9,7,2,'s','alcalino-terreux',null,221,283,973,2010,5.5,[2],BCC,1898,[{a:226,ab:null}],null],
    [89,'Ac','Actinium','Actinium',[227],'[Rn] 6d¹ 7s²',1.1,7,null,'d','actinide',null,215,null,1323,3471,10.07,[3],FCC,1899,[{a:227,ab:null}],null],
    [90,'Th','Thorium','Thorium',232.04,'[Rn] 6d² 7s²',1.3,7,null,'f','actinide',null,206,null,2115,5061,11.72,[4],FCC,1829,[{a:232,ab:100}],null],
    [91,'Pa','Protactinium','Protactinium',231.04,'[Rn] 5f² 6d¹ 7s²',1.5,7,null,'f','actinide',null,200,null,1841,4300,15.37,[3,4,5],TG,1913,[{a:231,ab:100}],null],
    [92,'U','Uranium','Uranium',238.03,'[Rn] 5f³ 6d¹ 7s²',1.38,7,null,'f','actinide',null,196,186,1405.3,4404,19.1,[3,4,5,6],OR,1789,[{a:238,ab:99.27},{a:235,ab:0.72}],null],
    [93,'Np','Neptunium','Neptunium',[237],'[Rn] 5f⁴ 6d¹ 7s²',1.36,7,null,'f','actinide',null,190,null,917,4273,20.45,[3,4,5,6,7],OR,1940,[{a:237,ab:null}],null],
    [94,'Pu','Plutonium','Plutonium',[244],'[Rn] 5f⁶ 7s²',1.28,7,null,'f','actinide',null,187,null,912.5,3501,19.816,[3,4,5,6],MO,1940,[{a:244,ab:null}],null],
    [95,'Am','Américium','Americium',[243],'[Rn] 5f⁷ 7s²',1.3,7,null,'f','actinide',null,180,null,1449,2880,12,[3,4,5,6],HX,1944,[{a:243,ab:null}],null],
    [96,'Cm','Curium','Curium',[247],'[Rn] 5f⁷ 6d¹ 7s²',1.3,7,null,'f','actinide',null,169,null,1613,3383,13.51,[3,4],HX,1944,[{a:247,ab:null}],null],
    [97,'Bk','Berkélium','Berkelium',[247],'[Rn] 5f⁹ 7s²',1.3,7,null,'f','actinide',null,null,null,1259,2900,14.78,[3,4],HX,1949,[{a:247,ab:null}],null],
    [98,'Cf','Californium','Californium',[251],'[Rn] 5f¹⁰ 7s²',1.3,7,null,'f','actinide',null,null,null,1173,1743,15.1,[2,3,4],HX,1950,[{a:251,ab:null}],null],
    [99,'Es','Einsteinium','Einsteinium',[252],'[Rn] 5f¹¹ 7s²',1.3,7,null,'f','actinide',null,null,null,1133,1269,8.84,[2,3],FCC,1952,[{a:252,ab:null}],null],
    [100,'Fm','Fermium','Fermium',[257],'[Rn] 5f¹² 7s²',1.3,7,null,'f','actinide',null,null,null,1800,null,null,[2,3],null,1952,[{a:257,ab:null}],null],
    [101,'Md','Mendélévium','Mendelevium',[258],'[Rn] 5f¹³ 7s²',1.3,7,null,'f','actinide',null,null,null,1100,null,null,[2,3],null,1955,[{a:258,ab:null}],null],
    [102,'No','Nobélium','Nobelium',[259],'[Rn] 5f¹⁴ 7s²',1.3,7,null,'f','actinide',null,null,null,1100,null,null,[2,3],null,1958,[{a:259,ab:null}],null],
    [103,'Lr','Lawrencium','Lawrencium',[266],'[Rn] 5f¹⁴ 7s² 7p¹',1.3,7,null,'p','actinide',null,null,null,1900,null,null,[3],null,1961,[{a:266,ab:null}],null],
    [104,'Rf','Rutherfordium','Rutherfordium',[267],'[Rn] 5f¹⁴ 6d² 7s²',null,7,4,'d','transition',null,null,null,null,null,null,[4],null,1964,[{a:267,ab:null}],null],
    [105,'Db','Dubnium','Dubnium',[268],'[Rn] 5f¹⁴ 6d³ 7s²',null,7,5,'d','transition',null,null,null,null,null,null,[5],null,1967,[{a:268,ab:null}],null],
    [106,'Sg','Seaborgium','Seaborgium',[269],'[Rn] 5f¹⁴ 6d⁴ 7s²',null,7,6,'d','transition',null,null,null,null,null,null,[6],null,1974,[{a:269,ab:null}],null],
    [107,'Bh','Bohrium','Bohrium',[270],'[Rn] 5f¹⁴ 6d⁵ 7s²',null,7,7,'d','transition',null,null,null,null,null,null,[7],null,1981,[{a:270,ab:null}],null],
    [108,'Hs','Hassium','Hassium',[277],'[Rn] 5f¹⁴ 6d⁶ 7s²',null,7,8,'d','transition',null,null,null,null,null,null,[8],null,1984,[{a:277,ab:null}],null],
    [109,'Mt','Meitnérium','Meitnerium',[278],'[Rn] 5f¹⁴ 6d⁷ 7s²',null,7,9,'d','inconnu',null,null,null,null,null,null,[],null,1982,[{a:278,ab:null}],null],
    [110,'Ds','Darmstadtium','Darmstadtium',[281],'[Rn] 5f¹⁴ 6d⁸ 7s²',null,7,10,'d','inconnu',null,null,null,null,null,null,[],null,1994,[{a:281,ab:null}],null],
    [111,'Rg','Roentgenium','Roentgenium',[282],'[Rn] 5f¹⁴ 6d⁹ 7s²',null,7,11,'d','inconnu',null,null,null,null,null,null,[],null,1994,[{a:282,ab:null}],null],
    [112,'Cn','Copernicium','Copernicium',[285],'[Rn] 5f¹⁴ 6d¹⁰ 7s²',null,7,12,'d','transition',null,null,null,null,null,null,[2],null,1996,[{a:285,ab:null}],null],
    [113,'Nh','Nihonium','Nihonium',[286],'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹',null,7,13,'p','post-transition',null,null,null,null,null,null,[1,3,5],null,2003,[{a:286,ab:null}],null],
    [114,'Fl','Flérovium','Flerovium',[289],'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²',null,7,14,'p','post-transition',null,null,null,null,null,null,[2,4],null,1998,[{a:289,ab:null}],null],
    [115,'Mc','Moscovium','Moscovium',[290],'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³',null,7,15,'p','post-transition',null,null,null,null,null,null,[1,3],null,2003,[{a:290,ab:null}],null],
    [116,'Lv','Livermorium','Livermorium',[293],'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴',null,7,16,'p','post-transition',null,null,null,null,null,null,[2,4],null,2000,[{a:293,ab:null}],null],
    [117,'Ts','Tennesse','Tennessine',[294],'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵',null,7,17,'p','halogene',null,null,null,null,null,null,[-1,1,3,5],null,2010,[{a:294,ab:null}],null],
    [118,'Og','Oganesson','Oganesson',[294],'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶',null,7,18,'p','gaz-noble',null,null,null,null,null,null,[0,2,4],null,2002,[{a:294,ab:null}],null],
  ];

  // Décompacte le tableau de tableaux en tableau d'objets.
  const ELEMENTS = D.map(row => {
    const obj = {};
    KEYS.forEach((k, i) => { obj[k] = row[i]; });
    return obj;
  });

  // Pour positionner les lanthanides/actinides, NumWorks affiche La/Ac
  // à leur "vraie" case (groupe 3, période 6/7) et la série en dessous.
  // On retourne une grille avec coordonnées (row, col) déjà calculées.
  function gridPosition(el) {
    if (el.cat === 'lanthanide' && el.z !== 71) return { row: 9, col: el.z - 57 + 3 };
    if (el.cat === 'actinide' && el.z !== 103) return { row: 10, col: el.z - 89 + 3 };
    // Cas particuliers : on affiche La (57) et Ac (89) en groupe 3.
    if (el.z === 57) return { row: 6, col: 3 };
    if (el.z === 89) return { row: 7, col: 3 };
    if (el.z === 71) return { row: 9, col: 17 };
    if (el.z === 103) return { row: 10, col: 17 };
    // Cas général.
    return { row: el.period, col: el.group };
  }

  GR.data = GR.data || {};
  GR.data.periodic = {
    elements: ELEMENTS,
    byZ: Object.fromEntries(ELEMENTS.map(e => [e.z, e])),
    bySym: Object.fromEntries(ELEMENTS.map(e => [e.sym, e])),
    gridPosition,
    categories: [
      ['alcalin', 'Alcalins'],
      ['alcalino-terreux', 'Alcalino-terreux'],
      ['transition', 'Métaux de transition'],
      ['post-transition', 'Métaux pauvres'],
      ['metalloide', 'Métalloïdes'],
      ['non-metal', 'Non-métaux'],
      ['halogene', 'Halogènes'],
      ['gaz-noble', 'Gaz nobles'],
      ['lanthanide', 'Lanthanides'],
      ['actinide', 'Actinides'],
      ['inconnu', 'Propriétés inconnues'],
    ],
  };

})(window.GR = window.GR || {});
