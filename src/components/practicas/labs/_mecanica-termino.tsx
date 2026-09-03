"use client";

/**
 * ESCRIBE EL TÉRMINO — el glosario deja de ser un tercer arrastre.
 *
 * Ocho laboratorios traían DOS modos que hacían exactamente lo mismo: emparejar
 * un concepto con su definición arrastrando una etiqueta, y acto seguido
 * emparejar un término con su definición arrastrando otra etiqueta. El segundo
 * no enseñaba nada que el primero no hubiera pedido ya, y el glosario completo
 * vive además en la ficha teórica de la propia práctica.
 *
 * Aquí el alumno lee la definición y su ejemplo y ESCRIBE el término. Cambia el
 * acto, no el contenido: los pares son los mismos `PARES` verbatim de la
 * progresión que usaba el modo anterior.
 *
 * Andamiaje, el mismo criterio que en `_mecanica-huecos`: pista por tarjeta
 * (inicial y número de letras, derivadas de la propia respuesta — no hace falta
 * inventar texto nuevo), banco de términos para tocar en vez de teclear, y se
 * ignoran acentos, mayúsculas y puntuación porque se evalúa el concepto.
 */

import { useMemo, useRef, useState } from "react";
import { T, OK } from "./_kit";
import { normaliza } from "./_mecanica-huecos";

const NO = "#FF5E5E";

export interface ParTermino {
  id: string;
  termino: string;
  definicion: string;
  ejemplo?: string;
}

type Estado = "vacio" | "bien" | "mal";

/**
 * Formas que se dan por buenas además del término tal cual.
 *
 * Varios glosarios traen la sigla y su desarrollo en el mismo término («Sector
 * TIC (Tecnologías de la Información y Comunicación)»). Exigir el paréntesis
 * completo no evalúa el concepto, evalúa la paciencia: se acepta el término
 * entero, el término sin el paréntesis y lo que va dentro del paréntesis.
 */
export function variantes(termino: string): string[] {
  const base = termino.trim();
  const sinParentesis = base.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const dentro = [...base.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]!.trim());
  return [base, sinParentesis, ...dentro].filter(Boolean);
}

/** «bioética» → «Empieza por B y tiene 8 letras.» */
function pistaDe(termino: string): string {
  const limpio = termino.trim();
  const letras = limpio.replace(/[^\p{L}]/gu, "").length;
  const inicial = limpio.charAt(0).toUpperCase();
  const palabras = limpio.split(/\s+/).length;
  return palabras > 1
    ? `Son ${palabras} palabras, empieza por «${inicial}» y tiene ${letras} letras.`
    : `Empieza por «${inicial}» y tiene ${letras} letras.`;
}

export function EscribeTermino({
  pares,
  accent,
  rgba,
  completado,
  onCompletado,
  onAcierto,
  onError,
  instrucciones = "Lee la definición y escribe el término que le corresponde.",
}: {
  pares: ParTermino[];
  accent: string;
  rgba: string;
  completado: boolean;
  onCompletado: () => void;
  onAcierto?: () => void;
  onError?: () => void;
  instrucciones?: string;
}) {
  const [valores, setValores] = useState<string[]>(() => pares.map(() => ""));
  const [estados, setEstados] = useState<Estado[]>(() => pares.map(() => "vacio"));
  const [pistaAbierta, setPistaAbierta] = useState<number | null>(null);
  const [banco, setBanco] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const resueltos = estados.filter((e) => e === "bien").length;

  // Orden estable: barajar en cada render movería las fichas solas.
  const terminos = useMemo(
    () => pares.map((p) => p.termino).sort((a, b) => a.localeCompare(b, "es")),
    [pares]
  );

  function comprobar(i: number, valor: string) {
    if (estados[i] === "bien") return;
    const par = pares[i];
    if (!par) return;
    const v = normaliza(valor);
    const bien = v !== "" && variantes(par.termino).some((x) => normaliza(x) === v);

    // Fuera del actualizador: en modo estricto React lo llama dos veces y el
    // aviso de modo terminado se dispararía repetido.
    const siguiente = [...estados];
    siguiente[i] = valor.trim() === "" ? "vacio" : bien ? "bien" : "mal";
    setEstados(siguiente);

    if (valor.trim() === "") return;
    if (bien) {
      onAcierto?.();
      if (!completado && siguiente.every((e) => e === "bien")) onCompletado();
    } else {
      onError?.();
    }
  }

  function poner(i: number, valor: string) {
    setValores((prev) => {
      const nx = [...prev];
      nx[i] = valor;
      return nx;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{`
        .mt-card { border-radius:15px; border:1px solid ${T.line}; background:${T.glass};
          padding:15px 18px; display:flex; flex-direction:column; gap:10px; transition:border-color .16s, background .16s; }
        .mt-card[data-e="bien"] { border-color:${OK}55; background:${OK}0f; }
        .mt-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff;
          font-size:14.5px; font-weight:700; padding:7px 12px; font-family:inherit; transition:all .15s; outline:none; min-width:180px; }
        .mt-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.18); }
        .mt-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .mt-in[data-e="mal"] { border-color:${NO}; background:${NO}14; animation:mtShake .35s; }
        @keyframes mtShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
        .mt-mini { cursor:pointer; border:none; background:transparent; color:${T.text3}; font-size:13px; padding:0 4px; transition:color .15s; }
        .mt-mini:hover { color:${accent}; }
        .mt-word { cursor:pointer; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text};
          border-radius:10px; padding:7px 13px; font-size:13px; font-weight:700; transition:all .14s; }
        .mt-word:hover { border-color:${accent}; background:rgba(${rgba},0.14); }
        @media (prefers-reduced-motion: reduce){ .mt-in[data-e="mal"] { animation:none; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 700 }}>{instrucciones}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: resueltos === pares.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {resueltos}/{pares.length}
        </span>
      </div>

      {pares.map((p, i) => (
        <div key={p.id} className="mt-card" data-e={estados[i]}>
          <div style={{ fontSize: 14.5, lineHeight: 1.5, color: T.text2 }}>{p.definicion}</div>
          {p.ejemplo && (
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: T.text3, fontStyle: "italic" }}>
              <i className="fa-solid fa-quote-left" style={{ fontSize: 10, marginRight: 7, color: accent }} />
              {p.ejemplo}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <input
              ref={(el) => { refs.current[i] = el; }}
              className="mt-in"
              data-e={estados[i]}
              value={valores[i]}
              disabled={estados[i] === "bien"}
              placeholder="Escribe el término"
              aria-label={`Término ${i + 1} de ${pares.length}`}
              onChange={(e) => {
                poner(i, e.target.value);
                if (estados[i] === "mal") {
                  setEstados((prev) => { const nx = [...prev]; nx[i] = "vacio"; return nx; });
                }
              }}
              onBlur={(e) => comprobar(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); comprobar(i, valores[i] ?? ""); }
              }}
            />
            {estados[i] !== "bien" && (
              <button
                type="button"
                className="mt-mini"
                title="Ver pista"
                aria-label={`Pista del término ${i + 1}`}
                onClick={() => setPistaAbierta((v) => (v === i ? null : i))}
              >
                <i className="fa-solid fa-circle-question" />
              </button>
            )}
            {pistaAbierta === i && estados[i] !== "bien" && (
              <span style={{ fontSize: 12.5, color: T.text2 }}>
                <i className="fa-solid fa-lightbulb" style={{ color: accent, marginRight: 7 }} />
                {pistaDe(p.termino)}
              </span>
            )}
            {estados[i] === "bien" && (
              <span style={{ fontSize: 13, fontWeight: 800, color: OK, display: "inline-flex", alignItems: "center", gap: 7 }}>
                <i className="fa-solid fa-circle-check" /> {p.termino}
              </span>
            )}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="mt-word" onClick={() => setBanco((v) => !v)} aria-expanded={banco}>
          <i className={`fa-solid ${banco ? "fa-eye-slash" : "fa-list-ul"}`} style={{ marginRight: 8 }} />
          {banco ? "Ocultar el banco de términos" : "Ver el banco de términos"}
        </button>
        {resueltos === pares.length && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> ¡Glosario completo!
          </span>
        )}
      </div>

      {banco && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {terminos.map((t) => (
            <button
              type="button"
              key={t}
              className="mt-word"
              title="Colocar en la primera tarjeta sin resolver"
              onClick={() => {
                const i = estados.findIndex((e) => e !== "bien");
                if (i < 0) return;
                poner(i, t);
                comprobar(i, t);
                refs.current[i]?.focus();
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
