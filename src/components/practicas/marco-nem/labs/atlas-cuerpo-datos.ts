/* eslint-disable -- Código portado tal cual de NEM; las reglas de React Compiler de CEN no aplican a escenas three.js. */
// Textos del Atlas del cuerpo humano: la ficha de cada sistema, qué hace cada
// pieza importante y las clases guiadas. Dichos para bachillerato.
import type { IdSistema } from "./atlas-cuerpo-nombres";
import type { ModoHueso, ModoVista } from "./AtlasCuerpoScene";

export interface InfoSistema {
  nombre: string;
  /** Cómo se llama en los libros cuando hay otro nombre. */
  tambien?: string;
  color: string;
  icono: string;
  que: string;
  /** Piezas principales (llaves de NOMBRES), en el orden en que conviene verlas. */
  partes: string[];
  datos: string[];
  cuida: string;
}

export const SISTEMA_INFO: Record<IdSistema, InfoSistema> = {
  esqueleto: {
    nombre: "Sistema óseo",
    tambien: "El esqueleto",
    color: "#e8dcc4",
    icono: "fa-solid fa-bone",
    que: "Los huesos sostienen el cuerpo, protegen los órganos blandos (el cráneo al encéfalo; las costillas al corazón y a los pulmones) y, junto con los músculos, nos permiten movernos. Dentro de algunos huesos, en la médula ósea, se fabrican las células de la sangre.",
    partes: ["Frontal bone", "Mandible", "Clavicle", "Scapula", "Body of sternum", "Humerus", "Radius", "Ulna", "Vertebra L3", "Hip bone", "Femur", "Patella", "Tibia", "Fibula"],
    datos: [
      "Una persona adulta tiene 206 huesos. Un bebé nace con alrededor de 300: varios se sueldan al crecer.",
      "El hueso más largo es el fémur; el más pequeño, el estribo, dentro del oído.",
      "Más de la mitad de los huesos están en las manos y los pies.",
      "Los huesos están vivos: crecen y se reparan cuando se rompen.",
    ],
    cuida: "Come alimentos con calcio (leche, tortilla de maíz nixtamalizado, frijoles), toma el sol un rato y haz ejercicio: el hueso se fortalece cuando trabaja.",
  },
  musculos: {
    nombre: "Sistema muscular",
    color: "#b4483f",
    icono: "fa-solid fa-dumbbell",
    que: "Los músculos se contraen (se hacen más cortos) y así jalan de los huesos para movernos. También sostienen la postura, mueven la cara para hacer gestos y producen calor.",
    partes: ["Frontalis muscle", "Orbicularis oris muscle", "Sternocleidomastoid muscle", "Acromial part of deltoid muscle", "Sternocostal head of pectoralis major muscle", "Long head of biceps brachii", "Long head of triceps brachii", "Rectus abdominis muscle", "Descending part of trapezius muscle", "Latissimus dorsi muscle", "Gluteus maximus muscle", "Rectus femoris muscle", "Sartorius muscle", "Medial head of gastrocnemius", "Calcaneal tendon"],
    datos: [
      "El cuerpo tiene más de 600 músculos.",
      "Un músculo solo puede jalar, nunca empujar: por eso trabajan en parejas, como el bíceps y el tríceps.",
      "El músculo más grande es el glúteo mayor; el más pequeño está en el oído.",
      "El corazón también es un músculo, pero trabaja solo, sin que tú se lo ordenes.",
    ],
    cuida: "Muévete todos los días, calienta antes de hacer ejercicio y come proteína (frijol, huevo, pescado): con ella se reparan los músculos.",
  },
  circulatorio: {
    nombre: "Sistema circulatorio",
    color: "#c4262e",
    icono: "fa-solid fa-heart-pulse",
    que: "El corazón bombea la sangre por un circuito de tubos: las arterias la llevan del corazón a todo el cuerpo y las venas la regresan. La sangre reparte el oxígeno y los nutrientes, y recoge los desechos.",
    partes: ["Left ventricle", "Right ventricle", "Left atrium", "Right atrium", "Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta", "Superior vena cava", "Inferior vena cava (abdominal part)", "Pulmonary trunk", "Right common carotid artery", "Internal jugular vein", "Femoral artery", "Radial artery"],
    datos: [
      "El corazón late unas 100 000 veces al día.",
      "Puestos en fila, los vasos sanguíneos de un adulto medirían unos 100 000 km: más de dos vueltas a la Tierra.",
      "En los dibujos, el rojo es sangre con oxígeno y el azul sangre con poco oxígeno. La sangre de verdad nunca es azul.",
      "A los pulmones va sangre sin oxígeno por arterias, y regresa con oxígeno por venas: por eso ahí los colores se invierten.",
    ],
    cuida: "Haz ejercicio que te haga respirar rápido, come poca sal y poca grasa, y nunca fumes.",
  },
  respiratorio: {
    nombre: "Sistema respiratorio",
    color: "#e7a2a3",
    icono: "fa-solid fa-lungs",
    que: "Lleva el aire de la nariz a los pulmones. Ahí el oxígeno pasa a la sangre y el dióxido de carbono sale. El diafragma, un músculo debajo de los pulmones, hace que el aire entre y salga.",
    partes: ["Mucosa of nasal cavity", "Epiglottis", "Thyroid cartilage", "Trachea", "Right main bronchus", "Left main bronchus", "Superior lobe of right lung", "Middle lobe of right lung", "Inferior lobe of right lung", "Superior lobe of left lung", "Inferior lobe of left lung", "Diaphragm"],
    datos: [
      "En reposo, una persona adulta respira de 12 a 20 veces por minuto; una niña o un niño, más.",
      "La nariz calienta, humedece y filtra el aire antes de que llegue a los pulmones.",
      "El pulmón izquierdo es más pequeño: tiene dos lóbulos y deja un hueco para el corazón.",
      "Los bronquios se ramifican como un árbol puesto de cabeza.",
    ],
    cuida: "Respira por la nariz, aléjate del humo del cigarro y de la leña en lugares cerrados, y lávate las manos para no enfermarte de las vías respiratorias.",
  },
  digestivo: {
    nombre: "Sistema digestivo",
    color: "#d9825b",
    icono: "fa-solid fa-utensils",
    que: "Deshace la comida en partes tan pequeñas que la sangre las puede llevar a todo el cuerpo. Empieza en la boca, sigue por el esófago, el estómago y los intestinos; el hígado y el páncreas le ayudan con sus jugos.",
    partes: ["Tongue", "Upper first molar tooth", "Parotid gland", "Oesophagus", "Stomach", "Liver", "Gallbladder", "Pancreas", "Duodenum", "Jejunum", "Ascending colon", "Transverse colon", "Descending colon", "Sigmoid colon", "Vermiform appendix"],
    datos: [
      "La digestión empieza en la boca: los dientes trituran y la saliva empieza a deshacer la comida.",
      "El intestino delgado mide unos 6 metros: cabe enrollado dentro del abdomen.",
      "El hígado es el órgano interno más grande.",
      "La comida tarda de uno a tres días en recorrer todo el camino.",
    ],
    cuida: "Come como el Plato del Bien Comer (verduras, frutas, cereales y leguminosas), mastica bien, toma agua simple y lávate las manos antes de comer.",
  },
  urinario: {
    nombre: "Sistema urinario",
    tambien: "Sistema excretor",
    color: "#d6b04a",
    icono: "fa-solid fa-droplet",
    que: "Los riñones limpian la sangre: le quitan desechos y el agua que sobra, y con eso forman la orina. La orina baja por los uréteres, se guarda en la vejiga y sale por la uretra.",
    partes: ["Kidney", "Renal pelvis", "Ureter", "Urinary bladder", "Urethra"],
    datos: [
      "Los riñones filtran unos 180 litros de sangre al día: toda tu sangre pasa por ellos muchas veces.",
      "Cada día formamos alrededor de litro y medio de orina.",
      "Tenemos dos riñones, del tamaño de un puño, a los lados de la columna, a la altura de la cintura.",
    ],
    cuida: "Toma agua simple durante el día, no aguantes las ganas de ir al baño y evita los refrescos.",
  },
  nervioso: {
    nombre: "Sistema nervioso",
    color: "#f0cf5c",
    icono: "fa-solid fa-brain",
    que: "Es la red de mensajes del cuerpo. El encéfalo y la médula espinal (el sistema nervioso central) reciben lo que captan los sentidos, deciden y mandan órdenes; los nervios llevan esos mensajes a todo el cuerpo.",
    partes: ["Frontal lobe", "Parietal lobe", "Temporal lobe", "Occipital lobe", "Cerebellum", "Medulla oblongata", "Thalamus", "Hippocampus", "Spinal dura", "Optic nerve (II)", "Vagus nerve (X)", "Intercostal nerves", "Median nerve", "Ulnar nerve", "Sciatic nerve"],
    datos: [
      "El encéfalo tiene alrededor de 86 000 millones de neuronas.",
      "Los mensajes más rápidos viajan por los nervios a más de 400 km por hora.",
      "La médula espinal va protegida dentro de la columna vertebral.",
      "Cuando tocas algo muy caliente, la médula ordena retirar la mano antes de que el cerebro se dé cuenta: es un reflejo.",
    ],
    cuida: "Duerme bien (de 8 a 10 horas en la adolescencia), usa casco en bicicleta y aprende cosas nuevas: el encéfalo se fortalece cuando lo usas.",
  },
  sentidos: {
    nombre: "Órganos de los sentidos",
    color: "#7fa3c9",
    icono: "fa-solid fa-eye",
    que: "Captan lo que pasa afuera (la luz, los sonidos, los olores, los sabores, el tacto) y lo convierten en mensajes que los nervios llevan al encéfalo. Aquí están el ojo y el oído por dentro.",
    partes: ["Cornea", "Iris", "Lens", "Posterior segment of eyeball", "Lacrimal gland", "Tympanic membrane", "Malleus", "Incus", "Stapes", "Cochlea", "Vestibule"],
    datos: [
      "Tenemos cinco sentidos clásicos: vista, oído, olfato, gusto y tacto. La piel es el órgano del tacto.",
      "La imagen llega al fondo del ojo al revés; el encéfalo la endereza.",
      "El oído no solo sirve para oír: su vestíbulo nos da el equilibrio.",
      "Las lágrimas limpian y protegen el ojo todo el tiempo, no solo al llorar.",
    ],
    cuida: "No veas pantallas muy de cerca ni por mucho rato, protégete del sol con sombra o lentes y no escuches música muy fuerte con audífonos.",
  },
  endocrino: {
    nombre: "Sistema endocrino",
    color: "#c98fb0",
    icono: "fa-solid fa-flask",
    que: "Sus glándulas fabrican hormonas: mensajes químicos que viajan por la sangre y regulan el crecimiento, el uso de la energía, el azúcar de la sangre y los cambios de la adolescencia.",
    partes: ["Adenohypophysis", "Neurohypophysis", "Pineal gland", "Thyroid gland", "Suprarenal gland", "Pancreas"],
    datos: [
      "La hipófisis, del tamaño de un chícharo, controla a muchas otras glándulas.",
      "La tiroides regula qué tan rápido usa el cuerpo la energía.",
      "Las glándulas suprarrenales producen adrenalina cuando te asustas: el corazón late más rápido.",
      "El páncreas hace insulina, que controla el azúcar de la sangre.",
    ],
    cuida: "Duerme a tus horas (de noche se libera la hormona del crecimiento), come poca azúcar y usa sal yodada.",
  },
  linfatico: {
    nombre: "Sistema inmunitario y linfático",
    color: "#8cc46a",
    icono: "fa-solid fa-shield-virus",
    que: "Defiende al cuerpo de microbios. Los ganglios linfáticos filtran un líquido llamado linfa y atrapan gérmenes; el bazo filtra la sangre; el timo entrena a los glóbulos blancos y las amígdalas vigilan la entrada de la garganta.",
    partes: ["Palatine tonsil", "Submandibular nodes", "Supraclavicular nodes", "Left lobe of thymus", "Right lobe of thymus", "Anterior axillary nodes", "Spleen", "Medial external iliac nodes", "Superficial popliteal nodes"],
    datos: [
      "Los ganglios del cuello se hinchan cuando el cuerpo combate una infección.",
      "El timo es más grande en la niñez: ahí aprenden a trabajar los linfocitos T.",
      "El bazo, junto al estómago, filtra la sangre y retira los glóbulos rojos viejos.",
      "Las vacunas enseñan al sistema inmunitario a reconocer un microbio antes de que nos enferme.",
    ],
    cuida: "Ponte tus vacunas, lávate las manos, come frutas y verduras y duerme bien.",
  },
  reproductor: {
    nombre: "Sistema reproductor",
    color: "#c97a9a",
    icono: "fa-solid fa-venus-mars",
    que: "Permite que los seres humanos tengan hijos. Sus glándulas también producen las hormonas de los cambios de la pubertad.",
    partes: [],
    datos: [],
    cuida: "Pregunta tus dudas a personas adultas de confianza y a tu médico.",
  },
};

const CRANEO = "Forma parte del cráneo, la caja de hueso que protege al encéfalo.";
const HUESECILLO = "Uno de los tres huesecillos del oído (martillo, yunque y estribo): pasan las vibraciones del tímpano hacia el oído interno.";
const SALIVA = "Produce saliva, que humedece la comida y empieza a digerirla.";
const FARINGE = "La garganta: por aquí pasan tanto el aire como la comida.";
const INTESTINO_GRUESO = "Parte del intestino grueso: absorbe el agua de lo que queda de la comida y forma las heces.";
const LOBULO_PULMON = "Una parte del pulmón. Ahí el oxígeno del aire pasa a la sangre. El pulmón derecho tiene tres lóbulos y el izquierdo dos, para dejarle lugar al corazón.";
const VALVA = "Una de las compuertas de las válvulas del corazón: se abre para que pase la sangre y se cierra para que no regrese.";

const FUNCION: Record<string, string> = {
  // Esqueleto.
  Femur: "El hueso más largo y fuerte del cuerpo. Va de la cadera a la rodilla.",
  "Frontal bone": CRANEO,
  "Parietal bone": CRANEO,
  "Occipital bone": CRANEO,
  "Temporal bone": `${CRANEO} Por dentro guarda el oído.`,
  "Sphenoid bone": CRANEO,
  "Ethmoid bone": CRANEO,
  Mandible: "El único hueso de la cabeza que se mueve: con él masticas y hablas.",
  Maxilla: "Forma la mandíbula de arriba y sostiene los dientes superiores.",
  Malleus: HUESECILLO,
  Incus: HUESECILLO,
  Stapes: `El hueso más pequeño del cuerpo. ${HUESECILLO}`,
  "Hyoid bone": "Un hueso en forma de herradura en el cuello que sostiene la lengua. Es el único que no toca a ningún otro hueso.",
  Clavicle: "Une el brazo con el tronco; es la que se siente bajo la piel, arriba del pecho.",
  Scapula: "Hueso plano de la espalda donde se apoya el hombro.",
  Humerus: "El hueso del brazo: va del hombro al codo.",
  Radius: "Uno de los dos huesos del antebrazo, del lado del pulgar. Gira para voltear la mano.",
  Ulna: "Uno de los dos huesos del antebrazo, del lado del meñique. Forma la punta del codo.",
  "Hip bone": "Forma la cadera. Sostiene el peso del cuerpo y protege la vejiga y otros órganos.",
  Sacrum: "Cinco vértebras soldadas que unen la columna con la cadera.",
  Coccyx: "El final de la columna: unas pocas vértebras pequeñas soldadas.",
  Patella: "Protege la rodilla por delante.",
  Tibia: "El hueso grueso de la pierna; es la espinilla que se siente por delante.",
  Fibula: "El hueso delgado de la pierna, al lado de la tibia.",
  Calcaneus: "El hueso del talón; ahí se apoya el pie al pisar.",
  "Body of sternum": "El hueso plano del pecho al que se unen las costillas.",
  "Manubrium of sternum": "La parte de arriba del esternón, donde se unen las clavículas.",
  "Xiphoid process": "La puntita de abajo del esternón.",
  "Atlas (C1)": "La primera vértebra: sostiene la cabeza y la deja decir «sí».",
  "Axis (C2)": "La segunda vértebra: sobre ella gira la cabeza para decir «no».",
  // Encéfalo.
  "Frontal lobe": "Planea, decide y controla los movimientos voluntarios. También ayuda a hablar.",
  "Parietal lobe": "Recibe el tacto, el dolor y la temperatura, y ayuda a ubicar el cuerpo en el espacio.",
  "Temporal lobe": "Procesa los sonidos, ayuda a entender el lenguaje y a guardar recuerdos.",
  "Occipital lobe": "Procesa lo que ven los ojos.",
  Insula: "Está escondida dentro del cerebro. Participa en el gusto y en sentir lo que pasa dentro del cuerpo.",
  "Limbic lobe": "Participa en las emociones y en la memoria.",
  "Corpus callosum": "Un puente de fibras que comunica la mitad izquierda del cerebro con la derecha.",
  Diencephalon: "Contiene el tálamo y el hipotálamo: reparte la información de los sentidos y regula el hambre, la sed y la temperatura.",
  Cerebellum: "Coordina los movimientos y el equilibrio.",
  Midbrain: "Participa en mover los ojos y en reaccionar a la luz y al sonido.",
  Pons: "Conecta el cerebro con el cerebelo y ayuda a controlar la respiración.",
  "Medulla oblongata": "Controla lo que el cuerpo hace sin pensar: respirar y el latido del corazón. Se continúa con la médula espinal.",
  // Corazón.
  "Left ventricle": "Bombea la sangre con oxígeno a todo el cuerpo; por eso su pared es la más gruesa.",
  "Right ventricle": "Bombea la sangre hacia los pulmones para que recoja oxígeno.",
  "Right atrium": "Recibe la sangre que regresa del cuerpo.",
  "Left atrium": "Recibe la sangre con oxígeno que llega de los pulmones.",
  // Respiratorio.
  Trachea: "Tubo reforzado con anillos de cartílago que lleva el aire de la garganta a los pulmones.",
  Diaphragm: "Músculo en forma de cúpula debajo de los pulmones. Al bajar entra el aire; al subir, sale.",
  Epiglottis: "Una tapita que cierra el paso del aire cuando tragas, para que la comida no se vaya a los pulmones.",
  "Thyroid cartilage": "Protege las cuerdas vocales. En algunas personas se nota en el cuello: es la «manzana de Adán».",
  // Digestivo.
  Tongue: "Mueve la comida al masticar, ayuda a tragar y a hablar, y tiene las papilas del gusto.",
  "Parotid gland": SALIVA,
  "Sublingual gland": SALIVA,
  "Submandibular gland": SALIVA,
  Nasopharynx: FARINGE,
  Oropharynx: FARINGE,
  Laryngopharynx: FARINGE,
  "Uvula of palate": "La campanilla: al tragar sube y tapa el paso hacia la nariz.",
  Oesophagus: "Tubo que lleva la comida de la garganta al estómago con movimientos como olas.",
  Stomach: "Bolsa de músculo que revuelve la comida con jugos ácidos para deshacerla.",
  Liver: "El órgano interno más grande. Produce la bilis, guarda energía y limpia la sangre de sustancias dañinas.",
  Gallbladder: "Guarda la bilis que hace el hígado y la suelta para digerir las grasas.",
  Pancreas: "Produce jugos que ayudan a digerir y la insulina, que controla el azúcar de la sangre.",
  Duodenum: "El inicio del intestino delgado: aquí llegan la bilis y los jugos del páncreas.",
  Jejunum: "Parte del intestino delgado, donde los nutrientes de la comida pasan a la sangre.",
  "Ascending colon": INTESTINO_GRUESO,
  "Transverse colon": INTESTINO_GRUESO,
  "Descending colon": INTESTINO_GRUESO,
  "Sigmoid colon": INTESTINO_GRUESO,
  "Vermiform appendix": "Un tubito cerrado pegado al intestino grueso. Si se inflama hay que operarlo: eso es la apendicitis.",
  // Urinario.
  Kidney: "Limpia la sangre: le quita desechos y el agua que sobra, y con eso forma la orina.",
  "Renal pelvis": "Recoge la orina que forma el riñón y la pasa al uréter.",
  Ureter: "Tubo que lleva la orina del riñón a la vejiga.",
  "Urinary bladder": "Bolsa elástica que guarda la orina hasta que vas al baño.",
  Urethra: "Por aquí sale la orina del cuerpo.",
  // Sentidos.
  Cornea: "La ventana transparente al frente del ojo: deja entrar la luz.",
  Iris: "La parte de color del ojo. Abre o cierra la pupila según cuánta luz haya.",
  Lens: "El cristalino: una lente que enfoca la imagen en el fondo del ojo.",
  "Posterior segment of eyeball": "Por dentro está la retina, que convierte la luz en señales para el encéfalo.",
  "Anterior segment of eyeball": "La parte de enfrente del ojo, detrás de la córnea; está llena de un líquido transparente.",
  "Tympanic membrane": "El tímpano: una membrana delgada que vibra cuando le llega el sonido.",
  Cochlea: "Tiene forma de caracol. Convierte las vibraciones del sonido en señales que van al encéfalo.",
  Vestibule: "Ayuda a sentir el equilibrio y la posición de la cabeza.",
  "Mucosa of nasal cavity": "Calienta y humedece el aire que respiras. En su parte alta están las células del olfato.",
};

const FUNCION_EXTRA: Record<string, string> = {
  // Músculos.
  "Long head of biceps brachii": "El bíceps dobla el codo y voltea la palma hacia arriba. Su pareja, el tríceps, estira el brazo.",
  "Short head of biceps brachii": "El bíceps dobla el codo y voltea la palma hacia arriba. Su pareja, el tríceps, estira el brazo.",
  "Long head of triceps brachii": "El tríceps estira el codo. Trabaja en pareja con el bíceps: cuando uno se contrae, el otro se relaja.",
  "Lateral head of triceps brachii": "El tríceps estira el codo. Trabaja en pareja con el bíceps.",
  "Medial head of triceps brachii": "El tríceps estira el codo. Trabaja en pareja con el bíceps.",
  "Acromial part of deltoid muscle": "El deltoides cubre el hombro y levanta el brazo hacia los lados.",
  "Clavicular part of deltoid muscle": "El deltoides cubre el hombro y levanta el brazo hacia adelante.",
  "Scapular spinal part of deltoid muscle": "El deltoides cubre el hombro y lleva el brazo hacia atrás.",
  "Sternocostal head of pectoralis major muscle": "El pectoral mayor forma el pecho y acerca el brazo al cuerpo, como al abrazar.",
  "Clavicular head of pectoralis major muscle": "El pectoral mayor forma el pecho y acerca el brazo al cuerpo, como al abrazar.",
  "Rectus abdominis muscle": "Dobla el tronco hacia adelante y protege los órganos del abdomen. Es el de «los cuadritos».",
  "Gluteus maximus muscle": "El músculo más grande del cuerpo: estira la cadera para levantarte, subir escaleras y correr.",
  "Rectus femoris muscle": "Parte del cuádriceps, al frente del muslo: estira la rodilla para patear o levantarte.",
  "Vastus lateralis muscle": "Parte del cuádriceps, al frente del muslo: estira la rodilla.",
  "Vastus medialis muscle": "Parte del cuádriceps, al frente del muslo: estira la rodilla.",
  "Sartorius muscle": "El músculo más largo del cuerpo: cruza el muslo en diagonal y ayuda a sentarse con las piernas cruzadas.",
  "Medial head of gastrocnemius": "El gemelo forma la pantorrilla y levanta el talón para caminar, correr y saltar.",
  "Lateral head of gastrocnemius": "El gemelo forma la pantorrilla y levanta el talón para caminar, correr y saltar.",
  "Soleus muscle": "Debajo del gemelo; levanta el talón y te mantiene de pie sin caerte hacia adelante.",
  "Calcaneal tendon": "El tendón de Aquiles, el más fuerte del cuerpo: une la pantorrilla con el talón. Un tendón une músculo con hueso.",
  "Descending part of trapezius muscle": "El trapecio sube los hombros y sostiene la cabeza.",
  "Latissimus dorsi muscle": "Cubre la espalda baja y jala el brazo hacia abajo y hacia atrás, como al trepar o nadar.",
  "Sternocleidomastoid muscle": "Gira e inclina la cabeza. Se nota en el cuello cuando volteas.",
  "Frontalis muscle": "Levanta las cejas y arruga la frente cuando te sorprendes.",
  "Orbicularis oris muscle": "Rodea la boca: cierra los labios, sirve para silbar, besar y hablar.",
  "Zygomaticus major muscle": "Jala la comisura de la boca hacia arriba: es el músculo de la sonrisa.",
  "Temporalis muscle": "Cierra la mandíbula para morder; se siente en la sien al apretar los dientes.",
  "Superficial part of masseter": "El masetero cierra la mandíbula con mucha fuerza para masticar.",
  "External intercostal muscles": "Entre las costillas: las levantan para que entre el aire.",
  // Circulatorio.
  "Ascending aorta": "El inicio de la aorta, la arteria más grande: sale del ventrículo izquierdo.",
  "Aortic arch": "La curva de la aorta. De ella salen las arterias que van a la cabeza y a los brazos.",
  "Thoracic aorta": "La aorta baja por el pecho, junto a la columna, repartiendo sangre a las costillas y al esófago.",
  "Abdominal aorta": "La aorta en el abdomen: manda sangre a los intestinos, al hígado y a los riñones, y luego se divide hacia las piernas.",
  "Superior vena cava": "Regresa al corazón la sangre de la cabeza, el cuello y los brazos.",
  "Inferior vena cava (abdominal part)": "La vena más grande: regresa al corazón la sangre de las piernas y del abdomen.",
  "Inferior vena cava (thoracic part)": "El último tramo de la vena cava inferior, antes de entrar al corazón.",
  "Pulmonary trunk": "Sale del ventrículo derecho y lleva la sangre con poco oxígeno a los pulmones.",
  "Right common carotid artery": "Lleva sangre a la cabeza y al cerebro. Aquí se toma el pulso en el cuello.",
  "Left common carotid artery": "Lleva sangre a la cabeza y al cerebro. Aquí se toma el pulso en el cuello.",
  "Internal jugular vein": "Regresa al corazón la sangre del cerebro y de la cara.",
  "Femoral artery": "La gran arteria del muslo: lleva sangre a toda la pierna.",
  "Radial artery": "Pasa por la muñeca, del lado del pulgar: ahí se toma el pulso.",
  "Right coronary artery": "Las arterias coronarias alimentan al propio músculo del corazón.",
  "Left coronary artery": "Las arterias coronarias alimentan al propio músculo del corazón.",
  "Hepatic portal vein": "Lleva al hígado la sangre que viene de los intestinos, cargada de nutrientes, para que la revise.",
  "Great saphenous vein": "La vena más larga del cuerpo: sube por dentro de la pierna, bajo la piel.",
  // Nervioso.
  "Spinal dura": "La envoltura resistente de la médula espinal. Por dentro corre la médula, que conecta el encéfalo con el resto del cuerpo.",
  Thalamus: "Como una central telefónica: recibe los mensajes de los sentidos y los reparte a la corteza del cerebro.",
  Hypothalamus: "Regula la temperatura, el hambre, la sed y el sueño, y manda órdenes a la hipófisis.",
  Hippocampus: "Ayuda a guardar recuerdos nuevos y a orientarte en los lugares.",
  "Amygdaloid body": "La amígdala cerebral participa en el miedo y en otras emociones.",
  "Lateral ventricle": "Cavidad dentro del cerebro llena de líquido cefalorraquídeo, que amortigua y alimenta al encéfalo.",
  "Third ventricle": "Cavidad llena de líquido cefalorraquídeo entre las dos mitades del tálamo.",
  "Fourth ventricle": "Cavidad llena de líquido cefalorraquídeo entre el tallo cerebral y el cerebelo.",
  "Optic chiasm": "Aquí se cruzan la mitad de las fibras de los dos nervios ópticos: cada lado del cerebro ve una mitad del mundo.",
  "Optic nerve (II)": "Lleva al encéfalo lo que ve el ojo.",
  "Olfactory nerve (I)": "Lleva al encéfalo los olores que capta la nariz.",
  "Vestibulocochlear nerve (VIII)": "Lleva al encéfalo los sonidos y la información del equilibrio.",
  "Facial nerve (VII)": "Mueve los músculos de la cara para hacer gestos y lleva el gusto de la punta de la lengua.",
  "Vagus nerve (X)": "Un nervio largo que baja de la cabeza hasta el abdomen y ayuda a controlar el corazón, la respiración y la digestión.",
  "Hypoglossal nerve (XII)": "Mueve la lengua.",
  "Sciatic nerve": "El nervio más grueso del cuerpo: baja por detrás del muslo y mueve casi toda la pierna.",
  "Ulnar nerve": "Pasa por el codo, bajo la piel: cuando te pegas ahí sientes el «toque» del «hueso de la risa».",
  "Median nerve": "Mueve muchos músculos de la mano y da sensibilidad al pulgar, el índice y el medio.",
  "Radial nerve": "Estira el codo, la muñeca y los dedos.",
  "Intercostal nerves": "Corren entre las costillas y mueven los músculos que ayudan a respirar.",
  // Sentidos.
  "Lacrimal gland": "Produce las lágrimas, que limpian y humedecen el ojo.",
  // Endocrino.
  Adenohypophysis: "La parte de enfrente de la hipófisis: fabrica la hormona del crecimiento y las que mandan a otras glándulas.",
  Neurohypophysis: "La parte de atrás de la hipófisis: libera hormonas que regulan el agua del cuerpo.",
  "Pineal gland": "Produce melatonina cuando oscurece: ayuda a que te dé sueño de noche.",
  "Thyroid gland": "Con forma de mariposa, en el cuello: sus hormonas regulan qué tan rápido usa el cuerpo la energía. Necesita yodo.",
  "Suprarenal gland": "Sobre cada riñón: produce adrenalina, que prepara al cuerpo para reaccionar ante un peligro.",
  // Linfático.
  Spleen: "Filtra la sangre, retira los glóbulos rojos viejos y guarda glóbulos blancos para defenderte.",
  "Left lobe of thymus": "El timo entrena a los linfocitos T, glóbulos blancos que reconocen a los microbios. Es más grande en la niñez.",
  "Right lobe of thymus": "El timo entrena a los linfocitos T, glóbulos blancos que reconocen a los microbios. Es más grande en la niñez.",
  "Palatine tonsil": "Las amígdalas vigilan la entrada de la garganta y atrapan microbios que llegan con el aire y la comida.",
  // Digestivo, extras.
  Gingiva: "La encía cubre el hueso de la mandíbula y sujeta los dientes.",
  "Bile duct": "Lleva la bilis del hígado y la vesícula al intestino delgado.",
  "Pancreatic duct": "Lleva los jugos del páncreas al intestino delgado.",
};
Object.assign(FUNCION, FUNCION_EXTRA);

export function funcionDe(clave: string): string | null {
  if (FUNCION[clave]) return FUNCION[clave];
  if (/^Vertebra|^Vértebra/.test(clave)) return "Las vértebras se apilan para formar la columna, que nos sostiene y protege la médula espinal.";
  if (/ rib$/.test(clave)) return "Las costillas forman una jaula que protege al corazón y a los pulmones, y se mueven al respirar.";
  if (/^Costal cartilage/.test(clave)) return "Cartílago flexible que une la costilla con el esternón: deja que el pecho se expanda al respirar.";
  if (/phalanx/.test(clave)) return "Las falanges son los huesos de los dedos: dos en el pulgar y tres en los demás.";
  if (/metacarpal/.test(clave)) return "Los metacarpianos forman la palma de la mano.";
  if (/metatarsal/.test(clave)) return "Los metatarsianos forman la planta del pie.";
  if (/incisor/.test(clave)) return "Los incisivos cortan la comida, como tijeras.";
  if (/canine/.test(clave)) return "Los caninos desgarran la comida.";
  if (/premolar|molar/.test(clave)) return "Premolares y molares muelen y trituran la comida.";
  if (/lobe of (left|right) lung/.test(clave)) return LOBULO_PULMON;
  if (/bronchus/.test(clave)) return "Tubos que llevan el aire de la tráquea a cada parte de los pulmones.";
  if (/leaflet/.test(clave)) return VALVA;
  if (/papillary/.test(clave)) return "Músculos que sostienen las válvulas del corazón para que no se volteen al cerrarse.";
  if (/nasal septal|alar cartilage/.test(clave)) return "Cartílago que da forma a la nariz. Es más flexible que el hueso: por eso la punta de la nariz se dobla.";
  if (/Arytenoid|Corniculate|Cricoid/.test(clave)) return "Cartílago de la laringe, la caja donde están las cuerdas vocales.";
  if (/tendon/i.test(clave)) return "Un tendón une un músculo con un hueso.";
  if (/muscle|^Vastus|head of /.test(clave)) return "Los músculos se contraen (se acortan) y jalan de los huesos o de la piel para moverlos.";
  if (/ nodes?$/.test(clave)) return "Los ganglios linfáticos filtran la linfa y atrapan microbios. Se inflaman cuando el cuerpo combate una infección.";
  if (/ vein|^Vena|sinus/i.test(clave)) return "Las venas regresan la sangre al corazón.";
  if (/arter|aorta|trunk$/i.test(clave)) return "Las arterias llevan la sangre que sale del corazón hacia el cuerpo.";
  if (/nerve|plexus/.test(clave)) return "Los nervios llevan mensajes entre el encéfalo o la médula espinal y el resto del cuerpo.";
  if (/lobe$|gyrus|sulcus/.test(clave)) return "Una parte de la corteza del cerebro, donde se procesan los sentidos, el movimiento y el pensamiento.";
  return null;
}

// ── Clases guiadas ──────────────────────────────────────────────────────────
// Cada paso deja la escena lista (qué sistemas se ven, cómo va el hueso, qué
// se resalta, a dónde mira la cámara) y explica. Los pasos con «reto» esperan
// a que el alumno toque la pieza correcta.
export interface PasoClase {
  titulo: string;
  texto: string;
  /** Sistemas que se ven en este paso; los demás se apagan. */
  sistemas?: IdSistema[];
  hueso?: ModoHueso;
  /** «todo», «sistema:x», «resaltadas», una vista o una llave de NOMBRES. */
  ver?: string;
  resaltar?: string[];
  /** Mostrar solo lo resaltado. */
  solo?: boolean;
  separar?: number;
  modo?: ModoVista;
  reto?: { pide: string; tocar: string[]; bien: string };
}
export interface Clase {
  id: string;
  sistema: IdSistema | null;
  titulo: string;
  resumen: string;
  pasos: PasoClase[];
}

const TODOS: IdSistema[] = ["esqueleto", "circulatorio", "respiratorio", "digestivo", "urinario", "nervioso", "sentidos", "endocrino", "linfatico"];
const CORAZON = ["Left ventricle", "Right ventricle", "Left atrium", "Right atrium"];
const PULMONES = ["Superior lobe of right lung", "Middle lobe of right lung", "Inferior lobe of right lung", "Superior lobe of left lung", "Inferior lobe of left lung"];
const LOBULOS = ["Frontal lobe", "Parietal lobe", "Temporal lobe", "Occipital lobe"];
const COLON = ["Ascending colon", "Transverse colon", "Descending colon", "Sigmoid colon"];

export const CLASES: Clase[] = [
  {
    id: "cuerpo",
    sistema: null,
    titulo: "El cuerpo humano",
    resumen: "Cómo se organiza el cuerpo en sistemas que trabajan juntos.",
    pasos: [
      { titulo: "Un cuerpo, muchos sistemas", texto: "El cuerpo está organizado en sistemas: grupos de órganos que trabajan juntos para una tarea. Ninguno trabaja solo; todos dependen de los demás. Gira el cuerpo arrastrando con el dedo.", sistemas: TODOS, hueso: "rayos", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "El armazón", texto: "El sistema óseo sostiene y protege. Los músculos, pegados a los huesos, jalan de ellos para movernos. Juntos forman el aparato locomotor.", sistemas: ["esqueleto", "musculos"], hueso: "solido", ver: "todo" },
      { titulo: "Reto", texto: "Encuentra el hueso más largo del cuerpo.", sistemas: ["esqueleto"], hueso: "solido", ver: "todo", reto: { pide: "Toca el hueso del muslo.", tocar: ["Femur"], bien: "¡Es el fémur! Va de la cadera a la rodilla." } },
      { titulo: "Conseguir energía", texto: "Para vivir, cada célula necesita oxígeno y nutrientes. El sistema respiratorio toma el oxígeno del aire; el digestivo saca los nutrientes de la comida.", sistemas: ["esqueleto", "respiratorio", "digestivo"], hueso: "rayos", ver: "sistema:digestivo" },
      { titulo: "El repartidor", texto: "El corazón bombea la sangre por arterias (rojo) y venas (azul). La sangre lleva el oxígeno y los nutrientes a cada rincón y recoge los desechos.", sistemas: ["esqueleto", "circulatorio"], hueso: "rayos", ver: "todo" },
      { titulo: "La limpieza", texto: "Los riñones filtran la sangre y sacan los desechos en la orina.", sistemas: ["esqueleto", "urinario", "circulatorio"], hueso: "rayos", resaltar: ["Kidney"], ver: "resaltadas" },
      { titulo: "El centro de mando", texto: "El sistema nervioso recibe lo que captan los sentidos y manda órdenes a todo el cuerpo por los nervios (amarillo).", sistemas: ["esqueleto", "nervioso", "sentidos"], hueso: "rayos", ver: "todo" },
      { titulo: "Mensajeros y defensas", texto: "Las glándulas endocrinas mandan mensajes químicos (hormonas) por la sangre. El sistema inmunitario, con sus ganglios (verde), el bazo y el timo, nos defiende de los microbios.", sistemas: ["esqueleto", "endocrino", "linfatico"], hueso: "rayos", ver: "todo" },
      { titulo: "Reto final", texto: "Este órgano trabaja sin descanso desde antes de que nacieras.", sistemas: TODOS, hueso: "rayos", ver: "todo", reto: { pide: "Toca el órgano que bombea la sangre.", tocar: CORAZON, bien: "¡El corazón! Late unas 100 000 veces al día." } },
      { titulo: "Todas las piezas", texto: "Así se ve el cuerpo desarmado: cada pieza tiene su nombre. Toca cualquiera para conocerla y usa «Verla sola» para girarla.", sistemas: TODOS, hueso: "solido", modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "esqueleto",
    sistema: "esqueleto",
    titulo: "El sistema óseo",
    resumen: "Los huesos: sostén, protección y movimiento.",
    pasos: [
      { titulo: "El esqueleto", texto: "Un adulto tiene 206 huesos. Juntos sostienen el cuerpo como el armazón de una casa.", sistemas: ["esqueleto"], hueso: "solido", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "La caja del encéfalo", texto: "El cráneo es una caja de huesos soldados que protege al encéfalo. La mandíbula es el único hueso de la cabeza que se mueve.", sistemas: ["esqueleto", "nervioso"], hueso: "rayos", resaltar: ["Frontal bone", "Parietal bone", "Occipital bone", "Temporal bone", "Mandible"], ver: "resaltadas" },
      { titulo: "La columna", texto: "La columna vertebral está hecha de vértebras apiladas. Nos sostiene derechos, nos deja doblarnos y protege la médula espinal.", sistemas: ["esqueleto"], hueso: "solido", ver: "espalda" },
      { titulo: "La jaula del pecho", texto: "Las costillas y el esternón forman una jaula que protege al corazón y a los pulmones. Los cartílagos de las costillas la hacen flexible para respirar.", sistemas: ["esqueleto", "circulatorio", "respiratorio"], hueso: "solido", resaltar: ["Body of sternum"], ver: "frente" },
      { titulo: "Reto", texto: "El brazo tiene un hueso arriba del codo y dos abajo.", sistemas: ["esqueleto"], hueso: "solido", ver: "todo", reto: { pide: "Toca el hueso del brazo, entre el hombro y el codo.", tocar: ["Humerus"], bien: "¡El húmero!" } },
      { titulo: "Manos y pies", texto: "Más de la mitad de los huesos están en las manos y los pies: por eso podemos hacer movimientos tan finos como escribir.", sistemas: ["esqueleto"], hueso: "solido", resaltar: ["Distal phalanx of first finger of hand", "First metacarpal bone"], ver: "resaltadas" },
      { titulo: "Reto", texto: "Este hueso protege la rodilla por delante.", sistemas: ["esqueleto"], hueso: "solido", ver: "todo", reto: { pide: "Toca la rótula.", tocar: ["Patella"], bien: "¡La rótula! En los libros también se llama patela." } },
      { titulo: "Pieza por pieza", texto: "Aquí están todos los huesos separados, del más grande al más chico. Busca el estribo, el más pequeño de todos.", sistemas: ["esqueleto"], hueso: "solido", modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "musculos",
    sistema: "musculos",
    titulo: "El sistema muscular",
    resumen: "Cómo los músculos mueven el cuerpo.",
    pasos: [
      { titulo: "Los músculos", texto: "Tenemos más de 600 músculos. Cubren el esqueleto y le dan forma al cuerpo.", sistemas: ["esqueleto", "musculos"], hueso: "solido", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "Solo jalan", texto: "Un músculo se contrae (se acorta) y jala del hueso. Nunca empuja. Por eso trabajan en parejas: el bíceps dobla el codo y el tríceps lo estira.", sistemas: ["esqueleto", "musculos"], hueso: "solido", resaltar: ["Long head of biceps brachii", "Short head of biceps brachii", "Long head of triceps brachii", "Lateral head of triceps brachii"], ver: "resaltadas" },
      { titulo: "Reto", texto: "Busca el músculo que se usa para «sacar músculo».", sistemas: ["esqueleto", "musculos"], hueso: "solido", ver: "frente", reto: { pide: "Toca el bíceps.", tocar: ["Long head of biceps brachii", "Short head of biceps brachii"], bien: "¡El bíceps! Dobla el codo." } },
      { titulo: "Los gestos", texto: "Los músculos de la cara no mueven huesos: jalan de la piel. Así sonreímos, levantamos las cejas o cerramos los ojos.", sistemas: ["esqueleto", "musculos"], hueso: "solido", resaltar: ["Zygomaticus major muscle", "Frontalis muscle", "Orbicularis oris muscle"], ver: "resaltadas" },
      { titulo: "El más grande", texto: "El glúteo mayor, en la nalga, es el músculo más grande: nos levanta de la silla y nos impulsa al correr.", sistemas: ["esqueleto", "musculos"], hueso: "solido", resaltar: ["Gluteus maximus muscle"], ver: "espalda" },
      { titulo: "Los tendones", texto: "Los tendones unen los músculos con los huesos. El tendón de Aquiles une la pantorrilla con el talón.", sistemas: ["esqueleto", "musculos"], hueso: "solido", resaltar: ["Calcaneal tendon"], ver: "resaltadas" },
      { titulo: "Reto", texto: "Este músculo levanta el talón para caminar y saltar.", sistemas: ["esqueleto", "musculos"], hueso: "solido", ver: "espalda", reto: { pide: "Toca el gemelo, en la pantorrilla.", tocar: ["Medial head of gastrocnemius", "Lateral head of gastrocnemius"], bien: "¡El gemelo!" } },
      { titulo: "Pieza por pieza", texto: "Todos los músculos separados. Fíjate en sus formas: largos en brazos y piernas, planos en el tronco.", sistemas: ["musculos"], modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "circulatorio",
    sistema: "circulatorio",
    titulo: "El sistema circulatorio",
    resumen: "El corazón, las arterias y las venas.",
    pasos: [
      { titulo: "Un circuito cerrado", texto: "La sangre viaja por un circuito de tubos que llega a todo el cuerpo. El corazón la empuja; las arterias (rojo) la llevan y las venas (azul) la regresan.", sistemas: ["esqueleto", "circulatorio"], hueso: "rayos", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "El corazón", texto: "Es un músculo del tamaño de un puño con cuatro cámaras: dos aurículas arriba, que reciben la sangre, y dos ventrículos abajo, que la empujan.", sistemas: ["circulatorio"], resaltar: CORAZON, solo: true, ver: "resaltadas" },
      { titulo: "Reto", texto: "La cámara con la pared más gruesa es la que empuja la sangre a todo el cuerpo.", sistemas: ["circulatorio"], resaltar: CORAZON, solo: true, ver: "resaltadas", reto: { pide: "Toca el ventrículo izquierdo.", tocar: ["Left ventricle"], bien: "¡Ese es! Su pared es gruesa porque empuja la sangre más lejos." } },
      { titulo: "La aorta", texto: "La arteria más grande sale del ventrículo izquierdo, hace una curva y baja junto a la columna, repartiendo ramas a todo el cuerpo.", sistemas: ["esqueleto", "circulatorio"], hueso: "rayos", resaltar: ["Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta"], ver: "resaltadas" },
      { titulo: "Las venas cavas", texto: "Las dos venas más grandes regresan la sangre al corazón: la cava superior desde la cabeza y los brazos, la inferior desde las piernas y el abdomen.", sistemas: ["esqueleto", "circulatorio"], hueso: "rayos", resaltar: ["Superior vena cava", "Inferior vena cava (abdominal part)", "Inferior vena cava (thoracic part)"], ver: "resaltadas" },
      { titulo: "La vuelta por los pulmones", texto: "Del ventrículo derecho sale la sangre hacia los pulmones a recoger oxígeno y regresa al corazón. Aquí las arterias van en azul y las venas en rojo, porque llevan la sangre al revés.", sistemas: ["circulatorio", "respiratorio"], resaltar: ["Pulmonary trunk"], ver: "sistema:respiratorio" },
      { titulo: "Reto", texto: "En el cuello se puede sentir el pulso con dos dedos.", sistemas: ["esqueleto", "circulatorio"], hueso: "rayos", ver: "frente", reto: { pide: "Toca una arteria carótida, en el cuello.", tocar: ["Right common carotid artery", "Left common carotid artery", "Internal carotid artery", "External carotid artery"], bien: "¡La carótida! Por ella sube la sangre a la cabeza." } },
      { titulo: "Pieza por pieza", texto: "El corazón y cientos de vasos separados. Cada arteria y cada vena tiene su nombre.", sistemas: ["circulatorio"], modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "respiratorio",
    sistema: "respiratorio",
    titulo: "El sistema respiratorio",
    resumen: "El camino del aire hasta la sangre.",
    pasos: [
      { titulo: "El camino del aire", texto: "El aire entra por la nariz, baja por la garganta y la tráquea, se reparte por los bronquios y llega a los pulmones.", sistemas: ["esqueleto", "respiratorio"], hueso: "rayos", ver: "sistema:respiratorio", separar: 0, modo: "cuerpo" },
      { titulo: "La nariz", texto: "Por dentro, la nariz calienta, humedece y filtra el aire. Sus cartílagos le dan forma.", sistemas: ["esqueleto", "respiratorio"], hueso: "rayos", resaltar: ["Mucosa of nasal cavity", "Nasal septal cartilage", "Major alar cartilage"], ver: "resaltadas" },
      { titulo: "La tapita", texto: "La epiglotis tapa la entrada de la tráquea cuando tragas, para que la comida no se vaya a los pulmones. Abajo está la laringe, donde se produce la voz.", sistemas: ["respiratorio"], resaltar: ["Epiglottis", "Thyroid cartilage", "Cricoid cartilage"], solo: true, ver: "resaltadas" },
      { titulo: "Un árbol de cabeza", texto: "La tráquea se divide en dos bronquios principales y luego en ramas cada vez más pequeñas, como un árbol puesto de cabeza.", sistemas: ["respiratorio"], resaltar: ["Trachea", "Right main bronchus", "Left main bronchus"], ver: "resaltadas", separar: 0.35 },
      { titulo: "Reto", texto: "Un pulmón tiene tres lóbulos y el otro dos.", sistemas: ["respiratorio"], ver: "sistema:respiratorio", separar: 0.35, reto: { pide: "Toca el lóbulo medio del pulmón derecho.", tocar: ["Middle lobe of right lung"], bien: "¡Correcto! Solo el pulmón derecho tiene lóbulo medio: el izquierdo deja lugar al corazón." } },
      { titulo: "El diafragma", texto: "Este músculo en forma de cúpula baja para que entre el aire y sube para que salga. Respiramos sin pensarlo.", sistemas: ["esqueleto", "respiratorio"], hueso: "rayos", resaltar: ["Diaphragm"], ver: "frente", separar: 0 },
      { titulo: "Pieza por pieza", texto: "Todas las piezas del sistema respiratorio separadas.", sistemas: ["respiratorio"], modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "digestivo",
    sistema: "digestivo",
    titulo: "El sistema digestivo",
    resumen: "El viaje de la comida.",
    pasos: [
      { titulo: "El viaje de la comida", texto: "La comida recorre un tubo que empieza en la boca y termina en el intestino grueso. En el camino se deshace hasta que la sangre puede llevársela.", sistemas: ["esqueleto", "digestivo"], hueso: "rayos", ver: "sistema:digestivo", separar: 0, modo: "cuerpo" },
      { titulo: "La boca", texto: "Los dientes cortan y muelen; la lengua mueve el bocado y las glándulas salivales lo humedecen con saliva, que ya empieza a digerirlo.", sistemas: ["digestivo"], resaltar: ["Tongue", "Parotid gland", "Submandibular gland", "Sublingual gland", "Upper first molar tooth"], ver: "resaltadas" },
      { titulo: "Esófago y estómago", texto: "El esófago empuja el bocado con ondas hasta el estómago, una bolsa de músculo que lo revuelve con jugos ácidos.", sistemas: ["esqueleto", "digestivo"], hueso: "rayos", resaltar: ["Oesophagus", "Stomach"], ver: "resaltadas" },
      { titulo: "Reto", texto: "El órgano interno más grande está a la derecha, bajo las costillas.", sistemas: ["esqueleto", "digestivo"], hueso: "rayos", ver: "sistema:digestivo", reto: { pide: "Toca el hígado.", tocar: ["Liver"], bien: "¡El hígado! Hace la bilis y limpia la sangre." } },
      { titulo: "Los ayudantes", texto: "El hígado hace la bilis, que la vesícula guarda para digerir las grasas. El páncreas manda sus jugos al intestino.", sistemas: ["digestivo"], resaltar: ["Liver", "Gallbladder", "Pancreas", "Duodenum"], ver: "resaltadas", separar: 0.3 },
      { titulo: "El intestino delgado", texto: "Aquí los nutrientes pasan a la sangre. Mide unos 6 metros y va enrollado.", sistemas: ["esqueleto", "digestivo"], hueso: "rayos", resaltar: ["Duodenum", "Jejunum"], ver: "resaltadas", separar: 0 },
      { titulo: "El intestino grueso", texto: "Rodea al delgado como un marco: absorbe el agua de lo que quedó y forma las heces. Al inicio cuelga el apéndice.", sistemas: ["esqueleto", "digestivo"], hueso: "rayos", resaltar: [...COLON, "Vermiform appendix"], ver: "resaltadas" },
      { titulo: "Reto", texto: "Ordena el viaje: ¿a dónde llega la comida después de la boca y el esófago?", sistemas: ["digestivo"], ver: "sistema:digestivo", reto: { pide: "Toca el órgano que sigue después del esófago.", tocar: ["Stomach"], bien: "¡El estómago!" } },
      { titulo: "Pieza por pieza", texto: "Todas las piezas del sistema digestivo, dientes incluidos.", sistemas: ["digestivo"], modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "urinario",
    sistema: "urinario",
    titulo: "El sistema urinario",
    resumen: "Cómo se limpia la sangre.",
    pasos: [
      { titulo: "Los filtros", texto: "Tenemos dos riñones a los lados de la columna, a la altura de la cintura. Filtran la sangre y forman la orina.", sistemas: ["esqueleto", "urinario"], hueso: "rayos", resaltar: ["Kidney"], ver: "espalda", separar: 0, modo: "cuerpo" },
      { titulo: "La sangre llega a filtrarse", texto: "Las arterias renales llevan la sangre a cada riñón y las venas renales la regresan ya limpia.", sistemas: ["urinario", "circulatorio"], resaltar: ["Kidney", "Right renal artery", "Left renal artery", "Right renal vein", "Left renal vein"], ver: "resaltadas" },
      { titulo: "El camino de la orina", texto: "La orina se junta en la pelvis renal, baja por los uréteres, se guarda en la vejiga y sale por la uretra.", sistemas: ["esqueleto", "urinario"], hueso: "rayos", resaltar: ["Renal pelvis", "Ureter", "Urinary bladder", "Urethra"], ver: "sistema:urinario" },
      { titulo: "Reto", texto: "La orina se guarda en una bolsa elástica.", sistemas: ["esqueleto", "urinario"], hueso: "rayos", ver: "sistema:urinario", reto: { pide: "Toca la vejiga.", tocar: ["Urinary bladder"], bien: "¡La vejiga! Se estira conforme se llena." } },
      { titulo: "Pieza por pieza", texto: "Las piezas del sistema urinario separadas.", sistemas: ["urinario"], modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "nervioso",
    sistema: "nervioso",
    titulo: "El sistema nervioso",
    resumen: "El encéfalo, la médula y los nervios.",
    pasos: [
      { titulo: "La red de mensajes", texto: "El sistema nervioso es la red que comunica todo el cuerpo. Los nervios (amarillo) llegan hasta la punta de los dedos.", sistemas: ["esqueleto", "nervioso"], hueso: "rayos", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "El encéfalo", texto: "Dentro del cráneo está el encéfalo. Su parte más grande, el cerebro, tiene la superficie llena de pliegues.", sistemas: ["esqueleto", "nervioso"], hueso: "rayos", resaltar: LOBULOS, ver: "resaltadas" },
      { titulo: "Cada lóbulo, una tarea", texto: "El frontal planea y decide; el parietal siente el tacto; el temporal oye; el occipital ve. Los colores son de enseñanza: en el cuerpo no son así.", sistemas: ["nervioso"], resaltar: LOBULOS, solo: true, ver: "resaltadas", separar: 0.25 },
      { titulo: "Reto", texto: "Lo que ves se procesa en la parte de atrás del cerebro.", sistemas: ["nervioso"], resaltar: LOBULOS, solo: true, ver: "resaltadas", separar: 0.25, reto: { pide: "Toca el lóbulo occipital.", tocar: ["Occipital lobe"], bien: "¡El occipital! Ahí se procesa la vista." } },
      { titulo: "El cerebelo y el tallo", texto: "Abajo y atrás, el cerebelo coordina el equilibrio. El tallo cerebral controla lo que el cuerpo hace solo: respirar y el latido.", sistemas: ["nervioso"], resaltar: ["Cerebellum", "Pons", "Midbrain", "Medulla oblongata"], ver: "resaltadas", separar: 0 },
      { titulo: "La médula espinal", texto: "Baja protegida dentro de la columna y de ella salen los nervios. Algunos reflejos los decide la médula sola, sin esperar al cerebro.", sistemas: ["esqueleto", "nervioso"], hueso: "rayos", resaltar: ["Spinal dura"], ver: "espalda" },
      { titulo: "Reto", texto: "El nervio más grueso del cuerpo baja por detrás del muslo.", sistemas: ["esqueleto", "nervioso"], hueso: "rayos", ver: "espalda", reto: { pide: "Toca el nervio ciático.", tocar: ["Sciatic nerve"], bien: "¡El ciático!" } },
      { titulo: "Pieza por pieza", texto: "El encéfalo y los nervios separados, pieza por pieza.", sistemas: ["nervioso"], modo: "piezas", ver: "piezas" },
    ],
  },
  {
    id: "sentidos",
    sistema: "sentidos",
    titulo: "Los órganos de los sentidos",
    resumen: "El ojo y el oído por dentro.",
    pasos: [
      { titulo: "Ventanas al mundo", texto: "Los sentidos captan lo que pasa afuera y lo mandan al encéfalo. Aquí están el ojo y el oído, escondidos dentro del cráneo.", sistemas: ["esqueleto", "sentidos"], hueso: "rayos", ver: "sistema:sentidos", separar: 0, modo: "cuerpo" },
      { titulo: "El ojo", texto: "La luz entra por la córnea, pasa por la pupila (el hueco del iris) y el cristalino la enfoca al fondo del ojo, en la retina.", sistemas: ["sentidos"], resaltar: ["Cornea", "Iris", "Lens", "Posterior segment of eyeball"], solo: true, ver: "resaltadas" },
      { titulo: "Reto", texto: "La parte de color del ojo abre y cierra la pupila.", sistemas: ["sentidos"], resaltar: ["Cornea", "Iris", "Lens", "Posterior segment of eyeball"], solo: true, ver: "resaltadas", reto: { pide: "Toca el iris.", tocar: ["Iris"], bien: "¡El iris! Con mucha luz cierra la pupila." } },
      { titulo: "El oído", texto: "El sonido hace vibrar el tímpano; tres huesecillos (martillo, yunque y estribo) pasan la vibración al caracol, que la convierte en mensajes para el encéfalo.", sistemas: ["sentidos"], resaltar: ["Tympanic membrane", "Malleus", "Incus", "Stapes", "Cochlea"], solo: true, ver: "resaltadas" },
      { titulo: "Reto", texto: "El hueso más pequeño del cuerpo está aquí.", sistemas: ["sentidos"], resaltar: ["Tympanic membrane", "Malleus", "Incus", "Stapes", "Cochlea", "Vestibule"], solo: true, ver: "resaltadas", reto: { pide: "Toca el estribo.", tocar: ["Stapes"], bien: "¡El estribo! Mide unos 3 milímetros." } },
      { titulo: "El equilibrio", texto: "Junto al caracol, el vestíbulo y sus canales sienten cómo se mueve la cabeza: así no nos caemos.", sistemas: ["sentidos"], resaltar: ["Vestibule"], solo: true, ver: "resaltadas" },
      { titulo: "Olfato y gusto", texto: "El olfato está en lo alto de la nariz y el gusto en la lengua. Por eso, cuando tienes gripa, la comida sabe menos.", sistemas: ["esqueleto", "respiratorio", "digestivo"], hueso: "rayos", resaltar: ["Mucosa of nasal cavity", "Tongue"], ver: "resaltadas" },
    ],
  },
  {
    id: "endocrino",
    sistema: "endocrino",
    titulo: "El sistema endocrino",
    resumen: "Las glándulas y sus hormonas.",
    pasos: [
      { titulo: "Mensajes químicos", texto: "Las glándulas endocrinas fabrican hormonas, mensajes que viajan por la sangre. Son pequeñas, pero controlan mucho.", sistemas: ["esqueleto", "endocrino"], hueso: "rayos", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "La jefa", texto: "La hipófisis, del tamaño de un chícharo, cuelga debajo del encéfalo y manda órdenes a otras glándulas. También produce la hormona del crecimiento.", sistemas: ["esqueleto", "nervioso", "endocrino"], hueso: "rayos", resaltar: ["Adenohypophysis", "Neurohypophysis"], ver: "resaltadas" },
      { titulo: "La tiroides", texto: "En el cuello, con forma de mariposa: regula qué tan rápido usa el cuerpo la energía. Necesita yodo; por eso la sal es yodada.", sistemas: ["esqueleto", "endocrino", "respiratorio"], hueso: "rayos", resaltar: ["Thyroid gland"], ver: "resaltadas" },
      { titulo: "Reto", texto: "Encima de cada riñón hay una glándula que produce adrenalina cuando te asustas.", sistemas: ["esqueleto", "endocrino", "urinario"], hueso: "rayos", ver: "espalda", reto: { pide: "Toca una glándula suprarrenal.", tocar: ["Suprarenal gland"], bien: "¡La suprarrenal! «Supra» quiere decir «encima»." } },
      { titulo: "El páncreas", texto: "Además de ayudar a digerir, el páncreas produce insulina, que controla el azúcar de la sangre.", sistemas: ["esqueleto", "endocrino", "digestivo"], hueso: "rayos", resaltar: ["Pancreas"], ver: "resaltadas" },
    ],
  },
  {
    id: "linfatico",
    sistema: "linfatico",
    titulo: "El sistema inmunitario",
    resumen: "Las defensas del cuerpo.",
    pasos: [
      { titulo: "Las defensas", texto: "El cuerpo tiene un ejército contra los microbios. Los ganglios linfáticos (verde) son puestos de vigilancia repartidos por todo el cuerpo.", sistemas: ["esqueleto", "linfatico"], hueso: "rayos", ver: "todo", separar: 0, modo: "cuerpo" },
      { titulo: "En el cuello", texto: "Cuando te enfermas de la garganta, los ganglios del cuello se inflaman: están trabajando.", sistemas: ["esqueleto", "linfatico"], hueso: "rayos", resaltar: ["Submandibular nodes", "Superficial anterior cervical nodes", "Palatine tonsil"], ver: "resaltadas" },
      { titulo: "El timo", texto: "Detrás del esternón, el timo entrena a los glóbulos blancos para reconocer a los microbios. Es más grande en la niñez.", sistemas: ["esqueleto", "linfatico"], hueso: "rayos", resaltar: ["Left lobe of thymus", "Right lobe of thymus"], ver: "resaltadas" },
      { titulo: "Reto", texto: "Este órgano filtra la sangre; está a la izquierda, junto al estómago.", sistemas: ["esqueleto", "linfatico", "digestivo"], hueso: "rayos", ver: "frente", reto: { pide: "Toca el bazo.", tocar: ["Spleen"], bien: "¡El bazo!" } },
      { titulo: "Las vacunas", texto: "Una vacuna le enseña al sistema inmunitario cómo es un microbio, sin enfermarnos. Así, si llega de verdad, las defensas ya lo conocen.", sistemas: ["esqueleto", "linfatico"], hueso: "rayos", ver: "todo" },
    ],
  },
];
