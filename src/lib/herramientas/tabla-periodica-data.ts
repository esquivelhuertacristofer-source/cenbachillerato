/**
 * Datos de la tabla periódica (118 elementos) para la herramienta de química.
 * Módulo de datos PURO (sin three, sin React) — seguro de importar en cualquier
 * sitio sin inflar el bundle pesado.
 *
 * `masa`: peso atómico estándar; si `estable` es true, es el número másico del
 * isótopo más estable (se muestra entre corchetes).
 * `x`/`y`: posición en la rejilla de 18 columnas (lantánidos en y=9, actínidos
 * en y=10, como en la tabla impresa).
 */

export type CategoriaElemento =
  | "no-metal"
  | "gas-noble"
  | "alcalino"
  | "alcalinoterreo"
  | "transicion"
  | "post-transicion"
  | "metaloide"
  | "halogeno"
  | "lantanido"
  | "actinido"
  | "desconocido";

export interface Elemento {
  z: number;
  sym: string;
  nombre: string;
  masa: number;
  estable?: boolean;
  x: number;
  y: number;
  periodo: number;
  grupo: number | null;
  categoria: CategoriaElemento;
}

export const CATEGORIA_INFO: Record<CategoriaElemento, { label: string; color: string }> = {
  "no-metal": { label: "No metal", color: "#4ADE80" },
  "gas-noble": { label: "Gas noble", color: "#C084FC" },
  alcalino: { label: "Metal alcalino", color: "#F87171" },
  alcalinoterreo: { label: "Alcalinotérreo", color: "#FB923C" },
  transicion: { label: "Metal de transición", color: "#FBBF24" },
  "post-transicion": { label: "Metal post-transición", color: "#38BDF8" },
  metaloide: { label: "Metaloide", color: "#2DD4BF" },
  halogeno: { label: "Halógeno", color: "#A3E635" },
  lantanido: { label: "Lantánido", color: "#F472B6" },
  actinido: { label: "Actínido", color: "#E879F9" },
  desconocido: { label: "Propiedades desconocidas", color: "#94A3B8" },
};

export const ELEMENTOS: Elemento[] = [
  { z: 1, sym: "H", nombre: "Hidrógeno", masa: 1.008, x: 1, y: 1, periodo: 1, grupo: 1, categoria: "no-metal" },
  { z: 2, sym: "He", nombre: "Helio", masa: 4.0026, x: 18, y: 1, periodo: 1, grupo: 18, categoria: "gas-noble" },
  { z: 3, sym: "Li", nombre: "Litio", masa: 6.94, x: 1, y: 2, periodo: 2, grupo: 1, categoria: "alcalino" },
  { z: 4, sym: "Be", nombre: "Berilio", masa: 9.0122, x: 2, y: 2, periodo: 2, grupo: 2, categoria: "alcalinoterreo" },
  { z: 5, sym: "B", nombre: "Boro", masa: 10.81, x: 13, y: 2, periodo: 2, grupo: 13, categoria: "metaloide" },
  { z: 6, sym: "C", nombre: "Carbono", masa: 12.011, x: 14, y: 2, periodo: 2, grupo: 14, categoria: "no-metal" },
  { z: 7, sym: "N", nombre: "Nitrógeno", masa: 14.007, x: 15, y: 2, periodo: 2, grupo: 15, categoria: "no-metal" },
  { z: 8, sym: "O", nombre: "Oxígeno", masa: 15.999, x: 16, y: 2, periodo: 2, grupo: 16, categoria: "no-metal" },
  { z: 9, sym: "F", nombre: "Flúor", masa: 18.998, x: 17, y: 2, periodo: 2, grupo: 17, categoria: "halogeno" },
  { z: 10, sym: "Ne", nombre: "Neón", masa: 20.18, x: 18, y: 2, periodo: 2, grupo: 18, categoria: "gas-noble" },
  { z: 11, sym: "Na", nombre: "Sodio", masa: 22.99, x: 1, y: 3, periodo: 3, grupo: 1, categoria: "alcalino" },
  { z: 12, sym: "Mg", nombre: "Magnesio", masa: 24.305, x: 2, y: 3, periodo: 3, grupo: 2, categoria: "alcalinoterreo" },
  { z: 13, sym: "Al", nombre: "Aluminio", masa: 26.982, x: 13, y: 3, periodo: 3, grupo: 13, categoria: "post-transicion" },
  { z: 14, sym: "Si", nombre: "Silicio", masa: 28.085, x: 14, y: 3, periodo: 3, grupo: 14, categoria: "metaloide" },
  { z: 15, sym: "P", nombre: "Fósforo", masa: 30.974, x: 15, y: 3, periodo: 3, grupo: 15, categoria: "no-metal" },
  { z: 16, sym: "S", nombre: "Azufre", masa: 32.06, x: 16, y: 3, periodo: 3, grupo: 16, categoria: "no-metal" },
  { z: 17, sym: "Cl", nombre: "Cloro", masa: 35.45, x: 17, y: 3, periodo: 3, grupo: 17, categoria: "halogeno" },
  { z: 18, sym: "Ar", nombre: "Argón", masa: 39.95, x: 18, y: 3, periodo: 3, grupo: 18, categoria: "gas-noble" },
  { z: 19, sym: "K", nombre: "Potasio", masa: 39.098, x: 1, y: 4, periodo: 4, grupo: 1, categoria: "alcalino" },
  { z: 20, sym: "Ca", nombre: "Calcio", masa: 40.078, x: 2, y: 4, periodo: 4, grupo: 2, categoria: "alcalinoterreo" },
  { z: 21, sym: "Sc", nombre: "Escandio", masa: 44.956, x: 3, y: 4, periodo: 4, grupo: 3, categoria: "transicion" },
  { z: 22, sym: "Ti", nombre: "Titanio", masa: 47.867, x: 4, y: 4, periodo: 4, grupo: 4, categoria: "transicion" },
  { z: 23, sym: "V", nombre: "Vanadio", masa: 50.942, x: 5, y: 4, periodo: 4, grupo: 5, categoria: "transicion" },
  { z: 24, sym: "Cr", nombre: "Cromo", masa: 51.996, x: 6, y: 4, periodo: 4, grupo: 6, categoria: "transicion" },
  { z: 25, sym: "Mn", nombre: "Manganeso", masa: 54.938, x: 7, y: 4, periodo: 4, grupo: 7, categoria: "transicion" },
  { z: 26, sym: "Fe", nombre: "Hierro", masa: 55.845, x: 8, y: 4, periodo: 4, grupo: 8, categoria: "transicion" },
  { z: 27, sym: "Co", nombre: "Cobalto", masa: 58.933, x: 9, y: 4, periodo: 4, grupo: 9, categoria: "transicion" },
  { z: 28, sym: "Ni", nombre: "Níquel", masa: 58.693, x: 10, y: 4, periodo: 4, grupo: 10, categoria: "transicion" },
  { z: 29, sym: "Cu", nombre: "Cobre", masa: 63.546, x: 11, y: 4, periodo: 4, grupo: 11, categoria: "transicion" },
  { z: 30, sym: "Zn", nombre: "Zinc", masa: 65.38, x: 12, y: 4, periodo: 4, grupo: 12, categoria: "transicion" },
  { z: 31, sym: "Ga", nombre: "Galio", masa: 69.723, x: 13, y: 4, periodo: 4, grupo: 13, categoria: "post-transicion" },
  { z: 32, sym: "Ge", nombre: "Germanio", masa: 72.63, x: 14, y: 4, periodo: 4, grupo: 14, categoria: "metaloide" },
  { z: 33, sym: "As", nombre: "Arsénico", masa: 74.922, x: 15, y: 4, periodo: 4, grupo: 15, categoria: "metaloide" },
  { z: 34, sym: "Se", nombre: "Selenio", masa: 78.971, x: 16, y: 4, periodo: 4, grupo: 16, categoria: "no-metal" },
  { z: 35, sym: "Br", nombre: "Bromo", masa: 79.904, x: 17, y: 4, periodo: 4, grupo: 17, categoria: "halogeno" },
  { z: 36, sym: "Kr", nombre: "Kriptón", masa: 83.798, x: 18, y: 4, periodo: 4, grupo: 18, categoria: "gas-noble" },
  { z: 37, sym: "Rb", nombre: "Rubidio", masa: 85.468, x: 1, y: 5, periodo: 5, grupo: 1, categoria: "alcalino" },
  { z: 38, sym: "Sr", nombre: "Estroncio", masa: 87.62, x: 2, y: 5, periodo: 5, grupo: 2, categoria: "alcalinoterreo" },
  { z: 39, sym: "Y", nombre: "Itrio", masa: 88.906, x: 3, y: 5, periodo: 5, grupo: 3, categoria: "transicion" },
  { z: 40, sym: "Zr", nombre: "Circonio", masa: 91.224, x: 4, y: 5, periodo: 5, grupo: 4, categoria: "transicion" },
  { z: 41, sym: "Nb", nombre: "Niobio", masa: 92.906, x: 5, y: 5, periodo: 5, grupo: 5, categoria: "transicion" },
  { z: 42, sym: "Mo", nombre: "Molibdeno", masa: 95.95, x: 6, y: 5, periodo: 5, grupo: 6, categoria: "transicion" },
  { z: 43, sym: "Tc", nombre: "Tecnecio", masa: 98, estable: true, x: 7, y: 5, periodo: 5, grupo: 7, categoria: "transicion" },
  { z: 44, sym: "Ru", nombre: "Rutenio", masa: 101.07, x: 8, y: 5, periodo: 5, grupo: 8, categoria: "transicion" },
  { z: 45, sym: "Rh", nombre: "Rodio", masa: 102.91, x: 9, y: 5, periodo: 5, grupo: 9, categoria: "transicion" },
  { z: 46, sym: "Pd", nombre: "Paladio", masa: 106.42, x: 10, y: 5, periodo: 5, grupo: 10, categoria: "transicion" },
  { z: 47, sym: "Ag", nombre: "Plata", masa: 107.87, x: 11, y: 5, periodo: 5, grupo: 11, categoria: "transicion" },
  { z: 48, sym: "Cd", nombre: "Cadmio", masa: 112.41, x: 12, y: 5, periodo: 5, grupo: 12, categoria: "transicion" },
  { z: 49, sym: "In", nombre: "Indio", masa: 114.82, x: 13, y: 5, periodo: 5, grupo: 13, categoria: "post-transicion" },
  { z: 50, sym: "Sn", nombre: "Estaño", masa: 118.71, x: 14, y: 5, periodo: 5, grupo: 14, categoria: "post-transicion" },
  { z: 51, sym: "Sb", nombre: "Antimonio", masa: 121.76, x: 15, y: 5, periodo: 5, grupo: 15, categoria: "metaloide" },
  { z: 52, sym: "Te", nombre: "Telurio", masa: 127.6, x: 16, y: 5, periodo: 5, grupo: 16, categoria: "metaloide" },
  { z: 53, sym: "I", nombre: "Yodo", masa: 126.9, x: 17, y: 5, periodo: 5, grupo: 17, categoria: "halogeno" },
  { z: 54, sym: "Xe", nombre: "Xenón", masa: 131.29, x: 18, y: 5, periodo: 5, grupo: 18, categoria: "gas-noble" },
  { z: 55, sym: "Cs", nombre: "Cesio", masa: 132.91, x: 1, y: 6, periodo: 6, grupo: 1, categoria: "alcalino" },
  { z: 56, sym: "Ba", nombre: "Bario", masa: 137.33, x: 2, y: 6, periodo: 6, grupo: 2, categoria: "alcalinoterreo" },
  { z: 57, sym: "La", nombre: "Lantano", masa: 138.91, x: 3, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 58, sym: "Ce", nombre: "Cerio", masa: 140.12, x: 4, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 59, sym: "Pr", nombre: "Praseodimio", masa: 140.91, x: 5, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 60, sym: "Nd", nombre: "Neodimio", masa: 144.24, x: 6, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 61, sym: "Pm", nombre: "Prometio", masa: 145, estable: true, x: 7, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 62, sym: "Sm", nombre: "Samario", masa: 150.36, x: 8, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 63, sym: "Eu", nombre: "Europio", masa: 151.96, x: 9, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 64, sym: "Gd", nombre: "Gadolinio", masa: 157.25, x: 10, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 65, sym: "Tb", nombre: "Terbio", masa: 158.93, x: 11, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 66, sym: "Dy", nombre: "Disprosio", masa: 162.5, x: 12, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 67, sym: "Ho", nombre: "Holmio", masa: 164.93, x: 13, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 68, sym: "Er", nombre: "Erbio", masa: 167.26, x: 14, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 69, sym: "Tm", nombre: "Tulio", masa: 168.93, x: 15, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 70, sym: "Yb", nombre: "Iterbio", masa: 173.05, x: 16, y: 9, periodo: 6, grupo: null, categoria: "lantanido" },
  { z: 71, sym: "Lu", nombre: "Lutecio", masa: 174.97, x: 17, y: 9, periodo: 6, grupo: 3, categoria: "lantanido" },
  { z: 72, sym: "Hf", nombre: "Hafnio", masa: 178.49, x: 4, y: 6, periodo: 6, grupo: 4, categoria: "transicion" },
  { z: 73, sym: "Ta", nombre: "Tántalo", masa: 180.95, x: 5, y: 6, periodo: 6, grupo: 5, categoria: "transicion" },
  { z: 74, sym: "W", nombre: "Wolframio", masa: 183.84, x: 6, y: 6, periodo: 6, grupo: 6, categoria: "transicion" },
  { z: 75, sym: "Re", nombre: "Renio", masa: 186.21, x: 7, y: 6, periodo: 6, grupo: 7, categoria: "transicion" },
  { z: 76, sym: "Os", nombre: "Osmio", masa: 190.23, x: 8, y: 6, periodo: 6, grupo: 8, categoria: "transicion" },
  { z: 77, sym: "Ir", nombre: "Iridio", masa: 192.22, x: 9, y: 6, periodo: 6, grupo: 9, categoria: "transicion" },
  { z: 78, sym: "Pt", nombre: "Platino", masa: 195.08, x: 10, y: 6, periodo: 6, grupo: 10, categoria: "transicion" },
  { z: 79, sym: "Au", nombre: "Oro", masa: 196.97, x: 11, y: 6, periodo: 6, grupo: 11, categoria: "transicion" },
  { z: 80, sym: "Hg", nombre: "Mercurio", masa: 200.59, x: 12, y: 6, periodo: 6, grupo: 12, categoria: "transicion" },
  { z: 81, sym: "Tl", nombre: "Talio", masa: 204.38, x: 13, y: 6, periodo: 6, grupo: 13, categoria: "post-transicion" },
  { z: 82, sym: "Pb", nombre: "Plomo", masa: 207.2, x: 14, y: 6, periodo: 6, grupo: 14, categoria: "post-transicion" },
  { z: 83, sym: "Bi", nombre: "Bismuto", masa: 208.98, x: 15, y: 6, periodo: 6, grupo: 15, categoria: "post-transicion" },
  { z: 84, sym: "Po", nombre: "Polonio", masa: 209, estable: true, x: 16, y: 6, periodo: 6, grupo: 16, categoria: "post-transicion" },
  { z: 85, sym: "At", nombre: "Astato", masa: 210, estable: true, x: 17, y: 6, periodo: 6, grupo: 17, categoria: "halogeno" },
  { z: 86, sym: "Rn", nombre: "Radón", masa: 222, estable: true, x: 18, y: 6, periodo: 6, grupo: 18, categoria: "gas-noble" },
  { z: 87, sym: "Fr", nombre: "Francio", masa: 223, estable: true, x: 1, y: 7, periodo: 7, grupo: 1, categoria: "alcalino" },
  { z: 88, sym: "Ra", nombre: "Radio", masa: 226, estable: true, x: 2, y: 7, periodo: 7, grupo: 2, categoria: "alcalinoterreo" },
  { z: 89, sym: "Ac", nombre: "Actinio", masa: 227, estable: true, x: 3, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 90, sym: "Th", nombre: "Torio", masa: 232.04, x: 4, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 91, sym: "Pa", nombre: "Protactinio", masa: 231.04, x: 5, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 92, sym: "U", nombre: "Uranio", masa: 238.03, x: 6, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 93, sym: "Np", nombre: "Neptunio", masa: 237, estable: true, x: 7, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 94, sym: "Pu", nombre: "Plutonio", masa: 244, estable: true, x: 8, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 95, sym: "Am", nombre: "Americio", masa: 243, estable: true, x: 9, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 96, sym: "Cm", nombre: "Curio", masa: 247, estable: true, x: 10, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 97, sym: "Bk", nombre: "Berkelio", masa: 247, estable: true, x: 11, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 98, sym: "Cf", nombre: "Californio", masa: 251, estable: true, x: 12, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 99, sym: "Es", nombre: "Einstenio", masa: 252, estable: true, x: 13, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 100, sym: "Fm", nombre: "Fermio", masa: 257, estable: true, x: 14, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 101, sym: "Md", nombre: "Mendelevio", masa: 258, estable: true, x: 15, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 102, sym: "No", nombre: "Nobelio", masa: 259, estable: true, x: 16, y: 10, periodo: 7, grupo: null, categoria: "actinido" },
  { z: 103, sym: "Lr", nombre: "Laurencio", masa: 266, estable: true, x: 17, y: 10, periodo: 7, grupo: 3, categoria: "actinido" },
  { z: 104, sym: "Rf", nombre: "Rutherfordio", masa: 267, estable: true, x: 4, y: 7, periodo: 7, grupo: 4, categoria: "transicion" },
  { z: 105, sym: "Db", nombre: "Dubnio", masa: 268, estable: true, x: 5, y: 7, periodo: 7, grupo: 5, categoria: "transicion" },
  { z: 106, sym: "Sg", nombre: "Seaborgio", masa: 269, estable: true, x: 6, y: 7, periodo: 7, grupo: 6, categoria: "transicion" },
  { z: 107, sym: "Bh", nombre: "Bohrio", masa: 270, estable: true, x: 7, y: 7, periodo: 7, grupo: 7, categoria: "transicion" },
  { z: 108, sym: "Hs", nombre: "Hassio", masa: 269, estable: true, x: 8, y: 7, periodo: 7, grupo: 8, categoria: "transicion" },
  { z: 109, sym: "Mt", nombre: "Meitnerio", masa: 278, estable: true, x: 9, y: 7, periodo: 7, grupo: 9, categoria: "desconocido" },
  { z: 110, sym: "Ds", nombre: "Darmstatio", masa: 281, estable: true, x: 10, y: 7, periodo: 7, grupo: 10, categoria: "desconocido" },
  { z: 111, sym: "Rg", nombre: "Roentgenio", masa: 282, estable: true, x: 11, y: 7, periodo: 7, grupo: 11, categoria: "desconocido" },
  { z: 112, sym: "Cn", nombre: "Copernicio", masa: 285, estable: true, x: 12, y: 7, periodo: 7, grupo: 12, categoria: "desconocido" },
  { z: 113, sym: "Nh", nombre: "Nihonio", masa: 286, estable: true, x: 13, y: 7, periodo: 7, grupo: 13, categoria: "desconocido" },
  { z: 114, sym: "Fl", nombre: "Flerovio", masa: 289, estable: true, x: 14, y: 7, periodo: 7, grupo: 14, categoria: "desconocido" },
  { z: 115, sym: "Mc", nombre: "Moscovio", masa: 290, estable: true, x: 15, y: 7, periodo: 7, grupo: 15, categoria: "desconocido" },
  { z: 116, sym: "Lv", nombre: "Livermorio", masa: 293, estable: true, x: 16, y: 7, periodo: 7, grupo: 16, categoria: "desconocido" },
  { z: 117, sym: "Ts", nombre: "Téneso", masa: 294, estable: true, x: 17, y: 7, periodo: 7, grupo: 17, categoria: "desconocido" },
  { z: 118, sym: "Og", nombre: "Oganesón", masa: 294, estable: true, x: 18, y: 7, periodo: 7, grupo: 18, categoria: "desconocido" },
];

/** Masa formateada para mostrar (corchetes si es isótopo más estable). */
export function masaTexto(e: Elemento): string {
  return e.estable ? `[${e.masa}]` : String(e.masa);
}
