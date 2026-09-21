/**
 * Datos del laboratorio «Mis derechos en el mundo digital» (CD-I-P05).
 *
 * Qué es verbatim de la progresión y qué se escribió aquí:
 *  · VERBATIM: la lectura A1 (marco teórico y preguntas de comprensión), el
 *    reto A2 —con un reactivo actualizado, ver NOTA_REACTIVO_3—, la consigna y
 *    los criterios de la reflexión A3, los hechos verdadero/falso A4, el
 *    glosario A5 y el texto con huecos A6.
 *  · ILUSTRATIVO (escrito para este laboratorio): los cuatro casos, las ocho
 *    solicitudes ARCO y el aviso de privacidad de «Tareas Exprés». Ninguna
 *    persona, empresa, escuela o aplicación es real.
 *  · NORMATIVO (verificado): todos los artículos citados son de la Ley Federal
 *    de Protección de Datos Personales en Posesión de los Particulares
 *    publicada en el DOF el 20 de marzo de 2025 (última reforma DOF
 *    14/11/2025), que abrogó la de 2010. Esa ley llama «Secretaría» a la
 *    Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV); el INAI, que
 *    la lectura A1 todavía nombra, se extinguió.
 *
 * Sin React ni three: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — El expediente: cuatro casos, tres decisiones cada uno
 *
 * La trampa de este tema es quedarse en el cartel de buenas intenciones
 * («tengo derecho a la privacidad»). Aquí cada caso obliga a tres cosas
 * distintas: nombrar el derecho o principio en juego, elegir el mecanismo que
 * procede —con su vía y su plazo— y formular el deber que ese mismo derecho
 * impone del otro lado.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface OpcionCaso {
  id: string;
  texto: string;
  ok: boolean;
  porque: string;
}

export interface PasoCaso {
  rotulo: string;
  pregunta: string;
  opciones: OpcionCaso[];
}

export interface CasoDigital {
  id: string;
  titulo: string;
  icono: string;
  escena: string;
  pasos: PasoCaso[];
}

export const CASOS: CasoDigital[] = [
  {
    id: "foto",
    titulo: "La foto en el anuncio",
    icono: "fa-camera",
    escena:
      "Marina tomó un curso de verano en una academia de robótica. Un mes después ve su cara en el anuncio con el que la academia promociona los cursos del próximo año en redes sociales. Nadie le pidió permiso ni le explicó jamás para qué usarían las fotos.",
    pasos: [
      {
        rotulo: "¿Qué está en juego?",
        pregunta: "¿Qué derecho de Marina está en juego?",
        opciones: [
          {
            id: "a",
            texto: "La protección de sus datos personales: una fotografía que permite identificarla es un dato personal.",
            ok: true,
            porque:
              "Correcto. La ley define dato personal como «cualquier información concerniente a una persona identificada o identificable» (LFPDPPP, art. 2, fr. V). Su cara la identifica, así que su imagen es un dato personal y la academia es la responsable de tratarlo.",
          },
          {
            id: "b",
            texto: "Su derecho de acceso a internet, porque el anuncio está publicado en línea.",
            ok: false,
            porque:
              "No. Que algo ocurra en internet no convierte el caso en un problema de acceso a la red. El acceso a internet es la posibilidad de conectarse; aquí el problema es el uso que se hace de su imagen.",
          },
          {
            id: "c",
            texto: "Ninguno: la fotografía la tomó la academia, así que la fotografía es suya.",
            ok: false,
            porque:
              "No. La propiedad de la fotografía y los derechos sobre los datos personales que aparecen en ella son cosas distintas. Aunque la academia tomó la foto, Marina sigue siendo la persona titular de sus datos y puede ejercer sus derechos ARCO (art. 21).",
          },
          {
            id: "d",
            texto: "La libertad de expresión de la academia, que puede publicar lo que quiera.",
            ok: false,
            porque:
              "No. La libertad de expresión no autoriza a usar los datos personales de otra persona con fines comerciales sin informarle y sin su consentimiento.",
          },
        ],
      },
      {
        rotulo: "¿Qué se puede hacer?",
        pregunta: "¿Qué le conviene hacer a Marina, y ante quién?",
        opciones: [
          {
            id: "a",
            texto:
              "Presentar a la academia una solicitud ARCO: oposición para que deje de usar su imagen y cancelación para que la retire de sus archivos.",
            ok: true,
            porque:
              "Correcto. La oposición sirve para que cese un tratamiento que le causa un perjuicio (art. 26) y la cancelación, para que el dato deje de estar en posesión del responsable (art. 24). La solicitud se presenta ante la propia academia, que tiene veinte días hábiles para responder y quince más para hacerla efectiva (art. 31). El trámite es gratuito (art. 34).",
          },
          {
            id: "b",
            texto: "Nada: una vez publicada una fotografía ya no hay forma de reclamar.",
            ok: false,
            porque:
              "Falso, y es la creencia que más derechos hace perder. La ley obliga a todo responsable a atender las solicitudes ARCO y a designar a una persona o departamento que les dé trámite (art. 29).",
          },
          {
            id: "c",
            texto: "Denunciar penalmente a quienes le dieron «me gusta» al anuncio.",
            ok: false,
            porque:
              "No. Quien responde es el responsable del tratamiento —la academia—, no las personas que vieron la publicación.",
          },
          {
            id: "d",
            texto: "Pedir a la academia que publique también su nombre completo, para que quede claro quién es.",
            ok: false,
            porque:
              "Al contrario: eso añadiría más datos personales al tratamiento en lugar de detenerlo.",
          },
        ],
      },
      {
        rotulo: "El mismo derecho, del otro lado",
        pregunta: "Si Marina tiene derecho sobre su imagen, ¿qué deber te toca a ti?",
        opciones: [
          {
            id: "a",
            texto: "No publicar la fotografía de otra persona sin su permiso, aunque sea una foto de grupo o de una fiesta.",
            ok: true,
            porque:
              "Ese es el otro lado del derecho. Tu derecho a la propia imagen es, visto desde fuera, el deber de no disponer de la imagen ajena. Ningún derecho digital funciona si solo lo reclamas para ti.",
          },
          {
            id: "b",
            texto: "No subir ninguna fotografía tuya a ninguna red.",
            ok: false,
            porque:
              "No se trata de desaparecer. El derecho es a decidir, no a esconderse: puedes publicar lo tuyo; lo que no puedes es decidir por otra persona.",
          },
          {
            id: "c",
            texto: "Ninguno: los deberes son de las empresas, no de las personas.",
            ok: false,
            porque:
              "No. Cuando publicas datos de otra persona ocupas exactamente el lugar de quien decide sobre ellos; el deber es el mismo aunque no seas una empresa.",
          },
          {
            id: "d",
            texto: "Avisar a la academia cada vez que subas una fotografía.",
            ok: false,
            porque: "No existe tal obligación. El deber que corresponde a este derecho es pedir permiso a quien aparece en la foto.",
          },
        ],
      },
    ],
  },
  {
    id: "permisos",
    titulo: "La app que pide la agenda entera",
    icono: "fa-mobile-screen",
    escena:
      "Una aplicación gratuita para organizar horarios escolares pide, al instalarse, acceso a todos tus contactos, a tu micrófono y a tus fotos. Para armar un horario solo necesita las materias y las horas.",
    pasos: [
      {
        rotulo: "¿Qué está en juego?",
        pregunta: "¿Qué principio de la ley se está rompiendo?",
        opciones: [
          {
            id: "a",
            texto: "El de proporcionalidad: solo deben tratarse los datos necesarios, adecuados y relevantes para la finalidad.",
            ok: true,
            porque:
              "Correcto. Es uno de los ocho principios que enumera el art. 5 y el art. 12 lo desarrolla: el tratamiento «será el que resulte necesario, adecuado y relevante en relación con las finalidades previstas en el aviso de privacidad». Un horario no necesita tu agenda ni tu micrófono.",
          },
          {
            id: "b",
            texto: "El derecho al olvido, porque la app guardará esos datos para siempre.",
            ok: false,
            porque:
              "Todavía no. El olvido se ejerce sobre datos que ya se recabaron; aquí el problema aparece antes: se están pidiendo datos que no hacían falta.",
          },
          {
            id: "c",
            texto: "Ninguno: si la aplicación es gratuita, puede pedir lo que quiera.",
            ok: false,
            porque:
              "No. Que un servicio sea gratuito no lo exime de la ley: sigue siendo responsable del tratamiento y sigue obligado por los principios del art. 5. Si no pagas con dinero, conviene mirar con qué estás pagando.",
          },
          {
            id: "d",
            texto: "El de acceso, porque la app no te deja ver tus datos.",
            ok: false,
            porque:
              "No. El acceso es el derecho a saber qué datos tiene el responsable sobre ti y cómo los trata (art. 22); aquí el problema es cuántos te está pidiendo.",
          },
        ],
      },
      {
        rotulo: "¿Qué se puede hacer?",
        pregunta: "¿Qué haces antes de aceptar?",
        opciones: [
          {
            id: "a",
            texto: "Negar los permisos que no hacen falta y leer en el aviso de privacidad qué finalidades declara la app.",
            ok: true,
            porque:
              "Correcto. El aviso debe decir qué datos trata y para qué (art. 15, frs. II y III), y el tratamiento no puede salirse de esas finalidades sin pedirte otra vez tu consentimiento (art. 11). Negar un permiso innecesario es ejercer tu derecho, no «romper» la aplicación.",
          },
          {
            id: "b",
            texto: "Aceptar todo: si no aceptas, la app no funciona.",
            ok: false,
            porque:
              "Casi nunca es cierto, y aunque lo fuera, aceptar sin leer es renunciar a decidir. Compara con otra aplicación: si una hace lo mismo pidiendo menos, ya tienes tu respuesta.",
          },
          {
            id: "c",
            texto: "Instalarla y después pedirle a la empresa acceso a sus servidores.",
            ok: false,
            porque: "El derecho de acceso es a TUS datos, no a los sistemas de la empresa (art. 22).",
          },
          {
            id: "d",
            texto: "Denunciar la aplicación ante la policía cibernética por pedir permisos.",
            ok: false,
            porque:
              "Pedir permisos no es un delito. La vía es negarlos, revisar el aviso y, si hay un tratamiento indebido, presentar la solicitud ARCO ante el responsable.",
          },
        ],
      },
      {
        rotulo: "El mismo principio, del otro lado",
        pregunta: "El mismo principio te obliga a ti cuando eres quien recoge datos. ¿Cómo?",
        opciones: [
          {
            id: "a",
            texto: "Si armo el formulario de inscripción de un torneo escolar, pido solo los datos que de verdad voy a usar.",
            ok: true,
            porque:
              "Exacto. La proporcionalidad también te obliga cuando el responsable eres tú: cada campo de más es un riesgo de más que alguien tendrá que cuidar, y casi siempre nadie lo cuida.",
          },
          {
            id: "b",
            texto: "Pido todos los datos posibles por si después hacen falta.",
            ok: false,
            porque:
              "Es justo lo contrario del principio de proporcionalidad. Guardar «por si acaso» es lo que convierte una lista escolar en una filtración.",
          },
          {
            id: "c",
            texto: "No hago nunca formularios.",
            ok: false,
            porque: "No hace falta. Se pueden pedir datos: lo que hay que hacer es pedir solo los necesarios y decir para qué.",
          },
          {
            id: "d",
            texto: "Publico los datos de mis compañeros en una hoja abierta para que cada quien corrija los suyos.",
            ok: false,
            porque: "Publicar datos de terceras personas para «facilitar» el trabajo los divulga a cualquiera que abra el enlace.",
          },
        ],
      },
    ],
  },
  {
    id: "ubicacion",
    titulo: "La cuenta escolar que rastrea la ubicación",
    icono: "fa-location-crosshairs",
    escena:
      "Una escuela particular contrata una plataforma para que los alumnos entreguen tareas. En su aviso de privacidad, la empresa dice que registrará la ubicación del alumno las 24 horas, incluso con la aplicación cerrada, «para mejorar el servicio».",
    pasos: [
      {
        rotulo: "¿Qué está en juego?",
        pregunta: "¿Qué falla en ese aviso?",
        opciones: [
          {
            id: "a",
            texto: "La finalidad: el tratamiento debe limitarse a lo declarado, y «mejorar el servicio» no justifica seguir la ubicación todo el día.",
            ok: true,
            porque:
              "Correcto. El art. 11 limita el tratamiento a las finalidades previstas en el aviso y el art. 12 exige que sea necesario, adecuado y relevante. Una finalidad tan vaga que cabe cualquier cosa no es una finalidad: es un cheque en blanco.",
          },
          {
            id: "b",
            texto: "Nada: está escrito en el aviso de privacidad, así que es legal.",
            ok: false,
            porque:
              "Escribirlo no lo vuelve válido. El aviso informa del tratamiento; no autoriza uno desproporcionado (arts. 11 y 12). Un aviso no está por encima de la ley.",
          },
          {
            id: "c",
            texto: "Que una escuela no puede contratar empresas para dar sus servicios.",
            ok: false,
            porque: "Sí puede. Contratar un servicio no es el problema: el problema es qué datos recoge ese servicio y para qué.",
          },
          {
            id: "d",
            texto: "Que el alumno es menor de edad y por eso no tiene derechos sobre sus datos.",
            ok: false,
            porque: "Al revés: los derechos son suyos y los ejerce la persona titular o su representante legal (art. 21).",
          },
        ],
      },
      {
        rotulo: "¿Qué se puede hacer?",
        pregunta: "¿Cuál es la ruta para reclamar, y en qué orden?",
        opciones: [
          {
            id: "a",
            texto:
              "Presentar ante la empresa una solicitud de oposición al registro de ubicación; si no responde en el plazo, acudir a la autoridad con la constancia de la solicitud.",
            ok: true,
            porque:
              "Correcto, y el orden importa. La oposición procede cuando hay causa legítima y el tratamiento debe cesar para evitar un perjuicio (art. 26, fr. I). El responsable tiene veinte días hábiles para contestar (art. 31) y, si no lo hace, el procedimiento de protección de derechos puede iniciarse en cuanto venza ese plazo, acompañando el documento que prueba la fecha de la solicitud (art. 40).",
          },
          {
            id: "b",
            texto: "Escribirle al INAI para que multe a la empresa.",
            ok: false,
            porque:
              "El INAI ya no existe: se extinguió, y la ley vigente (DOF 20/03/2025) llama «Secretaría» a la Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV). Además, primero se reclama al responsable; la autoridad entra después.",
          },
          {
            id: "c",
            texto: "Borrar la aplicación y no decir nada.",
            ok: false,
            porque: "Deja de afectarte a ti, pero el tratamiento sigue para todo el grupo. Reclamar es lo que cambia la práctica.",
          },
          {
            id: "d",
            texto: "Cambiarse de escuela.",
            ok: false,
            porque: "Una solicitud gratuita que debe responderse en veinte días (arts. 31 y 34) cuesta bastante menos que eso.",
          },
        ],
      },
      {
        rotulo: "El mismo derecho, del otro lado",
        pregunta: "Tú también decides sobre datos ajenos. ¿Cuándo?",
        opciones: [
          {
            id: "a",
            texto: "Cuando administro el grupo de mensajería de la clase: ahí no reenvío a nadie los teléfonos ni la ubicación de mis compañeros.",
            ok: true,
            porque:
              "Ese es el deber espejo. Al administrar un grupo estás decidiendo sobre datos ajenos, exactamente como la empresa del caso, aunque a menor escala.",
          },
          {
            id: "b",
            texto: "Comparto la ubicación de todo el grupo de forma permanente para que nadie se pierda.",
            ok: false,
            porque:
              "Puede ser útil durante una salida y con el acuerdo de cada quien. Compartirla por defecto y para siempre es exactamente el error del caso.",
          },
          {
            id: "c",
            texto: "Publico la lista del grupo con teléfonos para que se organicen los equipos.",
            ok: false,
            porque: "Publicar una lista con datos de terceras personas los divulga a cualquiera que vea el mensaje.",
          },
          {
            id: "d",
            texto: "Nunca: administrar un grupo no implica ninguna responsabilidad.",
            ok: false,
            porque: "Sí la implica. Quien decide qué se comparte de los demás, responde de ello.",
          },
        ],
      },
    ],
  },
  {
    id: "reaparece",
    titulo: "El dato borrado que reaparece",
    icono: "fa-rotate-left",
    escena:
      "Hace un año, Diego pidió a una tienda en línea que cancelara sus datos y la tienda aceptó. Hoy le llega publicidad de esa misma tienda a un correo nuevo. Antes de la cancelación, la tienda había transferido su lista de clientes a una empresa de mercadotecnia.",
    pasos: [
      {
        rotulo: "¿Qué está en juego?",
        pregunta: "¿Qué derecho ejerció Diego y qué falló?",
        opciones: [
          {
            id: "a",
            texto: "Ejerció la cancelación, y falló que la tienda no avisó de la solicitud a los terceros a los que ya había transferido sus datos.",
            ok: true,
            porque:
              "Correcto. El art. 24 lo dice expresamente: cuando los datos ya habían sido transmitidos y siguen siendo tratados por terceros, el responsable debe hacerles saber la solicitud de cancelación para que también la efectúen.",
          },
          {
            id: "b",
            texto: "Ejerció la rectificación: pidió corregir un dato equivocado.",
            ok: false,
            porque:
              "No. Rectificar es corregir datos inexactos, incompletos o desactualizados (art. 23). Diego no pidió corregir nada: pidió que dejaran de tenerlos.",
          },
          {
            id: "c",
            texto: "Ejerció el acceso: pidió ver qué datos suyos tenía la tienda.",
            ok: false,
            porque: "No. El acceso es conocer qué datos tiene el responsable y las condiciones de su tratamiento (art. 22).",
          },
          {
            id: "d",
            texto: "No ejerció ningún derecho: darse de baja de un boletín no es un derecho.",
            ok: false,
            porque:
              "Darse de baja de un boletín y pedir la cancelación de tus datos no son lo mismo. Lo segundo sí es un derecho ARCO y obliga al responsable a responder.",
          },
        ],
      },
      {
        rotulo: "¿Qué se puede hacer?",
        pregunta: "¿Qué puede exigir Diego ahora?",
        opciones: [
          {
            id: "a",
            texto:
              "Reclamar de nuevo a la tienda —que debe avisar a los terceros— y presentar además su solicitud a la empresa de mercadotecnia, que ahora también es responsable.",
            ok: true,
            porque:
              "Correcto, y por partida doble: la obligación de avisar a los terceros es de la tienda (art. 24), y la empresa de mercadotecnia, al tratar esos datos, es a su vez responsable frente a Diego y debe atender su solicitud (art. 21).",
          },
          {
            id: "b",
            texto: "Nada: el dato ya salió y en internet nada se borra.",
            ok: false,
            porque:
              "Esa frase le resulta muy cómoda a quien trata tus datos. La ley prevé precisamente este caso: la cancelación alcanza a los terceros que recibieron los datos (art. 24).",
          },
          {
            id: "c",
            texto: "Pedir que le devuelvan el dinero de sus compras anteriores.",
            ok: false,
            porque: "Es otro asunto —una reclamación de consumo—, no protección de datos personales.",
          },
          {
            id: "d",
            texto: "Crear otro correo electrónico y empezar de cero.",
            ok: false,
            porque:
              "Resuelve la molestia de hoy y ninguna de sus causas: Diego seguiría en la lista de la empresa de mercadotecnia, y la tienda seguiría sin cumplir.",
          },
        ],
      },
      {
        rotulo: "El mismo derecho, con otro nombre",
        pregunta:
          "La lectura llama «derecho al olvido» a pedir que se elimine información que ya no es pertinente. En México, ¿por dónde se ejerce?",
        opciones: [
          {
            id: "a",
            texto: "Por la cancelación y la oposición: la ley mexicana no usa el nombre «olvido», pero esos dos derechos ARCO son la vía.",
            ok: true,
            porque:
              "Correcto. «Derecho al olvido» es el nombre popular del asunto. En la ley mexicana lo que existe son los derechos ARCO: la cancelación retira el dato de los archivos del responsable (art. 24) y la oposición hace cesar un tratamiento que te perjudica (art. 26). Saber el nombre correcto del trámite es la diferencia entre que te atiendan y que no.",
          },
          {
            id: "b",
            texto: "Por un trámite especial llamado «solicitud de olvido».",
            ok: false,
            porque:
              "No existe ese trámite. Pedir algo que no existe es la forma más rápida de que no te atiendan: lo que se presenta es una solicitud ARCO (art. 27).",
          },
          {
            id: "c",
            texto: "No se puede ejercer en México.",
            ok: false,
            porque: "Sí se puede; lo que cambia es el nombre. Lo que pides es cancelación u oposición.",
          },
          {
            id: "d",
            texto: "Solo lo pueden ejercer las personas mayores de 18 años.",
            ok: false,
            porque: "La ley no condiciona los derechos ARCO a la mayoría de edad: los ejerce la persona titular o su representante legal (art. 21).",
          },
        ],
      },
    ],
  },
];

/** Cuántas decisiones tiene el expediente completo. */
export const TOTAL_DECISIONES = CASOS.reduce((n, c) => n + c.pasos.length, 0);

/**
 * Las opciones se escriben arriba con la correcta primero, porque así se leen y
 * se revisan. Si se pintaran en ese orden, el alumno aprendería «siempre es la
 * A» en vez de derechos digitales, así que cada paso rota su lista una cantidad
 * fija —no aleatoria: tiene que ser la misma en cada render y en cada visita—.
 */
const ROTACIONES = [2, 0, 3, 1, 3, 2, 0, 2, 1, 3, 1, 0];

export function opcionesOrdenadas(opciones: OpcionCaso[], indiceGlobal: number): OpcionCaso[] {
  const k = ROTACIONES[((indiceGlobal % ROTACIONES.length) + ROTACIONES.length) % ROTACIONES.length] ?? 0;
  return [...opciones.slice(k), ...opciones.slice(0, k)];
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — El buzón ARCO
 *
 * Cada letra de ARCO es un trámite distinto, con su artículo y su efecto. El
 * alumno lee una petición redactada como se redacta de verdad y decide cuál de
 * los cuatro derechos está ejerciendo.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Letra = "A" | "R" | "C" | "O";

export interface LetraArco {
  id: Letra;
  nombre: string;
  clave: string;
  resumen: string;
  noEs: string;
  articulo: string;
  icono: string;
  tono: number;
}

export const LETRAS: LetraArco[] = [
  {
    id: "A",
    nombre: "Acceso",
    clave: "¿Qué tienen sobre mí?",
    resumen: "Conocer qué datos personales tuyos están en poder del responsable y las condiciones de su tratamiento.",
    noEs: "acceder es enterarte de qué datos tienen y cómo los usan, no cambiarlos ni borrarlos",
    articulo: "LFPDPPP, art. 22",
    icono: "fa-magnifying-glass",
    tono: 188,
  },
  {
    id: "R",
    nombre: "Rectificación",
    clave: "Está mal: corríjanlo",
    resumen: "Corregir datos inexactos, incompletos o que no están actualizados. El dato se queda; lo que cambia es su contenido.",
    noEs: "rectificar es corregir un dato inexacto, incompleto o desactualizado (art. 23)",
    articulo: "LFPDPPP, art. 23",
    icono: "fa-pen",
    tono: 44,
  },
  {
    id: "C",
    nombre: "Cancelación",
    clave: "Ya no los tengan",
    resumen: "Que el dato salga de los archivos del responsable. Da lugar a un periodo de bloqueo y después a su supresión.",
    noEs: "cancelar es sacar el dato de los archivos del responsable (art. 24)",
    articulo: "LFPDPPP, art. 24",
    icono: "fa-eraser",
    tono: 330,
  },
  {
    id: "O",
    nombre: "Oposición",
    clave: "Que dejen de usarlos así",
    resumen:
      "Que cese un tratamiento que te perjudica, aunque sea lícito. Incluye oponerte a decisiones automatizadas tomadas sin intervención humana.",
    noEs: "oponerse es pedir que cese un uso concreto, conservando el dato (art. 26)",
    articulo: "LFPDPPP, art. 26",
    icono: "fa-hand",
    tono: 152,
  },
];

export interface SolicitudArco {
  id: string;
  texto: string;
  letra: Letra;
  porque: string;
}

export const SOLICITUDES: SolicitudArco[] = [
  {
    id: "s1",
    texto: "«Quiero saber qué datos míos guarda la plataforma de mi gimnasio y con qué finalidad los usa.»",
    letra: "A",
    porque:
      "Acceso (art. 22). Pedir conocer qué datos tienen y cómo los tratan es exactamente eso; no pide corregir ni retirar nada, pide ver.",
  },
  {
    id: "s7",
    texto: "«Pido que retiren de sus archivos la fotografía que me tomaron en el curso de verano.»",
    letra: "C",
    porque: "Cancelación (art. 24): lo que se busca es que el dato —la fotografía— salga de los archivos del responsable.",
  },
  {
    id: "s4",
    texto: "«Pueden conservar mi cuenta, pero dejen de usar mi correo para enviarme publicidad.»",
    letra: "O",
    porque:
      "Oposición (art. 26): el dato sigue ahí y la relación continúa; lo que cesa es un uso concreto. Si pidiera borrar la cuenta entera sería cancelación.",
  },
  {
    id: "s2",
    texto: "«Mi apellido aparece mal escrito en el recibo: dice Ruíz y es Ruiz. Adjunto mi identificación.»",
    letra: "R",
    porque:
      "Rectificación (art. 23): el dato debe conservarse, pero es inexacto. Fíjate en que la solicitud ya trae lo que la ley pide para este derecho: qué modificación se solicita y el documento que la sustenta (art. 30).",
  },
  {
    id: "s8",
    texto: "«No acepto que un sistema automático decida solo, sin que lo revise una persona, si me otorgan la beca.»",
    letra: "O",
    porque:
      "Oposición (art. 26, fr. II). La ley reconoce expresamente el derecho a oponerte a un tratamiento automatizado que te produzca efectos jurídicos no deseados o afecte de manera significativa tus intereses cuando evalúa aspectos personales tuyos sin intervención humana. Es la puerta legal concreta contra la discriminación algorítmica de la que habla la lectura.",
  },
  {
    id: "s5",
    texto: "«Solicito copia del expediente que la empresa tiene sobre mí. Acredito mi identidad con mi credencial.»",
    letra: "A",
    porque:
      "Acceso (art. 22). La entrega procede previa acreditación de la identidad de la persona titular (art. 31) y es gratuita: solo pueden cobrarse los costos de reproducción, copias o envío (art. 34).",
  },
  {
    id: "s3",
    texto: "«Ya no soy cliente. Pido que eliminen mi número de teléfono de sus registros.»",
    letra: "C",
    porque:
      "Cancelación (art. 24): que el dato deje de estar en posesión del responsable. La ley prevé un periodo de bloqueo antes de la supresión definitiva, y después se te avisa.",
  },
  {
    id: "s6",
    texto: "«Cambié de domicilio hace dos meses y sus envíos siguen yendo a la dirección anterior.»",
    letra: "R",
    porque: "Rectificación (art. 23): el dato está desactualizado. Corregirlo es distinto de borrarlo; aquí se necesita el domicilio nuevo.",
  },
];

/** Lo que toda solicitud ARCO debe traer y cuánto tarda. Verificado en la ley. */
export const REGLAS_SOLICITUD: { icono: string; titulo: string; detalle: string }[] = [
  {
    icono: "fa-id-card",
    titulo: "Qué debe traer",
    detalle:
      "Tu nombre y un medio para recibir notificaciones, los documentos que acrediten tu identidad, la descripción clara de los datos y qué derecho ejerces (art. 28).",
  },
  {
    icono: "fa-hourglass-half",
    titulo: "Cuánto tarda",
    detalle:
      "El responsable te comunica su determinación en un máximo de veinte días hábiles y, si procede, la hace efectiva dentro de los quince días siguientes. Los plazos pueden ampliarse una sola vez (art. 31).",
  },
  {
    icono: "fa-coins",
    titulo: "Cuánto cuesta",
    detalle: "El ejercicio de los derechos ARCO es gratuito. Solo pueden cobrarse los costos de reproducción, copias o envío (art. 34).",
  },
  {
    icono: "fa-scale-balanced",
    titulo: "Si no responden",
    detalle:
      "Puedes iniciar el procedimiento de protección de derechos ante la Secretaría dentro de los quince días siguientes a la respuesta, o en cuanto venza el plazo si no la hubo, probando la fecha en que presentaste tu solicitud (art. 40).",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — Audita el aviso de privacidad
 *
 * Un aviso real-verosímil de una aplicación inventada. Seis cláusulas cumplen
 * lo que la ley exige; cinco piden de más. Leer un aviso y saber señalar el
 * exceso es la habilidad que de verdad se usa.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AVISO_TITULO = "Aviso de privacidad — «Tareas Exprés» (documento ilustrativo)";
export const AVISO_ENTRADA =
  "Este aviso es ficticio: se escribió para esta práctica imitando la forma de uno real. Ninguna aplicación con este nombre existe. Lee cláusula por cláusula y decide si cumple la ley o si está pidiendo de más.";

export interface ClausulaAviso {
  id: string;
  rotulo: string;
  texto: string;
  exceso: boolean;
  porque: string;
}

export const CLAUSULAS: ClausulaAviso[] = [
  {
    id: "c1",
    rotulo: "Responsable",
    texto: "Tareas Exprés, S. de R.L. de C.V., con domicilio en Avenida Ejemplo 000, colonia Modelo, Puebla, Puebla.",
    exceso: false,
    porque:
      "Va bien. El aviso debe empezar identificando quién responde y dónde localizarlo (art. 15, fr. I). Un aviso sin responsable no sirve para reclamar nada.",
  },
  {
    id: "c2",
    rotulo: "Datos que tratamos",
    texto: "Nombre, correo electrónico, escuela y grado escolar.",
    exceso: false,
    porque:
      "Va bien. El aviso debe decir qué datos somete a tratamiento e identificar cuáles son sensibles (art. 15, fr. II). Estos cuatro son coherentes con tener una cuenta escolar.",
  },
  {
    id: "c3",
    rotulo: "Finalidades",
    texto: "Crear tu cuenta, guardar tus tareas y avisarte de las fechas de entrega.",
    exceso: false,
    porque:
      "Va bien. Las finalidades deben estar declaradas, distinguiendo las que requieren tu consentimiento (art. 15, fr. III). Estas tres son congruentes con lo que la aplicación hace.",
  },
  {
    id: "c4",
    rotulo: "Ubicación",
    texto: "Registramos tu ubicación exacta las 24 horas del día, incluso con la aplicación cerrada.",
    exceso: true,
    porque:
      "Se pasa. Entregar tareas no requiere saber dónde estás a todas horas, y el tratamiento debe ser necesario, adecuado y relevante para la finalidad declarada (art. 12). Es el ejemplo clásico de desproporción.",
  },
  {
    id: "c5",
    rotulo: "Contactos",
    texto: "Al aceptar, autorizas que compartamos tu lista de contactos con nuestros socios comerciales.",
    exceso: true,
    porque:
      "Se pasa, por dos razones a la vez: tu lista de contactos son datos de otras personas que no han consentido nada, y compartirlos con socios comerciales es una finalidad distinta de la declarada, que exigiría pedirte otra vez el consentimiento (art. 11).",
  },
  {
    id: "c6",
    rotulo: "Derechos ARCO",
    texto: "Para ejercer tus derechos ARCO escribe a datos@ejemplo.mx; responderemos en un plazo máximo de veinte días.",
    exceso: false,
    porque:
      "Va bien. El aviso debe indicar los mecanismos, medios y procedimientos para ejercer los derechos ARCO (art. 15, fr. V), y veinte días es justo el plazo máximo que fija el art. 31.",
  },
  {
    id: "c7",
    rotulo: "Datos adicionales",
    texto: "Solicitamos tu tipo de sangre y tus creencias religiosas para personalizar tu experiencia.",
    exceso: true,
    porque:
      "Se pasa. El estado de salud y las creencias religiosas son datos personales sensibles (art. 2, fr. VI): exigen consentimiento expreso y por escrito, y no pueden crearse bases que los contengan sin una finalidad legítima y concreta (art. 8). «Personalizar tu experiencia» no es ninguna de las dos cosas.",
  },
  {
    id: "c8",
    rotulo: "Cómo limitar el uso",
    texto: "Puedes limitar el uso de tus datos desactivando las notificaciones y la publicidad desde Ajustes.",
    exceso: false,
    porque:
      "Va bien. El aviso debe ofrecer opciones y medios para limitar el uso o divulgación de los datos (art. 15, fr. IV), y tenerlos a la mano dentro de la aplicación es exactamente eso.",
  },
  {
    id: "c9",
    rotulo: "Costo del trámite",
    texto: "El ejercicio de tus derechos ARCO tiene un costo de 500 pesos por solicitud.",
    exceso: true,
    porque:
      "Se pasa. El ejercicio de los derechos ARCO es gratuito: solo pueden cobrarse los costos de reproducción, copias o envío (art. 34). Cobrar por el trámite es ponerle un peaje a un derecho.",
  },
  {
    id: "c10",
    rotulo: "Cambios al aviso",
    texto: "Si cambiamos este aviso te lo haremos saber por correo y en la pantalla de inicio de la aplicación.",
    exceso: false,
    porque:
      "Va bien. El aviso debe decir por qué procedimiento y medio se comunicarán los cambios (art. 15, fr. VI). Sin eso, un aviso podría cambiar sin que nunca te enteraras.",
  },
  {
    id: "c11",
    rotulo: "Aceptación",
    texto: "Al usar la aplicación renuncias a todos tus derechos sobre tus datos personales.",
    exceso: true,
    porque:
      "Se pasa, y es la cláusula más grave de todas. Ningún aviso puede hacerte renunciar a los derechos ARCO: cualquier persona titular puede ejercerlos en todo momento (arts. 21 y 27), y el responsable está obligado a respetar el aviso y los principios de la ley (art. 13).",
  },
];

export const EXCESOS_TOTALES = CLAUSULAS.filter((c) => c.exceso).length;

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 — Glosario (A5 verbatim + dos términos del marco legal)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const GLOSARIO: ParTermino[] = [
  {
    id: "g1",
    termino: "Derecho a la privacidad",
    definicion: "Derecho a controlar quién accede a tu información personal.",
    ejemplo: "Decidir qué datos compartes en una app.",
  },
  {
    id: "g2",
    termino: "Protección de datos personales",
    definicion: "Normas que regulan cómo se recogen, usan y guardan tus datos.",
    ejemplo: "Una empresa debe decirte para qué usará tu correo.",
  },
  {
    id: "g3",
    termino: "Derecho al olvido",
    definicion: "Posibilidad de solicitar que se elimine información personal que ya no es pertinente.",
    ejemplo: "Pedir que se borre un dato antiguo de un buscador.",
  },
  {
    id: "g4",
    termino: "Libertad de expresión digital",
    definicion: "Derecho a expresarse en línea con responsabilidad y respeto a los demás.",
    ejemplo: "Opinar en redes sin difamar ni acosar.",
  },
  {
    id: "g5",
    termino: "Aviso de privacidad",
    definicion: "Documento con el que quien trata tus datos te informa qué recaba, para qué y cómo ejercer tus derechos.",
    ejemplo: "La pantalla que aceptas al crear una cuenta (LFPDPPP, arts. 2, fr. I, y 15).",
  },
  {
    id: "g6",
    termino: "Derechos ARCO",
    definicion: "Los cuatro derechos sobre tus datos personales: acceso, rectificación, cancelación y oposición.",
    ejemplo: "Pedirle a una tienda que corrija tu domicilio (LFPDPPP, art. 2, fr. VII).",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 5 — Completa el texto (CD-I-P05-A6, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DERECHOS_DIGITALES_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P05-A6 · Completa: derechos digitales",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Tienes derecho a la ",
    " de tu información y a la protección de tus ",
    " personales. El derecho al ",
    " permite pedir que se elimine información que ya no es pertinente. Conocer tus derechos es el primer paso para ",
    "los.",
  ],
  huecos: [
    { respuesta: "privacidad", alternativas: [], pista: "Controlar quién ve tu información." },
    { respuesta: "datos", alternativas: [], pista: "Información personal." },
    { respuesta: "olvido", alternativas: [], pista: "Derecho al ___." },
    { respuesta: "ejercer", alternativas: ["defender"], pista: "Hacerlos valer." },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero/falso (CD-I-P05-A4, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface HechoVF {
  enunciado: string;
  respuesta: boolean;
  retro: string;
}

export const HECHOS: HechoVF[] = [
  {
    enunciado: "Las personas tienen derecho a la privacidad y a la protección de sus datos personales.",
    respuesta: true,
    retro: "Correcto: es un derecho digital fundamental.",
  },
  {
    enunciado: "El acceso a internet se reconoce cada vez más como un derecho que reduce desigualdades.",
    respuesta: true,
    retro: "Correcto: facilita educación, información y participación.",
  },
  {
    enunciado: "Una vez que algo se publica en internet, no existe ningún mecanismo para reclamar o eliminarlo.",
    respuesta: false,
    retro: "Existen mecanismos como el derecho al olvido y las solicitudes de protección de datos.",
  },
  {
    enunciado: "Conocer tus derechos digitales te ayuda a defenderte de abusos en línea.",
    respuesta: true,
    retro: "Correcto: el primer paso para ejercerlos es conocerlos.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable (CD-I-P05-A2)
 *
 * Cuatro reactivos verbatim. El tercero está ACTUALIZADO: la actividad de la
 * plataforma da como respuesta correcta «INAI», organismo extinto cuya función
 * la ley vigente asigna a la Secretaría Anticorrupción y Buen Gobierno. Se
 * conserva la pregunta y se corrige la respuesta, y el cambio se declara.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const NOTA_REACTIVO_3 =
  "El reactivo 3 se actualizó: la actividad A2 de la plataforma todavía responde «INAI». Ese organismo se extinguió y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente (DOF 20/03/2025) llama «Secretaría» a la Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV).";

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Derechos digitales: ¿los conoces?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál de estos es un ejemplo de violación al derecho a la privacidad digital?",
      opciones: [
        "Una empresa envía un boletín de noticias al que te suscribiste",
        "Tu proveedor de internet comparte tus datos de navegación sin tu permiso",
        "Una red social te sugiere amigos en común",
        "Google guarda tu historial de búsqueda (con tu consentimiento)",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Compartir datos de navegación sin consentimiento viola el derecho a la privacidad digital.",
    },
    {
      enunciado: "¿Qué es el 'derecho al olvido'?",
      opciones: [
        "El derecho a borrar mensajes enviados en WhatsApp",
        "El derecho a solicitar que plataformas eliminen datos personales desactualizados o dañinos",
        "El derecho a no recibir publicidad",
        "El derecho a usar internet de forma anónima",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El derecho al olvido permite pedir la eliminación de datos personales que ya no son relevantes o afectan la reputación. En México se ejerce por la vía de la cancelación y la oposición (LFPDPPP, arts. 24 y 26).",
    },
    {
      enunciado: "¿Qué autoridad vigila hoy en México la protección de tus datos personales en manos de empresas?",
      opciones: ["SEP", "CONAPRED", "La Secretaría Anticorrupción y Buen Gobierno", "IMSS"],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La ley vigente (DOF 20/03/2025) llama «Secretaría» a la Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV) y le encarga conocer y resolver el procedimiento de protección de derechos. Recuerda el orden: la solicitud ARCO se presenta primero ante quien trata tus datos; la autoridad entra después.",
    },
    {
      enunciado: "La 'discriminación algorítmica' ocurre cuando:",
      opciones: [
        "Un algoritmo recomienda contenido que no te interesa",
        "Un sistema automatizado toma decisiones que discriminan por características personales como raza o género",
        "Las redes sociales bloquean cuentas falsas",
        "Un buscador no encuentra lo que necesitas",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La discriminación algorítmica es cuando sistemas automáticos refuerzan sesgos y discriminan a personas por sus características. La ley permite oponerse a los tratamientos automatizados que deciden sobre ti sin intervención humana (art. 26, fr. II).",
    },
    {
      enunciado: "¿Cuál de estas acciones ejerces tu derecho a la seguridad digital?",
      opciones: [
        "Usar la misma contraseña en todas tus cuentas por comodidad",
        "Activar la autenticación de dos factores en tus cuentas importantes",
        "Compartir tu contraseña con amigos de confianza",
        "No actualizar el sistema operativo para no perder configuraciones",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Activar 2FA es una medida concreta para ejercer el derecho a la seguridad digital.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Lectura A1 y reflexión A3 (verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Qué es el 'derecho al olvido'?",
    guia: "El derecho a solicitar que se eliminen datos personales que ya no son relevantes o afectan la reputación.",
  },
  {
    pregunta: "¿Qué institución en México protege los datos personales?",
    guia:
      "La actividad responde «el INAI». Hoy ya no: ese organismo se extinguió y la ley vigente encarga esa función a la Secretaría Anticorrupción y Buen Gobierno (LFPDPPP, art. 2, fr. XV). Ojo con el orden: la solicitud ARCO se presenta primero ante quien trata tus datos.",
  },
  {
    pregunta: "¿Por qué el acceso a internet se considera un derecho fundamental?",
    guia: "Porque es necesario para ejercer otros derechos como la educación, la información y el trabajo.",
  },
];

export const REFLEXION_A3 = {
  prompt:
    "¿Conocías tus derechos digitales antes de esta actividad? Describe una situación real o imaginaria donde uno de estos derechos podría ser violado (privacidad, olvido, no discriminación, acceso, seguridad). ¿Qué harías tú o qué debería hacerse para proteger ese derecho?",
  criterios: [
    "Identifica correctamente al menos un derecho digital",
    "Describe una situación concreta (real o plausible) de violación",
    "Propone acciones concretas de protección o reparación",
    "Usa vocabulario del tema (INAI, privacidad, 2FA, derecho al olvido)",
  ],
  pistas: [
    "¿Has tenido alguna experiencia donde tus datos fueron usados sin tu conocimiento?",
    "¿Conoces el INAI y para qué sirve?",
    "¿Qué pasaría si una universidad o empresa usa un algoritmo que discrimina por nombre o código postal?",
  ],
};
