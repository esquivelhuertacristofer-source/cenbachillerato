/**
 * DÓNDE VIVE EL AUDIO DE LA NARRACIÓN.
 *
 * En el mismo bucket público de R2 que los 211 videos, bajo el prefijo
 * `bachillerato-voz/`. POR QUÉ NO EN `public/`: son ~170 MB de MP3. El bundle
 * de assets del Worker ya carga 59 MB de imágenes; mandar el audio ahí lo
 * duplicaría en cada despliegue para servir archivos que un alumno concreto
 * pide de uno en uno. R2 los sirve con caché de CDN y no entran al despliegue.
 *
 * El `media-src` del CSP (next.config.ts) ya autoriza ese host por los videos,
 * así que el audio no necesita abrir nada nuevo.
 */

/** Base pública del audio. Se puede mover con NEXT_PUBLIC_VOZ_BASE sin tocar código. */
export const VOZ_BASE =
  process.env.NEXT_PUBLIC_VOZ_BASE ??
  "https://pub-94a8196c0c59456a89cf72193424c9d1.r2.dev/bachillerato-voz";

/**
 * El MP3 de un trozo de una actividad. La `clave` la arma
 * `segmentosDeLectura()`; aquí sólo se le pone dirección.
 */
export function rutaVoz(codigo: string, clave: string): string {
  return `${VOZ_BASE}/${encodeURIComponent(codigo)}/${encodeURIComponent(clave)}.mp3`;
}
