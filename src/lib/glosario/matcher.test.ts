import {
  foldear,
  prepararTerminos,
  encontrarMatches,
  terminosPresentes,
  type TermDef,
} from "./matcher";

describe("foldear", () => {
  it("pliega acentos y mayúsculas preservando la longitud 1:1", () => {
    const original = "Energía Eléctrica ÑU";
    const folded = foldear(original);
    expect(folded).toBe("energia electrica nu");
    expect(folded.length).toBe(original.length);
  });

  it("deja intactos los caracteres sin mapeo (símbolos, dígitos)", () => {
    expect(foldear("N₂ pH⁺ 3.14")).toBe("n₂ ph⁺ 3.14");
  });
});

describe("prepararTerminos", () => {
  it("deduplica por forma plegada y ordena por longitud descendente", () => {
    const terms: TermDef[] = [
      { t: "Energía", d: "def-corta" },
      { t: "Energía cinética", d: "def-larga" },
      { t: "energia", d: "duplicado-acentos" },
    ];
    const prep = prepararTerminos(terms);
    expect(prep.map((p) => p.t)).toEqual(["Energía cinética", "Energía"]);
  });

  it("descarta vacíos", () => {
    expect(prepararTerminos([{ t: "   ", d: "x" }])).toHaveLength(0);
  });
});

describe("encontrarMatches", () => {
  const prep = prepararTerminos([
    { t: "energía", d: "capacidad de realizar trabajo" },
    { t: "energía cinética", d: "energía del movimiento" },
    { t: "ion", d: "átomo con carga" },
  ]);

  it("coincide solo en palabra completa (no como subcadena)", () => {
    // "energía" NO debe coincidir dentro de "energías" (plural) ni "región" no
    // debe activar "ion".
    const m = encontrarMatches("Las energías y la región del camión.", prep, new Set());
    expect(m).toHaveLength(0);
  });

  it("es insensible a acentos y mayúsculas", () => {
    const m = encontrarMatches("La ENERGIA fluye.", prep, new Set());
    expect(m).toHaveLength(1);
    expect(m[0]?.d).toBe("capacidad de realizar trabajo");
    // El recorte conserva el texto original tal cual fue escrito.
    expect("La ENERGIA fluye.".slice(m[0]?.start, m[0]?.end)).toBe("ENERGIA");
  });

  it("prefiere el match más largo (longest-first)", () => {
    const m = encontrarMatches("La energía cinética es clave.", prep, new Set());
    expect(m).toHaveLength(1);
    expect(m[0]?.d).toBe("energía del movimiento");
  });

  it("respeta y actualiza el set de 'ya usados' (una vez por documento)", () => {
    const seen = new Set<string>();
    const m1 = encontrarMatches("La energía aquí.", prep, seen);
    expect(m1).toHaveLength(1);
    const m2 = encontrarMatches("Más energía allá.", prep, seen);
    expect(m2).toHaveLength(0); // ya fue resaltada antes
  });

  it("coincide con límites de puntuación", () => {
    const m = encontrarMatches("(energía)", prep, new Set());
    expect(m).toHaveLength(1);
    expect(m[0]?.start).toBe(1);
  });

  it("devuelve vacío sin términos o sin texto", () => {
    expect(encontrarMatches("", prep, new Set())).toHaveLength(0);
    expect(encontrarMatches("texto", [], new Set())).toHaveLength(0);
  });
});

describe("terminosPresentes", () => {
  it("devuelve el subconjunto deduplicado en orden de aparición", () => {
    const prep = prepararTerminos([
      { t: "átomo", d: "unidad de materia" },
      { t: "molécula", d: "grupo de átomos" },
    ]);
    const res = terminosPresentes(
      "Una molécula tiene átomos; otro átomo y otra molécula.",
      prep,
    );
    // "molécula" aparece primero (idx temprano) y "átomo" como palabra completa
    // en "otro átomo y" (NO en "átomos", que es plural). Cada uno una sola vez.
    expect(res.map((r) => r.t)).toEqual(["molécula", "átomo"]);
  });
});
