/**
 * Simulador «La radio escolar» (licencias-software). Módulo de datos y reglas
 * PURO (sin React). Todo es ficticio: la radio «Voz del Valle», sus montos y las
 * multas son valores de SIMULACIÓN, no precios ni sanciones reales.
 *
 * Las reglas salen de la lectura verbatim de CD-I·P02:
 *  · privativo: código secreto, no se modifica ni se redistribuye sin permiso;
 *  · libre: se usa, estudia, modifica y redistribuye (también se puede vender);
 *  · Creative Commons: BY (crédito), SA (compartir igual), NC (no comercial),
 *    ND (sin obras derivadas).
 */
import type { TipoLic } from "./licencias-software-data";

export const PRESUPUESTO = 4000;

export type NecesidadId = "sistema" | "oficina" | "imagen";

export interface OpcionSoft {
  id: string;
  nombre: string;
  tipo: TipoLic;
  /** Costo de licencia para las 5 computadoras (simulación). */
  costo: number;
}

export interface Necesidad {
  id: NecesidadId;
  titulo: string;
  icono: string;
  opciones: OpcionSoft[];
}

export const NECESIDADES: Necesidad[] = [
  {
    id: "sistema",
    titulo: "Sistema operativo de las 5 computadoras",
    icono: "fa-desktop",
    opciones: [
      { id: "windows", nombre: "Windows", tipo: "privativo", costo: 1800 },
      { id: "linux", nombre: "GNU/Linux", tipo: "libre", costo: 0 },
    ],
  },
  {
    id: "oficina",
    titulo: "Programa para guiones y hojas de cálculo",
    icono: "fa-file-lines",
    opciones: [
      { id: "office", nombre: "Microsoft Office", tipo: "privativo", costo: 2400 },
      { id: "libreoffice", nombre: "LibreOffice", tipo: "libre", costo: 0 },
    ],
  },
  {
    id: "imagen",
    titulo: "Editor para la imagen de la radio",
    icono: "fa-image",
    opciones: [
      { id: "photoshop", nombre: "Adobe Photoshop", tipo: "privativo", costo: 3100 },
      { id: "lienzo", nombre: "Lienzo (editor libre ficticio)", tipo: "libre", costo: 0 },
    ],
  },
];

export const todasOpciones = (): OpcionSoft[] => NECESIDADES.flatMap((n) => n.opciones);

export const gastoDe = (elegidas: Partial<Record<NecesidadId, string>>): number =>
  todasOpciones()
    .filter((o) => Object.values(elegidas).includes(o.id))
    .reduce((s, o) => s + o.costo, 0);

export type AccionSoft = "modificar" | "compartir" | "vender";

export const ACCIONES_SOFT: { id: AccionSoft; etiqueta: string; icono: string }[] = [
  { id: "modificar", etiqueta: "Modificar su código", icono: "fa-code" },
  { id: "compartir", etiqueta: "Copiar y compartir", icono: "fa-share-nodes" },
  { id: "vender", etiqueta: "Vender copias", icono: "fa-store" },
];

export interface Veredicto {
  permitido: boolean;
  titulo: string;
  porque: string;
  multa: number;
}

const MULTA_SOFT: Record<AccionSoft, number> = { modificar: 1500, compartir: 800, vender: 2500 };

export function veredictoSoft(tipo: TipoLic, accion: AccionSoft): Veredicto {
  if (tipo === "privativo") {
    const porque: Record<AccionSoft, string> = {
      modificar: "El código fuente es secreto y la licencia prohíbe cambiarlo: la radio no puede adaptar el programa.",
      compartir: "La licencia es por equipo: copiarlo para otro grupo es redistribuir sin autorización de la empresa.",
      vender: "Solo la empresa dueña puede vender copias. Revender es una infracción grave.",
    };
    return { permitido: false, titulo: "Aviso de infracción", porque: porque[accion], multa: MULTA_SOFT[accion] };
  }
  const porque: Record<AccionSoft, string> = {
    modificar: "Libertad 1 y 3: puedes estudiar el código, adaptarlo y publicar tus mejoras.",
    compartir: "Libertad 2: distribuir copias para ayudar a otras personas está permitido.",
    vender: "Libre no significa gratis: puedes cobrar por copias o soporte, pero debes entregar también el código.",
  };
  return { permitido: true, titulo: "Permitido", porque: porque[accion], multa: 0 };
}

/* ── Cartel con licencia Creative Commons ──────────────────────────────── */
export type CCId = "cc-by" | "cc-by-sa" | "cc-by-nc" | "cc-by-nc-nd";

export interface FotoCartel {
  id: CCId;
  clave: string;
  titulo: string;
  autor: string;
  sigla: string;
}

export const FOTOS_CARTEL: FotoCartel[] = [
  { id: "cc-by", clave: "foto-plaza", titulo: "Plaza al atardecer", autor: "Marisol Quiroz (ficticia)", sigla: "CC BY" },
  { id: "cc-by-sa", clave: "foto-guitarra", titulo: "Guitarra en el escenario", autor: "Tomás Arriaga (ficticio)", sigla: "CC BY-SA" },
  { id: "cc-by-nc", clave: "foto-mural", titulo: "Mural del barrio", autor: "Colectivo Cielo Abierto (ficticio)", sigla: "CC BY-NC" },
  { id: "cc-by-nc-nd", clave: "foto-escenario", titulo: "Escenario vacío", autor: "Renata Lobo (ficticia)", sigla: "CC BY-NC-ND" },
];

export interface UsoCartel {
  credito: boolean;
  modifica: boolean;
  comercial: boolean;
}

export interface ResultadoCartel {
  infracciones: string[];
  condiciones: string[];
  ok: boolean;
}

export function evaluaCartel(lic: CCId, uso: UsoCartel): ResultadoCartel {
  const infracciones: string[] = [];
  const condiciones: string[] = [];
  if (!uso.credito) infracciones.push("Falta el crédito: toda licencia CC BY exige nombrar a la autora o al autor.");
  if (uso.modifica && lic === "cc-by-nc-nd")
    infracciones.push("ND prohíbe obras derivadas: recortar el cartel o ponerle texto ya es modificar la foto.");
  if (uso.comercial && (lic === "cc-by-nc" || lic === "cc-by-nc-nd"))
    infracciones.push("NC prohíbe el uso comercial: cobrar entradas con el cartel es un uso comercial.");
  if (uso.modifica && lic === "cc-by-sa")
    condiciones.push("SA: tu cartel modificado debe compartirse con la misma licencia CC BY-SA.");
  return { infracciones, condiciones, ok: infracciones.length === 0 };
}

export const MULTA_CARTEL = 600;
