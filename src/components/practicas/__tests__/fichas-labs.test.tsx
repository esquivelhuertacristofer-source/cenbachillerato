/**
 * Garantías sobre la ficha teórica de los laboratorios.
 *
 * Dos cosas se rompen en silencio y el alumno es quien se entera:
 *  1. Un laboratorio que se registra sin ficha, o con la ficha en el archivo
 *     pero sin montar el cajón: la teoría existe y nadie la ve.
 *  2. Una ficha regenerada contra una base vacía: el cajón abre en blanco.
 * Estas pruebas leen los archivos reales, así que fallan en cuanto pasa.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FichaTeorica, type FichaTeoricaData } from "@/components/practicas/labs/_ficha";
import { LabImagenProvider } from "@/components/practicas/lab-imagen-context";
import { mejorImagenDeLab } from "@/lib/practicas/lab-imagenes";

const RAIZ = process.cwd();
const LABS_DIR = resolve(RAIZ, "src/components/practicas/labs");

/** slug → componente, leído del objeto PRACTICAS del registry. */
function registro(): Map<string, string> {
  const src = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");
  const bloque = src.slice(src.indexOf("export const PRACTICAS"));
  const out = new Map<string, string>();
  for (const m of bloque.matchAll(/^\s{2}"?([a-z0-9][a-z0-9-]*)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
    if (m[1] && m[2]) out.set(m[1], m[2]);
  }
  return out;
}

/** componente → ruta del archivo, leída de los `dynamic(() => import(...))`. */
function archivos(): Map<string, string> {
  const src = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");
  const out = new Map<string, string>();
  for (const m of src.matchAll(/const (\w+) = dynamic\(\(\) => import\("\.\/labs\/([\w-]+)"\)/g)) {
    if (m[1] && m[2]) out.set(m[1], resolve(LABS_DIR, `${m[2]}.tsx`));
  }
  return out;
}

const PRACTICAS = registro();
const ARCHIVOS = archivos();
const SLUGS = [...PRACTICAS.keys()];

describe("ficha teórica de los laboratorios", () => {
  it("hay laboratorios registrados", () => {
    expect(SLUGS.length).toBeGreaterThan(100);
  });

  it.each(SLUGS)("%s monta la FichaTeorica en su shell", (slug) => {
    const archivo = ARCHIVOS.get(PRACTICAS.get(slug)!);
    expect(archivo).toBeDefined();
    const src = readFileSync(archivo!, "utf8");
    expect(src).toContain('from "./_ficha"');
    expect(src).toMatch(/<FichaTeorica\b/);
  });

  it("cada archivo -ficha.ts trae marco teórico y glosario o conceptos", () => {
    const fichas = readdirSync(LABS_DIR).filter((f) => f.endsWith("-ficha.ts"));
    expect(fichas.length).toBeGreaterThan(100);
    const vacias: string[] = [];
    for (const f of fichas) {
      const src = readFileSync(resolve(LABS_DIR, f), "utf8");
      const marcoVacio = /marcoTeorico:\s*\[\s*\]/.test(src);
      const sinTerminos = /conceptos:\s*\[\s*\],[\s\S]{0,40}glosario:\s*\[\s*\],/.test(src);
      if (marcoVacio || sinTerminos) vacias.push(f);
    }
    expect(vacias).toEqual([]);
  });

  it("ninguna ficha apunta a un archivo de datos inexistente", () => {
    const rotos: string[] = [];
    for (const [slug, componente] of PRACTICAS) {
      const src = readFileSync(ARCHIVOS.get(componente)!, "utf8");
      for (const m of src.matchAll(/from\s+"\.\/([\w-]*-ficha)"/g)) {
        if (!existsSync(resolve(LABS_DIR, `${m[1]}.ts`))) rotos.push(`${slug} → ${m[1]}.ts`);
      }
    }
    expect(rotos).toEqual([]);
  });
});

const DATOS: FichaTeoricaData = {
  ancla: "CD-I-P01-A1 · Prueba",
  marcoTeorico: ["Un párrafo de marco teórico."],
  objetivos: ["Un objetivo."],
  materiales: [],
  conceptos: [],
  glosario: [{ termino: "Hardware", definicion: "Lo que se puede tocar." }],
};

describe("FichaTeorica y la carátula del laboratorio", () => {
  it("no dibuja imagen fuera de una práctica", () => {
    render(<FichaTeorica data={DATOS} accent="#5BC8FF" rgba="91,200,255" />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("dibuja la carátula que provee la práctica", () => {
    render(
      <LabImagenProvider valor={{ src: "/media/sem1/labs/hardware-software.webp", alt: "Hardware y software" }}>
        <FichaTeorica data={DATOS} accent="#5BC8FF" rgba="91,200,255" />
      </LabImagenProvider>
    );
    const img = screen.getByRole("img", { name: "Hardware y software" });
    expect(img).toHaveAttribute("src", "/media/sem1/labs/hardware-software.webp");
  });

  it("la imagen sólo acompaña al marco teórico, no al glosario", async () => {
    render(
      <LabImagenProvider valor={{ src: "/labs/materia.webp", alt: "Materia" }}>
        <FichaTeorica data={DATOS} accent="#5BC8FF" rgba="91,200,255" />
      </LabImagenProvider>
    );
    expect(screen.getByRole("img", { name: "Materia" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /Glosario/ }));
    expect(screen.queryByRole("img", { name: "Materia" })).toBeNull();
  });
});

describe("persistencia de estrellas de los laboratorios", () => {
  const shells = readdirSync(LABS_DIR).filter((f) => f.startsWith("Lab") && f.endsWith(".tsx"));

  it("ningún laboratorio llama a guardarEstrellas por su cuenta", () => {
    // La escritura directa no relee la marca de la base: el alumno que gana 3★
    // en un equipo las perdía en otro. `useEstrellas` guarda Y rehidrata.
    const directos = shells.filter((f) =>
      readFileSync(resolve(LABS_DIR, f), "utf8").includes("app/actions/guardarEstrellas")
    );
    expect(directos).toEqual([]);
  });

  it("todo laboratorio con reto persistido usa el hook useEstrellas", () => {
    const sinHook = shells.filter((f) => {
      const src = readFileSync(resolve(LABS_DIR, f), "utf8");
      return src.includes("RETO_KEY") && !src.includes("useEstrellas");
    });
    expect(sinHook).toEqual([]);
  });
});

describe("carátula de cada laboratorio", () => {
  it("la imagen de todo lab registrado existe en disco", () => {
    // La ficha y el encabezado la dibujan sin red de seguridad: un slug nuevo
    // sin archivo se ve como un icono de imagen rota dentro de la práctica.
    const rotas: string[] = [];
    for (const slug of SLUGS) {
      const src = mejorImagenDeLab(slug);
      if (!existsSync(resolve(RAIZ, "public", src.replace(/^\//, "")))) rotas.push(`${slug} → ${src}`);
    }
    expect(rotas).toEqual([]);
  });
});
