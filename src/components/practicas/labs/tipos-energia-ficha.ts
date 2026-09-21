/**
 * Ficha Teórica del laboratorio "Tipos de energía: de los fenómenos naturales
 * a la tecnología" (CNEYT-II-P08, progresión 8 de Ciencias Naturales,
 * Experimentales y Tecnología II).
 *
 * La progresión no tiene lectura. El marco teórico reúne contenido VERBATIM de
 * sus actividades: los enunciados verdaderos del quiz A4 con su
 * retroalimentación, las definiciones del glosario A5 y la descripción del
 * video A8 (solo se unieron frases, sin cambiar su redacción). El glosario
 * junta el A5 y el A1. Los conceptos centrales son del laboratorio.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO_A1, GLOSARIO_A5, FUENTE } from "./tipos-energia-data";

export const TIPOS_ENERGIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P08 — Fenómenos naturales y aplicaciones tecnológicas de la energía (quiz A4, glosario A5, video A8)",

  marcoTeorico: [
    "Los conceptos de energía permiten explicar fenómenos naturales como las tormentas o el ciclo del agua. La energía está detrás de muchos fenómenos naturales.",
    "Fenómeno energético: suceso natural o artificial en el que intervienen transformaciones de energía. Explicar un fenómeno energético implica identificar las transformaciones de energía que ocurren: se analiza cómo cambia la energía de forma.",
    "Aplicación tecnológica: uso del conocimiento científico para crear dispositivos o procesos útiles. Una planta de generación eléctrica es una aplicación tecnológica de la energía: transforma una forma de energía en electricidad. Gracias al conocimiento de la energía se diseñan motores, paneles, electrodomésticos, etc.",
    "Máquina térmica: dispositivo que transforma calor en trabajo mecánico. Generador eléctrico: dispositivo que transforma energía mecánica en energía eléctrica.",
    "Distintos tipos de energía intervienen en fenómenos naturales y esas ideas se aplican en tecnologías cotidianas.",
  ],

  objetivos: [
    "Explicar un rayo, la brisa marina, una erupción y la fotosíntesis identificando su cadena de transformaciones de energía.",
    "Relacionar cada fenómeno natural con la tecnología que aprovecha esa misma energía.",
    "Calcular la potencia de un aerogenerador, una planta geotérmica y un panel solar, y compararla con la de una hoja.",
    "Leer un diagrama de flujo de energía: cuánta llega útil y en qué se pierde el resto.",
    "Diseñar una investigación sobre energía con pregunta, hipótesis, variables, al menos tres niveles y repeticiones.",
    "Concluir con base en datos si una hipótesis se confirma o se refuta.",
  ],

  materiales: [
    { nombre: "Cuatro dioramas de fenómenos", detalle: "Tormenta, playa con brisa, volcán y una planta al sol.", icono: "fa-mountain-sun" },
    { nombre: "Aerogenerador de 2 MW", detalle: "Rotor de 90 m de diámetro, arranca con 4 m/s y se detiene arriba de 25 m/s.", icono: "fa-fan" },
    { nombre: "Planta geotérmica", detalle: "Pozo, turbina, generador y torre de enfriamiento.", icono: "fa-industry" },
    { nombre: "Panel solar y hoja", detalle: "Un metro cuadrado de cada uno bajo la misma luz.", icono: "fa-solar-panel" },
    { nombre: "Diagrama de flujo de energía (Sankey)", detalle: "El ancho de cada franja es proporcional a la energía.", icono: "fa-diagram-project" },
    { nombre: "Banco de investigación", detalle: "Barras metálicas y sensor, panel con simulador solar, aparatos con medidor de energía.", icono: "fa-flask-vial" },
  ],

  conceptos: [
    {
      termino: "Cadena de transformaciones",
      definicion: "La secuencia de formas por las que pasa la energía en un fenómeno. En una tormenta: luminosa → térmica → cinética → eléctrica → luz, calor y sonido.",
    },
    {
      termino: "Eficiencia",
      definicion: "Fracción de la energía que entra y sale en la forma útil: η = energía útil / energía de entrada. El resto no desaparece: se va, sobre todo, como calor.",
    },
    {
      termino: "Potencia del viento",
      definicion: "P = ½·ρ·A·v³. Depende del cubo de la velocidad: con el doble de viento hay ocho veces más potencia. Ningún rotor puede extraer más del 59.3 % (límite de Betz).",
    },
    {
      termino: "Límite de una máquina térmica",
      definicion: "Una turbina de vapor no puede superar la eficiencia de Carnot, 1 − T_fría/T_caliente (en kelvin). Por eso un yacimiento más caliente produce más electricidad con el mismo vapor.",
    },
    {
      termino: "Fotosíntesis contra celda solar",
      definicion: "Un cultivo guarda cerca del 1 % de la luz como energía química (máximo teórico 4.6–6 %); un panel comercial convierte cerca del 20 % en electricidad.",
    },
    {
      termino: "Conducción térmica",
      definicion: "El calor pasa de partícula a partícula. Los materiales con más conductividad (cobre) lo transmiten más rápido que los de poca (acero inoxidable).",
    },
  ],

  glosario: [...GLOSARIO_A5, ...GLOSARIO_A1].map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los parques eólicos del Istmo de Tehuantepec, en Oaxaca, aprovechan uno de los vientos más constantes del mundo.",
    "Las plantas geotérmicas de Cerro Prieto (Baja California) y Los Azufres (Michoacán) generan electricidad con el calor del subsuelo.",
    "Los pararrayos protegen edificios conduciendo a tierra la energía de los rayos.",
    "Contar los segundos entre relámpago y trueno y dividir entre 3 da la distancia de la tormenta en kilómetros.",
  ],

  fuente: FUENTE,
};
