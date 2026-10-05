/**
 * Taller del tema — simulador de temas-ideas-narrativa (LC-II-P05).
 * Material propio e ilustrativo (personajes y pueblo ficticios): un relato de
 * tres escenas cuyo tema el alumno ELIGE y cuya coherencia se mide. Datos puros.
 */

export type TemaTaller = "solidaridad" | "soberbia" | "miedo";

export const TEMAS_TALLER: { id: TemaTaller; corto: string; frase: string; color: string; icono: string }[] = [
  { id: "solidaridad", corto: "solidaridad", frase: "La solidaridad: nadie se salva solo", color: "#34D399", icono: "fa-hands-holding" },
  { id: "soberbia", corto: "soberbia", frase: "La soberbia: creerse a salvo de todo", color: "#FFC75A", icono: "fa-crown" },
  { id: "miedo", corto: "miedo", frase: "El miedo a lo que no se entiende", color: "#A78BFA", icono: "fa-ghost" },
];

export const PANELES_TALLER = [
  { id: 0, etiqueta: "Inicio", icono: "fa-flag" },
  { id: 1, etiqueta: "Nudo", icono: "fa-bolt" },
  { id: 2, etiqueta: "Cierre", icono: "fa-flag-checkered" },
];

export interface EscenaTaller {
  id: string;
  panel: number;
  apoya: TemaTaller;
  /** Objeto o imagen que vuelve: cuando se repite, forma un hilo. */
  motivo: string;
  /** Lo que pasa (asunto), en pocas palabras. */
  hecho: string;
  texto: string;
  /** Clave de la imagen; null = solo ícono. */
  foto: string | null;
  icono: string;
}

export const ESCENAS_TALLER: EscenaTaller[] = [
  { id: "ini-s", panel: 0, apoya: "solidaridad", motivo: "campana", hecho: "la campana llama al pueblo ante la crecida", texto: "La campana del templo llamó a todo el pueblo: el río traía más agua de la cuenta.", foto: "campana-pueblo", icono: "fa-bell" },
  { id: "ini-o", panel: 0, apoya: "soberbia", motivo: "casa de piedra", hecho: "el rico presume que su casa aguanta todo", texto: "El hombre más rico del pueblo se rió de la lluvia: su casa de piedra aguantaba cualquier crecida.", foto: "casa-piedra", icono: "fa-house" },
  { id: "ini-m", panel: 0, apoya: "miedo", motivo: "luces", hecho: "los niños ven luces raras en la orilla", texto: "Los niños vieron luces raras en la orilla y nadie quiso decir qué eran.", foto: "luces-orilla", icono: "fa-lightbulb" },
  { id: "nud-s", panel: 1, apoya: "solidaridad", motivo: "costales", hecho: "los vecinos hacen un muro de costales", texto: "Los vecinos pasaron costales de mano en mano hasta formar un muro, y cada quien llevó pan para todos.", foto: "cadena-costales", icono: "fa-people-line" },
  { id: "nud-o", panel: 1, apoya: "soberbia", motivo: "portón", hecho: "el rico rechaza la ayuda y cierra su portón", texto: "Rechazó toda ayuda y mandó cerrar su portón: «Yo no necesito de nadie».", foto: "porton-cerrado", icono: "fa-door-closed" },
  { id: "nud-m", panel: 1, apoya: "miedo", motivo: "puertas", hecho: "cada familia se encierra a esperar", texto: "Nadie salió de su casa: cada familia atrancó puerta y ventana esperando que todo pasara.", foto: "ventanas-atrancadas", icono: "fa-lock" },
  { id: "cie-s", panel: 2, apoya: "solidaridad", motivo: "campana", hecho: "el pueblo se salva y la campana festeja", texto: "Al amanecer el pueblo seguía en pie, y la campana sonó otra vez, ahora para festejar.", foto: "amanecer-pueblo", icono: "fa-sun" },
  { id: "cie-o", panel: 2, apoya: "soberbia", motivo: "casa de piedra", hecho: "el agua rebasa la casa de piedra", texto: "Cuando el agua rebasó su casa de piedra, ya no había nadie a quien pedirle ayuda.", foto: "casa-inundada", icono: "fa-water" },
  { id: "cie-m", panel: 2, apoya: "miedo", motivo: "luces", hecho: "las luces eran pescadores que venían a avisar", texto: "Al bajar el agua supieron que las luces eran faroles de pescadores que venían a avisar.", foto: null, icono: "fa-fire" },
];

export type Elegidas = (string | null)[];

export function escenaPorId(id: string | null): EscenaTaller | null {
  return id ? ESCENAS_TALLER.find((e) => e.id === id) ?? null : null;
}

export interface LecturaTaller {
  llenas: number;
  coherencia: number;
  dominante: TemaTaller | null;
  /** Pares de paneles unidos por un motivo repetido que sostiene el tema elegido. */
  hilos: [number, number][];
  veredicto: string;
}

export function evaluarTaller(elegidas: Elegidas, tema: TemaTaller): LecturaTaller {
  const esc = elegidas.map(escenaPorId);
  const llenas = esc.filter(Boolean).length;
  const coherencia = esc.filter((e) => e && e.apoya === tema).length;
  const cuenta: Record<string, number> = {};
  for (const e of esc) if (e) cuenta[e.apoya] = (cuenta[e.apoya] ?? 0) + 1;
  const orden = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  const dominante = orden[0] && orden[0][1] >= 2 ? (orden[0][0] as TemaTaller) : null;
  const hilos: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const a = esc[i];
      const b = esc[j];
      if (a && b && a.apoya === tema && b.apoya === tema && a.motivo === b.motivo) hilos.push([i, j]);
    }
  }
  const frase = TEMAS_TALLER.find((t) => t.id === tema)!.corto;
  let veredicto: string;
  if (llenas < 3) veredicto = "Faltan escenas: un tema se prueba con el relato completo.";
  else if (coherencia === 3) veredicto = `Las tres escenas sostienen «${frase}»: el motivo se repite y forma un hilo.`;
  else if (coherencia === 0) veredicto = `Ninguna escena sostiene «${frase}»: el tema que eliges no es el que el relato cuenta.`;
  else veredicto = `Solo ${coherencia} de 3 escenas sostienen «${frase}»: el relato se dispersa.`;
  return { llenas, coherencia, dominante, hilos, veredicto };
}

export const ASUNTO_VS_TEMA =
  "Lo que pasa (asunto) se puede filmar; de qué trata (tema) se deduce de lo que esas escenas repiten.";
