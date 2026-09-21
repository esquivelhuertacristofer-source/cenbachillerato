/**
 * Ficha teórica — procedimientos-narrativos (LC-II-P07).
 *
 * El marco teórico es VERBATIM de LC-II-P07-A1 («Análisis colaborativo: leer y
 * mejorar entre varios»), más un párrafo de cierre que explica de qué va este
 * laboratorio, porque la lectura de la progresión habla del trabajo en equipo y
 * la práctica trabaja los procedimientos que ese equipo tiene que reconocer.
 *
 * El glosario reúne los cuatro términos VERBATIM de LC-II-P07-A5 y dos más
 * («Final abierto» y «Narrador testigo») redactados a partir de las
 * retroalimentaciones VERBATIM del quiz A2 y del trabajo del laboratorio.
 *
 * Los «conceptos centrales» son las ocho piezas de maquinaria narrativa que el
 * alumno manipula en los cuatro modos. Términos cortos: cada uno recibe una
 * viñeta ilustrada en la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";

export const PROCEDIMIENTOS_NARRATIVOS_FICHA: FichaTeoricaData = {
  ancla: "LC-II-P07-A2 · Procedimientos narrativos: identificando técnicas",
  marcoTeorico: [
    "Leer en compañía transforma la experiencia del texto. Cuando analizamos un texto de manera colaborativa, cada persona aporta una perspectiva diferente: lo que una persona pasó por alto, otra lo nota; lo que a una le parece confuso, a otra le resulta claro. El resultado es una comprensión más rica y profunda que la que cualquiera lograría leyendo solo.",
    "El análisis colaborativo de textos tiene varios pasos: (1) lectura individual inicial, (2) identificación personal de elementos narrativos (trama, personajes, tema, tono), (3) puesta en común y discusión de interpretaciones, (4) retroalimentación constructiva entre pares, (5) revisión y mejora colectiva del texto analizado.",
    "Durante el proceso, es importante mantener una actitud de respeto y apertura: el objetivo no es “ganar” la discusión sino aprender del texto y de los demás. La retroalimentación constructiva señala con claridad tanto los aciertos como los aspectos a mejorar, y siempre se enfoca en el texto, no en la persona que lo escribió.",
    "Para poder señalar algo de un relato hay que saber cómo está armado. Un relato tiene dos órdenes: el de los hechos (la historia) y el de la narración (el discurso); tiene una voz que lo cuenta y que, por eso mismo, no puede contarlo todo; tiene un ritmo, porque no dedica el mismo texto a un minuto que a cuatro meses; y tiene una forma de meter las palabras de los personajes. Analepsis, prolepsis, elipsis, pausa, focalización y estilo indirecto libre son los nombres de esas piezas. Este laboratorio las desarma y las vuelve a armar sobre relatos de taller.",
  ],
  objetivos: [
    "Distingue el orden de los hechos (la historia) del orden en que se cuentan (el discurso).",
    "Reconoce y nombra una analepsis y una prolepsis dentro de un relato.",
    "Compara la misma escena contada por un narrador protagonista, uno testigo y uno omnisciente.",
    "Decide qué información puede dar cada voz y cuál se le escapa.",
    "Clasifica fragmentos por su ritmo: resumen, escena, elipsis y pausa descriptiva.",
    "Convierte el estilo directo en indirecto ajustando conector, deíctico, pronombre y verbo.",
    "Reconoce el estilo indirecto libre por lo que le falta.",
    "Aprueba el reto evaluable con 70% o más.",
  ],
  materiales: [
    { nombre: "Dos relatos de taller", detalle: "Cinco párrafos cada uno, con su orden de hechos escondido.", icono: "fa-timeline" },
    { nombre: "Escena en tres voces", detalle: "El mismo apagón narrado por la dueña, por un testigo y por una voz omnisciente.", icono: "fa-masks-theater" },
    { nombre: "Mesa del ritmo", detalle: "Ocho fragmentos que medir contra el reloj de la historia.", icono: "fa-gauge-high" },
    { nombre: "Mesa de conversión", detalle: "Cuatro diálogos que pasar de un estilo a otro pieza por pieza.", icono: "fa-comments" },
  ],
  conceptos: [
    { termino: "Historia y discurso", definicion: "La historia es el orden en que pasaron los hechos; el discurso, el orden en que el texto los cuenta. Casi nunca coinciden." },
    { termino: "Analepsis", definicion: "Salto hacia atrás: el relato interrumpe el orden cronológico para contar algo anterior. También se le dice retrospección o flashback." },
    { termino: "Prolepsis", definicion: "Salto hacia adelante: el relato anticipa un hecho posterior y luego vuelve a la línea principal." },
    { termino: "Elipsis", definicion: "Tramo de tiempo que el relato se salta y no cuenta. El lector sabe que pasó algo justamente porque falta." },
    { termino: "Pausa descriptiva", definicion: "El tiempo de la historia se detiene y el texto sigue: solo se describe, nada avanza." },
    { termino: "Focalización", definicion: "Desde qué conciencia se percibe la historia. Si es interna, la información queda limitada al punto de vista de un personaje." },
    { termino: "Narrador omnisciente", definicion: "Voz que no está en la escena y lo sabe todo: las dos cabezas, lo que pasa afuera y lo que va a pasar." },
    { termino: "Estilo indirecto libre", definicion: "El pensamiento del personaje sin «dijo que»: conserva la tercera persona y el tiempo del narrador, pero suena a voz propia." },
  ],
  glosario: [
    { termino: "Procedimiento narrativo", definicion: "Recurso o estrategia que se usa para construir una narración." },
    { termino: "Texto colaborativo", definicion: "Texto creado entre varias personas que aportan y acuerdan ideas." },
    { termino: "Diálogo entre pares", definicion: "Conversación entre compañeros para compartir ideas y puntos de vista." },
    { termino: "Retroalimentación", definicion: "Comentarios que señalan aciertos y aspectos a mejorar de un trabajo." },
    { termino: "Final abierto", definicion: "Desenlace que no resuelve el conflicto de forma explícita y deja la resolución a la interpretación del lector." },
    { termino: "Narrador testigo", definicion: "Narrador que cuenta desde fuera lo que vio: sabe lo que ocurrió delante de él, pero no lo que pensaron los demás." },
  ],
  aplicaciones: [
    "Una sola frase puede llevar dos procedimientos a la vez. «Cien años de soledad» (Gabriel García Márquez, 1967) empieza así: «Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo». La primera mitad se adelanta al futuro (prolepsis) y la segunda retrocede a la infancia (analepsis); la línea principal todavía no ha empezado.",
    "«Pedro Páramo» (Juan Rulfo, 1955) abre con un narrador en primera persona que solo sabe lo que le han dicho: «Vine a Comala porque me dijeron que acá vivía mi padre, un tal Pedro Páramo». Toda la novela se sostiene en lo que ese narrador NO puede saber: elegir la voz es elegir lo que el lector va a ignorar.",
    "Los nombres técnicos de estos procedimientos —analepsis, prolepsis, elipsis, pausa, escena, resumen— vienen del estudio de Gérard Genette «Figures III» (1972), que sigue siendo la referencia con la que se analizan el orden, la duración y la voz de un relato.",
    "Analizar en equipo sirve para esto: entre varios se detectan procedimientos que en solitario pasan desapercibidos, y así se pueden conocer, aprovechar o corregir en los propios textos.",
  ],
  fuente: "Material elaborado para CEN Bachillerato — LC-II · progresión LC-II-P07",
};
