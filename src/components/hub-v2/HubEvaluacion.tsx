"use client";

import Link from "next/link";
import "./HubEvaluacion.css";

export default function HubEvaluacion({ pctGlobal }: { pctGlobal: number }) {
  const desbloqueado = pctGlobal >= 80;
  const haciaMeta = Math.min(100, Math.round((pctGlobal / 80) * 100));

  if (desbloqueado) {
    return (
      <section className="hub-eval hub-eval--open hub-v2-animate">
        <div className="hub-eval-bg" aria-hidden="true" />
        <div className="hub-eval-inner">
          <div className="hub-eval-text">
            <span className="hub-eval-eyebrow hub-eval-eyebrow--open">
              <span className="hub-eval-pulse" aria-hidden="true" /> Evaluación desbloqueada
            </span>
            <h2 className="hub-eval-title">
              Evaluación
              <br />
              <span className="hub-eval-title-accent hub-eval-title-accent--open">
                del Semestre
              </span>
            </h2>
            <p className="hub-eval-desc">
              Completaste más del <strong>80%</strong> del currículo. El examen
              integrador está listo para ti.
            </p>
            <Link href="/hub/evaluacion-semestre" className="hub-eval-cta hub-eval-cta--open">
              Iniciar evaluación
              <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>

          <div className="hub-eval-visual" aria-hidden="true">
            <div className="hub-eval-trophy">
              <i className="fa-solid fa-trophy" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hub-eval hub-eval--locked hub-v2-animate">
      <div className="hub-eval-bg" aria-hidden="true" />
      <div className="hub-eval-inner">
        <div className="hub-eval-text">
          <span className="hub-eval-eyebrow">
            <i className="fa-solid fa-lock" /> Evaluación integradora
          </span>
          <h2 className="hub-eval-title">
            Evaluación
            <br />
            <span className="hub-eval-title-accent">del Semestre</span>
          </h2>
          <p className="hub-eval-desc">
            El examen integrador se desbloquea al completar el{" "}
            <strong>80%</strong> del currículo del semestre. Vas en camino — sigue
            sumando progreso.
          </p>

          <div className="hub-eval-meter">
            <div className="hub-eval-meter-track">
              <div
                className="hub-eval-meter-fill"
                style={{ width: `${haciaMeta}%` }}
              />
            </div>
            <div className="hub-eval-meter-foot">
              <span>
                Avance <strong>{pctGlobal}%</strong>
              </span>
              <span className="hub-eval-meter-goal">
                <i className="fa-solid fa-lock" /> Meta 80%
              </span>
            </div>
          </div>
        </div>

        <div
          className="hub-eval-visual"
          style={{ "--pct": haciaMeta } as React.CSSProperties}
          aria-hidden="true"
        >
          <div className="hub-eval-gauge">
            <div className="hub-eval-gauge-hole">
              <i className="fa-solid fa-lock" />
              <span className="hub-eval-gauge-num">{pctGlobal}%</span>
              <span className="hub-eval-gauge-cap">de 80% meta</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
