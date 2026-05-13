# Bugs P2 — Para Decisión del Cliente

> Estos issues son menores (P2) y requieren una decisión de negocio o confirmar en un smoke test. No bloquean el uso de la plataforma.

---

## BUG-008: `wrangler.toml` — compatibility_date desactualizado

~~**Síntoma:** El build de Cloudflare Workers produce advertencia de compatibility_date antiguo.~~

**Status:** ✅ Resuelto (2026-05-12) — `compatibility_date` actualizado de `2025-05-12` a `2026-05-12` en `wrangler.toml`.

---

## BUG-009: Admin/grupos puede mostrar "Docente sin perfil"

**Síntoma potencial:** La página `admin/grupos` muestra "Docente sin perfil" si el usuario docente no tiene un perfil con `role = 'teacher'` en la tabla `profiles`.

**Causa:** La query en `admin/grupos/page.tsx` mapea `g.id_docente` contra perfiles de la tabla `profiles`. Si el trigger `on_auth_user_created` falló al crear el perfil (o el perfil tiene un rol incorrecto), el `docenteMap` retorna `undefined`.

**Verificación requerida en smoke test:**
```sql
-- En Supabase SQL Editor:
SELECT id, email, role, full_name FROM profiles WHERE role = 'teacher';
-- Debe mostrar al menos el docente demo
```

**Decisión:**
- Si el docente demo tiene perfil correcto → no hay acción necesaria.
- Si falta → insertar manualmente el perfil o re-ejecutar el trigger.

---

## BUG-010: `hub/layout.tsx` verifica rol que el perfil ya garantiza

**Síntoma:** `hub/layout.tsx` redirige a `/dashboard/docente` o `/admin/escuelas` si el rol del usuario no es `student`. Sin embargo, para llegar al hub un usuario debe haber iniciado sesión con una cuenta de alumno — los docentes y admins tienen sus propias rutas protegidas.

**Causa:** La verificación de rol en el layout es defensiva pero genera código de mantenimiento doble si los roles cambian.

**Impacto:** Ninguno funcional. Es código redundante que puede confundir al leer el layout.

**Opciones:**
1. **Mantener** la verificación (defensa en profundidad, buena práctica de seguridad).
2. **Eliminar** la verificación de rol en el layout y confiar en que el login redirige al destino correcto según el rol.

**Recomendación:** Mantener opción 1. La verificación de rol en el layout es una segunda línea de defensa válida contra acceso accidental a rutas incorrectas.

**Decisión:** Confirmar con el cliente si se prefiere simplificar el layout o mantener la defensa en profundidad.
