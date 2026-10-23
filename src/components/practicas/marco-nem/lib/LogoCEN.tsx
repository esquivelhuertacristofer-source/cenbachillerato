// =============================================================================
// NEM Plataforma — Logotipo CEN en vector
// =============================================================================
// Redibujado a mano sobre el cartel oficial (no existe archivo del logo): «C» y
// «N» en azul, la «E» en verde partida en dos piezas, barra vertical y
// «CAMPAÑA / EDUCATIVA / NACIONAL» en tres líneas. `compacto` deja solo CEN.
// `tinta` cambia el color de la leyenda para ponerla sobre fondo oscuro.
// =============================================================================
import { CEN } from './marca-cen'

export function LogoCEN({
  alto = 40,
  compacto = false,
  tinta = CEN.navy,
  azul = CEN.azul,
  className,
}: {
  alto?: number
  compacto?: boolean
  tinta?: string
  /** Color de la C y la N (sobre azul oscuro conviene blanco). */
  azul?: string
  className?: string
}) {
  const ancho = compacto ? 600 : 1120
  return (
    <svg
      viewBox={`50 45 ${ancho} 262`}
      height={alto}
      width={(alto * ancho) / 262}
      role="img"
      aria-label="CEN · Campaña Educativa Nacional"
      className={className}
      style={{ display: 'block', flex: 'none' }}
    >
      {/* C */}
      <path d="M231.9 117.5 A86 86 0 1 0 231.9 232.5" fill="none" stroke={azul} strokeWidth={68} />
      {/* E: barra de arriba suelta + bloque de abajo */}
      <g fill={CEN.verdeLogo}>
        <rect x={272} y={58} width={162} height={62} rx={10} />
        <rect x={272} y={144} width={140} height={58} rx={10} />
        <rect x={272} y={144} width={62} height={150} rx={10} />
        <rect x={272} y={236} width={162} height={58} rx={10} />
      </g>
      {/* N */}
      <g fill={azul}>
        <rect x={456} y={58} width={58} height={236} rx={9} />
        <rect x={582} y={58} width={58} height={236} rx={9} />
        <polygon points="460,58 512,58 636,294 584,294" />
      </g>
      {!compacto && (
        <>
          <rect x={708} y={60} width={4} height={232} fill={tinta} opacity={0.85} />
          <g fill={tinta} fontFamily={CEN.fuente} fontWeight={700} fontSize={50} letterSpacing={4}>
            <text x={776} y={110}>CAMPAÑA</text>
            <text x={776} y={186}>EDUCATIVA</text>
            <text x={776} y={262}>NACIONAL</text>
          </g>
        </>
      )}
    </svg>
  )
}
