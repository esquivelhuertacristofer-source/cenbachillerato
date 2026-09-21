/**
 * Ficha teórica — reescritura-taller
 *
 * Contenido VERBATIM de la progresión LC-II-P06 (Lengua y Comunicación II).
 * El marco teórico es la lectura LC-II-P06-A1 íntegra; el glosario sale de
 * LC-II-P06-A5 más «Condensación», que la propia lectura A1 define; los
 * conceptos centrales son los que el laboratorio hace manipular.
 *
 * Esta ficha arma además los capítulos «Prepárate» y «Comprueba» de la
 * Expedición: por eso los términos son cortos y concretos.
 */
import type { FichaTeoricaData } from "./_ficha";
import { LECTURA_A1 } from "./reescritura-taller-data";

export const REESCRITURA_FICHA: FichaTeoricaData = {
  ancla: "LC-II-P06-A1 · El arte de reescribir: transformar un texto",
  marcoTeorico: LECTURA_A1,
  objetivos: [
    "Opera tres borradores reales: quita las muletillas, las repeticiones y el relleno, y mira bajar el contador de palabras sin perder información.",
    "Elige, para cada defecto concreto, cuál de las cuatro operaciones lo repara: suprimir, sustituir, reordenar o ampliar.",
    "Aplica una marca de corrector tal cual: ni de más ni de menos, ni cambiándola por otra reescritura.",
    "Decide qué versión cumple el propósito declarado —y comprueba que la misma versión gana o pierde cuando el propósito cambia.",
    "Escribe de memoria los cinco términos del glosario, completa el texto de la progresión y aprueba el reto evaluable.",
  ],
  materiales: [
    { nombre: "Tres borradores por operar", detalle: "Aviso vecinal, diario de viaje y reporte escolar", icono: "fa-file-pen" },
    { nombre: "Contador de palabras", detalle: "Baja en vivo conforme cae lo que sobra", icono: "fa-hashtag" },
    { nombre: "Caja de operaciones", detalle: "Suprimir, sustituir, reordenar y ampliar", icono: "fa-toolbox" },
    { nombre: "Marcas de corrector", detalle: "Deleatur, inserción, transposición, sustitución y calderón", icono: "fa-pen-nib" },
    { nombre: "Banco de defectos", detalle: "Doce oraciones con su diagnóstico y su arreglo", icono: "fa-clipboard-list" },
    { nombre: "Mesa de versiones", detalle: "Seis parejas antes/después con su propósito declarado", icono: "fa-scale-balanced" },
  ],
  conceptos: [
    { termino: "Reescritura", definicion: "Transformación profunda de un texto para que sea más claro, más rico o más adecuado a su propósito." },
    { termino: "Amplificación", definicion: "Añadir detalles sensoriales, ejemplos, datos o contexto que enriquecen la comprensión del lector." },
    { termino: "Condensación", definicion: "Eliminar lo redundante y las frases de relleno para que cada palabra cuente." },
    { termino: "Voz narrativa", definicion: "Persona desde la que se cuenta; cambiarla convierte un reporte en testimonio." },
    { termino: "Sustitución léxica", definicion: "Reemplazar una palabra por otra de registro y precisión más adecuados." },
    { termino: "Propósito comunicativo", definicion: "Lo que el texto busca lograr; es lo que decide qué versión es la buena." },
    { termino: "Muletilla", definicion: "Fórmula que se repite por costumbre y no aporta información al lector." },
    { termino: "Marca de corrector", definicion: "Signo con que se anota en un borrador la operación que debe aplicarse." },
    { termino: "Distancia temporal", definicion: "Dejar pasar horas o días para releer el propio texto con ojos más frescos." },
  ],
  glosario: [
    { termino: "Conector textual", definicion: "Palabra o frase que enlaza ideas y marca su jerarquía u orden." },
    { termino: "Trama", definicion: "Conjunto ordenado de acontecimientos que forman la historia." },
    { termino: "Conflicto", definicion: "Problema o situación de tensión que enfrenta el personaje." },
    { termino: "Tipo de narración", definicion: "Clase de relato según su contenido: realista, fantástica, histórica o autobiográfica." },
    { termino: "Tono narrativo", definicion: "Actitud o intención emocional con que se cuenta la historia." },
    { termino: "Condensación", definicion: "Estrategia de reescritura que elimina lo ya dicho y las frases de relleno." },
  ],
  aplicaciones: [
    "En México el proceso editorial muestra estas estrategias en acción: editoriales como Almadía, con sede en Oaxaca, son conocidas por su cuidado minucioso de los manuscritos, y sus editores trabajan con los autores en varias rondas de revisión antes de que un libro llegue a la imprenta (lectura A1).",
    "La reescritura no vive solo en la literatura: un aviso de la escuela que se entiende a la primera, un reporte que otro equipo puede repetir y una solicitud que no se malinterpreta son textos que pasaron por una segunda versión.",
    "Un buen ejercicio, dice la lectura A1, es tomar un párrafo propio, leerlo en voz alta y preguntar: ¿qué palabra podría eliminarse sin que se pierda significado? ¿Qué imagen podría añadirse para que el lector vea lo que yo vi?",
  ],
  fuente: "CEN Bachillerato — UAC Lengua y Comunicación II",
};
