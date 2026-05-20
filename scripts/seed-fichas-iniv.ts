/**
 * Seed de fichas de biblioteca para IN-IV (Inglés IV — A2+). 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 4.
 * Uso: npx tsx scripts/seed-fichas-iniv.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ---------------------------------------------------------------------------
// FICHAS
// ---------------------------------------------------------------------------

const FICHAS_INIV = [
  // ── 1 ── Gramática A2+ ────────────────────────────────────────────────────
  {
    slug: "in-iv-past-simple-irregular",
    titulo: "Past Simple irregular: los 30 verbos más usados",
    categoria: "Gramática A2+",
    conceptos_clave: ["past simple", "irregular verbs", "verbos irregulares", "pasado simple", "narración"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los verbos irregulares son el corazón de cualquier narración en inglés. A diferencia de los verbos regulares que solo agregan -ed, cada verbo irregular tiene su propia forma en pasado que debes memorizar. La buena noticia es que los 30 verbos irregulares más comunes cubren más del 80% de las situaciones de comunicación cotidiana a nivel A2+. En el semestre 4, aprenderás a usarlos con fluidez para narrar experiencias pasadas, contar anécdotas y describir eventos en orden cronológico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los 30 verbos irregulares esenciales",
        },
        {
          tipo: "lista",
          items: [
            "be → was/were (ser/estar): I was tired. They were at the market. / Estaba cansado. Estaban en el mercado.",
            "go → went (ir): Last summer, I went to Teotihuacán with my family. / El verano pasado fui a Teotihuacán con mi familia.",
            "come → came (venir): She came to class late. / Ella llegó tarde a clase.",
            "see → saw (ver): We saw the Pyramid of the Sun. / Vimos la Pirámide del Sol.",
            "have → had (tener): He had a great idea. / Él tuvo una gran idea.",
            "do → did (hacer): I did my homework. / Hice mi tarea.",
            "say → said (decir): She said goodbye. / Ella dijo adiós.",
            "get → got (obtener/llegar): They got home at midnight. / Llegaron a casa a medianoche.",
            "make → made (hacer/preparar): My mom made tamales. / Mi mamá hizo tamales.",
            "know → knew (saber/conocer): I knew the answer. / Yo sabía la respuesta.",
            "think → thought (pensar): We thought it was amazing. / Pensamos que era increíble.",
            "take → took (tomar): She took the bus. / Ella tomó el autobús.",
            "leave → left (salir/dejar): He left at 7 am. / Él salió a las 7 am.",
            "give → gave (dar): My teacher gave me a book. / Mi maestra me dio un libro.",
            "find → found (encontrar): They found the keys. / Encontraron las llaves.",
            "tell → told (contar/decir): She told a funny story. / Ella contó una historia chistosa.",
            "feel → felt (sentir): I felt nervous. / Me sentí nervioso/a.",
            "buy → bought (comprar): We bought food at the market. / Compramos comida en el mercado.",
            "eat → ate (comer): He ate tacos de canasta. / Él comió tacos de canasta.",
            "write → wrote (escribir): I wrote a letter. / Escribí una carta.",
            "read → read (leer — igual, pero pronunciación diferente): She read the whole book. / Ella leyó el libro completo.",
            "run → ran (correr): I ran to the bus stop. / Corrí a la parada del autobús.",
            "begin → began (comenzar): The concert began at 9 pm. / El concierto comenzó a las 9 pm.",
            "speak → spoke (hablar): I spoke English with a tourist. / Hablé inglés con un turista.",
            "meet → met (conocer/encontrarse): I met my best friend in secondary school. / Conocí a mi mejor amigo/a en la secundaria.",
            "sleep → slept (dormir): I slept eight hours. / Dormí ocho horas.",
            "drive → drove (manejar): My uncle drove us to the airport. / Mi tío nos llevó al aeropuerto.",
            "break → broke (romper): He broke his phone. / Él rompió su teléfono.",
            "bring → brought (traer): She brought food for everyone. / Ella trajo comida para todos.",
            "choose → chose (elegir): We chose the window seat. / Elegimos el asiento de la ventana.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Truco para memorizar verbos irregulares: agrúpalos por patrones de cambio. Grupo i→a: begin/began, drink/drank, swim/swam, sing/sang, ring/rang. Grupo i→u o i→a→u: buy/bought, bring/brought, think/thought. Grupo igual en las tres formas: cut/cut/cut, put/put/put, read/read/read. Estudiar grupos es tres veces más eficiente que memorizar cada verbo por separado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de los 30 verbos irregulares más comunes organizados por grupos de patrones de cambio, con forma base, past simple y traducción al español",
          caption: "Los verbos irregulares del Past Simple tienen patrones que facilitan su memorización.",
        },
      ],
    },
  },

  // ── 2 ── Gramática A2+ ────────────────────────────────────────────────────
  {
    slug: "in-iv-past-continuous-uso",
    titulo: "Past Continuous: was/were + verb-ing",
    categoria: "Gramática A2+",
    conceptos_clave: ["past continuous", "was/were + ing", "acciones en progreso", "when/while", "pasado continuo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Past Continuous (pasado continuo) describe una acción que estaba en progreso en un momento específico del pasado. Se forma con was o were seguido del verbo en -ing. Es especialmente útil para narrar situaciones: establece el escenario o contexto de una historia, y se combina con el Past Simple para señalar que una acción interrumpió a otra que ya estaba ocurriendo. Esta combinación es fundamental para contar anécdotas en inglés A2+.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formación del Past Continuous",
        },
        {
          tipo: "lista",
          items: [
            "Afirmativa: sujeto + was/were + verbo-ing. I was studying. (Estaba estudiando.) / They were dancing. (Estaban bailando.)",
            "Negativa: sujeto + was not (wasn't) / were not (weren't) + verbo-ing. She wasn't listening. / We weren't paying attention.",
            "Interrogativa: Was/Were + sujeto + verbo-ing? Were you sleeping? / What was he doing?",
            "was con I, he, she, it: I was reading. / She was cooking.",
            "were con you, we, they: They were playing. / You were talking.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Past Continuous + Past Simple: acción interrumpida",
        },
        {
          tipo: "parrafo",
          contenido:
            "La combinación más importante del Past Continuous es con el Past Simple para expresar que una acción en progreso fue interrumpida por otra. Se usa cuando (when) o mientras (while). Estructura con when: I was doing X when Y happened. Ejemplos: 'Yesterday I was watching TV when my phone rang.' (Ayer estaba viendo la tele cuando me llamaron.) / 'She was cooking when the lights went out.' (Ella estaba cocinando cuando se fue la luz.) / 'We were climbing the Pyramid of the Sun when it started to rain.' (Estábamos subiendo la Pirámide del Sol cuando empezó a llover.) Estructura con while: While I was sleeping, someone knocked at the door. (Mientras yo dormía, alguien tocó a la puerta.) / While they were studying, the teacher arrived. (Mientras ellos estudiaban, llegó el maestro.)",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que el Past Continuous también se usa para describir el escenario o ambiente de una historia? Es la diferencia entre una narrativa plana y una narrativa vívida. Compara: PLANO: 'I was in the park. A dog ran to me.' VÍVIDO: 'I was sitting on a bench in Alameda Central Park. The sun was shining and children were playing nearby. Suddenly, a dog ran toward me!' El Past Continuous pinta el escenario; el Past Simple narra la acción.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo que muestra una acción continua en pasado (Past Continuous) siendo interrumpida por un evento puntual (Past Simple), con ejemplos when y while",
          caption: "Past Continuous + Past Simple: la acción en progreso y la interrupción.",
        },
      ],
    },
  },

  // ── 3 ── Gramática A2+ ────────────────────────────────────────────────────
  {
    slug: "in-iv-should-shouldnt-consejos",
    titulo: "Should y shouldn't: dar y pedir consejos",
    categoria: "Gramática A2+",
    conceptos_clave: ["should", "shouldn't", "consejos", "recomendaciones", "modal verb"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Should y shouldn't son verbos modales que se usan para dar y pedir consejos, recomendaciones y sugerencias. A diferencia de must o have to, should no expresa obligación fuerte, sino una recomendación: es una buena idea hacer algo. Should se traduce generalmente como 'deberías' o 'sería buena idea'. Son fundamentales en conversaciones cotidianas donde das consejos a amigos, pides recomendaciones o expresas tu opinión sobre lo que alguien debe hacer.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de should y shouldn't",
        },
        {
          tipo: "lista",
          items: [
            "Afirmativa: sujeto + should + verbo base (sin to). You should study English every day, even if it's just 15 minutes. / She should drink more water.",
            "Negativa: sujeto + shouldn't (should not) + verbo base. You shouldn't eat junk food every day. / He shouldn't go to bed so late.",
            "Interrogativa: Should + sujeto + verbo base? Should I study for the test tonight? / What should I do?",
            "Respuesta corta: Yes, you should. / No, you shouldn't.",
            "should es invariable: no cambia con he/she/it. CORRECTO: She should study. INCORRECTO: She shoulds study.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Contextos reales para dar y pedir consejos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para pedir un consejo: 'What should I do?' / 'Should I...?' / 'What do you think I should do?' / 'Do you think I should...?' Para dar un consejo: 'You should...' / 'I think you should...' / 'Maybe you should...' / 'You really shouldn't...' Ejemplos con contexto de vida estudiantil mexicana: 'You should study English every day, even if it's just 15 minutes.' (Deberías estudiar inglés todos los días, aunque sea solo 15 minutos.) / 'You shouldn't stay up late before an exam.' (No deberías trasnochar antes de un examen.) / 'I think you should talk to your teacher about the problem.' (Creo que deberías hablar con tu maestra sobre el problema.) / 'Should I take the metro or the bus to get to UNAM?' (¿Debería tomar el metro o el autobús para llegar a la UNAM?)",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Diferencia entre should, must y have to para consejos y obligaciones: CONSEJO (sugerencia): You should exercise more. (Deberías hacer más ejercicio — es una buena idea.) OBLIGACIÓN PERSONAL: You must finish this. (Debes terminar esto — es muy importante para mí.) OBLIGACIÓN EXTERNA: You have to wear a uniform. (Tienes que usar uniforme — es la regla de la escuela.) En conversaciones de consejo cotidiano, should es la palabra correcta. Must suena muy fuerte y autoritario.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de conversación con burbujas de diálogo mostrando situaciones de dar y pedir consejos con should y shouldn't en contexto escolar mexicano",
          caption: "Should y shouldn't son los verbos modales para dar consejos y recomendaciones amistosas.",
        },
      ],
    },
  },

  // ── 4 ── Gramática A2+ ────────────────────────────────────────────────────
  {
    slug: "in-iv-be-going-to-futuro",
    titulo: "Be going to y will: hablar del futuro",
    categoria: "Gramática A2+",
    conceptos_clave: ["be going to", "will", "futuro", "planes", "predicciones"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En inglés A2+, hay dos formas principales de hablar sobre el futuro: be going to y will. Aunque ambas se traducen al español como 'va a' o 'irá', tienen usos distintos. Be going to se usa para planes ya decididos y predicciones basadas en evidencia presente. Will se usa para decisiones espontáneas, promesas y predicciones generales. Dominar la diferencia entre estas dos formas te permite hablar de manera más precisa sobre planes, metas e intenciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Be going to: planes y predicciones con evidencia",
        },
        {
          tipo: "lista",
          items: [
            "Formación: sujeto + am/is/are + going to + verbo base. I'm going to visit my grandmother next weekend. / She's going to study medicine.",
            "PLAN DECIDIDO (ya lo planeaste antes de hablar): I'm going to visit my grandmother next weekend. (Ya lo tengo planeado — tengo hasta el boleto de camión.) / We're going to watch the fútbol game tonight. (Ya sabemos que lo vamos a ver.)",
            "PREDICCIÓN CON EVIDENCIA (ves señales en el presente): Look at those clouds — it's going to rain! (¡Mira esas nubes — va a llover!) / She's going to win — she's practicing every day. (Ella va a ganar — está practicando todos los días.)",
            "Negativa: I'm not going to go. / He's not going to study.",
            "Interrogativa: Are you going to study tonight? / What are you going to do this weekend?",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Will: decisiones espontáneas, promesas y predicciones generales",
        },
        {
          tipo: "parrafo",
          contenido:
            "Will se usa para: DECISIÓN ESPONTÁNEA (decides en el momento de hablar): 'It's cold in here.' — 'I'll close the window.' (Cierro la ventana — decides en ese instante, no lo tenías planeado.) PROMESA: 'I'll call you tomorrow, I promise.' (Te llamo mañana, te lo prometo.) OFRECIMIENTO ESPONTÁNEO: 'You look tired. I'll help you with that.' (Te ves cansado/a. Te ayudo con eso.) PREDICCIÓN GENERAL sobre el futuro lejano: 'English will be even more important in the future.' (El inglés será aún más importante en el futuro.) Contracción: I will → I'll / She will → She'll / They will → They'll / will not → won't.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Regla práctica: si la acción estaba planeada ANTES de hablar → be going to. Si la decides EN EL MOMENTO de hablar → will. Ejemplo: Si alguien te pregunta '¿Qué harás este fin de semana?' y ya tenías planes: 'I'm going to see my cousins.' Si alguien te pregunta en ese momento y decides ahí mismo: 'I'll probably stay home and watch series.' Esta diferencia es clave para sonar natural en inglés A2+.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa de be going to y will con tres columnas: uso, ejemplo en inglés y contexto, más un diagrama de línea de tiempo de cuándo se formó la decisión",
          caption: "Be going to para planes previos; will para decisiones espontáneas y promesas.",
        },
      ],
    },
  },

  // ── 5 ── Gramática A2+ ────────────────────────────────────────────────────
  {
    slug: "in-iv-comparativos-superlativos-avanzado",
    titulo: "Comparatives and superlatives: advanced use",
    categoria: "Gramática A2+",
    conceptos_clave: ["comparativos", "superlativos", "as...as", "not as...as", "comparación de igualdad"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En el semestre anterior aprendiste los comparativos básicos (taller than, more beautiful than) y superlativos (the tallest, the most beautiful). En inglés A2+ ampliaremos ese conocimiento con estructuras de comparación de igualdad y desigualdad (as...as, not as...as), comparativos dobles para indicar cambio progresivo, y el uso de comparativos en contextos de expresión de preferencias y argumentos simples. Estas estructuras son esenciales para justificar preferencias y dar opiniones con más matiz.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación de igualdad: as...as",
        },
        {
          tipo: "lista",
          items: [
            "Igualdad: as + adjetivo + as (tan...como). English is as important as mathematics for your future. (El inglés es tan importante como las matemáticas para tu futuro.) / Mexico City is as exciting as New York. (La Ciudad de México es tan emocionante como Nueva York.)",
            "Desigualdad: not as + adjetivo + as (no tan...como). The north of Mexico is not as humid as the southeast. (El norte de México no es tan húmedo como el sureste.) / Spanish grammar is not as complicated as English pronunciation. (La gramática española no es tan complicada como la pronunciación inglesa.)",
            "Igualdad con sustantivos: as much...as (tanto como — no contable) / as many...as (tantos como — contable). I don't have as much time as I'd like. / She has as many friends as her sister.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Comparativos dobles y comparaciones en contexto",
        },
        {
          tipo: "parrafo",
          contenido:
            "Comparativos dobles expresan cambio progresivo: The more you practice, the better you get. (Cuanto más practicas, mejor te pones.) / The harder you study, the more confident you feel. (Cuanto más estudias, más seguro/a te sientes.) / English is getting more and more important every year. (El inglés se vuelve cada vez más importante cada año.) Comparaciones con geografía mexicana: The Popocatépetl is not as high as the Pico de Orizaba, but it is more active. (El Popocatépetl no es tan alto como el Pico de Orizaba, pero es más activo.) / Oaxaca is smaller than Mexico City but it has just as much cultural richness. (Oaxaca es más pequeña que la Ciudad de México pero tiene igual riqueza cultural.) Expresar preferencias con comparativos: I prefer tacos to hamburgers because they are tastier and cheaper. / I think living in a small town is not as stressful as living in a big city.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que las comparaciones son una de las estructuras más usadas en debates, ensayos y conversaciones de opinión? Cuando comparas dos cosas en inglés, usas evidencia y conectores: 'Tacos are much cheaper than hamburgers. Also, they are healthier because they use fresh ingredients. Therefore, I think tacos are a better option.' Practicar comparaciones te prepara para defender tu postura en inglés.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con tres tipos de comparación: comparativo -er/more, as...as para igualdad, y comparativo doble the more...the more, con ejemplos de geografía y cultura mexicana",
          caption: "Las comparaciones avanzadas en inglés incluyen igualdad, desigualdad y cambio progresivo.",
        },
      ],
    },
  },

  // ── 6 ── Vocabulario académico ────────────────────────────────────────────
  {
    slug: "in-iv-vocabulario-salud-bienestar",
    titulo: "Health and wellness vocabulary at A2+",
    categoria: "Vocabulario académico",
    conceptos_clave: ["salud", "bienestar", "síntomas", "consejos de salud", "vocabulario médico A2+"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El vocabulario de salud y bienestar es uno de los temas más prácticos e importantes del inglés A2+. Te permite hablar sobre síntomas, ir al médico, dar consejos de salud y describir hábitos saludables. En un mundo globalizado, saber comunicar síntomas en inglés puede ser crucial en situaciones de emergencia o cuando viajes al extranjero. Además, la salud es un tema recurrente en conversaciones cotidianas: cómo te sientes, qué te duele, qué puedes hacer para sentirte mejor.",
        },
        {
          tipo: "subtitulo",
          contenido: "Partes del cuerpo y síntomas comunes",
        },
        {
          tipo: "lista",
          items: [
            "Partes del cuerpo: head (cabeza) / throat (garganta) / chest (pecho) / stomach (estómago) / back (espalda) / shoulder (hombro) / knee (rodilla) / ankle (tobillo)",
            "Síntomas — patrón have + a + noun: I have a headache. (Me duele la cabeza.) / I have a stomachache. (Me duele el estómago.) / I have a sore throat. (Me duele la garganta.) / I have a cold. (Tengo gripe/catarro.) / I have a fever. (Tengo fiebre.) / I have a cough. (Tengo tos.)",
            "Síntomas — patrón feel + adjetivo: I feel dizzy. (Me siento mareado/a.) / I feel nauseous. (Tengo náuseas.) / I feel exhausted. (Me siento agotado/a.) / I feel weak. (Me siento débil.)",
            "En la consulta médica: What's wrong? / What are your symptoms? / How long have you had this? / Does it hurt here? / I think you should see a doctor. / Take this medicine twice a day.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Consejos de salud con should y shouldn't",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una vez que conoces el vocabulario de salud, puedes combinarlo con should para dar consejos prácticos: 'You should drink at least eight glasses of water a day.' (Deberías tomar al menos ocho vasos de agua al día.) / 'You shouldn't skip breakfast — it gives you energy for school.' (No deberías saltarte el desayuno — te da energía para la escuela.) / 'If you have a headache, you should rest and drink water before taking medicine.' (Si te duele la cabeza, deberías descansar y tomar agua antes de tomar medicamento.) / 'You should exercise at least 30 minutes a day.' (Deberías hacer ejercicio al menos 30 minutos al día.) Vocabulario de bienestar mental: I feel stressed / overwhelmed / burned out. / I need a break. / Talking to someone helps. / You should take care of your mental health too.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Diferencia de vocabulario: En inglés americano se dice 'I have a cold' para el catarro/gripe común; flu (influenza) es más grave. Un headache es dolor de cabeza; una headband es una diadema — ¡no confundas! En México decimos 'me duele la cabeza' y en inglés es 'I have a headache' (no 'my head hurts me' aunque esa forma también existe). Aprende los collocations correctos: have a headache, have a cold, have a fever — no se dice 'have a dizziness'.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Silueta del cuerpo humano con flechas que apuntan a distintas partes con sus nombres en inglés, más cuadros de síntomas comunes y sus expresiones en inglés",
          caption: "El vocabulario de salud combina nombres del cuerpo, síntomas y expresiones para dar consejos.",
        },
      ],
    },
  },

  // ── 7 ── Vocabulario académico ────────────────────────────────────────────
  {
    slug: "in-iv-vocabulario-viajes-celebraciones",
    titulo: "Travel and celebrations: essential vocabulary",
    categoria: "Vocabulario académico",
    conceptos_clave: ["viajes", "celebraciones", "fiestas", "vocabulario A2+", "tradiciones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los viajes y las celebraciones son dos de los temas más ricos para practicar inglés A2+. Hablar de un viaje significa narrar en pasado, describir lugares, expresar emociones y comparar experiencias. Hablar de celebraciones significa describir tradiciones culturales, comparar culturas y usar vocabulario festivo. Ambos temas son perfectos para combinar gramática pasada con vocabulario temático y referencias culturales tanto mexicanas como angloparlantes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Vocabulario de viajes",
        },
        {
          tipo: "lista",
          items: [
            "Planear el viaje: destination (destino) / itinerary (itinerario) / book a hotel (reservar hotel) / buy a ticket (comprar boleto) / pack your suitcase (empacar tu maleta) / travel insurance (seguro de viaje)",
            "En el transporte: airport (aeropuerto) / boarding pass (tarjeta de embarque) / check in (registrarse) / luggage / baggage (equipaje) / departure (salida) / arrival (llegada) / delay (retraso) / flight (vuelo) / platform (andén)",
            "En el destino: sightseeing (turismo / visitar atracciones) / tourist attraction (atracción turística) / guided tour (tour guiado) / souvenir (recuerdo / artesanía) / local food (comida local) / exchange rate (tipo de cambio)",
            "Frases útiles para viajeros: 'How do I get to...?' / 'Where is the nearest...?' / 'How much does it cost?' / 'Is there a discount for students?' / 'Can I pay with card?' / 'I'm lost — can you help me?'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Vocabulario de celebraciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Celebraciones en inglés: celebration (celebración) / party (fiesta) / invitation (invitación) / guest (invitado/a) / host (anfitrión/a) / decoration (decoración) / costume / disguise (disfraz) / fireworks (fuegos artificiales) / parade (desfile) / ceremony (ceremonia) / toast (brindis). Frases para hablar de celebraciones: 'Last year, we celebrated Day of the Dead with the whole family.' / 'There was music, food, and a beautiful altar.' / 'I'm going to celebrate my birthday with a small party at home.' / 'In Mexico, we have a tradition called posadas during Christmas.' Comparación de celebraciones: 'In Mexico, Día de Muertos is a colorful and respectful celebration. In the USA, Halloween is more about costumes and candy.'",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que México es el quinto país más visitado del mundo? Ciudades como Cancún, Los Cabos, CDMX y Oaxaca reciben millones de turistas internacionales cada año. Saber inglés te da ventaja en el sector turístico, que es uno de los más grandes empleadores en México. Muchos de esos turistas visitan para ver exactamente las celebraciones y tradiciones culturales que conoces desde niño/a.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage dividido en dos mitades: izquierda con vocabulario de viajes (aeropuerto, maleta, hotel) y derecha con vocabulario de celebraciones (altar, piñata, fuegos artificiales), todo etiquetado en inglés",
          caption: "Los viajes y las celebraciones combinan narrativa en pasado con vocabulario cultural.",
        },
      ],
    },
  },

  // ── 8 ── Vocabulario académico ────────────────────────────────────────────
  {
    slug: "in-iv-vocabulario-emociones-sentimientos",
    titulo: "Emotions and feelings: expressing yourself in A2+",
    categoria: "Vocabulario académico",
    conceptos_clave: ["emociones", "sentimientos", "expresión emocional A2+", "intensificadores", "vocabulario afectivo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Expresar emociones con precisión y riqueza es una de las marcas distintivas del nivel A2+. En el nivel anterior aprendiste las emociones básicas (happy, sad, scared). Ahora ampliarás ese repertorio con emociones más matizadas, intensificadores para expresar grados de emoción, y frases más complejas para describir cómo te sientes en situaciones específicas. Expresar emociones auténticamente hace que tu comunicación en inglés sea más natural y conecta mejor con los interlocutores.",
        },
        {
          tipo: "subtitulo",
          contenido: "Emociones A2+: más allá de happy y sad",
        },
        {
          tipo: "lista",
          items: [
            "Emociones positivas avanzadas: thrilled (emocionadísimo/a) / delighted (encantado/a) / relieved (aliviado/a — cuando algo sale bien después de preocupación) / grateful (agradecido/a) / proud (orgulloso/a) / inspired (inspirado/a) / content (satisfecho/a, en paz) / hopeful (esperanzado/a)",
            "Emociones negativas avanzadas: devastated (destrozado/a emocionalmente) / frustrated (frustrado/a) / overwhelmed (abrumado/a) / heartbroken (con el corazón roto) / jealous (celoso/a / envidioso/a) / ashamed (avergonzado/a de sí mismo) / anxious (ansioso/a)",
            "Emociones complejas: nostalgic (nostálgico/a) / mixed feelings (sentimientos encontrados) / conflicted (en conflicto interno) / lonely (solo/a — sentimiento, no situación física) / left out (excluido/a) / misunderstood (incomprendido/a)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Intensificadores y frases de emoción",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los intensificadores modifican el grado de una emoción: very (muy) / really (de verdad muy) / so (tan) / incredibly (increíblemente) / a bit / a little (un poco) / quite (bastante) / extremely (extremadamente). Ejemplos: 'I was incredibly proud when my team won the tournament.' (Estaba increíblemente orgulloso/a cuando mi equipo ganó el torneo.) / 'I felt a bit nervous before the English exam, but then I relaxed.' (Me sentí un poco nervioso/a antes del examen de inglés, pero luego me relajé.) / 'She was so relieved when she found her phone.' (Estaba tan aliviada cuando encontró su teléfono.) Frases para explicar emociones: 'I felt proud because I helped my family.' / 'She was frustrated with herself for forgetting.' / 'We were overwhelmed by the beauty of Teotihuacán.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Diferencia importante en vocabulario emocional: lonely (sentirse solo/a emocionalmente, aunque estés con gente) vs alone (estar físicamente sin compañía). Puedes estar alone y feliz; puedes estar lonely en medio de una multitud. También: embarrassed (avergonzado/a frente a otros por algo que hiciste) vs ashamed (avergonzado/a de ti mismo/a por tus valores o acciones). Estos matices hacen una gran diferencia en la comunicación.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Rueda de emociones en inglés organizada por intensidad: del centro hacia afuera va de emociones básicas a emociones más matizadas, con traducción al español",
          caption: "Las emociones en inglés A2+ incluyen matices y grados que van más allá de happy y sad.",
        },
      ],
    },
  },

  // ── 9 ── Vocabulario académico ────────────────────────────────────────────
  {
    slug: "in-iv-phrasal-verbs-cotidianos",
    titulo: "Phrasal verbs cotidianos para A2+",
    categoria: "Vocabulario académico",
    conceptos_clave: ["phrasal verbs", "verbos frasales", "inglés cotidiano", "A2+", "vocabulario informal"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los phrasal verbs son combinaciones de verbo + partícula (preposición o adverbio) cuyo significado conjunto es diferente al de las palabras por separado. Son absolutamente esenciales en el inglés cotidiano e informal: aparecen en conversaciones, series, canciones y textos de redes sociales. A nivel A2+, dominar los phrasal verbs más comunes te ayuda enormemente a comprender y producir inglés natural. En el semestre 4 nos enfocamos en los que se usan para hablar de relaciones, actividades sociales y situaciones de la vida diaria.",
        },
        {
          tipo: "subtitulo",
          contenido: "Phrasal verbs para relaciones y vida social",
        },
        {
          tipo: "lista",
          items: [
            "hang out (pasar el tiempo con amigos, sin actividad específica): We hung out at the park after school. (Pasamos el rato en el parque después de la escuela.)",
            "catch up (ponerse al día con alguien): I need to catch up with my old friends. (Necesito ponerme al día con mis viejos amigos.)",
            "make up (reconciliarse después de una pelea): They argued, but they made up the next day. (Se pelearon, pero se reconciliaron al día siguiente.)",
            "fall out (pelearse, distanciarse): She fell out with her best friend over something silly. (Se distanció de su mejor amiga por algo tonto.)",
            "ask out (invitar a salir románticamente): He finally asked her out. (Por fin la invitó a salir.)",
            "break up (terminar una relación): They broke up after three years. (Terminaron después de tres años.)",
            "get along / get on (llevarse bien): I really get along with my cousins. (Me llevo muy bien con mis primos.)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Phrasal verbs para actividades y situaciones cotidianas",
        },
        {
          tipo: "lista",
          items: [
            "set off / set out (partir, comenzar un viaje): We set off early in the morning. (Partimos temprano por la mañana.)",
            "check in / check out (registrarse / hacer check-out en un hotel): We checked in at 3 pm. / We check out tomorrow at noon.",
            "show up (aparecer, llegar a un lugar): He didn't show up to the party. (No apareció en la fiesta.)",
            "put off (posponer): Don't put off your homework. (No pospongas tu tarea.)",
            "give back (devolver): Can you give back my book? (¿Puedes devolverme mi libro?)",
            "end up (terminar haciendo algo inesperado): We got lost and ended up in a different neighborhood. (Nos perdimos y terminamos en otro barrio.)",
            "come across (encontrarse con algo/alguien por casualidad): I came across an interesting article about Mexico City. (Me encontré con un artículo interesante sobre la CDMX.)",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que los phrasal verbs separables se pueden dividir con el objeto entre el verbo y la partícula? Por ejemplo: 'Turn off the lights' = 'Turn the lights off' (ambas son correctas). Pero si el objeto es un pronombre, SIEMPRE va en medio: 'Turn them off' (CORRECTO) / 'Turn off them' (INCORRECTO). Los phrasal verbs inseparables no se pueden dividir: 'I came across an article' (CORRECTO) / 'I came an article across' (INCORRECTO).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuadrícula con 14 phrasal verbs organizados por tema: relaciones y vida social, cada uno con significado en español y ejemplo de oración en contexto cotidiano mexicano",
          caption: "Los phrasal verbs para relaciones y vida social son esenciales en el inglés A2+ cotidiano.",
        },
      ],
    },
  },

  // ── 10 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iv-conversacion-small-talk",
    titulo: "Small talk: the art of casual conversation",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["small talk", "conversación casual", "cortesía", "temas seguros", "habilidades sociales"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El small talk es la conversación casual e informal que se tiene en situaciones sociales cotidianas: en la fila del banco, antes de una clase, esperando el autobús, con un vecino o con un compañero de trabajo. En las culturas anglosajonas, el small talk es una habilidad social muy valorada: ayuda a crear rapport (conexión), hace que la gente se sienta cómoda y establece relaciones amistosas antes de hablar de temas más importantes. Para estudiantes mexicanos, el small talk puede parecer superficial, pero es una herramienta de comunicación muy importante.",
        },
        {
          tipo: "subtitulo",
          contenido: "Temas seguros para el small talk",
        },
        {
          tipo: "lista",
          items: [
            "El clima (the weather): 'It's such a beautiful day today, isn't it?' / 'Can you believe how cold it is?' / 'I love this time of year. The weather is perfect.'",
            "Planes del fin de semana: 'Do you have any plans for the weekend?' / 'Are you doing anything special this weekend?' / 'I'm going to visit some friends. What about you?'",
            "Actividades recientes: 'Did you watch the game last night?' / 'Have you seen any good movies recently?' / 'I just finished reading a great book.'",
            "Trabajo o estudios (sin ser intrusivo): 'How's school going?' / 'How are your classes this semester?' / 'Do you enjoy English class?'",
            "Temas que EVITAR en el small talk con personas que no conoces bien: política, religión, dinero, relaciones sentimentales, problemas de salud graves.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Frases esenciales para mantener y concluir la conversación",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para mostrar interés y mantener la conversación: 'Oh really?' / 'That's interesting!' / 'Tell me more.' / 'I know what you mean.' / 'Same here!' / 'Wow, that sounds great/fun/amazing.' Para cambiar de tema suavemente: 'Speaking of which...' / 'That reminds me...' / 'By the way...' Para concluir cortésmente: 'Well, it was great talking to you!' / 'I should get going — it was nice chatting!' / 'We should catch up properly soon!' / 'Take care! See you around.' Ejemplo de small talk breve: — 'Hey! How's it going?' — 'Good, thanks! Really busy with school this week. You?' — 'Same! I heard there's a long weekend coming up.' — 'Yes! I'm going to Tepoztlán with my family. Have you ever been?' — 'No, I haven't, but I've heard it's beautiful.' — 'You should go! Anyway, I have to run — take care!' — 'You too! Have fun!'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En las culturas anglosajonas (especialmente en EUA y UK), el small talk NO es una pérdida de tiempo ni hipocresía: es la forma de construir relaciones. Un error común de estudiantes mexicanos es responder a '¿Cómo estás?' (How are you? / How's it going?) con una respuesta muy larga y detallada. En small talk, la respuesta esperada es corta y positiva: 'Good, thanks! And you?' — aunque no te sientas perfectamente bien. Es un ritual social, no una consulta médica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración de dos personas en una conversación casual con burbujas de diálogo mostrando frases de small talk sobre el clima y planes del fin de semana",
          caption: "El small talk construye conexiones sociales y es una habilidad comunicativa esencial en inglés.",
        },
      ],
    },
  },

  // ── 11 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iv-dar-consejos-contexto-real",
    titulo: "Giving advice in real contexts: problems and solutions",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["dar consejos", "problemas cotidianos", "should", "If I were you", "habilidades de diálogo"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dar consejos en contextos reales va más allá de usar should. En la conversación cotidiana en inglés, los hablantes nativos usan una variedad de expresiones para dar consejos de manera natural, empática y apropiada al contexto. La forma de dar un consejo varía según la relación (amigo cercano vs conocido vs superior), la gravedad del problema y el nivel de confianza. En este semestre aprenderás a dar consejos de forma natural en situaciones de la vida cotidiana de un estudiante de bachillerato.",
        },
        {
          tipo: "subtitulo",
          contenido: "Expresiones para dar consejos: del más al menos directo",
        },
        {
          tipo: "lista",
          items: [
            "Más directo (amigos cercanos): You should... / You need to... / Just... 'You should talk to your teacher about it.' / 'You need to stop procrastinating.' / 'Just be honest with him.'",
            "Moderado: Why don't you...? / Have you thought about...? / It might help to... 'Why don't you join an English club?' / 'Have you thought about asking for help?' / 'It might help to write things down.'",
            "Suave y empático: If I were you, I would... / I think you should... / Maybe you could... 'If I were you, I would apologize.' / 'I think you should take a break.' / 'Maybe you could try a different approach.'",
            "Para situaciones graves: I strongly recommend... / You really ought to... 'I strongly recommend seeing a doctor.' / 'You really ought to talk to your parents about this.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Diálogos de consejo en contextos estudiantiles",
        },
        {
          tipo: "parrafo",
          contenido:
            "Situación 1 — Problemas académicos: 'I'm failing three subjects and I don't know what to do.' 'I think you should talk to your teachers first. If I were you, I would ask for extra help. You should also organize your time better — maybe you could make a study schedule.' Situación 2 — Problemas con amigos: 'My best friend is not talking to me and I don't know why.' 'Why don't you talk to her directly? Have you thought about sending her a message? Sometimes it's better to be honest. If I were you, I would say something like: \'I feel like something is wrong between us. Can we talk?\'' Situación 3 — Salud: 'I've had a headache for three days.' 'You should drink more water and get enough sleep. If it doesn't get better, you really ought to see a doctor. Maybe you could also reduce screen time before bed.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Para dar consejos de manera empática, primero VALIDA el sentimiento de la persona antes de dar el consejo: 'That sounds really difficult.' / 'I understand why you feel that way.' / 'That must be stressful.' Después, da el consejo: 'Have you thought about...?' / 'If I were you...' Saltar directo al consejo sin empatía puede sonar frío o irrespetuoso. En inglés como en español, el contexto emocional importa mucho.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de escalera con niveles de fuerza del consejo: desde el más suave (maybe you could) hasta el más directo (you need to), con ejemplos en cada nivel",
          caption: "La fuerza del consejo en inglés varía según la relación y la gravedad del problema.",
        },
      ],
    },
  },

  // ── 12 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iv-expresar-planes-metas",
    titulo: "Expressing plans and goals for the future",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["planes futuros", "metas", "be going to", "will", "aspiraciones académicas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hablar sobre planes y metas para el futuro es una habilidad comunicativa esencial, tanto para conversaciones cotidianas como para entrevistas, ensayos académicos y situaciones profesionales futuras. En inglés A2+, puedes expresar tus planes y aspiraciones usando be going to para planes concretos, will para predicciones y compromisos, y expresiones especializadas para metas de vida. Esta habilidad conecta directamente con el propósito del semestre: expresar y justificar preferencias y describir planes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Vocabulario para hablar de planes y metas",
        },
        {
          tipo: "lista",
          items: [
            "Planes a corto plazo (esta semana / este mes): I'm going to visit my grandmother next weekend. / I'm planning to study for my English exam. / I'm thinking about joining the school sports team.",
            "Metas a mediano plazo (este año / este semestre): I want to improve my English to a B1 level. / I'm going to practice speaking English for 15 minutes every day. / I hope to pass all my subjects this semester.",
            "Aspiraciones a largo plazo (el futuro): I'd like to study architecture at university. / I want to travel to Canada someday. / I hope to work in a bilingual environment. / My dream is to start my own business.",
            "Expresiones de intención: I'm planning to... (Estoy planeando...) / I intend to... (Tengo la intención de...) / I'm thinking about... (Estoy pensando en...) / I'm hoping to... (Espero...) / I dream of... (Sueño con...)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Justificar planes y metas",
        },
        {
          tipo: "parrafo",
          contenido:
            "En inglés A2+, no solo expresas el plan sino también la razón: 'I'm going to study medicine because I want to help people in my community.' / 'I'm going to practice English every day because I want to get a better job in the future.' / 'I'm not going to use my phone during class because I want to focus better.' Conectores para justificar: because (porque) / so that (para que / a fin de) / in order to (con el fin de) / since (dado que). Ejemplo completo: 'I'm going to take an English course this summer so that I can improve my speaking skills. I also want to watch more series in English without subtitles. In the future, I hope to study abroad, which is why English is so important for me right now. I know it won't be easy, but I'm going to work hard.'",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que una de las preguntas más comunes en entrevistas de trabajo y admisiones universitarias en inglés es 'Where do you see yourself in five years?' (¿Dónde te ves en cinco años?) Practicar una respuesta a esta pregunta es una excelente manera de prepararte para el futuro. Tu respuesta ideal combina: I'm going to... / I hope to... / I'd like to... / In five years, I plan to... Practica responderla en voz alta usando al menos cuatro oraciones.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo con tres puntos: corto plazo (esta semana), mediano plazo (este año) y largo plazo (el futuro), con expresiones de planes y metas en inglés en cada punto",
          caption: "Expresar planes en inglés requiere conectar la intención con la razón y el tiempo.",
        },
      ],
    },
  },

  // ── 13 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iv-escribir-parrafo-organizado",
    titulo: "Writing an organized paragraph in English",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["párrafo organizado", "topic sentence", "supporting sentences", "concluding sentence", "escritura A2+"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Escribir un párrafo bien organizado es una de las habilidades más importantes del inglés A2+. Un párrafo en inglés sigue una estructura muy clara que difiere del español: comienza con una oración tema (topic sentence) que presenta la idea principal, continúa con oraciones de apoyo (supporting sentences) que desarrollan y justifican esa idea, y cierra con una oración de conclusión (concluding sentence) que resume o refuerza el punto central. Dominar esta estructura mejora enormemente tu escritura.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura del párrafo en inglés",
        },
        {
          tipo: "lista",
          items: [
            "1. TOPIC SENTENCE (oración tema): la primera oración del párrafo. Presenta la idea principal y dice al lector de qué trata el párrafo. Es específica pero no demasiado detallada. Ejemplo: 'Learning English has many practical benefits for Mexican students.'",
            "2. SUPPORTING SENTENCES (oraciones de apoyo): 3-5 oraciones que desarrollan la idea. Incluyen ejemplos, razones, estadísticas o detalles. Usan conectores para enlazarse. 'First, English helps students communicate with people from other countries. Also, many universities require an English level for admission. Furthermore, knowing English opens job opportunities in tourism, technology and business.'",
            "3. CONCLUDING SENTENCE (oración de conclusión): la última oración. Retoma la idea principal de manera diferente o da una reflexión final. NO introduce información nueva. 'For these reasons, studying English is one of the best investments a Mexican student can make.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores para párrafos organizados",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para añadir ideas: First (Primero) / Second (Segundo) / Also / In addition / Furthermore (Además) / Another reason is... Ejemplo de uso: 'First, exercise improves your physical health. Also, it reduces stress. Furthermore, it helps you sleep better.' Para contrastar: However (Sin embargo) / On the other hand (Por otro lado) / Although (Aunque). Para concluir: In conclusion / To sum up / For these reasons / Therefore. Ejemplo de párrafo completo con estructura: 'Learning a new language requires consistent daily effort. First, you should practice listening every day — even 15 minutes of music or podcasts in English helps. Also, reading simple texts in English improves your vocabulary significantly. In addition, speaking with classmates or writing a short diary in English accelerates your progress. Although it can feel difficult at times, the rewards are worth it. For these reasons, daily small habits are the most effective way to learn a language.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un error muy común en estudiantes mexicanos es traducir directamente del español. En español, los párrafos suelen ser más largos, con oraciones más complejas y subordinadas. En inglés, un buen párrafo tiene oraciones más cortas y directas, con conectores explícitos entre ideas. Antes de escribir, haz un esquema rápido: Topic sentence → 3 razones/ejemplos → Conclusión. Esta planificación de 2 minutos ahorra mucho tiempo y produce párrafos mucho más organizados.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de un párrafo en inglés con tres secciones claramente marcadas: topic sentence (azul), supporting sentences (verde, tres puntos) y concluding sentence (naranja), con flechas y etiquetas",
          caption: "La estructura del párrafo en inglés: topic sentence, supporting sentences y concluding sentence.",
        },
      ],
    },
  },

  // ── 14 ── Cultura angloparlante ───────────────────────────────────────────
  {
    slug: "in-iv-cultura-dia-de-accion-de-gracias",
    titulo: "Thanksgiving: history, traditions and controversies",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["Thanksgiving", "Día de Acción de Gracias", "cultura estadounidense", "tradiciones familiares", "historia crítica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Thanksgiving (Día de Acción de Gracias) es una de las festividades más importantes en Estados Unidos y Canadá. En EUA se celebra el cuarto jueves de noviembre, y en Canadá el segundo lunes de octubre. Como estudiante de inglés A2+, conocer esta celebración es importante no solo para entender la cultura anglosajona, sino también para poder hablar de ella en inglés, compararla con las tradiciones mexicanas y desarrollar una visión crítica e intercultural de las festividades.",
        },
        {
          tipo: "subtitulo",
          contenido: "Historia y tradiciones de Thanksgiving",
        },
        {
          tipo: "lista",
          items: [
            "Origen histórico: la historia oficial cuenta que en 1621 los colonos ingleses (Pilgrims) celebraron una cosecha exitosa con los indígenas Wampanoag. Esta comida es considerada el primer Thanksgiving, aunque la historia real es mucho más compleja y la perspectiva indígena es muy diferente.",
            "Tradiciones actuales: la familia se reúne alrededor de una gran cena. El menú tradicional incluye roast turkey (pavo asado), mashed potatoes (puré de papa), stuffing (relleno de pan), cranberry sauce (salsa de arándano) y pumpkin pie (pay de calabaza).",
            "El día siguiente: Black Friday, el viernes de compras masivas con grandes descuentos, inmediatamente después del Thanksgiving. Es uno de los días de mayor venta del año en EUA.",
            "Thanksgiving en la cultura popular: aparece en innumerables películas, series y canciones estadounidenses. Es el símbolo de la unidad familiar y la gratitud en la cultura mainstream de EUA.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Perspectiva crítica e intercultural",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para muchas comunidades indígenas en EUA, el Día de Acción de Gracias es un National Day of Mourning (Día Nacional de Duelo) que recuerda el inicio de la colonización y el sufrimiento de los pueblos originarios. Los Wampanoag y otras naciones indígenas llevan décadas pidiendo que la historia de Thanksgiving se cuente de manera más honesta. Comparación con México: al igual que Thanksgiving, muchas festividades mexicanas tienen capas históricas complejas. El Día de la Raza (12 de octubre) fue redefinido en México como el Día de la Diversidad Cultural para reconocer tanto el encuentro como el choque de civilizaciones. Reflexión: ¿Cómo comparas Thanksgiving con alguna festividad mexicana que también tenga una historia compleja?",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que en México el Black Friday se ha popularizado enormemente en los últimos años? Tiendas como Liverpool, Walmart y Amazon México ofrecen descuentos ese día. Aunque no es una tradición mexicana, la globalización cultural y comercial ha traído esta práctica al país. Saber hablar sobre estas influencias culturales en inglés te permite participar en conversaciones globales sobre cultura, economía y globalización.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración dividida en dos: izquierda muestra la mesa de Thanksgiving con pavo y familia reunida; derecha muestra la perspectiva histórica con referencia al National Day of Mourning",
          caption: "Thanksgiving combina tradición familiar con una historia compleja que merece reflexión crítica.",
        },
      ],
    },
  },

  // ── 15 ── Cultura angloparlante ───────────────────────────────────────────
  {
    slug: "in-iv-cultura-halloween-vs-dia-muertos",
    titulo: "Halloween vs Día de Muertos: two visions of death",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["Halloween", "Día de Muertos", "comparación cultural", "tradiciones", "identidad cultural"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Halloween y el Día de Muertos se celebran en fechas cercanas (31 de octubre y 1-2 de noviembre) y ambos tienen relación con la muerte, pero sus orígenes, significados y formas de celebración son muy diferentes. Compararlos es un excelente ejercicio de análisis intercultural y también un tema de conversación muy frecuente en inglés cuando mexicanos hablan con personas de países angloparlantes. Conocer ambas tradiciones en inglés te prepara para representar tu cultura con orgullo y conocimiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "Halloween: origen y tradiciones",
        },
        {
          tipo: "lista",
          items: [
            "Origen: viene del festival celta Samhain, que marcaba el fin del verano y cuando se creía que los espíritus regresaban al mundo de los vivos. Los celtas encendían hogueras y usaban disfraces para ahuyentar a los fantasmas.",
            "Influencia cristiana: la Iglesia Católica convirtió el 1 de noviembre en All Saints' Day (Día de Todos los Santos) y el 31 de octubre en All Hallows' Eve, que con el tiempo se convirtió en Halloween.",
            "Tradiciones actuales en EUA: costumes (disfraces), trick-or-treating (ir de casa en casa pidiendo dulces), jack-o-lanterns (calabazas talladas con velas), haunted houses (casas del terror), scary movies.",
            "Carácter: principalmente lúdico y de entretenimiento. Se enfoca en el miedo, lo sobrenatural y lo terrorífico como diversión.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Día de Muertos: significado profundo y comparación",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Día de Muertos tiene raíces en las tradiciones prehispánicas de los pueblos mesoamericanos, especialmente los mexicas (aztecas), que celebraban rituales para honrar a los muertos varios meses al año. Con la llegada del catolicismo, estas tradiciones se fusionaron con el Día de Todos los Santos. La visión del Día de Muertos es profundamente diferente a la de Halloween: no se trata de miedo, sino de amor, memoria y continuidad. Los muertos regresan a visitar a sus familias. El altar (ofrenda) es el centro de la celebración: incluye flores de cempasúchil, fotos del difunto, comida y bebida que le gustaban, velas, incienso y objetos personales. Expresiones en inglés para describir el Día de Muertos: 'Day of the Dead is a Mexican celebration to honor and remember those who have passed away.' / 'Families build altars with flowers, food, photos, and candles to welcome the spirits of their loved ones.' / 'It is not a sad occasion — it is a joyful reunion with the dead.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Una discusión importante en México: la comercialización de Halloween ha generado debate sobre si desplaza al Día de Muertos. Muchos mexicanos consideran que Halloween es una imposición cultural que no corresponde con los valores mexicanos sobre la muerte. Otros argumentan que las culturas se mezclan naturalmente. ¿Cuál es tu opinión? Esta es una excelente pregunta para practicar la expresión de opiniones en inglés: 'I think that...', 'In my opinion...', 'I believe that Mexican traditions should be...'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa de Halloween y Día de Muertos con columnas de origen, fecha, elementos principales, significado cultural y visión de la muerte en inglés",
          caption: "Halloween y el Día de Muertos comparten fechas pero tienen visiones completamente distintas sobre la muerte.",
        },
      ],
    },
  },

  // ── 16 ── Cultura angloparlante ───────────────────────────────────────────
  {
    slug: "in-iv-cultura-escuelas-eeuu-vs-mexico",
    titulo: "Schools in the USA vs Mexico: comparing education systems",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["sistema educativo", "comparación cultural", "escuelas en EUA", "bachillerato", "cultura escolar"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Comparar los sistemas educativos de México y Estados Unidos es un tema perfecto para practicar comparativos, vocabulario académico y expresión de opiniones en inglés A2+. Los sistemas son similares en estructura pero diferentes en cultura, financiamiento, currículo y expectativas. Conocer estas diferencias te ayuda a entender mejor películas, series y textos en inglés que se desarrollan en escuelas estadounidenses, y también a hablar con más contexto sobre tu propia experiencia educativa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura del sistema educativo en EUA",
        },
        {
          tipo: "lista",
          items: [
            "Elementary school (escuela primaria): grades K-5, estudiantes de 5-11 años aproximadamente.",
            "Middle school / Junior high (secundaria): grades 6-8, estudiantes de 11-14 años.",
            "High school (preparatoria / bachillerato): grades 9-12, estudiantes de 14-18 años. Al terminar, reciben un diploma. Los grados tienen nombres: Freshman (1er año) / Sophomore (2do) / Junior (3er) / Senior (4to).",
            "College / University (universidad): después del high school. Community colleges ofrecen dos años; universities ofrecen programas de cuatro años con licenciatura (Bachelor's degree).",
            "Diferencias culturales notables: en muchas escuelas de EUA hay school lockers (casilleros), homecoming (baile de bienvenida), prom (baile de graduación), school sports teams con grandes equipamientos.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación con el sistema mexicano",
        },
        {
          tipo: "parrafo",
          contenido:
            "Similitudes: ambos sistemas tienen educación básica (primaria y secundaria) y media superior (bachillerato / high school) antes de la universidad. Ambos tienen exámenes, materias obligatorias y actividades extracurriculares. Diferencias: En México, el bachillerato (prepa / CCH) es más académico y centrado en el conocimiento; en EUA el high school incluye más actividades extracurriculares y deportes como parte central de la experiencia escolar. En EUA, muchas escuelas son financiadas por impuestos locales, lo que genera grandes diferencias de calidad entre escuelas de barrios ricos y pobres. En México, la UNAM ofrece educación pública gratuita de alta calidad. En EUA, la educación universitaria es muy cara — student loans (préstamos estudiantiles) son un problema nacional enorme. Frases de comparación: 'In Mexico, high school is called bachillerato and lasts three years. In the USA, high school lasts four years.' / 'Mexican public universities are generally more affordable than American ones.'",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que la UNAM es una de las mejores universidades de América Latina y está entre las 100 mejores del mundo en varias disciplinas? En EUA, universidades como Harvard o MIT son famosas globalmente pero cuestan más de $70,000 dólares al año. Muchos estudiantes mexicanos que aprenden inglés y obtienen becas pueden acceder a programas en universidades estadounidenses. El inglés es literalmente la llave que abre esas puertas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa en dos columnas: sistema educativo de México (Primaria, Secundaria, Bachillerato, Universidad) vs sistema de EUA (Elementary, Middle, High School, College), con edades y nombres en inglés",
          caption: "Los sistemas educativos de México y EUA comparten estructura pero difieren en cultura y financiamiento.",
        },
      ],
    },
  },

  // ── 17 ── Cultura angloparlante ───────────────────────────────────────────
  {
    slug: "in-iv-musica-en-ingles-aprender",
    titulo: "Learning English through music: songs as a tool",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["música en inglés", "aprender con canciones", "pronunciación", "vocabulario musical", "cultura pop"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La música en inglés es una de las herramientas de aprendizaje más poderosas y accesibles que existen. Aprender vocabulario, estructuras gramaticales y pronunciación a través de canciones es efectivo porque la melodía y el ritmo ayudan a la memoria: es mucho más fácil recordar una oración si va con una melodía que te gusta. Además, las canciones en inglés te exponen a registro informal, modismos, phrasal verbs y cultura pop anglosajona de manera entretenida y motivadora.",
        },
        {
          tipo: "subtitulo",
          contenido: "Por qué la música funciona para aprender inglés",
        },
        {
          tipo: "lista",
          items: [
            "Pronunciación natural: las canciones te muestran cómo se pronuncia el inglés en contexto real, con contracciones ('I'm', 'don't', 'won't'), reducción de sonidos y ritmo natural del habla.",
            "Vocabulario en contexto: aprendes palabras nuevas en un contexto emocional y musical, lo que facilita la memorización. 'Shallow' de Lady Gaga tiene vocabulario sobre profundidad emocional; 'Shape of You' de Ed Sheeran tiene vocabulario cotidiano de relaciones.",
            "Gramática implícita: las canciones usan estructuras gramaticales reales. 'I Will Always Love You' de Whitney Houston es un excelente ejemplo del uso de will para promesas. 'Yesterday' de The Beatles usa pasado perfectamente.",
            "Motivación y disfrute: cuando el aprendizaje es placentero, tu cerebro lo procesa y retiene mejor. Escuchar música en inglés que te gusta no se siente como estudiar, pero sí lo es.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo estudiar inglés con canciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Paso 1: Escucha la canción varias veces sin leer la letra. ¿Qué palabras reconoces? Paso 2: Lee la letra en inglés mientras escuchas. Busca las palabras desconocidas en el diccionario. Paso 3: Canta la canción (en voz alta o en tu cabeza). La pronunciación mejora enormemente con esto. Paso 4: Analiza la gramática. ¿Qué tiempos verbales usa? ¿Hay phrasal verbs? ¿Qué estructuras reconoces? Paso 5: Aprende 5-10 frases o expresiones de la canción que puedas usar en tu propio inglés. Canciones recomendadas para niveles A2+: 'Counting Stars' — OneRepublic (pasado, futuro, emociones) / 'Stay With Me' — Sam Smith (vocabulario de relaciones) / 'Havana' — Camila Cabello (mix español-inglés, cultural) / 'Shake It Off' — Taylor Swift (phrasal verbs, vocabulario informal) / 'Believer' — Imagine Dragons (vocabulario de resiliencia y emociones fuertes).",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que Shakira, Ricky Martin, Selena Gomez y muchos otros artistas latinos cantan en inglés como estrategia para llegar a audiencias globales? Camila Cabello nació en Cuba y creció en EUA; en su música mezcla español e inglés de manera natural. Estudiar cómo estos artistas usan el inglés como segunda lengua es inspirador y demuestra que hablar inglés con acento o con influencias del español no es una desventaja — es una riqueza cultural.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía de cinco pasos para estudiar inglés con canciones: escuchar sin letra, leer letra, cantar, analizar gramática y aprender frases, con íconos representativos",
          caption: "La música en inglés combina pronunciación, vocabulario y gramática en un formato motivador.",
        },
      ],
    },
  },

  // ── 18 ── Estrategias narrativas ──────────────────────────────────────────
  {
    slug: "in-iv-contar-anecdota-estructura",
    titulo: "Telling an anecdote: structure and key phrases",
    categoria: "Estrategias narrativas",
    conceptos_clave: ["anécdota", "estructura narrativa", "storytelling A2+", "frases de narrativa", "fluidez oral"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Contar una anécdota bien organizada es una de las habilidades más valoradas en el nivel A2+. Una anécdota es una historia corta sobre algo que te ocurrió a ti o a alguien que conoces. A diferencia de una narrativa escrita formal, la anécdota oral tiene características propias: frases de apertura para captar la atención, marcadores de tiempo para guiar al oyente, expresiones de reacción emocional y un cierre que da sentido al relato. Dominar estas estrategias hace que tu inglés oral suene más natural y fluido.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de una anécdota en inglés",
        },
        {
          tipo: "lista",
          items: [
            "1. HOOK / APERTURA (captar la atención): 'You won't believe what happened to me!' / 'I have to tell you about something that happened last weekend.' / 'This is kind of embarrassing, but...' / 'I'll never forget the day when...'",
            "2. CONTEXTO (¿cuándo, dónde, quién?): 'It was last summer. I was in Teotihuacán with my family.' / 'A few weeks ago, I was at school when...' / 'Last Saturday, while I was walking in the Zócalo...'",
            "3. NARRACIÓN DE EVENTOS (¿qué pasó?): usa Past Simple y Past Continuous. 'First, we climbed the Pyramid of the Sun. Then, when we got to the top, suddenly...' / 'I was taking a photo when I noticed...'",
            "4. PUNTO DE MAYOR TENSIÓN (the high point): la parte más interesante o sorprendente. 'And then, you won't believe this, but...' / 'Suddenly, out of nowhere...' / 'That's when everything went wrong / the crazy thing happened...'",
            "5. RESOLUCIÓN Y REFLEXIÓN: '...and in the end, it all worked out.' / 'Looking back, I think it was actually a great experience.' / 'I learned that you should always...' / 'It was one of those moments you never forget.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Anécdota de ejemplo completa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Anécdota completa de un estudiante de bachillerato: 'You won't believe what happened to me last month! I was visiting Teotihuacán with my class for a school trip. It was a really hot day and we were climbing the Pyramid of the Sun. I was taking photos when suddenly I realized I had left my phone at the bottom of the pyramid! I felt so stupid — I had hundreds of photos on it. My friends stayed at the top while I ran all the way back down. My legs were shaking! But then, when I got to the bottom, a really kind tourist — an older woman from Canada — had found it and was waiting nearby with my teacher. I was so relieved and grateful! She didn't even want anything in return. In the end, I got my phone back and learned an important lesson: never put your phone in a loose pocket when you're climbing pyramids. But honestly? Meeting that kind tourist made it one of my favorite memories from the trip.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las mejores anécdotas tienen tres elementos: un momento de tensión o sorpresa (cuando algo salió mal, fue inesperado o muy emocionante), una reacción emocional auténtica (cómo te sentiste), y una reflexión final (qué aprendiste o qué significa para ti). No todas las anécdotas deben ser dramáticas: una situación cómica o vergonzosa bien contada puede ser más entretenida que un gran evento. La clave es el ritmo, los detalles visuales y las emociones.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama en forma de arco narrativo mostrando las cinco partes de la anécdota: hook, contexto, eventos, punto álgido y resolución, con ejemplos de frases en inglés en cada punto",
          caption: "La anécdota bien estructurada tiene un arco narrativo con gancho, tensión y resolución.",
        },
      ],
    },
  },

  // ── 19 ── Estrategias narrativas ──────────────────────────────────────────
  {
    slug: "in-iv-conectores-secuencia-narrativa",
    titulo: "Narrative sequence connectors: telling stories smoothly",
    categoria: "Estrategias narrativas",
    conceptos_clave: ["conectores narrativos", "secuencia", "cohesión", "fluidez", "storytelling"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los conectores de secuencia narrativa son el pegamento que une los eventos de una historia y la hace fluir de manera natural. Sin conectores, una narración es una lista desorganizada de hechos; con ellos, la historia tiene ritmo, lógica temporal y lleva al oyente de un evento al siguiente de manera clara. En inglés A2+, ampliar tu repertorio de conectores narrativos más allá de 'first, then, finally' hace que tu inglés oral y escrito suene más maduro y fluido.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores narrativos por función",
        },
        {
          tipo: "lista",
          items: [
            "Para el inicio / establecer contexto: One day... / Last [week/summer/year]... / A few years ago... / It was a [day/night/morning] when... / At the time... / Back then...",
            "Para la secuencia de eventos: First of all... / To begin with... / Then / Next / After that / Following that... / Later on... / Meanwhile... / At the same time...",
            "Para el punto de tensión o sorpresa: Suddenly / All of a sudden / Without warning / Out of nowhere / Just then / That's when...",
            "Para la resolución: Eventually / In the end / Finally / At last / By the time... / As a result...",
            "Para la reflexión o moraleja: Looking back... / In hindsight... / What I learned was... / Since then... / From that day on...",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores de causa, efecto y contraste en narrativas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Además de los conectores de secuencia, las narrativas usan conectores de causa y efecto para explicar por qué ocurrieron las cosas, y conectores de contraste para mostrar giros inesperados. Causa: because / since / as. 'I was late because I missed the bus.' / 'Since it was raining, we decided to stay inside.' Efecto: so / therefore / as a result. 'I forgot my homework, so the teacher was disappointed.' / 'The road was blocked; therefore, we took a different route.' Contraste (giro inesperado): but / however / although / even though / surprisingly. 'I expected to fail the exam. However, I passed with a good grade.' / 'Although we were lost, we ended up finding a beautiful restaurant.' Ejemplo con múltiples conectores: 'Last summer, I went on a road trip with my cousins. At first, everything was going well. However, when we were in the middle of the highway, our car broke down. Since it was very hot and we had no water, we were really worried. Fortunately, a kind family stopped and gave us a ride to the nearest town. Eventually, we fixed the car and continued. Looking back, it was the most stressful but also the most memorable part of the trip.'",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que los cuentacuentos profesionales (storytellers) en inglés usan pausas dramáticas y variación de velocidad tanto como los conectores correctos? La velocidad importa: ve más lento en el punto de tensión ('And then... [pausa] ...suddenly!') y más rápido en los eventos de acción. Los conectores dan estructura; tu voz da emoción. Practica contando la misma anécdota varias veces, cada vez usando conectores diferentes y variando la velocidad y el énfasis.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo narrativa con los conectores ubicados en sus posiciones: inicio (one day, last year), desarrollo (then, meanwhile, suddenly), resolución (eventually, in the end) y reflexión (looking back, since then)",
          caption: "Los conectores narrativos organizan el tiempo, la causa y el contraste para dar fluidez a la historia.",
        },
      ],
    },
  },

  // ── 20 ── Estrategias narrativas ──────────────────────────────────────────
  {
    slug: "in-iv-leer-textos-cortos-estrategias",
    titulo: "Reading short texts in English: strategies for A2+",
    categoria: "Estrategias narrativas",
    conceptos_clave: ["estrategias de lectura", "textos cortos", "inferencia", "vocabulario en contexto", "comprensión lectora A2+"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "A nivel A2+, los textos que leerás en inglés son más complejos que en el nivel anterior: narrativas personales, artículos de opinión cortos, descripciones de lugares y personas, y textos informativos sencillos. Leer con comprensión requiere estrategias activas: no basta con reconocer las palabras, hay que construir significado. En este semestre trabajarás con textos de 150-250 palabras y aprenderás a extraer información explícita e implícita, inferir el significado de palabras desconocidas y reconocer la intención del autor.",
        },
        {
          tipo: "subtitulo",
          contenido: "Antes de leer: activar conocimiento previo",
        },
        {
          tipo: "lista",
          items: [
            "Lee el título y los subtítulos. ¿De qué crees que trata el texto? ¿Qué ya sabes sobre ese tema?",
            "Mira las imágenes, gráficos o tablas si las hay. ¿Qué información visual te dan?",
            "Haz una predicción: 'I think this text is going to talk about...' Esta predicción activa tu vocabulario relacionado con el tema.",
            "Identifica el tipo de texto: ¿Es una historia personal? ¿Un artículo informativo? ¿Una opinión? El tipo de texto te dice qué esperar y cómo leer.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Durante la lectura: estrategias activas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Subrayar o marcar: señala las ideas principales y las palabras desconocidas importantes. No marques todo — solo lo esencial. Inferir significado en contexto: cuando encuentras una palabra desconocida, pregúntate: ¿Es sustantivo, verbo, adjetivo? ¿La oración anterior o siguiente da pistas? ¿Hay partes de la palabra que reconozco (prefijos, raíces, cognados)? Ejemplo: 'The journalist was devastated when she heard the news. She sat down and couldn't speak.' — 'devastated' viene después de una situación negativa (bad news) y la persona no puede hablar → inferimos que significa 'muy perturbada / destrozada'. Visualizar: mientras lees, crea imágenes mentales de lo que describe el texto. Esto mejora la comprensión y la memoria. Releer secciones difíciles: si una oración no tiene sentido, léela otra vez más despacio. Si el párrafo completo es confuso, vuelve al párrafo anterior — quizás perdiste información clave.",
        },
        {
          tipo: "subtitulo",
          contenido: "Después de leer: verificar comprensión",
        },
        {
          tipo: "parrafo",
          contenido:
            "Después de leer el texto completo, hazte estas preguntas para verificar tu comprensión: ¿De qué trata el texto en general? (idea principal) ¿Qué información específica presenta? (detalles) ¿Cuál es la opinión o postura del autor, si la hay? ¿Hay palabras o frases que no entendí? ¿Puedo inferir su significado? ¿Qué preguntas me quedan? ¿Qué conexiones puedo hacer con mi propia experiencia o conocimiento? Vocabulario útil para hablar sobre textos: The text is about... / According to the author... / The main idea is... / The author argues that... / I think the author's purpose is to... / A key word I didn't know was... but I think it means...",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un error común: buscar en el diccionario cada palabra desconocida interrumpe el flujo de lectura y reduce la comprensión global. Desarrolla la tolerancia a la ambigüedad: acepta que no entenderás el 100% de un texto y enfócate en el 80% que sí entiendes. Los lectores competentes en su propia lengua también encuentran palabras desconocidas — las infieren y siguen adelante. Esta habilidad es transferible entre idiomas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de tres fases de lectura (antes, durante y después) con estrategias específicas listadas en cada fase: predicción, inferencia, visualización y verificación de comprensión",
          caption: "La lectura activa en tres fases mejora significativamente la comprensión de textos en inglés A2+.",
        },
      ],
    },
  },

  // ── 21 ── Estrategias narrativas ──────────────────────────────────────────
  {
    slug: "in-iv-storytelling-cultural-mexico",
    titulo: "Cultural storytelling: sharing Mexico's stories in English",
    categoria: "Estrategias narrativas",
    conceptos_clave: ["storytelling cultural", "identidad mexicana", "narración intercultural", "orgullo cultural", "inglés como puente"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El storytelling cultural es la capacidad de contar historias de tu propia cultura en otro idioma de manera auténtica, precisa y con orgullo. Para estudiantes mexicanos de inglés A2+, esto significa poder hablar sobre el Día de Muertos, la comida, los sitios arqueológicos, la música regional, las tradiciones familiares y la historia de México con confianza y claridad. Esta habilidad no solo demuestra dominio del idioma, sino también inteligencia intercultural y autoestima cultural.",
        },
        {
          tipo: "subtitulo",
          contenido: "Por qué es importante contar tu cultura en inglés",
        },
        {
          tipo: "lista",
          items: [
            "Representación: cuando cuentas tu cultura en inglés, representas a tu comunidad ante el mundo. Muchos estereotipos sobre México en el extranjero vienen de la falta de voces mexicanas contando su propia historia.",
            "Conexión auténtica: las historias culturales propias son las más auténticas y emocionantes. Son mucho más fáciles de contar porque vienes de la experiencia vivida.",
            "Aprendizaje profundo: explicar tu cultura en otro idioma te obliga a analizar y reflexionar sobre ella. Muchas veces entendemos mejor nuestra propia cultura cuando intentamos explicarla en otro idioma.",
            "Oportunidades profesionales: el turismo, las relaciones internacionales, la diplomacia cultural y muchas industrias valoran enormemente a personas que pueden ser puentes culturales entre México y el mundo anglófono.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias para contar historias culturales mexicanas en inglés",
        },
        {
          tipo: "parrafo",
          contenido:
            "Estrategia 1 — Explica con comparaciones: 'Day of the Dead is a Mexican celebration similar to but very different from Halloween. While Halloween focuses on fear and costumes, Day of the Dead is a loving, joyful reunion with family members who have passed away.' Estrategia 2 — Describe con vocabulario visual y sensorial: 'When you visit Teotihuacán, you walk down a wide avenue called the Avenue of the Dead. On both sides, you see enormous pyramids rising into the blue sky. The air is dry and the stones are warm from the sun. It feels like walking through a living history book.' Estrategia 3 — Usa anécdotas personales: 'My grandmother taught me how to make tamales. Last summer, I visited Teotihuacán with my family. We climbed the Pyramid of the Sun. I'll never forget looking out from the top and seeing the entire ancient city below us.' Estrategia 4 — Corrige mitos con amabilidad: 'A lot of people outside Mexico think that Cinco de Mayo is our most important national holiday. Actually, it's not — September 16th, Independence Day, is. Cinco de Mayo commemorates the Battle of Puebla in 1862, but it's celebrated more in the USA than in Mexico itself.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Tu acento en inglés no importa tanto como tu contenido y tu autenticidad. Muchos de los comunicadores más efectivos en inglés en el mundo no son hablantes nativos — son personas que tienen algo valioso que decir y lo dicen con claridad y pasión. Tu experiencia de haber crecido en México, con sus tradiciones, paisajes, idiomas y complejidades, es una riqueza única. El inglés es la herramienta para compartir esa riqueza con el mundo.",
        },
        {
          tipo: "cita",
          contenido:
            "I am not afraid of storms, for I am learning how to sail my ship.",
          fuente: "Louisa May Alcott — adaptada como metáfora del aprendizaje de idiomas",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración de un estudiante mexicano de bachillerato contando una historia sobre la Pirámide del Sol a un grupo internacional de oyentes, con elementos culturales mexicanos (cempasúchil, bandera, pirámides) en el fondo",
          caption: "El storytelling cultural en inglés convierte tu identidad mexicana en un puente de conexión con el mundo.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaINIV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca IN-IV (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "IN-IV")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC IN-IV no encontrada. Ejecuta primero seed-mccems.ts y seed-iniv.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_INIV.map((f, i) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
    orden: i + 1,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas IN-IV: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de IN-IV insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca IN-IV completado.\n");
}

// ---------------------------------------------------------------------------
// ENTRYPOINT
// ---------------------------------------------------------------------------

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaINIV(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
