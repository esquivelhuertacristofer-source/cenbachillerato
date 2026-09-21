/**
 * Datos de la Ficha Teórica del laboratorio "Likes and opinions: la feria de
 * gustos" (IN-I-P07, progresión 7 de Inglés I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «What do you like? — Gustos y opiniones en
 *     inglés» (sin su recuadro ajeno sobre la ENDUTIH).
 *   - Glosario: glosario interactivo A6 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE, TITULO_A1 } from "./gustos-opiniones-ingles-data";

export const GUSTOS_OPINIONES_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-I · P07 · A1 — ${TITULO_A1}`,

  // Las viñetas van en renglones propios (la ficha no respeta saltos de línea).
  marcoTeorico: LECTURA_A1.flatMap((p) => p.split("\n")),

  objetivos: [
    "Preguntar por gustos con Do you like…? y contestar con respuestas cortas (Yes, I do. / No, I don't.).",
    "Usar like, love, enjoy, don't like y hate con un sustantivo (I like music) o con un verbo en -ing (I like playing soccer).",
    "Distinguir los grados de gusto, de I love a I hate, y entender que I don't mind es neutro.",
    "Hablar de los gustos de otras personas con -s y doesn't (Ana likes karaoke; Jorge doesn't like reading) y resumir una encuesta (Three students like…).",
    "Dar razones con because + sujeto + to be + adjetivo (because it is fun).",
    "Responder a gustos distintos con empatía: reaccionar, decir lo que tú prefieres y no descalificar.",
  ],

  materiales: [
    {
      nombre: "Feria de Gustos (3D)",
      detalle: "Seis puestos en el patio de la Preparatoria Las Jacarandas (ficticia): Sports, Video games, Books, Art, Spicy food y Karaoke.",
      icono: "fa-store",
    },
    { nombre: "Seis compañeros", detalle: "Ana, Luis, Paola, Jorge, Daniela y Emiliano (ficticios), con gustos y razones propios.", icono: "fa-people-group" },
    { nombre: "Gráfica de barras 3D", detalle: "Suma cada respuesta de la encuesta: like, don't mind o don't like.", icono: "fa-chart-column" },
    { nombre: "Emojis de reacción", detalle: "Muestran el grado de gusto de cada persona, de love a hate.", icono: "fa-face-smile" },
    { nombre: "Perfiles y mesas", detalle: "Textos breves en inglés para formar mesas y grupos donde todos estén contentos.", icono: "fa-id-card" },
    { nombre: "Tarjetas de papel", detalle: "Tu gusto y tu razón en español para responder en inglés a cada compañero.", icono: "fa-note-sticky" },
  ],

  conceptos: [
    {
      termino: "Like + sustantivo o + -ing",
      definicion:
        "I like music. I like playing soccer. Después de like, love, enjoy, hate y don't mind el verbo va en -ing: «I like play» es incorrecto. «Like to play» también existe, pero en A1 se practica like + -ing.",
    },
    {
      termino: "Grados de gusto",
      definicion:
        "De más a menos: I love (me encanta) · I really like (me gusta mucho) · I like (me gusta) · I don't mind (no me molesta) · I don't like (no me gusta) · I hate (odio).",
    },
    { termino: "I don't mind", definicion: "Es neutro: a la persona no le molesta, pero tampoco le gusta. En una encuesta no se cuenta como like ni como don't like." },
    {
      termino: "Preguntas",
      definicion: "Do you like…? (sí o no) · What do you think of…? (tu opinión) · What's your favorite…? (tu favorito). Nunca «You like…?», «Are you like…?» ni «Like you…?».",
    },
    { termino: "Respuestas cortas", definicion: "Yes, I do. / No, I don't. «Yes, I like» y «Yes, I am» son incorrectas." },
    {
      termino: "Tercera persona",
      definicion:
        "Con he, she o un nombre el verbo lleva -s: Ana likes, Luis loves, Jorge hates. La negativa es doesn't + verbo sin -s: Paola doesn't like soccer (no «don't like» ni «doesn't likes»).",
    },
    {
      termino: "Resumir una encuesta",
      definicion: "Plural sin -s: Three students like drawing. Singular con -s: One student likes reading. Nobody y everybody van en singular: Nobody likes…",
    },
    { termino: "Because", definicion: "Introduce la razón y necesita sujeto: I like it because it is fun (no «because is fun»)." },
    {
      termino: "Empatía",
      definicion:
        "Reacciona antes de dar un gusto distinto (That's cool! · That's nice! · I see. · Really? Why?), habla de lo que tú prefieres (I prefer…) y evita palabras que desprecian (stupid, weird, gross): «That's fine, everyone is different».",
    },
    { termino: "Favorite", definicion: "Es adjetivo: My favorite sport is basketball. «Favourite» es la ortografía británica; en inglés de Estados Unidos, favorite." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Conocer a compañeros nuevos en la escuela, un intercambio o un club: Do you like…? What's your favorite…?",
    "Hacer encuestas sencillas en clase y reportar los resultados en inglés: Four students like soccer.",
    "Planear actividades con amigos donde todos la pasen bien, leyendo lo que cada quien prefiere.",
    "Conversar en línea (videojuegos, redes, foros) con personas de otros países y opinar sin ofender.",
  ],

  fuente: FUENTE,
};
