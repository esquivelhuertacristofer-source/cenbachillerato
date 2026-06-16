/**
 * Datos de la Ficha Teórica del laboratorio de Biomoléculas.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-IV-P05:
 *   - Marco teórico: puntos_clave de la infografía A1
 *     "Las cuatro biomoléculas de la vida: carbohidratos, lípidos, proteínas
 *     y ácidos nucleicos en la dieta mexicana" VERBATIM.
 *   - Glosario: glosario_interactivo A5 "Biomoléculas" VERBATIM.
 *
 * Módulo puro (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const BIOMOLECULAS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P05 · A1 — Las cuatro biomoléculas de la vida",

  // Marco teórico — VERBATIM de los puntos_clave de la infografía A1.
  marcoTeorico: [
    "Carbohidratos (glúcidos): fuente principal de energía celular. Se clasifican en monosacáridos (glucosa, fructosa), disacáridos (sacarosa, lactosa) y polisacáridos (almidón, glucógeno, celulosa). México es el centro de origen del maíz —la planta cultivada que más carbohidratos aporta a la humanidad.",
    "El maíz mexicano: CONABIO documenta 64 razas nativas adaptadas a microclimas específicos. El maíz fue domesticado por culturas mesoamericanas hace ~9,000 años en el actual Guerrero y Oaxaca. Un mexicano promedio consume ~125 kg de tortillas al año.",
    "Lípidos (grasas y aceites): moléculas de glicerol y ácidos grasos. Funcionan como reserva energética densa (9 kcal/g vs. 4 kcal/g de carbohidratos), componentes de membranas celulares (fosfolípidos) y señalización hormonal (esteroides). México es el primer productor mundial de aguacate, fruta con hasta 15% de grasa monoinsaturada cardioprotectora.",
    "Proteínas: polímeros de 20 aminoácidos posibles con funciones estructurales (queratina, colágeno), catalíticas (enzimas), de transporte (hemoglobina) y de defensa (anticuerpos). El frijol y el nopal son fuentes tradicionales de proteína vegetal con complementación ideal de aminoácidos en la dieta mesoamericana.",
    "Proteínas de origen alternativo: el chapulín (saltamontes) contiene entre 55–77% de proteína en peso seco —más que la carne de res (~25%)— y su producción requiere 12 veces menos agua. El IPN investiga su producción a escala industrial para reducir la huella hídrica de la proteína alimentaria en México.",
    "Ácidos nucleicos: ADN y ARN. El ADN almacena la información genética en secuencias de nucleótidos; el ARN traduce esa información en proteínas. La molécula de ADN humana tiene ~3,200 millones de pares de bases —extendida mediría ~2 metros de longitud.",
    "El LANGEBIO-CINVESTAV en Irapuato ha secuenciado el genoma completo de más de 15 razas de maíz nativo mexicano, mapeando genes responsables de adaptaciones únicas: resistencia a sequía, altitud y salinidad. Este conocimiento es clave para mejora genómica sin transgénesis.",
    "La nixtamalización —cocer el maíz con cal (hidróxido de calcio)— incrementa la disponibilidad de niacina (vitamina B3) en un 300% al romper la estructura molecular de los carbohidratos. Sin nixtamal, las dietas basadas en maíz causan pelagra (deficiencia de niacina).",
    "Las cuatro biomoléculas coexisten en todos los alimentos: una tortilla tiene principalmente carbohidratos (almidón), algo de proteína y trazas de lípidos; un aguacate tiene lípidos, fibra y pocos carbohidratos; los chapulines son ~70% proteína y ~10% grasa. Ningún alimento está formado por una sola biomolécula.",
  ],

  objetivos: [
    "Identificar las cuatro biomoléculas principales: carbohidratos, lípidos, proteínas y ácidos nucleicos.",
    "Reconocer las unidades estructurales (monómeros) de cada biomolécula y el tipo de enlace que las une.",
    "Relacionar la estructura de cada biomolécula con su función biológica específica.",
    "Explicar por qué los lípidos son insolubles en agua usando el concepto de polaridad.",
    "Describir el papel del ADN y el ARN en el flujo de información genética.",
    "Aprobar el cuestionario evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D de biomoléculas", detalle: "Monómero y ensamblado (polímero / estructura) de las 4 biomoléculas", icono: "fa-dna" },
    { nombre: "Infografía A1", detalle: "Las cuatro biomoléculas de la vida: contexto mexicano (maíz, aguacate, chapulín, LANGEBIO)", icono: "fa-image" },
    { nombre: "Selector de modo", detalle: "Alterna entre el monómero (subunidad) y el ensamblado (polímero)", icono: "fa-layer-group" },
    { nombre: "Lecturas de composición", detalle: "Conteo de átomos (C, H, O, N, P) de la geometría actual", icono: "fa-magnifying-glass-chart" },
  ],

  // Conceptos centrales formulados a partir de la infografía A1.
  conceptos: [
    { termino: "Biomolécula", definicion: "Molécula orgánica que forma los seres vivos. Las cuatro principales son carbohidratos, lípidos, proteínas y ácidos nucleicos. Todas contienen carbono, hidrógeno y oxígeno; las proteínas añaden nitrógeno y los ácidos nucleicos también fósforo." },
    { termino: "Monómero y polímero", definicion: "Un polímero es una molécula grande formada por la unión repetida de subunidades más pequeñas llamadas monómeros. Proteínas = polímeros de aminoácidos; ADN = polímero de nucleótidos; almidón = polímero de glucosa. Los lípidos NO son polímeros." },
    { termino: "Enlace peptídico", definicion: "Enlace covalente (–CO–NH–) que une el grupo carboxilo (–COOH) de un aminoácido con el grupo amino (–NH₂) del siguiente. Cada unión libera una molécula de agua (reacción de condensación)." },
    { termino: "Enlace glucosídico", definicion: "Enlace que une dos monosacáridos (p. ej., dos glucosas) en polisacáridos como el almidón o la celulosa, liberando agua. El almidón es la reserva energética vegetal; el glucógeno, la animal." },
    { termino: "Función de los ácidos nucleicos", definicion: "El ADN almacena la información genética en secuencias de cuatro bases (A, T, G, C); el ARN lleva ese mensaje al ribosoma para sintetizar proteínas. El flujo ADN → ARN → proteína se conoce como el dogma central de la biología molecular." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de CNEYT-IV-P05.
  glosario: [
    { termino: "Carbohidrato (glúcido)", definicion: "Biomolécula compuesta por C, H y O con fórmula general Cₙ(H₂O)ₙ; función principal: fuente de energía rápida y almacenamiento." },
    { termino: "Lípido", definicion: "Biomolécula apolar formada principalmente por C, H y O; funciones: reserva energética, componente de membranas y señalización." },
    { termino: "Proteína", definicion: "Polímero de aminoácidos unidos por enlaces peptídicos; funciones: estructura, catálisis (enzimas), transporte, defensa inmune y señalización." },
    { termino: "Ácido nucleico", definicion: "Polímero de nucleótidos (ADN y ARN) que almacena y transmite la información genética y dirige la síntesis de proteínas." },
    { termino: "Aminoácido", definicion: "Unidad estructural de las proteínas; molécula con un grupo amino (-NH₂), un grupo carboxilo (-COOH) y una cadena lateral (R) variable." },
    { termino: "Nucleótido", definicion: "Unidad estructural de los ácidos nucleicos; compuesto por una base nitrogenada, un azúcar (ribosa o desoxirribosa) y un grupo fosfato." },
    { termino: "Polímero", definicion: "Molécula grande formada por la unión repetida de subunidades más pequeñas llamadas monómeros. Las proteínas son polímeros de aminoácidos; el ADN, de nucleótidos; el almidón, de moléculas de glucosa." },
    { termino: "Enzima", definicion: "Proteína que actúa como catalizador biológico: acelera reacciones químicas sin consumirse. La amilasa salival que se activa al masticar tortilla descompone el almidón en azúcares simples." },
    { termino: "Nixtamalización", definicion: "Proceso mesoamericano prehispánico que consiste en cocer el maíz con agua y cal (Ca(OH)₂). Libera niacina unida a proteínas, aumenta el contenido de calcio y mejora la digestibilidad del maíz." },
    { termino: "Fosfolípido", definicion: "Lípido con una cabeza hidrófila y dos colas hidrófobas. Es el componente fundamental de las membranas celulares, formando una bicapa que separa el interior y el exterior de cada célula." },
  ],

  aplicaciones: [
    "La nixtamalización —proceso mesoamericano de 9,000 años— incrementa la disponibilidad de niacina (vitamina B3) en un 300%; sin ella, las dietas basadas en maíz causan pelagra.",
    "El LANGEBIO-CINVESTAV ha secuenciado más de 15 razas de maíz nativo mexicano para identificar genes de resistencia a sequía, altitud y salinidad: aplicación directa de los ácidos nucleicos.",
    "El aguacate (primer productor mundial: México) concentra grasa monoinsaturada cardioprotectora — un ejemplo de lípidos estructurales y de reserva.",
    "El chapulín contiene 55–77% de proteína en peso seco: más que la carne de res y con 12 veces menos agua de producción, relevante para la seguridad alimentaria.",
    "La epidemia de diabetes tipo 2 en México (primera causa de muerte; 75% de adultos con sobrepeso, ENSANUT 2022) tiene causas bioquímicas directas en el exceso de carbohidratos simples de ultraprocesados.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 (puntos_clave y glosario interno) y Glosario A5, CNEYT-IV-P05. Fuentes: CONABIO 2023; CINVESTAV LANGEBIO 2022; FAO 2023.",
};
