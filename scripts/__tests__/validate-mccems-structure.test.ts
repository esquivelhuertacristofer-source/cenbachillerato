import {
  UAC_BASE,
  COMPONENTES_CURRICULARES,
  RECURSOS_SOCIOEMOCIONALES,
} from "../../src/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "../../src/lib/mccems/recursos-sociocognitivos";

// Official MCCEMS 2025 structure
// Source: docs/programas-oficiales/extraidos/ (Modelo Educativo 2025)

const EXPECTED_UAC_SEM1 = ["LC-I", "PM-I", "IN-I", "CD-I", "CS-I", "PFH-I", "CNEYT-I"];
const EXPECTED_UAC_SEM2 = ["LC-II", "PM-II", "IN-II", "CD-II", "CS-II", "PFH-II", "CNEYT-II"];
const EXPECTED_UAC_SEM3 = ["LC-III", "PM-III", "IN-III", "PFH-III", "CNEYT-III"];
const EXPECTED_UAC_SEM4 = ["PM-IV", "IN-IV", "CH-I", "CS-III", "CNEYT-IV"];
const EXPECTED_UAC_SEM5 = ["PM-V", "IN-V", "CH-II", "CNEYT-V"];
const EXPECTED_UAC_SEM6 = ["PM-VI", "CH-III", "CD-III", "CNEYT-VI"];

const INVALID_CODES = [
  // Estructura 2023 eliminada
  "LC-IV", "LC-V", "LC-VI",
  // Códigos del seed incorrecto anterior
  "CS-HIS-I", "CS-HIS-II", "CS-ECO-I", "CS-ECO-II", "CS-SOC", "CS-ADM",
  "CNT-BIO-I", "CNT-BIO-II", "CNT-QUI-I", "CNT-QUI-II",
  "CNT-FIS-I", "CNT-FIS-II", "CNT-MATE", "CNT-TC-I", "CNT-TC-II",
  "HUM-PLT", "HUM-FIL", "HUM-EST",
  // Código obsoleto 2023
  "HUM-I", "HUM-II", "HUM-III",
];

function getUACBySemestre(sem: number) {
  return UAC_BASE.filter((u) => u.semestre === sem).map((u) => u.codigo);
}

describe("MCCEMS Structure Validation — UAC por semestre", () => {
  test("Semestre 1 tiene exactamente 7 UAC oficiales", () => {
    const codigos = getUACBySemestre(1);
    expect(codigos).toHaveLength(7);
  });

  test("Semestre 1 contiene todos los códigos obligatorios", () => {
    const codigos = getUACBySemestre(1);
    for (const expected of EXPECTED_UAC_SEM1) {
      expect(codigos).toContain(expected);
    }
  });

  test("Semestre 2 tiene exactamente 7 UAC oficiales", () => {
    const codigos = getUACBySemestre(2);
    expect(codigos).toHaveLength(7);
  });

  test("Semestre 2 contiene todos los códigos obligatorios", () => {
    const codigos = getUACBySemestre(2);
    for (const expected of EXPECTED_UAC_SEM2) {
      expect(codigos).toContain(expected);
    }
  });

  test("Semestre 3 contiene los códigos confirmados por DGB", () => {
    const codigos = getUACBySemestre(3);
    for (const expected of EXPECTED_UAC_SEM3) {
      expect(codigos).toContain(expected);
    }
  });

  test("Semestre 4 contiene CH-I (Conciencia Histórica inicia en sem 4)", () => {
    const codigos = getUACBySemestre(4);
    expect(codigos).toContain("CH-I");
    for (const expected of EXPECTED_UAC_SEM4) {
      expect(codigos).toContain(expected);
    }
  });

  test("Semestre 5 contiene IN-V, CH-II y CNEYT-V", () => {
    const codigos = getUACBySemestre(5);
    for (const expected of EXPECTED_UAC_SEM5) {
      expect(codigos).toContain(expected);
    }
  });

  test("Semestre 6 contiene CH-III, CD-III y CNEYT-VI", () => {
    const codigos = getUACBySemestre(6);
    for (const expected of EXPECTED_UAC_SEM6) {
      expect(codigos).toContain(expected);
    }
  });
});

describe("MCCEMS Structure Validation — Códigos inválidos eliminados", () => {
  test("No existen UAC con códigos obsoletos (2023) ni del seed incorrecto anterior", () => {
    const allCodigos = UAC_BASE.map((u) => u.codigo);
    for (const invalid of INVALID_CODES) {
      expect(allCodigos).not.toContain(invalid);
    }
  });

  test("Conciencia Histórica NO está en semestres 1, 2, 3", () => {
    const badSems = [1, 2, 3];
    for (const sem of badSems) {
      const codigos = getUACBySemestre(sem);
      expect(codigos).not.toContain(`CH-I`);
      expect(codigos).not.toContain(`CH-II`);
      expect(codigos).not.toContain(`CH-III`);
    }
  });

  test("Lengua y Comunicación NO tiene UAC en semestres 4, 5, 6", () => {
    const badSems = [4, 5, 6];
    for (const sem of badSems) {
      const codigos = getUACBySemestre(sem);
      expect(codigos).not.toContain("LC-IV");
      expect(codigos).not.toContain("LC-V");
      expect(codigos).not.toContain("LC-VI");
    }
  });

  test("Pensamiento Filosófico y Humanidades usa código PFH, no HUM", () => {
    const allCodigos = UAC_BASE.map((u) => u.codigo);
    expect(allCodigos).toContain("PFH-I");
    expect(allCodigos).toContain("PFH-II");
    expect(allCodigos).toContain("PFH-III");
    expect(allCodigos).not.toContain("HUM-I");
    expect(allCodigos).not.toContain("HUM-II");
    expect(allCodigos).not.toContain("HUM-III");
  });

  test("Inglés tiene 5 UAC incluyendo IN-V en semestre 5", () => {
    const ingles = UAC_BASE.filter((u) => u.recursoCodigo === "RSC-IN");
    expect(ingles).toHaveLength(5);
    expect(ingles.map((u) => u.codigo)).toContain("IN-V");
    const inv = ingles.find((u) => u.codigo === "IN-V");
    expect(inv?.semestre).toBe(5);
  });
});

describe("MCCEMS Structure Validation — Componente correcto", () => {
  test("Todas las UAC en UAC_BASE son del Currículum Fundamental (CF)", () => {
    const nonCF = UAC_BASE.filter((u) => u.componenteCodigo !== "CF");
    expect(nonCF).toHaveLength(0);
  });

  test("Todas las UAC tienen recursoCodigo (no areaCodigo)", () => {
    const sinRecurso = UAC_BASE.filter((u) => !u.recursoCodigo);
    expect(sinRecurso).toHaveLength(0);
  });

  test("Ninguna UAC tiene areaCodigo (áreas son CFE, no implementadas en UAC_BASE)", () => {
    const conArea = UAC_BASE.filter((u) => u.areaCodigo !== undefined);
    expect(conArea).toHaveLength(0);
  });
});

describe("MCCEMS Structure Validation — Recursos Sociocognitivos", () => {
  test("Hay 8 Recursos Sociocognitivos (Modelo Educativo 2025)", () => {
    expect(RECURSOS_SOCIOCOGNITIVOS).toHaveLength(8);
  });

  test("Los 8 RSC tienen los códigos correctos (Modelo 2025)", () => {
    const codigos = RECURSOS_SOCIOCOGNITIVOS.map((r) => r.codigo);
    expect(codigos).toContain("RSC-LC");
    expect(codigos).toContain("RSC-PM");
    expect(codigos).toContain("RSC-IN");
    expect(codigos).toContain("RSC-CD");
    expect(codigos).toContain("RSC-CH");
    expect(codigos).toContain("RSC-CS");
    expect(codigos).toContain("RSC-PFH");
    expect(codigos).toContain("RSC-CNEYT");
  });

  test("RSC-HUM obsoleto NO existe (renombrado a RSC-PFH)", () => {
    const codigos = RECURSOS_SOCIOCOGNITIVOS.map((r) => r.codigo);
    expect(codigos).not.toContain("RSC-HUM");
  });

  test("RSC-CH tiene semestres [4, 5, 6] (no [1, 2, 3])", () => {
    const ch = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === "RSC-CH");
    expect(ch?.semestres).toEqual([4, 5, 6]);
  });

  test("RSC-CD aparece en semestre 6 (Cultura Digital III)", () => {
    const cd = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === "RSC-CD");
    expect(cd?.semestres).toContain(6);
  });

  test("RSC-IN aparece en semestres 1-5 (Inglés I a Inglés V)", () => {
    const ing = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === "RSC-IN");
    expect(ing?.semestres).toEqual([1, 2, 3, 4, 5]);
  });

  test("RSC-PFH tiene nombre oficial completo", () => {
    const pfh = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === "RSC-PFH");
    expect(pfh?.nombre).toBe("Pensamiento Filosófico y Humanidades");
  });
});

describe("MCCEMS Structure Validation — Ámbitos Socioemocionales", () => {
  test("Hay 4 Ámbitos de Formación Socioemocional (no 3)", () => {
    expect(RECURSOS_SOCIOEMOCIONALES).toHaveLength(4);
  });

  test("Los ámbitos tienen los nombres oficiales MCCEMS (no NEM 2019)", () => {
    const nombres = RECURSOS_SOCIOEMOCIONALES.map((r) => r.nombre);
    expect(nombres).toContain("Actividades físicas y deportivas");
    expect(nombres).toContain("Actividades artísticas y culturales");
    expect(nombres).toContain("Educación integral en sexualidad y género");
    expect(nombres).toContain("Educación para la salud y práctica ciudadana");
  });

  test("No existen los nombres incorrectos del NEM 2019", () => {
    const nombres = RECURSOS_SOCIOEMOCIONALES.map((r) => r.nombre);
    expect(nombres).not.toContain("Responsabilidad Social");
    expect(nombres).not.toContain("Cuidado Físico Corporal");
    expect(nombres).not.toContain("Bienestar Emocional Afectivo");
  });
});

describe("MCCEMS Structure Validation — Componentes curriculares", () => {
  test("Existen los 4 componentes curriculares", () => {
    expect(COMPONENTES_CURRICULARES).toHaveLength(4);
  });

  test("CF, CFE, CA, CL están presentes", () => {
    const codigos = COMPONENTES_CURRICULARES.map((c) => c.codigo);
    expect(codigos).toContain("CF");
    expect(codigos).toContain("CFE");
    expect(codigos).toContain("CA");
    expect(codigos).toContain("CL");
  });
});

describe("MCCEMS Structure Validation — Totales y conteo (Modelo Educativo 2025)", () => {
  test("Total de UAC es 32 (CF únicamente, Modelo 2025)", () => {
    expect(UAC_BASE).toHaveLength(32);
  });

  test("Total de propósitos formativos esperados es 207 (oficial 2025)", () => {
    const total = UAC_BASE.reduce((sum, u) => sum + u.totalProgresionesEsperadas, 0);
    expect(total).toBe(207);
  });

  test("Cada recursoCodigo existe en RECURSOS_SOCIOCOGNITIVOS", () => {
    const rscCodigos = RECURSOS_SOCIOCOGNITIVOS.map((r) => r.codigo);
    for (const uac of UAC_BASE) {
      if (uac.recursoCodigo) {
        expect(rscCodigos).toContain(uac.recursoCodigo);
      }
    }
  });

  test("Distribución por área es correcta según oficial 2025", () => {
    const byRSC = (codigo: string) =>
      UAC_BASE.filter((u) => u.recursoCodigo === codigo)
              .reduce((sum, u) => sum + u.totalProgresionesEsperadas, 0);

    expect(byRSC("RSC-LC")).toBe(23);    // 8+8+7
    expect(byRSC("RSC-PM")).toBe(42);    // 7+6+6+7+8+8
    expect(byRSC("RSC-IN")).toBe(40);    // 8×5
    expect(byRSC("RSC-CD")).toBe(17);    // 8+5+4
    expect(byRSC("RSC-CH")).toBe(12);    // 4×3
    expect(byRSC("RSC-CS")).toBe(11);    // 4+4+3
    expect(byRSC("RSC-PFH")).toBe(14);   // 5+5+4
    expect(byRSC("RSC-CNEYT")).toBe(48); // 8×6
  });
});

describe("MCCEMS Structure Validation — Semestre 3 propósitos (Modelo Educativo 2025)", () => {
  test("LC-III tiene exactamente 7 propósitos formativos esperados", () => {
    const lciii = UAC_BASE.find((u) => u.codigo === "LC-III");
    expect(lciii).toBeDefined();
    expect(lciii?.totalProgresionesEsperadas).toBe(7);
  });

  test("PM-III tiene exactamente 6 propósitos formativos esperados", () => {
    const pmiii = UAC_BASE.find((u) => u.codigo === "PM-III");
    expect(pmiii).toBeDefined();
    expect(pmiii?.totalProgresionesEsperadas).toBe(6);
  });

  test("IN-III tiene exactamente 8 propósitos formativos esperados", () => {
    const iniii = UAC_BASE.find((u) => u.codigo === "IN-III");
    expect(iniii).toBeDefined();
    expect(iniii?.totalProgresionesEsperadas).toBe(8);
  });

  test("PFH-III tiene exactamente 4 propósitos formativos esperados", () => {
    const pfhiii = UAC_BASE.find((u) => u.codigo === "PFH-III");
    expect(pfhiii).toBeDefined();
    expect(pfhiii?.totalProgresionesEsperadas).toBe(4);
  });

  test("CNEYT-III tiene exactamente 8 propósitos formativos esperados", () => {
    const cneytiii = UAC_BASE.find((u) => u.codigo === "CNEYT-III");
    expect(cneytiii).toBeDefined();
    expect(cneytiii?.totalProgresionesEsperadas).toBe(8);
  });
});

describe("MCCEMS Structure Validation — Semestre 4 propósitos (Modelo Educativo 2025)", () => {
  test("CH-I tiene exactamente 4 propósitos formativos esperados (primera aparición de Conciencia Histórica)", () => {
    const chi = UAC_BASE.find((u) => u.codigo === "CH-I");
    expect(chi).toBeDefined();
    expect(chi?.totalProgresionesEsperadas).toBe(4);
  });

  test("CNEYT-IV tiene exactamente 8 propósitos formativos esperados", () => {
    const cneytiv = UAC_BASE.find((u) => u.codigo === "CNEYT-IV");
    expect(cneytiv).toBeDefined();
    expect(cneytiv?.totalProgresionesEsperadas).toBe(8);
  });

  test("CS-III tiene exactamente 3 propósitos formativos esperados", () => {
    const csiii = UAC_BASE.find((u) => u.codigo === "CS-III");
    expect(csiii).toBeDefined();
    expect(csiii?.totalProgresionesEsperadas).toBe(3);
  });

  test("IN-IV tiene exactamente 8 propósitos formativos esperados", () => {
    const iniv = UAC_BASE.find((u) => u.codigo === "IN-IV");
    expect(iniv).toBeDefined();
    expect(iniv?.totalProgresionesEsperadas).toBe(8);
  });

  test("PM-IV tiene exactamente 7 propósitos formativos esperados", () => {
    const pmiv = UAC_BASE.find((u) => u.codigo === "PM-IV");
    expect(pmiv).toBeDefined();
    expect(pmiv?.totalProgresionesEsperadas).toBe(7);
  });
});

describe("MCCEMS Structure Validation — Semestre 2 propósitos (Modelo Educativo 2025)", () => {
  test("LC-II tiene exactamente 8 propósitos formativos esperados", () => {
    const lcii = UAC_BASE.find((u) => u.codigo === "LC-II");
    expect(lcii).toBeDefined();
    expect(lcii?.totalProgresionesEsperadas).toBe(8);
  });

  test("PM-II tiene exactamente 6 propósitos formativos esperados", () => {
    const pmii = UAC_BASE.find((u) => u.codigo === "PM-II");
    expect(pmii).toBeDefined();
    expect(pmii?.totalProgresionesEsperadas).toBe(6);
  });

  test("IN-II tiene exactamente 8 propósitos formativos esperados", () => {
    const inii = UAC_BASE.find((u) => u.codigo === "IN-II");
    expect(inii).toBeDefined();
    expect(inii?.totalProgresionesEsperadas).toBe(8);
  });

  test("CD-II tiene exactamente 5 propósitos formativos esperados", () => {
    const cdii = UAC_BASE.find((u) => u.codigo === "CD-II");
    expect(cdii).toBeDefined();
    expect(cdii?.totalProgresionesEsperadas).toBe(5);
  });

  test("CS-II tiene exactamente 4 propósitos formativos esperados", () => {
    const csii = UAC_BASE.find((u) => u.codigo === "CS-II");
    expect(csii).toBeDefined();
    expect(csii?.totalProgresionesEsperadas).toBe(4);
  });

  test("PFH-II tiene exactamente 5 propósitos formativos esperados", () => {
    const pfhii = UAC_BASE.find((u) => u.codigo === "PFH-II");
    expect(pfhii).toBeDefined();
    expect(pfhii?.totalProgresionesEsperadas).toBe(5);
  });

  test("CNEYT-II tiene exactamente 8 propósitos formativos esperados", () => {
    const cneytii = UAC_BASE.find((u) => u.codigo === "CNEYT-II");
    expect(cneytii).toBeDefined();
    expect(cneytii?.totalProgresionesEsperadas).toBe(8);
  });
});
