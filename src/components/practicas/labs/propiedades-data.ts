/**
 * Datos para el laboratorio de Propiedades y cambios de la materia (CNEYT-I-P02).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabPropiedadesMateria.tsx) y la escena 3D (PropiedadesMateriaScene.tsx) sin
 * arrastrar three.js al bundle del shell.
 *
 * Idea pedagógica: distinguir un CAMBIO FÍSICO (la sustancia sigue siendo la
 * misma: solo cambia su forma, tamaño o estado; suele ser reversible) de un
 * CAMBIO QUÍMICO (se forman SUSTANCIAS NUEVAS: hay evidencia como gas, cambio de
 * color, calor o ceniza, y no se revierte). El estudiante aplica la
 * transformación, observa la evidencia y la clasifica.
 */

export type TipoCambio = "fisico" | "quimico";

/** Cómo se comporta visualmente la muestra al transformarse. */
export type Modo = "estado" | "fragmenta" | "gas" | "reaccion";

/** Qué emite la muestra durante la transformación. */
export type Emision = "ninguno" | "humo" | "burbujas";

export interface Transformacion {
  key: string;
  nombre: string;
  icono: string; // Font Awesome 6
  sustancia: string;
  tipo: TipoCambio; // respuesta correcta
  /* — parámetros visuales para la escena 3D — */
  modo: Modo;
  colorInicial: string;
  colorFinal: string;
  emite: Emision;
  flama: boolean; // se aplica calor (mechero encendido)
  /* — pedagogía — */
  reversible: boolean;
  evidencia: string;
  explica: string;
}

export const TRANSFORMACIONES: Transformacion[] = [
  {
    key: "fundir-hielo",
    nombre: "Fundir hielo",
    icono: "fa-icicles",
    sustancia: "Hielo (agua sólida)",
    tipo: "fisico",
    modo: "estado",
    colorInicial: "#CDE7FF",
    colorFinal: "#4FB0E8",
    emite: "ninguno",
    flama: true,
    reversible: true,
    evidencia: "Pasa de sólido a líquido, pero sigue siendo agua.",
    explica:
      "Al fundirse solo cambia de estado: las mismas moléculas de agua se separan un poco. Si vuelves a enfriar, se recongela. Es un cambio físico.",
  },
  {
    key: "romper-vidrio",
    nombre: "Romper un vidrio",
    icono: "fa-hammer",
    sustancia: "Vidrio",
    tipo: "fisico",
    modo: "fragmenta",
    colorInicial: "#BFE3FF",
    colorFinal: "#BFE3FF",
    emite: "ninguno",
    flama: false,
    reversible: false,
    evidencia: "Cambia la forma y el tamaño, no la sustancia.",
    explica:
      "Romper solo cambia la forma: cada trozo sigue siendo vidrio. No aparece una sustancia nueva, así que es un cambio físico (aunque no puedas rearmarlo).",
  },
  {
    key: "evaporar-agua",
    nombre: "Evaporar agua",
    icono: "fa-wind",
    sustancia: "Agua líquida",
    tipo: "fisico",
    modo: "gas",
    colorInicial: "#4FB0E8",
    colorFinal: "#CFE6F5",
    emite: "ninguno",
    flama: true,
    reversible: true,
    evidencia: "El agua se convierte en vapor; al enfriarse vuelve a ser agua.",
    explica:
      "El agua pasa a estado gaseoso. Sigue siendo agua (H₂O); si el vapor se condensa, regresa a líquido. Es un cambio físico.",
  },
  {
    key: "quemar-papel",
    nombre: "Quemar papel",
    icono: "fa-fire",
    sustancia: "Papel",
    tipo: "quimico",
    modo: "reaccion",
    colorInicial: "#EFE6D2",
    colorFinal: "#2C2A28",
    emite: "humo",
    flama: true,
    reversible: false,
    evidencia: "Aparecen ceniza, humo y calor; no se revierte.",
    explica:
      "El papel reacciona con el oxígeno y se transforma en ceniza, gases y calor: sustancias nuevas que no puedes volver a convertir en papel. Es un cambio químico.",
  },
  {
    key: "oxidar-hierro",
    nombre: "Oxidar hierro",
    icono: "fa-wrench",
    sustancia: "Clavo de hierro",
    tipo: "quimico",
    modo: "reaccion",
    colorInicial: "#8A929C",
    colorFinal: "#B5612E",
    emite: "ninguno",
    flama: false,
    reversible: false,
    evidencia: "Se forma herrumbre (óxido), una sustancia nueva.",
    explica:
      "El hierro reacciona lentamente con el oxígeno y la humedad y forma óxido de hierro (herrumbre). Es una sustancia distinta: cambio químico.",
  },
  {
    key: "vinagre-bicarbonato",
    nombre: "Vinagre + bicarbonato",
    icono: "fa-flask",
    sustancia: "Vinagre y bicarbonato",
    tipo: "quimico",
    modo: "reaccion",
    colorInicial: "#EDEFF2",
    colorFinal: "#E2EAF1",
    emite: "burbujas",
    flama: false,
    reversible: false,
    evidencia: "Burbujea y libera gas (CO₂).",
    explica:
      "Al mezclarlos reaccionan y producen dióxido de carbono (las burbujas), agua y otra sal. Se formaron sustancias nuevas: cambio químico.",
  },
];

/** ¿El estudiante clasificó correctamente la transformación? */
export const clasificaBien = (t: Transformacion, eleccion: TipoCambio) => t.tipo === eleccion;
