/**
 * MONTA LA FICHA TEÓRICA EN UN CAJÓN DENTRO DE LOS LABORATORIOS DOM.
 *
 * Los 45 laboratorios no-STEM salieron todos del mismo molde: `_kit`, una barra
 * de modos, un botón de sonido y un botón de reiniciar. Eso permite hacer el
 * cableado con un codemod en vez de a mano archivo por archivo. Hace las cinco
 * ediciones del patrón de oro:
 *
 *   1. importa `FichaTeorica` y la constante de `{slug}-ficha`
 *   2. añade el estado `drawer`
 *   3. añade el CSS del cajón (scrim + aside + botón flotante) al <style>
 *   4. añade el botón «Teoría» a la barra, antes del de sonido
 *   5. añade el botón flotante y el <aside> del cajón tras la barra
 *
 * El botón flotante va abajo a la DERECHA a propósito: el subtítulo del
 * narrador es `position:fixed` abajo al centro con z-index 60, y encimarlos
 * taparía la voz del alumno.
 *
 * Es idempotente: un archivo que ya importa `./_ficha` se salta.
 *
 * Uso: npx tsx scripts/aplicar-ficha-labs.ts [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { inventario } from "./auditar-labs";
import { nombreConstante } from "./generar-fichas-labs";

const RAIZ = process.cwd();
const LABS_DIR = resolve(RAIZ, "src/components/practicas/labs");

/** El prefijo CSS que usa este lab (`.fal-icobtn` → `fal`). */
function prefijoCss(src: string): string | null {
  const m = src.match(/className="([a-z]+)-icobtn"/);
  return m ? m[1] : null;
}

function cssCajon(p: string): string {
  return `
        /* Cajón de teoría */
        .${p}-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .${p}-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .${p}-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(\${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .${p}-drawer[data-open="true"] { transform:translateX(0); }
        .${p}-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid \${T.line}; }
        .${p}-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .${p}-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid \${T.line};
          background:\${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .${p}-close:hover { border-color:\${accent}; background:rgba(\${color.rgba},0.16); }
        .${p}-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid \${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px \${accent}; transition:all .16s; }
        .${p}-teoria-fab:hover { background:rgba(\${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .${p}-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
`;
}

function botonToolbar(p: string): string {
  return `        <button className="${p}-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
`;
}

function bloqueCajon(p: string, constante: string): string {
  return `
      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="${p}-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="${p}-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="${p}-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="${p}-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="${p}-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="${p}-drawer-body">
          <FichaTeorica data={${constante}} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
`;
}

interface Resultado { slug: string; ok: boolean; motivo?: string }

export function cablearFicha(slug: string, componente: string, dry: boolean): Resultado {
  const archivo = resolve(LABS_DIR, `${componente}.tsx`);
  const ficha = resolve(LABS_DIR, `${slug}-ficha.ts`);
  if (!existsSync(archivo)) return { slug, ok: false, motivo: "no existe el componente" };
  if (!existsSync(ficha)) return { slug, ok: false, motivo: `falta ${slug}-ficha.ts` };

  const original = readFileSync(archivo, "utf8");
  if (original.includes('from "./_ficha"')) return { slug, ok: true, motivo: "ya estaba cableado" };

  // Estos archivos están guardados con CRLF. Se trabaja en LF y se restaura el
  // final de línea al escribir: comparar líneas sin esto falla siempre, porque
  // cada una termina en "\r".
  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;

  const p = prefijoCss(src);
  if (!p) return { slug, ok: false, motivo: "no se pudo deducir el prefijo CSS" };
  const constante = nombreConstante(slug);

  // 1 ── imports ─────────────────────────────────────────────────────────
  const anclaImport = 'import { LabSfx } from "./lab-audio";';
  if (!src.includes(anclaImport)) return { slug, ok: false, motivo: "sin import de LabSfx" };
  src = src.replace(
    anclaImport,
    `${anclaImport}\nimport { FichaTeorica } from "./_ficha";\nimport { ${constante} } from "./${slug}-ficha";`
  );

  // 2 ── estado ──────────────────────────────────────────────────────────
  const anclaEstado = "const [sonido, setSonido] = useState(false);";
  if (!src.includes(anclaEstado)) return { slug, ok: false, motivo: "sin estado de sonido" };
  src = src.replace(anclaEstado, `${anclaEstado}\n  const [drawer, setDrawer] = useState(false);`);

  // 3 ── CSS, justo antes de cerrar el <style> ───────────────────────────
  const cierreStyle = "      `}</style>";
  if (!src.includes(cierreStyle)) return { slug, ok: false, motivo: "no se encontró el cierre del <style>" };
  src = src.replace(cierreStyle, `${cssCajon(p)}${cierreStyle}`);

  // 4 ── botón en la barra, antes del de sonido ──────────────────────────
  const anclaSonido = `        <button className="${p}-icobtn" data-on={sonido} onClick={toggleSonido}`;
  const iSonido = src.indexOf(anclaSonido);
  if (iSonido < 0) return { slug, ok: false, motivo: "no se encontró el botón de sonido" };
  src = src.slice(0, iSonido) + botonToolbar(p) + src.slice(iSonido);

  // 5 ── cajón, después de la barra ──────────────────────────────────────
  // La barra abre en un <div> a seis espacios; su cierre es la primera línea
  // que es exactamente "      </div>" a partir de ahí.
  const lineas = src.split("\n");
  const iBarra = lineas.findIndex((l) => l.includes('flexWrap: "wrap", marginBottom: 18 }}>'));
  if (iBarra < 0) return { slug, ok: false, motivo: "no se encontró la barra de modos" };
  let iCierre = -1;
  for (let i = iBarra + 1; i < lineas.length; i++) {
    if (lineas[i] === "      </div>") { iCierre = i; break; }
  }
  if (iCierre < 0) return { slug, ok: false, motivo: "no se encontró el cierre de la barra" };
  lineas.splice(iCierre + 1, 0, bloqueCajon(p, constante).replace(/\n$/, ""));
  src = lineas.join("\n");

  if (!dry) writeFileSync(archivo, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  return { slug, ok: true };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);

  const objetivo = inventario().filter((f) => !f.ficha && (!solo || f.slug === solo));
  console.log(`${objetivo.length} laboratorios sin ficha cableada${dry ? " (dry)" : ""}\n`);

  const fallos: Resultado[] = [];
  let hechos = 0;
  for (const f of objetivo) {
    const r = cablearFicha(f.slug, f.componente, dry);
    if (r.ok) { hechos++; console.log(`  ✓ ${f.slug}${r.motivo ? ` (${r.motivo})` : ""}`); }
    else { fallos.push(r); console.log(`  ✗ ${f.slug} — ${r.motivo}`); }
  }
  console.log(`\n${hechos} cableados, ${fallos.length} fallos.`);
  if (fallos.length) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].includes("aplicar-ficha-labs")) main();
