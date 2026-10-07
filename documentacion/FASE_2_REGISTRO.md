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

**Valores provisionales:** aceleración horizontal 2000 px/s², fricción de suelo 2400 px/s², control aéreo 70 %, caída máxima 900 px/s, gravedad 1200 px/s², impulso inicial −600 px/s, factor de corte al soltar 0.5 y geometría de plataformas/sala. Los tres primeros y la caída máxima proceden de la decisión aprobada para 2.2; gravedad y salto conservan la propuesta ajustable de 1.3. El buffer de 100 ms procede del contrato 1.2; epsilon de colisión es tolerancia técnica. Velocidad máxima por personaje: Alma 240, Diego 204 y Nadia 288 px/s.

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

**Valores PROVISIONALES en `combat-config.js`:** startup R=0; alto 44 px y offset vertical −66 px de su hitbox; startup 0 en los especiales, ventana activa de un paso para pulso/carga y duración de vuelo como ventana activa del volley; dimensiones/offset vertical de pulso y carga; duración visual de 0,12 s del estado herido enemigo; opacidad 0,38 e intervalo de parpadeo 0,08 s; daño 8, startup 0,6 s, activo de un paso, recuperación 0,5 s, caja 18×18 px, velocidad 260 px/s y vida 4 s del orbe; máximo de seis proyectiles y margen de culling 40 px; tamaño 12×12 px, dispersión 12 px y velocidad 260 px/s de cada nota de Nadia (su vida se deriva de alcance/velocidad). Los perfiles completos de Chilo, Vera, CÁTODO-3 y NULL, incluidos todos sus patrones, quedan para integrar con sus niveles; no se modificó el bucle, reloj ni máquina de estados.
