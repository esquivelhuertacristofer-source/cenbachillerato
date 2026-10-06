// GENERADO por scripts/unir-predicciones.mjs desde data/predicciones/*.json — no editar a mano.
import type { Prediccion } from "./predicciones";

export const PREDICCIONES_LABS: Record<string, Prediccion> = {
  "adn-dogma-central-3d": {
    "escena": "Un gen de 18 bases que se traduce en cinco aminoácidos: Met-Ala-Lis-Gli-Cis. Cada letra del ADN se puede cambiar con un toque.",
    "pregunta": "Una mutación pone un codón de paro a la mitad del gen. ¿Cómo queda la proteína?",
    "opciones": [
      {
        "id": "a",
        "texto": "Igual de larga, con un aminoácido distinto",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "b",
        "texto": "Más corta: la traducción se detiene",
        "icono": "fa-scissors"
      },
      {
        "id": "c",
        "texto": "Igual, la célula corrige el ARN",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El ribosoma lee codón a codón y se detiene al llegar a UAA, UAG o UGA. Si el paro aparece antes, la cadena se corta y la proteína queda incompleta.",
    "comoComprobarlo": "Elige «Péptido corto», toca la primera letra del tercer codón (la A de AAG) hasta formar TAG y compara la proteína original con la tuya."
  },
  "agora-ciudadania-3d": {
    "escena": "Una colonia decide el uso de un terreno baldío. Cada grupo de vecinos solo puede asistir si la convocatoria cumple lo que necesita: horario, cuidados, sede accesible, intérprete.",
    "pregunta": "Con mayoría simple, ¿qué pasa con el resultado al marcar las cinco condiciones de la convocatoria?",
    "opciones": [
      {
        "id": "a",
        "texto": "Gana la misma, solo hay más asistentes",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Cambia la ganadora: llegan ausentes",
        "icono": "fa-people-group"
      },
      {
        "id": "c",
        "texto": "Hay empate y se repite la votación",
        "icono": "fa-rotate"
      }
    ],
    "correcta": "b",
    "porque": "Sin condiciones solo asisten los comerciantes y gana la opción B con 32 % de participación. Con las cinco, llegan todos los grupos y gana la opción C: quién puede asistir cambia lo que se decide.",
    "comoComprobarlo": "En «Asamblea vecinal», caso del terreno y mayoría simple, celebra la asamblea sin marcar nada y otra vez con las cinco condiciones. Compara el ganador."
  },
  "alcance-publicacion-3d": {
    "escena": "Una red de 150 cuentas en seis grupos. Publicas desde una cuenta y los mensajes viajan por las conexiones.",
    "pregunta": "Publicas lo mismo desde tu cuenta (11 contactos) y desde la página de la escuela. ¿Cuál llega a más gente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Tu cuenta: tus amigos lo comparten más",
        "icono": "fa-user"
      },
      {
        "id": "b",
        "texto": "La escuela: tiene más contactos",
        "icono": "fa-school"
      },
      {
        "id": "c",
        "texto": "Llegan igual: el contenido es el mismo",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El alcance depende de cuántas personas ve el mensaje al inicio. Una cuenta con muchos contactos de distintos grupos arranca la cascada con ventaja; una con pocos contactos se queda en su grupo.",
    "comoComprobarlo": "En «Cascada de compartidos» elige tu cuenta, publica y anota el alcance; luego elige la página de la escuela y publica con el mismo formato y hora."
  },
  "algoritmos-deciden": {
    "escena": "Dani usa Rumbo, una plataforma ficticia: ve deportes y videos que la indignan. Tú diseñas el algoritmo que arma su feed.",
    "pregunta": "Pasas de «Que enganche» a «Diverso y fiable». ¿Qué pasa con el tiempo que Dani se queda?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube, porque el contenido es mejor",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja, aunque el feed sea más sano",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "No cambia, solo se reordenan los videos",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Lo emocional y parecido a lo ya visto retiene más. Un feed variado y fiable reduce burbuja y desinformación, pero Dani se engancha menos: por eso muchas plataformas optimizan el tiempo.",
    "comoComprobarlo": "En «Simula tu algoritmo» pulsa «Que enganche», mira el medidor de tiempo y luego pulsa «Diverso y fiable»."
  },
  "anatomia-exposicion-oral": {
    "escena": "Una exposición de tres minutos ante un auditorio ilustrado de doce compañeros ficticios",
    "pregunta": "Si el expositor lee del papel y llena la diapositiva de párrafos, ¿qué le pasa al público?",
    "opciones": [
      {
        "id": "a",
        "texto": "Atiende más porque ve todo escrito",
        "icono": "fa-file-lines"
      },
      {
        "id": "b",
        "texto": "Se distrae y se duerme",
        "icono": "fa-bed"
      },
      {
        "id": "c",
        "texto": "No cambia nada en su atención",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Si el público lee la pantalla deja de oír, y sin contacto visual siente que le leen. La atención cae en cada momento de la exposición.",
    "comoComprobarlo": "En «Da la exposición», deja mirada y apoyo como están y mueve el momento de la exposición a 3:00; luego cambia a mirar al grupo y esquema."
  },
  "anecdota-ingles": {
    "escena": "Leo cuenta en un micrófono abierto lo que le pasó en una terminal de autobuses",
    "pregunta": "Si Leo cuenta cómo terminó todo antes de contar el problema, ¿qué hace la atención del público?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube: el final atrapa desde el principio",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja: ya saben cómo termina",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "Nada cambia si la gramática está bien",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Una anécdota va en orden: escena, complicación, clímax, resolución y reacción. Contar la resolución antes es un spoiler: el público ya conoce el final, pierde la tensión y deja de escuchar lo que falta.",
    "comoComprobarlo": "En «Open mic», sube con las flechas la parte «Resolution» por encima de «Complication» y observa el medidor, las caras y la línea de tiempo."
  },
  "archivo-fuentes-historicas-3d": {
    "escena": "Una balanza de brazos largos con un expediente de 1938: telegrama, fotografía, testimonio oral, cartas y diarios. Cada fuente pesa distinto como evidencia.",
    "pregunta": "¿Qué tres fuentes bastan para que la balanza supere el peso mínimo y sostenga la tesis?",
    "opciones": [
      {
        "id": "a",
        "texto": "Diario oficialista, carta del obrero y fotografía",
        "icono": "fa-newspaper"
      },
      {
        "id": "b",
        "texto": "Telegrama, fotografía y testimonio oral",
        "icono": "fa-scale-balanced"
      },
      {
        "id": "c",
        "texto": "Carta del ingeniero, telegrama y fotografía",
        "icono": "fa-envelope"
      }
    ],
    "correcta": "b",
    "porque": "Telegrama (3), fotografía (2) y testimonio oral (2) suman 7, más que el mínimo de 6, y son de tres tipos distintos. El diario pesa poco por su sesgo y la carta del ingeniero tiene anacronismos: no cuenta.",
    "comoComprobarlo": "En «Uso ético e interpretación», paso «Tu interpretación», elige la tesis y marca «Sostiene» en cada combinación; observa el medidor de peso y la balanza."
  },
  "aula-ingles-interacciones": {
    "escena": "Una maestra de inglés da una instrucción y no alcanzaste a oírla",
    "pregunta": "Si pides repetir con «I don't like it», ¿qué hace la maestra en la clase simulada?",
    "opciones": [
      {
        "id": "a",
        "texto": "Repite la instrucción despacio",
        "icono": "fa-rotate-right"
      },
      {
        "id": "b",
        "texto": "Cree que no te gusta la tarea",
        "icono": "fa-thumbs-down"
      },
      {
        "id": "c",
        "texto": "Te pide que lo repitas",
        "icono": "fa-comment-dots"
      }
    ],
    "correcta": "b",
    "porque": "«I don't like it» expresa gusto, no falta de comprensión. La maestra entiende otra cosa, salta el libro y tú pierdes minutos de clase.",
    "comoComprobarlo": "En «Vive la clase» llega al momento de la página doce y elige primero la respuesta con «I don't like it»; mira el pizarrón."
  },
  "bayes-probabilidad-condicional": {
    "escena": "Una prueba de diabetes con 90 % de sensibilidad y 95 % de especificidad se aplica a 1 000 personas; los positivos se separan en enfermos y sanos.",
    "pregunta": "La prueba no cambia, pero la enfermedad pasa de 10 % a 1 % de la población. ¿Qué pasa con los positivos?",
    "opciones": [
      {
        "id": "a",
        "texto": "Casi todos siguen siendo personas enfermas",
        "icono": "fa-virus"
      },
      {
        "id": "b",
        "texto": "La mayoría resulta falso positivo",
        "icono": "fa-user-xmark"
      },
      {
        "id": "c",
        "texto": "Quedan igual, la prueba es la misma",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Con 1 % de prevalencia hay pocos enfermos y muchos sanos, y el 5 % de error de la prueba cae sobre esos muchos sanos. El VPP baja de 66.7 % a 15.4 %: la mayoría de los positivos son falsos.",
    "comoComprobarlo": "En «Prueba diagnóstica» elige el escenario del ejercicio A2, pulsa «Solo positivos» y baja la prevalencia a 1 % comparando los dos muros."
  },
  "biomas-ecosistemas": {
    "escena": "Un diorama con selva seca a 22 °C y 800 mm de lluvia al año",
    "pregunta": "Si el lugar se enfría a 0 °C con la misma lluvia, ¿qué bioma aparece?",
    "opciones": [
      {
        "id": "a",
        "texto": "Desierto con cactus",
        "icono": "fa-sun-plant-wilt"
      },
      {
        "id": "b",
        "texto": "Tundra de alta montaña",
        "icono": "fa-snowflake"
      },
      {
        "id": "c",
        "texto": "Selva húmeda más densa",
        "icono": "fa-tree"
      }
    ],
    "correcta": "b",
    "porque": "El frío extremo limita la vida: bajo ~2 °C no crecen árboles y solo resisten pastos duros, musgos y líquenes. La lluvia cae como nieve.",
    "comoComprobarlo": "Baja la temperatura con el deslizador sin tocar la lluvia y observa el diorama y el termómetro."
  },
  "biomoleculas-cuatro-clases": {
    "escena": "Un monómero de glucosa girando en 3D y un deslizador de uniones en cero.",
    "pregunta": "Si subes las uniones y se juntan más glucosas, ¿qué se libera en cada unión?",
    "opciones": [
      {
        "id": "a",
        "texto": "Una molécula de agua",
        "icono": "fa-droplet"
      },
      {
        "id": "b",
        "texto": "Una molécula de oxígeno",
        "icono": "fa-wind"
      },
      {
        "id": "c",
        "texto": "No se libera nada",
        "icono": "fa-ban"
      }
    ],
    "correcta": "a",
    "porque": "Al unir dos monómeros se pierde un OH de uno y un H del otro: juntos forman H₂O. Por eso se llama condensación y ocurre en cada enlace nuevo del polímero.",
    "comoComprobarlo": "Sube el deslizador de uniones formadas y mira el dato «H₂O liberadas» y los enlaces verdes."
  },
  "biotecnologia-crispr-3d": {
    "escena": "Una hebra de ADN con su secuencia diana, la ARN guía encima y la proteína Cas9 lista para cortar.",
    "pregunta": "Deslizas la ARN guía dos bases fuera de la diana y pulsas «Cortar». ¿Qué hace Cas9?",
    "opciones": [
      {
        "id": "a",
        "texto": "Corta igual, con un pequeño error",
        "icono": "fa-scissors"
      },
      {
        "id": "b",
        "texto": "No corta: la guía ya no encaja",
        "icono": "fa-ban"
      },
      {
        "id": "c",
        "texto": "Corta en otro lugar del ADN",
        "icono": "fa-location-crosshairs"
      }
    ],
    "correcta": "b",
    "porque": "Cas9 solo corta donde la guía se aparea con todas sus bases y hay un PAM detrás. Si se desliza, la mayoría de las bases no encajan y la proteína no actúa: así se evitan cortes en lugares equivocados.",
    "comoComprobarlo": "Mueve el deslizador «Posición de la guía» a +2 o −2, pulsa «Cortar con Cas9» y observa cuántas bases de la guía quedan en rojo."
  },
  "busqueda-confiable": {
    "escena": "Un buscador de simulación con una tarea sobre el sueño de los adolescentes: palabras clave, operadores y una página de resultados con fuentes inventadas.",
    "pregunta": "Pones tres palabras clave y activas las comillas. ¿Qué pasa con los resultados?",
    "opciones": [
      {
        "id": "a",
        "texto": "Salen más resultados porque se amplía la búsqueda",
        "icono": "fa-arrow-up-right-dots"
      },
      {
        "id": "b",
        "texto": "Solo quedan las que traen todas",
        "icono": "fa-filter"
      },
      {
        "id": "c",
        "texto": "Se ordenan del más nuevo al más viejo",
        "icono": "fa-calendar"
      }
    ],
    "correcta": "b",
    "porque": "Las comillas piden que aparezcan todas las palabras juntas, así que el buscador descarta lo que solo coincide con una. Menos ruido, pero también menos opciones para comparar.",
    "comoComprobarlo": "Elige «sueño», «adolescentes» y «horas», cuenta los resultados, activa y desactiva las comillas y compara el número."
  },
  "campo-estudio-ingles": {
    "escena": "En una feria de carreras observas una estación, deduces el campo y lo describes en inglés con seis frases. Tres visitantes escuchan: cada uno atiende dos frases y se registra solo si las entiende.",
    "pregunta": "En la estación A, ¿qué pasa si dices «This area involves testing soil and planning healthy crops»?",
    "opciones": [
      {
        "id": "a",
        "texto": "Lucía se confunde y no se registra",
        "icono": "fa-face-frown-open"
      },
      {
        "id": "b",
        "texto": "Todos se registran: la gramática es correcta",
        "icono": "fa-users"
      },
      {
        "id": "c",
        "texto": "Solo duda la coordinadora de prácticas",
        "icono": "fa-briefcase"
      }
    ],
    "correcta": "a",
    "porque": "La frase está bien escrita, pero describe agronomía y la estación A es otro campo. A Lucía le importa justo qué hace la gente del campo; los otros dos escuchan otras frases y solo pierden un poco de interés.",
    "comoComprobarlo": "En «Career fair», estación A, observa tres objetos, elige esa opción en «This area involves…», completa las demás frases y presiona «Present to the visitors»."
  },
  "carreras-digitales": {
    "escena": "Ximena cursa cuatro semestres y en cada uno elige una actividad. Un radar de seis habilidades crece y los perfiles digitales se iluminan.",
    "pregunta": "Ximena solo elige actividades de programación. ¿Se ilumina el perfil de Desarrollo de software?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sí: con programar mucho basta",
        "icono": "fa-code"
      },
      {
        "id": "b",
        "texto": "No: también le falta trabajo en equipo",
        "icono": "fa-people-group"
      },
      {
        "id": "c",
        "texto": "No: le falta diseño visual",
        "icono": "fa-pen-ruler"
      }
    ],
    "correcta": "b",
    "porque": "Un perfil pide varias habilidades a la vez. Programar mucho sube un eje del radar, pero desarrollo también exige equipo y criterio: sin ese nivel, el perfil sigue bloqueado.",
    "comoComprobarlo": "En «Ruta de Ximena» elige en cada semestre la actividad de programación o de datos, toca el perfil de Desarrollo de software y compara el radar con su contorno punteado."
  },
  "casa-escuela-objetos-ingles-3d": {
    "escena": "La ventanilla de objetos perdidos: un estante con 3 mochilas, 4 loncheras, 4 estuches y 3 pelotas de distintos tamaños y colores.",
    "pregunta": "Dices solo «It's a backpack», sin tamaño ni color. ¿Qué pasa en el estante?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se ilumina solo tu mochila",
        "icono": "fa-bullseye"
      },
      {
        "id": "b",
        "texto": "Se iluminan varias y el encargado pide más datos",
        "icono": "fa-layer-group"
      },
      {
        "id": "c",
        "texto": "No se ilumina nada",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "Con solo el sustantivo coinciden todas las mochilas del estante. Para señalar una hace falta sumar rasgos: tamaño, forma y color, en ese orden en inglés.",
    "comoComprobarlo": "En «Lost and found», escribe «It's a backpack» y pulsa Decir; después agrega un color y vuelve a decirlo."
  },
  "causalidad-historica": {
    "escena": "Una explicación de la Revolución Mexicana armada con tres causas estructurales y el Plan de San Luis",
    "pregunta": "Si quitas el Plan de San Luis de una explicación completa, ¿qué pasa con su fuerza?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube, hay menos que explicar",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja, falta el detonante",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "No cambia",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Las causas estructurales preparan el terreno, pero el detonante explica por qué estalló en 1910. Sin la combinación, la explicación deja de ser multicausal y pierde fuerza.",
    "comoComprobarlo": "Agrega las cuatro causas válidas y luego quita solo el Plan de San Luis mientras miras el medidor."
  },
  "caverna-conocimiento-3d": {
    "escena": "Una caverna con un fuego detrás de los prisioneros. Entre el fuego y la pared llevan una figura de madera: puedes girarla, inclinarla y acercarla al fuego.",
    "pregunta": "Un cono de pie da sombra triangular. ¿Qué sombra da si lo inclinas 90° hacia el fuego?",
    "opciones": [
      {
        "id": "a",
        "texto": "Un círculo",
        "icono": "fa-circle"
      },
      {
        "id": "b",
        "texto": "Un triángulo más grande",
        "icono": "fa-caret-up"
      },
      {
        "id": "c",
        "texto": "Un cuadrado",
        "icono": "fa-square"
      }
    ],
    "correcta": "a",
    "porque": "Visto desde el fuego, el cono inclinado muestra su base redonda y la punta cae dentro de ella. Objetos distintos pueden dar la misma sombra: por eso los prisioneros no pueden saber qué la produce.",
    "comoComprobarlo": "Escoge Cono, pon Girar en 0° y mueve Inclinar de 0° a 90° mirando la sombra en la pared."
  },
  "celula-organelos-3d": {
    "escena": "Una célula animal en 3D que gira; puedes cambiar a vegetal y a procariota",
    "pregunta": "Al pasar de célula animal a vegetal, ¿qué estructuras nuevas aparecen?",
    "opciones": [
      {
        "id": "a",
        "texto": "Lisosomas en mayor cantidad y tamaño",
        "icono": "fa-circle"
      },
      {
        "id": "b",
        "texto": "Cloroplastos y pared celular",
        "icono": "fa-leaf"
      },
      {
        "id": "c",
        "texto": "Un segundo núcleo en el centro",
        "icono": "fa-circle-dot"
      }
    ],
    "correcta": "b",
    "porque": "Las células vegetales hacen fotosíntesis en sus cloroplastos y se sostienen con una pared celular rígida. Además tienen una gran vacuola central; los lisosomas son propios de la célula animal.",
    "comoComprobarlo": "Cambia entre Célula animal y Célula vegetal con los botones de arriba y compara la lista de organelos en la pestaña Organelos."
  },
  "centro-datos-huella-nube-3d": {
    "escena": "Un campus de servidores de 30 MW enfriado con aire exterior y agua evaporada. Un deslizador fija la temperatura del pasillo frío.",
    "pregunta": "Subes el pasillo frío de 18 a 26 °C, aún en rango seguro. ¿Qué pasa con el agua al año?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube: servidores más calientes exigen más agua",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja mucho: el aire de afuera alcanza más horas",
        "icono": "fa-droplet-slash"
      },
      {
        "id": "c",
        "texto": "Casi no cambia: el agua no depende de ese ajuste",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Con el pasillo más tibio, el aire exterior basta durante más horas del año y se evapora menos agua. Pasar de 18 a 26 °C la reduce cerca de 90 %, y el PUE también baja.",
    "comoComprobarlo": "Elige «Aire exterior + evaporación», mueve el deslizador del pasillo frío de 18 a 26 °C y observa «Agua al año» en el panel."
  },
  "ciclo-carbono": {
    "escena": "La Tierra con sus reservorios de carbono y una palanca de emisiones humanas de CO₂ puesta en 37 Gt al año.",
    "pregunta": "Si subes las emisiones al máximo, ¿qué pasa con el CO₂ que se queda en el aire?",
    "opciones": [
      {
        "id": "a",
        "texto": "Océano y bosques lo reabsorben todo",
        "icono": "fa-tree"
      },
      {
        "id": "b",
        "texto": "Se queda sin cambios",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Aumenta: los sumideros no alcanzan",
        "icono": "fa-temperature-arrow-up"
      }
    ],
    "correcta": "c",
    "porque": "Océano y bosques reabsorben solo un poco más de la mitad de lo que emitimos. El resto, cerca del 45 %, se acumula en la atmósfera y el CO₂ sube cada año.",
    "comoComprobarlo": "Arrastra la palanca de emisiones o usa el deslizador hacia arriba y mira el medidor «queda al aire» y el color de la atmósfera."
  },
  "circulo-unitario": {
    "escena": "Un círculo de radio 1 con un punto P que gira; su altura y su base se miden en dos barras.",
    "pregunta": "Si llevas P a 135°, ¿cómo quedan las barras de seno y coseno?",
    "opciones": [
      {
        "id": "a",
        "texto": "Seno positivo, coseno negativo",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "b",
        "texto": "Ambos positivos, igual que a 45°",
        "icono": "fa-plus"
      },
      {
        "id": "c",
        "texto": "Seno negativo, coseno positivo",
        "icono": "fa-arrows-up-down"
      }
    ],
    "correcta": "a",
    "porque": "A 135° el punto está arriba del eje horizontal (seno positivo) pero a la izquierda del eje vertical (coseno negativo). Las alturas son iguales a las de 45°, solo cambia el signo del coseno.",
    "comoComprobarlo": "Aplica el ángulo clave de 135° o arrastra P hasta el segundo cuadrante y observa hacia qué lado crece cada barra."
  },
  "ciudad-direcciones-ingles-3d": {
    "escena": "Un barrio en cuadrícula donde Sam sigue al pie de la letra la ruta que escribes",
    "pregunta": "Escribes «Turn left» donde la ruta pedía «Turn right». ¿Qué hace Sam?",
    "opciones": [
      {
        "id": "a",
        "texto": "Corrige el giro y llega al destino",
        "icono": "fa-wand-magic-sparkles"
      },
      {
        "id": "b",
        "texto": "Gira a su izquierda y se aleja",
        "icono": "fa-arrow-turn-up"
      },
      {
        "id": "c",
        "texto": "Se queda quieto en la esquina",
        "icono": "fa-hand"
      }
    ],
    "correcta": "b",
    "porque": "Sam no interpreta lo que querías decir: ejecuta cada indicación tal cual. Con «Turn left» gira a su izquierda y camina por otra calle, así que no llega.",
    "comoComprobarlo": "En Give directions, elige la tarea 1, escribe su ruta cambiando «Turn right» por «Turn left» y pulsa «Que Sam siga tus indicaciones»."
  },
  "clima-vestimenta-ingles-3d": {
    "escena": "Una plaza con cielo y termómetro. Puedes cambiar el clima (sunny, rainy, snowing…) y la temperatura con un deslizador.",
    "pregunta": "Eliges «snowing» y subes la temperatura al máximo. ¿Hasta dónde llega el termómetro?",
    "opciones": [
      {
        "id": "a",
        "texto": "Hasta 40 °C, como con sol",
        "icono": "fa-sun"
      },
      {
        "id": "b",
        "texto": "Solo unos pocos grados sobre 0 °C",
        "icono": "fa-temperature-low"
      },
      {
        "id": "c",
        "texto": "Hasta 20 °C, pero cae menos nieve",
        "icono": "fa-cloud"
      }
    ],
    "correcta": "b",
    "porque": "La nieve solo cae con el aire cerca o por debajo de 0 °C. Por eso, con «snowing» el termómetro del laboratorio se detiene en 2 °C.",
    "comoComprobarlo": "En «What's the weather like?» elige snowing y arrastra el deslizador de temperatura hasta el extremo derecho; mira el valor y la escena."
  },
  "comparativos-ingles": {
    "escena": "Lucía elige un teléfono: el Zeta cuesta $3,200 y el Orbi $6,900",
    "pregunta": "Dices «Zeta is more cheap than Orbi». ¿Qué hace Lucía?",
    "opciones": [
      {
        "id": "a",
        "texto": "Compra el Zeta sin dudar",
        "icono": "fa-cart-shopping"
      },
      {
        "id": "b",
        "texto": "Se confunde: la forma no existe",
        "icono": "fa-face-frown"
      },
      {
        "id": "c",
        "texto": "Compra el Orbi porque es más caro",
        "icono": "fa-mobile-screen-button"
      }
    ],
    "correcta": "b",
    "porque": "«Cheap» es un adjetivo corto: su comparativo lleva -er («cheaper»), no «more». Con una forma que no existe, Lucía no entiende y no compra nada.",
    "comoComprobarlo": "En la compra del teléfono toca la tarjeta Zeta, elige la ficha «more cheap» y pulsa «Say it to Lucía»."
  },
  "comunicacion-multimodal": {
    "escena": "Armas una publicación para una jornada de reciclaje y eliges texto, imagen, audio, color y diseño. Tres medidores cambian en vivo.",
    "pregunta": "Para el cartel de papel del mercado, ¿qué audio sube más el alcance?",
    "opciones": [
      {
        "id": "a",
        "texto": "Música de fondo muy animada",
        "icono": "fa-music"
      },
      {
        "id": "b",
        "texto": "Ninguno, el papel es mudo",
        "icono": "fa-volume-xmark"
      },
      {
        "id": "c",
        "texto": "Una locución clara y pausada",
        "icono": "fa-microphone"
      }
    ],
    "correcta": "b",
    "porque": "Un cartel impreso no reproduce sonido: el audio se pierde y baja el alcance. El canal decide qué modos sirven; la mejor combinación para papel es titular, imagen y contraste.",
    "comoComprobarlo": "Elige «Cartel del mercado», deja audio en «Sin audio» y luego prueba música y locución mientras miras el medidor de Alcance."
  },
  "concentracion-disolucion": {
    "escena": "Un vaso con 100 g de agua y sal de mesa, con una barra que marca cuánta sal cabe.",
    "pregunta": "Sigues agregando sal al agua. ¿Qué pasa con el porcentaje al rebasar el límite?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sigue subiendo sin parar",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Se queda fijo y la sal cae al fondo",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "c",
        "texto": "Empieza a bajar",
        "icono": "fa-arrow-trend-down"
      }
    ],
    "correcta": "b",
    "porque": "El agua solo disuelve una cantidad máxima de sal. Lo que sobra no entra en la disolución, queda como cristales, y el porcentaje ya no aumenta.",
    "comoComprobarlo": "Con sal y 100 g de agua, mueve el deslizador de soluto hacia la derecha y observa el porcentaje y el fondo del vaso."
  },
  "concordancia-conectores": {
    "escena": "Un aviso del 1.º B para la tutora, con una oración que dice «Los niños fue al parque»",
    "pregunta": "Si el verbo queda en singular y el sujeto en plural, ¿qué entiende la tutora?",
    "opciones": [
      {
        "id": "a",
        "texto": "Fue uno, no sabe quién",
        "icono": "fa-user"
      },
      {
        "id": "b",
        "texto": "Que fue todo el grupo ahí",
        "icono": "fa-users"
      },
      {
        "id": "c",
        "texto": "Lo entiende igual que si estuviera bien escrito",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "El verbo singular señala a una sola persona, aunque el sujeto sea plural. El lector queda con una duda: no sabe cuántos niños fueron ni cuáles.",
    "comoComprobarlo": "En «Escribe el aviso», cambia la forma de la primera oración entre fue, fueron y fuimos, y mira cuántos niños dibuja la tutora y si aparece el signo «?»."
  },
  "conicas-lugares-geometricos": {
    "escena": "Un plano con una circunferencia de radio 4 y un punto de prueba Q que se mueve con deslizadores; una barra compara su distancia al centro con el radio.",
    "pregunta": "Si Q queda a una distancia del centro igual al radio, ¿dónde está?",
    "opciones": [
      {
        "id": "a",
        "texto": "Dentro de la circunferencia",
        "icono": "fa-circle-dot"
      },
      {
        "id": "b",
        "texto": "Fuera de la circunferencia",
        "icono": "fa-arrow-up-right-from-square"
      },
      {
        "id": "c",
        "texto": "Justo sobre la curva",
        "icono": "fa-bullseye"
      }
    ],
    "correcta": "c",
    "porque": "La circunferencia es el conjunto de puntos que están a una misma distancia, el radio, del centro. Si la distancia de Q es menor queda dentro; si es mayor, fuera.",
    "comoComprobarlo": "Mueve los deslizadores de Q hasta que las dos barras de distancia midan lo mismo y mira dónde cae el punto."
  },
  "conjuntos-venn-3d": {
    "escena": "Un grupo de 40 estudiantes: 22 practican fútbol y 18 básquetbol. Un muñeco por estudiante se acomoda en dos círculos que se traslapan.",
    "pregunta": "Subes cuántos practican ambos deportes, sin cambiar F ni B. ¿Qué pasa con los que practican al menos uno?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aumentan, porque hay más estudiantes activos",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Disminuyen: se cuentan una sola vez",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "No cambian, F y B siguen igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "|F ∪ B| = |F| + |B| − |F ∩ B|. Al sumar F y B, los que practican ambos se cuentan dos veces; mientras más hay en la intersección, más se descuentan y la unión se achica.",
    "comoComprobarlo": "Abre el modo Encuesta, deja F en 22 y B en 18, y sube el deslizador «ambos» mirando la barra roja y el valor de F ∪ B."
  },
  "consejos-ingles": {
    "escena": "Cuatro amigos ficticios piden consejo. Armas la respuesta con un saludo, una forma (should, Don't, Why don't you…) y una acción, y su cara y su barra de ánimo reaccionan.",
    "pregunta": "Diego dice que se salta el desayuno. ¿Qué pasa si le dices «You should skip breakfast»?",
    "opciones": [
      {
        "id": "a",
        "texto": "Su ánimo sube porque le diste una orden clara",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja: le recomendaste algo que lo perjudica",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "No cambia: la gramática es correcta",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La forma «should + verbo» está bien, pero recomendaste justo lo que le hace daño. Para lo que no conviene hay que aconsejar en contra: You shouldn't… o Don't…",
    "comoComprobarlo": "En «Helpline» elige a Diego, la forma «You should + verb» y la acción «skip breakfast»; envía y compara su ánimo con «You shouldn't + verb»."
  },
  "conservacion-energia-pendulo": {
    "escena": "Un péndulo se suelta desde 45° y sus barras de energía suben y bajan",
    "pregunta": "Si cambias la masa a otra del doble, ¿qué pasa con la rapidez máxima?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se duplica",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "c",
    "porque": "La masa multiplica a la energía potencial y también a la cinética, así que se cancela. La rapidez abajo depende solo de la gravedad y de la altura de la que sueltas.",
    "comoComprobarlo": "Mueve el deslizador de Masa en Controles y compara la rapidez máxima y la energía E₀ en Lecturas."
  },
  "conservacion-materia": {
    "escena": "Una balanza con átomos de metano y oxígeno en un plato y los productos de la combustión en el otro.",
    "pregunta": "Si la combustión ocurre con el sistema abierto, ¿qué hace la balanza?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sigue nivelada siempre",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Baja del lado de los reactivos",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Baja del lado de los productos",
        "icono": "fa-arrow-down-long"
      }
    ],
    "correcta": "b",
    "porque": "La masa no desaparece, pero el CO₂ y el vapor de agua salen del plato. Lo que queda pesa menos, y por eso la balanza se inclina hacia los reactivos.",
    "comoComprobarlo": "Activa el icono del viento para abrir el sistema y avanza la reacción hasta el final; luego compara con el sistema cerrado."
  },
  "constructor-algoritmos": {
    "escena": "El robot Chispa en un pasillo largo de 7 casillas con el paquete al fondo, y un programa de solo 2 bloques.",
    "pregunta": "Armas «Repetir 3 veces: avanzar» una sola vez. ¿Dónde termina Chispa?",
    "opciones": [
      {
        "id": "a",
        "texto": "En el paquete, al fondo",
        "icono": "fa-box"
      },
      {
        "id": "b",
        "texto": "A medio camino, sin llegar",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "c",
        "texto": "Choca contra la pared",
        "icono": "fa-burst"
      }
    ],
    "correcta": "b",
    "porque": "Repetir 3 veces solo mueve tres casillas y el pasillo mide seis. El programa terminó antes de llegar: un algoritmo hace exactamente lo que dicen sus pasos, ni más ni menos.",
    "comoComprobarlo": "En el nivel 2 pon un solo bloque «Repetir 3 veces», pulsa Ejecutar y mira dónde se detiene Chispa."
  },
  "consumo-energetico-hogar-3d": {
    "escena": "Una casa de 2 pisos con 12 aparatos y su recibo bimestral. Los 8 focos son incandescentes de 60 W y se usan las mismas horas.",
    "pregunta": "Si cambias los 8 focos incandescentes por LED de 9 W, ¿cuánto baja lo que gastan los focos?",
    "opciones": [
      {
        "id": "a",
        "texto": "Cerca de la mitad",
        "icono": "fa-scale-balanced"
      },
      {
        "id": "b",
        "texto": "Casi nada, la luz es la misma",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Alrededor del 85 %",
        "icono": "fa-lightbulb"
      }
    ],
    "correcta": "c",
    "porque": "Un LED de 9 W da los mismos 800 lúmenes que un foco de 60 W. Con las mismas horas gasta 9/60 = 15 % de la energía: ahorras 85 %. La energía es potencia por tiempo.",
    "comoComprobarlo": "En «Mi casa y el recibo» toca los focos, anota sus kWh por bimestre, cambia el tipo de foco a LED y compara."
  },
  "contaminantes-plasticos-3d": {
    "escena": "Una costa en corte: playa, agua de mar y fondo. Un plástico cae desde arriba y una barra de tiempo lo va rompiendo en pedazos.",
    "pregunta": "Tiras al mar un trozo de PET, el plástico de las botellas. ¿Qué le pasa en el agua?",
    "opciones": [
      {
        "id": "a",
        "texto": "Flota en la superficie",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se hunde al fondo",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se disuelve en el agua",
        "icono": "fa-droplet"
      }
    ],
    "correcta": "b",
    "porque": "Flotar depende de la densidad. El PET (1.38 g/cm³) es más denso que el agua de mar (1.025 g/cm³), así que se hunde. Solo el PE y el PP, menos densos, quedan flotando.",
    "comoComprobarlo": "Elige PET con el código 1, escoge «Al mar» y pulsa Tirar. Después prueba con PE y compara dónde termina cada uno."
  },
  "continuidad-tres-condiciones": {
    "escena": "Una gráfica de la función a trozos f(x) = x si x < 2 y f(x) = x + 3 si x ≥ 2, con dos puntos a la misma distancia de x = 2.",
    "pregunta": "En la función de salto, al acercar x a 2, ¿qué pasa con los puntos azul y rosa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Llegan a la misma altura",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Quedan en alturas distintas",
        "icono": "fa-stairs"
      },
      {
        "id": "c",
        "texto": "Desaparecen de la gráfica",
        "icono": "fa-eye-slash"
      }
    ],
    "correcta": "b",
    "porque": "Por la izquierda la función se acerca a 2 y por la derecha a 5. Como los límites laterales son distintos, el límite no existe y la función es discontinua con un salto de 3.",
    "comoComprobarlo": "Elige «Salto», arrastra x hacia 2 y compara las alturas del punto azul y del rosa, o mira sus lecturas en el panel."
  },
  "convivencia-digital": {
    "escena": "En el chat del grupo del salón, Beto sube una foto burlona de Mauri y el grupo se ríe.",
    "pregunta": "Si reaccionas con 😂 a la foto para no quedar mal, ¿qué le pasa al clima del grupo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube, porque el grupo se relaja",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja y la foto la ve más gente",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "No cambia, es solo un emoji",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Cada reacción da más vida a la publicación: llega a más personas, el afectado se siente peor y hasta puede salirse del grupo. Reír también cuenta como participar.",
    "comoComprobarlo": "En «El grupo del salón», elige reaccionar con 😂 en la primera escena y mira los dos medidores; luego prueba hablarle a Beto en privado."
  },
  "correlacion-variables-3d": {
    "escena": "Dos torres de 50 estudiantes (hombres y mujeres) con fútbol y básquetbol, y un plano que marca la altura esperada si fueran independientes",
    "pregunta": "Subes de 30 a 45 los hombres que eligen fútbol y dejas a las mujeres en 30. ¿Qué verás?",
    "opciones": [
      {
        "id": "a",
        "texto": "Las fronteras se separan del plano esperado",
        "icono": "fa-arrows-up-down"
      },
      {
        "id": "b",
        "texto": "Ambas fronteras se quedan sobre el plano esperado",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "El plano sube por encima de los hombres",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "a",
    "porque": "Con 45 de 50 hombres y 30 de 50 mujeres, lo esperado es 37.5. La torre de hombres rebasa el plano y la de mujeres queda debajo: la preferencia depende del sexo, hay asociación.",
    "comoComprobarlo": "Mueve el deslizador de Hombres hasta 45, deja el de Mujeres en 30 y compara cada frontera con el plano."
  },
  "cortesia-conversacion-ingles-3d": {
    "escena": "En la cafetería ves a Carlos, un compañero al que no ves hace dos semanas. Tú abres la conversación y eliges qué decirle.",
    "pregunta": "Abres con «Move. I'm next.», una orden sin saludo. ¿Cómo reacciona Carlos?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sonríe y la cortesía sube al 100 %",
        "icono": "fa-face-smile"
      },
      {
        "id": "b",
        "texto": "Se incomoda y la cortesía cae a 0 %",
        "icono": "fa-face-frown"
      },
      {
        "id": "c",
        "texto": "Se confunde y la conversación se corta",
        "icono": "fa-circle-question"
      }
    ],
    "correcta": "b",
    "porque": "Una orden sin saludo suena agresiva: se califica como descortés, con cortesía 0 %. Carlos se incomoda y contesta «Wow. Hi to you too…». La conversación sigue, pero con el tubo de cortesía vacío.",
    "comoComprobarlo": "En «Carlos en la cafetería», elige la respuesta que empieza con «Move.» y observa el rostro de Carlos y el tubo de cortesía."
  },
  "crisis-sociales": {
    "escena": "Hay brote de dengue en la colonia y en el mes 2 debes decidir cómo responder",
    "pregunta": "Si multas a quien tiene agua estancada, ¿qué pasa con la confianza y la conflictividad?",
    "opciones": [
      {
        "id": "a",
        "texto": "La confianza sube: se ve que el gobierno actúa con firmeza",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "La confianza baja y la conflictividad sube",
        "icono": "fa-fire"
      },
      {
        "id": "c",
        "texto": "Casi nada cambia, solo se ajustan los casos",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Multar culpa a las personas por almacenar agua que el servicio no les da. Es violencia estructural: ignora la causa de fondo y rompe la confianza.",
    "comoComprobarlo": "En «Línea de tiempo de la crisis» llega al mes 2, elige la multa y mira las barras de confianza y conflictividad; reinicia y prueba otra respuesta."
  },
  "derechos-digitales": {
    "escena": "Tu cuenta de una app trae tu teléfono compartido con anunciantes, aunque lo diste solo para verificarte.",
    "pregunta": "Si ejerces cancelación sobre el teléfono, ¿qué pasa con tu cuenta?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solo dejan de compartirlo y todo sigue igual",
        "icono": "fa-check"
      },
      {
        "id": "b",
        "texto": "Deja de compartirse, pero pierdes verificación en dos pasos",
        "icono": "fa-lock-open"
      },
      {
        "id": "c",
        "texto": "Corrigen el número y lo vuelven a guardar",
        "icono": "fa-pen"
      }
    ],
    "correcta": "b",
    "porque": "Cancelar saca el dato de sus archivos, también el que la app necesita. Para frenar solo un uso y conservar el dato existe la oposición.",
    "comoComprobarlo": "En «Tu cuenta en la app», aplica la letra C al teléfono y observa el medidor de cuenta; luego prueba la O."
  },
  "derivada-secante-tangente": {
    "escena": "La parábola f(x) = x² con una secante que pasa por el punto de tangencia en x = 2 y por otro punto a distancia h.",
    "pregunta": "Si reduces h hacia 0, ¿a qué valor se acerca la pendiente de la secante?",
    "opciones": [
      {
        "id": "a",
        "texto": "A 0, la secante queda plana",
        "icono": "fa-minus"
      },
      {
        "id": "b",
        "texto": "A 4, la pendiente de la tangente",
        "icono": "fa-bullseye"
      },
      {
        "id": "c",
        "texto": "Crece sin límite",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "La pendiente de la secante es 4 + h. Cuando h se acerca a 0, vale cada vez más cerca de 4, que es f'(2) y la pendiente de la recta tangente en ese punto.",
    "comoComprobarlo": "Arrastra el deslizador de h hacia 0.05 y compara el medidor de la pendiente de la secante con el de la derivada."
  },
  "describir-personas-clima-ingles": {
    "escena": "Seis personas esperan en una parada bajo la lluvia y tu amigo no sabe cuál es Mariana",
    "pregunta": "Describes a Mariana con una frase bien armada en inglés. ¿Qué pasa con las seis personas?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aparecen personas nuevas en la parada",
        "icono": "fa-user-plus"
      },
      {
        "id": "b",
        "texto": "Se apagan las que no coinciden",
        "icono": "fa-user-slash"
      },
      {
        "id": "c",
        "texto": "Todas se quedan igual hasta el final",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Una frase correcta le da a tu amigo datos que entiende: estatura, cabello, lentes o ropa. Con cada dato descarta a quienes no encajan, y si la gramática falla no entiende y nadie se descarta.",
    "comoComprobarlo": "En «Find the person» elige primero la frase con is/has bien usados y luego la que mezcla has tall; compara cuántas personas siguen encendidas."
  },
  "descubrimiento-celula-3d": {
    "escena": "Una mesa con un microscopio óptico moderno y, a la derecha, el campo del ocular con bacterias. Se puede cambiar el aumento de 40× hasta 2000×.",
    "pregunta": "Pasas de 1000× a 2000× en un microscopio óptico. ¿Aparecen detalles más pequeños que antes?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sí, el doble de detalle",
        "icono": "fa-magnifying-glass-plus"
      },
      {
        "id": "b",
        "texto": "No, solo se agranda",
        "icono": "fa-expand"
      },
      {
        "id": "c",
        "texto": "Sí, pero solo con más luz",
        "icono": "fa-lightbulb"
      }
    ],
    "correcta": "b",
    "porque": "El detalle mínimo lo fija la luz: d = λ/(2·AN) ≈ 0.2 µm con el objetivo de 100×. Más aumento solo agranda la imagen borrosa; eso se llama aumento vacío.",
    "comoComprobarlo": "Elige «Óptico», la muestra de bacterias y mueve el aumento hasta 1000×; luego a 2000× y compara el detalle mínimo visible."
  },
  "diferencial-linealizacion": {
    "escena": "Una curva con su recta tangente y un punto que se mueve; una barra roja mide la brecha entre ambas",
    "pregunta": "Si alejas x del punto base, ¿qué pasa con el error de la tangente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Disminuye",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Crece",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "No cambia",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La tangente solo coincide con la curva en el punto base. Al alejarte, la curva se dobla y la recta sigue derecha, así que la brecha entre las dos crece.",
    "comoComprobarlo": "En Controles, mueve el deslizador de x hacia los dos extremos y mira la barra roja del medidor y la brecha en la escena."
  },
  "dilema-tranvia-etica-3d": {
    "escena": "El tranvía sin frenos en la variante de la palanca: puedes cambiar cuántas personas hay en la vía principal y cada corriente ética da su veredicto.",
    "pregunta": "En la palanca pasas de 1 a 5 personas en la vía. ¿Qué corrientes cambian su veredicto?",
    "opciones": [
      {
        "id": "a",
        "texto": "Utilitarismo y doble efecto",
        "icono": "fa-scale-unbalanced"
      },
      {
        "id": "b",
        "texto": "Todas las corrientes por igual",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Solo la deontología",
        "icono": "fa-gavel"
      }
    ],
    "correcta": "a",
    "porque": "Con una vida contra una, el utilitarismo no ve ventaja y el doble efecto no halla un bien proporcionado; con cinco, ambos permiten actuar. La deontología razona por dignidad, no por cantidad, y no cambia.",
    "comoComprobarlo": "Elige «La palanca», mueve el control «En la vía principal» de 1 a 5 personas y compara el veredicto de cada teoría."
  },
  "distribucion-normal": {
    "escena": "Una campana de estaturas con su media y su desviación, y un sombreado entre la media menos σ y la media más σ",
    "pregunta": "Si ensanchas σ al doble, ¿qué pasa con el área sombreada entre μ − σ y μ + σ?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se queda en 68 %, aunque la campana cambie",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Sube hasta casi 100 %",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "a",
    "porque": "Al ensanchar σ, la campana se aplana y el intervalo μ ± σ crece en la misma proporción. La fracción de datos que encierra sigue siendo la misma: 68 % en cualquier normal.",
    "comoComprobarlo": "En el modo Regla o Campana, mueve el deslizador de σ de un extremo a otro y mira la barra del área de μ ± σ."
  },
  "diversidad-discriminacion": {
    "escena": "Recorres siete escenas de una secundaria ficticia y decides qué ves y qué haces. Un medidor de convivencia sube o baja con cada decisión.",
    "pregunta": "Si ante una burla racista te ríes «una sola vez», ¿qué pasa con la convivencia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Casi nada: fue solo una vez",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Baja mucho: se normaliza",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "Sube: evitas un conflicto",
        "icono": "fa-arrow-trend-up"
      }
    ],
    "correcta": "b",
    "porque": "Sumarse a la burla la normaliza y refuerza el racismo: la persona afectada queda más sola. Evitar el conflicto no repara el daño; acompañar y pedir apoyo adulto sí.",
    "comoComprobarlo": "En la escena 3 («Apodos en el pasillo»), elige la tercera respuesta y observa el medidor de convivencia y la cara de Dani."
  },
  "division-celular": {
    "escena": "Una célula con 4 cromosomas (dos pares) lista para dividirse por meiosis, con un deslizador de fases.",
    "pregunta": "Llevas la meiosis hasta el final. ¿Cuántos cromosomas lleva cada célula hija, comparada con la madre?",
    "opciones": [
      {
        "id": "a",
        "texto": "Los mismos: 4 cada una",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "La mitad: 2 cada una",
        "icono": "fa-divide"
      },
      {
        "id": "c",
        "texto": "El doble: 8 cada una",
        "icono": "fa-xmark"
      }
    ],
    "correcta": "b",
    "porque": "En la meiosis los cromosomas se duplican una sola vez pero la célula se divide dos veces. Primero se separan los homólogos y luego las cromátidas, así que cada gameto queda con la mitad (n).",
    "comoComprobarlo": "Elige Meiosis, arrastra el deslizador «Fase» hasta Telofase II y lee «Cromosomas por célula»; luego haz lo mismo en Mitosis."
  },
  "ecuacion-cuadratica": {
    "escena": "Una parábola con a positivo, como un valle que corta el agua en dos puntos (dos raíces).",
    "pregunta": "Si subes c poco a poco, ¿qué les pasa a las dos raíces?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se alejan una de la otra",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "b",
        "texto": "Se acercan, se juntan y desaparecen",
        "icono": "fa-down-left-and-up-right-to-center"
      },
      {
        "id": "c",
        "texto": "No cambian, solo sube el vértice",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Subir c eleva todo el valle. El discriminante b² − 4ac baja: con Δ = 0 el vértice apenas toca el agua (raíz doble) y con Δ < 0 el valle ya no la alcanza.",
    "comoComprobarlo": "Arrastra el deslizador de c hacia arriba y vigila la aguja del discriminante cuando cruza el cero."
  },
  "ecuacion-lineal-balanza": {
    "escena": "Una balanza con una mochila y 3 kg de libros en un plato, y 8 kg en el otro, nivelada.",
    "pregunta": "Quitas 1 kg solo del plato izquierdo. ¿Qué hace la balanza?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sigue nivelada",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Se inclina hacia la derecha",
        "icono": "fa-arrow-right"
      },
      {
        "id": "c",
        "texto": "Se inclina hacia la izquierda",
        "icono": "fa-arrow-left"
      }
    ],
    "correcta": "b",
    "porque": "Al quitar peso de un solo lado, el plato izquierdo pesa menos que el derecho y sube. Se rompe la igualdad; por eso lo que haces de un lado debes hacerlo del otro.",
    "comoComprobarlo": "Pulsa «Quitar 1 solo a la izquierda» y observa el brazo y el medidor de la escena."
  },
  "ecuacion-lineal-barras": {
    "escena": "Una barra de bloques cuyo largo es 2x + 7 y una meta marcada en 23.",
    "pregunta": "Subes x de 5 a 10. ¿Qué pasa con la barra respecto a la meta?",
    "opciones": [
      {
        "id": "a",
        "texto": "Queda justo en la meta",
        "icono": "fa-bullseye"
      },
      {
        "id": "b",
        "texto": "Se pasa de la meta",
        "icono": "fa-arrow-right-long"
      },
      {
        "id": "c",
        "texto": "Sigue quedándose corta",
        "icono": "fa-arrow-left-long"
      }
    ],
    "correcta": "b",
    "porque": "Con x = 5 la barra mide 17, corta. Con x = 10 mide 2·10 + 7 = 27, que pasa de 23 por 4. La solución está entre ambos valores: x = 8.",
    "comoComprobarlo": "En «El número misterioso» mueve el deslizador de x a 5 y luego a 10, y mira el medidor y la barra."
  },
  "ecuacion-recta": {
    "escena": "Una recta y = 0.5x + 1 en el plano cartesiano que cruza el eje Y en (0, 1).",
    "pregunta": "Subes la pendiente m de 0.5 a 2 sin tocar b. ¿Qué pasa con el cruce en el eje Y?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube hasta y = 2",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se queda en (0, 1)",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Se corre hacia la derecha",
        "icono": "fa-arrow-right"
      }
    ],
    "correcta": "b",
    "porque": "La ordenada b es el valor de y cuando x = 0, y ahí m no pesa porque m·0 = 0. Cambiar m gira la recta alrededor de ese punto; solo b la desliza hacia arriba o abajo.",
    "comoComprobarlo": "Mueve el deslizador de pendiente m y observa la esfera dorada sobre el eje Y."
  },
  "electromagnetismo-ohm-faraday": {
    "escena": "Un circuito con una fuente y una resistencia; los electrones recorren el cable",
    "pregunta": "Con el mismo voltaje, si duplicas la resistencia, ¿qué pasa con la corriente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se hace el doble de grande",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda exactamente igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Según la ley de Ohm, I = V/R. Con V fijo, una resistencia el doble de grande deja pasar la mitad de corriente: los electrones avanzan más despacio.",
    "comoComprobarlo": "En Controles, deja la tensión como está y mueve el deslizador de resistencia R; mira los electrones y la lectura de corriente I."
  },
  "encuesta-lectora-comunidad": {
    "escena": "Una escuela ficticia con tres lugares donde puedes encuestar: biblioteca, patio y un sorteo en toda la escuela.",
    "pregunta": "Si encuestas solo a quien está en la biblioteca, ¿qué pasa con el porcentaje que dice leer por gusto?",
    "opciones": [
      {
        "id": "a",
        "texto": "Queda muy por encima del real",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Coincide con el de la escuela",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Queda por debajo del real",
        "icono": "fa-arrow-trend-down"
      }
    ],
    "correcta": "a",
    "porque": "La biblioteca reúne a quien ya lee. Esa muestra no se parece a toda la escuela, así que la barra se infla y la encuesta resulta sesgada.",
    "comoComprobarlo": "En «Aplica la encuesta» elige la biblioteca, deja la pregunta abierta, aplica y compara tu barra con la punteada de la escuela."
  },
  "energia-electricidad": {
    "escena": "Un circuito con pila, interruptor cerrado, un conductor y un foco con un medidor de potencia al lado.",
    "pregunta": "Si cambias la pila de 3 V a 9 V, ¿cuánto crece la potencia del foco?",
    "opciones": [
      {
        "id": "a",
        "texto": "Crece 3 veces",
        "icono": "fa-3"
      },
      {
        "id": "b",
        "texto": "Crece 9 veces",
        "icono": "fa-bolt"
      },
      {
        "id": "c",
        "texto": "Crece 2 veces",
        "icono": "fa-2"
      }
    ],
    "correcta": "b",
    "porque": "Con más voltaje circula más corriente (I = V/R) y además cada electrón lleva más energía. Como P = V·I, la potencia crece con el cuadrado del voltaje.",
    "comoComprobarlo": "Cierra el interruptor con cobre, elige 3 V y anota los watts; luego elige 9 V y compara la lectura del foco."
  },
  "energias-renovables-mexico-3d": {
    "escena": "La mezcla eléctrica de México en torres de colores y una nube de CO₂. Agregas 10 puntos de sol y viento y debes retirar combustibles fósiles.",
    "pregunta": "Con la misma energía solar y eólica agregada, ¿qué fósil conviene retirar primero para emitir menos?",
    "opciones": [
      {
        "id": "a",
        "texto": "El gas natural, por ser el más usado",
        "icono": "fa-fire-flame-simple"
      },
      {
        "id": "b",
        "texto": "El carbón y el combustóleo",
        "icono": "fa-smog"
      },
      {
        "id": "c",
        "texto": "Da igual cuál se retire",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Cada kWh de carbón emite unos 820 g de CO₂e y uno de gas, 490 g. Quitar primero lo más sucio evita más emisiones con la misma energía limpia: la nube se reduce más.",
    "comoComprobarlo": "En «Emisiones y agotamiento» sube solar 10 puntos, elige «carbón y combustóleo primero», anota las Mt y repite con el orden del gas."
  },
  "enlaces-quimicos": {
    "escena": "Dos átomos se acercan para unirse. Uno es sodio y el otro es cloro.",
    "pregunta": "Sodio y cloro tienen una ΔEN enorme. ¿Qué pasa con los electrones?",
    "opciones": [
      {
        "id": "a",
        "texto": "Los comparten por igual",
        "icono": "fa-handshake"
      },
      {
        "id": "b",
        "texto": "El sodio cede uno al cloro",
        "icono": "fa-right-left"
      },
      {
        "id": "c",
        "texto": "Los dos los pierden",
        "icono": "fa-circle-xmark"
      }
    ],
    "correcta": "b",
    "porque": "Con una ΔEN de 1.7 o más, el átomo más electronegativo arranca el electrón al otro. Así se forman Na⁺ y Cl⁻, iones de carga opuesta que se atraen: enlace iónico.",
    "comoComprobarlo": "En «Tu enlace», elige Na como átomo A y Cl como átomo B, y mira la escala de ΔEN y el electrón en la escena."
  },
  "entrevista-ingles": {
    "escena": "Una entrevista de beca en inglés: el entrevistador usa una palabra que no queda clara",
    "pregunta": "Si pides que aclare esa palabra antes de responder, ¿qué le pasa a tu impresión?",
    "opciones": [
      {
        "id": "a",
        "texto": "Baja: parece que no sabes suficiente inglés",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "b",
        "texto": "Sube: demuestra que escuchas",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "c",
        "texto": "No cambia: solo cuenta la respuesta final",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Pedir aclaración («Could you clarify what you mean by...?») muestra escucha activa y evita responder otra cosa. Adivinar el significado suele terminar fuera de tema, y el entrevistador anota que respondiste sin entender.",
    "comoComprobarlo": "En «Interview», llega a la pregunta 3 y pulsa «Pedir aclaración» antes de armar tu respuesta; luego repite la entrevista respondiendo sin aclarar y compara el medidor de Escucha y la impresión."
  },
  "entropia-segunda-ley": {
    "escena": "Una caja de vidrio dividida por una pared: gas azul a la izquierda, gas rojo a la derecha, y una barra de entropía al lado.",
    "pregunta": "Si quitas la pared, ¿qué le pasa a la barra de entropía?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube y se queda arriba",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja porque se ordenan",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "Sube y luego vuelve a bajar",
        "icono": "fa-wave-square"
      }
    ],
    "correcta": "a",
    "porque": "Mezclarse es mucho más probable que separarse solos. La energía y las partículas se dispersan, y la entropía total solo aumenta en un proceso espontáneo.",
    "comoComprobarlo": "En «Mezcla de gases» pulsa «Quitar la pared» y observa la barra; después espera unos segundos más."
  },
  "equilibrio-quimico": {
    "escena": "Un cilindro con gas pardo NO₂ y moléculas de N₂O₄ en equilibrio, con un pistón que puedes bajar.",
    "pregunta": "Aprietas el pistón y el gas se comprime. ¿Qué hacen las moléculas?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se separan más en NO₂ pardo",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "b",
        "texto": "Se unen en N₂O₄",
        "icono": "fa-link"
      },
      {
        "id": "c",
        "texto": "Nada: la presión no importa",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Al comprimir, el sistema se opone al aumento de presión y favorece el lado con menos moles de gas. Dos NO₂ forman un N₂O₄, así que las moléculas se unen y el pardo se aclara.",
    "comoComprobarlo": "En el modo Le Châtelier sube el deslizador de presión poco a poco y observa cómo cambian las moléculas del cilindro."
  },
  "espectro-electromagnetico": {
    "escena": "Un marcador recorre una barra del espectro, de ondas de radio a rayos gamma, con un medidor de energía",
    "pregunta": "Al subir la frecuencia de FM a rayos X, ¿qué pasa con la energía de cada fotón?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aumenta mucho",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Disminuye",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "La energía del fotón es proporcional a su frecuencia (E = h·f). Los rayos X vibran muchísimas más veces por segundo que una señal de FM, así que cada fotón lleva mucha más energía.",
    "comoComprobarlo": "Arrastra el deslizador de frecuencia en Controles de FM a Rayos X y vigila el medidor de energía de la esquina."
  },
  "estadistica-enganosa-3d": {
    "escena": "Dos barras del PIB per cápita sobre un eje que no empieza en cero; la segunda parece mucho más alta que la primera",
    "pregunta": "Si llevas el inicio del eje de la gráfica hasta cero, ¿qué pasa con la diferencia entre las barras?",
    "opciones": [
      {
        "id": "a",
        "texto": "La diferencia se ve mucho más pequeña",
        "icono": "fa-compress"
      },
      {
        "id": "b",
        "texto": "La diferencia se vuelve todavía mayor",
        "icono": "fa-expand"
      },
      {
        "id": "c",
        "texto": "Las dos barras quedan exactamente iguales",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Con el eje cortado, la barra mide solo lo que sobresale del corte y la diferencia se exagera. Desde cero, la altura es proporcional al valor y el cambio real, que es pequeño, se ve como es.",
    "comoComprobarlo": "Arrastra el deslizador «Dónde empieza el eje» desde el valor del titular hasta cero y compara la altura de las dos barras."
  },
  "estado-mexicano": {
    "escena": "Una comunidad sin agua lleva su caso por el tablero del Estado: tres niveles de gobierno y tres poderes",
    "pregunta": "El pozo se secó y hacen falta pipas hoy. Si acudes a la Suprema Corte, ¿qué pasa con el tinaco?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se llena más rápido por ser la máxima autoridad",
        "icono": "fa-bolt"
      },
      {
        "id": "b",
        "texto": "Sigue vacío y suben los días sin agua",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "c",
        "texto": "Se llena solo hasta la mitad",
        "icono": "fa-droplet"
      }
    ],
    "correcta": "b",
    "porque": "Cada poder tiene su función: la Corte interpreta la Constitución y no presta servicios. Llevar pipas le toca a quien ejecuta y administra en el municipio.",
    "comoComprobarlo": "En «Caso Las Palmas», en el paso 1 toca la Suprema Corte y mira el tinaco y el contador de días; luego prueba con otra institución."
  },
  "estados-materia": {
    "escena": "Una olla con agua sobre una estufa, con el fuego prendido y burbujas subiendo.",
    "pregunta": "El agua ya hierve y sigues calentando. ¿Qué pasa con su temperatura?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sigue subiendo, cada vez más rápido",
        "icono": "fa-temperature-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se queda quieta mientras hierve",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Baja porque se evapora el agua",
        "icono": "fa-temperature-arrow-down"
      }
    ],
    "correcta": "b",
    "porque": "Mientras hierve, el calor se usa para romper las fuerzas entre las partículas y pasarlas a gas, no para acelerarlas. Por eso la temperatura se mantiene en 100 °C hasta que todo se evapora.",
    "comoComprobarlo": "Con el agua, mueve el deslizador de calor hasta la zona sombreada de ebullición y mira la temperatura y la curva."
  },
  "estimacion-fermi-3d": {
    "escena": "Un salón lleno de canicas azules y una regla logarítmica que marca tu estimación. Cada factor tiene un deslizador.",
    "pregunta": "Si el diámetro de la canica se duplica, ¿cuántas canicas caben en el salón?",
    "opciones": [
      {
        "id": "a",
        "texto": "La mitad",
        "icono": "fa-divide"
      },
      {
        "id": "b",
        "texto": "Ocho veces menos",
        "icono": "fa-cube"
      },
      {
        "id": "c",
        "texto": "Cuatro veces menos",
        "icono": "fa-square"
      }
    ],
    "correcta": "b",
    "porque": "El volumen de una esfera crece con el cubo del diámetro: al duplicarlo, cada canica ocupa 2³ = 8 veces más espacio. Caben ocho veces menos, y tu estimación baja casi un orden de magnitud.",
    "comoComprobarlo": "En «Problemas de Fermi» elige «Canicas en un salón», anota tu estimación y mueve el deslizador del diámetro al doble. Compara la regla logarítmica."
  },
  "estructura-reaccion": {
    "escena": "La combustión del metano dibujada con moléculas y barras de átomos por elemento, con un control por coeficiente",
    "pregunta": "Si subes el coeficiente del O₂ de 2 a 3, ¿qué pasa con las barras de oxígeno?",
    "opciones": [
      {
        "id": "a",
        "texto": "Siguen iguales porque el subíndice no cambió",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Quedan 6 O contra 4: se descuadran",
        "icono": "fa-scale-unbalanced"
      },
      {
        "id": "c",
        "texto": "Los productos se ajustan solos para igualar",
        "icono": "fa-wand-magic-sparkles"
      }
    ],
    "correcta": "b",
    "porque": "El coeficiente multiplica todos los átomos de la sustancia: 3 × 2 = 6 átomos de O en los reactivos. Los productos siguen con 2 + 2 = 4, así que la materia ya no se conserva.",
    "comoComprobarlo": "En «Conservación», con Combustión del metano, mueve el deslizador de O₂ de 2 a 3 en «Experimenta» y compara las barras de oxígeno."
  },
  "estudio-edicion-digital-3d": {
    "escena": "Una foto de cámara de 64 × 48 píxeles y un logotipo de colores planos, cada uno armado con prismas, uno por píxel.",
    "pregunta": "Guardas la foto con compresión sin pérdida (RLE). ¿Qué pasa con el peso del archivo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Baja a menos de la mitad, como pasa con el logotipo",
        "icono": "fa-compress"
      },
      {
        "id": "b",
        "texto": "Crece: casi ningún píxel se repite",
        "icono": "fa-expand"
      },
      {
        "id": "c",
        "texto": "Queda igual: sin pérdida no cambia el peso",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "RLE guarda cada racha de píxeles iguales como una pareja (cuántos, qué color). El grano de la cámara casi no repite colores: cada racha mide un píxel y el conteo añade un byte, así que pesa más.",
    "comoComprobarlo": "Elige la foto, déjala a 24 bits en 64 × 48 y cambia «Guardar el archivo» a sin pérdida. Compara con el logotipo."
  },
  "etica-produccion-digital": {
    "escena": "Produces un video escolar en seis pasos. En cada uno puedes tomar un atajo o un camino responsable, y luego publicas.",
    "pregunta": "¿Qué versión conserva más vistas después de publicar: la de los atajos o la responsable?",
    "opciones": [
      {
        "id": "a",
        "texto": "La de los atajos: sube con más vistas",
        "icono": "fa-bolt"
      },
      {
        "id": "b",
        "texto": "La responsable: no pierde vistas",
        "icono": "fa-shield-halved"
      },
      {
        "id": "c",
        "texto": "Quedan iguales: las vistas no cambian",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El atajo suma vistas al principio, pero deja riesgos que se cobran: bajas, quejas y etiquetas de falso. La versión responsable crece menos de golpe, pero nadie se la quita.",
    "comoComprobarlo": "En «Estudio Lumbre» elige la opción llamativa en los seis pasos, publica y anota las vistas; luego produce otra versión con las demás opciones y compara."
  },
  "experiencias-recientes-ingles": {
    "escena": "La maestra Rivas del club de viajes te entrevista y anota tu vida en una línea de tiempo.",
    "pregunta": "Ella pregunta «Have you ever tried chapulines?» y tú dices «Yes, I did». ¿Qué anota?",
    "opciones": [
      {
        "id": "a",
        "texto": "Un alfiler a los 12 años",
        "icono": "fa-thumbtack"
      },
      {
        "id": "b",
        "texto": "Un «?»: no te entendió",
        "icono": "fa-circle-question"
      },
      {
        "id": "c",
        "texto": "Que nunca los probaste",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "Una pregunta con «Have you ever…» se contesta con el mismo auxiliar: «Yes, I have». «Yes, I did» mezcla present perfect con past simple, y la maestra no sabe qué ubicar.",
    "comoComprobarlo": "En «La entrevista del club», abre la primera pregunta, elige la respuesta que empieza con «Yes, I did» y mira el carril de Chapulines."
  },
  "exposicion-oral": {
    "escena": "Planeas una charla para un grupo ficticio de 28 estudiantes y una curva muestra su atención minuto a minuto.",
    "pregunta": "¿Qué hace caer más la atención del grupo en los argumentos?",
    "opciones": [
      {
        "id": "a",
        "texto": "Diapositivas llenas de texto leído",
        "icono": "fa-align-justify"
      },
      {
        "id": "b",
        "texto": "Hablar a unas 120 palabras por minuto",
        "icono": "fa-gauge"
      },
      {
        "id": "c",
        "texto": "Mostrar una imagen con una sola cifra",
        "icono": "fa-chart-pie"
      }
    ],
    "correcta": "a",
    "porque": "Si el público lee la diapositiva, deja de escucharte y la exposición se vuelve una lectura en voz alta. Los apoyos deben complementar lo que dices, no repetirlo ni sustituirlo.",
    "comoComprobarlo": "En «Apoyos» alterna entre las tres opciones y observa cómo cambia la curva en los momentos de Argumento 1, 2 y 3."
  },
  "extremos-inflexion": {
    "escena": "Una curva con cima y valle, y una sonda deslizable con su recta tangente verde",
    "pregunta": "Al llevar la sonda a la cima de la curva, ¿cómo queda la recta tangente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Muy inclinada hacia arriba",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Horizontal, con pendiente cero",
        "icono": "fa-minus"
      },
      {
        "id": "c",
        "texto": "Muy inclinada hacia abajo",
        "icono": "fa-arrow-trend-down"
      }
    ],
    "correcta": "b",
    "porque": "En una cima la curva deja de subir y empieza a bajar. Justo ahí la pendiente vale cero, así que la derivada toca el eje horizontal.",
    "comoComprobarlo": "Pulsa «Máximo local» y mira la flecha de la leyenda; luego mueve la sonda un poco a cada lado y observa el signo de f'."
  },
  "factores-produccion": {
    "escena": "Tortillería ficticia con 2 trabajadores, 1 máquina, 60 kg de maíz y organización nivel 1",
    "pregunta": "Contratas más trabajadores, pero no compras más maíz ni más máquinas. ¿Qué pasa con la producción?",
    "opciones": [
      {
        "id": "a",
        "texto": "Crece igual que el personal",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Casi no cambia",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Baja porque se estorban",
        "icono": "fa-arrow-trend-down"
      }
    ],
    "correcta": "b",
    "porque": "La producción la fija el factor más escaso. Sin más maíz ni máquinas, las manos extra no tienen con qué trabajar; solo suben los salarios y baja la ganancia.",
    "comoComprobarlo": "Sube los trabajadores con el deslizador y observa las barras de capacidad y la ganancia de hoy."
  },
  "factorizacion-area": {
    "escena": "Tienes 1 pieza x², 7 piezas x y 12 unidades para armar un rectángulo.",
    "pregunta": "¿Qué valores de p y q arman el rectángulo de x² + 7x + 12?",
    "opciones": [
      {
        "id": "a",
        "texto": "p = 2 y q = 6",
        "icono": "fa-table-cells"
      },
      {
        "id": "b",
        "texto": "p = 3 y q = 4",
        "icono": "fa-table-cells-large"
      },
      {
        "id": "c",
        "texto": "p = 1 y q = 7",
        "icono": "fa-ruler-combined"
      }
    ],
    "correcta": "b",
    "porque": "Los lados (x + p) y (x + q) piden p + q piezas x y p·q unidades. Solo 3 y 4 suman 7 y multiplican 12, así que no sobra ni falta ninguna pieza.",
    "comoComprobarlo": "En «Armar», elige x² + 7x + 12 y mueve p y q hasta que el contorno se ponga verde."
  },
  "falacias-logica": {
    "escena": "En el debate del consejo estudiantil, Emiliano dice que no le hagan caso a Valeria porque su mamá es maestra.",
    "pregunta": "Si nombras la falacia de ese mensaje y respondes con razones, ¿qué le pasa al público?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube, porque se examinan las razones",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja, porque contradices a un compañero",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "No cambia, solo importan los equipos",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Nombrar la falacia muestra que el mensaje no prueba nada, y responder a la idea con razones mejora el debate. El público premia eso y deja de premiar el ataque personal.",
    "comoComprobarlo": "En «El debate», nombra la falacia del primer mensaje y elige la respuesta con razones; luego repite el debate eligiendo contraatacar y compara el medidor del público."
  },
  "figuras-retoricas": {
    "escena": "Un cartel de jugo para estudiantes de secundaria necesita más impacto",
    "pregunta": "En la campaña del jugo, ¿qué figura da más impacto que las demás?",
    "opciones": [
      {
        "id": "a",
        "texto": "Hipérbole",
        "icono": "fa-up-right-and-down-left-from-center"
      },
      {
        "id": "b",
        "texto": "Hipérbaton",
        "icono": "fa-shuffle"
      },
      {
        "id": "c",
        "texto": "Ironía",
        "icono": "fa-masks-theater"
      }
    ],
    "correcta": "a",
    "porque": "A ese público le pesa más la emoción que la claridad. La hipérbole exagera y provoca emoción intensa; el hipérbaton aporta poca emoción y la ironía se entiende peor.",
    "comoComprobarlo": "En el «Estudio de carteles», elige la campaña del jugo y prueba las versiones una por una; compara la barra de impacto contra la meta."
  },
  "fision-nuclear-etica-3d": {
    "escena": "Un reactor de agua en ebullición, como el de Laguna Verde, funcionando estable. Un deslizador controla cuánto vapor hay en el núcleo.",
    "pregunta": "En este reactor, el agua hierve y aparece más vapor. ¿Qué le pasa a la potencia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube: hay más calor y más reacción",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja: el reactor se frena",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "No cambia, el vapor no influye",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "En un BWR el agua también modera los neutrones. Con más vapor hay menos moderador, caen las fisiones y k baja de 1. Es un freno natural; en el RBMK de Chernóbil ocurre al revés.",
    "comoComprobarlo": "En «Reacción en cadena» con tipo BWR, sube poco a poco el deslizador «Vapor en el núcleo» y vigila k y la gráfica de potencia."
  },
  "formas-energia-transformacion": {
    "escena": "Una cadena de aparatos transforma la energía y al final una columna mide la parte útil y el calor",
    "pregunta": "Si cambias de la planta hidroeléctrica al foco incandescente, ¿qué le pasa a la parte útil?",
    "opciones": [
      {
        "id": "a",
        "texto": "Casi toda se vuelve calor",
        "icono": "fa-fire"
      },
      {
        "id": "b",
        "texto": "Sube, porque el foco da luz",
        "icono": "fa-lightbulb"
      },
      {
        "id": "c",
        "texto": "Queda igual en ambos",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "El foco convierte en luz solo el 5% de la electricidad; el otro 95% se disipa como calor. La hidroeléctrica aprovecha cerca del 90%. La suma útil más calor siempre es la entrada.",
    "comoComprobarlo": "Usa la barra superior para elegir cada aparato y compara el tamaño de la parte verde y la naranja en la columna final."
  },
  "fracciones-porcentajes": {
    "escena": "Un pastel y una barra muestran 1/2, con un poste amarillo de referencia en la mitad de la barra.",
    "pregunta": "Si cambias a 3/6, ¿hasta dónde llena la barra respecto al poste?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se queda corta del poste",
        "icono": "fa-arrow-left"
      },
      {
        "id": "b",
        "texto": "Llega justo al poste",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Pasa más allá del poste",
        "icono": "fa-arrow-right"
      }
    ],
    "correcta": "b",
    "porque": "3/6 se simplifica a 1/2: son fracciones equivalentes, así que representan la misma parte del entero aunque estén repartidas en más rebanadas.",
    "comoComprobarlo": "Fija 1/2 como referencia, elige denominador 6 y sube el numerador hasta 3."
  },
  "fuentes-historicas": {
    "escena": "Un archivo con ocho fuentes sobre una crecida ficticia y una línea de tiempo del caso",
    "pregunta": "Marcas «Confiable» al periódico que defiende a la autoridad, junto a la carta y el libro. ¿Qué pasa en la línea de tiempo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Todo queda más corroborado",
        "icono": "fa-circle-check"
      },
      {
        "id": "b",
        "texto": "Aparecen hechos en disputa",
        "icono": "fa-code-compare"
      },
      {
        "id": "c",
        "texto": "No cambia nada",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El periódico tiene un interés y contradice a la carta, al objeto y a la fotografía. Al creerle, la línea de tiempo se divide: confiar sin revisar la intención abre disputas.",
    "comoComprobarlo": "Juzga la carta, el libro y el periódico como «Confiable» y compara la línea de tiempo con la del caso sin el periódico."
  },
  "funciones-concepto": {
    "escena": "Una máquina de funciones: el tiempo de un café se mueve en minutos y la gráfica marca la temperatura que sale.",
    "pregunta": "Si el café lleva 5 minutos en reposo, ¿qué temperatura sale de la máquina?",
    "opciones": [
      {
        "id": "a",
        "texto": "85 °C",
        "icono": "fa-temperature-high"
      },
      {
        "id": "b",
        "texto": "60 °C",
        "icono": "fa-temperature-half"
      },
      {
        "id": "c",
        "texto": "30 °C",
        "icono": "fa-temperature-low"
      }
    ],
    "correcta": "b",
    "porque": "El café sale a 90 °C y pierde 6 °C por minuto. En 5 minutos pierde 30 °C y queda en 90 − 30 = 60 °C. A cada entrada le toca una sola salida.",
    "comoComprobarlo": "Mueve el deslizador de entrada x hasta 5 min y lee el valor de «sale» junto al punto de la gráfica."
  },
  "funciones-variable-real": {
    "escena": "La parábola f(x) = x² − 4 con una sonda blanca en x = 1.5 y otra en x = −1.5.",
    "pregunta": "En f(x) = x² − 4, ¿a qué altura queda el punto gemelo en x = −1.5 respecto al de x = 1.5?",
    "opciones": [
      {
        "id": "a",
        "texto": "A la misma altura",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "A la altura contraria, debajo del eje",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Sobre el eje X, en y = 0",
        "icono": "fa-minus"
      }
    ],
    "correcta": "a",
    "porque": "Como (−x)² = x², elevar al cuadrado borra el signo y los dos puntos tienen el mismo valor. Eso hace la gráfica un espejo respecto al eje Y: una función par.",
    "comoComprobarlo": "Mueve la sonda x y compara las barras f(x) y f(−x) del medidor."
  },
  "galton-probabilidad-frecuencia": {
    "escena": "Un tablero de Galton: cada bola rebota en filas de clavos y cae en un cajón; las barras crecen con cada bola",
    "pregunta": "Si cada clavo manda la bola a la derecha 65 de cada 100 veces, ¿dónde se junta el montón?",
    "opciones": [
      {
        "id": "a",
        "texto": "En el centro, igual que siempre",
        "icono": "fa-align-center"
      },
      {
        "id": "b",
        "texto": "Corrido hacia la derecha",
        "icono": "fa-arrow-right"
      },
      {
        "id": "c",
        "texto": "Repartido parejo en todos los cajones",
        "icono": "fa-grip-lines"
      }
    ],
    "correcta": "b",
    "porque": "El cajón donde cae una bola depende de cuántas veces fue a la derecha. Con p = 0.65 eso pasa más seguido, así que la media n·p crece y el montón (y la curva teórica) se recorre a la derecha.",
    "comoComprobarlo": "En el tablero de Galton elige p = 0.65, suelta muchas bolas y compara dónde quedan la banda rosa y el cono amarillo."
  },
  "gas-ideal-piston": {
    "escena": "Un gas encerrado en un cilindro con pistón y un manómetro a un lado",
    "pregunta": "Si bajas el pistón y el volumen queda a la mitad, ¿qué pasa con la presión?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Se duplica",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "Casi no cambia",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Las mismas partículas quedan en la mitad del espacio y golpean las paredes el doble de seguido. Si la temperatura y la cantidad no cambian, P por V se mantiene constante.",
    "comoComprobarlo": "Con Temperatura y Cantidad sin tocar, arrastra el pistón hasta 5 L y mira el manómetro."
  },
  "generos-literarios": {
    "escena": "Una historia inventada sobre una vendedora de flores que halla una carta, lista para transformarse con tres decisiones.",
    "pregunta": "Eliges voz de «Los personajes» y forma «Escena». ¿Qué aparece en la vista previa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Un solo párrafo de narrador",
        "icono": "fa-align-left"
      },
      {
        "id": "b",
        "texto": "Diálogo entre personajes",
        "icono": "fa-masks-theater"
      },
      {
        "id": "c",
        "texto": "Versos cortos con ritmo",
        "icono": "fa-feather-pointed"
      }
    ],
    "correcta": "b",
    "porque": "El género dramático se escribe para representarse: el diálogo lleva la acción, se organiza en actos y escenas y las acotaciones indican lo que ocurre en el escenario.",
    "comoComprobarlo": "Pulsa «Los personajes», luego «Escena», y compara la vista previa con la que tenías antes."
  },
  "geometria-analitica": {
    "escena": "Dos puntos en el plano cartesiano unidos por un segmento, con su triángulo de catetos Δx y Δy.",
    "pregunta": "Si duplicas Δx y Δy a la vez, ¿qué le pasa a la pendiente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se duplica, igual que la distancia",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "No cambia, solo crece la distancia",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      }
    ],
    "correcta": "b",
    "porque": "La pendiente es Δy/Δx: si ambos se duplican, el cociente queda igual. La recta conserva su inclinación; en cambio la hipotenusa, la distancia, sí se duplica.",
    "comoComprobarlo": "Pon P₁ en (0, 0) y P₂ en (2, 1), anota m y d; luego lleva P₂ a (4, 2) y compara las lecturas."
  },
  "gravitacion-universal": {
    "escena": "La Tierra y la Luna con flechas de atracción; una barra mide la fuerza según la distancia",
    "pregunta": "Si duplicas la distancia entre la Tierra y la Luna, ¿qué pasa con la fuerza?",
    "opciones": [
      {
        "id": "a",
        "texto": "Baja exactamente a la mitad",
        "icono": "fa-divide"
      },
      {
        "id": "b",
        "texto": "Cae a la cuarta parte",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se duplica",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "La distancia está elevada al cuadrado en F = G·M·m/r². Si r se duplica, r² se multiplica por 4 y la fuerza se divide entre 4: es la ley del inverso del cuadrado.",
    "comoComprobarlo": "En modo Fuerza, toca «Duplicar la distancia» o mueve el deslizador de r y compara la barra del medidor con la marca blanca del problema."
  },
  "gustos-opiniones-ingles-3d": {
    "escena": "La Feria de Gustos: seis compañeros esperan en fila y tú les preguntas «Do you like playing video games?». Según su respuesta se acercan al puesto o se alejan, y la gráfica de barras se llena.",
    "pregunta": "Preguntas «Do you like playing video games?» a los seis. ¿Cuántos suben la barra verde de like?",
    "opciones": [
      {
        "id": "a",
        "texto": "Cuatro",
        "icono": "fa-thumbs-up"
      },
      {
        "id": "b",
        "texto": "Cinco, porque «I don't mind» también es gusto",
        "icono": "fa-face-meh"
      },
      {
        "id": "c",
        "texto": "Seis, a todos les gusta algo",
        "icono": "fa-people-group"
      }
    ],
    "correcta": "a",
    "porque": "Luis, Jorge, Daniela y Emiliano dicen like, really like o love. Paola responde «I don't mind», que es neutro (barra amarilla), y Ana «I don't like» (barra roja).",
    "comoComprobarlo": "Elige el puesto Video games, pregúntale a cada compañero «Do you like playing video games?» y cuenta la barra verde."
  },
  "habilidades-permisos-ingles-3d": {
    "escena": "Seis personas esperan en el pasillo de un centro comunitario; Ximena está elegida y tú escribes una pregunta con «Can you…?» sobre una habilidad.",
    "pregunta": "A Ximena le preguntas «Can you play basketball?». ¿Qué verás en la cancha?",
    "opciones": [
      {
        "id": "a",
        "texto": "Encesta la canasta y dice «Yes, I can»",
        "icono": "fa-basketball"
      },
      {
        "id": "b",
        "texto": "Falla y dice «No, I can't»",
        "icono": "fa-circle-xmark"
      },
      {
        "id": "c",
        "texto": "Se encoge de hombros sin entender",
        "icono": "fa-circle-question"
      }
    ],
    "correcta": "b",
    "porque": "La pregunta está bien formada, así que Ximena la entiende y responde según lo que sabe hacer. Ella nada, pero no juega basquetbol: lo intenta, el balón no entra y contesta que no puede.",
    "comoComprobarlo": "Deja a Ximena elegida, escribe la pregunta tal cual y pulsa Preguntar; luego repítela con otra persona y compara qué pasa en la cancha."
  },
  "habitos-comparaciones-ingles": {
    "escena": "Ana necesita llegar rápido al museo y tú le contestas con una oración en inglés.",
    "pregunta": "Dices «The subway is the most fast way». ¿Qué hace Ana?",
    "opciones": [
      {
        "id": "a",
        "texto": "Toma el metro, te entiende igual",
        "icono": "fa-train-subway"
      },
      {
        "id": "b",
        "texto": "No te entiende y toma el camión",
        "icono": "fa-bus"
      },
      {
        "id": "c",
        "texto": "Se va en bicicleta",
        "icono": "fa-bicycle"
      }
    ],
    "correcta": "b",
    "porque": "«fast» es de una sílaba y su superlativo es the fastest. Una oración mal armada confunde a quien escucha, y con prisa elige lo primero que pasa.",
    "comoComprobarlo": "En «El sábado de Ana», elige esa oración en la primera situación y mira a qué barra señala Ana."
  },
  "habitos-contexto-ingles": {
    "escena": "Lucía, de Puebla, llega de intercambio a Maple Falls, un pueblo frío donde el autobús escolar pasa a las 7:00. Su agenda de la semana sigue siendo la misma que tenía en casa.",
    "pregunta": "Con exactamente los mismos hábitos, ¿qué le pasa a su energía en Maple Falls?",
    "opciones": [
      {
        "id": "a",
        "texto": "Baja: el contexto cambia el costo de cada hábito",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Queda igual, porque los hábitos no cambiaron",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Sube, porque en un pueblo pequeño se descansa más",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "a",
    "porque": "En Maple Falls el autobús pasa a las 7:00 y el pueblo va una hora adelante de Puebla: dormirse tarde y chatear de noche cuestan más energía allá. El mismo hábito tiene otra consecuencia en otro contexto.",
    "comoComprobarlo": "En «My week», sin mover ningún día de la agenda, cambia el contexto entre Puebla y Maple Falls y mira el medidor de energía."
  },
  "hardware-software": {
    "escena": "Una PC para Valeria, que edita video: procesador de 4 núcleos, SSD de 512 GB, tarjeta media, Windows y 8 GB de RAM.",
    "pregunta": "Instalas su editor de video con solo 8 GB de RAM. ¿Qué pasa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Abre, pero va un poco lento",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "b",
        "texto": "No abre: pide más memoria",
        "icono": "fa-circle-xmark"
      },
      {
        "id": "c",
        "texto": "Abre sin imagen",
        "icono": "fa-eye-slash"
      }
    ],
    "correcta": "b",
    "porque": "Cada programa pide una memoria RAM mínima para trabajar. Si el equipo no la tiene, el software no arranca: no importa qué tan buenas sean las demás piezas.",
    "comoComprobarlo": "Elige la RAM de 8 GB, instala la app de Valeria y mira el monitor; luego cambia a 16 GB."
  },
  "hecho-opinion-texto": {
    "escena": "Un anuncio de cuadernos mezcla precio, material y frases como «el cuaderno que todo estudiante merece». A un lado se mide qué hay en el texto.",
    "pregunta": "Si etiquetas «es el cuaderno que todo estudiante merece» como información, ¿qué pasa con la lectura del anuncio?",
    "opciones": [
      {
        "id": "a",
        "texto": "Parece más confiable de lo que es",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se vuelve más persuasivo",
        "icono": "fa-bullhorn"
      },
      {
        "id": "c",
        "texto": "No cambia, es una frase más",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Una opinión no se puede comprobar. Al llamarla información, sube la parte comprobable del texto y el veredicto sugiere decidir con datos cuando en realidad te están empujando.",
    "comoComprobarlo": "En «Etiqueta el texto», abre el anuncio, etiqueta esa frase como Información y observa la barra de composición y el veredicto; luego etiquétala como Opinión."
  },
  "herramientas-colaborativas": {
    "escena": "Una semana de proyecto de cuatro estudiantes que escriben juntos un informe en un documento compartido en línea.",
    "pregunta": "Si todos pueden editar y el historial de versiones está apagado, ¿qué pasa el martes?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se pisan ediciones y se pierde trabajo",
        "icono": "fa-triangle-exclamation"
      },
      {
        "id": "b",
        "texto": "El documento se protege solo contra borrados accidentales",
        "icono": "fa-shield-halved"
      },
      {
        "id": "c",
        "texto": "Nadie puede escribir hasta que el docente autorice",
        "icono": "fa-lock"
      }
    ],
    "correcta": "a",
    "porque": "Con edición simultánea y sin historial, dos personas cambian el mismo párrafo y lo borrado no se recupera. Los roles y el historial de versiones evitan ese problema.",
    "comoComprobarlo": "Elige documento compartido para escribir y compara los conflictos con «Todos editan» sin historial, y luego con «Redactan y comentan» y el historial activado."
  },
  "hidrosfera-atmosfera-3d": {
    "escena": "Una parcela de aire cálido del Golfo de México sube por la ladera de la sierra hacia Perote, con la temperatura y la humedad ajustables.",
    "pregunta": "Si el aire del Golfo está mucho más seco, ¿dónde se forma la nube al subir?",
    "opciones": [
      {
        "id": "a",
        "texto": "Más abajo, casi al nivel del mar",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Más arriba, o ya no se forma",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "En el mismo lugar: la humedad no influye",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El vapor se condensa cuando el aire se enfría hasta su punto de rocío. Con aire seco el punto de rocío es bajo, así que debe subir mucho más para enfriarse tanto, o nunca lo alcanza.",
    "comoComprobarlo": "En «Aire y agua se mezclan», baja la humedad relativa de 80 % a 30 %, suelta la parcela y compara dónde aparece la base de la nube."
  },
  "hipotesis-historicas": {
    "escena": "Estás investigando la Revolución de 1910 y consultas una fuente muy antigua",
    "pregunta": "Si consultas el Códice Mendoza (siglo XVI) para explicar la Revolución de 1910, ¿qué hace el medidor?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube mucho a favor",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "No se mueve",
        "icono": "fa-minus"
      },
      {
        "id": "c",
        "texto": "Baja en contra",
        "icono": "fa-arrow-trend-down"
      }
    ],
    "correcta": "b",
    "porque": "El códice es de otro período y otro tema: no dice nada sobre la hipótesis. La fuente es valiosa, pero fuera de contexto solo gasta una consulta.",
    "comoComprobarlo": "En el «Tablero de investigación», caso de la Revolución, elige una hipótesis y consulta la tarjeta del Códice Mendoza; mira el medidor."
  },
  "historia-de-vida-relato": {
    "escena": "Entrevistas a una abuela ficticia y solo puedes hacer cuatro preguntas",
    "pregunta": "¿Qué combinación de preguntas deja un relato con hecho, imagen y sentido?",
    "opciones": [
      {
        "id": "a",
        "texto": "Edad, nietos y su opinión de los jóvenes",
        "icono": "fa-hashtag"
      },
      {
        "id": "b",
        "texto": "Un suceso, un detalle y su significado",
        "icono": "fa-heart-pulse"
      },
      {
        "id": "c",
        "texto": "Solo detalles: la cocina y el camino",
        "icono": "fa-house"
      }
    ],
    "correcta": "b",
    "porque": "Un relato necesita las tres capas: lo que pasó, cómo se veía y qué cambió en quien lo vivió. Solo datos, opiniones o solo descripción dejan un medidor vacío.",
    "comoComprobarlo": "En «Entrevista» haz primero preguntas de datos y mira los tres medidores; luego reinicia y combina una pregunta de cada tipo."
  },
  "ideas-clave-subrayado": {
    "escena": "Un artículo de tres párrafos trae, mezcladas, oraciones que sostienen la idea, ejemplos y comentarios sueltos. A un lado se arma tu resumen.",
    "pregunta": "Si además de las ideas subrayas una opinión personal del autor, ¿qué le pasa a tu resumen?",
    "opciones": [
      {
        "id": "a",
        "texto": "Queda más completo y más preciso",
        "icono": "fa-circle-plus"
      },
      {
        "id": "b",
        "texto": "Se infla con palabras que no informan",
        "icono": "fa-maximize"
      },
      {
        "id": "c",
        "texto": "Se queda igual, el relleno no cuenta",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El relleno no informa sobre el tema, pero si lo subrayas entra al resumen: se alarga, se acerca al texto original y el medidor marca palabras de ruido.",
    "comoComprobarlo": "En «Subraya y mira el resumen», toma el marcador de idea principal y toca la oración de gusto personal de un párrafo; observa el medidor de largo."
  },
  "inecuaciones-lineales": {
    "escena": "Un rayo verde sobre la recta numérica muestra la solución de 3x − 5 > 7",
    "pregunta": "Si cambias el coeficiente a de 3 a −3, ¿hacia dónde apunta el rayo verde?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sigue hacia la derecha",
        "icono": "fa-arrow-right"
      },
      {
        "id": "b",
        "texto": "Se voltea hacia la izquierda",
        "icono": "fa-arrow-left"
      },
      {
        "id": "c",
        "texto": "Desaparece de la recta",
        "icono": "fa-eye-slash"
      }
    ],
    "correcta": "b",
    "porque": "Al dividir entre un número negativo el signo de la desigualdad se invierte: −3x − 5 > 7 se resuelve como x < −4, y el rayo va hacia los valores menores.",
    "comoComprobarlo": "En Controles baja el deslizador de a por debajo de cero y observa el rayo verde y el símbolo de la solución."
  },
  "innovaciones-ambientales-3d": {
    "escena": "Una costa con mar, tres zonas de inundación, un pueblo y una ola de tormenta de 1.5 m. Plantas cada especie de mangle en su zona, con un cinturón ancho.",
    "pregunta": "Lanzas la ola recién plantado el manglar (0 años). ¿Qué altura llega al pueblo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Muy baja: el manglar la frena por completo",
        "icono": "fa-shield-halved"
      },
      {
        "id": "b",
        "texto": "Casi 1.5 m: el manglar aún es joven",
        "icono": "fa-seedling"
      },
      {
        "id": "c",
        "texto": "Más de 1.5 m: los troncos la empujan",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "Los mangles frenan la ola con sus troncos y raíces, que tardan unos 15 años en madurar. Recién plantados son muy delgados y casi no disipan energía, aunque estén en la zona correcta.",
    "comoComprobarlo": "En «Restaurar el manglar», planta cada especie en su zona, sube el ancho a 400 m, deja los años en 0 y lanza la ola. Luego sube los años a 20 y repite."
  },
  "instrucciones-ingles": {
    "escena": "Una pantalla escolar con tres botones de colores",
    "pregunta": "Si ordenas «Click the button.» sin más datos, ¿qué botón pulsa la máquina?",
    "opciones": [
      {
        "id": "a",
        "texto": "El primero que lee: el rojo",
        "icono": "fa-hand-pointer"
      },
      {
        "id": "b",
        "texto": "El que tú imaginabas al escribir",
        "icono": "fa-brain"
      },
      {
        "id": "c",
        "texto": "Ninguno, antes te pide más datos",
        "icono": "fa-ban"
      }
    ],
    "correcta": "a",
    "porque": "La máquina obedece al pie de la letra. Si tu frase alcanza a varios elementos, toma el primero que lee, aunque sea el de borrar.",
    "comoComprobarlo": "En «Da la instrucción» elige Click y «the button», sin detalle, y pulsa Ejecutar; luego agrega un color."
  },
  "jerarquia-operaciones-3d": {
    "escena": "Una torre de pasos con la expresión 2 + 3 × 4: cada operación es un botón y, al tocarla, baja un renglón.",
    "pregunta": "En 2 + 3 × 4, ¿qué pasa si tocas primero la suma?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sale 14, igual que de la otra forma",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Sale 20: la torre marca que no toca",
        "icono": "fa-triangle-exclamation"
      },
      {
        "id": "c",
        "texto": "No pasa nada, el botón no responde",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "La multiplicación tiene mayor jerarquía y va antes que la suma. Si sumas primero haces 5 × 4 = 20, un resultado equivocado; lo correcto es 3 × 4 = 12 y luego 2 + 12 = 14.",
    "comoComprobarlo": "En «Torre de pasos» elige la expresión 2 + 3 × 4 y toca el signo + antes que el ×; lee el aviso y el resultado que aparece."
  },
  "juventudes-politicas": {
    "escena": "El Colectivo Raíces Jóvenes quiere salvar su centro juvenil y tiene cuatro semanas para convencer al cabildo.",
    "pregunta": "Si en la primera semana solo lanzan un hashtag, ¿qué pasa con su incidencia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube mucho, porque llega a más gente",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Casi no se mueve",
        "icono": "fa-minus"
      },
      {
        "id": "c",
        "texto": "Se duplica por la presión",
        "icono": "fa-bolt"
      }
    ],
    "correcta": "b",
    "porque": "Las redes aumentan el alcance, pero sin acciones en persona detrás no obligan a la autoridad a decidir. El activismo digital rinde más cuando se articula con movilización concreta.",
    "comoComprobarlo": "En «Colectivo en acción», elige solo la campaña de redes en la semana 1 y observa la barra de incidencia; luego reinicia y haz antes una asamblea."
  },
  "kit-herramientas-digitales": {
    "escena": "Tres compañeros redactan el mismo informe y tienen que decidir cómo escribirlo juntos",
    "pregunta": "Si cada quien escribe en su archivo y los mandan por correo, ¿qué medidor baja más?",
    "opciones": [
      {
        "id": "a",
        "texto": "Las horas libres",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "b",
        "texto": "La colaboración del equipo",
        "icono": "fa-people-group"
      },
      {
        "id": "c",
        "texto": "La calidad de las fuentes",
        "icono": "fa-medal"
      }
    ],
    "correcta": "b",
    "porque": "Las versiones sueltas se cruzan: nadie sabe cuál es la última y se pisan los cambios. Un documento compartido evita justo eso.",
    "comoComprobarlo": "En «La entrega del viernes» avanza hasta la etapa de redactar y elige archivos por correo; compara los tres medidores antes y después."
  },
  "lectura-campo-ingles": {
    "escena": "Un folleto turístico en inglés dice a qué hora sale el autobús del tour. Es domingo y tienes 45 segundos de lectura.",
    "pregunta": "Con scanning encuentras «8:40 a.m.» y «8:10 a.m.». ¿A qué hora llegas a la terminal?",
    "opciones": [
      {
        "id": "a",
        "texto": "A las 8:25 a.m.",
        "icono": "fa-clock"
      },
      {
        "id": "b",
        "texto": "A las 7:55 a.m.",
        "icono": "fa-person-walking-luggage"
      },
      {
        "id": "c",
        "texto": "A las 8:40 a.m.",
        "icono": "fa-bus"
      }
    ],
    "correcta": "b",
    "porque": "8:40 es el horario de lunes a sábado. La oración siguiente empieza con «However»: los domingos sale a las 8:10, y el folleto pide llegar 15 minutos antes. El scanning encuentra las horas; la lectura detallada dice cuál aplica.",
    "comoComprobarlo": "En «Read & decide», abre el caso 4, usa la lupa «Numbers», lee con detalle las oraciones donde brillan las horas y elige tu hora de llegada."
  },
  "lectura-critica-postura": {
    "escena": "Una columna de opinión cita a «todos los especialistas» y a un sobrino que reprobó",
    "pregunta": "Al marcar sus frases sin fuente, ¿qué le pasa al medidor de solidez?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube, porque suenan convincentes",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja, porque no se pueden comprobar",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "No cambia, solo importan las opiniones",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Lo que pesa en un argumento es lo que se puede comprobar. Las frases sin fuente se agrietan y el techo de la conclusión se hunde.",
    "comoComprobarlo": "En «Lee la columna» marca la frase de la encuesta como dato con fuente y luego la de «todos los especialistas» como afirmación sin fuente; mira el medidor."
  },
  "lectura-en-voz-alta": {
    "escena": "Una oyente ficticia escucha un fragmento mientras ves la onda de la lectura",
    "pregunta": "Si lees el primer fragmento más rápido de lo recomendado, ¿qué le pasa a la oyente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Entiende mejor porque termina antes",
        "icono": "fa-forward"
      },
      {
        "id": "b",
        "texto": "Se pierde y comprende menos",
        "icono": "fa-circle-question"
      },
      {
        "id": "c",
        "texto": "Solo cambia la duración total",
        "icono": "fa-stopwatch"
      }
    ],
    "correcta": "b",
    "porque": "Al acelerar, las palabras casi se juntan en la onda y la oyente no alcanza a procesarlas. Leer deprisa ahorra tiempo, pero cuesta comprensión.",
    "comoComprobarlo": "En «Ajusta el ritmo», mueve la velocidad de lectura hacia el extremo acelerado y observa el medidor y la cara de la oyente."
  },
  "lectura-escritura-dialogo": {
    "escena": "Una cronista ficticia muestra un borrador de cinco frases y tú puedes comentar cada una al margen.",
    "pregunta": "Comentas «Está muy bien» sobre una frase vaga. ¿Qué hace la autora con esa frase?",
    "opciones": [
      {
        "id": "a",
        "texto": "La reescribe con más detalle",
        "icono": "fa-pen"
      },
      {
        "id": "b",
        "texto": "La deja igual y pide algo más concreto",
        "icono": "fa-comment-dots"
      },
      {
        "id": "c",
        "texto": "La borra del borrador",
        "icono": "fa-trash"
      }
    ],
    "correcta": "b",
    "porque": "Un elogio no dice qué le falta a la frase. La autora solo cambia el texto cuando el comentario nombra el problema: confusión, falta de pruebas, de voz o de propósito.",
    "comoComprobarlo": "En «Dialoga con la autora» toca la primera frase, envía «Está muy bien» y luego «No entiendo esto»; compara la frase y las barras."
  },
  "lenguaje-algebraico-mosaicos": {
    "escena": "Mosaicos que representan 2x + 3: dos tiras verdes de x y tres cuadritos dorados de 1.",
    "pregunta": "Si subes x de 3 a 8, ¿qué mosaicos cambian de tamaño?",
    "opciones": [
      {
        "id": "a",
        "texto": "Todos, también los cuadritos de 1",
        "icono": "fa-expand"
      },
      {
        "id": "b",
        "texto": "Solo las tiras de x",
        "icono": "fa-ruler-horizontal"
      },
      {
        "id": "c",
        "texto": "Ninguno; solo cambia el resultado",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "x es una longitud desconocida: al cambiarla, las tiras de x (y los cuadrados x²) se estiran. El 1 es una cantidad fija, por eso su cuadrito mide lo mismo con cualquier x.",
    "comoComprobarlo": "Mueve el deslizador de x en el panel y compara el largo de las tiras verdes con el de los cuadritos dorados."
  },
  "ley-senos-cosenos": {
    "escena": "Un terreno triangular con dos lados conocidos a y b; el ángulo C entre ellos funciona como un compás.",
    "pregunta": "Con a y b fijos, ¿qué le pasa al lado c al abrir el ángulo C?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se acorta",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Crece, sin pasar de a + b",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "En c² = a² + b² − 2ab·cos C, al abrir C el coseno baja y deja de restar. Por eso c crece, y nunca supera a + b, que es el máximo.",
    "comoComprobarlo": "Deja a y b quietos, mueve el deslizador de C de 20° a 160° y vigila la barra del lado c."
  },
  "licencias-software": {
    "escena": "La radio escolar ficticia «Voz del Valle» instaló un editor de imágenes de software libre",
    "pregunta": "Si la radio vende copias de ese programa libre, ¿qué pasa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Le llega una multa por infracción",
        "icono": "fa-gavel"
      },
      {
        "id": "b",
        "texto": "Está permitido",
        "icono": "fa-circle-check"
      },
      {
        "id": "c",
        "texto": "Solo puede regalarlo, nunca cobrarlo",
        "icono": "fa-hand-holding-heart"
      }
    ],
    "correcta": "b",
    "porque": "Libre no significa gratis: la licencia libre deja usar, estudiar, modificar y redistribuir, y eso incluye cobrar por copias o soporte, siempre que también se entregue el código.",
    "comoComprobarlo": "En «Software de la radio», instala un programa libre, elígelo y prueba la acción «Vender copias»."
  },
  "limites-acercamiento": {
    "escena": "Una curva con un hueco en x = 3 y un punto que se desliza sobre ella cuando acercas x al hueco.",
    "pregunta": "Si acercas x a 3 por la izquierda, ¿hacia qué valor se dirige f(x)?",
    "opciones": [
      {
        "id": "a",
        "texto": "Hacia 0",
        "icono": "fa-circle-minus"
      },
      {
        "id": "b",
        "texto": "Hacia 6",
        "icono": "fa-bullseye"
      },
      {
        "id": "c",
        "texto": "Hacia un valor enorme",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "Para x distinto de 3, (x² − 9)/(x − 3) equivale a x + 3. Al acercarse a 3 vale casi 6. Aunque f(3) no exista (0/0), el límite sí existe.",
    "comoComprobarlo": "Elige el caso indeterminado, arrastra el deslizador de x hacia 3 y mira f(x) y el medidor de distancia."
  },
  "logica-compuertas-3d": {
    "escena": "Un circuito con dos interruptores, p y q, una compuerta y un foco. La compuerta elegida es el condicional «si p, entonces q».",
    "pregunta": "En «si apruebas, vamos al cine», no apruebas (p falso). ¿Se enciende el foco?",
    "opciones": [
      {
        "id": "a",
        "texto": "No: la promesa se rompió",
        "icono": "fa-power-off"
      },
      {
        "id": "b",
        "texto": "Sí: la promesa no se rompe",
        "icono": "fa-lightbulb"
      },
      {
        "id": "c",
        "texto": "Depende de si hay o no cine",
        "icono": "fa-question"
      }
    ],
    "correcta": "b",
    "porque": "El condicional solo es falso cuando p es verdadero y q falso. Si p es falso, la promesa no se pone a prueba y la compuesta queda verdadera, sin importar q.",
    "comoComprobarlo": "En «Circuito de conectivos» elige el condicional, apaga el interruptor p y alterna q mientras observas el foco."
  },
  "lugares-recomendaciones-ingles-3d": {
    "escena": "Lucía ama fotografiar paisajes, pero no soporta los lugares llenos de gente; tú le recomiendas el mercado de artesanías",
    "pregunta": "Si le escribes «You should visit the market because you can buy crafts», ¿cómo reacciona Lucía?",
    "opciones": [
      {
        "id": "a",
        "texto": "Feliz, porque puede tomar fotos",
        "icono": "fa-face-smile"
      },
      {
        "id": "b",
        "texto": "Se queja de que hay demasiada gente",
        "icono": "fa-people-group"
      },
      {
        "id": "c",
        "texto": "Se encoge de hombros, sin opinar",
        "icono": "fa-face-meh"
      }
    ],
    "correcta": "b",
    "porque": "Tu oración está bien escrita, pero la reacción depende del lugar: el mercado siempre está concurrido y Lucía quería evitarlo. Una recomendación correcta en inglés no basta, debe encajar con lo que busca.",
    "comoComprobarlo": "En «Recommend it» elige a Lucía, escribe esa recomendación y pulsa Recomendar; después cambia el lugar por the viewpoint y compara."
  },
  "maquina-termica-ciclos": {
    "escena": "Un motor de calor entre un foco caliente a la izquierda y uno frío a la derecha, con chorros de partículas y un medidor de eficiencia.",
    "pregunta": "Si bajas la temperatura del foco frío, ¿qué pasa con el trabajo útil?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aumenta",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "No cambia",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Disminuye",
        "icono": "fa-arrow-down"
      }
    ],
    "correcta": "a",
    "porque": "La eficiencia máxima es η = 1 − T_f/T_c. Con un foco frío más frío, el cociente T_f/T_c baja, η sube y de cada joule que entra se aprovecha más como trabajo.",
    "comoComprobarlo": "En «Motor de calor» baja el deslizador del foco frío y compara el chorro verde y el medidor η."
  },
  "medidas-tendencia-central": {
    "escena": "Una fila de sueldos con un solo sueldo altísimo al final, y marcas de media y mediana sobre la recta",
    "pregunta": "Si ese sueldo altísimo sube aún más, ¿qué marca se mueve?",
    "opciones": [
      {
        "id": "a",
        "texto": "Las dos marcas se mueven igual",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "b",
        "texto": "Solo la media se desplaza",
        "icono": "fa-scale-unbalanced"
      },
      {
        "id": "c",
        "texto": "Solo la mediana se desplaza",
        "icono": "fa-scissors"
      }
    ],
    "correcta": "b",
    "porque": "La media suma todos los valores, así que un extremo la jala. La mediana solo depende del lugar que ocupan los datos ordenados, y el sueldo alto sigue siendo el último.",
    "comoComprobarlo": "Con el conjunto Salarios, arrastra el deslizador «Valor más alto» y vigila las barras de media y mediana."
  },
  "mercado-necesidades-ingles-3d": {
    "escena": "En el tianguis, Don Beto pregunta «How ___ rice would you like?» y tú debes elegir much o many",
    "pregunta": "Si eliges «many» para el arroz, ¿qué pasa con Don Beto en el tianguis?",
    "opciones": [
      {
        "id": "a",
        "texto": "Te da el arroz grano por grano",
        "icono": "fa-bowl-rice"
      },
      {
        "id": "b",
        "texto": "Se confunde y no avanza",
        "icono": "fa-circle-question"
      },
      {
        "id": "c",
        "texto": "Acepta y sigues con tu pedido",
        "icono": "fa-thumbs-up"
      }
    ],
    "correcta": "b",
    "porque": "Rice es incontable: se mide en kilos, no se cuenta. «How many» solo va con sustantivos contables como eggs u oranges, así que el vendedor se confunde.",
    "comoComprobarlo": "Elige el arroz en el puesto, toca «many» y mira el globo de Don Beto; luego prueba «much» y compara."
  },
  "metabolismo-celular-3d": {
    "escena": "Una mitocondria con tres etapas y un medidor de ATP que se llena al avanzar",
    "pregunta": "Sin oxígeno, ¿cuánto ATP obtiene la célula de una glucosa, comparado con los 36 de la respiración?",
    "opciones": [
      {
        "id": "a",
        "texto": "Casi lo mismo, unos 34 ATP",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Solo 2 ATP",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Más ATP, porque no gasta oxígeno",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "Sin oxígeno la cadena de electrones no funciona. Solo queda la glucólisis, que da 2 ATP netos; la fermentación únicamente regenera lo necesario para que siga ocurriendo.",
    "comoComprobarlo": "Con el medidor de ATP a la vista, cambia entre Respiración aerobia y Fermentación y avanza por todas las etapas de cada una."
  },
  "metodo-cientifico-medicion-3d": {
    "escena": "Tres grupos de plantas bajo lámparas con distintas horas de luz. El grupo C además recibe más agua que los otros dos.",
    "pregunta": "El grupo C crece más que A y B. ¿Qué puedes concluir sobre el efecto de la luz?",
    "opciones": [
      {
        "id": "a",
        "texto": "Que la luz hace crecer más a las plantas",
        "icono": "fa-sun"
      },
      {
        "id": "b",
        "texto": "Que el agua es lo único que importa",
        "icono": "fa-droplet"
      },
      {
        "id": "c",
        "texto": "Nada seguro: cambiaron dos variables",
        "icono": "fa-circle-question"
      }
    ],
    "correcta": "c",
    "porque": "En un experimento controlado solo debe cambiar la variable independiente. Si cambian luz y agua a la vez, no hay forma de saber cuál causó la diferencia.",
    "comoComprobarlo": "En «Experimento controlado» elige una hipótesis, activa «Grupo C con 400 ml», siembra y revisa qué conclusión acepta el laboratorio."
  },
  "mexico-en-el-mundo": {
    "escena": "Un mapa de rutas parte de México hacia seis socios; tres medidores marcan comercio, autonomía y estabilidad. En cada episodio eliges una de tres decisiones.",
    "pregunta": "En el episodio del ferrocarril, ¿qué pasa si das todas las concesiones a un solo inversionista?",
    "opciones": [
      {
        "id": "a",
        "texto": "El comercio sube, pero la autonomía baja",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "b",
        "texto": "Suben a la vez el comercio y la autonomía",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "c",
        "texto": "Los medidores casi no se mueven",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Un solo socio trae mucha inversión y comercio, pero concentra las rutas en él. Esa dependencia económica estrecha el margen para decidir, como en el Porfiriato.",
    "comoComprobarlo": "Abre «Cancillería», ve al episodio 1876–1911 y compara los medidores y el grosor de las rutas entre dar las concesiones a uno o repartirlas."
  },
  "modelado-conicas-estimacion": {
    "escena": "Un cono doble y un plano de corte que se inclina; la curva del corte se dibuja sobre el plano.",
    "pregunta": "Si el plano queda paralelo al borde del cono, ¿qué curva sale?",
    "opciones": [
      {
        "id": "a",
        "texto": "Una elipse cerrada, más grande",
        "icono": "fa-egg"
      },
      {
        "id": "b",
        "texto": "Una parábola, que ya no se cierra",
        "icono": "fa-bowl-food"
      },
      {
        "id": "c",
        "texto": "Una hipérbola de dos ramas",
        "icono": "fa-bezier-curve"
      }
    ],
    "correcta": "b",
    "porque": "Con el plano paralelo a la generatriz, la curva deja de cerrarse pero no alcanza a cortar la otra napa. Menos inclinado da elipse; más inclinado corta ambas napas y da hipérbola.",
    "comoComprobarlo": "Mueve el ángulo del plano hasta que quede paralelo a la línea dorada del cono y mira cómo cambia el medidor de colores."
  },
  "modelos-atomicos": {
    "escena": "Un átomo de carbono armado con 6 protones, 6 neutrones y 6 electrones, en equilibrio.",
    "pregunta": "Le agregas un protón más, sin tocar los electrones. ¿Qué pasa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sigue siendo carbono, solo más pesado",
        "icono": "fa-weight-hanging"
      },
      {
        "id": "b",
        "texto": "Cambia de elemento y queda positivo",
        "icono": "fa-plus"
      },
      {
        "id": "c",
        "texto": "Sigue siendo carbono, pero neutro",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El número de protones define al elemento: con 7 ya es nitrógeno. Y como ahora hay un protón de más que electrones, la carga neta es +1 y el átomo se vuelve un catión.",
    "comoComprobarlo": "En «Construir átomo», pon 6 protones, 6 neutrones y 6 electrones; luego añade un protón y mira el elemento y la balanza."
  },
  "movimientos-literarios": {
    "escena": "Una exposición con ocho piezas y una línea del tiempo de seis movimientos",
    "pregunta": "Si colocas el «Soneto del vitral» en el Modernismo, ¿cuántos rasgos del Modernismo se encienden?",
    "opciones": [
      {
        "id": "a",
        "texto": "Los tres, porque suena muy musical",
        "icono": "fa-music"
      },
      {
        "id": "b",
        "texto": "Solo uno de los tres",
        "icono": "fa-lightbulb"
      },
      {
        "id": "c",
        "texto": "Ninguno de los tres",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "El soneto tiene musicalidad, rasgo modernista, pero su lenguaje ornamental y su desengaño son del Barroco. Pesan más los rasgos barrocos, así que ahí encaja mejor.",
    "comoComprobarlo": "En «Curaduría» elige el «Soneto del vitral», toca la banda del Modernismo y cuenta los rasgos encendidos."
  },
  "mrua-acelerar-frenar": {
    "escena": "Un auto acelera por una autopista, alcanza su rapidez máxima y frena hasta detenerse",
    "pregunta": "Si frenas con más fuerza (a₂ mayor), ¿qué pasa con los metros que recorre al frenar?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aumentan",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se reducen",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Quedan igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Frenar con más fuerza quita rapidez más rápido, así que el auto se detiene en menos tiempo. La distancia de frenado es v² entre 2a₂: a mayor a₂, menos metros.",
    "comoComprobarlo": "En Controles, sube el deslizador de frenado a₂ y mira cuántos metros dice «frena en» y dónde queda el poste de alto total."
  },
  "muestreo-estadistico-3d": {
    "escena": "La escuela de 800 estudiantes vista desde arriba; al tomar muestras se levantan quienes quedan elegidos y, en otro modo, se apilan 300 muestras repetidas",
    "pregunta": "Con muestras de 320 en vez de 20, ¿cómo cambia el histograma de 300 estimaciones?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se angosta alrededor del valor real",
        "icono": "fa-compress"
      },
      {
        "id": "b",
        "texto": "Se ensancha y se vuelve más plano",
        "icono": "fa-expand"
      },
      {
        "id": "c",
        "texto": "Se desplaza entero hacia la derecha",
        "icono": "fa-arrow-right"
      }
    ],
    "correcta": "a",
    "porque": "El error de una muestra aleatoria baja con la raíz de n: con 320 estudiantes las estimaciones se pegan más al valor real que con 20. El azar se reduce; el sesgo, solo si cambias la técnica.",
    "comoComprobarlo": "En «Error muestral» deja la técnica aleatoria simple, toma 300 muestras con n = 20, luego con n = 320, y compara el ancho."
  },
  "mutaciones-3d": {
    "escena": "Un fragmento real del gen de la β-globina, con su proteína de ocho aminoácidos y un editor para mutarlo.",
    "pregunta": "Quitas una sola base cerca del inicio del gen. ¿Qué pasa con la proteína?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solo falta un aminoácido",
        "icono": "fa-minus"
      },
      {
        "id": "b",
        "texto": "Queda igual: el código es redundante",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Cambian los aminoácidos desde ahí",
        "icono": "fa-arrows-left-right-to-line"
      }
    ],
    "correcta": "c",
    "porque": "Los codones se leen de tres en tres. Al quitar una base, todas las tripletas siguientes se recorren y casi todos los aminoácidos cambian o aparece un paro prematuro: es un desplazamiento del marco.",
    "comoComprobarlo": "Elige Deleción, pon la posición en 7 y compara la cadena de arriba con la de abajo; luego prueba una sustitución en la misma posición."
  },
  "narrativas-populares-lengua": {
    "escena": "Cuentas una leyenda en cuatro partes frente a un fogón; en cada parte eliges cómo decirla.",
    "pregunta": "Si cambias una parte con «Cuentan que…» por «En 1890, en una localidad…», ¿qué le pasa al fogón?",
    "opciones": [
      {
        "id": "a",
        "texto": "Gana un oyente, por ser más preciso",
        "icono": "fa-user-plus"
      },
      {
        "id": "b",
        "texto": "Pierde un oyente: suena a informe",
        "icono": "fa-user-minus"
      },
      {
        "id": "c",
        "texto": "Nada, dicen lo mismo",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "«Cuentan que…» es una fórmula de apertura de la lengua oral: llama a quien escucha. Una fecha y un lugar exactos suenan a acta y quitan la huella de la voz.",
    "comoComprobarlo": "En «El fogón», elige «Cuentan los viejitos…» en la primera parte y mira los oyentes; luego elige la versión con la fecha."
  },
  "naturaleza-ciencia-3d": {
    "escena": "Una afirmación dice: «el agua hierve siempre a 100 °C». Una olla con termómetro se calienta en distintos lugares de México.",
    "pregunta": "Pones la olla en la Ciudad de México, a 2 240 m. ¿A qué temperatura hierve el agua?",
    "opciones": [
      {
        "id": "a",
        "texto": "Exactamente 100 °C, igual que a nivel del mar",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Menos de 100 °C, por la menor presión",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "Más de 100 °C, por el aire frío",
        "icono": "fa-arrow-trend-up"
      }
    ],
    "correcta": "b",
    "porque": "A mayor altitud hay menos presión atmosférica y el agua hierve antes. Un solo dato como este basta para refutar «siempre a 100 °C» y obliga a corregir la hipótesis.",
    "comoComprobarlo": "En «Falsabilidad» elige «Agua hirviendo», predice, selecciona Veracruz y enciende la estufa; luego repite en la Ciudad de México y compara el termómetro."
  },
  "navegacion-segura": {
    "escena": "Te llega un SMS urgente de un banco: tu cuenta se bloqueará en 30 minutos y debes dar tu contraseña en un enlace.",
    "pregunta": "Si abres ese enlace en lugar de ignorarlo, ¿qué pasa con los medidores de tu teléfono?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube la seguridad del dispositivo",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja la seguridad y salen datos",
        "icono": "fa-triangle-exclamation"
      },
      {
        "id": "c",
        "texto": "Nada cambia hasta otro aviso",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El enlace lleva a una página falsa que copia tu contraseña. La seguridad del dispositivo baja y tus datos quedan expuestos. Un mensaje urgente que pide contraseña es señal clásica de phishing.",
    "comoComprobarlo": "En «Tu teléfono», en el primer aviso pulsa «Revisar con calma» y luego abre el enlace; después repite el modo y elige ignorar o reportar, y compara los dos medidores."
  },
  "necesidades-satisfactores": {
    "escena": "Una familia ficticia con 12 fichas al mes y cinco medidores de necesidades",
    "pregunta": "Si gastas 2 fichas en refrescos y botanas, ¿qué pasa con el medidor de salud?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube porque la familia come más",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja aunque la comida llene",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda igual que antes",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Los refrescos y las botanas llenan un rato, pero no nutren ni hidratan bien y dañan la salud. Aparentan satisfacer una necesidad: son un pseudo-satisfactor.",
    "comoComprobarlo": "En «Presupuesto del mes» toca la tarjeta de refrescos y botanas y mira el medidor de salud."
  },
  "notacion-cientifica": {
    "escena": "Una torre vertical de escalas, del átomo al Sol, con una esfera brillante en 1.7 × 10^0 m y una tira de dígitos.",
    "pregunta": "Si subes el exponente de 0 a 3, ¿qué pasa con la esfera y el número?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube tres peldaños y el número vale mil veces más",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Baja tres peldaños y el número se hace más pequeño",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda en su lugar y solo cambia el color",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Cada unidad del exponente multiplica por 10. Tres unidades son ×10×10×10 = ×1 000, así que el punto decimal se corre tres lugares a la derecha.",
    "comoComprobarlo": "Deja la mantisa en 1.7 y mueve el deslizador del exponente de 0 a 3, mirando la tira de dígitos."
  },
  "ondas-amplitud-frecuencia": {
    "escena": "Una onda viaja por el aire a 4 Hz y una regla amarilla marca su longitud de onda",
    "pregunta": "Si subes la frecuencia de 4 a 8 Hz en el mismo medio, ¿qué pasa con λ?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se hace el doble",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La rapidez de la onda depende del medio y no cambia. Como v = λ·f, si f se duplica, λ debe volverse la mitad para que el producto siga valiendo lo mismo.",
    "comoComprobarlo": "Mueve el deslizador de frecuencia en Controles y mira la regla amarilla de λ y el medidor de la esquina."
  },
  "opiniones-preocupaciones-ingles": {
    "escena": "En un foro ciudadano ficticio opinas en inglés sobre un plan de cruceros. Seis integrantes votan según la credibilidad, el respeto y la claridad de tu intervención.",
    "pregunta": "Respondes con cortesía y dices «this plan will pollute the water» apoyándote sólo en un ejemplo personal. ¿Qué pasa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Convences a más integrantes porque suenas seguro",
        "icono": "fa-bullhorn"
      },
      {
        "id": "b",
        "texto": "Cae tu credibilidad y el plan no cambia",
        "icono": "fa-scale-unbalanced"
      },
      {
        "id": "c",
        "texto": "Sólo baja el respeto del foro",
        "icono": "fa-handshake-slash"
      }
    ],
    "correcta": "b",
    "porque": "«Will» es certeza alta, pero un ejemplo personal es evidencia débil: afirmas más de lo que pruebas. Los dos integrantes que miran la credibilidad votan en contra y no se juntan los cinco votos; el respeto no cambia.",
    "comoComprobarlo": "En «Town hall», Puerto Calma, elige «I see your point, but», la preocupación por el agua, el ejemplo del aceite en la arena, la propuesta de un barco por semana, sube la fuerza a «will» y habla en el foro."
  },
  "optica-lentes-espejos": {
    "escena": "Un objeto frente a una lente convergente; los rayos forman su imagen del otro lado",
    "pregunta": "Si acercas el objeto hasta quedar dentro del foco, ¿cómo es la imagen?",
    "opciones": [
      {
        "id": "a",
        "texto": "Real e invertida",
        "icono": "fa-arrows-up-down"
      },
      {
        "id": "b",
        "texto": "Virtual, derecha y mayor",
        "icono": "fa-magnifying-glass"
      },
      {
        "id": "c",
        "texto": "No se forma ninguna imagen",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "Dentro del foco los rayos salen de la lente todavía separándose y nunca se cruzan. Tu ojo los prolonga hacia atrás y ve una imagen virtual, derecha y más grande: es una lupa.",
    "comoComprobarlo": "Baja el deslizador de distancia del objeto hasta que la marca del medidor pase la f, y observa la imagen punteada."
  },
  "optimizacion-cilindro": {
    "escena": "Una lata sin tapa de 1000 cm³ cuyo radio puedes cambiar, junto a la gráfica del material que gasta",
    "pregunta": "Si ensanchas la lata hasta el radio máximo, ¿cuánto material gasta frente a la lata del óptimo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Menos, porque queda más baja",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Igual, el volumen no cambia",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Más, la base crece demasiado",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "c",
    "porque": "Con volumen fijo, una lata muy ancha ahorra pared pero gasta mucha base. Pasado el óptimo, la base crece más rápido de lo que baja la pared.",
    "comoComprobarlo": "Pulsa «Óptimo» y lee el material en la barra de la leyenda; luego pulsa «Ancha» y compara la barra y el valor de A(r)."
  },
  "organica-visor": {
    "escena": "Una molécula de etanol de bolas y barras con su grupo funcional resaltado y un deslizador para separarlo.",
    "pregunta": "Al separar el grupo funcional del etanol, ¿qué átomos se alejan?",
    "opciones": [
      {
        "id": "a",
        "texto": "Los dos carbonos de la cadena",
        "icono": "fa-link"
      },
      {
        "id": "b",
        "texto": "Un oxígeno y su hidrógeno (–OH)",
        "icono": "fa-tint"
      },
      {
        "id": "c",
        "texto": "Todos los hidrógenos de la molécula",
        "icono": "fa-circle"
      }
    ],
    "correcta": "b",
    "porque": "El grupo funcional de los alcoholes es el hidroxilo –OH: un oxígeno con su hidrógeno. Esa parte distingue al etanol de un alcano; el resto es la cadena de carbonos.",
    "comoComprobarlo": "Elige Alcoholes, selecciona etanol y arrastra el deslizador «Separar» hasta el máximo mientras observas qué átomos brillan."
  },
  "origen-vida-3d": {
    "escena": "El aparato de Miller-Urey de 1953: un océano que hierve, gases de la atmósfera primitiva y una chispa eléctrica entre dos electrodos.",
    "pregunta": "Si apagas la chispa y pasa una semana, ¿qué hay en la trampa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Los mismos aminoácidos, solo que más lentos",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "b",
        "texto": "Nada: la trampa sigue vacía",
        "icono": "fa-vial"
      },
      {
        "id": "c",
        "texto": "Menos aminoácidos, porque el calor ayuda",
        "icono": "fa-fire"
      }
    ],
    "correcta": "b",
    "porque": "Los gases solos no reaccionan: la descarga eléctrica aporta la energía que los rompe y los recombina en aminoácidos. Sin esa energía, aunque pasen los días, no se forman moléculas orgánicas.",
    "comoComprobarlo": "Apaga la descarga eléctrica, deja correr los 7 días con el deslizador y observa la trampa y el dato «Sin chispa»."
  },
  "oxigenacion-atmosfera-3d": {
    "escena": "Un mar primitivo con cianobacterias que sueltan O₂ y fuentes hidrotermales que aportan hierro disuelto. Con 6 u de O₂ y 24 u de hierro por ciclo, el aire no se oxigena.",
    "pregunta": "Si subes las cianobacterias a 12 u de O₂ por ciclo, ¿cuándo llega O₂ al aire?",
    "opciones": [
      {
        "id": "a",
        "texto": "Nunca: el hierro consume todo el O₂",
        "icono": "fa-ban"
      },
      {
        "id": "b",
        "texto": "Al agotarse el hierro disuelto",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "c",
        "texto": "Desde el primer ciclo, sin esperar",
        "icono": "fa-bolt"
      }
    ],
    "correcta": "b",
    "porque": "Cada O₂ oxida 4 Fe²⁺, así que primero se gasta el hierro disuelto y se forman bandas. Cuando se acaba, lo que producen las cianobacterias menos lo que consumen los sumideros sobra y sube al aire.",
    "comoComprobarlo": "En «Mar primitivo», sube las cianobacterias a 12 u, deja las fuentes en 24 u e inicia los ciclos. Observa las bandas y el medidor de O₂ en el aire."
  },
  "parabola-trayectoria": {
    "escena": "Un balón describe una parábola de 30 m de alcance y se compara con el travesaño de un arco a 25 m",
    "pregunta": "Si haces la apertura a más negativa, de −0.04 a −0.08, ¿qué le pasa al arco del balón?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se cierra: llega menos lejos y menos alto",
        "icono": "fa-compress"
      },
      {
        "id": "b",
        "texto": "Se abre: llega más lejos",
        "icono": "fa-expand"
      },
      {
        "id": "c",
        "texto": "No cambia, solo depende de b",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Cuanto mayor es |a|, más cerrada la parábola. Con b igual, el vértice x = −b/2a se acerca al origen y la altura máxima baja: el balón cae antes.",
    "comoComprobarlo": "En Controles baja el deslizador de a hasta −0.08 y observa dónde cae el balón y qué tan alto llega el vértice dorado."
  },
  "pasado-simple-ingles": {
    "escena": "Es lunes y Dan te pregunta qué hiciste el viernes por la noche",
    "pregunta": "Contestas «Last Friday, I goed to the cinema». ¿Cómo reacciona Dan?",
    "opciones": [
      {
        "id": "a",
        "texto": "Entiende y pregunta por la película",
        "icono": "fa-film"
      },
      {
        "id": "b",
        "texto": "Se confunde: go es irregular",
        "icono": "fa-face-frown"
      },
      {
        "id": "c",
        "texto": "Cree que irás al cine mañana",
        "icono": "fa-calendar-day"
      }
    ],
    "correcta": "b",
    "porque": "«Go» es irregular: su pasado es «went», no «goed». Con una forma que no existe, Dan se confunde y la escena no entra en tu fin de semana.",
    "comoComprobarlo": "En la escena del viernes elige «Ir al cine», marca «Last Friday», toca la ficha «goed» y pulsa «Tell Dan»."
  },
  "pasado-viaje-ingles": {
    "escena": "Una línea del tiempo con dos figuras sobre un eje",
    "pregunta": "En la línea del tiempo, ¿cómo se dibuja un verbo en past continuous como «were walking»?",
    "opciones": [
      {
        "id": "a",
        "texto": "Como una banda larga",
        "icono": "fa-grip-lines"
      },
      {
        "id": "b",
        "texto": "Como un rayo breve que corta",
        "icono": "fa-bolt"
      },
      {
        "id": "c",
        "texto": "Como un punto al final del relato",
        "icono": "fa-circle"
      }
    ],
    "correcta": "a",
    "porque": "El past continuous describe lo que ya estaba pasando y duraba un rato. El hecho puntual que lo interrumpe va en past simple y se dibuja como rayo.",
    "comoComprobarlo": "En «Background & interruption» elige «were walking» como fondo y luego «walked»; compara lo que dibuja la línea."
  },
  "perfil-personal-ingles": {
    "escena": "Un mostrador de inscripción a un curso de verano en inglés",
    "pregunta": "Si Sofía contesta «I am Mexico» a «What's your nationality?», ¿qué teclea el registrador?",
    "opciones": [
      {
        "id": "a",
        "texto": "Mexican, corregido por su cuenta",
        "icono": "fa-wand-magic-sparkles"
      },
      {
        "id": "b",
        "texto": "Mexico, tal como lo oyó",
        "icono": "fa-keyboard"
      },
      {
        "id": "c",
        "texto": "Deja el campo en blanco",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "El registrador anota lo que oye, no lo que quisiste decir. «Mexico» es el país, no la nacionalidad, así que el campo queda con un dato equivocado.",
    "comoComprobarlo": "En «En el mostrador» llega al turno de Nationality y elige primero la respuesta con Mexico; mira la ficha."
  },
  "personajes-escenarios": {
    "escena": "Una escena con un personaje cauteloso que decide qué hacer en un mercado actual",
    "pregunta": "Si el personaje cauteloso pasa de «Observar» a «Enfrentar», ¿qué pasa con la coherencia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube, porque hay más acción",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "Baja, actúa contra su carácter",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La caracterización manda: quien mide cada paso no se lanza al choque sin una razón. El lector deja de creerle y la coherencia cae, aunque la escena gane tensión.",
    "comoComprobarlo": "Elige «Cauteloso» y cambia la acción entre «Observar» y «Enfrentar» mientras miras el medidor de coherencia."
  },
  "ph-escala": {
    "escena": "Un vaso con vinagre (ácido débil) y una bureta de NaOH cuya perilla se arrastra gota a gota, junto a una escala de pH.",
    "pregunta": "Si añades NaOH al vinagre hasta neutralizarlo justo, ¿en qué pH queda?",
    "opciones": [
      {
        "id": "a",
        "texto": "Exactamente en 7",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Arriba de 7, en zona básica",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "Abajo de 7, sigue ácido",
        "icono": "fa-arrow-down"
      }
    ],
    "correcta": "b",
    "porque": "Al neutralizar, el acetato que se forma reacciona con el agua y libera un poco de OH⁻. Por eso la equivalencia de un ácido débil cae cerca de pH 8.7, no en 7.",
    "comoComprobarlo": "En Neutralizar elige el ácido débil, arrastra la bureta hasta la equivalencia (20 gotas) y compara con el ácido fuerte."
  },
  "piramide-energia": {
    "escena": "Una pirámide de cuatro plataformas con energía en kcal en cada una y un hilo delgado que sube entre ellas",
    "pregunta": "Si la eficiencia por salto sube de 10 % a 20 %, ¿qué pasa con la energía que llega a la cima?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se duplica, de 10 a 20 kcal",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se multiplica por 8",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "c",
        "texto": "Casi no cambia",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La energía se multiplica por la eficiencia en cada uno de los tres saltos. Duplicar la eficiencia duplica tres veces: 2 × 2 × 2 = 8. Con 10,000 kcal pasa de 10 a 80 kcal.",
    "comoComprobarlo": "Con 10,000 kcal, mueve la eficiencia de 10 % a 20 % y compara la cifra de la plataforma más alta."
  },
  "planes-futuro-ingles-3d": {
    "escena": "Un carrusel de situaciones: Diego ve nubes negras y truenos en la plaza y su globo de diálogo espera completar «It ___ soon».",
    "pregunta": "Diego ve nubes negras y truenos. ¿Qué forma del verbo pondrá el globo en verde?",
    "opciones": [
      {
        "id": "a",
        "texto": "Will, porque se decide en el momento",
        "icono": "fa-bolt"
      },
      {
        "id": "b",
        "texto": "Be going to, por la evidencia",
        "icono": "fa-cloud-showers-heavy"
      },
      {
        "id": "c",
        "texto": "Presente simple, porque es un hábito",
        "icono": "fa-rotate"
      }
    ],
    "correcta": "b",
    "porque": "Las nubes negras son evidencia que se ve ahora, así que la predicción lleva be going to: «It's going to rain soon». Will también es inglés correcto, pero el globo lo marca en ámbar por menos natural.",
    "comoComprobarlo": "Elige «Predicción con evidencia a la vista» y prueba cada forma del verbo; mira el color y la marca del globo sobre Diego."
  },
  "posesivos-ingles": {
    "escena": "La oficina de objetos perdidos de una escuela ficticia, con un lápiz sin dueño y dos alumnos en la fila",
    "pregunta": "Si la etiqueta dice «Ana» y «pencil» sin ninguna marca en medio, ¿qué hace el empleado?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se lo da a Ana",
        "icono": "fa-hand-holding"
      },
      {
        "id": "b",
        "texto": "Lo deja en la caja",
        "icono": "fa-box-open"
      },
      {
        "id": "c",
        "texto": "Se lo da a otro alumno",
        "icono": "fa-user-group"
      }
    ],
    "correcta": "b",
    "porque": "Sin apóstrofo y s, «Ana pencil» no dice que el lápiz sea de Ana: se lee como dos palabras sueltas. Sin posesión clara, el empleado no entrega nada.",
    "comoComprobarlo": "En «Saxon genitive», busca un caso de dueño singular y elige la opción del guion «—» en lugar de 's; observa dónde queda el objeto."
  },
  "potencias-raices": {
    "escena": "Un cubo armado con 2×2×2 cubitos, es decir 2³ = 8 cubitos, con el modo «Al cubo» activo.",
    "pregunta": "Si duplicas el lado de 2 a 4, ¿cuántas veces más cubitos tiene el cubo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solo el doble (×2)",
        "icono": "fa-xmark"
      },
      {
        "id": "b",
        "texto": "Cuatro veces más (×4)",
        "icono": "fa-square"
      },
      {
        "id": "c",
        "texto": "Ocho veces más (×8)",
        "icono": "fa-cube"
      }
    ],
    "correcta": "c",
    "porque": "El volumen depende del lado multiplicado tres veces: 4³ = 64 y 2³ = 8, así que 64 ÷ 8 = 8. Duplicar el lado multiplica el volumen por 2³.",
    "comoComprobarlo": "Elige «Al cubo», deja la base en 2 y pulsa «Duplicar el lado»; compara los cubitos antes y después."
  },
  "preferencias-elecciones-ingles": {
    "escena": "En el comité estudiantil, Sofía pregunta qué prefieres para el viaje y tú contestas en inglés",
    "pregunta": "Si dices tu preferencia sin «because» ni «since», ¿cuánto sube el convencimiento del grupo?",
    "opciones": [
      {
        "id": "a",
        "texto": "Casi nada: suena a capricho",
        "icono": "fa-face-rolling-eyes"
      },
      {
        "id": "b",
        "texto": "Igual que con una razón",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Más, porque la frase es corta",
        "icono": "fa-arrow-trend-up"
      }
    ],
    "correcta": "a",
    "porque": "Una preferencia sin razón es sólo un gusto: el grupo no sabe por qué debería cambiar de idea. Con «because» o «since» y un dato verdadero, la misma preferencia se vuelve un argumento.",
    "comoComprobarlo": "En «Student council», responde a Sofía dos veces: una con «(sin tu razón)» y otra con una razón. Compara cuánto se mueve la barra de Convencimiento."
  },
  "preguntas-pasado-discursos-3d": {
    "escena": "Una espiral del tiempo con vueltas de 110 años. Cada evidencia cae sobre ella cuando la ubicas en su siglo correcto.",
    "pregunta": "El Gran Canal se inauguró en 1900. ¿A qué siglo pertenece ese año?",
    "opciones": [
      {
        "id": "a",
        "texto": "Siglo XX, porque el año empieza con 19",
        "icono": "fa-hourglass-start"
      },
      {
        "id": "b",
        "texto": "Siglo XIX, donde cierra",
        "icono": "fa-hourglass-end"
      },
      {
        "id": "c",
        "texto": "Siglo XVIII",
        "icono": "fa-hourglass-half"
      }
    ],
    "correcta": "b",
    "porque": "El siglo N va del año (N−1)01 al N00. Por eso el siglo XIX abarca de 1801 a 1900, y 1900 todavía es del XIX. El siglo XX empieza en 1901.",
    "comoComprobarlo": "En «Categorías en el tiempo», elige la evidencia de 1900 y prueba distintos siglos: solo cuando aciertas la gema cae sobre la espiral."
  },
  "present-perfect-ingles": {
    "escena": "Sam, un estudiante de intercambio, pregunta si alguna vez has viajado a otro estado.",
    "pregunta": "En el chat con Sam, ¿qué respuesta lo deja confundido?",
    "opciones": [
      {
        "id": "a",
        "texto": "I have gone there yesterday.",
        "icono": "fa-circle-question"
      },
      {
        "id": "b",
        "texto": "I have never travelled.",
        "icono": "fa-ban"
      },
      {
        "id": "c",
        "texto": "Yes, I have travelled.",
        "icono": "fa-plane"
      }
    ],
    "correcta": "a",
    "porque": "«Yesterday» es un momento específico y exige past simple (went). El present perfect cuenta experiencias sin fecha, por eso never y una respuesta sin tiempo concreto sí funcionan.",
    "comoComprobarlo": "Abre «Chat with Sam», elige cada respuesta de la primera pregunta y observa la reacción de Sam y el mapa de experiencias."
  },
  "presentaciones-ingles": {
    "escena": "Ana conoce a Valeria en el patio del club de inglés y debe responder cuando ella se presenta",
    "pregunta": "Valeria dice «Hi! I'm Valeria». Si respondes «See you later», ¿cómo reacciona ella?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sonríe y se alegra",
        "icono": "fa-face-smile"
      },
      {
        "id": "b",
        "texto": "Se confunde",
        "icono": "fa-face-dizzy"
      },
      {
        "id": "c",
        "texto": "Reacciona igual que con un saludo",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "«See you later» es una despedida. Al conocer a alguien se responde con «Nice to meet you», y una despedida a destiempo desconcierta a quien te escucha.",
    "comoComprobarlo": "En «Club day», avanza hasta la escena del patio y compara la cara de Valeria al elegir cada una de las tres respuestas."
  },
  "procedimientos-narrativos": {
    "escena": "Un cuento corto sobre un pan que aparece cada madrugada en un local vacío, con siete escenas que puedes reordenar.",
    "pregunta": "¿Cuándo sorprende más el giro del panadero escondido?",
    "opciones": [
      {
        "id": "a",
        "texto": "Si cuento su despedida al principio",
        "icono": "fa-hand"
      },
      {
        "id": "b",
        "texto": "Si cuento su despedida después del giro",
        "icono": "fa-rotate-left"
      },
      {
        "id": "c",
        "texto": "Si cuento el giro en primer lugar",
        "icono": "fa-forward-fast"
      }
    ],
    "correcta": "b",
    "porque": "Contar la despedida antes delata al panadero. Si la historia retrocede después del giro, el lector llega a él con todas las pistas y sin sospechas.",
    "comoComprobarlo": "Con cualquier narrador, mueve la escena «La despedida» con los botones Antes y Después y mira el medidor de sorpresa."
  },
  "procesos-ingles": {
    "escena": "Marta está en la cocina y hará exactamente lo que le digas, paso a paso, para preparar chocolate caliente.",
    "pregunta": "Si empiezas con «Finally, pour milk into a pot», ¿qué hace Marta?",
    "opciones": [
      {
        "id": "a",
        "texto": "Espera a que le des los demás pasos",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "b",
        "texto": "Entrega la bebida incompleta",
        "icono": "fa-mug-hot"
      },
      {
        "id": "c",
        "texto": "Empieza todo de nuevo",
        "icono": "fa-rotate-left"
      }
    ],
    "correcta": "b",
    "porque": "«Finally» anuncia el último paso. Quien escucha cree que ya terminaron y entrega lo que tenga, aunque falten pasos. Por eso el conector debe ir en su lugar.",
    "comoComprobarlo": "En «Give instructions», en el paso 1, elige la frase que empieza con «Finally» y mira la calidad y lo que dice Marta."
  },
  "productos-notables-3d": {
    "escena": "Un cuadrado de lado a + b, con a = 3 y b = 1, hecho de cuatro piezas.",
    "pregunta": "¿(a + b)² vale lo mismo que a² + b² cuando a = 3 y b = 1?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sí, los dos valen 10",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "No, (a + b)² vale 16",
        "icono": "fa-square"
      },
      {
        "id": "c",
        "texto": "No, (a + b)² vale 13",
        "icono": "fa-square-minus"
      }
    ],
    "correcta": "b",
    "porque": "El cuadrado de lado 4 tiene área 16. Los cuadrados a² = 9 y b² = 1 suman solo 10; los 6 que faltan son los dos rectángulos ab: 2 · 3 · 1.",
    "comoComprobarlo": "En «Binomio al cuadrado» pon a = 3 y b = 1, y mueve la separación para despiezar el cuadrado."
  },
  "propagacion-calor": {
    "escena": "Una barra con una flama en un extremo y un sensor de temperatura en su punto medio.",
    "pregunta": "Cambias la barra de cobre por una de madera. ¿Qué pasa con el calor?",
    "opciones": [
      {
        "id": "a",
        "texto": "Llega igual de rápido, es el mismo calor",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Llega mucho más lento",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "c",
        "texto": "Llega más rápido",
        "icono": "fa-bolt"
      }
    ],
    "correcta": "b",
    "porque": "La madera tiene una conductividad térmica k muy baja (0.15 W/m·K contra 401 del cobre). El flujo Q/t = k·A·ΔT/L es menor, así que el calor avanza muy despacio.",
    "comoComprobarlo": "En Controles elige Cobre y luego Madera; compara el sensor del punto medio y el tiempo que tarda el calor en cruzar la barra."
  },
  "propiedades-materia": {
    "escena": "Un clavo de hierro dentro de un vaso de precipitado sobre un mechero, listo para transformarse.",
    "pregunta": "Al avanzar la oxidación del clavo, ¿qué pasa con la sustancia original?",
    "opciones": [
      {
        "id": "a",
        "texto": "Permanece igual, solo cambia su aspecto",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Se va convirtiendo en otra",
        "icono": "fa-arrow-right-arrow-left"
      },
      {
        "id": "c",
        "texto": "Aumenta porque se le suma óxido",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "En la oxidación el hierro reacciona con el oxígeno y forma óxido, una sustancia distinta. Por eso la barra de sustancia original baja mientras sube la de sustancia nueva.",
    "comoComprobarlo": "Elige «Oxidar hierro», arrastra el avance de 0 a 100 % y vigila las dos barras."
  },
  "quimica-organica-industria-3d": {
    "escena": "Un reactor con tres probetas de moles: dos de reactivos (ácido salicílico y anhídrido acético) y una para la aspirina que se formará.",
    "pregunta": "Hay 2 g de ácido salicílico y 5.4 g de anhídrido acético. ¿Qué reactivo se agota primero?",
    "opciones": [
      {
        "id": "a",
        "texto": "El anhídrido acético: pesa más",
        "icono": "fa-weight-hanging"
      },
      {
        "id": "b",
        "texto": "El ácido salicílico",
        "icono": "fa-flask"
      },
      {
        "id": "c",
        "texto": "Los dos se agotan a la vez",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La reacción consume los reactivos mol a mol, no gramo a gramo. 2 g de ácido salicílico son 0.0145 mol y 5.4 g de anhídrido son 0.0529 mol: el ácido salicílico es el limitante.",
    "comoComprobarlo": "Elige Aspirina, pulsa Reaccionar y mira qué probeta llega a cero. Luego sube los gramos de ácido salicílico y repite."
  },
  "razon-proporcion": {
    "escena": "Una gráfica 3D donde un punto se mueve al cambiar los albañiles, con un medidor que muestra X por Y.",
    "pregunta": "En la proporción inversa, si duplicas los albañiles, ¿qué pasa con X × Y?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se duplica también",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "c",
    "porque": "Al duplicar a los albañiles, los días se reducen a la mitad. Uno sube y el otro baja justo lo necesario, así que el producto sigue siendo constante.",
    "comoComprobarlo": "Elige Inversa y Albañiles; mueve el deslizador de albañiles y vigila el cuadro dorado con X × Y."
  },
  "reaccion-co2": {
    "escena": "Un frasco con 50 mL de vinagre y un globo en la boca que se infla con el CO₂ producido; un deslizador controla los gramos de bicarbonato.",
    "pregunta": "Ya con el bicarbonato justo, ¿qué pasa si le echas el doble?",
    "opciones": [
      {
        "id": "a",
        "texto": "El globo crece al doble",
        "icono": "fa-arrow-up-right-dots"
      },
      {
        "id": "b",
        "texto": "Igual: se acabó el vinagre",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Se desinfla un poco",
        "icono": "fa-arrow-down"
      }
    ],
    "correcta": "b",
    "porque": "El vinagre es el reactivo limitante: cuando se consume todo el ácido, la reacción para. El bicarbonato extra queda sin reaccionar, así que no se produce más CO₂.",
    "comoComprobarlo": "Sube el deslizador de bicarbonato pasando el «punto exacto», pulsa ¡Reaccionar! y compara el tamaño del globo con el de antes."
  },
  "recta-numerica": {
    "escena": "Una recta numérica 3D con una bolita que se desliza y un reflejo punteado al otro lado del cero.",
    "pregunta": "Si mueves la bolita a −4, ¿dónde cae su opuesto?",
    "opciones": [
      {
        "id": "a",
        "texto": "En −4, en el mismo lugar",
        "icono": "fa-location-dot"
      },
      {
        "id": "b",
        "texto": "En 4, del otro lado del cero",
        "icono": "fa-left-right"
      },
      {
        "id": "c",
        "texto": "En 0, sobre el origen",
        "icono": "fa-bullseye"
      }
    ],
    "correcta": "b",
    "porque": "El opuesto está a la misma distancia del cero, pero del lado contrario. Por eso −4 y 4 son un espejo uno del otro, y su valor absoluto es el mismo.",
    "comoComprobarlo": "En Ubicar, activa el botón Opuesto y desliza el número hasta −4; luego mira dónde se coloca el punto cian."
  },
  "redes-troficas": {
    "escena": "Una pirámide trófica de bosque con productores, herbívoros, carnívoros y un depredador tope",
    "pregunta": "Si desaparecen todos los herbívoros, ¿qué les pasa a las plantas?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se multiplican, nadie las come",
        "icono": "fa-seedling"
      },
      {
        "id": "b",
        "texto": "Se mueren por falta de animales",
        "icono": "fa-skull"
      },
      {
        "id": "c",
        "texto": "No cambia nada en ellas",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "Sin herbívoros, las plantas ya no son comidas y su población crece. Pero los carnívoros de arriba se quedan sin alimento: quitar un nivel desordena toda la red.",
    "comoComprobarlo": "En Controles, quita a los herbívoros y mira cuántas esferas de biomasa hay sobre la base de la pirámide."
  },
  "redox-combustion": {
    "escena": "Una pila de zinc y cobre con un foco encendido en el cable. Puedes cambiar el cátodo de cobre por plata.",
    "pregunta": "Cambias el cátodo de cobre por plata, con el mismo zinc. ¿Qué pasa con el foco?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se apaga: la plata no reacciona",
        "icono": "fa-lightbulb"
      },
      {
        "id": "b",
        "texto": "Brilla igual",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Brilla más",
        "icono": "fa-sun"
      }
    ],
    "correcta": "c",
    "porque": "La plata se reduce con más facilidad que el cobre (E° = +0.80 V contra +0.34 V). La diferencia con el zinc crece de 1.10 V a 1.56 V y la pila empuja más a los electrones.",
    "comoComprobarlo": "En Controles de la pila, cambia el cátodo de Cu²⁺/Cu a Ag⁺/Ag y observa el foco y el valor de E°pila."
  },
  "reescritura-taller": {
    "escena": "Un borrador de aviso vecinal lleno de muletillas y repeticiones, y una lectora ficticia que lo lee con un medidor de claridad.",
    "pregunta": "Al tachar las muletillas y repeticiones, ¿qué le pasa a la lectora?",
    "opciones": [
      {
        "id": "a",
        "texto": "Pierde datos y entiende menos",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Entiende igual pero tarda más",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "c",
        "texto": "Entiende mejor y lee en menos tiempo",
        "icono": "fa-bolt"
      }
    ],
    "correcta": "c",
    "porque": "Las muletillas y repeticiones no aportan datos nuevos. Al quitarlas, la información queda igual, sube la claridad y baja el tiempo de lectura.",
    "comoComprobarlo": "En «Cirugía de párrafo» toca varias palabras que sobran y observa los medidores de claridad y tiempo de la lectora."
  },
  "reglas-derivacion": {
    "escena": "Las curvas de f(x) = (x² + 1)(3x − 2) y de su derivada, con una sonda x = a que recorre la gráfica y una recta tangente.",
    "pregunta": "Cuando la tangente a f se inclina más hacia arriba, ¿qué hace la altura de f'?",
    "opciones": [
      {
        "id": "a",
        "texto": "Baja, porque la curva se aplana",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Sube: es igual a la pendiente",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "No cambia, es constante",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "La derivada en a es, por definición, la pendiente de la tangente en ese punto. Si la tangente se inclina más, su pendiente aumenta y el punto sobre la curva f' queda más alto.",
    "comoComprobarlo": "Arrastra la sonda x = a de izquierda a derecha y compara cómo gira la recta verde con la altura del punto ámbar sobre f'."
  },
  "reglas-ingles": {
    "escena": "Mia, una estudiante de intercambio ficticia, vive seis situaciones escolares. Tú escribes la regla con un modal y ves lo que hace.",
    "pregunta": "En la biblioteca, comer está prohibido. Si eliges «don't have to», ¿qué hace Mia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se lo guarda y evita el problema",
        "icono": "fa-bag-shopping"
      },
      {
        "id": "b",
        "texto": "Come y recibe una advertencia",
        "icono": "fa-triangle-exclamation"
      },
      {
        "id": "c",
        "texto": "Come y nadie dice nada",
        "icono": "fa-face-smile"
      }
    ],
    "correcta": "b",
    "porque": "«Don't have to» dice que algo no es necesario, pero se puede hacer. Mia lo entiende como permiso, come y rompe la regla. «Mustn't» es el modal que prohíbe.",
    "comoComprobarlo": "Abre la situación «Library», elige «don't have to» y observa a Mia. Luego prueba «mustn't» y compara."
  },
  "relaciones-poder": {
    "escena": "Tienes fichas para sumar aliados y Radio Valle repite la versión de la empresa",
    "pregunta": "Gastas 2 fichas en llevar Radio Valle a tu lado, sin haber pedido el peritaje. ¿Qué pasa con el balance?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube mucho porque la radio llega a todos los vecinos del valle",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "No se mueve: sin datos, la radio no cambia de lado",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Baja: la empresa responde con más publicidad en la radio",
        "icono": "fa-arrow-trend-down"
      }
    ],
    "correcta": "b",
    "porque": "Un relato necesita respaldo: sin un peritaje propio, la radio no tiene argumentos distintos a los de la empresa. Las fichas se gastan y el balance queda igual.",
    "comoComprobarlo": "En «Actúa en el conflicto» elige solo la acción de Radio Valle y mira el medidor y el color del nodo; luego agrega el peritaje y repite."
  },
  "relato-secuencia-ingles-3d": {
    "escena": "Una línea del tiempo donde cada evento entra según el conector que elijas",
    "pregunta": "En la primera oración eliges «Suddenly» en vez de «First». ¿Cómo entra la ficha?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se desliza desde la izquierda, sin sorpresa",
        "icono": "fa-arrow-right"
      },
      {
        "id": "b",
        "texto": "Cae desde arriba con un destello",
        "icono": "fa-bolt"
      },
      {
        "id": "c",
        "texto": "Aparece tras una barra de causa",
        "icono": "fa-link"
      }
    ],
    "correcta": "b",
    "porque": "«Suddenly» marca algo inesperado, y la línea lo dibuja como una caída con destello. «First» solo abre la secuencia y por eso la ficha se desliza con calma.",
    "comoComprobarlo": "En Connect the events, toca primero «Suddenly», luego «First» en la misma oración, y mira cómo entra la ficha cada vez."
  },
  "resena-critica": {
    "escena": "Armas una reseña de una novela inventada eligiendo una frase para cada parte, mientras tres lectores reaccionan.",
    "pregunta": "En la valoración, ¿qué frase sube más la credibilidad de la reseña?",
    "opciones": [
      {
        "id": "a",
        "texto": "La más tajante: «obra maestra, y punto»",
        "icono": "fa-bolt"
      },
      {
        "id": "b",
        "texto": "La que argumenta qué funciona y qué falla",
        "icono": "fa-scale-balanced"
      },
      {
        "id": "c",
        "texto": "La que cuenta cuánto disfrutó quien reseña",
        "icono": "fa-face-smile"
      }
    ],
    "correcta": "b",
    "porque": "Un juicio convence cuando señala un recurso de la obra, explica su efecto y reconoce un defecto. La opinión sin razones o centrada en el gusto personal no da al lector nada que verificar.",
    "comoComprobarlo": "En «Valoración argumentada» elige cada frase, una por una, y observa el medidor de credibilidad y la cara de la Prof. Ibarra."
  },
  "respiracion-celular": {
    "escena": "Una célula muscular con glucosa y una mitocondria, con un control para el oxígeno disponible",
    "pregunta": "Si bajas el oxígeno disponible a cero, ¿qué pasa con el ATP que saca de cada glucosa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se mantiene igual, la glucosa es la misma",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Cae de unos 38 a solo 2",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "c",
        "texto": "Sube, porque la célula trabaja más rápido",
        "icono": "fa-arrow-trend-up"
      }
    ],
    "correcta": "b",
    "porque": "Sin O₂ la cadena transportadora se detiene y solo queda la glucólisis, que rinde 2 ATP netos. La fermentación regenera NAD⁺ y deja lactato, pero no suma ATP.",
    "comoComprobarlo": "En «Comparar», arrastra el control «Oxígeno disponible» de 100 % a 0 % y cuenta las monedas de ATP y el lactato de la célula aerobia."
  },
  "restauracion-ecosistemas-mexico-3d": {
    "escena": "Un potrero abandonado se deja regenerar solo. Un deslizador pone el bosque maduro cerca o lejos, y la parcela crece con los años.",
    "pregunta": "Si el bosque maduro queda a 2 km del potrero, ¿cómo está la parcela a los 40 años?",
    "opciones": [
      {
        "id": "a",
        "texto": "Ya es un bosque joven denso",
        "icono": "fa-tree"
      },
      {
        "id": "b",
        "texto": "Sigue pobre: llegan pocas semillas",
        "icono": "fa-seedling"
      },
      {
        "id": "c",
        "texto": "Igual que si estuviera pegado al bosque",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Los árboles nuevos nacen de semillas que traen aves y murciélagos desde el bosque. A 2 km casi no llegan, así que la regeneración natural se estanca. Ahí conviene plantar o sembrar islas de árboles.",
    "comoComprobarlo": "En «Restaurar una parcela» deja la regeneración natural, sube la distancia al bosque a 2 000 m y corre la simulación hasta el año 40."
  },
  "rutina-diaria-ingles-3d": {
    "escena": "El calendario semanal de Ana, con una escala de frecuencia de 0 % a 100 %",
    "pregunta": "Ana come comida rápida solo un día de la semana. ¿Dónde se detiene la barra?",
    "opciones": [
      {
        "id": "a",
        "texto": "En «sometimes», la mitad de la escala",
        "icono": "fa-chart-simple"
      },
      {
        "id": "b",
        "texto": "En «rarely», cerca de la base",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "En «never», justo en cero",
        "icono": "fa-ban"
      }
    ],
    "correcta": "b",
    "porque": "Un día de siete es cerca de 14 %. Eso queda junto a «rarely» (20 %) y lejos de «never» (0 %), que significa ningún día, y de «sometimes» (50 %).",
    "comoComprobarlo": "En «How often?» elige el hábito de la comida rápida, cuenta sus fichas de color y mira hasta dónde sube la barra."
  },
  "seleccion-natural-evolucion-3d": {
    "escena": "Una población de 24 conejos mitad claros y mitad oscuros, en un campo nevado donde vuelan aves que los cazan.",
    "pregunta": "Después de muchas generaciones en la nieve, ¿qué conejos serán la mayoría?",
    "opciones": [
      {
        "id": "a",
        "texto": "Los oscuros, porque son más fuertes",
        "icono": "fa-dumbbell"
      },
      {
        "id": "b",
        "texto": "Los claros, por camuflarse mejor",
        "icono": "fa-snowflake"
      },
      {
        "id": "c",
        "texto": "Quedan mitad y mitad",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Sobre la nieve los depredadores ven mejor a los oscuros y se los comen más. Los claros sobreviven y se reproducen, así que su pelaje se hace más común generación tras generación.",
    "comoComprobarlo": "Elige «Campo nevado», deja correr las generaciones (o arrastra el deslizador de generación) y mira la gráfica y los conejos."
  },
  "semejanza-triangulos": {
    "escena": "Una persona y una torre proyectan sombras bajo el mismo Sol, que está alto en el cielo.",
    "pregunta": "Si bajas el Sol y las sombras se alargan, ¿qué pasa con la razón k torre/persona?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aumenta junto con las sombras",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Disminuye porque la torre es más alta",
        "icono": "fa-arrow-down"
      }
    ],
    "correcta": "b",
    "porque": "Los rayos son paralelos, así que ambos triángulos tienen el mismo ángulo y son semejantes. Las dos sombras crecen en la misma proporción: la razón y la altura calculada no cambian.",
    "comoComprobarlo": "Arrastra el control de elevación del Sol de arriba a abajo y observa el valor de k y la altura calculada."
  },
  "sentido-historico": {
    "escena": "El museo comunitario de un pueblo ficticio con una línea del tiempo y la tarjeta «distribución de la tierra»",
    "pregunta": "Cuelgas la distribución de la tierra de la Conquista, no del reparto agrario. ¿Qué pasa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube igual: cualquier pasado sirve",
        "icono": "fa-arrow-trend-up"
      },
      {
        "id": "b",
        "texto": "No se enciende; dice por qué",
        "icono": "fa-link-slash"
      },
      {
        "id": "c",
        "texto": "La tarjeta desaparece del pueblo",
        "icono": "fa-eraser"
      }
    ],
    "correcta": "b",
    "porque": "El sentido histórico no es culpar a cualquier pasado: cada situación se explica por el proceso que la formó. El museo rechaza el vínculo y señala qué fenómeno sí explica esa raíz.",
    "comoComprobarlo": "Toca la tarjeta de la tierra y luego el número de la Conquista; después prueba con el proceso posterior a la Revolución y compara el medidor."
  },
  "separacion-mezclas": {
    "escena": "Tres vasos: en el central hay agua con sal; sobre él se coloca la herramienta de un método de separación.",
    "pregunta": "Para sacar la sal del agua salada, ¿qué método la separa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Filtración",
        "icono": "fa-filter"
      },
      {
        "id": "b",
        "texto": "Destilación",
        "icono": "fa-fire"
      },
      {
        "id": "c",
        "texto": "Decantación",
        "icono": "fa-flask"
      }
    ],
    "correcta": "b",
    "porque": "La sal está disuelta: sus partículas pasan por el filtro y no se asientan. El agua hierve y se evapora a 100 °C, la sal no, y así se separan.",
    "comoComprobarlo": "Elige «Agua salada», prueba cada método con el botón Separar y mira en cuál las partículas viajan a sus vasos."
  },
  "sistemas-ecuaciones-2x2": {
    "escena": "Dos rectas sobre el piso se cruzan en una columna dorada; la 2ª recta tiene pendiente −0.5 y la 1ª, −1.",
    "pregunta": "Si pones la pendiente m₂ en −1, igual que la 1ª recta, ¿qué pasa con la columna?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se queda en el mismo punto",
        "icono": "fa-location-dot"
      },
      {
        "id": "b",
        "texto": "Desaparece: las rectas ya no se cruzan",
        "icono": "fa-eye-slash"
      },
      {
        "id": "c",
        "texto": "Se hace más alta",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "Con la misma pendiente las rectas quedan paralelas y nunca se cortan. Sin punto de cruce no hay solución, así que no hay dónde levantar la columna.",
    "comoComprobarlo": "Con Gallinas y conejos, mueve el deslizador m₂ hasta −1 y mira el piso."
  },
  "software-libre-3d": {
    "escena": "Una sala de cómputo con 30 equipos. Una moneda por cada gasto: Office de pago único contra Microsoft 365 por suscripción mensual.",
    "pregunta": "Pasas la sala de 1 a 5 años de uso. ¿Qué pasa con el costo de la suscripción frente a comprar?",
    "opciones": [
      {
        "id": "a",
        "texto": "La suscripción siempre es más barata porque se paga por mes",
        "icono": "fa-arrow-trend-down"
      },
      {
        "id": "b",
        "texto": "Se cruzan: barata al inicio, la suscripción termina cara",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "c",
        "texto": "La compra sale más barata desde el primer año, siempre",
        "icono": "fa-key"
      }
    ],
    "correcta": "b",
    "porque": "Comprar se paga una sola vez; la suscripción suma cada mes. Al principio se paga menos, pero alrededor del mes 18 la suma alcanza al pago único y después lo rebasa.",
    "comoComprobarlo": "En «Equipa la sala» elige Ofimática, deja 30 equipos y mueve el deslizador de años de 1 a 5 mirando la gráfica y el total."
  },
  "subgeneros-narrativos": {
    "escena": "Una mesa de editor con un cuento sin género y cuatro ranuras de convenciones; solo está elegido el escenario",
    "pregunta": "Eliges «una ciudad flotante en el año 2160» como único escenario. ¿Qué subgénero lidera el medidor?",
    "opciones": [
      {
        "id": "a",
        "texto": "Terror, por lo extraño del lugar",
        "icono": "fa-ghost"
      },
      {
        "id": "b",
        "texto": "Ciencia ficción",
        "icono": "fa-rocket"
      },
      {
        "id": "c",
        "texto": "Autoficción, por la voz narrativa",
        "icono": "fa-pen-fancy"
      }
    ],
    "correcta": "b",
    "porque": "Imaginar futuros y sociedades alternativas es la convención central de la ciencia ficción. Un escenario así empuja al lector hacia ese subgénero aunque aún falten personaje, conflicto y tono.",
    "comoComprobarlo": "Abre la Mesa del editor, elige solo el escenario de la ciudad flotante y mira cuál barra del lector simulado crece más."
  },
  "subsistemas-terrestres": {
    "escena": "Una Tierra con termómetro junto a ella, con CO₂ de 1850 (280 ppm) y bosque intacto",
    "pregunta": "Si el CO₂ sube de 280 a 420 ppm, ¿cuánto sube la temperatura media?",
    "opciones": [
      {
        "id": "a",
        "texto": "Casi nada, menos de 0.3 °C",
        "icono": "fa-temperature-low"
      },
      {
        "id": "b",
        "texto": "Cerca de 1.8 °C",
        "icono": "fa-temperature-half"
      },
      {
        "id": "c",
        "texto": "Más de 5 °C",
        "icono": "fa-temperature-full"
      }
    ],
    "correcta": "b",
    "porque": "Subir 50 % el CO₂ refuerza el efecto invernadero. Con sensibilidad de ~3 °C por duplicación, 280 a 420 ppm da cerca de +1.8 °C, más que el límite de 1.5 °C.",
    "comoComprobarlo": "Mueve el deslizador de CO₂ hasta 420 ppm y compara el nivel del termómetro con la marca blanca."
  },
  "taller-descripcion-narracion": {
    "escena": "Describes la casa de tu abuela y el lector la dibuja en su cabeza",
    "pregunta": "¿Qué hace que el lector vea TU casa y no una cualquiera?",
    "opciones": [
      {
        "id": "a",
        "texto": "Un adjetivo superlativo, como «preciosísima»",
        "icono": "fa-star"
      },
      {
        "id": "b",
        "texto": "Un dato exacto, como el material",
        "icono": "fa-eye"
      },
      {
        "id": "c",
        "texto": "Una conclusión, como «inolvidable»",
        "icono": "fa-scale-unbalanced"
      }
    ],
    "correcta": "b",
    "porque": "Un dato verificable obliga al lector a imaginar algo concreto. Los adjetivos y los juicios solo cuentan lo que tú sentiste, y cada lector rellena con su propia casa.",
    "comoComprobarlo": "En «Pinta con detalles» prueba los tres rellenos de «La casa de la abuela» uno por uno y mira el cuadro del lector."
  },
  "taller-parrafos": {
    "escena": "Un lector ficticio lee un párrafo sobre cuidar el agua armado con tarjetas de oraciones",
    "pregunta": "Si metes una oración que no habla del tema dentro del párrafo, ¿qué hace el lector?",
    "opciones": [
      {
        "id": "a",
        "texto": "La ignora y entiende igual",
        "icono": "fa-eye-slash"
      },
      {
        "id": "b",
        "texto": "Pierde el hilo y comprende menos",
        "icono": "fa-face-dizzy"
      },
      {
        "id": "c",
        "texto": "Comprende mejor por tener más datos",
        "icono": "fa-lightbulb"
      }
    ],
    "correcta": "b",
    "porque": "Un párrafo se sostiene en una sola idea. Una oración ajena rompe esa unidad y el lector ya no sabe qué es lo importante.",
    "comoComprobarlo": "En «Taller del párrafo», arma tema, apoyos y cierre; luego cambia un apoyo por la tarjeta del futbol y observa el medidor."
  },
  "tecnicas-conteo-3d": {
    "escena": "Un árbol de decisiones de izquierda a derecha: 3 playeras y 2 pantalones dan una hoja por cada conjunto posible.",
    "pregunta": "Agregas una tercera etapa: zapatos, con 2 opciones. ¿Cuántas hojas tendrá el árbol?",
    "opciones": [
      {
        "id": "a",
        "texto": "8: se suma la nueva etapa",
        "icono": "fa-plus"
      },
      {
        "id": "b",
        "texto": "12: el total se duplica",
        "icono": "fa-xmark"
      },
      {
        "id": "c",
        "texto": "7: se agrega una sola rama",
        "icono": "fa-code-branch"
      }
    ],
    "correcta": "b",
    "porque": "Cada etapa se multiplica, no se suma: a cada una de las 6 combinaciones de ropa se le puede poner cualquiera de los 2 zapatos, así que 3 × 2 × 2 = 12 resultados.",
    "comoComprobarlo": "En el modo «Principio multiplicativo» deja 3 y 2 opciones, pulsa «Agregar una tercera etapa: zapatos» y observa cuántas hojas aparecen."
  },
  "temas-ideas-narrativa": {
    "escena": "Armas un relato de tres escenas sobre la crecida de un río y escoges de qué debe tratar.",
    "pregunta": "Si tus tres escenas cuentan el miedo y eliges el tema «solidaridad», ¿qué pasa con la coherencia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Baja: las escenas no lo sostienen",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Sube, porque aparece todo el pueblo",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "Igual, el tema es cuestión de opinión",
        "icono": "fa-equals"
      }
    ],
    "correcta": "a",
    "porque": "El tema no se decreta: sale de lo que las escenas repiten. Si las tres cuentan miedo, el motivo que vuelve es otro y el relato no sostiene la solidaridad.",
    "comoComprobarlo": "En «Taller del tema», elige las tres escenas del miedo con ese tema activo; luego cambia el tema a «solidaridad» y mira el medidor."
  },
  "teorema-fundamental-calculo": {
    "escena": "El área bajo f(x) = 2x hasta b = 3, cubierta con 6 rectángulos amarillos de Riemann.",
    "pregunta": "Subes de 6 a 40 rectángulos. ¿Qué le pasa al error de la suma de Riemann?",
    "opciones": [
      {
        "id": "a",
        "texto": "Aumenta, hay más piezas",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Casi desaparece",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "Cada rectángulo más delgado deja menos hueco entre su borde y la curva. Con más piezas la suma se pega al área exacta, y ese límite es justo la integral definida.",
    "comoComprobarlo": "Mueve el deslizador de rectángulos n y mira el porcentaje de error en el medidor."
  },
  "teorema-pitagoras": {
    "escena": "Un triángulo rectángulo con un cuadrado dibujado sobre cada uno de sus tres lados.",
    "pregunta": "Alargas un cateto. ¿Qué pasa con el cuadrado de la hipotenusa?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se queda igual",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "También crece",
        "icono": "fa-up-right-and-down-left-from-center"
      },
      {
        "id": "c",
        "texto": "Se hace más pequeño",
        "icono": "fa-down-left-and-up-right-to-center"
      }
    ],
    "correcta": "b",
    "porque": "El área de la hipotenusa siempre vale la suma de las áreas de los catetos. Si un cateto crece, su cuadrado crece, y la hipotenusa también para seguir cumpliendo a² + b² = c².",
    "comoComprobarlo": "Mueve el deslizador del cateto a y compara el valor de c² con la suma a² + b² en la escena."
  },
  "terminal-horarios-ingles-3d": {
    "escena": "Lucy llega al módulo de información de la terminal y necesita saber dónde están los baños",
    "pregunta": "Si le escribes a Rosa «Excuse me, where are the restrooms?», ¿qué hace Lucy en la terminal?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se queda esperando frente al módulo de información",
        "icono": "fa-hourglass-half"
      },
      {
        "id": "b",
        "texto": "Camina a los baños y se iluminan",
        "icono": "fa-restroom"
      },
      {
        "id": "c",
        "texto": "Corre a la salida de los taxis",
        "icono": "fa-taxi"
      }
    ],
    "correcta": "b",
    "porque": "Where pide un lugar y la pregunta está bien formada, así que Rosa contesta con la ubicación. Lucy recibe el dato, camina hacia allá y el local queda resaltado.",
    "comoComprobarlo": "En «Ask the right question» elige el dato 1, escribe esa pregunta y pulsa Preguntar a Rosa; luego cámbiala a «What time…» y compara."
  },
  "textos-funcionales-ingles": {
    "escena": "Le pides por correo a tu amigo Tomás sus diapositivas del proyecto",
    "pregunta": "Si a tu amigo le escribes «Dear Mr. Gómez» y «Yours faithfully», ¿cómo responde?",
    "opciones": [
      {
        "id": "a",
        "texto": "Te manda todo: lo formal siempre suma",
        "icono": "fa-thumbs-up"
      },
      {
        "id": "b",
        "texto": "Te pregunta si estás molesto con él",
        "icono": "fa-face-meh"
      },
      {
        "id": "c",
        "texto": "Ni lo abre: parece spam",
        "icono": "fa-envelope"
      }
    ],
    "correcta": "b",
    "porque": "El registro depende de quién lee. Con un amigo, «Dear Mr.» y «Yours faithfully» suenan fríos, como de oficina: Tomás no se ofende, pero lo nota y pregunta si pasa algo. Entre amigos van «Hi Tomás,» y «See you,».",
    "comoComprobarlo": "En «Outbox», abre la misión de Tomás, deja todas las piezas informales salvo el saludo «Dear Mr. Gómez,» y la despedida «Yours faithfully,», y pulsa «Send»."
  },
  "tiempo-historico": {
    "escena": "Estás en un taller de línea del tiempo con la Revolución Mexicana (1910) y la Constitución de 1917 ya colocadas por décadas.",
    "pregunta": "Si cambias la escala de década a siglo, ¿qué pasa con esos dos sucesos?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se separan más y se distinguen mejor",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "b",
        "texto": "Quedan en la misma marca, sin orden claro",
        "icono": "fa-equals"
      },
      {
        "id": "c",
        "texto": "Desaparecen de la línea por estar muy cerca",
        "icono": "fa-eye-slash"
      }
    ],
    "correcta": "b",
    "porque": "Una escala gruesa redondea las fechas: 1910 y 1920 pasan a ser «1900». Se pierde el orden fino y también la coherencia, aunque los dos sucesos ocurrieron en tiempos distintos.",
    "comoComprobarlo": "Con escala «Década», coloca la Revolución en 1910 y la Constitución en 1920; luego pulsa «Siglo» y mira sus barras y la coherencia."
  },
  "tiempo-libre-ingles": {
    "escena": "Una radio escolar entrevista a Ana y su agenda de fin de semana empieza vacía",
    "pregunta": "En la entrevista de Ana, ¿qué pasa si eliges «She play soccer» sin la -s?",
    "opciones": [
      {
        "id": "a",
        "texto": "La casilla se llena de futbol igual",
        "icono": "fa-futbol"
      },
      {
        "id": "b",
        "texto": "Sale ruido y baja la señal",
        "icono": "fa-wave-square"
      },
      {
        "id": "c",
        "texto": "Cambia el día de la actividad",
        "icono": "fa-calendar-days"
      }
    ],
    "correcta": "b",
    "porque": "Con she el verbo en presente simple necesita -s. Sin ella el público no entiende la frase: la casilla queda con estática y la señal de la radio pierde una barra.",
    "comoComprobarlo": "En «Radio Prepa» elige primero la frase sin -s y luego la que sí la lleva; compara la casilla de la agenda y las barras de señal."
  },
  "tipos-de-preguntas": {
    "escena": "Entrevistas a Doña Elena, una relojera ficticia, para un reporte sobre el tiempo. Tienes cinco preguntas y ves cómo contesta cada tipo.",
    "pregunta": "Si le preguntas «¿Qué es el tiempo?», ¿cómo te responde Doña Elena?",
    "opciones": [
      {
        "id": "a",
        "texto": "Con una cifra y la hora exacta de ahora",
        "icono": "fa-clock"
      },
      {
        "id": "b",
        "texto": "Reflexiona, sin respuesta única",
        "icono": "fa-brain"
      },
      {
        "id": "c",
        "texto": "Con un experimento que lo comprueba y sus datos",
        "icono": "fa-flask"
      }
    ],
    "correcta": "b",
    "porque": "Es una pregunta filosófica: ningún dato ni experimento la cierra. Obliga a aclarar conceptos, así que la respuesta es una reflexión que abre más preguntas.",
    "comoComprobarlo": "En «La entrevista», pulsa «¿Qué es el tiempo?» y luego «¿Qué hora es?». Compara cuántas palabras tiene cada respuesta."
  },
  "tipos-energia-aplicaciones-3d": {
    "escena": "Un aerogenerador de 90 m de diámetro con su diagrama de flujo de energía: el viento entra, la electricidad sale y el resto se pierde como calor.",
    "pregunta": "Si el viento pasa de 5 a 10 m/s, ¿cuánta más electricidad produce el aerogenerador?",
    "opciones": [
      {
        "id": "a",
        "texto": "El doble (2 veces)",
        "icono": "fa-x"
      },
      {
        "id": "b",
        "texto": "Ocho veces más",
        "icono": "fa-wind"
      },
      {
        "id": "c",
        "texto": "Cuatro veces más",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "b",
    "porque": "La potencia del viento depende de la velocidad al cubo (v³). Si v se duplica, 2³ = 8: la franja de electricidad del diagrama se vuelve ocho veces más ancha.",
    "comoComprobarlo": "En «Aprovéchala», elige el aerogenerador, guarda la medición A con 5 m/s, sube el viento a 10 m/s y compara las potencias."
  },
  "tipos-graficas": {
    "escena": "Una mesa de redacción con seis conjuntos de datos inventados: tú eliges el tipo de gráfica y una lectora de prueba reacciona.",
    "pregunta": "Dibujas con un gráfico de líneas los hogares con internet de 8 municipios sin orden. ¿Qué entiende la lectora?",
    "opciones": [
      {
        "id": "a",
        "texto": "Una tendencia inventada entre municipios",
        "icono": "fa-chart-line"
      },
      {
        "id": "b",
        "texto": "Con claridad, qué municipio va atrás",
        "icono": "fa-circle-check"
      },
      {
        "id": "c",
        "texto": "El porcentaje total de hogares conectados en la zona",
        "icono": "fa-percent"
      }
    ],
    "correcta": "a",
    "porque": "La línea une puntos como si hubiera un orden o un paso del tiempo. Con categorías sueltas inventa una tendencia que no existe; las barras comparan sin sugerirla.",
    "comoComprobarlo": "En el caso 1 elige «Líneas», lee la reacción de la lectora y luego cambia a «Barras» para comparar su respuesta."
  },
  "tipos-reacciones-quimicas": {
    "escena": "Átomos de hidrógeno y oxígeno unidos por barras; un avance los lleva de reactivos a productos.",
    "pregunta": "Al llevar el avance a la mitad, ¿qué pasa con átomos y enlaces?",
    "opciones": [
      {
        "id": "a",
        "texto": "Desaparecen átomos y surgen otros nuevos",
        "icono": "fa-wand-magic-sparkles"
      },
      {
        "id": "b",
        "texto": "Enlaces viejos se rompen; mismos átomos",
        "icono": "fa-link-slash"
      },
      {
        "id": "c",
        "texto": "Los enlaces no cambian, solo se acercan",
        "icono": "fa-arrows-left-right-to-line"
      }
    ],
    "correcta": "b",
    "porque": "En una reacción los átomos solo se reorganizan: ninguno se crea ni se destruye (Lavoisier). Los enlaces de los reactivos se rompen y se forman los de los productos, por eso el conteo de átomos no cambia.",
    "comoComprobarlo": "Arrastra el avance poco a poco y observa las dos barras de enlaces, además del conteo de átomos en el panel."
  },
  "trabajo-potencia-mecanica": {
    "escena": "Una caja naranja empujada sobre el piso por una flecha de fuerza inclinada, con una barra vertical de trabajo a un lado.",
    "pregunta": "Si empujas la caja con la fuerza apuntando a 90° del movimiento, ¿cuánto trabajo haces?",
    "opciones": [
      {
        "id": "a",
        "texto": "Cero joules",
        "icono": "fa-0"
      },
      {
        "id": "b",
        "texto": "La mitad del máximo",
        "icono": "fa-divide"
      },
      {
        "id": "c",
        "texto": "El máximo posible",
        "icono": "fa-arrow-up"
      }
    ],
    "correcta": "a",
    "porque": "Solo la parte de la fuerza alineada con el desplazamiento hace trabajo: F·cos θ. A 90° el coseno vale cero, así que no se transfiere energía aunque la caja siga avanzando.",
    "comoComprobarlo": "En «Trabajo» sube el ángulo θ de 0° a 90° y observa la barra de trabajo y la flecha verde."
  },
  "transferencia-calor-mecanismos": {
    "escena": "Una barra de átomos tiene un extremo pegado a una fuente de calor",
    "pregunta": "Cambias la barra de cobre por una de madera. ¿Qué pasa con el extremo lejano?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se calienta igual de rápido",
        "icono": "fa-equals"
      },
      {
        "id": "b",
        "texto": "Casi no se calienta",
        "icono": "fa-snowflake"
      },
      {
        "id": "c",
        "texto": "Se calienta más rápido",
        "icono": "fa-fire"
      }
    ],
    "correcta": "b",
    "porque": "La madera es aislante: sus partículas se pasan poco la vibración al vecino. El cobre es conductor y la transmite rápido. Por eso los mangos de las ollas son de madera.",
    "comoComprobarlo": "En Conducción elige Cobre y mira el termómetro del extremo lejano; luego reinicia y repite con Madera."
  },
  "transformaciones-funciones": {
    "escena": "Una parábola naranja f(x) = a(x−h)² + k sobre su función padre punteada, con un balón que la recorre.",
    "pregunta": "Si subes k de 4 a 6 sin tocar a ni h, ¿qué le pasa a la parábola?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sube 2 unidades sin deformarse",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Se hace más angosta",
        "icono": "fa-compress"
      },
      {
        "id": "c",
        "texto": "Se desliza 2 unidades a la derecha",
        "icono": "fa-arrow-right"
      }
    ],
    "correcta": "a",
    "porque": "k es la traslación vertical: suma a todas las alturas. La forma no cambia porque a sigue igual; solo el vértice sube de (2, 4) a (2, 6).",
    "comoComprobarlo": "Deja a = −0,5 y h = 2, mueve el deslizador k de 4 a 6 y mira dónde queda el vértice."
  },
  "trascendentes-derivacion": {
    "escena": "Una curva con una recta tangente que se desliza sobre ella y, aparte, la curva ámbar de su derivada",
    "pregunta": "Si la tangente a f sube hacia la derecha, ¿dónde queda el punto ámbar de la derivada?",
    "opciones": [
      {
        "id": "a",
        "texto": "Por encima del eje horizontal",
        "icono": "fa-arrow-up"
      },
      {
        "id": "b",
        "texto": "Por debajo del eje horizontal",
        "icono": "fa-arrow-down"
      },
      {
        "id": "c",
        "texto": "Justo sobre el eje, siempre",
        "icono": "fa-minus"
      }
    ],
    "correcta": "a",
    "porque": "La altura del punto ámbar es la pendiente de la tangente. Si la recta sube, su pendiente es positiva y f' vale más que cero en ese punto.",
    "comoComprobarlo": "Elige una función y mueve la sonda x = a despacio; observa la flecha de la leyenda y la altura del punto ámbar respecto al eje."
  },
  "triangulo-rectangulo": {
    "escena": "Un observador mide con clinómetro la copa de un árbol; el triángulo rectángulo se arma en 3D.",
    "pregunta": "Con el ángulo fijo, si duplicas la distancia al árbol, ¿qué pasa con el cateto opuesto?",
    "opciones": [
      {
        "id": "a",
        "texto": "Se reduce a la mitad",
        "icono": "fa-arrow-down"
      },
      {
        "id": "b",
        "texto": "Se duplica",
        "icono": "fa-arrow-up"
      },
      {
        "id": "c",
        "texto": "No cambia",
        "icono": "fa-equals"
      }
    ],
    "correcta": "b",
    "porque": "El opuesto es d·tan θ. Si θ no cambia, tan θ es constante y el opuesto crece en la misma proporción que d: los triángulos son semejantes.",
    "comoComprobarlo": "Fija el ángulo, mueve el deslizador de distancia al doble y compara el valor del opuesto en el medidor."
  },
  "valor-posicional": {
    "escena": "Cubitos, barras, placas y cubos base-10 en cuatro columnas, con un marco del tamaño de una barra junto a las unidades.",
    "pregunta": "Si agregas un cubito más a las 9 unidades, ¿qué ocurre con los bloques?",
    "opciones": [
      {
        "id": "a",
        "texto": "Hay 10 cubitos sueltos en la columna",
        "icono": "fa-cubes"
      },
      {
        "id": "b",
        "texto": "Los cubitos se cambian por 1 barra de decenas",
        "icono": "fa-grip-lines-vertical"
      },
      {
        "id": "c",
        "texto": "Los cubitos desaparecen sin dejar nada",
        "icono": "fa-eraser"
      }
    ],
    "correcta": "b",
    "porque": "Diez unidades forman una decena: la columna de unidades queda en 0 y aparece una barra en decenas. Cada posición vale 10 veces la de su derecha.",
    "comoComprobarlo": "Sube las unidades con el botón más hasta 9 y presiona una vez más."
  },
  "variables-poblacion-muestra-3d": {
    "escena": "Una escuela de 1 500 estudiantes. Cada encuesta al azar da una media de hermanos, y cada media cae en un punto distinto.",
    "pregunta": "Repites muchas encuestas. Al pasar de n = 20 a n = 500, ¿cómo quedan sus medias?",
    "opciones": [
      {
        "id": "a",
        "texto": "Más juntas alrededor del valor real",
        "icono": "fa-bullseye"
      },
      {
        "id": "b",
        "texto": "Igual de dispersas, solo cambia el centro",
        "icono": "fa-arrows-left-right"
      },
      {
        "id": "c",
        "texto": "Más separadas, porque hay más datos que varían",
        "icono": "fa-expand"
      }
    ],
    "correcta": "a",
    "porque": "Una muestra grande promedia muchos casos y los extremos se compensan. El error típico baja con la raíz de n: con 500 las medias se agrupan mucho más que con 20.",
    "comoComprobarlo": "En «Población y muestra» elige n = 20 y pulsa «Repetir 20 veces»; luego n = 500 y repite. Compara el ancho de las dos filas de puntos."
  },
  "viaje-paquete-internet-3d": {
    "escena": "Una red con tu casa, routers y servidores. Eliges qué archivo envías y a qué servidor, y los paquetes viajan por la ruta.",
    "pregunta": "Mandas una foto de 3 MB. ¿Cuántos paquetes de red hacen falta?",
    "opciones": [
      {
        "id": "a",
        "texto": "Uno solo, la foto va completa",
        "icono": "fa-image"
      },
      {
        "id": "b",
        "texto": "Unos dos mil paquetes pequeños",
        "icono": "fa-boxes-stacked"
      },
      {
        "id": "c",
        "texto": "Unos tres millones, uno por byte",
        "icono": "fa-infinity"
      }
    ],
    "correcta": "b",
    "porque": "Cada paquete lleva como máximo 1 460 bytes de datos (de 1 500 totales, 40 son encabezados). Entonces 3 000 000 ÷ 1 460, redondeado hacia arriba, da 2 055 paquetes.",
    "comoComprobarlo": "En «El viaje del paquete» elige «Foto del celular», escribe tu predicción en el cuadro y presiona Enviar; compara con el conteo final."
  },
  "volumen-cilindro": {
    "escena": "Un tanque cilíndrico transparente que se llena de agua, con su radio y altura marcados.",
    "pregunta": "Duplicas el radio del tanque sin cambiar su altura. ¿Cuánto crece el volumen?",
    "opciones": [
      {
        "id": "a",
        "texto": "El doble",
        "icono": "fa-xmark"
      },
      {
        "id": "b",
        "texto": "Cuatro veces más",
        "icono": "fa-up-right-and-down-left-from-center"
      },
      {
        "id": "c",
        "texto": "Ocho veces más",
        "icono": "fa-cubes"
      }
    ],
    "correcta": "b",
    "porque": "El radio va al cuadrado en V = π·r²·h. Al duplicarlo, la base se hace 2² = 4 veces mayor y la altura sigue igual, así que cada disco apilado es cuatro veces más grande.",
    "comoComprobarlo": "Mueve el deslizador del radio al doble y mira el contador «Capacidad vs. tanque original» sobre la escena."
  }
};
