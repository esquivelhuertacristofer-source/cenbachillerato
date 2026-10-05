/**
 * El fogón — simulador de narrativas-populares-lengua (LC-II-P03).
 * El alumno cuenta una leyenda propia (ficticia) de cuatro partes. Cada parte
 * tiene tres versiones: dos con un rasgo de la lengua oral y una escrita en
 * registro neutro. Un fogón con oyentes reacciona a cuántos rasgos orales
 * distintos usó. Datos puros.
 */
import type { Rasgo } from "./narrativas-populares-data";

export interface ParteFogon {
  id: number;
  etiqueta: string;
  icono: string;
  foto: string;
}

export const PARTES_FOGON: ParteFogon[] = [
  { id: 0, etiqueta: "Cómo empieza", icono: "fa-door-open", foto: "rancho-viejos" },
  { id: 1, etiqueta: "El camino", icono: "fa-person-walking", foto: "arriero-camino" },
  { id: 2, etiqueta: "La lumbre", icono: "fa-fire", foto: "cerro-lumbre" },
  { id: 3, etiqueta: "Cómo termina", icono: "fa-flag-checkered", foto: "regreso-casa" },
];

export interface VersionFogon {
  id: string;
  parte: number;
  texto: string;
  /** Rasgo de la lengua oral que contiene; null = registro escrito neutro. */
  rasgo: Rasgo | null;
  /** Por qué suena (o no) a voz. */
  porque: string;
}

export const VERSIONES_FOGON: VersionFogon[] = [
  { id: "p0a", parte: 0, rasgo: "apertura", texto: "Cuentan los viejitos del rancho que…", porque: "«Cuentan que…» es una fórmula de apertura: avisa que lo que sigue viene de oídas y llama al oyente." },
  { id: "p0b", parte: 0, rasgo: "hiperbole", texto: "Dicen que allá, hace un chorro de años…", porque: "«Un chorro de años» exagera a propósito: la hipérbole le da peso y misterio al tiempo." },
  { id: "p0c", parte: 0, rasgo: null, texto: "En 1890, en una localidad del municipio, ocurrió que…", porque: "Fecha y lugar exactos suenan a acta, no a voz: nada llama al oyente ni marca que se cuente de memoria." },
  { id: "p1a", parte: 1, rasgo: "repeticion", texto: "Camina y camina el arriero, y el camino no se le acaba.", porque: "«Camina y camina» repite el verbo para medir el esfuerzo y el tiempo sin decirlos." },
  { id: "p1b", parte: 1, rasgo: "voz", texto: "Se llevó su mulita, su morral y un guaje de agua, y agarró por la milpa.", porque: "«Guaje» y «milpa» son voces del español de México (de lenguas originarias): la lengua del lugar donde se cuenta." },
  { id: "p1c", parte: 1, rasgo: null, texto: "El arriero se desplazó durante un tiempo prolongado por una zona agrícola.", porque: "Es correcto, pero abstracto: sin voces del lugar ni ritmo, nadie lo cuenta así en voz alta." },
  { id: "p2a", parte: 2, rasgo: "directo", texto: "Ve la lumbre y se queda quieto: ¿quién andará a estas horas? Pos quién ha de ser, la que cuida el cerro.", porque: "La voz del personaje entra sin comillas: en la oralidad la sostiene la entonación de quien cuenta." },
  { id: "p2b", parte: 2, rasgo: "tiempo", texto: "Y entonces aparece la lumbre en lo alto, y el hombre se queda quieto.", porque: "El presente («aparece») trae al ahora algo que ya pasó: así se mantiene la atención de quien escucha." },
  { id: "p2c", parte: 2, rasgo: null, texto: "Posteriormente observó una luz y se detuvo.", porque: "Pretérito plano y sin voz: informa, pero no hace sentir que alguien te lo está contando." },
  { id: "p3a", parte: 3, rasgo: "cierre", texto: "Y desde entonces, a quien se pierde la lumbre lo lleva a casa. Eso dicen; yo nomás lo cuento.", porque: "«Y desde entonces…» y «yo nomás lo cuento» son fórmulas de cierre: devuelven la palabra a la comunidad." },
  { id: "p3b", parte: 3, rasgo: "dicho", texto: "Y por eso se dice: quien va con lumbre no anda a oscuras.", porque: "Un dicho resume la enseñanza sin explicarla: la comunidad lo reconoce y no se puede reformular sin perderlo." },
  { id: "p3c", parte: 3, rasgo: null, texto: "En conclusión, la luz sirve para orientar a las personas.", porque: "Explica la moraleja como informe: quita la gracia del relato y no deja nada que repetir de boca en boca." },
];

export type EligeFogon = (string | null)[];

export function versionPorId(id: string | null): VersionFogon | null {
  return id ? VERSIONES_FOGON.find((v) => v.id === id) ?? null : null;
}

export interface LecturaFogon {
  llenas: number;
  /** Rasgos orales DISTINTOS usados (repetir el mismo no suma). */
  distintos: Rasgo[];
  oyentes: number;
  /** 0 = papel neutro, 1 = voz de fogón. */
  voz: number;
  veredicto: string;
}

export function evaluarFogon(elige: EligeFogon): LecturaFogon {
  const vs = elige.map(versionPorId);
  const llenas = vs.filter(Boolean).length;
  const distintos = Array.from(new Set(vs.flatMap((v) => (v && v.rasgo ? [v.rasgo] : []))));
  const oyentes = distintos.length;
  const voz = llenas === 0 ? 0 : oyentes / llenas;
  let veredicto: string;
  if (llenas < 4) veredicto = "Faltan partes: el fogón solo se llena con la leyenda completa.";
  else if (oyentes === 4) veredicto = "Cuatro rasgos orales distintos: el fogón está lleno y la leyenda suena a voz.";
  else if (oyentes === 0) veredicto = "Todo en registro neutro: se entiende, pero nadie se acerca a escuchar.";
  else veredicto = `${oyentes} de 4 partes suenan a voz: el fogón se calienta, pero aún hay frases de informe.`;
  return { llenas, distintos, oyentes, voz, veredicto };
}
