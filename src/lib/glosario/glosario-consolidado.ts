/**
 * Fuente canónica del glosario interactivo — t = término · d = definición.
 * Las entradas viven en módulos por área; este archivo re-exporta todo y
 * expone GLOSARIO_POR_UAC como mapa unificado para los tooltips de glosario.
 */

export interface TerminoGlosarioRef {
  t: string;
  d: string;
}

export { GLOSARIO_CD } from './glosario-cd';
export { GLOSARIO_CH } from './glosario-ch';
export { GLOSARIO_CS } from './glosario-cs';
export { GLOSARIO_CNEYT } from './glosario-cneyt';
export { GLOSARIO_IN } from './glosario-in';
export { GLOSARIO_LC } from './glosario-lc';
export { GLOSARIO_PFH } from './glosario-pfh';
export { GLOSARIO_PM } from './glosario-pm';

import { GLOSARIO_CD } from './glosario-cd';
import { GLOSARIO_CH } from './glosario-ch';
import { GLOSARIO_CS } from './glosario-cs';
import { GLOSARIO_CNEYT } from './glosario-cneyt';
import { GLOSARIO_IN } from './glosario-in';
import { GLOSARIO_LC } from './glosario-lc';
import { GLOSARIO_PFH } from './glosario-pfh';
import { GLOSARIO_PM } from './glosario-pm';

export const GLOSARIO_POR_UAC: Record<string, TerminoGlosarioRef[]> = {
  ...GLOSARIO_CD,
  ...GLOSARIO_CH,
  ...GLOSARIO_CS,
  ...GLOSARIO_CNEYT,
  ...GLOSARIO_IN,
  ...GLOSARIO_LC,
  ...GLOSARIO_PFH,
  ...GLOSARIO_PM,
};
