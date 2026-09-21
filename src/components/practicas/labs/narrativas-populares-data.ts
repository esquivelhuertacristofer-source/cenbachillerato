/**
 * Datos del Laboratorio — La lengua de las narrativas populares.
 * Progresión LC-II-P03 (Lengua y Comunicación II, 2.º semestre):
 * «Identifica características lingüísticas a partir de la lectura de narrativas
 * populares.»
 *
 * El tema de este laboratorio es LA LENGUA, no el género. Lo que se manipula
 * son los rasgos lingüísticos que delatan que un texto viene de la tradición
 * oral: fórmulas de apertura y cierre, repetición y paralelismo, diminutivos,
 * voces regionales y de lenguas originarias, el tiempo verbal del relato oral,
 * dichos y refranes, discurso directo sin marcas e hipérbole. Por eso no se
 * parece a `subgeneros-narrativos`, `generos-literarios` ni
 * `movimientos-literarios`, que clasifican OBRAS.
 *
 * VERBATIM de la progresión: la lectura A1 y su callout, el texto con huecos A2
 * (en `narrativas-populares-huecos.ts`), las afirmaciones V/F de A4, el
 * glosario A5 y el reactivo de opción múltiple y el de V/F del video A8.
 *
 * ILUSTRATIVO (escrito para este laboratorio): los tres relatos de los modos y
 * las frases del modo de registro. Son textos propios en el tono de la
 * tradición oral mexicana; NO reproducen ninguna leyenda ni corrido reales,
 * precisamente para no atribuir a una comunidad palabras que no dijo.
 *
 * ETIMOLOGÍAS del modo «¿De dónde viene esa voz?»: Diccionario de la lengua
 * española (RAE-ASALE, 23.ª ed.) y Diccionario de mexicanismos (Academia
 * Mexicana de la Lengua). Son datos verificables, no adornos.
 *
 * Criterio de respeto cultural que sigue todo el archivo: las voces regionales
 * y las de lenguas originarias se tratan como VARIACIÓN LEGÍTIMA del español
 * que se habla en México, nunca como error ni como curiosidad pintoresca. El
 * modo de registro no «corrige» la oralidad: la traslada a otra situación de
 * comunicación y mide qué se queda en el camino.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — «Marca los rasgos»: los rasgos de la lengua oral dentro del texto.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Rasgo =
  | "apertura"
  | "cierre"
  | "repeticion"
  | "diminutivo"
  | "voz"
  | "tiempo"
  | "dicho"
  | "directo"
  | "hiperbole";

export const RASGOS: Rasgo[] = [
  "apertura",
  "cierre",
  "repeticion",
  "diminutivo",
  "voz",
  "tiempo",
  "dicho",
  "directo",
  "hiperbole",
];

export const RASGO_INFO: Record<
  Rasgo,
  { label: string; corto: string; icono: string; color: string; que: string }
> = {
  apertura: {
    label: "Fórmula de apertura",
    corto: "Apertura",
    icono: "fa-door-open",
    color: "#5BC0EB",
    que: "Frase hecha que abre el relato y avisa que lo que sigue es de oídas, no de un testigo: «Cuentan que…», «Se dice que…», «Dicen los que saben…».",
  },
  cierre: {
    label: "Fórmula de cierre",
    corto: "Cierre",
    icono: "fa-flag-checkered",
    color: "#7DD3FC",
    que: "Frase hecha que cierra el relato y devuelve la palabra a quien escucha: «Y desde entonces…», «Eso dicen; yo nomás lo cuento».",
  },
  repeticion: {
    label: "Repetición y paralelismo",
    corto: "Repetición",
    icono: "fa-repeat",
    color: "#C77DFF",
    que: "Repetir una palabra o una estructura para medir el tiempo o el esfuerzo sin decirlo: «camina y camina», «ni de día ni de noche».",
  },
  diminutivo: {
    label: "Diminutivo",
    corto: "Diminutivo",
    icono: "fa-heart",
    color: "#FF8FAB",
    que: "En el español de México el sufijo -ito/-ita casi nunca achica: acerca, suaviza o da respeto. «Viejita» no significa «vieja pequeña».",
  },
  voz: {
    label: "Voz regional o de lengua originaria",
    corto: "Voz regional",
    icono: "fa-language",
    color: "#34D399",
    que: "Palabra propia del español de México o tomada del náhuatl, el maya u otra lengua: milpa, tianguis, tecolote. No es un error: es la lengua del lugar donde se cuenta.",
  },
  tiempo: {
    label: "Tiempo del relato oral",
    corto: "Tiempo verbal",
    icono: "fa-clock-rotate-left",
    color: "#FFC75A",
    que: "El pretérito imperfecto («se iba», «cantaba») para lo que pasaba siempre, y el presente histórico («aparece») para traer al ahora algo que ya pasó.",
  },
  dicho: {
    label: "Dicho o refrán",
    corto: "Refrán",
    icono: "fa-comment-dots",
    color: "#A3E635",
    que: "Frase fija que la comunidad reconoce y que resume la enseñanza sin explicarla. No se puede decir «con otras palabras»: dejaría de ser el refrán.",
  },
  directo: {
    label: "Discurso directo sin marcas",
    corto: "Voz sin comillas",
    icono: "fa-quote-left",
    color: "#FF8A3C",
    que: "La voz del personaje entra en el relato sin comillas ni guion: en la oralidad la sostiene la entonación de quien cuenta; en el papel hay que marcarla.",
  },
  hiperbole: {
    label: "Hipérbole",
    corto: "Hipérbole",
    icono: "fa-up-right-and-down-left-from-center",
    color: "#F472B6",
    que: "Exageración deliberada para producir efecto. La lectura A1 la nombra junto con la personificación y el suspenso como recursos frecuentes.",
  },
};

export interface Segmento {
  t: string;
  marca?: { id: string; rasgo: Rasgo; porque: string };
}

export interface Relato {
  id: string;
  titulo: string;
  tipo: string;
  segmentos: Segmento[];
}

/**
 * Tres relatos ILUSTRATIVOS escritos para este laboratorio. Cada uno lleva
 * entre cinco y seis fragmentos marcables; el resto del texto está ahí para
 * que el rasgo se lea en contexto y no como una ficha suelta.
 */
export const RELATOS: Relato[] = [
  {
    id: "r1",
    titulo: "La viejita de la milpa",
    tipo: "Leyenda de pueblo · texto ilustrativo",
    segmentos: [
      { t: "" },
      {
        t: "Cuentan que",
        marca: {
          id: "r1-1",
          rasgo: "apertura",
          porque:
            "«Cuentan que» es la fórmula de apertura: no dice quién lo vio, dice que la comunidad lo repite. Quien narra se pone a un lado y deja al relato en manos de todos.",
        },
      },
      { t: " allá por el rumbo de la barranca " },
      {
        t: "se iba",
        marca: {
          id: "r1-2",
          rasgo: "tiempo",
          porque:
            "Pretérito imperfecto: «se iba» no cuenta un viaje, cuenta una costumbre. Es el tiempo con el que la oralidad instala el «antes» donde va a pasar algo.",
        },
      },
      { t: " un señor a su " },
      {
        t: "milpa",
        marca: {
          id: "r1-3",
          rasgo: "voz",
          porque:
            "«Milpa» viene del náhuatl milli, 'parcela sembrada'. Está en el diccionario del español y nombra algo que «campo de maíz» no nombra igual: la parcela con su sistema de cultivo.",
        },
      },
      { t: " antes de que saliera el sol. Y ahí, entre la neblina, se le aparecía una " },
      {
        t: "viejita",
        marca: {
          id: "r1-4",
          rasgo: "diminutivo",
          porque:
            "El diminutivo no la hace más pequeña: la acerca y la trata con respeto. Cambiarlo por «anciana» conserva el dato y pierde el afecto de quien cuenta.",
        },
      },
      { t: " que le pedía un poco de agua. " },
      {
        t: "Y desde entonces",
        marca: {
          id: "r1-5",
          rasgo: "cierre",
          porque:
            "Fórmula de cierre: ata el relato con el presente de quien escucha. Por eso la leyenda no termina en el pasado, termina en una costumbre de hoy.",
        },
      },
      { t: ", dicen, nadie cruza la barranca sin saludar primero." },
    ],
  },
  {
    id: "r2",
    titulo: "El que se rió del tecolote",
    tipo: "Relato de escarmiento · texto ilustrativo",
    segmentos: [
      { t: "Un muchacho del pueblo se burlaba del " },
      {
        t: "tecolote",
        marca: {
          id: "r2-1",
          rasgo: "voz",
          porque:
            "«Tecolote» viene del náhuatl tecolotl, 'búho'. En buena parte de México no se dice «búho» al contar: se dice tecolote, y con la palabra viene todo lo que la comunidad asocia a ese animal.",
        },
      },
      { t: " que cantaba en la barda. " },
      {
        t: "Camina y camina",
        marca: {
          id: "r2-2",
          rasgo: "repeticion",
          porque:
            "La repetición mide el camino sin dar una sola cifra. Quien escucha no necesita saber cuántos kilómetros fueron: los siente en la repetición.",
        },
      },
      { t: " de regreso a su casa, sintió que alguien lo seguía. Se volteó y " },
      {
        t: "le dice vente conmigo, aquí no es tu lugar",
        marca: {
          id: "r2-3",
          rasgo: "directo",
          porque:
            "La voz del personaje entra sin comillas ni guion. Quien cuenta la marca con la entonación y con el cambio de voz; en el papel, sin comillas, el lector no sabría dónde empieza a hablar.",
        },
      },
      { t: ". El muchacho " },
      {
        t: "gritó tan fuerte que lo oyeron hasta el otro lado del cerro",
        marca: {
          id: "r2-4",
          rasgo: "hiperbole",
          porque:
            "Hipérbole: nadie está midiendo decibeles. La exageración es la información —qué tanto miedo tuvo—, y por eso no se puede sustituir por un dato exacto.",
        },
      },
      { t: ". " },
      {
        t: "Y ya lo dice el dicho: camarón que se duerme, se lo lleva la corriente",
        marca: {
          id: "r2-5",
          rasgo: "dicho",
          porque:
            "El refrán cierra con una enseñanza que no es del narrador sino de todos. Es una frase fija: decirla «con otras palabras» la borra.",
        },
      },
      { t: "." },
    ],
  },
  {
    id: "r3",
    titulo: "La luz del tianguis",
    tipo: "Relato urbano contemporáneo · texto ilustrativo",
    segmentos: [
      { t: "" },
      {
        t: "Dicen los que saben",
        marca: {
          id: "r3-1",
          rasgo: "apertura",
          porque:
            "Otra fórmula de apertura, la misma función: la autoridad del relato no es quien habla, es «los que saben». Así entran también las historias que circulan hoy en redes.",
        },
      },
      { t: " que en el " },
      {
        t: "tianguis",
        marca: {
          id: "r3-2",
          rasgo: "voz",
          porque:
            "«Tianguis» viene del náhuatl tiānquiztli, 'mercado'. Una palabra de hace siglos nombra un lugar de esta semana: la lengua de la tradición sigue trabajando en los relatos de ahora.",
        },
      },
      { t: " de los martes, cuando ya todos levantaron sus puestos, se queda prendida una " },
      {
        t: "lucecita",
        marca: {
          id: "r3-3",
          rasgo: "diminutivo",
          porque:
            "«Lucecita» no es sólo una luz pequeña: el diminutivo la vuelve familiar, casi tierna, justo antes de que el relato dé miedo. Ese contraste es el efecto.",
        },
      },
      { t: " al fondo del pasillo. " },
      {
        t: "Ni de día ni de noche",
        marca: {
          id: "r3-4",
          rasgo: "repeticion",
          porque:
            "Paralelismo: dos miembros con la misma forma («ni… ni…») que se oponen y abarcan el día entero. Decir «nunca» costaría una palabra y no sonaría a relato.",
        },
      },
      { t: " se apaga. Una señora contó que se acercó a mirar y de repente " },
      {
        t: "aparece",
        marca: {
          id: "r3-5",
          rasgo: "tiempo",
          porque:
            "Presente histórico dentro de un relato en pasado: el verbo salta al presente para poner la escena delante de quien escucha. Es el recurso de suspenso de la oralidad.",
        },
      },
      { t: " un niño con una bolsa del mandado. " },
      {
        t: "Eso dicen; yo nomás lo cuento",
        marca: {
          id: "r3-6",
          rasgo: "cierre",
          porque:
            "Fórmula de cierre que devuelve la responsabilidad a la comunidad. Es la misma estrategia de «Cuentan que», ahora al final: el relato se sostiene solo.",
        },
      },
      { t: "." },
    ],
  },
];

export const TOTAL_MARCAS = RELATOS.reduce(
  (n, r) => n + r.segmentos.filter((s) => s.marca).length,
  0
);

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — «De la voz al papel»: pasar una frase de registro oral a registro
 * escrito y medir qué se queda en el camino.
 *
 * Dos decisiones por caso: primero la reescritura, después qué se pierde. El
 * laboratorio NO trata la frase oral como un error; las dos versiones son
 * correctas en su situación de comunicación.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface OpcionRegistro {
  id: string;
  texto: string;
  ok: boolean;
  porque: string;
}

export interface CasoRegistro {
  id: string;
  titulo: string;
  rasgo: Rasgo;
  oral: string;
  versiones: OpcionRegistro[];
  perdidas: OpcionRegistro[];
}

export const CASOS_REGISTRO: CasoRegistro[] = [
  {
    id: "c1",
    titulo: "La fórmula de oídas",
    rasgo: "apertura",
    oral: "Cuentan que allá por la barranca se le aparecía una viejita al que iba a su milpa bien tempranito.",
    versiones: [
      {
        id: "c1-a",
        texto:
          "Según la tradición oral, en la barranca se aparecía de madrugada una anciana a quien acudía a su parcela de cultivo.",
        ok: true,
        porque:
          "Eso es cambiar de registro: la fórmula de oídas se vuelve una atribución explícita («según la tradición oral»), el diminutivo afectivo pasa a un sustantivo neutro y «bien tempranito» a «de madrugada». El lugar, la hora y el suceso siguen completos.",
      },
      {
        id: "c1-b",
        texto:
          "Cuentan que allá por la barranca se le aparecía una anciana al que iba a su parcela muy temprano.",
        ok: false,
        porque:
          "Cambiaste tres palabras, pero la frase sigue siendo oral: conserva «Cuentan que» y el orden de quien habla. Registro escrito no significa «palabras más elegantes»: significa otra manera de organizar y de atribuir la información.",
      },
      {
        id: "c1-c",
        texto: "Se apareció una señora.",
        ok: false,
        porque:
          "Eso no es cambiar de registro, es perder el relato. Desaparecieron el lugar, la hora, a quién le pasaba y de dónde viene la historia.",
      },
    ],
    perdidas: [
      {
        id: "c1-p1",
        texto: "La fórmula «Cuentan que», que avisaba que el relato viene de oídas.",
        ok: true,
        porque:
          "Exacto. En el texto escrito esa función la hace «según la tradición oral», pero ya no es una fórmula de la comunidad: es una nota del autor. Se conserva el dato y se pierde la voz que lo traía.",
      },
      {
        id: "c1-p2",
        texto: "El lugar donde ocurre la aparición.",
        ok: false,
        porque: "No: la barranca sigue ahí. Lo que cambió fue la voz que cuenta, no el escenario.",
      },
      {
        id: "c1-p3",
        texto: "La hora del día en que ocurría.",
        ok: false,
        porque:
          "No: «bien tempranito» pasó a «de madrugada». El dato se conserva; lo que se fue con él es el tono de cercanía.",
      },
    ],
  },
  {
    id: "c2",
    titulo: "La repetición que mide el camino",
    rasgo: "repeticion",
    oral: "Camina y camina, el muchacho sintió que alguien lo seguía.",
    versiones: [
      {
        id: "c2-a",
        texto: "Tras caminar un largo trecho, el muchacho sintió que alguien lo seguía.",
        ok: true,
        porque:
          "El texto escrito dice con una frase («un largo trecho») lo que la oralidad decía repitiendo. Es la traducción honesta: informa lo mismo y suena a página, no a sobremesa.",
      },
      {
        id: "c2-b",
        texto: "El muchacho caminó y caminó y sintió que alguien lo seguía.",
        ok: false,
        porque:
          "Sólo cambiaste el tiempo verbal: la repetición sigue intacta y con ella el tono oral. La estructura es la que hace oral a la frase, no el tiempo del verbo.",
      },
      {
        id: "c2-c",
        texto: "El muchacho sintió que alguien lo seguía.",
        ok: false,
        porque:
          "Borraste el trayecto entero. La repetición era información: decía cuánto llevaba caminando cuando empezó el miedo.",
      },
    ],
    perdidas: [
      {
        id: "c2-p1",
        texto: "La sensación de que el camino se hacía largo, que venía de repetir el verbo.",
        ok: true,
        porque:
          "Sí. «Un largo trecho» informa; «camina y camina» hace sentir. La oralidad prefiere que el que escucha lo sienta, porque no puede volver atrás a releer.",
      },
      {
        id: "c2-p2",
        texto: "El miedo del muchacho.",
        ok: false,
        porque: "No: «sintió que alguien lo seguía» se conserva igual en las dos versiones.",
      },
      {
        id: "c2-p3",
        texto: "La identidad de quien lo seguía.",
        ok: false,
        porque:
          "No se pierde porque nunca se dijo. Dejar eso en blanco es una decisión del relato, no un efecto del registro.",
      },
    ],
  },
  {
    id: "c3",
    titulo: "La voz del personaje",
    rasgo: "directo",
    oral: "Y le dice vente conmigo, aquí no es tu lugar.",
    versiones: [
      {
        id: "c3-a",
        texto: "Entonces la figura le dijo: «Ven conmigo, aquí no es tu lugar».",
        ok: true,
        porque:
          "El papel no tiene entonación: las comillas (o el guion de diálogo) hacen el trabajo que hacía la voz. Se conservan las palabras exactas del personaje y se marca dónde empiezan.",
      },
      {
        id: "c3-b",
        texto: "Entonces la figura le pidió que se fuera con ella.",
        ok: false,
        porque:
          "Es español escrito correcto, pero pasó la voz a estilo indirecto: ahora el lector oye al narrador, no al personaje. La reescritura que buscamos conserva la voz y sólo le añade las marcas que el papel necesita.",
      },
      {
        id: "c3-c",
        texto: "Y le dice vente conmigo, aquí no es tu lugar.",
        ok: false,
        porque:
          "Sin cambios. En voz alta funciona porque quien cuenta cambia de tono; en la página, el lector no sabe dónde termina el narrador y empieza el personaje.",
      },
    ],
    perdidas: [
      {
        id: "c3-p1",
        texto: "El presente «dice», que ponía la escena delante de quien escucha.",
        ok: true,
        porque:
          "Eso es. El presente histórico acerca la escena; el pasado la ordena. Al escribir se suele elegir el pasado por claridad, y esa inmediatez es el precio.",
      },
      {
        id: "c3-p2",
        texto: "Las palabras exactas del personaje.",
        ok: false,
        porque: "No: siguen ahí, ahora entre comillas. Lo que se marcó fue dónde empiezan.",
      },
      {
        id: "c3-p3",
        texto: "La amenaza que contiene la frase.",
        ok: false,
        porque: "No: «aquí no es tu lugar» se conserva íntegro, y con él la amenaza.",
      },
    ],
  },
  {
    id: "c4",
    titulo: "El refrán que cierra",
    rasgo: "dicho",
    oral: "Y ya lo dice el dicho: camarón que se duerme, se lo lleva la corriente.",
    versiones: [
      {
        id: "c4-a",
        texto: "El relato cierra con un refrán popular: «Camarón que se duerme, se lo lleva la corriente».",
        ok: true,
        porque:
          "El refrán se cita entero y entrecomillado, y el texto explica qué función cumple. Así se conserva la frase de la comunidad y se le da el marco que el papel pide.",
      },
      {
        id: "c4-b",
        texto: "El relato concluye que conviene mantenerse alerta.",
        ok: false,
        porque:
          "Explicaste el refrán en vez de citarlo. La enseñanza llega, pero la frase que todos reconocen —que es justamente la que hace de la enseñanza algo compartido— desaparece.",
      },
      {
        id: "c4-c",
        texto: "Y ya lo dice el dicho: hay que estar alerta.",
        ok: false,
        porque:
          "Un refrán es una frase fija: no admite sinónimos. Al cambiarle las palabras deja de ser reconocible y pierde toda su autoridad.",
      },
    ],
    perdidas: [
      {
        id: "c4-p1",
        texto: "La marca «ya lo dice el dicho», que señalaba que la enseñanza no es del narrador.",
        ok: true,
        porque:
          "Sí. Esa muletilla es un gesto de humildad muy propio de la oralidad: quien cuenta no se atribuye la moraleja, se la devuelve a la comunidad.",
      },
      {
        id: "c4-p2",
        texto: "El refrán completo.",
        ok: false,
        porque: "No: se conserva palabra por palabra, entre comillas.",
      },
      {
        id: "c4-p3",
        texto: "La enseñanza del relato.",
        ok: false,
        porque: "No: la enseñanza sigue ahí porque el refrán sigue ahí.",
      },
    ],
  },
  {
    id: "c5",
    titulo: "El diminutivo que acerca",
    rasgo: "diminutivo",
    oral: "Se queda prendida una lucecita al fondo del pasillo.",
    versiones: [
      {
        id: "c5-a",
        texto: "Al fondo del pasillo permanece encendida una luz pequeña y tenue.",
        ok: true,
        porque:
          "Registro escrito: verbo pleno («permanece encendida») y adjetivos en lugar del sufijo. Dice exactamente lo mismo del tamaño y de la intensidad de la luz.",
      },
      {
        id: "c5-b",
        texto: "Al fondo del pasillo permanece encendida una lucecita.",
        ok: false,
        porque:
          "Quedó a medio camino: un verbo de registro escrito junto a un diminutivo afectivo. No está mal dicho, pero mezcla dos voces y el lector nota la costura.",
      },
      {
        id: "c5-c",
        texto: "Al fondo del pasillo hay una luz.",
        ok: false,
        porque:
          "Perdiste dos datos que sí estaban: que la luz se queda prendida (no se apaga nunca) y que es pequeña.",
      },
    ],
    perdidas: [
      {
        id: "c5-p1",
        texto: "El afecto del diminutivo: «lucecita» no era sólo una luz pequeña.",
        ok: true,
        porque:
          "Correcto. En el español de México el diminutivo casi nunca mide tamaño: acerca. Por eso el relato la vuelve familiar justo antes de dar miedo, y la versión escrita ya no puede.",
      },
      {
        id: "c5-p2",
        texto: "El tamaño de la luz.",
        ok: false,
        porque: "No: «pequeña y tenue» lo conserva, y hasta con más precisión.",
      },
      {
        id: "c5-p3",
        texto: "El lugar donde está la luz.",
        ok: false,
        porque: "No: el fondo del pasillo sigue ahí en las dos versiones.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — «¿De dónde viene esa voz?»
 *
 * Reconocer de qué tradición viene una palabra del relato. Las tres lenguas
 * están en el español de México por caminos distintos, y ninguna de las tres
 * es un adorno: las tres nombran cosas para las que el español peninsular no
 * tenía palabra. Etimologías del DLE (RAE-ASALE) y del Diccionario de
 * mexicanismos (AML).
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Lengua = "nahuatl" | "maya" | "taino";

export const LENGUA_INFO: Record<
  Lengua,
  { titulo: string; subtitulo: string; icono: string; color: string }
> = {
  nahuatl: {
    titulo: "Náhuatl",
    subtitulo: "Lengua del centro de México, hablada hoy por más de un millón y medio de personas.",
    icono: "fa-mountain-sun",
    color: "#34D399",
  },
  maya: {
    titulo: "Maya yucateco",
    subtitulo: "Lengua de la península de Yucatán, viva y con literatura propia.",
    icono: "fa-water",
    color: "#5BC0EB",
  },
  taino: {
    titulo: "Taíno (Antillas)",
    subtitulo: "Lengua del Caribe insular: sus voces llegaron a México ya dentro del español.",
    icono: "fa-sailboat",
    color: "#FFC75A",
  },
};

export interface Voz {
  id: string;
  palabra: string;
  lengua: Lengua;
  origen: string;
  enRelato: string;
}

export const VOCES: Voz[] = [
  {
    id: "v-tianguis",
    palabra: "tianguis",
    lengua: "nahuatl",
    origen: "Del náhuatl tiānquiztli, 'mercado'.",
    enRelato: "«…en el tianguis de los martes, cuando ya todos levantaron sus puestos…»",
  },
  {
    id: "v-milpa",
    palabra: "milpa",
    lengua: "nahuatl",
    origen: "Del náhuatl milli, 'parcela sembrada'.",
    enRelato: "«…se iba un señor a su milpa antes de que saliera el sol.»",
  },
  {
    id: "v-tecolote",
    palabra: "tecolote",
    lengua: "nahuatl",
    origen: "Del náhuatl tecolotl, 'búho'.",
    enRelato: "«…se burlaba del tecolote que cantaba en la barda.»",
  },
  {
    id: "v-elote",
    palabra: "elote",
    lengua: "nahuatl",
    origen: "Del náhuatl elotl, 'mazorca tierna de maíz'.",
    enRelato: "«…le convidaron un elote y se quedó a escuchar la historia.»",
  },
  {
    id: "v-cenote",
    palabra: "cenote",
    lengua: "maya",
    origen: "Del maya yucateco ts'onot, 'pozo, depósito natural de agua'.",
    enRelato: "«…dicen que la voz sale del cenote cuando nadie se asoma.»",
  },
  {
    id: "v-henequen",
    palabra: "henequén",
    lengua: "maya",
    origen: "Voz de origen maya; nombra el agave con el que se hacen sogas y costales.",
    enRelato: "«…traía una bolsa de henequén con las mazorcas adentro.»",
  },
  {
    id: "v-pibil",
    palabra: "pibil",
    lengua: "maya",
    origen: "Del maya yucateco píib, 'horno bajo tierra'.",
    enRelato: "«…el olor de la carne en pibil se sentía desde la entrada del pueblo.»",
  },
  {
    id: "v-huracan",
    palabra: "huracán",
    lengua: "taino",
    origen: "Del taíno hurakán, nombre de la tormenta.",
    enRelato: "«…la noche del huracán fue cuando se apareció por primera vez.»",
  },
  {
    id: "v-canoa",
    palabra: "canoa",
    lengua: "taino",
    origen: "Del taíno canoa; es una de las primeras voces americanas que entraron al español.",
    enRelato: "«…cruzó en canoa y ya no lo volvieron a ver.»",
  },
  {
    id: "v-hamaca",
    palabra: "hamaca",
    lengua: "taino",
    origen: "Del taíno hamaca, la red para dormir colgada entre dos postes.",
    enRelato: "«…lo hallaron dormido en la hamaca, con la lámpara todavía prendida.»",
  },
  {
    id: "v-maiz",
    palabra: "maíz",
    lengua: "taino",
    origen: "Del taíno mahís; la planta es mexicana, pero la palabra llegó del Caribe.",
    enRelato: "«…no había maíz en la troje y aun así amaneció llena.»",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 — «Escribe el término». Glosario VERBATIM de LC-II-P03-A5, más
 * «Registro oral», que es lo que el laboratorio pone a trabajar.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const GLOSARIO: ParTermino[] = [
  {
    id: "g1",
    termino: "Narrativa popular",
    definicion: "Relato que nace de la cultura y la tradición de un pueblo o comunidad.",
    ejemplo: "La leyenda de La Llorona.",
  },
  {
    id: "g2",
    termino: "Oralidad",
    definicion: "Transmisión de relatos de boca en boca, sin estar escritos.",
    ejemplo: "Cuentos que tus abuelos contaban de memoria.",
  },
  {
    id: "g3",
    termino: "Mito",
    definicion: "Relato tradicional que explica el origen del mundo, dioses o fenómenos.",
    ejemplo: "Mitos sobre la creación del Sol y la Luna.",
  },
  {
    id: "g4",
    termino: "Leyenda",
    definicion: "Relato tradicional que mezcla hechos reales con elementos fantásticos.",
    ejemplo: "La leyenda del Callejón del Beso.",
  },
  {
    id: "g5",
    termino: "Creepypasta",
    definicion: "Relato breve de terror que circula y se reescribe en internet.",
    ejemplo: "Historias de miedo compartidas en foros y redes.",
  },
  {
    id: "g6",
    termino: "Registro oral",
    definicion:
      "Manera de usar la lengua cuando se habla a alguien que está presente: fórmulas, repeticiones, diminutivos y la voz de los personajes sin comillas.",
    ejemplo: "«Cuentan que camina y camina, y de repente aparece…»",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero/falso — VERBATIM de LC-II-P03-A4.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  {
    enunciado: "Las leyendas, mitos y cuentos populares forman parte de las narrativas populares.",
    respuesta: true,
    retro: "Correcto: surgen de la cultura y la tradición de un pueblo.",
  },
  {
    enunciado: "Muchas narrativas populares se transmitieron de forma oral antes de escribirse.",
    respuesta: true,
    retro: "Correcto: la oralidad ha sido clave para conservarlas.",
  },
  {
    enunciado: "Una creepypasta o un cómic no pueden ser adaptaciones de narrativas tradicionales.",
    respuesta: false,
    retro: "Sí pueden serlo: son formas modernas de contar historias tradicionales.",
  },
  {
    enunciado: "Reescribir una narración breve permite adaptarla a un nuevo contexto o lenguaje.",
    respuesta: true,
    retro: "Correcto: la reescritura actualiza o transforma el relato.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable. Los reactivos 1 y 6 son VERBATIM del video LC-II-P03-A8
 * (el de opción múltiple y el de verdadero/falso). Los reactivos 2 a 5 están
 * escritos para este laboratorio y preguntan por lo que aquí se manipula:
 * reconocer el rasgo lingüístico dentro de una frase.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Los rasgos lingüísticos de la narrativa popular",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué es una narrativa popular?",
      opciones: [
        "Un documento oficial de gobierno",
        "Una fórmula matemática",
        "Un relato transmitido y compartido dentro de una cultura o comunidad",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Una narrativa popular es un relato que circula y se comparte dentro de una cultura o comunidad; por eso ningún autor la firma.",
    },
    {
      enunciado: "En «Cuentan que allá por la barranca…», ¿qué rasgo lingüístico es «Cuentan que»?",
      opciones: ["Una fórmula de apertura", "Una hipérbole", "Un discurso directo", "Un diminutivo"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Es una fórmula de apertura: avisa que el relato viene de oídas y no de un testigo. La lectura A1 la menciona junto con «Se dice que…».",
    },
    {
      enunciado: "«Camina y camina, el muchacho sintió que alguien lo seguía.» La repetición sirve sobre todo para…",
      opciones: [
        "Hacer sentir que el trayecto fue largo",
        "Indicar que caminaban dos personas",
        "Corregir un error de redacción",
        "Señalar que el relato terminó",
      ],
      respuestaCorrecta: 0,
      retroalimentacion:
        "La repetición mide el tiempo y el esfuerzo sin dar una sola cifra. Quien escucha no puede releer, así que la oralidad prefiere hacerlo sentir a informarlo.",
    },
    {
      enunciado:
        "Una persona cuenta una leyenda y usa la palabra «tianguis». Desde el punto de vista lingüístico, esa palabra es…",
      opciones: [
        "Un error que convendría corregir por «mercado»",
        "Una voz de origen náhuatl integrada al español de México",
        "Una palabra inventada por quien cuenta",
        "Un tecnicismo del lenguaje científico",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "«Tianguis» viene del náhuatl tiānquiztli, 'mercado', y está registrada en el diccionario de la lengua española. Las voces regionales y de lenguas originarias no son errores: son parte del español que se habla en México.",
    },
    {
      enunciado: "Al pasar un relato oral a un texto escrito, ¿qué cambio resulta necesario?",
      opciones: [
        "Marcar con comillas o guion la voz de los personajes",
        "Eliminar todas las palabras de origen indígena",
        "Quitar cualquier diminutivo",
        "Cambiar el pasado por el futuro",
      ],
      respuestaCorrecta: 0,
      retroalimentacion:
        "En la oralidad la entonación avisa dónde empieza a hablar un personaje; en el papel hacen falta comillas o guion. Las voces regionales y los diminutivos no se quitan: son parte del relato.",
    },
    {
      enunciado:
        "Las narrativas populares tienen características lingüísticas propias que se pueden identificar al leerlas.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Verdadero: vocabulario coloquial y regional, sintaxis sencilla, predominio del pasado, fórmulas de inicio y recursos como la hipérbole.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de lectura — VERBATIM de LC-II-P03-A1.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const LECTURA_A1: string[] = [
  "Las narrativas populares son relatos que circulan en la cultura cotidiana de comunidades y pueblos: leyendas sobre lugares misteriosos, mitos de origen, cuentos transmitidos oralmente de generación en generación, creepypastas contemporáneas en internet. Todas comparten algo en común: nacen de la imaginación colectiva y dan sentido a lo que no se puede explicar fácilmente.",
  "Desde el punto de vista lingüístico, estas narrativas tienen características propias. Usan un vocabulario accesible y, a menudo, regional o coloquial. Sus estructuras sintácticas son simples pero efectivas. El tiempo verbal predominante suele ser el pasado, pero puede mezclarse con el presente para crear tensión. Abundan las fórmulas de inicio (\"Cuentan que…\", \"Se dice que…\") y los recursos expresivos como la hipérbole, la personificación y el suspenso.",
  "Estudiar las narrativas populares nos permite entender cómo una comunidad construye su identidad, sus miedos y sus valores a través del lenguaje. También nos proporciona recursos que podemos integrar en nuestros propios textos creativos.",
];

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Qué tienen en común las narrativas populares según el texto?",
    guia: "Nacen de la imaginación colectiva y dan sentido a lo que no se explica fácilmente.",
  },
  {
    pregunta: "Menciona tres características lingüísticas de las narrativas populares.",
    guia: "Vocabulario accesible/coloquial, estructuras sintácticas simples, tiempo pasado, fórmulas de inicio, hipérbole, personificación, suspenso.",
  },
  {
    pregunta: "¿Para qué nos sirve estudiar narrativas populares?",
    guia: "Para entender cómo una comunidad construye su identidad y para obtener recursos para nuestros textos creativos.",
  },
];

/** Callout «¿Sabías?» de LC-II-P03-A1, verbatim. */
export const DATO_RULFO =
  "Juan Rulfo escribió toda su obra con sólo dos libros: El Llano en llamas (1953) y Pedro Páramo (1955). A pesar de su brevedad, su influencia en la narrativa latinoamericana es comparable a la de Borges. Gabriel García Márquez afirmó que Pedro Páramo le enseñó cómo se podía escribir.";

export const NOTA_PIE =
  "Verbatim de la progresión LC-II-P03 (Lengua y Comunicación II): la lectura A1 con su callout sobre Juan Rulfo y sus preguntas de comprensión, el texto con huecos A2, las cuatro afirmaciones del apartado «Hechos» (A4), el glosario A5 y, en el reto evaluable, el reactivo de opción múltiple y el de verdadero o falso del video A8. Escrito para este laboratorio (ilustrativo): los tres relatos de «Marca los rasgos», las frases de «De la voz al papel», el término «Registro oral» y los reactivos 2 a 5 del reto. Los relatos son textos propios en el tono de la tradición oral mexicana; NO reproducen ninguna leyenda, corrido ni testimonio real, y ninguna persona o comunidad de las que aparecen existe: citar de memoria a una comunidad es la forma más fácil de atribuirle palabras que no dijo. El refrán «camarón que se duerme, se lo lleva la corriente» sí es de dominio público. Las etimologías de «¿De dónde viene esa voz?» provienen del Diccionario de la lengua española (RAE-ASALE) y del Diccionario de mexicanismos (Academia Mexicana de la Lengua). Criterio del laboratorio: las voces regionales y las de lenguas originarias son variación legítima del español de México, nunca errores; el modo de registro no corrige la oralidad, la traslada a otra situación de comunicación y mide qué se queda en el camino.";
