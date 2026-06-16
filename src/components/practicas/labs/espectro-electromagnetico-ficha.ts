/**
 * Datos de la Ficha Teórica del laboratorio del Espectro Electromagnético.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-V-P05:
 *   - Marco teórico: infografía A1 «El espectro electromagnético: de las ondas
 *     de radio a los rayos gamma» — puntos_clave VERBATIM.
 *   - Glosario: glosario interactivo A5 «Glosario — Espectro electromagnético»
 *     VERBATIM.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ESPECTRO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P05 · A1 — El espectro electromagnético",

  // Marco teórico — VERBATIM de los puntos_clave de la infografía A1
  // (CNEYT-V-P05-A1, campo puntos_clave).
  marcoTeorico: [
    "El espectro electromagnético abarca todas las longitudes de onda posibles de la radiación EM, desde ondas de radio (kilómetros) hasta rayos gamma (picómetros). Todas viajan a la misma velocidad: 299,792 km/s (velocidad de la luz en el vacío).",
    "Ondas de radio (10 cm – km): permiten telecomunicaciones. El IFT (Instituto Federal de Telecomunicaciones) administra el espectro radioeléctrico nacional. En 2023, México realizó su primera subasta de espectro 5G en la banda 3.5 GHz.",
    "Microondas (1 mm – 10 cm): el Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla), a 4,600 m de altitud, es el radiotelescopio de antena única más grande del mundo en su frecuencia, con 50 m de diámetro.",
    "Infrarrojo (700 nm – 1 mm): los satélites GOES y MODIS usan sensores infrarrojos para monitorear incendios forestales en México en tiempo real. En 2023 se registraron más de 10,000 incendios, principalmente en Durango, Chihuahua y Jalisco.",
    "Luz visible (380–700 nm): el Observatorio Astronómico Nacional (OAN) de la UNAM en San Pedro Mártir, Baja California —2,800 m de altitud, más de 300 noches despejadas al año— estudia galaxias lejanas y exoplanetas con telescopios ópticos.",
    "Ultravioleta (10–380 nm): el ozono estratosférico absorbe la mayoría. Mario Molina (Premio Nobel de Química 1995, UNAM) demostró que los CFC destruyen la capa de ozono. El Protocolo de Montreal se firmó en 1987 y México lo ratificó en 1988 (en 1985 se había adoptado el Convenio de Viena, su antecedente). La recuperación del ozono es uno de los mayores éxitos ambientales globales.",
    "Rayos X (0.01–10 nm): el IMSS y el ISSSTE operan más de 1,400 equipos de rayos X en México. La tomografía computarizada —que usa rayos X con reconstrucción digital 3D— fue esencial para el diagnóstico de COVID-19 durante la pandemia.",
    "Rayos gamma (<0.01 nm): el ININ (Instituto Nacional de Investigaciones Nucleares) en Ocoyoacac, Estado de México, aplica radiación gamma en braquiterapia oncológica y en la esterilización de alimentos y dispositivos médicos.",
    "El GTM del INAOE participó en el consorcio Event Horizon Telescope que en 2019 capturó la primera imagen de un agujero negro (M87*). Esta contribución mexicana forma parte de uno de los descubrimientos astronómicos más importantes del siglo XXI.",
  ],

  objetivos: [
    "Ordenar las bandas del espectro electromagnético de menor a mayor frecuencia (o mayor a menor longitud de onda).",
    "Explicar por qué todas las ondas EM viajan a c ≈ 3×10⁸ m/s en el vacío y cómo se relacionan frecuencia y longitud de onda (c = λ·f).",
    "Distinguir entre radiación ionizante (rayos X, gamma) y no ionizante (radio, microondas, IR, visible).",
    "Identificar aplicaciones tecnológicas y biomédicas de cada banda del espectro en el contexto mexicano.",
    "Resolver el reto evaluable A2 sobre el espectro electromagnético y sus aplicaciones.",
  ],

  materiales: [
    { nombre: "Visor de espectro 3D",        detalle: "Recorre 18 décadas de frecuencia (10⁴–10²² Hz) con c = λ·f y E = h·f", icono: "fa-wave-square" },
    { nombre: "Modo Visible",                 detalle: "Arcoíris real de 380 nm (violeta) a 700 nm (rojo)", icono: "fa-eye" },
    { nombre: "Modo Aplicaciones",            detalle: "11 tecnologías reales de México: GTM/IFT/IMSS/ININ y más", icono: "fa-satellite-dish" },
    { nombre: "Infografía A1",                detalle: "El espectro EM con contexto mexicano (INAOE, IFT, IMSS, Mario Molina)", icono: "fa-image" },
  ],

  // Conceptos centrales del lab formulados a partir de la infografía A1.
  conceptos: [
    { termino: "c = λ·f",           definicion: "La velocidad de la luz (c ≈ 3×10⁸ m/s) es el producto de la longitud de onda (λ) y la frecuencia (f). Al subir la frecuencia, la longitud de onda baja proporcionalmente." },
    { termino: "E = h·f",           definicion: "La energía de un fotón es proporcional a su frecuencia: E = h·f, donde h = 6.626×10⁻³⁴ J·s (constante de Planck). Los rayos gamma son los más energéticos." },
    { termino: "Radiación ionizante", definicion: "Radiación con suficiente energía para arrancar electrones de los átomos (rayos X, rayos gamma y UV de onda corta). Puede dañar el ADN y provocar mutaciones o cáncer." },
    { termino: "Espectro radioeléctrico", definicion: "Porción del espectro EM (9 kHz – 300 GHz) usada para comunicaciones. En México lo administra el IFT mediante concesiones; en 2023 se subastó el espectro 5G en la banda 3.5 GHz." },
    { termino: "GTM — INAOE",        definicion: "El Gran Telescopio Milimétrico del INAOE, en el Volcán Sierra Negra (Puebla), a 4,600 m de altitud, es el radiotelescopio de antena única más grande del mundo en su frecuencia (50 m de diámetro); participó en la imagen del agujero negro M87* (2019)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de CNEYT-V-P05.
  // Campos: termino + definicion (el campo "ejemplo" se omite aquí; vive en la BD).
  glosario: [
    {
      termino: "Espectro electromagnético",
      definicion: "Conjunto de todas las ondas electromagnéticas ordenadas por frecuencia (o longitud de onda). De menor a mayor frecuencia: radio, microondas, infrarrojo, luz visible, ultravioleta, rayos X, rayos gamma. Todas viajan a c ≈ 3 × 10⁸ m/s en el vacío.",
    },
    {
      termino: "Ondas de radio y microondas",
      definicion: "Ondas de radio (f < 300 MHz, λ > 1 m): telecomunicaciones, radiodifusión AM/FM, WiFi. Microondas (300 MHz - 300 GHz): hornos, radar, telefonía móvil, satélites GPS.",
    },
    {
      termino: "Infrarrojo (IR)",
      definicion: "Longitudes de onda de 700 nm a 1 mm. Por debajo de la luz roja visible. Aplicaciones: control remoto, visión nocturna, termografía médica, calentadores.",
    },
    {
      termino: "Luz visible",
      definicion: "Franja del espectro detectable por el ojo humano: longitudes de onda de 400 nm (violeta) a 700 nm (rojo). Incluye todos los colores del arcoíris: ROYGBIV.",
    },
    {
      termino: "Ultravioleta (UV) y rayos X",
      definicion: "UV (10-400 nm): produce vitamina D en la piel, esteriliza superficies, causa quemaduras. Rayos X (0.01-10 nm): diagnóstico médico (radiografías), seguridad aeroportuaria.",
    },
    {
      termino: "Rayos gamma",
      definicion: "Mayor frecuencia y energía del espectro (f > 10¹⁹ Hz, λ < 0.01 nm). Origen: núcleos radiactivos. Aplicaciones: radioterapia oncológica, gammagrafía, esterilización médica.",
    },
  ],

  aplicaciones: [
    "El IFT administra el espectro radioeléctrico en México; en 2023 subastó espectro 5G (banda 3.5 GHz) a Telcel, AT&T y Movistar.",
    "El GTM del INAOE, en colaboración con UMass Amherst, contribuyó al consorcio Event Horizon Telescope que fotografió M87* en 2019.",
    "El IMSS y el ISSSTE operan más de 1,400 equipos de rayos X; la tomografía computarizada fue esencial para diagnosticar COVID-19.",
    "El ININ aplica rayos gamma en braquiterapia oncológica y esterilización de alimentos y dispositivos médicos en Ocoyoacac, Estado de México.",
    "Mario Molina (UNAM, Nobel 1995) demostró el daño de los CFC al ozono, impulsando el Protocolo de Montreal (1987, ratificado por México en 1988).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 y glosario A5, CNEYT-V-P05. Ancla: CNEYT-V-P05-A2.",
};
