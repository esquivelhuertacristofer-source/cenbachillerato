/**
 * Simulador «Tu cuenta en Tareas Exprés» (CD-I-P05). ILUSTRATIVO y FICTICIO:
 * la app, la persona y los datos no existen. Las cifras son una simulación.
 *
 * Cinco datos de tu cuenta tienen un problema distinto. Para cada uno el alumno
 * ejerce una letra de ARCO y el panel cambia: el valor del dato, sus etiquetas
 * y los cuatro medidores. Una letra equivocada también tiene efecto visible
 * (el dato sigue igual, o se rompe algo de la cuenta). Los artículos son los de
 * la LFPDPPP ya citados en `derechos-digitales-data.ts`.
 */

import type { Letra } from "./derechos-digitales-data";

export type Etiqueta = "error" | "uso" | "opaco";

export interface ResultadoLetra {
  valor: string;
  etiquetas: Etiqueta[];
  /** 0 o negativo: cuánto se rompe de la cuenta. */
  cuenta: number;
  nota: string;
  ok: boolean;
}

export interface DatoCuenta {
  id: string;
  titulo: string;
  icono: string;
  /** clave de imagen opcional: /media/labs-sim/derechos-digitales/<clave>.webp */
  foto?: string;
  inicial: { valor: string; etiquetas: Etiqueta[]; problema: string };
  letras: Record<Letra, ResultadoLetra>;
}

export const ETIQUETAS: Record<Etiqueta, { texto: string; color: string; icono: string }> = {
  error: { texto: "Dato con error", color: "#FBBF24", icono: "fa-triangle-exclamation" },
  uso: { texto: "Uso que te perjudica", color: "#FF5E5E", icono: "fa-eye" },
  opaco: { texto: "No sabes qué hay", color: "#A78BFA", icono: "fa-question" },
};

export const APP_NOMBRE = "Tareas Exprés";

export const DATOS_CUENTA: DatoCuenta[] = [
  {
    id: "correo",
    titulo: "Correo de la cuenta",
    icono: "fa-envelope",
    inicial: {
      valor: "lucia.gomez@corrreo.mx",
      etiquetas: ["error"],
      problema: "Tiene una letra de más y nunca te llegan los avisos ni el código para recuperar tu contraseña.",
    },
    letras: {
      A: { valor: "lucia.gomez@corrreo.mx", etiquetas: ["error"], cuenta: 0, ok: false, nota: "Ahora ves el dato tal cual, pero sigue mal escrito. Acceso sirve para conocer, no para cambiar." },
      R: { valor: "lucia.gomez@correo.mx", etiquetas: [], cuenta: 0, ok: true, nota: "Corregido: el dato se queda y cambia su contenido. Ya te llegan los avisos y puedes recuperar tu contraseña." },
      C: { valor: "(borrado)", etiquetas: [], cuenta: -30, ok: false, nota: "Ya no hay error, pero tampoco hay correo: no puedes recuperar tu contraseña. Cancelar saca el dato, no lo arregla." },
      O: { valor: "lucia.gomez@corrreo.mx", etiquetas: ["error"], cuenta: 0, ok: false, nota: "No hay un uso que detener: el problema es que el dato está mal. La oposición no corrige nada." },
    },
  },
  {
    id: "ubicacion",
    titulo: "Ubicación en tiempo real",
    icono: "fa-location-dot",
    foto: "mapa-ubicacion",
    inicial: {
      valor: "Tu posición cada 5 minutos, últimos 90 días",
      etiquetas: ["uso"],
      problema: "La app no necesita saber dónde estás para repartir tareas, y la guarda y la comparte con socios.",
    },
    letras: {
      A: { valor: "Tu posición cada 5 minutos, últimos 90 días", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "Ves el historial de lugares, pero la app sigue recopilándolo. Acceso solo te deja ver." },
      R: { valor: "Tu posición cada 5 minutos, últimos 90 días", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "No hay nada inexacto: la ubicación es correcta. El problema es que la tengan." },
      C: { valor: "(sin ubicación guardada)", etiquetas: [], cuenta: 0, ok: true, nota: "El dato sale de sus archivos (tras el bloqueo previo y su supresión). Ya no te siguen y la app funciona igual." },
      O: { valor: "Guardada, sin usarla para anuncios", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "Frenaste el uso para publicidad, pero siguen guardando tu ubicación. Para que salga de sus archivos pide cancelación." },
    },
  },
  {
    id: "telefono",
    titulo: "Número de teléfono",
    icono: "fa-phone",
    inicial: {
      valor: "55 •••• 1234 · compartido con 12 anunciantes",
      etiquetas: ["uso"],
      problema: "Lo diste para verificar tu cuenta, pero también lo comparten con anunciantes y no aceptaste esa finalidad.",
    },
    letras: {
      A: { valor: "55 •••• 1234 · compartido con 12 anunciantes", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "Ahora ves quién lo recibe, pero sigue compartido. Acceso informa, no detiene el uso." },
      R: { valor: "55 •••• 1234 · compartido con 12 anunciantes", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "El número es correcto: no hay nada que corregir." },
      C: { valor: "(borrado)", etiquetas: [], cuenta: -30, ok: false, nota: "Dejó de compartirse, pero perdiste la verificación en dos pasos: borraste un dato que la app sí necesita." },
      O: { valor: "55 •••• 1234 · solo para verificarte", etiquetas: [], cuenta: 0, ok: true, nota: "Dejó de compartirse con anunciantes y el dato se queda para lo que sí necesitas. Oposición: que cese un uso, conservando el dato." },
    },
  },
  {
    id: "perfil",
    titulo: "Tu perfil de intereses",
    icono: "fa-user-secret",
    inicial: {
      valor: "No puedes ver qué dice tu perfil",
      etiquetas: ["opaco"],
      problema: "La app dice que tiene un perfil tuyo, pero no sabes qué contiene ni para qué lo usa.",
    },
    letras: {
      A: { valor: "Estudiante de bachillerato, vive en Toluca, le interesan videojuegos y útiles escolares", etiquetas: [], cuenta: 0, ok: true, nota: "Ahora sabes qué tienen y para qué. Es el primer paso: ya puedes decidir si pides corregir, cancelar u oponerte." },
      R: { valor: "No puedes ver qué dice tu perfil", etiquetas: ["opaco"], cuenta: 0, ok: false, nota: "No puedes corregir lo que no sabes qué dice. Primero conoce el dato." },
      C: { valor: "(borrado)", etiquetas: ["opaco"], cuenta: 0, ok: false, nota: "Pediste borrar sin conocerlo: no sabrás qué contenía ni con quién se compartió antes." },
      O: { valor: "No puedes ver qué dice tu perfil", etiquetas: ["opaco"], cuenta: 0, ok: false, nota: "Te opones a un uso que todavía no conoces. Antes necesitas saber qué hay." },
    },
  },
  {
    id: "descuento",
    titulo: "Descuento de estudiante",
    icono: "fa-percent",
    foto: "escritorio-laptop",
    inicial: {
      valor: "Descuento: DENEGADO por el sistema, sin revisión de una persona",
      etiquetas: ["uso"],
      problema: "Un algoritmo evaluó tu perfil y te negó el beneficio; nadie lo revisó.",
    },
    letras: {
      A: { valor: "Descuento: DENEGADO por el sistema, sin revisión de una persona", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "Conoces las reglas generales, pero la decisión sigue negada." },
      R: { valor: "Descuento: DENEGADO por el sistema, sin revisión de una persona", etiquetas: ["uso"], cuenta: 0, ok: false, nota: "Tus datos de estudiante son correctos: lo que falla es que los decida una máquina sola." },
      C: { valor: "(cuenta de estudiante borrada)", etiquetas: [], cuenta: -30, ok: false, nota: "Perdiste el beneficio y la cuenta de estudiante completa. Era un uso que había que frenar, no un dato que borrar." },
      O: { valor: "Descuento: en revisión por una persona", etiquetas: [], cuenta: 0, ok: true, nota: "Oposición (art. 26, fr. II): una persona revisa lo que decidió el sistema, y tus datos siguen en tu cuenta." },
    },
  },
];

/** Estado actual de un dato: el resultado de la letra elegida o el inicial. */
export function estadoDato(d: DatoCuenta, letra: Letra | undefined): ResultadoLetra {
  if (!letra) return { valor: d.inicial.valor, etiquetas: d.inicial.etiquetas, cuenta: 0, ok: false, nota: d.inicial.problema };
  return d.letras[letra];
}
