import type { Metadata } from "next";
import Link from "next/link";
import { FooterLegal } from "@/components/shared/FooterLegal";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — CEN Bachillerato",
};

export const revalidate = 3600;

export default function PrivacidadPage() {
  return (
    <>
      <header style={{ borderBottom: '1px solid rgba(11,37,69,0.10)', background: '#0B2545', padding: '14px 24px' }}>
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/Logo%20Cen.png" alt="CEN" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>CEN Bachillerato</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900">Aviso de Privacidad Integral</h1>
          <p className="mt-2 text-gray-500">
            CEN — Campaña Educativa Nacional · Versión 1.0 · Fecha de última actualización: 9 de junio de 2026
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <p>
                El presente Aviso de Privacidad Integral se emite en cumplimiento de la Ley Federal de
                Protección de Datos Personales en Posesión de los Particulares (en adelante, la
                &quot;LFPDPPP&quot;), su Reglamento y los Lineamientos del Aviso de Privacidad vigentes en
                los Estados Unidos Mexicanos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">I. Identidad y domicilio del Responsable</h2>
              <p className="mt-3">
                CEN — Campaña Educativa Nacional (en adelante, &quot;CEN&quot; o &quot;el Responsable&quot;) es
                responsable del tratamiento, uso y protección de sus datos personales. Para todos los efectos
                relacionados con el presente aviso, el Responsable señala como medio de contacto el correo
                electrónico{" "}
                <a href="mailto:campanaeducativanacional@gmail.com" style={{ color: '#1E40AF', textDecoration: 'underline' }}>
                  campanaeducativanacional@gmail.com
                </a>
                , a través del cual también pondrá a disposición del titular su domicilio físico cuando
                este sea requerido para el ejercicio de derechos o el cumplimiento de obligaciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">II. Datos personales que se recaban</h2>
              <p className="mt-3">CEN recaba las siguientes categorías de datos personales:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>Datos de identificación:</strong> nombre completo y correo electrónico.</li>
                <li><strong>Datos académicos:</strong> semestre, área de conocimiento, institución educativa, grupo y avance curricular.</li>
                <li><strong>Datos de uso de la plataforma:</strong> progresiones y actividades realizadas, calificaciones de práctica, tiempo de sesión y registros de acceso.</li>
                <li><strong>Datos de consentimiento:</strong> registro de aceptación del Aviso de Privacidad y de los Términos y Condiciones, con marca de tiempo.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                CEN <strong>no recaba datos personales sensibles</strong> (de salud, biométricos, genéticos,
                origen racial o étnico, creencias religiosas, afiliación sindical, opiniones políticas o
                preferencia sexual).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">III. Datos personales de menores de edad</h2>
              <p className="mt-3">
                CEN es una plataforma educativa dirigida a estudiantes de educación media superior, por lo que
                una parte de sus usuarios son <strong>menores de edad</strong>. El Responsable reconoce el interés
                superior de la niñez y adopta medidas reforzadas para la protección de sus datos personales.
              </p>
              <p className="mt-3">
                El registro y la creación de cuentas de estudiantes menores de edad se realiza{" "}
                <strong>a través de la institución educativa</strong> en la que se encuentran inscritos, la cual
                actúa como intermediaria y recaba, conforme a sus propios procesos, el consentimiento de quienes
                ejercen la patria potestad o tutela. Al inscribir a un menor en la plataforma, la institución
                educativa manifiesta contar con dicho consentimiento. Los padres, madres o tutores pueden ejercer,
                en representación del menor, todos los derechos previstos en este aviso a través del correo de
                contacto señalado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">IV. Finalidades del tratamiento</h2>
              <p className="mt-3">
                <strong>Finalidades primarias</strong> (necesarias para la prestación del servicio):
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Crear y gestionar la cuenta de usuario, así como autenticar el acceso a la plataforma.</li>
                <li>Prestar el servicio educativo digital y personalizar la experiencia de aprendizaje.</li>
                <li>Dar seguimiento al progreso curricular y generar reportes para docentes e instituciones.</li>
                <li>Administrar grupos, docentes, alumnos y permisos por institución educativa.</li>
                <li>Atender solicitudes de soporte y garantizar la seguridad e integridad de la plataforma.</li>
                <li>Cumplir con obligaciones legales, contractuales y regulatorias aplicables.</li>
              </ul>
              <p className="mt-4">
                <strong>Finalidades secundarias</strong> (no necesarias para el servicio, pero que nos permiten
                mejorarlo):
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Elaborar estadísticas y análisis agregados y disociados para mejorar los contenidos y la plataforma.</li>
                <li>Evaluar la calidad del servicio educativo.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-600">
                Si usted no desea que sus datos personales sean tratados para las finalidades secundarias, puede
                manifestar su negativa enviando un correo a{" "}
                <a href="mailto:campanaeducativanacional@gmail.com" style={{ color: '#1E40AF', textDecoration: 'underline' }}>
                  campanaeducativanacional@gmail.com
                </a>{" "}
                indicando su nombre y la cuenta asociada. La negativa a las finalidades secundarias no será motivo
                para negarle el servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">V. Transferencias de datos</h2>
              <p className="mt-3">
                Sus datos personales <strong>no serán transferidos a terceros</strong> sin su consentimiento, salvo
                en los supuestos previstos en el artículo 37 de la LFPDPPP, que no requieren consentimiento. En
                particular, sus datos podrán ser comunicados a:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>La institución educativa o subsistema de bachillerato que contrató el servicio, para fines de seguimiento académico.</li>
                <li>Autoridades competentes, cuando exista un requerimiento debidamente fundado y motivado.</li>
                <li>Proveedores de infraestructura tecnológica que actúan como encargados, bajo estrictas obligaciones contractuales de confidencialidad y seguridad, sin que ello constituya una transferencia que requiera consentimiento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">VI. Derechos ARCO y revocación del consentimiento</h2>
              <p className="mt-3">
                Usted tiene derecho a <strong>Acceder</strong> a sus datos personales, <strong>Rectificarlos</strong>{" "}
                cuando sean inexactos, <strong>Cancelarlos</strong> cuando considere que no se requieren para las
                finalidades señaladas y <strong>Oponerse</strong> a su tratamiento (Derechos ARCO). Asimismo, puede{" "}
                <strong>revocar el consentimiento</strong> que nos hubiere otorgado, en la medida en que la ley lo
                permita.
              </p>
              <p className="mt-3">
                Para ejercer cualquiera de estos derechos, envíe su solicitud a{" "}
                <a href="mailto:campanaeducativanacional@gmail.com" style={{ color: '#1E40AF', textDecoration: 'underline' }}>
                  campanaeducativanacional@gmail.com
                </a>
                . Su solicitud deberá contener al menos:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Nombre del titular y medio para comunicarle la respuesta.</li>
                <li>Documentos que acrediten su identidad (o la representación legal en el caso de menores).</li>
                <li>Descripción clara de los datos personales y del derecho que desea ejercer.</li>
                <li>Cualquier elemento que facilite la localización de los datos.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                Daremos respuesta a su solicitud en un plazo máximo de <strong>20 días hábiles</strong> y, de
                resultar procedente, la haremos efectiva dentro de los <strong>15 días hábiles</strong> siguientes,
                conforme a los artículos 32 a 35 de la LFPDPPP. El ejercicio de estos derechos es gratuito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">VII. Limitación del uso y divulgación</h2>
              <p className="mt-3">
                Usted puede limitar el uso o divulgación de sus datos personales enviando su solicitud al correo de
                contacto. CEN mantiene controles internos para restringir el acceso a los datos únicamente al
                personal y a los sistemas que los requieren para las finalidades descritas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">VIII. Uso de cookies y tecnologías de rastreo</h2>
              <p className="mt-3">
                La plataforma utiliza cookies y tecnologías similares estrictamente necesarias para mantener la
                sesión iniciada y garantizar el funcionamiento seguro del servicio. No se emplean cookies con fines
                publicitarios ni de perfilamiento comercial. Usted puede deshabilitar las cookies desde la
                configuración de su navegador, considerando que ello puede impedir el inicio de sesión y el uso de la
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">IX. Medidas de seguridad</h2>
              <p className="mt-3">
                CEN ha implementado medidas de seguridad administrativas, técnicas y físicas para proteger los datos
                personales contra daño, pérdida, alteración, destrucción o acceso, uso o tratamiento no autorizado.
                Entre ellas: cifrado de las comunicaciones, autenticación de usuarios, control de acceso por roles,
                aislamiento de la información por institución educativa y resguardo de las credenciales mediante
                técnicas criptográficas. Las contraseñas iniciales son temporales y deben ser modificadas por el
                usuario en su primer inicio de sesión.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">X. Plazo de conservación</h2>
              <p className="mt-3">
                Sus datos personales se conservarán durante el tiempo en que la cuenta permanezca activa y mientras
                subsista la relación con la institución educativa, así como por los plazos adicionales necesarios para
                cumplir obligaciones legales. Una vez concluidas las finalidades, los datos serán bloqueados y
                posteriormente cancelados conforme a la normativa aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">XI. Cambios al Aviso de Privacidad</h2>
              <p className="mt-3">
                El presente aviso puede ser modificado en cualquier momento para atender novedades legislativas,
                políticas internas o nuevos requerimientos. Cualquier modificación se hará de su conocimiento a través
                de la propia plataforma y/o por correo electrónico. La versión vigente estará siempre disponible en
                esta página.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">XII. Autoridad de protección de datos</h2>
              <p className="mt-3">
                Si usted considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir
                ante la autoridad competente en materia de protección de datos personales en posesión de los
                particulares para presentar la queja o denuncia correspondiente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">XIII. Consentimiento</h2>
              <p className="mt-3">
                Al registrarse y utilizar la plataforma, o al aceptar el presente aviso a través de los mecanismos
                dispuestos para ello, usted —o quien ejerce la patria potestad o tutela, tratándose de menores de
                edad— manifiesta haber leído, entendido y aceptado los términos de este Aviso de Privacidad y otorga
                su consentimiento para el tratamiento de sus datos personales conforme a las finalidades primarias
                aquí descritas.
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterLegal />
    </>
  );
}
