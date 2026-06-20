"use client";

import Link from "next/link";
import { getUACConfig, getUACImagen } from "./uac-config";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { COMPONENTES_CURRICULARES } from "@/lib/mccems/estructura";
import "./UACFicha.css";

interface UACCardProps {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

export default function UACCard({ codigo, nombre, done, total, pct }: UACCardProps) {
  const cfg = getUACConfig(codigo);
  const uac = getUACPorCodigo(codigo);
  const recurso = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === uac?.recursoCodigo);
  const componente = COMPONENTES_CURRICULARES.find((c) => c.codigo === uac?.componenteCodigo);

  const isComplete = done === total && total > 0;
  const isStarted = done > 0 && !isComplete;

  const descripcion =
    recurso?.descripcion ??
    "Recurso de aprendizaje alineado al Marco Curricular Común de la Educación Media Superior.";
  const imagen = getUACImagen(codigo);

  return (
    <Link
      href={`/hub/uac/${codigo}`}
      className="uac-ficha group"
      style={{
        // @ts-expect-error CSS custom props
        "--accent": cfg.accent,
        "--accent-rgb": cfg.accentRgb,
        "--glow": cfg.glow,
        outline: isComplete ? "2px solid #34D399" : undefined,
        outlineOffset: isComplete ? "4px" : undefined,
      }}
    >
      {/* ── Panel de imagen ─── */}
      <div className="uac-ficha-media">
        <div
          className="uac-ficha-img"
          style={imagen ? { backgroundImage: `url('${imagen}')` } : { background: cfg.bg }}
        />
        {/* Tinte de marca sobre la imagen */}
        <div className="uac-ficha-tint" style={{ background: cfg.bg }} />
        {/* Orbe de glow */}
        <div className="uac-ficha-orb" style={{ background: cfg.glow }} />
        {/* Emoji + código flotantes */}
        <div className="uac-ficha-badge">{codigo}</div>
        <div className="uac-ficha-emoji">{cfg.emoji}</div>
        {/* Estado de avance, legible de un vistazo */}
        <div
          className={`uac-ficha-estado ${
            isComplete ? "is-complete" : isStarted ? "is-started" : "is-new"
          }`}
        >
          {isComplete ? (
            <>
              <i className="fa-solid fa-circle-check" /> Completada
            </>
          ) : isStarted ? (
            `${pct}%`
          ) : (
            "Nuevo"
          )}
        </div>
      </div>

      {/* ── Contenido ─── */}
      <div className="uac-ficha-body">
        <div className="uac-ficha-top">
          <span className="uac-ficha-chip uac-ficha-chip--accent">{codigo}</span>
          {componente && <span className="uac-ficha-chip">{componente.nombre}</span>}
        </div>

        <div className="uac-ficha-headline">
          <h3 className="uac-ficha-title">{nombre}</h3>
          <p className="uac-ficha-desc">{descripcion}</p>
        </div>

        <div className="uac-ficha-meta">
          <span className="uac-ficha-metaitem">
            <i className="fa-solid fa-layer-group" /> {total} progresiones
          </span>
          {uac?.semestre != null && (
            <span className="uac-ficha-metaitem">
              <i className="fa-solid fa-calendar-days" /> Semestre {uac.semestre}
            </span>
          )}
          <span className="uac-ficha-metaitem">
            <i className="fa-solid fa-brain" /> Recurso sociocognitivo
          </span>
        </div>

        <div className="uac-ficha-footer">
          <div className="uac-ficha-progress">
            <div className="uac-ficha-progress-head">
              <span>
                {done} de {total} completadas
              </span>
              <span className="uac-ficha-pct">{pct}%</span>
            </div>
            <div className="uac-ficha-bar">
              <div className="uac-ficha-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <span
            className={`uac-ficha-cta ${
              isComplete ? "is-complete" : isStarted ? "is-started" : ""
            }`}
          >
            {isComplete ? "✓ Completada" : isStarted ? "Continuar" : "Comenzar"}
            {!isComplete && <i className="fa-solid fa-arrow-right" />}
          </span>
        </div>
      </div>
    </Link>
  );
}
