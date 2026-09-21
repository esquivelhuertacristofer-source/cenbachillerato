# -*- coding: utf-8 -*-
"""
LA VOZ DE LOS LABORATORIOS DE INGLES. Graba cada frase que el boton «Escuchar»
de un laboratorio puede pedir.

Hermano de `scripts/narrar-actividades.py`, y con sus mismas decisiones. Alla se
graban las 198 lecturas con `es-MX-DaliaNeural`; aqui se graban las frases
sueltas de los 18 laboratorios que tienen boton «Escuchar».

POR QUE NO `speechSynthesis`. Lo mismo que ya estaba escrito para el espanol, y
que estos laboratorios se habian saltado: el navegador trae un sintetizador
gratis, pero la voz que suena es la que esa maquina tenga instalada. En la
laptop de una escuela publica es la SAPI vieja de Windows —David o Zira— y en
un Chromebook puede no haber ninguna voz en ingles. Un alumno de 15 anos que
esta aprendiendo a PRONUNCIAR no puede tomar eso como modelo.

UNA SOLA LOCUTORA PARA TODO EL INGLES. `en-US-AvaNeural`, igual que Dalia es la
unica en espanol. Dos voces distintas en dos laboratorios de la misma materia
suenan a dos plataformas distintas. Si Ava no estuviera disponible se cae a
`en-US-AriaNeural`, y se comprueba listando las voces antes de grabar nada.

EL UNICO LABORATORIO EN ESPANOL de la lista es `lectura-en-voz-alta` (LC-I·P07,
leer en voz alta): sus frases estan en espanol y se graban con Dalia, la voz de
la plataforma. El idioma de cada frase lo dijo el propio laboratorio —es el
`lang` que le puso a su `SpeechSynthesisUtterance`— y el extractor lo apunto.

LAS TRES COSAS MEDIDAS QUE NO SE TOCAN, iguales que en espanol:

  · El TONO se queda en +0Hz. Moverlo desplaza los formantes y la locutora sale
    "a veces como nina, otras como monstruo". No hay dosis pequena que salve
    eso: es el mecanismo.
  · Los estilos de Azure (`newscast`, `cheerful`) NO funcionan por edge-tts: el
    motor lee la etiqueta en voz alta.
  · El RITMO si responde y es toda la direccion que hace falta.

EL RITMO ES -10%, el mismo de la narracion en espanol. Son alumnos de 15 a 18
aprendiendo ingles CON EL TEXTO DELANTE: a velocidad nativa no distinguen donde
acaba una palabra y empieza la otra, y mas lento deja de parecer ingles hablado
y se vuelve un dictado.

ESTO NO OCUPA MAQUINA. edge-tts es una llamada de red al servicio de Microsoft:
no hay modelo local, no hay CPU, no hay GPU.

IDEMPOTENTE. Guarda en `data/voz-labs-indice.json` el hash del texto de cada
clip; al relanzarlo solo regenera lo que falta o lo que cambio de texto.
Interrumpirlo no cuesta nada.

  python scripts/narrar-labs.py                   todo lo que falte
  python scripts/narrar-labs.py --rehacer         todo otra vez
  python scripts/narrar-labs.py --limite 12       una prueba corta
  python scripts/narrar-labs.py --voces           solo dice que voces hay
"""
import asyncio
import hashlib
import io
import json
import os
import sys

import edge_tts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTE = os.path.join(RAIZ, 'data', 'voz-labs.json')
# DENTRO de `public/`, al reves que la narracion de las lecturas. Aquello son
# ~170 MB y viaja a R2; esto son frases de dos segundos que pesan unos pocos
# megas en total, y servirlas como estatico ahorra el bucket, el CSP y la
# subida. Lo que NO puede pasar es que engorden el Worker: `public/` va al
# bundle de ASSETS, que no cuenta contra el limite de 3 MiB gzip del Worker.
DESTINO = os.path.join(RAIZ, 'public', 'media', 'voz-labs')
# El indice de idempotencia vive FUERA de `public/`: es estado del pipeline, no
# algo que un alumno vaya a pedir, y en `public/` se desplegaria con los clips.
INDICE = os.path.join(RAIZ, 'data', 'voz-labs-indice.json')

VOZ_EN = 'en-US-AvaNeural'
VOZ_EN_RESPALDO = 'en-US-AriaNeural'
VOZ_ES = 'es-MX-DaliaNeural'
TONO = '+0Hz'
RITMO = '-10%'

# Cuantos clips a la vez. Es red, no maquina: seis van comodos y el servicio no
# se queja. Subirlo mas empieza a devolver cortes a media frase.
A_LA_VEZ = 6
# Reintentos por clip. edge-tts falla de vez en cuando con un 403 pasajero.
INTENTOS = 3
# Un MP3 valido de una frase corta no baja de ~900 bytes; menos que eso es un
# clip vacio que el servicio devolvio sin fallar.
MINIMO_BYTES = 900


def firma(texto, voz):
    return hashlib.sha1((texto + '@' + RITMO + '@' + voz).encode('utf-8')).hexdigest()[:12]


async def voces_disponibles():
    """Los nombres cortos de todas las voces que ofrece el servicio."""
    return {v['ShortName'] for v in await edge_tts.list_voices()}


async def uno(fila, voz, indice, sem, avance):
    # La clave ya trae el idioma de carpeta: `en/1a2b3c-21`. Se respeta tal cual
    # porque el reproductor pide EXACTAMENTE ese camino.
    clave, texto = fila['clave'], fila['texto']
    ruta_rel = clave + '.mp3'
    destino = os.path.join(DESTINO, *(clave.split('/'))) + '.mp3'
    f = firma(texto, voz)

    if not avance['rehacer'] and indice.get(ruta_rel) == f and os.path.exists(destino):
        avance['saltados'] += 1
        return

    async with sem:
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        for intento in range(INTENTOS):
            try:
                com = edge_tts.Communicate(texto, voz, rate=RITMO, pitch=TONO)
                await com.save(destino)
                if os.path.getsize(destino) < MINIMO_BYTES:
                    raise IOError('audio vacio (%d bytes)' % os.path.getsize(destino))
                indice[ruta_rel] = f
                avance['hechos'] += 1
                break
            except Exception as e:  # noqa: BLE001
                if intento == INTENTOS - 1:
                    avance['fallos'].append((ruta_rel, str(e)[:90]))
                else:
                    await asyncio.sleep(1.5 * (intento + 1))

    n = avance['hechos'] + avance['saltados'] + len(avance['fallos'])
    if n % 50 == 0:
        print('  %4d / %d   %s' % (n, avance['total'], ruta_rel), flush=True)


async def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    disponibles = await voces_disponibles()
    voz_en = VOZ_EN if VOZ_EN in disponibles else VOZ_EN_RESPALDO
    if voz_en != VOZ_EN:
        print('AVISO: %s no esta disponible; se usa %s' % (VOZ_EN, voz_en))
    if VOZ_ES not in disponibles:
        raise SystemExit('%s no esta disponible: la voz de la plataforma no se sustituye sin decirlo' % VOZ_ES)
    print('voces: ingles %s · espanol %s · ritmo %s · tono %s' % (voz_en, VOZ_ES, RITMO, TONO))
    if '--voces' in sys.argv:
        return

    rehacer = '--rehacer' in sys.argv
    limite = int(sys.argv[sys.argv.index('--limite') + 1]) if '--limite' in sys.argv else None

    filas = json.load(io.open(FUENTE, encoding='utf-8'))
    if limite:
        filas = filas[:limite]

    os.makedirs(DESTINO, exist_ok=True)
    os.makedirs(os.path.dirname(INDICE), exist_ok=True)
    indice = {}
    if os.path.exists(INDICE) and not rehacer:
        try:
            indice = json.load(io.open(INDICE, encoding='utf-8'))
        except Exception:  # noqa: BLE001
            indice = {}

    avance = {'total': len(filas), 'hechos': 0, 'saltados': 0, 'fallos': [], 'rehacer': rehacer}
    sem = asyncio.Semaphore(A_LA_VEZ)
    await asyncio.gather(*[
        uno(f, VOZ_ES if f['idioma'] == 'es' else voz_en, indice, sem, avance)
        for f in filas
    ])

    json.dump(indice, io.open(INDICE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)

    total = 0
    for base, _, nombres in os.walk(DESTINO):
        for n in nombres:
            if n.endswith('.mp3'):
                total += os.path.getsize(os.path.join(base, n))
    print('\ngrabados %d · ya estaban %d · fallaron %d' % (avance['hechos'], avance['saltados'], len(avance['fallos'])))
    print('en disco: %.2f MB en %s' % (total / 1048576.0, DESTINO))
    for r, e in avance['fallos'][:20]:
        print('  FALLO %s: %s' % (r, e))


if __name__ == '__main__':
    asyncio.run(main())
