import { ProductoCard, type ProductoCEN } from "./ProductoCard";

const PRODUCTOS: ProductoCEN[] = [
  {
    id: "bachillerato",
    nombre: "Bachillerato (MCCEMS)",
    descripcion: "Plataforma alineada al Marco Curricular Común de la EMS. Compatible con DGB, DGETI, DGETA, CONALEP, CECYT y más.",
    icono: "🎓",
    color: "bg-indigo-100",
    estado: "disponible",
    href: "/bachillerato",
  },
  {
    id: "educacion-basica",
    nombre: "Educación Básica (NEM)",
    descripcion: "Plataforma alineada a la Nueva Escuela Mexicana para primaria y secundaria.",
    icono: "📖",
    color: "bg-blue-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "preescolar",
    nombre: "Preescolar",
    descripcion: "Herramientas digitales para el desarrollo integral en educación inicial y preescolar.",
    icono: "🌱",
    color: "bg-green-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "primaria",
    nombre: "Primaria",
    descripcion: "Recursos pedagógicos para primaria alineados al currículo de la SEP.",
    icono: "✏️",
    color: "bg-yellow-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "secundaria",
    nombre: "Secundaria",
    descripcion: "Plataforma para secundaria general, técnica y telesecundaria.",
    icono: "🏫",
    color: "bg-orange-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "educacion-financiera",
    nombre: "Educación Financiera",
    descripcion: "Formación en cultura financiera para jóvenes y adultos en contextos escolares.",
    icono: "💰",
    color: "bg-emerald-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "laboratorios",
    nombre: "Laboratorios de Ciencias",
    descripcion: "Simuladores y guías para laboratorios de biología, química y física.",
    icono: "🔬",
    color: "bg-teal-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "idiomas",
    nombre: "Idiomas",
    descripcion: "Plataforma de aprendizaje de inglés y otras lenguas para el sistema educativo.",
    icono: "🌐",
    color: "bg-red-100",
    estado: "proximamente",
    href: "#",
  },
  {
    id: "robotica",
    nombre: "Robótica",
    descripcion: "Introducción al pensamiento computacional y robótica educativa.",
    icono: "🤖",
    color: "bg-violet-100",
    estado: "proximamente",
    href: "#",
  },
];

export function ProductosGrid() {
  return (
    <section id="productos" className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Nuestros Productos Educativos
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Soluciones digitales para cada nivel y modalidad del sistema educativo mexicano.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </section>
  );
}
