/**
 * LEE EL NÚMERO QUE ESCRIBE UN ALUMNO (o el `respuesta_final` de un ejercicio).
 *
 * Antes se calificaba con `parseFloat(texto.replace(',', '.'))`, y eso fallaba
 * justo con lo que un alumno en México escribe:
 *   - «8,500» se leía 8.5 (la coma es de miles, no decimal);
 *   - «2 × 10⁻⁶» se leía 2, y «2e-6» del alumno no coincidía con nada;
 *   - «$1,250» y «3/4» daban NaN o 3.
 *
 * Reglas, en este orden:
 *   1. Notación científica: «a × 10ⁿ», «a x 10^n», «a*10^-n», «aE-n».
 *   2. Fracción simple «a/b».
 *   3. Miles con coma o espacio («8,500», «1 250 000») SOLO si cada grupo tiene
 *      3 cifras y el primero no es 0 («0,125» es decimal).
 *   4. Decimal con punto o con coma («2.7», «2,7»).
 * Ignora signos de moneda/porcentaje y el texto que venga después del número
 * («2.7 g/cm³ (aluminio)» → 2.7). Devuelve NaN si no empieza con un número.
 */
const SUPER: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+',
};

export function leerNumero(entrada: string | null | undefined): number {
  if (entrada == null) return NaN;
  const s = String(entrada)
    .trim()
    .replace(/[−–—]/g, '-')
    .replace(/^[$€]\s*/, '')
    .replace(/^\+/, '')
    .replace(/^(-)\s*[$]\s*/, '$1');

  const MANTISA = String.raw`(-?\d+(?:[.,]\d+)?)`;
  const cientifica = s.match(new RegExp(String.raw`^${MANTISA}\s*(?:[x×*·]\s*10\s*(?:\^\s*\(?\s*([-+]?\d+)\s*\)?|([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+))|[eE]([-+]?\d+))`));
  if (cientifica) {
    const m = parseFloat(cientifica[1]!.replace(',', '.'));
    const expTexto = cientifica[2] ?? cientifica[4] ?? [...(cientifica[3] ?? '')].map((c) => SUPER[c] ?? '').join('');
    const exp = parseInt(expTexto, 10);
    if (!isNaN(m) && !isNaN(exp)) return Number(`${m}e${exp}`);
  }

  const fraccion = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)(?![\d.,])/);
  if (fraccion) {
    const d = parseFloat(fraccion[2]!);
    if (d !== 0) return parseFloat(fraccion[1]!) / d;
  }

  const miles = s.match(/^-?[1-9]\d{0,2}(?:([, ])\d{3})(?:\1\d{3})*(?:\.\d+)?(?![\d,])/);
  if (miles) return parseFloat(miles[0].replace(/[, ]/g, ''));

  const decimal = s.match(/^-?\d+(?:[.,]\d+)?|^-?[.,]\d+/);
  if (decimal) return parseFloat(decimal[0].replace(',', '.'));

  return NaN;
}

/**
 * ¿La respuesta del alumno coincide con la esperada?
 * Con números muy grandes o muy pequeños (notación científica) una tolerancia
 * absoluta no sirve —0.05 aceptaría 0 para 2 × 10⁻⁶—, así que ahí se compara
 * con un margen relativo del 1 %.
 */
export function coincideNumero(dada: string, esperadaTexto: string | null | undefined, tolerancia = 0): boolean {
  const esperada = leerNumero(esperadaTexto);
  const valor = leerNumero(dada);
  if (isNaN(esperada) || isNaN(valor)) return false;
  const magnitud = Math.abs(esperada);
  const relativa = magnitud !== 0 && (magnitud < 1e-3 || magnitud >= 1e7);
  const margen = relativa ? magnitud * 0.01 : tolerancia;
  return Math.abs(valor - esperada) <= margen + 1e-9;
}
