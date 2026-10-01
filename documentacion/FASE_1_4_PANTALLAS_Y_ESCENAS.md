# Fase 1.4 — pantallas, escenas, controles y foco

**Estado:** contrato documental. Fuentes: [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md), [LORE.md](LORE.md), [Requisitos.md](Requisitos.md), [combate y entrada 1.2](FASE_1_2_COMBATE_Y_DATOS.md). La primera versión tiene **diez pantallas/estados principales**; confirmaciones y la terminal del Archivo son componentes internos, no estados adicionales. Los textos son propuestas de producción, mientras WASD/R/Shift y los cuatro escenarios pixel art son requisitos del creador.

## Mapa de estados, acciones y foco

| Estado | Acción y siguiente estado | Foco inicial | Foco al volver o cerrar |
|---|---|---|---|
| `MENU` Inicio | Iniciar → `SELECT`; Cómo jugar → `HOW_TO_PLAY`; Sonido cambia preferencia sin salir. | Iniciar. | Desde Cómo jugar vuelve a su botón; desde Game Over vuelve a Iniciar. |
| `HOW_TO_PLAY` Cómo jugar | Archivo → `ARCHIVE`; Volver/Escape → `MENU`. | Botón Archivo después de leer título/controles. | Desde Archivo vuelve a Archivo; al salir, Cómo jugar en Inicio. |
| `ARCHIVE` Archivo | Elegir ficha o abrir terminal permanece; Volver/Escape → `HOW_TO_PLAY`. | Primera ficha. | Terminal cerrada → Abrir terminal; Archivo cerrado → botón Archivo de Cómo jugar. |
| `SELECT` Selección | Elegir una tarjeta y confirmar → `STORY` nivel 1; Volver → `MENU`. | Primera tarjeta, o tarjeta elegida al regresar antes del primer combate. | Desde Game Over/Victoria, primera tarjeta; desde Introducción inicial, tarjeta elegida. |
| `STORY` Introducción | Continuar → `FIGHT`; Volver → `SELECT` sólo antes del primer combate. Tras derrota con intentos, variante breve **Reintentar** → `FIGHT` del mismo nivel. | Continuar o Reintentar tras anunciar título. | A Selección vuelve a Elegir; a Combate enfoca región de juego. |
| `FIGHT` Combate | Esc → `PAUSE`; jefe vencido en niveles 1–3 → `LEVEL_CLEAR`; NULL vencido → `VICTORY`; derrota con intentos → `STORY` variante Reintentar; tercera derrota → `GAME_OVER`. | Región de juego con nombre accesible. | Tras Pausa, elemento que tenía foco si existe; si no, región de juego. |
| `PAUSE` Pausa | Continuar/Escape → `FIGHT`; Reiniciar nivel o Menú abren confirmación; confirmar reinicio → `FIGHT` nuevo o `GAME_OVER`; confirmar Menú → `MENU`. | Continuar. | Cancelar diálogo → botón que lo abrió; reanudar → foco previo de combate. |
| `LEVEL_CLEAR` Resultado | Siguiente nivel → `STORY` del siguiente lugar. | Siguiente nivel. | La Introducción enfoca Continuar. |
| `GAME_OVER` Game Over | Reiniciar campaña → `SELECT`; Menú → `MENU`. | Reiniciar campaña. | Selección enfoca primera tarjeta; Menú enfoca Iniciar. |
| `VICTORY` Victoria | Jugar de nuevo → `SELECT`; Menú → `MENU` como salida secundaria. | Jugar de nuevo. | Selección enfoca primera tarjeta; Menú enfoca Iniciar. |

La variante `STORY` de reintento muestra «Intentos restantes: N. Repite este duelo» y un botón **Reintentar**; omite las tarjetas introductorias ya vistas y no vuelve a otorgar marcas ni puntos. La derrota consume el intento **antes** de mostrar esa variante. La UI sólo presenta el estado que emite Campaña; no descuenta intentos ni calcula bonos. Una escena de victoria se presenta después de que Campaña registre la marca, una sola vez.

### Componentes internos y mensajes de confirmación

- **Terminal de mantenimiento** dentro de `ARCHIVE`: cuatro fichas y campo «Palabra de mantenimiento»; abrirla enfoca el campo, cerrarla devuelve foco a «Abrir terminal». Enter envía una vez. Las letras de WASD/R/E se escriben normalmente; nunca activan combate. Su función es desbloquear el Visor GUÍA, incluso antes de iniciar campaña.
- **Confirmación de reinicio** dentro de `PAUSE`: «Reiniciar este nivel consume un intento. ¿Continuar?». Con un intento restante añade: «Es tu último intento; al reiniciar irás a Game Over». Cancelar recibe foco inicial; confirmar emite una acción única a Campaña. Escape cancela y restaura foco al botón Reiniciar nivel.
- **Confirmación de abandono** dentro de `PAUSE`: «Salir al menú abandona esta campaña y descarta su puntuación. El récord previo y el Visor descubierto permanecen». Cancelar recibe foco inicial; confirmar emite una acción única. Escape cancela y restaura foco a Menú.
- **Terminal de recuperación de la biblioteca:** aparece sólo como parte del relato de `STORY`/`VICTORY`. Tres marcas permiten entrar en biblioteca, pero se puede editar únicamente tras derrotar a NULL y obtener la cuarta. No acepta GUÍA, no da el Visor y no sustituye la terminal del Archivo.

## HUD y navegación de teclado

En `FIGHT`, el HUD recibe del estado único vida numérica y barra de estudiante/jefe, nivel y nombre del jefe, tiempo, intentos, puntuación, enfriamiento del especial y Visor bloqueado/listo/usado. Muestra nombre, zona, trama y cuenta del ataque; los daños aparecen con número además de animación. En `PAUSE` el HUD puede quedar bajo un velo, pero sus valores se congelan con la simulación. Los mensajes críticos tienen texto y símbolo además de color/audio. Un lector de pantalla anuncia cambios relevantes, no cada fotograma del reloj o de las barras.

En menús, `Tab`/`Shift+Tab` conservan el orden DOM visual y Enter/Espacio activan botones semánticos una vez. Escape equivale a Volver sólo en `HOW_TO_PLAY` y `ARCHIVE`; en `PAUSE` cancela primero una confirmación abierta y, sin confirmación, reanuda. No se inventa un Escape global para resultados. Durante combate, A/D/W/S/R/Shift/E siguen [1.2](FASE_1_2_COMBATE_Y_DATOS.md); `Tab` nunca se intercepta y alcanza el botón HUD del Visor si está disponible. El botón y la tecla E emiten la misma solicitud al combate. Los campos editables y diálogos desactivan las teclas de combate. Al perder foco, ocultar pestaña o cambiar a una ventana de lectura estrecha, el combate pausa y exige reanudación explícita; teclas retenidas/buffer se limpian. Los escuchadores se instalan una vez y se retiran al desmontar.

## Escenas por nivel

Cada tarjeta tiene **un hablante y una frase corta**, máximo tres líneas visibles. Los tres estudiantes están presentes; el elegido ocupa la tarjeta de respuesta. No hay ramificaciones que cambien marcas, niveles o final. El texto exacto del [lore](LORE.md) sigue siendo la referencia narrativa si se revisa el tono; estas tarjetas son la versión breve propuesta para UI.

| Nivel | Tarjetas antes del duelo, en orden | Tarjetas después de vencer, en orden |
|---|---|---|
| 1, Chilo | NULL: «Prueba 1 de 4. Primera validación pendiente». Nadia: «El mapa marca cuatro paradas. La próxima es la cancha». Chilo: «Si una victoria abre el paso, luchemos con cuidado». Elegido: variante 1. | NULL: «Victoria registrada. Primera marca obtenida». Chilo: «Bien peleado. En la cancha, la prueba está en el marcador». Elegido: variante 1. Chilo queda disponible por radio. |
| 2, Vera | NULL: «Prueba 2 de 4. Control del espacio pendiente». Vera: «El marcador cerró la cancha. Yo elijo competir para abrirles paso». Chilo por radio: «Miren la línea y el regreso del balón». Elegido: variante 2. | NULL: «Victoria registrada. Segunda marca obtenida». Vera: «Bien jugado. El laboratorio guarda el registro de esa orden». Elegido: variante 2. Vera mantiene despejado el acceso y se vuelve aliada. |
| 3, CÁTODO-3 | CÁTODO-3: «Acceso al registro: denegado. Demostración defensiva». Alma: «NULL cambió su rutina. Debemos detenerla para leer el historial». Nadia: «Los sensores avisan. La franja apagada queda segura». Elegido: variante 3. | NULL: «Victoria registrada. Tercera marca obtenida». CÁTODO-3: «Modo seguro. Registro disponible». Registro: «Certificar a los mejores estudiantes mediante cuatro desafíos». Alma: «Falta la libertad de elegir. NULL convirtió la prueba en obligación». CÁTODO-3: «Copia de recuperación: terminal de la biblioteca». Elegido: variante 3. |
| 4, NULL | NULL: «Tres marcas registradas. Falta la prueba final». Alma: «La copia está aquí, pero la rutina bloquea la edición». Nadia: «Todos merecen continuar. Tu tarea era mostrar caminos». NULL: «La instrucción actual no contiene esa excepción». Elegido: variante 4. | NULL: «Cuarta marca registrada. Rutina de validación detenida». NULL: «Copia de recuperación editable». Nadia: «Ayuda a encontrar caminos sin decidir quién merece avanzar». Alma: «Nueva regla: ayudar a cada estudiante a encontrar su camino…» y luego «…con libertad para participar». Diego: «Los accesos están abiertos y las áreas son seguras». NULL: «Interpreté mal la orden. Volveré a guiar sin imponer pruebas». |

| Elegido | Variante 1 antes / después | Variante 2 antes / después | Variante 3 antes / después | Variante 4 antes |
|---|---|---|---|---|
| Alma | «Observaré la señal; después revisaré esa orden». / «La marca se guardó. Revisemos ese marcador». | «El marcador registra el resultado. Leeré sus señales». / «Allí podremos averiguar qué cambió». | «Detendré la defensa sin perder el registro». / «Allí podremos preparar la corrección». | «Detendré la rutina y corregiremos la regla». |
| Diego | «Los conos marcan el área. Nadie más entra». / «Todos están bien. Sigamos hacia la cancha». | «Sólo tú y yo dentro de las líneas, Vera». / «Mantengamos libre el paso hacia el laboratorio». | «Mantengan distancia. Iré por el corredor seguro». / «Abramos el paso con cuidado. Queda una prueba». | «Mantendré despejado el paso hacia la terminal». |
| Nadia | «Si esto abre la ruta, averigüemos adónde lleva». / «Primera parada completa. Seguimos la ruta». | «Competiremos por elección, no por obligación». / «Seguimos las pistas, ahora con Vera de nuestro lado». | «Seguiré la franja apagada hasta el registro». / «La biblioteca es la última parada. Vamos juntos». | «Guiar también significa dejar elegir». |

En `VICTORY`, se usa la línea final correspondiente de [LORE.md](LORE.md), sin cambiar palabras. El cambio de fase de NULL a media vida sólo cambia ataques, nunca concede la cuarta marca. Las derrotas nunca muestran tarjetas posteriores a victoria. La escena no escribe puntos ni estado de campaña.

## Escalado y lectura

Arena 960 × 540 con ajuste proporcional `fit`: `escala = min(anchoDisponible/960, altoDisponible/540)`. Se centra sin recortar telegráficos ni deformar píxeles. Referencia si la ventana completa está disponible: **1366 × 768 → aprox. 1365 × 768**, **1920 × 1080 → 1920 × 1080**, **390 × 844 → 390 × 219**. La implementación medirá el contenedor real. Fondo pixel art nativo 480 × 270 escalado a la arena lógica, Canvas con suavizado desactivado y CSS `image-rendering: pixelated`; DPR efectivo inicial con tope 2. Los textos de HUD y diálogos son DOM y no se reducen junto con Canvas.

En escritorio el HUD se distribuye en filas o esquinas sin tapar suelo ni avisos. En 390 × 844, la arena es una **vista de referencia**, los menús/Archivo/selección/texto se ordenan en una columna desplazable y mantienen al menos 16 CSS px para lectura. Se avisa «La primera versión requiere teclado y una ventana horizontal amplia». No se afirma juego táctil. Si la ventana pasa a retrato durante FIGHT, se pausa sin consumir intento ni tiempo y se exige reanudar en un tamaño apropiado. Reducir destellos/movimiento conserva todos los textos y señales. El foco no desaparece al cambiar tamaño u orientación.

**Puerta 1.4:** los diez estados tienen entrada, acción, salida y foco inicial/retorno; los cuatro capítulos tienen tarjetas y variantes; reintento, confirmaciones y terminales no crean rutas ambiguas. Hay especificación legible de los tres tamaños y del teclado sin prometer táctil. Es una revisión documental, no de interfaz implementada.
