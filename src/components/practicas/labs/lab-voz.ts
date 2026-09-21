"use client";

/**
 * LA VOZ DE LOS LABORATORIOS. Un solo reproductor para los 18 laboratorios que
 * tienen botón «Escuchar».
 *
 * POR QUÉ NO `speechSynthesis`. Es la misma razón que ya está escrita en la
 * cabecera de `scripts/narrar-actividades.py` para el español, y que estos
 * laboratorios se habían saltado: el sintetizador del navegador suena con la
 * voz que esa máquina tenga instalada. En la laptop de una escuela pública eso
 * es la SAPI vieja de Windows —David o Zira—, que pronuncia el inglés como un
 * robot y arrastra las vocales; en un Chromebook puede no haber ninguna voz en
 * inglés y el botón no hace nada. Un alumno de 15 años que está APRENDIENDO a
 * pronunciar no puede tomar eso como modelo.
 *
 * Aquí el audio viene grabado con `en-US-AvaNeural` —una sola locutora para
 * todo el inglés de la plataforma, igual que `es-MX-DaliaNeural` es la única en
 * español—, así que el alumno oye siempre a la misma persona, suene donde
 * suene, y sólo hace falta bajar un MP3 de unos pocos kilobytes.
 *
 * LA SÍNTESIS DEL NAVEGADOR NO SE QUITA, SE DEGRADA. Si una frase no tiene
 * clip —porque es nueva, o porque el barrido no llegó a ella— el botón sigue
 * hablando con la voz del sistema, exactamente como hoy. Lo que NO puede pasar
 * es que un botón se quede mudo.
 *
 * SABER SI HAY CLIP SIN PEDIRLO. La respuesta tiene que estar en el mismo tic
 * en que se pulsa el botón: si hubiera que preguntarle al servidor, cada frase
 * sin grabar costaría un 404 y una espera antes de caer a la síntesis. Por eso
 * `voz-labs.generated.ts` lleva el conjunto de claves grabadas, igual que
 * `src/lib/voz/voz-hecha.ts` lo lleva para las actividades.
 *
 * DÓNDE VIVEN LOS CLIPS. En `public/media/voz-labs/`, servidos como estático.
 * Son frases sueltas de un par de segundos: el total cabe de sobra donde ya
 * viven las imágenes de los laboratorios. (Los ~170 MB de la narración de las
 * lecturas sí van a R2; eso es otro orden de magnitud y por eso está en
 * `src/lib/voz/ruta-voz.ts`.)
 */

import { claveDeVozLab, normalizarTextoVoz, type IdiomaVozLab } from "./lab-voz-clave";
import { VOZ_LABS_GRABADA } from "./voz-labs.generated";

/** Base pública de los clips. Movible con NEXT_PUBLIC_VOZ_LABS_BASE. */
const BASE = process.env.NEXT_PUBLIC_VOZ_LABS_BASE ?? "/media/voz-labs";

/**
 * El ritmo al que se grabó: -10%, el mismo de la narración en español. Un
 * laboratorio que pide `rate: 1.3` quiere «un 44 % más rápido que la lectura
 * normal», no «1.3 en la escala de la Web Speech API», así que el clip se
 * acelera relativo a ESTE número y no al 1.0 del navegador.
 */
const RITMO_GRABADO = 0.9;

export interface OpcionesVozLab {
  /** `en` por omisión: 17 de los 18 laboratorios son de inglés. */
  idioma?: IdiomaVozLab;
  /**
   * Velocidad en la escala de `SpeechSynthesisUtterance.rate`, para que los
   * laboratorios no tengan que cambiar sus números al pasar al clip grabado.
   */
  rate?: number;
}

/** El clip que se está oyendo. Uno solo en toda la página, a propósito. */
let sonando: HTMLAudioElement | null = null;

/** ¿Hay sintetizador del navegador? */
function haySintesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * ¿Existe el clip grabado de esta frase? Síncrono y sin red: mira el índice
 * generado. Los laboratorios lo usan para no ofrecer nada que no puedan
 * cumplir, pero NO hace falta llamarlo antes de `hablarLab`.
 */
export function hayVozLab(texto: string, idioma: IdiomaVozLab = "en"): boolean {
  if (!texto) return false;
  return VOZ_LABS_GRABADA.has(claveDeVozLab(texto, idioma));
}

/**
 * ¿Este botón «Escuchar» puede cumplir? Hay clip grabado, o al menos hay
 * sintetizador al que caer.
 *
 * Varios laboratorios escondían el botón cuando el navegador no traía
 * `speechSynthesis`. Esa regla se quedó corta en cuanto hay clips: una máquina
 * sin voces instaladas ahora SÍ puede reproducir la grabación, y esconder el
 * botón le quitaría al alumno justo lo que vino a arreglarse.
 */
export function puedeHablarLab(texto: string, idioma: IdiomaVozLab = "en"): boolean {
  return hayVozLab(texto, idioma) || haySintesis();
}

/**
 * Corta lo que esté sonando: el clip y la síntesis del navegador.
 *
 * Se llama sola al pedir una frase nueva y hay que llamarla al desmontar el
 * laboratorio. Sin esto, salir de la práctica deja una voz hablando encima de
 * la siguiente pantalla.
 */
export function callarLab(): void {
  const previo = sonando;
  // Se suelta ANTES de tocarlo: lo que viene abajo dispara sus manejadores, y
  // tienen que verse ya como el clip viejo.
  sonando = null;
  if (previo) {
    try {
      // PRIMERO se le quitan los manejadores. Cancelar un `<audio>` dispara su
      // evento `error` (y hace que su `play()` rechace con AbortError), y con
      // los manejadores puestos eso se leía como «el MP3 no se pudo bajar» y
      // caía a la voz del sistema: al pulsar cinco frases seguidas, las cuatro
      // primeras se oían con la SAPI de Windows. Medido en el navegador.
      previo.onerror = null;
      previo.onended = null;
      previo.pause();
      previo.currentTime = 0;
      // Quitar el `src` corta la descarga a medias; sin esto el clip abortado
      // sigue ocupando una conexión en un salón con treinta tabletas a la vez.
      previo.removeAttribute("src");
      previo.load();
    } catch {
      /* el elemento ya no sirve: se suelta y ya */
    }
  }
  if (haySintesis()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* nada que cancelar */
    }
  }
}

/**
 * La síntesis del navegador, que es a lo que se cae cuando no hay clip.
 * Devuelve si de veras va a sonar algo.
 */
function sintetizar(texto: string, idioma: IdiomaVozLab, rate: number): boolean {
  if (!haySintesis() || typeof SpeechSynthesisUtterance === "undefined") return false;
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = idioma === "es" ? "es-MX" : "en-US";
    u.rate = Math.min(2, Math.max(0.5, rate));
    const voces = s.getVoices();
    const preferida = idioma === "es" ? "es-MX" : "en-US";
    const voz =
      voces.find((v) => v.lang.replace("_", "-") === preferida) ??
      voces.find((v) => v.lang.replace("_", "-").startsWith(idioma));
    if (voz) u.voice = voz;
    s.speak(u);
    return true;
  } catch {
    /* sin voz de sistema: el laboratorio sigue funcionando sin audio */
    return false;
  }
}

/**
 * Di esta frase en voz alta. Lo que los laboratorios llaman en vez de armarse
 * su propio `speechSynthesis`.
 *
 * Reproduce el clip grabado si existe y, si no, cae a la síntesis del
 * navegador. Corta siempre lo anterior. NUNCA lanza: si no hay ni clip ni
 * sintetizador, no hace nada y el resto del laboratorio sigue igual.
 *
 * DEVUELVE SI VA A SONAR ALGO. Varios laboratorios enseñan un aviso de «esta
 * máquina no tiene voz» cuando el botón no puede cumplir; sin este booleano ese
 * aviso se perdería, y un botón que no hace nada y no lo dice es peor que uno
 * que suena feo.
 */
export function hablarLab(texto: string, opciones: OpcionesVozLab = {}): boolean {
  if (typeof window === "undefined") return false;
  const limpio = normalizarTextoVoz(texto);
  if (!limpio) return false;

  const idioma = opciones.idioma ?? "en";
  const rate = opciones.rate ?? RITMO_GRABADO;

  callarLab();

  const clave = claveDeVozLab(limpio, idioma);
  if (!VOZ_LABS_GRABADA.has(clave)) return sintetizar(limpio, idioma, rate);

  try {
    const audio = new Audio();
    // ¿Sabe este entorno tocar un MP3? Es la pregunta correcta antes de pedir
    // uno, y de paso mantiene callado al banco de humo: en jsdom
    // `HTMLMediaElement.play()` no está implementado y cada pulsación de cada
    // botón de los 66 laboratorios DOM llenaría la salida de la prueba.
    if (typeof audio.canPlayType !== "function" || !audio.canPlayType("audio/mpeg")) {
      return sintetizar(limpio, idioma, rate);
    }
    audio.src = `${BASE}/${clave}.mp3`;
    audio.preload = "auto";
    // El clip ya está a -10%; `rate` viene en la escala del navegador.
    audio.playbackRate = Math.min(2.5, Math.max(0.5, rate / RITMO_GRABADO));
    // Si el MP3 no llega —red caída, archivo borrado en un despliegue a
    // medias— el alumno no se queda mirando un botón mudo: habla el navegador.
    // Pero SÓLO si este clip sigue siendo el vigente: si ya lo relevó otro, el
    // fallo es el de su propia cancelación y hablar aquí sería decir en voz
    // alta la frase que el alumno acaba de descartar.
    audio.onerror = () => {
      if (sonando !== audio) return;
      sonando = null;
      sintetizar(limpio, idioma, rate);
    };
    audio.onended = () => {
      if (sonando === audio) sonando = null;
    };
    sonando = audio;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Reproducción bloqueada (autoplay) o clip ilegible. Igual que arriba,
        // y con el mismo cuidado: un `play()` rechazado por haberlo cancelado
        // no es un fallo que haya que suplir con la voz del sistema.
        if (sonando !== audio) return;
        sonando = null;
        sintetizar(limpio, idioma, rate);
      });
    }
    return true;
  } catch {
    return sintetizar(limpio, idioma, rate);
  }
}
