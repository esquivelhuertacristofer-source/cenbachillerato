/**
 * Corrección de contenido de lecturas — revisión 2026-10-05.
 * Origen: docs/REVISION-CONTENIDO-LECTURAS.md (errores detectados al guiar las
 * 198 lecturas) + verificación de cifras en fuentes oficiales (SENER/PRODESEN,
 * SEMARNAT DBGIR 2020, CONEVAL/ENIGH 2022, INAH, INEGI ENDUTIH 2023).
 *
 * Cada corrección exige que el texto a buscar aparezca EXACTAMENTE una vez y que
 * el número de párrafos no cambie (las guías de lectura y la voz grabada van
 * por párrafo). Sin --aplicar solo muestra lo que haría.
 *
 *   node scripts/corregir-lecturas-2026-10.mjs            (simulación)
 *   node scripts/corregir-lecturas-2026-10.mjs --aplicar
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const APLICAR = process.argv.includes('--aplicar');

/** [codigo, buscar, reemplazo] sobre contenido.texto */
const TEXTO = [
  ['CNEYT-II-P06-A1', 'en 2023 aproximadamente el 76% de la energía primaria provenía de combustibles fósiles (gas natural, petróleo y carbón)', 'en 2023 aproximadamente el 76% de la electricidad del país se generó con combustibles fósiles (gas natural, petróleo y carbón)'],
  ['CNEYT-II-P02-A1', 'México generó aproximadamente 324 TWh de energía eléctrica en 2023 (CFE).', 'México generó aproximadamente 351 TWh de energía eléctrica en 2023 (SENER).'],
  ['CNEYT-I-P07-A1', 'Lise Meitner descubrió la fisión nuclear pero fue excluida del Premio Nobel que recibió su colega Otto Hahn.', 'Lise Meitner fue clave en el descubrimiento de la fisión nuclear —con Otto Frisch dio su explicación teórica—, pero fue excluida del Premio Nobel que recibió su colega Otto Hahn.'],
  ['CNEYT-I-P07-A1', 'inventó un sistema de comunicación por espectro disperso que sentó las bases del WiFi y Bluetooth modernos.', 'coinventó un sistema de comunicación por salto de frecuencia, precursor de tecnologías inalámbricas como el WiFi y el Bluetooth.'],
  ['CNEYT-III-P09-A1', 'La combustión del gas LP en la estufa (CH₄/propano + O₂ → CO₂ + H₂O)', 'La combustión del gas LP en la estufa (propano: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O)'],
  ['CNEYT-III-P09-A1', 'la combustión del gas de la estufa (metano) se escribe', 'la combustión del metano (el gas natural) se escribe'],
  ['CNEYT-III-P07-A1', '(como la certificación de predios como UMAFOR o ADVC)', '(como las Áreas Destinadas Voluntariamente a la Conservación, ADVC, que certifica la CONANP)'],
  ['CNEYT-IV-P01-A1', 'sin cambiar las subíndices', 'sin cambiar los subíndices'],
  ['CNEYT-IV-P04-A1', 'es el principal componente del gas natural que distribuye la CFE en México', 'es el principal componente del gas natural que llega por tubería a hogares e industrias de México'],
  ['CNEYT-IV-P06-A1', 'antibióticos (amoxicilina, amiodarona)', 'antibióticos (amoxicilina, ampicilina)'],
  ['CNEYT-IV-P07-A1', 'México genera aproximadamente 12.4 millones de toneladas de residuos sólidos urbanos al año, según datos de SEMARNAT 2022.', 'México genera alrededor de 120 mil toneladas de residuos sólidos urbanos al día —unos 44 millones de toneladas al año—, según el Diagnóstico Básico para la Gestión Integral de los Residuos (SEMARNAT, 2020).'],
  ['CNEYT-IV-P10-A1', 'El NO₂ pardo del esmog del Valle de México proviene del equilibrio N₂O₄ ⇌ 2 NO₂.', 'El equilibrio N₂O₄ ⇌ 2 NO₂ explica un color del esmog: el NO₂ es un gas pardo (el que tiñe el cielo del Valle de México) y el N₂O₄ es incoloro.'],
  ['CNEYT-V-P03-A1', 'parece fijo en el cielo desde cualquier punto de la Tierra', 'parece fijo en el cielo para quien lo observa desde la superficie (salvo cerca de los polos, desde donde no se alcanza a ver)'],
  ['CNEYT-V-P03-A1', 'Posteriormente vinieron Satmex 5 (1998), Morelos 3 (2015) y la constelación Mexsat (Bicentenario, Morelos 3), que actualmente provee', 'Posteriormente vinieron Satmex 5 (1998) y la constelación Mexsat, con los satélites Bicentenario (2012) y Morelos 3 (2015), que actualmente provee'],
  ['CNEYT-V-P04-A1', 'viajan a ≈8 km/s en la corteza', 'viajan a ≈6 km/s en la corteza (y a ≈8 km/s en el manto superior)'],
  ['CNEYT-VI-P01-A1', 'abioticamente', 'abióticamente'],
  ['CNEYT-VI-P07-A1', 'Alfred Russell Wallace', 'Alfred Russel Wallace'],
  ['CNEYT-VI-P07-A1', 'el hueso humero', 'el húmero'],
  ['CS-II-P01-A1', 'México tiene un GINI alto (~0.42)', 'México tiene un GINI alto (~0.41 en 2022)'],
  ['CS-III-P01-A1', 'el desmantelado Seguro Popular que en 2019 dio paso al INSABI)', 'el desmantelado Seguro Popular, sustituido en 2020 por el INSABI, que a su vez desapareció en 2023 para dar paso a IMSS-Bienestar)'],
  ['CH-I-P01-A1', 'Teotihuacán (siglos II-VII)', 'Teotihuacán (entre el siglo I a.C. y el VII d.C.)'],
  ['CH-I-P03-A1', 'porfiriato (1876-1910)', 'porfiriato (1876-1911)'],
  ['CD-I-P08-A1', '(UNAM, CONACULTA)', '(UNAM, Secretaría de Cultura)'],
  ['CD-I-P10-A1', 'Las licencias Creative Commons y la GPL son ejemplos', 'La GPL y las licencias Creative Commons con la condición «Compartir igual» (CC BY-SA) son ejemplos'],
  ['CD-II-P02-A1', "'último definitivo real') confundiendo", "'último definitivo real', que confunden"],
  ['CD-III-P01-A1', 'El filósofo Erving Goffman', 'El sociólogo Erving Goffman'],
  ['LC-III-P05-A1', '(modernismo, principios del siglo XX)', '(posmodernismo, principios del siglo XX)'],
  ['IN-I-P03-A1', '"It is a [tamaño] [color] [forma] [objeto]." Por ejemplo: "It is a big blue rectangular table" (Es una mesa rectangular azul grande).', '"It is a [tamaño] [forma] [color] [objeto]." Por ejemplo: "It is a big rectangular blue table" (Es una mesa azul, grande y rectangular).'],
  ['IN-I-P06-A1', 'hot (caliente)', 'hot (caluroso: hace calor)'],
  ['IN-I-P08-A1', 'La segunda manera es con pronombres posesivos:', 'La segunda manera es con adjetivos posesivos, que van antes del sustantivo:'],
  ['IN-II-P05-A1', 'Two or more syllable adjectives: Use more + adjective + than.', 'Two or more syllable adjectives: Use more + adjective + than (excepto los de dos sílabas que terminan en -y: happy → happier than, easy → easier than).'],
  ['IN-V-P06-A1', '¿Cuáles son las 6 partes de un correo formal', '¿Cuáles son las 7 partes de un correo formal'],
  ['IN-V-P06-A1', "about your master's program in environmental science", 'about your summer program in environmental science'],
  ['IN-IV-P01-A1', 'Grammar note: Notice the verbs in bold.', 'Grammar note: Notice the verbs in the story.'],
  ['PM-I-P02-A1', 'los números negativos (-3, -2, -1, 0)', 'los números negativos (-3, -2, -1) y el cero'],
  ['PM-I-P04-A1', 'una inflación del 4.5% mensual', 'una inflación del 4.5% anual'],
  ['PM-IV-P01-A1', 'se formalizó en el siglo XVII con Leibniz y Euler', 'se formalizó entre los siglos XVII y XVIII con Leibniz y Euler'],
  ['PM-IV-P02-A1', 'La trayectoria de los cohetes Soyuz y los lanzamientos del puerto espacial de la Agencia Espacial Mexicana sigue modelos cuadráticos en su fase inicial.', 'La trayectoria de un balón pateado o del chorro de una fuente sigue un modelo cuadrático: dibuja una parábola.'],
  ['PM-IV-P02-A1', 'para consumo entre 0 y 150 kWh se aplica una tarifa, para el tramo entre 151 y 280 kWh se aplica otra mayor, y para el excedente se aplica una tarifa aún más alta.', 'los primeros kWh del periodo se cobran con una tarifa básica, los siguientes con una tarifa intermedia y el excedente con una tarifa aún más alta (los límites de cada tramo dependen de la región y de la temporada).'],
  ['PM-III-P07-A1', 'Las ecuaciones lineales son modelos matemáticos de relaciones proporcionales:', 'Las ecuaciones lineales son modelos matemáticos de relaciones de cambio constante:'],
  ['PM-IV-P05-A1', 'se mide la distancia a dos puntos accesibles', 'se mide la distancia entre dos puntos accesibles'],
  ['PM-IV-P06-A1', 'centros de gravedad y midpoints en diseño', 'centros de gravedad y puntos medios en diseño'],
];

/** [codigo, fragmento del callout actual, nuevo contenido] — recuadros fuera de tema o con cifra errónea. */
const CALLOUT = [
  ['PFH-III-P02-A1', 'y 188 museos', 'El Instituto Nacional de Antropología e Historia (INAH) protege más de 187 zonas arqueológicas abiertas al público y más de 160 museos. Sus investigaciones arqueológicas e históricas reescriben continuamente nuestra comprensión de las culturas prehispánicas mesoamericanas.'],
  // Inglés: los recuadros eran de Informática (copiados de Cultura Digital).
  ['IN-I-P01-A1', 'MOOCs', 'En inglés, «How are you?» casi siempre es un saludo y no una pregunta real: se responde con algo breve como «Fine, thanks. And you?».'],
  ['IN-I-P02-A1', 'certificaciones', 'Para pedir que te repitan algo en clase, «Can you repeat that, please?» o «Sorry, could you say that again?» son formas corteses y muy usadas.'],
  ['IN-I-P03-A1', 'Estrategia Digital', 'Los adjetivos en inglés siguen un orden: opinión, tamaño, edad, forma, color, origen, material y propósito. Por eso se dice «a big round red ball» y no «a red round big ball».'],
  ['IN-I-P04-A1', 'Tec de Monterrey', 'En inglés la edad se dice con el verbo «to be», no con «have»: «I am 16 years old» (no «I have 16 years»). Es uno de los errores más comunes de quien habla español.'],
  ['IN-I-P05-A1', 'desarrolladores', 'Con las horas se usa «at» (at 7 o\'clock), con los días «on» (on Monday) y con los meses y los años «in» (in May, in 2025).'],
  ['IN-I-P06-A1', 'datos.gob.mx', 'Para hablar del clima en inglés el sujeto es «it»: «It is hot», «It is raining». En español decimos «Hace calor» o «Está lloviendo», sin sujeto.'],
  ['IN-I-P07-A1', 'ENDUTIH', 'Después de «like», «love» y «hate» el verbo suele ir con -ing: «I like playing soccer», «She loves reading».'],
  ['IN-I-P08-A1', 'CINVESTAV', '«It\'s» (it is) e «its» (su, de una cosa o animal) suenan igual pero no significan lo mismo: «It\'s a dog. Its name is Max.»'],
  ['IN-II-P01-A1', 'MOOCs', 'Los adverbios de frecuencia (always, usually, sometimes, never) van antes del verbo principal, pero después de «to be»: «I always walk to school», «She is never late».'],
  ['IN-II-P03-A1', 'Estrategia Digital', '«Can» no cambia con la persona ni lleva «to» después: se dice «She can swim», no «She cans swim» ni «She can to swim».'],
  ['IN-II-P05-A1', 'Tec de Monterrey', '«Good» y «bad» tienen comparativos irregulares: «better» y «worse». Se dice «This book is better than that one», no «more good».'],
  ['IN-II-P07-A1', 'datos.gob.mx', '«I would like» (I\'d like) es la forma cortés de «I want»: «I\'d like a glass of water, please» suena más amable que «I want water».'],
  ['IN-III-P01-A1', 'ENDUTIH', 'En las preguntas y negaciones en pasado, el verbo vuelve a su forma base porque «did» ya marca el pasado: «What did you do?», «I didn\'t go» (no «did you did» ni «didn\'t went»).'],
  ['IN-III-P04-A1', 'MOOCs', 'Para hablar de hábitos en presente, con he, she e it el verbo lleva -s o -es: «She plays», «He watches», «It goes».'],
  ['IN-III-P05-A1', 'certificaciones', '«Mustn\'t» y «don\'t have to» no significan lo mismo: «You mustn\'t run» es una prohibición; «You don\'t have to run» quiere decir que no es necesario.'],
  ['IN-III-P07-A1', 'Tec de Monterrey', 'Conectores como «first», «then», «after that» y «finally» ordenan los hechos de una historia y ayudan a quien escucha a seguirla.'],
  ['IN-IV-P01-A1', 'desarrolladores', 'La terminación -ed del pasado se pronuncia de tres maneras: /t/ en «walked», /d/ en «played» e /ɪd/ en «visited» (esta última solo después de t o d).'],
  ['IN-IV-P04-A1', 'ENDUTIH', '«Should» aconseja y «must» obliga: «You should drink more water» es un consejo; «You must wear a seatbelt» es una obligación.'],
  ['IN-IV-P07-A1', 'MOOCs', 'El pasado continuo y el pasado simple juntos cuentan una acción interrumpida: «I was walking home when it started to rain».'],
  ['IN-V-P01-A1', 'Estrategia Digital', 'En inglés las profesiones llevan artículo: «I want to be an engineer», «She is a nurse». En español decimos «quiero ser ingeniero», sin artículo.'],
  ['IN-V-P03-A1', 'Tec de Monterrey', 'Para describir procesos se usa mucho la voz pasiva, porque importa la acción más que quién la hace: «The beans are harvested, then they are dried».'],
  ['IN-V-P04-A1', 'desarrolladores', 'Para opinar con cortesía sirven frases como «In my opinion…», «I think that…» o «I\'m worried about…»; y para no sonar tajante: «I\'m not sure, but…».'],
  ['IN-V-P05-A1', 'datos.gob.mx', 'Skimming es leer rápido para captar la idea general; scanning es buscar un dato concreto (una fecha, un nombre o una cifra) sin leer todo el texto.'],
  ['IN-V-P06-A1', 'ENDUTIH', 'En un correo formal en inglés se evitan las contracciones: se escribe «I am writing» y «I would like», no «I\'m writing» ni «I\'d like».'],
  ['IN-V-P08-A1', 'MOOCs', 'Las cuatro habilidades de un idioma son listening, speaking, reading y writing. El Marco Común Europeo de Referencia (MCER) describe el nivel B1 como el de un «usuario independiente».'],
  // Matemáticas: el recuadro de Luis Miramontes (químico) no tenía relación con el tema.
  ['PM-I-P02-A1', 'Miramontes', 'La numeración maya fue de las primeras del mundo en usar el cero, que representaba con un caracol o una concha.'],
  ['PM-I-P05-A1', 'Miramontes', 'Los mapas usan proporciones: en un mapa a escala 1:50 000, 1 cm del papel representa 50 000 cm del terreno, es decir, 500 m.'],
  ['PM-II-P01-A1', 'Miramontes', 'La sucesión de Fibonacci (1, 1, 2, 3, 5, 8, 13…), donde cada término es la suma de los dos anteriores, aparece en el número de espirales de los girasoles y de las piñas.'],
  ['PM-III-P01-A1', 'Miramontes', 'Una forma antigua de trazar un ángulo recto es con una cuerda que forma un triángulo de lados 3, 4 y 5: como 3² + 4² = 5², el ángulo entre los lados de 3 y 4 es recto.'],
  ['PM-IV-P01-A1', 'Miramontes', 'En el siglo XVIII, Leonhard Euler popularizó la notación f(x) para escribir funciones, la misma que usamos hoy.'],
  ['PM-V-P01-A1', 'Miramontes', 'El límite resuelve la paradoja de Aquiles y la tortuga de Zenón: una suma de infinitos pasos cada vez más pequeños puede dar un resultado finito, como 1/2 + 1/4 + 1/8 + … = 1.'],
  ['PM-V-P05-A1', 'Miramontes', 'La función exponencial eˣ, con e ≈ 2.71828, es su propia derivada: la pendiente de su gráfica en cada punto es igual a su valor en ese punto.'],
  ['PM-VI-P01-A1', 'Miramontes', 'El INEGI levanta el Censo de Población y Vivienda cada diez años; el de 2020 contó alrededor de 126 millones de habitantes en México.'],
  ['PM-VI-P05-A1', 'Miramontes', 'La teoría de la probabilidad nació en 1654, en las cartas entre Blaise Pascal y Pierre de Fermat sobre cómo repartir las apuestas de un juego que se interrumpe.'],
];

const parrafos = (t) => String(t ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const codigos = [...new Set([...TEXTO, ...CALLOUT].map((x) => x[0]))];
const { data, error } = await sb.from('actividades').select('id,codigo,contenido').in('codigo', codigos);
if (error) throw error;
const porCodigo = new Map(data.map((f) => [f.codigo, f]));

const cambiosVoz = [];
let errores = 0;
const nuevos = new Map();
for (const c of codigos) {
  const f = porCodigo.get(c);
  if (!f) { console.log(`✗ ${c}: no existe`); errores++; continue; }
  const cont = structuredClone(f.contenido);
  const antes = parrafos(cont.texto);
  for (const [, buscar, reemplazo] of TEXTO.filter((x) => x[0] === c)) {
    const n = cont.texto.split(buscar).length - 1;
    if (n !== 1) { console.log(`✗ ${c}: «${buscar.slice(0, 60)}» aparece ${n} veces`); errores++; continue; }
    cont.texto = cont.texto.replace(buscar, () => reemplazo);
  }
  const despues = parrafos(cont.texto);
  if (antes.length !== despues.length) { console.log(`✗ ${c}: cambió el número de párrafos`); errores++; continue; }
  const tocados = antes.map((p, i) => (p !== despues[i] ? i : -1)).filter((i) => i >= 0);
  if (tocados.length) cambiosVoz.push({ codigo: c, parrafos: tocados });
  for (const [, frag, nuevo] of CALLOUT.filter((x) => x[0] === c)) {
    const idx = (cont.callouts ?? []).findIndex((k) => String(k.contenido).includes(frag));
    if (idx < 0) { console.log(`✗ ${c}: no hay callout con «${frag}»`); errores++; continue; }
    cont.callouts[idx] = { ...cont.callouts[idx], contenido: nuevo };
  }
  nuevos.set(c, { id: f.id, contenido: cont, tocados });
  console.log(`✓ ${c}${tocados.length ? ` · párrafos ${tocados.join(',')}` : ''}${CALLOUT.some((x) => x[0] === c) ? ' · recuadro' : ''}`);
}
console.log(`\n${nuevos.size} lecturas listas, ${errores} errores.`);
if (errores) process.exit(1);
if (!APLICAR) { console.log('Simulación: nada se escribió. Usa --aplicar.'); process.exit(0); }
for (const [c, { id, contenido }] of nuevos) {
  const { error: e } = await sb.from('actividades').update({ contenido }).eq('id', id);
  if (e) { console.log(`✗ ${c}: ${e.message}`); process.exit(1); }
}
writeFileSync('scripts/.lecturas/voz-a-regrabar.json', JSON.stringify(cambiosVoz, null, 1));
console.log(`Aplicado. Párrafos con voz por regrabar: ${cambiosVoz.reduce((a, b) => a + b.parrafos.length, 0)} (scripts/.lecturas/voz-a-regrabar.json)`);
