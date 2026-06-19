function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar acentos y diacríticos combinados (incluye ñ→n)
    .replace(/[^a-z0-9]/g, '');      // solo alfanuméricos
}

export function generarEmailBase(nombre: string, apellidoPaterno: string): string {
  return `${normalizar(nombre)}.${normalizar(apellidoPaterno)}@cenbachillerato.mx`;
}

export function generarEmailConDesempate(
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string,
  sufijoNumerico?: number
): string {
  const base = `${normalizar(nombre)}.${normalizar(apellidoPaterno)}.${normalizar(apellidoMaterno)}`;
  const sufijo = sufijoNumerico ? sufijoNumerico.toString() : '';
  return `${base}${sufijo}@cenbachillerato.mx`;
}

/**
 * Resuelve un email único para una persona usando la estrategia de 3 pasos:
 * 1. nombre.apellidoPaterno@cenbachillerato.mx
 * 2. nombre.apellidoPaterno.apellidoMaterno@cenbachillerato.mx
 * 3. nombre.apellidoPaterno.apellidoMaterno{N}@cenbachillerato.mx (N=2,3,...)
 *
 * existingEmails: Set de emails ya existentes en la DB (pre-cargado en batch)
 * emailsEnEsteLote: Set de emails ya asignados en este lote (deduplicación intra-batch)
 */
export function resolverEmailUnico(
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string,
  existingEmails: Set<string>,
  emailsEnEsteLote: Set<string>
): string {
  const unavailable = (email: string) =>
    existingEmails.has(email) || emailsEnEsteLote.has(email);

  // Intento 1: base
  const intento1 = generarEmailBase(nombre, apellidoPaterno);
  if (!unavailable(intento1)) return intento1;

  // Intento 2: con apellido materno
  const intento2 = generarEmailConDesempate(nombre, apellidoPaterno, apellidoMaterno);
  if (!unavailable(intento2)) return intento2;

  // Intento 3+: sufijo numérico incremental
  for (let i = 2; i < 100; i++) {
    const intentoN = generarEmailConDesempate(nombre, apellidoPaterno, apellidoMaterno, i);
    if (!unavailable(intentoN)) return intentoN;
  }

  throw new Error(
    `Imposible generar email único para ${nombre} ${apellidoPaterno} después de 100 intentos`
  );
}

export function generarPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'; // 36 caracteres
  // Aleatoriedad criptográficamente segura: estas son las contraseñas iniciales
  // de alumnos, generadas en lote, así que no se usa Math.random() (predecible).
  // crypto.getRandomValues está disponible en el server (Node) y en Workers.
  // Se descartan los bytes ≥ 252 para no introducir sesgo de módulo (256 % 36 ≠ 0).
  const limite = Math.floor(256 / chars.length) * chars.length; // 252
  const LARGO = 8;
  const buf = new Uint8Array(1);
  let pw = 'Bachi-';
  while (pw.length < 'Bachi-'.length + LARGO) {
    crypto.getRandomValues(buf);
    const b = buf[0]!;
    if (b >= limite) continue; // byte sesgado: reintentar
    pw += chars[b % chars.length];
  }
  return pw;
}
