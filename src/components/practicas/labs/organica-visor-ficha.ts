/**
 * Datos de la Ficha Teórica del laboratorio Visor de Química Orgánica.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-IV-P04:
 *   - Marco teórico: lectura A1 «Química orgánica: alcanos, alquenos,
 *     alcoholes y ácidos carboxílicos» (practica_slug=organica-visor).
 *   - Glosario: glosario interactivo A5 «Química orgánica básica».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ORGANICA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P04 · A1 — Química orgánica: alcanos, alquenos, alcoholes y ácidos carboxílicos",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-IV-P04-A1).
  marcoTeorico: [
    "La química orgánica es el estudio de los compuestos del carbono. ¿Por qué el carbono es tan especial? Porque puede formar cuatro enlaces covalentes, lo que le permite unirse a sí mismo formando cadenas, ramificaciones y anillos de cualquier longitud. Esta capacidad genera millones de compuestos diferentes; se conocen más de 20 millones de compuestos orgánicos distintos, comparados con solo unos 500,000 compuestos inorgánicos.",
    "Los alcanos son los hidrocarburos más simples: contienen solo carbono e hidrógeno con enlaces simples (C–C). El metano (CH₄) es el principal componente del gas natural que distribuye la CFE en México; el propano (C₃H₈) y el butano (C₄H₁₀) forman el gas LP que usan millones de hogares mexicanos para cocinar y calentar agua. Los alcanos son relativamente poco reactivos (por eso también se les llama \"parafinas\") y su principal reacción es la combustión.",
    "Los alquenos tienen al menos un doble enlace C=C, que los hace mucho más reactivos. El etileno (eteno, C₂H₄) es el compuesto orgánico más producido industrialmente en el mundo: es la materia prima del polietileno (bolsas de plástico, tuberías) y del PVC. En agricultura, el etileno es además una hormona vegetal que estimula la maduración de frutas; los distribuidores de frutas en México controlan su concentración para madurar plátanos, aguacates y jitomates de manera controlada.",
    "Los alcoholes tienen el grupo funcional –OH (hidroxilo). El etanol (C₂H₅OH) es el alcohol de las bebidas fermentadas y destiladas; también es aditivo de gasolinas en Brasil y, en menor medida, en México. El metanol (CH₃OH) es altamente tóxico; los fraudes de adulteración de bebidas alcohólicas con metanol han causado muertes en México, lo que motiva la regulación de la COFEPRIS.",
    "Los ácidos carboxílicos tienen el grupo –COOH. El ácido acético (CH₃COOH, al 5-8% en solución) es el vinagre presente en la cocina mexicana; el ácido cítrico da el sabor ácido a los limones (México es el mayor productor mundial de limón persa); el ácido acetilsalicílico (aspirina) fue el primer fármaco moderno producido en escala industrial.",
  ],

  objetivos: [
    "Identificar los cuatro grupos funcionales básicos (alcanos, alquenos, alcoholes, ácidos carboxílicos) y reconocerlos por su estructura química.",
    "Distinguir las propiedades de reactividad de cada familia orgánica según su tipo de enlace o grupo funcional.",
    "Relacionar compuestos orgánicos concretos (metano, etileno, etanol, ácido acético) con usos cotidianos e industriales en México.",
    "Explicar por qué el metanol y el etanol tienen efectos biológicos completamente distintos a pesar de ser ambos alcoholes.",
    "Resolver el cuestionario de grupos funcionales y nomenclatura de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor molecular 3D", detalle: "Modelos ball-and-stick de alcanos, alquenos, alcoholes y ácidos carboxílicos", icono: "fa-atom" },
    { nombre: "Selector de familia orgánica", detalle: "Cambia entre las cuatro familias y ve el grupo funcional resaltado", icono: "fa-layer-group" },
    { nombre: "Resaltador de grupo funcional", detalle: "–OH, –COOH y C=C resaltados en color para identificarlos al instante", icono: "fa-highlighter" },
    { nombre: "Ficha del compuesto", detalle: "Fórmula, número de átomos, reactividad y contexto real (México)", icono: "fa-flask" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Química orgánica", definicion: "El estudio de los compuestos del carbono. El carbono puede formar 4 enlaces covalentes y unirse a sí mismo en cadenas, ramas y anillos, generando más de 20 millones de compuestos distintos." },
    { termino: "Alcano", definicion: "Hidrocarburo saturado con solo enlaces simples C–C (fórmula general CₙH₂ₙ₊₂). Son relativamente poco reactivos («parafinas»); su principal reacción es la combustión. Ej.: metano (gas natural), propano/butano (gas LP)." },
    { termino: "Alqueno", definicion: "Hidrocarburo con al menos un doble enlace C=C que lo hace más reactivo que los alcanos (reacciones de adición). Ej.: etileno (eteno, C₂H₄), base del polietileno, PVC y hormona vegetal de maduración." },
    { termino: "Alcohol", definicion: "Compuesto orgánico con el grupo funcional hidroxilo (–OH). El etanol (C₂H₅OH) es el alcohol de las bebidas; el metanol (CH₃OH) es altamente tóxico porque se metaboliza en formaldehído y ácido fórmico." },
    { termino: "Ácido carboxílico", definicion: "Compuesto con el grupo carboxilo (–COOH), que cede un protón H⁺ en solución. Ej.: ácido acético (vinagre, 5-8%), ácido cítrico (limón; México es el mayor productor mundial de limón persa), aspirina." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de CNEYT-IV-P04.
  glosario: [
    { termino: "Alcano", definicion: "Hidrocarburo saturado con fórmula general CₙH₂ₙ₊₂ que solo contiene enlaces simples C-C." },
    { termino: "Alqueno", definicion: "Hidrocarburo insaturado con al menos un doble enlace C=C; fórmula general CₙH₂ₙ para cadena abierta." },
    { termino: "Alcohol", definicion: "Compuesto orgánico con el grupo funcional hidroxilo (-OH) unido a un carbono saturado." },
    { termino: "Ácido carboxílico", definicion: "Compuesto orgánico con el grupo funcional carboxilo (-COOH); es ácido débil que cede un protón H⁺ en solución." },
    { termino: "Grupo funcional", definicion: "Átomo o conjunto de átomos que determina las propiedades químicas características de una familia de compuestos orgánicos." },
    { termino: "Hidrocarburo", definicion: "Compuesto orgánico formado exclusivamente por carbono e hidrógeno; incluye alcanos, alquenos, alquinos y aromáticos." },
  ],

  aplicaciones: [
    "El gas LP (propano y butano, alcanos) es el combustible de millones de hogares mexicanos para cocinar y calentar agua.",
    "El etileno controla la maduración industrial de plátanos, aguacates y jitomates en México.",
    "La COFEPRIS regula el metanol en bebidas alcohólicas porque se metaboliza en formaldehído y ácido fórmico, causando ceguera y muerte.",
    "México es el mayor productor mundial de limón persa, cuyo sabor ácido proviene del ácido cítrico (–COOH).",
    "El ácido acetilsalicílico (aspirina) fue el primer fármaco moderno producido en escala industrial y pertenece a los ácidos carboxílicos.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-IV-P04.",
};
