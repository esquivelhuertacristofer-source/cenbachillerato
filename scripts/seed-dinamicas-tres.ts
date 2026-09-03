/**
 * LAS TRES QUE NO SE PODÍAN DERIVAR.
 *
 * `seed-dinamicas-rezagadas.ts` cerró veinte de las veintitrés progresiones que
 * no tenían laboratorio ni ninguna actividad manipulable. Las tres restantes se
 * quedaron fuera por una razón honesta: su glosario está vacío, y de un glosario
 * vacío no se deriva nada. Este script las escribe a mano.
 *
 * Cada una toma su contenido de la lectura que la progresión ya tiene publicada,
 * y elige el tipo de actividad según lo que esa lectura realmente enseña —no el
 * mismo molde para las tres:
 *
 *   LC-I-P03  clasificar_categorias. La lectura entera se sostiene sobre una
 *             distinción de tres términos (información / idea / opinión) y esa
 *             distinción SOLO se aprende clasificando casos. Un quiz pregunta si
 *             el alumno recuerda la definición; clasificar nueve enunciados
 *             reales le pregunta si sabe aplicarla, que es lo que el propósito
 *             de la progresión pide.
 *
 *   PM-I-P03  relacionar_columnas. Los cinco conectivos lógicos se confunden
 *             justamente entre sí: la disyunción se lee como conjunción, la
 *             implicación como bicondicional. Emparejar cada uno con su regla de
 *             verdad obliga a distinguirlos en bloque, no de uno en uno.
 *
 *   PM-I-P01  relacionar_columnas. El propósito es reconocer las matemáticas
 *             como construcción colectiva; emparejar cada cultura o persona con
 *             su aportación concreta es exactamente esa idea, hecha ejercicio.
 *
 * Uso: npx tsx scripts/seed-dinamicas-tres.ts [--dry]
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { validarContenidoActividad, type TipoActividadKey } from "../src/lib/activities/validators";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const DRY = process.argv.includes("--dry");

interface Obra {
  progresion: string;
  tipo: TipoActividadKey;
  titulo: string;
  descripcion: string;
  contenido: Record<string, unknown>;
}

const OBRA: Obra[] = [
  {
    progresion: "LC-I-P03",
    tipo: "clasificar_categorias",
    titulo: "¿Información, idea u opinión?",
    descripcion:
      "Clasifica nueve enunciados según sean información verificable, una idea del autor o una opinión personal.",
    contenido: {
      instrucciones:
        "Arrastra cada enunciado a la columna que le corresponde. Si estás en un teléfono, " +
        "toca primero el enunciado y después la columna.",
      categorias: [
        {
          nombre: "Información",
          descripcion: "Se puede contrastar con la realidad: una fecha, una cifra, un nombre.",
        },
        {
          nombre: "Idea",
          descripcion: "Es una interpretación o valoración que el autor construye a partir de información.",
        },
        {
          nombre: "Opinión",
          descripcion: "Expresa la postura personal de quien escribe y no se puede verificar objetivamente.",
        },
      ],
      elementos: [
        {
          texto: "México tiene 32 entidades federativas.",
          categoria: "Información",
          explicacion: "Es un dato que se puede comprobar en la Constitución: se contrasta y se verifica.",
        },
        {
          texto: "El sismo del 19 de septiembre de 2017 tuvo magnitud 7.1.",
          categoria: "Información",
          explicacion: "Una cifra registrada por el Servicio Sismológico Nacional: verificable.",
        },
        {
          texto: "La biblioteca de la escuela abre de 8 a 14 horas.",
          categoria: "Información",
          explicacion: "Un horario concreto: basta ir a la puerta para comprobarlo.",
        },
        {
          texto: "El aumento de bibliotecas públicas explica la mejora en los hábitos de lectura.",
          categoria: "Idea",
          explicacion:
            "Parte de datos reales, pero la relación de causa que propone es una interpretación del autor.",
        },
        {
          texto: "La migración transformó la economía de las comunidades del occidente del país.",
          categoria: "Idea",
          explicacion: "Es una lectura de los hechos: otro autor podría interpretar los mismos datos distinto.",
        },
        {
          texto: "Las redes sociales cambiaron la forma en que los jóvenes construyen su identidad.",
          categoria: "Idea",
          explicacion: "Interpreta un fenómeno observable, pero la conclusión es del autor, no del dato.",
        },
        {
          texto: "Leer novelas es mucho más valioso que ver series.",
          categoria: "Opinión",
          explicacion: "Establece una jerarquía de valor personal: no hay forma de verificarla.",
        },
        {
          texto: "La mejor música mexicana es la de los años setenta.",
          categoria: "Opinión",
          explicacion: "'La mejor' es un juicio de gusto: depende de quien lo dice.",
        },
        {
          texto: "Deberíamos dedicar más horas de clase a la escritura.",
          categoria: "Opinión",
          explicacion: "Una propuesta basada en una postura personal sobre lo que conviene.",
        },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    progresion: "PM-I-P03",
    tipo: "relacionar_columnas",
    titulo: "Cada conectivo lógico con su regla de verdad",
    descripcion:
      "Empareja los cinco conectivos lógicos con la condición exacta que determina su valor de verdad.",
    contenido: {
      instrucciones:
        "Toca un conectivo de la izquierda y después la regla que le corresponde. " +
        "Puedes cambiar una pareja tocándola de nuevo antes de revisar.",
      titulo_izquierda: "Conectivo",
      titulo_derecha: "Cuándo es verdadera",
      parejas: [
        {
          izquierda: "Conjunción (p Y q)",
          derecha: "Es verdadera solo si las dos proposiciones son verdaderas.",
        },
        {
          izquierda: "Disyunción (p O q)",
          derecha: "Es falsa solo si las dos proposiciones son falsas.",
        },
        {
          izquierda: "Negación (NO p)",
          derecha: "Invierte el valor de verdad de la proposición original.",
        },
        {
          izquierda: "Implicación (si p, entonces q)",
          derecha: "Es falsa únicamente cuando p es verdadera y q es falsa.",
        },
        {
          izquierda: "Bicondicional (p si y solo si q)",
          derecha: "Es verdadera cuando ambas proposiciones tienen el mismo valor de verdad.",
        },
      ],
      // Los dos distractores son las confusiones reales: quien lee la disyunción
      // como conjunción escoge la primera; quien no distingue la implicación de
      // la bicondicional escoge la segunda.
      distractores: [
        "Es verdadera solo si al menos una de las dos proposiciones es falsa.",
        "Es verdadera siempre que p sea falsa, sin importar el valor de q.",
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    progresion: "PM-I-P01",
    tipo: "relacionar_columnas",
    titulo: "Quién aportó qué a las matemáticas",
    descripcion:
      "Empareja cada cultura o persona con la aportación matemática que hizo, según la lectura de la progresión.",
    contenido: {
      instrucciones:
        "Toca un nombre de la izquierda y después la aportación que le corresponde. " +
        "Puedes cambiar una pareja tocándola de nuevo antes de revisar.",
      titulo_izquierda: "Cultura o persona",
      titulo_derecha: "Aportación",
      parejas: [
        {
          izquierda: "Babilonios",
          derecha:
            "Un sistema de numeración posicional en base 60, que seguimos usando para medir el tiempo.",
        },
        {
          izquierda: "Mayas",
          derecha: "Inventaron el cero de forma independiente al resto del mundo.",
        },
        {
          izquierda: "Matemáticos árabes",
          derecha: "Sistematizaron el álgebra como campo de estudio.",
        },
        {
          izquierda: "Hipatia de Alejandría",
          derecha:
            "Contribuyó al pensamiento matemático abstracto pese a los obstáculos de su época.",
        },
        {
          izquierda: "Emmy Noether",
          derecha:
            "Aportó al álgebra abstracta enfrentando las barreras que se imponían a las mujeres científicas.",
        },
      ],
      distractores: [
        "Midieron tierras y calcularon cosechas porque la agricultura lo exigía.",
        "Desarrollaron la geometría para levantar edificios y templos.",
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
];

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let ok = 0;
  for (const o of OBRA) {
    const v = validarContenidoActividad(o.tipo, o.contenido);
    if (!v.success) {
      console.log(`  ✗ ${o.progresion}: contenido inválido — ${JSON.stringify(v.error)}`);
      continue;
    }

    const { data: prog, error: e1 } = await sb
      .from("progresiones").select("id").eq("codigo", o.progresion).single();
    if (e1 || !prog) { console.log(`  ✗ ${o.progresion}: progresión no encontrada`); continue; }

    const { data: hermanas } = await sb
      .from("actividades").select("codigo").eq("progresion_id", prog.id);
    let max = 0;
    for (const a of hermanas ?? []) {
      const m = /-A(\d+)$/.exec(a.codigo);
      if (m) max = Math.max(max, Number(m[1]));
    }
    const codigo = `${o.progresion}-A${max + 1}`;

    if (DRY) { console.log(`  [dry] ${codigo} ${o.tipo} — ${o.titulo}`); ok++; continue; }

    const { error } = await sb.from("actividades").upsert({
      codigo,
      titulo: o.titulo,
      descripcion: o.descripcion,
      tipo: o.tipo,
      tipo_codigo: o.tipo,
      contenido: v.data as never,
      progresion_id: prog.id,
      xp: 10,
      estado: "publicada",
    } as never, { onConflict: "codigo" });

    if (error) { console.log(`  ✗ ${codigo}: ${error.message}`); continue; }
    console.log(`  ✓ ${codigo} [${o.tipo}] — ${o.titulo}`);
    ok++;
  }
  console.log(`\n${DRY ? "Se insertarían" : "Insertadas"} ${ok}/${OBRA.length}`);
}

main();
