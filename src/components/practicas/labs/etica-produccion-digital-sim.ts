/**
 * Modelo del SIMULADOR «Estudio Lumbre» (lab «etica-produccion-digital»).
 *
 * Todo es ficticio: el colectivo estudiantil «Lumbre», su campaña «Cuidemos el
 * agua» y TODAS las cifras (vistas, confianza, riesgo) son valores de
 * simulación para aprender; no miden nada real.
 *
 * El modelo es DETERMINISTA: las mismas decisiones dan siempre el mismo
 * resultado. Cada paso de la producción tiene tres caminos; el atajo suele dar
 * más alcance al principio, pero deja un riesgo que después se cobra (baja del
 * video, queja, alerta). Se publica con lo decidido y se ve la consecuencia.
 *
 *   vistas    = base + Σ alcance de cada decisión
 *   confianza = base + Σ aportes
 *   riesgo    = Σ aportes (0-100)
 *   vistasFinal = vistas × Π (1 − pérdida de cada incidente)
 */

export const VISTAS_BASE = 300;
export const CONFIANZA_BASE = 50;
/** Tope para dibujar el medidor de vistas. */
export const VISTAS_MAX = 1700;

export type PasoId = "musica" | "imagenes" | "personas" | "ia" | "datos" | "tono";

export interface OpcionPaso {
  id: string;
  titulo: string;
  detalle: string;
  icono: string;
  /** Vistas que suma a la publicación (simulación). */
  vistas: number;
  confianza: number;
  riesgo: number;
  /** Incidente que dispara al publicar, si lo hay. */
  incidente?: IncidenteId;
  buena: boolean;
  /** Por qué: la explicación que se muestra al elegir. */
  porque: string;
  /** Lo que se ve en la vista previa de la publicación. */
  vista: string;
}

export interface Paso {
  id: PasoId;
  titulo: string;
  pregunta: string;
  icono: string;
  /** Clave de la imagen de apoyo (/media/labs-sim/etica-produccion-digital/<foto>.webp). */
  foto: string;
  opciones: OpcionPaso[];
}

export type IncidenteId = "baja-autor" | "queja-privacidad" | "alerta-desinfo" | "denuncia-discrimina" | "aviso-ia";

export interface Incidente {
  id: IncidenteId;
  titulo: string;
  icono: string;
  quien: string;
  texto: string;
  /** Fracción de las vistas que se pierde (0-1). */
  perdida: number;
  /** Confianza que cuesta. */
  confianza: number;
}

export const INCIDENTES: Record<IncidenteId, Incidente> = {
  "baja-autor": {
    id: "baja-autor",
    titulo: "Baja por derechos de autor",
    icono: "fa-ban",
    quien: "Aviso automático de la plataforma",
    texto: "El video se silencia y luego se retira: usaba obra protegida sin permiso del autor.",
    perdida: 0.4,
    confianza: -10,
  },
  "queja-privacidad": {
    id: "queja-privacidad",
    titulo: "Queja de una familia",
    icono: "fa-user-lock",
    quien: "Familia de una compañera (ficticia)",
    texto: "Una familia exige borrar el video: aparece una menor que nunca autorizó que la publicaran.",
    perdida: 0.3,
    confianza: -20,
  },
  "alerta-desinfo": {
    id: "alerta-desinfo",
    titulo: "Etiqueta de «información falsa»",
    icono: "fa-flag",
    quien: "Verificadores de la comunidad (ficticios)",
    texto: "Comprueban que el dato o la voz son falsos y marcan la publicación; muchos dejan de compartirla.",
    perdida: 0.5,
    confianza: -30,
  },
  "denuncia-discrimina": {
    id: "denuncia-discrimina",
    titulo: "Denuncia por discriminación",
    icono: "fa-hand",
    quien: "Comité de convivencia de la escuela (ficticio)",
    texto: "La burla a un grupo se reporta; hay que retirar el video y ofrecer disculpa pública.",
    perdida: 0.35,
    confianza: -25,
  },
  "aviso-ia": {
    id: "aviso-ia",
    titulo: "Comentarios: «¿esto es real?»",
    icono: "fa-comments",
    quien: "Comunidad escolar (ficticia)",
    texto: "Nadie avisó que las imágenes eran generadas con IA; quien lo descubre siente que lo engañaron.",
    perdida: 0.15,
    confianza: -15,
  },
};

export const PASOS: Paso[] = [
  {
    id: "musica",
    titulo: "Música",
    pregunta: "El video necesita música de fondo. ¿Cuál usas?",
    icono: "fa-music",
    foto: "mesa-audio",
    opciones: [
      {
        id: "pop",
        titulo: "El éxito del momento",
        detalle: "Una canción famosa, sin pedir permiso. Todos la conocen.",
        icono: "fa-fire",
        vistas: 260,
        confianza: 0,
        riesgo: 30,
        incidente: "baja-autor",
        buena: false,
        porque: "Atrae vistas, pero usar música protegida sin permiso viola derechos de autor aunque el video sea escolar y no lo monetices.",
        vista: "Canción famosa de fondo",
      },
      {
        id: "libre",
        titulo: "Pista con licencia libre",
        detalle: "De un banco de música libre; pones el crédito al autor.",
        icono: "fa-file-contract",
        vistas: 130,
        confianza: 10,
        riesgo: 0,
        buena: true,
        porque: "La licencia permite usarla si das crédito. Pierdes algo de gancho, pero no hay nada que te la quiten.",
        vista: "Música con licencia libre y crédito",
      },
      {
        id: "propia",
        titulo: "La toca un compañero",
        detalle: "Una guitarra grabada por alguien del colectivo, con su permiso.",
        icono: "fa-guitar",
        vistas: 90,
        confianza: 14,
        riesgo: 0,
        buena: true,
        porque: "Es obra propia y con autorización de quien la crea: cero riesgo, y suma identidad a tu campaña.",
        vista: "Música original del colectivo",
      },
    ],
  },
  {
    id: "imagenes",
    titulo: "Imágenes",
    pregunta: "Faltan tomas de ríos y llaves. ¿De dónde las sacas?",
    icono: "fa-image",
    foto: "fotos-impresas",
    opciones: [
      {
        id: "buscador",
        titulo: "Del buscador de imágenes",
        detalle: "Las más bonitas que salen; no apuntas de dónde son.",
        icono: "fa-magnifying-glass",
        vistas: 140,
        confianza: -5,
        riesgo: 18,
        buena: false,
        porque: "No citar la fuente de una imagen es plagio, aunque sea trabajo escolar. Que esté en internet no significa que sea libre.",
        vista: "Fotos sin crédito",
      },
      {
        id: "banco",
        titulo: "De un banco libre, con crédito",
        detalle: "Fotos con licencia libre; el crédito de cada una va al final.",
        icono: "fa-images",
        vistas: 110,
        confianza: 10,
        riesgo: 0,
        buena: true,
        porque: "Las licencias libres permiten usar la imagen y pedir crédito es parte del trato: citar es reconocer la autoría.",
        vista: "Fotos con licencia libre y créditos",
      },
      {
        id: "propias",
        titulo: "Salen a grabar ustedes",
        detalle: "Tres tardes en el arroyo y la llave del patio, con sus propias cámaras.",
        icono: "fa-camera",
        vistas: 80,
        confianza: 12,
        riesgo: 0,
        buena: true,
        porque: "Material propio: la autoría es tuya. Cuesta más tiempo, pero nadie te lo puede reclamar.",
        vista: "Tomas propias del colectivo",
      },
    ],
  },
  {
    id: "personas",
    titulo: "Personas",
    pregunta: "En una escena aparecen compañeros de 1.º y 2.º, algunos menores de edad. ¿Qué haces?",
    icono: "fa-people-group",
    foto: "patio-grupo",
    opciones: [
      {
        id: "sin-aviso",
        titulo: "Los dejas tal cual",
        detalle: "Salieron bien y se ve natural; nadie preguntó.",
        icono: "fa-video",
        vistas: 160,
        confianza: -10,
        riesgo: 28,
        incidente: "queja-privacidad",
        buena: false,
        porque: "Publicar imágenes de otras personas sin su consentimiento vulnera su privacidad; en menores, el permiso lo dan sus tutores.",
        vista: "Rostros de menores sin autorización",
      },
      {
        id: "difuminar",
        titulo: "Difuminas las caras sin avisar",
        detalle: "Ya no se les reconoce, así que no hace falta preguntar.",
        icono: "fa-eye-slash",
        vistas: 60,
        confianza: 2,
        riesgo: 10,
        buena: false,
        porque: "Ayuda, pero no basta: la voz, la ropa o el lugar pueden identificarlos y nadie decidió participar. Lo correcto es preguntar primero.",
        vista: "Rostros difuminados, sin permiso previo",
      },
      {
        id: "permiso",
        titulo: "Pides permiso a quien aparece",
        detalle: "Autorización por escrito de cada persona o de sus tutores; quien no quiere, no sale.",
        icono: "fa-file-signature",
        vistas: 100,
        confianza: 16,
        riesgo: 0,
        buena: true,
        porque: "El consentimiento informado es la base del respeto a la privacidad. Además, la gente que sí aceptó comparte el video con gusto.",
        vista: "Participantes con autorización",
      },
    ],
  },
  {
    id: "ia",
    titulo: "Inteligencia artificial",
    pregunta: "Quieren una voz que explique la campaña y algunas ilustraciones. ¿Usan IA?",
    icono: "fa-wand-magic-sparkles",
    foto: "rostro-puntos",
    opciones: [
      {
        id: "deepfake",
        titulo: "Voz del director «apoyando» la campaña",
        detalle: "Clonan su voz con IA para que diga que respalda el proyecto. Él no lo sabe.",
        icono: "fa-masks-theater",
        vistas: 300,
        confianza: -20,
        riesgo: 40,
        incidente: "alerta-desinfo",
        buena: false,
        porque: "Es un deepfake: hace parecer que alguien dijo algo que nunca dijo. Engaña a la gente y daña a la persona suplantada.",
        vista: "Voz clonada de una persona real",
      },
      {
        id: "ia-callada",
        titulo: "Ilustraciones con IA, sin decirlo",
        detalle: "Quedan muy bien; la gente creerá que las dibujaron ustedes.",
        icono: "fa-palette",
        vistas: 150,
        confianza: -5,
        riesgo: 12,
        incidente: "aviso-ia",
        buena: false,
        porque: "Usar IA no es el problema: ocultarlo sí. La transparencia exige declarar de dónde viene lo que presentas.",
        vista: "Imágenes con IA sin aviso",
      },
      {
        id: "ia-avisada",
        titulo: "Ilustraciones con IA, con aviso",
        detalle: "Las usan y lo dicen en el video y en la descripción. La voz es de una compañera.",
        icono: "fa-circle-info",
        vistas: 120,
        confianza: 12,
        riesgo: 0,
        buena: true,
        porque: "Declarar el uso de IA es transparencia: el público sabe qué es real y qué fue generado, y decide con información.",
        vista: "Imágenes con IA declaradas",
      },
    ],
  },
  {
    id: "datos",
    titulo: "Datos y patrocinio",
    pregunta: "El guion trae una cifra impactante y una marca de agua embotellada (ficticia) les da apoyo.",
    icono: "fa-chart-simple",
    foto: "libreta-apuntes",
    opciones: [
      {
        id: "cifra-suelta",
        titulo: "Cifra de un mensaje reenviado, sin marca",
        detalle: "«Se desperdicia el 90 % del agua». Suena fuerte. La marca no se menciona.",
        icono: "fa-bolt",
        vistas: 220,
        confianza: -15,
        riesgo: 26,
        incidente: "alerta-desinfo",
        buena: false,
        porque: "Compartir sin verificar es desinformar, y ocultar quién te apoya rompe la transparencia: el público merece saber de dónde viene el mensaje.",
        vista: "Cifra sin fuente y apoyo oculto",
      },
      {
        id: "verifica",
        titulo: "Buscan la fuente y la citan",
        detalle: "Comprueban el dato en el informe original, lo citan y dicen que la marca los apoyó.",
        icono: "fa-magnifying-glass-chart",
        vistas: 120,
        confianza: 16,
        riesgo: 0,
        buena: true,
        porque: "Veracidad más transparencia: el dato está verificado, se puede comprobar y el público sabe quién apoya el proyecto.",
        vista: "Dato con fuente y patrocinio declarado",
      },
      {
        id: "opinion",
        titulo: "Lo presentan como opinión",
        detalle: "Sin cifra: «Creemos que se desperdicia mucha agua». Mencionan el apoyo de la marca.",
        icono: "fa-comment",
        vistas: 90,
        confianza: 8,
        riesgo: 2,
        buena: true,
        porque: "Una opinión es válida si se presenta claramente como opinión. Con menos fuerza, pero sin engañar.",
        vista: "Opinión presentada como opinión",
      },
    ],
  },
  {
    id: "tono",
    titulo: "Gancho",
    pregunta: "Para abrir el video quieren un chiste que haga reír. ¿Cuál eligen?",
    icono: "fa-face-laugh",
    foto: "micro-escenario",
    opciones: [
      {
        id: "burla",
        titulo: "Imitar el acento de un compañero de otro estado",
        detalle: "Es lo que más risa da en el salón.",
        icono: "fa-masks-theater",
        vistas: 240,
        confianza: -15,
        riesgo: 30,
        incidente: "denuncia-discrimina",
        buena: false,
        porque: "Ridiculizar a alguien por su forma de hablar o su origen es discriminación, aunque se disfrace de broma.",
        vista: "Burla a un compañero",
      },
      {
        id: "humor-sano",
        titulo: "Un chiste sobre la regadera que gotea",
        detalle: "Humor sobre la situación, sin señalar a nadie.",
        icono: "fa-faucet-drip",
        vistas: 130,
        confianza: 10,
        riesgo: 0,
        buena: true,
        porque: "El humor que no estereotipa ni denigra a nadie respeta la no discriminación y sigue funcionando.",
        vista: "Humor sin burlas a personas",
      },
      {
        id: "sin-gancho",
        titulo: "Empezar directo con los datos",
        detalle: "Sin chiste: se entra de lleno al tema.",
        icono: "fa-forward",
        vistas: 60,
        confianza: 6,
        riesgo: 0,
        buena: true,
        porque: "Es seguro, pero menos llamativo. Ser responsable no obliga a ser aburrido, aunque a veces cuesta alcance.",
        vista: "Inicio directo",
      },
    ],
  },
];

export type Elecciones = Partial<Record<PasoId, string>>;

export interface Resultado {
  vistas: number;
  confianza: number;
  riesgo: number;
  incidentes: Incidente[];
  vistasFinal: number;
  confianzaFinal: number;
  hechos: number;
}

const acota = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n));

export function opcionDe(paso: PasoId, id: string | undefined): OpcionPaso | undefined {
  return PASOS.find((p) => p.id === paso)?.opciones.find((o) => o.id === id);
}

/** Indicadores con lo decidido hasta ahora (antes de publicar). */
export function simular(el: Elecciones): Resultado {
  let vistas = VISTAS_BASE;
  let confianza = CONFIANZA_BASE;
  let riesgo = 0;
  const incidentes: Incidente[] = [];
  let hechos = 0;
  for (const p of PASOS) {
    const o = opcionDe(p.id, el[p.id]);
    if (!o) continue;
    hechos += 1;
    vistas += o.vistas;
    confianza += o.confianza;
    riesgo += o.riesgo;
    if (o.incidente && !incidentes.some((i) => i.id === o.incidente)) incidentes.push(INCIDENTES[o.incidente]);
  }
  return { vistas, confianza: acota(confianza), riesgo: acota(riesgo), incidentes, vistasFinal: vistas, confianzaFinal: acota(confianza), hechos };
}

/** Lo que pasa DESPUÉS de publicar: incidentes que se cobran vistas y confianza. */
export function publicar(el: Elecciones): Resultado {
  const r = simular(el);
  let factor = 1;
  let conf = r.confianza;
  for (const i of r.incidentes) {
    factor *= 1 - i.perdida;
    conf += i.confianza;
  }
  return { ...r, vistasFinal: Math.round(r.vistas * factor), confianzaFinal: acota(conf) };
}

/** Campaña responsable: sin incidentes, riesgo bajo y confianza alta. */
export function metaLograda(r: Resultado): boolean {
  return r.incidentes.length === 0 && r.riesgo <= 5 && r.confianzaFinal >= 70;
}

/** Cuántas decisiones fueron la opción responsable. */
export function buenasDe(el: Elecciones): number {
  return PASOS.filter((p) => opcionDe(p.id, el[p.id])?.buena).length;
}
