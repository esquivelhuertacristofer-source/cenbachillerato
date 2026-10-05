/**
 * Modelo del SIMULADOR «Cancillería» del lab mexico-en-el-mundo (CH-II-P04).
 *
 * Los episodios son los siete procesos de la línea del tiempo de la propia
 * progresión (A1). Las decisiones y los números son una SIMULACIÓN didáctica:
 * no son cifras históricas ni dicen qué decidió nadie en realidad; los hechos
 * (deuda como pretexto, 20,000 km de ferrocarril, Telegrama Zimmermann, 6 % anual,
 * moratoria de 1982, Efecto Tequila, nearshoring) salen de los datos del lab.
 *
 * Determinista: las mismas decisiones dan siempre el mismo mapa.
 */

export type SocioId = "eeuu" | "europa" | "urss" | "sur" | "china" | "fmi";

export interface Socio {
  id: SocioId;
  nombre: string;
  /** Posición en el mapa esquemático (porcentaje). */
  x: number;
  y: number;
  color: string;
}

/** México, centro de las rutas. */
export const MEXICO_POS = { x: 22, y: 58 };

export const SOCIOS: Socio[] = [
  { id: "eeuu", nombre: "EE.UU.", x: 24, y: 24, color: "#60A5FA" },
  { id: "europa", nombre: "Europa", x: 52, y: 18, color: "#A78BFA" },
  { id: "urss", nombre: "URSS", x: 72, y: 16, color: "#F87171" },
  { id: "fmi", nombre: "FMI", x: 44, y: 44, color: "#FBBF24" },
  { id: "china", nombre: "China", x: 84, y: 48, color: "#F472B6" },
  { id: "sur", nombre: "Sur global", x: 38, y: 82, color: "#34D399" },
];

export type Indicador = "comercio" | "autonomia" | "estabilidad";

export const INDICADORES: { id: Indicador; nombre: string; icono: string; color: string }[] = [
  { id: "comercio", nombre: "Comercio", icono: "fa-boxes-stacked", color: "#38BDF8" },
  { id: "autonomia", nombre: "Autonomía", icono: "fa-flag", color: "#FBBF24" },
  { id: "estabilidad", nombre: "Estabilidad", icono: "fa-scale-balanced", color: "#34D399" },
];

export interface Estado {
  comercio: number;
  autonomia: number;
  estabilidad: number;
  flujos: Record<SocioId, number>;
  /** Socios cuya crisis «contagia» a México por una decisión. */
  contagio: SocioId[];
}

export const INICIO: Estado = {
  comercio: 40,
  autonomia: 60,
  estabilidad: 50,
  flujos: { eeuu: 20, europa: 20, urss: 5, fmi: 5, china: 5, sur: 5 },
  contagio: [],
};

export interface Opcion {
  id: string;
  texto: string;
  efecto: { comercio: number; autonomia: number; estabilidad: number };
  flujos: Partial<Record<SocioId, number>>;
  contagio?: SocioId;
  /** Por qué pasó lo que pasó (la lógica de la interconexión). */
  porque: string;
}

export interface Episodio {
  id: string;
  anio: string;
  titulo: string;
  /** El contexto, con los hechos de la propia progresión. */
  contexto: string;
  pregunta: string;
  /** clave de la imagen: /media/labs-sim/mexico-en-el-mundo/<clave>.webp */
  imagen: string;
  icono: string;
  opciones: Opcion[];
}

export const EPISODIOS: Episodio[] = [
  {
    id: "reforma",
    anio: "1858–1867",
    titulo: "La deuda y la Intervención",
    contexto: "La deuda externa es el pretexto con el que Napoleón III justifica la Intervención Francesa para establecer un Imperio bajo Maximiliano.",
    pregunta: "¿Cómo responde la cancillería a los acreedores?",
    imagen: "reforma-puerto",
    icono: "fa-ship",
    opciones: [
      {
        id: "a",
        texto: "Renegociar con cada acreedor y ganar tiempo",
        efecto: { comercio: 0, autonomia: 6, estabilidad: -4 },
        flujos: { europa: 6, eeuu: 3 },
        porque: "Negociar por separado evita darle a un solo país el pretexto de cobrar por la fuerza. Cuesta estabilidad, pero conserva margen de decisión.",
      },
      {
        id: "b",
        texto: "Aceptar las condiciones del acreedor más fuerte",
        efecto: { comercio: 4, autonomia: -12, estabilidad: 0 },
        flujos: { europa: 16 },
        porque: "Pagar con las reglas del más fuerte abre el comercio con él, pero concentra la relación y cede autonomía: justo lo que busca el imperialismo.",
      },
      {
        id: "c",
        texto: "Dejar de pagar y cortar relaciones",
        efecto: { comercio: -8, autonomia: 4, estabilidad: -10 },
        flujos: { europa: -8 },
        porque: "Cortar relaciones protege la autonomía en el papel, pero sin comercio ni acuerdos la presión se vuelve conflicto abierto.",
      },
    ],
  },
  {
    id: "porfiriato",
    anio: "1876–1911",
    titulo: "Capital para el ferrocarril",
    contexto: "México se integra como exportador de materias primas. La inversión extranjera construyó 20,000 km de ferrocarril y concentró la tierra.",
    pregunta: "¿A quién le abres la puerta de las concesiones?",
    imagen: "porfiriato-tren",
    icono: "fa-train",
    opciones: [
      {
        id: "a",
        texto: "Dar las concesiones a un solo inversionista",
        efecto: { comercio: 16, autonomia: -14, estabilidad: -8 },
        flujos: { eeuu: 20 },
        porque: "El comercio se dispara, pero toda la red depende de un solo socio. Es la dependencia económica de la que habla el glosario: crece el flujo y se estrecha la autonomía.",
      },
      {
        id: "b",
        texto: "Abrir concesiones a varios países, con reglas",
        efecto: { comercio: 10, autonomia: -4, estabilidad: -2 },
        flujos: { eeuu: 8, europa: 10 },
        porque: "Repartir la inversión da comercio sin que un solo socio controle las vías. Aun así, el capital extranjero concentra la tierra y genera tensión.",
      },
      {
        id: "c",
        texto: "Limitar la entrada de capital extranjero",
        efecto: { comercio: -6, autonomia: 8, estabilidad: 4 },
        flujos: {},
        porque: "Sin inversión no hay ferrocarril ni exportaciones: se protege la autonomía pero México se queda fuera de la primera globalización.",
      },
    ],
  },
  {
    id: "revolucion",
    anio: "1917",
    titulo: "El telegrama de Alemania",
    contexto: "El Telegrama Zimmermann propone a México recuperar Texas, Nuevo México y Arizona a cambio de aliarse con Alemania en plena Primera Guerra Mundial.",
    pregunta: "¿Qué postura toma México ante el conflicto mundial?",
    imagen: "revolucion-telegrafo",
    icono: "fa-tower-broadcast",
    opciones: [
      {
        id: "a",
        texto: "Aceptar la propuesta alemana",
        efecto: { comercio: -6, autonomia: -6, estabilidad: -12 },
        flujos: { europa: 8, eeuu: -8 },
        porque: "Aliarse con una potencia lejana, en guerra, deja al país sin respaldo y con un conflicto externo encima.",
      },
      {
        id: "b",
        texto: "Declararse neutral y mantener contacto con ambos bandos",
        efecto: { comercio: 2, autonomia: 8, estabilidad: 2 },
        flujos: { europa: 3, eeuu: 3 },
        porque: "La neutralidad reconoce que la Revolución ya es bastante lucha interna: no apuesta todo a un bando y conserva margen para decidir.",
      },
      {
        id: "c",
        texto: "Alinearse de inmediato con EE.UU.",
        efecto: { comercio: 6, autonomia: -8, estabilidad: 2 },
        flujos: { eeuu: 10 },
        porque: "Alinearse da seguridad comercial con el vecino, pero a costa de decidir lo que otro necesita y no lo que México conviene.",
      },
    ],
  },
  {
    id: "milagro",
    anio: "1940–1970",
    titulo: "Milagro y Guerra Fría",
    contexto: "El país crece de forma sostenida al 6 % anual. México mantiene neutralidad formal pero se alinea con el bloque occidental; en 1968 ocurre Tlatelolco.",
    pregunta: "¿Cómo se sitúa México entre los dos bloques?",
    imagen: "milagro-obras",
    icono: "fa-industry",
    opciones: [
      {
        id: "a",
        texto: "Alinearse sin reservas con EE.UU. y reprimir a la izquierda",
        efecto: { comercio: 10, autonomia: -10, estabilidad: -12 },
        flujos: { eeuu: 14 },
        porque: "Usar la amenaza comunista para reprimir (como en 1968) compra respaldo exterior, pero rompe la estabilidad social por dentro y reduce autonomía.",
      },
      {
        id: "b",
        texto: "Crecer con mercado interno y relaciones con ambos bloques",
        efecto: { comercio: 8, autonomia: 8, estabilidad: 2 },
        flujos: { eeuu: 6, urss: 6 },
        porque: "El crecimiento sostenido apoyado en varias relaciones deja más margen: la Guerra Fría presiona, pero ningún socio decide por México.",
      },
      {
        id: "c",
        texto: "Cerrar la economía al comercio exterior",
        efecto: { comercio: -6, autonomia: 4, estabilidad: 0 },
        flujos: {},
        porque: "Cerrarse protege algunas industrias, pero sin comercio el crecimiento del 6 % no se sostiene: ningún proceso es completamente local.",
      },
    ],
  },
  {
    id: "deuda",
    anio: "1982",
    titulo: "Moratoria y ajuste",
    contexto: "La moratoria de pagos de 1982 es parte de la crisis global de endeudamiento del sur. El FMI impone ajuste estructural.",
    pregunta: "¿Cómo se enfrenta la crisis de la deuda?",
    imagen: "deuda-mesa",
    icono: "fa-file-invoice-dollar",
    opciones: [
      {
        id: "a",
        texto: "Aceptar el ajuste del FMI tal cual",
        efecto: { comercio: 4, autonomia: -10, estabilidad: -10 },
        flujos: { fmi: 16 },
        porque: "El ajuste da acceso al crédito, pero privatizar, recortar gasto y abrir el comercio por mandato externo reduce la autonomía y golpea a la población.",
      },
      {
        id: "b",
        texto: "Negociar junto con otros deudores del sur",
        efecto: { comercio: -2, autonomia: 8, estabilidad: -4 },
        flujos: { sur: 10, fmi: 6 },
        porque: "Como la crisis es global, la respuesta también: coordinarse con otros deudores da más fuerza para negociar que ir solo ante los acreedores.",
      },
      {
        id: "c",
        texto: "Pedir más créditos privados para seguir pagando",
        efecto: { comercio: 6, autonomia: -6, estabilidad: -8 },
        flujos: { eeuu: 8 },
        porque: "Endeudarse más para pagar la deuda alarga el problema y aumenta la dependencia del mismo grupo de acreedores.",
      },
    ],
  },
  {
    id: "tlcan",
    anio: "1994",
    titulo: "TLCAN y Efecto Tequila",
    contexto: "El TLCAN integra a México al bloque norteamericano. La crisis financiera de diciembre de 1994 se extiende a Argentina y otros países.",
    pregunta: "¿Qué tan abiertos dejas los mercados financieros?",
    imagen: "tlcan-frontera",
    icono: "fa-truck-fast",
    opciones: [
      {
        id: "a",
        texto: "Abrir al máximo, incluso al capital de corto plazo",
        efecto: { comercio: 12, autonomia: -8, estabilidad: -14 },
        flujos: { eeuu: 14 },
        contagio: "sur",
        porque: "El capital de corto plazo entra rápido y sale igual: la crisis estalla en México y se contagia a otros países. Eso es la interconexión financiera global.",
      },
      {
        id: "b",
        texto: "Abrir el comercio, pero vigilar los capitales volátiles",
        efecto: { comercio: 8, autonomia: 2, estabilidad: 2 },
        flujos: { eeuu: 8, europa: 3 },
        porque: "Integrarse al bloque aporta comercio; vigilar el capital volátil reduce el golpe cuando algo falla en otro lugar.",
      },
      {
        id: "c",
        texto: "No firmar tratados comerciales",
        efecto: { comercio: -6, autonomia: 4, estabilidad: 0 },
        flujos: {},
        porque: "Sin tratados se evita el riesgo, pero también la integración: el comercio se queda corto frente a los países vecinos.",
      },
    ],
  },
  {
    id: "tmec",
    anio: "2020–presente",
    titulo: "T-MEC y nearshoring",
    contexto: "La pandemia evidenció la dependencia de cadenas de suministro globales y la tensión EE.UU.–China abre oportunidades de nearshoring industrial.",
    pregunta: "¿Cómo aprovecha México el nearshoring?",
    imagen: "tmec-nave",
    icono: "fa-industry",
    opciones: [
      {
        id: "a",
        texto: "Ofrecerle todo a EE.UU. para atraer fábricas",
        efecto: { comercio: 12, autonomia: -6, estabilidad: 0 },
        flujos: { eeuu: 14 },
        porque: "Atrae inversión rápido, pero vuelve a concentrar el comercio en un solo socio: la misma lección que el Porfiriato.",
      },
      {
        id: "b",
        texto: "Atraer fábricas y diversificar cadenas con Europa y Asia",
        efecto: { comercio: 10, autonomia: 6, estabilidad: 4 },
        flujos: { europa: 8, china: 8, eeuu: 6 },
        porque: "Diversificar proveedores y clientes reduce el riesgo de que una crisis de un socio detenga la economía.",
      },
      {
        id: "c",
        texto: "Esperar sin cambiar nada",
        efecto: { comercio: -4, autonomia: 0, estabilidad: -2 },
        flujos: {},
        porque: "La oportunidad se va a otros países: sin decisión, la interconexión corre a favor de otros.",
      },
    ],
  },
];

const tope = (n: number) => Math.max(0, Math.min(100, n));

/** `elecciones[i]` es el id de la opción tomada en el episodio i (o null). */
export function calcular(elecciones: (string | null)[]): Estado {
  let c = INICIO.comercio;
  let a = INICIO.autonomia;
  let e = INICIO.estabilidad;
  const flujos = { ...INICIO.flujos };
  const contagio: SocioId[] = [];
  EPISODIOS.forEach((ep, i) => {
    const op = ep.opciones.find((o) => o.id === elecciones[i]);
    if (!op) return;
    c = tope(c + op.efecto.comercio);
    a = tope(a + op.efecto.autonomia);
    e = tope(e + op.efecto.estabilidad);
    (Object.keys(op.flujos) as SocioId[]).forEach((s) => {
      flujos[s] = Math.max(0, flujos[s] + (op.flujos[s] ?? 0));
    });
    if (op.contagio) contagio.push(op.contagio);
  });
  return { comercio: c, autonomia: a, estabilidad: e, flujos, contagio };
}

/** Mayor participación de un solo socio en el total de flujos (0–1). */
export function concentracion(f: Record<SocioId, number>): { socio: SocioId; parte: number } {
  const total = (Object.values(f) as number[]).reduce((s, v) => s + v, 0) || 1;
  let mejor: SocioId = "eeuu";
  (Object.keys(f) as SocioId[]).forEach((s) => {
    if (f[s] > f[mejor]) mejor = s;
  });
  return { socio: mejor, parte: f[mejor] / total };
}

export type Nivel = "alta" | "media" | "baja";

export function dependencia(f: Record<SocioId, number>): Nivel {
  const p = concentracion(f).parte;
  return p > 0.5 ? "alta" : p > 0.4 ? "media" : "baja";
}

/** Meta: mundo conectado sin depender de un solo socio. */
export function metaLograda(s: Estado): boolean {
  return s.comercio >= 55 && s.autonomia >= 50 && s.estabilidad >= 45 && concentracion(s.flujos).parte <= 0.4;
}

export function decididos(elecciones: (string | null)[]): number {
  return elecciones.filter((x) => x !== null).length;
}
