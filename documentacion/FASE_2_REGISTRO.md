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
