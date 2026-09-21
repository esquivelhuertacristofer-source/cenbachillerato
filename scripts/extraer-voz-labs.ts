/**
 * SACA DEL NAVEGADOR TODO LO QUE UN LABORATORIO PIDE DECIR EN VOZ ALTA.
 *
 * Hermano de `scripts/extraer-voz-actividades.ts`, pero aquí la fuente NO es la
 * base de datos: las frases de los laboratorios viven dentro del código de cada
 * lab —en arreglos de diálogos, de tarjetas, de fichas— y muchas se arman al
 * vuelo. Leerlas con una expresión regular sería adivinar. Se MIDEN: se abre
 * cada laboratorio en un Chromium de verdad, se sustituye
 * `speechSynthesis.speak` por un espía que apunta el `text` de cada
 * `SpeechSynthesisUtterance`, y se pulsa todo lo que habla en TODOS los modos.
 *
 * POR QUÉ ESTO EXISTE. El botón «Escuchar» de estos laboratorios usaba la
 * Web Speech API: la voz que suena es la que esa máquina tenga
 * instalada. En Windows sale la SAPI vieja (David/Zira), que pronuncia el
 * inglés como un robot, y en un Chromebook puede no haber ninguna voz. Es
 * exactamente el defecto que la cabecera de `scripts/narrar-actividades.py`
 * explica para el español. Aquí se prepara el texto para grabarlo una sola vez
 * con `en-US-AvaNeural` —una sola locutora para todo el inglés, igual que Dalia
 * es la única en español— y que el alumno oiga siempre a la misma persona.
 *
 * GPU DE VERDAD. Doce de estos laboratorios son escenas three.js. Se abre
 * Chromium con ANGLE sobre D3D11; nunca swiftshader, que tarda minutos por
 * cuadro y deja la página sin pintar.
 *
 * LA CLAVE DE CADA CLIP ES EL HASH DE SU TEXTO, no el nombre del laboratorio:
 * «Good morning» se dice en cinco labs y se graba una vez. El reproductor
 * (`src/components/practicas/labs/lab-voz.ts`) arma la misma clave con la misma
 * regla, así que lo que se escribe aquí es un contrato.
 *
 * Uso:
 *   npx tsx scripts/extraer-voz-labs.ts                 todos los labs
 *   npx tsx scripts/extraer-voz-labs.ts --solo aula-ingles-interacciones,perfil-personal-ingles
 *   npx tsx scripts/extraer-voz-labs.ts --puerto 3107
 *   npx tsx scripts/extraer-voz-labs.ts --limpio        rehace el volcado entero
 *   npx tsx scripts/extraer-voz-labs.ts --ver           con ventana, para mirar
 *
 * El volcado ACUMULA: se puede barrer de tres en tres sin perder lo anterior.
 *
 *   → data/voz-labs.json
 */
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { createHash } from "crypto";
import { normalizarTextoVoz, claveDeVozLab } from "../src/components/practicas/labs/lab-voz-clave";

/* ── Qué laboratorios ────────────────────────────────────────────────────── */

/** Los 21 laboratorios con botón «Escuchar», con su slug del registry. */
export const LABS_CON_VOZ: { slug: string; archivo: string }[] = [
  { slug: "aula-ingles-interacciones", archivo: "LabAulaIngles" },
  { slug: "casa-escuela-objetos-ingles-3d", archivo: "LabCasaObjetosIngles" },
  { slug: "ciudad-direcciones-ingles-3d", archivo: "LabCiudadDireccionesIngles" },
  { slug: "clima-vestimenta-ingles-3d", archivo: "LabClimaVestimentaIngles" },
  { slug: "cortesia-conversacion-ingles-3d", archivo: "LabCortesiaConversacionIngles" },
  { slug: "describir-personas-clima-ingles", archivo: "LabDescribirPersonasClima" },
  { slug: "experiencias-recientes-ingles", archivo: "LabExperienciasRecientes" },
  { slug: "gustos-opiniones-ingles-3d", archivo: "LabGustosOpinionesIngles" },
  { slug: "habilidades-permisos-ingles-3d", archivo: "LabHabilidadesPermisosIngles" },
  { slug: "habitos-comparaciones-ingles", archivo: "LabHabitosComparaciones" },
  { slug: "instrucciones-ingles", archivo: "LabInstruccionesIngles" },
  { slug: "lectura-en-voz-alta", archivo: "LabLecturaVozAlta" },
  { slug: "lugares-recomendaciones-ingles-3d", archivo: "LabLugaresRecomendacionesIngles" },
  { slug: "mercado-necesidades-ingles-3d", archivo: "LabMercadoNecesidadesIngles" },
  { slug: "pasado-viaje-ingles", archivo: "LabPasadoViajeIngles" },
  { slug: "perfil-personal-ingles", archivo: "LabPerfilPersonalIngles" },
  { slug: "planes-futuro-ingles-3d", archivo: "LabPlanesFuturoIngles" },
  { slug: "relato-secuencia-ingles-3d", archivo: "LabRelatoSecuenciaIngles" },
  { slug: "rutina-diaria-ingles-3d", archivo: "LabRutinaDiariaIngles" },
  { slug: "terminal-horarios-ingles-3d", archivo: "LabTerminalHorariosIngles" },
  { slug: "tiempo-libre-ingles", archivo: "LabTiempoLibreIngles" },
];

/** Lo que deja un barrido de un laboratorio. */
interface ResultadoBarrido {
  /** Cuántas veces habló el laboratorio, contando repeticiones. */
  frases: number;
  /** Cuántas de esas frases no se habían visto nunca. */
  nuevas: number;
  modos: number;
  error?: string;
}

export interface FilaVozLab {
  /** `en` o `es`. Sale del `utterance.lang` que pidió el propio laboratorio. */
  idioma: string;
  /** Hash del texto normalizado. Es el nombre del MP3 y la clave del índice. */
  clave: string;
  texto: string;
  /** Qué labs lo dicen. Informativo: el clip se graba una sola vez. */
  labs: string[];
}

/* ── Argumentos ──────────────────────────────────────────────────────────── */

const ARG = process.argv.slice(2);
function opcion(nombre: string, porDefecto: string): string {
  const i = ARG.indexOf(nombre);
  return i >= 0 && ARG[i + 1] ? ARG[i + 1]! : porDefecto;
}
/** `localhost`, nunca `127.0.0.1`: el dev server escucha sólo en el primero. */
const BASE = `http://localhost:${opcion("--puerto", "3107")}`;
const SOLO = opcion("--solo", "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
/** Con `--limpio` el volcado se rehace desde cero en vez de acumular. */
const LIMPIO = ARG.includes("--limpio");
const VER = ARG.includes("--ver");
/** `--traza` cuenta por consola lo que va viendo cada ronda. */
const TRAZA = ARG.includes("--traza");
const DESTINO = resolve(process.cwd(), "data/voz-labs.json");

/** Tope de tiempo por laboratorio. Ninguno tarda tanto sin estar atascado. */
const TOPE_POR_LAB_MS = 8 * 60 * 1000;

/**
 * Laboratorios que necesitan más tiempo porque hay que JUGARLOS, no pulsarlos.
 * `relato-secuencia-ingles-3d` sólo narra cuando el orden de las viñetas es
 * coherente, y cada intento cuesta 3.4 s por viñeta reproducida.
 */
const TOPE_ESPECIAL_MS: Record<string, number> = {
  "relato-secuencia-ingles-3d": 20 * 60 * 1000,
};

/**
 * Cuánto se deja hablar a una narración con temporizadores antes de volver a
 * pulsar. Seis pasos de 3.4 s en `LabRelatoSecuenciaIngles` son 20 s; se dan 26.
 */
const ESPERA_NARRACION_MS = 26_000;

/** Tope de rondas por modo. Casi nunca se llega: la saturación corta antes. */
const RONDAS_MAX = 16;
/**
 * Cuántas rondas seguidas sin una frase nueva se toleran antes de dar el modo
 * por visto. Con dos se cortaba pronto: hay mazos que tardan una ronda entera
 * en colocar bien una pieza y sueltan su frase en la siguiente.
 */
const SECAS_MAX = 4;

/**
 * Botones que NO se pulsan durante el barrido: abren la teoría encima de todo,
 * apagan el sonido, reinician la partida o salen del laboratorio. Ninguno
 * habla, y todos estorban a los que sí.
 *
 * LA FICHA TEÓRICA Y SUS PESTAÑAS ENTRAN AQUÍ, y no es un detalle. El
 * `teor[ií]a` de antes casaba con el `title` «Teoría de la práctica» pero NO con
 * «Ficha teórica» ni con «Marco teórico» —otra vocal—, así que el barrido
 * abría y cerraba el cajón a cada pasada. En `LabHabitosComparaciones` eso
 * tapaba la tarjeta a medio resolver y el laboratorio se quedaba en cuatro
 * frases: medido con el cajón excluido, sube a veinte.
 */
const NO_PULSAR =
  /te[oó]r[ií][ca]|ficha|marco te|objetivos|materiales|conceptos centrales|glosario|silenciar|activar sonido|volver|salir|reiniciar|reinicia|empezar de nuevo|cerrar|pantalla completa/i;

/* ── El espía ────────────────────────────────────────────────────────────── */

/**
 * Se inyecta ANTES de que corra nada de la página, y espía LAS DOS SALIDAS de
 * voz que puede tener un laboratorio.
 *
 *  · `speechSynthesis.speak` — lo que dice una frase que TODAVÍA NO está
 *    grabada. Se deja el objeto en su sitio (los labs comprueban
 *    `"speechSynthesis" in window` y llaman a `getVoices()`) y sólo se cambia
 *    `speak` por una libreta, para que el barrido no tarde lo que tardaría en
 *    pronunciar mil frases.
 *
 *  · `new Audio()` — lo que pide una frase que YA está grabada. Esto no sobra:
 *    en cuanto se grabó la primera tanda, esos laboratorios dejaron de llamar a
 *    `speechSynthesis` y el barrido siguiente los vio MUDOS. Sin este segundo
 *    espía, volver a medir un laboratorio ya grabado dice «0 frases» y no se
 *    puede distinguir de uno que de veras no habla. Del \`src\` sale la clave, y
 *    la clave ya se sabe a qué texto corresponde.
 */
const ESPIA = `
(() => {
  window.__vozLab = [];
  window.__vozClip = [];

  // Un \`Audio\` de mentira: apunta la clave y no baja ni toca nada. Ademas de
  // no ensordecer la maquina, evita bajarse un MP3 por cada pulsacion del
  // barrido, que son miles.
  const AudioReal = window.Audio;
  function AudioEspia() {
    const el = {
      preload: '', currentTime: 0, playbackRate: 1, onerror: null, onended: null,
      canPlayType: () => 'maybe',
      play: () => Promise.resolve(),
      pause: () => {},
      load: () => {},
      removeAttribute: () => {},
      set src(v) { try { window.__vozClip.push(String(v)); } catch (e) {} },
      get src() { return ''; },
    };
    return el;
  }
  AudioEspia.prototype = AudioReal ? AudioReal.prototype : {};
  window.Audio = AudioEspia;

  const ss = window.speechSynthesis;
  if (!ss) return;
  // \`getVoices\` se deja EN PAZ. Devolver voces de mentira parece mas comodo,
  // pero los labs hacen \`u.voice = voz\` y asignar un objeto plano a esa
  // propiedad lanza TypeError: el manejador del boton revienta antes de llamar
  // a \`speak\` y el barrido sale con cero frases.
  // Se escribe en \`window.__vozLab\` MIRANDOLO CADA VEZ, no en un arreglo
  // capturado: el drenaje pone uno nuevo, y un cierre sobre el viejo dejaria de
  // apuntar nada despues del primer drenaje.
  ss.speak = (u) => {
    try { window.__vozLab.push({ texto: String(u && u.text || ''), lang: String(u && u.lang || '') }); } catch (e) {}
  };
  ss.cancel = () => {};
  ss.pause = () => {};
  ss.resume = () => {};
})();
`;

/* ── Utilidades de barrido ───────────────────────────────────────────────── */

interface Cosecha {
  /** Frases que salieron por el sintetizador: son las que NO tienen clip. */
  dichas: { texto: string; lang: string }[];
  /** Claves de clip que el laboratorio pidió: las que SÍ están grabadas. */
  clips: string[];
}

async function drenar(page: Page): Promise<Cosecha> {
  return page.evaluate(() => {
    const w = window as unknown as { __vozLab?: { texto: string; lang: string }[]; __vozClip?: string[] };
    const dichas = w.__vozLab ?? [];
    const clips = w.__vozClip ?? [];
    w.__vozLab = [];
    w.__vozClip = [];
    return { dichas, clips };
  });
}

/**
 * Las pestañas de modo.
 *
 * La regla buena es la que ya usa el banco de humo
 * (`src/components/practicas/__tests__/labs-dom-humo.test.tsx`):
 * `button[class$="-tab"]` menos `.fc-tab`, que es la pestaña interna de la
 * ficha teórica y cambia el contenido del cajón, no el del laboratorio. Si un
 * laboratorio no siguiera esa convención queda la heurística de abajo: el grupo
 * de botones con texto que comparte padre y está más arriba en la página.
 */
async function pestanas(page: Page): Promise<string[]> {
  const porClase = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button[class$="-tab"]'))
      .filter((b) => !b.classList.contains("fc-tab"))
      .map((b) => (b.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
  );
  if (porClase.length >= 2) return porClase;

  return page.evaluate(() => {
    const porPadre = new Map<Element, { txt: string; top: number }[]>();
    for (const b of Array.from(document.querySelectorAll("button"))) {
      const txt = (b.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!txt || txt.length > 48) continue;
      const r = b.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const p = b.parentElement;
      if (!p) continue;
      const lista = porPadre.get(p) ?? [];
      lista.push({ txt, top: r.top });
      porPadre.set(p, lista);
    }
    let mejor: { txt: string; top: number }[] = [];
    let mejorTop = Infinity;
    for (const lista of porPadre.values()) {
      if (lista.length < 3) continue;
      const top = Math.min(...lista.map((x) => x.top));
      if (top < mejorTop) {
        mejorTop = top;
        mejor = lista;
      }
    }
    return mejor.map((x) => x.txt);
  });
}

/**
 * La lista de botones pulsables, en orden de documento.
 *
 * NO se marcan con un atributo. Se intentó: se les ponía `data-vozspy="n"` al
 * empezar la ronda y luego se pulsaba por ese atributo. Falla en cuanto un
 * clic hace que React REEMPLACE el nodo en vez de actualizarlo —la tarjeta
 * entera se vuelve a montar— porque el nodo nuevo nace sin el atributo y
 * todos los clics siguientes de la ronda caen al vacío. Así se quedó
 * `LabHabitosComparaciones` con CERO frases: respondía la primera tarjeta y,
 * desde ahí, el barrido pulsaba fantasmas.
 *
 * Se recalcula la lista en cada clic y se pulsa por POSICIÓN. La posición
 * baila un poco cuando el laboratorio añade o quita botones, y da igual: las
 * rondas se repiten hasta saturar.
 */
/**
 * CÓMO SE PULSA: por POSICIÓN, recalculando la lista en cada clic.
 *
 * Lo primero que se intentó fue marcar los botones con `data-vozspy="n"` al
 * empezar la ronda y pulsar luego por ese atributo. Falla en cuanto un clic
 * hace que React REEMPLACE el nodo en vez de actualizarlo —la tarjeta entera
 * se vuelve a montar—, porque el nodo nuevo nace sin el atributo y todos los
 * clics siguientes de la ronda caen al vacío. Así se quedó
 * `LabHabitosComparaciones` con CERO frases: respondía la primera tarjeta y
 * desde ahí el barrido pulsaba fantasmas.
 *
 * La posición baila un poco cuando el laboratorio añade o quita botones, y da
 * igual: las rondas se repiten hasta saturar.
 */
/**
 * Los botones pulsables ahora mismo, en orden de documento. Devuelve sus
 * etiquetas; la posición en esta lista es lo que `pulsar` vuelve a calcular.
 */
async function etiquetasPulsables(page: Page, excluir: string[]): Promise<string[]> {
  return page.evaluate((exc) => {
    const fuera = new Set(exc);
    const out: string[] = [];
    for (const b of Array.from(document.querySelectorAll("button, [role='button']"))) {
      const el = b as HTMLElement;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((el as HTMLButtonElement).disabled) continue;
      const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (fuera.has(texto)) continue;
      out.push(
        [texto, el.getAttribute("title") ?? "", el.getAttribute("aria-label") ?? ""].filter(Boolean).join(" · ")
      );
    }
    return out;
  }, excluir);
}

/**
 * Pulsa el n-ésimo pulsable, RECALCULANDO la lista en el momento.
 *
 * Por `el.click()` y no con el ratón: así una ficha teórica abierta encima no
 * intercepta el clic y no hace falta ir cerrando ventanas todo el rato.
 */
async function pulsar(page: Page, indice: number, excluir: string[]): Promise<void> {
  await page.evaluate(
    ([exc, i]) => {
      const fuera = new Set(exc as string[]);
      const lista: HTMLElement[] = [];
      for (const b of Array.from(document.querySelectorAll("button, [role='button']"))) {
        const el = b as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if ((el as HTMLButtonElement).disabled) continue;
        const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        if (fuera.has(texto)) continue;
        lista.push(el);
      }
      lista[i as number]?.click();
    },
    [excluir, indice] as [string[], number]
  );
}

/**
 * Selector de lo que HABLA: el botón «Escuchar» de cada laboratorio, con las
 * tres formas en que está escrito (clase, `title`, `aria-label`).
 */
const SELECTOR_ESCUCHAR = [
  '[class*="escuchar"]',
  '[title*="escuchar" i]',
  '[aria-label*="escuchar" i]',
  '[title*="listen" i]',
  '[aria-label*="listen" i]',
  '[title*="pronunc" i]',
  '[title*="oír" i]',
  '[aria-label*="oír" i]',
].join(",");

/**
 * Recoge la cosecha inmediata: pulsa TODO lo que habla, ahora mismo.
 *
 * Esto es lo que hace que el barrido sirva. En estos laboratorios el botón
 * «Escuchar» de una tarjeta NO existe hasta que la tarjeta se resuelve —en
 * `LabAulaIngles` sólo la opción CORRECTA lo enseña, y sólo después de
 * acertar—. Un barrido que mira los botones al principio de la ronda nunca ve
 * los que nacieron a mitad: se resolvían las ocho situaciones y se escuchaba
 * una. Por eso, tras cada clic, se vuelve a mirar quién habla ahora.
 *
 * Y SE VUELVEN A PULSAR LOS MISMOS, sin llevar cuenta de cuáles ya se
 * pulsaron. Parece derroche y no lo es: en `LabCiudadDireccionesIngles` hay UN
 * solo botón «Escuchar» que dice la ruta de la misión en curso, así que
 * pulsarlo una vez por ronda daba una ruta de cinco. El elemento es el mismo;
 * lo que cambia es lo que dice. Repetir una frase ya vista no cuesta nada: se
 * deduplica por su hash.
 */
async function cosechar(page: Page): Promise<void> {
  await page.evaluate((sel) => {
    const habla = new Set<Element>(Array.from(document.querySelectorAll(sel)));
    // Y también los que lo dicen sólo con su ETIQUETA. En `LabLecturaVozAlta`
    // los dos botones son «Escuchar de corrido» y «Escuchar con la
    // puntuación», con clase `lva-btn` y un `title` que habla del ritmo, no de
    // escuchar: por clase o por `title` no los veía nadie y ese laboratorio se
    // quedó con una lectura de tres.
    for (const b of Array.from(document.querySelectorAll("button"))) {
      if (/^(escuchar|listen|o[ií]r)/i.test((b.textContent ?? "").trim())) habla.add(b);
    }
    for (const e of Array.from(habla).slice(0, 24)) {
      const el = e as HTMLElement;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      el.click();
    }
  }, SELECTOR_ESCUCHAR);
}

/**
 * Enciende los interruptores de narración que vienen apagados.
 *
 * `LabRelatoSecuenciaIngles` trae «Narración en voz alta: no» y no dice una
 * palabra hasta que se pulsa. El barrido lo pulsaba como a cualquier otro
 * botón —y por tanto lo volvía a apagar en la ronda siguiente—, así que ese
 * laboratorio salía casi mudo. Aquí se pulsa SÓLO cuando está en «no».
 */
async function encenderVoz(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const b of Array.from(document.querySelectorAll("button"))) {
      const t = (b.textContent ?? "").replace(/\s+/g, " ").trim();
      if (/(voz alta|narraci[oó]n|audio)\s*:\s*no\b/i.test(t)) (b as HTMLElement).click();
    }
  });
}

/**
 * Pulsa el primer botón vivo cuya etiqueta sea exactamente ésta.
 *
 * Dentro de una tarjeta hay que pulsar POR NOMBRE y no por posición. Acertar
 * la regla de «La escalera del adjetivo» HACE NACER las opciones del
 * comparativo, y ésas empujan hacia abajo a todo lo que venía después: quien
 * iba recorriendo posiciones acaba pulsando otra cosa a media tarjeta y nunca
 * llega al superlativo. El nombre no se mueve.
 */
async function pulsarEtiqueta(page: Page, etiqueta: string): Promise<void> {
  await page.evaluate((et) => {
    for (const b of Array.from(document.querySelectorAll("button, [role='button']"))) {
      const el = b as HTMLElement;
      if ((el as HTMLButtonElement).disabled) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      const propia = [texto, el.getAttribute("title") ?? "", el.getAttribute("aria-label") ?? ""]
        .filter(Boolean)
        .join(" · ");
      if (propia === et) {
        el.click();
        return;
      }
    }
  }, etiqueta);
}

/** Pulsa el primer botón vivo cuyo TEXTO VISIBLE sea exactamente éste. */
async function pulsarTextoExacto(page: Page, texto: string): Promise<void> {
  await page.evaluate((t) => {
    for (const b of Array.from(document.querySelectorAll("button, [role='button']"))) {
      const el = b as HTMLElement;
      if ((el as HTMLButtonElement).disabled) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((el.textContent ?? "").replace(/\s+/g, " ").trim() === t) {
        el.click();
        return;
      }
    }
  }, texto);
}

/**
 * Botones que arrancan una NARRACIÓN POR TEMPORIZADORES, no una frase suelta.
 */
const REPRODUCTOR = /reproduc|^play\b|contar la historia|ver la escena/i;

/**
 * Botones que pasan de tarjeta en un mazo: el número de la tarjeta, «Anterior»
 * / «Siguiente», o un «N de M» en su etiqueta accesible.
 *
 * Lo de «N de M» no es un adorno. El botón de la tarjeta EN CURSO cambia su
 * número por una palomita, así que se queda sin el dígito por el que se le
 * reconocía y sólo le queda su `aria-label`: «escaleras 1 de 7». Sin esta
 * alternativa, el barrido lo tomaba por contenido y lo pulsaba en cada pasada,
 * volviendo a la primera tarjeta una y otra vez: `LabHabitosComparaciones`
 * resolvía siete veces la misma escalera y las otras seis no decían nunca su
 * frase.
 */
const NAVEGACION =
  /^\d{1,2}\b|\b\d{1,2}\s+(de|of)\s+\d{1,2}\b|anterior|siguiente|previous|next\b/i;

/**
 * Se queda callado y escuchando mientras una secuencia se narra sola.
 *
 * `LabRelatoSecuenciaIngles` no dice una frase por clic: pulsas «Reproducir» y
 * la historia se cuenta sola, un paso cada 3.4 segundos. El barrido pulsaba el
 * botón y 45 ms después pulsaba otra cosa que llamaba a `cancelarTimers()`, así
 * que la narración moría antes de la primera palabra y ese laboratorio salía
 * con UNA frase. Aquí, al pulsar un reproductor, se deja de tocar nada y sólo
 * se recoge lo que va diciendo.
 */
async function dejarHablar(page: Page, apuntar: () => Promise<void>, nuevasDe: () => number): Promise<void> {
  let secas = 0;
  for (let i = 0; i < ESPERA_NARRACION_MS / 500 && secas < 8; i += 1) {
    const antes = nuevasDe();
    await page.waitForTimeout(500);
    await apuntar();
    secas = nuevasDe() > antes ? 0 : secas + 1;
  }
}

/**
 * JUEGA EL MAZO: entra a cada tarjeta y la resuelve ahí mismo.
 *
 * El barrido normal recorre los botones en orden de documento, y en estos
 * laboratorios la botonera de tarjetas («1 2 3 4 5 6 7») está ARRIBA del
 * contenido. Resultado: cada ronda navegaba hasta la última tarjeta y sólo
 * entonces llegaba a las opciones, así que ronda tras ronda se resolvía
 * siempre la misma —la séptima— y las seis primeras no decían nunca su
 * frase. `LabHabitosComparaciones` se quedó así en cuatro frases de la
 * veintena que tiene.
 *
 * Aquí se hace al revés y a propósito: se va a UNA tarjeta y, sin moverse de
 * ella, se pulsa todo lo que no sea navegación hasta acertar. Es jugar el
 * laboratorio, que es lo único que destapa el botón «Escuchar» de una tarjeta
 * resuelta.
 */
async function jugarMazo(page: Page, tabs: string[], apuntar: () => Promise<void>): Promise<void> {
  const etiquetas = await etiquetasPulsables(page, tabs);
  const cuantas = etiquetas.filter((t) => /^\d{1,2}\b/.test(t) && !NO_PULSAR.test(t)).length;
  if (cuantas < 2) return;

  for (let carta = 1; carta <= Math.min(cuantas, 14); carta += 1) {
    // Se salta a la tarjeta por EL NÚMERO QUE SE VE, no por su etiqueta
    // completa ni con el botón «Siguiente».
    //
    // Las dos alternativas se probaron y las dos fallan. La etiqueta completa
    // lleva pegado el `title`, y al resolver una tarjeta el botón cambia el
    // número por una palomita: la etiqueta con la que se le iba a llamar deja
    // de existir. Y el «Siguiente» de `LabHabitosComparaciones` se pulsa y el
    // contador se queda en 1/7 —medido—, así que el barrido resolvía siete
    // veces la misma escalera. El número sí es estable.
    await pulsarTextoExacto(page, String(carta));
    await page.waitForTimeout(150);
    await cosechar(page);
    await apuntar();

    // TRES pasadas sobre la tarjeta, recalculando las etiquetas entre una y
    // otra. Hay tarjetas que se destapan por peldaños: en «La escalera del
    // adjetivo» primero hay que acertar la REGLA, y sólo entonces aparecen las
    // opciones del comparativo, y sólo con ésa bien las del superlativo.
    for (let pasada = 0; pasada < 3; pasada += 1) {
      const dentro = await etiquetasPulsables(page, tabs);
      for (const et of dentro) {
        if (NO_PULSAR.test(et) || NAVEGACION.test(et) || REPRODUCTOR.test(et)) continue;
        await pulsarEtiqueta(page, et);
        await page.waitForTimeout(45);
        await cosechar(page);
        await page.waitForTimeout(20);
        await apuntar();
      }
    }
  }
}

/**
 * Pica la escena 3D en una rejilla.
 *
 * Doce de estos laboratorios son three.js y ahí lo que hace avanzar la misión
 * —y por tanto lo que destapa la frase siguiente— no es un botón del DOM sino
 * un objeto de la escena: la tienda, la esquina, la parada del camión. Eso no
 * se puede pulsar por `el.click()`; hay que picar con el ratón donde está
 * pintado y dejar que el raycaster decida qué tocó. Una rejilla de 5×4 sobre el
 * lienzo basta: los objetos de estas escenas son grandes.
 */
async function picarEscena(page: Page, apuntar: () => Promise<void>): Promise<void> {
  const cajas = await page.evaluate(() =>
    Array.from(document.querySelectorAll("canvas"))
      .map((c) => c.getBoundingClientRect())
      .filter((r) => r.width > 200 && r.height > 200)
      .map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height }))
  );
  for (const c of cajas.slice(0, 1)) {
    for (let fy = 1; fy <= 4; fy += 1) {
      for (let fx = 1; fx <= 5; fx += 1) {
        await page.mouse.click(c.x + (c.w * fx) / 6, c.y + (c.h * fy) / 5);
        await page.waitForTimeout(40);
        await cosechar(page);
        await page.waitForTimeout(20);
        await apuntar();
      }
    }
  }
}

/* ── Un laboratorio ──────────────────────────────────────────────────────── */

/**
 * Coloca fichas en sus huecos a base de probar.
 *
 * Varios laboratorios esconden sus frases detrás de un arrastre: hasta que las
 * dos zonas de la escena no están llenas no aparece la oración —ni su botón de
 * «Escuchar»—. El barrido sólo pulsa botones, y las zonas son `div`, así que se
 * quedaba fuera. Pero estos labs aceptan además tocar-y-tocar: se selecciona la
 * ficha y se toca el hueco. Eso sí se puede pulsar.
 *
 * Como el hueco rechaza la ficha que no le toca, se prueban todas: son pocas, y
 * el propio lab dice cuándo acertó (`data-done`).
 */
async function colocarFichas(page: Page, apuntar: () => Promise<void>): Promise<void> {
  // Sólo huecos que NO son botones: los botones ya los pulsa el barrido a
  // ciegas, y colarlos aquí hace que cada intento cambie de escena.
  const ZONAS = '[class*="zona"],[class*="hueco"],[class*="ranura"],[class*="slot"],[data-done]';
  const libres = async () =>
    page.evaluate(
      (sel) =>
        Array.from(document.querySelectorAll(sel)).filter((e) => {
          const r = e.getBoundingClientRect();
          return e.tagName !== "BUTTON" && r.width > 8 && r.height > 8 && e.getAttribute("data-done") !== "true";
        }).length,
      ZONAS
    );
  const puestas = async () => page.evaluate(() => document.querySelectorAll('[data-done="true"]').length);

  // Botones que el propio lab marca como «todavía sin hacer»: las pastillas de
  // escena. El barrido a ciegas las pulsa todas y siempre acaba en la misma,
  // así que sin esto sólo se resolvía una escena de cinco.
  const saltar = async (n: number) =>
    page.evaluate((i) => {
      // `:not([data-on="true"])`: la pastilla de la escena en la que ya estamos
      // sigue marcada como pendiente, y pulsarla no lleva a ninguna parte.
      const ps = Array.from(document.querySelectorAll('button[data-done="false"]:not([data-on="true"])'));
      const b = ps[i % Math.max(1, ps.length)];
      if (!b || !ps.length) return false;
      (b as HTMLElement).click();
      return true;
    }, n);

  let escena = 0;
  for (let pase = 0; pase < 14; pase += 1) {
    if (TRAZA) console.log(`        colocar pase ${pase}: ${await libres()} huecos libres, escena ${escena}`);
    if (!(await libres())) {
      // Nada que colocar aquí: a ver si hay otra escena sin terminar.
      if (escena > 8 || !(await saltar(escena))) return;
      escena += 1;
      await page.waitForTimeout(400);
      if (!(await libres())) continue;
    }
    const zonas = await libres();
    if (!zonas) return;
    const antes = await puestas();
    // Con qué botonera se empieza: lo que salga nuevo al llenar el hueco es la
    // pregunta que el hueco destapa, y es ahí donde está la frase que hablar.
    const botonesAntes = new Set(await etiquetasPulsables(page, []));
    let acerto = false;
    for (let z = 0; z < Math.min(zonas, 8) && !acerto; z += 1) {
      const fichas = await page.evaluate(
        () => Array.from(document.querySelectorAll('[draggable="true"]')).filter((e) => e.getBoundingClientRect().width > 4).length
      );
      if (!fichas) return;
      for (let f = 0; f < Math.min(fichas, 12); f += 1) {
        // Los dos clics van en llamadas separadas a propósito: React no
        // vuelve a pintar entre dos `click()` de un mismo `evaluate`, así que
        // el hueco leía todavía «no hay ficha elegida» y no pasaba nada.
        const hayChip = await page.evaluate((f) => {
          const chips = Array.from(document.querySelectorAll('[draggable="true"]')).filter((e) => e.getBoundingClientRect().width > 4);
          const chip = chips[f];
          if (!chip) return false;
          (chip as HTMLElement).click();
          return true;
        }, f);
        if (!hayChip) break;
        await page.waitForTimeout(90);
        const ok = await page.evaluate(
          ({ sel, z }) => {
            const zonas = Array.from(document.querySelectorAll(sel)).filter((e) => {
              const r = e.getBoundingClientRect();
              return e.tagName !== "BUTTON" && r.width > 8 && r.height > 8 && e.getAttribute("data-done") !== "true";
            });
            const zona = zonas[z];
            if (!zona) return false;
            (zona as HTMLElement).click();
            return true;
          },
          { sel: ZONAS, z }
        );
        if (!ok) break;
        await page.waitForTimeout(140);
        if ((await puestas()) > antes) {
          acerto = true;
          break;
        }
      }
    }
    await apuntar();
    if (acerto) {
      // Dos pasadas: la primera elige entre las oraciones que acaban de
      // aparecer, la segunda recoge lo que esa elección destapa.
      for (let vuelta = 0; vuelta < 2; vuelta += 1) {
        const ahora = await etiquetasPulsables(page, []);
        const nuevas = ahora.filter((e) => !botonesAntes.has(e) && !NO_PULSAR.test(e));
        if (!nuevas.length) break;
        for (const et of nuevas.slice(0, 6)) {
          botonesAntes.add(et);
          await pulsarEtiqueta(page, et);
          await page.waitForTimeout(90);
          await cosechar(page);
          await apuntar();
        }
      }
    }
    if (!acerto) {
      // Este hueco no admite ninguna ficha visible: se prueba otra escena.
      if (escena > 8 || !(await saltar(escena))) return;
      escena += 1;
      await page.waitForTimeout(400);
    }
  }
}

/**
 * Guion para `relato-secuencia-ingles-3d`, modo «Put the story in order».
 *
 * Este laboratorio no dice nada al pulsarlo: su narración va por
 * temporizadores detrás del interruptor «Narración en voz alta», y sólo
 * pronuncia las viñetas que están en un orden COHERENTE — al llegar a la
 * primera que rompe la secuencia se calla y se detiene. Con las viñetas
 * barajadas de fábrica, el barrido a ciegas se quedaba en cero frases.
 *
 * Así que aquí el barrido juega, y juega con lo que el propio lab le enseña:
 * al romperse la coherencia, la nota dice «X» no puede ir ahí: todavía no
 * pasa «Y». Eso es una dependencia. Se busca X e Y entre las viñetas (su
 * `aria-label` lleva el texto entero) y se baja X hasta dejarla detrás de Y.
 * Cada arreglo satisface una dependencia sin romper las ya cumplidas —las
 * viñetas de en medio suben juntas y conservan su orden—, así que en pocas
 * reproducciones la historia queda coherente y se cuenta entera, con epílogo.
 *
 * Bajar la viñeta de uno en uno NO servía: sin saber dónde está Y se puede
 * cambiar por una que también tenía que ir después, y el barrido se quedaba
 * dando vueltas sobre la primera frase (medido: 2 frases en veinte minutos).
 */
async function jugarRelato(page: Page, apuntar: () => Promise<void>): Promise<void> {
  const vinetas = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll("button.rs-card-txt")).map((b) =>
        (b.getAttribute("aria-label") ?? "").replace(/^Viñeta \d+:\s*/, "").replace(/\s+/g, " ").trim()
      )
    );
  const bajar = async (slot: number) => {
    const ok = await page.evaluate((n) => {
      const b = Array.from(document.querySelectorAll("button.rs-mini")).find(
        (x) => (x.getAttribute("aria-label") ?? "") === `Bajar viñeta ${n}`
      ) as HTMLButtonElement | undefined;
      if (!b || b.disabled) return false;
      b.click();
      return true;
    }, slot + 1);
    await page.waitForTimeout(140);
    return ok;
  };

  const historias = await page.evaluate(() => document.querySelectorAll("button.rs-hist").length);
  for (let h = 0; h < Math.max(1, historias); h += 1) {
    if (historias > 1) {
      await page.evaluate((i) => {
        const b = document.querySelectorAll("button.rs-hist")[i];
        if (b) (b as HTMLElement).click();
      }, h);
      await page.waitForTimeout(600);
    }
    for (let intento = 0; intento < 24; intento += 1) {
      await encenderVoz(page);
      const arranco = await page.evaluate(() => {
        const b = document.querySelector("button.rs-play") as HTMLButtonElement | null;
        if (!b || b.disabled) return false;
        b.click();
        return true;
      });
      if (!arranco) return;
      // La reproducción termina cuando el botón vuelve a habilitarse.
      for (let t = 0; t < 90; t += 1) {
        await page.waitForTimeout(500);
        await apuntar();
        const libre = await page.evaluate(() => {
          const b = document.querySelector("button.rs-play") as HTMLButtonElement | null;
          return !b || !b.disabled;
        });
        if (libre) break;
      }
      await page.waitForTimeout(500);
      await apuntar();
      const aviso = await page.evaluate(() => {
        const t = (document.body.textContent ?? "").replace(/\s+/g, " ");
        const m = /«([^»]+)» no puede ir ahí: todavía no pasa «([^»]+)»/.exec(t);
        return m ? { x: m[1] ?? "", y: m[2] ?? "" } : null;
      });
      if (!aviso) break; // historia coherente (o sin aviso que leer)
      const lista = await vinetas();
      const ix = lista.findIndex((t) => t === aviso.x);
      const iy = lista.findIndex((t) => t === aviso.y);
      if (ix < 0 || iy < 0 || iy <= ix) break;
      for (let k = ix; k < iy; k += 1) {
        if (!(await bajar(k))) break;
      }
    }
  }
}

async function barrerLab(
  browser: Browser,
  slug: string,
  recoger: (texto: string, lang: string, slug: string) => boolean,
  apuntarClip: (clave: string, slug: string) => void
): Promise<ResultadoBarrido> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(ESPIA);
  const page = await ctx.newPage();
  page.on("dialog", (d) => void d.dismiss().catch(() => {}));

  let frases = 0;
  let nuevas = 0;
  /**
   * Frases distintas OÍDAS EN ESTE BARRIDO, ya estuvieran en el volcado o no.
   * La saturación se mide con esto y no con las frases nuevas: al repasar un
   * laboratorio ya volcado, «nuevas» es cero desde la primera ronda y el
   * barrido se rendía en cuatro rondas sin haber llegado a la segunda escena.
   */
  const vistas = new Set<string>();
  const apuntar = async () => {
    const cosecha = await drenar(page);
    for (const d of cosecha.dichas) {
      const t = normalizarTextoVoz(d.texto);
      if (!t) continue;
      if (recoger(t, d.lang, slug)) nuevas += 1;
      vistas.add(claveDeVozLab(t, d.lang));
      frases += 1;
    }
    for (const src of cosecha.clips) {
      // `/media/voz-labs/en/1a2b3c-21.mp3` -> `en/1a2b3c-21`
      const m = /voz-labs\/((?:en|es)\/[^/]+)\.mp3/.exec(src);
      if (!m || !m[1]) continue;
      apuntarClip(m[1], slug);
      vistas.add(m[1]);
      frases += 1;
    }
  };

  const url = `${BASE}/zz-prueba-lab?slug=${encodeURIComponent(slug)}`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    // El lab entra por `dynamic(..., { ssr: false })`; hay que dejarlo montar
    // (y a las escenas three.js, compilar sus shaders).
    await page.waitForSelector("button", { timeout: 60_000 });
    await page.waitForTimeout(2500);

    const tabs = await pestanas(page);
    const modos = tabs.length ? tabs : [""];

    for (const tab of modos) {
      if (tab) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForSelector("button", { timeout: 60_000 });
        await page.waitForTimeout(2000);
        const ok = await page.evaluate((t) => {
          const b = Array.from(document.querySelectorAll("button")).find(
            (x) => (x.textContent ?? "").replace(/\s+/g, " ").trim() === t
          );
          if (!b) return false;
          (b as HTMLElement).click();
          return true;
        }, tab);
        if (!ok) continue;
        await page.waitForTimeout(900);
      }
      await apuntar();

      // Se barre hasta que deje de salir nada nuevo, no un número fijo de
      // veces. Estos laboratorios enseñan UNA tarjeta a la vez y sólo avanzan
      // cuando se acierta: una ronda que pulsa todo acierta de paso y destapa
      // la siguiente, con sus propias frases. Dos rondas seguidas sin novedad
      // significan que ya se vio el mazo entero.
      let secas = 0;
      for (let ronda = 0; ronda < RONDAS_MAX && secas < SECAS_MAX; ronda += 1) {
        const antes = vistas.size;
        await encenderVoz(page);
        await cosechar(page);
        await page.waitForTimeout(40);
        await apuntar();

        // El mazo se juega UNA VEZ, en la primera ronda, y ANTES del barrido a
        // ciegas.
        //
        // Antes, porque el barrido pulsa todo y deja el modo en cualquier
        // estado: medido, para cuando le tocaba el turno al mazo, la botonera
        // de siete tarjetas de `LabHabitosComparaciones` ya no estaba en
        // pantalla y sólo quedaban «Anterior» y «Siguiente».
        //
        // Una sola vez, porque jugar el mazo es determinista y caro —siete
        // tarjetas por tres pasadas por cuarenta botones— y repetirlo en cada
        // ronda no descubría nada nuevo: se comía el tope de ocho minutos y el
        // laboratorio se quedaba sin barrer.
        if (ronda === 0) await jugarMazo(page, tabs, apuntar);
        // Cada ronda, no sólo la primera: el barrido a ciegas cambia de
        // escena al pulsar, y la escena nueva vuelve a traer sus huecos vacíos.
        await colocarFichas(page, apuntar);
        if (ronda === 0 && slug === "relato-secuencia-ingles-3d" && /put the story in order/i.test(tab)) {
          await jugarRelato(page, apuntar);
        }

        const botones = await etiquetasPulsables(page, tabs);
        for (let i = 0; i < botones.length; i += 1) {
          if (NO_PULSAR.test(botones[i]!)) continue;
          await pulsar(page, i, tabs);
          await page.waitForTimeout(45);
          await encenderVoz(page);
          if (REPRODUCTOR.test(botones[i]!)) {
            // Una secuencia acaba de arrancar: callarse y dejarla contar.
            await dejarHablar(page, apuntar, () => vistas.size);
          } else {
            await cosechar(page);
            await page.waitForTimeout(25);
          }
          await apuntar();
          if (!page.url().startsWith(url)) {
            await page.goBack().catch(() => {});
            await page.waitForTimeout(500);
          }
        }
        await picarEscena(page, apuntar);
        secas = vistas.size > antes ? 0 : secas + 1;
        if (TRAZA) console.log(`      [${slug}] ${tab.slice(0, 22)} ronda ${ronda}: ${antes} -> ${vistas.size} vistas, secas=${secas}`);
      }
    }
    await apuntar();
    await ctx.close();
    return { frases, nuevas, modos: modos.length };
  } catch (e) {
    await ctx.close().catch(() => {});
    return { frases, nuevas, modos: 0, error: String(e).slice(0, 160) };
  }
}

/* ── Principal ───────────────────────────────────────────────────────────── */

/** Lo que ya hay en el volcado, para acumular encima. */
function volcadoPrevio(): Map<string, FilaVozLab> {
  const m = new Map<string, FilaVozLab>();
  if (!existsSync(DESTINO) || LIMPIO) return m;
  const viejo: FilaVozLab[] = JSON.parse(readFileSync(DESTINO, "utf8"));
  for (const v of viejo) m.set(v.clave, v);
  return m;
}

function guardar(porClave: Map<string, FilaVozLab>): void {
  const filas = [...porClave.values()].sort((a, b) =>
    a.idioma === b.idioma ? a.texto.localeCompare(b.texto) : a.idioma.localeCompare(b.idioma)
  );
  mkdirSync(dirname(DESTINO), { recursive: true });
  writeFileSync(DESTINO, JSON.stringify(filas, null, 2) + "\n", "utf8");
}

async function main() {
  const labs = SOLO.length ? LABS_CON_VOZ.filter((l) => SOLO.includes(l.slug)) : LABS_CON_VOZ;
  if (!labs.length) throw new Error(`Ningún lab con slug "${SOLO.join(", ")}"`);

  const r = await fetch(BASE, { method: "HEAD" }).catch(() => null);
  if (!r) throw new Error(`El servidor de desarrollo no responde en ${BASE}. No lo arranco yo.`);

  // El volcado ACUMULA y se ESCRIBE DESPUÉS DE CADA LABORATORIO.
  //
  // Guardar sólo al final costaba caro: una escena three.js tumbó al navegador
  // a mitad del barrido y se perdió media hora de frases ya medidas. Aquí lo
  // peor que puede pasar es perder el laboratorio en curso.
  const porClave = volcadoPrevio();

  for (const { slug } of labs) {
    const antes = porClave.size;

    // UN NAVEGADOR POR LABORATORIO. Si una escena se lleva por delante el
    // proceso de GPU, se lleva sólo su propio Chromium y el siguiente lab
    // arranca limpio; compartiendo uno, la caída dejaba el barrido colgado sin
    // fin en el primer `evaluate` de después.
    const browser = await chromium.launch({
      headless: !VER,
      args: [
        // GPU de verdad. Doce de estos labs son three.js; con swiftshader la
        // página tarda minutos en pintar y el barrido se queda sin nada que pulsar.
        "--use-gl=angle",
        "--use-angle=d3d11",
        "--enable-gpu",
        "--ignore-gpu-blocklist",
        "--mute-audio",
      ],
    });

    const recoger = (texto: string, lang: string, sl: string): boolean => {
      const idioma = lang.toLowerCase().startsWith("es") ? "es" : "en";
      const clave = claveDeVozLab(texto, idioma);
      const fila = porClave.get(clave);
      if (fila) {
        if (!fila.labs.includes(sl)) fila.labs.push(sl);
        return false;
      }
      porClave.set(clave, { idioma, clave, texto, labs: [sl] });
      return true;
    };

    const apuntarClip = (clave: string, sl: string): void => {
      const fila = porClave.get(clave);
      if (fila && !fila.labs.includes(sl)) fila.labs.push(sl);
    };

    // Y un tope de tiempo por laboratorio: ninguno tarda tanto sanamente, y sin
    // el tope un barrido atascado se come la tarde entera. El reloj se limpia
    // al ganar el barrido, o el proceso se quedaría vivo hasta que venciera.
    let reloj: NodeJS.Timeout | undefined;
    const res = await Promise.race([
      barrerLab(browser, slug, recoger, apuntarClip),
      new Promise<ResultadoBarrido>((ok) => {
        reloj = setTimeout(() => ok({ frases: 0, nuevas: 0, modos: 0, error: "tope de tiempo" }), TOPE_ESPECIAL_MS[slug] ?? TOPE_POR_LAB_MS);
      }),
    ]);
    if (reloj) clearTimeout(reloj);
    await browser.close().catch(() => {});

    guardar(porClave);
    const nota = res.error ? `  ⚠ ${res.error}` : "";
    console.log(
      `  ${slug.padEnd(38)} ${String(res.frases).padStart(5)} pulsaciones · ` +
        `${String(porClave.size - antes).padStart(4)} frases nuevas · ${res.modos} modos${nota}`
    );
  }

  const filas = [...porClave.values()];
  const en = filas.filter((f) => f.idioma === "en").length;
  const es = filas.filter((f) => f.idioma === "es").length;
  const chars = filas.reduce((a, f) => a + f.texto.length, 0);
  console.log(
    `
${filas.length} frases distintas (${en} en inglés, ${es} en español), ` +
      `${chars.toLocaleString("es-MX")} caracteres → ${DESTINO}`
  );
  console.log(`sha1 del volcado: ${createHash("sha1").update(JSON.stringify(filas)).digest("hex").slice(0, 12)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
