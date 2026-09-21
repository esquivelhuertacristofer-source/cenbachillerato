/**
 * Ficha teórica del laboratorio «Mis derechos en el mundo digital» (CD-I-P05).
 *
 * El marco teórico reproduce VERBATIM la lectura CD-I-P05-A1 y añade, marcada
 * como tal, una actualización normativa: la lectura cita la Ley Federal de
 * Protección de Datos Personales de 2010 y al INAI, y ninguna de las dos cosas
 * está vigente. La ley que rige hoy se publicó en el DOF el 20 de marzo de
 * 2025 (última reforma DOF 14/11/2025) y llama «Secretaría» a la Secretaría
 * Anticorrupción y Buen Gobierno (art. 2, fr. XV).
 *
 * De esta ficha salen los capítulos 1 y 3 de la Expedición.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DERECHOS_DIGITALES_FICHA: FichaTeoricaData = {
  ancla: "CD-I-P05-A1 · Mis derechos en el mundo digital",

  marcoTeorico: [
    "En el mundo digital, tenemos derechos que muchas veces desconocemos. Los derechos digitales son extensiones de los derechos humanos fundamentales aplicados al entorno tecnológico. Algunos de los más importantes son:",
    "• Derecho a la privacidad digital: nadie puede acceder sin autorización a tus comunicaciones, archivos o datos personales. En México está protegido por el artículo 16 constitucional y la Ley Federal de Protección de Datos Personales.",
    "• Derecho al olvido: puedes solicitar que se eliminen datos personales tuyos que ya no son relevantes o que afectan tu reputación.",
    "• Derecho a la no discriminación algorítmica: los sistemas automatizados no deben tomar decisiones que te discriminen por raza, género, clase social u otras características.",
    "• Derecho al acceso a internet: algunos instrumentos internacionales reconocen el acceso a internet como un derecho fundamental, ya que es necesario para ejercer otros derechos (educación, información, trabajo).",
    "• Derecho a la seguridad digital: tienes derecho a usar herramientas de cifrado y proteger tus comunicaciones.",
    "Ejercer estos derechos requiere conocerlos, saber a qué instancias acudir cuando son violados y usar las herramientas tecnológicas disponibles para protegerse.",
    "ACTUALIZACIÓN NORMATIVA (no forma parte de la lectura). La ley que cita el texto anterior fue sustituida: la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente se publicó en el Diario Oficial de la Federación el 20 de marzo de 2025 —última reforma DOF 14/11/2025— y abrogó la de 2010. El INAI, que la lectura nombra como instancia, se extinguió; la propia ley llama «Secretaría» a la Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV) y le encarga conocer y resolver el procedimiento de protección de derechos. Lo esencial no cambió: los cuatro derechos ARCO siguen ahí, se presentan ante quien trata tus datos, son gratuitos y deben responderse en veinte días hábiles (arts. 21, 27, 31 y 34).",
    "La ley también le pone nombre a casi todo lo que ocurre en esta práctica. Dato personal es «cualquier información concerniente a una persona identificada o identificable» (art. 2, fr. V), y por eso tu fotografía lo es. El tratamiento «será el que resulte necesario, adecuado y relevante en relación con las finalidades previstas en el aviso de privacidad» (art. 12): ese es el principio de proporcionalidad, el que rompe la app que pide la agenda entera para armar un horario. Y quien trata tus datos debe publicar un aviso de privacidad con seis contenidos mínimos (art. 15), que es justo la lista contra la que se audita un aviso.",
    "El «derecho a la no discriminación algorítmica» que menciona la lectura tiene además una puerta concreta en la ley mexicana: el art. 26, fr. II permite oponerse a un tratamiento automatizado que produzca efectos jurídicos no deseados o afecte de manera significativa tus intereses cuando evalúa, sin intervención humana, aspectos personales tuyos como tu rendimiento, tu situación económica o tu comportamiento.",
  ],

  objetivos: [
    "Reconocer un dato personal en una situación cotidiana y decir quién es el responsable de tratarlo.",
    "Identificar, ante un caso concreto, qué derecho o principio está en juego y qué mecanismo procede.",
    "Distinguir las cuatro letras de ARCO: acceso, rectificación, cancelación y oposición.",
    "Auditar un aviso de privacidad y señalar qué está pidiendo de más.",
    "Formular el deber que corresponde a cada derecho propio.",
    "Conocer la vía, el plazo y el costo del trámite, y qué hacer si el responsable no responde.",
  ],

  materiales: [
    { nombre: "Expediente de casos", detalle: "Cuatro situaciones ilustrativas, tres decisiones cada una", icono: "fa-folder-open" },
    { nombre: "Buzón ARCO", detalle: "Ocho solicitudes redactadas, cuatro letras", icono: "fa-inbox" },
    { nombre: "Aviso de privacidad", detalle: "Once cláusulas por auditar", icono: "fa-file-contract" },
    { nombre: "Glosario de la progresión", detalle: "Seis términos para escribir de memoria", icono: "fa-spell-check" },
    { nombre: "Texto con huecos", detalle: "El párrafo de la actividad A6", icono: "fa-pen-to-square" },
  ],

  conceptos: [
    {
      termino: "Dato personal",
      definicion:
        "Cualquier información concerniente a una persona identificada o identificable, directa o indirectamente. Tu nombre, tu correo y también tu fotografía (LFPDPPP, art. 2, fr. V).",
    },
    {
      termino: "Datos sensibles",
      definicion:
        "Los que tocan la esfera más íntima de la persona o cuyo uso indebido puede discriminarla: salud, origen étnico, creencias religiosas, opiniones políticas o preferencia sexual (art. 2, fr. VI).",
    },
    {
      termino: "Derechos ARCO",
      definicion:
        "Acceso, rectificación, cancelación y oposición: los cuatro derechos que puedes ejercer sobre tus datos personales. Ejercer uno no es requisito ni impedimento para ejercer otro (arts. 2, fr. VII, y 21).",
    },
    {
      termino: "Responsable del tratamiento",
      definicion:
        "Quien decide qué se hace con tus datos: la empresa, la aplicación o la institución. Es ante él —no ante una autoridad— ante quien se presenta la solicitud ARCO.",
    },
    {
      termino: "Aviso de privacidad",
      definicion:
        "Documento que debe decirte quién trata tus datos, cuáles trata, para qué, cómo limitar su uso, cómo ejercer tus derechos y cómo te avisará de los cambios (art. 15).",
    },
    {
      termino: "Proporcionalidad",
      definicion:
        "Solo pueden tratarse los datos necesarios, adecuados y relevantes para la finalidad declarada. Es uno de los ocho principios del art. 5 y lo desarrolla el art. 12.",
    },
    {
      termino: "Consentimiento",
      definicion:
        "Manifestación libre, específica e informada de tu voluntad para que traten tus datos. Puede revocarse en cualquier momento, y los datos sensibles exigen que sea expreso y por escrito (arts. 2, fr. IV, y 8).",
    },
    {
      termino: "Decisión automatizada",
      definicion:
        "La que un sistema toma sobre ti sin intervención humana. Puedes oponerte cuando produce efectos jurídicos no deseados o afecta de manera significativa tus intereses (art. 26, fr. II).",
    },
  ],

  glosario: [
    { termino: "Derecho a la privacidad", definicion: "Derecho a controlar quién accede a tu información personal." },
    { termino: "Protección de datos personales", definicion: "Normas que regulan cómo se recogen, usan y guardan tus datos." },
    { termino: "Derecho al olvido", definicion: "Posibilidad de solicitar que se elimine información personal que ya no es pertinente." },
    { termino: "Libertad de expresión digital", definicion: "Derecho a expresarse en línea con responsabilidad y respeto a los demás." },
    {
      termino: "Aviso de privacidad",
      definicion: "Documento con el que quien trata tus datos te informa qué recaba, para qué y cómo ejercer tus derechos.",
    },
    {
      termino: "Derechos ARCO",
      definicion: "Los cuatro derechos sobre tus datos personales: acceso, rectificación, cancelación y oposición.",
    },
  ],

  aplicaciones: [
    "La solicitud ARCO se presenta ante quien trata tus datos —no ante una autoridad— y es gratuita: solo pueden cobrarte los costos de reproducción, copias o envío (art. 34).",
    "El responsable te comunica su determinación en un máximo de veinte días hábiles y, si procede, la hace efectiva dentro de los quince días siguientes; los plazos pueden ampliarse una sola vez (art. 31).",
    "Toda solicitud debe traer tu nombre y un medio para recibir notificaciones, la prueba de tu identidad, la descripción clara de los datos y qué derecho ejerces (art. 28).",
    "Si no te responden o te responden mal, el procedimiento de protección de derechos se presenta ante la Secretaría dentro de los quince días siguientes a la respuesta, o en cuanto venza el plazo si no la hubo, probando la fecha en que presentaste tu solicitud (art. 40).",
  ],

  fuente:
    "Verbatim de la progresión CD-I-P05: lectura A1, reto A2 (con el reactivo de la autoridad actualizado), reflexión A3, hechos A4, glosario A5 y texto con huecos A6. Marco legal verificado: Ley Federal de Protección de Datos Personales en Posesión de los Particulares, DOF 20 de marzo de 2025, última reforma DOF 14 de noviembre de 2025. Los casos, las solicitudes y el aviso de privacidad son ilustrativos: ninguna persona, empresa, escuela o aplicación es real.",
};
