"use client";

/**
 * Laboratorio 3D — Escala de pH, ácidos y bases.
 * Práctica experimental para CNEYT-IV-P03-A2 (simulacion "Simulación de
 * laboratorio: midiendo el pH"; UAC "Reacciones químicas", progresión 3:
 * "Analiza el concepto de pH y la importancia de los ácidos y bases…").
 *
 * Dos modos:
 *  · Medir — el alumno elige una sustancia (las 6 del panel de la simulación +
 *    sustancias cotidianas de la lectura) y ve la disolución teñirse con el
 *    indicador de col morada y el marcador moverse por la escala 0–14.
 *  · Neutralizar — titula un ácido (fuerte HCl / débil vinagre) con NaOH gota a
 *    gota; el pH sube hasta el punto de equivalencia. La curva muestra la
 *    diferencia entre ácido fuerte y débil (región buffer).
 *
 * Valores de pH = los de la actividad. Color del indicador = cualitativo.
 * Curva de titulación = modelo simplificado con las formas correctas.
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  SUSTANCIAS, COTIDIANAS, sustancia, SUST_DEF,
  ACIDOS, type TipoAcido, phPorGotas, curvaTitulacion, GOTAS_EQ, GOTAS_MAX,
  colorCol, nombreColor, clasifica, fmtPh,
  BUFFER, DATOS, IDEAS, type Sustancia,
} from "./ph-data";

const PhScene = dynamic(() => import("./PhScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando las disoluciones…</span>
    </div>
  ),
});

type Modo = "medir" | "neutralizar";

export function LabPh({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("medir");
  const [sustId, setSustId] = useState(SUST_DEF);
  const [acidoId, setAcidoId] = useState<TipoAcido>("fuerte");
  const [gotas, setGotas] = useState(0);
  const [titulando, setTitulando] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  // pH actual según el modo.
  const sust = useMemo(() => sustancia(sustId), [sustId]);
  const ph = modo === "medir" ? sust.ph : phPorGotas(acidoId, gotas);
  const colorLiquido = colorCol(ph);
  const clase = clasifica(ph);
  const colorTxt = nombreColor(ph);

  const acido = ACIDOS.find((a) => a.id === acidoId)!;
  const curva = useMemo(() => curvaTitulacion(acidoId), [acidoId]);
  const enEquivalencia = modo === "neutralizar" && gotas === GOTAS_EQ;

  // Concentración relativa de H⁺ respecto al agua pura (potencia de 10).
  const exp = 7 - ph;
  const relTxt = Math.abs(exp) < 0.05 ? "igual que el agua" : `×10${supScript(exp)}`;

  // Titulación automática "paso a paso" (setInterval en useEffect: seguro con
  // React Compiler — no es render ni useFrame).
  useEffect(() => {
    if (!titulando) return;
    const id = setInterval(() => {
      setGotas((g) => {
        if (g >= GOTAS_MAX) {
          setTitulando(false);
          return g;
        }
        return g + 1;
      });
    }, 320);
    return () => clearInterval(id);
  }, [titulando]);

  const cambiarModo = (m: Modo) => {
    setTitulando(false);
    setModo(m);
    bump();
  };

  const elegirSust = (id: string) => {
    setSustId(id);
    bump();
  };

  const elegirAcido = (id: TipoAcido) => {
    setTitulando(false);
    setAcidoId(id);
    setGotas(0);
    bump();
  };

  const setGota = (delta: number) => {
    setTitulando(false);
    setGotas((g) => Math.max(0, Math.min(GOTAS_MAX, g + delta)));
  };

  const titular = () => {
    if (gotas >= GOTAS_MAX) setGotas(0);
    setTitulando(true);
  };

  const reiniciar = () => {
    setTitulando(false);
    setGotas(0);
    bump();
  };

  const goteando = titulando;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Escala de pH</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: pH = {fmtPh(ph)} → {clase.etiqueta.toLowerCase()} (indicador de col morada: {colorTxt}).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes phPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ph-live-dot { animation: phPulse 1.6s ease-in-out infinite; }
        .ph-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ph-grid { grid-template-columns: 1fr; } }
        .ph-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ph-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ph-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ph-modebtn { cursor:pointer; padding:8px 16px; border-radius:10px; border:1px solid ${T.line}; background:transparent;
          color:${T.text2}; font-size:12.5px; font-weight:900; transition:all .15s; display:flex; align-items:center; gap:7px; }
        .ph-modebtn[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.2); color:#fff; }
        .ph-modebtn:hover { color:#fff; }
        .ph-chip { cursor:pointer; padding:9px 11px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; }
        .ph-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ph-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.16); color:#fff; }
        .ph-step { cursor:pointer; width:34px; height:34px; border-radius:9px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:15px; font-weight:900; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ph-step:hover:not(:disabled) { border-color:rgba(${color.rgba},0.6); background:rgba(${color.rgba},0.18); }
        .ph-step:disabled { opacity:0.32; cursor:not-allowed; }
        .ph-solve { cursor:pointer; flex:1; padding:11px 14px; border-radius:11px; border:none; font-size:13px; font-weight:900;
          display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .ph-ghost { cursor:pointer; padding:11px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .ph-ghost:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
        @media (max-width: 1000px){ .ph-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ph-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <PhScene ph={ph} colorLiquido={colorLiquido} accent={accent} modo={modo} goteando={goteando} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO: pH actual */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ph-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>pH {fmtPh(ph)}</span>
            </div>

            {/* Badge tipo (ácido/neutro/base) */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${clase.color}88`, backdropFilter: "blur(10px)" }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: colorLiquido, border: "1px solid rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize: 11.5, fontWeight: 900, color: clase.color }}>
                {clase.etiqueta}{clase.matiz ? ` ${clase.matiz}` : ""}
              </span>
            </div>

            {/* Toggle de modo */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 6 }}>
              <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <button className="ph-modebtn" data-on={modo === "medir"} onClick={() => cambiarModo("medir")}>
                  <i className="fa-solid fa-eye-dropper" /> Medir
                </button>
                <button className="ph-modebtn" data-on={modo === "neutralizar"} onClick={() => cambiarModo("neutralizar")}>
                  <i className="fa-solid fa-droplet" /> Neutralizar
                </button>
              </div>
            </div>

            {/* Pie: lectura del indicador */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: colorLiquido, border: "1px solid rgba(255,255,255,0.4)" }} />
                Indicador de col morada: <strong style={{ color: colorLiquido === "#000000" ? "#fff" : colorLiquido, textShadow: "0 0 6px rgba(0,0,0,0.6)" }}>{colorTxt}</strong>
                <span style={{ color: T.text3, fontWeight: 600 }}>· escala 0–14 a la derecha</span>
              </div>
              {modo === "medir" && (
                <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                  <i className={`fa-solid ${sust.icono}`} style={{ color: accent, marginRight: 7 }} />
                  {sust.nombre}{sust.formula ? ` (${sust.formula})` : ""} — pH {sust.phTexto}
                </div>
              )}
              {modo === "neutralizar" && (
                <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                  <i className="fa-solid fa-droplet" style={{ color: accent, marginRight: 7 }} />
                  {acido.nombre} + NaOH · {gotas} de {GOTAS_MAX} gotas {enEquivalencia ? "· punto de equivalencia" : ""}
                </div>
              )}
            </div>
          </div>

          {/* ── Controles según el modo ─────────────────────────── */}
          {modo === "medir" ? (
            <div style={{ ...card, padding: "18px 22px 20px" }}>
              <Eyebrow>
                <i className="fa-solid fa-vials" style={{ marginRight: 8, color: accent }} />
                Elige una sustancia y mide su pH
              </Eyebrow>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "2px 0 9px" }}>EN EL LABORATORIO (simulación)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {SUSTANCIAS.map((s) => (
                  <ChipSust key={s.id} s={s} on={s.id === sustId} onClick={() => elegirSust(s.id)} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 9px" }}>EN LA VIDA DIARIA (lectura)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {COTIDIANAS.map((s) => (
                  <ChipSust key={s.id} s={s} on={s.id === sustId} onClick={() => elegirSust(s.id)} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ ...card, padding: "18px 22px 20px" }}>
              <Eyebrow>
                <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
                Titula el ácido con NaOH (base fuerte)
              </Eyebrow>

              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {ACIDOS.map((a) => (
                  <button key={a.id} className="ph-chip" data-on={a.id === acidoId} onClick={() => elegirAcido(a.id)} style={{ alignItems: "flex-start", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-vial" style={{ color: accent, marginTop: 2 }} />
                    <span>
                      <span style={{ color: "#fff", fontWeight: 900 }}>{a.nombre}</span>
                      <span style={{ display: "block", fontSize: 11, color: T.text2, fontWeight: 600 }}>{a.descripcion}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Stepper de gotas */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 6 }}>
                <button className="ph-step" onClick={() => setGota(-1)} disabled={gotas <= 0} aria-label="quitar gota">−</button>
                <div style={{ textAlign: "center", minWidth: 92 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{gotas}</div>
                  <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 800, letterSpacing: "0.06em" }}>GOTAS DE NaOH</div>
                </div>
                <button className="ph-step" onClick={() => setGota(1)} disabled={gotas >= GOTAS_MAX} aria-label="añadir gota">+</button>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button className="ph-solve" onClick={titular} disabled={titulando}
                  style={{ background: titulando ? "rgba(255,255,255,0.06)" : accent, color: titulando ? T.text3 : "#04121f", cursor: titulando ? "default" : "pointer" }}>
                  <i className={`fa-solid ${titulando ? "fa-spinner fa-spin" : "fa-play"}`} />
                  {titulando ? "Goteando…" : "Neutralizar paso a paso"}
                </button>
                <button className="ph-ghost" onClick={reiniciar}>
                  <i className="fa-solid fa-rotate-left" /> Reiniciar
                </button>
              </div>

              {/* Curva de titulación */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>CURVA pH vs GOTAS</div>
                <CurvaTitulacion curva={curva} gotas={gotas} accent={accent} />
              </div>
            </div>
          )}
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Lecturas en vivo */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${clase.color}55`, background: `rgba(${color.rgba},0.08)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#04121f", background: colorLiquido, boxShadow: `0 6px 18px -6px ${colorLiquido}` }}>
                <i className="fa-solid fa-flask" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "ui-monospace, monospace" }}>pH {fmtPh(ph)}</div>
                <div style={{ fontSize: 12, color: clase.color, fontWeight: 800 }}>{clase.etiqueta}{clase.matiz ? ` ${clase.matiz}` : ""}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <Readout label="indicador" value={colorTxt} col={colorLiquido} size={14} />
              <Readout label="H⁺ vs agua" value={relTxt} col="#bfe8ff" size={14} />
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
              {clase.tipo === "acido"
                ? <>Más ácido que el agua: hay <strong style={{ color: "#FB7185" }}>más iones H⁺</strong>. Como la escala es logarítmica, bajar 1 de pH es <strong>×10</strong> más H⁺.</>
                : clase.tipo === "base"
                  ? <>Más básico que el agua: hay <strong style={{ color: "#34D399" }}>menos iones H⁺</strong> (más OH⁻). Subir 1 de pH es <strong>×10</strong> menos H⁺.</>
                  : <>pH 7: <strong style={{ color: "#A78BFA" }}>neutro</strong>, como el agua pura a 25 °C.</>}
            </div>
          </div>

          {/* Contexto */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
              {modo === "medir" ? "Sobre esta sustancia" : "Sobre esta titulación"}
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              {modo === "medir" ? sust.contexto : acido.descripcion}
            </div>
            {modo === "neutralizar" && (
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                El <strong style={{ color: accent }}>punto de equivalencia</strong> es donde el ácido queda justo neutralizado ({GOTAS_EQ} gotas). En ácido fuerte cae en pH 7; en ácido débil, en pH &gt; 7.
              </div>
            )}
          </div>

          {/* Buffer */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 8, color: accent }} />
              ¿Qué hace un buffer?
            </Eyebrow>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>
              Si añades la misma gota de ácido fuerte a cada una, mira cuánto cambia el pH:
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {BUFFER.map((b) => (
                <BarraBuffer key={b.nombre} b={b} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.5, marginTop: 12 }}>
              Por eso la sangre, amortiguada con bicarbonato, se mantiene entre 7.35 y 7.45.
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ph-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Los valores de pH son los de la actividad (lectura y simulación); donde hay un rango se usa un valor representativo y se conserva el texto original. El color del indicador de col morada es <strong>cualitativo</strong> (reproduce la regla rojo/rosa→morado→azul/verde, no es una medición colorimétrica). La curva de titulación usa un <strong>modelo simplificado</strong> (ácido 0.1 M en 25 mL, NaOH 0.1 M), pero el salto brusco en la equivalencia y la región buffer del ácido débil son las formas correctas de la fisicoquímica.
        </span>
      </div>
    </div>
  );
}

/* ── Superíndice de potencia de 10 (entero redondeado) ───────────────────── */
function supScript(exp: number): string {
  const n = Math.round(exp);
  if (n === 0) return "⁰";
  const sup: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  return String(n).split("").map((c) => sup[c] ?? c).join("");
}

/* ── Chip de sustancia ───────────────────────────────────────────────────── */
function ChipSust({ s, on, onClick }: { s: Sustancia; on: boolean; onClick: () => void }) {
  const col = colorCol(s.ph);
  return (
    <button className="ph-chip" data-on={on} onClick={onClick} title={s.nombre}>
      <span style={{ width: 16, height: 16, borderRadius: 5, background: col, border: "1px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", color: "#fff", fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nombre}</span>
        <span style={{ display: "block", fontSize: 10.5, color: T.text3, fontWeight: 700 }}>pH {s.phTexto}</span>
      </span>
    </button>
  );
}

/* ── Curva de titulación (SVG inline) ────────────────────────────────────── */
function CurvaTitulacion({ curva, gotas, accent }: { curva: { gota: number; ph: number }[]; gotas: number; accent: string }) {
  const W = 320, H = 150, PL = 30, PB = 22, PT = 8, PR = 8;
  const x = (g: number) => PL + (g / GOTAS_MAX) * (W - PL - PR);
  const y = (ph: number) => PT + (1 - ph / 14) * (H - PT - PB);
  const pts = curva.map((p) => `${x(p.gota).toFixed(1)},${y(p.ph).toFixed(1)}`).join(" ");
  const cur = curva.find((p) => p.gota === gotas) ?? curva[0]!;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* rejilla pH 0,7,14 */}
      {[0, 7, 14].map((g) => (
        <g key={g}>
          <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray={g === 7 ? "3 3" : undefined} />
          <text x={PL - 5} y={y(g) + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.5)">{g}</text>
        </g>
      ))}
      {/* línea de equivalencia */}
      <line x1={x(GOTAS_EQ)} y1={PT} x2={x(GOTAS_EQ)} y2={H - PB} stroke={`${accent}66`} strokeWidth={1} strokeDasharray="4 3" />
      <text x={x(GOTAS_EQ)} y={H - 8} textAnchor="middle" fontSize={8.5} fill={accent} fontWeight={700}>equivalencia</text>
      {/* curva */}
      <polyline points={pts} fill="none" stroke={accent} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {/* punto actual */}
      <circle cx={x(cur.gota)} cy={y(cur.ph)} r={4.5} fill="#fff" stroke={accent} strokeWidth={2} />
      <text x={x(cur.gota)} y={y(cur.ph) - 8} textAnchor="middle" fontSize={9.5} fill="#fff" fontWeight={800}>pH {fmtPh(cur.ph)}</text>
      {/* eje x */}
      <text x={(PL + W - PR) / 2} y={H - 1} textAnchor="middle" fontSize={8.5} fill="rgba(255,255,255,0.4)">gotas de NaOH →</text>
    </svg>
  );
}

/* ── Barra del buffer ────────────────────────────────────────────────────── */
function BarraBuffer({ b }: { b: typeof BUFFER[number] }) {
  const delta = Math.abs(b.phAntes - b.phDespues);
  const pct = (ph: number) => `${(ph / 14) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <i className={`fa-solid ${b.icono}`} style={{ color: T.text2, fontSize: 12, width: 16, textAlign: "center" }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{b.nombre}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: delta > 1 ? "#FB7185" : "#34D399", fontFamily: "ui-monospace, monospace" }}>
          ΔpH {delta.toFixed(1)}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: pct(Math.min(b.phAntes, b.phDespues)), width: `${(delta / 14) * 100}%`, top: 0, bottom: 0, background: delta > 1 ? "rgba(251,113,133,0.5)" : "rgba(52,211,153,0.5)" }} />
        <div style={{ position: "absolute", left: pct(b.phDespues), top: -2, bottom: -2, width: 2, background: "#fff" }} />
        <div style={{ position: "absolute", left: pct(b.phAntes), top: -2, bottom: -2, width: 2, background: "rgba(255,255,255,0.5)" }} />
      </div>
      <div style={{ fontSize: 10.5, color: T.text3, marginTop: 4 }}>
        pH {b.phAntes} → <strong style={{ color: "#fff" }}>{b.phDespues}</strong> · {b.nota}
      </div>
    </div>
  );
}
