/**
 * Datos de la Ficha Teórica del laboratorio "Energía nuclear: fisión y ética"
 * (CNEYT-V, progresión 9; actividades CNEYT-V-P08).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Física y ética: energía nuclear,
 *     telecomunicaciones y sociedad» (6 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Los conceptos centrales son física estándar con cifras verificables.
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./fision-nuclear-data";

export const FISION_NUCLEAR_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P08 · A1 — Física y ética: energía nuclear, telecomunicaciones y sociedad",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar la reacción en cadena con el factor de multiplicación k y distinguir los regímenes subcrítico, crítico y supercrítico.",
    "Reconocer por qué un reactor apagado sigue produciendo calor y qué riesgo ilustra Fukushima.",
    "Calcular la energía de una fisión a partir del defecto de masa con E = mc².",
    "Comparar la cantidad de combustible y las emisiones de la energía nuclear y del carbón.",
    "Relacionar la vida media de los residuos con la escala de la historia humana y la responsabilidad hacia generaciones futuras.",
    "Explicar con la física de las ondas por qué la cobertura rural es más difícil y por qué la radiofrecuencia no es ionizante.",
    "Distinguir las preguntas que responde la ciencia de las que exigen deliberación ética y social.",
  ],

  materiales: [
    { nombre: "Núcleo de un reactor de agua en ebullición", detalle: "Combustible de UO₂, agua como moderador y barras de control que entran por abajo, como en Laguna Verde.", icono: "fa-atom" },
    { nombre: "Tabla de masas atómicas", detalle: "U-235, Ba-141, Kr-92 y neutrón (AME2020).", icono: "fa-table" },
    { nombre: "Pastillas de combustible y góndolas de carbón", detalle: "Para comparar la misma energía eléctrica.", icono: "fa-train" },
    { nombre: "Línea del tiempo logarítmica", detalle: "De un día a diez millones de años, con ocho isótopos de los residuos.", icono: "fa-hourglass-half" },
    { nombre: "Torres de telefonía en dos bandas", detalle: "700 MHz y 3.5 GHz, con un medidor de densidad de potencia.", icono: "fa-tower-cell" },
  ],

  conceptos: [
    {
      termino: "Factor de multiplicación k",
      definicion: "Número promedio de fisiones nuevas que provoca cada fisión. Con k < 1 la reacción se apaga, con k = 1 se mantiene estable y con k > 1 crece. Las barras de control absorben neutrones y bajan k.",
    },
    {
      termino: "Moderador y coeficiente de vacíos",
      definicion: "El U-235 fisiona mejor con neutrones lentos; el agua o el grafito los frenan. En un BWR, si el agua hierve de más la reacción se frena sola; en el RBMK de Chernóbil ocurría lo contrario.",
    },
    {
      termino: "Neutrones retardados",
      definicion: "Cerca del 0.65 % de los neutrones de la fisión del U-235 salen segundos después. Ese pequeño retraso hace que la potencia cambie lo bastante despacio para controlarla.",
    },
    {
      termino: "Calor residual",
      definicion: "Al apagar un reactor, los fragmentos de fisión siguen decayendo: cerca de 6 % de la potencia al instante, 1 % después de una hora y 0.4 % después de un día. Sin enfriamiento, ese calor evapora el agua y puede fundir el núcleo.",
    },
    {
      termino: "Defecto de masa",
      definicion: "Los productos de la fisión pesan un poco menos que los reactivos. En n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3n faltan 0.186 u, que equivalen a unos 173 MeV (E = Δm·c², 1 u = 931.5 MeV). Con los decaimientos posteriores se llega a unos 200 MeV por fisión.",
    },
    {
      termino: "Vida media",
      definicion: "Tiempo en que se desintegra la mitad de los núcleos de un isótopo: N = N₀·(1/2)^(t/T½). Tras 3 vidas medias queda 1/8; tras 10, menos de una milésima.",
    },
    {
      termino: "Radiación ionizante y no ionizante",
      definicion: "La energía de un fotón es E = h·f. Los rayos gamma superan con mucho los ~10 eV necesarios para ionizar; un fotón de 3.5 GHz tiene 0.000014 eV. La radiofrecuencia solo calienta, y los límites ICNIRP 2020 están fijados muy por debajo de ese efecto.",
    },
    {
      termino: "Alcance de una antena",
      definicion: "La señal se debilita con la distancia y más rápido a mayor frecuencia. Por eso la banda de 700 MHz cubre zonas extensas con pocas torres y el 5G de 3.5 GHz necesita muchas más.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Laguna Verde (Alto Lucero, Veracruz): dos reactores BWR de 810 MW eléctricos cada uno; en 2024 generaron 12 306.58 GWh brutos (CFE).",
    "El uranio poco enriquecido (3–5 %) de una central no puede explotar como una bomba, que requiere uranio muy enriquecido y una reacción rapidísima sin control.",
    "Onkalo (Finlandia) guarda el combustible gastado a unos 430 m de profundidad en roca granítica.",
    "En 2024 usaba internet el 86.9 % de la población urbana de México y el 68.5 % de la rural (INEGI, ENDUTIH 2024).",
  ],

  fuente: FUENTE,
};
