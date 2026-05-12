# Manifiesto Arquitectural — CEN Bachillerato

*Adaptado de los manifiestos de CEN Labs y CEN Educación Financiera.*

---

## Por qué existe este documento

Los proyectos CEN anteriores acumularon deuda técnica evitable. Este manifiesto documenta las decisiones de diseño no negociables y los anti-patrones que están prohibidos desde el día uno. Cualquier PR que viole estas reglas debe ser rechazado.

---

## Reglas no negociables

### 1. TypeScript strict siempre
```json
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitReturns": true,
"exactOptionalPropertyTypes": true
```
No existe `// @ts-ignore`, `any`, ni `ignoreBuildErrors`. Si TypeScript se queja, el problema está en el código, no en TypeScript.

### 2. CI bloqueante desde el día uno
El pipeline `tsc + eslint + jest + build` bloquea merges a main. Un test que falla es una regresión que no se despliega. No hay excepciones.

### 3. Un cliente Supabase por contexto, singleton
```ts
// Browser: singleton via closure
let client: SupabaseClient | undefined
export function getSupabaseBrowser() {
  if (client) return client
  client = createBrowserClient(url, key)
  return client
}
```
No crear instancias ad-hoc. No `createClient()` sueltos en componentes.

### 4. Operaciones DB: siempre await + try/catch + log
```ts
// Correcto
try {
  const { data, error } = await supabase.from('tabla').select(...)
  if (error) throw error
  return data
} catch (err) {
  console.error('[contexto] operación error:', err)
  throw err
}
```

### 5. Server Components por defecto
`"use client"` solo cuando sea estrictamente necesario: event handlers, hooks de estado, APIs del browser. Los Server Components no tienen acceso al store de Zustand.

### 6. Params async en Next.js 16
```tsx
// SIEMPRE así en Next.js 16
type Props = { params: Promise<{ id: string }> }
export default async function Page({ params }: Props) {
  const { id } = await params
}
```

### 7. Datos estáticos en TypeScript, no en fetch
Los datos del MCCEMS son constantes. Vivirán en `src/lib/mccems/` como arrays TypeScript. No se hace fetch a la DB para renderizar la estructura curricular en el frontend.

### 8. RLS es el guardián, no el código de aplicación
La autorización real ocurre en PostgreSQL vía RLS. El código de aplicación puede (y debe) verificar roles para UX, pero nunca como única capa de seguridad.

### 9. Multi-tenant: escuela es el límite de visibilidad
Ningún usuario puede ver datos de otra escuela. Las funciones `get_my_escuela_id()` y `get_my_role()` son SECURITY DEFINER para evitar recursión en RLS.

### 10. No tocar recuperación de contraseña
La recuperación y cambio de contraseña la administra el usuario directamente desde Supabase Dashboard o el email de recuperación. No se implementa flujo de reset en la app.

---

## Anti-patrones documentados (lecciones aprendidas)

### De CEN Educación Financiera
- **Problema**: múltiples instancias de `createBrowserClient()` causaban sesiones inconsistentes.
- **Solución**: singleton `getSupabaseBrowser()` con closure.

### De CEN Labs
- **Problema**: `ignoreBuildErrors: true` en producción. Los errores de tipos llegaban a producción silenciosamente.
- **Solución**: prohibido en tsconfig. El build falla si hay errores de tipos.

- **Problema**: middleware de autenticación complejo que causaba redirects infinitos.
- **Solución**: auth en Server Components con `getUser()` + `redirect()`, no middleware.

- **Problema**: `any` proliferó cuando el equipo tenía prisa. Luego era imposible refactorizar.
- **Solución**: `strict: true` + `noImplicitAny` hace imposible commitear `any`.

---

## Lo que se puede hacer diferente (trade-offs conocidos)

- **Turbopack vs Webpack**: usamos webpack (`--webpack`) porque tenemos conocimiento del ecosistema. Turbopack es más rápido en dev pero puede generar sorpresas.
- **Supabase vs otro backend**: la integración auth + DB + RLS de Supabase acelera el MVP. En escala grande podría ser un cuello de botella, pero no es el problema de hoy.
- **Next.js 16 con React 19**: versión muy reciente. Puede haber edge cases. La regla es: leer los docs antes de escribir código que toque Server Actions, caching, o Suspense.

---

## Proceso de revisión

Antes de hacer PR, verificar:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run test` pasa
- [ ] `npm run build` pasa (con `--webpack`)
- [ ] No hay `any`, `@ts-ignore`, ni `console.log` de debug en código de producción
- [ ] No hay secretos hardcodeados
- [ ] Los Server Components no usan hooks de React
- [ ] Los Client Components tienen `"use client"` al inicio
