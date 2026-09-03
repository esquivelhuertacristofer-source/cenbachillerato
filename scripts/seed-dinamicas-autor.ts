/**
 * LAS ACTIVIDADES DINÁMICAS ESCRITAS A MANO (migración 26).
 *
 * `relacionar_columnas` y `reto_cronometrado` se derivan del contenido que ya
 * existe (seed-actividades-dinamicas.ts). Estas tres NO se pueden derivar de
 * ningún campo de la base:
 *
 *   · ordenar_secuencia     — no hay dato que diga qué va antes que qué.
 *   · clasificar_categorias — no hay dato que diga con qué criterio se separa.
 *   · caso_decision         — no hay dato que diga qué pasa si eliges mal.
 *
 * Hay UNA por UAC, la del tipo que le cae mejor a esa materia, y su contenido
 * sale del propósito MCCEMS de una progresión concreta —anotada en cada
 * bloque— para que no sea un ejercicio pegado encima del programa sino una
 * forma distinta de trabajar lo que ya se estudia ahí.
 *
 * CONTEXTO MEXICANO SIEMPRE QUE EL TEMA LO PERMITA: CFE, INEGI, el Metro, la
 * UNAM, la CNDH. No es decoración; un caso de decisión sobre una beca que
 * existe se piensa distinto que uno sobre un país sin nombre.
 *
 * IDEMPOTENTE: si el código ya existe, se salta.
 *
 * Uso:
 *   npx tsx scripts/seed-dinamicas-autor.ts --dry
 *   npx tsx scripts/seed-dinamicas-autor.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { validarContenidoActividad, type TipoActividadKey } from "../src/lib/activities/validators";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const DRY = process.argv.includes("--dry");

interface Autoria {
  /** Código de la UAC. */
  uac: string;
  /** Número de la progresión (el `numero`, no el sufijo del código). */
  progresion: number;
  tipo: TipoActividadKey;
  titulo: string;
  descripcion: string;
  contenido: Record<string, unknown>;
  xp: number;
}

const OBRA: Autoria[] = [
  // ═══════════════════════ SEMESTRE 1 ═══════════════════════
  {
    uac: "CD-I", progresion: 2, tipo: "clasificar_categorias",
    titulo: "¿Es hardware, software o licencia?",
    descripcion: "Separa lo físico, lo lógico y el permiso legal de uso: tres cosas que se confunden todo el tiempo.",
    xp: 20,
    contenido: {
      instrucciones:
        "Las tres se compran, las tres cuestan y las tres vienen en la caja, pero no son lo mismo. " +
        "El hardware se toca, el software se ejecuta y la licencia dice qué te dejan hacer con el software.",
      categorias: [
        { nombre: "Hardware", descripcion: "Lo físico: se puede tocar y se puede romper de un golpe." },
        { nombre: "Software", descripcion: "Programas e instrucciones: no se tocan, se ejecutan." },
        { nombre: "Licencia", descripcion: "El permiso legal que dice qué puedes hacer con un programa." },
      ],
      elementos: [
        { texto: "Memoria RAM", categoria: "Hardware", explicacion: "Es un componente físico donde el equipo guarda lo que está usando en este momento." },
        { texto: "Disco de estado sólido (SSD)", categoria: "Hardware", explicacion: "Es el almacenamiento físico; el que guarda los archivos cuando el equipo está apagado." },
        { texto: "Tarjeta madre", categoria: "Hardware", explicacion: "La placa física que conecta a todos los demás componentes." },
        { texto: "Sistema operativo", categoria: "Software", explicacion: "Es el programa que administra el equipo: Windows, GNU/Linux o Android." },
        { texto: "Navegador web", categoria: "Software", explicacion: "Es un programa que se instala y se ejecuta; no es una pieza del equipo." },
        { texto: "Controlador (driver) de la impresora", categoria: "Software", explicacion: "Es el programa que le enseña al sistema a hablar con la impresora. La impresora es hardware; su driver, no." },
        { texto: "GPL", categoria: "Licencia", explicacion: "La General Public License garantiza las cuatro libertades del software libre y obliga a conservarlas en las versiones derivadas." },
        { texto: "Creative Commons BY-SA", categoria: "Licencia", explicacion: "Permite compartir y adaptar una obra citando al autor y conservando la misma licencia." },
        { texto: "Licencia de uso privativo (EULA)", categoria: "Licencia", explicacion: "El contrato que aceptas al instalar un programa de patente; no es el programa, es el permiso." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "CNEYT-I", progresion: 4, tipo: "clasificar_categorias",
    titulo: "Elementos, compuestos y mezclas",
    descripcion: "Clasifica materiales de todos los días según cómo están unidas sus partículas.",
    xp: 20,
    contenido: {
      instrucciones:
        "La diferencia no es cómo se ve, es cómo se separa. Un compuesto sólo se separa con una reacción química; " +
        "una mezcla se separa con métodos físicos (filtrar, evaporar, decantar).",
      categorias: [
        { nombre: "Elemento", descripcion: "Un solo tipo de átomo. No se puede descomponer químicamente." },
        { nombre: "Compuesto", descripcion: "Dos o más elementos unidos químicamente en proporción fija." },
        { nombre: "Mezcla homogénea", descripcion: "Se ve una sola fase; no distingues los componentes." },
        { nombre: "Mezcla heterogénea", descripcion: "Se distinguen las partes a simple vista." },
      ],
      elementos: [
        { texto: "Oro de 24 quilates", categoria: "Elemento", explicacion: "Oro puro: un solo tipo de átomo (Au). El de 14 quilates ya sería una mezcla (aleación)." },
        { texto: "Gas helio de un globo", categoria: "Elemento", explicacion: "Un solo tipo de átomo (He), y además no se combina con casi nada." },
        { texto: "Agua destilada", categoria: "Compuesto", explicacion: "H₂O: hidrógeno y oxígeno unidos químicamente en proporción fija 2:1." },
        { texto: "Sal de mesa (cloruro de sodio)", categoria: "Compuesto", explicacion: "NaCl. Separar el sodio del cloro exige electrólisis, no un colador." },
        { texto: "Dióxido de carbono", categoria: "Compuesto", explicacion: "CO₂: un carbono y dos oxígenos unidos químicamente." },
        { texto: "Agua de mar", categoria: "Mezcla homogénea", explicacion: "La sal está disuelta: se ve una sola fase, pero se separa evaporando." },
        { texto: "Aire limpio", categoria: "Mezcla homogénea", explicacion: "Nitrógeno, oxígeno, argón y otros gases mezclados sin reaccionar entre sí." },
        { texto: "Agua con aceite", categoria: "Mezcla heterogénea", explicacion: "Se ven dos fases y se separan por decantación." },
        { texto: "Concreto", categoria: "Mezcla heterogénea", explicacion: "Se distinguen la grava, la arena y el cemento a simple vista." },
        { texto: "Ensalada de nopales", categoria: "Mezcla heterogénea", explicacion: "Cada ingrediente se ve y se puede sacar con el tenedor." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "IN-I", progresion: 1, tipo: "ordenar_secuencia",
    titulo: "Order the introduction dialogue",
    descripcion: "Ordena un diálogo de presentación en inglés: el orden es parte del significado.",
    xp: 15,
    contenido: {
      instrucciones:
        "Estas seis líneas son una conversación de presentación entre dos estudiantes. " +
        "Acomódalas en el orden en que de verdad ocurren: en inglés, igual que en español, primero se saluda y al final se cierra.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Good morning! My name is Ana. What's your name?", marca: "Ana", explicacion: "Se abre con el saludo y la propia presentación antes de preguntar." },
        { texto: "Hi Ana, nice to meet you. I'm Luis.", marca: "Luis", explicacion: "Responde el saludo, devuelve la cortesía y da su nombre." },
        { texto: "Nice to meet you too, Luis. Where are you from?", marca: "Ana", explicacion: "Devuelve el 'nice to meet you' y pasa a la siguiente pregunta." },
        { texto: "I'm from Toluca. And you?", marca: "Luis", explicacion: "Contesta y regresa la pregunta con 'And you?', que es lo que mantiene viva la conversación." },
        { texto: "I'm from Metepec. This is my friend Sofía.", marca: "Ana", explicacion: "Contesta y presenta a una tercera persona: el paso que pide la progresión." },
        { texto: "Hello Sofía, welcome. See you in class!", marca: "Luis", explicacion: "Saluda a la tercera persona y cierra la conversación." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "PM-I", progresion: 7, tipo: "ordenar_secuencia",
    titulo: "La jerarquía de operaciones, paso a paso",
    descripcion: "Ordena los pasos para resolver un cálculo combinado sin equivocarte de orden.",
    xp: 15,
    contenido: {
      instrucciones:
        "Resuelve 8 + 3 × (10 − 6)² ÷ 4. Acomoda los pasos en el orden en que hay que hacerlos. " +
        "Cambiar el orden cambia el resultado: ése es justamente el punto.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Resolver lo que está dentro del paréntesis: (10 − 6) = 4", marca: "1º", explicacion: "Los agrupamientos van primero, siempre." },
        { texto: "Aplicar la potencia: 4² = 16", marca: "2º", explicacion: "Potencias y raíces van después de los agrupamientos y antes de multiplicar." },
        { texto: "Multiplicar: 3 × 16 = 48", marca: "3º", explicacion: "Multiplicación y división van juntas, de izquierda a derecha; aquí la multiplicación está a la izquierda." },
        { texto: "Dividir: 48 ÷ 4 = 12", marca: "4º", explicacion: "La división es del mismo nivel que la multiplicación y va después porque está a su derecha." },
        { texto: "Sumar: 8 + 12 = 20", marca: "5º", explicacion: "La suma y la resta son lo último. El resultado es 20." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },
  {
    uac: "PFH-I", progresion: 1, tipo: "caso_decision",
    titulo: "Una discusión en el grupo de WhatsApp",
    descripcion: "Un caso para distinguir opinión, argumento y creencia cuando cuesta hacerlo.",
    xp: 25,
    contenido: {
      contexto:
        "En el grupo de tu salón alguien reenvía un mensaje: 'Confirmado: la escuela va a quitar el receso porque los alumnos de tercero rompieron unas bancas.' " +
        "Nadie sabe de dónde salió. En diez minutos hay treinta mensajes, dos personas enojadas con los de tercero y una propuesta de no entrar a clase mañana.",
      escenas: [
        {
          situacion: "El mensaje no dice quién lo dijo ni cuándo. Tres compañeros ya lo dan por cierto.",
          pregunta: "¿Qué haces primero?",
          opciones: [
            { texto: "Preguntar en el grupo de dónde salió la información y si alguien la escuchó de la dirección.", consecuencia: "Dos personas admiten que lo leyeron en otro grupo y nadie sabe el origen. Con eso, la mitad del grupo baja el tono. Preguntar por la fuente no es desconfianza: es lo primero que distingue una afirmación de un rumor.", calidad: 2 },
            { texto: "Reenviarlo a tu grupo de la otra materia para avisarles.", consecuencia: "El rumor llega a dos salones más y regresa 'confirmado', porque ahora lo dicen tres grupos distintos. Repetir algo no lo vuelve verdadero: sólo lo vuelve más difícil de desmentir.", calidad: 0 },
            { texto: "Escribir 'yo creo que sí es cierto, siempre nos castigan a todos'.", consecuencia: "Nadie te corrige, porque tu frase no afirma un hecho: afirma lo que crees. El problema es que el grupo la lee como confirmación. Una creencia dicha en voz alta pesa igual que un dato para quien la escucha.", calidad: 1 },
          ],
        },
        {
          situacion: "Una compañera dice: 'Es obvio que fueron los de tercero, siempre están en el patio a esa hora.'",
          pregunta: "¿Esa frase es un argumento?",
          opciones: [
            { texto: "Sí: da una razón (están en el patio a esa hora).", consecuencia: "Es la respuesta más común y por eso es la trampa. Estar en el patio es compatible con romper las bancas y con no romperlas: no distingue entre las dos, así que no sostiene la conclusión. Una razón que también valdría para lo contrario no es un argumento.", calidad: 1 },
            { texto: "No: es una opinión con una coincidencia detrás, no una prueba de que ellos lo hicieran.", consecuencia: "Exacto. Que dos cosas ocurran en el mismo lugar y a la misma hora no dice cuál causó cuál. Nombrarlo en voz alta —'eso no lo prueba'— es la operación filosófica que la progresión pide practicar.", calidad: 2 },
            { texto: "No importa si es argumento: lo que importa es que casi todos lo creen.", consecuencia: "Cuántos lo creen y si es verdad son dos preguntas distintas. Confundirlas es lo que convierte a un grupo en una multitud.", calidad: 0 },
          ],
        },
        {
          situacion: "Al día siguiente la dirección informa que el receso sigue igual y que las bancas se rompieron por la lluvia.",
          pregunta: "¿Qué haces con lo que escribiste ayer?",
          opciones: [
            { texto: "Escribir en el grupo que la información era falsa y de dónde salió el dato real.", consecuencia: "Cuesta, porque queda por escrito que te equivocaste con los demás. También es lo único que corta el rumor: la corrección tiene que llegar a las mismas personas a las que llegó el error.", calidad: 2 },
            { texto: "No decir nada; total, el asunto ya se acabó.", consecuencia: "Para ti se acabó. Para los de tercero, treinta compañeros se quedaron con la idea de que rompieron algo. Un rumor no desmentido no se borra: se archiva.", calidad: 0 },
            { texto: "Salirte del grupo.", consecuencia: "Te ahorras la incomodidad y no reparas nada. Salir de la conversación es una decisión legítima, pero no es hacerse cargo de lo que se dijo en ella.", calidad: 1 },
          ],
        },
      ],
      cierre_bueno:
        "Preguntaste por la fuente, distinguiste una coincidencia de un argumento y corregiste donde se había dicho el error. Eso es exactamente pensar por cuenta propia: no es tener opiniones fuertes, es saber qué sostiene a cada una.",
      cierre_regular:
        "Dudaste en algún punto, pero no diste el rumor por hecho. Lo que queda por practicar es lo más difícil: nombrar en voz alta que una razón no sostiene una conclusión, aunque todos alrededor ya la den por buena.",
      cierre_malo:
        "El rumor creció y no se corrigió. No pasó por mala intención: pasó porque en cada paso era más cómodo seguir al grupo que preguntar de dónde salía el dato. Ése es el punto de la progresión, y por eso vale la pena volver a empezar el caso.",
      pregunta_reflexion:
        "¿En qué momento de este caso te diste cuenta de que estabas creyendo algo sin razón suficiente? Describe qué te lo hizo notar.",
    },
  },
  {
    uac: "CS-I", progresion: 3, tipo: "caso_decision",
    titulo: "La norma del uniforme",
    descripcion: "Un caso sobre normas sociales, normas jurídicas y cómo se cambian.",
    xp: 25,
    contenido: {
      contexto:
        "En tu plantel el reglamento exige zapato negro escolar. Una compañera llega con tenis porque su único par de zapatos se rompió y en su casa no hay dinero para otros este mes. " +
        "El prefecto le impide entrar. Un grupo de alumnos propone protestar en la entrada; otro dice que el reglamento es el reglamento.",
      escenas: [
        {
          situacion: "Te preguntan qué opinas antes de que empiece la clase.",
          pregunta: "¿Cuál es la primera pregunta útil?",
          opciones: [
            { texto: "¿Para qué existe esa norma? ¿Qué problema vino a resolver?", consecuencia: "Es la pregunta que abre todo lo demás. El reglamento dice que el uniforme busca evitar que se note quién tiene más dinero. Aplicado así, produce justo lo contrario: deja fuera a quien no puede pagarlo. Preguntar por la finalidad de una norma es lo que permite discutirla sin romperla.", calidad: 2 },
            { texto: "¿Está en el reglamento, sí o no?", consecuencia: "Lo está, y con eso se acaba la conversación. Saber si una norma existe es distinto de saber si es justa; quedarse en lo primero deja el caso donde estaba.", calidad: 1 },
            { texto: "¿Quién tiene la culpa, el prefecto o la alumna?", consecuencia: "Ninguno de los dos escribió el reglamento. Buscar un culpable individual para un problema de norma es el camino más rápido a no cambiar nada.", calidad: 0 },
          ],
        },
        {
          situacion: "El grupo se divide entre protestar en la entrada y no hacer nada.",
          pregunta: "¿Qué propones?",
          opciones: [
            { texto: "Pedir una reunión con la dirección y llevar por escrito una propuesta de excepción por causa económica.", consecuencia: "Tardó dos semanas y funcionó: la dirección agregó un supuesto de excepción con constancia del tutor. Los cauces institucionales son lentos y por eso se desprecian, pero son los únicos que cambian la norma para la siguiente persona, no sólo para ésta.", calidad: 2 },
            { texto: "Protestar en la entrada mañana mismo.", consecuencia: "Ese día la dejan pasar y al siguiente vuelve la regla igual. La presión sirvió para el caso concreto y no tocó la norma: la protesta abre la puerta, pero si nadie escribe la excepción, la puerta se vuelve a cerrar.", calidad: 1 },
            { texto: "Que ella consiga zapatos prestados y ya.", consecuencia: "El problema desaparece de la vista sin haberse resuelto. Mañana le pasa a otra persona y la conversación empieza de cero.", calidad: 0 },
          ],
        },
        {
          situacion: "En la reunión, la dirección responde que si hacen una excepción, todos van a pedirla.",
          pregunta: "¿Qué contestas?",
          opciones: [
            { texto: "Que la excepción se escriba con un criterio verificable —constancia del tutor— para que no dependa del ánimo de quien esté en la puerta.", consecuencia: "Es la respuesta que convence, porque atiende el miedo real de la dirección: no es a la excepción, es a la arbitrariedad. Una norma con criterio explícito es más fácil de defender que una sin excepciones.", calidad: 2 },
            { texto: "Que confíen en la palabra de cada alumno.", consecuencia: "La dirección no acepta: sin criterio escrito, quien aplique la norma decide caso por caso y eso es exactamente lo que produce trato desigual.", calidad: 1 },
            { texto: "Que si no aceptan, van a difundirlo en redes.", consecuencia: "La reunión se acaba ahí. La amenaza pudo haber funcionado, pero cerró el único espacio donde la norma se podía reescribir.", calidad: 0 },
          ],
        },
      ],
      cierre_bueno:
        "Preguntaste para qué existía la norma, propusiste cambiarla por el cauce que la puede cambiar y escribiste un criterio verificable. Así es como una norma social se vuelve una norma justa: no quitándola, sino haciéndola explícita.",
      cierre_regular:
        "Resolviste el caso de tu compañera, pero la norma quedó igual para la siguiente. Es la diferencia entre ayudar a una persona y cambiar la regla que la dejó fuera; las dos cosas valen, y no son la misma.",
      cierre_malo:
        "Tu compañera perdió el día y nada cambió. Ninguna de tus decisiones fue malintencionada: buscaron culpables o atajos en vez de preguntar qué problema venía a resolver la norma. Vale la pena volver a empezar desde esa pregunta.",
      pregunta_reflexion:
        "Piensa en una norma de tu escuela o tu casa que te parezca injusta. ¿Qué problema vino a resolver, y sigue resolviéndolo?",
    },
  },
  {
    uac: "LC-I", progresion: 4, tipo: "clasificar_categorias",
    titulo: "¿Qué tipo de párrafo es?",
    descripcion: "Clasifica párrafos reales según la función que cumplen dentro de un texto.",
    xp: 20,
    contenido: {
      instrucciones:
        "Un párrafo no se clasifica por su largo ni por su tema, sino por LO QUE HACE dentro del texto. " +
        "Lee cada uno y decide qué función cumple.",
      categorias: [
        { nombre: "Introductorio", descripcion: "Abre el tema y anuncia de qué va a tratar el texto." },
        { nombre: "De desarrollo", descripcion: "Aporta datos, ejemplos o argumentos que sostienen la idea." },
        { nombre: "De conclusión", descripcion: "Cierra, recapitula o deja una idea final." },
      ],
      elementos: [
        { texto: "\"Pocos objetos han cambiado tanto la vida diaria en México como el teléfono celular. Este texto revisa tres de esos cambios.\"", categoria: "Introductorio", explicacion: "Presenta el tema y anuncia la estructura ('tres de esos cambios'): la marca más clara de un párrafo de apertura." },
        { texto: "\"Vale la pena preguntarse, antes de seguir, qué entendemos por 'comunidad' en un país tan diverso.\"", categoria: "Introductorio", explicacion: "Abre planteando la pregunta que el texto va a responder; no aporta datos todavía." },
        { texto: "\"Según el INEGI, en 2023 el 81.2 % de la población de 6 años o más usaba internet, frente al 65.8 % de 2017.\"", categoria: "De desarrollo", explicacion: "Aporta un dato con fuente para sostener la idea; es el trabajo de un párrafo de desarrollo." },
        { texto: "\"Un ejemplo lo muestra bien: en Oaxaca, varias comunidades operan su propia red de telefonía celular desde 2013.\"", categoria: "De desarrollo", explicacion: "Ejemplifica. El conector 'un ejemplo lo muestra bien' anuncia que viene evidencia, no una idea nueva." },
        { texto: "\"Sin embargo, el acceso no está repartido por igual: la brecha entre zonas urbanas y rurales sigue siendo de más de veinte puntos.\"", categoria: "De desarrollo", explicacion: "Matiza con un dato en contra. Contrastar también es desarrollar: el párrafo sigue sosteniendo la argumentación." },
        { texto: "\"En suma, la conexión cambió la vida diaria, pero no la cambió igual para todos.\"", categoria: "De conclusión", explicacion: "'En suma' recapitula y cierra recogiendo las dos ideas del texto." },
        { texto: "\"Queda una pregunta abierta que este texto no puede responder: ¿quién decide qué comunidades se conectan primero?\"", categoria: "De conclusión", explicacion: "Cierra dejando una idea final. Un cierre no siempre resume: a veces abre la pregunta siguiente." },
        { texto: "\"Todo lo anterior apunta a lo mismo, y con eso terminamos.\"", categoria: "De conclusión", explicacion: "Marca el final de forma explícita. Es un cierre pobre —no dice a qué apunta— pero es un cierre." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },

  // ═══════════════════════ SEMESTRE 2 ═══════════════════════
  {
    uac: "CD-II", progresion: 3, tipo: "caso_decision",
    titulo: "La fuente que parecía buena",
    descripcion: "Un caso de investigación digital: verificar, citar y difundir sin hacer daño.",
    xp: 25,
    contenido: {
      contexto:
        "Tienes que entregar en tres días una investigación sobre el consumo de agua en tu municipio. " +
        "Encuentras un blog con una gráfica perfecta: dice que tu municipio consume el triple del promedio nacional. No cita de dónde salió el dato.",
      escenas: [
        {
          situacion: "La gráfica es exactamente lo que necesitas y no tiene fuente.",
          pregunta: "¿Qué haces con ella?",
          opciones: [
            { texto: "Buscar el dato en CONAGUA o INEGI para ver si coincide.", consecuencia: "Te toma veinte minutos y el dato real resulta ser 1.4 veces el promedio, no el triple. La gráfica del blog había mezclado consumo doméstico con consumo industrial. Verificar no es desconfiar del autor: es la única forma de saber qué mide un número.", calidad: 2 },
            { texto: "Usarla citando el blog como fuente.", consecuencia: "Citas correctamente una fuente incorrecta. La cita te protege del plagio, no del error: quien cite tu trabajo va a heredar el dato mal.", calidad: 1 },
            { texto: "Copiar la gráfica al trabajo; total, es información pública.", consecuencia: "Es plagio de la imagen y además arrastra un dato falso. 'Estaba en internet' no es una licencia de uso ni una garantía de veracidad.", calidad: 0 },
          ],
        },
        {
          situacion: "Ya tienes el dato correcto y quieres presentar la gráfica en tu trabajo.",
          pregunta: "¿Cómo la incluyes?",
          opciones: [
            { texto: "Rehacerla tú con los datos abiertos de CONAGUA y citar el conjunto de datos y la fecha de consulta.", consecuencia: "Es más trabajo y es lo que hace verificable tu investigación: cualquiera puede bajar el mismo archivo y rehacer tu gráfica. Eso es lo que separa un trabajo escolar de una captura de pantalla.", calidad: 2 },
            { texto: "Capturar la gráfica del portal oficial y pegarla con la liga.", consecuencia: "Es aceptable y honesto, pero pierdes el control de lo que muestra: si el portal cambia el gráfico, tu trabajo dice otra cosa que la que dijiste.", calidad: 1 },
            { texto: "Editar la gráfica del blog para corregir los números.", consecuencia: "Ahora hay una gráfica que parece de una fuente y contiene datos de otra. Alterar una imagen ajena y presentarla como dato es peor que copiarla.", calidad: 0 },
          ],
        },
        {
          situacion: "Un compañero te pide tu archivo para 'guiarse'. Entrega mañana.",
          pregunta: "¿Qué haces?",
          opciones: [
            { texto: "Compartirle las fuentes y explicarle cómo bajaste los datos, no el documento.", consecuencia: "Se tarda más y entrega algo suyo. Compartir el método enseña; compartir el archivo sólo traslada el problema y los dos quedan expuestos.", calidad: 2 },
            { texto: "Pasarle el archivo pidiéndole que lo cambie.", consecuencia: "No lo cambia lo suficiente y los dos trabajos comparten párrafos. En una revisión de similitud aparecen los dos, y el que lo escribió primero no tiene cómo demostrarlo.", calidad: 0 },
            { texto: "Decirle que no y ya.", consecuencia: "Evitas el problema y no lo ayudas. Es defendible, pero había una opción que hacía las dos cosas.", calidad: 1 },
          ],
        },
      ],
      cierre_bueno:
        "Verificaste el dato en la fuente primaria, rehiciste la gráfica de forma que otro pueda reproducirla y ayudaste sin prestar el archivo. Ésa es la diferencia entre buscar información y hacer una investigación digital.",
      cierre_regular:
        "Tu trabajo es honesto, pero depende de que la fuente que citaste no cambie ni se equivoque. Lo que falta practicar es ir al dato primario y rehacerlo tú.",
      cierre_malo:
        "El trabajo tiene un dato falso, una imagen ajena y un compañero con los mismos párrafos. Ninguna decisión fue por mala fe: cada una fue el atajo de las tres de la mañana. Vale la pena rehacer el caso con calma.",
      pregunta_reflexion:
        "¿Cuántas veces esta semana diste por buena una cifra sin ver de dónde salía? Elige una y busca su fuente ahora.",
    },
  },
  {
    uac: "LC-II", progresion: 4, tipo: "ordenar_secuencia",
    titulo: "La estructura de una narración",
    descripcion: "Ordena los momentos de un relato y reconoce por qué ese orden produce tensión.",
    xp: 15,
    contenido: {
      instrucciones:
        "Éstos son los momentos de un cuento breve, desordenados. Acomódalos como los contaría alguien " +
        "que quiere que la persona que escucha no se vaya antes del final.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Se presenta a Rosa, que lleva veinte años vendiendo pan en la misma esquina de Toluca.", marca: "Situación inicial", explicacion: "El relato empieza estableciendo quién, dónde y en qué equilibrio: sin eso, la ruptura no se siente." },
        { texto: "Una tarde, el municipio anuncia que la esquina se convertirá en parada de autobús.", marca: "Ruptura", explicacion: "El acontecimiento que rompe el equilibrio inicial. Sin ruptura no hay historia, hay descripción." },
        { texto: "Rosa junta firmas de sus clientes y va tres veces al ayuntamiento sin que la reciban.", marca: "Desarrollo", explicacion: "Los intentos fallidos son los que construyen la tensión: cada uno acerca el desenlace y lo pospone." },
        { texto: "El día de la obra, cuarenta vecinos amanecen formados frente a su puesto.", marca: "Clímax", explicacion: "El punto de máxima tensión, donde el conflicto se resuelve en un sentido o en el otro." },
        { texto: "La parada se construye media cuadra más adelante y el puesto se queda.", marca: "Desenlace", explicacion: "Resuelve el conflicto planteado en la ruptura. Un desenlace que resuelve otra cosa deja al lector engañado." },
        { texto: "Rosa sigue vendiendo, ahora con una fila que incluye a los que esperan el autobús.", marca: "Situación final", explicacion: "El nuevo equilibrio, que no es el inicial. Ahí se ve qué cambió, que es de lo que trataba el cuento." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "PM-II", progresion: 6, tipo: "ordenar_secuencia",
    titulo: "Resolver una ecuación lineal, paso a paso",
    descripcion: "Ordena el procedimiento para despejar una incógnita sin romper la igualdad.",
    xp: 15,
    contenido: {
      instrucciones:
        "Resuelve 3(x + 4) − 5 = 2x + 11. Acomoda los pasos en orden. " +
        "Cada paso hace lo mismo de los dos lados: eso es lo que mantiene la igualdad viva.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Quitar el paréntesis: 3x + 12 − 5 = 2x + 11", marca: "1º", explicacion: "Se distribuye el 3 sobre los dos términos del paréntesis antes de mover nada." },
        { texto: "Reducir términos semejantes de cada lado: 3x + 7 = 2x + 11", marca: "2º", explicacion: "12 − 5 = 7. Simplificar cada lado por separado antes de pasar términos evita la mitad de los errores." },
        { texto: "Restar 2x en ambos lados: x + 7 = 11", marca: "3º", explicacion: "Se juntan las x de un solo lado haciendo la misma operación en los dos: eso es lo que conserva la igualdad." },
        { texto: "Restar 7 en ambos lados: x = 4", marca: "4º", explicacion: "Queda la incógnita sola. Ya está despejada." },
        { texto: "Comprobar: 3(4 + 4) − 5 = 19 y 2(4) + 11 = 19", marca: "5º", explicacion: "La comprobación no es un adorno: es lo único que distingue un resultado de una respuesta que parece resultado." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },
  {
    uac: "IN-II", progresion: 1, tipo: "clasificar_categorias",
    titulo: "Present Simple or Present Continuous?",
    descripcion: "Clasifica oraciones según el tiempo verbal que les corresponde y por qué.",
    xp: 20,
    contenido: {
      instrucciones:
        "En inglés el presente se parte en dos y la diferencia no es el momento, es el TIPO de acción: " +
        "lo que se hace habitualmente (Present Simple) o lo que está pasando ahora (Present Continuous).",
      categorias: [
        { nombre: "Present Simple", descripcion: "Rutinas, hábitos y hechos permanentes. Palabras clave: always, usually, every day." },
        { nombre: "Present Continuous", descripcion: "Lo que ocurre en este momento. Palabras clave: now, right now, at the moment." },
      ],
      elementos: [
        { texto: "I take the bus to school every day.", categoria: "Present Simple", explicacion: "'every day' marca hábito: es una rutina, no lo que pasa ahora." },
        { texto: "She usually studies after dinner.", categoria: "Present Simple", explicacion: "'usually' es un adverbio de frecuencia: pide Present Simple." },
        { texto: "Water boils at 100 °C at sea level.", categoria: "Present Simple", explicacion: "Un hecho que siempre es cierto. El Present Simple también sirve para verdades generales." },
        { texto: "My brother works at a workshop in Lerma.", categoria: "Present Simple", explicacion: "Una situación permanente, aunque en este segundo no esté trabajando." },
        { texto: "Look! It is raining again.", categoria: "Present Continuous", explicacion: "'Look!' señala el momento: está pasando mientras se habla." },
        { texto: "I am studying for the exam right now.", categoria: "Present Continuous", explicacion: "'right now' fija la acción en este instante." },
        { texto: "They are building a new library at the school.", categoria: "Present Continuous", explicacion: "Un proceso en curso, aunque hoy no haya nadie trabajando: sigue sin terminar." },
        { texto: "Be quiet, the baby is sleeping.", categoria: "Present Continuous", explicacion: "La acción está ocurriendo ahora y por eso hay que callarse." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "CS-II", progresion: 3, tipo: "clasificar_categorias",
    titulo: "Los factores de la producción",
    descripcion: "Clasifica recursos reales según el factor productivo al que pertenecen.",
    xp: 20,
    contenido: {
      instrucciones:
        "Todo proceso productivo combina cuatro factores. Clasificar bien no es memorizar la lista: " +
        "es poder ver, en cualquier negocio, quién aporta qué y quién se queda con cuánto.",
      categorias: [
        { nombre: "Tierra", descripcion: "Recursos naturales: suelo, agua, minerales, energía." },
        { nombre: "Trabajo", descripcion: "El esfuerzo humano, físico o intelectual." },
        { nombre: "Capital", descripcion: "Los bienes producidos que sirven para producir más." },
        { nombre: "Organización", descripcion: "La coordinación que decide cómo se combinan los otros tres." },
      ],
      elementos: [
        { texto: "El agua del pozo de una purificadora", categoria: "Tierra", explicacion: "Recurso natural extraído directamente: es tierra, no capital." },
        { texto: "El terreno donde está la nave industrial", categoria: "Tierra", explicacion: "El suelo es el ejemplo clásico del factor tierra." },
        { texto: "El litio de un yacimiento en Sonora", categoria: "Tierra", explicacion: "Mineral en su estado natural. Una vez procesado en batería, ya sería capital." },
        { texto: "Las horas de un soldador", categoria: "Trabajo", explicacion: "Esfuerzo físico humano aplicado a la producción." },
        { texto: "El diseño que hace una ingeniera", categoria: "Trabajo", explicacion: "El trabajo también es intelectual; no deja de ser trabajo por no ser manual." },
        { texto: "Una máquina de coser industrial", categoria: "Capital", explicacion: "Es un bien que ya fue producido y ahora sirve para producir otros." },
        { texto: "El camión de reparto", categoria: "Capital", explicacion: "Bien duradero que participa en la producción sin consumirse en un solo uso." },
        { texto: "El software de facturación", categoria: "Capital", explicacion: "El capital no siempre se toca: un programa comprado para producir también lo es." },
        { texto: "La decisión de qué producir y en qué orden", categoria: "Organización", explicacion: "Coordinar los otros factores es un factor en sí mismo; es lo que hace la función empresarial." },
        { texto: "El reparto de turnos entre los trabajadores", categoria: "Organización", explicacion: "No es el trabajo mismo, es la coordinación del trabajo." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "PFH-II", progresion: 3, tipo: "caso_decision",
    titulo: "El algoritmo que decide la beca",
    descripcion: "Un caso de ética aplicada a la tecnología: quién responde cuando decide una máquina.",
    xp: 25,
    contenido: {
      contexto:
        "Tu plantel prueba un sistema automático para repartir 50 becas entre 400 solicitantes. " +
        "El sistema ordena por promedio, ingreso familiar y asistencia. En la primera corrida, 47 de las 50 becas quedan en el turno matutino, " +
        "donde estudian los alumnos que no trabajan. La directora te pide, como parte del comité estudiantil, una opinión antes de publicar la lista.",
      escenas: [
        {
          situacion: "El sistema no está descompuesto: hace exactamente lo que se le pidió.",
          pregunta: "¿Cómo planteas el problema?",
          opciones: [
            { texto: "Que el criterio de asistencia castiga a quien trabaja, y eso no se decidió: se heredó de los datos.", consecuencia: "Es el punto exacto. Nadie escribió 'prefiere a los que no trabajan'; se escribió 'premia la asistencia', y en un plantel con turno vespertino las dos frases dan el mismo resultado. Un sesgo no necesita mala intención, sólo un criterio que nadie revisó contra la realidad.", calidad: 2 },
            { texto: "Que el sistema está mal programado y hay que arreglarlo.", consecuencia: "La programadora demuestra en cinco minutos que el código hace lo especificado. Llamarle error a una decisión mal tomada impide corregirla: el problema no está en el código, está en el criterio.", calidad: 1 },
            { texto: "Que como el sistema es objetivo, el resultado es justo aunque duela.", consecuencia: "Aplicar la misma regla a situaciones desiguales produce resultados desiguales. Confundir 'igual para todos' con 'justo' es el error que el sistema acaba de hacer visible.", calidad: 0 },
          ],
        },
        {
          situacion: "La directora pregunta quién es responsable de la lista si se publica así.",
          pregunta: "¿Qué respondes?",
          opciones: [
            { texto: "Quien eligió los criterios y quien firma la publicación; el sistema no puede ser responsable de nada.", consecuencia: "Es la respuesta que sostiene todo lo demás. Una máquina no delibera, no puede rendir cuentas ni reparar un daño. Delegarle la decisión no reparte la responsabilidad: la esconde.", calidad: 2 },
            { texto: "El proveedor del sistema, porque lo diseñó.", consecuencia: "El proveedor tiene parte, y también la tiene quien eligió usarlo y con qué criterios. Trasladar toda la responsabilidad afuera deja al plantel sin nada que corregir.", calidad: 1 },
            { texto: "Nadie: fue automático.", consecuencia: "Es la respuesta más cómoda y la más peligrosa. Si nadie responde, nadie corrige, y el mismo reparto se repite el semestre entrante.", calidad: 0 },
          ],
        },
        {
          situacion: "Hay que decidir qué hacer con la lista antes del viernes.",
          pregunta: "¿Qué propones?",
          opciones: [
            { texto: "No publicarla; revisar el criterio de asistencia para que contemple el trabajo remunerado, y volver a correrlo con el comité presente.", consecuencia: "Se retrasa una semana y el reparto queda 31–19 entre turnos. Corregir el criterio antes de publicar cuesta una semana; corregirlo después cuesta la confianza de 400 personas.", calidad: 2 },
            { texto: "Publicarla y abrir un periodo de apelaciones.", consecuencia: "Apelan 60 alumnos y se revisan a mano. Se repara algo, pero se reparó caso por caso lo que era un problema de criterio, y el trabajo recayó en los perjudicados.", calidad: 1 },
            { texto: "Publicarla: ya se anunció la fecha.", consecuencia: "La lista sale y el turno vespertino queda prácticamente fuera. Cumplir un calendario es una razón para actuar; no es una razón para no revisar.", calidad: 0 },
          ],
        },
      ],
      cierre_bueno:
        "Nombraste el sesgo sin llamarle error, pusiste la responsabilidad donde puede ejercerse y corregiste el criterio antes de publicar. Ésa es la ética aplicada a la tecnología: no es decidir si la máquina es buena o mala, es no dejar de decidir por haberla usado.",
      cierre_regular:
        "Detectaste que algo estaba mal, pero el arreglo llegó después de la publicación y lo pagaron los perjudicados. Lo que falta practicar es intervenir cuando todavía es barato: antes de que la decisión salga.",
      cierre_malo:
        "La lista se publicó como estaba y la responsabilidad se diluyó en 'fue automático'. Ninguna decisión fue cruel; todas fueron cómodas. Ése es el punto del caso.",
      pregunta_reflexion:
        "¿Qué decisiones sobre tu vida escolar podría estar tomando ya un sistema automático? ¿Quién tendría que responder por ellas?",
    },
  },
  {
    uac: "CNEYT-II", progresion: 11, tipo: "clasificar_categorias",
    titulo: "Energías renovables y no renovables en México",
    descripcion: "Clasifica fuentes de energía reales del sistema eléctrico mexicano.",
    xp: 20,
    contenido: {
      instrucciones:
        "El criterio no es si contamina, es si se repone en una escala de tiempo humana. " +
        "Hay fuentes limpias que no son renovables y renovables que sí tienen impacto ambiental.",
      categorias: [
        { nombre: "Renovable", descripcion: "Se repone en escala de tiempo humana: no se agota con el uso." },
        { nombre: "No renovable", descripcion: "Existe en cantidad finita y tarda millones de años en formarse." },
      ],
      elementos: [
        { texto: "Campo geotérmico de Cerro Prieto, Baja California", categoria: "Renovable", explicacion: "El calor interno de la Tierra se repone continuamente. Es la mayor planta geotérmica de México." },
        { texto: "Parque eólico de La Ventosa, Oaxaca", categoria: "Renovable", explicacion: "El viento del Istmo de Tehuantepec no se agota por usarlo." },
        { texto: "Central hidroeléctrica Chicoasén, Chiapas", categoria: "Renovable", explicacion: "El ciclo del agua la repone. Renovable no significa sin impacto: una presa transforma el ecosistema del río." },
        { texto: "Planta fotovoltaica de Villanueva, Coahuila", categoria: "Renovable", explicacion: "La radiación solar llega todos los días independientemente de cuánta se aproveche." },
        { texto: "Bagazo de caña quemado en un ingenio azucarero", categoria: "Renovable", explicacion: "Biomasa: la caña se vuelve a sembrar cada ciclo agrícola." },
        { texto: "Gas natural de la cuenca de Burgos", categoria: "No renovable", explicacion: "Hidrocarburo fósil. Es el que menos CO₂ emite por unidad de energía, y sigue siendo finito." },
        { texto: "Combustóleo en una termoeléctrica de la CFE", categoria: "No renovable", explicacion: "Derivado del petróleo: se formó en millones de años y no se repone." },
        { texto: "Carbón de la cuenca de Sabinas, Coahuila", categoria: "No renovable", explicacion: "Fósil, finito y el de mayor emisión por unidad de energía." },
        { texto: "Uranio de la central nucleoeléctrica de Laguna Verde", categoria: "No renovable", explicacion: "Genera electricidad casi sin emitir CO₂, pero el uranio es un mineral finito. Limpio y renovable no son sinónimos." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },

  // ═══════════════════════ SEMESTRE 3 ═══════════════════════
  {
    uac: "IN-III", progresion: 7, tipo: "ordenar_secuencia",
    titulo: "Tell the story in order",
    descripcion: "Ordena un relato en pasado usando los conectores como pistas.",
    xp: 15,
    contenido: {
      instrucciones:
        "Las oraciones cuentan lo que pasó ayer, pero están desordenadas. " +
        "Los conectores (first, then, after that, finally) son la pista: en inglés marcan la secuencia igual que en español.",
      criterio: "cronologia",
      pasos: [
        { texto: "First, I woke up late because my alarm didn't ring.", marca: "First", explicacion: "'First' abre la secuencia. Además, el pasado simple ('woke', 'didn't ring') sitúa todo el relato." },
        { texto: "Then, I ran to the bus stop without breakfast.", marca: "Then", explicacion: "'Then' encadena la acción siguiente a la anterior." },
        { texto: "When I arrived, the bus had already left.", marca: "When", explicacion: "El past perfect ('had left') marca algo anterior a otro pasado: el camión se fue ANTES de que llegara." },
        { texto: "After that, I walked twenty minutes to school.", marca: "After that", explicacion: "'After that' señala consecuencia temporal de lo anterior." },
        { texto: "I got to class late, but the teacher understood.", marca: "—", explicacion: "El resultado de la cadena. 'but' introduce el contraste con lo que se esperaba." },
        { texto: "Finally, I promised myself to set two alarms.", marca: "Finally", explicacion: "'Finally' cierra el relato con la conclusión de quien lo cuenta." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "CNEYT-III", progresion: 10, tipo: "ordenar_secuencia",
    titulo: "El ciclo del agua, paso a paso",
    descripcion: "Ordena las etapas del ciclo hidrológico siguiendo una gota real.",
    xp: 15,
    contenido: {
      instrucciones:
        "Sigue a una gota desde el Golfo de México hasta el Valle de Toluca y de regreso. " +
        "El ciclo no tiene principio absoluto, pero sí tiene un orden: cada etapa necesita la anterior.",
      criterio: "procedimiento",
      pasos: [
        { texto: "El Sol calienta la superficie del Golfo y el agua líquida pasa a vapor.", marca: "Evaporación", explicacion: "La energía solar es el motor de todo el ciclo: sin ella no hay cambio de estado." },
        { texto: "El vapor asciende, se enfría con la altura y se agrupa en gotitas alrededor de partículas de polvo.", marca: "Condensación", explicacion: "Al bajar la temperatura, el vapor vuelve a líquido. Las nubes son eso: gotitas condensadas, no vapor." },
        { texto: "Las gotitas crecen hasta que su peso vence a las corrientes de aire y caen.", marca: "Precipitación", explicacion: "La gota cae cuando la gravedad supera a la sustentación del aire; antes no, por pequeña que sea la nube." },
        { texto: "En el Nevado de Toluca, parte del agua escurre por la ladera hacia arroyos y ríos.", marca: "Escorrentía", explicacion: "El agua que no penetra el suelo viaja por la superficie hacia cauces mayores." },
        { texto: "Otra parte penetra el suelo y recarga el acuífero del Valle de Toluca.", marca: "Infiltración", explicacion: "La infiltración es la que repone el agua subterránea; pavimentar reduce esta etapa y aumenta las inundaciones." },
        { texto: "Ríos y acuíferos llevan el agua de vuelta al mar, y la que toman las plantas sale por sus hojas.", marca: "Retorno y transpiración", explicacion: "El ciclo se cierra por dos caminos a la vez: el cauce que llega al mar y la transpiración vegetal que devuelve vapor a la atmósfera." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "PFH-III", progresion: 2, tipo: "caso_decision",
    titulo: "La asamblea y la minoría",
    descripcion: "Un caso de filosofía política sobre mayoría, derechos y legitimidad.",
    xp: 25,
    contenido: {
      contexto:
        "La asamblea estudiantil vota qué hacer con el presupuesto de $40,000 del festival. " +
        "Gana por 180 contra 40 destinar todo a un concierto. Los 40 votos en contra son, casi todos, de alumnos de la comunidad mazahua del plantel, " +
        "que pedían destinar una parte a un encuentro de lenguas originarias. Alguien propone volver a votar; otro dice que la mayoría ya decidió.",
      escenas: [
        {
          situacion: "El resultado es claro y el procedimiento fue correcto.",
          pregunta: "¿La decisión es legítima?",
          opciones: [
            { texto: "Es válida por procedimiento, y hay que preguntarse aparte si es justa: no son la misma pregunta.", consecuencia: "Es la distinción que sostiene toda la filosofía política moderna. La regla de mayoría dice cómo se decide, no qué es correcto decidir. Confundirlas convierte al voto en un cheque en blanco.", calidad: 2 },
            { texto: "Sí: ganó la mayoría y así funciona la democracia.", consecuencia: "Es la definición más común y la más incompleta. Con ese criterio, una mayoría podría votar suprimir el derecho de la minoría y seguiría siendo 'democrático'. La historia tiene ejemplos suficientes.", calidad: 1 },
            { texto: "No: si una minoría pierde, la votación no vale.", consecuencia: "Con ese criterio ninguna decisión colectiva sería posible, porque siempre hay alguien que pierde. El problema del caso no es que haya perdedores; es qué se les quitó.", calidad: 0 },
          ],
        },
        {
          situacion: "Un compañero dice: 'si fueran más, ganarían; que convenzan a más gente'.",
          pregunta: "¿Qué respondes?",
          opciones: [
            { texto: "Que una minoría estructural nunca va a ser mayoría, y por eso los derechos no se someten a votación.", consecuencia: "Es el corazón del constitucionalismo: hay cuestiones que quedan fuera del alcance del voto precisamente porque quien las perdería siempre las perdería. Sin ese límite, la mayoría no gobierna, manda.", calidad: 2 },
            { texto: "Que deberían hacer mejor campaña la próxima vez.", consecuencia: "Presupone que el problema es de estrategia. Cuando un grupo es el 18 % del plantel, ninguna campaña lo vuelve el 51 %.", calidad: 1 },
            { texto: "Que se aguanten, así es la política.", consecuencia: "Describe cómo suele funcionar y no dice nada sobre cómo debería. La filosofía política empieza donde termina esa frase.", calidad: 0 },
          ],
        },
        {
          situacion: "Hay que proponer algo concreto a la asamblea.",
          pregunta: "¿Qué propones?",
          opciones: [
            { texto: "Reservar por reglamento un porcentaje del presupuesto para actividades de las comunidades del plantel, decidido por ellas.", consecuencia: "Se aprueba con 150 votos. Cambiar la regla —no el resultado— es lo que protege también a la próxima minoría, que puede ser otra. Eso es un derecho: algo que no depende de ganar la votación de este año.", calidad: 2 },
            { texto: "Repetir la votación separando las dos propuestas.", consecuencia: "Vuelve a ganar el concierto, ahora 170 a 50. Repetir un procedimiento no cambia la aritmética de fondo.", calidad: 1 },
            { texto: "Que la dirección revoque la votación.", consecuencia: "Se protege a la minoría de este año quitándole a todos la capacidad de decidir. El remedio destruyó lo que venía a proteger.", calidad: 0 },
          ],
        },
      ],
      cierre_bueno:
        "Distinguiste validez de justicia, explicaste por qué hay cosas que no se votan y propusiste cambiar la regla en vez del resultado. Eso es exactamente lo que separa una democracia de una mayoría con micrófono.",
      cierre_regular:
        "Viste que algo no cuadraba, pero el arreglo dependía de volver a ganar una votación. Lo que falta es el paso al límite: qué queda fuera del alcance del voto, y por qué.",
      cierre_malo:
        "La asamblea decidió y la minoría se quedó sin nada, con el procedimiento perfectamente cumplido. El caso existe para mostrar que eso puede pasar sin que nadie haga trampa.",
      pregunta_reflexion:
        "¿Qué decisiones de tu escuela NO deberían poder tomarse por mayoría simple? Da una y explica por qué.",
    },
  },
  {
    uac: "LC-III", progresion: 3, tipo: "clasificar_categorias",
    titulo: "Los tres géneros literarios",
    descripcion: "Clasifica obras reales según su género y reconoce qué las define.",
    xp: 20,
    contenido: {
      instrucciones:
        "El género no lo define el tema ni la extensión, sino la forma en que el texto se dirige al lector: " +
        "alguien cuenta (narrativo), alguien canta lo que siente (lírico) o los personajes hablan sin narrador (dramático).",
      categorias: [
        { nombre: "Narrativo", descripcion: "Un narrador cuenta hechos que le ocurren a unos personajes." },
        { nombre: "Lírico", descripcion: "Una voz expresa un mundo interior; predomina el ritmo y la imagen." },
        { nombre: "Dramático", descripcion: "Escrito para representarse: sólo hay diálogo y acotaciones." },
      ],
      elementos: [
        { texto: "Pedro Páramo, de Juan Rulfo", categoria: "Narrativo", explicacion: "Una novela: hay narradores que cuentan lo que ocurre en Comala, aunque el tiempo esté roto." },
        { texto: "Aura, de Carlos Fuentes", categoria: "Narrativo", explicacion: "Novela corta narrada en segunda persona. El narrador sigue existiendo, aunque te hable de tú." },
        { texto: "\"No oyes ladrar los perros\", de Juan Rulfo", categoria: "Narrativo", explicacion: "Cuento. Tiene mucho diálogo, pero hay un narrador que describe al padre cargando al hijo." },
        { texto: "\"Hombres necios que acusáis\", de Sor Juana Inés de la Cruz", categoria: "Lírico", explicacion: "Redondillas: una voz poética que argumenta y se indigna, en verso y con rima." },
        { texto: "\"Muerte sin fin\", de José Gorostiza", categoria: "Lírico", explicacion: "Poema extenso. La extensión no lo vuelve narrativo: no cuenta una historia, despliega una meditación." },
        { texto: "\"Piedra de sol\", de Octavio Paz", categoria: "Lírico", explicacion: "584 endecasílabos circulares. Hay imágenes y hay tiempo, pero no hay narrador contando hechos." },
        { texto: "El gesticulador, de Rodolfo Usigli", categoria: "Dramático", explicacion: "Obra de teatro: el texto es diálogo más acotaciones, escrito para ser representado." },
        { texto: "Rosalba y los Llaveros, de Emilio Carballido", categoria: "Dramático", explicacion: "Comedia teatral en tres actos; su forma es la lista de personajes y sus parlamentos." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "PM-III", progresion: 4, tipo: "ordenar_secuencia",
    titulo: "Resolver una cuadrática con la fórmula general",
    descripcion: "Ordena el procedimiento completo, desde ordenar la ecuación hasta comprobar.",
    xp: 15,
    contenido: {
      instrucciones:
        "Resuelve 2x² + 3x = 5 con la fórmula general. Acomoda los pasos. " +
        "El error más común no está en la fórmula: está en no haber igualado a cero antes de identificar a, b y c.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Igualar a cero: 2x² + 3x − 5 = 0", marca: "1º", explicacion: "La fórmula general sólo vale para la forma ax² + bx + c = 0. Sin este paso, la c que se identifique será la equivocada." },
        { texto: "Identificar los coeficientes: a = 2, b = 3, c = −5", marca: "2º", explicacion: "El signo va pegado al coeficiente: c es −5, no 5." },
        { texto: "Calcular el discriminante: b² − 4ac = 9 − 4(2)(−5) = 49", marca: "3º", explicacion: "Calcularlo aparte evita el error de signo más frecuente: −4·2·(−5) suma, no resta. Además 49 > 0 anticipa dos raíces reales distintas." },
        { texto: "Sustituir en la fórmula: x = (−3 ± √49) / (2·2) = (−3 ± 7) / 4", marca: "4º", explicacion: "√49 = 7 exacto. Cuando el discriminante es cuadrado perfecto, las raíces salen racionales." },
        { texto: "Separar las dos raíces: x₁ = 1 y x₂ = −2.5", marca: "5º", explicacion: "(−3 + 7)/4 = 1 y (−3 − 7)/4 = −2.5. El ± produce dos soluciones, no una." },
        { texto: "Comprobar: 2(1)² + 3(1) = 5 ✓ y 2(−2.5)² + 3(−2.5) = 12.5 − 7.5 = 5 ✓", marca: "6º", explicacion: "Las dos raíces se sustituyen en la ecuación ORIGINAL, no en la igualada a cero." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },

  // ═══════════════════════ SEMESTRE 4 ═══════════════════════
  {
    uac: "CNEYT-IV", progresion: 1, tipo: "clasificar_categorias",
    titulo: "Tipos de reacción química",
    descripcion: "Clasifica reacciones reales según cómo se reorganizan los átomos.",
    xp: 20,
    contenido: {
      instrucciones:
        "El criterio es qué le pasa a las sustancias: si se juntan, si se parten, si una desplaza a otra o si intercambian partes. " +
        "Fíjate en cuántos reactivos entran y cuántos productos salen.",
      categorias: [
        { nombre: "Síntesis", descripcion: "Dos o más sustancias se combinan en una sola: A + B → AB." },
        { nombre: "Descomposición", descripcion: "Una sustancia se separa en dos o más: AB → A + B." },
        { nombre: "Sustitución simple", descripcion: "Un elemento desplaza a otro de un compuesto: A + BC → AC + B." },
        { nombre: "Doble sustitución", descripcion: "Dos compuestos intercambian iones: AB + CD → AD + CB." },
      ],
      elementos: [
        { texto: "2H₂ + O₂ → 2H₂O", categoria: "Síntesis", explicacion: "Dos elementos entran y sale un solo compuesto." },
        { texto: "CaO + H₂O → Ca(OH)₂", categoria: "Síntesis", explicacion: "El apagado de la cal: dos compuestos forman uno solo. Libera mucho calor." },
        { texto: "2H₂O₂ → 2H₂O + O₂", categoria: "Descomposición", explicacion: "El agua oxigenada se separa sola en agua y oxígeno; por eso burbujea en una herida." },
        { texto: "CaCO₃ → CaO + CO₂ (con calor)", categoria: "Descomposición", explicacion: "La calcinación de la piedra caliza: un compuesto se parte en dos. Es la base de la industria del cemento." },
        { texto: "Zn + 2HCl → ZnCl₂ + H₂", categoria: "Sustitución simple", explicacion: "El zinc desplaza al hidrógeno del ácido. Entra un elemento libre y sale otro elemento libre." },
        { texto: "Fe + CuSO₄ → FeSO₄ + Cu", categoria: "Sustitución simple", explicacion: "El hierro desplaza al cobre; se ve porque el cobre metálico se deposita rojizo sobre el clavo." },
        { texto: "AgNO₃ + NaCl → AgCl↓ + NaNO₃", categoria: "Doble sustitución", explicacion: "Dos compuestos intercambian pareja; el AgCl precipita, que es la señal de que ocurrió." },
        { texto: "HCl + NaOH → NaCl + H₂O", categoria: "Doble sustitución", explicacion: "Una neutralización ácido-base es un caso de doble sustitución: se intercambian y se forma agua." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "CS-III", progresion: 3, tipo: "caso_decision",
    titulo: "El programa de becas del municipio",
    descripcion: "Un caso sobre política pública, actores sociales y juventudes.",
    xp: 25,
    contenido: {
      contexto:
        "Tu municipio anuncia $2 millones para 'apoyar a las juventudes'. Convoca a una mesa con: el regidor de juventud, " +
        "dos empresarios que ofrecen capacitación, una organización de vecinos y tres estudiantes, entre ellos tú. " +
        "Hay tres propuestas sobre la mesa y una sola bolsa de dinero.",
      escenas: [
        {
          situacion: "El regidor propone repartir el dinero en 400 apoyos de $5,000 para material escolar, uno por joven.",
          pregunta: "¿Qué observas de esa propuesta?",
          opciones: [
            { texto: "Que llega a mucha gente pero no cambia nada estructural, y que conviene preguntar qué problema busca resolver.", consecuencia: "Al preguntarlo, se descubre que el problema declarado es el abandono escolar, y el material escolar no es la causa principal: lo es el transporte. Una política pública se evalúa contra el problema que dice resolver, no contra cuánta gente toca.", calidad: 2 },
            { texto: "Que está bien porque beneficia al mayor número de jóvenes.", consecuencia: "Cubrir a más personas es un criterio legítimo y no es el único. Un apoyo que llega a todos y no resuelve nada es una transferencia, no una política.", calidad: 1 },
            { texto: "Que es clientelismo y hay que rechazarla.", consecuencia: "Puede serlo o no, y con esa acusación la mesa se rompe antes de discutir el fondo. Descalificar al actor es más rápido que examinar la propuesta, y deja el problema intacto.", calidad: 0 },
          ],
        },
        {
          situacion: "Los empresarios ofrecen capacitación en oficios a cambio de que el 60 % del dinero pague a sus instructores.",
          pregunta: "¿Cómo lo tratas?",
          opciones: [
            { texto: "Pedir que se transparente cuántos egresados se colocan y en qué condiciones, y condicionar el pago a resultados.", consecuencia: "Aceptan a medias: entregan datos de dos generaciones anteriores con 30 % de colocación. Con eso la mesa puede decidir con información en vez de con promesas. Un actor privado en una política pública no es un problema; que nadie mida lo que entrega, sí.", calidad: 2 },
            { texto: "Rechazarlo porque es dinero público que termina en manos privadas.", consecuencia: "Casi toda política pública contrata a alguien. El criterio útil no es público contra privado, es qué se entrega y quién lo verifica.", calidad: 1 },
            { texto: "Aceptarlo: la capacitación siempre sirve.", consecuencia: "Sin datos de colocación, 'siempre sirve' es una creencia. El 60 % del presupuesto se comprometió sin saber qué compra.", calidad: 0 },
          ],
        },
        {
          situacion: "La organización de vecinos propone rutas de transporte gratuito al plantel, que es lo que pidieron los estudiantes en la consulta.",
          pregunta: "¿Qué haces con la voz estudiantil en la mesa?",
          opciones: [
            { texto: "Presentar los datos de la consulta y pedir que se registre en acta quién votó qué.", consecuencia: "Queda por escrito que los tres estudiantes y los vecinos votaron transporte. El acta es lo que convierte la participación en algo exigible después; sin ella, 'se consultó a los jóvenes' es una foto.", calidad: 2 },
            { texto: "Insistir de viva voz en que eso es lo que quieren los jóvenes.", consecuencia: "Se escucha y no queda registro. Cuando el programa cambie en tres meses, no habrá forma de mostrar qué se había acordado.", calidad: 1 },
            { texto: "Dejar que decidan los adultos, que saben de presupuesto.", consecuencia: "La mesa aprueba el reparto de apoyos individuales. Ser el destinatario de una política y no participar en decidirla es exactamente lo que la progresión pone en cuestión.", calidad: 0 },
          ],
        },
      ],
      cierre_bueno:
        "Evaluaste cada propuesta contra el problema declarado, exigiste datos verificables al actor privado y dejaste la posición estudiantil en acta. Eso es ser agente y no destinatario de una política pública.",
      cierre_regular:
        "Participaste con criterio, pero parte de lo que dijiste no quedó registrado ni medido. Una política sin indicadores y una participación sin acta se evaporan igual de rápido.",
      cierre_malo:
        "Se repartieron $2 millones sin diagnóstico, sin indicadores y sin la voz de a quienes iba dirigido. Es el desenlace más común de las políticas de juventud, y por eso vale la pena volver a intentar el caso.",
      pregunta_reflexion:
        "Busca un programa social real de tu municipio o estado. ¿Qué problema dice resolver y con qué dato se puede saber si lo logra?",
    },
  },
  {
    uac: "PM-IV", progresion: 1, tipo: "ordenar_secuencia",
    titulo: "La ecuación de la recta por dos puntos",
    descripcion: "Ordena el procedimiento para obtener la ecuación de una recta a partir de dos puntos.",
    xp: 15,
    contenido: {
      instrucciones:
        "Encuentra la ecuación de la recta que pasa por A(2, 3) y B(6, 11). Acomoda los pasos en orden.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Nombrar los puntos: (x₁, y₁) = (2, 3) y (x₂, y₂) = (6, 11)", marca: "1º", explicacion: "Fijar cuál es cuál antes de calcular evita el error de signo en la pendiente." },
        { texto: "Calcular la pendiente: m = (11 − 3) / (6 − 2) = 8 / 4 = 2", marca: "2º", explicacion: "m es el cambio en y entre el cambio en x. El orden de resta debe ser el mismo arriba y abajo." },
        { texto: "Sustituir en la forma punto-pendiente: y − 3 = 2(x − 2)", marca: "3º", explicacion: "Se puede usar cualquiera de los dos puntos: la recta es la misma. Aquí se usó A." },
        { texto: "Desarrollar: y − 3 = 2x − 4", marca: "4º", explicacion: "Se distribuye la pendiente sobre el paréntesis." },
        { texto: "Despejar para la forma pendiente-ordenada: y = 2x − 1", marca: "5º", explicacion: "Ahora se lee directo que m = 2 y que corta el eje y en −1." },
        { texto: "Verificar con el otro punto: 2(6) − 1 = 11 ✓", marca: "6º", explicacion: "Comprobar con el punto que NO se usó en el paso 3 es lo que valida el resultado; comprobar con el mismo no prueba nada." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },
  {
    uac: "CH-I", progresion: 1, tipo: "ordenar_secuencia",
    titulo: "Ordena los procesos históricos de México",
    descripcion: "Coloca en orden cronológico ocho procesos que se estudian todo el bachillerato.",
    xp: 15,
    contenido: {
      instrucciones:
        "Ordena del más antiguo al más reciente. No se trata de memorizar fechas sueltas: " +
        "se trata de tener una línea del tiempo mental donde colocar cualquier hecho nuevo que encuentres.",
      criterio: "cronologia",
      pasos: [
        { texto: "Auge de Teotihuacán como la mayor ciudad de Mesoamérica", marca: "s. I–VII", explicacion: "Llegó a unos 125 000 habitantes. Ya estaba en ruinas ocho siglos antes de la llegada de los españoles." },
        { texto: "Fundación de México-Tenochtitlan", marca: "1325", explicacion: "La fecha tradicional. Sitúa el inicio del periodo mexica, muy posterior al esplendor teotihuacano." },
        { texto: "Caída de Tenochtitlan e inicio del virreinato", marca: "1521", explicacion: "Marca el paso del periodo posclásico al virreinal: tres siglos de Nueva España." },
        { texto: "Inicio de la guerra de Independencia", marca: "1810", explicacion: "Casi 300 años después de 1521. Ese hueco es lo que más se subestima al ordenar la historia de México." },
        { texto: "Promulgación de la Constitución de 1857 y Guerra de Reforma", marca: "1857–1861", explicacion: "Las Leyes de Reforma separan Iglesia y Estado; es el conflicto que define el México liberal." },
        { texto: "Inicio de la Revolución Mexicana", marca: "1910", explicacion: "Poco más de medio siglo después de la Reforma, y un siglo después de la Independencia." },
        { texto: "Expropiación petrolera", marca: "1938", explicacion: "Cárdenas nacionaliza la industria: uno de los hechos fundadores del Estado posrevolucionario." },
        { texto: "Movimiento estudiantil y matanza de Tlatelolco", marca: "1968", explicacion: "Treinta años después de la expropiación. Es el parteaguas del siglo XX mexicano y el más cercano a la memoria viva." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "IN-IV", progresion: 4, tipo: "clasificar_categorias",
    titulo: "Advice, plans or past?",
    descripcion: "Clasifica expresiones en inglés según su función comunicativa.",
    xp: 20,
    contenido: {
      instrucciones:
        "Las tres funciones usan estructuras distintas y se confunden todo el tiempo. " +
        "Fíjate en el verbo auxiliar: es la pista que dice qué está haciendo la oración.",
      categorias: [
        { nombre: "Giving advice", descripcion: "Recomendar algo: should, ought to, why don't you." },
        { nombre: "Talking about plans", descripcion: "Intenciones y planes: going to, will, planning to." },
        { nombre: "Talking about the past", descripcion: "Lo que ya ocurrió: past simple, used to." },
      ],
      elementos: [
        { texto: "You should drink more water before the game.", categoria: "Giving advice", explicacion: "'should' es la forma más común de aconsejar sin ordenar." },
        { texto: "Why don't you talk to your teacher about it?", categoria: "Giving advice", explicacion: "Es una pregunta en la forma y un consejo en la función: la estructura no siempre delata la intención." },
        { texto: "You ought to see a doctor if the pain continues.", categoria: "Giving advice", explicacion: "'ought to' equivale a 'should' con un matiz un poco más formal." },
        { texto: "I'm going to study medicine after high school.", categoria: "Talking about plans", explicacion: "'going to' expresa una intención ya decidida, no una predicción." },
        { texto: "We are planning to visit Guanajuato next December.", categoria: "Talking about plans", explicacion: "'planning to' hace explícito el plan." },
        { texto: "I think I will call her tonight.", categoria: "Talking about plans", explicacion: "'will' con 'I think' expresa una decisión que se toma en el momento de hablar." },
        { texto: "I studied English for three years in secundaria.", categoria: "Talking about the past", explicacion: "Past simple con un periodo terminado: la acción está cerrada." },
        { texto: "We used to live in Zinacantepec when I was a child.", categoria: "Talking about the past", explicacion: "'used to' marca un hábito pasado que ya no ocurre." },
        { texto: "She didn't come to the meeting yesterday.", categoria: "Talking about the past", explicacion: "'didn't' es el auxiliar del past simple en negativo; 'yesterday' cierra el periodo." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },

  // ═══════════════════════ SEMESTRE 5 ═══════════════════════
  {
    uac: "CNEYT-V", progresion: 1, tipo: "clasificar_categorias",
    titulo: "¿Escalar o vectorial?",
    descripcion: "Clasifica magnitudes físicas según necesiten o no una dirección para quedar definidas.",
    xp: 20,
    contenido: {
      instrucciones:
        "La prueba es sencilla: si decir sólo el número y la unidad deja la información completa, es escalar. " +
        "Si hace falta decir además hacia dónde, es vectorial. Esta distinción es la que hace que la física funcione.",
      categorias: [
        { nombre: "Escalar", descripcion: "Queda definida con magnitud y unidad. No necesita dirección." },
        { nombre: "Vectorial", descripcion: "Necesita magnitud, dirección y sentido." },
      ],
      elementos: [
        { texto: "Masa de 70 kg", categoria: "Escalar", explicacion: "70 kg es 70 kg hacia donde sea. La masa no tiene dirección." },
        { texto: "Temperatura de 22 °C", categoria: "Escalar", explicacion: "No existe '22 °C hacia el norte'." },
        { texto: "Rapidez de 80 km/h", categoria: "Escalar", explicacion: "La rapidez es sólo el número que marca el velocímetro; no dice hacia dónde va el auto." },
        { texto: "Tiempo de 3 s", categoria: "Escalar", explicacion: "El tiempo transcurrido es un escalar aunque tenga sentido de avance." },
        { texto: "Energía cinética de 500 J", categoria: "Escalar", explicacion: "La energía no tiene dirección, aunque se calcule a partir de una velocidad que sí la tiene." },
        { texto: "Velocidad de 80 km/h hacia el norte", categoria: "Vectorial", explicacion: "Rapidez más dirección. Ésta es la diferencia exacta entre rapidez y velocidad." },
        { texto: "Peso de 686 N hacia el centro de la Tierra", categoria: "Vectorial", explicacion: "El peso es una fuerza y las fuerzas siempre son vectoriales; por eso el peso cambia en la Luna y la masa no." },
        { texto: "Desplazamiento de 5 m al este", categoria: "Vectorial", explicacion: "El desplazamiento va del punto inicial al final en línea recta. La distancia recorrida, en cambio, es escalar." },
        { texto: "Aceleración de 9.8 m/s² hacia abajo", categoria: "Vectorial", explicacion: "La aceleración es un cambio de velocidad, que es vectorial: hereda la dirección." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "CH-II", progresion: 4, tipo: "caso_decision",
    titulo: "El nombre de la calle",
    descripcion: "Un caso sobre memoria histórica y el vínculo ético con los sujetos del pasado.",
    xp: 25,
    contenido: {
      contexto:
        "En tu colonia hay una calle con el nombre de un hacendado del siglo XIX que donó el terreno de la escuela. " +
        "Un grupo de vecinos documenta en el Archivo General de la Nación que ese mismo hacendado mantuvo trabajadores endeudados en condiciones de servidumbre. " +
        "Proponen cambiarle el nombre. Otros vecinos se oponen: 'gracias a él existe la escuela'.",
      escenas: [
        {
          situacion: "Los dos hechos están documentados y son ciertos a la vez.",
          pregunta: "¿Cómo lo planteas en la asamblea vecinal?",
          opciones: [
            { texto: "Que las dos cosas son verdad y que la pregunta no es cómo era él, sino qué decidimos honrar hoy.", consecuencia: "Es el desplazamiento que ordena toda la discusión. Poner el nombre de alguien en una calle no es un juicio histórico: es una decisión del presente sobre a quién se pone de ejemplo. Separar las dos preguntas permite discutir sin negar ningún hecho.", calidad: 2 },
            { texto: "Que hay que juzgarlo con los valores de su época, no con los nuestros.", consecuencia: "Es un principio real del oficio histórico y aquí se usa mal: sirve para EXPLICAR por qué actuó así, no para decidir a quién honra el municipio hoy. Además, había contemporáneos suyos que denunciaban esas prácticas.", calidad: 1 },
            { texto: "Que fue un explotador y no hay nada más que discutir.", consecuencia: "La asamblea se parte en dos y la propuesta se cae. Cerrar la complejidad de un sujeto histórico en una etiqueta hace imposible la conversación que se buscaba.", calidad: 0 },
          ],
        },
        {
          situacion: "Una vecina mayor dice que su abuelo trabajó en esa hacienda y que no quiere que se hable mal de él.",
          pregunta: "¿Qué haces con ese testimonio?",
          opciones: [
            { texto: "Recogerlo: es una fuente oral que forma parte del expediente, no un obstáculo para la investigación.", consecuencia: "Su testimonio agrega lo que los documentos del archivo no tienen: cómo se vivía ahí. Además cambia la propuesta —el grupo decide documentar también a los trabajadores— y ella termina apoyándola.", calidad: 2 },
            { texto: "Explicarle con datos que su abuelo fue una víctima del sistema.", consecuencia: "Los datos son correctos y la conversación se cierra: nadie acepta que le reinterpreten a su familia. Tener razón y ser escuchado son cosas distintas.", calidad: 1 },
            { texto: "No tomarlo en cuenta: es un recuerdo, no una fuente.", consecuencia: "Se descarta la única voz que conoció el lugar. La historia oral es una fuente con sus propias reglas de crítica, no un adorno sentimental.", calidad: 0 },
          ],
        },
        {
          situacion: "Hay que llevar una propuesta concreta al ayuntamiento.",
          pregunta: "¿Cuál propones?",
          opciones: [
            { texto: "Conservar el nombre y colocar una placa que documente ambos hechos, con las referencias del archivo.", consecuencia: "Se aprueba. La calle deja de ser un homenaje mudo y se vuelve un documento que se lee al pasar. Borrar un nombre borra también la posibilidad de explicar por qué estaba ahí.", calidad: 2 },
            { texto: "Cambiar el nombre por el de una trabajadora de la hacienda documentada en el archivo.", consecuencia: "Se aprueba por poco y queda una parte de la colonia molesta. Es una decisión defendible: honra a quien no fue honrado. Lo que se pierde es la explicación de cómo llegó el otro nombre ahí.", calidad: 1 },
            { texto: "Dejar todo como está para no dividir a la colonia.", consecuencia: "La calle sigue siendo un homenaje que nadie decidió y que ya nadie puede explicar. Evitar el conflicto también es una decisión sobre qué se recuerda.", calidad: 0 },
          ],
        },
      ],
      cierre_bueno:
        "Separaste el juicio histórico de la decisión presente, trataste el testimonio como fuente y propusiste algo que documenta en vez de borrar. Ése es el vínculo ético con los sujetos históricos: ni absolverlos ni cancelarlos, sino hacerse cargo de lo que sabemos de ellos.",
      cierre_regular:
        "Tomaste en serio los hechos y la decisión resultante dejó fuera a una parte de la colonia o una parte de la historia. No es un fracaso: es lo que pasa cuando el pasado se discute de verdad.",
      cierre_malo:
        "El nombre siguió ahí sin que nadie sepa por qué, y la investigación del archivo no llegó a ninguna parte. La memoria que no se decide, se hereda.",
      pregunta_reflexion:
        "Piensa en una calle, escuela o monumento de tu comunidad. ¿Sabes por qué se llama así? ¿Quién lo decidió y cuándo?",
    },
  },
  {
    uac: "PM-V", progresion: 7, tipo: "ordenar_secuencia",
    titulo: "Resolver un problema de optimización",
    descripcion: "Ordena el método completo para maximizar un área con la derivada.",
    xp: 15,
    contenido: {
      instrucciones:
        "Tienes 100 m de malla para cercar un terreno rectangular aprovechando un muro que ya existe en un lado. " +
        "¿Qué dimensiones dan el área máxima? Acomoda los pasos del método.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Nombrar las variables: x = lado perpendicular al muro, y = lado paralelo al muro", marca: "1º", explicacion: "Sin variables nombradas no hay ecuación. Un dibujo con literales ahorra la mitad de los errores." },
        { texto: "Escribir la restricción: 2x + y = 100 (el muro cubre un lado)", marca: "2º", explicacion: "La malla sólo cubre tres lados. Confundir esto con 2x + 2y = 100 es el error clásico de este problema." },
        { texto: "Escribir la función a optimizar: A = x·y", marca: "3º", explicacion: "El área es lo que se quiere maximizar; todavía tiene dos variables." },
        { texto: "Sustituir para dejar una sola variable: A(x) = x(100 − 2x) = 100x − 2x²", marca: "4º", explicacion: "Se despeja y de la restricción y se mete en el área. Derivar sólo tiene sentido con una variable." },
        { texto: "Derivar e igualar a cero: A'(x) = 100 − 4x = 0 → x = 25", marca: "5º", explicacion: "El máximo está donde la razón de cambio se anula: la pendiente de la curva es cero en la cima." },
        { texto: "Verificar que es máximo: A''(x) = −4 < 0", marca: "6º", explicacion: "La segunda derivada negativa confirma que es máximo y no mínimo. Sin este paso, el punto crítico podría ser cualquiera de los dos." },
        { texto: "Responder con las dimensiones: x = 25 m, y = 50 m, área = 1 250 m²", marca: "7º", explicacion: "Se regresa a la pregunta original con unidades. Un número sin interpretar no es una respuesta." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },
  {
    uac: "IN-V", progresion: 6, tipo: "ordenar_secuencia",
    titulo: "Order the formal email",
    descripcion: "Ordena las partes de un correo formal en inglés para solicitar algo.",
    xp: 15,
    contenido: {
      instrucciones:
        "Vas a escribir a la coordinadora de un programa de intercambio para pedir información. " +
        "Ordena las partes del correo: en inglés formal el orden es tan convencional como en español, y saltárselo se nota.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Subject: Information request – Summer Exchange Program 2027", marca: "Subject", explicacion: "El asunto va primero y dice de qué trata en una línea. Un correo sin asunto claro se abre tarde o no se abre." },
        { texto: "Dear Ms. Rivera,", marca: "Greeting", explicacion: "Saludo formal con apellido. 'Hi' o el nombre de pila no corresponden a un primer contacto institucional." },
        { texto: "I am a third-year student at CEN Bachillerato and I am writing to ask about the summer exchange program.", marca: "Opening", explicacion: "Quién eres y por qué escribes, en una sola oración. 'I am writing to' es la fórmula estándar." },
        { texto: "I would like to know the application deadline, the language requirements, and whether scholarships are available.", marca: "Body", explicacion: "Las preguntas concretas, enumeradas. Un correo con una pregunta vaga recibe una respuesta vaga." },
        { texto: "I would be grateful if you could send me any additional information about the process.", marca: "Request", explicacion: "'I would be grateful if you could' es la petición cortés formal; más suave que 'please send me'." },
        { texto: "Thank you for your time and attention.", marca: "Closing", explicacion: "El agradecimiento cierra el cuerpo antes de la despedida." },
        { texto: "Sincerely,\nDaniela Ramírez", marca: "Sign-off", explicacion: "'Sincerely' es la despedida formal estándar cuando se conoce el nombre del destinatario, seguida del nombre completo." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },

  // ═══════════════════════ SEMESTRE 6 ═══════════════════════
  {
    uac: "CNEYT-VI", progresion: 5, tipo: "ordenar_secuencia",
    titulo: "Las fases de la mitosis",
    descripcion: "Ordena las etapas de la división celular por lo que ocurre con los cromosomas.",
    xp: 15,
    contenido: {
      instrucciones:
        "Ordena las fases siguiendo qué le pasa al material genético. " +
        "La pista no es el nombre: es dónde están los cromosomas y qué hace el huso.",
      criterio: "procedimiento",
      pasos: [
        { texto: "El ADN se duplica; la célula crece y prepara los organelos. Los cromosomas aún no se ven al microscopio.", marca: "Interfase", explicacion: "Ocupa el 90 % del ciclo celular. No es parte de la mitosis en sentido estricto, pero sin la duplicación previa no habría nada que repartir." },
        { texto: "La cromatina se condensa en cromosomas visibles, desaparece la envoltura nuclear y se forma el huso.", marca: "Profase", explicacion: "Los cromosomas ya duplicados se hacen visibles como dos cromátidas unidas por el centrómero." },
        { texto: "Los cromosomas se alinean en el plano ecuatorial de la célula, unidos al huso por el centrómero.", marca: "Metafase", explicacion: "La alineación en el ecuador es lo que garantiza un reparto exacto. Es la fase que se usa para hacer cariotipos." },
        { texto: "Las cromátidas hermanas se separan y viajan a polos opuestos.", marca: "Anafase", explicacion: "Aquí ocurre el reparto propiamente dicho. Un error en esta fase produce aneuploidías, como la trisomía 21." },
        { texto: "Se reconstruye la envoltura nuclear alrededor de cada grupo y los cromosomas se descondensan.", marca: "Telofase", explicacion: "Ya hay dos núcleos, pero todavía una sola célula." },
        { texto: "El citoplasma se divide y quedan dos células hijas idénticas a la original.", marca: "Citocinesis", explicacion: "Es un proceso separado de la mitosis: en animales se estrangula la membrana, en plantas se forma una placa celular." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },
  {
    uac: "PM-VI", progresion: 7, tipo: "ordenar_secuencia",
    titulo: "Los pasos de un estudio estadístico",
    descripcion: "Ordena el método completo, desde la pregunta hasta la conclusión.",
    xp: 15,
    contenido: {
      instrucciones:
        "Quieres saber cuántas horas duermen los alumnos de tu plantel entre semana. " +
        "Acomoda los pasos del estudio: el orden importa porque cada uno condiciona lo que se puede concluir al final.",
      criterio: "procedimiento",
      pasos: [
        { texto: "Formular la pregunta y definir la población: los 1 200 alumnos inscritos en el plantel.", marca: "1º", explicacion: "Definir la población antes de muestrear es lo que permite decir después a quién se refieren los resultados." },
        { texto: "Elegir el método de muestreo: aleatorio estratificado por turno y semestre, n = 120.", marca: "2º", explicacion: "El estrato asegura que los dos turnos queden representados; preguntar sólo en el matutino daría otro resultado y no se sabría por qué." },
        { texto: "Diseñar y probar el instrumento con 10 alumnos antes de aplicarlo.", marca: "3º", explicacion: "La prueba piloto detecta preguntas ambiguas. '¿Cuántas horas duermes?' sin decir 'entre semana' devuelve datos que mezclan dos cosas." },
        { texto: "Aplicar el instrumento y registrar los datos.", marca: "4º", explicacion: "La recolección propiamente dicha. Registrar también las no respuestas: quién no contestó es un dato." },
        { texto: "Calcular medidas de tendencia central y de dispersión: media, mediana y desviación estándar.", marca: "5º", explicacion: "La media sola engaña; la desviación dice si el grupo es homogéneo o si hay dos grupos muy distintos dentro." },
        { texto: "Representar los datos con un histograma y un diagrama de caja.", marca: "6º", explicacion: "La representación revela lo que los números resumen: si la distribución es simétrica, sesgada o tiene valores atípicos." },
        { texto: "Interpretar y concluir, señalando el margen de error y los límites del estudio.", marca: "7º", explicacion: "Decir hasta dónde alcanza la conclusión es parte de la conclusión. Un resultado sin margen de error se lee como una certeza que no se tiene." },
      ],
      puntaje_minimo_aprobacion: 80,
    },
  },
  {
    uac: "CH-III", progresion: 1, tipo: "clasificar_categorias",
    titulo: "¿Fuente primaria o secundaria?",
    descripcion: "Clasifica fuentes históricas reales y reconoce que depende de qué se investiga.",
    xp: 20,
    contenido: {
      instrucciones:
        "Una fuente es primaria si se produjo en el momento y el contexto que se estudia; secundaria si alguien la elaboró después a partir de otras. " +
        "Ojo: la misma fuente puede cambiar de categoría según la pregunta de investigación.",
      categorias: [
        { nombre: "Fuente primaria", descripcion: "Se produjo en el momento y contexto estudiado." },
        { nombre: "Fuente secundaria", descripcion: "Elaborada después, a partir de fuentes primarias." },
      ],
      elementos: [
        { texto: "El acta de la sesión del Congreso Constituyente de 1917", categoria: "Fuente primaria", explicacion: "Se produjo en el acto mismo que se estudia. Es el registro directo del debate." },
        { texto: "Una fotografía de Agustín Víctor Casasola tomada en 1913", categoria: "Fuente primaria", explicacion: "Documento visual producido durante la Revolución. Primaria no significa objetiva: el encuadre ya es una decisión." },
        { texto: "El diario personal de un soldado villista", categoria: "Fuente primaria", explicacion: "Testimonio directo de un participante, con toda su parcialidad." },
        { texto: "El Códice Mendoza", categoria: "Fuente primaria", explicacion: "Elaborado hacia 1541 por tlacuilos mexicas para la Corona: primario para estudiar el México del siglo XVI." },
        { texto: "Un corrido de 1915 sobre la toma de Zacatecas", categoria: "Fuente primaria", explicacion: "Se compuso en el periodo. Es fuente para saber qué se cantaba y cómo se narraba el hecho, no necesariamente cómo ocurrió." },
        { texto: "El libro La Revolución interrumpida, de Adolfo Gilly (1971)", categoria: "Fuente secundaria", explicacion: "Una interpretación construida décadas después a partir de fuentes primarias." },
        { texto: "Un documental del INAH sobre Teotihuacán", categoria: "Fuente secundaria", explicacion: "Elabora y divulga el trabajo arqueológico; no es un producto de la época teotihuacana." },
        { texto: "Tu libro de texto de Conciencia Histórica", categoria: "Fuente secundaria", explicacion: "Es una síntesis escrita hoy a partir de investigaciones previas. Sería primaria si alguien estudiara cómo se enseñaba historia en 2026." },
        { texto: "Un artículo de historiadora publicado en 2024 sobre el movimiento del 68", categoria: "Fuente secundaria", explicacion: "Investigación posterior. Los volantes y los periódicos de 1968 que cita, ésos sí son primarios." },
      ],
      puntaje_minimo_aprobacion: 70,
    },
  },
  {
    uac: "CD-III", progresion: 4, tipo: "caso_decision",
    titulo: "Lo que se publica queda",
    descripcion: "Un caso sobre identidad digital, brecha de género y huella permanente.",
    xp: 25,
    contenido: {
      contexto:
        "Tu equipo administra la cuenta del plantel donde se difunden los proyectos de sexto semestre. " +
        "Tiene 4 000 seguidores. Van a publicar el video del proyecto de robótica del grupo, en el que tres de los cinco integrantes son mujeres, " +
        "pero en la edición sólo aparecen los dos hombres explicando el prototipo.",
      escenas: [
        {
          situacion: "El video ya está editado y hay que subirlo hoy para el concurso.",
          pregunta: "¿Qué haces?",
          opciones: [
            { texto: "Retrasarlo un día y reeditar para incluir a quienes hicieron la programación y el diseño.", consecuencia: "Se sube un día tarde y entra al concurso igual. Quien no aparece explicando, no aparece como autora: en un video de divulgación, quién habla es quién queda registrado como quien sabe.", calidad: 2 },
            { texto: "Subirlo y agregar los nombres de todas en la descripción.", consecuencia: "Mejor que nada, y casi nadie lee la descripción. La imagen pesa más que el pie de foto, y eso también es un dato que la progresión pide analizar.", calidad: 1 },
            { texto: "Subirlo como está: lo importante es el prototipo, no quién sale.", consecuencia: "El video acumula 12 000 vistas mostrando la robótica como cosa de dos muchachos. No hubo intención de excluir a nadie, y el efecto es el mismo que si la hubiera habido.", calidad: 0 },
          ],
        },
        {
          situacion: "En los comentarios aparece uno que dice, sobre una de las integrantes: 'seguro sólo la pusieron para la foto'.",
          pregunta: "¿Qué haces con ese comentario?",
          opciones: [
            { texto: "Responder desde la cuenta con lo que hizo ella en el proyecto, y guardar captura antes de ocultarlo si escala.", consecuencia: "Responder con el dato desarma el comentario delante de los mismos 4 000 que lo leyeron. La captura importa: si escala a acoso, el registro es lo que permite actuar.", calidad: 2 },
            { texto: "Borrarlo de inmediato.", consecuencia: "Se protege a la compañera y se pierde tanto la corrección pública como la evidencia. Borrar es a veces necesario; hacerlo sin registrar deja al afectado sin nada si el asunto crece.", calidad: 1 },
            { texto: "Ignorarlo: contestar le da importancia.", consecuencia: "El comentario se queda como la última palabra visible. En una cuenta institucional, el silencio se lee como que a la institución le da igual.", calidad: 0 },
          ],
        },
        {
          situacion: "Un mes después, una de las integrantes pide que se baje el video: la etiquetaron en otra cuenta y le llegan mensajes.",
          pregunta: "¿Qué haces?",
          opciones: [
            { texto: "Bajarlo a petición suya, avisar al comité y revisar qué publica el plantel de sus alumnos y con qué permiso.", consecuencia: "Se baja el mismo día. Lo que ya se descargó no se puede recuperar —esa parte es irreversible— pero se corta el flujo y se corrige la política para lo siguiente. Sobre la propia imagen decide la persona, no el equipo de la cuenta.", calidad: 2 },
            { texto: "Ponerlo en privado y esperar a ver si se calma.", consecuencia: "Frena la difusión y deja la decisión en manos del equipo, no de ella. Es una media medida que además no revisa por qué pasó.", calidad: 1 },
            { texto: "Explicarle que el video es del plantel y que ya ganó el concurso.", consecuencia: "El video se queda y ella deja de participar en los proyectos del siguiente semestre. Que un contenido sea institucional no lo vuelve independiente de las personas que aparecen en él.", calidad: 0 },
          ],
        },
      ],
      cierre_bueno:
        "Corregiste la autoría antes de publicar, defendiste con datos en el espacio público y respetaste la decisión de ella sobre su propia imagen. Administrar una cuenta institucional es eso: cada publicación deja huella en la vida de alguien.",
      cierre_regular:
        "Reaccionaste a los problemas conforme aparecían, y varios se pudieron haber evitado antes de darle a publicar. La diferencia entre moderar y prevenir es todo el trabajo.",
      cierre_malo:
        "Quedó un video que borra a tres autoras, un comentario sin respuesta y una compañera que ya no quiere participar. Ninguna decisión fue malintencionada: todas fueron por cumplir la fecha. Eso es lo que hace que valga la pena repetir el caso.",
      pregunta_reflexion:
        "Busca la última publicación en la que apareces sin haberla subido tú. ¿Quién decidió publicarla y te preguntaron?",
    },
  },
];

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: uacs } = await sb.from("uac").select("id, codigo, nombre");
  const { data: progs } = await sb.from("progresiones").select("id, codigo, numero, uac_id");

  const acts: Array<{ codigo: string; progresion_id: string | null }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades").select("codigo, progresion_id").order("codigo").range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...data);
    if (data.length < 1000) break;
  }

  const filas: Array<Record<string, unknown>> = [];
  const problemas: string[] = [];

  for (const o of OBRA) {
    const uac = (uacs ?? []).find((u) => u.codigo === o.uac);
    if (!uac) { problemas.push(`${o.uac}: UAC no encontrada`); continue; }
    const prog = (progs ?? []).find((p) => p.uac_id === uac.id && p.numero === o.progresion);
    if (!prog) { problemas.push(`${o.uac} P${o.progresion}: progresión no encontrada`); continue; }

    const v = validarContenidoActividad(o.tipo, o.contenido);
    if (!v.success) {
      problemas.push(`${o.uac} P${o.progresion} (${o.tipo}): ${JSON.stringify(v.error).slice(0, 220)}`);
      continue;
    }

    let max = 0;
    for (const a of acts) {
      const m = new RegExp(`^${prog.codigo}-A(\\d+)$`).exec(a.codigo);
      if (m) max = Math.max(max, Number(m[1]));
    }
    const yaApartados = filas.filter((f) => f.progresion_id === prog.id).length;
    const codigo = `${prog.codigo}-A${max + 1 + yaApartados}`;
    if (acts.some((a) => a.codigo === codigo)) { problemas.push(`${codigo}: ya existe`); continue; }

    filas.push({
      codigo,
      titulo: o.titulo,
      descripcion: o.descripcion,
      tipo: o.tipo,
      tipo_codigo: o.tipo,
      contenido: o.contenido,
      progresion_id: prog.id,
      xp: o.xp,
      estado: "publicada",
    });
  }

  const porTipo = filas.reduce<Record<string, number>>((m, f) => {
    m[String(f.tipo)] = (m[String(f.tipo)] ?? 0) + 1; return m;
  }, {});
  console.log(`\nListas ${filas.length} de ${OBRA.length} ${JSON.stringify(porTipo)}`);
  for (const p of problemas) console.log(`  PROBLEMA ${p}`);
  if (DRY) {
    for (const f of filas) console.log(`  ${f.codigo}  ${f.tipo}  ${f.titulo}`);
    console.log("  (DRY: no se escribió nada)");
    return;
  }
  if (problemas.length) { console.log("\nNo se escribe nada mientras haya problemas."); process.exit(1); }

  const { error } = await sb.from("actividades").insert(filas as never);
  if (error) throw new Error(error.message);
  console.log(`\ninsertadas ${filas.length}`);
  console.log("RECUERDA: sube CATALOG_CACHE_VERSION en src/lib/catalog-cache.ts.");
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });
