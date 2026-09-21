/**
 * «Completa el texto» — convivencia-digital
 *
 * VERBATIM de CD-I-P07-A6 (Completa: convivencia digital). El párrafo, las
 * pistas, las respuestas y las alternativas aceptadas son las de esa actividad;
 * aquí sólo se parte el texto por sus huecos. `normaliza()` ya ignora acentos y
 * mayúsculas, pero las formas sin acento se dejan escritas para que el dato sea
 * explícito.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const CONVIVENCIA_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P07-A6 · Completa: convivencia digital",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "En el ciberespacio conviven personas con identidades ",
    ". La comunicación ",
    " respeta a todas las personas y evita la discriminación. El acoso por medios digitales se llama ",
    ". Las normas de respeto en línea se conocen como ",
    ".",
  ],
  huecos: [
    { respuesta: "diversas", alternativas: ["distintas"], pista: "Diferentes entre sí." },
    { respuesta: "inclusiva", alternativas: ["respetuosa"], pista: "Que incluye a todas las personas." },
    { respuesta: "ciberacoso", alternativas: ["ciberbullying", "cyberbullying"], pista: "Acoso digital." },
    { respuesta: "netiqueta", alternativas: [], pista: "Etiqueta de la red." },
  ],
};
