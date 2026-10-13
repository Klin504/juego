# Chilos Fighters

Juego de lucha 2D pixel art para navegador. La campaña tiene cuatro niveles y un archivo con el secreto del Visor GUÍA.

## Jugar en Windows

Necesitas Node.js. En PowerShell, dentro de esta carpeta, ejecuta:

```powershell
npm start
```

Abre [http://localhost:8000/](http://localhost:8000/). La música empieza después de la primera tecla o clic porque los navegadores exigen un gesto del usuario para activar el audio. En el menú, **S** activa o silencia el sonido.

Detén el servidor con **Ctrl+C**.

## Controles

| Acción | Tecla |
|---|---|
| Moverse | A/D o flechas izquierda/derecha |
| Saltar | W, flecha arriba o Espacio |
| Cubrirse | S durante el combate |
| Golpe normal | R |
| Habilidad especial | Soltar Shift |
| Pausar | P o Escape |
| Mostrar cajas de combate | F2 |

El primer nivel empieza con una práctica de seis pasos. Chilo inicia sus ataques al terminarla. En la selección de estudiante, las teclas **2**, **3** y **4** abren directamente los niveles respectivos para revisar sus jefes.

## Diferencias entre luchadores

La pantalla **Elige tu luchador** muestra los valores exactos de vida, daño del golpe normal, movilidad y daño del especial. Los atributos más altos de la plantilla aparecen destacados. La configuración se define en `src/combat/combat-config.js` y `src/physics/physics-config.js`; la ficha de selección lee esas fuentes.

| Luchador | Vida | Golpe R | Especial Shift | Recarga | Velocidad | Ventaja |
|---|---:|---:|---|---:|---:|---|
| Alma | 100 PV | 14 | 22 por impacto | 8 s | 240 px/s | Equilibrio; su pulso interrumpe avisos de ataque. |
| Diego | 120 PV | 16 | 28 por impacto | 10 s | 204 px/s | Más vida y daño; recibe menos daño durante su carga. |
| Nadia | 85 PV | 12 | 3 notas: 8 + 7 + 7 | 7 s | 288 px/s | Más velocidad y ataque a distancia. |

Las tres notas de Nadia pueden causar **hasta 22** de daño si todas impactan; no es daño garantizado porque el jefe puede esquivarlas o la arena puede bloquearlas. Diego compensa sus valores altos con menor velocidad y más espera entre especiales. El golpe normal dura 0,62 s entre inicio, impacto y recuperación. Los valores anteriores de daño aumentaron cuatro puntos por personaje tanto en el golpe R como en el total máximo del especial; vida, recargas y daño de jefes no cambiaron.

## Cómo está organizado

```text
.
├── index.html                  Página que carga el juego
├── styles.css                  Diseño del contenedor y del lienzo
├── package.json                Comando npm start
├── README.md                   Esta guía e inventario
├── src/                        Código JavaScript del juego
│   ├── app/                    Inicio y pantallas
│   ├── audio/                  Música y efectos
│   ├── campaign/               Progreso, tutorial y archivo
│   ├── combat/                 Daño, ataques y jefes
│   ├── core/                   Reloj, bucle y estados
│   ├── input/                  Teclado y acciones
│   ├── levels/                 Configuración de los cuatro niveles
│   ├── physics/                Movimiento y colisiones
│   ├── rendering/              Fondos, sprites y manifiesto
│   └── ui/                     Menús, HUD y pantallas
├── assets/                     Imágenes cargadas por el juego
│   ├── arenas/                 Fondos de niveles
│   └── sprites/                Hojas de personajes
│       ├── fighting-v4/        Hojas ilustradas activas de ocho poses
│       ├── fighting-v3/        Hojas anteriores de arte generado por código
│       └── fighting-v2/        Hojas anteriores para comparar
├── tools/                      Servidor y generadores de arte
├── tests/                      Página y casos de prueba existentes
├── documentacion/              Diseño, fases y referencias visuales
└── agentes_juegos_html_css_js/ Perfiles locales para desarrollar el juego
```

El flujo principal es `index.html` → `src/app/main.js` → `src/core/game-loop.js` → estado en `src/app/states.js` → campaña y combate → renderizado y audio. [ARQUITECTURA_DEL_CODIGO.md](documentacion/ARQUITECTURA_DEL_CODIGO.md) explica las funciones que conectan esos módulos.

Para comprobar los especiales, la recarga, la entrada Shift y el daño actual de los tres estudiantes, ejecuta `npm run test:specials`.

### Cómo leer los comentarios del código

- El comentario inicial de cada módulo indica su responsabilidad general.
- Los comentarios `/** ... */` antes de funciones y métodos resumen su responsabilidad y, cuando es necesario, el resultado que producen.
- Los comentarios `//` dentro de una función explican el motivo de una regla o el orden de operaciones. Por ejemplo, el combate mueve a los personajes antes de comprobar impactos para usar posiciones actualizadas.
- Los archivos de datos incluyen comentarios junto a los bloques de niveles, fases, ataques y atributos. Los generadores Python usan docstrings en las funciones principales.

### Archivos de la raíz

| Archivo | Función |
|---|---|
| `index.html` | Crea el Canvas, carga CSS y arranca `src/app/main.js`. |
| `styles.css` | Ajusta presentación, escalado pixel art y mensajes HTML. |
| `package.json` | Define `npm start` para el servidor local. |
| `README.md` | Explica ejecución, controles, balance y ubicación de archivos. |

### `src/app/` y `src/audio/`

| Archivo | Función |
|---|---|
| `src/app/main.js` | Crea Canvas, dependencias, entrada, audio, bucle y estados. |
| `src/app/states.js` | Define menú, selección, combate, pausa, transición y finales. |
| `src/audio/audio-system.js` | Sintetiza música y efectos con Web Audio tras una interacción. |

### `src/campaign/`

| Archivo | Función |
|---|---|
| `archive-controller.js` | Navega el archivo del campus y procesa el secreto del Visor GUÍA. |
| `archive-data.js` | Contiene fichas, pistas y textos del archivo. |
| `campaign-controller.js` | Controla luchador elegido, nivel, marcas, intentos y puntos. |
| `campaign-data.js` | Ordena niveles y crea fichas de luchadores desde los valores reales. |
| `campaign-ending.js` | Prepara el cierre y la pantalla final de la campaña. |
| `campaign-storage.js` | Guarda récord y desbloqueo del Visor en `localStorage`. |
| `campaign-transitions.js` | Elige la siguiente pantalla según victoria o derrota. |
| `tutorial-controller.js` | Comprueba y muestra los pasos de práctica inicial. |
| `tutorial-data.js` | Define acciones y mensajes de esa práctica. |

### `src/combat/`

| Archivo | Función |
|---|---|
| `attack-geometry.js` | Calcula cajas, intersecciones y trayectorias de impactos. |
| `boss-ai.js` | Decide movimiento, esquivas, ataques y combos de los jefes. |
| `boss-data.js` | Configura a Chilo y sus patrones. |
| `catodo3-data.js` | Define cifras, fases y ataques de CÁTODO-3. |
| `catodo3.js` | Ejecuta movimientos, sensores y proyectiles de CÁTODO-3. |
| `chilo.js` | Ejecuta saltos, embestidas y avisos de Chilo. |
| `combat-config.js` | Fuente principal de vida, daño, especiales y constantes de combate. |
| `combat-data.js` | Agrupa ataque normal y rival de entrenamiento. |
| `combat-system.js` | Avanza el duelo, resuelve daño y genera eventos para HUD/audio. |
| `combatant.js` | Guarda vida, invulnerabilidad y eventos de daño de un combatiente. |
| `enemy-combatant.js` | Implementa ciclo común de aviso, ataque y recuperación del jefe. |
| `laboratory-mechanics.js` | Define sensores y áreas seguras del laboratorio. |
| `library-mechanics.js` | Define barridos y áreas seguras de la biblioteca. |
| `null-boss.js` | Ejecuta ecos y barrido final de NULL. |
| `null-data.js` | Define cifras, fases y ataques de NULL. |
| `projectile.js` | Mueve proyectiles, detecta contactos y controla su duración. |
| `vera-data.js` | Define cifras, fases y ataques de Vera. |
| `vera.js` | Ejecuta carreras y lanzamientos de balón de Vera. |
| `visor-system.js` | Activa el Visor GUÍA y anticipa patrones del jefe. |

### `src/core/`, `src/input/` y `src/physics/`

| Archivo | Función |
|---|---|
| `src/core/canvas-viewport.js` | Ajusta tamaño del Canvas a la ventana. |
| `src/core/constants.js` | Declara resolución, estados y constantes generales. |
| `src/core/game-clock.js` | Lleva el tiempo de simulación. |
| `src/core/game-loop.js` | Actualiza a paso fijo y pide cada dibujo. |
| `src/core/state-machine.js` | Valida los cambios entre pantallas. |
| `src/input/action-map.js` | Relaciona teclas físicas con acciones. |
| `src/input/input-controller.js` | Captura teclado, limpia teclas y entrega acciones. |
| `src/physics/fighter-entity.js` | Representa cuerpo, posición y velocidad del jugador. |
| `src/physics/physics-config.js` | Define velocidades y parámetros de movimiento. |
| `src/physics/physics.js` | Aplica gravedad, desplazamiento y colisiones. |
| `src/physics/test-room.js` | Escenario mínimo para aislar la física. |

### `src/levels/`, `src/rendering/` y `src/ui/`

| Archivo | Función |
|---|---|
| `src/levels/level-1-data.js` | Estacionamiento, tutorial y Chilo. |
| `src/levels/level-2-data.js` | Cancha y Vera. |
| `src/levels/level-3-data.js` | Laboratorio y CÁTODO-3. |
| `src/levels/level-4-data.js` | Biblioteca y NULL. |
| `src/levels/level-loader.js` | Crea entidades, física y combate para el nivel elegido. |
| `src/rendering/arena-renderer.js` | Dibuja escenario y capas ambientales. |
| `src/rendering/asset-manifest.js` | Relaciona identificadores con PNG, tamaños y poses. |
| `src/rendering/character-renderer.js` | Selecciona y dibuja la pose de cada personaje o jefe. |
| `src/rendering/fighting-atlas.js` | Recorta las poses v4 y conserva la proporción y el pivote de los pies. |
| `src/ui/menu-ui.js` | Dibuja menú, selección, guía y pantallas de transición. |

### `assets/arenas/`

| Archivo | Uso |
|---|---|
| `estacionamiento-v2.png` | Fondo activo del nivel 1. |
| `cancha-v2.png` | Fondo activo del nivel 2. |
| `laboratorio-v2.png` | Fondo activo del nivel 3. |
| `biblioteca-v2.png` | Fondo activo del nivel 4. |
| `nivel-1.png` | Versión anterior del estacionamiento, conservada para referencia. |
| `nivel-2.png` | Versión anterior de la cancha. |
| `nivel-3.png` | Versión anterior del laboratorio. |
| `nivel-4.png` | Versión anterior de la biblioteca. |

### `assets/sprites/`

| Archivo | Uso |
|---|---|
| `fighting-v4/alma.png` | Hoja activa de Alma: armadura cobre, guantes y ataque de energía. |
| `fighting-v4/diego.png` | Hoja activa de Diego: uniforme verde, vendas y golpes de fuerza. |
| `fighting-v4/nadia.png` | Hoja activa de Nadia: coleta violeta, comunicador y señales magenta. |
| `fighting-v4/chilo.png` | Hoja activa de Chilo: ave guardia, chaleco naranja y barrera. |
| `fighting-v4/vera.png` | Hoja activa de Vera: uniforme turquesa y líneas de cancha. |
| `fighting-v4/catodo3.png` | Hoja activa de CÁTODO-3: monitor CRT y descarga eléctrica. |
| `fighting-v4/null.png` | Hoja activa de NULL: capucha cristalina y energía del vacío. |
| `fighting-v3/alma.png` | Versión anterior de Alma generada por código. |
| `fighting-v3/diego.png` | Versión anterior de Diego generada por código. |
| `fighting-v3/nadia.png` | Versión anterior de Nadia generada por código. |
| `fighting-v3/chilo.png` | Versión anterior de Chilo generada por código. |
| `fighting-v3/vera.png` | Versión anterior de Vera generada por código. |
| `fighting-v3/catodo3.png` | Versión anterior de CÁTODO-3 generada por código. |
| `fighting-v3/null.png` | Versión anterior de NULL generada por código. |
| `fighting-v2/alma.png` | Versión anterior de Alma para comparar. |
| `fighting-v2/diego.png` | Versión anterior de Diego. |
| `fighting-v2/nadia.png` | Versión anterior de Nadia. |
| `fighting-v2/chilo.png` | Versión anterior de Chilo. |
| `fighting-v2/vera.png` | Versión anterior de Vera. |
| `fighting-v2/catodo3.png` | Versión anterior de CÁTODO-3. |
| `fighting-v2/null.png` | Versión anterior de NULL. |
| `alma.png` | Hoja anterior de Alma. |
| `diego.png` | Hoja anterior de Diego. |
| `nadia.png` | Hoja anterior de Nadia. |
| `chilo.png` | Hoja anterior de Chilo. |
| `vera.png` | Hoja anterior de Vera. |
| `catodo3.png` | Hoja anterior de CÁTODO-3. |
| `null.png` | Hoja anterior de NULL. |

Los fondos `*-v2.png` tienen 480×270 píxeles. Cada hoja activa v4 mide 2170×725 y contiene ocho poses ilustradas con transparencia. [fighting-atlas.js](src/rendering/fighting-atlas.js) define el recorte de cada pose y la dibuja dentro de 128×160 lógicos sin deformar su proporción. `tools/build_fighting_sprites_v3.py` regenera únicamente las hojas anteriores v3; requiere Pillow. El navegador carga los PNG v4 directamente y no necesita Python para jugar. Las referencias de origen están descritas en [REFERENCIAS_VISUALES.md](documentacion/REFERENCIAS_VISUALES.md).

### `tools/` y `tests/`

| Archivo | Función |
|---|---|
| `tools/dev-server.cjs` | Sirve archivos locales para `npm start`. |
| `tools/build_fighting_sprites_v3.py` | Genera las siete hojas anteriores v3 refinando la base v2. |
| `tools/build_fighting_sprites_v2.py` | Genera las hojas anteriores que sirven de base. |
| `tools/build_sprite_sheets.py` | Generador de las hojas anteriores. |
| `tests/tests.html` | Página del arnés de pruebas existente. |
| `tests/tests.js` | Casos automatizados del proyecto. |
| `tests/player-specials.test.mjs` | Comprueba golpes y especiales de los tres personajes, recargas y tecla Shift con Node. |

### `documentacion/`

| Archivo | Contenido |
|---|---|
| `ARENAS_Y_COMBATE.md` | Reglas y descripciones de los encuentros. |
| `ARQUITECTURA_DEL_CODIGO.md` | Flujo de una partida y funciones principales. |
| `DOCUMENTACION.md` | Índice documental general. |
| `EASTER_EGG.md` | Secreto del archivo y Visor GUÍA. |
| `FASE_1_1_REQUISITOS_Y_CANON.md` | Requisitos y canon de la primera subfase. |
| `FASE_1_2_COMBATE_Y_DATOS.md` | Contrato inicial de datos y combate. |
| `FASE_1_3_FICHAS_ARENAS.md` | Fichas de escenarios y jefes. |
| `FASE_1_4_PANTALLAS_Y_ESCENAS.md` | Flujo y contenido de pantallas. |
| `FASE_1_5_ARCHIVO_Y_VISOR.md` | Archivo, pista y visor. |
| `FASE_1_6_ARQUITECTURA.md` | Arquitectura planificada en fase 1. |
| `FASE_1_7_INVENTARIO_Y_CRITERIOS.md` | Inventario y criterios de entrega. |
| `FASE_1_REGISTRO.md` | Registro de la fase 1. |
| `FASE_2_REGISTRO.md` | Registro de la fase 2. |
| `FASE_3_REGISTRO.md` | Registro de la fase 3. |
| `IA_JEFES_Y_BALANCE.md` | Comportamiento actual de jefes y ajustes de dificultad. |
| `LORE.md` | Historia, personajes y contexto del campus. |
| `PANTALLAS_Y_RECURSOS.md` | Requisitos visuales y recursos de pantalla. |
| `PLAN_DESARROLLO.md` | Fases y subfases de desarrollo. |
| `REFERENCIAS_VISUALES.md` | Origen y destino de fondos y sprites. |
| `Requisitos.md` | Requisitos originales del proyecto. |
| `REVISION_VISUAL_AUDIO_COMBATE.md` | Revisión de arte, sonido y combate. |

Las fichas `FASE_1_*` y los registros documentan decisiones históricas. Para cifras que usa el juego ahora, consulta `src/combat/combat-config.js` y `src/physics/physics-config.js`.

#### `documentacion/referencias-visuales/originales/`

Estos archivos son referencias de diseño; el juego carga las versiones de `assets/`.

| Carpeta y archivo | Contenido |
|---|---|
| `jefe 1/WhatsApp Image 2026-09-30 at 1.41.52 PM.jpeg` | Foto de referencia de Chilo. |
| `jefe 2/vera-la-capitana.png` | Concepto de Vera. |
| `jefe 3/catodo-3.png` | Concepto de CÁTODO-3. |
| `nivel 1/WhatsApp Image 2026-09-30 at 1.31.28 PM (1).jpeg` | Foto alternativa del estacionamiento. |
| `nivel 1/WhatsApp Image 2026-09-30 at 1.31.28 PM.jpeg` | Foto frontal del estacionamiento. |
| `nivel 1/WhatsApp Image 2026-09-30 at 1.31.29 PM (1).jpeg` | Otra vista del estacionamiento. |
| `nivel 1/WhatsApp Image 2026-09-30 at 1.31.29 PM.jpeg` | Otra vista del estacionamiento. |
| `nivel 2/Captura de pantalla 2026-09-30 133430.png` | Vista de la cancha. |
| `nivel 2/Captura de pantalla 2026-09-30 133437.png` | Vista alternativa de la cancha. |
| `nivel 2/Captura de pantalla 2026-09-30 133443.png` | Vista alternativa de la cancha. |
| `nivel 2/Captura de pantalla 2026-09-30 133452.png` | Vista alternativa de la cancha. |
| `nivel 3/Captura de pantalla 2026-09-30 133804.png` | Vista del laboratorio. |
| `nivel 3/Captura de pantalla 2026-09-30 133809.png` | Vista alternativa del laboratorio. |
| `nivel 3/Captura de pantalla 2026-09-30 133815.png` | Vista alternativa del laboratorio. |
| `nivel 4/Captura de pantalla 2026-09-30 133116.png` | Vista de la biblioteca. |
| `nivel 4/Captura de pantalla 2026-09-30 133123.png` | Vista alternativa de la biblioteca. |
| `nivel 4/Captura de pantalla 2026-09-30 133136.png` | Vista alternativa de la biblioteca. |

### `agentes_juegos_html_css_js/`

Son guías locales para tareas de desarrollo. No se cargan al ejecutar el juego.

| Archivo | Especialidad |
|---|---|
| `FLUJO_OPERATIVO.md` | Orden recomendado para consultar los perfiles. |
| `diseno_juego/game-designer-web.md` | Mecánicas, progresión y balance. |
| `diseno_juego/level-designer-web.md` | Espacios, niveles y encuentros. |
| `diseno_juego/narrative-designer-web.md` | Historia y diálogos. |
| `motor_y_renderizado/canvas-engine-developer.md` | Lienzo, render y rendimiento Canvas. |
| `motor_y_renderizado/pixel-art-animator.md` | Formato de sprites y animaciones. |
| `motor_y_renderizado/webgl-3d-developer.md` | Alternativas de render WebGL. |
| `pruebas_y_despliegue/deployment-packager.md` | Empaquetado y publicación. |
| `pruebas_y_despliegue/game-tester-web.md` | Revisión de funcionalidad del juego. |
| `pruebas_y_despliegue/performance-optimizer-web.md` | Revisión de rendimiento. |
| `sistemas_de_juego/audio-web-engineer.md` | Audio en navegador. |
| `sistemas_de_juego/input-system-developer.md` | Teclado y acciones. |
| `sistemas_de_juego/multiplayer-web-developer.md` | Diseño de multijugador si se incorpora. |
| `sistemas_de_juego/physics-engine-developer.md` | Física y colisiones. |
| `ui_y_hud/game-ui-developer.md` | Menús, selección y HUD. |
| `ui_y_hud/responsive-game-designer.md` | Adaptación a tamaños de pantalla. |

## Dónde modificar cada regla

| Si necesitas cambiar... | Archivo principal | Archivo que lo muestra o usa |
|---|---|---|
| Vida y daño de estudiantes | `src/combat/combat-config.js` | `src/campaign/campaign-data.js`, `src/ui/menu-ui.js`, `src/combat/combat-system.js` |
| Velocidad de estudiantes | `src/physics/physics-config.js` | `src/physics/fighter-entity.js`, `src/ui/menu-ui.js` |
| Vida, ataques y fases de jefes | `src/combat/*-data.js` | `src/combat/enemy-combatant.js` y archivos del jefe |
| Dibujo de personajes | `assets/sprites/fighting-v4/`, `src/rendering/fighting-atlas.js` | `src/rendering/character-renderer.js`, `src/ui/menu-ui.js` |
| Menús y selección | `src/ui/menu-ui.js` | `src/app/states.js` |
| Escenarios | `src/levels/level-*-data.js`, `assets/arenas/` | `src/rendering/arena-renderer.js` |
| Música y efectos | `src/audio/audio-system.js` | Eventos de `src/combat/combat-system.js` |

Después de cambiar una cifra, actualiza la tabla de balance de este README. La UI no tiene una segunda copia de vida o daño. [IA_JEFES_Y_BALANCE.md](documentacion/IA_JEFES_Y_BALANCE.md) detalla avisos y contrajuego de los jefes.
