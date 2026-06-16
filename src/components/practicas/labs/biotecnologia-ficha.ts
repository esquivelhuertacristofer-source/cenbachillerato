/**
 * Datos de la Ficha Teórica del laboratorio de Biotecnología y bioética
 * (CRISPR, OGM, clonación).
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-VI-P08:
 *   - Marco teórico: puntos clave de la infografía A1 «Biotecnología y bioética:
 *     CRISPR, OGM, clonación».
 *   - Glosario: glosario interactivo A5 «Glosario — Biotecnología y bioética».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const BIOTECNOLOGIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P08 · A1 — Biotecnología y bioética: CRISPR, OGM, clonación",

  // Marco teórico — VERBATIM de los puntos clave de la infografía A1.
  marcoTeorico: [
    "La biotecnología moderna usa organismos vivos, sistemas biológicos o derivados para desarrollar productos o procesos: ingeniería genética, cultivo de tejidos, fermentación industrial, diagnóstico molecular y edición genómica.",
    "CRISPR-Cas9: sistema de edición genómica de precisión, análogo a un 'bisturí molecular'. Permite modificar secuencias específicas del ADN con mayor precisión y menor costo que técnicas anteriores. Las investigadoras Jennifer Doudna y Emmanuelle Charpentier recibieron el Nobel de Química 2020 por su desarrollo.",
    "Luis Herrera-Estrella (LANGEBIO-CINVESTAV Irapuato) fue el primer científico en desarrollar plantas transgénicas funcionales en 1983 —introdujo el primer gen foráneo funcional en una planta. Premio Fronteras del Conocimiento 2021. México es pionero científico y, simultáneamente, el país con más debates sobre transgénicos.",
    "El debate del maíz transgénico en México: en 2020 el gobierno emitió un decreto para eliminar gradualmente el maíz GM para consumo humano directo. En 2023, un tribunal federal falló contra el decreto argumentando que violaba compromisos del T-MEC con EE.UU. México es el único país del mundo donde el maíz tiene estatus especial por ser su centro de origen.",
    "OGM en México: la soya transgénica (resistente al herbicida glifosato) se cultiva en ~250,000 ha en Yucatán y Campeche, con controversia por impactos en los apicultores mayas y la biodiversidad de la Selva Yucateca.",
    "LANGEBIO-CINVESTAV aplica CRISPR para mejorar variedades de maíz nativo resistentes a plagas sin transgénesis convencional. El Instituto de Biotecnología de la UNAM en Cuernavaca aplica CRISPR en diagnóstico de tuberculosis, dengue y leishmaniasis —enfermedades que afectan desproporcionadamente a comunidades marginadas.",
  ],

  objetivos: [
    "Explicar qué son los transgénicos (OGM), cómo se producen por ADN recombinante y dar ejemplos en agricultura y medicina.",
    "Describir el mecanismo de CRISPR-Cas9: ARN guía, corte de doble cadena y reparación (NHEJ o HDR).",
    "Distinguir entre clonación reproductiva y clonación terapéutica.",
    "Reconocer los principios de la bioética (autonomía, beneficencia, no maleficencia y justicia) y aplicarlos a casos de biotecnología.",
    "Resolver el quiz de bioética y biotecnología de la práctica.",
  ],

  materiales: [
    { nombre: "Visor 3D de biotecnología", detalle: "CRISPR-Cas9, ADN recombinante y transferencia nuclear", icono: "fa-dna" },
    { nombre: "Modo CRISPR-Cas9", detalle: "ARN guía + PAM, corte de Cas9 y reparación NHEJ/HDR", icono: "fa-scissors" },
    { nombre: "Modo transgénico / OGM", detalle: "Insulina humana, maíz Bt y arroz dorado por ADN recombinante", icono: "fa-seedling" },
    { nombre: "Modo clonación", detalle: "Transferencia nuclear: reproductiva (Dolly) vs terapéutica", icono: "fa-clone" },
  ],

  // Conceptos centrales del lab — formulados a partir de la infografía A1 y el glosario A5.
  conceptos: [
    { termino: "Biotecnología moderna", definicion: "Uso de organismos vivos, sistemas biológicos o derivados para desarrollar productos o procesos: ingeniería genética, cultivo de tejidos, fermentación industrial, diagnóstico molecular y edición genómica." },
    { termino: "CRISPR-Cas9", definicion: "Sistema de edición genómica de precisión, análogo a un 'bisturí molecular'. Una ARN guía (sgRNA) lleva a la proteína Cas9 a una secuencia específica del genoma donde hace un corte de doble cadena; la célula lo repara por NHEJ (deleción/mutación) o HDR (inserción precisa)." },
    { termino: "Transgénico / OGM", definicion: "Organismo al que se le ha transferido material genético exógeno mediante técnicas de ADN recombinante. Ejemplos: insulina humana en E. coli, maíz Bt y arroz dorado." },
    { termino: "Clonación", definicion: "Proceso que produce copias genéticamente idénticas. Reproductiva: produce un organismo con el mismo genoma que el donante (Dolly, 1996). Terapéutica: produce células madre embrionarias para medicina regenerativa, sin propósito reproductivo." },
    { termino: "Bioética", definicion: "Disciplina que estudia los dilemas morales del avance de las ciencias biológicas y médicas. Sus principios: autonomía, beneficencia, no maleficencia y justicia." },
    { termino: "Edición germinal vs somática", definicion: "Somática: modifica células del cuerpo; los cambios no son heredables. Germinal: modifica embriones, óvulos o espermatozoides; los cambios se heredan indefinidamente y generan las mayores preocupaciones éticas." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P08.
  glosario: [
    { termino: "Organismos genéticamente modificados (OGM/transgénicos)", definicion: "Organismos a los que se les ha transferido material genético exógeno mediante técnicas de ADN recombinante (plásmidos, vectores virales, biobalística). Aplicaciones: agricultura (resistencia a herbicidas, plagas, sequía), medicina (insulina, vacunas, factores de coagulación), industria (enzimas para alimentos, biocombustibles)." },
    { termino: "CRISPR-Cas9", definicion: "Sistema de edición génica derivado de un mecanismo inmune bacteriano contra fagos. Un ARN guía (sgRNA) lleva a la proteína Cas9 a una secuencia específica del genoma donde hace un corte de doble cadena. La célula repara el corte por NHEJ (deleción/mutación) o HDR (inserción precisa). Más rápido, barato y preciso que técnicas anteriores." },
    { termino: "Clonación", definicion: "Proceso que produce copias genéticamente idénticas. Clonación molecular: amplifica fragmentos de ADN. Clonación reproductiva: produce un organismo con el mismo genoma que el donante (ej: Dolly, 1996, por transferencia nuclear de células somáticas). Clonación terapéutica: produce células madre embrionarias para medicina regenerativa, sin propósito reproductivo." },
    { termino: "Principios de bioética", definicion: "Marco para evaluar intervenciones biotecnológicas: (1) Beneficencia: buscar el mayor beneficio. (2) No maleficencia: evitar daños. (3) Justicia: acceso equitativo a los beneficios. (4) Autonomía: consentimiento informado. En biotecnología también aplican: precaución (actuar con cuidado ante incertidumbre), transparencia y soberanía alimentaria." },
    { termino: "Edición de línea germinal vs somática", definicion: "Edición somática: modifica células del cuerpo del individuo; los cambios no son heredables; ejemplos en ensayos clínicos para cáncer y enfermedades genéticas. Edición germinal: modifica embriones, óvulos o espermatozoides; los cambios se heredan indefinidamente. Caso He Jiankui (2018): primer bebé CRISPR, generó condena científica y ética internacional." },
    { termino: "Bioprospección y propiedad intelectual en biotecnología", definicion: "La bioprospección es la búsqueda de organismos con propiedades útiles para biotecnología. Genera debates éticos sobre: propiedad de los recursos genéticos de países megadiversos, biopiratería (patentar conocimiento indígena sin compensación) y el Protocolo de Nagoya (acceso y beneficios compartidos)." },
  ],

  aplicaciones: [
    "Medicina: la insulina humana producida por E. coli transgénica es usada por millones de diabéticos desde 1982; CRISPR trata la anemia de células falciformes (edición de células madre hematopoyéticas).",
    "Agricultura: maíz Bt (gen de Bacillus thuringiensis contra insectos), arroz dorado (betacaroteno) y soya resistente a herbicida; LANGEBIO usa CRISPR para mejorar maíz nativo sin transgénesis convencional.",
    "Conservación: la CIBIOGEM ha respaldado biotecnología reproductiva (criopreservación de material genético) para la vaquita marina, con menos de 10 individuos en 2024.",
  ],

  fuente: "LANGEBIO CINVESTAV Irapuato — Edición Genómica en Maíces Mexicanos 2023; CONBIOÉTICA — Marco ético para la biotecnología 2022; CIBIOGEM — Informe anual de OGM en México 2022. Contenido verbatim del MCCEMS 2025 (infografía A1 y glosario A5, CNEYT-VI-P08).",
};
