/**
 * SIEMBRA LAS ACTIVIDADES DINÁMICAS DERIVADAS (migración 26).
 *
 * Dos de los cinco tipos nuevos no hace falta escribirlos a mano: ya existe el
 * contenido, validado y verbatim, y lo único que faltaba era una forma de
 * practicarlo que no fuera volver a leerlo.
 *
 *   · relacionar_columnas  ← el glosario de cada progresión (término ↔ definición)
 *   · reto_cronometrado    ← las afirmaciones V/F de toda la UAC (repaso final)
 *
 * POR QUÉ ESTO NO ES "RELLENAR POR RELLENAR". Volver a ver el mismo término una
 * semana después, y tener que recuperarlo en vez de reconocerlo, es lo que
 * separa haber leído de haber aprendido. El glosario de hoy es una lista que se
 * hojea; el mismo glosario convertido en pares que hay que reconstruir obliga a
 * recuperar. Es el mismo contenido, con el trabajo cognitivo cambiado de sitio.
 *
 * QUÉ NO SE DERIVA. `ordenar_secuencia`, `clasificar_categorias` y
 * `caso_decision` NO salen de aquí: no existe un campo del que deducir el orden
 * correcto de un proceso, el criterio de una clasificación ni la consecuencia
 * de una decisión. Ésos se escriben a mano (seed-actividades-dinamicas-autor.ts).
 *
 * DÓNDE SE COLOCAN. Como actividad extra al final de su progresión: el `orden`
 * lo resuelve el sufijo `-A{n}` del código, así que basta con tomar el
 * siguiente número libre. No se toca ninguna actividad existente.
 *
 * IDEMPOTENTE: si el código ya existe, se salta. Se puede relanzar.
 *
 * Uso:
 *   npx tsx scripts/seed-actividades-dinamicas.ts --dry
 *   npx tsx scripts/seed-actividades-dinamicas.ts
 *   npx tsx scripts/seed-actividades-dinamicas.ts --uac CD-I
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { validarContenidoActividad } from "../src/lib/activities/validators";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const DRY = process.argv.includes("--dry");
const SOLO_UAC = process.argv.includes("--uac")
  ? process.argv[process.argv.indexOf("--uac") + 1]
  : null;

/** Definición más larga que esto no cabe en una tarjeta de columna sin volverse un párrafo. */
const MAX_DEFINICION = 150;
/** Afirmación V/F más larga que esto no se lee en los segundos que dura la pregunta. */
const MAX_AFIRMACION = 160;

const PAREJAS_POR_ACTIVIDAD = 5;
const DISTRACTORES = 2;
const PREGUNTAS_RETO = 10;
const SEGUNDOS_RETO = 15;

interface Termino { termino?: string; definicion?: string }
interface AfirmacionVF { enunciado?: string; afirmacion?: string; respuesta?: boolean; retroalimentacion?: string }

type SB = ReturnType<typeof createClient<Database>>;

/** Baraja determinista: la misma UAC produce siempre la misma selección. */
function barajar<T>(items: T[], semilla: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) { h ^= semilla.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

async function main() {
  const sb: SB = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: uacs } = await sb.from("uac").select("id, codigo, nombre, semestre").order("semestre");
  const { data: progs } = await sb.from("progresiones").select("id, codigo, numero, titulo, uac_id").order("numero");

  type Act = { codigo: string; tipo: string; contenido: Record<string, unknown>; progresion_id: string | null };
  const acts: Act[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades").select("codigo, tipo, contenido, progresion_id")
      .order("codigo").range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...(data as unknown as Act[]));
    if (data.length < 1000) break;
  }

  /** Siguiente sufijo -A{n} libre de una progresión. */
  const siguienteOrden = (progCodigo: string): number => {
    let max = 0;
    for (const a of acts) {
      const m = new RegExp(`^${progCodigo}-A(\\d+)$`).exec(a.codigo);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return max + 1;
  };
  const existe = (codigo: string) => acts.some((a) => a.codigo === codigo);

  const aInsertar: Array<{
    codigo: string; titulo: string; descripcion: string; tipo: string;
    tipo_codigo: string; contenido: unknown; progresion_id: string; xp: number;
  }> = [];

  for (const uac of uacs ?? []) {
    if (SOLO_UAC && uac.codigo !== SOLO_UAC) continue;
    const misProgs = (progs ?? []).filter((p) => p.uac_id === uac.id).sort((a, b) => a.numero - b.numero);
    if (misProgs.length === 0) continue;

    // ── 1. relacionar_columnas por progresión, desde su glosario ──────────
    for (const prog of misProgs) {
      const glosario = acts.find(
        (a) => a.progresion_id === prog.id && a.tipo === "glosario_interactivo"
      );
      if (!glosario) continue;

      const terminos = ((glosario.contenido?.terminos ?? []) as Termino[])
        .filter((t) => t.termino && t.definicion && t.definicion.length <= MAX_DEFINICION);
      if (terminos.length < PAREJAS_POR_ACTIVIDAD) continue;

      const elegidos = barajar(terminos, prog.codigo);
      const parejas = elegidos.slice(0, PAREJAS_POR_ACTIVIDAD).map((t) => ({
        izquierda: t.termino!,
        derecha: t.definicion!,
      }));
      // Los distractores salen del MISMO glosario: una definición de otro
      // término de la materia es un distractor plausible; una inventada, no.
      const distractores = elegidos
        .slice(PAREJAS_POR_ACTIVIDAD, PAREJAS_POR_ACTIVIDAD + DISTRACTORES)
        .map((t) => t.definicion!);

      const orden = siguienteOrden(prog.codigo);
      const codigo = `${prog.codigo}-A${orden}`;
      if (existe(codigo)) continue;

      const contenido = {
        instrucciones:
          "Toca un concepto de la izquierda y después la definición que le corresponde. " +
          "Son los términos del glosario de esta progresión: la idea es reconstruirlos de memoria, no buscarlos.",
        titulo_izquierda: "Concepto",
        titulo_derecha: "Definición",
        parejas,
        distractores,
        puntaje_minimo_aprobacion: 70,
      };
      const v = validarContenidoActividad("relacionar_columnas", contenido);
      if (!v.success) { console.log(`  ! ${codigo}: contenido inválido`); continue; }

      aInsertar.push({
        codigo,
        // El `titulo` de una progresión es su propósito MCCEMS completo —un
        // párrafo— y no cabe como título de actividad. Se usa el número, que es
        // además lo que el alumno ve en la ruta y en el panel lateral.
        titulo: `Relaciona los conceptos clave de la progresión ${prog.numero}`,
        descripcion: "Repaso de recuperación: reconstruye los pares concepto–definición del glosario.",
        tipo: "relacionar_columnas",
        tipo_codigo: "relacionar_columnas",
        contenido,
        progresion_id: prog.id,
        xp: 15,
      });
    }

    // ── 2. reto_cronometrado por UAC, desde sus afirmaciones V/F ──────────
    const idsProg = new Set(misProgs.map((p) => p.id));
    const afirmaciones: AfirmacionVF[] = [];
    for (const a of acts) {
      if (a.tipo !== "quiz_verdadero_falso" || !a.progresion_id || !idsProg.has(a.progresion_id)) continue;
      afirmaciones.push(...((a.contenido?.preguntas ?? []) as AfirmacionVF[]));
    }
    const usables = afirmaciones.filter((p) => {
      const e = p.enunciado ?? p.afirmacion ?? "";
      return e.length > 0 && e.length <= MAX_AFIRMACION && typeof p.respuesta === "boolean";
    });
    if (usables.length >= PREGUNTAS_RETO) {
      const ultima = misProgs[misProgs.length - 1]!;
      const orden = siguienteOrden(ultima.codigo) + (
        // Si en esta misma corrida ya se apartó un -A{n} para esta progresión,
        // el reto toma el siguiente: `acts` todavía no conoce lo que no se ha
        // insertado y si no se cuenta aquí saldrían dos actividades con el
        // mismo código y el insert fallaría por la UNIQUE de `codigo`.
        aInsertar.filter((x) => x.progresion_id === ultima.id).length
      );
      const codigo = `${ultima.codigo}-A${orden}`;
      if (!existe(codigo)) {
        const elegidas = barajar(usables, uac.codigo).slice(0, PREGUNTAS_RETO);
        const contenido = {
          instrucciones:
            `Repaso rápido de toda la materia. Cada afirmación dura ${SEGUNDOS_RETO} segundos: ` +
            "responde con lo que ya tienes aprendido, no busques la respuesta.",
          segundos_por_pregunta: SEGUNDOS_RETO,
          preguntas: elegidas.map((p) => ({
            enunciado: p.enunciado ?? p.afirmacion ?? "",
            opciones: ["Verdadero", "Falso"],
            respuesta_correcta: p.respuesta === true ? 0 : 1,
          })),
          puntaje_minimo_aprobacion: 60,
        };
        const v = validarContenidoActividad("reto_cronometrado", contenido);
        if (v.success) {
          aInsertar.push({
            codigo,
            titulo: `Reto contrarreloj: ${uac.nombre}`,
            descripcion: "Ronda rápida de repaso con afirmaciones de todas las progresiones de la materia.",
            tipo: "reto_cronometrado",
            tipo_codigo: "reto_cronometrado",
            contenido,
            progresion_id: ultima.id,
            xp: 20,
          });
        } else {
          console.log(`  ! ${codigo}: contenido inválido`);
        }
      }
    }
  }

  const porTipo = aInsertar.reduce<Record<string, number>>((m, a) => {
    m[a.tipo] = (m[a.tipo] ?? 0) + 1; return m;
  }, {});
  console.log(`\nA insertar: ${aInsertar.length} ${JSON.stringify(porTipo)}`);
  if (DRY) {
    for (const a of aInsertar.slice(0, 8)) console.log(`  ${a.codigo}  ${a.tipo}  ${a.titulo}`);
    // Una muestra completa de cada tipo, para poder leer el contenido antes de
    // escribir 182 filas en producción.
    for (const t of ["relacionar_columnas", "reto_cronometrado"]) {
      const m = aInsertar.find((a) => a.tipo === t);
      if (m) console.log(`\n--- MUESTRA ${t} (${m.codigo}) ---\n${JSON.stringify(m.contenido, null, 1)}`);
    }
    console.log("\n  (DRY: no se escribió nada)");
    return;
  }

  let ok = 0; const fallos: string[] = [];
  for (let i = 0; i < aInsertar.length; i += 50) {
    const lote = aInsertar.slice(i, i + 50).map((a) => ({ ...a, estado: "publicada" as const }));
    const { error } = await sb.from("actividades").insert(lote as never);
    if (error) { fallos.push(`lote ${i}: ${error.message}`); continue; }
    ok += lote.length;
    console.log(`  ${ok}/${aInsertar.length}`);
  }
  console.log(`\ninsertadas ${ok}   fallos ${fallos.length}`);
  for (const f of fallos) console.log(`  FALLO ${f}`);
  if (fallos.length) process.exit(1);
  console.log("\nRECUERDA: sube CATALOG_CACHE_VERSION en src/lib/catalog-cache.ts para que el hub vea las nuevas.");
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });
