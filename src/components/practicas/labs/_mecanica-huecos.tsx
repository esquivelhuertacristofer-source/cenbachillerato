"use client";

/**
 * COMPLETA EL TEXTO — mecánica de producción, no de reconocimiento.
 *
 * Por qué existe: los 45 laboratorios DOM hacen todos lo mismo. De sus 135
 * modos, 43 son «clasifica en cubetas» y 36 «empareja término y definición»;
 * 22 laboratorios repiten mecánica dentro de sí mismos, casi siempre con un
 * tercer modo de glosario que ya no aporta nada (el glosario vive completo en
 * la ficha teórica). El alumno arrastra una etiqueta a otra etiqueta y nunca
 * lee una frase entera.
 *
 * Esto es otro acto: un párrafo real con huecos, que el alumno COMPLETA
 * escribiendo. Recordar la palabra es más difícil —y enseña más— que
 * reconocerla entre cinco opciones, y de paso obliga a leer el contexto
 * completo para decidir. El contenido no se inventa: sale de las actividades
 * `fill_blanks` que ya existen en 44 de las 45 progresiones y que hasta ahora
 * ningún laboratorio usaba.
 *
 * Andamiaje, para que exigir producción no deje fuera a nadie:
 *  · «Pista» por hueco, con la pista verbatim de la actividad;
 *  · «Banco de palabras» opcional: las respuestas revueltas, para tocar en vez
 *    de teclear (móvil, teclado, o simplemente quien se atora);
 *  · se aceptan las alternativas declaradas y se ignoran acentos y mayúsculas,
 *    porque lo que se evalúa es el concepto, no la ortografía del acento.
 */

import { useMemo, useRef, useState } from "react";
import { T, OK } from "./_kit";

const NO = "#FF5E5E";

export interface HuecoTexto {
  /** Respuesta canónica, verbatim de la actividad. */
  respuesta: string;
  /** Otras formas que la actividad declara como válidas. */
  alternativas: string[];
  pista?: string;
}

export interface TextoHuecosData {
  /** Actividad de la que sale el texto, para poder rastrearlo. */
  ancla: string;
  instrucciones: string;
  /** El texto partido por los huecos: N+1 trozos para N huecos. */
  partes: string[];
  huecos: HuecoTexto[];
}

/**
 * Sin acentos, sin mayúsculas, sin puntuación, sin espacios de sobra.
 *
 * Los acentos se quitan con la categoría Unicode `\p{Mn}` (marca sin ancho),
 * que es exactamente lo que `normalize("NFD")` separa de cada letra. Escribir
 * en su lugar un rango de caracteres literales funciona igual pero es invisible
 * al leer el código y se pierde si alguien reguarda el archivo con otra
 * codificación.
 */
export function normaliza(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[.,;:!?¡¿"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function esCorrecta(valor: string, hueco: HuecoTexto): boolean {
  const v = normaliza(valor);
  if (!v) return false;
  return [hueco.respuesta, ...hueco.alternativas].some((r) => normaliza(r) === v);
}

type Estado = "vacio" | "bien" | "mal";

export function CompletaTexto({
  data,
  accent,
  rgba,
  completado,
  onCompletado,
  onAcierto,
  onError,
}: {
  data: TextoHuecosData;
  accent: string;
  rgba: string;
  completado: boolean;
  onCompletado: () => void;
  /** Se llama una vez por hueco resuelto. */
  onAcierto?: () => void;
  /** Se llama en cada intento fallido. */
  onError?: () => void;
}) {
  const [valores, setValores] = useState<string[]>(() => data.huecos.map(() => ""));
  const [estados, setEstados] = useState<Estado[]>(() => data.huecos.map(() => "vacio"));
  const [pistaAbierta, setPistaAbierta] = useState<number | null>(null);
  const [banco, setBanco] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const resueltos = estados.filter((e) => e === "bien").length;

  // El banco muestra TODAS las respuestas revueltas, incluidas las ya
  // colocadas: ocultarlas iría delatando cuál falta.
  const palabras = useMemo(() => {
    const xs = data.huecos.map((h) => h.respuesta);
    // Orden estable por texto: barajar en cada render movería las fichas solo.
    return [...xs].sort((a, b) => a.localeCompare(b, "es"));
  }, [data.huecos]);

  function comprobar(i: number, valor: string) {
    if (estados[i] === "bien") return;
    const bien = esCorrecta(valor, data.huecos[i]!);

    // El siguiente estado se calcula AQUÍ y no dentro del actualizador: React
    // puede invocar el actualizador dos veces en modo estricto, y avisar del
    // modo terminado desde dentro lo dispararía repetido.
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

  const anchoDe = (h: HuecoTexto) => Math.max(80, Math.min(230, h.respuesta.length * 11 + 26));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        .mh-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff;
          font-size:14.5px; font-weight:700; padding:5px 10px; font-family:inherit; transition:all .15s; outline:none; }
        .mh-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.18); }
        .mh-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .mh-in[data-e="mal"] { border-color:${NO}; background:${NO}14; animation:mhShake .35s; }
        @keyframes mhShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
        .mh-pista { cursor:pointer; border:none; background:transparent; color:${T.text3}; font-size:12px;
          padding:0 2px; transition:color .15s; }
        .mh-pista:hover { color:${accent}; }
        .mh-word { cursor:pointer; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text};
          border-radius:10px; padding:7px 13px; font-size:13px; font-weight:700; transition:all .14s; }
        .mh-word:hover { border-color:${accent}; background:rgba(${rgba},0.14); }
        @media (prefers-reduced-motion: reduce){ .mh-in[data-e="mal"] { animation:none; } }
      `}</style>

      <div
        style={{
          borderRadius: 15,
          border: `1px solid ${T.line}`,
          background: T.glass,
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 700 }}>{data.instrucciones}</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: resueltos === data.huecos.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
            {resueltos}/{data.huecos.length}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 2.35, color: T.text2 }}>
          {data.partes.map((parte, i) => (
            <span key={i}>
              {parte}
              {i < data.huecos.length && (
                <span style={{ whiteSpace: "nowrap" }}>
                  <input
                    ref={(el) => { refs.current[i] = el; }}
                    className="mh-in"
                    data-e={estados[i]}
                    style={{ width: anchoDe(data.huecos[i]!) }}
                    value={valores[i]}
                    disabled={estados[i] === "bien"}
                    aria-label={`Hueco ${i + 1} de ${data.huecos.length}`}
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
                  {data.huecos[i]!.pista && estados[i] !== "bien" && (
                    <button
                      type="button"
                      className="mh-pista"
                      title="Ver pista"
                      aria-label={`Pista del hueco ${i + 1}`}
                      onClick={() => setPistaAbierta((v) => (v === i ? null : i))}
                    >
                      <i className="fa-solid fa-circle-question" />
                    </button>
                  )}
                </span>
              )}
            </span>
          ))}
        </p>

        {pistaAbierta !== null && data.huecos[pistaAbierta]?.pista && (
          <div
            style={{
              marginTop: 14,
              borderRadius: 11,
              border: `1px solid rgba(${rgba},0.3)`,
              background: `rgba(${rgba},0.08)`,
              padding: "10px 14px",
              fontSize: 13,
              color: T.text2,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ color: accent, marginTop: 2 }} />
            <span>
              <strong style={{ color: T.text }}>Hueco {pistaAbierta + 1}: </strong>
              {data.huecos[pistaAbierta]!.pista}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          className="mh-word"
          onClick={() => setBanco((v) => !v)}
          aria-expanded={banco}
        >
          <i className={`fa-solid ${banco ? "fa-eye-slash" : "fa-list-ul"}`} style={{ marginRight: 8 }} />
          {banco ? "Ocultar el banco de palabras" : "Ver el banco de palabras"}
        </button>
        {resueltos === data.huecos.length && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> ¡Texto completo!
          </span>
        )}
      </div>

      {banco && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {palabras.map((p) => (
            <button
              type="button"
              key={p}
              className="mh-word"
              title="Colocar en el primer hueco vacío"
              onClick={() => {
                const i = estados.findIndex((e) => e !== "bien");
                if (i < 0) return;
                poner(i, p);
                comprobar(i, p);
                refs.current[i]?.focus();
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
