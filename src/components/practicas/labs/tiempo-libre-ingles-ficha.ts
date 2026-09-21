/**
 * Ficha teórica — tiempo-libre-ingles
 *
 * Contenido VERBATIM de la progresión IN-II-P02 (Inglés II). El marco teórico
 * son los párrafos de IN-II-P02-A1 («Free Time Activities: What Do People
 * Do?»); el glosario, los seis términos de IN-II-P02-A5; las aplicaciones, las
 * frases de la lectura sobre el tiempo libre en México.
 *
 * Los `conceptos` son las seis nociones que el laboratorio hace manipular
 * (y que la Expedición reparte como cartas antes de entrar): no repiten
 * ninguno de los términos del glosario, para que el capítulo de cierre no
 * pregunte lo mismo que el de apertura.
 */
import type { FichaTeoricaData } from "./_ficha";

export const TIEMPO_LIBRE_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-II-P02-A1 · Free Time Activities: What Do People Do?",
  marcoTeorico: [
    "Talking about what people do in their free time is one of the most common topics in everyday English conversation. It helps you connect with others, share interests, and practice one of the most important verb tenses in English: the simple present.",
    "The simple present is used to talk about routines, habits, and facts. For I, you, we, and they, the verb stays in its base form: I play football. We watch movies on weekends. They listen to music. For he, she, and it (third person singular), the verb changes: she plays, he watches, it runs. Most verbs simply add -s (play → plays, read → reads). Verbs ending in -sh, -ch, -x, -o, or -ss add -es (watch → watches, go → goes). Verbs ending in a consonant + y change the y to i and add -es (study → studies).",
    "To make questions in the simple present with he or she, use does: Does he play basketball? Does she cook at home? Does your brother study English? Short answers use does or does not: Yes, he does. No, she does not.",
    "Common vocabulary for leisure activities includes: play sports, watch TV series, listen to music, hang out with friends, go to the park, cook, read books or comics, dance, take photos, play video games, go swimming, do yoga, paint or draw.",
    "Frequency adverbs tell us how often someone does an activity. From most to least frequent: always (100%), usually (about 80%), often (about 60%), sometimes (about 40%), rarely or seldom (about 20%), never (0%). In a sentence, frequency adverbs go before the main verb: She always dances at parties. He never misses a football game. They sometimes go to the cinema.",
    'The verb "go" is often followed by a gerund (-ing form) for activities: go swimming, go dancing, go shopping, go hiking. This is a fixed structure in English: you cannot say "go to swim" in the same way. Note also "play" (for sports and games with rules: play football, play chess) vs "go" (for activities: go swimming, go running).',
  ],
  objetivos: [
    "Ajustar el verbo al sujeto: reconocer cuándo he, she e it obligan a marcar la tercera persona y cuándo I, you, we y they la dejan en forma base.",
    "Aplicar las tres reglas de la -s (añadir -s, añadir -es, cambiar y por ies) clasificando verbos nuevos, sin memorizar listas.",
    "Construir negativas y preguntas con don't / doesn't y do / does, devolviendo el verbo principal a su forma base.",
    "Colocar los adverbios de frecuencia en su posición: antes del verbo principal y después del verbo «to be».",
    "Completar el párrafo de IN-II-P02-A2 escribiendo las formas de tercera persona.",
  ],
  materiales: [
    { nombre: "Dial de sujetos", detalle: "Ocho sujetos que giran sobre la misma oración", icono: "fa-arrows-rotate" },
    { nombre: "Tablero de reglas", detalle: "Doce verbos y las tres columnas de la -s", icono: "fa-table-columns" },
    { nombre: "Máquina de auxiliares", detalle: "do / does / don't / doesn't y la forma del verbo", icono: "fa-gears" },
    { nombre: "Regla de frecuencia", detalle: "Escala de always a never con sus porcentajes", icono: "fa-ruler-horizontal" },
    { nombre: "Párrafo con huecos", detalle: "El texto verbatim de IN-II-P02-A2", icono: "fa-pen-to-square" },
  ],
  conceptos: [
    {
      termino: "Simple present",
      definicion:
        "Tiempo verbal del inglés para rutinas, hábitos y hechos: «I play football», «She reads comics».",
    },
    {
      termino: "Third person -s",
      definicion:
        "La marca que llevan he, she e it en el verbo: she plays, he watches, it runs. Con I, you, we y they no aparece.",
    },
    {
      termino: "Add -es",
      definicion:
        "Regla para los verbos terminados en -sh, -ch, -x, -o o -ss: watch → watches, go → goes, miss → misses.",
    },
    {
      termino: "y → ies",
      definicion:
        "Regla para los verbos terminados en consonante + y: study → studies, fly → flies. Si antes de la y hay vocal, no cambia: play → plays.",
    },
    {
      termino: "Base form",
      definicion:
        "El verbo sin ninguna marca. Es la forma que reaparece después de do, does, don't y doesn't: «She doesn't play».",
    },
    {
      termino: "Frequency adverbs",
      definicion:
        "always, usually, often, sometimes, never. Van antes del verbo principal y después del verbo «to be».",
    },
  ],
  glosario: [
    { termino: "don't / doesn't", definicion: "Formas negativas del presente simple (do not / does not)." },
    { termino: "Do / Does ...?", definicion: "Auxiliares para hacer preguntas en presente simple." },
    { termino: "short answers", definicion: "Respuestas cortas: Yes, I do / No, he doesn't." },
    { termino: "hobby", definicion: "Pasatiempo, actividad de ocio." },
    { termino: "to hang out", definicion: "Pasar el rato con amigos." },
    { termino: "to play video games", definicion: "Jugar videojuegos." },
  ],
  aplicaciones: [
    "In Mexico, free time activities often involve the community and the family. Many young people spend Sunday afternoons in the zocalo or plaza of their town, meeting friends or watching local events.",
    "Playing football (futbol) is the most popular sport across all social groups.",
    "Going to the tianguis on weekends — the open-air market — is a family and social activity in many Mexican communities.",
    "Dancing salsa, cumbia, or regional music is a form of social connection, and family meals on Sundays are a cherished tradition for many Mexican households.",
  ],
  fuente: "CEN Bachillerato — UAC Inglés II",
};
