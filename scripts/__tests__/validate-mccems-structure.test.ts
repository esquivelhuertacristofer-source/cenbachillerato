import {
  UAC_BASE,
  COMPONENTES_CURRICULARES,
  RECURSOS_SOCIOEMOCIONALES,
} from "../../src/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "../../src/lib/mccems/recursos-sociocognitivos";

// Official MCCEMS structure per DGB (validated 2026-05-12)
// Source: dgb.sep.gob.mx/programas-de-estudio

const EXPECTED_UAC_SEM1 = ["LC-I", "PM-I", "IN-I", "CD-I", "CS-I", "HUM-I", "CNEYT-I"];
const EXPECTED_UAC_SEM2 = ["LC-II", "PM-II", "IN-II", "CD-II", "CS-II", "HUM-II", "CNEYT-II"];
const EXPECTED_UAC_SEM3 = ["LC-III", "PM-III", "IN-III", "HUM-III", "CNEYT-III"];
const EXPECTED_UAC_SEM4 = ["LC-IV", "PM-IV", "IN-IV", "CH-I", "CS-III", "CNEYT-IV"];
const EXPECTED_UAC_SEM5 = ["LC-V", "PM-V", "CH-II", "CNEYT-V"];
const EXPECTED_UAC_SEM6 = ["LC-VI", "PM-VI", "CH-III", "CD-III", "CNEYT-VI"];

const INVALID_CODES = [
  "CS-HIS-I", "CS-HIS-II", "CS-ECO-I", "CS-ECO-II", "CS-SOC", "CS-ADM",
  "CNT-BIO-I", "CNT-BIO-II", "CNT-QUI-I", "CNT-QUI-II",
  "CNT-FIS-I", "CNT-FIS-II", "CNT-MATE", "CNT-TC-I", "CNT-TC-II",
  "HUM-PLT", "HUM-FIL", "HUM-EST",
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

  test("Semestre 5 contiene CH-II y CNEYT-V", () => {
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
  test("No existen UAC con códigos del seed incorrecto anterior", () => {
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

  test("Los 8 RSC tienen los códigos correctos", () => {
    const codigos = RECURSOS_SOCIOCOGNITIVOS.map((r) => r.codigo);
    expect(codigos).toContain("RSC-LC");
    expect(codigos).toContain("RSC-PM");
    expect(codigos).toContain("RSC-IN");
    expect(codigos).toContain("RSC-CD");
    expect(codigos).toContain("RSC-CH");
    expect(codigos).toContain("RSC-CS");
    expect(codigos).toContain("RSC-HUM");
    expect(codigos).toContain("RSC-CNEYT");
  });

  test("RSC-CH tiene semestres [4, 5, 6] (no [1, 2, 3])", () => {
    const ch = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === "RSC-CH");
    expect(ch?.semestres).toEqual([4, 5, 6]);
  });

  test("RSC-CD aparece en semestre 6 (Cultura Digital III)", () => {
    const cd = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === "RSC-CD");
    expect(cd?.semestres).toContain(6);
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

describe("MCCEMS Structure Validation — Totales y conteo", () => {
  test("Total de UAC es 34 (CF únicamente)", () => {
    expect(UAC_BASE).toHaveLength(34);
  });

  test("Total de progresiones esperadas es 342", () => {
    const total = UAC_BASE.reduce((sum, u) => sum + u.totalProgresionesEsperadas, 0);
    expect(total).toBe(342);
  });

  test("Cada recursoCodigo existe en RECURSOS_SOCIOCOGNITIVOS", () => {
    const rscCodigos = RECURSOS_SOCIOCOGNITIVOS.map((r) => r.codigo);
    for (const uac of UAC_BASE) {
      if (uac.recursoCodigo) {
        expect(rscCodigos).toContain(uac.recursoCodigo);
      }
    }
  });
});
