"use client";

/**
 * EXPEDICIÓN — el contenedor de los laboratorios.
 *
 * Toma el mismo formato que las Aventuras de NEM Básica (portada ilustrada,
 * capítulos con telón, guía que acompaña, cuaderno de hallazgos e insignia
 * final) y lo pone alrededor de los laboratorios que ya existen, con la
 * identidad de CEN Bachillerato: fondo navy y el color del área como acento.
 *
 * Tres capítulos, siempre en el mismo orden:
 *   1. Prepárate  — la ficha teórica, pero para TOCARLA: los conceptos están
 *                   tapados y se descubren uno por uno; cada uno cae en el
 *                   cuaderno. Antes era una caja desplegable que nadie abría.
 *   2. Laboratorio— el laboratorio tal cual (3D o de arrastre). No se toca: es
 *                   el mismo componente que ya estaba probado.
 *   3. Comprueba  — relacionar cada término con su definición. Sale de los
 *                   MISMOS términos de la ficha, así que funciona en cualquier
 *                   laboratorio sin escribir contenido nuevo.
 *
 * Los términos salen de `conceptos` o de `glosario` indistintamente (ver
 * `fichaExp`): son la misma forma de dato y qué lista llenó cada laboratorio
 * es un detalle de redacción, no algo que deba costarle un capítulo al alumno.
 *
 * Sin ficha, o con menos de tres términos, los capítulos que no se pueden
 * armar se omiten y la expedición sigue siendo válida: nunca se inventa
 * contenido para rellenar.
 *
 * El progreso vive en localStorage y todo acceso va en try/catch: si el
 * navegador lo bloquea, la expedición funciona igual, solo no recuerda.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import "./expedicion.css";
import type { AreaColor } from "@/components/hub/hub-colors";
import type { FichaTeoricaData } from "../labs/_ficha";
import { LabSfx } from "../labs/lab-audio";
import { DentroDeExpedicion } from "./expedicion-context";
import { cargarFicha as cargarFichaDeLab } from "./fichas-registry.generated";
import { fichaDeExpedicion } from "./terminos-de-ficha";
import { imagenDeTermino } from "@/lib/practicas/terminos-imagen";

/* ── Progreso ─────────────────────────────────────────────────────────── */

export interface Nota {
  id: string;
  titulo: string;
  texto: string;
  /** Viñeta ilustrada del término, si ya se generó. */
  imagen?: string | null;
}

interface Progreso {
  hechos: string[];
  notas: Nota[];
  errores: number;
  terminada: boolean;
}

const VACIO: Progreso = { hechos: [], notas: [], errores: 0, terminada: false };
const clave = (slug: string) => `cen-expedicion:${slug}`;

function leer(slug: string): Progreso {
  if (typeof window === "undefined") return VACIO;
  try {
    const crudo = window.localStorage.getItem(clave(slug));
    if (!crudo) return VACIO;
    const p = JSON.parse(crudo) as Progreso;
    return Array.isArray(p?.hechos) && Array.isArray(p?.notas) ? { ...VACIO, ...p } : VACIO;
  } catch {
    return VACIO;
  }
}

function guardar(slug: string, p: Progreso) {
  try {
    window.localStorage.setItem(clave(slug), JSON.stringify(p));
  } catch {
    /* sin storage: la expedición sigue, solo no recuerda */
  }
}

/* ── Capítulos ────────────────────────────────────────────────────────── */

type CapId = "prepara" | "laboratorio" | "comprueba";

interface Capitulo {
  id: CapId;
  titulo: string;
  lema: string;
  consigna: string;
  icono: string;
  guia: string;
}

export interface ExpedicionProps {
  slug: string;
  titulo: string;
  descripcion?: string;
  /** Carátula del laboratorio: portada y fondo de la expedición. */
  imagen: string;
  color: AreaColor;
  /** Ficha ya cargada; si no, se pide con `cargarFicha`. */
  ficha?: FichaTeoricaData | null;
  /**
   * Carga perezosa de la ficha. Por omisión, la del propio `slug`.
   *
   * La descarga vive AQUÍ y no en `ExpedicionPractica` a propósito: esta pieza
   * se monta con `ssr: false`, así que el registro de las 187 fichas —un mega
   * de texto verbatim— se queda fuera del bundle del Worker, que tiene 3 MiB.
   * Importarlo desde el componente de arriba, que sí se renderiza en el
   * servidor, metía las 187 fichas en el Worker (≈300 KiB comprimidos).
   */
  cargarFicha?: () => Promise<FichaTeoricaData | null>;
  uacNombre: string;
  /** Ruta de salida (la actividad de la que cuelga la práctica). */
  backHref: string;
  etiqueta?: string;
  /** El laboratorio ya montado. */
  children: ReactNode;
}

export function Expedicion({ slug, titulo, descripcion, imagen, color, ficha: fichaFija = null, cargarFicha, uacNombre, backHref, etiqueta, children }: ExpedicionProps) {
  const cargar = useMemo(() => cargarFicha ?? (() => cargarFichaDeLab(slug)), [cargarFicha, slug]);
  // La ficha llega perezosa (un import por laboratorio). Mientras no esté, no
  // se dibuja la expedición: los capítulos dependen de ella y armarlos dos
  // veces haría parpadear la portada.
  const [ficha, setFicha] = useState<FichaTeoricaData | null>(fichaFija);
  const [cargando, setCargando] = useState(!fichaFija);

  useEffect(() => {
    if (fichaFija) return;
    let vivo = true;
    void cargar()
      .then((f) => {
        if (!vivo) return;
        setFicha(f);
        setCargando(false);
      })
      .catch(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [cargar, fichaFija]);

  // Los términos con los que se arman los capítulos, vengan de `conceptos` o
  // de `glosario` (ver `fichaDeExpedicion`).
  const fichaExp = useMemo<FichaTeoricaData | null>(() => (ficha ? fichaDeExpedicion(ficha) : null), [ficha]);

  const capitulos = useMemo<Capitulo[]>(() => {
    const lista: Capitulo[] = [];
    if (fichaExp && fichaExp.conceptos.length > 0) {
      lista.push({
        id: "prepara",
        titulo: "Prepárate",
        lema: "Lo que necesitas saber antes de entrar",
        consigna: "Toca cada concepto para descubrirlo. Los que descubras quedan en tu cuaderno.",
        icono: "fa-graduation-cap",
        guia: "Antes de tocar nada, conviene saber qué vas a ver. Descubre los conceptos: te van a hacer falta adentro.",
      });
    }
    lista.push({
      id: "laboratorio",
      titulo: "Laboratorio",
      lema: titulo.replace(/^Laboratorio( 3D)?\s*—\s*/i, ""),
      consigna: "Experimenta con el laboratorio. Cuando termines sus objetivos, sigue al último capítulo.",
      icono: "fa-flask-vial",
      guia: "Aquí se aprende moviendo. Prueba, equivócate y vuelve a probar: para eso es el laboratorio.",
    });
    if (fichaExp && fichaExp.glosario.length >= 3) {
      lista.push({
        id: "comprueba",
        titulo: "Comprueba",
        lema: "Une cada término con lo que significa",
        consigna: "Elige un término y luego su definición. Entre menos te equivoques, más estrellas ganas.",
        icono: "fa-clipboard-check",
        guia: "Cierra con lo que aprendiste. Si algo se te fue, tu cuaderno sigue ahí.",
      });
    }
    return lista;
  }, [fichaExp, titulo]);

  // Se lee en el inicializador, no en un efecto: así el alumno que vuelve no ve
  // primero la portada «sin empezar» y luego un salto. La expedición se monta
  // con ssr:false (ver PracticaRunner), así que no hay desajuste de hidratación.
  const [progreso, setProgreso] = useState<Progreso>(() => leer(slug));
  const [pantalla, setPantalla] = useState<"portada" | "capitulo" | "cierre">("portada");
  const [i, setI] = useState(0);
  const [fase, setFase] = useState<"telon" | "juego" | "completo">("telon");
  const [cuaderno, setCuaderno] = useState(false);
  const [sonido, setSonido] = useState(false);
  const sfx = useRef<LabSfx | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    return () => sfx.current?.dispose();
  }, []);

  const sonar = useCallback(
    (que: "ok" | "mal" | "blip") => {
      const s = sfx.current;
      if (!s || !sonido) return;
      if (que === "ok") s.correcto();
      else if (que === "mal") s.incorrecto();
      else s.blip();
    },
    [sonido],
  );

  const actualizar = useCallback(
    (cambio: (p: Progreso) => Progreso) => {
      setProgreso((p) => {
        const nx = cambio(p);
        guardar(slug, nx);
        return nx;
      });
    },
    [slug],
  );

  const anotar = useCallback(
    (nota: Nota) => {
      actualizar((p) => (p.notas.some((n) => n.id === nota.id) ? p : { ...p, notas: [...p.notas, nota] }));
    },
    [actualizar],
  );

  const cap = capitulos[i];
  const hecho = (id: CapId) => progreso.hechos.includes(id);
  // Solo se abre el siguiente capítulo cuando el anterior está hecho; los ya
  // hechos se pueden volver a visitar.
  const pendiente = capitulos.findIndex((c) => !hecho(c.id));
  const limite = pendiente === -1 ? capitulos.length - 1 : pendiente;

  useEffect(() => {
    if (pantalla === "capitulo") tituloRef.current?.focus();
  }, [pantalla, i, fase]);

  async function alternarSonido() {
    if (!sfx.current) sfx.current = new LabSfx();
    if (sonido) {
      sfx.current.mute();
      setSonido(false);
    } else {
      await sfx.current.enable();
      setSonido(true);
    }
  }

  function abrirCapitulo(k: number) {
    setI(k);
    setPantalla("capitulo");
    setFase(hecho(capitulos[k]!.id) ? "juego" : "telon");
  }

  function empezar(desdeCero: boolean) {
    if (desdeCero) {
      const limpio = { ...VACIO };
      guardar(slug, limpio);
      setProgreso(limpio);
      setI(0);
      setPantalla("capitulo");
      setFase("telon");
      return;
    }
    if (progreso.terminada) {
      setPantalla("cierre");
      return;
    }
    abrirCapitulo(limite);
  }

  function completar() {
    if (!cap) return;
    actualizar((p) => (p.hechos.includes(cap.id) ? p : { ...p, hechos: [...p.hechos, cap.id] }));
    setFase("completo");
    sonar("ok");
  }

  function siguiente() {
    if (i + 1 < capitulos.length) abrirCapitulo(i + 1);
    else {
      actualizar((p) => ({ ...p, terminada: true }));
      setPantalla("cierre");
    }
  }

  /** 3★ sin errores, 2★ con dos o menos, 1★ por terminar. */
  const estrellas = progreso.terminada ? (progreso.errores === 0 ? 3 : progreso.errores <= 2 ? 2 : 1) : 0;

  const estilo = {
    "--exp-acento": color.hex,
    "--exp-fondo": "#011126",
  } as React.CSSProperties;

  if (cargando) {
    return (
      <div className="exp-raiz" style={estilo} aria-busy="true">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="exp-fondo" style={{ backgroundImage: `url(${imagen})`, opacity: 0.55 }} />
          <div className="exp-velo" />
        </div>
        <div style={{ position: "relative", zIndex: 10, display: "grid", placeItems: "center", height: "100%", gap: 14 }}>
          <i className="fa-solid fa-compass fa-spin" style={{ fontSize: 30, color: color.hex }} aria-hidden />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>Preparando la expedición…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exp-raiz" style={estilo}>
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="exp-fondo" style={{ backgroundImage: `url(${imagen})`, opacity: pantalla === "portada" ? 0.9 : 0.24 }} />
        <div className="exp-velo" />
      </div>

      {/* Barra superior */}
      <header
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(1,17,38,0.72)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Link href={backHref} className="exp-boton-sec" style={{ border: "none", background: "transparent", paddingLeft: 0 }}>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              borderRadius: 12,
              background: color.hex,
              color: "#04121f",
              flexShrink: 0,
            }}
          >
            <i className={`fa-solid ${color.faIcon}`} aria-hidden />
          </span>
          <span style={{ minWidth: 0, textAlign: "left" }} className="exp-titulo-barra">
            <span className="exp-ceja" style={{ display: "block" }}>
              Expedición · {etiqueta ?? uacNombre}
            </span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
              {cap && pantalla === "capitulo" ? cap.lema : titulo}
            </span>
          </span>
        </Link>

        {pantalla === "capitulo" && (
          <nav aria-label="Capítulos" style={{ margin: "0 auto", display: "flex", alignItems: "center", gap: 2 }}>
            {capitulos.map((c, k) => {
              const ok = hecho(c.id);
              const actual = k === i;
              const bloqueado = k > limite;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center" }}>
                  {k > 0 && <span aria-hidden style={{ height: 2, width: 22, borderRadius: 99, background: k <= limite ? color.hex : "rgba(255,255,255,0.18)" }} />}
                  <button
                    type="button"
                    disabled={bloqueado}
                    onClick={() => abrirCapitulo(k)}
                    aria-current={actual ? "step" : undefined}
                    aria-label={`Capítulo ${k + 1}: ${c.titulo}${ok ? " (completado)" : bloqueado ? " (bloqueado)" : ""}`}
                    title={c.titulo}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minHeight: 44,
                      padding: actual ? "0 14px 0 6px" : "0 6px",
                      borderRadius: 999,
                      border: "none",
                      background: actual ? "rgba(255,255,255,0.09)" : "transparent",
                      color: actual ? color.hex : bloqueado ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: bloqueado ? "not-allowed" : "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 900,
                        color: actual ? "#04121f" : ok ? "#04121f" : "inherit",
                        background: actual ? color.hex : ok ? "rgba(52,211,153,0.9)" : "transparent",
                        border: actual || ok ? "none" : "2px solid currentColor",
                      }}
                    >
                      {ok && !actual ? (
                        <i className="fa-solid fa-check" aria-hidden />
                      ) : bloqueado ? (
                        <i className="fa-solid fa-lock" style={{ fontSize: 10 }} aria-hidden />
                      ) : (
                        k + 1
                      )}
                    </span>
                    {actual && <span className="exp-cap-nombre">{c.titulo}</span>}
                  </button>
                </div>
              );
            })}
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: pantalla === "capitulo" ? 0 : "auto" }}>
          <button type="button" className="exp-boton-sec" onClick={alternarSonido} aria-pressed={sonido} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
            <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} aria-hidden />
          </button>
          <button type="button" className="exp-boton-sec" onClick={() => setCuaderno(true)} aria-label={`Cuaderno, ${progreso.notas.length} hallazgos`}>
            <i className="fa-solid fa-book-bookmark" aria-hidden />
            <span
              key={progreso.notas.length}
              className={progreso.notas.length ? "exp-pop" : ""}
              style={{
                display: "grid",
                placeItems: "center",
                minWidth: 22,
                borderRadius: 999,
                padding: "0 6px",
                background: color.hex,
                color: "#04121f",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {progreso.notas.length}
            </span>
          </button>
          <Link href={backHref} className="exp-boton-sec" aria-label="Salir de la expedición">
            <i className="fa-solid fa-xmark" aria-hidden />
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ position: "relative", zIndex: 10, flex: 1, minHeight: 0 }}>
        {pantalla === "portada" && (
          <Portada
            titulo={titulo}
            descripcion={descripcion}
            etiqueta={etiqueta ?? uacNombre}
            capitulos={capitulos}
            color={color}
            empezada={progreso.hechos.length > 0}
            terminada={progreso.terminada}
            empezar={empezar}
          />
        )}

        {pantalla === "cierre" && (
          <Cierre
            titulo={titulo}
            imagen={imagen}
            color={color}
            estrellas={estrellas}
            notas={progreso.notas.length}
            errores={progreso.errores}
            backHref={backHref}
            repetir={() => empezar(true)}
            verCuaderno={() => setCuaderno(true)}
          />
        )}

        {pantalla === "capitulo" && cap && (
          <div className="exp-scroll" style={{ height: "100%", overflowY: "auto" }}>
            {fase === "telon" ? (
              <Telon capitulo={cap} numero={i + 1} color={color} empezar={() => setFase("juego")} tituloRef={tituloRef} />
            ) : (
              <div style={{ maxWidth: cap.id === "laboratorio" ? 1560 : 1180, margin: "0 auto", padding: "22px 20px 120px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="exp-ceja">
                      Capítulo {String(i + 1).padStart(2, "0")} · {cap.titulo}
                    </p>
                    <h2
                      ref={tituloRef}
                      tabIndex={-1}
                      style={{ margin: "6px 0 0", fontSize: cap.id === "laboratorio" ? 26 : 32, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, outline: "none" }}
                    >
                      {cap.lema}
                    </h2>
                    <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "rgba(255,255,255,0.62)", maxWidth: 760 }}>{cap.consigna}</p>
                  </div>
                  {hecho(cap.id) && fase === "juego" && (
                    <button type="button" className="exp-boton" onClick={siguiente}>
                      {i + 1 < capitulos.length ? "Siguiente capítulo" : "Ver mi insignia"}
                      <i className="fa-solid fa-arrow-right" aria-hidden />
                    </button>
                  )}
                </div>

                {cap.id === "prepara" && fichaExp && (
                  <Prepara slug={slug} ficha={fichaExp} color={color} anotar={anotar} sonar={sonar} alTerminar={completar} yaHecho={hecho("prepara")} />
                )}
                {cap.id === "laboratorio" && (
                  <Laboratorio color={color} yaHecho={hecho("laboratorio")} alTerminar={completar}>
                    {children}
                  </Laboratorio>
                )}
                {cap.id === "comprueba" && fichaExp && (
                  <Comprueba
                    slug={slug}
                    ficha={fichaExp}
                    color={color}
                    sonar={sonar}
                    yaHecho={hecho("comprueba")}
                    sumarError={() => actualizar((p) => ({ ...p, errores: p.errores + 1 }))}
                    alTerminar={completar}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Guía + aviso de capítulo completado */}
      {pantalla === "capitulo" && cap && fase !== "telon" && (
        <div style={{ position: "relative", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 16px 14px" }}>
          {fase === "completo" && (
            <div
              className="exp-papel exp-pop"
              role="status"
              style={{ display: "flex", width: "100%", maxWidth: 980, alignItems: "center", justifyContent: "space-between", gap: 12, padding: 14 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span
                  style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 999, background: "rgba(52,211,153,0.9)", color: "#04121f", flexShrink: 0 }}
                >
                  <i className="fa-solid fa-flag-checkered" aria-hidden />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p className="exp-ceja" style={{ color: "#34D399" }}>
                    Capítulo completado
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800 }}>{cap.titulo}</p>
                </div>
              </div>
              <button type="button" className="exp-boton" onClick={siguiente} autoFocus>
                {i + 1 < capitulos.length ? `Capítulo ${i + 2}: ${capitulos[i + 1]!.titulo}` : "Ver mi insignia"}
                <i className="fa-solid fa-arrow-right" aria-hidden />
              </button>
            </div>
          )}
          <Guia texto={cap.guia} color={color} />
        </div>
      )}

      <Cuaderno abierto={cuaderno} cerrar={() => setCuaderno(false)} notas={progreso.notas} color={color} />

      <style>{`
        @media (max-width: 860px) {
          .exp-titulo-barra, .exp-cap-nombre { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ── Portada ──────────────────────────────────────────────────────────── */

function Portada({
  titulo,
  descripcion,
  etiqueta,
  capitulos,
  color,
  empezada,
  terminada,
  empezar,
}: {
  titulo: string;
  descripcion?: string;
  etiqueta: string;
  capitulos: Capitulo[];
  color: AreaColor;
  empezada: boolean;
  terminada: boolean;
  empezar: (desdeCero: boolean) => void;
}) {
  return (
    <div style={{ height: "100%", display: "grid", alignItems: "center", padding: "28px 24px" }}>
      <div className="exp-entrar" style={{ maxWidth: 720 }}>
        <p className="exp-ceja">Expedición · {etiqueta}</p>
        <h1 style={{ margin: "10px 0 0", fontSize: "clamp(34px, 5.4vw, 60px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
          {titulo.replace(/^Laboratorio( 3D)?\s*—\s*/i, "")}
        </h1>
        {descripcion && <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.72)" }}>{descripcion}</p>}

        <ul style={{ listStyle: "none", margin: "24px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {capitulos.map((c, k) => (
            <li key={c.id} className="exp-papel" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
              <span
                style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: color.hex, color: "#04121f", fontSize: 12, fontWeight: 900 }}
              >
                {k + 1}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{c.titulo}</span>
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <button type="button" className="exp-boton" style={{ minHeight: 56, padding: "0 32px", fontSize: 15 }} onClick={() => empezar(false)} autoFocus>
            {terminada ? "Ver mi insignia" : empezada ? "Continuar" : "Empezar"}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </button>
          {empezada && (
            <button type="button" className="exp-boton-sec" style={{ minHeight: 56, padding: "0 22px" }} onClick={() => empezar(true)}>
              <i className="fa-solid fa-rotate-left" aria-hidden />
              Empezar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Telón de capítulo ────────────────────────────────────────────────── */

function Telon({
  capitulo,
  numero,
  color,
  empezar,
  tituloRef,
}: {
  capitulo: Capitulo;
  numero: number;
  color: AreaColor;
  empezar: () => void;
  tituloRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ maxWidth: 680 }}>
        <p className="exp-telon-num" style={{ margin: 0, fontSize: "clamp(70px, 13vw, 130px)", fontWeight: 900, lineHeight: 1, color: color.hex, letterSpacing: "-0.04em" }}>
          {String(numero).padStart(2, "0")}
        </p>
        <p className="exp-ceja exp-entrar" style={{ animationDelay: "220ms", marginTop: 6 }}>
          Capítulo {numero}
        </p>
        <h2
          ref={tituloRef}
          tabIndex={-1}
          className="exp-entrar"
          style={{ animationDelay: "340ms", margin: "12px 0 0", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", outline: "none" }}
        >
          {capitulo.titulo}
        </h2>
        <p className="exp-entrar" style={{ animationDelay: "460ms", margin: "14px 0 0", fontSize: 19, color: "rgba(255,255,255,0.66)" }}>
          {capitulo.lema}
        </p>
        <button
          type="button"
          className="exp-boton exp-entrar"
          style={{ animationDelay: "620ms", marginTop: 30, minHeight: 56, padding: "0 32px", fontSize: 15 }}
          onClick={empezar}
          autoFocus
        >
          Empezar
          <i className="fa-solid fa-arrow-right" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ── Capítulo 1: Prepárate ────────────────────────────────────────────── */

function Prepara({
  slug,
  ficha,
  color,
  anotar,
  sonar,
  alTerminar,
  yaHecho,
}: {
  slug: string;
  ficha: FichaTeoricaData;
  color: AreaColor;
  anotar: (n: Nota) => void;
  sonar: (q: "ok" | "mal" | "blip") => void;
  alTerminar: () => void;
  yaHecho: boolean;
}) {
  const [abiertas, setAbiertas] = useState<string[]>(() => (yaHecho ? ficha.conceptos.map((c) => c.termino) : []));
  const total = ficha.conceptos.length;
  const listo = abiertas.length === total;
  const avisado = useRef(yaHecho);

  useEffect(() => {
    if (listo && !avisado.current) {
      avisado.current = true;
      alTerminar();
    }
  }, [listo, alTerminar]);

  function descubrir(termino: string, definicion: string) {
    if (abiertas.includes(termino)) return;
    setAbiertas((v) => [...v, termino]);
    anotar({ id: `concepto:${termino}`, titulo: termino, texto: definicion, imagen: imagenDeTermino(slug, termino) });
    sonar("blip");
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Conceptos por descubrir: cada uno con su viñeta ilustrada. La escena
          se ve desde el principio (atenuada): es la pista de qué hay detrás. */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: color.hex, marginRight: 8 }} aria-hidden />
            Conceptos centrales
          </h3>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 800, color: listo ? "#34D399" : "rgba(255,255,255,0.55)" }}>
            <span style={{ display: "inline-flex", gap: 4 }} aria-hidden>
              {ficha.conceptos.map((c) => (
                <span
                  key={c.termino}
                  style={{
                    width: 18,
                    height: 5,
                    borderRadius: 99,
                    background: abiertas.includes(c.termino) ? "#34D399" : "rgba(255,255,255,0.18)",
                    transition: "background .3s ease",
                  }}
                />
              ))}
            </span>
            {abiertas.length} de {total} descubiertos
          </span>
        </div>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {ficha.conceptos.map((c) => {
            const abierta = abiertas.includes(c.termino);
            const img = imagenDeTermino(slug, c.termino);
            return (
              <div key={c.termino} className="exp-carta" data-abierta={abierta} style={{ minHeight: 300 }}>
                <button
                  type="button"
                  onClick={() => descubrir(c.termino, c.definicion)}
                  aria-expanded={abierta}
                  aria-label={abierta ? c.termino : `Descubrir concepto: ${c.termino}`}
                  style={{ all: "unset", cursor: abierta ? "default" : "pointer", display: "block", width: "100%" }}
                >
                  <div className="exp-carta-int" style={{ minHeight: 300 }}>
                    <div className="exp-cara" style={{ padding: 0, overflow: "hidden", border: `1px solid rgba(${color.rgba},0.35)`, background: `rgba(${color.rgba},0.10)` }}>
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          aria-hidden
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) brightness(0.74)" }}
                        />
                      ) : (
                        <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 44, color: `rgba(${color.rgba},0.35)` }} aria-hidden>
                          <i className="fa-solid fa-lightbulb" />
                        </span>
                      )}
                      <span
                        style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(1,17,38,0.96) 14%, rgba(1,17,38,0.5) 48%, rgba(1,17,38,0.12) 100%)" }}
                        aria-hidden
                      />
                      <span style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.15 }}>{c.termino}</span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            fontSize: 10.5,
                            fontWeight: 900,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: color.hex,
                          }}
                        >
                          <i className="fa-solid fa-hand-pointer" aria-hidden />
                          Tocar para descubrir
                        </span>
                      </span>
                    </div>

                    <div
                      className="exp-cara exp-cara-atras exp-scroll"
                      style={{ border: "1px solid rgba(52,211,153,0.4)", background: "rgba(5,32,28,0.94)", gap: 11, justifyContent: "flex-start", paddingTop: 16 }}
                    >
                      {img && <img src={img} alt="" aria-hidden style={{ width: "100%", height: 118, objectFit: "cover", borderRadius: 12 }} />}
                      <span style={{ fontSize: 15, fontWeight: 900, color: "#34D399" }}>{c.termino}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.82)" }}>{c.definicion}</span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        {ficha.marcoTeorico.length > 0 && (
          <section className="exp-papel exp-scroll" style={{ padding: 20, maxHeight: 420, overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 900 }}>
              <i className="fa-solid fa-book-open" style={{ color: color.hex, marginRight: 8 }} aria-hidden />
              Marco teórico
            </h3>
            {ficha.marcoTeorico.map((p, k) => (
              <p key={k} style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.75)" }}>
                {p}
              </p>
            ))}
            {ficha.fuente && <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{ficha.fuente}</p>}
          </section>
        )}

        <section style={{ display: "grid", gap: 18, alignContent: "start" }}>
          {ficha.objetivos.length > 0 && (
            <div className="exp-papel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 900 }}>
                <i className="fa-solid fa-bullseye" style={{ color: color.hex, marginRight: 8 }} aria-hidden />
                Qué vas a lograr
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                {ficha.objetivos.map((o, k) => (
                  <li key={k} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,0.78)" }}>
                    <i className="fa-solid fa-circle-check" style={{ color: color.hex, marginTop: 3 }} aria-hidden />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ficha.materiales.length > 0 && (
            <div className="exp-papel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 900 }}>
                <i className="fa-solid fa-toolbox" style={{ color: color.hex, marginRight: 8 }} aria-hidden />
                Con qué lo harás
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ficha.materiales.map((m) => (
                  <li
                    key={m.nombre}
                    title={m.detalle}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    <i className={`fa-solid ${m.icono ?? "fa-cube"}`} style={{ color: color.hex }} aria-hidden />
                    {m.nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Capítulo 2: el laboratorio de siempre ───────────────────────────── */

function Laboratorio({ color, yaHecho, alTerminar, children }: { color: AreaColor; yaHecho: boolean; alTerminar: () => void; children: ReactNode }) {
  return (
    <>
      <div className="exp-papel" style={{ padding: 0, overflow: "hidden" }}>
        <DentroDeExpedicion>{children}</DentroDeExpedicion>
      </div>
      {!yaHecho && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button type="button" className="exp-boton" onClick={alTerminar}>
            Ya terminé el laboratorio
            <i className="fa-solid fa-check" aria-hidden />
          </button>
        </div>
      )}
      <p style={{ textAlign: "center", marginTop: 12, fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>
        Puedes volver a este laboratorio cuando quieras desde los capítulos de arriba.
      </p>
      <span hidden style={{ color: color.hex }} />
    </>
  );
}

/* ── Capítulo 3: Comprueba (relacionar glosario) ─────────────────────── */

/** Baraja estable por semilla: el mismo laboratorio se ve igual al volver. */
function barajar<T>(lista: readonly T[], semilla: number): T[] {
  const a = [...lista];
  let s = semilla || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function Comprueba({
  slug,
  ficha,
  color,
  sonar,
  yaHecho,
  sumarError,
  alTerminar,
}: {
  slug: string;
  ficha: FichaTeoricaData;
  color: AreaColor;
  sonar: (q: "ok" | "mal" | "blip") => void;
  yaHecho: boolean;
  sumarError: () => void;
  alTerminar: () => void;
}) {
  // Como mucho seis pares: más de eso es una lista, no un reto.
  const pares = useMemo(() => ficha.glosario.slice(0, 6), [ficha.glosario]);
  const semilla = useMemo(() => pares.reduce((n, p) => n + p.termino.length * 31, 7), [pares]);
  const definiciones = useMemo(() => barajar(pares, semilla), [pares, semilla]);

  const [resueltos, setResueltos] = useState<string[]>(() => (yaHecho ? pares.map((p) => p.termino) : []));
  const [elegido, setElegido] = useState<string | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const avisado = useRef(yaHecho);
  const listo = resueltos.length === pares.length;

  useEffect(() => {
    if (listo && !avisado.current) {
      avisado.current = true;
      alTerminar();
    }
  }, [listo, alTerminar]);

  function tocarDefinicion(termino: string) {
    if (!elegido || resueltos.includes(termino)) return;
    if (elegido === termino) {
      setResueltos((v) => [...v, termino]);
      setElegido(null);
      sonar("ok");
    } else {
      setFallo(termino);
      sumarError();
      sonar("mal");
      window.setTimeout(() => setFallo(null), 420);
    }
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      {/* Mosaico de términos ilustrados */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <p className="exp-ceja" style={{ margin: 0 }}>
            {elegido ? "Ahora busca su definición abajo" : "Elige un término"}
          </p>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: listo ? "#34D399" : "rgba(255,255,255,0.55)" }}>
            {resueltos.length} de {pares.length} resueltos
          </span>
        </div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {pares.map((p) => {
            const ok = resueltos.includes(p.termino);
            const activo = elegido === p.termino;
            const img = imagenDeTermino(slug, p.termino);
            return (
              <button
                key={p.termino}
                type="button"
                disabled={ok}
                onClick={() => setElegido(activo ? null : p.termino)}
                aria-pressed={activo}
                aria-label={`${p.termino}${ok ? " (resuelto)" : ""}`}
                style={{
                  position: "relative",
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: 18,
                  aspectRatio: "1 / 1",
                  cursor: ok ? "default" : "pointer",
                  border: `2px solid ${ok ? "rgba(52,211,153,0.75)" : activo ? color.hex : "rgba(255,255,255,0.1)"}`,
                  background: `rgba(${color.rgba},0.08)`,
                  boxShadow: activo ? `0 16px 34px -16px ${color.hex}` : "none",
                  transform: activo ? "translateY(-3px)" : "none",
                  transition: "all .2s ease",
                  opacity: ok ? 0.75 : 1,
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt=""
                    aria-hidden
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: ok ? "saturate(0.6) brightness(0.7)" : "none" }}
                  />
                ) : (
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 40, color: `rgba(${color.rgba},0.4)` }} aria-hidden>
                    <i className="fa-solid fa-shapes" />
                  </span>
                )}
                <span
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(1,17,38,0.94) 16%, rgba(1,17,38,0.35) 52%, transparent 100%)" }}
                  aria-hidden
                />
                <span style={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "block", fontSize: 15, fontWeight: 900, lineHeight: 1.2, textAlign: "left" }}>
                  {p.termino}
                </span>
                {ok && (
                  <span
                    className="exp-pop"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      display: "grid",
                      placeItems: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: "rgba(52,211,153,0.95)",
                      color: "#04121f",
                    }}
                    aria-hidden
                  >
                    <i className="fa-solid fa-check" style={{ fontSize: 13 }} />
                  </span>
                )}
                {activo && (
                  <span
                    style={{ position: "absolute", top: 10, left: 12, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: color.hex }}
                    aria-hidden
                  >
                    Elegido
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Definiciones */}
      <section>
        <p className="exp-ceja" style={{ margin: "0 0 12px" }}>
          Definiciones
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))" }}>
          {definiciones.map((d) => {
            const ok = resueltos.includes(d.termino);
            return (
              <li key={d.termino} className={fallo === d.termino ? "exp-tiembla" : undefined}>
                <button
                  type="button"
                  disabled={ok || !elegido}
                  onClick={() => tocarDefinicion(d.termino)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 16,
                    cursor: ok || !elegido ? "default" : "pointer",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: ok ? "rgba(52,211,153,0.92)" : "rgba(255,255,255,0.82)",
                    background: ok ? "rgba(52,211,153,0.10)" : elegido ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${ok ? "rgba(52,211,153,0.42)" : fallo === d.termino ? "#F87171" : "rgba(255,255,255,0.09)"}`,
                    transition: "all .18s ease",
                  }}
                >
                  {ok && imagenDeTermino(slug, d.termino) ? (
                    <img src={imagenDeTermino(slug, d.termino)!} alt="" aria-hidden style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                  ) : (
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 54,
                        height: 54,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: "rgba(255,255,255,0.05)",
                        color: ok ? "#34D399" : `rgba(${color.rgba},0.65)`,
                      }}
                      aria-hidden
                    >
                      <i className={`fa-solid ${ok ? "fa-check" : "fa-quote-left"}`} />
                    </span>
                  )}
                  <span>
                    {ok && <strong style={{ display: "block", color: "#34D399", marginBottom: 2 }}>{d.termino}</strong>}
                    {d.definicion}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ── Guía ─────────────────────────────────────────────────────────────── */

function Guia({ texto, color }: { texto: string; color: AreaColor }) {
  return (
    <div className="exp-papel" style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 980, width: "100%", padding: "10px 16px" }}>
      <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 999, background: `rgba(${color.rgba},0.2)`, color: color.hex, flexShrink: 0 }}>
        <i className="fa-solid fa-compass" aria-hidden />
      </span>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.45, color: "rgba(255,255,255,0.72)" }}>{texto}</p>
    </div>
  );
}

/* ── Cuaderno ─────────────────────────────────────────────────────────── */

function Cuaderno({ abierto, cerrar, notas, color }: { abierto: boolean; cerrar: () => void; notas: Nota[]; color: AreaColor }) {
  if (!abierto) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Cuaderno de hallazgos" style={{ position: "fixed", inset: 0, zIndex: 120 }}>
      <div onClick={cerrar} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} />
      <aside
        className="exp-scroll"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 92vw)",
          overflowY: "auto",
          background: "#04162e",
          borderLeft: `1px solid rgba(${color.rgba},0.3)`,
          padding: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900 }}>
            <i className="fa-solid fa-book-bookmark" style={{ color: color.hex, marginRight: 8 }} aria-hidden />
            Mi cuaderno
          </h3>
          <button type="button" className="exp-boton-sec" onClick={cerrar} aria-label="Cerrar cuaderno">
            <i className="fa-solid fa-xmark" aria-hidden />
          </button>
        </div>
        {notas.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            Todavía está vacío. Cada concepto que descubras en la expedición se guarda aquí para que puedas consultarlo mientras experimentas.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
            {notas.map((n) => (
              <li key={n.id} className="exp-papel" style={{ padding: 14, display: "flex", gap: 12 }}>
                {n.imagen && <img src={n.imagen} alt="" aria-hidden style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 900, color: color.hex }}>{n.titulo}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.75)" }}>{n.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

/* ── Cierre ───────────────────────────────────────────────────────────── */

function Cierre({
  titulo,
  imagen,
  color,
  estrellas,
  notas,
  errores,
  backHref,
  repetir,
  verCuaderno,
}: {
  titulo: string;
  imagen: string;
  color: AreaColor;
  estrellas: number;
  notas: number;
  errores: number;
  backHref: string;
  repetir: () => void;
  verCuaderno: () => void;
}) {
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", padding: "30px 24px", textAlign: "center" }}>
      <div className="exp-entrar" style={{ maxWidth: 620 }}>
        <div
          className="exp-pop"
          style={{
            width: 168,
            height: 168,
            margin: "0 auto",
            borderRadius: 999,
            backgroundImage: `url(${imagen})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `4px solid ${color.hex}`,
            boxShadow: `0 24px 60px -20px ${color.hex}`,
          }}
          aria-hidden
        />
        <p className="exp-ceja" style={{ marginTop: 22 }}>
          Expedición completada
        </p>
        <h2 style={{ margin: "10px 0 0", fontSize: "clamp(28px, 4.4vw, 44px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
          {titulo.replace(/^Laboratorio( 3D)?\s*—\s*/i, "")}
        </h2>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "22px 0 0" }} aria-label={`${estrellas} de 3 estrellas`}>
          {[1, 2, 3].map((n) => (
            <i
              key={n}
              className={`fa-${n <= estrellas ? "solid" : "regular"} fa-star exp-pop`}
              style={{ fontSize: 34, color: n <= estrellas ? color.hex : "rgba(255,255,255,0.22)", animationDelay: `${n * 110}ms` }}
              aria-hidden
            />
          ))}
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 14.5, color: "rgba(255,255,255,0.66)" }}>
          {notas} conceptos en tu cuaderno · {errores === 0 ? "sin errores en la comprobación" : `${errores} ${errores === 1 ? "error" : "errores"} en la comprobación`}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 28 }}>
          <Link href={backHref} className="exp-boton" style={{ minHeight: 52, padding: "0 28px" }}>
            Volver al ejercicio
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
          <button type="button" className="exp-boton-sec" style={{ minHeight: 52, padding: "0 20px" }} onClick={verCuaderno}>
            <i className="fa-solid fa-book-bookmark" aria-hidden />
            Ver mi cuaderno
          </button>
          <button type="button" className="exp-boton-sec" style={{ minHeight: 52, padding: "0 20px" }} onClick={repetir}>
            <i className="fa-solid fa-rotate-left" aria-hidden />
            Repetir
          </button>
        </div>
      </div>
    </div>
  );
}
