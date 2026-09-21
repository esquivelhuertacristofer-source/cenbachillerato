/**
 * Ficha Teórica del laboratorio "Innovaciones tecnológicas para el ambiente"
 * (CNEYT-III-P08).
 *
 * La progresión no tiene lectura A1. El marco teórico combina, marcado en cada
 * párrafo, lo que sí existe VERBATIM (propósito de la progresión, descripción
 * del video A8, introducción de la reflexión A3 y actividad del glosario A5)
 * con párrafos de elaboración del laboratorio que explican los tres modelos.
 * Glosario: A1 y A5 verbatim.
 *
 * Datos puros (sin three).
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, FUENTE, PROPOSITO, VIDEO_A8, REFLEXION_A3, ACTIVIDAD_A5 } from "./innovaciones-ambientales-data";

export const INNOVACIONES_AMBIENTALES_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P08 — Innovaciones tecnológicas que usan el conocimiento de los subsistemas terrestres",

  marcoTeorico: [
    `Propósito de la progresión: «${PROPOSITO}»`,
    `Video A8: «${VIDEO_A8.descripcion}»`,
    `Reflexión A3: «${REFLEXION_A3.intro}»`,
    "La Tierra funciona como cuatro subsistemas que intercambian materia y energía: la atmósfera (el aire, el clima y la lluvia), la hidrósfera (océanos, ríos, acuíferos), la geósfera (rocas, suelos y sedimentos) y la biósfera (todos los seres vivos). Una innovación ambiental aprovecha lo que sabemos de uno o varios de ellos para cortar el camino del deterioro. (Elaboración del laboratorio.)",
    "La cosecha de lluvia usa el régimen de precipitación de la atmósfera: V = A · P · Ce. Un milímetro de lluvia sobre un metro cuadrado es un litro; el coeficiente de escurrimiento Ce descuenta lo que se evapora, se salpica o se desecha con las primeras lluvias sucias. Como en casi todo México la lluvia se concentra en unos meses, el tamaño de la cisterna decide cuánta agua se aprovecha. (Elaboración del laboratorio.)",
    "Un humedal artificial de flujo subsuperficial hace pasar el agua residual por un lecho de grava plantado con especies de humedal. En la grava y las raíces vive una película de bacterias que consume la materia orgánica, medida como DBO₅. La depuración sigue una ley de primer orden: C = C₀ · e^(−K_T · t), donde t = n · A · d / Q es el tiempo que el agua pasa en el lecho y K_T = 1.104 · 1.06^(T−20) crece con la temperatura (Reed, Crites y Middlebrooks, 1995). (Elaboración del laboratorio.)",
    "Un manglar restaurado es una solución basada en la naturaleza. Sus troncos y raíces disipan la energía de las olas: estudios de campo midieron reducciones de 13 a 66 % de la altura de las olas en 100 m de manglar (McIvor et al., 2012). Además acumula carbono en su lodo y su madera, en promedio de 6 a 8 t de CO₂e por hectárea al año. Para que funcione hay que plantar especies nativas en su zona de inundación: mangle rojo en el borde, negro en la zona media y blanco tierra adentro. (Elaboración del laboratorio.)",
    `Actividad del glosario A5: «${ACTIVIDAD_A5}»`,
  ],

  objetivos: [
    "Explicar qué subsistema terrestre aprovecha cada innovación y por qué.",
    "Calcular el agua que capta una azotea con V = A · P · Ce y dimensionar la cisterna según el régimen de lluvias.",
    "Relacionar el área de un humedal artificial, el caudal y la temperatura con la DBO₅ del agua tratada.",
    "Comparar el agua tratada con los límites de la NOM-003-SEMARNAT-1997.",
    "Plantar especies nativas de manglar según la zonación y estimar la protección costera y el carbono capturado.",
    "Asociar un problema ambiental concreto con la innovación que lo resuelve (diagnóstico → acción).",
  ],

  materiales: [
    { nombre: "Vivienda con azotea y cisterna", detalle: "Canaleta, separador de primeras lluvias y cisterna de 1 100 a 20 000 L.", icono: "fa-house-chimney" },
    { nombre: "Normales de lluvia 1991–2020", detalle: "Ciudad de México, Monterrey, Mérida y Tijuana (SMN, valores redondeados).", icono: "fa-cloud-rain" },
    { nombre: "Humedal de flujo subsuperficial", detalle: "Lecho de grava de 0.6 m de profundidad y 38 % de porosidad, plantado con tule y carrizo.", icono: "fa-water" },
    { nombre: "Medidor de DBO₅", detalle: "Muestra a la salida del humedal para compararla con la NOM-003.", icono: "fa-vial" },
    { nombre: "Vivero de manglar", detalle: "Mangle rojo, negro y blanco (nativos) y casuarina (exótica invasora).", icono: "fa-seedling" },
    { nombre: "Canal de oleaje", detalle: "Ola de tormenta de 1.5 m que cruza el cinturón de manglar hasta el pueblo.", icono: "fa-house-flood-water" },
  ],

  conceptos: [
    { termino: "Coeficiente de escurrimiento (Ce)", definicion: "Fracción de la lluvia que cae sobre una superficie y llega a la cisterna. Según la guía OPS/CEPIS: lámina 0.8–0.9, teja de arcilla 0.8–0.9, concreto 0.6–0.8." },
    { termino: "Régimen de lluvias", definicion: "Cómo se reparte la lluvia a lo largo del año. En la Ciudad de México cae casi el 80 % entre junio y septiembre; en Tijuana, en invierno." },
    { termino: "DBO₅", definicion: "Demanda bioquímica de oxígeno a 5 días: el oxígeno que las bacterias consumirían para degradar la materia orgánica del agua. Mientras más alta, más contaminada." },
    { termino: "Tiempo de residencia hidráulica", definicion: "Días que el agua pasa dentro del humedal: t = n · A · d / Q. Aumenta con el área y disminuye con el caudal." },
    { termino: "NOM-003-SEMARNAT-1997", definicion: "Norma para reusar agua residual tratada en servicios al público: DBO₅ de 20 mg/L con contacto directo y 30 mg/L con contacto indirecto (promedio mensual)." },
    { termino: "Zonación del manglar", definicion: "Cada especie ocupa la franja cuya inundación y salinidad tolera: el mangle rojo con raíces en zanco en el borde, el negro con neumatóforos en la zona media y el blanco tierra adentro." },
    { termino: "Carbono azul", definicion: "Carbono que capturan y guardan los ecosistemas costeros (manglares, pastos marinos, marismas). Un manglar guarda cientos de toneladas de carbono por hectárea —en algunos sitios más de mil—, sobre todo en su suelo inundado." },
    { termino: "Solución basada en la naturaleza", definicion: "Usar o restaurar un ecosistema para resolver un problema social —protección costera, agua limpia, clima— mientras se conserva la biodiversidad." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "El programa Cosecha de Lluvia de la SEDEMA ha instalado más de 73 mil sistemas en viviendas de 11 alcaldías de la Ciudad de México desde 2019.",
    "Los humedales artificiales tratan aguas residuales de comunidades pequeñas y hoteles sin electricidad ni químicos.",
    "México tenía 905 086 hectáreas de manglar en 2020 según la CONABIO; todos los estados costeros tienen manglar y Quintana Roo concentra la mayor superficie.",
    "Los biodigestores de granjas convierten el estiércol en biogás para cocinar o generar electricidad y evitan que el metano llegue a la atmósfera.",
    "Los techos verdes y el pavimento permeable reducen la isla de calor y las inundaciones urbanas.",
  ],

  fuente: FUENTE,
};
