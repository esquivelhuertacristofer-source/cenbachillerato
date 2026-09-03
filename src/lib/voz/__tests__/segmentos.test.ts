/**
 * El corte de una lectura en clips es un CONTRATO con los MP3 ya grabados en
 * R2: si esta función cambia de criterio, el reproductor pide `p-4` de un
 * párrafo que se grabó como `p-3` y la lectura suena corrida sin que nada falle
 * de forma visible. Por eso las claves se prueban de forma explícita.
 */
import {
  paraDecir,
  valeLaPenaDecir,
  segmentosDeLectura,
  segmentosDeInfografia,
} from "@/lib/voz/segmentos";

describe("paraDecir", () => {
  it("quita el marcado que el sintetizador leería en voz alta", () => {
    expect(paraDecir("El **procesador** es el cerebro")).toBe("El procesador es el cerebro");
    expect(paraDecir("## Título de sección")).toBe("Título de sección");
    expect(paraDecir("- primer punto")).toBe("primer punto");
    expect(paraDecir("«una cita»")).toBe("una cita");
  });

  it("convierte los símbolos que se pronuncian mal en palabras", () => {
    expect(paraDecir("entrada → salida")).toBe("entrada a salida");
    expect(paraDecir("uno · dos")).toBe("uno, dos");
    expect(paraDecir("la idea —la central— es")).toBe("la idea, la central, es");
    expect(paraDecir("| celda | otra |")).toBe(", celda, otra,");
  });

  it("normaliza los espacios y los saltos de línea", () => {
    expect(paraDecir("  hola\n\n  mundo  ")).toBe("hola mundo");
  });
});

describe("valeLaPenaDecir", () => {
  it("descarta lo que no es prosa", () => {
    expect(valeLaPenaDecir("---")).toBe(false);
    expect(valeLaPenaDecir("42")).toBe(false);
    expect(valeLaPenaDecir("corto")).toBe(false);
  });

  it("acepta una frase de verdad", () => {
    expect(valeLaPenaDecir("Esto sí es una frase.")).toBe(true);
  });
});

describe("segmentosDeLectura", () => {
  const TEXTO = [
    "Primer párrafo con suficiente texto para valer la pena.",
    "Segundo párrafo, también con su longitud adecuada.",
    "Tercer párrafo que cierra la lectura de prueba.",
  ].join("\n\n");

  it("empieza por el título y sigue con los párrafos numerados desde cero", () => {
    const segs = segmentosDeLectura("Un título largo de prueba", TEXTO);
    expect(segs.map((s) => s.clave)).toEqual(["titulo", "p-0", "p-1", "p-2"]);
    expect(segs[0]!.texto).toBe("Un título largo de prueba");
    expect(segs[1]!.texto).toBe("Primer párrafo con suficiente texto para valer la pena.");
  });

  it("separa por línea en blanco, no por salto simple", () => {
    const segs = segmentosDeLectura("Título de la lectura", "Una línea\nsigue la misma\n\nOtro párrafo distinto ya.");
    expect(segs).toHaveLength(3); // titulo + 2 párrafos
    expect(segs[1]!.texto).toBe("Una línea sigue la misma");
  });

  it("salta el trozo que no vale la pena SIN correr la numeración de los demás", () => {
    // El párrafo del medio es una raya de tabla: no se grabó, y su hueco tiene
    // que quedarse como hueco. Si `p-2` pasara a llamarse `p-1`, el reproductor
    // pediría el MP3 equivocado para el último párrafo.
    const conBasura = "Primer párrafo con longitud suficiente.\n\n---\n\nTercer párrafo con longitud suficiente.";
    const segs = segmentosDeLectura("Título de la lectura", conBasura);
    expect(segs.map((s) => s.clave)).toEqual(["titulo", "p-0", "p-2"]);
  });

  it("sin cuerpo devuelve sólo el título", () => {
    expect(segmentosDeLectura("Título de la lectura", "").map((s) => s.clave)).toEqual(["titulo"]);
  });

  it("no devuelve nada cuando no hay ni título ni cuerpo", () => {
    expect(segmentosDeLectura("", "")).toEqual([]);
  });
});

describe("segmentosDeInfografia", () => {
  const PUNTOS = [
    "México pierde unas 92,000 hectáreas de bosque al año.",
    "corto",
    "La ganadería extensiva explica el 55% de la deforestación.",
  ];

  it("empieza por el título y numera los puntos desde cero", () => {
    const segs = segmentosDeInfografia("Deterioro ambiental en México", PUNTOS);
    expect(segs.map((s) => s.clave)).toEqual(["titulo", "punto-0", "punto-2"]);
    expect(segs[0]!.texto).toBe("Deterioro ambiental en México");
  });

  it("un punto descartado NO corre la numeración de los siguientes", () => {
    // Mismo contrato que en las lecturas: el hueco se queda como hueco, porque
    // el MP3 del tercer punto se grabó con el nombre `punto-2`.
    const segs = segmentosDeInfografia("Deterioro ambiental en México", PUNTOS);
    expect(segs[2]!.clave).toBe("punto-2");
    expect(segs[2]!.texto).toContain("55%");
  });

  it("usa un prefijo distinto al de las lecturas", () => {
    // Si compartieran prefijo, una actividad reescrita de infografía a lectura
    // pediría el MP3 del punto viejo para el párrafo nuevo.
    const infografia = segmentosDeInfografia("Un título de prueba largo", ["Un punto con longitud suficiente."]);
    const lectura = segmentosDeLectura("Un título de prueba largo", "Un párrafo con longitud suficiente.");
    expect(infografia[1]!.clave).toBe("punto-0");
    expect(lectura[1]!.clave).toBe("p-0");
  });

  it("tolera puntos_clave ausente o de otro tipo", () => {
    expect(segmentosDeInfografia("Un título de prueba largo", undefined).map((s) => s.clave)).toEqual(["titulo"]);
    expect(segmentosDeInfografia("Un título de prueba largo", "no es arreglo").map((s) => s.clave)).toEqual(["titulo"]);
  });

  it("limpia el marcado igual que en una lectura", () => {
    const segs = segmentosDeInfografia("Un título de prueba largo", ["**Huella de carbono**: 748 millones de toneladas."]);
    expect(segs[1]!.texto).toBe("Huella de carbono: 748 millones de toneladas.");
  });
});
