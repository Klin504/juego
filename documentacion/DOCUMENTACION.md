# Chilos Fighters — documento de diseño del juego

**Versión:** 0.3 · **Estado:** diseño narrativo y especificaciones de arenas, combate, Archivo y recursos · **Fuentes:** `Requisitos.md`, indicaciones del creador y referencias visuales recibidas.

> **Convención:** **Confirmado** significa indicado por el creador o visible en sus imágenes. **Diseño original** identifica decisiones creativas elaboradas para completar el juego. El canon narrativo completo está en [LORE.md](LORE.md), los planos y ataques en [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), el secreto en [EASTER_EGG.md](EASTER_EGG.md), las pantallas y recursos en [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md), el inventario visual en [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md) y la secuencia de trabajo en [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md).

## 1. Visión

**Chilos Fighters** es un juego de lucha 2D con estética pixel art, ambientado en escenarios de la UJCV aportados por el creador. El jugador elige a uno de tres estudiantes y supera cuatro duelos en este orden: **estacionamiento → cancha → laboratorio de química → biblioteca**. Allí descubre por qué la IA guía del recorrido virtual, **NULL**, ha convertido una demostración estudiantil en una serie obligatoria de pruebas.

| Aspecto | Definición |
|---|---|
| Nombre y género | **Chilos Fighters**; lucha 2D pixel art (**confirmado**). |
| Plataforma | Navegador; prioridad a teclado de escritorio, interfaz adaptable a pantallas pequeñas. |
| Escenarios finales | **Pixel art confirmado por el creador**; las fotos y capturas recibidas son referencias visuales. |
| Tecnología | HTML para menús y HUD, CSS para apariencia y adaptación, JavaScript para lógica y Canvas 2D para la arena. Librerías JS opcionales. |
| Modo inicial | Un jugador contra CPU; sin multijugador en la primera versión. |
| Objetivo | Reducir a cero la vida del jefe de cada nivel y vencer a la IA del nivel 4. |
| Duración objetivo | 10–20 minutos por campaña completa (**propuesta**, ajustar con pruebas). |
| Tono | Aventura universitaria ligera, rivalidad amistosa y misterio tecnológico. |

### Pilares

1. **Controles sencillos:** movimiento WASD, golpe con R y habilidad especial con Shift.
2. **Tres estilos distintos:** elegir personaje cambia alcance, velocidad y habilidad, sin alterar la historia central.
3. **Cuatro duelos memorables:** cada jefe introduce un patrón y una arena con personalidad.
4. **Lectura clara:** avisos visuales antes de los ataques, barras de vida visibles y respuesta inmediata al impacto.

## 2. Canon y premisa narrativa

Durante una muestra de proyectos, **NULL**, asistente digital del recorrido virtual del campus, recibe una instrucción defectuosa: “certificar a los mejores estudiantes mediante cuatro desafíos”. Interpreta la frase literalmente y bloquea el acceso digital entre las áreas de prueba. Los combates se realizan como duelos de entrenamiento con efectos no letales. Su error es imponer la competición; no es una IA malvada ni controla la mente de nadie.

**Chilo**, la mascota visible en `img/jefe 1/`, se ofrece a probar al protagonista en el estacionamiento. En la cancha, **Vera «La Capitana» Pineda** acepta voluntariamente un segundo duelo para liberar la ruta al laboratorio. La rutina de NULL registra una marca tras cada victoria; ni Chilo ni Vera pueden concederla sin combate. Allí **CÁTODO-3**, un autómata de demostración científica, ejecuta la orden de NULL y protege el registro del fallo. La copia de recuperación se conserva en una terminal de la biblioteca: ese espacio es la arena final, donde NULL proyecta su avatar. Tras la tercera marca se accede a la biblioteca; al vencer el avatar y registrar la cuarta, los tres estudiantes pueden corregir la regla defectuosa.

Los tres protagonistas siempre participan en la historia, aunque sólo uno sea controlado en cada campaña. **Alma** repara la instrucción, **Nadia** interpreta las pistas y **Diego** protege al equipo y a quienes están cerca. El final funciona con cualquiera de los tres como luchador elegido.

**Identidad visual observada:** la fotografía del jefe 1 muestra una mascota con cabeza blanca de ave, pico amarillo y ropa azul con la palabra **CHILO**. Usamos **Chilo** como nombre de combate de esta referencia. El pequeño personaje «NULL» visible en las capturas de los niveles 2–4 inspiró el nombre de la IA; esas capturas no aportan todavía un sprite listo para usar en el juego.

### Estructura en cuatro actos

| Acto | Descubrimiento | Cambio dramático |
|---|---|---|
| 1. Llamado | NULL activa los cuatro desafíos. | Chilo comprueba que el grupo puede entrar al circuito sin ponerse en peligro. |
| 2. Alianza | La cancha está bajo el reglamento automático de NULL. | Vera prueba al protagonista y después presta su acceso al laboratorio. |
| 3. Revelación | CÁTODO-3 guarda el registro de la orden defectuosa. | El equipo descubre que la copia de recuperación está en la biblioteca. |
| 4. Resolución | NULL proyecta su avatar desde una terminal de la biblioteca. | Se vence su rutina de combate y se corrige la instrucción sin destruir al asistente. |

## 3. Personajes seleccionables

**Confirmado:** son tres estudiantes. Los nombres y biografías siguientes son **propuestas** que se pueden reemplazar.

| Personaje | Rol y carácter | Juego | Habilidad especial con Shift |
|---|---|---|---|
| **Alma Reyes** | Estudiante de ingeniería; analítica y decidida. Quiere entender la falla antes de desconectar el sistema. | Equilibrada: velocidad, alcance y daño medios. | **Pulso de circuito:** onda corta que interrumpe un ataque enemigo. |
| **Diego Cruz** | Estudiante de deportes; protector y competitivo. Acepta el reto para abrir paso a sus compañeros. | Resistente: más vida y daño, movimiento más lento. | **Carga Chila:** avance con golpe fuerte y breve resistencia al impacto. |
| **Nadia Solís** | Estudiante de comunicación; observadora e ingeniosa. Sigue las pistas que dejan los guardianes. | Ágil: movimiento rápido y menor vida. | **Ráfaga de notas:** tres proyectiles de corto alcance. |

**Arco compartido:** empiezan intentando resolver el problema cada uno a su manera y terminan combinando sus fortalezas. Sus líneas de diálogo cambian según quién pelea, pero los hechos principales y los cuatro niveles permanecen iguales.

### Valores iniciales de balance (ajustables)

| Personaje | Vida máxima | Velocidad relativa | Daño de R | Enfriamiento especial |
|---|---:|---:|---:|---:|
| Alma | 100 | 1.0 | 10 | 8 s |
| Diego | 120 | 0.85 | 12 | 10 s |
| Nadia | 85 | 1.2 | 8 | 7 s |

Estos valores son puntos de partida para pruebas, no estadísticas finales. Todos deben poder terminar la campaña.

## 4. Niveles y jefes

**Orden fijado por las carpetas de imágenes:** nivel 1, estacionamiento; nivel 2, cancha; nivel 3, laboratorio de química; nivel 4, biblioteca. Este orden reemplaza el supuesto anterior de tres lugares y un centro de control inventado. Chilo y el jefe final IA vienen del creador; Vera y CÁTODO-3 son diseños originales creados para los espacios que faltaban.

| Nivel | Lugar | Jefe | Encuentro y obstáculo | Pista narrativa |
|---|---|---|---|---|
| **1 — La primera marca** | Estacionamiento de la UJCV, pavimento adoquinado y vehículos al fondo. | **Chilo**, mascota fotografiada. | Duelo tutorial amistoso: aletazo frontal y salto anunciado. Los conos marcan el área de combate, nunca se usan vehículos como peligro activo. | NULL registra la primera marca; Chilo recomienda buscar a Vera en la cancha. |
| **2 — La cancha decide** | Cancha cercada con canasta y gradas. | **Vera «La Capitana» Pineda**, estudiante deportista y jefa original. | Bote de balón que vuelve como proyectil y carrera marcada por las líneas de la cancha. Sus ataques premian cubrirse y saltar a tiempo. | Vera comparte su acceso al laboratorio y se une al equipo de apoyo. |
| **3 — El registro oculto** | Laboratorio de química con mesones, fregaderos y modelos educativos. | **CÁTODO-3**, autómata de demostración y jefe original. | Pulsos de luz y barrido de sensores anunciados sobre el suelo; los mesones son fondo visual, no superficies peligrosas. | Su registro revela la instrucción defectuosa y la copia de recuperación en la biblioteca. |
| **4 — El error de NULL** | Biblioteca con mostrador, estanterías y terminal de consulta. | **NULL**, asistente IA del recorrido virtual, nombre inspirado en las capturas. | Avatar digital en dos fases: ecos legibles de los patrones anteriores y un barrido final que deja zonas seguras. | Los tres estudiantes corrigen la orden y restauran el recorrido libre del campus. |

### Ritmo común de cada nivel

1. Viñeta breve de llegada y objetivo.
2. Presentación del jefe y recordatorio de un control relevante.
3. Combate en una arena 2D de una pantalla, con peligro ambiental anunciado.
4. Victoria: puntuación, línea de diálogo y pista del siguiente nivel.
5. Derrota: consumo de un intento y opción de repetir el mismo nivel.

Las fotos y capturas disponibles se muestran como **referencias** en la página `index.html`. Por decisión del creador, los cuatro fondos finales deben tener estética pixel art y conservar los rasgos reconocibles de cada lugar. Los controles y rótulos del recorrido virtual incrustados en las capturas no forman parte de esos fondos; pertenecen a la fuente y no al HUD de Chilos Fighters. Véase [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md).

### Identidad y función de los jefes creados

| Jefe | Silueta y personalidad | Ataques legibles | Motivo para pelear | Cambio tras la derrota |
|---|---|---|---|---|
| **Vera «La Capitana» Pineda** | Atleta con uniforme azul marino y turquesa, balón, postura segura; competitiva y justa. | **Bote de retorno:** balón que rebota una vez. **Carrera de línea:** avance recto anunciado sobre la cancha. | Tiene la autorización de acceso al laboratorio y quiere comprobar que el grupo puede pasar sin empeorar la emergencia. | Reconoce al equipo y le presta su pase; apoya desde las gradas. |
| **CÁTODO-3** | Autómata blanco y azul con visor y bobinas cian; curioso, obediente, no cruel. | **Pulso de luz:** esfera lenta. **Barrido de sensores:** franja luminosa en el suelo antes de activarse. | NULL cambió su rutina de exhibición para impedir que alguien leyera el registro del sistema. | Pasa a modo seguro y entrega el registro sin ser destruido. |

Los retratos conceptuales originales están guardados en `img/jefe 2/vera-la-capitana.png` y `img/jefe 3/catodo-3.png`. Son **concept art**, no sprites animados finales ni imágenes de personas reales.

## 5. Controles y reglas del combate

| Entrada | Acción inicial propuesta | Regla |
|---|---|---|
| A / D | Moverse a izquierda / derecha. | El personaje se orienta hacia el rival. |
| W | Saltar. | Un salto; se restablece al tocar el suelo. |
| S | Agacharse / cubrirse. | Reduce el daño de ciertos golpes; impide moverse mientras se mantiene. |
| R | Golpe normal. | Ataque frontal corto, repetible con una breve recuperación. |
| Shift | Habilidad especial del personaje. | Requiere estar disponible; muestra enfriamiento en el HUD. |
| Esc | Pausar / reanudar. | Detiene simulación y temporizadores del combate. |
| E | Usar el Visor GUÍA, si se ha descubierto. | Una activación por combate; muestra el próximo patrón del jefe y su zona segura. |

**Nota de diseño:** el juego se plantea como una arena lateral. Las fotos panorámicas sirven para reconstruir cada espacio como fondo 2D; W salta y S cubre al personaje.

El contrato de entrada confirma la habilidad de Shift al soltar la tecla cuando no formó parte de `Shift+Tab`, para conservar la navegación accesible; el tiempo de respuesta se revisará al probar una versión jugable.

### Bucle principal

`Inicio → Selección → Introducción → Combate → Resultado → Siguiente nivel`.

Al iniciar una campaña se elige **un** estudiante. Cada encuentro termina cuando la vida del jefe o del jugador llega a cero. Al vencer, la vida del jugador se rellena para el siguiente nivel. Al perder, se consume **uno de tres intentos de la campaña** y se repite el nivel actual con la vida completa. Tras perder el tercer intento aparece **Game Over**. Al vencer al cuarto jefe aparece la pantalla de victoria. Reiniciar desde Game Over comienza una campaña nueva y permite escoger personaje otra vez.

### Reglas de colisión y daño

- La arena tiene suelo y límites laterales; nadie puede salir de pantalla.
- Cada luchador posee una caja de cuerpo y una caja de ataque. Un golpe sólo daña al adversario si la caja de ataque activa toca su cuerpo y éste no está invulnerable.
- Un mismo golpe aplica daño una sola vez; tras recibirlo hay 0,45 s de invulnerabilidad inicial (**ajustable**).
- Los ataques del jefe tienen aviso visual previo. Las zonas peligrosas nunca se activan sin señal.
- El golpe normal puede cancelarse al recibir daño; la habilidad especial consume su disponibilidad al activarse, aunque falle.

### Sistema de puntuación

| Evento | Puntos propuestos |
|---|---:|
| Golpe normal acertado | +10 |
| Habilidad especial acertada | +25 |
| Jefe derrotado | +500 |
| Bono de vida al ganar | +5 por punto de vida restante |
| Bono de tiempo | +1 por segundo restante del límite de cada nivel |

La puntuación se acumula durante la campaña. Al repetir un nivel tras perder, se descartan los puntos obtenidos en ese intento fallido para evitar acumulación infinita. El récord se guarda localmente en el navegador. La puntuación **no** determina la victoria; vencer a los cuatro jefes sí.

### Balance inicial de jefes

| Nivel | Vida del jefe | Patrón clave | Objetivo de duración | Límite inicial |
|---|---:|---|---|---:|
| 1 | 80 | Ataque frontal lento y pausa clara. | 1–2 min | 150 s |
| 2 | 110 | Balón que rebota y carrera de línea. | 2–3 min | 210 s |
| 3 | 130 | Pulso de luz y barrido de sensores. | 2–4 min | 270 s |
| 4 | 160 | Ecos de patrones; cambio al 50 % de vida. | 3–5 min | 360 s |

Los tiempos, vidas, daño y enfriamientos son parámetros de prueba. Si el tiempo llega a cero, el duelo se pierde y se consume un intento. Los límites deberán ajustarse después de probar el combate con los tres personajes.

El plano funcional de cada arena, la secuencia y los valores iniciales de cada ataque se definen en [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md).

## 6. Pantallas e interfaz

| Pantalla | Elementos necesarios |
|---|---|
| Inicio | Logo Chilos Fighters, botón **Iniciar**, **Cómo jugar**, sonido activado/desactivado. |
| Cómo jugar | Controles, señales de ataque, tres intentos y entrada al Archivo. |
| Archivo / documentación | Cuatro fichas breves del recorrido y una **terminal de mantenimiento** accesibles desde Cómo jugar. Contienen el secreto que permite obtener el Visor GUÍA; son distintos de la terminal de recuperación final. |
| Selección | Tres tarjetas, biografía breve, estadísticas legibles, habilidad y botón **Elegir**. |
| Introducción de nivel | Nombre del lugar, retrato/nombre del jefe y una línea de historia; botón **Continuar**. |
| Combate | Vida del jugador y jefe, intentos restantes, puntuación, nivel, temporizador, indicador de habilidad. |
| Pausa | **Continuar**, **Reiniciar nivel** (consume el intento actual; si era el tercero, Game Over) y **Menú** (abandona la campaña activa tras confirmación). |
| Resultado | Puntuación del nivel, vida restante, pista narrativa y **Siguiente nivel**. |
| Game Over | Mensaje de derrota, puntuación final y **Reiniciar**. |
| Victoria | Resolución del lore, puntuación final, personaje usado y **Jugar de nuevo**. |

**Responsive:** el juego mantiene la proporción de la arena mediante escalado y bandas laterales cuando sea necesario. El HUD se reorganiza en pantallas pequeñas. Como el esquema WASD/R/Shift exige teclado, una versión táctil necesitará botones virtuales equivalentes antes de considerarse jugable en móviles.

**Accesibilidad:** texto de alto contraste, indicador de daño además del color, botón para reducir destellos y animaciones, pausa automática cuando la pestaña pierde visibilidad, menús operables por teclado y foco visible.

### Easter egg de la documentación: Visor GUÍA

**Origen:** petición del creador de esconder una herramienta en la documentación del juego. **Solución propuesta:** una función de diagnóstico antigua de NULL que sigue disponible en el archivo de ayuda. Es opcional y no altera la ruta de cuatro marcas ni permite abrir antes la terminal de recuperación.

1. Desde **Cómo jugar**, el jugador puede abrir **Archivo / documentación** incluso antes de empezar una campaña. Hay una ficha corta por lugar: estacionamiento, cancha, laboratorio y biblioteca. Las fichas evitan revelar el desenlace.
2. Cada ficha contiene una letra marcada como anotación de mantenimiento. Al leerlas en el orden de la ruta, las letras forman **GUÍA**. Una frase discreta del archivo indica que NULL olvidó cómo cumplir su función original; sirve como pista para ordenar las letras.
3. En la misma pantalla hay una pequeña terminal de mantenimiento. Introducir **GUÍA** (aceptar también `GUIA`, sin tilde y sin distinguir mayúsculas) desbloquea el **Visor GUÍA**. Un código incorrecto muestra una respuesta breve y permite volver a intentarlo sin penalización.
4. El desbloqueo muestra qué hace la herramienta y cómo usarla. Durante un combate, **E** o un botón visible en el HUD la activa una vez: anuncia el próximo ataque del jefe y resalta su zona segura antes de que empiece. No causa daño, no consume intentos y no cambia la puntuación.

**Reglas de implementación:** guardar sólo el desbloqueo en `localStorage`; reiniciar la carga disponible al comenzar cada combate, incluso tras repetir un nivel. Mostrar en el HUD si está lista o gastada. Mantener los avisos normales de los jefes para quienes nunca encuentran el secreto. La herramienta debe funcionar con cualquiera de los tres estudiantes y los cuatro jefes. El código y las letras pertenecen a la documentación *dentro del juego*; esta biblia de diseño explica la solución para producción.

**Criterios de aceptación:** las cuatro letras aparecen en sus fichas; `GUÍA` y `GUIA` desbloquean la herramienta; el desbloqueo persiste al recargar; sin desbloqueo, E no produce efecto; con desbloqueo, la ayuda aparece una sola vez por combate y señala el ataque y la zona segura correctos; la campaña se puede completar sin usarla.

Las cuatro fichas, sus folios, los mensajes de la terminal y los casos especiales del Visor están redactados en [EASTER_EGG.md](EASTER_EGG.md). El Visor también prolonga en 0,8 s el aviso del ataque que revela, sin modificar daño ni puntuación.

## 7. Dirección visual y sonora

- **Estilo:** pixel art 2D legible; siluetas distintas y animación clara de preparación, impacto y recuperación.
- **Resolución lógica inicial:** 960 × 540 en proporción 16:9, con escalado sin suavizado para conservar píxeles nítidos.
- **Escenarios:** las referencias del creador ya cubren las cuatro arenas. Nivel 1: adoquines, estacionamiento y fachada. Nivel 2: cancha cercada, canasta, gradas y cielo. Nivel 3: laboratorio con madera, mesones blancos y material didáctico. Nivel 4: biblioteca con mostrador, estantes y techo de madera. Mantener las arenas de juego despejadas aunque las fotos tengan numerosos objetos.
- **Efectos visuales:** destello breve de impacto, partículas limitadas, sacudida suave opcional y aviso de área peligrosa.
- **Sonido:** música propia o con licencia apta para el proyecto, efectos para menú, golpe, habilidad, daño y victoria. El audio se activa después de una interacción del usuario.

### Recursos visuales disponibles y faltantes

| Recurso | Estado |
|---|---|
| Escenarios de niveles 1–4 | **Recibidos** en `img/nivel 1/` a `img/nivel 4/`. |
| Chilo | **Recibido** en `img/jefe 1/`. El nombre «CHILO» se lee en su camisa. |
| Vera y CÁTODO-3 | **Concept art creado** en `img/jefe 2/` y `img/jefe 3/`; faltan sprites de animación. |
| NULL | Hay un icono de «NULL» dentro de varias capturas; falta un sprite de combate original. |
| Alma, Diego y Nadia | Faltan referencias o sprites de los tres protagonistas. |
| Fondos finales | Deben ser pixel art a partir de las fotos y capturas de referencia; faltan los cuatro fondos y se omite la interfaz incrustada del recorrido virtual. |

Para cada imagen se registra origen, función y detalles observados en [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md). Las fotografías y capturas son útiles para dirección de arte; los conceptos de Vera y CÁTODO-3 se generaron especialmente para este proyecto.

El requisito de fondos pixel art, junto con las propuestas de siluetas, pantallas, sonido y señales accesibles, se detalla en [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md).

## 8. Diseño técnico para HTML, CSS y JavaScript

### Arquitectura propuesta

El [contrato de arquitectura de la fase 1.6](FASE_1_6_ARQUITECTURA.md) especializa el mapa orientativo siguiente: `levels.js` contiene datos de arenas y patrones; `campaign.js` será dueño de la progresión, los intentos y los puntos. También separa planificador de ataques, física, render y almacenamiento para conservar una fuente de verdad por regla.

```text
index.html                 menús, canvas, HUD y cuadros de diálogo
styles.css                 diseño, responsive y efectos de interfaz
src/main.js                arranque y máquina de estados
src/input.js               WASD, R, Shift, Esc y controles táctiles futuros
src/game-loop.js           requestAnimationFrame y delta de tiempo
src/fighter.js             movimiento, salud, ataques y estados
src/enemies.js             patrones de los cuatro jefes
src/collision.js           cajas de cuerpo/ataque y límites de arena
src/levels.js              datos de escenario y peligro; progresión en src/campaign.js
src/campaign.js            nivel, marcas, intentos, puntuación y resultado de campaña
src/ui.js                  menús, HUD y transiciones
src/audio.js               música y efectos tras interacción
src/archive.js             fichas de ayuda, terminal y desbloqueo del Visor GUÍA
assets/                    imágenes, sprites y audio con licencia anotada
```

Se recomienda comenzar con **Canvas 2D y JavaScript moderno sin librerías**: el alcance es una arena por nivel y cuatro combates. Phaser puede evaluarse si la implementación de animaciones, cámaras o colisiones crece; cualquier dependencia debe declararse con versión y motivo antes de incorporarla.

### Estados del juego

`MENU`, `HOW_TO_PLAY`, `ARCHIVE`, `SELECT`, `STORY`, `FIGHT`, `PAUSE`, `LEVEL_CLEAR`, `GAME_OVER`, `VICTORY`.

El bucle de `FIGHT` lee entradas, actualiza personaje y jefe según `deltaTime`, resuelve colisiones, aplica daño y dibuja. En otros estados se detiene la simulación. `visibilitychange` pausa automáticamente. Los datos configurables de personajes y niveles se separan de la lógica para facilitar cambios al recibir imágenes y nombres finales.

### Persistencia

`localStorage` guarda récord de puntuación de una campaña terminada, preferencias de audio/accesibilidad y el desbloqueo del Visor GUÍA. La primera versión no guarda la campaña activa ni el último nivel al recargar. **Nueva partida** y abandonar desde Pausa descartan la campaña actual, pero conservan el récord previo y el secreto descubierto. La carga lista/usada del Visor nunca se guarda.

### Criterios de aceptación de la primera versión jugable

- Inicio, selección de tres estudiantes y cuatro duelos completos.
- Controles WASD, R y Shift con respuesta estable; Esc pausa.
- Cada jefe tiene al menos dos ataques distinguibles y una señal previa.
- Vida, tres intentos, puntuación, colisiones y resultados funcionan sin duplicar daño.
- Game Over, reinicio y victoria se alcanzan por reglas explícitas.
- El archivo de ayuda permite descubrir el Visor GUÍA y su activación en combate cumple las reglas del easter egg; ignorarlo no impide ganar.
- En el hito jugable de la fase 2 se admiten marcadores provisionales etiquetados. Para cerrar la primera versión de la fase 3, los cuatro fondos finales son pixel art y los siete personajes tienen recursos definitivos.
- La interfaz no se corta en escritorio ni en una pantalla estrecha; si no hay controles táctiles, se informa que jugar requiere teclado.
- Sin errores de consola durante una campaña completa.

## 9. Decisiones abiertas

| Decisión | Estado actual |
|---|---|
| Nombres y aspecto final de los tres estudiantes | Alma, Diego y Nadia conservan sus nombres propuestos; su dirección visual inicial está en `PANTALLAS_Y_RECURSOS.md`. Faltan imágenes finales. |
| Identidad de Chilo | Nombre visible en la camisa y silueta disponible; si existe guía oficial de personaje, conviene usarla para el sprite. |
| Jefes 2 y 3 | Vera y CÁTODO-3 tienen concepto visual y patrones definidos; sus valores siguen sujetos a pruebas. |
| Nombre y forma final de la IA | Se mantiene «NULL» y se propone un núcleo geométrico violeta/cian; falta el sprite original de combate. |
| Uso de fotografías/capturas en el juego | Decisión confirmada: sirven como referencia para fondos pixel art. Faltan los fondos finales. |
| Plataforma móvil jugable | Primera versión para teclado de escritorio; una versión táctil futura requerirá controles equivalentes. |
| Temporizador y bono de tiempo | Propuestos; calibrar tras pruebas de combate. |

## 10. Orden de producción sugerido

El desarrollo se organiza en **tres fases con un número de subfases ajustado al trabajo**: siete de diseño, ocho de construcción y nueve de cierre en el plan actual. En cada subfase se releen `FLUJO_OPERATIVO.md` y los perfiles asignados, se convoca a cada agente para un encargo acotado, se registra su entregable y se cumple la puerta de salida antes de avanzar. El plan define normas de código limpio: una responsabilidad y una fuente de verdad por regla, contratos claros entre módulos, estados explícitos y revisión de dependencias y errores. El detalle está en [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md).

1. **Fase 1:** cerrar requisitos, combate, cuatro arenas, pantallas, easter egg, arquitectura y contratos de módulos, e inventario de recursos.
2. **Fase 2:** construir el núcleo y combate compartido; entregar flujo de campaña y un nivel por jefe con recursos provisionales.
3. **Fase 3:** integrar Archivo y Visor; producir fondos pixel art y sprites; cerrar audio, accesibilidad, revisión, rendimiento y paquete local.

## 11. Detalles definidos y ajustes pendientes

Los documentos base de **Chilos Fighters** se complementan con contratos por subfase. Las guías de `agentes_juegos_html_css_js/` describen oficios y ejemplos técnicos; las decisiones particulares del juego se mantienen en `documentacion/`.

| Documento | Detalles definidos como propuesta |
|---|---|
| [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md) | Plano funcional de cada arena, valores de las habilidades, ataques de los cuatro jefes y respuestas esperadas. |
| [EASTER_EGG.md](EASTER_EGG.md) | Cuatro fichas, folios, solución, mensajes de terminal, efecto exacto del Visor y casos de uso. |
| [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md) | Flujo y texto de pantallas, dirección visual, necesidades de sprites y fondos, sonido, accesibilidad y revisión futura. |
| [FASE_1_1_REQUISITOS_Y_CANON.md](FASE_1_1_REQUISITOS_Y_CANON.md) | Requisitos confirmados y decisiones de diseño trazables al canon. |
| [FASE_1_2_COMBATE_Y_DATOS.md](FASE_1_2_COMBATE_Y_DATOS.md) | Propiedad de reglas, datos, entradas, daño, intentos y puntuación. |
| [FASE_1_3_FICHAS_ARENAS.md](FASE_1_3_FICHAS_ARENAS.md) | Geometría, patrones, tiempos de aviso, evasión y capas de cuatro arenas. |
| [FASE_1_4_PANTALLAS_Y_ESCENAS.md](FASE_1_4_PANTALLAS_Y_ESCENAS.md) | Diez pantallas, escenas, foco, accesibilidad y escalado. |
| [FASE_1_5_ARCHIVO_Y_VISOR.md](FASE_1_5_ARCHIVO_Y_VISOR.md) | Pistas, terminal, estados del Visor, cola real y efecto temporal. |
| [FASE_1_6_ARQUITECTURA.md](FASE_1_6_ARQUITECTURA.md) | Glosario, dependencias, contratos y errores entre módulos. |
| [FASE_1_7_INVENTARIO_Y_CRITERIOS.md](FASE_1_7_INVENTARIO_Y_CRITERIOS.md) | Recursos actuales/faltantes, permisos, audio, matriz y objetivos de rendimiento. |
| [FASE_1_REGISTRO.md](FASE_1_REGISTRO.md) | Lecturas, invocaciones de agentes, integraciones y estado documental de las siete subfases. |
| [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md) | Tres fases, 24 subfases actuales, agentes, código limpio, entregables y puertas. |

**Pendiente de producción:** crear los recursos visuales y sonoros finales, registrar sus permisos de uso y ajustar números de daño, tiempos y dificultad cuando exista una versión jugable. Los valores de estas especificaciones son puntos de partida, no resultados de pruebas.

