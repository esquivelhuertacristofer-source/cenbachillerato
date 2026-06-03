/**
 * Refuerzo CD-I (Plantilla CEN): agrega A4-A7 a las 8 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * Keyed por CÓDIGO (no por numero) por la renumeración oficial. Todas en estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-cdi-refuerzo.ts
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
  log("\n🌱 Refuerzo CD-I — A4-A7 para las 8 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "CD-I");
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
  log(`\n✅ CD-I refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas).\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ CD-I-P01 — Hardware, software e historia de la tecnología (Oficial 1) ════════
  "CD-I-P01": [
    { titulo: "Hardware, software e historia — Verdadero o falso", descripcion: "Distingue afirmaciones sobre los componentes y la evolución de la tecnología digital.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El hardware son las partes físicas de un dispositivo (pantalla, procesador, memoria).", respuesta: true, retroalimentacion: "Correcto: el hardware es todo lo físico." },
        { enunciado: "El software son los programas, instrucciones y reglas que hacen funcionar el dispositivo.", respuesta: true, retroalimentacion: "Correcto: el software es la parte lógica." },
        { enunciado: "La tecnología digital siempre ha sido igual; no ha evolucionado con el tiempo.", respuesta: false, retroalimentacion: "Ha cambiado muchísimo: de grandes computadoras a teléfonos en el bolsillo." },
        { enunciado: "El software libre nació como una alternativa que permite usar, estudiar y compartir los programas.", respuesta: true, retroalimentacion: "Correcto: es parte de la historia crítica del desarrollo tecnológico." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: hardware, software y licencias", descripcion: "Aprende los términos clave sobre componentes e historia de la tecnología.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Hardware", definicion: "Conjunto de elementos físicos que componen un dispositivo electrónico.", ejemplo: "Procesador, memoria RAM, pantalla, teclado." },
        { termino: "Software", definicion: "Conjunto de programas, instrucciones y reglas que permiten que el dispositivo funcione.", ejemplo: "El sistema operativo y las aplicaciones." },
        { termino: "Software libre", definicion: "Software que se puede usar, estudiar, modificar y compartir libremente.", ejemplo: "El proyecto GNU/Linux." },
        { termino: "Licencia GPL", definicion: "Licencia (General Public License) que garantiza las libertades del software libre y que las versiones derivadas las conserven.", ejemplo: "Muchos programas de GNU usan la GPL." },
        { termino: "Creative Commons", definicion: "Conjunto de licencias libres para compartir obras (textos, imágenes, música) indicando qué usos se permiten.", ejemplo: "Una foto CC-BY se puede reutilizar dando crédito al autor." },
      ], actividad_final: "Clasifica cinco objetos o programas que uses como 'hardware' o 'software'." } },
    { titulo: "Completa: componentes e historia", descripcion: "Completa el texto sobre hardware, software y su evolución.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las partes físicas de un dispositivo se llaman ___; los programas e instrucciones son el ___. El ___ libre permite usar, estudiar y compartir los programas. La licencia que protege esas libertades se conoce como ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "hardware", pista: "Lo físico." },
          { posicion: 1, respuesta_correcta: "software", pista: "Lo lógico, los programas." },
          { posicion: 2, respuesta_correcta: "software", pista: "Repite el término de la parte lógica." },
          { posicion: 3, respuesta_correcta: "GPL", alternativas_aceptadas: ["General Public License"], pista: "General Public License." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Hardware, software e historia", descripcion: "Valora tu comprensión de los componentes y la evolución de la tecnología.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo el hardware del software de un dispositivo.", escala: escala4 },
        { descripcion: "Explico cómo ha evolucionado la tecnología digital.", escala: escala4 },
        { descripcion: "Reconozco el software libre y licencias como GPL y Creative Commons.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo crees que serán los dispositivos digitales dentro de 20 años?" } },
  ],

  // ════════ CD-I-P02 — Licenciamiento y acceso a servicios digitales (Oficial 2) ════════
  "CD-I-P02": [
    { titulo: "Licenciamiento y acceso — Verdadero o falso", descripcion: "Distingue afirmaciones sobre licencias, navegadores, sistemas operativos y unidades de medida.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una licencia de software privativo limita la copia, modificación y distribución del programa.", respuesta: true, retroalimentacion: "Correcto: el software privativo restringe esas libertades." },
        { enunciado: "Un navegador es un programa para acceder a páginas y servicios de internet.", respuesta: true, retroalimentacion: "Correcto: Firefox, Chrome o Edge son navegadores." },
        { enunciado: "El sistema operativo es la parte física del dispositivo.", respuesta: false, retroalimentacion: "El sistema operativo es software (Windows, Android, GNU/Linux)." },
        { enunciado: "La velocidad, el procesamiento y el almacenamiento se expresan con unidades de medida (como GB o Mbps).", respuesta: true, retroalimentacion: "Correcto: gigabytes, megabits por segundo, etc." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: licencias y acceso digital", descripcion: "Aprende los términos clave sobre licenciamiento y acceso a servicios digitales.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Licencia privativa", definicion: "Permiso de uso de software que restringe copiarlo, modificarlo o compartirlo.", ejemplo: "Muchos programas comerciales de pago." },
        { termino: "Licencia libre", definicion: "Permiso que autoriza usar, estudiar, modificar y compartir el software.", ejemplo: "GNU/Linux, LibreOffice." },
        { termino: "Navegador", definicion: "Programa que permite acceder y visualizar páginas y servicios de internet.", ejemplo: "Firefox, Chrome, Edge." },
        { termino: "Sistema operativo", definicion: "Software base que administra el hardware y permite ejecutar otros programas.", ejemplo: "Windows, Android, GNU/Linux." },
        { termino: "Unidad de medida digital", definicion: "Cantidad para expresar almacenamiento, velocidad o procesamiento.", ejemplo: "Gigabyte (GB) de almacenamiento; megabits por segundo (Mbps) de velocidad." },
      ], actividad_final: "Averigua qué sistema operativo, navegador y capacidad de almacenamiento tiene el dispositivo que más usas." } },
    { titulo: "Completa: licencias y acceso", descripcion: "Completa el texto sobre licenciamiento y acceso a servicios digitales.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Una licencia ___ restringe copiar y modificar el programa, mientras que una licencia libre lo permite. Para acceder a internet usamos un ___. El software base que administra el dispositivo es el ___. El almacenamiento se mide en unidades como el ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "privativa", alternativas_aceptadas: ["propietaria"], pista: "De pago, restringe libertades." },
          { posicion: 1, respuesta_correcta: "navegador", pista: "Firefox, Chrome..." },
          { posicion: 2, respuesta_correcta: "sistema operativo", pista: "Windows, Android, Linux." },
          { posicion: 3, respuesta_correcta: "gigabyte", alternativas_aceptadas: ["GB", "byte", "megabyte"], pista: "GB." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Licenciamiento y acceso", descripcion: "Valora tu comprensión de licencias, navegadores, SO y unidades.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo licencias privativas de licencias libres.", escala: escala4 },
        { descripcion: "Identifico navegadores y sistemas operativos.", escala: escala4 },
        { descripcion: "Interpreto unidades de medida de velocidad, procesamiento y almacenamiento.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué tomarías en cuenta al elegir un dispositivo: almacenamiento, velocidad o tipo de licencias?" } },
  ],

  // ════════ CD-I-P03 — Impacto social de las tecnologías digitales (Oficial 3) ════════
  "CD-I-P03": [
    { titulo: "Impacto de las tecnologías — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el impacto social de las tecnologías digitales.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El 'colonialismo de datos' describe cómo grandes corporaciones extraen y controlan los datos de millones de personas.", respuesta: true, retroalimentacion: "Correcto: concentra poder e información en pocas empresas." },
        { enunciado: "La 'mercantilización de la atención' significa que tu tiempo y atención se convierten en un producto que se vende.", respuesta: true, retroalimentacion: "Correcto: muchas plataformas viven de retener tu atención." },
        { enunciado: "Todas las personas del mundo tienen el mismo acceso a las tecnologías digitales.", respuesta: false, retroalimentacion: "Existe desigualdad de acceso (socioeconómica, regional y de género)." },
        { enunciado: "La dependencia tecnológica puede afectar la autonomía de personas y comunidades.", respuesta: true, retroalimentacion: "Correcto: depender de pocas empresas o servicios tiene riesgos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: impacto social de lo digital", descripcion: "Aprende los conceptos críticos sobre el impacto de las tecnologías.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Colonialismo de datos", definicion: "Apropiación y control de los datos de las personas por grandes corporaciones, generando relaciones de poder desiguales.", ejemplo: "Empresas que reúnen datos de usuarios de todo el mundo." },
        { termino: "Mercantilización de la atención", definicion: "Convertir la atención y el tiempo de las personas usuarias en un producto que se vende a anunciantes.", ejemplo: "Apps diseñadas para que pases más tiempo en ellas." },
        { termino: "Dependencia tecnológica", definicion: "Situación en que personas o países dependen de tecnologías o empresas que no controlan.", ejemplo: "Depender de un solo proveedor de servicios en la nube." },
        { termino: "Brecha digital", definicion: "Desigualdad en el acceso y uso de las tecnologías digitales por motivos socioeconómicos, regionales o de género.", ejemplo: "Comunidades sin internet de calidad." },
      ], actividad_final: "Identifica un ejemplo de brecha digital en tu comunidad o escuela." } },
    { titulo: "Completa: impacto de las tecnologías", descripcion: "Completa el texto sobre el impacto social de lo digital.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ de datos describe cómo pocas corporaciones controlan la información de millones de personas. Cuando tu atención se vuelve un producto, hablamos de ___ de la atención. La desigualdad en el acceso a la tecnología se llama brecha ___, y puede ser socioeconómica, regional o de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "colonialismo", pista: "Control de los datos por pocas empresas." },
          { posicion: 1, respuesta_correcta: "mercantilización", alternativas_aceptadas: ["mercantilizacion"], pista: "Convertir en mercancía." },
          { posicion: 2, respuesta_correcta: "digital", pista: "Brecha ___." },
          { posicion: 3, respuesta_correcta: "género", alternativas_aceptadas: ["genero"], pista: "Diferencia entre hombres y mujeres." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Impacto social de lo digital", descripcion: "Valora tu análisis crítico del impacto de las tecnologías.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Explico el colonialismo de datos y la mercantilización de la atención.", escala: escala4 },
        { descripcion: "Reconozco la dependencia tecnológica y sus riesgos.", escala: escala4 },
        { descripcion: "Identifico la brecha digital y sus formas (socioeconómica, regional, de género).", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué podrías hacer para reducir el impacto de la mercantilización de tu atención?" } },
  ],

  // ════════ CD-I-P04 (numero 7) — Resolución de problemas algorítmicos (Oficial 7) ════════
  "CD-I-P04": [
    { titulo: "Resolución de problemas — Verdadero o falso", descripcion: "Distingue afirmaciones sobre los pasos para resolver problemas y la identidad digital.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El primer paso para resolver un problema es identificarlo y comprenderlo bien.", respuesta: true, retroalimentacion: "Correcto: sin entender el problema no se puede resolver." },
        { enunciado: "Un diagrama de flujo sirve para representar paso a paso la solución de un problema.", respuesta: true, retroalimentacion: "Correcto: muestra el orden de las acciones." },
        { enunciado: "Conviene quedarse con la primera idea sin analizar otras alternativas de solución.", respuesta: false, retroalimentacion: "Hay que analizar alternativas y elegir la mejor." },
        { enunciado: "Tu identidad digital es la imagen y los datos que te representan en internet.", respuesta: true, retroalimentacion: "Correcto: incluye tus perfiles, publicaciones y credenciales." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: pensamiento algorítmico e identidad digital", descripcion: "Aprende los términos clave de resolución de problemas e identidad digital.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Algoritmo", definicion: "Secuencia ordenada y finita de pasos para resolver un problema o realizar una tarea.", ejemplo: "Una receta de cocina o los pasos para sacar dinero de un cajero." },
        { termino: "Diagrama de flujo", definicion: "Representación gráfica de los pasos de un algoritmo usando símbolos conectados.", ejemplo: "Un rombo para una decisión, un rectángulo para una acción." },
        { termino: "Identidad digital", definicion: "Conjunto de datos, perfiles y acciones que te representan en el ciberespacio.", ejemplo: "Tus cuentas, fotos y publicaciones." },
        { termino: "Credenciales de acceso", definicion: "Datos que usas para entrar a un servicio digital, como usuario y contraseña.", ejemplo: "Tu correo y contraseña para iniciar sesión." },
      ], actividad_final: "Escribe, en cuatro pasos, el algoritmo para iniciar sesión de forma segura en una plataforma." } },
    { titulo: "Completa: pasos para resolver un problema", descripcion: "Completa el texto sobre la resolución de problemas algorítmicos.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Un ___ es una secuencia ordenada de pasos para resolver un problema. Primero hay que ___ el problema; luego analizar ___ de solución y elegir la mejor. Para representar la solución de forma visual se usa un diagrama de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "algoritmo", pista: "Pasos ordenados." },
          { posicion: 1, respuesta_correcta: "comprender", alternativas_aceptadas: ["entender", "identificar"], pista: "Entenderlo bien." },
          { posicion: 2, respuesta_correcta: "alternativas", pista: "Varias opciones." },
          { posicion: 3, respuesta_correcta: "flujo", pista: "Diagrama de ___." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Resolución de problemas", descripcion: "Valora tu manejo de los pasos para resolver problemas y la identidad digital.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Aplico los pasos para resolver un problema (identificar, comprender, analizar, seleccionar).", escala: escala4 },
        { descripcion: "Represento soluciones con diagramas de flujo.", escala: escala4 },
        { descripcion: "Cuido mi identidad digital y mis credenciales de acceso.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué problema cotidiano podrías resolver mejor escribiendo primero sus pasos?" } },
  ],

  // ════════ CD-I-P05 (numero 9) — Derechos digitales (Complemento) ════════
  "CD-I-P05": [
    { titulo: "Derechos digitales — Verdadero o falso", descripcion: "Distingue afirmaciones sobre los derechos digitales y cómo ejercerlos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Las personas tienen derecho a la privacidad y a la protección de sus datos personales.", respuesta: true, retroalimentacion: "Correcto: es un derecho digital fundamental." },
        { enunciado: "El acceso a internet se reconoce cada vez más como un derecho que reduce desigualdades.", respuesta: true, retroalimentacion: "Correcto: facilita educación, información y participación." },
        { enunciado: "Una vez que algo se publica en internet, no existe ningún mecanismo para reclamar o eliminarlo.", respuesta: false, retroalimentacion: "Existen mecanismos como el derecho al olvido y las solicitudes de protección de datos." },
        { enunciado: "Conocer tus derechos digitales te ayuda a defenderte de abusos en línea.", respuesta: true, retroalimentacion: "Correcto: el primer paso para ejercerlos es conocerlos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: derechos digitales", descripcion: "Aprende los términos clave sobre derechos digitales.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Derecho a la privacidad", definicion: "Derecho a controlar quién accede a tu información personal.", ejemplo: "Decidir qué datos compartes en una app." },
        { termino: "Protección de datos personales", definicion: "Normas que regulan cómo se recogen, usan y guardan tus datos.", ejemplo: "Una empresa debe decirte para qué usará tu correo." },
        { termino: "Derecho al olvido", definicion: "Posibilidad de solicitar que se elimine información personal que ya no es pertinente.", ejemplo: "Pedir que se borre un dato antiguo de un buscador." },
        { termino: "Libertad de expresión digital", definicion: "Derecho a expresarse en línea con responsabilidad y respeto a los demás.", ejemplo: "Opinar en redes sin difamar ni acosar." },
      ], actividad_final: "Investiga qué institución en México protege tus datos personales." } },
    { titulo: "Completa: derechos digitales", descripcion: "Completa el texto sobre los derechos digitales.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Tienes derecho a la ___ de tu información y a la protección de tus ___ personales. El derecho al ___ permite pedir que se elimine información que ya no es pertinente. Conocer tus derechos es el primer paso para ___ los.",
        huecos: [
          { posicion: 0, respuesta_correcta: "privacidad", pista: "Controlar quién ve tu información." },
          { posicion: 1, respuesta_correcta: "datos", pista: "Información personal." },
          { posicion: 2, respuesta_correcta: "olvido", pista: "Derecho al ___." },
          { posicion: 3, respuesta_correcta: "ejercer", alternativas_aceptadas: ["defender"], pista: "Hacerlos valer." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Derechos digitales", descripcion: "Valora tu conocimiento de los derechos digitales.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco mis derechos digitales (privacidad, protección de datos, olvido).", escala: escala4 },
        { descripcion: "Conozco mecanismos e instituciones para ejercerlos.", escala: escala4 },
        { descripcion: "Ejerzo la libertad de expresión digital con responsabilidad.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué harías si descubrieras que una app usa tus datos sin permiso?" } },
  ],

  // ════════ CD-I-P06 (numero 5) — Normatividad, privacidad y seguridad digital (Oficial 5) ════════
  "CD-I-P06": [
    { titulo: "Seguridad digital — Verdadero o falso", descripcion: "Distingue afirmaciones sobre normatividad, privacidad y seguridad en el ciberespacio.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El phishing es un engaño para robar tus datos haciéndose pasar por una empresa o persona de confianza.", respuesta: true, retroalimentacion: "Correcto: por eso hay que desconfiar de enlaces y mensajes sospechosos." },
        { enunciado: "Usar la misma contraseña sencilla en todas tus cuentas es una práctica segura.", respuesta: false, retroalimentacion: "Es inseguro: conviene contraseñas distintas y robustas." },
        { enunciado: "La normatividad del ciberespacio establece reglas para usar los servicios digitales de forma responsable.", respuesta: true, retroalimentacion: "Correcto: protege a las personas usuarias." },
        { enunciado: "Proteger tus datos personales es parte de tu seguridad digital.", respuesta: true, retroalimentacion: "Correcto: cuidar tu información reduce riesgos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: normatividad y seguridad digital", descripcion: "Aprende los términos clave de seguridad y normatividad digital.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Phishing", definicion: "Engaño que suplanta a una entidad de confianza para robar datos o contraseñas.", ejemplo: "Un correo falso del 'banco' que pide tu contraseña." },
        { termino: "Desinformación", definicion: "Información falsa o engañosa que se difunde, a veces de forma intencional.", ejemplo: "Una noticia falsa que se vuelve viral." },
        { termino: "Vigilancia digital", definicion: "Seguimiento de la actividad en línea de las personas, a veces sin su consentimiento.", ejemplo: "Rastreo de tu navegación para crear tu perfil." },
        { termino: "Seguridad digital", definicion: "Conjunto de prácticas para proteger tu información, dispositivos y cuentas.", ejemplo: "Contraseñas robustas y verificación en dos pasos." },
        { termino: "Protección de datos", definicion: "Resguardo de la información personal frente a usos indebidos.", ejemplo: "No compartir tu CURP o domicilio sin necesidad." },
      ], actividad_final: "Revisa una de tus cuentas y activa, si puedes, la verificación en dos pasos." } },
    { titulo: "Completa: seguridad y normatividad", descripcion: "Completa el texto sobre normatividad, privacidad y seguridad digital.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ es un engaño que suplanta a una entidad de confianza para robar tus datos. La información falsa que se difunde es ___. Para protegerte conviene usar contraseñas ___ y cuidar la ___ de tus datos personales.",
        huecos: [
          { posicion: 0, respuesta_correcta: "phishing", pista: "Suplantación para robar datos." },
          { posicion: 1, respuesta_correcta: "desinformación", alternativas_aceptadas: ["desinformacion"], pista: "Noticias falsas." },
          { posicion: 2, respuesta_correcta: "robustas", alternativas_aceptadas: ["seguras", "fuertes"], pista: "Difíciles de adivinar." },
          { posicion: 3, respuesta_correcta: "protección", alternativas_aceptadas: ["proteccion", "privacidad"], pista: "Resguardo de la información." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Normatividad y seguridad digital", descripcion: "Valora tu seguridad y conocimiento de la normatividad digital.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico riesgos como phishing, desinformación y vigilancia.", escala: escala4 },
        { descripcion: "Aplico prácticas de seguridad digital (contraseñas, verificación en dos pasos).", escala: escala4 },
        { descripcion: "Conozco la normatividad y cuido la privacidad y protección de datos.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué hábito de seguridad digital vas a mejorar a partir de hoy?" } },
  ],

  // ════════ CD-I-P07 (numero 10) — Identidad, inclusión y convivencia digital (Complemento) ════════
  "CD-I-P07": [
    { titulo: "Convivencia digital — Verdadero o falso", descripcion: "Distingue afirmaciones sobre diversidad, inclusión y comunicación digital.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "En el ciberespacio conviven personas con identidades, culturas y opiniones muy diversas.", respuesta: true, retroalimentacion: "Correcto: la diversidad es parte de la vida en línea." },
        { enunciado: "La comunicación digital respetuosa incluye no agredir ni discriminar a otras personas.", respuesta: true, retroalimentacion: "Correcto: el respeto también aplica en línea." },
        { enunciado: "El ciberacoso es inofensivo y no tiene consecuencias reales.", respuesta: false, retroalimentacion: "El ciberacoso causa daño real y puede tener consecuencias legales." },
        { enunciado: "Un lenguaje inclusivo ayuda a que más personas se sientan representadas y respetadas.", respuesta: true, retroalimentacion: "Correcto: favorece una convivencia sana." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: identidad e inclusión digital", descripcion: "Aprende los términos clave de convivencia e inclusión en línea.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Diversidad digital", definicion: "Presencia de personas con distintas identidades, culturas y formas de pensar en el ciberespacio.", ejemplo: "Comunidades en línea de todo el mundo." },
        { termino: "Comunicación inclusiva", definicion: "Forma de comunicarse que respeta y representa a todas las personas.", ejemplo: "Evitar expresiones discriminatorias." },
        { termino: "Ciberacoso", definicion: "Acoso u hostigamiento hacia una persona mediante medios digitales.", ejemplo: "Mensajes ofensivos o difundir rumores en redes." },
        { termino: "Netiqueta", definicion: "Conjunto de normas de buena conducta y respeto en la comunicación digital.", ejemplo: "No escribir todo en mayúsculas (equivale a gritar)." },
      ], actividad_final: "Propón tres reglas de convivencia para un grupo de chat de tu salón." } },
    { titulo: "Completa: convivencia digital", descripcion: "Completa el texto sobre identidad, inclusión y convivencia digital.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "En el ciberespacio conviven personas con identidades ___. La comunicación ___ respeta a todas las personas y evita la discriminación. El acoso por medios digitales se llama ___. Las normas de respeto en línea se conocen como ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "diversas", alternativas_aceptadas: ["distintas"], pista: "Diferentes entre sí." },
          { posicion: 1, respuesta_correcta: "inclusiva", alternativas_aceptadas: ["respetuosa"], pista: "Que incluye a todas las personas." },
          { posicion: 2, respuesta_correcta: "ciberacoso", alternativas_aceptadas: ["ciberbullying"], pista: "Acoso digital." },
          { posicion: 3, respuesta_correcta: "netiqueta", pista: "Etiqueta de la red." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Convivencia digital", descripcion: "Valora tu práctica de la convivencia respetuosa e inclusiva en línea.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Valoro la diversidad de identidades en el ciberespacio.", escala: escala4 },
        { descripcion: "Practico una comunicación digital respetuosa e inclusiva.", escala: escala4 },
        { descripcion: "Reconozco el ciberacoso y sé cómo actuar ante él.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo actuarías si vieras a alguien sufriendo ciberacoso?" } },
  ],

  // ════════ CD-I-P08 (numero 11) — Herramientas digitales para la escuela (Complemento) ════════
  "CD-I-P08": [
    { titulo: "Herramientas digitales escolares — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el uso de herramientas digitales para la escuela.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Organizar tus archivos en carpetas con nombres claros facilita encontrarlos después.", respuesta: true, retroalimentacion: "Correcto: la organización ahorra tiempo." },
        { enunciado: "Una hoja de cálculo sirve para organizar datos y hacer operaciones automáticas.", respuesta: true, retroalimentacion: "Correcto: es útil para tablas, sumas y gráficas." },
        { enunciado: "Guardar una copia de respaldo de tus trabajos es una pérdida de tiempo.", respuesta: false, retroalimentacion: "Un respaldo te protege si pierdes o se daña el original." },
        { enunciado: "Las plataformas de colaboración permiten trabajar en un documento entre varias personas a la vez.", respuesta: true, retroalimentacion: "Correcto: facilitan el trabajo en equipo." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: ofimática y organización", descripcion: "Aprende los términos clave de las herramientas digitales escolares.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Procesador de texto", definicion: "Programa para escribir y dar formato a documentos.", ejemplo: "Writer de LibreOffice o Google Docs." },
        { termino: "Hoja de cálculo", definicion: "Programa para organizar datos en filas y columnas y hacer cálculos.", ejemplo: "Calc de LibreOffice o Google Sheets." },
        { termino: "Presentación electrónica", definicion: "Programa para crear diapositivas para exponer un tema.", ejemplo: "Impress de LibreOffice." },
        { termino: "Respaldo (backup)", definicion: "Copia de seguridad de tus archivos para no perderlos.", ejemplo: "Guardar tu tarea también en la nube o una USB." },
      ], actividad_final: "Crea una estructura de carpetas para organizar tus materias de este semestre." } },
    { titulo: "Completa: herramientas escolares", descripcion: "Completa el texto sobre las herramientas digitales para la escuela.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Para escribir documentos usamos un ___ de texto; para organizar datos y hacer cálculos, una ___ de cálculo. Para exponer un tema con diapositivas usamos una ___ electrónica. Guardar una copia de seguridad de tus trabajos se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "procesador", pista: "Para escribir." },
          { posicion: 1, respuesta_correcta: "hoja", pista: "___ de cálculo." },
          { posicion: 2, respuesta_correcta: "presentación", alternativas_aceptadas: ["presentacion"], pista: "Diapositivas." },
          { posicion: 3, respuesta_correcta: "respaldo", alternativas_aceptadas: ["backup", "copia de seguridad"], pista: "Copia de seguridad." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Herramientas escolares", descripcion: "Valora tu uso de herramientas digitales para la escuela.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Organizo y gestiono mis archivos e información digital.", escala: escala4 },
        { descripcion: "Uso procesador de texto, hoja de cálculo y presentaciones.", escala: escala4 },
        { descripcion: "Colaboro con otras personas usando plataformas digitales.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué herramienta digital te ayudaría a organizar mejor tus estudios?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
