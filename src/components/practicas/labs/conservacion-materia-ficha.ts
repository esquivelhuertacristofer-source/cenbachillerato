/**
 * Datos de la Ficha Teórica del laboratorio de Conservación de la materia.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P08:
 *   - Marco teórico: lectura A1 «Materia, transformaciones y medio ambiente»
 *     (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario — Materia, ambiente y sustentabilidad».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CONSERVACION_MATERIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P08 · A1 — Materia, transformaciones y medio ambiente",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La materia no desaparece: se transforma. Este principio, conocido como la Ley de Conservación de la Materia (formulada por Antoine Lavoisier en el siglo XVIII), establece que en toda reacción química la masa total de los reactivos es igual a la masa total de los productos. La materia puede cambiar de forma, de estado o de composición química, pero no se crea ni se destruye.",
    "Esta ley tiene consecuencias ambientales profundas. Cuando quemamos petróleo en los motores de los automóviles, el carbono del combustible no desaparece: se convierte en dióxido de carbono (CO₂) que se libera a la atmósfera. Cuando tiramos plástico al suelo, ese plástico no desaparece: se fragmenta en microplásticos que llegan a los suelos, ríos y océanos, y eventualmente a nuestra cadena alimentaria.",
    "Las transformaciones de la materia pueden ser físicas (cambios de estado, mezclas) o químicas (reacciones que producen nuevas sustancias). La combustión, la corrosión, la fotosíntesis y la descomposición son ejemplos de cambios químicos. En todos ellos, la materia se transforma pero se conserva.",
    "Comprender estos principios es fundamental para entender los problemas ambientales de nuestro tiempo: el cambio climático (acumulación de gases de efecto invernadero), la contaminación del agua y el suelo, la pérdida de biodiversidad. No son problemas abstractos: ocurren en el territorio donde vivimos, y sus causas y consecuencias involucran transformaciones de la materia que podemos estudiar con herramientas científicas.",
  ],

  objetivos: [
    "Comprender la Ley de Conservación de la Materia: la masa total de los reactivos es igual a la de los productos.",
    "Distinguir entre cambios físicos (sin cambio de composición) y cambios químicos (nuevas sustancias).",
    "Relacionar las transformaciones de la materia con problemas ambientales locales y globales.",
    "Identificar ejemplos de cambios químicos: combustión, corrosión, fotosíntesis y descomposición.",
    "Resolver el reto de conservación de la materia.",
  ],

  materiales: [
    { nombre: "Visor 3D de reacciones", detalle: "Muestra los átomos de reactivos y productos en tiempo real", icono: "fa-flask-vial" },
    { nombre: "Control de avance", detalle: "Arrastra para ver cómo los átomos se reacomodan sin crearse ni destruirse", icono: "fa-sliders" },
    { nombre: "Tabla de conservación", detalle: "Cuenta y compara los átomos de cada elemento antes y después", icono: "fa-scale-balanced" },
    { nombre: "Cuatro reacciones modelo", detalle: "Combustión, fotosíntesis, corrosión y síntesis de agua", icono: "fa-atom" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Ley de Conservación de la Materia", definicion: "Formulada por Lavoisier: en toda reacción química la masa total de los reactivos es igual a la masa total de los productos. La materia no se crea ni se destruye, solo se transforma." },
    { termino: "Cambio físico", definicion: "Transformación de la materia que no altera su composición química: cambios de estado, mezclas. Ejemplo: el hielo que se derrite." },
    { termino: "Cambio químico", definicion: "Transformación que produce nuevas sustancias con propiedades distintas. Ejemplos: combustión, corrosión, fotosíntesis, descomposición." },
    { termino: "Reactivos y productos", definicion: "Los reactivos son las sustancias que participan en una reacción; los productos son las nuevas sustancias que se forman. La masa total se conserva." },
    { termino: "Impacto ambiental", definicion: "La materia que parece desaparecer (basura, combustible) en realidad se transforma: CO₂ al quemar gasolina, microplásticos al degradarse el plástico." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P08.
  glosario: [
    { termino: "Ley de conservación de la materia", definicion: "La materia no se crea ni se destruye, solo se transforma." },
    { termino: "Cambio físico", definicion: "Transformación sin cambio en la composición química." },
    { termino: "Cambio químico", definicion: "Transformación que produce nuevas sustancias." },
    { termino: "Microplástico", definicion: "Fragmento de plástico menor a 5 mm que contamina ecosistemas." },
    { termino: "Gases de efecto invernadero", definicion: "Gases como el CO₂ que retienen calor en la atmósfera." },
    { termino: "Sustentabilidad", definicion: "Uso de recursos sin comprometer a las futuras generaciones." },
  ],

  aplicaciones: [
    "El reciclaje aplica la conservación: en lugar de acumular materia, la transforma en materiales reutilizables.",
    "Las plantas de tratamiento de agua usan reacciones químicas para transformar contaminantes en sustancias inocuas.",
    "Entender que el CO₂ no desaparece motiva políticas de reducción de combustibles fósiles y captura de carbono.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-I-P08.",
};
