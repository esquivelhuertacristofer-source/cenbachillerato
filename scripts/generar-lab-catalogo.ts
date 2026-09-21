/**
 * Regenera src/lib/practicas/lab-catalogo.ts desde el registro de metadatos.
 *
 * POR QUE EXISTE: el catalogo es un espejo de PRACTICAS_META, sin componentes,
 * para que la pagina de listado no arrastre three.js. Se genera, no se edita.
 * El generador anterior era efimero y se perdio, y el espejo se quedo en 95
 * entradas mientras el registro llegaba a 211: 116 laboratorios se mostraban
 * con el slug embellecido ("Adn Dogma Central 3d") en /hub/recursos/laboratorios.
 * Este guion es permanente para que no vuelva a pasar.
 *
 *   npx tsx scripts/generar-lab-catalogo.ts
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { PRACTICAS_META } from "../src/components/practicas/registry-meta";

const DESTINO = resolve(process.cwd(), "src/lib/practicas/lab-catalogo.ts");

const cita = (s: string) => JSON.stringify(s);

const entradas = Object.keys(PRACTICAS_META)
  .sort()
  .map((slug) => {
    const m = PRACTICAS_META[slug]!;
    const desc = m.descripcion ? `\n    descripcion: ${cita(m.descripcion)},` : "";
    return `  ${cita(slug)}: {\n    slug: ${cita(m.slug)},\n    titulo: ${cita(m.titulo)},${desc}\n  },`;
  })
  .join("\n");

const salida = `/**
 * Catálogo de laboratorios — datos puros (slug, título, descripción), SIN
 * componentes three.js. Seguro para importar en páginas de listado sin inflar
 * el bundle. Es un espejo de los metadatos de registry-meta.ts.
 *
 * AUTO-GENERADO. NO EDITAR A MANO. Para regenerar:
 *   npx tsx scripts/generar-lab-catalogo.ts
 */

export interface LabCatalogoItem {
  slug: string;
  titulo: string;
  descripcion?: string;
}

export const LAB_CATALOGO: Record<string, LabCatalogoItem> = {
${entradas}
};

/** Nombre limpio del lab, sin el prefijo del tipo de laboratorio. */
export function nombreLab(slug: string): string {
  const t = LAB_CATALOGO[slug]?.titulo;
  if (!t) return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return t.replace(/^Laboratorio(\s+\w+)?\s*[—-]\s*/u, "").trim();
}
`;

writeFileSync(DESTINO, salida, "utf8");
console.log(`lab-catalogo.ts regenerado con ${Object.keys(PRACTICAS_META).length} laboratorios.`);
