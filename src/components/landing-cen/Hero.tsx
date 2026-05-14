import Link from "next/link";

export function HeroCEN() {
  return (
    <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
          Plataforma educativa para escuelas y subsistemas de México
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          CEN
          <span className="block text-indigo-300">Campaña Educativa Nacional</span>
        </h1>
        <p className="mt-6 text-lg text-indigo-100 sm:text-xl">
          Soluciones digitales alineadas a los marcos curriculares de la SEP para
          bachillerato, educación básica y formación especializada.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/bachillerato"
            className="rounded-xl bg-white px-8 py-3 text-base font-semibold text-indigo-700 shadow hover:bg-indigo-50"
          >
            Ver CEN Bachillerato
          </Link>
          <Link
            href="#productos"
            className="rounded-xl border border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10"
          >
            Todos los productos
          </Link>
        </div>
      </div>
    </section>
  );
}
