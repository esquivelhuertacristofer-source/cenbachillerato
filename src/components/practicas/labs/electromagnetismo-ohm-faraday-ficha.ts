/**
 * Datos de la Ficha Teórica del laboratorio de Electromagnetismo (CNEYT-V-P07).
 *
 * marcoTeorico — párrafos VERBATIM de la lectura A1 "Electromagnetismo: campos,
 * inducción y la tecnología que nos rodea" (CNEYT-V-P07-A1).
 * glosario     — términos VERBATIM del glosario interactivo A5 (CNEYT-V-P07-A5).
 * ancla        — CNEYT-V-P07-A2 (ejercicio_matematico evaluable; vive en -data.ts).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ELECTROMAGNETISMO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P07 · A1 — Electromagnetismo: campos, inducción y la tecnología que nos rodea",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-V-P07-A1).
  marcoTeorico: [
    "El electromagnetismo es la rama de la física que estudia las fuerzas eléctricas y magnéticas y su íntima relación. A partir del trabajo de Coulomb, Faraday, Ampère y Maxwell en los siglos XVIII y XIX, sabemos que la electricidad y el magnetismo son dos manifestaciones del mismo fenómeno fundamental, y que la luz misma es una onda electromagnética.",
    "La Ley de Coulomb describe la fuerza entre dos cargas eléctricas puntuales: F = k · q₁ · q₂ / r², donde k = 8.99 × 10⁹ N·m²/C² es la constante de Coulomb, q₁ y q₂ son las cargas en culombios y r la distancia entre ellas. Las cargas del mismo signo se repelen; las de signo contrario se atraen. Esta fuerza es 10³⁶ veces más intensa que la gravitacional a la misma distancia, aunque a escala macroscópica los efectos eléctricos suelen cancelarse porque la materia ordinaria contiene igual número de cargas positivas y negativas.",
    "La Ley de Ohm establece la relación entre voltaje, corriente y resistencia en un conductor: V = I · R, donde V es el voltaje (diferencia de potencial, en voltios), I es la intensidad de corriente (en amperios) y R es la resistencia eléctrica (en ohmios, Ω). La potencia eléctrica disipada en una resistencia es P = I · V = I²R = V²/R, en vatios (W). La red eléctrica de la CFE distribuye corriente alterna (AC) a 127 V / 60 Hz en los hogares mexicanos. Los aparatos eléctricos típicos: un foco LED consume 10 W; un refrigerador entre 150-400 W; un horno de microondas 1,000-1,200 W; un calentador de agua 2,000 W.",
    "La inducción electromagnética, descubierta por Michael Faraday en 1831, establece que un campo magnético cambiante en el tiempo genera una corriente eléctrica en un conductor cercano (Ley de Faraday). Esta es la base de generadores y transformadores. Un generador convierte energía mecánica en energía eléctrica: el movimiento de un conductor en un campo magnético induce una corriente. Las grandes hidroeléctricas de México, como la presa Chicoasén (Río Grijalva, Chiapas), con 2,400 MW de capacidad instalada, hacen girar enormes turbinas con el agua del río; las turbinas hacen girar generadores que producen la electricidad que distribuye la CFE.",
    "Un motor eléctrico realiza el proceso inverso: convierte energía eléctrica en mecánica. Cuando una corriente pasa por un conductor dentro de un campo magnético, experimenta una fuerza (Fuerza de Lorentz: F = qv × B) que lo pone en movimiento. Los trenes del Sistema de Transporte Colectivo Metro de la CDMX usan motores eléctricos de tracción en sus 12 líneas; la línea 12 (dorada) usa tecnología de motor de inducción. La ventaja del motor eléctrico es su alta eficiencia (90-97%), mucho mayor que los motores de combustión interna (~35%).",
    "Los transformadores usan la inducción mutua entre dos bobinas para cambiar el voltaje de la corriente alterna. La razón de transformación es V₂/V₁ = N₂/N₁, donde N₁ y N₂ son los números de vueltas de las bobinas. La CFE transmite electricidad a 400 kV (400,000 voltios) a través de líneas de alta tensión de larga distancia: a mayor voltaje, menor corriente y por tanto menores pérdidas por calor (P_pérdida = I²R). Luego, transformadores en las subestaciones reducen el voltaje a 127 V o 220 V para uso doméstico e industrial. El Sistema Eléctrico Nacional Interconectado de México conecta generadoras de Baja California a Yucatán con miles de kilómetros de líneas de transmisión.",
  ],

  objetivos: [
    "Aplicar la Ley de Ohm (V = I·R) para calcular corriente en un circuito real de la red CFE.",
    "Calcular la potencia eléctrica (P = V²/R) y el costo en kWh de un aparato eléctrico.",
    "Describir el principio de inducción de Faraday y cómo lo aprovecha un generador hidroeléctrico.",
    "Distinguir el funcionamiento de un motor eléctrico (electricidad → movimiento) del de un generador.",
    "Resolver el reto evaluable de la actividad A2 (resistencia 470 Ω / red CFE y motor del Metro CDMX).",
  ],

  materiales: [
    { nombre: "Modo Circuito (Ohm)", detalle: "Simula V, R y calcula I, P, kWh y costo CFE en tiempo real", icono: "fa-plug-circle-bolt" },
    { nombre: "Modo Generador (Faraday)", detalle: "Bobina giratoria en campo magnético: FEM = N·B·A·ω·sen(ωt)", icono: "fa-bolt" },
    { nombre: "Modo Motor", detalle: "Balance de eficiencia η: P_mec = η·P_elec; calor perdido visible", icono: "fa-gears" },
    { nombre: "Datos reales de México", detalle: "Presa Chicoasén, red CFE 127 V/60 Hz, Metro CDMX línea 12", icono: "fa-landmark" },
  ],

  // Conceptos centrales — de la lectura A1 (CNEYT-V-P07-A1).
  conceptos: [
    { termino: "Ley de Ohm (V = I·R)", definicion: "Relaciona voltaje, corriente y resistencia en un conductor. La corriente es directamente proporcional al voltaje e inversamente proporcional a la resistencia." },
    { termino: "Potencia eléctrica (P = V²/R)", definicion: "Energía disipada por unidad de tiempo en una resistencia; en vatios (W). También P = I·V = I²R. El recibo de la CFE se cobra en kilovatios-hora (kWh = 1000 W × 1 h)." },
    { termino: "Inducción electromagnética (Faraday, 1831)", definicion: "Un campo magnético cambiante en el tiempo genera una fuerza electromotriz (fem) en un conductor cercano. Base de generadores, transformadores y cargadores inalámbricos." },
    { termino: "Motor eléctrico (Fuerza de Lorentz)", definicion: "Convierte energía eléctrica en mecánica. Cuando una corriente pasa por un conductor en un campo magnético, experimenta una fuerza F = qv × B que genera movimiento. Eficiencia 90-97%." },
    { termino: "Transformador (V₂/V₁ = N₂/N₁)", definicion: "Usa la inducción mutua entre dos bobinas para cambiar el voltaje de la corriente alterna. La CFE transmite a 400 kV para reducir pérdidas (P_pérdida = I²R), luego reduce a 127 V para uso doméstico." },
    { termino: "Ley de Coulomb (F = k·q₁q₂/r²)", definicion: "La fuerza eléctrica entre dos cargas puntuales es proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia. k = 8.99 × 10⁹ N·m²/C²." },
  ],

  // Glosario — términos VERBATIM del glosario interactivo A5 (CNEYT-V-P07-A5).
  glosario: [
    {
      termino: "Ley de Faraday (inducción electromagnética)",
      definicion: "Una variación del flujo magnético (Φ_B) a través de un circuito induce una fuerza electromotriz: fem = −ΔΦ_B/Δt. El signo negativo indica que la corriente inducida se opone al cambio (ley de Lenz).",
    },
    {
      termino: "Motor eléctrico",
      definicion: "Dispositivo que convierte energía eléctrica en energía mecánica usando la fuerza que ejerce un campo magnético sobre un conductor que lleva corriente (fuerza de Lorentz: F = I·L × B).",
    },
    {
      termino: "Generador eléctrico (alternador)",
      definicion: "Dispositivo que convierte energía mecánica en energía eléctrica mediante la inducción electromagnética: una bobina giratoria en un campo magnético genera corriente alterna.",
    },
    {
      termino: "Transformador eléctrico",
      definicion: "Dispositivo que aumenta (transformador elevador) o disminuye (reductor) la tensión de CA usando inducción mutua entre dos bobinas. Relación: V₁/V₂ = N₁/N₂, donde N es el número de espiras.",
    },
    {
      termino: "Campo magnético y corriente eléctrica",
      definicion: "Una corriente eléctrica genera un campo magnético circular alrededor del conductor (ley de Ampère). Un electroimán es un conductor en bobina que intensifica este campo.",
    },
    {
      termino: "Tecnologías cotidianas del electromagnetismo",
      definicion: "Inducción electromagnética aplicada a: cargadores inalámbricos (inducción), tarjetas de transporte (RFID), cocinas de inducción, bocinas, micrófonos, discos duros.",
    },
  ],

  aplicaciones: [
    "La presa Chicoasén (CFE, Río Grijalva, Chiapas) con 2,400 MW de capacidad: turbinas accionadas por el agua hacen girar generadores que producen la electricidad de la red nacional.",
    "El Metro CDMX usa motores eléctricos de tracción (línea 12: motor de inducción) con eficiencia 90-97%, muy superior a los motores de combustión interna (~35%).",
    "La CFE transmite la energía a 400 kV para reducir pérdidas I²R en las líneas de alta tensión; transformadores en subestaciones la reducen a 127 V para los hogares mexicanos.",
    "Las cocinas de inducción generan corrientes de Foucault en la sartén metálica mediante campo magnético variable, calentando solo el recipiente sin calentar la vitrocerámica.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física (9ª ed.); CFE Informe anual 2023; STC Metro CDMX. Lectura A1 y Glosario A5, CNEYT-V-P07.",
};
