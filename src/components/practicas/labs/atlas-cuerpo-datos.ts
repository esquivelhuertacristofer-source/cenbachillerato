// =============================================================================
// Atlas del cuerpo humano — textos de BACHILLERATO.
// La ficha de cada sistema y la función de cada pieza importante, reescritas
// para bachillerato a partir del atlas de NEM básica (allá eran para primaria y
// secundaria): más precisas, con el vocabulario de Biología y Salud.
// Datos puros (sin three): seguro de importar desde el shell del lab.
// =============================================================================
import type { IdSistema } from "./atlas-cuerpo-nombres";

export interface InfoSistema {
  nombre: string;
  /** Rótulo corto para chips y botones. */
  corto: string;
  color: string;
  /** Ícono de Font Awesome (sin `fa-solid`). */
  icono: string;
  que: string;
  /** Piezas principales (llaves de NOMBRES), en el orden en que conviene verlas. */
  partes: string[];
  datos: string[];
  /** Cómo se relaciona con los otros sistemas. */
  enlace: string;
}

export const SISTEMA_INFO: Record<IdSistema, InfoSistema> = {
  esqueleto: {
    nombre: "Sistema óseo",
    corto: "Huesos",
    color: "#e8dcc4",
    icono: "fa-bone",
    que: "Los huesos forman el armazón del cuerpo: sostienen, protegen los órganos blandos (el cráneo al encéfalo, la caja torácica al corazón y los pulmones) y funcionan como palancas que los músculos mueven en las articulaciones. Además guardan calcio y fósforo, y en la médula ósea roja se forman las células de la sangre (hematopoyesis).",
    partes: ["Frontal bone", "Mandible", "Clavicle", "Scapula", "Body of sternum", "Humerus", "Radius", "Ulna", "Vertebra L3", "Hip bone", "Femur", "Patella", "Tibia", "Fibula", "Calcaneus"],
    datos: [
      "Un adulto tiene 206 huesos; al nacer hay unos 300 centros de osificación que se fusionan al crecer.",
      "El hueso es tejido vivo: los osteoblastos lo forman y los osteoclastos lo reabsorben toda la vida.",
      "El fémur es el hueso más largo y resistente; el estribo, en el oído medio, el más pequeño (unos 3 mm).",
      "Más de la mitad de los huesos están en manos y pies: permiten movimientos finos y repartir el peso.",
    ],
    enlace: "Con el muscular forma el aparato locomotor; con el circulatorio comparte la médula ósea, donde nacen los glóbulos rojos.",
  },
  musculos: {
    nombre: "Sistema muscular",
    corto: "Músculos",
    color: "#b4483f",
    icono: "fa-dumbbell",
    que: "El músculo esquelético se contrae cuando lo estimula una neurona motora: sus fibras se acortan y jalan del tendón, que mueve el hueso. Un músculo solo puede jalar, nunca empujar; por eso trabajan en pares antagonistas (agonista y antagonista). También mantienen la postura y producen calor.",
    partes: ["Frontalis muscle", "Sternocleidomastoid muscle", "Acromial part of deltoid muscle", "Sternocostal head of pectoralis major muscle", "Long head of biceps brachii", "Long head of triceps brachii", "Rectus abdominis muscle", "Latissimus dorsi muscle", "Gluteus maximus muscle", "Rectus femoris muscle", "Long head of biceps femoris", "Medial head of gastrocnemius", "Calcaneal tendon"],
    datos: [
      "El cuerpo tiene más de 600 músculos esqueléticos: cerca del 40 % de la masa corporal.",
      "Hay tres tipos de tejido muscular: esquelético (voluntario), cardiaco y liso (en vísceras y vasos).",
      "El glúteo mayor es el músculo más voluminoso; el sartorio, el más largo.",
      "La contracción gasta ATP: por eso el ejercicio exige más oxígeno y más glucosa.",
    ],
    enlace: "Depende del nervioso (que le da la orden), del circulatorio (que le lleva oxígeno y glucosa) y del respiratorio (que obtiene ese oxígeno).",
  },
  circulatorio: {
    nombre: "Sistema circulatorio",
    corto: "Circulatorio",
    color: "#c4262e",
    icono: "fa-heart-pulse",
    que: "El corazón es una bomba doble. El lado derecho manda la sangre pobre en oxígeno a los pulmones (circulación menor o pulmonar); el izquierdo bombea la sangre oxigenada a todo el cuerpo (circulación mayor o sistémica). Las arterias salen del corazón, las venas regresan a él y en los capilares se intercambian gases, nutrientes y desechos.",
    partes: ["Right atrium", "Right ventricle", "Left atrium", "Left ventricle", "Pulmonary trunk", "Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta", "Superior vena cava", "Inferior vena cava (abdominal part)", "Right common carotid artery", "Internal jugular vein", "Femoral artery"],
    datos: [
      "En reposo el corazón late de 60 a 100 veces por minuto y expulsa unos 70 mL por latido (volumen sistólico).",
      "Gasto cardiaco = frecuencia × volumen sistólico: unos 5 L por minuto en reposo, toda la sangre del cuerpo.",
      "Los colores son de convención: rojo = sangre oxigenada, azul = poco oxigenada. Por eso la arteria pulmonar va en azul.",
      "La pared del ventrículo izquierdo es la más gruesa: vence la resistencia de todo el circuito sistémico.",
    ],
    enlace: "Reparte el oxígeno que capta el respiratorio y los nutrientes que absorbe el digestivo; lleva los desechos al urinario y las hormonas del endocrino.",
  },
  respiratorio: {
    nombre: "Sistema respiratorio",
    corto: "Respiratorio",
    color: "#e7a2a3",
    icono: "fa-lungs",
    que: "Conduce el aire hasta los alvéolos, donde el oxígeno pasa a la sangre y el dióxido de carbono sale por difusión. La ventilación es mecánica: al contraerse, el diafragma baja y los intercostales externos elevan las costillas; el volumen del tórax aumenta, la presión dentro de los pulmones baja y el aire entra (ley de Boyle).",
    partes: ["Mucosa of nasal cavity", "Epiglottis", "Thyroid cartilage", "Trachea", "Right main bronchus", "Left main bronchus", "Superior lobe of right lung", "Middle lobe of right lung", "Inferior lobe of right lung", "Superior lobe of left lung", "Inferior lobe of left lung", "Diaphragm"],
    datos: [
      "En reposo respiramos de 12 a 20 veces por minuto y movemos unos 500 mL por respiración (volumen corriente).",
      "Ventilación pulmonar = frecuencia respiratoria × volumen corriente: unos 6 a 8 L de aire por minuto en reposo.",
      "Los alvéolos suman unos 70 m² de superficie de intercambio, casi media cancha de tenis.",
      "El pulmón derecho tiene tres lóbulos y el izquierdo dos: deja lugar al corazón (escotadura cardiaca).",
    ],
    enlace: "Le entrega el oxígeno al circulatorio, que lo lleva a las células para la respiración celular; el centro que marca el ritmo está en el bulbo raquídeo.",
  },
  digestivo: {
    nombre: "Sistema digestivo",
    corto: "Digestivo",
    color: "#d9825b",
    icono: "fa-utensils",
    que: "Transforma los alimentos en moléculas pequeñas que pueden absorberse. La digestión es mecánica (masticar, mezclar, peristalsis) y química (enzimas). El tubo digestivo va de la boca al ano; las glándulas anexas —salivales, hígado y páncreas— vierten sus secreciones en él.",
    partes: ["Tongue", "Parotid gland", "Oesophagus", "Stomach", "Liver", "Gallbladder", "Pancreas", "Duodenum", "Jejunum", "Ascending colon", "Transverse colon", "Descending colon", "Sigmoid colon", "Vermiform appendix"],
    datos: [
      "La amilasa salival empieza a digerir el almidón en la boca; la pepsina, las proteínas en el estómago.",
      "El intestino delgado mide de 6 a 7 m; sus vellosidades y microvellosidades multiplican la superficie de absorción.",
      "El hígado es la glándula más grande del cuerpo: produce bilis, guarda glucógeno y desintoxica la sangre.",
      "El intestino grueso absorbe agua y alberga la microbiota, que fabrica vitaminas como la K.",
    ],
    enlace: "Los nutrientes absorbidos pasan a la sangre (circulatorio); el páncreas también es glándula endocrina: produce insulina y glucagón.",
  },
  urinario: {
    nombre: "Sistema urinario",
    corto: "Urinario",
    color: "#d6b04a",
    icono: "fa-droplet",
    que: "Los riñones filtran la sangre en sus nefronas, reabsorben lo útil (agua, glucosa, sales) y eliminan los desechos nitrogenados, como la urea, en la orina. Así regulan el volumen de agua, las sales y el pH del cuerpo (homeostasis). La orina baja por los uréteres, se almacena en la vejiga y sale por la uretra.",
    partes: ["Kidney", "Renal pelvis", "Ureter", "Urinary bladder", "Urethra"],
    datos: [
      "Los riñones filtran unos 180 L de plasma al día y forman solo de 1 a 2 L de orina: reabsorben el 99 %.",
      "Cada riñón tiene alrededor de un millón de nefronas.",
      "Reciben cerca del 20 % del gasto cardiaco por las arterias renales.",
    ],
    enlace: "Limpia la sangre que trae el circulatorio; las glándulas suprarrenales, encima de cada riñón, son del endocrino.",
  },
  nervioso: {
    nombre: "Sistema nervioso",
    corto: "Nervioso",
    color: "#f0cf5c",
    icono: "fa-brain",
    que: "Recibe estímulos, los integra y elabora respuestas mediante impulsos eléctricos. El sistema nervioso central (encéfalo y médula espinal) procesa y decide; el periférico (nervios craneales y raquídeos) lleva la información de los receptores al centro y las órdenes del centro a músculos y glándulas.",
    partes: ["Frontal lobe", "Parietal lobe", "Temporal lobe", "Occipital lobe", "Corpus callosum", "Thalamus", "Hypothalamus", "Cerebellum", "Pons", "Medulla oblongata", "Spinal dura", "Optic nerve (II)", "Vagus nerve (X)", "Sciatic nerve"],
    datos: [
      "El encéfalo tiene unos 86 000 millones de neuronas y gasta cerca del 20 % de la energía del cuerpo en reposo.",
      "Los impulsos en fibras mielinizadas viajan a más de 100 m/s (más de 400 km/h).",
      "Cada hemisferio controla los movimientos del lado contrario del cuerpo.",
      "En un reflejo la médula responde antes de que el encéfalo se entere: es el arco reflejo.",
    ],
    enlace: "Coordina a todos los demás: ordena a los músculos, regula el latido y la respiración desde el tallo cerebral y controla al endocrino a través del hipotálamo.",
  },
  sentidos: {
    nombre: "Órganos de los sentidos",
    corto: "Sentidos",
    color: "#7fa3c9",
    icono: "fa-eye",
    que: "Contienen receptores que transforman un estímulo (luz, sonido, sustancias químicas, presión) en impulsos nerviosos: es la transducción sensorial. Aquí se ven el ojo y el oído por dentro.",
    partes: ["Cornea", "Iris", "Lens", "Posterior segment of eyeball", "Lacrimal gland", "Tympanic membrane", "Malleus", "Incus", "Stapes", "Cochlea", "Vestibule"],
    datos: [
      "La córnea y el cristalino enfocan la imagen en la retina, invertida; el encéfalo la interpreta.",
      "La cóclea transforma vibraciones en impulsos; el vestíbulo y los conductos semicirculares detectan el equilibrio.",
      "La piel es el órgano sensorial más extenso: tiene receptores de tacto, presión, temperatura y dolor.",
    ],
    enlace: "Son la entrada del sistema nervioso: sin receptores no hay información que procesar.",
  },
  endocrino: {
    nombre: "Sistema endocrino",
    corto: "Endocrino",
    color: "#c98fb0",
    icono: "fa-flask",
    que: "Sus glándulas vierten hormonas a la sangre; cada hormona actúa solo en las células que tienen su receptor (células blanco). Regula el metabolismo, el crecimiento, la glucosa en sangre, la respuesta al estrés y la reproducción, casi siempre con retroalimentación negativa.",
    partes: ["Adenohypophysis", "Neurohypophysis", "Pineal gland", "Thyroid gland", "Suprarenal gland", "Pancreas"],
    datos: [
      "El hipotálamo controla a la hipófisis, que a su vez controla a la tiroides, las suprarrenales y las gónadas.",
      "La tiroides necesita yodo para fabricar sus hormonas: por eso en México la sal es yodada.",
      "La insulina baja la glucosa en sangre y el glucagón la sube; si la insulina falla aparece la diabetes.",
    ],
    enlace: "Trabaja junto con el nervioso (eje hipotálamo-hipófisis) y usa al circulatorio como medio de transporte.",
  },
  linfatico: {
    nombre: "Sistema inmunitario y linfático",
    corto: "Linfático",
    color: "#8cc46a",
    icono: "fa-shield-virus",
    que: "Devuelve a la sangre el líquido que sale de los capilares (linfa) y defiende al cuerpo. Los ganglios filtran la linfa y en ellos se activan los linfocitos; el bazo filtra la sangre; el timo madura a los linfocitos T y las amígdalas vigilan la entrada de la faringe.",
    partes: ["Palatine tonsil", "Submandibular nodes", "Left lobe of thymus", "Right lobe of thymus", "Anterior axillary nodes", "Spleen", "Medial external iliac nodes", "Superficial popliteal nodes"],
    datos: [
      "Tenemos entre 500 y 700 ganglios linfáticos.",
      "Las vacunas generan memoria inmunológica sin que pasemos la enfermedad.",
      "El timo es más activo en la infancia y se va sustituyendo por grasa en la adultez.",
    ],
    enlace: "Recoge líquido del circulatorio y lo devuelve a las venas; los glóbulos blancos nacen en la médula ósea del sistema óseo.",
  },
  reproductor: {
    nombre: "Sistema reproductor",
    corto: "Reproductor",
    color: "#c97a9a",
    icono: "fa-venus-mars",
    que: "Produce gametos y hormonas sexuales. El atlas de esta práctica no incluye sus piezas.",
    partes: [],
    datos: [],
    enlace: "",
  },
};

const CRANEO = "Hueso plano del cráneo: con los demás forma la bóveda que protege al encéfalo. Se une a sus vecinos por suturas, articulaciones inmóviles.";
const HUESECILLO = "Huesecillo del oído medio. La cadena martillo–yunque–estribo transmite y amplifica la vibración del tímpano hacia la ventana oval del oído interno.";
const SALIVA = "Glándula salival: secreta saliva con amilasa (digiere el almidón) y moco que lubrica el bolo.";
const INTESTINO_GRUESO = "Tramo del colon (intestino grueso): absorbe agua y electrolitos, compacta las heces y aloja a la microbiota intestinal.";
const LOBULO_PULMON = "Lóbulo pulmonar: en sus alvéolos el O₂ difunde a la sangre y el CO₂ sale de ella. El pulmón derecho tiene tres lóbulos y el izquierdo dos.";
const VALVA = "Valva de una válvula cardiaca: se abre y se cierra por diferencia de presión para que la sangre circule en un solo sentido.";
const TRICEPS = "El tríceps braquial extiende el codo. Es el antagonista del bíceps: cuando uno se contrae, el otro se relaja.";
const BICEPS = "El bíceps braquial flexiona el codo y gira la palma hacia arriba (supinación). Su antagonista es el tríceps.";
const DELTOIDES = "El deltoides cubre el hombro y separa el brazo del tronco (abducción).";
const PECTORAL = "El pectoral mayor acerca el brazo al tronco y lo lleva hacia adelante, como al abrazar o empujar.";
const CUADRICEPS = "Parte del cuádriceps femoral: extiende la rodilla. Su antagonista son los isquiotibiales, detrás del muslo.";
const ISQUIO = "Isquiotibial: flexiona la rodilla y extiende la cadera. Es el antagonista del cuádriceps.";
const GEMELO = "El gastrocnemio (gemelo) forma la pantorrilla y, por el tendón calcáneo, levanta el talón (flexión plantar).";
const VENA_PULM = "Vena pulmonar: devuelve sangre OXIGENADA de los pulmones a la aurícula izquierda. Es la excepción: vena con sangre rica en oxígeno (por eso va en rojo).";
const ART_PULM = "Arteria pulmonar: lleva sangre POBRE en oxígeno del ventrículo derecho a los pulmones. Es la excepción: arteria con sangre poco oxigenada (por eso va en azul).";

const FUNCION: Record<string, string> = {
  // Esqueleto.
  Femur: "El hueso más largo y resistente del cuerpo; va de la cadera a la rodilla y soporta el peso al estar de pie y caminar.",
  "Frontal bone": `${CRANEO} Forma la frente y el techo de las órbitas.`,
  "Parietal bone": CRANEO,
  "Occipital bone": `${CRANEO} Por su agujero magno pasa la médula espinal.`,
  "Temporal bone": `${CRANEO} Por dentro aloja el oído medio e interno.`,
  "Sphenoid bone": `${CRANEO} En su silla turca se apoya la hipófisis.`,
  "Ethmoid bone": `${CRANEO} Su lámina cribosa deja pasar los nervios del olfato.`,
  Mandible: "El único hueso móvil del cráneo: se articula con el temporal (articulación temporomandibular) para masticar y hablar.",
  Maxilla: "Forma la arcada dental superior, parte del paladar y el piso de las órbitas.",
  Malleus: HUESECILLO,
  Incus: HUESECILLO,
  Stapes: `El hueso más pequeño del cuerpo. ${HUESECILLO}`,
  "Hyoid bone": "Hueso en herradura del cuello que sostiene la lengua; no se articula con ningún otro hueso.",
  Clavicle: "Une el miembro superior con el tronco (articulación esternoclavicular) y mantiene el hombro separado del tórax.",
  Scapula: "Hueso plano de la espalda; su cavidad glenoidea recibe la cabeza del húmero y forma el hombro.",
  Humerus: "Hueso del brazo, del hombro al codo. En él se insertan el deltoides, el bíceps y el tríceps.",
  Radius: "Hueso del antebrazo del lado del pulgar; gira alrededor del cúbito para voltear la mano (pronación y supinación).",
  Ulna: "Hueso del antebrazo del lado del meñique; su olécranon forma la punta del codo.",
  "Hip bone": "Hueso coxal: con el sacro forma la pelvis, transmite el peso del tronco a las piernas y protege la vejiga.",
  Sacrum: "Cinco vértebras fusionadas que unen la columna con la pelvis.",
  Coccyx: "Últimas vértebras, fusionadas: punto de anclaje de músculos y ligamentos del piso pélvico.",
  Patella: "Rótula: hueso sesamoideo dentro del tendón del cuádriceps; mejora la palanca para extender la rodilla.",
  Tibia: "Hueso principal de la pierna: transmite el peso del fémur al pie.",
  Fibula: "Peroné: hueso delgado de la pierna; da inserción a músculos y estabiliza el tobillo.",
  Calcaneus: "Hueso del talón: recibe el peso al pisar y en él se inserta el tendón calcáneo (de Aquiles).",
  "Body of sternum": "Cuerpo del esternón: en él se unen los cartílagos costales; cierra por delante la caja torácica.",
  "Manubrium of sternum": "Parte superior del esternón, donde se articulan las clavículas.",
  "Xiphoid process": "Extremo inferior del esternón; da inserción al diafragma y a músculos abdominales.",
  "Atlas (C1)": "Primera vértebra cervical: sostiene el cráneo y permite el movimiento de «sí».",
  "Axis (C2)": "Segunda vértebra cervical: su apófisis odontoides es el eje del giro de «no».",
  // Encéfalo.
  "Frontal lobe": "Lóbulo frontal: planeación, toma de decisiones y control de impulsos; su corteza motora ordena los movimientos voluntarios y el área de Broca participa en el habla.",
  "Parietal lobe": "Lóbulo parietal: corteza somatosensorial (tacto, dolor, temperatura) y orientación del cuerpo en el espacio.",
  "Temporal lobe": "Lóbulo temporal: audición, comprensión del lenguaje (área de Wernicke) y memoria.",
  "Occipital lobe": "Lóbulo occipital: corteza visual. Aquí se procesa lo que captan los ojos.",
  Insula: "Ínsula: corteza oculta bajo los otros lóbulos; participa en el gusto y en percibir el estado interno del cuerpo.",
  "Limbic lobe": "Lóbulo límbico: emociones, motivación y memoria.",
  "Corpus callosum": "Cuerpo calloso: haz de unos 200 millones de axones que comunica el hemisferio izquierdo con el derecho.",
  Diencephalon: "Diencéfalo: contiene el tálamo y el hipotálamo; reparte la información sensorial y regula funciones vitales.",
  Cerebellum: "Cerebelo: coordina el movimiento, el equilibrio y la postura, y ajusta la precisión de cada movimiento.",
  Midbrain: "Mesencéfalo: reflejos visuales y auditivos y movimientos de los ojos.",
  Pons: "Puente (protuberancia): conecta el cerebro con el cerebelo y ayuda a regular el ritmo respiratorio.",
  "Medulla oblongata": "Bulbo raquídeo: centros que controlan la respiración, la frecuencia cardiaca y la presión arterial. Se continúa con la médula espinal.",
  // Corazón.
  "Left ventricle": "Ventrículo izquierdo: bombea sangre oxigenada a la aorta y a toda la circulación sistémica; su miocardio es el más grueso porque vence la mayor resistencia.",
  "Right ventricle": "Ventrículo derecho: bombea sangre poco oxigenada al tronco pulmonar, hacia los pulmones (circulación menor). Su pared es más delgada: el circuito pulmonar ofrece poca resistencia.",
  "Right atrium": "Aurícula derecha: recibe la sangre poco oxigenada que regresa del cuerpo por las venas cavas. Aquí está el nodo sinusal, el marcapasos natural.",
  "Left atrium": "Aurícula izquierda: recibe la sangre oxigenada que llega de los pulmones por las venas pulmonares.",
  // Respiratorio.
  Trachea: "Tráquea: tubo reforzado con anillos de cartílago en forma de C que impiden que se colapse; su epitelio con cilios y moco atrapa partículas.",
  Diaphragm: "Diafragma: el músculo principal de la inspiración. Al contraerse baja, aumenta el volumen del tórax, la presión intrapulmonar disminuye y el aire entra.",
  Epiglottis: "Epiglotis: cartílago que cierra la entrada de la laringe al tragar, para que el bolo vaya al esófago y no a las vías respiratorias.",
  "Thyroid cartilage": "Cartílago tiroides: el más grande de la laringe; protege las cuerdas vocales («manzana de Adán»).",
  "Cricoid cartilage": "Cartílago cricoides: anillo completo en la base de la laringe, sobre la tráquea.",
  "Right main bronchus": "Bronquio principal derecho: más corto, ancho y vertical que el izquierdo; por eso los objetos aspirados suelen irse a la derecha.",
  "Left main bronchus": "Bronquio principal izquierdo: más largo y horizontal, pasa bajo el arco de la aorta.",
  // Digestivo.
  Tongue: "Lengua: músculo que mezcla el alimento con la saliva, forma el bolo y lo empuja al tragar; tiene las papilas gustativas.",
  "Parotid gland": `${SALIVA} Es la glándula salival más grande.`,
  "Sublingual gland": SALIVA,
  "Submandibular gland": SALIVA,
  "Uvula of palate": "Úvula: al tragar, el paladar blando sube y cierra el paso hacia la nasofaringe.",
  Oesophagus: "Esófago: tubo muscular que lleva el bolo de la faringe al estómago mediante peristalsis; no digiere ni absorbe.",
  Stomach: "Estómago: almacena y mezcla el alimento con jugo gástrico (HCl y pepsina): inicia la digestión de proteínas y forma el quimo. Absorbe muy poco (agua, alcohol).",
  Liver: "Hígado: la glándula más grande. Produce bilis (emulsiona las grasas), almacena glucógeno, sintetiza proteínas de la sangre y desintoxica sustancias.",
  Gallbladder: "Vesícula biliar: almacena y concentra la bilis y la libera al duodeno cuando llegan grasas.",
  Pancreas: "Páncreas: glándula mixta. Su parte exocrina vierte enzimas digestivas (lipasa, amilasa, tripsina) al duodeno; la endocrina libera insulina y glucagón a la sangre.",
  Duodenum: "Duodeno: primer tramo del intestino delgado; recibe la bilis y el jugo pancreático, que neutraliza la acidez del quimo y continúa la digestión química.",
  Jejunum: "Intestino delgado (yeyuno-íleon): aquí se absorbe la mayor parte de los nutrientes, a través de vellosidades y microvellosidades que multiplican su superficie.",
  "Ascending colon": INTESTINO_GRUESO,
  "Transverse colon": INTESTINO_GRUESO,
  "Descending colon": INTESTINO_GRUESO,
  "Sigmoid colon": `${INTESTINO_GRUESO} El sigmoide conduce las heces al recto.`,
  "Vermiform appendix": "Apéndice vermiforme: tubo ciego con tejido linfoide unido al ciego. Si se obstruye e inflama, hay apendicitis.",
  "Bile duct": "Colédoco: lleva la bilis del hígado y la vesícula al duodeno.",
  "Pancreatic duct": "Conducto pancreático: lleva el jugo pancreático al duodeno.",
  Gingiva: "Encía: mucosa que cubre el hueso alveolar y sujeta los dientes.",
  // Urinario.
  Kidney: "Riñón: en sus nefronas filtra la sangre, reabsorbe agua, glucosa y sales, y secreta desechos; así forma la orina y regula el agua y el pH del cuerpo.",
  "Renal pelvis": "Pelvis renal: embudo que recoge la orina de los cálices y la pasa al uréter.",
  Ureter: "Uréter: conduce la orina del riñón a la vejiga con ondas peristálticas.",
  "Urinary bladder": "Vejiga: órgano muscular elástico que almacena la orina hasta la micción.",
  Urethra: "Uretra: conducto por donde la orina sale del cuerpo.",
  // Sentidos.
  Cornea: "Córnea: capa transparente al frente del ojo; es la que más desvía (refracta) la luz para enfocar.",
  Iris: "Iris: músculo pigmentado que regula el diámetro de la pupila según la cantidad de luz.",
  Lens: "Cristalino: lente biconvexa que cambia de forma para enfocar objetos cercanos y lejanos (acomodación).",
  "Posterior segment of eyeball": "Segmento posterior del ojo: contiene la retina, con conos y bastones que transforman la luz en impulsos nerviosos.",
  "Anterior segment of eyeball": "Segmento anterior del ojo: entre la córnea y el cristalino, lleno de humor acuoso.",
  "Tympanic membrane": "Tímpano: membrana que vibra con las ondas sonoras y transmite la vibración a los huesecillos.",
  Cochlea: "Cóclea (caracol): su órgano de Corti transforma las vibraciones en impulsos nerviosos auditivos.",
  Vestibule: "Vestíbulo: detecta la posición de la cabeza y la aceleración lineal; con los conductos semicirculares mantiene el equilibrio.",
  "Mucosa of nasal cavity": "Mucosa nasal: calienta, humedece y filtra el aire; en su techo está el epitelio olfatorio.",
  "Lacrimal gland": "Glándula lagrimal: produce las lágrimas, que lubrican el ojo y contienen lisozima antibacteriana.",
  // Músculos.
  "Long head of biceps brachii": BICEPS,
  "Short head of biceps brachii": BICEPS,
  "Long head of triceps brachii": TRICEPS,
  "Lateral head of triceps brachii": TRICEPS,
  "Medial head of triceps brachii": TRICEPS,
  "Acromial part of deltoid muscle": DELTOIDES,
  "Clavicular part of deltoid muscle": `${DELTOIDES} Su parte clavicular también lo lleva hacia adelante.`,
  "Scapular spinal part of deltoid muscle": `${DELTOIDES} Su parte espinal también lo lleva hacia atrás.`,
  "Sternocostal head of pectoralis major muscle": PECTORAL,
  "Clavicular head of pectoralis major muscle": PECTORAL,
  "Abdominal part of pectoralis major muscle": PECTORAL,
  "Rectus abdominis muscle": "Recto del abdomen: flexiona el tronco y comprime las vísceras (ayuda en la espiración forzada).",
  "Gluteus maximus muscle": "Glúteo mayor: el músculo más voluminoso; extiende la cadera para levantarse, subir escaleras y correr.",
  "Rectus femoris muscle": `${CUADRICEPS} El recto femoral además flexiona la cadera.`,
  "Vastus lateralis muscle": CUADRICEPS,
  "Vastus medialis muscle": CUADRICEPS,
  "Vastus intermedius muscle": CUADRICEPS,
  "Long head of biceps femoris": ISQUIO,
  "Short head of biceps femoris": ISQUIO,
  "Semitendinosus muscle": ISQUIO,
  "Sartorius muscle": "Sartorio: el músculo más largo del cuerpo; flexiona la cadera y la rodilla (postura de sastre).",
  "Medial head of gastrocnemius": GEMELO,
  "Lateral head of gastrocnemius": GEMELO,
  "Soleus muscle": "Sóleo: bajo el gemelo; flexión plantar sostenida, clave para mantenerse de pie.",
  "Calcaneal tendon": "Tendón calcáneo (de Aquiles): el más fuerte del cuerpo; une el gemelo y el sóleo con el calcáneo. Un tendón une músculo con hueso.",
  "Descending part of trapezius muscle": "Trapecio (porción descendente): eleva los hombros y extiende el cuello.",
  "Latissimus dorsi muscle": "Dorsal ancho: lleva el brazo hacia abajo y atrás (aducción y extensión), como al trepar o nadar.",
  "Sternocleidomastoid muscle": "Esternocleidomastoideo: gira la cabeza hacia el lado contrario y la flexiona; ayuda en la inspiración forzada.",
  "Frontalis muscle": "Frontal: eleva las cejas y arruga la frente. Los músculos de la cara se insertan en la piel: por eso hacen gestos.",
  "Orbicularis oris muscle": "Orbicular de la boca: cierra y frunce los labios.",
  "Zygomaticus major muscle": "Cigomático mayor: eleva la comisura de la boca; es el músculo de la sonrisa.",
  "Temporalis muscle": "Temporal: eleva la mandíbula para morder.",
  "Superficial part of masseter": "Masetero: eleva la mandíbula con gran fuerza al masticar.",
  "External intercostal muscles": "Intercostales externos: elevan las costillas en la inspiración y amplían el tórax.",
  "Internal intercostal muscles": "Intercostales internos: bajan las costillas en la espiración forzada.",
  // Circulatorio.
  "Ascending aorta": "Aorta ascendente: inicio de la arteria más grande; sale del ventrículo izquierdo y de ella nacen las coronarias.",
  "Aortic arch": "Arco aórtico: de él salen el tronco braquiocefálico, la carótida común izquierda y la subclavia izquierda, hacia la cabeza y los brazos.",
  "Thoracic aorta": "Aorta torácica: desciende junto a la columna e irriga la pared del tórax, el esófago y los bronquios.",
  "Abdominal aorta": "Aorta abdominal: irriga las vísceras del abdomen y los riñones; luego se divide en las ilíacas hacia las piernas.",
  "Superior vena cava": "Vena cava superior: devuelve a la aurícula derecha la sangre de la cabeza, el cuello y los brazos.",
  "Inferior vena cava (abdominal part)": "Vena cava inferior: la vena más grande; devuelve al corazón la sangre del abdomen y las piernas.",
  "Inferior vena cava (thoracic part)": "Último tramo de la vena cava inferior antes de entrar a la aurícula derecha.",
  "Pulmonary trunk": `Tronco pulmonar: sale del ventrículo derecho y se divide en las arterias pulmonares. ${ART_PULM}`,
  "Bifurcation of pulmonary trunk": ART_PULM,
  "Right pulmonary artery": ART_PULM,
  "Left pulmonary artery": ART_PULM,
  "Right superior pulmonary vein": VENA_PULM,
  "Right inferior pulmonary vein": VENA_PULM,
  "Left superior pulmonary vein": VENA_PULM,
  "Left inferior pulmonary vein": VENA_PULM,
  "Right common carotid artery": "Arteria carótida común: lleva sangre a la cabeza y al encéfalo; en el cuello se palpa el pulso.",
  "Left common carotid artery": "Arteria carótida común: lleva sangre a la cabeza y al encéfalo; en el cuello se palpa el pulso.",
  "Internal jugular vein": "Vena yugular interna: drena la sangre del encéfalo y de la cara.",
  "Femoral artery": "Arteria femoral: irriga el muslo y la pierna; se palpa en la ingle.",
  "Radial artery": "Arteria radial: pasa por la muñeca del lado del pulgar; ahí se toma el pulso.",
  "Right coronary artery": "Arteria coronaria: irriga el propio miocardio. Si se obstruye, hay infarto.",
  "Left coronary artery": "Arteria coronaria: irriga el propio miocardio. Si se obstruye, hay infarto.",
  "Coronary sinus": "Seno coronario: recoge la sangre venosa del miocardio y la vierte a la aurícula derecha.",
  "Hepatic portal vein": "Vena porta: lleva al hígado la sangre de los intestinos, cargada de nutrientes, para procesarla.",
  "Great saphenous vein": "Safena mayor: la vena más larga del cuerpo; sube por la cara interna de la pierna, bajo la piel.",
  // Nervioso.
  "Spinal dura": "Duramadre espinal: la meninge más externa; envuelve la médula espinal, que conduce impulsos entre el encéfalo y el cuerpo y coordina reflejos.",
  Thalamus: "Tálamo: estación de relevo; recibe casi toda la información sensorial (salvo el olfato) y la distribuye a la corteza.",
  Hypothalamus: "Hipotálamo: regula la temperatura, el hambre, la sed y el ciclo de sueño; controla a la hipófisis y une el sistema nervioso con el endocrino.",
  Hippocampus: "Hipocampo: consolida los recuerdos nuevos y participa en la orientación espacial.",
  "Amygdaloid body": "Amígdala cerebral: procesa el miedo y otras emociones.",
  "Lateral ventricle": "Ventrículo lateral: cavidad con líquido cefalorraquídeo, que amortigua y nutre al encéfalo.",
  "Third ventricle": "Tercer ventrículo: cavidad con líquido cefalorraquídeo entre las dos mitades del tálamo.",
  "Fourth ventricle": "Cuarto ventrículo: cavidad con líquido cefalorraquídeo entre el tallo cerebral y el cerebelo.",
  "Caudate nucleus": "Núcleo caudado: ganglio basal que participa en el control del movimiento y el aprendizaje.",
  Putamen: "Putamen: ganglio basal que regula el movimiento; se afecta en el Parkinson.",
  "Optic chiasm": "Quiasma óptico: cruce parcial de las fibras de los nervios ópticos; cada hemisferio recibe la mitad del campo visual.",
  "Optic nerve (II)": "Nervio óptico (II): lleva la información visual de la retina al encéfalo.",
  "Olfactory nerve (I)": "Nervio olfatorio (I): lleva al encéfalo la información de los olores.",
  "Vestibulocochlear nerve (VIII)": "Nervio vestibulococlear (VIII): conduce la audición y el equilibrio.",
  "Facial nerve (VII)": "Nervio facial (VII): mueve los músculos de la expresión facial y lleva el gusto de los dos tercios anteriores de la lengua.",
  "Vagus nerve (X)": "Nervio vago (X): parasimpático; baja hasta el abdomen y reduce la frecuencia cardiaca, regula la respiración y estimula la digestión.",
  "Hypoglossal nerve (XII)": "Nervio hipogloso (XII): mueve la lengua.",
  "Sciatic nerve": "Nervio ciático: el más grueso y largo del cuerpo; baja por detrás del muslo e inerva casi toda la pierna.",
  "Ulnar nerve": "Nervio cubital: pasa detrás del codo, bajo la piel (el «hueso de la risa»); mueve músculos finos de la mano.",
  "Median nerve": "Nervio mediano: inerva los flexores del antebrazo y da sensibilidad al pulgar, índice y medio; se comprime en el túnel del carpo.",
  "Radial nerve": "Nervio radial: inerva a los extensores del codo, la muñeca y los dedos.",
  "Intercostal nerves": "Nervios intercostales: inervan los músculos intercostales que mueven las costillas al respirar.",
  // Endocrino.
  Adenohypophysis: "Adenohipófisis: produce hormona del crecimiento, prolactina y las hormonas que estimulan a la tiroides, las suprarrenales y las gónadas.",
  Neurohypophysis: "Neurohipófisis: libera la antidiurética (ADH), que hace que el riñón ahorre agua, y la oxitocina.",
  "Pineal gland": "Glándula pineal: secreta melatonina en la oscuridad y regula el ritmo circadiano.",
  "Thyroid gland": "Tiroides: sus hormonas (T3 y T4) regulan la velocidad del metabolismo; necesita yodo.",
  "Suprarenal gland": "Glándula suprarrenal: su médula libera adrenalina (respuesta de lucha o huida) y su corteza, cortisol y aldosterona.",
  // Linfático.
  Spleen: "Bazo: filtra la sangre, destruye los glóbulos rojos viejos y aloja linfocitos que responden a infecciones de la sangre.",
  "Left lobe of thymus": "Timo: aquí maduran los linfocitos T. Es más activo en la infancia.",
  "Right lobe of thymus": "Timo: aquí maduran los linfocitos T. Es más activo en la infancia.",
  "Palatine tonsil": "Amígdala palatina: tejido linfoide que vigila lo que entra por la boca y la nariz.",
};

export function funcionDe(clave: string): string | null {
  if (FUNCION[clave]) return FUNCION[clave];
  if (/^Vertebra/.test(clave)) return "Vértebra: las vértebras apiladas forman la columna, que sostiene el tronco, permite flexionarlo y protege la médula espinal en su conducto.";
  if (/ rib$/.test(clave)) return "Costilla: con el esternón y las vértebras forma la caja torácica, que protege corazón y pulmones y se eleva en la inspiración.";
  if (/^Costal cartilage/.test(clave)) return "Cartílago costal: une la costilla con el esternón y da flexibilidad al tórax para que se expanda al respirar.";
  if (/phalanx/.test(clave)) return "Falange: hueso de los dedos; dos en el pulgar y tres en los demás dedos.";
  if (/metacarpal/.test(clave)) return "Metacarpiano: hueso de la palma de la mano.";
  if (/metatarsal/.test(clave)) return "Metatarsiano: hueso de la planta del pie; forma el arco que reparte el peso.";
  if (/incisor/.test(clave)) return "Incisivo: corta el alimento (digestión mecánica).";
  if (/canine/.test(clave)) return "Canino: desgarra el alimento.";
  if (/premolar|molar/.test(clave)) return "Premolar o molar: muele y tritura el alimento.";
  if (/lobe of (left|right) lung/.test(clave)) return LOBULO_PULMON;
  if (/bronch/.test(clave)) return "Bronquio: rama del árbol bronquial que conduce el aire hacia un segmento del pulmón; termina en bronquiolos y alvéolos.";
  if (/leaflet/.test(clave)) return VALVA;
  if (/papillary/.test(clave)) return "Músculo papilar: tensa las cuerdas tendinosas para que las válvulas auriculoventriculares no se volteen al cerrarse.";
  if (/nasal septal|alar cartilage/.test(clave)) return "Cartílago nasal: da forma a la nariz; es flexible, por eso la punta se dobla.";
  if (/Arytenoid|Corniculate/.test(clave)) return "Cartílago de la laringe: mueve y tensa las cuerdas vocales.";
  if (/tendon/i.test(clave)) return "Tendón: tejido conectivo denso que une un músculo con un hueso y le transmite la fuerza de la contracción.";
  if (/muscle|^Vastus|head of /.test(clave)) return "Músculo esquelético: se contrae (se acorta) y jala del tendón para mover un hueso o la piel. Trabaja con un antagonista.";
  if (/ nodes?$/.test(clave)) return "Ganglio linfático: filtra la linfa; en él los linfocitos reconocen microbios. Se inflama durante una infección.";
  if (/ vein|^Vena|sinus/i.test(clave)) return "Vena: devuelve la sangre al corazón; tiene paredes delgadas y, en las piernas, válvulas que impiden el reflujo.";
  if (/arter|aorta|trunk$/i.test(clave)) return "Arteria: lleva la sangre que sale del corazón; su pared muscular y elástica soporta presión alta.";
  if (/nerve|plexus/.test(clave)) return "Nervio: haz de axones del sistema nervioso periférico que lleva impulsos entre el sistema nervioso central y el cuerpo.";
  if (/lobe$|gyrus|sulcus/.test(clave)) return "Región de la corteza cerebral, donde se procesan los sentidos, el movimiento y el pensamiento.";
  return null;
}
