"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { LAB_CATALOGO, nombreLab } from "@/lib/practicas/lab-catalogo";
import { LAB_UBICACION } from "@/lib/practicas/lab-ubicacion.generated";
import { mejorImagenDeLab } from "@/lib/practicas/lab-imagenes";

/* ──────────────────────────────────────────────────────────────
   TodosView — TODOS los laboratorios que existen en la plataforma.

   POR QUÉ EXISTE: la pestaña "Mi semestre" sale de la base de datos, de las
   actividades que apuntan a un laboratorio. Eso responde a "¿qué laboratorios
   le tocan a este alumno?", que no es lo mismo que "¿qué laboratorios hay?".
   Un laboratorio escrito y registrado pero todavía sin actividad que lo apunte
   no aparecía en ningún sitio: así estaban 70 de los 211.

   Esta vista lista el REGISTRO, que es donde consta qué existe, y abre cada uno
   por su propia ruta. El progreso es el mismo por las dos puertas, porque cada
   laboratorio guarda sus estrellas con una clave propia, no con la actividad.
   ────────────────────────────────────────────────────────────── */
export interface GrupoTodos {
  clave: string;
  titulo: string;
  sub: string;
  rscCodigo: string | null;
  slugs: string[];
}

export function agrupaTodos(): GrupoTodos[] {
  const porUac = new Map<string, string[]>();
  const sinUbicar: string[] = [];
  for (const slug of Object.keys(LAB_CATALOGO)) {
    const uacCodigo = LAB_UBICACION[slug]?.uacCodigo ?? null;
    if (!uacCodigo) {
      sinUbicar.push(slug);
      continue;
    }
    const lista = porUac.get(uacCodigo);
    if (lista) lista.push(slug);
    else porUac.set(uacCodigo, [slug]);
  }

  const porNombre = (a: string, b: string) => nombreLab(a).localeCompare(nombreLab(b), "es");

  const grupos: GrupoTodos[] = [];
  for (const [uacCodigo, slugs] of porUac) {
    const uac = getUACPorCodigo(uacCodigo);
    grupos.push({
      clave: uacCodigo,
      titulo: uac?.nombre ?? uacCodigo,
      sub: uac ? `${uacCodigo} · Semestre ${uac.semestre}` : uacCodigo,
      rscCodigo: uac?.recursoCodigo ?? null,
      slugs: slugs.sort(porNombre),
    });
  }
  grupos.sort((a, b) => {
    const sa = getUACPorCodigo(a.clave)?.semestre ?? 99;
    const sb = getUACPorCodigo(b.clave)?.semestre ?? 99;
    return sa - sb || a.titulo.localeCompare(b.titulo, "es");
  });

  if (sinUbicar.length > 0) {
    grupos.push({
      clave: "sin-ubicar",
      titulo: "Otros laboratorios",
      sub: `${sinUbicar.length} sin materia declarada en su archivo`,
      rscCodigo: null,
      slugs: sinUbicar.sort(porNombre),
    });
  }
  return grupos;
}

export function TodosLosLaboratorios() {
  const grupos = agrupaTodos();
  return (
    <>
      {grupos.map((grupo) => {
        const color = getRSCColor(grupo.rscCodigo);
        return (
          <section key={grupo.clave} className="labs-section">
            <div className="labs-section-head">
              <div
                className="labs-section-icon"
                style={{
                  background: `rgba(${color.rgba}, 0.12)`,
                  borderColor: `rgba(${color.rgba}, 0.22)`,
                  color: color.hex,
                }}
              >
                <i className={`fa-solid ${color.faIcon}`} />
              </div>
              <div>
                <h2 className="labs-section-title">{grupo.titulo}</h2>
                <p className="labs-section-sub">
                  {grupo.sub} · {grupo.slugs.length}{" "}
                  {grupo.slugs.length === 1 ? "laboratorio" : "laboratorios"}
                </p>
              </div>
            </div>

            <div className="labs-grid">
              {grupo.slugs.map((slug) => {
                const desc = LAB_CATALOGO[slug]?.descripcion ?? "";
                return (
                  <Link
                    key={slug}
                    href={`/hub/laboratorios/${slug}`}
                    className="lab-card is-todo"
                    style={
                      {
                        "--lab-accent": color.hex,
                        "--lab-accent-rgb": color.rgba,
                      } as CSSProperties
                    }
                  >
                    <div className="lab-card-media">
                      <img
                        className="lab-card-img"
                        src={mejorImagenDeLab(slug)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width={800}
                        height={420}
                      />
                      <span className="lab-card-tint" aria-hidden="true" />
                      <div className="lab-card-media-top">
                        <span className="lab-card-badge">
                          <i className="fa-solid fa-cube" /> Lab 3D
                        </span>
                      </div>
                    </div>

                    <div className="lab-card-body">
                      <h3 className="lab-card-titulo">{nombreLab(slug)}</h3>
                      {desc && <p className="lab-card-desc">{desc}</p>}
                      <div className="lab-card-foot">
                        <span className="lab-card-prog">
                          {grupo.clave === "sin-ubicar" ? "Laboratorio" : grupo.clave}
                        </span>
                        <span className="lab-card-cta">
                          Abrir <i className="fa-solid fa-arrow-right" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="labs-credits">
        <i className="fa-solid fa-image" /> Imágenes temáticas de Wikimedia
        Commons, bajo licencias libres (CC / dominio público).
      </p>
    </>
  );
}
