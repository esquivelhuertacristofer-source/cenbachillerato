# Estándar de laboratorios CEN (2026-10)

Por qué existe: el cliente no estaba satisfecho. Los labs tenían interfaces gigantes, mal acomodadas, poco
responsivas y con muchísimo texto; la ficha previa se saltaba. Un lab que solo se reacomoda NO cumple: cada lab
debe tener un **experimento con consecuencia visible** — el alumno cambia algo y ve qué pasa.

Referencias ya hechas (léelas antes de empezar, son el patrón a copiar):
- 3D: `src/components/practicas/labs/LabNewton.tsx` + `NewtonScene.tsx`, `LabBalanceo.tsx` + `BalanceoScene.tsx`,
  `LabGeneticaMendel.tsx` + `GeneticaMendelScene.tsx`.
- Arrastre → simulador: `LabFakeNews.tsx` (+ `fake-news-feed.ts`), `LabPoliticasPublicas.tsx` (+ `politicas-publicas-sim.ts`).
- Esqueleto: `src/components/practicas/labs/_shell.tsx` (LabShell, Bloque, Dato, Deslizador, BotonHerramienta, Mesa).

## 1. Pantalla (obligatorio en todos)
- Usar `<LabShell>`. La escena ocupa el escenario; arriba la barra de modos (`modos`) y herramientas
  (`BotonHerramienta`: sonido, play, reiniciar…); abajo la misión actual (sale sola de `objetivos`) y UNA
  `lectura` en vivo de ≤10 palabras.
- Panel en pestañas: primera «Controles» (o «Cuaderno»/«Pistas»/«Etapa» en simuladores), «Misiones» (automática),
  «Reto» (el quiz/reto existente, sin cambiar props), «Teoría» (TODO el texto curricular, cada parte en `<Bloque>`,
  más `FichaTeorica`).
- Fuera: cajón de teoría, botón flotante «Teoría», columna lateral, tarjetas apiladas bajo la escena,
  `TableroObjetivos` propio (el shell lo monta).
- Texto propio ≥ 14 px. Ningún ancho fijo ≥ 300 px. Rejillas con `minmax(0,1fr)` o
  `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`. Debe funcionar a 390 px de ancho.
- Sliders con el `Deslizador` común; lecturas numéricas con `Dato` en rejilla de 2 columnas.
- Labs de arrastre: `<LabShell dom>`; banco + destino dentro de `<Mesa>` (exactamente 2 hijos).

## 2. Didáctica (obligatorio)
- Identifica EL experimento central del lab (la idea que el alumno debe descubrir) y hazlo tangible: una
  variable que se mueve y una consecuencia que se VE (algo que se desliza, se llena, cambia de color, se
  inclina, crece; una gráfica que se traza; un medidor que cruza un umbral).
- Las misiones (objetivos) guían ese experimento en orden. Conserva los textos y la lógica `done` de los
  objetivos existentes; puedes AGREGAR 1–2 al inicio que guíen el experimento central.
- Retroalimentación inmediata y explicativa (por qué), no solo ✓/✗.

## 3. 3D (labs con escena)
- Etiquetas (`<Html>` de drei, NUNCA `<Text>`: cuelga Turbopack): máx. 4 a la vez, ≥ 14 px, en la punta de lo
  que nombran, con desplazamientos fijos para que no se encimen; nada de `distanceFactor` que las haga ilegibles.
  Lo secundario va al panel (`Dato`) o a un botón «Ver detalles».
- Encuadre: el contenido llena ~60 % del alto y queda ENTRE la barra de arriba (~64 px) y la misión de abajo
  (~150 px). Ajusta cámara/target por modo. En pantallas angostas (`useThree().size.width < 640`) oculta los
  paneles `<Html>` anchos (la info ya está en el panel).
- Calidad (ver memoria «sintomas grafico viejo»): suelo/escenario (kit `_escenario.tsx`), nada de líneas de 1 px
  como sujeto, sin `toneMapped={false}` en sólidos, sin wireframe sobre opaco, sin estrellas donde no hay espacio.
- Rendimiento: instancing si hay > 30 objetos repetidos.

## 4. Arrastre → simulador (labs DOM)
- Clasificar/emparejar frases NO es experimentar. Conviértelo en un escenario con decisiones y consecuencias:
  investigación con herramientas y evidencia (FakeNews), simulador con indicadores y presupuesto (Políticas),
  diálogo ramificado con reacciones (inglés), caso con línea de tiempo y fuentes (historia), editor donde el
  texto del alumno cambia el resultado (lengua), etc. Lo que se manipula debe ser visual: tarjetas con imagen,
  medidores, mapas, gráficas SVG, líneas de tiempo.
- Conserva los modos «Escribe el término» (`EscribeTermino`) y «Completa el texto» (`CompletaTexto`) si existen,
  como modos extra; el glosario debe seguir contando en un objetivo (`done: glosarioDone`) y existir
  `const resetGlosario = () => {`.
- Personas, medios, municipios y empresas FICTICIOS. Nunca citas inventadas de personas reales. Cifras inventadas
  marcadas como «simulación».
- Imágenes: NO ejecutes ComfyUI. Escribe `data/escenas-fotos/<slug>.json` con
  `{ "slug": "...", "items": [{ "clave": "kebab", "formato": "16:9" | "1:1", "estilo": "foto" | "ilustracion",
  "escena": "descripción física concreta, sin texto, letras, logotipos ni marcas" }] }` y usa en el código
  `/media/labs-sim/<slug>/<clave>.webp`. La imagen debe verse bien aunque aún no exista: `<img>` con fondo de
  gradiente + ícono detrás (o `onError` que la oculte). Las imágenes no deben regalar la respuesta.
  Máx. 8 imágenes por lab.

## 5. Lo que NO se toca
- Contenido curricular verbatim (datos `*-data.ts`, fichas, quiz): no se borra, se MUEVE a «Teoría».
- Lógica de física/química/matemática existente (solo se agregan helpers).
- Archivos compartidos: `_shell.tsx`, `_arrastre.tsx`, `_tablero.tsx`, `_mecanica-*.tsx`, `_partida.tsx`,
  `_objetivos.tsx`, `_kit.tsx`, `_escenario.tsx`, `registry*.ts(x)`, `Expedicion.tsx`, `predicciones.ts`,
  fichas generadas. Si el shell no alcanza, dilo en el reporte.
- `RETO_KEY` y el registro de estrellas (`useEstrellas`/`persistMejor`/`onAprobado`). Nombre del export y props.
- Si un lab ya cumple casi todo, haz solo lo que falta: no reescribas por reescribir.

## 6. Pruebas que deben seguir pasando
- `labs-dom-humo.test.tsx` (DOM): monta con > 200 caracteres; cada botón `.ls-modo` muestra contenido distinto
  (modos bloqueados muestran su pantalla de candado); existe `.pt-marcador` (MarcadorPartida de `_partida.tsx`);
  ningún botón lanza error.
- `tablero-labs.test.ts`: si el lab tiene la marca `/* Identidad del tablero */`, todas sus reglas CSS válidas y
  `prefers-reduced-motion` DESPUÉS de la marca, antes del cierre de la plantilla.
- `fichas-labs.test.tsx`: estrellas persistidas; ningún objetivo fijado a `true`/`false` literal.
- Verifica SOLO con `npx eslint <tus archivos>` y, para DOM,
  `npx jest src/components/practicas/__tests__/labs-dom-humo.test.tsx -t <slug>`. NO corras `tsc`, `next build`
  ni `next dev` (lo hace el coordinador una vez por tanda; la PC es compartida).

## 7. «Predice» (la pregunta antes del lab)
Escribe `data/predicciones/<slug>.json` con
`{ "escena": "...", "pregunta": "...", "opciones": [{"id":"a","texto":"...","icono":"fa-..."}, …3],
"correcta": "a|b|c", "porque": "...", "comoComprobarlo": "..." }`.
Reglas: la respuesta se VE moviendo algo en el lab (verifícalo contra la lógica); pregunta ≤ 20 palabras;
opciones ≤ 10 palabras, plausibles, la correcta no es la más larga y no repite la escena; `porque` ≤ 45
palabras; `comoComprobarlo` dice qué mover, no qué va a pasar. Español de México.

## 8. Reporte final (corto)
Por lab: experimento central elegido, qué cambió, líneas antes/después, resultado de eslint/jest, imágenes
pedidas (n), y lo que no pudiste verificar.
