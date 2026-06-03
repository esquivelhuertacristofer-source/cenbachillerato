/**
 * Plantilla CEN completa (A1-A7) para las 3 progresiones NUEVAS de CD-I:
 *   CD-I-P09 (numero 4) — Software libre: 4 libertades, GNU/Linux, ofimática (Oficial 4)
 *   CD-I-P10 (numero 6) — IA responsable, copyleft, contaminación digital (Oficial 6)
 *   CD-I-P11 (numero 8) — Lenguaje algorítmico: datos, variables, operadores, estructuras (Oficial 8)
 * A1=lectura · A2=quiz_multiple_opcion · A3=reflexion_escrita · A4=quiz_verdadero_falso
 * A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion. Todas estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-cdi-nuevas.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A1", "A2", "A3", "A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 CD-I — A1-A7 para las 3 progresiones nuevas (P09, P10, P11)\n");
  const progs = await getProgresionesDeUAC(sb, "CD-I");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = nuevas[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const a = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: a.titulo, descripcion: a.descripcion,
        tipo: a.tipo, progresion_id: p.id, xp: a.xp, contenido: a.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ CD-I nuevas: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (existentes).\n`);
}

const nuevas: Record<string, Act[]> = {
  // ════════════════ CD-I-P09 (numero 4) — Software libre (Oficial 4) ════════════════
  "CD-I-P09": [
    { titulo: "Las cuatro libertades del software libre", descripcion: "Lectura sobre el software libre, GNU/Linux y la cultura del 'Hazlo tú mismx'.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "El software libre es aquel que respeta la libertad de las personas usuarias. Se define por cuatro libertades: (0) usar el programa para cualquier propósito; (1) estudiar cómo funciona y adaptarlo, lo que requiere acceso al código fuente; (2) distribuir copias para ayudar a otras personas; y (3) mejorar el programa y publicar esas mejoras para que toda la comunidad se beneficie. Estas libertades nacieron del proyecto GNU, impulsado por Richard Stallman, que junto con el núcleo Linux dio origen al sistema operativo GNU/Linux, usado hoy en servidores, teléfonos y supercomputadoras.\n\nEl software libre se relaciona con la cultura hacker en su sentido original: personas curiosas que exploran, comparten conocimiento y construyen herramientas con la filosofía del 'Hazlo tú mismx' (DIY). Conviene distinguir 'software libre' (que pone el acento en la libertad y la ética) de 'open source' o código abierto (que destaca las ventajas prácticas y de desarrollo); aunque suelen coincidir, su motivación es distinta.\n\nGracias al software libre existen herramientas ofimáticas gratuitas y de calidad: procesadores de texto, hojas de cálculo y programas de presentaciones (por ejemplo, la suite LibreOffice), que permiten estudiar y trabajar sin depender de licencias privativas de pago.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Cuáles son las cuatro libertades del software libre?", respuesta_guia: "Usar, estudiar/adaptar, distribuir copias y mejorar/publicar mejoras." },
          { pregunta: "¿Qué diferencia hay entre 'software libre' y 'open source'?", respuesta_guia: "El software libre enfatiza la libertad y la ética; el open source, las ventajas prácticas." },
        ], tiempo_estimado_minutos: 12 } },
    { titulo: "Software libre — Opción múltiple", descripcion: "Evalúa lo que aprendiste sobre las libertades del software libre y GNU/Linux.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "¿Cuántas libertades definen al software libre?", opciones: ["Dos", "Cuatro", "Seis", "Diez"], respuesta_correcta: 1, retroalimentacion: "Son cuatro libertades (0 a 3)." },
        { enunciado: "Para estudiar y adaptar un programa se necesita acceso a su…", opciones: ["código fuente", "factura", "número de serie", "contraseña de administrador"], respuesta_correcta: 0, retroalimentacion: "El acceso al código fuente hace posible estudiarlo y modificarlo." },
        { enunciado: "El sistema operativo libre formado por el proyecto GNU y el núcleo Linux se llama…", opciones: ["Windows", "GNU/Linux", "macOS", "Android privativo"], respuesta_correcta: 1, retroalimentacion: "GNU/Linux es el ejemplo emblemático de software libre." },
        { enunciado: "Una suite ofimática libre es…", opciones: ["LibreOffice", "una licencia privativa", "un antivirus de pago", "un navegador cerrado"], respuesta_correcta: 0, retroalimentacion: "LibreOffice incluye procesador de texto, hoja de cálculo y presentaciones." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: ¿por qué importa la libertad del software?", descripcion: "Argumenta el valor del software libre en tu vida y tu comunidad.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto donde reflexiones sobre el software libre y su importancia.", prompt: "¿Por qué crees que tener la libertad de usar, estudiar, compartir y mejorar un programa puede ser importante para los estudiantes y para tu comunidad? Da al menos un ejemplo concreto.", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Software libre — Verdadero o falso", descripcion: "Distingue afirmaciones sobre las libertades y la cultura del software libre.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El software libre permite estudiar y modificar el programa.", respuesta: true, retroalimentacion: "Correcto: es la libertad 1." },
        { enunciado: "'Software libre' significa siempre que es gratis y nada más.", respuesta: false, retroalimentacion: "Libre se refiere a libertad, no necesariamente a precio." },
        { enunciado: "GNU/Linux es un ejemplo de sistema operativo libre.", respuesta: true, retroalimentacion: "Correcto." },
        { enunciado: "La cultura hacker, en su sentido original, se basa en explorar y compartir conocimiento.", respuesta: true, retroalimentacion: "Correcto: la filosofía 'Hazlo tú mismx'." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: software libre", descripcion: "Aprende los términos clave del software libre y la ofimática.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Software libre", definicion: "Software que respeta las cuatro libertades: usar, estudiar, distribuir y mejorar.", ejemplo: "GNU/Linux, LibreOffice." },
        { termino: "Código fuente", definicion: "Instrucciones escritas por las personas programadoras que se necesitan para estudiar y modificar un programa.", ejemplo: "El texto del programa antes de convertirse en aplicación." },
        { termino: "GNU/Linux", definicion: "Sistema operativo libre formado por el proyecto GNU y el núcleo Linux.", ejemplo: "Distribuciones como Ubuntu o Debian." },
        { termino: "Open source", definicion: "Enfoque que destaca las ventajas prácticas del código abierto; suele coincidir con el software libre, pero con otra motivación.", ejemplo: "Proyectos colaborativos en línea." },
        { termino: "Suite ofimática", definicion: "Conjunto de programas de oficina: procesador de texto, hoja de cálculo y presentaciones.", ejemplo: "LibreOffice (Writer, Calc, Impress)." },
      ], actividad_final: "Busca una distribución de GNU/Linux y anota para qué se usa." } },
    { titulo: "Completa: las libertades del software", descripcion: "Completa el texto sobre el software libre.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El software libre se define por cuatro ___. Para estudiar y modificar un programa se necesita su código ___. El sistema operativo libre por excelencia es ___. Una suite ofimática libre es ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "libertades", pista: "Son cuatro." },
          { posicion: 1, respuesta_correcta: "fuente", pista: "Código ___." },
          { posicion: 2, respuesta_correcta: "GNU/Linux", alternativas_aceptadas: ["Linux", "GNU"], pista: "GNU + Linux." },
          { posicion: 3, respuesta_correcta: "LibreOffice", pista: "Writer, Calc, Impress." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Software libre", descripcion: "Valora tu comprensión del software libre y la ofimática.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Explico las cuatro libertades del software libre.", escala: escala4 },
        { descripcion: "Distingo software libre de open source y de software privativo.", escala: escala4 },
        { descripcion: "Uso herramientas ofimáticas libres (texto, hoja de cálculo, presentaciones).", escala: escala4 },
      ], reflexion_final_prompt: "¿Probarías una herramienta de software libre en lugar de una privativa? ¿Cuál y por qué?" } },
  ],

  // ════════════════ CD-I-P10 (numero 6) — IA responsable, copyleft, contaminación digital (Oficial 6) ════════════════
  "CD-I-P10": [
    { titulo: "Uso responsable de la IA y huella ambiental de lo digital", descripcion: "Lectura sobre el uso ético de la inteligencia artificial, el copyleft y la contaminación digital.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "Las tecnologías digitales sirven para fines personales, académicos y sociales, pero su uso exige responsabilidad y ética. La inteligencia artificial (IA) puede ayudarte a estudiar, redactar o crear, pero conviene usarla de forma crítica: verifica la información que produce (puede equivocarse o inventar datos), reconoce cuándo usaste IA en tus trabajos y respeta los derechos de autoría de las fuentes.\n\nPara compartir obras y programas existen los licenciamientos copyleft, que invierten la lógica del copyright tradicional: en lugar de 'todos los derechos reservados', permiten copiar, modificar y redistribuir una obra siempre que las versiones derivadas conserven las mismas libertades. Las licencias Creative Commons y la GPL son ejemplos de este enfoque que favorece el conocimiento abierto.\n\nFinalmente, lo digital no es inmaterial: cada búsqueda, video y dispositivo consume energía y recursos. La contaminación digital y tecnológica incluye el alto consumo eléctrico de los centros de datos, la huella de carbono de internet y la basura electrónica (e-waste) que generan los aparatos que desechamos. Usar la tecnología de forma sostenible —alargar la vida de los dispositivos, reciclar y consumir con conciencia— también es parte de la ciudadanía digital.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "Menciona dos prácticas para un uso responsable de la IA.", respuesta_guia: "Verificar la información, reconocer su uso y respetar la autoría." },
          { pregunta: "¿Qué es la contaminación digital?", respuesta_guia: "El consumo de energía, la huella de carbono y la basura electrónica que genera lo digital." },
        ], tiempo_estimado_minutos: 12 } },
    { titulo: "IA, copyleft y ambiente — Opción múltiple", descripcion: "Evalúa lo que aprendiste sobre uso ético de la IA, copyleft y contaminación digital.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Un uso responsable de la IA implica…", opciones: ["copiar todo sin revisar", "verificar la información y reconocer su uso", "ocultar siempre que la usaste", "creer todo lo que genera"], respuesta_correcta: 1, retroalimentacion: "La IA puede equivocarse; hay que verificar y dar crédito." },
        { enunciado: "El copyleft permite…", opciones: ["prohibir toda copia", "copiar y modificar si se conservan las libertades", "vender sin permiso ajeno", "eliminar la autoría"], respuesta_correcta: 1, retroalimentacion: "El copyleft mantiene las libertades en las obras derivadas." },
        { enunciado: "La basura electrónica también se conoce como…", opciones: ["e-waste", "spam", "malware", "cookies"], respuesta_correcta: 0, retroalimentacion: "E-waste son los aparatos electrónicos desechados." },
        { enunciado: "Una práctica sostenible con la tecnología es…", opciones: ["cambiar de celular cada mes", "alargar la vida de los dispositivos y reciclar", "dejar todo encendido", "tirar la electrónica a la basura común"], respuesta_correcta: 1, retroalimentacion: "Reduce la contaminación digital y tecnológica." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: tecnología, ética y planeta", descripcion: "Reflexiona sobre tu uso responsable de la IA y el cuidado del ambiente.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto sobre tu uso ético de la tecnología.", prompt: "¿Cómo puedes usar la inteligencia artificial de forma responsable en tus estudios y, al mismo tiempo, reducir tu huella digital y tecnológica? Propón al menos dos acciones concretas.", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "IA y ambiente — Verdadero o falso", descripcion: "Distingue afirmaciones sobre uso ético de la IA, copyleft y contaminación digital.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La inteligencia artificial nunca se equivoca, así que no hace falta verificar lo que dice.", respuesta: false, retroalimentacion: "La IA puede inventar o equivocarse; siempre verifica." },
        { enunciado: "El copyleft permite reutilizar una obra si las versiones derivadas mantienen las mismas libertades.", respuesta: true, retroalimentacion: "Correcto: es la lógica del copyleft." },
        { enunciado: "Lo digital no consume energía ni genera residuos.", respuesta: false, retroalimentacion: "Los centros de datos y dispositivos consumen energía y generan e-waste." },
        { enunciado: "Alargar la vida de los dispositivos reduce la contaminación tecnológica.", respuesta: true, retroalimentacion: "Correcto: menos basura electrónica." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: IA responsable, copyleft y ambiente", descripcion: "Aprende los términos clave de esta progresión.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Uso responsable de la IA", definicion: "Empleo crítico y ético de la inteligencia artificial: verificar, dar crédito y respetar la autoría.", ejemplo: "Revisar y citar cuando usas una IA para un trabajo." },
        { termino: "Copyleft", definicion: "Licenciamiento que permite copiar, modificar y redistribuir una obra conservando las mismas libertades.", ejemplo: "La GPL y varias licencias Creative Commons." },
        { termino: "Contaminación digital", definicion: "Impacto ambiental de lo digital: consumo eléctrico, huella de carbono y basura electrónica.", ejemplo: "El gasto energético de los centros de datos." },
        { termino: "Basura electrónica (e-waste)", definicion: "Aparatos electrónicos desechados que contaminan si no se reciclan.", ejemplo: "Celulares y baterías viejas." },
      ], actividad_final: "Anota tres aparatos electrónicos que podrías reparar, reutilizar o reciclar en lugar de tirar." } },
    { titulo: "Completa: ética digital y ambiente", descripcion: "Completa el texto sobre IA responsable, copyleft y contaminación digital.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Al usar la inteligencia artificial conviene ___ la información que produce y reconocer su uso. El ___ permite reutilizar obras conservando las mismas libertades. El impacto ambiental de lo digital se llama contaminación ___, e incluye la basura ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "verificar", alternativas_aceptadas: ["revisar"], pista: "Comprobar que es correcta." },
          { posicion: 1, respuesta_correcta: "copyleft", pista: "Lo contrario al copyright cerrado." },
          { posicion: 2, respuesta_correcta: "digital", pista: "Contaminación ___." },
          { posicion: 3, respuesta_correcta: "electrónica", alternativas_aceptadas: ["e-waste"], pista: "Aparatos desechados." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — IA responsable y ambiente", descripcion: "Valora tu uso ético de la tecnología y el cuidado del ambiente.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Uso la inteligencia artificial de forma crítica y responsable.", escala: escala4 },
        { descripcion: "Comprendo el copyleft y los licenciamientos abiertos.", escala: escala4 },
        { descripcion: "Reconozco la contaminación digital y actúo para reducirla.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué hábito tecnológico cambiarías para cuidar el ambiente?" } },
  ],

  // ════════════════ CD-I-P11 (numero 8) — Lenguaje algorítmico (Oficial 8) ════════════════
  "CD-I-P11": [
    { titulo: "Lenguaje algorítmico: datos, variables y operadores", descripcion: "Lectura sobre los elementos del lenguaje algorítmico y las estructuras de control.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "Para que una computadora resuelva un problema necesitamos expresarlo en un lenguaje algorítmico, un conjunto ordenado de elementos que describen la solución paso a paso. La materia prima son los datos (valores como un número o un texto) que, al organizarse y darles sentido, se convierten en información.\n\nLos datos se guardan en variables, espacios con un nombre cuyo contenido puede cambiar durante el proceso (por ejemplo, edad = 15), y en constantes, cuyo valor se mantiene fijo (por ejemplo, PI = 3.1416). Con ellos formamos expresiones, combinaciones de valores y operadores que producen un resultado. Existen tres tipos de operadores: los aritméticos (+, −, ×, ÷) para hacer cálculos; los relacionales (>, <, =, ≠) para comparar valores; y los lógicos (Y, O, NO) para combinar condiciones.\n\nLos algoritmos se construyen con tres estructuras de control: las secuenciales (instrucciones que se ejecutan una tras otra), las condicionales o selectivas (toman un camino según se cumpla o no una condición, como 'si… entonces…') y las repetitivas o cíclicas (repiten acciones mientras se cumpla una condición). Combinando datos, variables, operadores y estructuras se puede describir la solución de casi cualquier problema antes de programarlo.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué diferencia hay entre una variable y una constante?", respuesta_guia: "La variable puede cambiar su valor; la constante se mantiene fija." },
          { pregunta: "¿Cuáles son las tres estructuras de control?", respuesta_guia: "Secuenciales, condicionales/selectivas y repetitivas/cíclicas." },
        ], tiempo_estimado_minutos: 12 } },
    { titulo: "Lenguaje algorítmico — Opción múltiple", descripcion: "Evalúa lo que aprendiste sobre datos, variables, operadores y estructuras.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Un espacio con nombre cuyo valor puede cambiar es…", opciones: ["una constante", "una variable", "un operador", "un dato fijo"], respuesta_correcta: 1, retroalimentacion: "La variable puede cambiar su contenido." },
        { enunciado: "Los operadores +, −, × y ÷ son…", opciones: ["relacionales", "lógicos", "aritméticos", "condicionales"], respuesta_correcta: 2, retroalimentacion: "Sirven para hacer cálculos." },
        { enunciado: "La estructura 'si… entonces…' es de tipo…", opciones: ["secuencial", "condicional/selectiva", "repetitiva", "aritmética"], respuesta_correcta: 1, retroalimentacion: "Toma un camino según una condición." },
        { enunciado: "Los operadores Y, O y NO son…", opciones: ["aritméticos", "lógicos", "relacionales", "numéricos"], respuesta_correcta: 1, retroalimentacion: "Combinan condiciones (lógicos)." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: pensar como un algoritmo", descripcion: "Reflexiona sobre cómo el pensamiento algorítmico ayuda en la vida diaria.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto sobre el pensamiento algorítmico.", prompt: "Describe una tarea de tu vida diaria como un algoritmo (con sus pasos) e identifica dónde usarías una condición ('si… entonces…') o una repetición. ¿Cómo te ayuda pensar de forma ordenada y paso a paso?", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Lenguaje algorítmico — Verdadero o falso", descripcion: "Distingue afirmaciones sobre datos, variables, operadores y estructuras.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una constante mantiene su valor fijo durante todo el proceso.", respuesta: true, retroalimentacion: "Correcto: a diferencia de la variable." },
        { enunciado: "Los operadores relacionales (>, <, =) sirven para comparar valores.", respuesta: true, retroalimentacion: "Correcto." },
        { enunciado: "Una estructura repetitiva ejecuta una sola instrucción y termina.", respuesta: false, retroalimentacion: "La repetitiva repite acciones mientras se cumpla una condición." },
        { enunciado: "Los datos, al organizarse y darles sentido, se convierten en información.", respuesta: true, retroalimentacion: "Correcto: dato + contexto = información." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: lenguaje algorítmico", descripcion: "Aprende los términos clave del lenguaje algorítmico.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Dato", definicion: "Valor sin procesar, como un número o un texto.", ejemplo: "15, 'Ana', verdadero." },
        { termino: "Variable", definicion: "Espacio con nombre cuyo valor puede cambiar durante el proceso.", ejemplo: "edad = 15." },
        { termino: "Constante", definicion: "Valor con nombre que se mantiene fijo.", ejemplo: "PI = 3.1416." },
        { termino: "Operador", definicion: "Símbolo que opera sobre valores: aritmético, relacional o lógico.", ejemplo: "+, >, Y." },
        { termino: "Estructura de control", definicion: "Forma de organizar las instrucciones: secuencial, condicional o repetitiva.", ejemplo: "'si… entonces…' (condicional)." },
      ], actividad_final: "Clasifica estos operadores como aritmético, relacional o lógico: +, <, NO, ×, =." } },
    { titulo: "Completa: elementos del algoritmo", descripcion: "Completa el texto sobre el lenguaje algorítmico.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Los datos se guardan en ___, cuyo valor puede cambiar, y en constantes, que son fijas. Los operadores ___ (+, −, ×, ÷) hacen cálculos y los ___ (>, <, =) comparan. La estructura 'si… entonces…' es ___, y la que repite acciones es repetitiva.",
        huecos: [
          { posicion: 0, respuesta_correcta: "variables", pista: "Pueden cambiar de valor." },
          { posicion: 1, respuesta_correcta: "aritméticos", alternativas_aceptadas: ["aritmeticos"], pista: "Para calcular." },
          { posicion: 2, respuesta_correcta: "relacionales", pista: "Para comparar." },
          { posicion: 3, respuesta_correcta: "condicional", alternativas_aceptadas: ["selectiva"], pista: "Toma un camino según una condición." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Lenguaje algorítmico", descripcion: "Valora tu comprensión del lenguaje algorítmico.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo datos, variables y constantes.", escala: escala4 },
        { descripcion: "Identifico operadores aritméticos, relacionales y lógicos.", escala: escala4 },
        { descripcion: "Reconozco las estructuras secuenciales, condicionales y repetitivas.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué problema te gustaría resolver escribiendo un algoritmo?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
