/**
 * Lógica pura del simulador «Follow the instructions» (IN-V-P03).
 *
 * Un personaje FICTICIO (Marta en la cocina, Tomás en el taller) sigue
 * al pie de la letra las instrucciones en inglés que elige el alumno. Si el
 * orden, el conector o la forma verbal fallan, el resultado se ve mal y se
 * explica la regla en español. La «calidad» es un valor de simulación.
 *
 * Sin React: se puede probar y razonar aparte.
 */

export interface PasoReceta {
  id: string;
  conector: "First" | "Then" | "After that" | "Finally";
  /** Instrucción en imperativo, sin conector. */
  imperativo: string;
  /** Misma acción en voz pasiva (para el informe). */
  pasiva: string;
  /** Voz pasiva mal formada (distractor). */
  pasivaMala: string;
  /** Voz activa con sujeto (distractor: no es lo que pide el informe). */
  activa: string;
  esp: string;
  icono: string;
  color: string;
  capa: string;
  /** Instrucción con mala forma verbal (completa, con conector). */
  formaMala: string;
  /** Conector equivocado para este paso. */
  conectorMalo: "First" | "Finally";
  /** Qué se ve si este paso se hace antes de tiempo. */
  adelantada: string;
  /** Qué se ve si este paso se repite (solo se usa en el paso 0). */
  repetida: string;
}

export interface Receta {
  id: string;
  nombre: string;
  personaje: string;
  lugar: string;
  icono: string;
  meta: string;
  resultado: string;
  resultadoEsp: string;
  pasos: PasoReceta[];
}

export const RECETAS: Receta[] = [
  {
    id: "chocolate",
    nombre: "Hot chocolate",
    personaje: "Marta",
    lugar: "cocina",
    icono: "fa-mug-hot",
    meta: "Marta tiene sed de chocolate caliente y hará exactamente lo que le digas.",
    resultado: "As a result, you have a cup of hot chocolate.",
    resultadoEsp: "Como resultado, tienes una taza de chocolate caliente.",
    pasos: [
      {
        id: "ch1", conector: "First", imperativo: "Pour milk into a pot.", pasiva: "Milk is poured into a pot.",
        pasivaMala: "Milk is pour into a pot.", activa: "You pour milk into a pot.",
        esp: "Vierte leche en una olla.", icono: "fa-bottle-droplet", color: "#EAF2FF", capa: "leche",
        formaMala: "First, pouring milk into a pot.", conectorMalo: "Finally",
        adelantada: "Marta vierte la leche sobre la estufa apagada y la olla aún no está puesta: un charco blanco en la barra.",
        repetida: "Marta vierte más leche en una olla que ya estaba llena: se desborda por los lados.",
      },
      {
        id: "ch2", conector: "Then", imperativo: "Heat the milk on the stove.", pasiva: "The milk is heated on the stove.",
        pasivaMala: "The milk heated on the stove is.", activa: "You heat the milk on the stove.",
        esp: "Calienta la leche en la estufa.", icono: "fa-fire", color: "#FF8A4C", capa: "calor",
        formaMala: "Then, you heating the milk on the stove.", conectorMalo: "First",
        adelantada: "Marta enciende el fuego con la olla vacía: la olla se pone al rojo y sale humo.",
        repetida: "",
      },
      {
        id: "ch3", conector: "After that", imperativo: "Add two spoons of cocoa and stir.", pasiva: "Two spoons of cocoa are added and stirred.",
        pasivaMala: "Two spoons of cocoa is add and stir.", activa: "You add two spoons of cocoa and stir.",
        esp: "Agrega dos cucharadas de cacao y revuelve.", icono: "fa-spoon", color: "#8B5A3C", capa: "cacao",
        formaMala: "After that, to add two spoons of cocoa and stir.", conectorMalo: "Finally",
        adelantada: "Marta echa el cacao en una olla seca: el polvo se pega al fondo y queda quemado.",
        repetida: "",
      },
      {
        id: "ch4", conector: "Finally", imperativo: "Serve the chocolate in a mug.", pasiva: "The chocolate is served in a mug.",
        pasivaMala: "The chocolate serve in a mug.", activa: "You serve the chocolate in a mug.",
        esp: "Sirve el chocolate en una taza.", icono: "fa-mug-hot", color: "#C97B4A", capa: "taza",
        formaMala: "Finally, serves the chocolate in a mug.", conectorMalo: "First",
        adelantada: "Marta sirve una taza vacía y se queda esperando con la taza en la mano.",
        repetida: "",
      },
    ],
  },
  {
    id: "bici",
    nombre: "Fix a flat bike tyre",
    personaje: "Tomás",
    lugar: "taller",
    icono: "fa-bicycle",
    meta: "Tomás tiene una bicicleta ponchada en su taller y seguirá tus instrucciones tal cual.",
    resultado: "As a result, the bike is ready to ride.",
    resultadoEsp: "Como resultado, la bicicleta está lista para rodar.",
    pasos: [
      {
        id: "bi1", conector: "First", imperativo: "Take the wheel off the bike.", pasiva: "The wheel is taken off the bike.",
        pasivaMala: "The wheel is take off the bike.", activa: "You take the wheel off the bike.",
        esp: "Quita la rueda de la bicicleta.", icono: "fa-circle-notch", color: "#9AD1FF", capa: "rueda fuera",
        formaMala: "First, taking the wheel off the bike.", conectorMalo: "Finally",
        adelantada: "Tomás intenta quitar la rueda sin voltear la bici: la bicicleta se cae de lado contra la pared.",
        repetida: "Tomás ya tiene la rueda en la mano y empieza a desarmar el cuadro de la bici buscando «otra rueda».",
      },
      {
        id: "bi2", conector: "Then", imperativo: "Find the hole in the inner tube.", pasiva: "The hole is found in the inner tube.",
        pasivaMala: "The hole find in the inner tube.", activa: "You find the hole in the inner tube.",
        esp: "Encuentra el agujero en la cámara.", icono: "fa-magnifying-glass", color: "#FFC75A", capa: "agujero hallado",
        formaMala: "Then, you finding the hole in the inner tube.", conectorMalo: "First",
        adelantada: "Tomás busca el agujero con la rueda puesta y no alcanza a ver la cámara: revisa la llanta equivocada.",
        repetida: "",
      },
      {
        id: "bi3", conector: "After that", imperativo: "Stick a patch over the hole.", pasiva: "A patch is stuck over the hole.",
        pasivaMala: "A patch stuck over the hole is.", activa: "You stick a patch over the hole.",
        esp: "Pega un parche sobre el agujero.", icono: "fa-bandage", color: "#7CE0A4", capa: "parche",
        formaMala: "After that, to stick a patch over the hole.", conectorMalo: "Finally",
        adelantada: "Tomás pega el parche sin haber encontrado el agujero: lo coloca en un lugar sano y el aire sigue escapando.",
        repetida: "",
      },
      {
        id: "bi4", conector: "Finally", imperativo: "Inflate the tyre and put the wheel back.", pasiva: "The tyre is inflated and the wheel is put back.",
        pasivaMala: "The tyre inflate and the wheel put back.", activa: "You inflate the tyre and put the wheel back.",
        esp: "Infla la llanta y vuelve a poner la rueda.", icono: "fa-wind", color: "#C79BFF", capa: "inflada",
        formaMala: "Finally, inflates the tyre and put the wheel back.", conectorMalo: "First",
        adelantada: "Tomás infla una llanta con el agujero abierto: se infla un instante y se desinfla con un silbido.",
        repetida: "",
      },
    ],
  },
];

export function recetaDe(id: string): Receta {
  return RECETAS.find((r) => r.id === id) ?? RECETAS[0]!;
}

/* ── Estado ────────────────────────────────────────────────────────────── */

export type Final = "no" | "bien" | "temprano";

export interface Retro {
  ok: boolean;
  /** Lo que se VE que hizo el personaje. */
  efecto: string;
  /** La regla, en español. */
  regla: string;
}

export interface Estado {
  receta: string;
  /** Pasos correctos ya ejecutados. */
  paso: number;
  manchas: number;
  /** 0-100, valor de simulación. */
  calidad: number;
  fallas: number;
  turno: number;
  final: Final;
  /** Informe en voz pasiva: cuántas frases correctas lleva. */
  informe: number;
  informeFallas: number;
  ultimo: Retro | null;
}

export function estadoInicial(receta: string): Estado {
  return { receta, paso: 0, manchas: 0, calidad: 100, fallas: 0, turno: 0, final: "no", informe: 0, informeFallas: 0, ultimo: null };
}

export type TipoOpcion = "bien" | "orden" | "forma" | "conector";

export interface Opcion {
  id: string;
  texto: string;
  tipo: TipoOpcion;
  /** Paso al que se refiere la frase (para saber qué desorden provoca). */
  ref: number;
}

const REGLA_ORDEN = "Los conectores marcan el orden del proceso: First → Then → After that → Finally. Cada paso depende del anterior; si lo adelantas, el resultado sale mal.";
const REGLA_FORMA = "Una instrucción en inglés usa el verbo en forma base (imperativo): «Heat the milk», sin sujeto, sin -ing, sin «to» y sin -s final.";
const REGLA_FIRST = "«First» solo abre la secuencia. En medio del proceso suena a «empecemos de nuevo».";
const REGLA_FINALLY = "«Finally» anuncia el último paso. Si lo dices antes de tiempo, quien te escucha cree que ya terminó.";
const REGLA_PASIVA = "Voz pasiva: lo que recibe la acción + is/are + participio («is heated», «are added»), sin decir quién lo hace. Es la forma típica para describir procesos.";

function rotar<T>(arr: T[], n: number): T[] {
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

/** Las 4 frases entre las que se elige el siguiente paso (orden estable pero cambiante). */
export function opcionesPaso(receta: Receta, e: Estado): Opcion[] {
  const n = receta.pasos.length;
  const p = receta.pasos[e.paso];
  if (!p) return [];
  const ref = e.paso < n - 1 ? n - 1 : 0;
  const lista: Opcion[] = [
    { id: "bien", texto: `${p.conector}, ${lcPrimera(p.imperativo)}`, tipo: "bien", ref: e.paso },
    { id: "orden", texto: `${receta.pasos[ref]!.conector}, ${lcPrimera(receta.pasos[ref]!.imperativo)}`, tipo: "orden", ref },
    { id: "forma", texto: p.formaMala, tipo: "forma", ref: e.paso },
    { id: "conector", texto: `${p.conectorMalo}, ${lcPrimera(p.imperativo)}`, tipo: "conector", ref: e.paso },
  ];
  return rotar(lista, e.paso * 3 + e.turno);
}

/** Pone en minúscula la primera letra: «Pour milk…» → «pour milk…». */
function lcPrimera(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function elegirPaso(receta: Receta, e: Estado, o: Opcion): Estado {
  const n = receta.pasos.length;
  const p = receta.pasos[e.paso]!;
  const base = { ...e, turno: e.turno + 1 };
  if (o.tipo === "bien") {
    const paso = e.paso + 1;
    const final: Final = paso >= n ? "bien" : "no";
    return {
      ...base,
      paso,
      final,
      ultimo: { ok: true, efecto: `${receta.personaje} lo hace bien: ${p.esp.charAt(0).toLowerCase() + p.esp.slice(1)}`, regla: `«${p.conector}» ubica este paso en su lugar de la secuencia.` },
    };
  }
  if (o.tipo === "orden") {
    const fuera = receta.pasos[o.ref]!;
    const repite = o.ref < e.paso || (o.ref === 0 && e.paso >= n - 1);
    return {
      ...base,
      manchas: e.manchas + 1,
      calidad: Math.max(0, e.calidad - 25),
      fallas: e.fallas + 1,
      ultimo: { ok: false, efecto: repite ? fuera.repetida || fuera.adelantada : fuera.adelantada, regla: REGLA_ORDEN },
    };
  }
  if (o.tipo === "forma") {
    return {
      ...base,
      calidad: Math.max(0, e.calidad - 8),
      fallas: e.fallas + 1,
      ultimo: { ok: false, efecto: `${receta.personaje} se queda inmóvil con cara de duda: no sabe si le estás dando una orden.`, regla: REGLA_FORMA },
    };
  }
  // conector equivocado
  if (p.conectorMalo === "First") {
    return {
      ...base,
      paso: 0,
      manchas: e.manchas + 1,
      calidad: Math.max(0, e.calidad - 20),
      fallas: e.fallas + 1,
      ultimo: { ok: false, efecto: `Al oír «First», ${receta.personaje} piensa que empiezas de nuevo: vacía todo y el avance vuelve a cero.`, regla: REGLA_FIRST },
    };
  }
  return {
    ...base,
    final: "temprano",
    calidad: Math.max(0, Math.min(e.calidad - 30, 55)),
    fallas: e.fallas + 1,
    ultimo: { ok: false, efecto: `Al oír «Finally», ${receta.personaje} cree que ya es el último paso y entrega lo que tenga: el resultado queda incompleto.`, regla: REGLA_FINALLY },
  };
}

/* ── Informe en voz pasiva ─────────────────────────────────────────────── */

export interface OpcionInforme {
  id: string;
  texto: string;
  correcta: boolean;
  regla: string;
}

export function opcionesInforme(receta: Receta, idx: number, turno: number): OpcionInforme[] {
  const p = receta.pasos[idx];
  if (!p) return [];
  const lista: OpcionInforme[] = [
    { id: "pas", texto: p.pasiva, correcta: true, regla: REGLA_PASIVA },
    { id: "mala", texto: p.pasivaMala, correcta: false, regla: "A la voz pasiva no le puede faltar el verbo to be (is/are) ni el participio: «is poured», no «is pour»." },
    { id: "act", texto: p.activa, correcta: false, regla: "Esa frase está en voz activa y nombra a quien actúa. El informe de un proceso pide pasiva: se habla de lo que recibe la acción." },
  ];
  return rotar(lista, idx + turno);
}

export function elegirInforme(e: Estado, o: OpcionInforme): Estado {
  if (o.correcta) {
    return { ...e, informe: e.informe + 1, turno: e.turno + 1, ultimo: { ok: true, efecto: "Informe aceptado: el paso queda registrado sin decir quién lo hizo.", regla: REGLA_PASIVA } };
  }
  return { ...e, informeFallas: e.informeFallas + 1, turno: e.turno + 1, ultimo: { ok: false, efecto: "El informe se devuelve para corregirlo.", regla: o.regla } };
}

export function listoParaInforme(receta: Receta, e: Estado): boolean {
  return e.final === "bien" && e.informe < receta.pasos.length;
}
