/**
 * Simulador del Laboratorio — Diversidad cultural, organización social y
 * discriminación (CS-II-P02).
 *
 * Lógica pura (sin React). Es la secundaria «Los Cedros», una escuela
 * FICTICIA; todos los personajes son inventados y las cifras del medidor de
 * convivencia son valores de juego («simulación»). Siete escenas cotidianas:
 * en cada una el alumno decide (1) si hay discriminación o una forma de
 * organización social, (2) de qué tipo, según las definiciones del propio
 * laboratorio (subordinación, exclusión, dominación, racismo) y (3) qué
 * responder. El medidor de convivencia cambia con cada decisión.
 *
 * Las explicaciones usan las definiciones verbatim del glosario A5 y de la
 * actividad A4 de la progresión; las situaciones se describen sin
 * caricaturas ni insultos.
 */

export type Tipo = "organizacion" | "exclusion" | "subordinacion" | "dominacion" | "racismo";

export const TIPOS: { id: Exclude<Tipo, "organizacion">; nombre: string; icono: string; def: string }[] = [
  { id: "exclusion", nombre: "Exclusión", icono: "fa-door-closed", def: "Se impide a alguien participar plenamente." },
  { id: "subordinacion", nombre: "Subordinación", icono: "fa-arrow-down-wide-short", def: "Un grupo queda en posición inferior." },
  { id: "dominacion", nombre: "Dominación", icono: "fa-crown", def: "Un grupo impone su voluntad y controla." },
  { id: "racismo", nombre: "Racismo", icono: "fa-ban", def: "Se considera superiores a unas personas por su origen o color de piel." },
];

export type TonoResp = "bien" | "regular" | "mal";

export interface Respuesta {
  id: string;
  texto: string;
  delta: number;
  tono: TonoResp;
  /** Cómo reacciona el personaje de la escena. */
  reaccion: string;
  /** Por qué esta respuesta ayuda o no a la convivencia. */
  porque: string;
}

export interface Escena {
  id: string;
  titulo: string;
  foto: string;
  icono: string;
  /** Personaje central (ficticio). */
  personaje: string;
  relato: string;
  correcto: Tipo;
  porque: string;
  respuestas: Respuesta[];
}

export const ESCENAS: Escena[] = [
  {
    id: "tequio",
    titulo: "Pintar el salón",
    foto: "tequio-salon",
    icono: "fa-paint-roller",
    personaje: "Ximena",
    relato: "El grupo de 2.º B decide pintar juntos el salón un sábado. Cada quien trae algo, se turnan las tareas y todas y todos opinan sobre los colores.",
    correcto: "organizacion",
    porque: "Es una forma de organización comunitaria: las personas de una comunidad se agrupan y cooperan para resolver asuntos comunes, como en una asamblea o un tequio. Nadie queda fuera, así que no hay discriminación.",
    respuestas: [
      { id: "a", texto: "Sumarme y proponer turnos para que todas y todos participen", delta: 10, tono: "bien", reaccion: "Ximena sonríe: «Así avanzamos entre todos».", porque: "Cooperar y repartir las tareas fortalece la organización y la confianza del grupo." },
      { id: "b", texto: "Mirar desde lejos: no es asunto mío", delta: -3, tono: "regular", reaccion: "Emiliano se encoge de hombros: falta una mano.", porque: "No hay daño, pero una comunidad se sostiene con la participación de quienes la forman." },
      { id: "c", texto: "Decir que organizarse es perder el tiempo", delta: -8, tono: "mal", reaccion: "El grupo se desanima y varias personas dejan de colaborar.", porque: "Desvalorizar la cooperación debilita el capital social: las redes de confianza que resuelven problemas colectivos." },
    ],
  },
  {
    id: "futbol",
    titulo: "El equipo del recreo",
    foto: "patio-futbol",
    icono: "fa-futbol",
    personaje: "Citlali",
    relato: "En el recreo, el equipo de futbol le dice a Citlali, que habla náhuatl con su familia, que no puede jugar «porque no es de aquí». A otras compañeras no les preguntaron nada.",
    correcto: "exclusion",
    porque: "Es exclusión: a una persona se le impide participar plenamente por su origen. La discriminación es un trato desigual e injusto por características como el origen, y la exclusión es una de las formas en que opera.",
    respuestas: [
      { id: "a", texto: "Proponer que las reglas sean iguales para todas y todos e invitarla a jugar", delta: 14, tono: "bien", reaccion: "Citlali se une al juego y el equipo se queda pensando.", porque: "Reglas iguales para todas las personas corrigen el trato desigual y reconocen la diversidad cultural como parte del grupo." },
      { id: "b", texto: "No meterme: seguro se arregla solo", delta: -4, tono: "regular", reaccion: "Citlali se va a la biblioteca sin decir nada.", porque: "Callar deja que la exclusión continúe: sin alguien que la nombre, no cambia." },
      { id: "c", texto: "Decirle que mejor busque otro lugar", delta: -10, tono: "mal", reaccion: "Citlali baja la mirada y deja de venir al recreo.", porque: "Repetir la exclusión la refuerza y daña su acceso a participar en la escuela." },
    ],
  },
  {
    id: "apodos",
    titulo: "Apodos en el pasillo",
    foto: "pasillo-grupo",
    icono: "fa-comments",
    personaje: "Dani",
    relato: "Un grupo se ríe de Dani y le pone apodos por el tono de su piel. Dani ya no se sienta cerca de nadie y evita el pasillo.",
    correcto: "racismo",
    porque: "Es racismo: una forma de discriminación que considera superiores a unas personas sobre otras por su origen étnico o color de piel. Las burlas o la exclusión por el tono de piel afectan el acceso a derechos y oportunidades.",
    respuestas: [
      { id: "a", texto: "Acercarme a Dani, decir que eso no es un chiste y avisar a mi tutora", delta: 14, tono: "bien", reaccion: "Dani respira y vuelve a sentarse con el grupo.", porque: "Acompañar a quien recibe la burla y pedir apoyo adulto detiene el daño y rompe el silencio." },
      { id: "b", texto: "Cambiar de tema para no pelearme", delta: -4, tono: "regular", reaccion: "Dani se queda solo y las burlas siguen.", porque: "Evitar el conflicto es comprensible, pero la burla continúa sin que nadie la cuestione." },
      { id: "c", texto: "Reírme una vez para que no me hagan lo mismo", delta: -12, tono: "mal", reaccion: "Dani se siente aún más solo y la burla se hace más fuerte.", porque: "Sumarse a la burla la normaliza y le da más fuerza al racismo." },
    ],
  },
  {
    id: "tareas",
    titulo: "Quién limpia el salón",
    foto: "salon-limpieza",
    icono: "fa-broom",
    personaje: "Ana",
    relato: "Cada semana el profesor de turno encarga a las niñas limpiar el salón mientras los niños salen a jugar, «porque así siempre ha sido». Ana pregunta por qué y le piden que no pregunte.",
    correcto: "subordinacion",
    porque: "Es subordinación: un grupo queda en una posición inferior y recibe cargas distintas por su género. La subordinación, la exclusión y la dominación son manifestaciones de la discriminación.",
    respuestas: [
      { id: "a", texto: "Proponer una lista de turnos que rote entre todas y todos", delta: 14, tono: "bien", reaccion: "Ana sonríe: por fin el trabajo se reparte parejo.", porque: "Repartir las tareas por igual corrige la desigualdad sin señalar a nadie." },
      { id: "b", texto: "Hacer la tarea en silencio para no meterme en problemas", delta: -3, tono: "regular", reaccion: "Ana limpia, pero ya no pregunta nada.", porque: "Aceptar sin cuestionar mantiene la desigualdad aunque no haya mala intención." },
      { id: "c", texto: "Decir que a las niñas les toca porque es lo normal", delta: -12, tono: "mal", reaccion: "Ana se siente menos valorada y deja de participar.", porque: "Dar por natural una desigualdad refuerza el estereotipo y la subordinación." },
    ],
  },
  {
    id: "asamblea",
    titulo: "La asamblea del grupo",
    foto: "asamblea-grupo",
    icono: "fa-people-group",
    personaje: "Mateo",
    relato: "En la asamblea del grupo, cinco estudiantes deciden todas las reglas y no dejan hablar a quienes piensan distinto. Las propuestas de Mateo y de otras personas ni se anotan.",
    correcto: "dominacion",
    porque: "Es dominación: un grupo impone su voluntad y controla las decisiones sin escuchar a las demás personas. Junto con la subordinación y la exclusión, es una manifestación de la discriminación.",
    respuestas: [
      { id: "a", texto: "Pedir turnos de palabra y que se anoten todas las propuestas", delta: 14, tono: "bien", reaccion: "Mateo puede hablar y la asamblea recupera su sentido.", porque: "Dar voz a todas las personas devuelve la asamblea a su función: decidir entre quienes forman la comunidad." },
      { id: "b", texto: "Aceptar en silencio todo lo que digan", delta: -4, tono: "regular", reaccion: "Mateo guarda su propuesta en la mochila.", porque: "Callar permite que unas pocas personas sigan decidiendo por todas." },
      { id: "c", texto: "Imponer yo también mi propia regla", delta: -10, tono: "mal", reaccion: "La asamblea se convierte en un pleito y nadie escucha a nadie.", porque: "Responder con más imposición no corrige la dominación: la reproduce." },
    ],
  },
  {
    id: "biblioteca",
    titulo: "La biblioteca con escaleras",
    foto: "biblioteca-escaleras",
    icono: "fa-book-open",
    personaje: "Emiliano",
    relato: "La biblioteca de la secundaria solo tiene escaleras. Emiliano usa silla de ruedas y no puede entrar a consultar libros ni a las actividades que se hacen allí.",
    correcto: "exclusion",
    porque: "Es exclusión social: un proceso por el cual se impide a ciertas personas participar plenamente en la sociedad, como cuando no hay acceso a un servicio. Aunque nadie lo diga con palabras, produce desigualdad en el acceso a derechos.",
    respuestas: [
      { id: "a", texto: "Pedir al consejo escolar una rampa y, mientras, llevarle los libros al patio", delta: 14, tono: "bien", reaccion: "Emiliano sonríe: ya puede leer con el grupo.", porque: "Resolver el acceso de fondo y apoyar mientras tanto atiende el derecho a participar." },
      { id: "b", texto: "Esperar a que algún día lo arreglen", delta: -4, tono: "regular", reaccion: "Emiliano sigue sin poder entrar y deja de pedir libros.", porque: "Sin una petición concreta, el problema de acceso no se resuelve." },
      { id: "c", texto: "Decirle que mejor no vaya a la biblioteca", delta: -10, tono: "mal", reaccion: "Emiliano se siente fuera de la escuela.", porque: "Pedir a la persona que se ajuste a la barrera la deja afuera." },
    ],
  },
  {
    id: "comite",
    titulo: "El comité por el agua",
    foto: "comite-firmas",
    icono: "fa-faucet-drip",
    personaje: "Ximena",
    relato: "Un grupo de estudiantes forma un comité y reúne firmas para pedir bebederos de agua potable en la escuela. Cualquiera puede unirse y todas las opiniones se anotan.",
    correcto: "organizacion",
    porque: "Es una forma de organización social: una acción colectiva y flexible, como un movimiento social, para transformar algo común. Todas las personas pueden participar y nadie queda fuera.",
    respuestas: [
      { id: "a", texto: "Unirme al comité y sumar firmas", delta: 10, tono: "bien", reaccion: "El comité crece y el director recibe la petición con 200 firmas (simulación).", porque: "La participación fortalece la acción colectiva y la confianza entre quienes la forman." },
      { id: "b", texto: "Opinar desde fuera sin participar", delta: -2, tono: "regular", reaccion: "El comité sigue, con una persona menos.", porque: "Opinar sin sumarse aporta poco a una acción colectiva." },
      { id: "c", texto: "Pedirles que dejen de hacerlo", delta: -8, tono: "mal", reaccion: "El comité se desanima y se disuelve.", porque: "Desalentar la organización estudiantil debilita la participación y las redes de confianza." },
    ],
  },
];

/* ── Medidor de convivencia (simulación) ─────────────────────────────── */

export const CONV_INICIO = 40;
export const CONV_META = 75;

export interface Juicio {
  /** ¿Dijo que hay discriminación? */
  discr: boolean;
  /** Tipo elegido (solo si dijo que hay discriminación y la escena lo es). */
  tipo?: Tipo;
  /** Respuesta elegida. */
  resp?: string;
}

export type Juicios = Record<string, Juicio>;

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function esDiscriminacion(e: Escena): boolean {
  return e.correcto !== "organizacion";
}

/** Cambio en la convivencia por identificar bien o mal. */
export function deltaIdentificar(e: Escena, discr: boolean): number {
  const real = esDiscriminacion(e);
  if (discr === real) return 4;
  // Pasar por alto una discriminación pesa más que ver una donde no la hay.
  return real ? -8 : -6;
}

export function deltaTipo(e: Escena, tipo: Tipo): number {
  return tipo === e.correcto ? 6 : -2;
}

export function deltaResp(e: Escena, id: string): number {
  return e.respuestas.find((r) => r.id === id)?.delta ?? 0;
}

export function convivencia(juicios: Juicios): number {
  let c = CONV_INICIO;
  for (const e of ESCENAS) {
    const j = juicios[e.id];
    if (!j) continue;
    c += deltaIdentificar(e, j.discr);
    if (j.tipo) c += deltaTipo(e, j.tipo);
    if (j.resp) c += deltaResp(e, j.resp);
  }
  return clamp(c);
}

/** ¿Qué paso toca en una escena? */
export type Paso = "identificar" | "tipo" | "responder" | "hecha";

export function pasoDe(e: Escena, j: Juicio | undefined): Paso {
  if (!j) return "identificar";
  if (j.discr && esDiscriminacion(e) && !j.tipo) return "tipo";
  if (!j.resp) return "responder";
  return "hecha";
}

export function estadoAnimo(c: number): "bien" | "regular" | "mal" {
  return c >= 70 ? "bien" : c >= 40 ? "regular" : "mal";
}

export const PERSONAJES = ["Citlali", "Mateo", "Dani", "Ana", "Ximena", "Emiliano"];
