/**
 * Simulador de verificación — «Tu feed» (LabFakeNews, deteccion-fake-news).
 *
 * Seis publicaciones FICTICIAS, modeladas sobre patrones de desinformación que
 * circulan con frecuencia en México. Medios, personas, dominios y agencias son
 * inventados; ninguna cita se atribuye a una persona real. Las fotos
 * (public/media/labs-fakenews/*.webp) son imágenes generadas, sin texto.
 *
 * Cada herramienta de investigación revela una evidencia. `clave: true` marca
 * la evidencia que SÍ prueba el veredicto; las demás son ruido o no concluyen.
 */

export type Veredicto = "verdadera" | "falsa" | "enganosa" | "satira";
export type Herramienta = "imagen" | "sitio" | "medios" | "completo" | "fecha";
export type Formato = "cadena" | "muro" | "flash";

export const VEREDICTOS: { id: Veredicto; etiqueta: string; icono: string; def: string }[] = [
  { id: "verdadera", etiqueta: "Verdadera", icono: "fa-circle-check", def: "Los hechos son reales, tienen fuente verificable y otros medios serios los confirman." },
  { id: "falsa", etiqueta: "Falsa", icono: "fa-circle-xmark", def: "El contenido está inventado o no hay nada que lo respalde." },
  { id: "enganosa", etiqueta: "Engañosa (fuera de contexto)", icono: "fa-triangle-exclamation", def: "Hay material o datos reales, pero se presentan sin contexto o en otro lugar o tiempo para que parezcan otra cosa." },
  { id: "satira", etiqueta: "Sátira", icono: "fa-face-grin-tears", def: "Es humor o parodia: no pretende informar, aunque alguien la comparta como si fuera real." },
];

export const HERRAMIENTAS: { id: Herramienta; etiqueta: string; icono: string }[] = [
  { id: "imagen", etiqueta: "Buscar la imagen", icono: "fa-image" },
  { id: "sitio", etiqueta: "Revisar el sitio", icono: "fa-globe" },
  { id: "medios", etiqueta: "Buscar en otros medios", icono: "fa-newspaper" },
  { id: "completo", etiqueta: "Leer completo", icono: "fa-align-left" },
  { id: "fecha", etiqueta: "Revisar fecha y autor", icono: "fa-calendar-check" },
];

export interface Evidencia {
  texto: string;
  clave: boolean;
}

export interface Publicacion {
  id: string;
  /** Nombre del archivo en public/media/labs-fakenews/. */
  foto: string;
  alt: string;
  formato: Formato;
  /** Cuenta o grupo que comparte. */
  autor: string;
  /** Medio o remitente que aparece en la tarjeta (ficticio). */
  medio: string;
  dominio: string;
  fecha: string;
  compartidos: string;
  titular: string;
  cuerpo: string;
  veredicto: Veredicto;
  evidencias: Record<Herramienta, Evidencia>;
  /** Qué prueba el veredicto, y por qué. */
  decisiva: string;
}

export const PUBLICACIONES: Publicacion[] = [
  {
    id: "p1",
    foto: "inundacion",
    alt: "Calle inundada con coches parcialmente cubiertos de agua lodosa y vecinos caminando por la banqueta",
    formato: "muro",
    autor: "@alertaciudadana_vp",
    medio: "Alerta Ciudadana VP",
    dominio: "página de redes sociales",
    fecha: "Hoy, 18:40",
    compartidos: "48 200 veces",
    titular: "¡ASÍ ESTÁ HOY EL CENTRO DE VILLA PALMAR! El agua ya llegó a las casas",
    cuerpo: "Fotos que me mandaron ahorita. Familias atrapadas y nadie del gobierno hace nada. Compartan para que se enteren.",
    veredicto: "enganosa",
    evidencias: {
      imagen: { texto: "Búsqueda inversa: la misma foto aparece en un reportaje del 14 de septiembre de 2019 sobre una inundación en Puerto Lindero, en otro país. La imagen es real, pero NO es de hoy ni de Villa Palmar.", clave: true },
      sitio: { texto: "La cuenta se creó hace 3 semanas, no da nombre real, dirección ni contacto. Tiene 12 mil seguidores. Es sospechoso, pero por sí solo no demuestra que la foto sea falsa.", clave: false },
      medios: { texto: "La coordinación municipal de Protección Civil de Villa Palmar informó lluvia moderada hoy y «sin afectaciones graves». Ningún medio local reporta calles inundadas en el centro.", clave: true },
      completo: { texto: "Pide compartir «antes de que lo borren», no indica quién tomó las fotos ni en qué calle. Solo hay una imagen, aunque dice «fotos».", clave: false },
      fecha: { texto: "Publicada hoy a las 18:40 por una cuenta que no se identifica. No hay fecha ni lugar en el pie de foto.", clave: false },
    },
    decisiva: "La búsqueda inversa mostró que la foto es real pero de 2019 y de otro país, y los medios locales no reportan nada igual hoy. Es material real usado fuera de contexto: engañosa.",
  },
  {
    id: "p2",
    foto: "remedio",
    alt: "Mesa de madera con miel, limones, ajo, jengibre y una taza humeante",
    formato: "cadena",
    autor: "Reenviado muchas veces",
    medio: "Cadena de mensajes",
    dominio: "sin enlace",
    fecha: "Ayer",
    compartidos: "Reenviado muchas veces",
    titular: "REMEDIO CASERO CURA LA DIABETES EN 3 DÍAS",
    cuerpo: "Limón, ajo y jengibre en ayunas. Los doctores no quieren que lo sepas porque pierden dinero. Mi tía lo hizo y dejó sus pastillas. Reenvía a 10 personas.",
    veredicto: "falsa",
    evidencias: {
      imagen: { texto: "Búsqueda inversa: es una foto de banco de imágenes que aparece en cientos de recetas de cocina. No prueba nada sobre el mensaje.", clave: false },
      sitio: { texto: "No hay sitio ni enlace: es un reenvío sin origen. Nadie firma el mensaje.", clave: false },
      medios: { texto: "El Centro de Salud Pública (ficticio) y varios verificadores explican que ningún alimento cura la diabetes y que dejar el tratamiento puede ser peligroso. Ningún medio serio reporta ese «descubrimiento».", clave: true },
      completo: { texto: "Sin autor, sin estudio ni médico citado, promete una cura «en 3 días», dice que «los doctores lo ocultan» y recomienda dejar las pastillas. Presiona para reenviar a 10 personas.", clave: true },
      fecha: { texto: "El mismo texto circula desde 2016, cambiando los ingredientes (antes era ajo y cebolla).", clave: true },
    },
    decisiva: "Promete una cura milagrosa sin ninguna fuente, la contradicen las autoridades de salud y el mismo texto circula desde 2016 con otros ingredientes. Es un bulo inventado: falsa.",
  },
  {
    id: "p3",
    foto: "aviso",
    alt: "Carpeta cerrada con un sello rojo de cera y un listón azul sobre un escritorio",
    formato: "cadena",
    autor: "Grupo «Vecinos Unidos»",
    medio: "Agencia Nacional de Alertas Ciudadanas (ANAC)",
    dominio: "anac-avisos.info",
    fecha: "Ayer, 22:15",
    compartidos: "Reenviado muchas veces",
    titular: "AVISO OFICIAL: mañana bloquearán las cuentas que no reenvíen este mensaje",
    cuerpo: "Captura del comunicado de la ANAC. Por seguridad de todos, reenvíe este aviso a 10 contactos antes de las 12:00 o su cuenta será suspendida.",
    veredicto: "falsa",
    evidencias: {
      imagen: { texto: "Búsqueda inversa: el sello azul y rojo es un recurso gratuito de plantillas, usado en cientos de documentos falsos. La captura no tiene folio, firma ni original que consultar.", clave: true },
      sitio: { texto: "El dominio anac-avisos.info se registró hace 9 días, sin página de «Acerca de», sin teléfono ni dirección. La agencia no tiene portal oficial.", clave: true },
      medios: { texto: "Ningún medio ni dependencia reporta ese aviso, y el directorio oficial de dependencias del gobierno no lista ninguna «ANAC».", clave: true },
      completo: { texto: "Tiene faltas de ortografía, amenaza con bloquear cuentas y exige reenviar a 10 contactos: presión típica de cadena.", clave: true },
      fecha: { texto: "Es una captura de pantalla de ayer; no muestra quién la emitió ni quién la tomó.", clave: false },
    },
    decisiva: "La «agencia» no existe en ningún directorio oficial, su dominio tiene 9 días y el sello es de plantilla. Un aviso oficial real tendría folio, firma y un sitio verificable: falsa.",
  },
  {
    id: "p4",
    foto: "obra",
    alt: "Trabajadores con chalecos naranjas reparando una tubería rota en una zanja en la calle",
    formato: "flash",
    autor: "@diariorivera",
    medio: "Diario Ribera del Valle",
    dominio: "diarioriberadelvalle.com.mx",
    fecha: "Hoy, 07:10",
    compartidos: "1 200 veces",
    titular: "Cierran la avenida Jacarandas por 3 días para reparar tubería principal",
    cuerpo: "El organismo operador de agua informó que el cierre será de las 22:00 a las 05:00 y que habrá pipas en las colonias afectadas. Nota de Marisol Treviño.",
    veredicto: "verdadera",
    evidencias: {
      imagen: { texto: "Búsqueda inversa: la foto no aparece antes de hoy. El crédito dice «Archivo del diario, 3 de octubre».", clave: true },
      sitio: { texto: "El dominio tiene 11 años; hay página «Quiénes somos», teléfono, dirección de redacción y aviso de correcciones. La reportera firma más de 140 notas.", clave: true },
      medios: { texto: "Otros dos medios locales y el comunicado del organismo operador de agua confirman el cierre, el horario y las pipas.", clave: true },
      completo: { texto: "Cita al vocero del organismo operador con nombre y número de comunicado, e incluye horarios y calles. Sin adjetivos exagerados.", clave: true },
      fecha: { texto: "Publicada hoy a las 07:10, con firma de la reportera y una hora de actualización visible.", clave: true },
    },
    decisiva: "Las fuentes son identificables (el comunicado del organismo), el medio tiene historial y contacto, y otros medios lo confirman. Todo concuerda: verdadera.",
  },
  {
    id: "p5",
    foto: "ciclovia",
    alt: "Avenida con ciclovía pintada y varios ciclistas circulando",
    formato: "flash",
    autor: "@vigia_metro",
    medio: "El Vigía Metropolitano",
    dominio: "elvigiametropolitano.mx",
    fecha: "Hoy, 09:30",
    compartidos: "6 800 veces",
    titular: "¡ALARMA! Accidentes de ciclistas suben 300 % en la ciudad",
    cuerpo: "Según datos oficiales, los accidentes en bicicleta aumentaron 300 % este año. Piden cerrar las ciclovías «antes de que haya más víctimas».",
    veredicto: "enganosa",
    evidencias: {
      imagen: { texto: "Búsqueda inversa: es una foto propia del medio, tomada en la ciclovía; no hay manipulación ni uso previo.", clave: false },
      sitio: { texto: "Medio con 6 años de existencia, datos de contacto y firma de autor. No es un sitio falso: por eso hay que leer qué dice realmente el dato.", clave: false },
      medios: { texto: "Otro medio cita la misma cifra: 8 casos frente a 41 000 accidentes de tránsito del año (0.02 %). El informe del organismo de movilidad aclara que el uso de bicicleta creció varias veces desde que abrió la ciclovía.", clave: true },
      completo: { texto: "En letras pequeñas al final: «de 2 a 8 casos». La ciudad tuvo 41 000 accidentes de tránsito, y la ciclovía abrió en marzo, con muchos más ciclistas. El 300 % es cierto, pero sin esos datos asusta de más.", clave: true },
      fecha: { texto: "La cifra viene del informe de movilidad del mes pasado: el dato existe y es real.", clave: false },
    },
    decisiva: "El 300 % es matemáticamente cierto (de 2 a 8 casos) pero se presenta sin contexto: son 8 de 41 000 accidentes y hay muchos más ciclistas. Dato real usado para engañar: engañosa.",
  },
  {
    id: "p6",
    foto: "paloma",
    alt: "Paloma sobre un atril con micrófonos frente a un edificio de ayuntamiento y público",
    formato: "muro",
    autor: "@tio_alfonso_77",
    medio: "El Chisme Chistoso",
    dominio: "elchismechistoso.com.mx",
    fecha: "Hoy, 12:05",
    compartidos: "9 300 veces",
    titular: "Paloma recibe la «Llave de la Ciudad» y promete «más migajas para todos»",
    cuerpo: "«¡No lo puedo creer, qué barbaridad, ya ni respetan los honores!», escribió quien la compartió. El presidente municipal «aplaudió con las alas».",
    veredicto: "satira",
    evidencias: {
      imagen: { texto: "Búsqueda inversa: la imagen aparece primero en el propio sitio, en la sección «Fotomontajes de la semana». No existe ningún acto con una paloma en un atril.", clave: true },
      sitio: { texto: "En «Acerca de» dice: «Portal de humor y sátira. Nada de lo publicado es real». Dominio con 4 años y sección de chistes.", clave: true },
      medios: { texto: "Ningún medio reporta el acto; el ayuntamiento no tiene ceremonia en su agenda. Esto lo hace falso como noticia, pero no explica por qué se publicó.", clave: true },
      completo: { texto: "Al final de la nota: «Este sitio es de humor y sátira. Todo lo publicado es ficticio». La paloma habla con frases absurdas.", clave: true },
      fecha: { texto: "La firma es «La Redacción Chistosa», un seudónimo del sitio de humor.", clave: false },
    },
    decisiva: "El propio sitio se declara de humor y la nota es absurda a propósito. No quiere engañar: el problema es quien la comparte como si fuera real. Es sátira, no un bulo.",
  },
];

/** Minutos de investigación disponibles para todo el feed. */
export const PRESUPUESTO = 16;
