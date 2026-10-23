"use client";
// =============================================================================
// Lab — Atlas del cuerpo humano
// =============================================================================
// Más de mil piezas con su forma real (atlas Z-Anatomy, hecho de cuerpos
// reales): huesos, músculos, corazón y vasos, órganos, encéfalo y nervios,
// glándulas y defensas. Cada pieza se toca para saber cómo se llama, cómo se le
// dice en casa, de qué lado está y qué hace.
//
// QUÉ SE PUEDE HACER
//   • Encender y apagar cada sistema; abrir su ficha (qué hace, sus partes,
//     datos, cómo cuidarlo).
//   • Desarmar el cuerpo: separar las piezas con el deslizador, o verlas todas
//     en filas («Todas las piezas»), y ver cualquiera sola, girando.
//   • Clases guiadas: una general del cuerpo y una por sistema. Cada paso deja
//     la escena lista y explica; los retos esperan a que el alumno toque la
//     pieza correcta.
// =============================================================================

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import type { PracticaNemProps } from "../tipos";
import { SceneBoundary } from "./_kit";
import { EscenaLab, useEnMarco } from "./_escena";
import type { Aislar, AtlasCuerpoSceneProps, ModoHueso, ModoVista, Pieza, Vista } from "./AtlasCuerpoScene";
import { NOMBRES, type IdSistema } from "./atlas-cuerpo-nombres";
import { CapaCuerpo, estampaDe, FondoLaboratorio } from "./LaboratorioCuerpoCEN";
import { CLASES, SISTEMA_INFO, funcionDe, type Clase } from "./atlas-cuerpo-datos";

const AtlasCuerpoScene = dynamic<AtlasCuerpoSceneProps>(() => import("./AtlasCuerpoScene").then((m) => m.AtlasCuerpoScene), {
  ssr: false,
  loading: () => <Cargando />,
});

/** Sistemas en el riel. El reproductor espera decisión (el atlas solo trae el masculino). */
const ORDEN: IdSistema[] = ["esqueleto", "musculos", "circulatorio", "respiratorio", "digestivo", "urinario", "nervioso", "sentidos", "endocrino", "linfatico"];
const INICIALES: IdSistema[] = ["esqueleto", "circulatorio", "respiratorio", "digestivo", "urinario", "nervioso", "sentidos", "endocrino", "linfatico"];
// Piezas que quedan escondidas aunque el hueso esté en rayos X.
const OCULTAS = /^(Malleus|Incus|Stapes|Cochlea|Vestibule|Tympanic membrane)$/;
const VISTA_VALIDA = new Set(["frente", "lado", "espalda", "arriba"]);

// ── Estilo ──────────────────────────────────────────────────────────────────
const T = {
  fuente: "var(--font-cen),'Montserrat',var(--font-sans),sans-serif",
  texto: "#e9eef8",
  tenue: "#a9c0e6",
  linea: "rgba(184,235,80,.18)",
  oro: "#b8eb50",
  panel: "rgba(0,21,59,.84)",
  fondo: "radial-gradient(ellipse 60% 75% at 50% 45%, #1b63db 0%, #0a3c9e 38%, #00215f 70%, #00153b 100%)",
};
const PANEL: CSSProperties = {
  background: T.panel,
  border: `1px solid ${T.linea}`,
  borderRadius: 12,
  backdropFilter: "blur(14px) saturate(1.2)",
  WebkitBackdropFilter: "blur(14px) saturate(1.2)",
  color: T.texto,
};
const ROTULO: CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: T.tenue };

function Cargando() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: T.tenue, fontFamily: T.fuente }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 22 }} />
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".04em" }}>Preparando el atlas…</span>
    </div>
  );
}

function BotonIcono({ icono, titulo, onClick, activo }: { icono: string; titulo: string; onClick: () => void; activo?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={titulo}
      aria-pressed={activo}
      title={titulo}
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        border: `1px solid ${activo ? "rgba(184,235,80,.6)" : T.linea}`,
        background: activo ? "rgba(184,235,80,.14)" : T.panel,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        color: activo ? T.oro : T.texto,
        cursor: "pointer",
        fontSize: 16,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
    >
      <i className={icono} aria-hidden />
    </button>
  );
}

function Boton({ icono, children, onClick, fuerte, desactivado }: { icono?: string; children: ReactNode; onClick: () => void; fuerte?: boolean; desactivado?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desactivado}
      style={{
        minHeight: 44,
        padding: "0 14px",
        borderRadius: 10,
        border: fuerte ? "none" : `1px solid ${T.linea}`,
        background: fuerte ? T.oro : "rgba(255,255,255,.06)",
        color: fuerte ? "#00153b" : T.texto,
        fontFamily: T.fuente,
        fontSize: 14,
        fontWeight: 800,
        cursor: desactivado ? "default" : "pointer",
        opacity: desactivado ? 0.4 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {icono && <i className={icono} aria-hidden />}
      {children}
    </button>
  );
}

function Cabecera({
  rotulo,
  color,
  icono,
  titulo,
  onCerrar,
  plegado,
  onPlegar,
  children,
}: {
  rotulo: string;
  color: string;
  icono: string;
  titulo: string;
  onCerrar: () => void;
  plegado: boolean;
  onPlegar: () => void;
  children?: ReactNode;
}) {
  const boton: CSSProperties = { width: 44, height: 44, borderRadius: 10, border: `1px solid ${T.linea}`, background: "transparent", color: T.texto, cursor: "pointer", flex: "0 0 auto" };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ROTULO, color, display: "flex", alignItems: "center", gap: 8 }}>
          <i className={icono} aria-hidden />
          {rotulo}
        </div>
        <h2 style={{ margin: "6px 0 0", fontSize: 25, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.01em" }}>{titulo}</h2>
        {children}
      </div>
      <button type="button" className="ac-solo-movil" onClick={onPlegar} aria-label={plegado ? "Desplegar" : "Plegar"} style={boton}>
        <i className={plegado ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"} aria-hidden />
      </button>
      <button type="button" onClick={onCerrar} aria-label="Cerrar" style={boton}>
        <i className="fa-solid fa-xmark" aria-hidden />
      </button>
    </div>
  );
}

const sinAcentos = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase();

// Para buscar: cada pieza una vez (las dos del par juntas), con su texto plano.
const INDICE = Object.entries(NOMBRES)
  .filter(([, n]) => n.s !== "reproductor")
  .map(([clave, n]) => ({ clave, n, plano: sinAcentos(`${n.es} ${n.c ?? ""}`) }));

// Palabras con que un niño busca un sistema entero.
const PALABRAS_SISTEMA: Partial<Record<IdSistema, string>> = {
  esqueleto: "huesos esqueleto oseo",
  musculos: "musculos muscular",
  circulatorio: "corazon sangre venas arterias circulatorio",
  respiratorio: "pulmones pulmon respirar respiratorio",
  digestivo: "estomago intestinos comida digestivo digestion",
  urinario: "riñones orina excretor urinario",
  nervioso: "cerebro encefalo nervios nervioso neuronas",
  sentidos: "ojo ojos oido oidos vista sentidos",
  endocrino: "hormonas glandulas endocrino",
  linfatico: "defensas inmune inmunitario ganglios linfatico",
};

const VISTAS: { v: Vista; et: string }[] = [
  { v: "frente", et: "Frente" },
  { v: "lado", et: "Lado" },
  { v: "espalda", et: "Espalda" },
  { v: "arriba", et: "Arriba" },
];

/** Una pieza a partir de su llave (para chips, búsqueda y clases). */
function piezaDeClave(clave: string): Pieza | null {
  const n = NOMBRES[clave];
  return n ? { id: `${n.s}:${clave}`, clave, lado: null, sistema: n.s } : null;
}

// ── Sistemas encendidos (y los ya pedidos, que no se sueltan) ───────────────
type EstadoSistemas = { visibles: Record<IdSistema, boolean>; cargar: IdSistema[] };
type AccionSistemas = { tipo: "solo"; sistemas: IdSistema[] } | { tipo: "alternar"; s: IdSistema } | { tipo: "mostrar"; s: IdSistema[] };
function reductorSistemas(e: EstadoSistemas, a: AccionSistemas): EstadoSistemas {
  const visibles = { ...e.visibles };
  if (a.tipo === "solo") for (const s of Object.keys(visibles) as IdSistema[]) visibles[s] = a.sistemas.includes(s);
  else if (a.tipo === "alternar") visibles[a.s] = !visibles[a.s];
  else for (const s of a.s) visibles[s] = true;
  const cargar = [...e.cargar];
  for (const s of Object.keys(visibles) as IdSistema[]) if (visibles[s] && !cargar.includes(s)) cargar.push(s);
  return { visibles, cargar };
}
const INICIO_SISTEMAS: EstadoSistemas = {
  visibles: Object.fromEntries(Object.keys(SISTEMA_INFO).map((s) => [s, INICIALES.includes(s as IdSistema)])) as Record<IdSistema, boolean>,
  cargar: INICIALES,
};

type Panel = { tipo: "pieza" } | { tipo: "sistema"; s: IdSistema } | { tipo: "clases" } | { tipo: "clase"; id: string; paso: number } | null;
type Reto = { estado: "espera" } | { estado: "bien" } | { estado: "mal"; nombre: string } | null;

export function LabAtlasCuerpo(_: PracticaNemProps) {
  // Dentro del marco de laboratorio ya se está a pantalla completa: la escena
  // ocupa el cuerpo del marco y la vista «inmersiva» propia sobra.
  const enMarco = useEnMarco() !== null;
  const [inmersivoPropio, setInmersivo] = useState(true);
  const inmersivo = !enMarco && inmersivoPropio;
  const [sis, despachar] = useReducer(reductorSistemas, INICIO_SISTEMAS);
  const [hueso, setHueso] = useState<ModoHueso>("rayos");
  const [seleccion, setSeleccion] = useState<Pieza | null>(null);
  const [resaltadas, setResaltadas] = useState<string[]>([]);
  const [hover, setHover] = useState<Pieza | null>(null);
  const [aislar, setAislar] = useState<Aislar>(false);
  const [separar, setSeparar] = useState(0);
  const [modo, setModo] = useState<ModoVista>("cuerpo");
  const [enfoque, setEnfoque] = useState<{ a: string; n: number }>({ a: "todo", n: 0 });
  const [vista, setVista] = useState<Vista | null>("frente");
  const [busca, setBusca] = useState("");
  const [info, setInfo] = useState(false);
  const [listo, setListo] = useState(false);
  const [conteo, setConteo] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [reto, setReto] = useState<Reto>(null);
  const [plegado, setPlegado] = useState(false);
  const marco = useRef<HTMLDivElement>(null);
  const infoRef = useRef(info);
  const retoRef = useRef<{ tocar: string[] } | null>(null);
  useEffect(() => {
    infoRef.current = info;
  }, [info]);

  const claseActual: Clase | null = panel?.tipo === "clase" ? (CLASES.find((c) => c.id === panel.id) ?? null) : null;
  const pasoActual = claseActual && panel?.tipo === "clase" ? claseActual.pasos[panel.paso] : null;
  useEffect(() => {
    retoRef.current = pasoActual?.reto && reto?.estado !== "bien" ? { tocar: pasoActual.reto.tocar } : null;
  }, [pasoActual, reto]);

  useEffect(() => {
    if (!inmersivo) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.fullscreenElement) return;
      if (infoRef.current) setInfo(false);
      else setInmersivo(false);
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", tecla);
    };
  }, [inmersivo]);

  const ir = (a: string) => setEnfoque((e) => ({ a, n: e.n + 1 }));

  const elegir = useCallback((p: Pieza | null) => {
    // En un reto, tocar es contestar.
    const r = retoRef.current;
    if (r && p) {
      if (r.tocar.includes(p.clave)) {
        setReto({ estado: "bien" });
        setSeleccion(p);
      } else setReto({ estado: "mal", nombre: NOMBRES[p.clave]?.es ?? p.clave });
      return;
    }
    setSeleccion(p);
    setPlegado(false);
    if (!p) {
      setAislar((a) => (a === "resaltadas" ? a : false));
      setPanel((x) => (x?.tipo === "pieza" ? null : x));
      return;
    }
    // El oído queda dentro del hueso y del cerebro: se muestra solo con su sistema.
    setAislar((a) => (a === "resaltadas" ? a : OCULTAS.test(p.clave) ? "sistema" : false));
    setPanel((x) => (x?.tipo === "clase" ? x : { tipo: "pieza" }));
    setVista(null);
    setEnfoque((e) => ({ a: p.id, n: e.n + 1 }));
  }, []);
  const onHover = useCallback((p: Pieza | null) => setHover(p), []);
  const onListo = useCallback(() => setListo(true), []);
  const onConteo = useCallback((n: number) => setConteo(n), []);

  const elegirClave = (clave: string) => {
    const p = piezaDeClave(clave);
    if (!p) return;
    despachar({ tipo: "mostrar", s: [p.sistema] });
    if (p.sistema !== "esqueleto" && hueso === "solido") setHueso("rayos");
    setResaltadas([]);
    setAislar(false);
    setModo("cuerpo");
    elegir(p);
  };

  const abrirSistema = (s: IdSistema) => {
    despachar({ tipo: "mostrar", s: [s] });
    if (s === "esqueleto" && hueso === "oculto") setHueso("solido");
    // Los órganos están dentro del esqueleto: para verlos, rayos X.
    if (s !== "esqueleto" && hueso === "solido") setHueso("rayos");
    setSeleccion(null);
    setResaltadas([]);
    setAislar(false);
    setReto(null);
    setPanel({ tipo: "sistema", s });
    setPlegado(false);
    setVista(null);
    ir(modo === "piezas" ? "piezas" : `sistema:${s}`);
  };

  const cambiarModo = (m: ModoVista) => {
    setModo(m);
    setAislar(false);
    setVista(m === "cuerpo" ? "frente" : null);
    ir(m === "piezas" ? "piezas" : "todo");
  };

  const irPaso = (clase: Clase, i: number) => {
    const paso = clase.pasos[i]!;
    if (paso.sistemas) despachar({ tipo: "solo", sistemas: paso.sistemas });
    if (paso.hueso) setHueso(paso.hueso);
    if (paso.separar !== undefined) setSeparar(paso.separar);
    setModo(paso.modo ?? "cuerpo");
    setResaltadas(paso.resaltar ?? []);
    setAislar(paso.solo ? "resaltadas" : false);
    setSeleccion(null);
    setReto(paso.reto ? { estado: "espera" } : null);
    setPanel({ tipo: "clase", id: clase.id, paso: i });
    setPlegado(false);
    setVista(paso.ver && VISTA_VALIDA.has(paso.ver) ? (paso.ver as Vista) : null);
    if (paso.ver) {
      const especial = paso.ver === "todo" || paso.ver === "piezas" || paso.ver === "resaltadas" || paso.ver.startsWith("sistema:") || VISTA_VALIDA.has(paso.ver);
      ir(especial ? paso.ver : (piezaDeClave(paso.ver)?.id ?? "todo"));
    }
  };
  const salirClase = () => {
    setPanel(null);
    setReto(null);
    setResaltadas([]);
    setAislar(false);
    setSeleccion(null);
  };

  const pantallaCompleta = () => {
    const el = marco.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void el.requestFullscreen?.().catch(() => {});
  };
  const salir = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    setInmersivo(false);
  };

  const resultados = useMemo(() => {
    const q = sinAcentos(busca.trim());
    if (q.length < 2) return [];
    return INDICE.filter((x) => x.plano.includes(q))
      .sort((a, b) => a.plano.indexOf(q) - b.plano.indexOf(q) || a.n.es.length - b.n.es.length)
      .slice(0, 8);
  }, [busca]);

  const sistemasBuscados = useMemo(() => {
    const q = sinAcentos(busca.trim());
    if (q.length < 3) return [];
    return ORDEN.filter((s) =>
      sinAcentos(`${SISTEMA_INFO[s].nombre} ${PALABRAS_SISTEMA[s] ?? ""}`)
        .split(/\s+/)
        .some((w) => w.startsWith(q))
    ).slice(0, 2);
  }, [busca]);

  const nombreHover = hover ? (NOMBRES[hover.clave]?.es ?? hover.clave) : null;
  const plegar = () => setPlegado((x) => !x);

  // ── Paneles de la derecha ─────────────────────────────────────────────────
  let contenidoPanel: ReactNode = null;
  if (panel?.tipo === "pieza" && seleccion) {
    const n = NOMBRES[seleccion.clave] ?? { es: seleccion.clave, s: seleccion.sistema };
    const sisSel = SISTEMA_INFO[seleccion.sistema];
    const funcion = funcionDe(seleccion.clave);
    contenidoPanel = (
      <>
        <Cabecera rotulo={sisSel.nombre} color={sisSel.color} icono={sisSel.icono} titulo={n.es} onCerrar={() => elegir(null)} plegado={plegado} onPlegar={plegar}>
          {n.c && (
            <div style={{ marginTop: 4, fontSize: 15, color: T.tenue }}>
              También le dicen: <strong style={{ color: T.texto }}>{n.c}</strong>
            </div>
          )}
        </Cabecera>
        <div className="ac-panel-cuerpo">
          {seleccion.lado && (
            <div style={{ marginTop: 12 }}>
              <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: 99, background: "rgba(255,255,255,.08)", fontSize: 13, fontWeight: 700 }}>Lado {seleccion.lado} del cuerpo</span>
            </div>
          )}
          {funcion && (
            <>
              <div style={{ ...ROTULO, marginTop: 16 }}>¿Qué hace?</div>
              <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.55 }}>{funcion}</p>
            </>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <Boton icono={aislar === "pieza" ? "fa-solid fa-people-group" : "fa-solid fa-cube"} fuerte={aislar !== "pieza"} onClick={() => {
                setAislar((x) => (x === "pieza" ? false : "pieza"));
                ir(seleccion.id);
              }}
            >
              {aislar === "pieza" ? "Ver todo otra vez" : "Verla sola"}
            </Boton>
            <Boton icono="fa-solid fa-magnifying-glass-plus" onClick={() => ir(seleccion.id)}>
              Acercar
            </Boton>
            <Boton icono={sisSel.icono} onClick={() => abrirSistema(seleccion.sistema)}>
              Su sistema
            </Boton>
          </div>
        </div>
      </>
    );
  } else if (panel?.tipo === "sistema") {
    const inf = SISTEMA_INFO[panel.s];
    const clase = CLASES.find((c) => c.sistema === panel.s);
    contenidoPanel = (
      <>
        <Cabecera rotulo={inf.tambien ?? "Sistema del cuerpo"} color={inf.color} icono={inf.icono} titulo={inf.nombre} onCerrar={() => setPanel(null)} plegado={plegado} onPlegar={plegar} />
        <div className="ac-panel-cuerpo">
          <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55 }}>{inf.que}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {clase && (
              <Boton icono="fa-solid fa-chalkboard-user" fuerte onClick={() => irPaso(clase, 0)}>
                Empezar la clase
              </Boton>
            )}
            <Boton
              icono="fa-solid fa-crosshairs"
              onClick={() => {
                despachar({ tipo: "solo", sistemas: [panel.s] });
                setModo("cuerpo");
                ir(`sistema:${panel.s}`);
              }}
            >
              Solo este
            </Boton>
            <Boton
              icono="fa-solid fa-table-cells"
              onClick={() => {
                despachar({ tipo: "solo", sistemas: [panel.s] });
                if (panel.s === "esqueleto") setHueso("solido");
                cambiarModo("piezas");
              }}
            >
              Desarmarlo
            </Boton>
          </div>
          {inf.partes.length > 0 && (
            <>
              <div style={{ ...ROTULO, marginTop: 18 }}>Sus partes principales</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {inf.partes.map((k) => {
                  const nk = NOMBRES[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      className="ac-chip"
                      title={nk?.es}
                      onClick={() => elegirClave(k)}
                      style={{ minHeight: 36, padding: "0 12px", borderRadius: 99, border: `1px solid ${T.linea}`, background: "rgba(255,255,255,.05)", color: T.texto, fontFamily: T.fuente, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {nk?.c && nk.c.length < 24 ? nk.c : nk?.es}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {inf.datos.length > 0 && (
            <>
              <div style={{ ...ROTULO, marginTop: 18 }}>¿Sabías que…?</div>
              <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.55, color: "#d3dae7" }}>
                {inf.datos.map((d) => (
                  <li key={d} style={{ marginBottom: 6 }}>
                    {d}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(140,196,106,.12)", border: "1px solid rgba(140,196,106,.3)" }}>
            <div style={{ ...ROTULO, color: "#a9d98a" }}>
              <i className="fa-solid fa-heart" aria-hidden style={{ marginRight: 6 }} />
              Cuídalo
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.5 }}>{inf.cuida}</p>
          </div>
        </div>
      </>
    );
  } else if (panel?.tipo === "clases") {
    contenidoPanel = (
      <>
        <Cabecera rotulo="Aprende con el atlas" color={T.oro} icono="fa-solid fa-chalkboard-user" titulo="Clases guiadas" onCerrar={() => setPanel(null)} plegado={plegado} onPlegar={plegar} />
        <div className="ac-panel-cuerpo" style={{ marginTop: 10 }}>
          {CLASES.map((c) => {
            const inf = c.sistema ? SISTEMA_INFO[c.sistema] : null;
            return (
              <button
                key={c.id}
                type="button"
                className="ac-fila"
                onClick={() => irPaso(c, 0)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, padding: "8px 10px", borderRadius: 10, border: "none", background: "transparent", color: T.texto, fontFamily: T.fuente, textAlign: "left", cursor: "pointer" }}
              >
                <span style={{ width: 34, height: 34, borderRadius: 9, background: inf?.color ?? T.oro, color: "#141821", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, flex: "0 0 auto" }}>
                  <i className={inf?.icono ?? "fa-solid fa-person"} aria-hidden />
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{c.titulo}</span>
                  <span style={{ display: "block", fontSize: 13, color: T.tenue }}>
                    {c.resumen} · {c.pasos.length} pasos
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (claseActual && pasoActual && panel?.tipo === "clase") {
    const i = panel.paso;
    const total = claseActual.pasos.length;
    const inf = claseActual.sistema ? SISTEMA_INFO[claseActual.sistema] : null;
    const color = inf?.color ?? T.oro;
    const ultimo = i === total - 1;
    const bien = reto?.estado === "bien";
    const mal = reto?.estado === "mal";
    contenidoPanel = (
      <>
        <Cabecera rotulo={`Clase · ${claseActual.titulo}`} color={color} icono="fa-solid fa-chalkboard-user" titulo={pasoActual.titulo} onCerrar={salirClase} plegado={plegado} onPlegar={plegar}>
          <div style={{ display: "flex", gap: 4, marginTop: 10 }} role="img" aria-label={`Paso ${i + 1} de ${total}`}>
            {claseActual.pasos.map((_, j) => (
              <span key={j} style={{ flex: 1, height: 4, borderRadius: 99, background: j <= i ? color : "rgba(255,255,255,.14)" }} />
            ))}
          </div>
        </Cabecera>
        <div className="ac-panel-cuerpo">
          <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.6 }}>{pasoActual.texto}</p>
          {pasoActual.reto && (
            <div
              aria-live="polite"
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 10,
                background: bien ? "rgba(140,196,106,.16)" : mal ? "rgba(239,107,107,.14)" : "rgba(184,235,80,.12)",
                border: `1px solid ${bien ? "rgba(140,196,106,.45)" : mal ? "rgba(239,107,107,.4)" : "rgba(184,235,80,.4)"}`,
              }}
            >
              <div style={{ ...ROTULO, color: bien ? "#a9d98a" : mal ? "#f19a9a" : T.oro }}>
                <i className={bien ? "fa-solid fa-circle-check" : "fa-solid fa-hand-pointer"} aria-hidden style={{ marginRight: 6 }} />
                {bien ? "¡Bien!" : "Reto"}
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>
                {bien ? pasoActual.reto.bien : reto?.estado === "mal" ? `Tocaste: ${reto.nombre}. Intenta otra vez.` : pasoActual.reto.pide}
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
            <Boton icono="fa-solid fa-arrow-left" desactivado={i === 0} onClick={() => irPaso(claseActual, i - 1)}>
              Anterior
            </Boton>
            {ultimo ? (
              <Boton icono="fa-solid fa-flag-checkered" fuerte onClick={() => setPanel({ tipo: "clases" })}>
                Terminar
              </Boton>
            ) : (
              <Boton fuerte={!pasoActual.reto || bien} onClick={() => irPaso(claseActual, i + 1)}>
                {pasoActual.reto && !bien ? "Saltar" : "Siguiente"}
                <i className="fa-solid fa-arrow-right" aria-hidden />
              </Boton>
            )}
          </div>
        </div>
      </>
    );
  }

  // Laboratorio del Cuerpo CEN: salón pintado, Citlali, misión y álbum. Solo
  // dentro del marco del laboratorio.
  const laboratorio = enMarco;

  const escena = (
    <div
      ref={marco}
      data-testid="atlas-escena"
      className="ac-raiz"
      style={
        inmersivo
          ? { position: "fixed", inset: 0, zIndex: 1000, background: T.fondo, fontFamily: T.fuente, color: T.texto }
          : enMarco
          ? { position: "absolute", inset: 0, overflow: "hidden", background: laboratorio ? "#000a1f" : T.fondo, fontFamily: T.fuente, color: T.texto }
          : { position: "relative", height: "min(84vh, 820px)", minHeight: 540, borderRadius: 16, overflow: "hidden", background: T.fondo, fontFamily: T.fuente, color: T.texto }
      }
    >
      {laboratorio && <FondoLaboratorio />}
      <SceneBoundary fallback={<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.tenue, fontSize: 16 }}>Este equipo no pudo abrir la escena 3D.</div>}>
        <AtlasCuerpoScene
          visibles={sis.visibles}
          cargar={sis.cargar}
          hueso={hueso}
          seleccion={seleccion?.id ?? null}
          resaltadas={resaltadas}
          aislar={aislar}
          separar={separar}
          modo={modo}
          enfoque={enfoque}
          onSeleccion={elegir}
          onHover={onHover}
          onListo={onListo}
          onConteo={onConteo}
        />
      </SceneBoundary>
      {!listo && <Cargando />}
      {laboratorio && <CapaCuerpo evento={estampaDe(seleccion)} />}

      {/* Arriba: título · vistas · acciones. */}
      <header className="ac-arriba" style={{ position: "absolute", top: 16, left: 20, right: 16, display: "flex", alignItems: "center", gap: 16, pointerEvents: "none" }}>
        <div className="ac-titulo" style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{ ...ROTULO, color: T.oro }}>Atlas del cuerpo humano</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>Toca cualquier pieza para saber qué es</div>
        </div>
        <div role="tablist" aria-label="Vista" className="ac-vistas" style={{ ...PANEL, display: "flex", padding: 4, gap: 2, pointerEvents: "auto" }}>
          {VISTAS.map(({ v, et }) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={vista === v}
              onClick={() => {
                setVista(v);
                ir(v);
              }}
              style={{ minHeight: 36, padding: "0 14px", borderRadius: 8, border: "none", background: vista === v ? "rgba(255,255,255,.14)" : "transparent", color: vista === v ? "#fff" : T.tenue, fontFamily: T.fuente, fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {et}
            </button>
          ))}
        </div>
        <div className="ac-acciones" style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end", gap: 8, pointerEvents: "auto" }}>
          <BotonIcono icono="fa-solid fa-circle-info" titulo="De dónde salen estas formas" onClick={() => setInfo((x) => !x)} activo={info} />
          {inmersivo ? (
            <>
              <BotonIcono icono="fa-solid fa-expand" titulo="Pantalla completa del navegador" onClick={pantallaCompleta} />
              <BotonIcono icono="fa-solid fa-xmark" titulo="Salir de la vista inmersiva" onClick={salir} />
            </>
          ) : (
            enMarco ? null : <BotonIcono icono="fa-solid fa-up-right-and-down-left-from-center" titulo="Abrir a pantalla completa" onClick={() => setInmersivo(true)} />
          )}
        </div>
      </header>

      {info && (
        <div className="ac-menu" style={{ ...PANEL, position: "absolute", top: 72, right: 16, width: "min(360px, calc(100% - 32px))", padding: "14px 16px", zIndex: 6 }}>
          <div style={{ ...ROTULO, marginBottom: 8 }}>¿De dónde salen estas formas?</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
            Cada pieza es un modelo hecho a partir de estudios de cuerpos reales, no un dibujo inventado. Los colores sí son de enseñanza: arterias rojas, venas azules, nervios amarillos, ganglios verdes y un color
            por lóbulo del cerebro.
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: T.tenue, lineHeight: 1.5 }}>
            Modelos: «BodyParts3D», The Database Center for Life Science (CC BY-SA 2.1 Japón) y «Z-Anatomy, the libre 3D atlas of anatomy» (CC BY-SA 4.0), aligerados para la web. Nombres: Terminologia
            Anatomica (TA2).
          </p>
        </div>
      )}

      {/* Izquierda: buscador, clases y sistemas. */}
      <nav aria-label="Sistemas del cuerpo" className="ac-riel" style={{ ...PANEL, position: "absolute", left: 16, top: laboratorio ? 380 : 92, maxHeight: laboratorio ? "calc(100% - 468px)" : "calc(100% - 180px)", width: 252, padding: 8, overflowY: "auto" }}>
        <div className="ac-buscar" style={{ position: "relative", padding: "2px 2px 6px" }}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden style={{ position: "absolute", left: 14, top: 16, color: T.tenue, fontSize: 13 }} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar: fémur, bazo, aorta…"
            aria-label="Buscar una pieza del cuerpo"
            style={{ width: "100%", height: 44, padding: "0 12px 0 34px", borderRadius: 9, border: `1px solid ${T.linea}`, background: "rgba(255,255,255,.06)", color: T.texto, fontFamily: T.fuente, fontSize: 15, outline: "none" }}
          />
          {(resultados.length > 0 || sistemasBuscados.length > 0) && (
            <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
              {sistemasBuscados.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="ac-fila"
                    onClick={() => {
                      abrirSistema(s);
                      setBusca("");
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 44, padding: "6px 10px", borderRadius: 8, border: "none", background: "transparent", color: T.texto, fontFamily: T.fuente, fontSize: 14, fontWeight: 800, textAlign: "left", cursor: "pointer" }}
                  >
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: SISTEMA_INFO[s].color, color: "#141821", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, flex: "0 0 auto" }}>
                      <i className={SISTEMA_INFO[s].icono} aria-hidden />
                    </span>
                    {SISTEMA_INFO[s].nombre}
                  </button>
                </li>
              ))}
              {resultados.map((r) => (
                <li key={r.clave}>
                  <button
                    type="button"
                    className="ac-fila"
                    onClick={() => {
                      elegirClave(r.clave);
                      setBusca("");
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 44, padding: "6px 10px", borderRadius: 8, border: "none", background: "transparent", color: T.texto, fontFamily: T.fuente, fontSize: 14, fontWeight: 600, textAlign: "left", cursor: "pointer" }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: SISTEMA_INFO[r.n.s].color, flex: "0 0 auto" }} />
                    <span>
                      {r.n.es}
                      {r.n.c && <span style={{ display: "block", fontSize: 12, color: T.tenue, fontWeight: 500 }}>{r.n.c}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="ac-fila ac-clases"
          onClick={() => {
            setPanel({ tipo: "clases" });
            setPlegado(false);
          }}
          style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 46, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(184,235,80,.35)", background: "rgba(184,235,80,.10)", color: T.texto, fontFamily: T.fuente, fontSize: 15, fontWeight: 800, cursor: "pointer", textAlign: "left" }}
        >
          <i className="fa-solid fa-chalkboard-user" aria-hidden style={{ width: 22, textAlign: "center", color: T.oro }} />
          <span>Clases guiadas</span>
        </button>
        <button
          type="button"
          className="ac-fila ac-todo"
          onClick={() => {
            elegir(null);
            setPanel(null);
            setReto(null);
            setResaltadas([]);
            setAislar(false);
            setModo("cuerpo");
            setSeparar(0);
            despachar({ tipo: "solo", sistemas: INICIALES });
            setHueso("rayos");
            setVista("frente");
            ir("todo");
          }}
          style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 44, marginTop: 4, padding: "6px 10px", borderRadius: 8, border: "none", background: "transparent", color: T.texto, fontFamily: T.fuente, fontSize: 15, fontWeight: 700, cursor: "pointer", textAlign: "left" }}
        >
          <i className="fa-solid fa-person" aria-hidden style={{ width: 22, textAlign: "center", color: T.oro }} />
          Todo el cuerpo
        </button>
        <div className="ac-grupo-t" style={{ ...ROTULO, fontSize: 11, padding: "10px 10px 4px" }}>
          Sistemas
        </div>
        {ORDEN.map((s) => {
          const inf = SISTEMA_INFO[s];
          const on = sis.visibles[s];
          const abierto = panel?.tipo === "sistema" && panel.s === s;
          return (
            <div key={s} className="ac-sistema" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button
                type="button"
                className="ac-fila"
                title={`Ir a: ${inf.nombre}`}
                aria-current={abierto || undefined}
                onClick={() => abrirSistema(s)}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minHeight: 44, padding: "4px 10px", borderRadius: 8, border: "none", background: abierto ? "rgba(255,255,255,.09)" : "transparent", boxShadow: abierto ? `inset 3px 0 0 ${T.oro}` : "none", color: on ? T.texto : T.tenue, fontFamily: T.fuente, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", opacity: on ? 1 : 0.6 }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 7, background: inf.color, color: "#141821", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, flex: "0 0 auto" }}>
                  <i className={inf.icono} aria-hidden />
                </span>
                <span className="ac-sistema-t">{inf.nombre.replace(/^Sistema /, "").replace(/^./, (c) => c.toUpperCase())}</span>
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${on ? "Ocultar" : "Mostrar"}: ${inf.nombre}`}
                title={on ? "Ocultar" : "Mostrar"}
                className="ac-ojo"
                onClick={() => despachar({ tipo: "alternar", s })}
                style={{ width: 44, height: 44, borderRadius: 8, border: "none", background: "transparent", color: on ? T.texto : T.tenue, cursor: "pointer", fontSize: 14, flex: "0 0 auto" }}
              >
                <i className={on ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"} aria-hidden />
              </button>
            </div>
          );
        })}
        <div className="ac-hueso" style={{ padding: "12px 6px 4px" }}>
          <div style={{ ...ROTULO, fontSize: 11, padding: "0 4px 6px" }}>Los huesos se ven</div>
          <div role="radiogroup" aria-label="Cómo se ven los huesos" style={{ display: "flex", gap: 2, padding: 3, borderRadius: 9, background: "rgba(255,255,255,.06)" }}>
            {(
              [
                ["solido", "Sólidos"],
                ["rayos", "Rayos X"],
                ["oculto", "Ocultos"],
              ] as const
            ).map(([m, et]) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={hueso === m}
                onClick={() => {
                  setHueso(m);
                  despachar({ tipo: "mostrar", s: ["esqueleto"] });
                }}
                style={{ flex: 1, minHeight: 38, borderRadius: 7, border: "none", background: hueso === m ? "rgba(255,255,255,.16)" : "transparent", color: hueso === m ? "#fff" : T.tenue, fontFamily: T.fuente, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                {et}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Lo que hay bajo el puntero. */}
      {nombreHover && hover && (
        <div className="ac-pista" aria-live="polite" style={{ ...PANEL, position: "absolute", left: "50%", bottom: 84, transform: "translateX(-50%)", padding: "8px 16px", fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", maxWidth: "calc(100% - 32px)", overflow: "hidden", textOverflow: "ellipsis", pointerEvents: "none" }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: SISTEMA_INFO[hover.sistema].color, marginRight: 10, verticalAlign: "middle" }} />
          {nombreHover}
          {hover.lado && <span style={{ color: T.tenue, fontWeight: 500 }}> · {hover.lado}</span>}
        </div>
      )}

      {/* Abajo: armar / desarmar. */}
      <div className="ac-barra" style={{ ...PANEL, position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10, padding: 6 }}>
        <div role="radiogroup" aria-label="Cómo ver el cuerpo" style={{ display: "flex", gap: 2, padding: 2, borderRadius: 9, background: "rgba(255,255,255,.06)" }}>
          {(
            [
              ["cuerpo", "Cuerpo armado", "fa-solid fa-person"],
              ["piezas", "Todas las piezas", "fa-solid fa-table-cells"],
            ] as const
          ).map(([m, et, ic]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={modo === m}
              aria-label={et}
              onClick={() => cambiarModo(m)}
              style={{ minHeight: 40, padding: "0 12px", borderRadius: 7, border: "none", background: modo === m ? "rgba(255,255,255,.16)" : "transparent", color: modo === m ? "#fff" : T.tenue, fontFamily: T.fuente, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
            >
              <i className={ic} aria-hidden />
              <span className="ac-barra-t">{et}</span>
            </button>
          ))}
        </div>
        <label className="ac-separar" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", opacity: modo === "cuerpo" ? 1 : 0.35 }}>
          <span style={{ ...ROTULO, fontSize: 11, whiteSpace: "nowrap" }}>Separar</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(separar * 100)}
            disabled={modo !== "cuerpo"}
            onChange={(e) => setSeparar(+e.target.value / 100)}
            aria-label="Separar las piezas del cuerpo"
            style={{ width: 150, accentColor: T.oro }}
          />
        </label>
        <span className="ac-conteo" style={{ fontSize: 13, color: T.tenue, padding: "0 8px 0 2px", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          <strong style={{ color: T.texto }}>{conteo.toLocaleString("es-MX")}</strong> piezas
        </span>
      </div>

      {/* Derecha: ficha de pieza, de sistema, lista de clases o la clase. */}
      {contenidoPanel && (
        <section className="ac-panel" data-plegado={plegado ? "1" : "0"} style={{ ...PANEL, position: "absolute", top: laboratorio ? 300 : 92, right: 16, width: 380, maxHeight: laboratorio ? "calc(100% - 316px)" : "calc(100% - 180px)", overflowY: "auto", padding: 18, zIndex: 4 }}>
          {contenidoPanel}
        </section>
      )}

      <style>{`
        .ac-raiz .ac-fila:hover, .ac-raiz .ac-ojo:hover, .ac-raiz .ac-chip:hover { background: rgba(255,255,255,.08) !important; }
        .ac-raiz input::placeholder { color: ${T.tenue}; }
        @media (min-width: 821px) {
          .ac-raiz .ac-solo-movil { display: none; }
        }
        @media (max-width: 820px) {
          .ac-raiz .ac-arriba { left: 12px !important; right: 12px !important; top: 12px !important; flex-wrap: wrap; gap: 10px !important; }
          .ac-raiz .ac-titulo { flex: 1 1 100% !important; }
          .ac-raiz .ac-vistas { order: 2; }
          .ac-raiz .ac-vistas button { padding: 0 10px !important; }
          .ac-raiz .ac-acciones { order: 3; flex: 0 0 auto !important; margin-left: auto; gap: 6px !important; }
          .ac-raiz .ac-menu { top: 124px !important; }
          .ac-raiz .ac-riel { top: auto !important; bottom: 70px !important; left: 12px !important; right: 12px !important; width: auto !important; max-height: none !important; padding: 4px !important; display: flex; align-items: center; overflow-x: auto; overflow-y: hidden; }
          .ac-raiz .ac-riel .ac-buscar, .ac-raiz .ac-riel .ac-grupo-t, .ac-raiz .ac-riel .ac-ojo, .ac-raiz .ac-riel .ac-todo, .ac-raiz .ac-riel .ac-hueso { display: none !important; }
          .ac-raiz .ac-riel .ac-clases { width: auto !important; flex: 0 0 auto; flex-direction: column; gap: 4px !important; font-size: 12px !important; min-width: 70px; padding: 6px 4px !important; justify-content: center; }
          .ac-raiz .ac-riel .ac-sistema .ac-fila { flex-direction: column; gap: 4px !important; min-width: 74px; padding: 6px 4px !important; font-size: 12px !important; justify-content: center; box-shadow: none !important; }
          .ac-raiz .ac-riel .ac-sistema-t { white-space: nowrap; max-width: 84px; overflow: hidden; text-overflow: ellipsis; text-align: center; }
          .ac-raiz .ac-pista { display: none; }
          .ac-raiz .ac-barra { left: 12px !important; right: 12px !important; transform: none !important; bottom: 12px !important; justify-content: space-between; gap: 6px !important; }
          .ac-raiz .ac-barra-t, .ac-raiz .ac-separar > span { display: none; }
          .ac-raiz .ac-separar input { width: 100px !important; }
          .ac-raiz .ac-panel { top: auto !important; left: 12px !important; right: 12px !important; width: auto !important; bottom: 146px !important; max-height: 52% !important; padding: 14px !important; }
          .ac-raiz .ac-panel h2 { font-size: 21px !important; }
          .ac-raiz .ac-panel[data-plegado="1"] .ac-panel-cuerpo { display: none; }
        }
      `}</style>
    </div>
  );

  if (enMarco) return <EscenaLab lleno>{escena}</EscenaLab>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: T.fuente }}>
      {inmersivo && typeof document !== "undefined" ? (
        <>
          {createPortal(escena, document.body)}
          <div style={{ padding: 24, borderRadius: 16, background: "#0d121d", color: T.texto, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>El atlas está abierto a pantalla completa.</span>
            <button
              type="button"
              onClick={() => setInmersivo(true)}
              style={{ minHeight: 44, padding: "0 18px", borderRadius: 10, border: "none", background: T.oro, color: "#00153b", fontFamily: T.fuente, fontSize: 15, fontWeight: 800, cursor: "pointer" }}
            >
              Volver al atlas
            </button>
          </div>
        </>
      ) : (
        escena
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {[
          ["Toma una clase", "Abre «Clases guiadas» y empieza por «El cuerpo humano». Cada sistema tiene la suya, con retos."],
          ["Desarma el cuerpo", "Mueve «Separar» o elige «Todas las piezas». ¿Cuántas piezas tiene el esqueleto solo?"],
          ["Busca y encuentra", "Escribe «estribo» en el buscador. ¿Dónde está el hueso más pequeño del cuerpo?"],
          ["Sigue el camino", "Toca, en orden, las piezas por donde pasa un bocado: de la lengua al intestino grueso."],
        ].map(([titulo, texto]) => (
          <div key={titulo} style={{ padding: 16, borderRadius: 12, background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#b45309" }}>{titulo}</div>
            <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.5, color: "#334155" }}>{texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
