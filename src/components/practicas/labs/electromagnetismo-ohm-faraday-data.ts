/**
 * Datos del reto evaluable del laboratorio de Electromagnetismo (CNEYT-V-P07).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculando electromagnetismo:
 * Ohm, Faraday y motores» (ejercicio_matematico, CNEYT-V-P07-A2,
 * practica_slug=electromagnetismo-ohm-faraday).
 *
 * Aritmética verificada:
 *   (a-i)  I = 120/470 = 0.255319… A  → objetivo 0.255 A, tolerancia 0.005
 *   (a-ii) P = 120²/470 = 14400/470 = 30.638… W → objetivo 30.6 W, tolerancia 0.5
 *   (a-iii) E = 30.638 × 8 / 1000 = 0.24511 kWh → objetivo 0.245 kWh, tol 0.005
 *   (a-iv) Costo = 0.245 × 1.50 = 0.3675 MXN → objetivo 0.37 MXN, tol 0.05
 *   (b)    P_mec = 0.92 × 150 = 138 kW (exacto) → objetivo 138, tolerancia 0.5
 *
 * La tolerancia global del ejercicio ancla es 0.5; se usa tolerancia por campo
 * ajustada a la magnitud de cada resultado para no ser ni demasiado estricto
 * ni demasiado permisivo.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-V-P07-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando electromagnetismo: Ohm, Faraday y motores",

  contexto:
    "Aplica las leyes del electromagnetismo a situaciones reales de México (red CFE y Metro CDMX).",

  problema:
    "(a) Una resistencia de 470 Ω está conectada a 120 V (corriente alterna de la red CFE). Calcula:\n" +
    "   i.  La corriente que circula por la resistencia (en amperios)\n" +
    "   ii. La potencia eléctrica disipada (en vatios)\n" +
    "   iii. La energía consumida en 8 horas de operación continua (en kWh)\n" +
    "   iv. El costo de esa energía si el kWh vale $1.50 MXN (tarifa doméstica básica aproximada)\n\n" +
    "(b) Un motor eléctrico del Metro de la CDMX tiene una eficiencia del 92% y consume 150 kW de potencia eléctrica. ¿Cuánta potencia mecánica útil entrega para mover el tren?",

  campos: [
    {
      etiqueta: "a-i) Corriente en la resistencia",
      objetivo: 0.255,
      tolerancia: 0.005,
      unidad: "A",
      placeholder: "0.255",
    },
    {
      etiqueta: "a-ii) Potencia eléctrica disipada",
      objetivo: 30.6,
      tolerancia: 0.5,
      unidad: "W",
      placeholder: "30.6",
    },
    {
      etiqueta: "a-iii) Energía consumida en 8 horas",
      objetivo: 0.245,
      tolerancia: 0.005,
      unidad: "kWh",
      placeholder: "0.245",
    },
    {
      etiqueta: "a-iv) Costo de la energía",
      objetivo: 0.37,
      tolerancia: 0.05,
      unidad: "MXN",
      placeholder: "0.37",
    },
    {
      etiqueta: "b) Potencia mecánica útil del motor (Metro CDMX)",
      objetivo: 138,
      tolerancia: 0.5,
      unidad: "kW",
      placeholder: "138",
    },
  ],

  pasosGuia: [
    "Inciso (a-i): Ley de Ohm: I = V/R = 120/470 ≈ 0.2553 A ≈ 0.255 A.",
    "Inciso (a-ii): Potencia: P = V²/R = 120²/470 = 14,400/470 ≈ 30.6 W. Verificación: P = I×V = 0.255×120 = 30.6 W ✓. También P = I²×R = 0.255²×470 = 0.065×470 ≈ 30.6 W ✓.",
    "Inciso (a-iii): Energía en kWh: E = P × t = 30.6 W × 8 h = 244.8 Wh = 0.245 kWh. (Recordar: 1 kWh = 1,000 Wh; dividir entre 1,000).",
    "Inciso (a-iv): Costo = E × precio = 0.245 kWh × $1.50 MXN/kWh ≈ $0.37 MXN. Una resistencia de 470 Ω encendida 8 horas seguidas cuesta menos de 40 centavos de peso mexicano.",
    "Inciso (b): Potencia mecánica = eficiencia × potencia eléctrica = 0.92 × 150 kW = 138 kW. El 8% restante (12 kW) se disipa como calor en el bobinado del motor (pérdidas por resistencia óhmica y fricción).",
    "Comparación: 138 kW ≈ 185 hp (caballos de fuerza), la potencia mecánica de un tren del Metro. La alta eficiencia del motor eléctrico (92%) frente al motor de combustión interna (~35%) es la razón principal por la que el transporte eléctrico es más eficiente energéticamente.",
  ],

  respuestaFinal:
    "(a-i) I ≈ 0.255 A; (a-ii) P ≈ 30.6 W; (a-iii) E ≈ 0.245 kWh; (a-iv) ≈ $0.37 MXN; (b) Pmec = 138 kW",
};
