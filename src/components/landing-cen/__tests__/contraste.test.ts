import { FICHA, PLATAFORMAS, cifrasDeTag } from '../MateriasMosaicoSection';
import { CONTRASTE_AA, TINTA_CLARA, TINTA_OSCURA, contraste, luminancia, mezclarSobre, tintaSobre } from '../contraste';

describe('luminancia', () => {
  it('ancla los extremos del rango', () => {
    expect(luminancia('#000000')).toBeCloseTo(0, 6);
    expect(luminancia('#FFFFFF')).toBeCloseTo(1, 6);
  });

  it('pondera el verde por encima del rojo y el rojo por encima del azul', () => {
    // Los coeficientes de WCAG (0.2126 / 0.7152 / 0.0722) son justamente esto:
    // a igual valor de canal, el verde aporta ~10x más luz que el azul.
    expect(luminancia('#00FF00')).toBeCloseTo(0.7152, 4);
    expect(luminancia('#FF0000')).toBeCloseTo(0.2126, 4);
    expect(luminancia('#0000FF')).toBeCloseTo(0.0722, 4);
    expect(luminancia('#00FF00')).toBeGreaterThan(luminancia('#FF0000'));
    expect(luminancia('#FF0000')).toBeGreaterThan(luminancia('#0000FF'));
  });

  it('usa el tramo lineal por debajo del umbral de gamma', () => {
    // #050505 → 0.0196 < 0.04045, así que va por canal/12.92 y no por la potencia.
    const c = (5 / 255) / 12.92;
    expect(luminancia('#050505')).toBeCloseTo(c, 8);
  });
});

describe('contraste', () => {
  it('da 21:1 entre blanco y negro, el máximo de la escala', () => {
    expect(contraste('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('da 1:1 de un color contra sí mismo', () => {
    expect(contraste('#38BDF8', '#38BDF8')).toBeCloseTo(1, 6);
  });

  it('es simétrico', () => {
    expect(contraste('#FBBF24', TINTA_OSCURA)).toBeCloseTo(contraste(TINTA_OSCURA, '#FBBF24'), 10);
  });
});

describe('tintaSobre', () => {
  it('elige tinta oscura sobre los amarillos y claros del catálogo', () => {
    expect(tintaSobre('#FBBF24')).toBe(TINTA_OSCURA); // CS, bachillerato
    expect(tintaSobre('#FFB703')).toBe(TINTA_OSCURA); // Matemáticas, Labs
    expect(tintaSobre('#8ECAE6')).toBe(TINTA_OSCURA); // Biología, Labs
  });

  it('elige tinta clara sobre los azules y morados oscuros', () => {
    expect(tintaSobre('#2563EB')).toBe(TINTA_CLARA); // Lenguajes
    expect(tintaSobre('#7C3AED')).toBe(TINTA_CLARA); // De lo Humano y lo Comunitario
  });

  it('resuelve los extremos', () => {
    expect(tintaSobre('#FFFFFF')).toBe(TINTA_OSCURA);
    expect(tintaSobre('#000000')).toBe(TINTA_CLARA);
  });
});

// El mosaico pinta el tile con el color pleno del área y encima el texto con
// la tinta que devuelve tintaSobre(). Este bloque es el que impide que entre
// al catálogo un color donde NINGUNA de las dos tintas alcanza AA: cuando eso
// pasó (#6366F1 y #8B5CF6, grados 6 y 7 de Financiera) hubo que aclarar el
// color, porque no había elección de tinta que lo salvara.
describe('catálogo de colores del mosaico', () => {
  const tiles = PLATAFORMAS.flatMap(p => p.materias.map(m => ({ plataforma: p.id, ...m })));

  it.each(tiles.map(t => [`${t.plataforma}/${t.codigo}`, t.hex] as const))(
    '%s (%s) alcanza AA con su tinta calculada',
    (_etiqueta, hex) => {
      expect(contraste(hex, tintaSobre(hex))).toBeGreaterThanOrEqual(CONTRASTE_AA);
    },
  );

  it('no deja ningún hex fuera del formato #RRGGBB', () => {
    for (const t of tiles) {
      expect(t.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('mantiene rgba en sincronía con hex (el token de sombra debe ser el mismo color)', () => {
    for (const t of tiles) {
      const esperado = [
        parseInt(t.hex.slice(1, 3), 16),
        parseInt(t.hex.slice(3, 5), 16),
        parseInt(t.hex.slice(5, 7), 16),
      ].join(',');
      expect(t.rgba.replace(/\s/g, '')).toBe(esperado);
    }
  });

  it('ya no contiene los dos colores que reprobaban con ambas tintas', () => {
    const hexes = tiles.map(t => t.hex);
    expect(hexes).not.toContain('#6366F1');
    expect(hexes).not.toContain('#8B5CF6');
  });
});

// Las seis fichas del carrusel son de PAPEL: fondo blanco (`FICHA.fondo`), la
// foto a sangre arriba y el nombre montado encima. Sobre esa hoja el azul CEN
// hace los dos trabajos y `FICHA` los tiene separados a propósito:
//   · `FICHA.realce` escribe todo lo que es dato —cifras, contadores, lavado de
//     fila— y nunca rellena nada.
//   · `FICHA.accion` rellena una sola pieza —el botón— y nunca escribe nada.
// Hoy son el mismo hex; siguen separados porque el día que uno se mueva, el
// otro no tiene por qué moverse con él.
//
// Mover cualquiera de los dos no rompe un detalle suelto: cambia el suelo de
// las seis fichas de golpe. Este bloque es el que lo sostiene, y es el que
// habría atajado los dos defectos reales de la conversión a papel: la etiqueta
// del panel al 55% (3.9:1) y el contador al 85% de azul (4.0:1).
//
// No itera `PLATAFORMAS` porque el color dejó de ser un dato de plataforma:
// seis fondos saturados en fila se leían como seis marcas distintas y no como
// una familia. Lo que distingue a cada ficha es su foto, su ícono y su nombre;
// el color de área sigue vivo donde sí significa algo —el punto de cada fila
// del panel, que sobre blanco lee su tono exacto— y eso lo cubre el catálogo de
// tiles de más arriba.
describe('ficha de papel: el azul CEN sobre la hoja blanca', () => {
  const tinta = tintaSobre(FICHA.fondo);

  // Réplica de las opacidades que el componente y el CSS aplican al texto.
  // Van aquí y no importadas porque son literales repartidos entre el JSX y el
  // CSS; si allá cambian y aquí no, este bloque deja de proteger lo que dice
  // proteger.
  //
  // Son las ramas de FICHA CLARA de cada token, que en el componente son las
  // del `else` —la condición pregunta si la TINTA es blanca, o sea si la ficha
  // es oscura—. Sobre papel la tinta puede retirarse MÁS que sobre azul-negro,
  // no menos: ahí el margen lo ponía el fondo, aquí lo pone la tinta.
  const OPACIDAD_DESC = 0.78; // --matc-desc-op, en .matc-card-desc
  const OPACIDAD_SEC = 0.72; // --matc-sec-op: rótulos, pies de cifra, detalle

  it('resuelve la tinta en oscuro: la ficha es papel, no tinta', () => {
    expect(tinta).toBe(TINTA_OSCURA);
  });

  it('sostiene AA en el nombre y las filas, tinta plena sobre el papel', () => {
    expect(contraste(FICHA.fondo, tinta)).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('sostiene AA en la descripción con la opacidad que manda el componente', () => {
    // `opacity` sobre un fondo opaco se resuelve como una mezcla con ese fondo.
    expect(contraste(FICHA.fondo, mezclarSobre(FICHA.fondo, tinta, OPACIDAD_DESC)))
      .toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('sostiene AA en el texto de servicio, lo más tenue de la ficha', () => {
    expect(contraste(FICHA.fondo, mezclarSobre(FICHA.fondo, tinta, OPACIDAD_SEC)))
      .toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('reprueba con la opacidad que traía cuando la ficha era oscura', () => {
    // No es una curiosidad: es el defecto que de verdad se coló al aclarar la
    // ficha. Sobre azul-negro el rótulo del panel iba al 55% y daba ~7:1; el
    // mismo 55% sobre papel cae a 3.9:1 y se sale de AA a 10px. Este test
    // fracasa si alguien "recupera" aquel valor, y de paso deja escrito que el
    // margen de una ficha clara corre al revés que el de una oscura.
    expect(contraste(FICHA.fondo, mezclarSobre(FICHA.fondo, tinta, 0.55)))
      .toBeLessThan(CONTRASTE_AA);
  });

  it('escribe AA con el azul CEN: cifras y contadores', () => {
    // 5.17:1 sobre blanco. No sobra margen —por eso los contadores de 11px van
    // a fuerza plena y sin `opacity`: al 85% quedaban en 3.97:1—.
    expect(contraste(FICHA.fondo, FICHA.realce)).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('deja el azul de realce como tinta, no como fondo de texto claro', () => {
    // Si alguien lo usara de fondo tendría que escribir en blanco encima: es un
    // color oscuro sobre papel. Es exactamente lo que hace el botón.
    expect(tintaSobre(FICHA.realce)).toBe(TINTA_CLARA);
    expect(luminancia(FICHA.realce)).toBeLessThan(luminancia(FICHA.fondo));
  });

  it('escribe AA en el botón, el único relleno saturado fuera de la foto', () => {
    expect(contraste(FICHA.accion, tintaSobre(FICHA.accion)))
      .toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('mantiene el formato #RRGGBB en los colores de la ficha', () => {
    for (const hex of [FICHA.fondo, FICHA.realce, FICHA.accion, FICHA.velo, FICHA.nivelSobreVelo]) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('mantiene los rgba en sincronía con sus hex', () => {
    // `--matc-fondo-rgba` y `--matc-velo-foto` alimentan degradados. Si uno se
    // desincroniza de su hex, la unión deja una costura de otro color justo
    // donde debería ser invisible.
    const canales = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ].join(',');
    expect(FICHA.fondoRgba.replace(/\s/g, '')).toBe(canales(FICHA.fondo));
    expect(FICHA.veloRgba.replace(/\s/g, '')).toBe(canales(FICHA.velo));
  });

  it('deja el papel blanco pleno, sin tinte de crema ni de gris', () => {
    // Un blanco teñido convierte la ficha en papel viejo, y sobre el lavado
    // azul de la sección se lee como una hoja sucia en vez de una hoja nueva.
    expect(FICHA.fondo).toBe('#FFFFFF');
  });
});

// El caso peor de la portada: la foto. Nada garantiza que la banda donde cae el
// nombre no sea blanco puro —un cielo, una bata de laboratorio, una pared—. Por
// eso el nombre no va sobre la foto pelada, va sobre un velo.
//
// Y el velo NO es el fondo de la ficha, que es la trampa de una ficha clara: un
// degradado hacia el blanco desvanecería la foto justo donde vive el nombre. El
// velo va en el navy de la landing (`FICHA.velo`), la foto se oscurece al pie y
// termina en un canto limpio contra el papel. Estos tests fijan la opacidad
// mínima de ese velo contra una foto 100% blanca.
describe('velo de la portada: legibilidad contra la foto más clara posible', () => {
  const FOTO_PEOR = '#FFFFFF';

  // .matc-media::after — el degradado que monta el nombre sobre la foto. 0.78
  // es la parada a la altura donde arranca el texto; de ahí para abajo el velo
  // sólo sube (0.92 al pie).
  const VELO_NOMBRE = 0.78;

  it('sostiene AA en el nombre de la plataforma sobre una foto blanca', () => {
    expect(contraste(mezclarSobre(FOTO_PEOR, FICHA.velo, VELO_NOMBRE), tintaSobre(FICHA.velo)))
      .toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('sostiene AA en el nivel, que va en azul claro sobre ese mismo velo', () => {
    expect(contraste(mezclarSobre(FOTO_PEOR, FICHA.velo, VELO_NOMBRE), FICHA.nivelSobreVelo))
      .toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('escribe el nombre con la tinta del velo y no con la de la ficha', () => {
    // Las dos tintas son opuestas —papel blanco pide oscuro, velo navy pide
    // claro—, así que confundirlas pinta el título de navy sobre navy. El CSS
    // lo resuelve con `--matc-tinta-foto`, aparte de `--matc-tinta`.
    expect(tintaSobre(FICHA.velo)).toBe(TINTA_CLARA);
    expect(tintaSobre(FICHA.fondo)).toBe(TINTA_OSCURA);
  });

  it('deja el chip del ícono fuera del problema: es opaco, no de vidrio', () => {
    // Un chip traslúcido toma el valor de la foto que tiene debajo, y contra
    // una foto negra el azul CEN caía a 2.6:1 (al 92% seguía en 4.3:1). Siendo
    // papel sólido, el glifo tiene los mismos 5.17:1 pase lo que pase en la
    // imagen. Este test existe para que nadie lo vuelva a traslucir.
    expect(contraste(FICHA.fondo, FICHA.realce)).toBeGreaterThanOrEqual(CONTRASTE_AA);
    for (const foto of ['#FFFFFF', '#000000']) {
      expect(contraste(mezclarSobre(foto, FICHA.fondo, 1), FICHA.realce))
        .toBeGreaterThanOrEqual(CONTRASTE_AA);
    }
  });
});

// Las cifras grandes de la ficha no son un dato aparte: se derivan del `tag`
// que ya existía ("32 materias · 8 áreas"), partiéndolo en número + rótulo para
// poder darle al número 30px y al rótulo 9.5px. Si alguien edita un `tag` y
// rompe el patrón "<número> <palabras>", el tramo se cae en silencio y la ficha
// pierde una cifra sin avisar. Esto es lo que avisa.
describe('cifrasDeTag', () => {
  it('parte un tag de dos tramos en número y rótulo', () => {
    expect(cifrasDeTag('32 materias · 8 áreas')).toEqual([
      { num: '32', label: 'materias' },
      { num: '8', label: 'áreas' },
    ]);
  });

  it('descarta los tramos que no empiezan con número', () => {
    // "Currículo completo" no es una cifra; entra al tag como texto y aquí se
    // cae a propósito en vez de renderizarse como un número vacío.
    expect(cifrasDeTag('12 materias · Currículo completo')).toEqual([
      { num: '12', label: 'materias' },
    ]);
  });

  it('tolera espacios de más y un solo tramo', () => {
    expect(cifrasDeTag('  40  laboratorios  ')).toEqual([{ num: '40', label: 'laboratorios' }]);
  });

  it('devuelve vacío cuando no hay ninguna cifra', () => {
    expect(cifrasDeTag('Próximamente')).toEqual([]);
  });

  it('saca al menos una cifra de las seis plataformas', () => {
    // El renglón de cifras tiene `min-height`: si una plataforma no produjera
    // ninguna, quedaría un hueco de 54px sin nada dentro.
    for (const p of PLATAFORMAS) {
      expect(cifrasDeTag(p.tag).length).toBeGreaterThan(0);
    }
  });

  it('no deja que una cifra desborde el renglón (máximo tres por ficha)', () => {
    // `.matc-cifras` es flex-wrap con min-height fija para una sola línea; con
    // cuatro cifras de 30px la ficha crecería y rompería el presupuesto de alto.
    for (const p of PLATAFORMAS) {
      expect(cifrasDeTag(p.tag).length).toBeLessThanOrEqual(3);
    }
  });
});

describe('mezclarSobre', () => {
  it('devuelve el fondo con alfa 0 y la capa con alfa 1', () => {
    expect(mezclarSobre('#FFFFFF', '#2563EB', 0)).toBe('#FFFFFF');
    expect(mezclarSobre('#FFFFFF', '#2563EB', 1)).toBe('#2563EB');
  });

  it('interpola canal por canal', () => {
    // negro al 50% sobre blanco = 128 en los tres canales
    expect(mezclarSobre('#FFFFFF', '#000000', 0.5)).toBe('#808080');
  });
});

describe('estructura del mosaico', () => {
  it.each([
    ['bachillerato', 8, 32],
    ['preescolar', 4, 34],
    ['primaria', 4, 12],
    ['secundaria', 4, 15],
    ['labs', 4, 40],
    ['financiera', 9, 27],
  ])('%s conserva %i grupos y %i materias', (id, grupos, materias) => {
    const p = PLATAFORMAS.find(x => x.id === id);
    expect(p).toBeDefined();
    expect(p?.grupos).toHaveLength(grupos);
    expect(p?.materias).toHaveLength(materias);
  });

  it('deriva `materias` del aplanado de `grupos`, en el mismo orden en que se pintan', () => {
    for (const p of PLATAFORMAS) {
      expect(p.materias.map(m => m.id)).toEqual(p.grupos.flatMap(g => g.materias.map(m => m.id)));
    }
  });

  it('no repite ids de materia dentro de una plataforma', () => {
    // El detalle se resuelve buscando por id: un id duplicado haría que dos
    // tiles se vieran activos a la vez.
    for (const p of PLATAFORMAS) {
      expect(new Set(p.materias.map(m => m.id)).size).toBe(p.materias.length);
    }
  });

  it('no deja grupos vacíos ni textos en blanco', () => {
    for (const p of PLATAFORMAS) {
      for (const g of p.grupos) {
        expect(g.materias.length).toBeGreaterThan(0);
        expect(g.nombre.trim()).not.toBe('');
        for (const m of g.materias) {
          expect(m.codigo.trim()).not.toBe('');
          expect(m.nombreCorto.trim()).not.toBe('');
          expect(m.nombreCompleto.trim()).not.toBe('');
          expect(m.descripcion.trim()).not.toBe('');
        }
      }
    }
  });

  it('deja el nombre completo sin guiones suaves', () => {
    // El guion suave solo tiene sentido en el tile, donde la columna es
    // estrecha. `nombreCompleto` es el título del panel de detalle: ahí sobra
    // el ancho, y un carácter invisible se arrastraría a cualquier copia del
    // texto. Como `tilesDeGrupo` hace `nombreCompleto: fila[3] ?? fila[1]`,
    // olvidar el 4.º campo lo colaría sin que se note a simple vista.
    const guionSuave = String.fromCharCode(0xad);
    for (const p of PLATAFORMAS) {
      for (const m of p.materias) {
        expect(m.nombreCompleto).not.toContain(guionSuave);
        expect(m.descripcion).not.toContain(guionSuave);
      }
    }
  });

  it('hereda a cada materia el color de su grupo', () => {
    for (const p of PLATAFORMAS) {
      for (const g of p.grupos) {
        for (const m of g.materias) {
          expect(m.hex).toBe(g.hex);
          expect(m.rgba).toBe(g.rgba);
        }
      }
    }
  });
});
