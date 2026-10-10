# Fase 2 — registro de construcción

Este registro conserva los entregables funcionales de la fase 2 por subfase. Una subfase no se considera cerrada hasta que la evidencia requerida esté documentada según [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md). La implementación y las verificaciones de 2.1 no cierran ni adelantan otras subfases.

## 2.1 — Núcleo Canvas, estados y reloj

**Estado:** implementación inicial; verificación manual parcial en Codex In-app Browser el 6 de octubre de 2026. El contador y las transiciones son demostradores del núcleo, no mecánicas de campaña.

**Entregable:** `juego/index.html`, `juego/styles.css` y los módulos de `juego/src/` componen un Canvas lógico de 960 × 540, un bucle `requestAnimationFrame` de paso fijo 1/60 s, hasta cinco pasos por fotograma, máquina de estados y reloj de juego. El ajuste de viewport conserva la proporción, centra el lienzo, limita DPR efectivo a 2 y desactiva suavizado. La pausa por Escape, pérdida de foco o pestaña oculta congela el reloj y reinicia la referencia temporal para reanudar sin salto. Las pantallas simples muestran tiempo y FPS.

**Transiciones y controles temporales:** MENÚ → JUGANDO (Enter), JUGANDO → PAUSA (P/Escape), PAUSA → JUGANDO (P/Escape), JUGANDO → GAME OVER (G), GAME OVER → MENÚ (Enter), PAUSA → MENÚ (M). G en un estado que no sea JUGANDO intenta GAME OVER y se rechaza con `console.warn`, sin cambiar el estado.

**Verificación manual observada:**

- La pantalla inicial dibujó MENÚ y un contador de 60 FPS; la ventana observada fue 614 × 400 y el lienzo conservó proporción 16:9, centrado y sin scroll visible en ese tamaño.
- Se recorrieron MENÚ → JUGANDO → PAUSA → JUGANDO → GAME OVER → MENÚ, y MENÚ → JUGANDO → PAUSA → MENÚ. P, Escape, M y Enter mostraron la pantalla esperada.
- En PAUSA, el reloj mostró `00:04.14` antes y después de esperar 1,3 s; quedó detenido. Al iniciar y pausar antes del primer paso fijo también permaneció en cero.
- Se pulsó G desde MENÚ para provocar una transición no permitida: el estado visible permaneció en MENÚ. El código emite el aviso mediante `console.warn`; la consola del navegador no está expuesta en el navegador de prueba para comprobar el registro directamente.
- Node `--check` pasó para los ocho módulos. El servidor local entregó `index.html` y todos los módulos con HTTP 200/304. Se añadió un icono de datos vacío para evitar una solicitud fallida de favicon; una recarga posterior no solicitó recursos inexistentes.
- No se provocó de forma controlada un fotograma con más de cinco pasos; el aviso de tiempo descartado queda pendiente de evidencia reproducible.
- La API integrada no permitió confirmar de forma fiable `visibilitychange` al cambiar a otra pestaña, ni redimensionar la ventana, ni inspeccionar la consola. Sólo se observó un tamaño y no quedó expuesta la versión exacta del navegador ni el DPR.

**Pendiente:** inspeccionar la consola para confirmar que el uso normal no emite errores/advertencias y que G inválido emite exactamente el aviso esperado; comprobar pausa al perder el foco/cambiar de pestaña y redimensionado con más de un viewport; registrar navegador, DPR y carga inicial para la línea base parcial PF-01/PF-03; provocar y registrar el diagnóstico de descarte de tiempo; revisar el resto de la matriz de navegadores. PF-02 es sólo una línea base de cascarón y PF-04…PF-07 requieren un duelo real desde 2.4. 2.2 (entrada/física), combate y campaña permanecen fuera del alcance de esta entrega.

## 2.2 — Entrada y física base

**Estado:** implementación inicial; verificación manual parcial en Codex In-app Browser el 6 de octubre de 2026. Entrega limitada a entrada y movimiento del personaje en una sala temporal; no implementa combate ni 2.3.

**Entregable:** `src/action-map.js` define acciones abstractas y controles canónicos A/D, W, S, R, Shift, E y Escape, manteniendo P/Enter/G/M de las pruebas 2.1. Flechas y Espacio son alias; F2 alterna cajas y velocidad de depuración. `src/input-controller.js` conserva pulsado/mantenido/liberado, buffer máximo de 100 ms para salto/ataque/especial, neutraliza A+D, omite atajos del navegador y limpia las teclas al pausar o perder foco. R, Shift y E se capturan para el sistema posterior, sin ejecutar combate.

`src/physics-config.js` centraliza los datos del cuerpo, velocidades y movimiento; `src/fighter-entity.js` representa al estudiante por ancla de pies; `src/physics.js` actualiza velocidades y resuelve colisiones AABB por ejes, con límite de caída y corte de salto al soltar; `src/test-room.js` aporta suelo, paredes, techo y plataformas temporales. El estado JUGANDO ejecuta la física en el paso fijo ya existente; pausa y reloj se siguen rigiendo por el núcleo 2.1.

**Valores:** inventario consolidado al final de este registro.

**Verificación observada:** `node --check` pasó en los módulos ES de `src/`. La página local arrancó y recorrió MENÚ → JUGANDO → PAUSA → JUGANDO → GAME OVER → MENÚ → JUGANDO → PAUSA → MENÚ mediante Enter/P/Escape/G/M, sin errores de consola. Se vio la sala con suelo/plataformas/personaje y se pulsaron movimiento/salto y F2. Se provocó G desde MENÚ y la consola mostró el rechazo esperado `MENÚ → GAME OVER`. Durante una suspensión prolongada del navegador de prueba (aprox. 1437 s) apareció el aviso esperado de descarte al superar cinco pasos; no fue una simulación de tiempo realista. No hubo errores registrados. La API de captura visual no permite medir con precisión desplazamiento, altura máxima o aterrizajes.

**Pendiente para cerrar:** demostrar y registrar cada estado/tecla canónica y alias; medir salto cercano a 150 px y aterrizaje sobre cada plataforma, colisión con ambos lados/techo y juntas; verificar A+D, cubrir mientras se mueve, buffer/corte de salto, Shift+Tab y repetición de teclas de estado; comprobar pausa/reanudación y pérdida de foco con movimiento retenido; revisar el comportamiento en más de una tasa de refresco y viewport. No se inspeccionó consola con DevTools visible ni se midieron píxeles/velocidades en pantalla. No se cambió `game-loop.js`, `state-machine.js` ni `game-clock.js`; `main.js`, `states.js` e `input-controller.js` se tocaron únicamente para conexión con 2.1 y controles requeridos.

## 2.3 — Sistema de combate compartido

**Estado:** cierre técnico con 9/9 pruebas automáticas PASA en navegador local el 6 de octubre de 2026. Pendiente la checklist de interacción física indicada abajo. Sigue siendo una sala de prueba, no una campaña ni un nivel de la subfase 2.4.

**Entregable:** `combat-config.js` centraliza reglas y expone `COMBAT_OUTCOME` (en curso, jugador vencedor, jugador derrotado). `combat-system.js` resuelve el resultado al final del paso fijo después de todos los contactos; si ambos llegan a 0 HP prevalece jugador vencedor. El resultado queda disponible sin crear VICTORIA; únicamente jugador derrotado activa la transición existente a GAME OVER. `states.js` solo consulta ese resultado. `enemy-combatant.js` ahora cambia genéricamente de fase por umbral de HP y difiere el cambio si hay ataque en curso; `peekNextAttack()` consulta la secuencia de la fase vigente. Se corrigió la condición inalcanzable que impedía activar ese cambio.

Vida, hitboxes/hurtboxes, ataques, invulnerabilidad, defensa, eventos, proyectiles, barras y depuración conservan los datos de 2.3 ya descritos arriba. Los ataques del jugador y del dummy siguen siendo datos separados de la lógica. Para verificar fases se añadió un fixture genérico de dos fases; no carga ni define patrones de NULL. El muñeco de prueba conserva el orbe y el aletazo. No se añadieron curación, knockback ni hitstop.

**Verificado automáticamente:** abrir `juego/tests/tests.html` en el servidor local mostró 9/9 PASA. La página usa los módulos reales y sin librerías externas. Cubre daño único con ataque retenido, golpe y proyectil simultáneos durante invulnerabilidad, movimiento/contacto con pared y hurtbox/límite/limpieza de proyectiles, congelación y reanudación de startup/activa/recuperación/proyectil, los tres resultados KO y la transición de derrota a GAME OVER, cambio genérico de fase por umbral, simulación fija comparable a 60/144 Hz de reloj de pared, limpieza de entrada al perder foco y física 2.2 (salto medido en el rango 140–160 px y colisiones con suelo, pared, plataforma y dummy). Node `--check` pasó para los módulos modificados. La suite se volvió a ejecutar tras los ajustes y terminó en 9/9.

**Checklist manual pendiente (solo teclado/observación humana):**

1. Comprobar la sensación y cadencia de los golpes con R, incluyendo ataques repetidos después de soltar la tecla.
2. Observar el parpadeo del jugador durante la invulnerabilidad y su cese al terminar.
3. Activar F2 y confirmar visualmente que hitboxes, hurtboxes y proyectiles coinciden con los contactos del juego.
4. Pausar con P/Escape a mitad de startup, ventana activa, recuperación y vuelo de proyectil; reanudar y confirmar que no aparece un impacto fantasma.
5. Probar varias teclas a la vez (dirección + salto, cubrir + movimiento, ataque + dirección) y verificar la respuesta esperada.
6. Revisar DevTools durante uso normal y confirmar consola limpia; los avisos deliberados de transición inválida/descarte de tiempo pertenecen a 2.1 y se provocan aparte.

**No verificado manualmente:** no se midieron sensación subjetiva, parpadeo ni coincidencia visual de F2 con interacción humana; tampoco se recorrió con teclado físico la pausa durante cada fase, teclas simultáneas o consola DevTools. La prueba de 60/144 Hz es una simulación automática del acumulador de paso fijo, no una medición de pantallas físicas. La clase base admite fases por datos y se probó con fixture, pero no se integraron ni verificaron umbrales/patrones reales de NULL. No se tocó bucle, reloj ni máquina de estados; `states.js` tuvo solo la consulta necesaria al resultado explícito. No se modificó la física ni otros archivos de 2.2.

**Diferencias y alcance documental:** el plan da prioridad al jugador en KO simultáneo; implementado como resultado “jugador vencedor” y no como estado/pantalla VICTORIA, que queda para 2.5. La transición de fase genérica se probó con datos de fixture, sin patrones reales de NULL. No se avanzó a 2.4.

**Valores:** inventario consolidado al final de este registro.

## 2.4 — Nivel 1: Chilo y tutorial

**Estado:** implementación integrada; **17/17 pruebas automáticas PASA** en el navegador local. La validación con teclado humano, sensibilidad de dificultad y revisión de consola DevTools siguen pendientes; no se declaran verificadas.

**Registro de protocolo de lectura e invocación:** releídos `FLUJO_OPERATIVO.md`, plan 2.4, ARENAS_Y_COMBATE, LORE y ficha 1.3 de Chilo. Revisados e invocados con encargos acotados: Level Designer Web (layout), Game Designer Web (ritmo/patrones), Narrative Designer Web (líneas documentadas/tutorial), Game UI Developer (aviso) y Game Tester Web (matriz). Los perfiles leídos no indican número de versión. Sus respuestas de análisis fueron integradas en esta entrada; no editaron el repositorio.

**Entrega:** `level-1-data.js` describe los límites y suelo del estacionamiento, spawns, rectángulos de fondo y límite de 150 s; `level-loader.js` construye jugador, física, enemigo y combate a partir de datos y usa `EnemyCombatant` como base genérica cuando no hay comportamiento especializado. `test-room.js` se conserva para depuración y ya no es la arena jugable inicial. `boss-data.js` define los 80 HP de Chilo y sus dos patrones; `chilo.js` extiende la base, activa el primer aviso solo cuando la distancia entre frentes es ≤250 px, fija el destino/sombra del salto y alterna Aletazo → Salto con pausa de 2,4 s. El aletazo mantiene 1,15/0,18/0,65 s y 12 de daño (S lo reduce a 4); el salto mantiene 1,00/0,25/0,85 s, círculo de 100 px, daño 16 y no se mitiga con S. Los tres perfiles de luchador se crean por parámetro del cargador.

`tutorial-controller.js` y `tutorial-data.js` implementan un paso por acción: mover, saltar, atacar, guardia, especial y acercarse hasta activar el duelo. El índice cambia solo dentro de la actualización fija de JUGANDO; PAUSA no actualiza ni combate ni tutorial. Al morir Chilo, el nivel conserva el estado `completado` dentro de JUGANDO y muestra un mensaje; la derrota del estudiante continúa por GAME OVER; el KO simultáneo conserva la prioridad de victoria de 2.3. T reinicia el arnés desde JUGANDO, PAUSA o GAME OVER, usando transiciones existentes. No se añadió estado VICTORIA ni progresión de campaña.

**Verificación automática:** `tests.html` muestra 17/17 PASA; se cubren construcción limpia, pasos sin salto/avance indebido, reinicio de tutorial, ambos patrones y sus tiempos/daños, defensa frontal y daño de aterrizaje, tres luchadores, fin por victoria/derrota/KO simultáneo/tiempo, carga limpia, pausa en tutorial/aviso y las suites de 2.1–2.3. Se ejecutó Node `--check` sobre los módulos ES de `src/` y `tests/`. La prueba confirmó que Alma, Diego y Nadia pueden usar R contra Chilo y recorrer ambos patrones desde el cargador. La respuesta de Chilo a los ataques y el tutorial se prueban con pasos fijos; esto no sustituye la comprobación de dificultad/sensación en teclado.

**Checklist manual pendiente (solo teclado y juicio humano):**

1. Empezar desde el menú y comprobar si se entiende el objetivo y cada paso provisional del tutorial; verificar que mover, saltar, atacar, cubrirse y especial avancen en orden.
2. Probar la dificultad de Chilo: distinguir Aletazo y Salto, poder salir de la zona anunciada y comprobar que S reduce el aletazo pero no el aterrizaje.
3. Juzgar si el aviso, la sombra circular y el tiempo de reacción se leen con claridad sin depender del sonido.
4. Pausar con P/Escape a mitad de un paso tutorial y a mitad de WARNING, ACTIVE y RECOVERY de ambos patrones; reanudar y confirmar continuidad sin daño fantasma.
5. Usar T desde juego, pausa, resultado completado y GAME OVER; confirmar spawns, vida, proyectiles y tutorial limpios. Enter desde GAME OVER también conserva el retorno al menú existente.
6. Revisar la consola DevTools en uso normal y confirmar que no hay errores ni avisos inesperados.

**No verificado manualmente:** no se hizo recorrido con teclado físico ni se midió la dificultad subjetiva, claridad/tamaño de avisos, lectura de sombra, respuesta a teclas simultáneas o sensación de reinicio; la consola DevTools no se inspeccionó. La página del juego usa Alma en el arnés visible; Diego y Nadia se verificaron automáticamente al construir y simular el nivel desde el cargador, no mediante selección en pantalla. Chilo se representa con el marcador rectangular disponible; el sprite y el fondo pixel art finales corresponden a la fase 3.

**Diferencias respecto al diseño:** las fuentes solo fijan de forma explícita que el nivel enseña distancia y salto y que el primer aletazo sirve de tutorial; no definen el guion paso a paso. Se implementó el orden adicional mover → saltar → atacar → guardia → especial solicitado en este encargo y el paso de aproximación para el umbral de 250 px. Sus avisos se consideran provisionales. La defensa S se restringió a ataques de categoría frontal: la prueba detectó que el sistema compartido también mitigaba por error el aterrizaje de Chilo; se corrigió en `combat-system.js` y se repitió la suite. La entrada `KeyT` y el camino de reinicio son controles de arnés, no flujo de campaña de 2.5. No se avanzó a 2.5.

**Valores/textos:** inventario consolidado al final de este registro.

## 2.5 — Reglas y flujo de campaña

**Estado:** flujo de campaña conectado al único nivel disponible; 26/26 pruebas automáticas PASA en navegador local. Requiere validación manual de teclado, experiencia de UI y recorridos completos; no se declara campaña completa porque los niveles 2–4 todavía no tienen datos ejecutables.

**Registro de protocolo:** releídos `FLUJO_OPERATIVO.md`, sección 2.5 del plan, `DOCUMENTACION.md`, `PANTALLAS_Y_RECURSOS.md` y contrato 1.4; leídos Game Designer Web, Game UI Developer, Narrative Designer Web y Game Tester Web. Los perfiles no indican versión. No se delegó ni invocó un agente externo en esta entrega; las pruebas y decisiones están implementadas/revisadas en este mismo entorno. La inspección automatizada no equivale a la validación humana de los perfiles.

**Entrega:** `campaign-data.js` lista en orden el Nivel 1 real; los siguientes capítulos se agregarán cuando tengan datos, sin entradas que parezcan jugables. `campaign-controller.js` posee selección, nivel, cuatro marcas, tres intentos globales, puntos de intento/consolidados y cierre idempotente. `campaign-transitions.js` aporta el grafo explícito de MENÚ, SELECCIÓN, INTRO NIVEL, JUGANDO, PAUSA, GAME OVER y VICTORIA. La selección muestra tres tarjetas con rol, vida, velocidad y habilidad; A/D o flechas recorren las opciones, Enter confirma. Una introducción enseña el objetivo documentado antes del duelo. Al ganar se registra una marca y se consolida una sola vez `attemptScore + 500 + 5 × vida restante + floor(segundos restantes)`; los golpes R dan +10 y un especial con impacto +25 por activación. La campaña no consume intento por entrar ni por ganar. Derrota por vida/tiempo consume uno y descarta los puntos del intento; T permite reintentar desde la pantalla de intento terminado cuando quedan intentos. En PAUSA, T abre confirmación de reinicio; confirmar consume un intento, cancelar no muta campaña. M desde PAUSA abre confirmación de abandono; se descartan los puntos no consolidados y no se actualiza récord. El tercer intento agotado muestra GAME OVER.

El resultado de combate vencedor (incluido KO simultáneo) abre VICTORIA. Si existe otro dato de nivel, Enter lo carga con vida restaurada; si la lista se agota, se muestra cierre provisional de campaña. Enter desde ese cierre inicia una campaña nueva en selección; M vuelve al menú. El récord se guarda en `localStorage` sólo al terminar la campaña por victoria o al agotar intentos; el estado activo no se persiste. La interfaz informa si el almacenamiento del récord no está disponible. No se añadió estado de transición extra ni se tocó el bucle o el reloj.

**Verificación automática y observada:** `tests.html` muestra 26/26 PASA; se conserva la regresión 2.1–2.4. La suite cubre grafo y rechazo de transición inválida, selección real por teclado sintético para cada luchador, entrega al cargador, puntuación y marca una sola vez, pérdida/reintento/abandono/reinicio, confirmación/cancelación desde PAUSA, flujo de victoria/derrota/KO simultáneo y cierre tras agotar lista, récord en almacenamiento aislado, junto con las pruebas previas. Node `--check` se ejecutó en módulos ES. En el navegador local se vio MENÚ → SELECCIÓN → INTRO NIVEL → Nivel 1; T desde PAUSA mostró la confirmación de reinicio y M la confirmación de abandono. `tab.dev.logs` no registró errores ni advertencias durante ese recorrido normal.

**Checklist manual pendiente (solo teclado/juicio humano):**

1. Iniciar desde MENÚ, recorrer las tres tarjetas con A/D y flechas, comprobar que rol, vida, velocidad y habilidad se entienden y que cada selección carga el personaje correcto.
2. Jugar Nivel 1 hasta victoria; verificar que aparece VICTORIA, la marca y puntuación, que Enter inicia una campaña nueva mientras solo haya un nivel, y que M vuelve al MENÚ.
3. Provocar derrotas por daño y por tiempo; comprobar que cada una consume exactamente un intento, que T reintenta con estudiante/nivel/vidas limpios y que los puntos del intento perdido no se acumulan.
4. Desde PAUSA, abrir y cancelar «Reiniciar nivel»; luego confirmar y verificar consumo único. Repetir para abandono por M, confirmando pérdida de puntos del intento y regreso a MENÚ.
5. Agotar los tres intentos y comprobar GAME OVER; Enter inicia campaña nueva desde selección y M retorna al MENÚ.
6. Completar campaña y agotar intentos en el navegador; revisar que el récord mayor se conserva al iniciar otra campaña y que abandonar no lo altera.
7. Revisar consola DevTools en los recorridos, probar pérdida de foco/reanudación y evaluar legibilidad, foco visual y tarjetas a más de un tamaño de ventana.

**No verificado manualmente:** no se recorrió físicamente una campaña hasta derrota por daño/tiempo o victoria; no se midió sensación de los intentos ni se confirmó el récord en almacenamiento persistente del perfil normal. Se usaron eventos de teclado sintéticos para el smoke test, no teclado físico. No se probó lector de pantalla ni la matriz Chrome/Edge/Firefox/tamaños; las tarjetas son dibujos Canvas con borde de selección, no controles HTML semánticos. La consola se consultó en el smoke test normal y quedó sin errores/advertencias, pero falta revisión humana durante el recorrido completo.

**Diferencias y límites respecto a las fuentes:** `DOCUMENTACION.md` y el contrato 1.2 piden guardar localmente récords de campañas terminadas; por eso se guarda sólo el récord y no el estado de campaña, conforme al alcance del prompt. Sólo está configurado el Nivel 1; el texto de cierre y reinicio desde esa pantalla son provisionales hasta integrar los niveles 2–4, sin saltos de capítulo. El contrato 1.4 pide confirmación antes de reiniciar o abandonar desde PAUSA; ambas confirmaciones se implementaron con teclado. El selector usa tarjetas Canvas en lugar de controles DOM con foco semántico, límite que queda pendiente de la revisión de accesibilidad/pantallas. El plan describe invocar perfiles; se leyeron pero no se delegó su ejecución en esta corrida, así que el protocolo de agentes queda pendiente de esa validación.

**Valores/textos:** inventario consolidado al final de este registro. El cierre de campaña ya se completó en 2.8; la nota histórica de esta entrada describe el estado al terminar 2.5.

## 2.6 — Nivel 2: Vera y la cancha

**Estado:** Nivel 2 integrado a la campaña; **36/36 pruebas automáticas PASA** en `juego/tests/tests.html`. El atajo de arnés abre el Nivel 2 directamente y se observó la pantalla de introducción y la cancha en ejecución en el navegador local. La validación de dificultad y lectura con teclado físico queda pendiente.

**Fuentes y protocolo:** releídos Plan 2.6, contratos de combate y pantallas, `FASE_1_3_FICHAS_ARENAS.md`, `FASE_1_4_PANTALLAS_Y_ESCENAS.md`, `ARENAS_Y_COMBATE.md`, `PANTALLAS_Y_RECURSOS.md`, `LORE.md`, Level Designer Web, Physics Engine Developer, Narrative Designer Web y Game Tester Web. Se aplicaron como referencia de diseño y pruebas; no se cambió el bucle, reloj, física de jugador ni grafo de estados. No se reescribió `campaign-controller.js`.

**Entrega:** `level-2-data.js` describe la cancha 960×540, suelo y límites compartidos, spawns, decorado rectangular, objetivo, introducción y textos de victoria/variantes por estudiante. No agrega plataformas ni colisiones ambientales: cerca, canasta, gradas y líneas pintadas son decorativas según ficha. `vera-data.js` define 110 HP y los dos patrones sin fases: `VERA_BALL` (aviso 0,80 s, 15 de daño, radio 12 px, 260 px/s, recuperación 0,65 s) y `VERA_RUN` (aviso 0,95 s, activo 0,40 s, recuperación 0,75 s y 20 de daño); ambos alternan con 2,1 s entre ataques. `vera.js` extiende `EnemyCombatant`. El balón rebota una vez en el borde opuesto y sale por el lado de origen, conserva el `attackInstanceId` durante el regreso, puede golpear sólo una vez y acepta guardia S (15→5). La carrera deja una franja fija `y=400…430`; su hitbox usa el mismo rectángulo que el aviso, no se mitiga con S y se evita al elevar los pies al menos 30 px.

`level-loader.js` registra la fábrica de Vera y `campaign-data.js` la añade como segundo nivel; el controlador existente mantiene estudiante e intentos y cierra la campaña al terminar el Nivel 2. `campaign-controller.js` sólo recibe un método de arnés `startAtLevelForHarness()` para seleccionar un nivel directamente; no se reimplementó ni se cambió el flujo normal. En selección, `2` abre la introducción del Nivel 2 con el estudiante resaltado. `input-controller.js` y `action-map.js` conectan esa tecla de prueba. `states.js` muestra las líneas de introducción y victoria que correspondan al estudiante; no se añadió estado ni transición. El tutorial de Chilo no se carga en Nivel 2. El combate/escenario y proyectiles siguen actualizándose mediante el paso fijo existente de JUGANDO, así que PAUSA los congela.

**Verificación automática:** 36/36 PASA, incluidas las 26 pruebas anteriores de 2.1–2.5. Las nuevas cubren carga inicial y reinicio limpio del Nivel 2, fábrica y datos de Vera, patrón/tiempos/daños, bote con rebote y contacto único por instancia, reducción de S a 5, carrera evitable en salto y no reducible con guardia, congelación de ataque/proyectil en pausa, tres estudiantes, progresión Nivel 1 → Nivel 2 → cierre, retención de selección, derrota/intentos y el atajo Digit2. Se ejecutó `node --check` para los módulos ES de `src/` y `tests/`. Se abrió el juego en el navegador local, se entró con el atajo y se observó la cancha en combate; la consola no mostró errores ni advertencias en ese recorrido normal. Esto no equivale a una campaña completa jugada a mano.

**Checklist manual pendiente (solo teclado físico y juicio humano):**

1. Jugar con Alma, Diego y Nadia; valorar la dificultad de Vera y que las respuestas de salto/cobertura se entiendan para ambos patrones.
2. Leer los avisos de `VERA_BALL`: distinguir dirección de ida, punto de rebote y regreso; confirmar que su visual predice la trayectoria y que F2 coincide con el contacto.
3. Leer el aviso de `VERA_RUN`, saltar con los pies fuera de `y=400…430` y comprobar que S no reduce este daño.
4. Completar Nivel 1 y verificar la entrada a la cancha con el mismo estudiante, el texto y la victoria/cierre después de Vera.
5. Pausar a mitad del aviso, activo y recuperación de Vera, y durante el viaje del balón; reanudar y comprobar que no hay avance ni daño fantasma.
6. Reiniciar Nivel 2 con T y tras derrota; verificar vida, posición, balón y ataque inicial limpios, conservando estudiante e intentos según reglas.
7. Revisar consola DevTools y legibilidad de avisos/HUD a un tamaño de ventana cómodo.

**No verificado manualmente:** no se midió la dificultad subjetiva, sensación de movimiento/golpes, legibilidad sostenida de señales, resultado de una campaña completa con teclado físico ni uso simultáneo de varias teclas. La consola se revisó durante entrada directa y combate breve, no toda la campaña. No se probó la matriz de navegadores/tamaños, y el rectángulo genérico de Vera no sustituye su sprite/animación final.

**Diferencias y límites respecto a las fuentes:** no se encontró discrepancia en vida, límite de tiempo, spawns, geometría del cuerpo, secuencia, categorías, avisos, activos, recuperaciones o daño; no se agregaron plataformas ni peligros ambientales porque la ficha los define como decorado. El intervalo de 2,1 s empieza luego de recuperación, conforme al contrato. El controlador de campaña no se reescribió: sólo se añadió su método explícito de arnés.

**Valores:** inventario consolidado al final de este registro.

## 2.7 — Nivel 3: CÁTODO-3 y el laboratorio

**Estado:** Nivel 3 añadido como tercera entrada de campaña. La suite de navegador incluye regresiones 2.1–2.6 y casos del laboratorio; la comprobación manual con teclado queda pendiente.

**Fuentes y protocolo:** aplicadas sección 2.7 del plan, contratos de combate/arenas/pantallas y los textos de laboratorio y CÁTODO-3 en los documentos de fase 1. Revisados `FLUJO_OPERATIVO.md` y los perfiles Level Designer Web, Physics Engine Developer, Narrative Designer Web y Game Tester Web. No se delegó ejecución externa de los perfiles en este turno. No se avanzó a 2.8.

**Entrega:** `level-3-data.js` contiene la arena 960×540, límites, suelo, spawns, tiempo, decorado y líneas de introducción/victoria por estudiante. `laboratory-mechanics.js` describe las franjas de sensores, corredor seguro y regla de despeje; los muebles y modelos siguen siendo decorado, y no se añadieron plataformas ni colisiones de escenario no especificadas. `catodo3-data.js` define 130 HP y la secuencia pulso → sensor izquierdo → pulso → sensor derecho; no hay fases de jefe en el contrato. `catodo3.js` reutiliza `EnemyCombatant`, emite la trayectoria del pulso y las cajas de sensor. La regla genérica de proyectiles permite que este pulso cruce las paredes del escenario y se limpie al salir de pantalla; los demás proyectiles siguen chocando con paredes. La evasión de los ataques bajos aprovecha la regla de salto ya usada por la cancha. `campaign-data.js` registra Nivel 3. No se modificó `campaign-controller.js`; tampoco se tocaron máquina de estados, bucle, reloj ni física. El arnés de selección conserva el acceso Digit3 ya existente.

**Verificación automática:** `tests.html` amplía la regresión con carga/reinicio limpios, HP y fases de sensor, orden de patrones, safe corridor, salto/guardia contra sensor y pulso, paso del pulso por el muro y limpieza fuera de pantalla, soporte de Alma/Diego/Nadia, victoria Nivel 2 → Nivel 3 → cierre, KO simultáneo, derrota y pausa del arnés. Al cerrar esta entrada, la página local muestra **44/44 PASA**, incluidas pruebas 2.1–2.6. También se ejecutó `node --check` sobre los módulos modificados. Los tests verifican la secuencia/tiempos por simulación fija, no el balance ni la legibilidad percibidos.

**Checklist manual pendiente (solo teclado físico y juicio humano):**

1. Completar los niveles anteriores y valorar la dificultad de CÁTODO-3, con cada uno de los tres estudiantes.
2. Comprobar que el aviso deja claro cuándo conviene saltar o cubrirse del pulso y qué franja de sensor se activará; valorar la lectura del corredor seguro.
3. Usar F2 y comprobar visualmente que la caja del sensor y el orbe coinciden con los contactos reales.
4. Confirmar en una campaña jugada la transición Nivel 2 → Nivel 3, la conservación del estudiante y el cierre tras derrotar a CÁTODO-3.
5. Pausar en startup, activo y recuperación de un ataque, y durante el pulso; reanudar y revisar que no haya salto temporal ni daño fantasma.
6. Reiniciar Nivel 3 desde los caminos de reinicio disponibles y verificar vida, posición, ataque/proyectiles y progreso limpios según las reglas de campaña.
7. Revisar la consola DevTools durante el recorrido normal y juzgar legibilidad del HUD/avisos y el comportamiento al cambiar el tamaño de ventana.

**No verificado:** no se hizo recorrido manual con teclado, no se midió la dificultad subjetiva ni la claridad de los avisos, ni se inspeccionó F2 visualmente o la consola durante una campaña completa. La prueba del pulso que ignora paredes aplica solo al pulso explícitamente descrito como cruzando la arena; no se validó visualmente en diferentes tamaños de ventana. Los perfiles fueron consultados pero no ejecutados por agentes externos.

**Valores:** inventario consolidado al final de este registro. La velocidad 200 px/s, origen aproximado (710,410), radio16 y demás valores de patrón se toman de la ficha de diseño.

## 2.8 — Nivel 4: NULL y cierre de campaña

**Estado:** integración funcional de Nivel 4 y cierre narrativo. La suite local ejecutó **54/54 pruebas PASA**; el juego se abrió en navegador local y el arnés Digit4 mostró la introducción/biblioteca. La campaña completa con teclado físico, el equilibrio y la lectura humana siguen pendientes. No se declara cerrada toda la Fase 2 hasta completar las evidencias manuales y de protocolo abajo.

**Entrega:** `null-data.js` contiene las dos fases y sus ataques como datos; `null-boss.js` especializa el enemigo compartido sólo para sensor dinámico, selección de zona segura y aviso visual de cambio de fase. `library-mechanics.js` calcula una zona segura alcanzable al comenzar el aviso, conserva el destino durante el ataque y difiere el inicio si no existe ruta. `level-4-data.js` describe biblioteca, spawns, arena, presentación y líneas del nivel. `campaign-data.js` registra Nivel 4; el controlador existente enlaza victoria del Nivel 3 con NULL y victoria final con la pantalla de cierre. `campaign-ending.js` muestra cuarta marca, puntaje, récord y epílogo; el almacenamiento local usa el mecanismo de récord ya existente. Digit4 queda identificado como arnés para entrar directo.

**Verificación automática y de navegador:** 54/54 PASA en `juego/tests/tests.html`, incluyendo regresión de 2.1–2.7; datos/carga/reinicio limpio; vida, orden, tiempos y daños de NULL; selección/alcance de zonas seguras y cuerpo completo; ataques/avisos y pausa; transición de fase por umbral una sola vez y reinicio de la secuencia; KO simultáneo; recorrido de los tres estudiantes por los cuatro niveles; cierre narrativo/registro aislado; y atajo Digit4. El humo de navegador confirmó que el atajo abre el nivel y no dejó errores/avisos en ese recorrido. Esto no sustituye una campaña jugada íntegra con teclado ni inspección visual humana de las señales.

**Checklist manual pendiente (teclado físico y juicio humano):**

1. Completar la campaña con Alma, Diego y Nadia; valorar dificultad y si los patrones de NULL se pueden leer y responder sin visor.
2. Confirmar que cada eco identifica de forma clara la franja peligrosa, y que el aviso del barrido final indica la zona segura antes de que empiece el ataque.
3. Usar F2 y comprobar visualmente la coincidencia de hitboxes, sensor, franja segura y contactos; validar que saltar fuera de la zona segura no evita el barrido final.
4. Pausar durante startup, activo, recuperación y anuncio de fase; al reanudar, verificar que no haya salto, daño fantasma ni cambio de destino seguro.
5. Completar el cierre y revisar las cuatro marcas, las líneas del epílogo, la frase del estudiante elegido y el récord local. Repetir con puntaje mayor/menor y comprobar que solo se conserva el mejor récord terminado.
6. Reiniciar nivel/campaña desde los flujos permitidos y verificar que no sobrevivan HP, ataques, fase, proyectiles, marcas ni intentos residuales.
7. Revisar la consola DevTools durante una campaña normal y la presentación en varios tamaños de ventana.

**No verificado manualmente:** teclado físico, balance/dificultad, legibilidad de avisos y cierre, coincidencia visual F2/contactos, cambios de ventana, persistencia con el almacenamiento real del perfil del navegador, consola durante una campaña completa y ejecución en la matriz de navegadores. Las pruebas automáticas fuerzan estados de campaña/KO y usan almacenamiento aislado; no son un playthrough manual. La cobertura de rutas seguras es determinista, pero no valida la sensación temporal de cruzar la arena.

**Cambios de fases anteriores:** no se modificaron bucle, reloj, física del jugador, máquina de estados ni `campaign-controller.js`. El único gancho nuevo de combate es `EnemyCombatant.onPhaseChanged()` para notificar transiciones genéricas a la especialización; se añadió representación y resolución propias de NULL. La caja del barrido final respeta la regla documental de cuerpo completo dentro de zona segura y no permite evadirlo saltando. No se añadieron patrones, curación, vidas ni reglas no documentadas.

**Diferencias respecto a las fuentes:** no se detectó una diferencia de reglas, HP, orden, tiempos, daños o fases. La transición de fase se dispara al primer umbral de 80 HP una vez que termina ataque y recuperación, y reinicia la cola según contrato. El barrido permanece aplazado si el jugador no tiene una zona alcanzable. Sólo la ilustración rectangular y la duración del aviso visual son decisiones provisionales, detalladas en el inventario único al final.

## Revisión de cierre de la Fase 2 (subfases 2.1–2.8)

| Subfase | Automático / evidencia registrada | Pendiente manual o incompleto |
|---|---|---|
| 2.1 Núcleo | Regresión de estados, reloj/paso fijo y uso de navegador observados en el registro. | Pérdida de foco/visibilidad en navegador real, redimensionado/DPR en varios viewports, consola DevTools y matriz de navegadores no documentados íntegramente; faltan métricas PF de línea base y evidencia reproducible de descarte de tiempo. |
| 2.2 Entrada/física | Pruebas de salto cercano a 150 px y colisiones de suelo, pared, plataforma y muñeco; limpieza de entrada. | Sensación de controles, cada combinación física de teclas, medición manual y pérdida de foco con tecla retenida. |
| 2.3 Combate común | Casos de contacto único, invulnerabilidad, proyectiles, pausa, KO y paso fijo en tests. | Sensación de golpe, parpadeo, visual F2 y console DevTools durante uso manual. |
| 2.4 Chilo/tutorial | Pruebas de secuencia/tutorial, patrón, reinicio, pausa y resultados. | Claridad del tutorial, balance y legibilidad con teclado físico. |
| 2.5 Campaña | Transiciones, intentos, score/marcas, retries, selección y récord tienen casos automáticos. | Recorrido completo con teclado; accesibilidad semántica del selector Canvas y confirmación del récord en el perfil real. |
| 2.6 Vera/cancha | Datos y patrón, rebote, defensa, salto, pausa, progresión y tres personajes probados. | Dificultad/lectura de avisos, consola y campaña completa manual. |
| 2.7 CÁTODO-3/laboratorio | Secuencia, pulso, sensores/corredor, daños, pausa y progresión probados. | Dificultad, F2, legibilidad y navegación manual de zonas seguras desde extremos con cada estudiante. |
| 2.8 NULL/cierre | 54/54 regresiones en navegador; integración de las cuatro entradas, cierre y arnés observados. | Playthrough con teclado, dificultad/avisos, inspección visual F2, récord del perfil real, consola completa y matriz de navegadores. |

**Evaluación de puerta:** la implementación automatizada 2.1–2.8 está integrada, pero no hay evidencia suficiente para declarar aprobado el cierre formal de Fase 2. Permanecen verificaciones manuales de diseño/usabilidad, evidencia técnica pendiente de 2.1 y medición de PF-04…PF-07 mediante duelo real; PF-01/PF-03 sólo tienen línea base parcial y PF-02 corresponde al cascarón inicial. Las métricas deben registrarse con navegador, equipo, viewport y procedimiento, según el plan.

**Deuda de protocolo de agentes:** los perfiles requeridos por cada subfase fueron consultados y sus criterios se reflejan en implementación/tests. No hubo ejecución delegada externa en esta corrida; el registro histórico de 2.4/2.5–2.7 conserva sus propias notas y no constituye aprobación independiente del resultado 2.8. Por tanto, queda pendiente completar las revisiones/artefactos de agentes que exige `FLUJO_OPERATIVO.md` y registrar sus respuestas, especialmente las revisiones cruzadas de diseño, física, narrativa, prueba y Canvas/responsive/input. No se declara una revisión de agente no realizada como PASA.

## Inventario consolidado de valores y presentaciones PROVISIONALES

Esta es la única lista consolidada de decisiones provisionales activas en la Fase 2. HP, tiempos y daños prescritos por los contratos no se repiten aquí como provisionales. Los datos de balance de combate siguen sujetos a la iteración de juego que el plan contempla, sin sustituir sus valores documentados.

- **2.1–2.2, demostradores y movimiento:** pantallas simples del núcleo, señales/colores de depuración y geometría de sala/plataformas de prueba; aceleración 2000 px/s², fricción 2400 px/s², control aéreo 70 %, caída máxima 900 px/s, gravedad 1200 px/s², impulso de salto −600 px/s y factor de corte 0.5. El buffer de 100 ms proviene del contrato y epsilon es una tolerancia técnica, no balance provisional. Velocidades Alma/Diego/Nadia 240/204/288 px/s son datos de personaje definidos para 2.2.
- **2.3, hitboxes y presentación de combate:** startup normal 0; hitbox normal de altura 44 px y offset vertical −66 px; especiales con startup 0 y ventanas activas de un paso (el volley permanece activo según su vuelo); dimensiones/offset de pulso y carga; herido visual 0.12 s; opacidad de invulnerabilidad 0.38 e intervalo 0.08 s; orbe del muñeco daño 8, startup 0.6 s, activo 1 paso, recuperación 0.5 s, caja 18×18 px, velocidad 260 px/s, vida 4 s; máximo 6 proyectiles y margen de limpieza 40 px; notas de Nadia 12×12 px, dispersión 12 px, velocidad 260 px/s y vida derivada del recorrido. Marcadores geométricos/efectos rectangulares mientras no existan sprites/arte final.
- **2.4, Nivel 1/tutorial:** arco visual de salto de Chilo 110 px y herido visual 0.12 s; ubicación, tamaño, paleta y tipografía del panel de tutorial; pasos/textos extendidos de mover → saltar → atacar → guardia → especial → aproximación, ya que el contrato sólo fija enseñanza de distancia/salto y el primer aletazo como tutorial; rectángulos/paleta del estacionamiento, autos, palmeras, conos, pavimento y bloques; sombra/impacto y marcador rectangular de Chilo.
- **2.5, interfaz de campaña:** distribución y estilo Canvas de tarjetas/ayuda de selección, menú y Game Over. El cierre provisional de “solo Nivel 1” anotado históricamente en 2.5 fue reemplazado por cierre de campaña real en 2.8; no es provisional activo.
- **2.6, Nivel 2:** espera inicial de Vera 1.2 s; ventana interna de emisión del balón 0.01 s; herido visual 0.12 s; disposición/paleta del rectángulo de cancha y marcador rectangular de Vera. Los límites del balón se derivan del muro y radio del contrato.
- **2.7, Nivel 3:** espera inicial añadida 0 s; ventana de pulso derivada del margen de salida 40 px; vida de respaldo 4 s del pulso; herido visual 0.12 s; arte rectangular/paleta del laboratorio y marcador de CÁTODO-3.
- **2.8, Nivel 4/cierre:** espera inicial de NULL añadida 0 s; herido visual compartido 0.12 s; aviso gráfico de fase de 1.25 s; decoración/paleta geométrica de biblioteca y marcador rectangular/contorno de NULL; disposición, fuentes y colores de panel/texto del cierre. Las zonas seguras, criterio de ruta, ataques y transición de fase sí siguen contrato.

No se verificó manualmente la duración/lectura de estos avisos, la calidad estética ni el ajuste de los marcadores geométricos; quedan sujetos a revisión humana y arte final. No se hizo commit ni se borraron archivos.
