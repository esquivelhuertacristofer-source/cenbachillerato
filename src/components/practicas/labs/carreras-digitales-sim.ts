/**
 * Modelo del SIMULADOR «Ruta de Ximena» (lab «carreras-digitales»).
 *
 * Ximena es una estudiante FICTICIA. Los niveles de habilidad (0-10) y lo que
 * pide cada perfil son valores de SIMULACIÓN para aprender que el campo digital
 * es amplio; no son requisitos reales de ninguna empresa. Los ocho perfiles son
 * los que enumera la infografía A1 de la progresión (ver carreras-digitales-data).
 *
 * Es DETERMINISTA: en cada uno de los cuatro semestres se elige una actividad;
 * cada una suma puntos a algunas habilidades; un perfil se «ilumina» cuando
 * TODAS las habilidades que pide alcanzan su nivel.
 */

export type Hab = "prog" | "datos" | "seg" | "dis" | "com" | "eq";

export const HABS: { id: Hab; nombre: string; icono: string }[] = [
  { id: "prog", nombre: "Programar", icono: "fa-code" },
  { id: "datos", nombre: "Datos", icono: "fa-chart-column" },
  { id: "seg", nombre: "Seguridad", icono: "fa-shield-halved" },
  { id: "dis", nombre: "Diseño", icono: "fa-pen-ruler" },
  { id: "com", nombre: "Comunicar", icono: "fa-bullhorn" },
  { id: "eq", nombre: "Equipo y criterio", icono: "fa-people-group" },
];

export const NIVEL_MAX = 10;

/** De dónde parte Ximena: le gusta dibujar y organizar eventos. */
export const INICIO: Record<Hab, number> = { prog: 0, datos: 1, seg: 0, dis: 2, com: 2, eq: 1 };

export interface Actividad {
  id: string;
  titulo: string;
  detalle: string;
  icono: string;
  tipo: "Curso" | "Proyecto" | "Comunidad" | "Práctica";
  aporta: Partial<Record<Hab, number>>;
  porque: string;
}

export interface Semestre {
  id: string;
  titulo: string;
  contexto: string;
  foto: string;
  actividades: Actividad[];
}

export const SEMESTRES: Semestre[] = [
  {
    id: "s3",
    titulo: "3.º semestre",
    contexto: "La escuela abre talleres optativos y Ximena solo puede tomar uno.",
    foto: "aula-computo",
    actividades: [
      { id: "s3-python", titulo: "Taller de programación", detalle: "Aprende lógica y sus primeros programas en Python.", icono: "fa-code", tipo: "Curso", aporta: { prog: 3, datos: 1 }, porque: "Programar es la base de desarrollo, datos e IA, y se puede empezar en el bachillerato." },
      { id: "s3-interfaz", titulo: "Rediseñar la app del comedor", detalle: "Proyecto de equipo: hacer más fácil de usar una app escolar (ficticia).", icono: "fa-pen-ruler", tipo: "Proyecto", aporta: { dis: 3, com: 1, eq: 1 }, porque: "Diseñar interfaces es UX/UI: no pide programar y es el perfil con más mujeres del sector (~40 %, dato A1)." },
      { id: "s3-cuenta", titulo: "Llevar la cuenta de la escuela", detalle: "Club de comunicación: planear y publicar contenido de la comunidad.", icono: "fa-bullhorn", tipo: "Proyecto", aporta: { com: 3, dis: 1 }, porque: "Gestionar una comunidad en línea es práctica real de community manager y de marketing digital." },
      { id: "s3-seguridad", titulo: "Curso de seguridad personal", detalle: "Contraseñas, phishing y privacidad, en una plataforma abierta.", icono: "fa-lock", tipo: "Curso", aporta: { seg: 3, prog: 1 }, porque: "La ciberseguridad protege sistemas y personas; empezar por lo cotidiano abre el camino." },
    ],
  },
  {
    id: "s4",
    titulo: "4.º semestre",
    contexto: "Llega el momento de un proyecto más grande, de varias semanas.",
    foto: "mesa-trabajo",
    actividades: [
      { id: "s4-datos", titulo: "Analizar el ausentismo escolar", detalle: "Proyecto con datos ficticios del plantel: buscar patrones y proponer ideas.", icono: "fa-chart-column", tipo: "Proyecto", aporta: { datos: 3, prog: 1, com: 1 }, porque: "Es ciencia de datos aplicada: analizar para decidir con evidencia." },
      { id: "s4-web", titulo: "Bootcamp de desarrollo web", detalle: "Cuatro meses para construir sitios completos.", icono: "fa-laptop-code", tipo: "Curso", aporta: { prog: 4 }, porque: "Los bootcamps son una ruta no lineal habitual para llegar a desarrollo, sin título universitario." },
      { id: "s4-hackaton", titulo: "Hackatón escolar en equipo", detalle: "Un fin de semana para resolver un reto con otras personas.", icono: "fa-people-group", tipo: "Proyecto", aporta: { eq: 3, prog: 1, dis: 1 }, porque: "Trabajar en equipo y pensar con criterio pesa tanto como la técnica: casi todo producto digital se hace entre muchas personas." },
      { id: "s4-hacker", titulo: "Taller de hacking ético", detalle: "Aprender a detectar vulnerabilidades antes que los atacantes.", icono: "fa-user-secret", tipo: "Curso", aporta: { seg: 3, prog: 1 }, porque: "Las pruebas de penetración son parte del trabajo de ciberseguridad." },
    ],
  },
  {
    id: "s5",
    titulo: "5.º semestre",
    contexto: "Ximena ya sabe qué le gusta y quiere profundizar.",
    foto: "pasillo-campus",
    actividades: [
      { id: "s5-datos", titulo: "Curso de ciencia de datos", detalle: "Estadística y programación para extraer información.", icono: "fa-chart-line", tipo: "Curso", aporta: { datos: 3, prog: 1 }, porque: "Combina estadística, programación y conocimiento del tema, como define el glosario." },
      { id: "s5-mkt", titulo: "Prácticas de marketing digital", detalle: "Ayudar a una papelería local (ficticia) a darse a conocer.", icono: "fa-store", tipo: "Práctica", aporta: { com: 3, datos: 1 }, porque: "Medir qué publicaciones funcionan mezcla comunicación y datos." },
      { id: "s5-circulo", titulo: "Círculo de mujeres en tecnología", detalle: "Mentoría y comunidad con profesionales como referentes.", icono: "fa-hands-holding-circle", tipo: "Comunidad", aporta: { eq: 2, prog: 1, com: 1 }, porque: "La brecha de género nace de estereotipos y falta de referentes; las comunidades ayudan a cerrarla." },
      { id: "s5-portafolio", titulo: "Portafolio de diseño UX", detalle: "Tres casos de estudio publicados en línea.", icono: "fa-bezier-curve", tipo: "Proyecto", aporta: { dis: 3, com: 1 }, porque: "Un portafolio vale tanto como un título en el sector digital." },
    ],
  },
  {
    id: "s6",
    titulo: "6.º semestre",
    contexto: "Último semestre: el proyecto que Ximena pondrá en su portafolio.",
    foto: "ventana-atardecer",
    actividades: [
      { id: "s6-ia", titulo: "Proyecto integrador con IA", detalle: "Una app pequeña que aprende de datos.", icono: "fa-robot", tipo: "Proyecto", aporta: { prog: 2, datos: 2, eq: 1 }, porque: "La IA exige a la vez programación y datos." },
      { id: "s6-nube", titulo: "Certificación básica en la nube", detalle: "Una certificación accesible de infraestructura.", icono: "fa-cloud", tipo: "Curso", aporta: { seg: 2, prog: 2, eq: 1 }, porque: "Administrar la nube pide seguridad, algo de programación y trabajo con otras personas." },
      { id: "s6-ong", titulo: "Campaña digital para una ONG", detalle: "Planear y medir una campaña para una asociación local (ficticia).", icono: "fa-hand-holding-heart", tipo: "Práctica", aporta: { com: 3, dis: 1, datos: 1 }, porque: "Comunicación, diseño y un poco de análisis: marketing digital completo." },
      { id: "s6-estudio", titulo: "Pasantía en un estudio de diseño", detalle: "Trabajar con un equipo real en un producto digital.", icono: "fa-swatchbook", tipo: "Práctica", aporta: { dis: 3, eq: 1, com: 1 }, porque: "Aprender el oficio al lado de profesionales consolida el diseño." },
    ],
  },
];

export interface Rol {
  /** Mismo id que en PERFILES de carreras-digitales-data. */
  id: string;
  nombre: string;
  icono: string;
  /** Id en FUNCIONES con el dato de mercado verbatim, si existe. */
  funcion?: string;
  requiere: Partial<Record<Hab, number>>;
  /** Qué hace: una línea en lenguaje del alumno. */
  hace: string;
}

export const ROLES: Rol[] = [
  { id: "pe-dev", nombre: "Desarrollo de software", icono: "fa-laptop-code", funcion: "fn-dev", requiere: { prog: 6, eq: 3 }, hace: "Construye el software; programar y trabajar en equipo." },
  { id: "pe-uxui", nombre: "Diseño UX/UI", icono: "fa-pen-ruler", funcion: "fn-uxui", requiere: { dis: 6, com: 3 }, hace: "Diseña interfaces intuitivas; diseño y comunicar ideas." },
  { id: "pe-datos", nombre: "Ciencia de datos", icono: "fa-chart-column", funcion: "fn-datos", requiere: { datos: 6, prog: 3 }, hace: "Analiza datos para decidir; datos y algo de programación." },
  { id: "pe-ia", nombre: "Inteligencia artificial", icono: "fa-robot", requiere: { datos: 5, prog: 5 }, hace: "Crea sistemas que aprenden; datos y programación a la par." },
  { id: "pe-ciber", nombre: "Ciberseguridad", icono: "fa-shield-halved", funcion: "fn-ciber", requiere: { seg: 6, prog: 3 }, hace: "Protege sistemas y datos; seguridad y algo de código." },
  { id: "pe-cloud", nombre: "Administración de nube", icono: "fa-cloud", requiere: { seg: 4, prog: 4, eq: 2 }, hace: "Sostiene la infraestructura; seguridad, código y equipo." },
  { id: "pe-cm", nombre: "Community manager", icono: "fa-comments", requiere: { com: 6, dis: 3 }, hace: "Cuida la comunidad en línea; comunicar y diseño básico." },
  { id: "pe-mkt", nombre: "Marketing digital", icono: "fa-bullhorn", requiere: { com: 5, datos: 3, dis: 2 }, hace: "Difunde y mide campañas; comunicar y leer datos." },
];

export type Ruta = Partial<Record<string, string>>;

export function actividadDe(semestreId: string, id: string | undefined): Actividad | undefined {
  return SEMESTRES.find((s) => s.id === semestreId)?.actividades.find((a) => a.id === id);
}

/** Niveles de habilidad con la ruta elegida hasta ahora. */
export function habilidades(ruta: Ruta): Record<Hab, number> {
  const h: Record<Hab, number> = { ...INICIO };
  for (const s of SEMESTRES) {
    const a = actividadDe(s.id, ruta[s.id]);
    if (!a) continue;
    for (const k of Object.keys(a.aporta) as Hab[]) h[k] = Math.min(NIVEL_MAX, h[k] + (a.aporta[k] ?? 0));
  }
  return h;
}

export interface EstadoRol {
  abierto: boolean;
  /** Habilidades que aún no alcanzan. */
  faltan: { hab: Hab; tiene: number; pide: number }[];
  /** 0-1: qué tan cerca está. */
  avance: number;
}

export function estadoRol(rol: Rol, h: Record<Hab, number>): EstadoRol {
  const faltan: EstadoRol["faltan"] = [];
  let suma = 0;
  let total = 0;
  for (const k of Object.keys(rol.requiere) as Hab[]) {
    const pide = rol.requiere[k] ?? 0;
    suma += Math.min(h[k], pide);
    total += pide;
    if (h[k] < pide) faltan.push({ hab: k, tiene: h[k], pide });
  }
  return { abierto: faltan.length === 0, faltan, avance: total === 0 ? 1 : suma / total };
}

export function rolesAbiertos(h: Record<Hab, number>): Rol[] {
  return ROLES.filter((r) => estadoRol(r, h).abierto);
}

export function nombreHab(id: Hab): string {
  return HABS.find((x) => x.id === id)?.nombre ?? id;
}

/** Cuántos semestres ya tienen actividad. */
export function semestresHechos(ruta: Ruta): number {
  return SEMESTRES.filter((s) => !!actividadDe(s.id, ruta[s.id])).length;
}

/** Meta: la ruta ilumina al menos 3 perfiles. */
export const META_PERFILES = 3;
