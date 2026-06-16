/**
 * Datos de la Ficha Teórica del laboratorio de Fluidos (CNEYT-V-P09).
 *
 * Marco teórico — VERBATIM de A1 «Los fluidos: por qué flotan los barcos y
 * vuelan los aviones» (lectura).
 * Glosario       — VERBATIM de A5 «Glosario: propiedades y principios de los
 *                  fluidos» (glosario_interactivo, 10 términos).
 * El reto evaluable (A2) vive en fluidos-data.ts como RETO_A2.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FLUIDOS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P09 · A1 — Los fluidos: por qué flotan los barcos y vuelan los aviones",

  // Marco teórico — VERBATIM de A1 (texto, MCCEMS 2025 CNEyT V).
  marcoTeorico: [
    "Un FLUIDO es toda sustancia que fluye y adopta la forma del recipiente que la contiene: los líquidos y los gases lo son. A diferencia de un sólido, un fluido no resiste el corte; por eso se derrama, se vierte y circula por tuberías. Cuatro principios bastan para entender casi todo lo que hacen.",
    "1) PRINCIPIO DE ARQUÍMEDES (flotación). Todo cuerpo sumergido en un fluido recibe un empuje vertical hacia arriba igual al peso del fluido que desaloja: E = ρ_fluido · V_sumergido · g. Si el empuje supera al peso del cuerpo, este flota; si no, se hunde. La clave es la DENSIDAD (ρ = masa/volumen): un cuerpo flota cuando su densidad media es menor que la del fluido. Un barco de acero flota porque su casco hueco encierra aire, de modo que su densidad MEDIA (acero + aire) es menor que la del agua.",
    "2) PRINCIPIO DE PASCAL (presión transmitida). La PRESIÓN es la fuerza por unidad de área (P = F/A, en pascales, Pa = N/m²). En un fluido en reposo, la presión aumenta con la profundidad: P = P₀ + ρ·g·h (presión hidrostática). Pascal descubrió además que un aumento de presión aplicado a un fluido confinado se transmite ÍNTEGRO a todos sus puntos. En eso se basan el gato hidráulico y los frenos de un coche: una fuerza pequeña sobre un pistón chico genera una fuerza enorme sobre un pistón grande.",
    "3) ECUACIÓN DE CONTINUIDAD Y DE BERNOULLI (fluidos en movimiento). Como un líquido es casi incompresible, lo que entra por una tubería sale por el otro extremo: el caudal se conserva, A₁·v₁ = A₂·v₂. Por eso, al estrechar una manguera con el dedo, el agua sale más rápido. Bernoulli añade que, a lo largo de una línea de corriente, P + ½ρv² + ρgh es constante: donde el fluido va MÁS RÁPIDO, su presión es MENOR. Esa caída de presión sobre el ala curva es parte de lo que sostiene a un avión.",
    "4) OTRAS PROPIEDADES. La TENSIÓN SUPERFICIAL hace que la superficie de un líquido actúe como una membrana elástica (un insecto camina sobre el agua); la CAPILARIDAD hace que el agua suba sola por tubos muy finos (así asciende la savia en las plantas); y la VISCOSIDAD mide la resistencia interna a fluir: la miel y la glicerina son muy viscosas, el agua poco. Con estos principios se diseñan presas, acueductos como el Cutzamala, ductos de PEMEX y hasta la jeringa del médico.",
  ],

  objetivos: [
    "Aplicar el principio de Arquímedes para determinar si un cuerpo flota o se hunde y calcular el empuje.",
    "Calcular la presión hidrostática a una profundidad dada y explicar el principio de Pascal.",
    "Aplicar la ecuación de continuidad A₁·v₁ = A₂·v₂ para determinar la velocidad en un estrechamiento.",
    "Relacionar el aumento de velocidad con la caída de presión mediante el principio de Bernoulli.",
    "Resolver el reto evaluable de fluidos (A2) con g = 9.81 m/s² y ρ_agua = 1000 kg/m³.",
  ],

  materiales: [
    { nombre: "Modo Flotación (Arquímedes)", detalle: "Ajusta densidad y volumen del cuerpo; observa empuje E = ρ_fluido·V_sub·g", icono: "fa-water" },
    { nombre: "Modo Presión (Pascal)", detalle: "Mueve la sonda y el émbolo; lee P = P_ext + ρ·g·h a cada profundidad", icono: "fa-gauge-high" },
    { nombre: "Modo Flujo (Continuidad + Bernoulli)", detalle: "Ajusta el estrechamiento; observa cómo sube la velocidad y cae la presión", icono: "fa-wind" },
    { nombre: "5 fluidos de referencia", detalle: "Agua, agua de mar, aceite, glicerina y mercurio a ~20 °C", icono: "fa-flask" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 (verbatim).
  conceptos: [
    { termino: "Fluido", definicion: "Toda sustancia que fluye y adopta la forma del recipiente: líquidos y gases. No resiste el corte, por eso se derrama y circula por tuberías." },
    { termino: "Densidad (ρ = masa/volumen)", definicion: "Determina si un cuerpo flota: flota si su densidad media es menor que la del fluido; se hunde si es mayor o igual." },
    { termino: "Principio de Arquímedes", definicion: "Todo cuerpo sumergido recibe un empuje vertical hacia arriba igual al peso del fluido que desaloja: E = ρ_fluido · V_sumergido · g." },
    { termino: "Presión hidrostática", definicion: "La presión aumenta con la profundidad: P = P₀ + ρ·g·h. Actúa en todas direcciones, no solo hacia abajo." },
    { termino: "Principio de Pascal", definicion: "Un aumento de presión aplicado a un fluido confinado se transmite ÍNTEGRO a todos sus puntos. Base del gato hidráulico y los frenos del coche." },
    { termino: "Ecuación de continuidad", definicion: "El caudal se conserva en una tubería: A₁·v₁ = A₂·v₂. Al estrechar la sección, el fluido acelera." },
    { termino: "Principio de Bernoulli", definicion: "A lo largo de una línea de corriente, P + ½ρv² + ρgh es constante: donde el fluido va MÁS RÁPIDO, su presión es MENOR." },
    { termino: "Tensión superficial", definicion: "La superficie de un líquido actúa como una membrana elástica; por eso un insecto puede caminar sobre el agua." },
    { termino: "Capilaridad", definicion: "El agua sube sola por tubos muy finos (así asciende la savia en las plantas) gracias a la tensión superficial y la adhesión." },
    { termino: "Viscosidad", definicion: "Resistencia interna de un fluido a fluir. La miel y la glicerina son muy viscosas; el agua es poco viscosa." },
  ],

  // Glosario — VERBATIM de A5 (glosario_interactivo, CNEYT-V-P09-A5).
  glosario: [
    { termino: "Fluido", definicion: "Sustancia que fluye y adopta la forma del recipiente que la contiene; incluye líquidos y gases. Ejemplo: El agua, el aire y el aceite son fluidos." },
    { termino: "Densidad (ρ)", definicion: "Masa por unidad de volumen (kg/m³). Decide si un cuerpo flota o se hunde en un fluido. Ejemplo: El agua tiene ρ = 1000 kg/m³; el mercurio, 13 600 kg/m³." },
    { termino: "Principio de Arquímedes", definicion: "Todo cuerpo sumergido recibe un empuje hacia arriba igual al peso del fluido que desaloja: E = ρ_fluido·V_sumergido·g. Ejemplo: Un cuerpo de 8 L sumergido en agua recibe un empuje de unos 78 N." },
    { termino: "Presión (P)", definicion: "Fuerza por unidad de área, en pascales (Pa = N/m²). Ejemplo: A 8 m de profundidad en agua, la presión manométrica es ≈78.5 kPa." },
    { termino: "Principio de Pascal", definicion: "Un aumento de presión aplicado a un fluido confinado se transmite por igual a todos sus puntos. Ejemplo: El gato hidráulico multiplica la fuerza usando este principio." },
    { termino: "Ecuación de continuidad", definicion: "El caudal se conserva en una tubería: A₁·v₁ = A₂·v₂. Al estrecharse, el fluido acelera. Ejemplo: Si el área se reduce a la cuarta parte, la velocidad se cuadruplica." },
    { termino: "Principio de Bernoulli", definicion: "A lo largo de una línea de corriente, P + ½ρv² + ρgh es constante: donde la velocidad sube, la presión baja. Ejemplo: El ala de un avión y el atomizador se explican con Bernoulli." },
    { termino: "Tensión superficial", definicion: "Fuerza que mantiene cohesionada la superficie de un líquido, como una membrana elástica. Ejemplo: Un zapatero (insecto) camina sobre el agua sin hundirse." },
    { termino: "Capilaridad", definicion: "Ascenso (o descenso) de un líquido por tubos muy finos debido a la tensión superficial y la adhesión. Ejemplo: El agua sube sola por una servilleta o por el tallo de una planta." },
    { termino: "Viscosidad", definicion: "Medida de la resistencia interna de un fluido a fluir (Pa·s). Ejemplo: La glicerina es unas 1400 veces más viscosa que el agua." },
  ],

  aplicaciones: [
    "Barcos y submarinos: un barco de acero flota porque su densidad MEDIA (acero + aire) es menor que la del agua.",
    "Presas (La Angostura, Chicoasén): soportan enormes presiones hidrostáticas; los muros son más gruesos en la base.",
    "Sistema Cutzamala: bombea agua a más de 1 000 m de desnivel para abastecer al Valle de México.",
    "Frenos y gatos hidráulicos: aplican el principio de Pascal para multiplicar la fuerza.",
    "Ductos de PEMEX: transportan crudo viscoso miles de kilómetros (continuidad y Bernoulli).",
    "Alas de avión: el aire sobre el ala curva va más rápido y tiene menor presión; esa diferencia genera la sustentación.",
    "Jeringas médicas y sifones: gobernados por presión y principio de Pascal.",
  ],

  fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología V (CNEYT-V-P09). Lectura A1 y Glosario A5 (verbatim). CEN Bachillerato.",
};
