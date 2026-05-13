# Inventario de Progresiones MCCEMS

> **IMPORTANTE:** Las 402 progresiones sembradas en la DB son **todas placeholder**. No tienen contenido pedagógico real. Este documento explica la fuente, el estado, y el plan para conseguir contenido real.

---

## Respuestas a las preguntas del usuario

### ¿Son contenido real del MCCEMS oficial o son placeholders?

**Son 100% placeholders.** El script `scripts/seed-mccems.ts` generó progresiones con:
- `titulo`: `"Progresión N — {nombre UAC}"` (e.g., "Progresión 1 — Lengua y Comunicación I")
- `descripcion`: `null`
- `meta_aprendizaje`: `null`
- `categoria`: `null`
- `subcategoria`: `null`

### ¿Tienen el flag `es_placeholder: true`?

**No.** La columna `es_placeholder` no existe en el schema actual. Este fue un gap vs. el pedido original. Ver BUG-006 en BUGS-DESCUBIERTOS-NOCHE.md para el fix pendiente.

### ¿De qué fuente se sacarían las progresiones reales?

Las progresiones del MCCEMS son documentos técnicos de la Dirección General de Bachillerato (DGB). Los documentos oficiales son:

| Documento | Disponibilidad |
|-----------|----------------|
| Acuerdo 09/08/23 (MCCEMS) — Marco general | Publicado en DOF, accesible |
| Programas de estudio por UAC — DGB | Acceso público limitado; muchos aún en "proceso de validación" |
| Guías de aprendizaje por progresión | No publicadas oficialmente para todos los subsistemas |
| Material piloto (subsistemas CECYT, CCH) | Acceso restringido a docentes del subsistema |

**Situación real:** Los programas de estudio oficiales por UAC tienen las progresiones definidas a nivel de "propósito" y "contenidos", pero no al nivel granular de "meta de aprendizaje" que el sistema necesita. El cliente probablemente tiene acceso a material interno de su institución.

---

## Tabla: estado por UAC

### Semestre 1 (5 UAC, 50 progresiones)

| UAC | Código | # Prog | Fuente actual | Fuente real disponible |
|-----|--------|--------|---------------|------------------------|
| Lengua y Comunicación I | LC-I | 10 | Placeholder | DGB programa LC — requiere adaptación |
| Pensamiento Matemático I | PM-I | 10 | Placeholder | DGB programa PM — requiere adaptación |
| Conciencia Histórica I | CH-I | 10 | Placeholder | DGB programa CH — requiere adaptación |
| Cultura Digital I | CD-I | 8 | Placeholder | No hay programa oficial publicado aún |
| Inglés I | IN-I | 12 | Placeholder | CENNI/UNAM marco de referencia — complejo |

**Total semestre 1:** 50 progresiones (todas placeholder)

### Semestres 2-6 (34 UAC, 352 progresiones)

| Semestre | UAC count | Prog count | Estado |
|----------|-----------|------------|--------|
| 2 | 5 | 50 | Placeholder |
| 3 | 8 | 82 | Placeholder |
| 4 | 8 | 84 | Placeholder |
| 5 | 8 | 72 | Placeholder |
| 6 | 5 | 50 | Placeholder |

> **Nota:** Los semestres 3-6 incluyen UAC de Áreas de Conocimiento (3 áreas × varios semestres). El usuario mencionó "8 UAC del semestre 1" pero el MCCEMS solo tiene 5 UAC en semestre 1 del Currículo Fundamental. Las UAC de área empiezan en semestre 3. Ver DECISIONES-PENDIENTES.md → Decisión 3.

---

## Plan para conseguir progresiones reales

### Prioridad: 2 UAC completas del semestre 1 para el MVP (Semana 2)

El ROADMAP indica "mínimo 2 UAC completas" para la Semana 2. Opciones:

**Opción 1 (recomendada): El cliente provee el material**
- LC-I y PM-I son los recursos más críticos (en todos los semestres)
- El cliente (institución bachillerato) debería tener los programas de estudio internos
- Formato esperado: documento Word/PDF con listado de progresiones y sus metas de aprendizaje
- Tiempo de carga: 1-2h por UAC si el material está ordenado

**Opción 2: Usar el marco oficial DGB adaptado**
- El Acuerdo 09/08/23 define los "Aprendizajes esperados" por campo formativo
- Se pueden mapear a progresiones numeradas con criterios pedagógicos estándar
- Requiere trabajo editorial (½ día por UAC)

**Opción 3: Contenido generado con revisión pedagógica**
- Generar descripciones base con IA + revisión de pedagogo
- Más rápido pero requiere aprobación del cliente

### Pasos inmediatos (antes de Semana 2)

1. **Agregar columna `es_placeholder`** (BUG-006): migración SQL + update seed + update queries
2. **Confirmar con cliente** cuál es la fuente de verdad para las progresiones
3. **Priorizar 2 UAC** (sugerido: LC-I + PM-I) para tener contenido real en demo Semana 2
4. **Crear script de carga** que importe progresiones desde CSV/JSON con `es_placeholder: false`

---

## Script de verificación rápida

```bash
# Ver estado actual de la DB
node -e "
const {createClient} = require('@supabase/supabase-js');
require('dotenv').config({path:'.env.local'});
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{autoRefreshToken:false,persistSession:false}});
sb.from('progresiones').select('id',{count:'exact',head:true}).then(r=>console.log('Total progresiones:', r.count));
sb.from('progresiones').select('id',{count:'exact',head:true}).is('descripcion',null).then(r=>console.log('Sin descripcion (placeholder):', r.count));
"
```

**Resultado esperado:** 402 total, 402 sin descripción (todas placeholder).
