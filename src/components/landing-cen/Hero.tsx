import Link from "next/link";

export function HeroCEN() {
  return (
    <section className="bg-gradient-to-br from-cen-navy via-cen-navy-2 to-cen-blue px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
          Plataforma educativa para escuelas y subsistemas de México
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          CEN
          <span className="block text-cen-sky">Campaña Educativa Nacional</span>
        </h1>
        <p className="mt-6 text-lg text-white/70 sm:text-xl">
          Soluciones digitales alineadas a los marcos curriculares de la SEP para
          bachillerato, educación básica y formación especializada.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/bachillerato"
            className="rounded-2xl bg-white px-8 py-3 text-base font-bold uppercase tracking-widest text-cen-navy shadow hover:bg-cen-cool transition-all duration-300"
          >
            Ver CEN Bachillerato
          </Link>
          <Link
            href="#productos"
            className="rounded-2xl border border-white/20 px-8 py-3 text-base font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all duration-300"
          >
            Todos los productos
          </Link>
        </div>
      </div>
    </section>
  );
}
