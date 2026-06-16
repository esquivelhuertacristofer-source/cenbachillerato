/**
 * Datos de la Ficha Teórica del laboratorio del Ciclo del Carbono.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-III-P04:
 *   - Marco teórico: puntos clave de la infografía A1
 *     «Ciclos biogeoquímicos y crisis climática: carbono, agua, nitrógeno y fósforo en México».
 *   - Glosario: glosario interactivo A5 «Glosario — Ciclos biogeoquímicos» (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CICLO_CARBONO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P04 · A1 — Ciclos biogeoquímicos y crisis climática",

  // Marco teórico — VERBATIM de los puntos clave de la infografía A1.
  marcoTeorico: [
    "Los ciclos biogeoquímicos mueven materiales entre cuatro reservorios: la atmósfera, la hidrosfera, la litosfera y la biosfera. La energía solar y la gravedad son los motores que mantienen activos estos ciclos.",
    "El ciclo del carbono en equilibrio: las plantas absorben CO₂ por fotosíntesis, los animales lo liberan por respiración, los descomponedores lo devuelven al suelo. La actividad humana añade ~37 Gt de CO₂ adicional por año, cantidad que los ecosistemas no reabsorben al ritmo actual.",
    "México emite aproximadamente 750 millones de toneladas de CO₂ equivalente por año (INECC 2022), el 1.4% de las emisiones globales. El 25% proviene de la deforestación y cambio de uso de suelo —una de las proporciones más altas entre economías emergentes.",
    "La Cuenca Lerma-Chapala, la más importante del centro del país, ha perdido el 74% de su caudal natural entre 1940 y 2020 por sobrexplotación agrícola e industrial. El Lago de Chapala alcanzó su nivel mínimo histórico en 2021 con apenas el 27% de capacidad.",
    "El ciclo del nitrógeno está siendo alterado por el uso masivo de fertilizantes: México aplica ~2 millones de toneladas anuales de fertilizantes nitrogenados. El nitrógeno no absorbido se lixivia al agua subterránea o escurre a ríos causando eutrofización.",
    "La eutrofización —enriquecimiento de nutrientes en cuerpos de agua— provoca floraciones de algas que consumen el oxígeno disuelto y matan peces. El lago Catemaco en Veracruz y la Bahía de Banderas son ejemplos recurrentes de este fenómeno en México.",
    "El ciclo del fósforo es el más lento: el fósforo no tiene fase gaseosa, circula exclusivamente entre suelos, agua y seres vivos. Las reservas mundiales de roca fosfática podrían agotarse en 300–400 años según estimaciones del USGS.",
    "Los humedales mexicanos —manglares, petenes, tulares y lagunas costeras— pueden almacenar de 3 a 5 veces más carbono por hectárea que los bosques tropicales, pero su destrucción libera ese carbono acumulado en siglos en pocas décadas.",
  ],

  objetivos: [
    "Describir la función de los cuatro reservorios biogeoquímicos: atmósfera, hidrosfera, litosfera y biosfera.",
    "Explicar cómo la fotosíntesis y la respiración regulan el ciclo del carbono.",
    "Identificar las consecuencias de la quema de combustibles fósiles sobre el balance de CO₂ atmosférico.",
    "Distinguir fijación, nitrificación y denitrificación en el ciclo del nitrógeno.",
    "Reconocer el impacto de la deforestación y los fertilizantes sobre los ciclos biogeoquímicos en México.",
    "Resolver el quiz de cierre de los ciclos biogeoquímicos (A3).",
  ],

  materiales: [
    { nombre: "Visor 3D del ciclo del carbono", detalle: "Tierra con reservorios y flujos de carbono en tiempo real", icono: "fa-arrows-spin" },
    { nombre: "Control de emisiones", detalle: "Deslizador de 0 a 50 Gt CO₂/año con balance en vivo", icono: "fa-sliders" },
    { nombre: "Panel de reservorios", detalle: "Tamaños globales de cada reservorio en GtC", icono: "fa-layer-group" },
    { nombre: "Datos de México", detalle: "INECC 2022 / SEMARNAT / CONAFOR — caso nacional", icono: "fa-map-location-dot" },
  ],

  // Conceptos centrales formulados a partir de la infografía A1 y el glosario A5.
  conceptos: [
    { termino: "Ciclo biogeoquímico", definicion: "Movimiento continuo de elementos químicos entre los componentes bióticos y abióticos de la biosfera. Los motores son la energía solar y la gravedad." },
    { termino: "Fotosíntesis", definicion: "Proceso por el cual plantas, algas y ciertas bacterias transforman CO₂ y agua en glucosa y oxígeno usando energía solar. Es la principal entrada de carbono a la biosfera." },
    { termino: "Respiración celular", definicion: "Proceso metabólico por el cual los seres vivos obtienen energía al descomponer glucosa, liberando CO₂ y agua como productos. Es la principal vía de salida de carbono de la biosfera." },
    { termino: "Sumidero de carbono", definicion: "Reservorio natural o artificial que absorbe y almacena más carbono del que libera. Los bosques, océanos y suelos son los principales sumideros naturales. Su destrucción convierte estos reservorios en fuentes de carbono." },
    { termino: "Eutrofización", definicion: "Enriquecimiento excesivo de nutrientes (especialmente nitrógeno y fósforo) en un cuerpo de agua, que provoca proliferación masiva de algas, déficit de oxígeno disuelto y muerte de especies acuáticas." },
    { termino: "Descomponedor", definicion: "Organismo (hongos, bacterias) que degrada la materia orgánica muerta y devuelve los nutrientes al suelo. Sin descomponedores, los nutrientes quedarían atrapados en la biomasa y los ciclos biogeoquímicos se detendrían." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5, CNEYT-III-P04.
  glosario: [
    { termino: "Ciclo biogeoquímico", definicion: "Movimiento continuo de elementos químicos entre los componentes bióticos y abióticos de la biosfera." },
    { termino: "Evapotranspiración", definicion: "Suma de la evaporación del agua superficial y la transpiración de las plantas; incorpora vapor de agua a la atmósfera." },
    { termino: "Fijación de nitrógeno", definicion: "Conversión del N₂ atmosférico en amonio (NH₄⁺) o nitratos por bacterias fijadoras, haciéndolo asimilable para las plantas." },
    { termino: "Denitrificación", definicion: "Proceso bacteriano que convierte nitratos (NO₃⁻) de nuevo en N₂ gaseoso, completando el ciclo del nitrógeno." },
    { termino: "Ciclo del fósforo", definicion: "Ciclo sin fase gaseosa significativa; el P se libera por erosión de rocas, pasa al suelo y agua, y es absorbido por plantas y animales." },
    { termino: "Sumidero de carbono", definicion: "Reservorio que absorbe más CO₂ del que libera, reduciendo su concentración en la atmósfera." },
  ],

  aplicaciones: [
    "El Acuerdo de París obliga a México a reducir sus emisiones de GEI en un 35% al 2030; la Estrategia Nacional REDD+ del CONAFOR es el mecanismo para conservar el ciclo del carbono mediante financiamiento climático internacional.",
    "La sobrexplotación agrícola e industrial ha alterado el ciclo del agua en la Cuenca Lerma-Chapala, perdiendo el 74% de su caudal natural entre 1940 y 2020.",
    "Los humedales mexicanos almacenan 3–5 veces más carbono por hectárea que los bosques tropicales, convirtiéndolos en ecosistemas clave para la mitigación del cambio climático.",
  ],

  fuente: "Fuente: INECC — Inventario Nacional de Emisiones GEI 2022; SEMARNAT — Informe de la Situación del Medio Ambiente en México 2022; CONAFOR — Estrategia Nacional REDD+ 2017–2030. Elaborado para CEN Bachillerato — CNEYT-III-P04-A1.",
};
