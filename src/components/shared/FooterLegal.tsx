import Link from "next/link";

export function FooterLegal() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: '1px solid rgba(11,37,69,0.10)', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/Logo%20Cen.png"
              alt="CEN"
              style={{ width: 22, height: 22, objectFit: 'contain', opacity: 0.55 }}
            />
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0B2545', margin: 0 }}>
              CEN — Campaña Educativa Nacional
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(11,37,69,0.45)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
            © {year} CEN. Todos los derechos reservados. Plataforma alineada al
            MCCEMS (Acuerdo 09/08/23) y compatible con el Modelo Educativo 2025 de la SEP.
          </p>

          <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px' }}>
            <Link href="/privacidad" style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)', textDecoration: 'none' }}>
              Aviso de Privacidad
            </Link>
            <Link href="/terminos" style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)', textDecoration: 'none' }}>
              Términos de Uso
            </Link>
            <a href="mailto:campanaeducativanacional@gmail.com" style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)', textDecoration: 'none' }}>
              Contacto
            </a>
          </nav>

          <p style={{ fontSize: 11, color: 'rgba(11,37,69,0.35)', margin: 0, textAlign: 'center' }}>
            Protección de datos personales conforme a la LFPDPPP y lineamientos del INAI.
          </p>
        </div>
      </div>
    </footer>
  );
}
