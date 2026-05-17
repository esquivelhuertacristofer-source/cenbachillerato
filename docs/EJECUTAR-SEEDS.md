# Ejecutar Seeds del Semestre 1 — Propósitos Formativos Oficiales 2025

## Estado actual en DB

Todos los seeds del Semestre 1 están **escritos con contenido oficial** (`es_placeholder=false`) pero aún no se han ejecutado contra Supabase. La DB tiene actualmente 185 progresiones placeholder.

Verificar estado antes de ejecutar:
```sql
SELECT es_placeholder, COUNT(*) FROM progresiones GROUP BY es_placeholder;
```
Resultado esperado antes: `true: 185, false: 0`
Resultado esperado después: `true: ~137, false: 48`

---

## Requisitos previos

- Archivo `.env.local` con `SUPABASE_SERVICE_ROLE_KEY` configurado
- Node.js 20+
- Desde la raíz del proyecto: `c:\...\cen-bachillerato`

---

## Orden de ejecución

Ejecutar en este orden (cada uno es idempotente — se puede correr más de una vez sin problemas):

```bash
npx tsx scripts/seed-lci.ts
npx tsx scripts/seed-pmi.ts
npx tsx scripts/seed-ini.ts
npx tsx scripts/seed-cdi.ts
npx tsx scripts/seed-csi.ts
npx tsx scripts/seed-pfhi.ts
npx tsx scripts/seed-cneyti.ts
```

| Script | UAC | Propósitos | Fuente oficial |
|--------|-----|------------|----------------|
| `seed-lci.ts` | LC-I | 8 | `08-LENGUA-COMUNICACION.md` |
| `seed-pmi.ts` | PM-I | 7 | `05-PENSAMIENTO-MATEMATICO.md` |
| `seed-ini.ts` | IN-I | 8 | `07-INGLES.md` |
| `seed-cdi.ts` | CD-I | 8 | `02-CULTURA-DIGITAL.md` |
| `seed-csi.ts` | CS-I | 4 | `06-CIENCIAS-SOCIALES.md` |
| `seed-pfhi.ts` | PFH-I | 5 | `04-PENSAMIENTO-FILOSOFICO.md` |
| `seed-cneyti.ts` | CNEYT-I | 8 | `03-CIENCIAS-NATURALES.md` |

**Total: 48 propósitos oficiales en 7 UAC del Semestre 1**

---

## Verificación post-ejecución

Correr en el SQL editor de Supabase:

```sql
-- Verificar conteo general
SELECT es_placeholder, COUNT(*) FROM progresiones GROUP BY es_placeholder;

-- Verificar por UAC del Semestre 1
SELECT u.codigo, COUNT(p.id) as total, 
       SUM(CASE WHEN p.es_placeholder = false THEN 1 ELSE 0 END) as oficiales
FROM uac u
JOIN progresiones p ON p.uac_id = u.id
WHERE u.semestre = 1
GROUP BY u.codigo
ORDER BY u.codigo;
```

Resultado esperado después de los seeds:
- LC-I: 8 oficiales
- PM-I: 7 oficiales
- IN-I: 8 oficiales
- CD-I: 8 oficiales
- CS-I: 4 oficiales
- PFH-I: 5 oficiales
- CNEYT-I: 8 oficiales

---

## Si algún seed falla

1. Verificar que `.env.local` tenga `SUPABASE_SERVICE_ROLE_KEY` correcto
2. Verificar que la UAC existe en DB: en Supabase Table Editor → tabla `uac` → buscar el código
3. Los seeds tienen `upsert` por `codigo` — si ya existe el propósito, lo actualiza sin error
4. Si la UAC no existe, el seed lanza: `UAC [código] no encontrada. Ejecuta primero seed-mccems.ts`
   - Solución: correr `npx tsx scripts/seed-mccems.ts` primero

---

## Nota sobre Semestres 2–6

Los seeds de Semestres 2–6 todavía tienen `es_placeholder=true`. Están pendientes de reescritura con contenido oficial. Ver `docs/migracion-2025/MIGRACION-COMPLETADA.md` para la tabla completa de lo pendiente.
