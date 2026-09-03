# -*- coding: utf-8 -*-
"""
LA VOZ DE LA PLATAFORMA. Graba con `es-MX-DaliaNeural` cada texto que el alumno
puede pedir escuchar.

POR QUE NO `speechSynthesis`. El navegador trae un sintetizador gratis y el
boton "Escuchar" lo usa hoy, pero la voz que suena es la que esa maquina tenga
instalada: en la laptop de una escuela publica es la SAPI vieja de Windows
—"Microsoft Sabina"—, que suena robotica, y en un Chromebook puede no haber
ninguna voz en espanol. Aqui el audio viene grabado con la MISMA locutora de los
211 videos, asi que el alumno oye siempre a la misma persona, suene donde suene,
y no hace falta mas que bajar un MP3.

TRES COSAS MEDIDAS EN LA PLATAFORMA DE ROBOTICA QUE NO SE TOCAN:

  · El TONO se queda en +0Hz. Moverlo desplaza los formantes y la locutora sale
    "a veces como nina, otras como monstruo". No hay dosis pequena que salve
    eso: es el mecanismo.
  · Los estilos de Azure (`newscast`, `cheerful`) NO funcionan por edge-tts: el
    motor lee la etiqueta en voz alta.
  · El RITMO si responde y es toda la direccion que hace falta.

EL RITMO DE AQUI ES -10%, Y NO ES EL DE ROBOTICA. Alla el oyente tiene cuatro
anos y no lee, y por eso van a -30%. Aqui es un alumno de 15 a 18 siguiendo
prosa academica con el texto delante: la escala medida dice que +0% son 218
palabras por minuto y -10% son 197. A 197 se sigue un parrafo tecnico sin que
suene lento; mas abajo empieza a arrastrar y el alumno adelanta.

ESTO NO OCUPA MAQUINA. edge-tts es una llamada de red al servicio de Microsoft:
no hay modelo local, no hay CPU, no hay GPU.

IDEMPOTENTE. Guarda al lado un indice con el hash del texto de cada clip; al
relanzarlo solo regenera lo que falta o lo que cambio de texto. Interrumpirlo no
cuesta nada.

  python scripts/narrar-actividades.py                   todo lo que falte
  python scripts/narrar-actividades.py --rehacer         todo otra vez
  python scripts/narrar-actividades.py --solo CD-I-P01-A1
  python scripts/narrar-actividades.py --limite 20       una prueba corta
"""
import asyncio
import hashlib
import io
import json
import os
import sys

import edge_tts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTE = os.path.join(RAIZ, 'scripts', 'out', 'voz-actividades.json')
# Fuera de `public/`: son ~170 MB que viajan a R2, no al bundle de assets del
# Worker. Misma decision que los 211 MP4 de video.
DESTINO = os.path.join(RAIZ, '..', 'video-pipeline', 'voz-out')
INDICE = os.path.join(DESTINO, 'indice.json')

VOZ = 'es-MX-DaliaNeural'
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


def firma(texto):
    return hashlib.sha1(texto.encode('utf-8')).hexdigest()[:12]


async def uno(fila, indice, sem, avance):
    codigo, clave, texto = fila['codigo'], fila['clave'], fila['texto']
    ruta_rel = '%s/%s.mp3' % (codigo, clave)
    destino = os.path.join(DESTINO, codigo, clave + '.mp3')
    f = firma(texto + '@' + RITMO + '@' + VOZ)

    if not avance['rehacer'] and indice.get(ruta_rel) == f and os.path.exists(destino):
        avance['saltados'] += 1
        return

    async with sem:
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        for intento in range(INTENTOS):
            try:
                com = edge_tts.Communicate(texto, VOZ, rate=RITMO, pitch=TONO)
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
    if n % 100 == 0:
        print('  %4d / %d   %s' % (n, avance['total'], ruta_rel), flush=True)


async def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    rehacer = '--rehacer' in sys.argv
    solo = sys.argv[sys.argv.index('--solo') + 1] if '--solo' in sys.argv else None
    limite = int(sys.argv[sys.argv.index('--limite') + 1]) if '--limite' in sys.argv else None

    filas = json.load(io.open(FUENTE, encoding='utf-8'))
    if solo:
        filas = [f for f in filas if f['codigo'] == solo]
    if limite:
        filas = filas[:limite]

    indice = {}
    if os.path.exists(INDICE):
        indice = json.load(io.open(INDICE, encoding='utf-8'))

    avance = {'total': len(filas), 'hechos': 0, 'saltados': 0, 'fallos': [], 'rehacer': rehacer}
    sem = asyncio.Semaphore(A_LA_VEZ)
    print('%d textos, voz %s, ritmo %s' % (len(filas), VOZ, RITMO), flush=True)

    await asyncio.gather(*[uno(f, indice, sem, avance) for f in filas])

    os.makedirs(DESTINO, exist_ok=True)
    io.open(INDICE, 'w', encoding='utf-8').write(json.dumps(indice, indent=0, sort_keys=True))

    peso = sum(os.path.getsize(os.path.join(r, n))
               for r, _, ns in os.walk(DESTINO) for n in ns if n.endswith('.mp3'))
    print('\nhechos %d   ya estaban %d   fallos %d   %.1f MB en disco'
          % (avance['hechos'], avance['saltados'], len(avance['fallos']), peso / 1e6))
    for ruta, e in avance['fallos'][:20]:
        print('  FALLO %s  %s' % (ruta, e))
    if avance['fallos']:
        sys.exit(1)


asyncio.run(main())
