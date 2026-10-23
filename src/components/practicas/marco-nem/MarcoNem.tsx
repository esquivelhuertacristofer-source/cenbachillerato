"use client";

// =============================================================================
// NEM Plataforma — Marco inmersivo de laboratorio
// =============================================================================
// Lo comparten los 62 laboratorios, entren por /aula/laboratorios/[slug] o por
// una actividad (/aula/actividades/[codigo]/practica).
//
// Qué había antes y por qué se tiró: una página blanca con migas, un hero con
// el ícono, una «Preparación del laboratorio» con tarjetas de material y,
// dentro, el laboratorio en UNA columna larga: la escena 3D era una ventanita
// de 420 px a media página y para mover lo que se veía había que bajar. Un
// cuarto de la información cabía en pantalla. Además el marco ofrecía un
// interruptor claro/oscuro que dejaba letras blancas sobre blanco en los labs
// escritos para fondo oscuro.
//
// Lo que hay ahora, con la misma gramática que las aventuras:
//   · PORTADA a pantalla completa: imagen real de la escena, título grande,
//     qué se va a hacer y un solo botón. El material del salón va ahí, en
//     chips, no como compuerta.
//   · ADENTRO, nada se desplaza salvo el panel: barra fina arriba, la escena
//     llenando todo lo que queda y el resto del laboratorio en un panel
//     lateral (abajo en el teléfono). La teoría y la guía docente son cajones
//     que se abren desde la barra.
//   · Un solo tema por laboratorio. Sin interruptor: el de noche para los que
//     se escribieron sobre fondo oscuro, papel para los de fases tempranas.
// =============================================================================

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { fraunces } from "./lib/fuentes";
import { montserrat, LABS_MARCA_CEN } from "./lib/marca-cen";
import { LogoCEN } from "./lib/LogoCEN";
import { usePreferenciaEfectos } from "./lib/efectos-sonoros";
import { silenciar } from "./labs/sfx-labs";
import { SfxLaboratorio } from "./labs/SfxLaboratorio";
import { DestinosLabCtx, type Destino, type DestinosLab } from "./labs/_escena";
import type { LabColor } from "./tipos";
import type { LabMeta } from "./tipos";
import "./marco-nem.css";

type Cuentas = Record<Destino, number>;
function contar(c: Cuentas, a: { d: Destino; delta: 1 | -1 }): Cuentas {
  return { ...c, [a.d]: Math.max(0, c[a.d] + a.delta) };
}

/* ── Pantalla completa, como almacén externo ─────────────────────────────── */
function suscribirPantalla(avisar: () => void) {
  document.addEventListener("fullscreenchange", avisar);
  return () => document.removeEventListener("fullscreenchange", avisar);
}
const enPantallaCompleta = () => typeof document !== "undefined" && !!document.fullscreenElement;
const enServidor = () => false;
const sinSuscripcion = () => () => {};
const enNavegador = () => true;

export interface MarcoNemProps {
  slug: string;
  labMeta: LabMeta;
  color: LabColor;
  /** A dónde lleva la flecha de la barra. */
  volver: { href: string; etiqueta: string };
  /** Contexto curricular que se muestra en la portada (campo, concepto…). */
  contexto?: string;
  /** El laboratorio ya montado. */
  children: ReactNode;
}

export function MarcoNem({ slug, labMeta, color, volver, contexto, children }: MarcoNemProps) {
  const [dentro, setDentro] = useState(false);
  const [cajon, setCajon] = useState<null | "teoria" | "guia">(null);
  const [cuentas, avisarCuenta] = useReducer(contar, { escena: 0, teoria: 0, guia: 0, lleno: 0, ancho: 0 });

  // Nodos de los destinos. Con estado (callback ref) y no con useRef: el
  // laboratorio tiene que volver a pintarse cuando el nodo ya existe para que
  // su portal encuentre a dónde ir.
  const [nodoEscena, setNodoEscena] = useState<HTMLElement | null>(null);
  const [nodoTeoria, setNodoTeoria] = useState<HTMLElement | null>(null);
  const [nodoGuia, setNodoGuia] = useState<HTMLElement | null>(null);

  const avisar = useCallback((d: Destino, delta: 1 | -1) => avisarCuenta({ d, delta }), []);
  const tono: DestinosLab["tono"] = labMeta.temaPropio ? "papel" : "noche";
  const destinos = useMemo<DestinosLab>(
    () => ({ nodos: { escena: nodoEscena, teoria: nodoTeoria, guia: nodoGuia }, avisar, tono }),
    [nodoEscena, nodoTeoria, nodoGuia, avisar, tono],
  );

  const [sonidoActivo, alternarSonido] = usePreferenciaEfectos();
  const completa = useSyncExternalStore(suscribirPantalla, enPantallaCompleta, enServidor);
  const alternarCompleta = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  // El marco cubre el aula entera: la página de abajo no debe desplazarse con
  // la rueda mientras tanto.
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);

  // Esc cierra el cajón abierto.
  useEffect(() => {
    if (!cajon) return undefined;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCajon(null);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [cajon]);

  // El marco se monta en <body>: dentro del contenido del aula quedaba
  // atrapado en su contexto de apilamiento y, en el teléfono, la barra de
  // navegación del aula (z-40, en otro contexto) se le encimaba.
  const enCliente = useSyncExternalStore(sinSuscripcion, enNavegador, enServidor);

  const conEscena = cuentas.escena > 0;
  const nivel = labMeta.grado ?? "Bachillerato";
  const estiloRaiz = {
    ["--lx-acento" as string]: color.hex,
    ["--lx-rgb" as string]: color.rgba,
  } as CSSProperties;

  // Piel de marca CEN (atlas, explorador): barra azul, letra y logo de CEN.
  const marca = LABS_MARCA_CEN.has(slug);

  if (!enCliente) return null;
  return createPortal(
    <div
      className={`lx-raiz lab-tactil ${fraunces.variable} ${montserrat.variable}`}
      data-tono={tono}
      data-marca={marca ? "cen" : undefined}
      style={estiloRaiz}
    >
      {!dentro ? (
        <Portada
          slug={slug}
          labMeta={labMeta}
          nivel={nivel}
          contexto={contexto}
          volver={volver}
          marca={marca}
          entrar={() => setDentro(true)}
        />
      ) : null}

      {/* El laboratorio se monta desde el principio, oculto tras la portada:
          así la escena ya está cargada cuando el alumno entra. */}
      <div className="lx-app" hidden={!dentro} aria-hidden={!dentro}>
        <header className="lx-barra">
          <Link href={volver.href} className="lx-volver" title={`Volver a ${volver.etiqueta}`}>
            <i className="fa-solid fa-arrow-left" aria-hidden />
            <span className="lx-sin-tel">{volver.etiqueta}</span>
          </Link>
          {marca ? (
            <span className="lx-logo-barra">
              <LogoCEN alto={30} compacto azul="#ffffff" />
            </span>
          ) : (
            <span className="lx-icono" aria-hidden>
              <i className={`fa-solid ${labMeta.icono}`} />
            </span>
          )}
          <div className="lx-titulo">
            <h1>{labMeta.titulo}</h1>
            <span className="lx-sin-tel">
              {labMeta.disciplina} · {nivel}
            </span>
          </div>

          <div className="lx-acciones">
            {cuentas.teoria > 0 && (
              <button
                type="button"
                className="lx-boton"
                data-on={cajon === "teoria"}
                aria-expanded={cajon === "teoria"}
                onClick={() => setCajon((c) => (c === "teoria" ? null : "teoria"))}
              >
                <i className="fa-solid fa-book-open" aria-hidden />
                <span className="lx-sin-tel">Teoría</span>
              </button>
            )}
            {cuentas.guia > 0 && (
              <button
                type="button"
                className="lx-boton"
                data-on={cajon === "guia"}
                aria-expanded={cajon === "guia"}
                onClick={() => setCajon((c) => (c === "guia" ? null : "guia"))}
              >
                <i className="fa-solid fa-chalkboard-user" aria-hidden />
                <span className="lx-sin-tel">Guía docente</span>
              </button>
            )}
            <button
              type="button"
              className="lx-boton lx-redondo"
              aria-pressed={sonidoActivo}
              title={sonidoActivo ? "Silenciar el laboratorio" : "Activar el sonido"}
              onClick={() => {
                if (sonidoActivo) silenciar();
                alternarSonido();
              }}
            >
              <i className={`fa-solid ${sonidoActivo ? "fa-volume-high" : "fa-volume-xmark"}`} aria-hidden />
            </button>
            <button
              type="button"
              className="lx-boton lx-redondo lx-sin-tel"
              aria-pressed={completa}
              title={completa ? "Salir de pantalla completa" : "Pantalla completa"}
              onClick={alternarCompleta}
            >
              <i className={`fa-solid ${completa ? "fa-compress" : "fa-expand"}`} aria-hidden />
            </button>
            <button
              type="button"
              className="lx-boton lx-redondo"
              title="Ver la portada del laboratorio"
              onClick={() => setDentro(false)}
            >
              <i className="fa-solid fa-circle-info" aria-hidden />
            </button>
          </div>
        </header>

        {/* El sonido del laboratorio escucha en el DOM: tiene que abarcar el
            escenario (a donde se van la escena y sus controles por portal) y
            el panel. No genera caja. */}
        <SfxLaboratorio>
          <main className="lx-cuerpo" data-escena={conEscena} data-lleno={cuentas.lleno > 0} data-ancho={cuentas.ancho > 0}>
            <div className="lx-escena" ref={setNodoEscena} />
            <div className="lx-panel">
              <DestinosLabCtx.Provider value={destinos}>{children}</DestinosLabCtx.Provider>
            </div>
          </main>
        </SfxLaboratorio>

        {/* Cajones. Siempre montados (ocultos) para que los portales tengan
            destino desde el primer cuadro. */}
        <div className="lx-velo" hidden={!cajon} onClick={() => setCajon(null)} />
        <aside className="lx-cajon" data-abierto={cajon !== null} aria-hidden={!cajon} aria-label="Material de consulta">
          <div className="lx-cajon-cabeza">
            <strong>{cajon === "guia" ? "Guía para el docente" : "Teoría del laboratorio"}</strong>
            <button type="button" className="lx-boton lx-redondo" onClick={() => setCajon(null)} title="Cerrar">
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          </div>
          <div className="lx-cajon-cuerpo" data-tono-cajon={cajon === "guia" ? "papel" : "noche"}>
            <div ref={setNodoTeoria} hidden={cajon !== "teoria"} />
            <div ref={setNodoGuia} hidden={cajon !== "guia"} />
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  );
}

/* ── Portada ─────────────────────────────────────────────────────────────── */

function Portada({
  slug,
  labMeta,
  nivel,
  contexto,
  volver,
  marca,
  entrar,
}: {
  slug: string;
  labMeta: LabMeta;
  nivel: string;
  contexto?: string;
  volver: { href: string; etiqueta: string };
  marca: boolean;
  entrar: () => void;
}) {
  const [antes, despues] = partirTitulo(labMeta.titulo);
  const necesarios = labMeta.materiales.filter((m) => m.obligatorio);
  const opcionales = labMeta.materiales.filter((m) => !m.obligatorio);

  return (
    <section className="lx-portada" aria-label={`Portada: ${labMeta.titulo}`}>
      {/* La imagen es una captura real de la escena del laboratorio. Si falta,
          queda el degradado del color del laboratorio: nunca un hueco. */}
      <div className="lx-portada-fondo" style={{ backgroundImage: `url(/media/nem/labs-portada/${slug}.webp)` }} />
      <div className="lx-portada-velo" />

      <Link href={volver.href} className="lx-volver lx-portada-volver">
        <i className="fa-solid fa-arrow-left" aria-hidden />
        {volver.etiqueta}
      </Link>

      {marca ? (
        <div className="lx-portada-logo">
          <LogoCEN alto={64} />
        </div>
      ) : null}

      <div className="lx-portada-texto">
        <p className="lx-ceja">
          <i className={`fa-solid ${labMeta.icono}`} aria-hidden /> Laboratorio · {labMeta.disciplina} · {nivel}
        </p>
        <h2 className="lx-portada-titulo">
          <span>{antes}</span>
          {despues ? <em>{despues}</em> : null}
        </h2>
        <p className="lx-portada-desc">{labMeta.descripcion}</p>
        {contexto ? <p className="lx-portada-contexto">{contexto}</p> : null}

        <ul className="lx-portada-rasgos">
          <li>
            <i className="fa-solid fa-cube" aria-hidden /> Escena que puedes girar y acercar
          </li>
          <li>
            <i className="fa-solid fa-hand-pointer" aria-hidden /> Tú mueves las variables
          </li>
          <li>
            <i className="fa-solid fa-book-open" aria-hidden /> Teoría a un clic
          </li>
        </ul>

        <button type="button" className="lx-entrar" onClick={entrar} autoFocus>
          Entrar al laboratorio
          <i className="fa-solid fa-arrow-right" aria-hidden />
        </button>

        {labMeta.materiales.length > 0 && (
          <div className="lx-material">
            <p>
              <i className="fa-solid fa-toolbox" aria-hidden /> Si la haces en el salón
            </p>
            <ul>
              {necesarios.map((m) => (
                <li key={m.id} data-necesario="true">
                  <i className={`fa-solid ${m.icono}`} aria-hidden /> {m.nombre}
                </li>
              ))}
              {opcionales.map((m) => (
                <li key={m.id}>
                  <i className={`fa-solid ${m.icono}`} aria-hidden /> {m.nombre}
                </li>
              ))}
            </ul>
            {necesarios.length > 0 && <small>Lo marcado en color es necesario por seguridad.</small>}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Parte el título en dos para el acento de la portada: lo que va después de
 * «y», «:» o «—» se pinta en cursiva. Si no hay dónde partir, va entero.
 */
function partirTitulo(t: string): [string, string] {
  const m = t.match(/^(.+?)(\s(?:y|:|—|-)\s.+)$/);
  if (!m) return [t, ""];
  return [m[1]!, m[2]!.trim()];
}
