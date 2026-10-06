/**
 * Ficha teórica — campo-estudio-ingles (IN-V-P01, Inglés V).
 *
 * El marco teórico es VERBATIM de la lectura A1 «Describing your field of
 * interest in English», partida en párrafos. Los `conceptos` son las seis
 * frases del glosario A5 con su definición verbatim: son las piezas con las
 * que el alumno arma la descripción en la feria de carreras. El `glosario`
 * reúne los términos cortos: los siete campos del vocabulario temático de A1
 * (con la traducción y el ejemplo de la propia lectura) y «major» / «career»,
 * definidos con la retroalimentación verbatim del reactivo 4 de A4.
 */
import type { FichaTeoricaData } from "./_ficha";

export const CAMPO_ESTUDIO_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-V-P01-A1 · Describing your field of interest in English",
  marcoTeorico: [
    "En Inglés V trabajamos con el inglés académico y profesional de nivel B1. Una de las primeras habilidades que desarrollarás es describir tu área de estudio o carrera de interés en inglés. Esto es fundamental para entrevistas, presentaciones escolares y proyectos colaborativos.",
    "Estructura básica: • \"I'm interested in [field] because...\" (Me interesa [campo] porque...) • \"My field of study is [area].\" (Mi campo de estudio es [área].) • \"In this area, we [work on / study / develop / investigate]...\" (En esta área, [trabajamos en / estudiamos / desarrollamos / investigamos]...)",
    "Conectores esenciales para estructurar una descripción: • First (primero) — \"First, I want to explain what my field is about.\" • Also (también) — \"I also enjoy working with data and statistics.\" • Moreover / In addition (además) — \"Moreover, this field is growing rapidly in Mexico.\" • Finally (finalmente) — \"Finally, I hope to specialize in biotechnology.\"",
    "My name is Rodrigo and I study at the Centro de Bachillerato Tecnológico in Puebla. I am very interested in biotechnology because I believe it can solve some of Mexico's most important health and food challenges.",
    "In my field of study, we investigate how living organisms — like bacteria and plants — can be used to develop medicines, improve crops, and clean contaminated water. I am also interested in how institutions like the UNAM and the CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) in Mexico City conduct cutting-edge research in this area.",
    "First, I want to complete my bachillerato with strong grades in biology and chemistry. In addition, I plan to participate in a science fair this semester with a project about natural water filtration using local plants. Moreover, I have started watching videos from Mexican scientists on YouTube to understand current research. Finally, my goal is to study biochemical engineering at the Universidad Autónoma Metropolitana.",
    "I am still learning English, but I know that most scientific articles are published in English — so improving my language skills is also part of my plan.",
  ],
  objetivos: [
    "Observar un lugar de trabajo y deducir, por sus herramientas, a qué campo de estudio pertenece.",
    "Describir un campo en inglés con las frases del glosario: My field of study is…, This area involves…, Professionals in this field…, It is related to…, One of the main goals of this field is to…",
    "Comprobar qué pasa cuando se mezclan dos campos o se rompe una regla (involve + -ing, related TO, goal is TO + verbo, my field IS).",
    "Ordenar una presentación con los conectores First, Also, Moreover / In addition y Finally.",
    "Escribir en inglés los nombres de los campos de estudio frecuentes en México.",
  ],
  materiales: [
    { nombre: "Cuatro estaciones de una feria de carreras", detalle: "Lugares de trabajo ficticios con cuatro objetos cada uno para observar.", icono: "fa-store" },
    { nombre: "Seis frases del glosario", detalle: "Las estructuras de A5 para presentar, explicar y dar la meta de un campo.", icono: "fa-quote-left" },
    { nombre: "Tres visitantes", detalle: "Personajes ficticios que reaccionan a tu descripción y se registran si la entienden.", icono: "fa-people-group" },
    { nombre: "Cuatro conectores", detalle: "First, Also, Moreover / In addition, Finally (A1).", icono: "fa-link" },
  ],
  conceptos: [
    { termino: "My field of study is...", definicion: "A simple and direct phrase to introduce the area or discipline you are studying. 'Field' means a domain of knowledge or professional activity." },
    { termino: "I'm currently studying...", definicion: "A phrase using the present continuous to describe your current field or course of study. It indicates an ongoing activity happening now." },
    { termino: "This area involves...", definicion: "Used to explain what activities, skills, or tasks are part of a particular field. 'Involve' is followed by a gerund (verb + -ing)." },
    { termino: "Professionals in this field...", definicion: "A phrase to describe what experts or workers in your area of study typically do. It introduces typical tasks, roles, or responsibilities." },
    { termino: "It is related to...", definicion: "A phrase to show connections between your field and other topics, subjects, or real-world applications. Preposition 'to' is always used after 'related'." },
    { termino: "One of the main goals of this field is to...", definicion: "A structure to describe the purpose or objective of a field of study. 'Goal' = objective or aim. Use 'to + infinitive' after 'goal is'." },
  ],
  glosario: [
    { termino: "technology", definicion: "tecnología — \"I'm interested in technology because it solves real-world problems.\"" },
    { termino: "health", definicion: "salud — \"My field is health science. We study how the body functions.\"" },
    { termino: "environment", definicion: "medio ambiente — \"In environmental science, we investigate how human activities affect ecosystems.\"" },
    { termino: "education", definicion: "educación — \"I'm passionate about education because every child deserves to learn.\"" },
    { termino: "arts", definicion: "artes — \"In the arts, we explore creativity and cultural expression.\"" },
    { termino: "sports", definicion: "deporte — \"I'm interested in sports medicine because I want to help athletes recover.\"" },
    { termino: "business", definicion: "negocios — \"My field is business administration. We develop strategies for organizations.\"" },
    { termino: "major", definicion: "'Major' refers specifically to the main subject or area of study at a university level." },
    { termino: "career", definicion: "'Career' refers to a person's professional life or occupation over time." },
  ],
  aplicaciones: [
    "En inglés las profesiones llevan artículo: «I want to be an engineer», «She is a nurse». En español decimos «quiero ser ingeniero», sin artículo.",
  ],
  fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
};
