# Runbook — dejar los 240 videos con una sola voz

**Estado:** preparado, **no ejecutado**. Falta la decisión de arrancarlo.

## El problema en una línea

Los 211 videos viejos están narrados con XTTS-v2 clonando a *Alison Dietlinde*
—una locutora inglesa leyendo español—; los 29 nuevos y todo el botón "Escuchar"
de la plataforma usan `es-MX-DaliaNeural`. Hoy el producto tiene dos voces.

## Por qué no es una preferencia

`TTS` (el paquete de XTTS) **ya no está instalado en esta máquina**:

```
$ python -c "import TTS"
ModuleNotFoundError: No module named 'TTS'
```

torch y CUDA sí están, pero el modelo no. Cualquier video nuevo va con Dalia por
fuerza. La única forma de tener una sola voz es re-narrar los 211 viejos; la
alternativa es aceptar dos voces de forma permanente.

## Lo que se gana, medido

| | XTTS (211 videos) | Dalia (29 nuevos) |
|---|---|---|
| ritmo, mediana | 130 palabras/min | **151** |
| rango | 65 – 190 | **118 – 181** |
| duración misma escena | 113.4 s | **91.3 s** (−20%) |

Lo importante no es que sea más rápida: es que es **pareja**. XTTS tiene clips
que se arrastran a 65 palabras por minuto. En una plataforma de 240 videos, la
dispersión se nota más que la velocidad.

Además desaparecen la dependencia de GPU y la reja de estabilidad de F0
(`voz_util.generar_estable` medía el tono de cada clip y descartaba los que se
salían de banda, hasta cuatro intentos por frase — existía porque el modelo
fallaba).

## Lo que cuesta, medido

| paso | tiempo | notas |
|---|---|---|
| re-narrar 1088 clips | ~50 min | red, concurrencia 6, sin GPU |
| re-renderizar 211 videos | **~5.3 h** | 80–90 s por video, medido hoy |
| re-subir ~6.5 GB a R2 | ~30 min | medido 3.9 MB/s |
| **total** | **~6.5 h** | casi todo desatendido |

Durante el render la máquina queda ocupada (Chromium con `concurrency=14`).

## Riesgo y cómo se anula

**El disco no permite un respaldo local.** `C:` tiene 6.4 GB libres de 931 GB y
`video-pipeline/out/` ocupa 6.6 GB: no cabe una copia de los MP4 viejos.

Por eso el plan **no sobrescribe nada**. Los videos nuevos se rendrizan y se
suben con otro nombre (`<slug>-v2.mp4`) y lo único que cambia en la base de datos
es `contenido.url_video`. Los 211 objetos viejos siguen en R2 intactos.

- **Rollback** = volver a poner las URLs sin `-v2`. Segundos, sin re-subir nada.
- **Costo extra** = ~6.5 GB de almacenamiento en R2 ≈ 0.10 USD al mes, hasta que
  se borren los viejos.
- **El disco local se mantiene acotado** procesando por lotes: se renderiza el
  lote, se sube, se verifica y se borra el `-v2` local antes del siguiente.

## Procedimiento

```bash
# 1. Re-narrar TODO con Dalia (--rehacer reescribe los WAV de XTTS).
cd video-pipeline/tts
python generar-narracion-dalia.py --rehacer --todos

# 2. Regenerar Root.tsx (las duraciones cambiaron, los manifests también).
cd ../remotion
node scripts/generate-root.mjs

# 3. Renderizar por lotes a nombres -v2, subir, verificar y limpiar.
#    (repetir por lotes de ~20 para no llenar el disco)
node scripts/render-batch.mjs ../out CD-I-P01-VID01=cd-i-p01-vid01-v2 ...
cd ../../cen-bachillerato
npx tsx scripts/subir-videos-r2.ts --solo=cd-i-p01-vid01-v2 ...
npx tsx scripts/subir-videos-r2.ts --solo=... --verificar
rm ../video-pipeline/out/*-v2.mp4        # solo tras verificar

# 4. Apuntar la base de datos a los -v2 y regenerar miniaturas.
#    (el paso 4 necesita un script corto que aún no existe: cambiar
#     contenido.url_video de <slug>.mp4 a <slug>-v2.mp4)
npx tsx scripts/generar-miniaturas-video.ts --rehacer

# 5. Cuando se haya visto que todo está bien, borrar los objetos viejos de R2.
```

## Alternativa legítima

Dejarlo como está. Dos voces en el producto es un defecto de acabado, no un
error funcional: ningún alumno ve un video roto. Si el piloto es inminente y la
máquina hace falta, aplazarlo es una decisión razonable —lo único que no
conviene es olvidarlo, porque cada video nuevo que se produzca aumenta la mezcla.
