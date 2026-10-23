// =============================================================================
// Atlas del cuerpo humano — MODOS, misiones y experimentos (bachillerato).
//
// Seis modos: uno de exploración libre y cinco por sistema (locomotor,
// digestivo, circulatorio, respiratorio y nervioso). Cada modo trae:
//   · su «Predice» (una apuesta que se comprueba moviendo algo en el atlas);
//   · un experimento con consecuencia visible (recorrido del bolo o de la
//     sangre, latido con gasto cardiaco, respiración con ventilación, capas,
//     corte sagital del encéfalo);
//   · «Función → estructura»: se lee una función y se toca la pieza que la hace.
// Datos puros (sin three).
// =============================================================================
import type { IdSistema } from "./atlas-cuerpo-nombres";
import type { QuizEvaluable } from "./_reto-quiz";

export type Modo = "explorar" | "locomotor" | "digestivo" | "circulatorio" | "respiratorio" | "nervioso";
export type ModoHueso = "solido" | "rayos" | "oculto";

export interface ConfigModo {
  id: Modo;
  etiqueta: string;
  icono: string;
  color: string;
  /** Sistemas encendidos al entrar al modo. */
  sistemas: IdSistema[];
  hueso: ModoHueso;
  /** Encuadre de la cámara al entrar: «todo» o «sistema:x». */
  ver: string;
  intro: string;
}

export const MODOS: ConfigModo[] = [
  {
    id: "explorar",
    etiqueta: "Explorar",
    icono: "fa-person",
    color: "#f3b54a",
    sistemas: ["esqueleto", "circulatorio", "respiratorio", "digestivo", "urinario", "nervioso", "sentidos", "endocrino", "linfatico"],
    hueso: "rayos",
    ver: "todo",
    intro: "Casi 1,900 piezas reales. Toca cualquiera para saber qué es; enciende sistemas, corta el cuerpo en tres planos, desármalo o aísla una pieza.",
  },
  {
    id: "locomotor",
    etiqueta: "Locomotor",
    icono: "fa-person-running",
    color: "#e0705f",
    sistemas: ["esqueleto", "musculos"],
    hueso: "solido",
    ver: "todo",
    intro: "Huesos y músculos forman el aparato locomotor: los huesos son palancas y los músculos, que solo jalan, las mueven en pares antagonistas.",
  },
  {
    id: "digestivo",
    etiqueta: "Digestivo",
    icono: "fa-utensils",
    color: "#d9825b",
    sistemas: ["esqueleto", "digestivo"],
    hueso: "rayos",
    ver: "sistema:digestivo",
    intro: "Sigue el alimento de la boca al colon: en cada tramo pasa algo distinto, y no en todos se absorbe.",
  },
  {
    id: "circulatorio",
    etiqueta: "Circulatorio",
    icono: "fa-heart-pulse",
    color: "#e0464e",
    sistemas: ["esqueleto", "circulatorio", "respiratorio"],
    hueso: "rayos",
    ver: "sistema:circulatorio",
    intro: "Una bomba doble y dos circuitos. Cambia el ritmo del corazón y sigue a la sangre por la circulación menor y la mayor.",
  },
  {
    id: "respiratorio",
    etiqueta: "Respiratorio",
    icono: "fa-lungs",
    color: "#e99aa0",
    sistemas: ["esqueleto", "respiratorio"],
    hueso: "rayos",
    ver: "sistema:respiratorio",
    intro: "Pon a respirar el modelo: el diafragma y los pulmones se mueven, y la ventilación depende de la frecuencia y la profundidad.",
  },
  {
    id: "nervioso",
    etiqueta: "Nervioso",
    icono: "fa-brain",
    color: "#f0cf5c",
    sistemas: ["esqueleto", "nervioso"],
    hueso: "rayos",
    ver: "sistema:nervioso",
    intro: "Del encéfalo a la punta de los dedos. Corta el encéfalo por la mitad para ver lo que hay entre los hemisferios.",
  },
];

export const modoPorId = (m: Modo) => MODOS.find((x) => x.id === m)!;

// ── Función → estructura ────────────────────────────────────────────────────
export interface RetoFuncion {
  pide: string;
  /** Llaves de NOMBRES que cuentan como respuesta. */
  tocar: string[];
  bien: string;
  pista: string;
}

export const RETOS_FUNCION: Partial<Record<Modo, RetoFuncion[]>> = {
  locomotor: [
    { pide: "Toca el hueso que soporta el peso del cuerpo entre la cadera y la rodilla.", tocar: ["Femur"], bien: "Fémur: el más largo y resistente; recibe el peso del tronco en la cadera y lo pasa a la tibia.", pista: "Baja la capa muscular: está dentro del muslo." },
    { pide: "Toca un hueso que protege al encéfalo.", tocar: ["Frontal bone", "Parietal bone", "Occipital bone", "Temporal bone", "Sphenoid bone"], bien: "Los huesos planos del cráneo forman una bóveda unida por suturas: protección, no movimiento.", pista: "Está en la cabeza; quita la capa muscular para verlo mejor." },
    { pide: "Toca el tendón que transmite la fuerza de la pantorrilla al talón.", tocar: ["Calcaneal tendon"], bien: "Tendón calcáneo (de Aquiles): une el gemelo y el sóleo con el calcáneo y levanta el talón al caminar.", pista: "Gira el cuerpo por la espalda y baja hasta el tobillo." },
    { pide: "Toca el músculo que extiende la cadera para levantarte de una silla.", tocar: ["Gluteus maximus muscle"], bien: "Glúteo mayor: el más voluminoso del cuerpo; extiende la cadera al levantarte, subir escaleras y correr.", pista: "Míralo por la espalda, a la altura de la pelvis." },
  ],
  digestivo: [
    { pide: "Toca la glándula que produce la bilis, que emulsiona las grasas.", tocar: ["Liver"], bien: "Hígado: produce la bilis; además guarda glucógeno y desintoxica la sangre.", pista: "Es la víscera más grande, arriba a la derecha del abdomen (a tu izquierda si lo ves de frente)." },
    { pide: "Toca el órgano donde el HCl y la pepsina inician la digestión de proteínas.", tocar: ["Stomach"], bien: "Estómago: el jugo gástrico ácido activa la pepsina y convierte el bolo en quimo.", pista: "Bolsa muscular bajo el diafragma, del lado izquierdo del cuerpo." },
    { pide: "Toca el órgano que guarda la bilis y la suelta cuando llegan grasas al duodeno.", tocar: ["Gallbladder"], bien: "Vesícula biliar: concentra la bilis y la vacía al duodeno por el colédoco.", pista: "Es pequeña y verde, pegada por debajo del hígado. Mueve «Separar» si no la ves." },
    { pide: "Toca la glándula que vierte enzimas al duodeno y además produce insulina.", tocar: ["Pancreas"], bien: "Páncreas: glándula mixta; exocrina (enzimas digestivas) y endocrina (insulina y glucagón).", pista: "Está detrás del estómago. Sube «Separar» para despegar las piezas." },
  ],
  circulatorio: [
    { pide: "Toca la cámara que bombea sangre oxigenada a todo el cuerpo.", tocar: ["Left ventricle"], bien: "Ventrículo izquierdo: su miocardio es el más grueso porque impulsa la circulación mayor.", pista: "Es la cámara inferior del lado izquierdo del cuerpo (a tu derecha si ves el corazón de frente)." },
    { pide: "Toca la cámara donde está el marcapasos natural del corazón.", tocar: ["Right atrium"], bien: "Aurícula derecha: ahí está el nodo sinusal, que inicia cada latido.", pista: "Es la cámara superior que recibe a las venas cavas." },
    { pide: "Toca la arteria donde se toma el pulso en el cuello.", tocar: ["Right common carotid artery", "Left common carotid artery", "Internal carotid artery", "External carotid artery"], bien: "Arteria carótida: lleva sangre a la cabeza y al encéfalo; su pulso se siente junto a la tráquea.", pista: "Sube por el cuello, a cada lado de la tráquea." },
  ],
  respiratorio: [
    { pide: "Toca el cartílago que cierra la laringe al tragar.", tocar: ["Epiglottis"], bien: "Epiglotis: cierra la vía aérea al deglutir para que el bolo vaya al esófago.", pista: "Está arriba de la laringe, detrás de la lengua. Acércate al cuello." },
    { pide: "Toca el tubo con anillos de cartílago que lleva el aire a los bronquios.", tocar: ["Trachea"], bien: "Tráquea: sus anillos en forma de C la mantienen abierta; sus cilios barren el moco.", pista: "Baja por el cuello, por delante del esófago." },
    { pide: "Toca el lóbulo que solo tiene el pulmón derecho.", tocar: ["Middle lobe of right lung"], bien: "Lóbulo medio: el pulmón derecho tiene tres lóbulos; el izquierdo, dos, para dejar lugar al corazón.", pista: "Pulmón derecho del cuerpo (a tu izquierda si lo ves de frente), en medio." },
    { pide: "Toca el músculo principal de la inspiración.", tocar: ["Diaphragm"], bien: "Diafragma: al contraerse baja, el tórax gana volumen y entra el aire.", pista: "Es la cúpula bajo los pulmones." },
  ],
  nervioso: [
    { pide: "Toca el lóbulo que procesa la información visual.", tocar: ["Occipital lobe"], bien: "Lóbulo occipital: corteza visual, en la parte posterior del cerebro.", pista: "Gira el encéfalo: está atrás, sobre el cerebelo." },
    { pide: "Toca la estructura que coordina el equilibrio y la precisión del movimiento.", tocar: ["Cerebellum"], bien: "Cerebelo: compara el movimiento que se ordenó con el que ocurre y lo corrige.", pista: "Abajo y atrás del cerebro." },
    { pide: "Toca la estructura que controla la respiración y el latido sin que lo pienses.", tocar: ["Medulla oblongata"], bien: "Bulbo raquídeo: sus centros regulan la respiración, la frecuencia cardiaca y la presión.", pista: "Es la parte más baja del tallo cerebral, justo antes de la médula." },
    { pide: "Toca el lóbulo que planea los movimientos voluntarios y toma decisiones.", tocar: ["Frontal lobe"], bien: "Lóbulo frontal: planeación, decisiones y corteza motora.", pista: "Detrás de la frente." },
  ],
};

// ── Recorridos (se tocan las piezas en orden) ───────────────────────────────
export interface Parada {
  nombre: string;
  tocar: string[];
  /** Además de `tocar`, cualquier pieza cuya llave cumpla esto (p. ej. los dientes). */
  tocarRe?: RegExp;
  /** Qué pasa ahí (se muestra al llegar). */
  ocurre: string;
  /** Qué tocar si el alumno se equivoca. */
  pista: string;
}
export interface Recorrido {
  titulo: string;
  icono: string;
  color: string;
  paradas: Parada[];
}

const LOBULOS_PULMON = ["Superior lobe of right lung", "Middle lobe of right lung", "Inferior lobe of right lung", "Superior lobe of left lung", "Inferior lobe of left lung"];

export const RECORRIDOS: Partial<Record<Modo, Recorrido>> = {
  digestivo: {
    titulo: "El viaje del bolo",
    icono: "fa-route",
    color: "#f59e0b",
    paradas: [
      { nombre: "Boca", tocar: ["Tongue", "Gingiva", "Uvula of palate"], tocarRe: /tooth|incisor|canine|molar/i, ocurre: "Digestión mecánica y química: se mastica y la amilasa salival empieza a romper el almidón. Se forma el bolo.", pista: "El viaje empieza donde entra el alimento: toca la boca (la lengua o los dientes)." },
      { nombre: "Esófago", tocar: ["Oesophagus"], ocurre: "Peristalsis: ondas musculares empujan el bolo hasta el estómago. Aquí no se digiere ni se absorbe.", pista: "Al tragar, el bolo baja por un tubo detrás de la tráquea." },
      { nombre: "Estómago", tocar: ["Stomach"], ocurre: "HCl y pepsina inician la digestión de proteínas; el bolo se vuelve quimo. Casi no se absorbe nada.", pista: "El esófago desemboca en una bolsa muscular bajo el diafragma, a la izquierda del cuerpo." },
      { nombre: "Duodeno", tocar: ["Duodenum"], ocurre: "Llegan la bilis (emulsiona grasas) y el jugo pancreático (enzimas y bicarbonato que neutraliza el ácido).", pista: "El quimo pasa al primer tramo del intestino delgado, en forma de C junto al páncreas." },
      { nombre: "Intestino delgado", tocar: ["Jejunum"], ocurre: "Absorción: azúcares, aminoácidos y grasas pasan a la sangre a través de las vellosidades. Aquí se absorbe la mayor parte.", pista: "Sigue el resto del intestino delgado: las asas enrolladas en el centro del abdomen." },
      { nombre: "Colon ascendente", tocar: ["Ascending colon"], ocurre: "Empieza el intestino grueso: absorbe agua y sales; la microbiota fermenta la fibra.", pista: "El delgado desemboca abajo, a la derecha del cuerpo, en el colon que sube." },
      { nombre: "Colon transverso", tocar: ["Transverse colon"], ocurre: "Sigue la absorción de agua; el contenido se vuelve más sólido.", pista: "El colon cruza el abdomen de un lado a otro, bajo el estómago." },
      { nombre: "Colon descendente", tocar: ["Descending colon"], ocurre: "Las heces se compactan mientras bajan.", pista: "Del lado izquierdo del cuerpo, el colon baja." },
      { nombre: "Colon sigmoide", tocar: ["Sigmoid colon"], ocurre: "Lleva las heces al recto para eliminarlas. Todo el viaje dura de 24 a 72 horas.", pista: "La última curva en forma de S, en la pelvis." },
    ],
  },
  circulatorio: {
    titulo: "El viaje de la sangre",
    icono: "fa-route",
    color: "#38bdf8",
    paradas: [
      { nombre: "Venas cavas", tocar: ["Superior vena cava", "Inferior vena cava (thoracic part)", "Inferior vena cava (abdominal part)"], ocurre: "La sangre poco oxigenada regresa del cuerpo al corazón.", pista: "Empieza donde la sangre del cuerpo vuelve: las venas cavas, gruesas y azules." },
      { nombre: "Aurícula derecha", tocar: ["Right atrium"], ocurre: "Recibe la sangre del cuerpo y la pasa por la válvula tricúspide.", pista: "Las cavas desembocan en la cámara superior del lado derecho del cuerpo." },
      { nombre: "Ventrículo derecho", tocar: ["Right ventricle"], ocurre: "Se contrae y la impulsa por la válvula pulmonar: empieza la circulación menor.", pista: "Baja a la cámara inferior del mismo lado." },
      { nombre: "Tronco pulmonar", tocar: ["Pulmonary trunk", "Bifurcation of pulmonary trunk", "Right pulmonary artery", "Left pulmonary artery"], ocurre: "Arteria con sangre poco oxigenada (por eso va en azul) rumbo a los pulmones.", pista: "Del ventrículo derecho sale un vaso azul hacia arriba que se divide en dos." },
      { nombre: "Pulmones", tocar: LOBULOS_PULMON, ocurre: "En los capilares de los alvéolos la sangre suelta CO₂ y toma O₂.", pista: "Las arterias pulmonares entran a los pulmones: toca un lóbulo." },
      { nombre: "Venas pulmonares", tocar: ["Right superior pulmonary vein", "Right inferior pulmonary vein", "Left superior pulmonary vein", "Left inferior pulmonary vein"], ocurre: "Venas con sangre oxigenada (por eso van en rojo) de regreso al corazón.", pista: "Gira el corazón: las venas pulmonares, rojas, entran por detrás." },
      { nombre: "Aurícula izquierda", tocar: ["Left atrium"], ocurre: "Recibe la sangre oxigenada y la pasa por la válvula mitral.", pista: "Las venas pulmonares desembocan en la cámara superior del lado izquierdo." },
      { nombre: "Ventrículo izquierdo", tocar: ["Left ventricle"], ocurre: "La pared más gruesa: impulsa la sangre a todo el cuerpo con la mayor presión.", pista: "Baja a la cámara inferior izquierda, la de pared más gruesa." },
      { nombre: "Aorta", tocar: ["Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta"], ocurre: "La sangre oxigenada sale a la circulación mayor. Circuito completo: en reposo tarda cerca de un minuto.", pista: "Del ventrículo izquierdo sale la arteria más grande, que se curva hacia atrás." },
    ],
  },
};

/** ¿La pieza `clave` cuenta como esta parada? */
export const esParada = (p: Parada, clave: string) => p.tocar.includes(clave) || (p.tocarRe ? p.tocarRe.test(clave) : false);

// ── Predice (una por modo) ──────────────────────────────────────────────────
export interface PrediceModo {
  escena: string;
  pregunta: string;
  opciones: { id: string; texto: string; icono: string }[];
  correcta: string;
  porque: string;
  comoComprobarlo: string;
}

export const PREDICE: Record<Modo, PrediceModo> = {
  explorar: {
    escena: "El atlas tiene casi 1,900 piezas reales y se puede cortar en tres planos.",
    pregunta: "Si cortas el tórax en horizontal a la altura del corazón, ¿qué queda a sus lados?",
    opciones: [
      { id: "a", texto: "Los dos pulmones", icono: "fa-lungs" },
      { id: "b", texto: "El hígado y el estómago", icono: "fa-utensils" },
      { id: "c", texto: "Los dos riñones", icono: "fa-droplet" },
    ],
    correcta: "a",
    porque: "El corazón está en el mediastino, entre los dos pulmones y cargado a la izquierda. El hígado y el estómago quedan bajo el diafragma; los riñones, todavía más abajo y atrás.",
    comoComprobarlo: "Elige el corte transversal, baja la altura hasta el pecho y toca lo que rodea al corazón.",
  },
  locomotor: {
    escena: "El bíceps, al contraerse, dobla el codo.",
    pregunta: "Si un músculo solo puede jalar, ¿qué músculo vuelve a estirar el codo?",
    opciones: [
      { id: "a", texto: "El tríceps, detrás del brazo", icono: "fa-hand-back-fist" },
      { id: "b", texto: "El deltoides, en el hombro", icono: "fa-person-rays" },
      { id: "c", texto: "El bíceps, al relajarse", icono: "fa-arrows-left-right" },
    ],
    correcta: "a",
    porque: "Un músculo no empuja. El bíceps, delante del húmero, flexiona el codo; el tríceps, detrás, lo extiende. Forman un par antagonista: cuando uno se contrae, el otro se relaja.",
    comoComprobarlo: "Gira el cuerpo para verlo por la espalda y toca el músculo que está detrás del húmero.",
  },
  digestivo: {
    escena: "Un bocado tarda de uno a tres días en recorrer el tubo digestivo.",
    pregunta: "¿En qué tramo se absorbe la mayor parte de los nutrientes?",
    opciones: [
      { id: "a", texto: "En el estómago", icono: "fa-bowl-food" },
      { id: "b", texto: "En el intestino delgado", icono: "fa-bacon" },
      { id: "c", texto: "En el intestino grueso", icono: "fa-water" },
    ],
    correcta: "b",
    porque: "El estómago digiere, pero casi no absorbe. En el intestino delgado las vellosidades multiplican la superficie y por ahí pasan a la sangre azúcares, aminoácidos y grasas. El grueso absorbe sobre todo agua.",
    comoComprobarlo: "Sigue el viaje del bolo tocando cada órgano en orden y lee qué pasa en cada parada.",
  },
  circulatorio: {
    escena: "El corazón tiene dos lados que laten al mismo tiempo.",
    pregunta: "La sangre que sale del ventrículo derecho, ¿a dónde va primero?",
    opciones: [
      { id: "a", texto: "A los pulmones", icono: "fa-lungs" },
      { id: "b", texto: "A todo el cuerpo por la aorta", icono: "fa-person" },
      { id: "c", texto: "Al encéfalo por las carótidas", icono: "fa-brain" },
    ],
    correcta: "a",
    porque: "El lado derecho mueve la circulación menor: por el tronco pulmonar la sangre poco oxigenada va a los pulmones, se oxigena y regresa a la aurícula izquierda. Solo entonces el ventrículo izquierdo la manda al cuerpo.",
    comoComprobarlo: "Sigue el viaje de la sangre: toca en orden las cámaras y los vasos desde las venas cavas.",
  },
  respiratorio: {
    escena: "El diafragma es una cúpula de músculo bajo los pulmones.",
    pregunta: "Cuando el diafragma se contrae, ¿hacia dónde se mueve y qué hace el aire?",
    opciones: [
      { id: "a", texto: "Sube y el aire entra", icono: "fa-arrow-up" },
      { id: "b", texto: "Baja y el aire entra", icono: "fa-arrow-down" },
      { id: "c", texto: "Baja y el aire sale", icono: "fa-wind" },
    ],
    correcta: "b",
    porque: "Al contraerse, el diafragma se aplana y baja: el tórax gana volumen, la presión en los pulmones queda por debajo de la atmosférica y el aire entra (ley de Boyle). Al relajarse sube y el aire sale.",
    comoComprobarlo: "Pon a respirar el modelo y mira el diafragma y el indicador de fase durante una respiración completa.",
  },
  nervioso: {
    escena: "El cerebro tiene dos hemisferios, izquierdo y derecho.",
    pregunta: "Si cortas el encéfalo por la mitad, de adelante hacia atrás, ¿qué une los hemisferios?",
    opciones: [
      { id: "a", texto: "El cuerpo calloso", icono: "fa-bridge" },
      { id: "b", texto: "El cerebelo", icono: "fa-brain" },
      { id: "c", texto: "El bulbo raquídeo", icono: "fa-grip-lines-vertical" },
    ],
    correcta: "a",
    porque: "El cuerpo calloso es un puente de unos 200 millones de axones que comunica el hemisferio izquierdo con el derecho. El cerebelo coordina el movimiento y el bulbo controla la respiración y el latido.",
    comoComprobarlo: "Elige el corte sagital, déjalo en el centro y toca la estructura en arco que aparece entre los hemisferios.",
  },
};

// ── Fisiología en números (experimentos de circulatorio y respiratorio) ────
export const FC_MIN = 40;
export const FC_MAX = 180;
export const FC_INICIO = 70;
export const FC_META = 120;
export const VS_ML = 70; // volumen sistólico típico en reposo
export const gastoCardiaco = (fc: number, vs = VS_ML) => (fc * vs) / 1000; // L/min

export const FR_MIN = 8;
export const FR_MAX = 40;
export const FR_INICIO = 14;
export const VC_MIN = 300;
export const VC_MAX = 2500;
export const VC_INICIO = 500;
export const VENT_META = 15;
export const ventilacion = (fr: number, vc: number) => (fr * vc) / 1000; // L/min

// ── Reto evaluable ──────────────────────────────────────────────────────────
export const QUIZ_ATLAS: QuizEvaluable = {
  titulo: "Reto: estructura y función del cuerpo humano",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Por qué la pared del ventrículo izquierdo es más gruesa que la del derecho?",
      opciones: ["Porque recibe más sangre que el derecho", "Porque impulsa la sangre a todo el cuerpo, contra mayor resistencia", "Porque guarda oxígeno para los pulmones", "Porque ahí está el marcapasos natural"],
      respuestaCorrecta: 1,
      retroalimentacion: "El ventrículo izquierdo impulsa la circulación mayor, que recorre todo el cuerpo y ofrece mucha más resistencia que el circuito pulmonar. Más trabajo, más miocardio.",
    },
    {
      enunciado: "La arteria pulmonar se colorea de azul en el atlas porque…",
      opciones: ["es una vena", "lleva sangre poco oxigenada hacia los pulmones", "lleva sangre oxigenada hacia el cuerpo", "su pared es más delgada"],
      respuestaCorrecta: 1,
      retroalimentacion: "Arteria significa «sale del corazón», no «lleva oxígeno». La arteria pulmonar sale del ventrículo derecho con sangre poco oxigenada; por convención se pinta de azul.",
    },
    {
      enunciado: "Al contraerse el diafragma durante la inspiración…",
      opciones: ["sube y reduce el volumen del tórax", "baja, aumenta el volumen del tórax y la presión pulmonar disminuye", "baja y expulsa el aire", "no cambia el volumen del tórax"],
      respuestaCorrecta: 1,
      retroalimentacion: "Más volumen implica menos presión (ley de Boyle): cuando la presión alveolar queda por debajo de la atmosférica, el aire entra.",
    },
    {
      enunciado: "Una persona respira 20 veces por minuto con un volumen corriente de 500 mL. ¿Cuál es su ventilación pulmonar?",
      opciones: ["2.5 L/min", "10 L/min", "25 L/min", "520 L/min"],
      respuestaCorrecta: 1,
      retroalimentacion: "Ventilación = frecuencia × volumen corriente = 20 × 0.5 L = 10 L/min.",
    },
    {
      enunciado: "¿En qué órgano se absorbe la mayor parte de los nutrientes?",
      opciones: ["Estómago", "Intestino delgado", "Intestino grueso", "Hígado"],
      respuestaCorrecta: 1,
      retroalimentacion: "Las vellosidades y microvellosidades del intestino delgado multiplican la superficie de absorción. El estómago casi no absorbe y el grueso absorbe sobre todo agua.",
    },
    {
      enunciado: "La bilis que emulsiona las grasas se produce en…",
      opciones: ["la vesícula biliar", "el hígado", "el páncreas", "el duodeno"],
      respuestaCorrecta: 1,
      retroalimentacion: "El hígado produce la bilis; la vesícula solo la almacena y la concentra.",
    },
    {
      enunciado: "El bíceps y el tríceps braquial son un ejemplo de…",
      opciones: ["músculos sinergistas que hacen lo mismo", "un par antagonista: uno flexiona el codo y el otro lo extiende", "músculos involuntarios", "tendones del codo"],
      respuestaCorrecta: 1,
      retroalimentacion: "Como el músculo solo puede jalar, cada movimiento tiene su contrario: el bíceps flexiona y el tríceps extiende.",
    },
    {
      enunciado: "Una lesión en el lóbulo occipital afectaría principalmente…",
      opciones: ["la audición", "la visión", "el equilibrio", "el control de la respiración"],
      respuestaCorrecta: 1,
      retroalimentacion: "El lóbulo occipital contiene la corteza visual. La audición es del temporal, el equilibrio del cerebelo y la respiración del bulbo raquídeo.",
    },
  ],
};
