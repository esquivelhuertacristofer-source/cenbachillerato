/**
 * Decodificación LOCAL (sin red, SIN verificar firma) del payload de un JWT
 * de Supabase Auth. Se usa desde `src/proxy.ts` para decidir routing/UX sin
 * pagar un round-trip a Supabase Auth en cada request.
 *
 * ⚠️ Esto NO es un verificador de JWT: no valida la firma, solo lee la
 * estructura (3 segmentos separados por ".") y decodifica el payload. Un
 * token forjado con cualquier `exp` futuro pasaría esta función sin error.
 * Por eso su único uso legítimo es como defensa en profundidad de bajo
 * riesgo (ver el comentario grande en `src/proxy.ts`) -- NUNCA para
 * autorización real. La autorización real exige verificar la firma, y para
 * eso ya existe `supabase.auth.getUser()` (contacta al servidor de Supabase
 * Auth) y las políticas RLS en la base de datos.
 *
 * Se implementa con `atob` (no `Buffer`) porque `src/proxy.ts` corre en el
 * runtime de Cloudflare Workers (vía @opennextjs/cloudflare), donde `Buffer`
 * no está garantizado.
 */

export interface JwtClaims {
  /** Segundos desde epoch en los que expira el token (claim estándar `exp`). */
  exp: number;
  /**
   * `true` si Supabase Auth marcó al usuario con cambio de contraseña
   * obligatorio (`user_metadata.must_change_password` en el payload).
   */
  mustChangePassword: boolean;
}

/**
 * Decodifica un segmento base64url (RFC 4648 §5, sin padding) de un JWT a
 * texto UTF-8.
 *
 * `atob` decodifica a una "binary string" (1 carácter = 1 byte), lo cual
 * corrompe cualquier carácter no-ASCII si se usa directamente. Por eso se
 * reconstruyen los bytes uno a uno y se decodifican con `TextDecoder` --
 * necesario porque el payload de Supabase puede traer otros claims con
 * acentos (p. ej. nombres) aunque hoy solo leamos `exp` y
 * `user_metadata.must_change_password`.
 */
function base64UrlToUtf8(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = (4 - (base64.length % 4)) % 4;
  const base64ConPadding = base64 + "=".repeat(relleno);

  const binario = atob(base64ConPadding);
  const bytes = Uint8Array.from(binario, (char) => char.charCodeAt(0));

  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Extrae `exp` y `user_metadata.must_change_password` del payload de un JWT
 * de Supabase sin verificar su firma.
 *
 * @throws si `accessToken` no tiene 3 segmentos separados por ".", si el
 * segmento del payload no decodifica a JSON válido, o si el JSON resultante
 * no tiene un claim `exp` numérico. Ante cualquiera de estos casos, quien
 * llama debe tratar el token como no confiable y caer al camino remoto
 * (`getUser()`).
 */
export function decodeJwtClaims(accessToken: string): JwtClaims {
  const partes = accessToken.split(".");
  const payloadSegment = partes[1];

  if (partes.length !== 3 || payloadSegment === undefined) {
    throw new Error(
      `jwt-claims: se esperaban 3 segmentos separados por "." y se recibieron ${partes.length}`
    );
  }

  const payload = JSON.parse(base64UrlToUtf8(payloadSegment)) as {
    exp?: unknown;
    user_metadata?: { must_change_password?: unknown };
  };

  if (typeof payload.exp !== "number") {
    throw new Error('jwt-claims: el payload no tiene un claim "exp" numérico');
  }

  return {
    exp: payload.exp,
    mustChangePassword: payload.user_metadata?.must_change_password === true,
  };
}
