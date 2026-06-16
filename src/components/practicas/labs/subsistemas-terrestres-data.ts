/**
 * Datos puros del laboratorio de Subsistemas terrestres (CNEYT-III-P05).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A3
 * «¿Qué tanto conoces los subsistemas? Quiz de cierre». Se usa en la tarjeta
 * interactiva (parte B del tratamiento): el alumno responde el quiz real dentro
 * del lab.
 *
 * Nota: por convención el export se llama QUIZ_A2 aunque la fuente sea A3,
 * ya que A2 es la simulación propia del lab (slug=subsistemas-terrestres).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-III-P05-A3 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Qué tanto conoces los subsistemas? Quiz de cierre",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál de los cuatro subsistemas terrestres incluye todos los organismos vivos del planeta?",
      opciones: [
        "Hidrosfera",
        "Litosfera",
        "Atmósfera",
        "Biosfera",
      ],
      respuestaCorrecta: 3,
      retroalimentacion: "La biosfera comprende todos los organismos vivos y los ecosistemas que habitan, desde las profundidades oceánicas hasta la alta atmósfera. Es el único subsistema formado exclusivamente por seres vivos y sus interacciones.",
    },
    {
      enunciado: "¿Cuál es la composición aproximada de la atmósfera terrestre actual?",
      opciones: [
        "78% O₂, 21% N₂, 1% CO₂",
        "78% N₂, 21% O₂, ~1% otros gases (Ar, CO₂, vapor de agua)",
        "50% N₂, 50% O₂",
        "100% N₂ con trazas de O₂",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La atmósfera es ~78% nitrógeno (N₂), ~21% oxígeno (O₂) y ~1% otros gases (argón, CO₂, metano, vapor de agua). El CO₂ actual es ~0.042% (420 ppm), pequeño en volumen pero enorme en efecto climático.",
    },
    {
      enunciado: "¿Qué causa el movimiento de las placas tectónicas?",
      opciones: [
        "La rotación de la Tierra sobre su eje",
        "Las corrientes de convección en el manto terrestre caliente (astenósfera)",
        "La atracción gravitacional de la Luna",
        "La presión del agua de los océanos sobre la litosfera",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Las corrientes de convección en la astenósfera (parte del manto superior, plástica y caliente) arrastran las placas tectónicas. El calor interno de la Tierra (radioactividad y calor residual de la formación) impulsa estas corrientes.",
    },
    {
      enunciado: "¿Cómo conecta la biosfera con el ciclo del carbono de la atmósfera?",
      opciones: [
        "La biosfera solo produce CO₂ mediante la respiración",
        "Las plantas fijan CO₂ atmosférico mediante fotosíntesis; los organismos lo liberan por respiración y descomposición, creando un intercambio continuo entre biosfera y atmósfera",
        "La biosfera no tiene efecto sobre el CO₂ atmosférico",
        "Solo los océanos intercambian carbono con la atmósfera",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La biosfera es un componente activo del ciclo del carbono: la fotosíntesis extrae CO₂ de la atmósfera y lo fija en biomasa; la respiración, descomposición y combustión de biomasa lo devuelven. Los bosques son grandes sumideros de carbono.",
    },
    {
      enunciado: "¿Por qué el calentamiento global afecta la hidrosfera (ciclo del agua)?",
      opciones: [
        "Porque el calor evapora el agua de la atmósfera directamente",
        "Porque el aumento de temperatura acelera la evaporación, intensifica las precipitaciones extremas, derrite glaciares y eleva el nivel del mar, alterando todo el ciclo hidrológico",
        "Porque el calor crea nuevos océanos al derretir la litosfera",
        "Porque el calentamiento reduce la densidad del agua, lo que detiene las corrientes oceánicas inmediatamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El calentamiento global altera el ciclo del agua en múltiples formas: mayor evaporación (más lluvias intensas y más sequías en otras regiones), deshielo de glaciares y casquetes (sube el nivel del mar), y alteración de las corrientes oceánicas que distribuyen calor.",
    },
  ],
};
