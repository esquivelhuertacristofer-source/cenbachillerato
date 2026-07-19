/**
 * @jest-environment node
 *
 * jsdom (el entorno por default de este repo) no expone `TextEncoder` como
 * global, y `decodeJwtClaims`/estos fixtures sí lo necesitan (igual que en
 * el runtime real de Cloudflare Workers, donde `TextEncoder`/`TextDecoder`
 * SÍ son globals estándar). El entorno "node" de Jest los expone de forma
 * nativa sin necesitar ningún polyfill.
 */
import { decodeJwtClaims } from "@/lib/jwt-claims";

// ── Helpers de fixture ──────────────────────────────────────────────────────
// Construyen JWTs de prueba a mano (base64url, sin padding, firma falsa) para
// no depender de ninguna librería de JWT: decodeJwtClaims nunca verifica la
// firma, así que una firma inventada es suficiente para ejercitar el código.

function toBase64Url(value: unknown): string {
  const json = JSON.stringify(value);
  // btoa espera una "binary string" (1 char = 1 byte); usamos TextEncoder
  // para manejar UTF-8 correctamente, espejo de cómo decodeJwtClaims lo
  // revierte con TextDecoder.
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildFakeJwt(
  payload: Record<string, unknown>,
  header: Record<string, unknown> = { alg: "HS256", typ: "JWT" }
): string {
  return `${toBase64Url(header)}.${toBase64Url(payload)}.firma-falsa-no-verificada`;
}

const AHORA_SEGUNDOS = Math.floor(Date.now() / 1000);

describe("decodeJwtClaims", () => {
  it("extrae exp del payload", () => {
    const exp = AHORA_SEGUNDOS + 3600;
    const jwt = buildFakeJwt({ exp, sub: "user-1" });

    expect(decodeJwtClaims(jwt).exp).toBe(exp);
  });

  it("mustChangePassword es true cuando user_metadata.must_change_password === true", () => {
    const jwt = buildFakeJwt({
      exp: AHORA_SEGUNDOS + 3600,
      user_metadata: { must_change_password: true },
    });

    expect(decodeJwtClaims(jwt).mustChangePassword).toBe(true);
  });

  it("mustChangePassword es false cuando el claim está explícitamente en false", () => {
    const jwt = buildFakeJwt({
      exp: AHORA_SEGUNDOS + 3600,
      user_metadata: { must_change_password: false },
    });

    expect(decodeJwtClaims(jwt).mustChangePassword).toBe(false);
  });

  it("mustChangePassword es false cuando no hay user_metadata", () => {
    const jwt = buildFakeJwt({ exp: AHORA_SEGUNDOS + 3600 });

    expect(decodeJwtClaims(jwt).mustChangePassword).toBe(false);
  });

  it("mustChangePassword es false para valores truthy no-booleanos (comparación estricta)", () => {
    const jwt = buildFakeJwt({
      exp: AHORA_SEGUNDOS + 3600,
      user_metadata: { must_change_password: "true" },
    });

    expect(decodeJwtClaims(jwt).mustChangePassword).toBe(false);
  });

  it("soporta caracteres UTF-8 en otros claims del payload sin corromper exp/must_change_password", () => {
    const exp = AHORA_SEGUNDOS + 3600;
    const jwt = buildFakeJwt({
      exp,
      user_metadata: { must_change_password: true, nombre: "Ñoño Peña Muñóz" },
    });

    const claims = decodeJwtClaims(jwt);
    expect(claims.exp).toBe(exp);
    expect(claims.mustChangePassword).toBe(true);
  });

  it("decodifica correctamente base64url sin padding (largo no múltiplo de 4)", () => {
    // Un payload pequeño y deliberadamente elegido para que su base64url
    // codificado no caiga en un múltiplo de 4 (i.e. requiere padding al
    // reconstruirlo), ejercitando el cálculo de relleno de base64UrlToUtf8.
    const jwt = buildFakeJwt({ exp: AHORA_SEGUNDOS + 60 });

    expect(() => decodeJwtClaims(jwt)).not.toThrow();
  });

  it("lanza si el token no tiene exactamente 3 segmentos", () => {
    expect(() => decodeJwtClaims("solo-un-segmento")).toThrow(/3 segmentos/);
    expect(() => decodeJwtClaims("dos.segmentos")).toThrow(/3 segmentos/);
    expect(() => decodeJwtClaims("a.b.c.d")).toThrow(/3 segmentos/);
  });

  it("lanza si el payload no decodifica a JSON válido", () => {
    const header = toBase64Url({ alg: "HS256" });
    // "no-es-json" en base64url decodifica a texto que no es JSON.
    const payloadInvalido = toBase64Url_rawString("no-es-json-valido");
    const jwt = `${header}.${payloadInvalido}.firma`;

    expect(() => decodeJwtClaims(jwt)).toThrow();
  });

  it('lanza si falta un claim "exp" numérico', () => {
    const jwt = buildFakeJwt({ sub: "user-1" });
    expect(() => decodeJwtClaims(jwt)).toThrow(/exp/);
  });

  it('lanza si "exp" no es numérico', () => {
    const jwt = buildFakeJwt({ exp: "no-soy-un-numero" });
    expect(() => decodeJwtClaims(jwt)).toThrow(/exp/);
  });
});

/** Variante de toBase64Url que codifica un string crudo (no JSON.stringify). */
function toBase64Url_rawString(raw: string): string {
  const bytes = new TextEncoder().encode(raw);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
