/**
 * bienvenida.ts — Configuración del video de bienvenida por semestre.
 *
 * Mientras `url` sea null, el hero muestra un póster/placeholder honesto
 * ("Próximamente"). Al registrar un URL real (YouTube/Vimeo embed o un .mp4
 * en /public/videos/...), el reproductor aparece solo, sin tocar el componente.
 */

export type VideoBienvenidaTipo = "embed" | "file";

export interface VideoBienvenida {
  /** URL del video. null = aún no hay video → se muestra el placeholder. */
  url: string | null;
  /** "embed" para iframe (YouTube/Vimeo), "file" para <video> nativo. */
  tipo: VideoBienvenidaTipo;
  /** Imagen de póster opcional (ruta en /public). null = gradiente diseñado. */
  poster: string | null;
  /** Texto que acompaña al reproductor/placeholder. */
  titulo: string;
}

/** Registro por semestre. Vacío por ahora: se llena al tener videos reales. */
const VIDEOS_BIENVENIDA: Record<number, VideoBienvenida> = {
  // Ejemplo (cuando exista el video real):
  // 1: { url: "https://www.youtube.com/embed/XXXX", tipo: "embed", poster: "/videos/bienvenida-sem1.jpg", titulo: "Mensaje de bienvenida" },
};

export function getVideoBienvenida(semestre: number): VideoBienvenida {
  return (
    VIDEOS_BIENVENIDA[semestre] ?? {
      url: null,
      tipo: "embed",
      poster: null,
      titulo: "Mensaje de bienvenida",
    }
  );
}
