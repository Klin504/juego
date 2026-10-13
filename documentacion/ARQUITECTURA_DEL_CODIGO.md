# Arquitectura del código

Esta guía describe la implementación actual del juego. La documentación de fases registra decisiones y entregas históricas; este archivo y el código bajo `src/` describen la estructura que existe ahora.

La lógica y los valores ajustables de movimiento, esquiva, selección de ataques y combos están descritos en [IA_JEFES_Y_BALANCE.md](IA_JEFES_Y_BALANCE.md).

## Recorrido de una partida

1. `index.html` carga `src/app/main.js` como módulo ES.
2. `src/app/main.js` crea el estado global, configura entrada, audio, renderizado y pantallas, y conecta sus eventos.
3. `src/core/game-loop.js` mantiene un paso fijo de simulación y solicita el dibujo de cada fotograma.
4. `src/input/input-controller.js` convierte teclado en acciones del juego; `action-map.js` centraliza teclas y alias.
5. `src/app/states.js` dirige los cambios entre menú, selección, tutorial, combate, pausa, archivo y finales.
6. Los controladores de `src/campaign/` administran niveles, progreso, guardado, tutorial, finales y el archivo secreto.
7. `src/combat/combat-system.js` actualiza los luchadores y produce eventos; `src/physics/` mueve los cuerpos y resuelve sus límites.
8. `src/rendering/` dibuja escenario y personajes desde el estado actual. `src/audio/audio-system.js` reproduce música y efectos a partir de eventos.

## Carpetas

```text
.
├── index.html                    Página del juego
├── styles.css                    Presentación del lienzo y la interfaz DOM
├── package.json                  Comando npm start
├── README.md                     Guía rápida para ejecutar
├── assets/
│   ├── arenas/                   Fondos pixel art de los cuatro niveles
│   └── sprites/                  Hojas de animación de estudiantes y jefes
├── src/
│   ├── app/                      Composición de la aplicación y estados
│   ├── audio/                    Música y efectos Web Audio
│   ├── campaign/                 Progreso, tutorial, archivo y finales
│   ├── combat/                   Combate, ataques, jefes y mecánicas de arena
│   ├── core/                     Bucle, reloj, viewport y máquina de estados
│   ├── input/                    Mapa de teclas y entrada
│   ├── levels/                   Datos y carga de niveles
│   ├── physics/                  Entidades y movimiento
│   ├── rendering/                Manifiesto de recursos y dibujo de Canvas
│   └── ui/                       Menú, selección y componentes de interfaz
├── tests/                        Página y casos automatizados existentes
├── tools/                        Servidor local y herramienta de sprites
├── documentacion/                Diseño, decisiones, registros y esta guía
└── agentes_juegos_html_css_js/   Perfiles de trabajo para agentes de desarrollo
```

## Responsabilidad por módulo

| Módulo | Qué hace | Funciones principales |
|---|---|---|
| `src/app/main.js` | Conecta las partes, crea dependencias y arranca la aplicación. | Punto de entrada; inicialización y despacho de comandos. |
| `src/app/states.js` | Define qué se muestra y qué acciones acepta cada pantalla. | Actualización y transición de estado. |
| `src/core/game-loop.js` | Ejecuta la simulación y el render con paso temporal estable. | Inicio, pausa, reanudación y detención. |
| `src/core/game-clock.js` | Lleva el tiempo de juego y la duración de las escenas. | Avance, pausa y consulta del tiempo. |
| `src/core/state-machine.js` | Valida y aplica cambios de estado. | Transición y lectura del estado vigente. |
| `src/core/canvas-viewport.js` | Ajusta el lienzo al tamaño de ventana sin suavizar los píxeles. | Cálculo del viewport y redimensionado. |
| `src/input/action-map.js` | Declara acciones lógicas y teclas asociadas. | Resolución de tecla a acción. |
| `src/input/input-controller.js` | Captura teclas, mantiene estado presionado y emite acciones. | Lectura de entrada y limpieza al pausar. |
| `src/campaign/campaign-controller.js` | Coordina la progresión por la campaña. | Inicio, resultado de combate y siguiente nivel. |
| `src/campaign/campaign-storage.js` | Conserva las preferencias y el progreso persistente. | Lectura y escritura de `localStorage`. |
| `src/campaign/campaign-transitions.js` | Resuelve transiciones de campaña entre pantallas. | Decisión de transición según resultado. |
| `src/campaign/campaign-data.js` | Declara el orden y metadatos de niveles y luchadores. | Consultas de datos de campaña. |
| `src/campaign/tutorial-controller.js` | Guía la práctica inicial y reconoce sus pasos. | Avance, confirmación y estado del tutorial. |
| `src/campaign/archive-controller.js` | Gestiona fichas y desbloqueo del Visor GUÍA. | Consulta de pista y desbloqueo. |
| `src/combat/combat-system.js` | Orquesta la partida de combate y genera eventos. | Actualizar combate, resolver ataques y producir resultado. |
| `src/combat/combatant.js` | Estado base de un participante del combate. | Movimiento, salud y estados de acción. |
| `src/combat/enemy-combatant.js` | Ejecuta la lógica común de enemigos y jefes. | Decidir, avisar y ejecutar ataques. |
| `src/combat/boss-ai.js` | Decide movimiento y tácticas comunes de jefes. | Controlar distancia, esquivar hitboxes, elegir patrón y proponer un combo. |
| `src/combat/attack-geometry.js` | Calcula alcance e intersección de golpes. | Geometría de ataque y colisión. |
| `src/combat/projectile.js` | Actualiza proyectiles del jugador o del jefe. | Movimiento, impacto y ciclo de vida. |
| `src/combat/*-data.js` | Configura luchadores, jefes y patrones de ataque. | Datos declarativos por personaje. |
| `src/combat/{chilo,vera,catodo3,null-boss}.js` | Define las rutinas particulares de los jefes. | Movimientos y reglas específicas por patrón. |
| `src/combat/*-mechanics.js` | Añade reglas especiales de laboratorio y biblioteca. | Efectos de arena y ataques especiales. |
| `src/combat/visor-system.js` | Controla la interfaz Visor GUÍA durante la partida. | Activación y contenido del visor. |
| `src/physics/physics.js` | Integra movimiento y resuelve colisiones del escenario. | Paso físico y resolución de contactos. |
| `src/physics/fighter-entity.js` | Representa la posición física y el cuerpo de un luchador. | Estado físico y movimiento. |
| `src/levels/level-*-data.js` | Describe los cuatro escenarios y sus encuentros. | Configuración de cada nivel. |
| `src/levels/level-loader.js` | Prepara datos de un nivel para la partida. | Carga y creación del nivel actual. |
| `src/rendering/asset-manifest.js` | Asocia identificadores a archivos de imagen del juego. | Consulta y carga de recursos. |
| `src/rendering/arena-renderer.js` | Pinta fondo, arena, piso y efectos ambientales. | Renderizado del escenario. |
| `src/rendering/character-renderer.js` | Pinta personajes y sus fotogramas de animación. | Renderizado de sprites. |
| `src/rendering/fighting-atlas.js` | Define los recortes de ocho poses v4 y escala cada una sin deformación. | Menú, combate y pantalla final. |
| `src/audio/audio-system.js` | Sintetiza música y efectos usando Web Audio API. | Inicio tras gesto del usuario y consumo de eventos. |
| `src/ui/menu-ui.js` | Presenta menú y selección de personaje. | Creación y actualización de la interfaz. |

### Funciones y métodos que conducen el flujo

| Operación | Módulo | Efecto |
|---|---|---|
| `new GameLoop(updateFixed, render)`, `start()`, `frame(timestampMs)`, `stop()` | `core/game-loop.js` | Ejecuta los pasos fijos, limita recuperación tras pausas largas y solicita renderizados. |
| `new StateMachine(states, allowedTransitions, initialState)`, `transition(nextName)`, `update(dt)`, `render(ctx, snapshot, alpha)` | `core/state-machine.js` | Valida cambios de pantalla y delega actualización/dibujo al estado activo. |
| `connect(...)`, `mount()`, `snapshotForStep()`, `clear()` | `input/input-controller.js` | Conecta entrada, instala eventos de teclado, entrega acciones y limpia teclas retenidas. |
| `handleKeyDown(event)`, `handleKeyUp(event)`, `pauseForLostFocus()` | `input/input-controller.js` | Atiende pulsación/liberación y pausa cuando la ventana pierde foco. |
| `selectFighter(fighterId)`, `beginAttempt()`, `settleVictory(...)`, `settleDefeat()`, `advance()`, `abandon()` | `campaign/campaign-controller.js` | Administra elección de estudiante, intentos, resultado y progresión. |
| `update(actions, player, enemy)`, `render(ctx)` | `campaign/tutorial-controller.js` | Reconoce y muestra los pasos de práctica inicial. |
| `submitWord()`, `selectNextSheet()`, `selectPreviousSheet()`, `openTerminal()`, `closeTerminal()` | `campaign/archive-controller.js` | Navega fichas y procesa la palabra del secreto. |
| `update(dt, actions)`, `finishForTimeout()`, `spawnProjectile(specification)`, `renderHud(ctx)` | `combat/combat-system.js` | Actualiza daño y ataques, termina el reloj, crea proyectiles y dibuja el HUD. |
| `peekNextAttack()`, `update(dt, target)`, `currentAttackBox()`, `applyDamage(amount, details)`, `cancelCurrentAttack()` | `combat/enemy-combatant.js` | Controla los avisos y ataques del jefe, calcula amenaza activa y procesa impactos. |
| `update(entity, actions, dt, solids)` | `physics/physics.js` (`PhysicsWorld`) | Aplica movimiento al luchador y resuelve contactos contra superficies. |
| `loadLevel(levelData, fighterId, options)`, `updateLevel(level, actions, dt)`, `renderLevelBackground(ctx, levelData)` | `levels/level-loader.js` | Prepara el nivel, lo actualiza y pinta su fondo. |
| `renderPixelArtArena(ctx, levelData)`, `renderStudentSprite(ctx, ...)`, `renderBossSprite(ctx, enemy)` | `rendering/` | Dibuja el escenario y las poses de estudiante/jefe. |
| `drawMainMenu(ctx, ...)`, `drawFighterSelect(ctx, ...)`, `drawInfoScreen(ctx, ...)`, `drawCombatRibbon(ctx, ...)` | `ui/menu-ui.js` | Dibuja menú, selección, pantallas informativas y franja del combate. |
| `unlock()`, `setScene(scene)`, `consumeCombatEvents(events, playerId)`, `destroy()` | `audio/audio-system.js` (`AudioSystem`) | Activa Web Audio después del gesto inicial, cambia música, reproduce efectos de eventos y libera recursos. |

## Cómo se conectan

El código sigue una dirección de dependencias sencilla: `app` compone los módulos; `core`, `input`, `campaign`, `combat` y `physics` mantienen reglas y estado; `rendering`, `audio` y `ui` muestran o reproducen los resultados. El renderizador no decide quién gana, y el módulo de audio no aplica daño. El sistema de combate es la fuente de eventos que la interfaz y el audio consumen.

Los archivos `*-data.js` contienen configuración, mientras que los módulos de sistema contienen comportamiento. Cuando se agrega un luchador o nivel, conviene extender el manifiesto/datos existentes y evitar duplicar el bucle, las reglas de combate o los lectores de entrada.

## Imágenes y audio

- `assets/arenas/` contiene los fondos pixel art. Las versiones `*-v2.png` son los fondos elegidos para la revisión visual actual; `nivel-1.png` a `nivel-4.png` son los fondos anteriores conservados como referencia local.
- `assets/sprites/fighting-v4/` contiene las siete hojas ilustradas activas de lucha: Alma, Chilo, Diego, Nadia, Vera, CÁTODO-3 y NULL. Cada hoja mide 2170×725 píxeles y reúne ocho poses. `src/rendering/fighting-atlas.js` define los recortes y las dibuja sin deformación; las versiones v2 y v3 se conservan en `assets/sprites/`.
- `src/rendering/asset-manifest.js` establece qué archivo corresponde a cada arena y personaje.
- `tools/build_fighting_sprites_v3.py` regenera las hojas anteriores v3 a partir del generador v2; usa Pillow. Las hojas v4 son PNG originales guardados en `assets/sprites/fighting-v4/`.
- La música y los efectos se generan con Web Audio API, por lo que no hay carpeta de música descargada.
- Las referencias originales de diseño se preservan en `documentacion/referencias-visuales/originales/`; sirven para consultar decisiones artísticas y no se cargan en el juego. Los fondos y sprites de `assets/` son los recursos de runtime.

## Añadir o cambiar contenido

1. Revisa los datos existentes del nivel o personaje en `src/levels/` o `src/combat/`.
2. Añade o reemplaza el archivo en `assets/` y actualiza `src/rendering/asset-manifest.js` si cambia su ruta.
3. Conserva el dibujo en los renderizadores y la lógica de juego en sus módulos; no mezcles acceso DOM, física y audio en un único archivo.
4. Actualiza `documentacion/REFERENCIAS_VISUALES.md` si el arte cambia y este documento si aparece una carpeta o módulo nuevo.

## Habilidades de agentes

`agentes_juegos_html_css_js/FLUJO_OPERATIVO.md` describe el flujo de trabajo. Los perfiles están agrupados por diseño, motor/renderizado, sistemas, UI/HUD, pruebas y despliegue. Antes de modificar un área, consulta el perfil que corresponda; son guías del proyecto, no dependencias que se cargan en el navegador.
