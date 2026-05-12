import { FooterLegal } from "@/components/shared/FooterLegal";

export function FooterCEN() {
  return (
    <footer>
      <div className="bg-indigo-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-bold">CEN</h3>
              <p className="mt-3 text-sm text-indigo-200">
                Campaña Educativa Nacional. Tecnología educativa diseñada para
                las necesidades del sistema educativo público mexicano.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
                Productos
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-indigo-200">
                <li>CEN Bachillerato (MCCEMS)</li>
                <li>CEN Educación Básica (NEM) — Próximamente</li>
                <li>CEN Preescolar — Próximamente</li>
                <li>CEN Laboratorios — Próximamente</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
                Alineación institucional
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-indigo-200">
                <li>SEP — Secretaría de Educación Pública</li>
                <li>MCCEMS — Acuerdo 09/08/23</li>
                <li>Modelo Educativo 2025</li>
                <li>LFPDPPP — Protección de datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <FooterLegal />
    </footer>
  );
}
