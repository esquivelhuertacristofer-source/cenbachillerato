/**
 * Simulador «La entrega del viernes» (LabKitHerramientas, kit-herramientas-digitales).
 *
 * Un equipo ficticio de tres (Dani, Ximena y Beto) prepara un informe de
 * Química. En cada etapa el alumno elige una categoría de herramienta y ve
 * cómo se mueven tres medidores: horas libres, calidad y colaboración. Todo es
 * una simulación con números inventados; no se nombra ninguna marca.
 */

export const HORAS_INICIO = 12;
export const CALIDAD_INICIO = 30;
export const COLAB_INICIO = 30;

export interface OpcionEtapa {
  id: string;
  titulo: string;
  icono: string;
  /** Lo que la herramienta hace, dicho por función. */
  hace: string;
  /** Horas que cuesta (puede ser 0). */
  horas: number;
  calidad: number;
  colab: number;
  mejor?: boolean;
  /** Lo que pasa en la historia después de elegirla. */
  pasa: string;
}

export interface EtapaEntrega {
  id: string;
  titulo: string;
  icono: string;
  situacion: string;
  opciones: OpcionEtapa[];
}

export const EQUIPO = {
  titulo: "El informe de Química del viernes",
  intro:
    "Dani, Ximena y Beto entregan un informe sobre concentración de disoluciones. Quedan 12 horas libres en total. Cada herramienta que elijas te cuesta o te ahorra tiempo, sube o baja la calidad y afecta cómo trabaja el equipo (simulación).",
  imagen: "equipo-mesa",
  imagenAlt: "",
};

export const ETAPAS: EtapaEntrega[] = [
  {
    id: "plan",
    titulo: "Repartir tareas y fechas",
    icono: "fa-people-group",
    situacion: "Ximena propone repartirse el trabajo, pero cada quien entiende fechas distintas.",
    opciones: [
      {
        id: "plan-cal",
        titulo: "Calendario compartido",
        icono: "fa-calendar-days",
        hace: "Pone cada entrega parcial en una fecha y avisa antes de que llegue el día.",
        horas: 0.5,
        calidad: 10,
        colab: 20,
        mejor: true,
        pasa: "Las cuatro entregas parciales quedan con fecha y responsable, y a cada quien le llega un aviso. Nadie pregunta «¿y eso para cuándo?».",
      },
      {
        id: "plan-notas",
        titulo: "Notas sueltas de cada quien",
        icono: "fa-note-sticky",
        hace: "Cada quien apunta sus pendientes en sus propias notas.",
        horas: 2,
        calidad: 0,
        colab: -15,
        pasa: "Tres listas distintas: Beto hizo la parte de Dani y Ximena creyó que la entrega era el jueves. Pierden dos horas aclarando.",
      },
      {
        id: "plan-pres",
        titulo: "Presentación del plan",
        icono: "fa-display",
        hace: "Arma diapositivas con el plan para mostrarlo al equipo.",
        horas: 3,
        calidad: 0,
        colab: 0,
        pasa: "El plan queda bonito, pero una diapositiva no avisa de nada ni cambia de fecha sola. Tres horas para algo que no era presentar.",
      },
    ],
  },
  {
    id: "fuentes",
    titulo: "Encontrar fuentes confiables",
    icono: "fa-magnifying-glass",
    situacion: "El informe necesita bibliografía que la maestra pueda comprobar.",
    opciones: [
      {
        id: "fuentes-acad",
        titulo: "Buscador académico y biblioteca digital",
        icono: "fa-book-open",
        hace: "Busca artículos y libros revisados por especialistas.",
        horas: 1.5,
        calidad: 25,
        colab: 0,
        mejor: true,
        pasa: "Encuentran cuatro artículos con autor, año y revisión. El informe ya no depende de «lo que dice una página».",
      },
      {
        id: "fuentes-general",
        titulo: "Primer resultado de un buscador general",
        icono: "fa-magnifying-glass",
        hace: "Toma el primer resultado de un buscador general y copia lo que parece útil.",
        horas: 0.5,
        calidad: -10,
        colab: 0,
        pasa: "Rápido, pero el dato clave sale de un blog sin autor ni fecha. La maestra no podrá comprobarlo.",
      },
      {
        id: "fuentes-apuntes",
        titulo: "Apuntes de otro grupo",
        icono: "fa-copy",
        hace: "Pide los apuntes de alguien de otro grupo y los pega en el documento.",
        horas: 0.5,
        calidad: -5,
        colab: -5,
        pasa: "Los apuntes son de otro tema y no dicen de dónde salen. Pegar sin citar acerca el trabajo al plagio.",
      },
    ],
  },
  {
    id: "citas",
    titulo: "Registrar de dónde sale cada dato",
    icono: "fa-quote-right",
    situacion: "Ya hay cinco fuentes y se van a mezclar con lo que escriban.",
    opciones: [
      {
        id: "citas-reg",
        titulo: "Registro de referencias",
        icono: "fa-quote-right",
        hace: "Anota por cada fuente autor, título, año y liga.",
        horas: 0.5,
        calidad: 15,
        colab: 10,
        mejor: true,
        pasa: "Cada dato queda ligado a su fuente desde el principio. La bibliografía final se arma casi sola.",
      },
      {
        id: "citas-chat",
        titulo: "Ligas en el chat",
        icono: "fa-comments",
        hace: "Pega las ligas en el chat del equipo y ya.",
        horas: 1,
        calidad: -5,
        colab: 0,
        pasa: "Las ligas se pierden entre mensajes y stickers. Al final hay que buscarlas una por una.",
      },
      {
        id: "citas-memoria",
        titulo: "Acordarse después",
        icono: "fa-brain",
        hace: "No anota nada: «luego nos acordamos de dónde fue».",
        horas: 2.5,
        calidad: -15,
        colab: 0,
        pasa: "El viernes nadie recuerda qué dato salió de dónde. Se reconstruye a la carrera y dos citas quedan sin respaldo.",
      },
    ],
  },
  {
    id: "redactar",
    titulo: "Redactar el informe entre tres",
    icono: "fa-file-lines",
    situacion: "Hay que escribir las cuatro secciones y que se lea como un solo texto.",
    opciones: [
      {
        id: "red-comp",
        titulo: "Documento en línea compartido",
        icono: "fa-file-lines",
        hace: "Un documento en línea donde los tres escriben el mismo texto a la vez.",
        horas: 2,
        calidad: 15,
        colab: 25,
        mejor: true,
        pasa: "Los tres escriben a la vez y se ven los cambios. Ximena corrige un párrafo de Beto sin mandar archivos.",
      },
      {
        id: "red-correo",
        titulo: "Archivos por correo",
        icono: "fa-envelope",
        hace: "Cada quien escribe en su archivo y se los mandan por correo.",
        horas: 3,
        calidad: -5,
        colab: -20,
        pasa: "Llegan tres versiones: «informe_final», «informe_final2» y «informe_final_bueno». Pierden tiempo decidiendo cuál usar.",
      },
      {
        id: "red-hoja",
        titulo: "Hoja de cálculo",
        icono: "fa-table-cells",
        hace: "Escribe los párrafos en celdas de una hoja de cálculo.",
        horas: 3.5,
        calidad: -10,
        colab: -5,
        pasa: "Una hoja sirve para calcular, no para redactar: el texto se parte en celdas y no hay forma de darle formato de informe.",
      },
    ],
  },
  {
    id: "entrega",
    titulo: "Resguardar y entregar",
    icono: "fa-cloud-arrow-up",
    situacion: "Es jueves por la noche. El archivo tiene que estar a salvo hasta mañana.",
    opciones: [
      {
        id: "ent-nube",
        titulo: "Respaldo en la nube con versiones",
        icono: "fa-cloud-arrow-up",
        hace: "Guarda una copia fuera de la computadora, con historial de versiones.",
        horas: 0.5,
        calidad: 5,
        colab: 10,
        mejor: true,
        pasa: "Esa noche se descompone la laptop de Beto, y no pasa nada: el informe está en la nube y se puede volver a la versión de las 8.",
      },
      {
        id: "ent-una",
        titulo: "Una sola copia",
        icono: "fa-laptop",
        hace: "Deja la única copia en la computadora de Beto.",
        horas: 5,
        calidad: -20,
        colab: 0,
        pasa: "La computadora de Beto no enciende el viernes. Rehacen dos secciones de memoria y entregan agotados.",
      },
      {
        id: "ent-mensaje",
        titulo: "Archivo por mensaje",
        icono: "fa-paper-plane",
        hace: "Se mandan el archivo por mensaje, «por si acaso».",
        horas: 1,
        calidad: -5,
        colab: -5,
        pasa: "Hay copias sueltas en tres teléfonos, cada una de una hora distinta. Nadie sabe cuál es la última.",
      },
    ],
  },
];

export interface Aplicada {
  etapa: string;
  opcion: string;
}

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/** Medidores a partir de las opciones aplicadas. */
export function medidores(aplicadas: Aplicada[]) {
  let horas = HORAS_INICIO;
  let calidad = CALIDAD_INICIO;
  let colab = COLAB_INICIO;
  for (const a of aplicadas) {
    const op = ETAPAS.find((e) => e.id === a.etapa)?.opciones.find((o) => o.id === a.opcion);
    if (!op) continue;
    horas -= op.horas;
    calidad += op.calidad;
    colab += op.colab;
  }
  return { horas: clamp(Math.round(horas * 10) / 10, 0, HORAS_INICIO), calidad: clamp(calidad, 0, 100), colab: clamp(colab, 0, 100) };
}

/** Calificación simulada 5–10 y si llegaron a tiempo. */
export function resultadoFinal(m: { horas: number; calidad: number; colab: number }) {
  const base = (m.calidad * 0.6 + m.colab * 0.4) / 100;
  const nota = Math.round((5 + base * 5) * 10) / 10;
  return { nota, aTiempo: m.horas > 0 };
}
