/**
 * Simulador «Arma la PC del cliente» (hardware-software).
 *
 * Módulo PURO (sin React). El alumno elige piezas (hardware) y programas
 * (software) para un cliente ficticio con un presupuesto; `evaluar` dice si el
 * equipo enciende, si arranca, si la app del cliente corre y qué tan fluido va.
 *
 * Todas las cifras (precios, capacidades, puntajes) son de SIMULACIÓN: sirven
 * para razonar, no son precios de mercado. Los clientes son ficticios.
 */

export type SlotId = "cpu" | "ram" | "alm" | "gpu";
export type SoId = "windows" | "linux" | "ninguno";

export interface OpcionHw {
  id: string;
  slot: SlotId;
  nombre: string;
  spec: string;
  icono: string;
  precio: number;
  /** Puntaje de 0 a 100 que aporta al rendimiento. */
  nivel: number;
  /** RAM en GB / capacidad en GB / tarjeta dedicada (gpu). */
  gb?: number;
  dedicada?: boolean;
}

export const SLOTS: { id: SlotId; titulo: string; ranura: string; icono: string; pista: string }[] = [
  { id: "cpu", titulo: "Procesador", ranura: "Socket", icono: "fa-microchip", pista: "Ejecuta las instrucciones." },
  { id: "ram", titulo: "Memoria RAM", ranura: "Ranuras de memoria", icono: "fa-memory", pista: "Memoria de trabajo temporal." },
  { id: "alm", titulo: "Almacenamiento", ranura: "Bahía de disco", icono: "fa-hard-drive", pista: "Guarda los archivos de forma permanente." },
  { id: "gpu", titulo: "Gráficos", ranura: "Ranura de expansión", icono: "fa-display", pista: "Procesa imágenes y videos." },
];

export const OPCIONES: OpcionHw[] = [
  { id: "cpu-2", slot: "cpu", nombre: "2 núcleos", spec: "Básico", icono: "fa-microchip", precio: 1800, nivel: 25 },
  { id: "cpu-4", slot: "cpu", nombre: "4 núcleos", spec: "Intermedio", icono: "fa-microchip", precio: 3200, nivel: 55 },
  { id: "cpu-8", slot: "cpu", nombre: "8 núcleos", spec: "Potente", icono: "fa-microchip", precio: 6200, nivel: 90 },
  { id: "ram-4", slot: "ram", nombre: "4 GB", spec: "1 módulo", icono: "fa-memory", precio: 700, nivel: 20, gb: 4 },
  { id: "ram-8", slot: "ram", nombre: "8 GB", spec: "2 módulos", icono: "fa-memory", precio: 1200, nivel: 40, gb: 8 },
  { id: "ram-16", slot: "ram", nombre: "16 GB", spec: "3 módulos", icono: "fa-memory", precio: 2300, nivel: 80, gb: 16 },
  { id: "ram-32", slot: "ram", nombre: "32 GB", spec: "4 módulos", icono: "fa-memory", precio: 4400, nivel: 100, gb: 32 },
  { id: "alm-hdd", slot: "alm", nombre: "Disco duro 1 TB", spec: "Lento, barato", icono: "fa-compact-disc", precio: 900, nivel: 20, gb: 1000 },
  { id: "alm-256", slot: "alm", nombre: "SSD 256 GB", spec: "Rápido, poco espacio", icono: "fa-hard-drive", precio: 1100, nivel: 80, gb: 256 },
  { id: "alm-512", slot: "alm", nombre: "SSD 512 GB", spec: "Rápido", icono: "fa-hard-drive", precio: 1800, nivel: 85, gb: 512 },
  { id: "alm-1t", slot: "alm", nombre: "SSD 1 TB", spec: "Rápido, mucho espacio", icono: "fa-hard-drive", precio: 3200, nivel: 90, gb: 1000 },
  { id: "gpu-int", slot: "gpu", nombre: "Integrados", spec: "Sin tarjeta", icono: "fa-display", precio: 0, nivel: 20 },
  { id: "gpu-med", slot: "gpu", nombre: "Tarjeta media", spec: "Dedicada", icono: "fa-display", precio: 4200, nivel: 60, dedicada: true },
  { id: "gpu-alta", slot: "gpu", nombre: "Tarjeta alta", spec: "Dedicada, potente", icono: "fa-display", precio: 9500, nivel: 95, dedicada: true },
];

export const SISTEMAS: { id: SoId; nombre: string; precio: number; gb: number; icono: string }[] = [
  { id: "windows", nombre: "Windows", precio: 2500, gb: 40, icono: "fa-windows" },
  { id: "linux", nombre: "Linux", precio: 0, gb: 15, icono: "fa-linux" },
  { id: "ninguno", nombre: "Ninguno", precio: 0, gb: 0, icono: "fa-ban" },
];

export const PRECIO_CONTROLADOR = 0;
export const GB_CONTROLADOR = 2;

export interface Cliente {
  id: string;
  nombre: string;
  /** Una línea: quién es y qué necesita. */
  perfil: string;
  app: string;
  appIcono: string;
  presupuesto: number;
  /** Requisitos de la app. */
  ramMin: number;
  gpuMin: number;
  gb: number;
  /** Sistemas en los que existe la app. */
  sistemas: SoId[];
  /** Importancia de cada pieza para SU trabajo (suma 1). */
  peso: Record<SlotId, number>;
  /** Fluidez mínima para estar contento. */
  fluidezMin: number;
  clave: string;
}

export const CLIENTES: Cliente[] = [
  {
    id: "valeria",
    nombre: "Valeria Montes",
    perfil: "Edita video de bodas. Su equipo se congela con los archivos grandes.",
    app: "Editor de video",
    appIcono: "fa-film",
    presupuesto: 20000,
    ramMin: 16,
    gpuMin: 60,
    gb: 300,
    sistemas: ["windows"],
    peso: { cpu: 0.3, ram: 0.25, alm: 0.15, gpu: 0.3 },
    fluidezMin: 60,
    clave: "cliente-valeria",
  },
  {
    id: "ernesto",
    nombre: "Ernesto Paz",
    perfil: "Contador de una papelería. Solo usa hojas de cálculo y correo.",
    app: "Hoja de cálculo",
    appIcono: "fa-table",
    presupuesto: 8000,
    ramMin: 4,
    gpuMin: 0,
    gb: 20,
    sistemas: ["windows", "linux"],
    peso: { cpu: 0.3, ram: 0.35, alm: 0.3, gpu: 0.05 },
    fluidezMin: 50,
    clave: "cliente-ernesto",
  },
  {
    id: "mariana",
    nombre: "Mariana Ríos",
    perfil: "Estudiante que juega en línea con sus amigas los fines de semana.",
    app: "Videojuego en línea",
    appIcono: "fa-gamepad",
    presupuesto: 16000,
    ramMin: 8,
    gpuMin: 60,
    gb: 120,
    sistemas: ["windows"],
    peso: { cpu: 0.25, ram: 0.2, alm: 0.1, gpu: 0.45 },
    fluidezMin: 65,
    clave: "cliente-mariana",
  },
];

export interface Config {
  cpu: string | null;
  ram: string | null;
  alm: string | null;
  gpu: string | null;
  so: SoId;
  appInstalada: boolean;
  controlador: boolean;
}

export const CONFIG_VACIA: Config = { cpu: null, ram: null, alm: null, gpu: null, so: "ninguno", appInstalada: false, controlador: false };

export const opcionDe = (id: string | null): OpcionHw | undefined => (id ? OPCIONES.find((o) => o.id === id) : undefined);

export type Estado = "apagado" | "sinSO" | "escritorio" | "noCorre" | "corre";

export interface Evaluacion {
  estado: Estado;
  /** Por qué: explicación corta de la consecuencia. */
  motivo: string;
  precio: number;
  /** 0–100; 0 mientras no encienda. */
  fluidez: number;
  piezas: number;
  /** GB usados / GB que hay (0 si no hay almacenamiento). */
  usado: number;
  capacidad: number;
  enciende: boolean;
  /** Cumple todo: corre, fluido y dentro del presupuesto. */
  satisfecho: boolean;
  dentroPresupuesto: boolean;
}

const faltante = (c: Config): string | null => {
  if (!c.cpu) return "Sin procesador no hay quien ejecute las instrucciones: la pantalla sigue negra.";
  if (!c.ram) return "Sin memoria RAM el procesador no tiene dónde trabajar: no enciende.";
  if (!c.alm) return "Sin almacenamiento no hay dónde guardar nada: el equipo no arranca.";
  if (!c.gpu) return "Falta decidir los gráficos: elige tarjeta o gráficos integrados.";
  return null;
};

export function evaluar(c: Config, cli: Cliente): Evaluacion {
  const cpu = opcionDe(c.cpu);
  const ram = opcionDe(c.ram);
  const alm = opcionDe(c.alm);
  const gpu = opcionDe(c.gpu);
  const so = SISTEMAS.find((s) => s.id === c.so)!;
  const piezas = [cpu, ram, alm, gpu].filter(Boolean).length;
  const precio = [cpu, ram, alm, gpu].reduce((s, o) => s + (o?.precio ?? 0), 0) + so.precio;
  const dentroPresupuesto = precio <= cli.presupuesto;
  const base = { precio, piezas, dentroPresupuesto };

  const falta = faltante(c);
  if (falta || !cpu || !ram || !alm || !gpu) {
    return { ...base, estado: "apagado", motivo: falta ?? "", fluidez: 0, usado: 0, capacidad: alm?.gb ?? 0, enciende: false, satisfecho: false };
  }

  // El controlador solo importa si la tarjeta es dedicada.
  const gpuActivo = gpu.dedicada && !c.controlador ? 20 : gpu.nivel;
  const ramGb = ram.gb ?? 0;
  const fluidez = Math.round(
    cli.peso.cpu * cpu.nivel + cli.peso.ram * Math.min(100, ramGb * 5) + cli.peso.alm * alm.nivel + cli.peso.gpu * gpuActivo
  );
  const capacidad = alm.gb ?? 0;
  const usadoSo = so.gb + (gpu.dedicada && c.controlador ? GB_CONTROLADOR : 0);
  const enc = { ...base, fluidez, capacidad, enciende: true };

  if (c.so === "ninguno") {
    return {
      ...enc,
      estado: "sinSO",
      motivo: "Todo el hardware funciona, pero sin sistema operativo no hay quien lo coordine: el equipo solo muestra un aviso.",
      usado: 0,
      satisfecho: false,
    };
  }
  if (usadoSo > capacidad) {
    return { ...enc, estado: "sinSO", motivo: "El sistema operativo no cabe en el almacenamiento elegido.", usado: usadoSo, satisfecho: false };
  }
  if (!c.appInstalada) {
    return {
      ...enc,
      estado: "escritorio",
      motivo: `El equipo arrancó. Instala «${cli.app}» y comprueba si corre.`,
      usado: usadoSo,
      satisfecho: false,
    };
  }

  const usado = usadoSo + cli.gb;
  if (!cli.sistemas.includes(c.so)) {
    return {
      ...enc,
      estado: "noCorre",
      motivo: `«${cli.app}» no existe para ${so.nombre}: el software tiene que ser compatible con el sistema operativo.`,
      usado: usadoSo,
      satisfecho: false,
    };
  }
  if (usado > capacidad) {
    return {
      ...enc,
      estado: "noCorre",
      motivo: `No hay espacio: la app y sus archivos piden ${cli.gb} GB y el almacenamiento ya no alcanza.`,
      usado,
      satisfecho: false,
    };
  }
  if (ramGb < cli.ramMin) {
    return {
      ...enc,
      estado: "noCorre",
      motivo: `Se cierra al abrir: pide al menos ${cli.ramMin} GB de RAM y el equipo tiene ${ramGb} GB.`,
      usado,
      satisfecho: false,
    };
  }
  if (gpuActivo < cli.gpuMin) {
    const sinCtrl = gpu.dedicada && !c.controlador;
    return {
      ...enc,
      estado: "noCorre",
      motivo: sinCtrl
        ? "La tarjeta gráfica está puesta pero sin su controlador (driver): el sistema no sabe usarla y la app no abre."
        : "Los gráficos no alcanzan: la app necesita una tarjeta dedicada.",
      usado,
      satisfecho: false,
    };
  }
  const contento = fluidez >= cli.fluidezMin;
  return {
    ...enc,
    estado: "corre",
    motivo: contento
      ? "La app corre fluida."
      : `La app abre, pero va lenta: ${fluidez} de ${cli.fluidezMin} de fluidez. Mejora la pieza que más pesa para su trabajo.`,
    usado,
    satisfecho: contento && dentroPresupuesto,
  };
}

/** La pieza que más le importa al cliente. */
export function piezaClave(cli: Cliente): SlotId {
  return (Object.entries(cli.peso).sort((a, b) => b[1] - a[1])[0]![0]) as SlotId;
}

export const dinero = (n: number): string => `$${n.toLocaleString("es-MX")}`;
