/**
 * Datos de la Ficha Teórica del laboratorio "Polite conversations"
 * (IN-IV-P06, progresión 6 de Inglés IV).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: glosario A1 «Social English: Small Talk Vocabulary»
 *     (la progresión no tiene lectura; sus 10 términos, con definición y
 *     ejemplo tal como están en la plataforma, son la base teórica) y la
 *     descripción del video A8.
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO_A1, GLOSARIO_A5, VIDEO_A8, FUENTE } from "./cortesia-conversacion-ingles-data";

export const CORTESIA_CONVERSACION_FICHA: FichaTeoricaData = {
  ancla: "IN-IV · P06 · A1 — Social English: Small Talk Vocabulary",

  marcoTeorico: [VIDEO_A8.descripcion, ...GLOSARIO_A1.map((g) => `${g.termino} — ${g.definicion} Ejemplo: ${g.ejemplo}`)],

  objetivos: [
    "Abrir una conversación breve con el saludo adecuado: How have you been? con quien ya conoces, Nice to meet you con quien acabas de conocer.",
    "Mantener la conversación con backchannels (Really? That's great!), preguntas de vuelta (What about you?) y cambios de tema con By the way.",
    "Responder con empatía a una mala noticia (I'm sorry to hear that) antes de cambiar de tema.",
    "Cerrar con una transición y una despedida cordial (Anyway, I should get going. It was nice talking to you!) en lugar de cortar con «Bye.».",
    "Ajustar el registro a quien escucha: informal con amigos, formal con una maestra o en una recepción.",
    "Detectar una línea descortés en un diálogo y reescribirla con please, could, I'm sorry o Can I add something?",
  ],

  materiales: [
    { nombre: "Cuatro escenarios 3D", detalle: "Cafetería de la escuela, fiesta de cumpleaños de una vecina, videollamada con una estudiante de intercambio y recepción de una clínica (más el salón de inglés).", icono: "fa-people-group" },
    { nombre: "Personajes que reaccionan", detalle: "Sonríen, se incomodan, se confunden, se entristecen o se despiden según lo que dices.", icono: "fa-face-smile" },
    { nombre: "Medidores de cortesía y fluidez", detalle: "Promedian la calidad de tus respuestas en cada conversación.", icono: "fa-gauge" },
    { nombre: "Registro con aguja", detalle: "Muestra si tu frase es informal, neutral o formal y qué espera tu interlocutor.", icono: "fa-sliders" },
    { nombre: "Voz en inglés (opcional)", detalle: "Escucha las líneas con la voz en-US de tu navegador.", icono: "fa-volume-high" },
  ],

  conceptos: [
    {
      termino: "Abrir · mantener · cerrar",
      definicion: "Una conversación social breve tiene tres momentos: se abre con un saludo y una pregunta, se mantiene intercambiando turnos y se cierra con una transición y una despedida. Saltarse uno (cerrar sin transición, no saludar) se siente brusco.",
    },
    {
      termino: "Backchannels",
      definicion: "Respuestas breves como Really?, That's great! o That sounds interesting! que muestran que escuchas y animan a la otra persona a seguir. Deben concordar con la noticia: That's great! ante algo triste suena a burla.",
    },
    {
      termino: "Turn-taking",
      definicion: "Tomar y ceder la palabra con cortesía. Se cede con What about you? y se toma sin interrumpir: That's interesting, but can I add something? / Sorry to interrupt, but…",
    },
    {
      termino: "Empatía",
      definicion: "Ante una mala noticia primero se valida lo que la persona siente (I'm sorry to hear that. That must be hard.) y, si se puede, se ofrece ayuda. Cambiar de tema de inmediato comunica que no escuchaste.",
    },
    {
      termino: "Registro (formal e informal)",
      definicion: "La misma intención se dice distinto según la relación: Hey! What's up? / Can you…? con amigos; Good morning. How are you today? / Excuse me, could you…, please? con una maestra o alguien que no conoces. Demasiado formal con un amigo suena distante; demasiado informal con una maestra, irrespetuoso.",
    },
    {
      termino: "Cerrar sin cortar",
      definicion: "Anyway, I should get going anuncia el cierre y It was nice talking to you (o It was nice meeting you, si acabas de conocer a la persona) lo hace cordial. See you around y Take care completan la despedida.",
    },
  ],

  glosario: GLOSARIO_A5.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Platicar con estudiantes de intercambio o visitantes que hablan inglés en tu escuela o comunidad.",
    "Pedir algo con cortesía en una recepción, una tienda o un aeropuerto de un país de habla inglesa.",
    "Participar en videollamadas escolares o de trabajo en inglés: abrir, tomar el turno sin interrumpir y cerrar bien.",
    "Responder con empatía en mensajes o chats en inglés cuando alguien comparte una mala noticia.",
  ],

  fuente: FUENTE,
};
