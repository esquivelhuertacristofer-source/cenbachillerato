/**
 * Ficha teórica del laboratorio «Atlas del cuerpo humano» (UVEG bachillerato).
 *
 * El plan 2025 no tiene una progresión de anatomía: el atlas es de práctica
 * libre. La ficha resume, para bachillerato, la organización del cuerpo en
 * sistemas y la relación estructura–función que el alumno comprueba en 3D.
 * Datos puros (sin three).
 */

import type { FichaTeoricaData } from "./_ficha";

export const ATLAS_CUERPO_FICHA: FichaTeoricaData = {
  ancla: "Práctica libre · Biología y salud — Atlas del cuerpo humano (estructura y función)",

  marcoTeorico: [
    "El cuerpo humano se organiza en niveles: células, tejidos, órganos y sistemas. Un sistema es un conjunto de órganos que cooperan en una función; ninguno trabaja aislado, y la homeostasis —mantener estable el medio interno— depende de que todos se coordinen.",
    "En anatomía la forma explica la función. El ventrículo izquierdo tiene la pared más gruesa porque impulsa la circulación mayor; el intestino delgado está plegado en vellosidades porque su tarea es absorber; la tráquea tiene anillos de cartílago porque debe permanecer abierta.",
    "El aparato locomotor une huesos, articulaciones y músculos. Los huesos funcionan como palancas; los músculos esqueléticos solo pueden jalar, por eso trabajan en pares antagonistas (bíceps–tríceps, cuádriceps–isquiotibiales).",
    "El digestivo transforma el alimento en moléculas absorbibles mediante digestión mecánica y química; el respiratorio lleva el oxígeno a los alvéolos; el circulatorio, una bomba doble con circulación menor y mayor, reparte oxígeno y nutrientes a cada célula. El nervioso coordina todo con impulsos eléctricos y el endocrino con hormonas.",
    "El atlas usa modelos reconstruidos a partir de estudios de cuerpos reales (BodyParts3D y Z-Anatomy). Los colores son convenciones de enseñanza: arterias rojas, venas azules, nervios amarillos, ganglios verdes y un color por lóbulo cerebral.",
  ],

  objetivos: [
    "Localizar los órganos principales de cada sistema y describir su posición relativa (anterior, posterior, superior, inferior, derecha e izquierda anatómicas).",
    "Relacionar la estructura de un órgano con su función en los sistemas digestivo, circulatorio, respiratorio, nervioso y músculo-esquelético.",
    "Explicar la doble circulación y calcular el gasto cardiaco a partir de la frecuencia cardiaca.",
    "Explicar la mecánica de la ventilación y calcular la ventilación pulmonar.",
    "Resolver el reto de estructura y función.",
  ],

  materiales: [
    { nombre: "Atlas 3D con casi 1,900 piezas", detalle: "Huesos, músculos, corazón y vasos, órganos, encéfalo, nervios, glándulas y ganglios", icono: "fa-person" },
    { nombre: "Planos de corte", detalle: "Sagital, frontal (coronal) y transversal, con posición ajustable", icono: "fa-scissors" },
    { nombre: "Capas y aislamiento", detalle: "Huesos sólidos, en rayos X u ocultos; transparencia muscular; ver una pieza sola u ocultarla", icono: "fa-layer-group" },
    { nombre: "Modelos fisiológicos", detalle: "Latido con gasto cardiaco y respiración con ventilación pulmonar", icono: "fa-heart-pulse" },
  ],

  conceptos: [
    { termino: "Sistema", definicion: "Conjunto de órganos que trabajan coordinados para una función del organismo." },
    { termino: "Relación estructura–función", definicion: "Principio según el cual la forma de una estructura biológica se corresponde con la tarea que realiza." },
    { termino: "Circulación mayor y menor", definicion: "La mayor (sistémica) lleva sangre oxigenada del ventrículo izquierdo al cuerpo; la menor (pulmonar) lleva sangre poco oxigenada del ventrículo derecho a los pulmones." },
    { termino: "Gasto cardiaco", definicion: "Volumen de sangre que bombea un ventrículo por minuto: frecuencia cardiaca × volumen sistólico (≈ 5 L/min en reposo)." },
    { termino: "Ventilación pulmonar", definicion: "Volumen de aire que entra a los pulmones por minuto: frecuencia respiratoria × volumen corriente (≈ 6–8 L/min en reposo)." },
    { termino: "Músculos antagonistas", definicion: "Pareja de músculos que producen movimientos opuestos en una articulación: cuando uno se contrae, el otro se relaja." },
  ],

  glosario: [
    { termino: "Plano sagital", definicion: "Divide el cuerpo en mitades derecha e izquierda." },
    { termino: "Plano frontal (coronal)", definicion: "Divide el cuerpo en una parte anterior y una posterior." },
    { termino: "Plano transversal", definicion: "Divide el cuerpo en una parte superior y una inferior." },
    { termino: "Peristalsis", definicion: "Ondas de contracción del músculo liso que empujan el contenido del tubo digestivo." },
    { termino: "Alvéolo", definicion: "Saco microscópico del pulmón donde ocurre el intercambio de gases con la sangre." },
    { termino: "Nefrona", definicion: "Unidad funcional del riñón que filtra la sangre y forma la orina." },
    { termino: "Tendón", definicion: "Tejido conectivo denso que une un músculo con un hueso." },
    { termino: "Cuerpo calloso", definicion: "Haz de axones que comunica los dos hemisferios cerebrales." },
  ],

  aplicaciones: [
    "Primeros auxilios: el pulso carotídeo y radial se toman donde una arteria pasa cerca de la piel y sobre un plano firme.",
    "Diabetes tipo 2, muy frecuente en México: relaciona el páncreas endocrino (insulina) con la alimentación y la actividad física.",
    "Imagenología médica: la tomografía y la resonancia muestran el cuerpo en cortes transversales, sagitales y coronales, como los de este atlas.",
  ],

  fuente: "Modelos: «Z-Anatomy, the libre 3D atlas of anatomy» (CC BY-SA 4.0), derivado de «BodyParts3D», The Database Center for Life Science (CC BY-SA 2.1 Japón). Nombres en español: Terminologia Anatomica (TA2).",
};
