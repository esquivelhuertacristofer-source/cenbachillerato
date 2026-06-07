/**
 * Datos para el laboratorio de Energía, partículas y electricidad (CNEYT-I-P11).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEnergiaElectricidad.tsx) y la escena 3D (EnergiaElectricidadScene.tsx)
 * sin arrastrar three.js al bundle del shell.
 *
 * Idea pedagógica: la corriente eléctrica es el FLUJO de partículas con carga
 * (electrones). Una fuente de energía (la pila) los empuja por un CONDUCTOR; si
 * en el circuito hay un AISLANTE, los electrones no fluyen y el foco no enciende.
 * Al circular, la energía eléctrica se transforma en luz y calor (potencia).
 */

export interface MaterialElec {
  key: string;
  nombre: string;
  conductor: boolean;
  color: string;
  nota: string;
}

/** Materiales que se pueden insertar en el hueco del circuito. */
export const MATERIALES: MaterialElec[] = [
  { key: "cobre", nombre: "Cobre", conductor: true, color: "#E07B53", nota: "Metal: sus electrones se mueven libremente." },
  { key: "grafito", nombre: "Grafito", conductor: true, color: "#5A5A66", nota: "Forma del carbono que sí conduce la electricidad." },
  { key: "agua-sal", nombre: "Agua con sal", conductor: true, color: "#4FB0E8", nota: "Los iones disueltos transportan la carga." },
  { key: "madera", nombre: "Madera", conductor: false, color: "#A9743B", nota: "Sus electrones están atrapados: no fluyen." },
  { key: "plastico", nombre: "Plástico", conductor: false, color: "#E4C04A", nota: "Aísla: no deja pasar la corriente." },
  { key: "vidrio", nombre: "Vidrio", conductor: false, color: "#9FD8D2", nota: "Aislante: bloquea el flujo de electrones." },
];

/** Voltajes seleccionables (como pilas comunes). */
export const VOLTAJES = [1.5, 3, 4.5, 9];

/** Resistencia fija del foco (simplificada) para aplicar la ley de Ohm. */
export const R_OHM = 3;

/** Corriente (A) por la ley de Ohm: I = V / R. */
export const corriente = (v: number) => v / R_OHM;

/** Potencia (W) disipada en el foco: P = V · I. */
export const potencia = (v: number) => v * corriente(v);

/** Potencia máxima (a 9 V), para normalizar el brillo del foco. */
export const P_MAX = potencia(VOLTAJES[VOLTAJES.length - 1]!);

/** Brillo del foco normalizado (0..1) según la potencia. */
export const brilloDe = (v: number) => potencia(v) / P_MAX;
