/**
 * Simulador del «Taller de párrafos» (LC-I-P04): lógica pura, sin React.
 *
 * El alumno arma un párrafo de cuatro posiciones (oración temática, dos de apoyo
 * y cierre) con tarjetas de oraciones y elige el conector que une cada posición
 * con la anterior. Un lector FICTICIO reacciona: su comprensión (0-100) sube o
 * baja según la estructura y los conectores. Las cifras son una simulación.
 *
 * La estructura (introducción → desarrollo → conclusión) y las tres relaciones de
 * los conectores (adición, contraste, causa-consecuencia) son las de la lectura A1.
 */
import type { Relacion } from "./tipos-parrafo-data";

export type Rol = "tema" | "apoyo" | "cierre" | "fuera";

export interface Tarjeta {
  id: string;
  texto: string;
  rol: Rol;
  /** Relación que expresa la idea frente a la oración anterior (conector ideal). */
  relacion: Relacion;
  /** Por qué sirve o no sirve (retroalimentación). */
  porque: string;
}

export interface TemaTaller {
  id: string;
  titulo: string;
  foto: string;
  tarjetas: Tarjeta[];
}

/** Rol que espera cada una de las 4 posiciones. */
export const POSICIONES: { rol: Rol; etiqueta: string; funcion: "introductorio" | "desarrollo" | "conclusion" }[] = [
  { rol: "tema", etiqueta: "Oración temática", funcion: "introductorio" },
  { rol: "apoyo", etiqueta: "Apoyo 1", funcion: "desarrollo" },
  { rol: "apoyo", etiqueta: "Apoyo 2", funcion: "desarrollo" },
  { rol: "cierre", etiqueta: "Cierre", funcion: "conclusion" },
];

export const CONECTOR_DE: Record<Relacion, string> = {
  adicion: "además",
  contraste: "sin embargo",
  causa: "por lo tanto",
};

export const TEMAS_TALLER: TemaTaller[] = [
  {
    id: "agua",
    titulo: "Cuidar el agua",
    foto: "tema-agua",
    tarjetas: [
      { id: "ag-tema", rol: "tema", relacion: "adicion", texto: "El agua dulce es limitada, y cuidarla en casa es más fácil de lo que parece.", porque: "Presenta el tema y anuncia de qué trata el párrafo." },
      { id: "ag-ad", rol: "apoyo", relacion: "adicion", texto: "Cerrar la llave mientras nos lavamos los dientes ahorra varios litros cada día.", porque: "Da un ejemplo concreto que respalda la idea principal." },
      { id: "ag-co", rol: "apoyo", relacion: "contraste", texto: "Mucha gente cree que un hilito de agua no importa, pero una fuga pequeña desperdicia treinta litros diarios.", porque: "Opone una creencia común al dato que la corrige." },
      { id: "ag-ca", rol: "apoyo", relacion: "causa", texto: "Las fugas se acumulan en el recibo, así que repararlas ahorra dinero.", porque: "Muestra una consecuencia directa de lo anterior." },
      { id: "ag-cierre", rol: "cierre", relacion: "causa", texto: "Con cambios pequeños y diarios, todos podemos cuidar el agua para el futuro.", porque: "Retoma la idea central y cierra sin abrir temas nuevos." },
      { id: "ag-nuevo", rol: "apoyo", relacion: "adicion", texto: "El agua embotellada ha subido de precio en los últimos años.", porque: "Es una idea de apoyo: como cierre abre un tema nuevo." },
      { id: "ag-f1", rol: "fuera", relacion: "adicion", texto: "Mi primo juega futbol los sábados por la tarde.", porque: "No tiene relación con el tema: rompe la unidad del párrafo." },
    ],
  },
  {
    id: "lectura",
    titulo: "Leer todos los días",
    foto: "tema-lectura",
    tarjetas: [
      { id: "le-tema", rol: "tema", relacion: "adicion", texto: "Leer unos minutos al día es un hábito sencillo con efectos muy notorios.", porque: "Presenta el tema y anticipa lo que se explicará." },
      { id: "le-ad", rol: "apoyo", relacion: "adicion", texto: "La lectura amplía el vocabulario porque nos expone a palabras nuevas en contexto.", porque: "Explica un beneficio concreto del hábito." },
      { id: "le-co", rol: "apoyo", relacion: "contraste", texto: "Muchos piensan que leer exige horas libres, pero bastan diez minutos constantes.", porque: "Contrasta un prejuicio con una solución realista." },
      { id: "le-ca", rol: "apoyo", relacion: "causa", texto: "Seguir un hilo de ideas entrena la concentración, y por eso se estudia mejor.", porque: "Enlaza una causa (concentrarse) con su efecto (estudiar mejor)." },
      { id: "le-cierre", rol: "cierre", relacion: "causa", texto: "Dedicar un rato diario a leer fortalece el pensamiento y vale la pena como costumbre.", porque: "Resume la idea central y cierra el texto." },
      { id: "le-nuevo", rol: "apoyo", relacion: "adicion", texto: "Las bibliotecas públicas prestan libros sin costo con una credencial.", porque: "Es información de apoyo: como cierre introduce una idea nueva." },
      { id: "le-f1", rol: "fuera", relacion: "adicion", texto: "La final del torneo de videojuegos será el próximo mes.", porque: "No se relaciona con el tema del párrafo." },
    ],
  },
];

export type EstadoLector = "vacio" | "perdido" | "confuso" | "sigue" | "entiende";

export const LECTOR_INFO: Record<EstadoLector, { etiqueta: string; frase: string; icono: string; color: string; foto: string }> = {
  vacio: { etiqueta: "Esperando", frase: "Coloca tarjetas y mira cómo reacciona el lector.", icono: "fa-face-meh", color: "#8FA3BF", foto: "lector-sigue" },
  perdido: { etiqueta: "Perdido", frase: "No sé de qué trata este texto.", icono: "fa-face-dizzy", color: "#FF5E5E", foto: "lector-perdido" },
  confuso: { etiqueta: "Confuso", frase: "Hay ideas, pero no veo cómo se conectan.", icono: "fa-face-frown-open", color: "#F2A33C", foto: "lector-confuso" },
  sigue: { etiqueta: "Te sigue", frase: "Voy entendiendo; aún tropiezo en algún punto.", icono: "fa-face-smile", color: "#5BA8FF", foto: "lector-sigue" },
  entiende: { etiqueta: "Entiende todo", frase: "Claro: tema, apoyo y cierre bien enlazados.", icono: "fa-face-grin-stars", color: "#34D399", foto: "lector-entiende" },
};

export type Marca = "ok" | "mal" | "vacio";

export interface Evaluacion {
  /** 0-100, simulación. */
  comprension: number;
  completo: boolean;
  estado: EstadoLector;
  /** Estado de cada posición para el diagrama de estructura. */
  posiciones: Marca[];
  /** Estado de cada conector (posiciones 1..3). */
  enlaces: Marca[];
  /** Explicaciones, la más grave primero. */
  notas: string[];
  hayFuera: boolean;
}

/**
 * slots: id de la tarjeta en cada posición (o null). conectores: relación elegida
 * para las posiciones 1..3 (o null = sin conector).
 */
export function evaluarParrafo(tema: TemaTaller, slots: (string | null)[], conectores: (Relacion | null)[]): Evaluacion {
  let pts = 0;
  const notas: string[] = [];
  const graves: string[] = [];
  const posiciones: Marca[] = [];
  const enlaces: Marca[] = [];
  let hayFuera = false;

  POSICIONES.forEach((pos, i) => {
    const t = tema.tarjetas.find((x) => x.id === slots[i]);
    if (!t) {
      posiciones.push("vacio");
      if (i > 0) enlaces.push("vacio");
      return;
    }
    let ok = false;
    if (t.rol === "fuera") {
      hayFuera = true;
      pts -= 15;
      graves.push("Una oración fuera de tema hace que el lector pierda el hilo.");
    } else if (pos.rol === t.rol) {
      ok = true;
      pts += i === 0 || i === 3 ? 20 : 15;
    } else if (pos.rol === "cierre" && t.rol === "apoyo") {
      pts += 5;
      notas.push("Un cierre no debe traer ideas nuevas: retoma lo ya dicho.");
    } else if (pos.rol === "tema") {
      pts -= 10;
      graves.push("Sin oración temática al inicio, el lector no sabe de qué trata el párrafo.");
    } else {
      notas.push(t.rol === "tema" ? "Repetir la presentación del tema en medio frena el desarrollo." : "Cerrar a la mitad deja el párrafo sin desarrollo.");
    }
    posiciones.push(ok ? "ok" : "mal");
    if (i > 0) {
      const c = conectores[i - 1] ?? null;
      if (t.rol === "fuera") {
        enlaces.push("mal");
      } else if (c === null) {
        pts += 3;
        enlaces.push("mal");
        notas.push("Sin conector, las ideas quedan sueltas: se entiende, pero cuesta más.");
      } else if (c === t.relacion) {
        pts += 10;
        enlaces.push("ok");
      } else {
        pts -= 10;
        enlaces.push("mal");
        graves.push(
          `El conector «${CONECTOR_DE[c]}» no encaja: esta idea ${t.relacion === "adicion" ? "suma a la anterior" : t.relacion === "contraste" ? "se opone a la anterior" : "es consecuencia de la anterior"}.`
        );
      }
    }
  });

  const llenos = slots.filter((s) => s !== null).length;
  const completo = llenos === POSICIONES.length;
  const comprension = Math.max(0, Math.min(100, pts));
  let estado: EstadoLector;
  if (llenos === 0) estado = "vacio";
  else if (comprension < 30) estado = "perdido";
  else if (comprension < 55) estado = "confuso";
  else if (comprension >= 80 && completo) estado = "entiende";
  else estado = "sigue";

  if (completo && notas.length + graves.length === 0) notas.push("Todo en su lugar: el lector avanza sin tropiezos.");
  return { comprension, completo, estado, posiciones, enlaces, notas: [...graves, ...notas], hayFuera };
}

/** Une las tarjetas y conectores en el párrafo que el alumno ve armado. */
export function textoParrafo(tema: TemaTaller, slots: (string | null)[], conectores: (Relacion | null)[]): string {
  const partes: string[] = [];
  slots.forEach((id, i) => {
    const t = tema.tarjetas.find((x) => x.id === id);
    if (!t) return;
    const c = i > 0 ? (conectores[i - 1] ?? null) : null;
    if (c) {
      const cn = CONECTOR_DE[c];
      partes.push(`${cn.charAt(0).toUpperCase()}${cn.slice(1)}, ${t.texto.charAt(0).toLowerCase()}${t.texto.slice(1)}`);
    } else partes.push(t.texto);
  });
  return partes.join(" ");
}
