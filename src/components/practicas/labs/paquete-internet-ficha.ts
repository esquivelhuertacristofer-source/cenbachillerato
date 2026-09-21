/**
 * Datos de la Ficha Teórica del laboratorio "El viaje de un paquete por
 * Internet" (CD-I, progresión 6 de Cultura Digital I; actividades CD-I-P10).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Uso responsable de la IA y huella ambiental
 *     de lo digital» (3 párrafos).
 *   - Glosario: glosario interactivo A5 (4 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./paquete-internet-data";

export const PAQUETE_INTERNET_FICHA: FichaTeoricaData = {
  ancla: "CD-I · P10 · A1 — Uso responsable de la IA y huella ambiental de lo digital",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar cómo viaja la información por Internet: paquetes, direcciones IP, DNS y routers.",
    "Calcular cuántos paquetes necesita un archivo y la latencia mínima de un envío según la distancia.",
    "Reconocer que la red busca otra ruta cuando falla un enlace y que los cables submarinos conectan los continentes.",
    "Interactuar con seguridad: revisar el dominio completo, entender qué protege HTTPS y no compartir datos personales.",
    "Usar la IA de forma crítica: verificar, descartar lo inventado y reconocer su uso respetando la autoría.",
    "Relacionar los años de uso de un dispositivo y su destino final con la contaminación digital y la basura electrónica.",
  ],

  materiales: [
    { nombre: "Red esquemática de México a España", detalle: "Casa, proveedor, routers de Guadalajara y Monterrey, centros de datos de Querétaro, Ashburn y Madrid.", icono: "fa-network-wired" },
    { nombre: "Servidor DNS", detalle: "Traduce nombres de dominio a direcciones IP.", icono: "fa-address-book" },
    { nombre: "Cable submarino MAREA", detalle: "Virginia Beach (EE. UU.) – Bilbao (España), 6 600 km, tendido en 2017.", icono: "fa-water" },
    { nombre: "Wifi pública con un espía", detalle: "Muestra qué alcanza a leer alguien de la misma red con HTTP y con HTTPS.", icono: "fa-user-secret" },
    { nombre: "Asistente de IA de ejemplo", detalle: "Devuelve cinco afirmaciones: tres correctas y dos que hay que descartar.", icono: "fa-robot" },
    { nombre: "Teléfono inteligente desarmado", detalle: "Pantalla, batería y tarjeta con metales recuperables.", icono: "fa-mobile-screen-button" },
  ],

  conceptos: [
    {
      termino: "Paquete",
      definicion: "Trozo de un mensaje con su encabezado (dirección de origen, de destino y número de orden). En Ethernet cabe hasta 1 500 bytes, de los que 1 460 son datos en TCP/IP: una foto de 3 MB viaja en unos 2 055 paquetes.",
    },
    {
      termino: "DNS y dirección IP",
      definicion: "Cada servidor tiene una dirección IP numérica; el sistema de nombres de dominio (DNS) traduce nombres fáciles de recordar a esa dirección antes de enviar los paquetes.",
    },
    {
      termino: "Enrutamiento",
      definicion: "Cada router reenvía el paquete por el mejor camino que conoce. Si un enlace falla, los routers recalculan la ruta: Internet resiste fallas porque tiene caminos redundantes.",
    },
    {
      termino: "Latencia",
      definicion: "Tiempo que tarda un paquete en llegar. La luz viaja por la fibra a unos 200 000 km/s, así que cada 1 000 km suman al menos 5 ms de ida; los equipos agregan más.",
    },
    {
      termino: "HTTPS y phishing",
      definicion: "HTTPS cifra los datos entre tu equipo y el servidor, de modo que quien comparte tu wifi solo ve bytes sin sentido. El candado no prueba que el sitio sea legítimo: el phishing imita dominios, así que hay que leer el dominio completo.",
    },
    {
      termino: "Huella de fabricación",
      definicion: "En un teléfono, la mayor parte de las emisiones ocurre al fabricarlo. Repartida entre más años de uso, la huella por año baja: alargar la vida del aparato es la acción más eficaz.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Al abrir un enlace, leer el dominio completo de derecha a izquierda antes de escribir una contraseña.",
    "En una wifi pública, usar solo sitios con HTTPS y evitar trámites con datos sensibles.",
    "Declarar en una tarea para qué se usó la IA y verificar sus datos en fuentes confiables.",
    "Descargar los videos pesados con wifi en lugar de datos móviles: la red móvil gasta más energía por gigabyte.",
    "Llevar celulares, cargadores y baterías a un centro de acopio de residuos electrónicos en lugar de tirarlos.",
  ],

  fuente: FUENTE,
};
