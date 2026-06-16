/**
 * Datos de la Ficha Teórica del laboratorio de Respiración celular (CNEYT-IV-P11).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Cómo la célula saca energía a la glucosa:
 * respiración aerobia y anaerobia» (lectura). Los términos del glosario provienen de A5
 * «Glosario: ATP, glucólisis, Krebs, cadena transportadora y fermentación».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 *
 * Fuente ancla: CNEYT-IV-P11-A1 (lectura) + CNEYT-IV-P11-A5 (glosario_interactivo).
 */

import type { FichaTeoricaData } from "./_ficha";

export const RESPIRACION_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV-P11 · A1 — Cómo la célula saca energía a la glucosa",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Cada célula de tu cuerpo necesita energía para vivir, y la obtiene de un combustible químico: la glucosa (C₆H₁₂O₆), un azúcar de seis carbonos. Pero la célula no «quema» la glucosa de golpe como una fogata; la desarma poco a poco en muchos pasos, y va guardando la energía liberada en una molécula recargable: el ATP (adenosín trifosfato), la «moneda energética» de la vida. Romper la glucosa hasta CO₂ y agua libera muchísima energía (ΔG ≈ −2870 kJ por mol), y la célula la captura en forma de ATP. Hay dos grandes rutas para hacerlo: la respiración AEROBIA (con oxígeno) y la respiración ANAEROBIA o fermentación (sin oxígeno).",
    "PASO COMÚN: LA GLUCÓLISIS. Toda degradación de glucosa empieza igual, en el citoplasma y sin necesidad de oxígeno: la GLUCÓLISIS («ruptura del azúcar»). En una serie de reacciones, la glucosa (6 carbonos) se parte en dos moléculas de PIRUVATO (3 carbonos cada una). El balance neto es modesto pero clave: se gastan 2 ATP al inicio y se producen 4, así que quedan 2 ATP NETOS, más 2 moléculas de NADH (un transportador de electrones «cargado»). Lo que pase después con el piruvato depende de si hay oxígeno.",
    "CON OXÍGENO: LA RESPIRACIÓN AEROBIA. Si hay O₂, el piruvato entra a la mitocondria y la célula extrae casi toda la energía restante en tres etapas. (1) OXIDACIÓN DEL PIRUVATO: cada piruvato se convierte en acetil-CoA, liberando CO₂ y generando NADH. (2) CICLO DE KREBS (o del ácido cítrico): el acetil-CoA se oxida por completo, soltando más CO₂ y cargando muchos transportadores (NADH y FADH₂), además de algo de ATP/GTP. (3) CADENA TRANSPORTADORA DE ELECTRONES: los NADH y FADH₂ entregan sus electrones a una cadena de proteínas en la membrana mitocondrial interna; la energía de esos electrones bombea protones y, al final, el O₂ actúa como ACEPTOR FINAL de electrones, combinándose con ellos y con protones para formar AGUA. Este flujo impulsa la síntesis de la mayor parte del ATP. La ecuación global de la respiración aerobia resume todo: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O. El rendimiento teórico clásico es de unos 38 ATP por glucosa (en las células reales suele ser ~30–32 por los costos de transporte): muchísimo más que sin oxígeno.",
    "SIN OXÍGENO: LA FERMENTACIÓN. Cuando falta O₂, la cadena transportadora se detiene y el NADH no puede descargarse ahí. La célula recurre a la FERMENTACIÓN: una ruta anaerobia que NO produce más ATP que la glucólisis (solo esos 2 ATP netos), pero que regenera el NAD⁺ para que la glucólisis no se frene. Hay dos tipos principales. En la FERMENTACIÓN LÁCTICA el piruvato se convierte en ácido láctico (lactato): ocurre en tus músculos durante un esfuerzo intenso —el ardor de un sprint— y en las bacterias que hacen el yogur y los quesos. En la FERMENTACIÓN ALCOHÓLICA el piruvato se transforma en etanol y CO₂: la realizan las levaduras, y es la base del pan (el CO₂ esponja la masa) y de bebidas como el pulque, el tequila y la cerveza.",
    "AEROBIA vs ANAEROBIA: ¿POR QUÉ IMPORTA? La diferencia de rendimiento es enorme: ~38 ATP con oxígeno frente a solo 2 sin él, es decir unas 19 veces más energía por glucosa. Por eso los organismos que respiran con oxígeno pueden sostener actividades costosas. Pero la fermentación es vital cuando el oxígeno escasea (en tus músculos al límite, o en microorganismos del suelo y del agua) y es la base de enormes desarrollos tecnológicos. En México, la fermentación sostiene industrias con denominación de origen como el tequila y el mezcal (a partir del agave de Jalisco y Oaxaca), además del pan, el yogur, el queso y la producción de BIOGÁS en biodigestores que convierten residuos orgánicos en combustible. Entender la química de la respiración —glucólisis, Krebs, cadena transportadora y fermentación— explica desde por qué respiras hasta cómo se hace una bebida o se genera energía limpia.",
  ],

  objetivos: [
    "Describir la glucólisis como el paso común que parte la glucosa en 2 piruvato con 2 ATP netos, sin oxígeno.",
    "Explicar las tres etapas de la respiración aerobia (oxidación del piruvato, Krebs, cadena transportadora) y su ecuación global C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O.",
    "Distinguir la fermentación láctica (ácido láctico) de la alcohólica (etanol + CO₂) y saber que ambas rinden solo 2 ATP.",
    "Comparar el rendimiento energético (~38 ATP aerobia vs 2 ATP fermentación) y conectarlo con desarrollos tecnológicos.",
    "Resolver el reto evaluable de la actividad A2 (balance de ATP, O₂ y CO₂).",
  ],

  materiales: [
    { nombre: "Escena 3D — Glucólisis", detalle: "Glucosa → 2 piruvato + 2 ATP netos en el citoplasma", icono: "fa-diagram-project" },
    { nombre: "Escena 3D — Aerobia", detalle: "Krebs + cadena transportadora → ~38 ATP en la mitocondria", icono: "fa-lungs" },
    { nombre: "Escena 3D — Fermentación", detalle: "Vías láctica y alcohólica: solo 2 ATP, regenera NAD⁺", icono: "fa-flask" },
    { nombre: "Escena 3D — Comparar", detalle: "Aerobia (~38 ATP) vs fermentación (2 ATP) en paralelo", icono: "fa-scale-balanced" },
    { nombre: "Calculadora A2", detalle: "Elige la vía y los moles de glucosa: ATP, O₂, CO₂, H₂O", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "ATP (adenosín trifosfato)", definicion: "La «moneda energética» de la célula; almacena y libera energía al ganar o perder un grupo fosfato." },
    { termino: "Glucosa (C₆H₁₂O₆)", definicion: "Azúcar de seis carbonos que sirve de combustible principal de la célula; su oxidación completa libera ΔG ≈ −2870 kJ/mol." },
    { termino: "Glucólisis", definicion: "Primera etapa, en el citoplasma y sin oxígeno: la glucosa se parte en 2 piruvato con saldo de 2 ATP netos y 2 NADH. Es el paso común a la aerobia y la fermentación." },
    { termino: "Respiración aerobia", definicion: "Oxidación completa de la glucosa con oxígeno (glucólisis + Krebs + cadena transportadora); ecuación global: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O; rinde ~38 ATP teóricos." },
    { termino: "Ciclo de Krebs", definicion: "Etapa mitocondrial que oxida el acetil-CoA liberando CO₂ y cargando transportadores NADH y FADH₂; también se llama ciclo del ácido cítrico." },
    { termino: "Cadena transportadora de electrones", definicion: "Serie de proteínas de la membrana mitocondrial donde los electrones del NADH/FADH₂ impulsan la síntesis de la mayor parte del ATP; el O₂ es el aceptor final y forma H₂O." },
    { termino: "Fermentación", definicion: "Respiración anaerobia (sin oxígeno) que solo aprovecha la glucólisis (2 ATP) y regenera NAD⁺ para que la glucólisis no se frene." },
    { termino: "Fermentación láctica", definicion: "El piruvato se convierte en ácido láctico (lactato); ocurre en los músculos en un sprint y en las bacterias del yogur y los quesos." },
    { termino: "Fermentación alcohólica", definicion: "El piruvato se convierte en etanol y CO₂, realizada por levaduras; base del pan, el pulque, el tequila y la cerveza." },
  ],

  // Glosario — VERBATIM de A5 (glosario_interactivo).
  glosario: [
    { termino: "ATP (adenosín trifosfato)", definicion: "La «moneda energética» de la célula; almacena y libera energía al ganar o perder un grupo fosfato. Ejemplo: la respiración aerobia rinde ~38 ATP por glucosa." },
    { termino: "Glucosa", definicion: "Azúcar de seis carbonos (C₆H₁₂O₆) que sirve de combustible principal de la célula. Ejemplo: su oxidación completa libera ΔG ≈ −2870 kJ/mol." },
    { termino: "Glucólisis", definicion: "Primera etapa, en el citoplasma y sin oxígeno: la glucosa se parte en 2 piruvato con saldo de 2 ATP netos y 2 NADH. Ejemplo: es el paso común a la aerobia y a la fermentación." },
    { termino: "Piruvato", definicion: "Molécula de tres carbonos producto de la glucólisis; su destino depende de si hay oxígeno. Ejemplo: con O₂ va a la mitocondria; sin O₂ se fermenta." },
    { termino: "Respiración aerobia", definicion: "Oxidación completa de la glucosa con oxígeno (glucólisis + Krebs + cadena transportadora); rinde ~38 ATP. Ejemplo: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O." },
    { termino: "Ciclo de Krebs", definicion: "Etapa mitocondrial que oxida el acetil-CoA liberando CO₂ y cargando NADH y FADH₂. Ejemplo: también se llama ciclo del ácido cítrico." },
    { termino: "Cadena transportadora de electrones", definicion: "Serie de proteínas de la membrana mitocondrial donde los electrones del NADH/FADH₂ impulsan la síntesis de la mayor parte del ATP; el O₂ es el aceptor final. Ejemplo: produce agua al combinar electrones, protones y O₂." },
    { termino: "Fermentación", definicion: "Respiración anaerobia (sin oxígeno) que solo aprovecha la glucólisis (2 ATP) y regenera NAD⁺. Ejemplo: permite a la célula seguir obteniendo algo de energía sin O₂." },
    { termino: "Fermentación láctica", definicion: "El piruvato se convierte en ácido láctico (lactato). Ejemplo: el ardor muscular en un sprint; el yogur y el queso." },
    { termino: "Fermentación alcohólica", definicion: "El piruvato se convierte en etanol y CO₂, realizada por levaduras. Ejemplo: el pan que esponja; el pulque, el tequila y la cerveza." },
    { termino: "NADH / FADH₂", definicion: "Transportadores que llevan electrones «cargados» a la cadena transportadora. Ejemplo: cada NADH rinde ~3 ATP y cada FADH₂ ~2 ATP." },
  ],

  aplicaciones: [
    "El tequila y el mezcal (Jalisco y Oaxaca) se producen por fermentación alcohólica del agave, una industria con denominación de origen.",
    "El pan, el yogur y los quesos aprovechan la fermentación (alcohólica y láctica) de microorganismos para transformar los alimentos.",
    "Los biodigestores convierten residuos orgánicos en biogás mediante fermentación anaerobia, generando combustible limpio.",
    "El ardor muscular durante un sprint intenso es fermentación láctica: los músculos agotan el O₂ y obtienen energía rápida a costa de solo 2 ATP.",
  ],

  fuente:
    "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», contenido formativo: Aspectos químicos de la glucólisis, ciclo de Krebs y cadena transportadora de electrones · Aspectos químicos de la fermentación · Desarrollos tecnológicos vinculados con la respiración aerobia y anaerobia.",
};
