/**
 * Refuerzo de actividades para CH-I (Conciencia Histórica I) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 4 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 4 progresiones × 4 = 16 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de Conciencia Histórica I (MCCEMS 2025):
 *   P01: Coordenadas espacio-temporales · P02: Formas de medir el tiempo histórico
 *   P03: Causalidad histórica · P04: Fuentes históricas primarias y secundarias
 * Uso: npx tsx scripts/seed-activities-chi-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CH-I — Conciencia Histórica I: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CH-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ CH-I refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Coordenadas espacio-temporales ════════════
  [
    {
      titulo: "Verdadero o Falso — Coordenadas espacio-temporales",
      descripcion: "Decide si cada afirmación sobre la ubicación de eventos históricos en el tiempo y el espacio es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una línea del tiempo es una herramienta que permite ubicar eventos históricos en orden cronológico, representando el tiempo de forma lineal.",
            respuesta: true,
            retroalimentacion: "Correcto. La línea del tiempo organiza eventos según su fecha, permitiendo visualizar la secuencia y la distancia temporal entre ellos.",
          },
          {
            enunciado: "El espacio geográfico no influye en el desarrollo de los procesos históricos; solo importa el tiempo en que ocurren.",
            respuesta: false,
            retroalimentacion: "Falso. El espacio geográfico condiciona profundamente los procesos históricos: los recursos naturales, las fronteras, los climas y las rutas comerciales moldean las decisiones humanas y el devenir de las sociedades.",
          },
          {
            enunciado: "La periodización histórica consiste en dividir el tiempo en etapas o períodos con características comunes para facilitar su estudio.",
            respuesta: true,
            retroalimentacion: "Correcto. Los historiadores dividen el tiempo en períodos (Prehistoria, Edad Antigua, Media, Moderna, Contemporánea) según criterios políticos, económicos o culturales, para organizar y comparar procesos.",
          },
          {
            enunciado: "La fecha exacta de un evento histórico es suficiente para comprenderlo en su totalidad; no es necesario conocer el contexto espacial ni social.",
            respuesta: false,
            retroalimentacion: "Falso. La fecha proporciona la ubicación temporal, pero comprender un evento requiere también conocer el espacio geográfico, las condiciones sociales, económicas y culturales que lo rodearon.",
          },
          {
            enunciado: "El mapa histórico es una fuente que permite situar espacialmente los procesos históricos, mostrando fronteras, rutas y territorios según una época determinada.",
            respuesta: true,
            retroalimentacion: "Correcto. Los mapas históricos muestran cómo era el territorio en un momento específico y ayudan a comprender expansiones, conquistas, migraciones y relaciones entre sociedades.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Coordenadas espacio-temporales",
      descripcion: "Glosario interactivo de conceptos para ubicar eventos históricos: tiempo, espacio, periodización, cronología y contexto histórico.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Coordenadas espacio-temporales",
            definicion: "Par de referencias —tiempo (cuándo) y espacio (dónde)— que permiten situar con precisión un evento o proceso histórico en su contexto de desarrollo.",
            ejemplo: "La Revolución Mexicana se ubica temporalmente entre 1910 y 1920, y espacialmente en el territorio mexicano, con epicentros en el norte (Chihuahua) y el sur (Morelos).",
            etiquetas: ["tiempo", "espacio", "contexto"],
          },
          {
            termino: "Cronología",
            definicion: "Ciencia auxiliar de la historia que establece el orden y la datación de los eventos históricos. Permite construir líneas del tiempo y secuencias de causas y efectos.",
            ejemplo: "La cronología de la Independencia de México: 1810 inicio del movimiento, 1813 Congreso de Chilpancingo, 1821 consumación de la Independencia.",
            etiquetas: ["tiempo", "secuencia", "datación"],
          },
          {
            termino: "Periodización",
            definicion: "División del tiempo histórico en etapas o períodos con características comunes, definidos por criterios políticos, económicos, culturales o tecnológicos.",
            ejemplo: "La historia universal se divide convencionalmente en Prehistoria, Edad Antigua, Edad Media, Edad Moderna y Edad Contemporánea.",
            etiquetas: ["etapas", "clasificación", "historia"],
          },
          {
            termino: "Contexto histórico",
            definicion: "Conjunto de circunstancias políticas, económicas, sociales y culturales que rodean un evento o proceso histórico y son indispensables para comprenderlo.",
            ejemplo: "El contexto de la Revolución Francesa incluye la crisis económica, la Ilustración, las desigualdades del Antiguo Régimen y las influencias de la Independencia de EE. UU.",
            etiquetas: ["entorno", "causas", "comprensión"],
          },
          {
            termino: "Línea del tiempo",
            definicion: "Herramienta gráfica que representa el paso del tiempo de forma lineal, ubicando eventos en el orden en que ocurrieron para visualizar secuencias y duraciones.",
            ejemplo: "Una línea del tiempo de la Segunda Guerra Mundial muestra desde 1939 (invasión de Polonia) hasta 1945 (rendición de Japón), con hitos intermedios.",
            etiquetas: ["representación gráfica", "cronología", "secuencia"],
          },
          {
            termino: "Mapa histórico",
            definicion: "Representación cartográfica que muestra el estado de un territorio en una época determinada: fronteras políticas, rutas comerciales, distribución de pueblos y civilizaciones.",
            ejemplo: "Un mapa del Imperio Romano en el siglo II d.C. permite ver su máxima extensión territorial y las provincias que lo componían.",
            etiquetas: ["espacio", "cartografía", "geografía histórica"],
          },
        ],
        actividad_final: "Elige un evento histórico de México o América Latina. Ubícalo en una línea del tiempo (con al menos 3 eventos relacionados) y dibuja o describe el espacio geográfico en que ocurrió. Explica cómo el contexto espacio-temporal influyó en su desarrollo.",
      },
    },
    {
      titulo: "Completa los huecos — Coordenadas espacio-temporales",
      descripcion: "Completa el texto sobre la ubicación de eventos históricos con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto histórico que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "Para situar un evento histórico se utilizan las ___ espacio-temporales, que responden a las preguntas cuándo y dónde ocurrió. La ciencia que establece el orden y la datación de los eventos se llama ___. Los historiadores dividen el tiempo en etapas mediante la ___, que facilita el estudio comparativo de las sociedades. El ___ histórico incluye las circunstancias políticas, económicas y sociales que rodearon al evento.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "coordenadas",
            alternativas_aceptadas: ["coordenadas espacio-temporales"],
            pista: "Par de referencias de tiempo y espacio que permiten situar un evento histórico con precisión.",
          },
          {
            posicion: 1,
            respuesta_correcta: "cronología",
            alternativas_aceptadas: [],
            pista: "Ciencia auxiliar de la historia que ordena y data los eventos; sirve para construir líneas del tiempo.",
          },
          {
            posicion: 2,
            respuesta_correcta: "periodización",
            alternativas_aceptadas: [],
            pista: "División del tiempo histórico en etapas con características comunes: Prehistoria, Edad Antigua, etc.",
          },
          {
            posicion: 3,
            respuesta_correcta: "contexto",
            alternativas_aceptadas: ["contexto histórico"],
            pista: "Conjunto de circunstancias que rodean un evento y son indispensables para comprenderlo.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Coordenadas espacio-temporales",
      descripcion: "Reflexiona sobre tu capacidad para ubicar eventos y procesos históricos en sus coordenadas de tiempo y espacio.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta autoevaluación no tiene calificación: es para reconocer tus fortalezas y áreas de mejora.",
        criterios: [
          { descripcion: "Ubico correctamente eventos históricos en una línea del tiempo, identificando su posición relativa y la distancia temporal entre ellos.", escala: escala4 },
          { descripcion: "Relaciono el espacio geográfico con el desarrollo de los procesos históricos, explicando cómo el territorio influyó en los eventos.", escala: escala4 },
          { descripcion: "Aplico la periodización histórica para clasificar épocas y explico los criterios que definen cada período.", escala: escala4 },
          { descripcion: "Describo el contexto histórico de un evento, integrando dimensiones políticas, económicas, sociales y culturales.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué evento histórico de México ubicarías en una línea del tiempo para entender mejor el presente? ¿Por qué ese evento y no otro?",
      },
    },
  ],

  // ════════════ P02 — Formas de medir y conceptualizar el tiempo histórico ════════════
  [
    {
      titulo: "Verdadero o Falso — Concepciones del tiempo histórico",
      descripcion: "Decide si cada afirmación sobre el tiempo cronológico, cíclico y subjetivo es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El tiempo cronológico mide el paso del tiempo de forma lineal y cuantitativa, usando unidades como segundos, años, décadas o siglos.",
            respuesta: true,
            retroalimentacion: "Correcto. El tiempo cronológico es el tiempo del reloj y el calendario: lineal, mensurable y universal. Es el que usan la historia y las ciencias para fechar y ordenar eventos.",
          },
          {
            enunciado: "Todas las culturas del mundo han medido el tiempo de la misma manera y con los mismos calendarios a lo largo de la historia.",
            respuesta: false,
            retroalimentacion: "Falso. Las culturas han desarrollado calendarios muy diversos: el gregoriano, el maya (Haab y Tzolkin), el islámico, el chino, el hebreo, entre otros. Cada uno responde a concepciones cosmológicas y sociales propias.",
          },
          {
            enunciado: "El tiempo cíclico concibe la historia como una sucesión de etapas que se repiten, como estaciones o ciclos agrícolas, a diferencia del tiempo lineal que avanza sin repetición.",
            respuesta: true,
            retroalimentacion: "Correcto. Muchas culturas antiguas (mayas, mesopotámicas, hinduistas) concibieron el tiempo como ciclos que se repiten eternamente. El tiempo lineal, en cambio, es propio de las concepciones judeocristianas y modernas.",
          },
          {
            enunciado: "El tiempo subjetivo es idéntico al tiempo cronológico porque ambos se miden en horas y minutos.",
            respuesta: false,
            retroalimentacion: "Falso. El tiempo subjetivo es la percepción personal y emocional del tiempo: una hora puede sentirse larga o corta según la experiencia vivida. Es cualitativamente distinto del tiempo cronológico, que es objetivo y mensurable.",
          },
          {
            enunciado: "El calendario maya integra dos ciclos entrelazados —el Haab (365 días) y el Tzolkin (260 días)— que se combinan para formar la Cuenta Larga.",
            respuesta: true,
            retroalimentacion: "Correcto. El sistema calendárico maya es sofisticado: el Haab es el año solar, el Tzolkin es el año ritual, y la Cuenta Larga mide grandes períodos históricos. Juntos forman la Rueda Calendárica que se repite cada 52 años.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Concepciones del tiempo histórico",
      descripcion: "Glosario interactivo de conceptos sobre el tiempo: cronológico, cíclico, subjetivo, calendario y duración histórica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Tiempo cronológico",
            definicion: "Medición lineal y cuantitativa del tiempo mediante unidades convencionales (segundos, años, siglos). Es la base de la datación histórica y el calendario.",
            ejemplo: "La Revolución Francesa duró cronológicamente de 1789 a 1799: diez años que se pueden medir y subdividir con precisión.",
            etiquetas: ["lineal", "mensurable", "calendario"],
          },
          {
            termino: "Tiempo cíclico",
            definicion: "Concepción del tiempo como una sucesión de ciclos o fases que se repiten regularmente, vinculada a fenómenos naturales (estaciones, cosechas, ciclos lunares) y cosmológicos.",
            ejemplo: "El calendario agrícola mesoamericano organizaba las actividades humanas según los ciclos de la lluvia, la siembra y la cosecha, concibiendo el tiempo como circular.",
            etiquetas: ["ciclos", "repetición", "cosmología"],
          },
          {
            termino: "Tiempo subjetivo",
            definicion: "Percepción personal y emocional del tiempo, que varía según la experiencia del individuo o la comunidad. No coincide necesariamente con el tiempo cronológico.",
            ejemplo: "Una hora de espera en una sala de urgencias se siente más larga que una hora de juego; esta diferencia perceptual es el tiempo subjetivo.",
            etiquetas: ["percepción", "experiencia", "psicología"],
          },
          {
            termino: "Calendario",
            definicion: "Sistema de organización del tiempo que divide el año en meses, semanas y días, basado en ciclos astronómicos (solar, lunar o lunisolar). Cada cultura ha desarrollado el suyo.",
            ejemplo: "El calendario gregoriano, usado mundialmente, se basa en el año solar de 365.25 días; el calendario maya Haab también usaba 365 días pero integrado en un sistema ritual.",
            etiquetas: ["sistema", "organización temporal", "cultura"],
          },
          {
            termino: "Duración histórica (Braudel)",
            definicion: "Concepto del historiador Fernand Braudel que distingue tres tiempos históricos: la larga duración (estructuras lentas), la mediana duración (coyunturas) y el tiempo corto (eventos concretos).",
            ejemplo: "El clima y la geografía son de larga duración; una crisis económica es de mediana duración; una batalla es de tiempo corto.",
            etiquetas: ["Braudel", "estructura", "coyuntura"],
          },
          {
            termino: "Anacronismo",
            definicion: "Error histórico que consiste en atribuir a una época ideas, objetos, valores o prácticas propios de otra época, generalmente trasladando el presente al pasado.",
            ejemplo: "Imaginar que los aztecas usaban teléfonos celulares o que los griegos antiguos pensaban como ciudadanos democráticos modernos son ejemplos de anacronismo.",
            etiquetas: ["error histórico", "anacronismo", "interpretación"],
          },
        ],
        actividad_final: "Compara el sistema calendárico gregoriano con un calendario de otra cultura (maya, chino, islámico u otro). Identifica: (a) qué ciclos astronómicos usa, (b) qué concepción del tiempo refleja (lineal o cíclica), (c) qué nos dice sobre la cosmovisión de esa cultura.",
      },
    },
    {
      titulo: "Completa los huecos — Concepciones del tiempo histórico",
      descripcion: "Completa el texto sobre las diferentes formas de medir y conceptualizar el tiempo histórico.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "El tiempo ___ mide el paso del tiempo de forma lineal y cuantitativa mediante unidades como años y siglos. En contraste, el tiempo ___ concibe la historia como ciclos que se repiten, como las estaciones o los ciclos agrícolas. La percepción personal y emocional del tiempo se denomina tiempo ___. Fernand Braudel propuso distinguir tres ritmos históricos en su concepto de ___histórica.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "cronológico",
            alternativas_aceptadas: [],
            pista: "Tipo de tiempo que se mide con relojes y calendarios; es lineal y mensurable.",
          },
          {
            posicion: 1,
            respuesta_correcta: "cíclico",
            alternativas_aceptadas: ["cíclico"],
            pista: "Concepción del tiempo basada en la repetición de ciclos; propia de muchas culturas antiguas.",
          },
          {
            posicion: 2,
            respuesta_correcta: "subjetivo",
            alternativas_aceptadas: [],
            pista: "Forma de vivir el tiempo según la experiencia personal: a veces parece largo, a veces corto.",
          },
          {
            posicion: 3,
            respuesta_correcta: "duración",
            alternativas_aceptadas: ["la duración"],
            pista: "Concepto de Braudel que distingue larga duración, mediana duración y tiempo corto: ___ histórica.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Concepciones del tiempo histórico",
      descripcion: "Reflexiona sobre tu comprensión de las diferentes formas en que las culturas han medido y conceptualizado el tiempo.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No hay respuestas incorrectas: es un ejercicio de autoconocimiento histórico.",
        criterios: [
          { descripcion: "Distingo entre tiempo cronológico, cíclico y subjetivo, y explico con ejemplos en qué difieren.", escala: escala4 },
          { descripcion: "Comparo al menos dos sistemas calendáricos de diferentes culturas, identificando la concepción del tiempo que reflejan.", escala: escala4 },
          { descripcion: "Explico el concepto de duración histórica de Braudel y lo aplico para analizar un proceso histórico.", escala: escala4 },
          { descripcion: "Identifico anacronismos en interpretaciones históricas y argumento por qué constituyen un error metodológico.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo percibes el tiempo en tu propia vida? ¿Hay momentos en que el tiempo subjetivo difiere mucho del cronológico? ¿Qué dice esto sobre la experiencia histórica de las personas del pasado?",
      },
    },
  ],

  // ════════════ P03 — Causalidad histórica y multicausalidad ════════════
  [
    {
      titulo: "Verdadero o Falso — Causalidad histórica",
      descripcion: "Decide si cada afirmación sobre las relaciones de causalidad, multicausalidad y consecuencias en la historia es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La multicausalidad histórica reconoce que los eventos y procesos históricos son resultado de múltiples causas simultáneas, no de una sola causa aislada.",
            respuesta: true,
            retroalimentacion: "Correcto. La historiografía contemporánea rechaza el monocausalismo: un evento como la Revolución Mexicana tuvo causas políticas (dictadura porfirista), económicas (concentración de tierras), sociales (desigualdad) y culturales entrelazadas.",
          },
          {
            enunciado: "En historia, las causas y las consecuencias de un evento son siempre simultáneas: ocurren al mismo tiempo.",
            respuesta: false,
            retroalimentacion: "Falso. Las causas preceden temporalmente al evento y las consecuencias lo suceden. Además, un mismo evento puede tener consecuencias de distinto alcance temporal: inmediatas, a mediano plazo y de larga duración.",
          },
          {
            enunciado: "Distinguir entre causas estructurales y causas coyunturales ayuda a comprender mejor los procesos históricos complejos.",
            respuesta: true,
            retroalimentacion: "Correcto. Las causas estructurales son profundas y de larga duración (pobreza, desigualdad, tensiones étnicas); las coyunturales son detonantes inmediatos (un asesinato, una crisis económica repentina). Ambas son necesarias para explicar un evento.",
          },
          {
            enunciado: "La relación causa-efecto en historia es siempre determinista: una misma causa produce inevitablemente el mismo efecto en cualquier contexto.",
            respuesta: false,
            retroalimentacion: "Falso. La historia no es determinista. Las mismas condiciones en contextos diferentes pueden producir resultados distintos, dependiendo de la agencia humana, las decisiones políticas y las contingencias. El historiador no predice, sino explica.",
          },
          {
            enunciado: "El análisis de las consecuencias de un evento histórico puede revelar efectos no intencionados que los actores originales no previeron.",
            respuesta: true,
            retroalimentacion: "Correcto. La historia está llena de consecuencias no deseadas: la Revolución Industrial produjo mejoras materiales pero también contaminación, explotación laboral y crisis sociales que nadie previó plenamente.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Causalidad histórica",
      descripcion: "Glosario interactivo de conceptos sobre causalidad: causa, consecuencia, multicausalidad, determinismo histórico y agencia humana.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Causalidad histórica",
            definicion: "Relación de causa y efecto entre fenómenos históricos: las causas son condiciones o eventos anteriores que generan o posibilitan el surgimiento de nuevos eventos o procesos.",
            ejemplo: "La causalidad de la Primera Guerra Mundial incluye causas como el sistema de alianzas, el nacionalismo exacerbado, el imperialismo y el asesinato del archiduque Francisco Fernando.",
            etiquetas: ["causa", "efecto", "relación"],
          },
          {
            termino: "Multicausalidad",
            definicion: "Principio historiográfico que reconoce que los eventos históricos son resultado de múltiples causas de distinta naturaleza (política, económica, social, cultural) que interactúan entre sí.",
            ejemplo: "La Revolución Mexicana no tuvo una sola causa; fue producto de la dictadura porfirista, la desigualdad agraria, el caudillismo regional, la influencia del anarquismo y las aspiraciones de distintas clases sociales.",
            etiquetas: ["múltiples causas", "complejidad", "historiografía"],
          },
          {
            termino: "Causa estructural",
            definicion: "Condición profunda y duradera —política, económica, social o cultural— que crea el terreno propicio para que un evento histórico ocurra. Opera a largo plazo.",
            ejemplo: "La desigualdad extrema entre las clases sociales en el Porfiriato fue una causa estructural de la Revolución Mexicana.",
            etiquetas: ["larga duración", "estructura", "condición"],
          },
          {
            termino: "Causa coyuntural",
            definicion: "Evento o circunstancia inmediata que actúa como detonante o catalizador de un proceso histórico ya condicionado por causas estructurales.",
            ejemplo: "El asesinato del archiduque Francisco Fernando en Sarajevo (1914) fue la causa coyuntural que detonó la Primera Guerra Mundial, sobre un terreno ya tensionado por causas estructurales.",
            etiquetas: ["detonante", "corto plazo", "coyuntura"],
          },
          {
            termino: "Consecuencia histórica",
            definicion: "Efecto o resultado de un evento o proceso histórico, que puede ser inmediato o de largo plazo, intencionado o no previsto por los actores.",
            ejemplo: "Consecuencias de la Revolución Mexicana: la Constitución de 1917, la reforma agraria, el surgimiento del Estado mexicano posrevolucionario y la formación de una identidad nacional.",
            etiquetas: ["efecto", "resultado", "impacto"],
          },
          {
            termino: "Agencia histórica",
            definicion: "Capacidad de los actores históricos (individuos, grupos, movimientos) para tomar decisiones y actuar, influyendo en el curso de los eventos históricos.",
            ejemplo: "La agencia de Emiliano Zapata —su liderazgo y el Plan de Ayala— fue fundamental para que la demanda agraria se convirtiera en un eje central de la Revolución Mexicana.",
            etiquetas: ["actores", "decisión", "influencia"],
          },
        ],
        actividad_final: "Elige un proceso histórico (puede ser de México, América Latina o mundial). Elabora un mapa de causalidad: identifica al menos 2 causas estructurales, 1 causa coyuntural y 3 consecuencias (inmediata, a mediano plazo y de largo alcance). Explica las relaciones entre ellas.",
      },
    },
    {
      titulo: "Completa los huecos — Causalidad histórica",
      descripcion: "Completa el texto sobre causalidad y consecuencias en los procesos históricos con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto histórico que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "El principio de ___ reconoce que los eventos históricos son resultado de múltiples causas entrelazadas y no de una sola. Las condiciones profundas y duraderas que crean el terreno propicio para un evento se denominan causas ___. En cambio, el evento inmediato que detona el proceso se llama causa ___. La capacidad de los actores para tomar decisiones e influir en la historia se conoce como ___ histórica.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "multicausalidad",
            alternativas_aceptadas: [],
            pista: "Principio que afirma que los eventos históricos tienen múltiples causas simultáneas de distinta naturaleza.",
          },
          {
            posicion: 1,
            respuesta_correcta: "estructurales",
            alternativas_aceptadas: ["estructural"],
            pista: "Causas de largo plazo que crean las condiciones para que ocurra un evento: causas ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "coyuntural",
            alternativas_aceptadas: ["coyunturales"],
            pista: "Causa inmediata que actúa como detonante o catalizador de un proceso ya condicionado: causa ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "agencia",
            alternativas_aceptadas: [],
            pista: "Capacidad de los actores históricos (personas, grupos) de tomar decisiones e influir en los eventos: ___ histórica.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Causalidad histórica",
      descripcion: "Reflexiona sobre tu comprensión de las relaciones de causalidad y consecuencias en los procesos históricos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta reflexión es para identificar tus avances y áreas de oportunidad.",
        criterios: [
          { descripcion: "Identifico y distingo causas estructurales y coyunturales de un proceso histórico, explicando el papel de cada una.", escala: escala4 },
          { descripcion: "Aplico el principio de multicausalidad para analizar un evento histórico, reconociendo causas de diferente naturaleza.", escala: escala4 },
          { descripcion: "Analizo las consecuencias de un proceso histórico, distinguiendo entre efectos inmediatos, a mediano plazo y de largo alcance.", escala: escala4 },
          { descripcion: "Reconozco el papel de la agencia humana en la historia, valorando cómo las decisiones de los actores influyeron en los eventos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué evento histórico de tu entorno (local, nacional o mundial) te parece más complejo de explicar causalmente? ¿Qué causas identificas? ¿Cómo se relacionan entre sí?",
      },
    },
  ],

  // ════════════ P04 — Fuentes históricas primarias y secundarias ════════════
  [
    {
      titulo: "Verdadero o Falso — Fuentes históricas",
      descripcion: "Decide si cada afirmación sobre las fuentes históricas primarias, secundarias y su evaluación crítica es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una fuente primaria es aquella que fue producida en el mismo tiempo y lugar del evento histórico que documenta, por un actor o testigo directo.",
            respuesta: true,
            retroalimentacion: "Correcto. Las fuentes primarias son documentos, objetos o testimonios originales: cartas, diarios, fotografías, actas oficiales, artefactos arqueológicos. Son la evidencia directa del pasado.",
          },
          {
            enunciado: "Un libro de texto de historia publicado en 2020 sobre la Segunda Guerra Mundial es una fuente primaria de ese conflicto.",
            respuesta: false,
            retroalimentacion: "Falso. Un libro de texto publicado décadas después es una fuente secundaria: analiza e interpreta fuentes primarias. Una fuente primaria de la Segunda Guerra Mundial sería, por ejemplo, un diario de un soldado escrito durante el conflicto.",
          },
          {
            enunciado: "La crítica histórica exige que el historiador evalúe tanto la autenticidad (si la fuente es real) como la veracidad (si la información que contiene es verdadera) de cada fuente.",
            respuesta: true,
            retroalimentacion: "Correcto. La crítica interna evalúa la veracidad del contenido (¿el autor dice la verdad?); la crítica externa evalúa la autenticidad del documento (¿es genuino o falsificado?). Ambas son indispensables.",
          },
          {
            enunciado: "Las fuentes orales (testimonios, tradiciones, mitos) no tienen valor histórico porque no están escritas y, por tanto, no son confiables.",
            respuesta: false,
            retroalimentacion: "Falso. Las fuentes orales son reconocidas como evidencia histórica válida, especialmente para comunidades sin tradición escrita. Requieren el mismo análisis crítico que las escritas, pero aportan perspectivas únicas sobre el pasado.",
          },
          {
            enunciado: "El sesgo en una fuente histórica no la invalida automáticamente; el historiador puede usarla reconociendo su perspectiva y limitaciones.",
            respuesta: true,
            retroalimentacion: "Correcto. Toda fuente tiene un punto de vista (ideológico, de clase, de género, cultural). El historiador no descarta fuentes sesgadas; las analiza críticamente, las cruza con otras y considera el contexto de su producción.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Fuentes históricas",
      descripcion: "Glosario interactivo de conceptos sobre fuentes históricas: primaria, secundaria, crítica histórica, sesgo y evidencia.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Fuente primaria",
            definicion: "Documento, objeto o testimonio producido en el mismo tiempo y lugar del evento histórico, por actores o testigos directos. Es evidencia directa del pasado.",
            ejemplo: "El diario de Ana Frank, las actas del Congreso Constituyente de 1916-1917, un códice prehispánico o una fotografía de la Revolución Mexicana son fuentes primarias.",
            etiquetas: ["evidencia directa", "documento original", "testimonio"],
          },
          {
            termino: "Fuente secundaria",
            definicion: "Obra que analiza, interpreta o sintetiza fuentes primarias, producida después de los eventos que estudia. Incluye libros de historia, artículos académicos y enciclopedias.",
            ejemplo: "Una monografía académica sobre la Revolución Mexicana publicada en 2010, que analiza documentos de archivo y testimonios de la época, es una fuente secundaria.",
            etiquetas: ["interpretación", "análisis", "historiografía"],
          },
          {
            termino: "Crítica histórica",
            definicion: "Método para evaluar la fiabilidad de las fuentes históricas. La crítica externa verifica la autenticidad del documento; la crítica interna evalúa la veracidad de su contenido.",
            ejemplo: "Para validar un códice colonial, el historiador analiza el material (crítica externa) y contrasta la información con otras fuentes (crítica interna).",
            etiquetas: ["metodología", "autenticidad", "veracidad"],
          },
          {
            termino: "Sesgo histórico",
            definicion: "Perspectiva, interés o prejudicio que condiciona la forma en que una fuente presenta los eventos. Todo documento tiene un punto de vista que el historiador debe identificar y considerar.",
            ejemplo: "Un parte de guerra oficial tiende a presentar las batallas favorablemente para el bando que lo redacta; el historiador debe cruzarlo con fuentes del bando contrario.",
            etiquetas: ["perspectiva", "parcialidad", "análisis crítico"],
          },
          {
            termino: "Fuente oral",
            definicion: "Testimonio transmitido verbalmente: entrevistas, tradiciones, leyendas, canciones. Son especialmente valiosas para estudiar comunidades sin tradición escrita o perspectivas subalternas.",
            ejemplo: "Los testimonios de sobrevivientes del terremoto de 1985 en la Ciudad de México son fuentes orales que complementan los registros escritos y fotográficos.",
            etiquetas: ["testimonio", "tradición", "historia oral"],
          },
          {
            termino: "Heurística histórica",
            definicion: "Primera etapa del método histórico: búsqueda, localización y recopilación sistemática de las fuentes disponibles sobre el tema de estudio.",
            ejemplo: "Para investigar la vida cotidiana en la Nueva España, el historiador realiza heurística en archivos coloniales, bibliotecas y colecciones de documentos eclesiásticos.",
            etiquetas: ["método histórico", "búsqueda", "archivo"],
          },
        ],
        actividad_final: "Elige un evento histórico de tu interés. Identifica: (a) al menos 2 fuentes primarias que podrías consultar, (b) 2 fuentes secundarias disponibles, y (c) un posible sesgo en cada fuente primaria. Explica cómo cruzarías las fuentes para obtener una visión más completa del evento.",
      },
    },
    {
      titulo: "Completa los huecos — Fuentes históricas",
      descripcion: "Completa el texto sobre la identificación y evaluación de fuentes históricas con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto histórico que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "Una fuente ___ es aquella producida en el mismo tiempo y lugar del evento histórico, como un diario, una carta o un artefacto. En contraste, una fuente ___ interpreta o sintetiza los documentos originales, como un libro de texto o un artículo académico. La ___ histórica es el método para evaluar la autenticidad y veracidad de los documentos. Todo documento tiene un ___ que el historiador debe identificar y considerar en su análisis.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "primaria",
            alternativas_aceptadas: ["primarias"],
            pista: "Tipo de fuente producida directamente en la época del evento: cartas, diarios, fotografías originales.",
          },
          {
            posicion: 1,
            respuesta_correcta: "secundaria",
            alternativas_aceptadas: ["secundarias"],
            pista: "Tipo de fuente que analiza e interpreta las fuentes directas: libros de historia, enciclopedias, monografías.",
          },
          {
            posicion: 2,
            respuesta_correcta: "crítica",
            alternativas_aceptadas: ["crítica histórica"],
            pista: "Método que evalúa la autenticidad (crítica externa) y la veracidad (crítica interna) de los documentos históricos.",
          },
          {
            posicion: 3,
            respuesta_correcta: "sesgo",
            alternativas_aceptadas: [],
            pista: "Perspectiva, interés o prejuicio que condiciona la forma en que una fuente presenta los eventos históricos.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Fuentes históricas",
      descripcion: "Reflexiona sobre tu capacidad para identificar, clasificar y evaluar críticamente fuentes históricas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta autoevaluación es el punto de partida para tu Producto Integrador.",
        criterios: [
          { descripcion: "Distingo correctamente entre fuentes primarias y secundarias, y explico el valor de cada tipo para el estudio histórico.", escala: escala4 },
          { descripcion: "Aplico la crítica histórica para evaluar la autenticidad y veracidad de un documento, identificando sus limitaciones.", escala: escala4 },
          { descripcion: "Identifico el sesgo o perspectiva de una fuente histórica y explico cómo influye en la información que transmite.", escala: escala4 },
          { descripcion: "Cruzo información de al menos dos fuentes diferentes para construir una interpretación más completa y fundamentada de un evento histórico.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué tipo de fuente histórica sobre tu comunidad o región te gustaría consultar para entender mejor su pasado? ¿Dónde crees que podrías encontrarla?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
