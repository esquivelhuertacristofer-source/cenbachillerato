import { FooterLegal } from "@/components/shared/FooterLegal";

export function FooterCEN() {
  return (
    <footer>
      <div className="bg-cen-navy px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <span className="text-sm font-black text-white">C</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest">CEN</h3>
              </div>
              <p className="mt-3 text-sm text-white/50">
                Campaña Educativa Nacional. Tecnología educativa diseñada para
                las necesidades del sistema educativo público mexicano.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cen-sky/80">
                Productos
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-white/50">
                <li>CEN Bachillerato (MCCEMS)</li>
                <li>CEN Educación Básica (NEM) — Próximamente</li>
                <li>CEN Preescolar — Próximamente</li>
                <li>CEN Laboratorios — Próximamente</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cen-sky/80">
                Alineación institucional
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-white/50">
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
