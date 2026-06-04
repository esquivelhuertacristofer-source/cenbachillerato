/**
 * Refuerzo CD-II (Plantilla CEN): agrega A4-A7 a las 5 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * Keyed por CÓDIGO. Todas en estado='borrador'. Contenido fiel al programa oficial.
 * Uso: npx tsx scripts/seed-activities-cdii-refuerzo.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CD-II — A4-A7 para las 5 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "CD-II");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = refuerzos[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: r.titulo, descripcion: r.descripcion,
        tipo: r.tipo, progresion_id: p.id, xp: r.xp, contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ CD-II refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas.\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ CD-II-P01 — Herramientas digitales para acceder al conocimiento (trabajo colaborativo) ════════
  "CD-II-P01": [
    { titulo: "Trabajo colaborativo digital — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el trabajo colaborativo digital y sus herramientas libres.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El trabajo colaborativo digital permite que varias personas editen un mismo documento a la vez desde distintos lugares.", respuesta: true, retroalimentacion: "Correcto: la colaboración en tiempo real es una de sus grandes ventajas." },
        { enunciado: "Cryptpad y Riseup pad son ejemplos de herramientas de trabajo colaborativo de acceso libre.", respuesta: true, retroalimentacion: "Correcto: son alternativas libres y respetuosas de la privacidad." },
        { enunciado: "Las herramientas colaborativas solo sirven para una asignatura y no se pueden usar de forma transversal.", respuesta: false, retroalimentacion: "Al contrario: son útiles para proyectos que conectan varias asignaturas (transversalidad)." },
        { enunciado: "Colaborar digitalmente facilita acceder al conocimiento de las diferentes asignaturas con apoyo del equipo.", respuesta: true, retroalimentacion: "Correcto: compartir y construir juntos potencia el aprendizaje." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: colaboración digital y herramientas libres", descripcion: "Aprende los términos clave del trabajo colaborativo digital.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Trabajo colaborativo digital", definicion: "Forma de trabajar en equipo usando herramientas digitales para construir un producto común.", ejemplo: "Editar entre varios un mismo documento en línea." },
        { termino: "Cryptpad", definicion: "Herramienta colaborativa libre que permite escribir y compartir documentos cuidando la privacidad mediante cifrado.", ejemplo: "Tomar notas de equipo en un pad cifrado." },
        { termino: "Riseup pad", definicion: "Editor de texto colaborativo en línea, libre y sencillo, para escribir entre varias personas al mismo tiempo.", ejemplo: "Redactar en grupo el borrador de un trabajo." },
        { termino: "Transversalidad", definicion: "Conexión de un tema o proyecto con varias asignaturas a la vez.", ejemplo: "Un proyecto que une Historia, Biología y Cultura Digital." },
        { termino: "Edición en tiempo real", definicion: "Posibilidad de que varias personas modifiquen un documento simultáneamente y vean los cambios al instante.", ejemplo: "Ver cómo aparece lo que escribe tu compañera mientras tú también escribes." },
      ], actividad_final: "Prueba una herramienta colaborativa libre (Cryptpad o Riseup pad) y escribe en equipo un párrafo sobre un tema de otra asignatura." } },
    { titulo: "Completa: trabajo colaborativo digital", descripcion: "Completa el texto sobre las herramientas de colaboración digital libre.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El trabajo ___ digital permite que varias personas construyan un producto común usando herramientas en línea. Dos herramientas libres para ello son ___ y Riseup pad. Cuando un proyecto conecta varias asignaturas decimos que hay ___. Estas herramientas permiten la edición en tiempo ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "colaborativo", pista: "Trabajar en equipo." },
          { posicion: 1, respuesta_correcta: "Cryptpad", alternativas_aceptadas: ["cryptpad"], pista: "Pad cifrado de privacidad." },
          { posicion: 2, respuesta_correcta: "transversalidad", pista: "Conexión entre varias materias." },
          { posicion: 3, respuesta_correcta: "real", pista: "Tiempo ___." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Trabajo colaborativo digital", descripcion: "Valora tu uso de herramientas colaborativas para acceder al conocimiento.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Uso herramientas digitales para acceder al conocimiento de diferentes asignaturas.", escala: escala4 },
        { descripcion: "Trabajo colaborativamente con herramientas libres como Cryptpad o Riseup pad.", escala: escala4 },
        { descripcion: "Conecto los temas de un proyecto con otras asignaturas (transversalidad).", escala: escala4 },
      ], reflexion_final_prompt: "¿En qué proyecto de otra asignatura te ayudaría una herramienta colaborativa digital?" } },
  ],

  // ════════ CD-II-P02 — TICCAD para interactuar, comunicar y gestionar información ════════
  "CD-II-P02": [
    { titulo: "TICCAD y gestión de información — Verdadero o falso", descripcion: "Distingue afirmaciones sobre las TICCAD y el manejo de la información.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "TICCAD significa Tecnologías de Información, Comunicación, Conocimiento y Aprendizajes Digitales.", respuesta: true, retroalimentacion: "Correcto: ese es el significado de la sigla." },
        { enunciado: "Discriminar información significa distinguir las fuentes confiables de las que no lo son.", respuesta: true, retroalimentacion: "Correcto: evaluar la calidad y veracidad de lo que encuentras." },
        { enunciado: "Toda la información que aparece en internet es verdadera y confiable.", respuesta: false, retroalimentacion: "No: hay que verificar autoría, fecha y fuente antes de confiar." },
        { enunciado: "Las TICCAD de libre acceso ayudan a comunicarte con tu equipo y a gestionar información de una problemática social o ambiental.", respuesta: true, retroalimentacion: "Correcto: facilitan investigar y organizar el conocimiento de forma colaborativa." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: TICCAD y gestión de la información", descripcion: "Aprende los términos clave sobre las TICCAD y el manejo de información.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "TICCAD", definicion: "Tecnologías de Información, Comunicación, Conocimiento y Aprendizajes Digitales.", ejemplo: "Plataformas y apps que usas para aprender e investigar." },
        { termino: "Buscar información", definicion: "Localizar datos sobre un tema usando buscadores y fuentes digitales.", ejemplo: "Consultar varias fuentes sobre la contaminación del agua." },
        { termino: "Discriminar información", definicion: "Distinguir las fuentes confiables y pertinentes de las que no lo son.", ejemplo: "Preferir un sitio oficial a una cadena de mensajes." },
        { termino: "Gestionar información", definicion: "Organizar, guardar y dar sentido a la información para usarla en un propósito.", ejemplo: "Clasificar tus fuentes en carpetas y citarlas." },
        { termino: "Acceso libre", definicion: "Característica de un recurso o herramienta que puede usarse sin costo ni restricciones de licencia.", ejemplo: "Una enciclopedia o herramienta de uso gratuito y abierto." },
      ], actividad_final: "Elige una problemática personal, social o ambiental y reúne tres fuentes confiables sobre ella, anotando por qué las consideras válidas." } },
    { titulo: "Completa: TICCAD y manejo de información", descripcion: "Completa el texto sobre el uso de las TICCAD para gestionar información.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las ___ son las Tecnologías de Información, Comunicación, Conocimiento y Aprendizajes Digitales. Para investigar un fenómeno primero hay que ___ información, luego ___ las fuentes confiables y por último ___ la información de forma ordenada.",
        huecos: [
          { posicion: 0, respuesta_correcta: "TICCAD", alternativas_aceptadas: ["ticcad"], pista: "La sigla del tema." },
          { posicion: 1, respuesta_correcta: "buscar", pista: "Localizar datos." },
          { posicion: 2, respuesta_correcta: "discriminar", alternativas_aceptadas: ["evaluar", "seleccionar"], pista: "Distinguir lo confiable." },
          { posicion: 3, respuesta_correcta: "gestionar", alternativas_aceptadas: ["organizar"], pista: "Organizar y dar sentido." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — TICCAD y gestión de información", descripcion: "Valora tu manejo de las TICCAD para comunicar y gestionar información.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Uso TICCAD de libre acceso para interactuar y comunicarme con mi equipo.", escala: escala4 },
        { descripcion: "Busco y discrimino información distinguiendo las fuentes confiables.", escala: escala4 },
        { descripcion: "Gestiono y organizo información de una problemática personal, social o ambiental.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo decides si una fuente de internet es confiable o no?" } },
  ],

  // ════════ CD-II-P03 — Técnicas y métodos de investigación digital ════════
  "CD-II-P03": [
    { titulo: "Investigación digital — Verdadero o falso", descripcion: "Distingue afirmaciones sobre las técnicas de investigación digital y las licencias permisivas.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La ciberetnografía estudia las prácticas y culturas de las personas en entornos digitales.", respuesta: true, retroalimentacion: "Correcto: observa comunidades y comportamientos en línea." },
        { enunciado: "La entrevista y el grupo focal son técnicas para recopilar información directamente de las personas.", respuesta: true, retroalimentacion: "Correcto: permiten conocer opiniones y experiencias." },
        { enunciado: "Las licencias permisivas, como las de LibreOffice, impiden compartir o reutilizar el material.", respuesta: false, retroalimentacion: "Al contrario: permiten usar, compartir y, según el caso, modificar el material." },
        { enunciado: "Investigar incluye buscar, recopilar, extraer, organizar y difundir la información encontrada.", respuesta: true, retroalimentacion: "Correcto: son las etapas del proceso de investigación digital." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: métodos de investigación digital", descripcion: "Aprende los términos clave de las técnicas de investigación en línea.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Ciberetnografía", definicion: "Método que estudia culturas, prácticas y comunidades de las personas en entornos digitales.", ejemplo: "Observar cómo interactúa un grupo en un foro en línea." },
        { termino: "Análisis de contenido en línea", definicion: "Técnica para examinar de forma sistemática textos, imágenes o videos digitales.", ejemplo: "Analizar publicaciones sobre un tema en redes." },
        { termino: "Grupo focal", definicion: "Reunión de un grupo pequeño para conversar y recoger opiniones sobre un tema.", ejemplo: "Pedir a varios compañeros que opinen sobre una app educativa." },
        { termino: "Entrevista", definicion: "Conversación dirigida con preguntas para obtener información de una persona.", ejemplo: "Entrevistar a un docente sobre el uso de tecnología." },
        { termino: "Licencia permisiva", definicion: "Licencia que autoriza usar, compartir y a veces modificar una obra o programa.", ejemplo: "LibreOffice y otras herramientas de software libre." },
      ], actividad_final: "Elige una técnica (entrevista, observación o grupo focal) y diseña tres preguntas para investigar un tema digital." } },
    { titulo: "Completa: investigación digital", descripcion: "Completa el texto sobre los métodos de investigación digital.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ estudia las prácticas de las personas en entornos digitales. Para recoger opiniones de un grupo pequeño se usa el grupo ___. El proceso de investigación implica buscar, recopilar, extraer, organizar y ___ la información. Las licencias ___ permiten usar y compartir el material, como en LibreOffice.",
        huecos: [
          { posicion: 0, respuesta_correcta: "ciberetnografía", alternativas_aceptadas: ["ciberetnografia"], pista: "Etnografía en lo digital." },
          { posicion: 1, respuesta_correcta: "focal", pista: "Grupo ___." },
          { posicion: 2, respuesta_correcta: "difundir", alternativas_aceptadas: ["compartir"], pista: "Dar a conocer." },
          { posicion: 3, respuesta_correcta: "permisivas", alternativas_aceptadas: ["libres"], pista: "Permiten usar y compartir." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Investigación digital", descripcion: "Valora tu manejo de las técnicas y métodos de investigación digital.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico técnicas de investigación digital (ciberetnografía, entrevista, observación, grupo focal).", escala: escala4 },
        { descripcion: "Busco, recopilo, extraigo, organizo y difundo información.", escala: escala4 },
        { descripcion: "Uso herramientas con licencias permisivas como LibreOffice.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué técnica de investigación digital te parece más útil para un proyecto escolar y por qué?" } },
  ],

  // ════════ CD-II-P04 — Procesa datos con software estadístico libre ════════
  "CD-II-P04": [
    { titulo: "Estadística con software libre — Verdadero o falso", descripcion: "Distingue afirmaciones sobre medidas estadísticas y software libre.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La media, la mediana y la moda son medidas de tendencia central.", respuesta: true, retroalimentacion: "Correcto: resumen un conjunto de datos en un valor representativo." },
        { enunciado: "La desviación estándar y el rango son medidas de dispersión.", respuesta: true, retroalimentacion: "Correcto: indican qué tan dispersos están los datos." },
        { enunciado: "Jamovi y JASP son ejemplos de software estadístico libre.", respuesta: true, retroalimentacion: "Correcto: permiten procesar datos sin pagar licencia." },
        { enunciado: "Las gráficas no sirven para representar ni comunicar datos.", respuesta: false, retroalimentacion: "Al contrario: las representaciones gráficas ayudan a visualizar y comunicar la información." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: estadística y software libre", descripcion: "Aprende los términos clave del procesamiento de datos.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Medida de tendencia central", definicion: "Valor que resume un conjunto de datos: media, mediana o moda.", ejemplo: "La media de las calificaciones de un grupo." },
        { termino: "Media (promedio)", definicion: "Suma de todos los valores dividida entre la cantidad de datos.", ejemplo: "Promedio de las edades de tus compañeros." },
        { termino: "Medida de dispersión", definicion: "Valor que indica qué tan separados están los datos entre sí.", ejemplo: "El rango o la desviación estándar." },
        { termino: "Representación gráfica", definicion: "Forma visual de mostrar datos para entenderlos y comunicarlos.", ejemplo: "Un gráfico de barras o un histograma." },
        { termino: "Software estadístico libre", definicion: "Programas gratuitos y abiertos para analizar datos.", ejemplo: "Jamovi, JASP o XLSTAT Free." },
      ], actividad_final: "Reúne 10 datos (por ejemplo, las edades de tu equipo) y calcula su media, su mediana y su moda." } },
    { titulo: "Completa: estadística con software libre", descripcion: "Completa el texto sobre las medidas estadísticas y el software libre.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La media, la mediana y la moda son medidas de tendencia ___. La desviación estándar y el rango son medidas de ___. Para visualizar los datos usamos representaciones ___. Un software estadístico libre muy usado es ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "central", pista: "Tendencia ___." },
          { posicion: 1, respuesta_correcta: "dispersión", alternativas_aceptadas: ["dispersion"], pista: "Qué tan separados están los datos." },
          { posicion: 2, respuesta_correcta: "gráficas", alternativas_aceptadas: ["graficas"], pista: "Visuales." },
          { posicion: 3, respuesta_correcta: "Jamovi", alternativas_aceptadas: ["jamovi", "JASP", "jasp", "XLSTAT"], pista: "Jamovi, JASP..." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Procesamiento de datos", descripcion: "Valora tu manejo de la estadística básica con software libre.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Calculo medidas de tendencia central (media, mediana, moda).", escala: escala4 },
        { descripcion: "Interpreto medidas de dispersión (rango, desviación estándar).", escala: escala4 },
        { descripcion: "Proceso datos y creo gráficas con software estadístico libre (Jamovi, JASP).", escala: escala4 },
      ], reflexion_final_prompt: "¿Para qué problema de tu comunidad te gustaría recolectar y analizar datos?" } },
  ],

  // ════════ CD-II-P05 — Usa páginas web para difundir información ════════
  "CD-II-P05": [
    { titulo: "Páginas web para difundir — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la creación de páginas web y la difusión ética.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "WordPress y Blogspot permiten crear páginas web de diseño simple sin saber programar.", respuesta: true, retroalimentacion: "Correcto: ofrecen plantillas para publicar fácilmente." },
        { enunciado: "Difundir información en una página web puede conectar con problemáticas de otras asignaturas.", respuesta: true, retroalimentacion: "Correcto: la web sirve para divulgar proyectos transversales." },
        { enunciado: "Al publicar en internet no importa citar las fuentes ni respetar los derechos de autor.", respuesta: false, retroalimentacion: "Sí importa: hay que difundir con perspectiva ética y crítica, citando y respetando autorías." },
        { enunciado: "Una perspectiva ética y crítica implica verificar la información antes de difundirla.", respuesta: true, retroalimentacion: "Correcto: difundir con responsabilidad evita la desinformación." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: páginas web y difusión", descripcion: "Aprende los términos clave para crear y difundir en la web.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Página web", definicion: "Documento en internet que combina texto, imágenes y enlaces para compartir información.", ejemplo: "El blog donde publicas tu proyecto." },
        { termino: "WordPress", definicion: "Plataforma para crear sitios web y blogs con plantillas, sin necesidad de programar.", ejemplo: "Publicar un sitio sobre cuidado del agua." },
        { termino: "Blogspot (Blogger)", definicion: "Servicio gratuito de Google para crear y publicar blogs de forma sencilla.", ejemplo: "Un blog de tu equipo sobre un tema social." },
        { termino: "Difusión", definicion: "Acción de dar a conocer información a un público amplio.", ejemplo: "Compartir tu investigación en una página web." },
        { termino: "Perspectiva ética y crítica", definicion: "Forma de publicar que verifica la información, cita fuentes y respeta a las personas.", ejemplo: "Comprobar los datos y dar crédito a los autores antes de difundir." },
      ], actividad_final: "Diseña en papel la estructura (secciones y contenidos) de una página web para difundir un tema de otra asignatura." } },
    { titulo: "Completa: difusión en páginas web", descripcion: "Completa el texto sobre la creación de páginas web para difundir información.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Para crear una página web de diseño simple sin programar puedes usar ___ o Blogspot. La web sirve para ___ información sobre una problemática relacionada con otras asignaturas. Al publicar hay que hacerlo con perspectiva ética y ___, verificando los datos y citando las ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "WordPress", alternativas_aceptadas: ["wordpress"], pista: "Plataforma de blogs con plantillas." },
          { posicion: 1, respuesta_correcta: "difundir", alternativas_aceptadas: ["divulgar", "compartir"], pista: "Dar a conocer." },
          { posicion: 2, respuesta_correcta: "crítica", alternativas_aceptadas: ["critica"], pista: "Ética y ___." },
          { posicion: 3, respuesta_correcta: "fuentes", pista: "De dónde sacaste la información." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Difusión en páginas web", descripcion: "Valora tu capacidad de crear páginas web y difundir con ética.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Creo páginas web de diseño simple con WordPress o Blogspot.", escala: escala4 },
        { descripcion: "Difundo información sobre una problemática relacionada con otras asignaturas.", escala: escala4 },
        { descripcion: "Publico con perspectiva ética y crítica (verifico, cito fuentes y respeto a las personas).", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué problemática de tu comunidad te gustaría difundir en una página web y por qué?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
