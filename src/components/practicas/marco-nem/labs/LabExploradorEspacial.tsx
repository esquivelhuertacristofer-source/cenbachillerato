"use client";
// =============================================================================
// Lab — Explorador espacial
// =============================================================================
// Dos vistas en 3D con fotografías reales:
//   • Sistema Solar: el Sol, los ocho planetas donde están hoy, sus órbitas y
//     ejes de giro, el cinturón de asteroides, el de Kuiper y un cometa;
//   • Tierra y Luna: el día y la noche de este instante, las luces de las
//     ciudades, las nubes y la Luna en la fase del día.
//
// INTERFAZ. Estilo de sala de control: el espacio ocupa toda la pantalla y los
// mandos son pocos y discretos. A la izquierda, el riel de cuerpos con su
// miniatura hecha de la misma fotografía; abajo, la barra del tiempo; arriba,
// la vista y dos menús (capas e información). La ficha de cada cuerpo enseña
// con dibujos: tamaño junto a la Tierra a escala real, lugar en la fila de
// planetas, termómetro, y la fase de la Luna dibujada.
// =============================================================================

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import type { PracticaNemProps } from "../tipos";
import { SceneBoundary } from "./_kit";
import { EscenaLab, useEnMarco } from "./_escena";
import type { ExploradorEspacialSceneProps, ModoEspacio } from "./ExploradorEspacialScene";
import { RUTA } from "./explorador-espacial-comun";
import { CapaObservatorio, CAJA_HOLOGRAMA, FondoObservatorio } from "./ObservatorioCEN";
import { FICHAS, PLANETAS, elongacionLuna, nombreFase, type Ficha, type Planeta } from "./explorador-espacial-datos";

const ExploradorEspacialScene = dynamic<ExploradorEspacialSceneProps>(
  () => import("./ExploradorEspacialScene").then((m) => m.ExploradorEspacialScene),
  { ssr: false, loading: () => <Cargando /> }
);

// ── Estilo ──────────────────────────────────────────────────────────────────
const T = {
  fuente: "var(--font-cen),'Montserrat',var(--font-sans),sans-serif",
  texto: "#e9eef8",
  tenue: "#a9c0e6",
  linea: "rgba(184,235,80,.18)",
  oro: "#b8eb50",
  panel: "rgba(0,21,59,.78)",
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
const NUM: CSSProperties = { fontVariantNumeric: "tabular-nums" };

function Cargando() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: T.tenue, fontFamily: T.fuente }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 22 }} />
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".04em" }}>Preparando el viaje…</span>
    </div>
  );
}

// ── Miniaturas: una esfera hecha con la fotografía del cuerpo ───────────────
function Esfera({ textura, tam, girar, anillo, brillo }: { textura: string; tam: number; girar?: boolean; anillo?: boolean; brillo?: boolean }) {
  return (
    <span style={{ position: "relative", width: tam, height: tam, flex: "0 0 auto", display: "inline-block" }} aria-hidden>
      {anillo && (
        <span
          style={{
            position: "absolute",
            left: -tam * 0.42,
            right: -tam * 0.42,
            top: "50%",
            height: tam * 0.42,
            transform: "translateY(-50%) rotate(-18deg)",
            borderRadius: "50%",
            border: `${Math.max(2, tam * 0.07)}px solid rgba(222,204,160,.75)`,
            boxShadow: "0 0 0 1px rgba(0,0,0,.25)",
          }}
        />
      )}
      <span
        className={girar ? "ee-gira" : undefined}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundImage: `url(${RUTA}/${textura}-2k.webp)`,
          backgroundSize: "200% 100%",
          backgroundPosition: "30% 50%",
          boxShadow: brillo
            ? `0 0 ${tam * 0.35}px rgba(255,170,60,.65), inset ${-tam * 0.08}px ${-tam * 0.06}px ${tam * 0.2}px rgba(120,40,0,.45)`
            : `inset ${-tam * 0.16}px ${-tam * 0.1}px ${tam * 0.28}px rgba(0,0,0,.82), inset ${tam * 0.04}px ${tam * 0.04}px ${tam * 0.1}px rgba(255,255,255,.22)`,
        }}
      />
    </span>
  );
}

function IconoCuerpo({ id, tam }: { id: string; tam: number }) {
  const p = PLANETAS.find((x) => x.id === id);
  if (p) return <Esfera textura={p.textura} tam={tam} anillo={!!p.anillo} />;
  if (id === "sol") return <Esfera textura="sol" tam={tam} brillo />;
  if (id === "luna") return <Esfera textura="luna" tam={tam} />;
  if (id === "mexico")
    return (
      <span style={{ position: "relative", display: "inline-block" }}>
        <Esfera textura="tierra-dia" tam={tam} />
        <i className="fa-solid fa-location-dot" aria-hidden style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", color: T.oro, fontSize: tam * 0.5, filter: "drop-shadow(0 1px 2px #000)" }} />
      </span>
    );
  if (id === "sistema" || id === "inicio")
    return (
      <svg width={tam} height={tam} viewBox="-20 -20 40 40" aria-hidden>
        <circle r="4.5" fill="#f3b54a" />
        {[8, 12.5, 17].map((r) => (
          <ellipse key={r} rx={r} ry={r * 0.45} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1" />
        ))}
        <circle cx="12.5" cy="0" r="1.8" fill="#7fb2ff" />
      </svg>
    );
  if (id === "asteroides" || id === "kuiper")
    return (
      <svg width={tam} height={tam} viewBox="-20 -20 40 40" aria-hidden>
        {[
          [-9, -4, 4],
          [3, -9, 3],
          [8, 4, 4.5],
          [-3, 8, 3],
          [-12, 9, 2],
          [12, -9, 2],
        ].map(([x = 0, y = 0, r = 0], i) => (
          <polygon key={i} points={`${x - r},${y} ${x - r * 0.3},${y - r} ${x + r},${y - r * 0.4} ${x + r * 0.6},${y + r} ${x - r * 0.6},${y + r * 0.8}`} fill={id === "kuiper" ? "#b9cde6" : "#a8a097"} />
        ))}
      </svg>
    );
  // cometa
  return (
    <svg width={tam} height={tam} viewBox="-20 -20 40 40" aria-hidden>
      <defs>
        <linearGradient id="ee-cola" x1="0" x2="1">
          <stop offset="0" stopColor="#cfe6ff" stopOpacity="0" />
          <stop offset="1" stopColor="#cfe6ff" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <path d="M-18 14 L6 -4 L9 0 Z" fill="url(#ee-cola)" />
      <circle cx="9" cy="-4" r="4" fill="#eef6ff" />
    </svg>
  );
}

// ── Destinos, velocidades y capas ───────────────────────────────────────────
type Destino = { a: string; etiqueta: string };
const DESTINOS: Record<ModoEspacio, { grupo: string | null; items: Destino[] }[]> = {
  sistema: [
    { grupo: null, items: [{ a: "sistema", etiqueta: "Todo el sistema" }, { a: "sol", etiqueta: "Sol" }] },
    { grupo: "Planetas", items: PLANETAS.map((p) => ({ a: p.id, etiqueta: p.nombre })) },
    {
      grupo: "Más allá",
      items: [
        { a: "asteroides", etiqueta: "Asteroides" },
        { a: "kuiper", etiqueta: "Cinturón de Kuiper" },
        { a: "cometa", etiqueta: "Cometa" },
      ],
    },
  ],
  tierra: [
    {
      grupo: null,
      items: [
        { a: "mexico", etiqueta: "México" },
        { a: "tierra", etiqueta: "La Tierra" },
        { a: "luna", etiqueta: "La Luna" },
        { a: "sol", etiqueta: "El Sol" },
      ],
    },
  ],
};

const VELOCIDADES: Record<ModoEspacio, { v: number; corto: string; largo: string }[]> = {
  sistema: [
    { v: 86_400, corto: "Día", largo: "1 día por segundo" },
    { v: 604_800, corto: "Semana", largo: "1 semana por segundo" },
    { v: 2_629_800, corto: "Mes", largo: "1 mes por segundo" },
    { v: 31_557_600, corto: "Año", largo: "1 año por segundo" },
  ],
  tierra: [
    { v: 1, corto: "Real", largo: "Tiempo real" },
    { v: 3600, corto: "Hora", largo: "1 hora por segundo" },
    { v: 86_400, corto: "Día", largo: "1 día por segundo" },
  ],
};
const VELOCIDAD_INICIAL: Record<ModoEspacio, number> = { sistema: 604_800, tierra: 1 };
const ENFOQUE_INICIAL: Record<ModoEspacio, string> = { sistema: "sistema", tierra: "inicio" };

const fmtHora = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDia = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "long", year: "numeric" });
const unDecimal = (n: number) => (Math.round(n * 10) / 10).toLocaleString("es-MX");

// ── Piezas de la interfaz ───────────────────────────────────────────────────
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

function Interruptor({ etiqueta, detalle, activo, onClick }: { etiqueta: string; detalle: string; activo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 52, padding: "8px 4px", background: "none", border: "none", borderTop: `1px solid ${T.linea}`, color: T.texto, textAlign: "left", cursor: "pointer", fontFamily: T.fuente }}
    >
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>{etiqueta}</span>
        <span style={{ display: "block", fontSize: 13, color: T.tenue, marginTop: 2 }}>{detalle}</span>
      </span>
      <span style={{ width: 40, height: 24, borderRadius: 99, background: activo ? T.oro : "rgba(255,255,255,.16)", position: "relative", flex: "0 0 auto", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: activo ? 19 : 3, width: 18, height: 18, borderRadius: 99, background: activo ? "#00153b" : "#dfe5f1", transition: "left .2s" }} />
      </span>
    </button>
  );
}

/** La Luna dibujada en su fase (vista desde México: crece por la derecha). */
function FaseLuna({ elong, tam }: { elong: number; tam: number }) {
  const r = 40;
  const e = (elong * Math.PI) / 180;
  const creciente = elong <= 180;
  const rx = Math.abs(Math.cos(e)) * r;
  // Mitad derecha iluminada; el terminador es media elipse que come o suma luz.
  const barre = Math.cos(e) > 0 ? 0 : 1;
  const d = `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${rx} ${r} 0 0 ${barre} 0 ${-r} Z`;
  return (
    <svg width={tam} height={tam} viewBox="-44 -44 88 88" role="img" aria-label={nombreFase(elong)}>
      <circle r={r} fill="#1e2433" />
      <path d={d} fill="#eae6da" transform={creciente ? undefined : "scale(-1 1)"} />
      <circle r={r} fill="none" stroke="rgba(255,255,255,.18)" />
    </svg>
  );
}

function dato(datos: Ficha["datos"], empieza: string) {
  return datos.find((d) => d.etiqueta.startsWith(empieza))?.valor;
}

function Mosaico({ rotulo, valor, children }: { rotulo: string; valor?: string; children?: ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,.04)", border: `1px solid ${T.linea}`, minWidth: 0 }}>
      <div style={{ ...ROTULO, fontSize: 11, lineHeight: 1.35 }}>{rotulo}</div>
      {valor && <div style={{ ...NUM, fontSize: 17, fontWeight: 800, marginTop: 4, lineHeight: 1.25 }}>{valor}</div>}
      {children}
    </div>
  );
}

/** Tamaño junto a la Tierra, a escala real (el mayor mide 120 px). */
function ComparaTamano({ p }: { p: Planeta }) {
  if (p.id === "tierra") return null;
  const tierra = 6371;
  const mayor = Math.max(p.radioKm, tierra);
  const px = (r: number) => Math.max(3, (r / mayor) * 120);
  const razon = p.radioKm / tierra;
  const texto = razon >= 1 ? `${p.nombre} es ${unDecimal(razon)} veces más ancho que la Tierra.` : `La Tierra es ${unDecimal(1 / razon)} veces más ancha que ${p.nombre}.`;
  return (
    <section style={{ marginTop: 20 }}>
      <div style={ROTULO}>Tamaño junto a la Tierra</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 12, minHeight: 124, paddingLeft: p.anillo ? 44 : 0 }}>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Esfera textura={p.textura} tam={px(p.radioKm)} anillo={!!p.anillo} />
          <span style={{ fontSize: 13, color: T.tenue }}>{p.nombre}</span>
        </span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Esfera textura="tierra-dia" tam={px(tierra)} />
          <span style={{ fontSize: 13, color: T.tenue }}>Tierra</span>
        </span>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>{texto}</p>
    </section>
  );
}

/** Lugar en la fila de planetas: distancia al Sol en línea recta, a escala. */
function FilaDistancias({ p }: { p: Planeta }) {
  const max = PLANETAS[PLANETAS.length - 1]!.ua;
  return (
    <section style={{ marginTop: 20 }}>
      <div style={ROTULO}>Distancia al Sol</div>
      <div style={{ position: "relative", height: 34, marginTop: 10 }}>
        <span style={{ position: "absolute", left: 0, top: 9, width: 16, height: 16, borderRadius: 99, background: "radial-gradient(#ffd27a,#f08a1c)", boxShadow: "0 0 10px rgba(255,170,60,.7)" }} />
        <span style={{ position: "absolute", left: 16, right: 0, top: 16, height: 2, background: "rgba(255,255,255,.14)" }} />
        {PLANETAS.map((x) => {
          const yo = x.id === p.id;
          return (
            <span
              key={x.id}
              title={x.nombre}
              style={{
                position: "absolute",
                left: `calc(16px + (100% - 24px) * ${x.ua / max})`,
                top: yo ? 9 : 13,
                width: yo ? 16 : 8,
                height: yo ? 16 : 8,
                marginLeft: yo ? -8 : -4,
                borderRadius: 99,
                background: x.color,
                boxShadow: yo ? `0 0 0 3px rgba(184,235,80,.35), 0 0 12px ${x.color}` : "none",
                opacity: yo ? 1 : 0.6,
              }}
            />
          );
        })}
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 14 }}>
        {dato(p.datos, "Distancia")} · <span style={{ color: T.tenue }}>{p.id === "tierra" ? "la distancia que usamos de regla" : `${unDecimal(p.ua)} veces la de la Tierra`}</span>
      </p>
    </section>
  );
}

function Termometro({ grados }: { grados: number }) {
  const t = Math.min(1, Math.max(0, (grados + 220) / 700));
  return (
    <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: "linear-gradient(90deg,#5aa3ff,#9be7ff 35%,#ffe08a 50%,#ff8a3d 75%,#ff3d2e)", position: "relative" }}>
      <span style={{ position: "absolute", left: `calc(${t * 100}% - 6px)`, top: -4, width: 12, height: 12, borderRadius: 99, background: "#fff", border: "2px solid #0b1020" }} />
    </div>
  );
}

function IconoGrande({ id }: { id: string }) {
  const p = PLANETAS.find((x) => x.id === id);
  if (p) return <Esfera textura={p.textura} tam={84} girar anillo={!!p.anillo} />;
  if (id === "sol") return <Esfera textura="sol" tam={84} girar brillo />;
  if (id === "luna") return <Esfera textura="luna" tam={84} girar />;
  return (
    <span style={{ width: 84, height: 84, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 99, background: "rgba(255,255,255,.04)", border: `1px solid ${T.linea}` }}>
      <IconoCuerpo id={id} tam={60} />
    </span>
  );
}

function FichaCuerpo({
  f,
  modo,
  hora,
  onCerrar,
  onVerTierra,
  abierta,
  onPlegar,
}: {
  f: Ficha;
  modo: ModoEspacio;
  hora: Date | null;
  onCerrar: () => void;
  onVerTierra: () => void;
  abierta: boolean;
  onPlegar: () => void;
}) {
  const p = PLANETAS.find((x) => x.id === f.id);
  const elong = hora ? elongacionLuna(hora) : null;
  const temp = dato(f.datos, "Temperatura media");
  const grados = temp ? Number(temp.replace("−", "-").replace(/[^\d-]/g, "")) : null;
  const peso = dato(f.datos, "Si en la Tierra");
  const usados = ["Distancia media", "Temperatura media", "Si en la Tierra"];
  const resto = f.datos.filter((d) => !usados.some((u) => d.etiqueta.startsWith(u)) && !(p && d.etiqueta === "Distancia al Sol"));
  return (
    <aside aria-label={`Ficha: ${f.nombre}`} className="ee-ficha" data-abierta={abierta ? "1" : "0"} style={{ ...PANEL, padding: 20, overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <IconoGrande id={f.id} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...ROTULO, color: T.oro, lineHeight: 1.4 }}>{f.tipo}</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 800, letterSpacing: "-.01em", lineHeight: 1.05 }}>{f.nombre}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <BotonIcono icono="fa-solid fa-xmark" titulo="Cerrar ficha" onClick={onCerrar} />
          <span className="ee-solo-movil">
            <BotonIcono icono={abierta ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-up"} titulo={abierta ? "Ocultar datos" : "Ver datos"} onClick={onPlegar} />
          </span>
        </div>
      </div>
      <div className="ee-ficha-cuerpo">
        <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.55, color: "#cfd7e8" }}>{f.resumen}</p>

        {f.id === "luna" && elong !== null && (
          <section style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <FaseLuna elong={elong} tam={72} />
            <div>
              <div style={ROTULO}>Fase de este día</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{nombreFase(elong)}</div>
            </div>
          </section>
        )}

        {p && <ComparaTamano p={p} />}
        {p && <FilaDistancias p={p} />}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginTop: 20 }}>
          {resto.map((d) => (
            <Mosaico key={d.etiqueta} rotulo={d.etiqueta} valor={d.valor} />
          ))}
          {temp && grados !== null && !Number.isNaN(grados) && (
            <Mosaico rotulo="Temperatura media" valor={temp}>
              <Termometro grados={grados} />
            </Mosaico>
          )}
          {peso && (
            <Mosaico rotulo="Tu peso allá" valor={`30 kg → ${peso}`}>
              <div style={{ fontSize: 12, color: T.tenue, marginTop: 4 }}>si en la Tierra pesas 30 kg</div>
            </Mosaico>
          )}
        </div>

        {modo === "sistema" && f.id === "tierra" && (
          <button
            type="button"
            onClick={onVerTierra}
            style={{ marginTop: 16, width: "100%", minHeight: 48, borderRadius: 10, border: "none", background: T.oro, color: "#00153b", fontFamily: T.fuente, fontSize: 15, fontWeight: 800, cursor: "pointer" }}
          >
            Ver la Tierra de cerca <i className="fa-solid fa-arrow-right" aria-hidden />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── El laboratorio ──────────────────────────────────────────────────────────
export function LabExploradorEspacial(_: PracticaNemProps) {
  const [modo, setModo] = useState<ModoEspacio>("sistema");
  // Dentro del marco de laboratorio ya se está a pantalla completa: la escena
  // ocupa el cuerpo del marco y la vista «inmersiva» propia sobra.
  const enMarco = useEnMarco() !== null;
  const [inmersivoPropio, setInmersivo] = useState(true);
  const inmersivo = !enMarco && inmersivoPropio;
  const [velocidad, setVelocidad] = useState(VELOCIDAD_INICIAL.sistema);
  const [pausa, setPausa] = useState(false);
  const [ahoraN, setAhoraN] = useState(0);
  const [enfoque, setEnfoque] = useState<{ a: string; n: number }>({ a: "sistema", n: 0 });
  const [nubes, setNubes] = useState(true);
  const [luces, setLuces] = useState(true);
  const [lunaReal, setLunaReal] = useState(false);
  const [clara, setClara] = useState(false);
  const [orbitas, setOrbitas] = useState(true);
  const [ejes, setEjes] = useState(false);
  const [nombres, setNombres] = useState(true);
  const [ficha, setFicha] = useState<string | null>(null);
  const [abiertaDe, setAbiertaDe] = useState<string | null>(null);
  const [menu, setMenu] = useState<"capas" | "info" | null>(null);
  const [hora, setHora] = useState<Date | null>(null);
  const [listo, setListo] = useState(false);
  const marco = useRef<HTMLDivElement>(null);
  const menuRef = useRef(menu);
  useEffect(() => {
    menuRef.current = menu;
  }, [menu]);

  // Vista inmersiva: sin desplazamiento de fondo; Esc cierra el menú o sale.
  useEffect(() => {
    if (!inmersivo) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.fullscreenElement) return;
      if (menuRef.current) setMenu(null);
      else setInmersivo(false);
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", tecla);
    };
  }, [inmersivo]);

  const cambiarModo = (m: ModoEspacio, destino?: string) => {
    if (m === modo) return;
    setModo(m);
    setListo(false);
    setVelocidad(VELOCIDAD_INICIAL[m]);
    setPausa(false);
    setMenu(null);
    setEnfoque((e) => ({ a: destino ?? ENFOQUE_INICIAL[m], n: e.n + 1 }));
    setFicha(null);
  };
  const ir = (a: string) => {
    setEnfoque((e) => ({ a, n: e.n + 1 }));
    setFicha(a === "sistema" || a === "mexico" || a === "inicio" ? null : a);
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

  const onListo = useCallback(() => setListo(true), []);
  const onHora = useCallback((f: Date) => setHora(f), []);
  const onSeleccion = useCallback((id: string) => setFicha(id), []);

  const f = ficha ? FICHAS[ficha] : null;
  const fichaAbierta = abiertaDe !== null && abiertaDe === ficha;
  const enVivo = modo === "tierra" && !pausa && velocidad === 1;
  // Observatorio CEN: el sistema solar como holograma en la mesa, con guía,
  // misión y álbum. Solo dentro del marco y en la vista del Sistema Solar.
  const observatorio = enMarco && modo === "sistema";

  const escena = (
    <div
      ref={marco}
      data-testid="explorador-escena"
      className="ee-raiz"
      style={
        inmersivo
          ? { position: "fixed", inset: 0, zIndex: 1000, background: "#02040a", fontFamily: T.fuente, color: T.texto }
          : enMarco
          ? { position: "absolute", inset: 0, overflow: "hidden", background: "#02040a", fontFamily: T.fuente, color: T.texto }
          : { position: "relative", height: "min(80vh, 780px)", minHeight: 520, borderRadius: 16, overflow: "hidden", background: "#02040a", fontFamily: T.fuente, color: T.texto }
      }
    >
      {observatorio && <FondoObservatorio />}
      <div style={observatorio ? CAJA_HOLOGRAMA : { position: "absolute", inset: 0 }}>
      <SceneBoundary fallback={<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.tenue, fontSize: 16 }}>Este equipo no pudo abrir la escena 3D.</div>}>
        <ExploradorEspacialScene
          sinCielo={observatorio}
          modo={modo}
          velocidad={pausa ? 0 : velocidad}
          ahoraN={ahoraN}
          enfoque={enfoque}
          nubes={nubes}
          luces={luces}
          lunaReal={lunaReal}
          clara={clara}
          orbitas={orbitas}
          ejes={ejes}
          nombres={nombres}
          onSeleccion={onSeleccion}
          onHora={onHora}
          onListo={onListo}
        />
      </SceneBoundary>
      </div>
      {!listo && <Cargando />}
      {observatorio && <CapaObservatorio evento={ficha} />}

      {/* Velos arriba y abajo: el texto se lee aunque detrás pase el Sol. */}
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "linear-gradient(rgba(2,4,10,.75), rgba(2,4,10,0))", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: "linear-gradient(rgba(2,4,10,0), rgba(2,4,10,.7))", pointerEvents: "none" }} />

      {/* Arriba: título y fecha · vista · menús. */}
      <header className="ee-arriba" style={{ position: "absolute", top: 16, left: 20, right: 16, display: "flex", alignItems: "center", gap: 16, pointerEvents: "none" }}>
        <div className="ee-titulo" style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{ ...ROTULO, color: T.oro }}>Explorador espacial</div>
          <div style={{ ...NUM, fontSize: 15, fontWeight: 600, marginTop: 3, textShadow: "0 1px 6px #000" }}>
            {!hora ? "Calculando posiciones…" : modo === "sistema" ? fmtDia.format(hora) : `${enVivo ? "Ahora · " : ""}${fmtHora.format(hora)} · centro de México`}
          </div>
        </div>
        <div role="tablist" aria-label="Vista" className="ee-vistas" style={{ ...PANEL, display: "flex", padding: 4, gap: 2, pointerEvents: "auto" }}>
          {(
            [
              ["sistema", "Sistema Solar"],
              ["tierra", "Tierra y Luna"],
            ] as const
          ).map(([m, et]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={modo === m}
              onClick={() => cambiarModo(m)}
              style={{ minHeight: 36, padding: "0 16px", borderRadius: 8, border: "none", background: modo === m ? "rgba(255,255,255,.14)" : "transparent", color: modo === m ? "#fff" : T.tenue, fontFamily: T.fuente, fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {et}
            </button>
          ))}
        </div>
        <div className="ee-acciones" style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end", gap: 8, pointerEvents: "auto" }}>
          <BotonIcono icono="fa-solid fa-layer-group" titulo="Capas" onClick={() => setMenu((m) => (m === "capas" ? null : "capas"))} activo={menu === "capas"} />
          <BotonIcono icono="fa-solid fa-circle-info" titulo="¿Qué está a escala?" onClick={() => setMenu((m) => (m === "info" ? null : "info"))} activo={menu === "info"} />
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

      {/* Menús desplegables. */}
      {menu && (
        <div className="ee-menu" style={{ ...PANEL, position: "absolute", top: 72, right: 16, width: "min(340px, calc(100% - 32px))", padding: "14px 16px 6px", zIndex: 5 }}>
          {menu === "capas" ? (
            <>
              <div style={{ ...ROTULO, marginBottom: 6 }}>Capas</div>
              {modo === "sistema" ? (
                <>
                  <Interruptor etiqueta="Vista clara" detalle="Ilumina y agranda los planetas" activo={clara} onClick={() => setClara((x) => !x)} />
                  <Interruptor etiqueta="Órbitas" detalle="La ruta de traslación y su sentido" activo={orbitas} onClick={() => setOrbitas((x) => !x)} />
                  <Interruptor etiqueta="Ejes de giro" detalle="El eje y el sentido de la rotación" activo={ejes} onClick={() => setEjes((x) => !x)} />
                  <Interruptor etiqueta="Nombres" detalle="El nombre junto a cada cuerpo" activo={nombres} onClick={() => setNombres((x) => !x)} />
                </>
              ) : (
                <>
                  <Interruptor etiqueta="Nubes" detalle="La capa de nubes fotografiada" activo={nubes} onClick={() => setNubes((x) => !x)} />
                  <Interruptor etiqueta="Luces de las ciudades" detalle="Del lado donde es de noche" activo={luces} onClick={() => setLuces((x) => !x)} />
                  <Interruptor etiqueta="Distancia real de la Luna" detalle="A 30 Tierras de distancia" activo={lunaReal} onClick={() => setLunaReal((x) => !x)} />
                </>
              )}
            </>
          ) : (
            <div style={{ paddingBottom: 10 }}>
              <div style={{ ...ROTULO, marginBottom: 8 }}>¿Qué está a escala?</div>
              {modo === "sistema" ? (
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                  <strong>Sí:</strong> el orden de los planetas, dónde está cada uno hoy, el tiempo de cada vuelta y la inclinación de cada eje. <strong>No:</strong> las distancias y
                  los tamaños, que se encogieron para que todo quepa. El giro sobre su eje va más lento que el real. El cometa es un ejemplo.
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                  <strong>Sí:</strong> el tamaño de la Tierra y de la Luna, el día y la noche de cada instante y la fase de la Luna. <strong>No:</strong> el Sol, que está mucho más
                  lejos y es 109 veces más ancho que la Tierra, y la distancia de la Luna (salvo con «Distancia real»).
                </p>
              )}
              <p style={{ margin: "10px 0 0", fontSize: 12, color: T.tenue, lineHeight: 1.5 }}>
                Imágenes: Solar System Scope (CC BY 4.0), con datos de la NASA. Posiciones calculadas con los elementos orbitales del JPL.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Izquierda: el riel de cuerpos. */}
      <nav aria-label="A dónde ir" className="ee-riel" style={{ ...PANEL, position: "absolute", left: 16, top: observatorio ? 380 : 92, maxHeight: observatorio ? "calc(100% - 476px)" : "calc(100% - 196px)", width: 214, padding: 8, overflowY: "auto" }}>
        {DESTINOS[modo].map((g, i) => (
          <div key={i} className="ee-grupo" style={{ marginTop: i ? 10 : 0 }}>
            {g.grupo && (
              <div className="ee-grupo-t" style={{ ...ROTULO, fontSize: 11, padding: "6px 10px 4px" }}>
                {g.grupo}
              </div>
            )}
            {g.items.map((d) => {
              const activo = enfoque.a === d.a;
              return (
                <button
                  key={d.a}
                  type="button"
                  onClick={() => ir(d.a)}
                  aria-current={activo || undefined}
                  title={`Ir a: ${d.etiqueta}`}
                  className="ee-destino"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    minHeight: 46,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: activo ? "rgba(255,255,255,.09)" : "transparent",
                    boxShadow: activo ? `inset 3px 0 0 ${T.oro}` : "none",
                    color: activo ? "#fff" : "#cdd5e5",
                    fontFamily: T.fuente,
                    fontSize: 15,
                    fontWeight: activo ? 800 : 600,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ width: 30, display: "inline-flex", justifyContent: "center" }}>
                    <IconoCuerpo id={d.a} tam={d.a === "jupiter" || d.a === "saturno" || d.a === "sol" ? 26 : 22} />
                  </span>
                  <span className="ee-destino-t">{d.etiqueta}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Abajo: la barra del tiempo. */}
      <div className="ee-tiempo" style={{ ...PANEL, position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6, padding: 6 }}>
        <button
          type="button"
          onClick={() => setPausa((x) => !x)}
          aria-label={pausa ? "Reanudar el tiempo" : "Pausar el tiempo"}
          title={pausa ? "Reanudar" : "Pausa"}
          style={{ width: 44, height: 44, borderRadius: 8, border: "none", background: pausa ? T.oro : "rgba(255,255,255,.1)", color: pausa ? "#00153b" : "#fff", cursor: "pointer", fontSize: 16, flex: "0 0 auto" }}
        >
          <i className={pausa ? "fa-solid fa-play" : "fa-solid fa-pause"} aria-hidden />
        </button>
        <span className="ee-tiempo-r" style={{ ...ROTULO, fontSize: 11, padding: "0 6px 0 8px", whiteSpace: "nowrap" }}>
          Cada segundo
        </span>
        {VELOCIDADES[modo].map((v) => {
          const activa = !pausa && velocidad === v.v;
          return (
            <button
              key={v.v}
              type="button"
              aria-pressed={activa}
              aria-label={v.largo}
              title={v.largo}
              onClick={() => {
                setVelocidad(v.v);
                setPausa(false);
              }}
              style={{ minWidth: 60, height: 44, padding: "0 12px", borderRadius: 8, border: "none", background: activa ? "rgba(255,255,255,.14)" : "transparent", color: activa ? "#fff" : T.tenue, fontFamily: T.fuente, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              {v.corto}
            </button>
          );
        })}
        <span style={{ width: 1, height: 26, background: T.linea, margin: "0 4px", flex: "0 0 auto" }} aria-hidden />
        <button
          type="button"
          onClick={() => {
            setAhoraN((n) => n + 1);
            setVelocidad(VELOCIDAD_INICIAL[modo]);
            setPausa(false);
          }}
          title="Volver a hoy"
          style={{ height: 44, padding: "0 14px", borderRadius: 8, border: "none", background: "transparent", color: T.texto, fontFamily: T.fuente, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <i className="fa-solid fa-clock-rotate-left" aria-hidden />
          <span>Hoy</span>
        </button>
      </div>

      {f && (
        <div className="ee-ficha-caja" style={{ position: "absolute", top: observatorio ? 300 : 92, right: 16, maxHeight: observatorio ? "calc(100% - 316px)" : "calc(100% - 196px)", width: 380, display: "flex", flexDirection: "column", zIndex: 4 }}>
          <FichaCuerpo
            f={f}
            modo={modo}
            hora={hora}
            onCerrar={() => setFicha(null)}
            onVerTierra={() => cambiarModo("tierra", "inicio")}
            abierta={fichaAbierta}
            onPlegar={() => setAbiertaDe(fichaAbierta ? null : ficha)}
          />
        </div>
      )}

      <style>{`
        @keyframes ee-girar { from { background-position: 0% 50%; } to { background-position: -200% 50%; } }
        .ee-raiz .ee-gira { animation: ee-girar 40s linear infinite; }
        .ee-raiz .ee-destino:hover { background: rgba(255,255,255,.06); }
        .ee-raiz .ee-ficha { max-height: 100%; }
        .ee-raiz .ee-ficha-caja .ee-ficha { scrollbar-width: thin; }
        @media (min-width: 821px) {
          .ee-raiz .ee-solo-movil { display: none; }
        }
        @media (max-width: 820px) {
          .ee-raiz .ee-arriba { left: 12px !important; right: 12px !important; top: 12px !important; flex-wrap: wrap; gap: 10px !important; }
          .ee-raiz .ee-titulo { flex: 1 1 100% !important; }
          .ee-raiz .ee-vistas { order: 2; }
          .ee-raiz .ee-acciones { order: 3; flex: 0 0 auto !important; margin-left: auto; gap: 6px !important; }
          .ee-raiz .ee-menu { top: 124px !important; }
          .ee-raiz .ee-riel { top: auto !important; bottom: 80px !important; left: 12px !important; right: 12px !important; width: auto !important; max-height: none !important; padding: 4px !important; display: flex; overflow-x: auto; overflow-y: hidden; }
          .ee-raiz .ee-riel .ee-grupo { display: flex; margin: 0 !important; }
          .ee-raiz .ee-riel .ee-grupo-t { display: none; }
          .ee-raiz .ee-riel .ee-destino { flex-direction: column; gap: 4px !important; width: auto !important; min-width: 66px; padding: 6px 4px !important; font-size: 12px !important; justify-content: center; box-shadow: none !important; }
          .ee-raiz .ee-riel .ee-destino[aria-current] { box-shadow: inset 0 -3px 0 ${T.oro} !important; }
          .ee-raiz .ee-riel .ee-destino-t { white-space: nowrap; max-width: 78px; overflow: hidden; text-overflow: ellipsis; text-align: center; }
          .ee-raiz .ee-tiempo { left: 12px !important; right: 12px !important; transform: none !important; justify-content: space-between; bottom: 12px !important; }
          .ee-raiz .ee-tiempo-r { display: none; }
          .ee-raiz .ee-tiempo > button { min-width: 0 !important; padding: 0 8px !important; }
          .ee-raiz .ee-ficha-caja { top: auto !important; left: 12px !important; right: 12px !important; width: auto !important; bottom: 168px !important; max-height: 50% !important; }
          .ee-raiz .ee-ficha { padding: 14px !important; }
          .ee-raiz .ee-ficha h2 { font-size: 24px !important; }
          .ee-raiz .ee-ficha[data-abierta="0"] .ee-ficha-cuerpo { display: none; }
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
          <div style={{ padding: 24, borderRadius: 16, background: "#070b16", color: T.texto, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>El explorador está abierto a pantalla completa.</span>
            <button
              type="button"
              onClick={() => setInmersivo(true)}
              style={{ minHeight: 44, padding: "0 18px", borderRadius: 10, border: "none", background: T.oro, color: "#00153b", fontFamily: T.fuente, fontSize: 15, fontWeight: 800, cursor: "pointer" }}
            >
              Volver al espacio
            </button>
          </div>
        </>
      ) : (
        escena
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {[
          ["Compara", "Abre la ficha de Júpiter: ¿cuántas veces cabe la Tierra a lo ancho? ¿Y en Mercurio?"],
          ["Corre el tiempo", "Pon «Año». ¿Quién da la vuelta al Sol más rápido? ¿Por qué Neptuno casi no se mueve?"],
          ["Mira los ejes", "En Capas, enciende «Ejes de giro». ¿Qué planeta gira acostado? ¿Cuál gira al revés?"],
          ["Asómate a la ventana", "En «Tierra y Luna», ¿es de día o de noche en México? Compruébalo afuera."],
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
