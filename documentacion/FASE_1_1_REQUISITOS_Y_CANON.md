# Fase 1.1 — requisitos trazables y canon

**Estado:** contrato documental de diseño. Las verificaciones de esta fase comprueban la coherencia de los documentos; las comprobaciones jugables quedan previstas para cuando exista una versión del juego. Fuentes: [Requisitos.md](Requisitos.md), [DOCUMENTACION.md](DOCUMENTACION.md) y [LORE.md](LORE.md).

## Criterio de clasificación

**Confirmado** significa pedido expresamente por el creador o fijado por las carpetas de imágenes recibidas. **Diseño adoptado** significa propuesta concreta de esta documentación para poder construir el juego; conserva la posibilidad de revisión creativa. Los valores de balance son **ajustables**. Ningún nombre inventado, número de daño o detalle del Visor se atribuye al creador.

## Matriz de requisitos

| ID | Requisito o decisión | Origen y estado | Dueño previsto | Resultado observable futuro |
|---|---|---|---|---|
| C-01 | Chilos Fighters: lucha 2D de estética pixel art | Creador; confirmado | Diseño, render | Combate lateral 2D e identidad pixel art. |
| C-02 | HTML, CSS y JavaScript; librerías sólo si aportan valor | Creador; confirmado | Arquitectura | Juego en navegador; dependencia externa declarada y justificada. |
| C-03 | Tres estudiantes seleccionables | Creador; confirmado | Campaña, UI | Se elige exactamente uno de tres para luchar. |
| C-04 | WASD, R para golpe y Shift para habilidad | Creador; confirmado | Entrada, combate | Las teclas tienen respuesta en combate; la asignación específica de W/S se documenta como diseño. |
| C-05 | Cuatro lugares en orden: estacionamiento, cancha, laboratorio de química, biblioteca | Carpetas `img/nivel 1` a `img/nivel 4`; confirmado | Campaña, niveles | Sólo se avanza 1 → 2 → 3 → 4 tras vencer. |
| C-06 | Jefe 1 mascota de la UJCV y jefe 4 IA; crear jefes 2 y 3 | Creador; confirmado | Diseño, narrativa | Un jefe correspondiente en cada arena. |
| C-07 | Tres intentos para la campaña | Creador; confirmado | Campaña | La tercera derrota termina en Game Over. |
| C-08 | Superar rivales y vencer al jefe final | Creador; confirmado | Campaña | La victoria ocurre tras vencer al cuarto jefe. |
| C-09 | Secreto en la documentación interna que da una herramienta útil | Creador; confirmado | Archivo, combate | Se puede descubrir una ayuda opcional y usarla en combate. |
| C-10 | Inicio, Iniciar, selección, vida, puntos, intentos, victoria/derrota, Game Over y Reiniciar | Creador; confirmado | UI, campaña | Todas las funciones tienen estado y salida definidos. |
| C-11 | Rivales, obstáculos, colisiones y efectos | Creador; confirmado | Niveles, combate, render | Límites y peligros jugables afectan movimiento/daño con señales; decorado no causa colisión. |
| C-12 | Interfaz adaptable | Creador; confirmado | UI, escalado | Menús y HUD caben en las ventanas objetivo; jugar requiere teclado en la primera versión. |
| C-13 | Los cuatro escenarios finales serán pixel art; fotos/capturas sólo referencias | Creador; confirmado | Arte, render | Ninguna foto/captura se usa como fondo final. |
| P-01 | Alma, Diego y Nadia; Chilo, Vera, CÁTODO-3 y NULL | [DOCUMENTACION.md](DOCUMENTACION.md), [LORE.md](LORE.md); diseño adoptado | Narrativa, campaña | Los cuatro capítulos usan los roles y nombres coherentemente. |
| P-02 | Un jugador contra CPU, Canvas 2D, teclado de escritorio | [DOCUMENTACION.md](DOCUMENTACION.md); diseño adoptado | Arquitectura, combate | Cuatro duelos CPU con teclado; interfaz estrecha legible sin prometer control táctil. |
| P-03 | A/D movimiento lateral, W salto, S cobertura, Esc pausa, E Visor | [DOCUMENTACION.md](DOCUMENTACION.md); diseño adoptado | Entrada, combate | Cada acción se aplica sólo en estados permitidos; pausa congela simulación. |
| P-04 | Vida, tiempos, daño, especiales y enfriamientos iniciales | [DOCUMENTACION.md](DOCUMENTACION.md), [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md); ajustable | Combate, balance | Los tres estudiantes pueden superar la campaña; valores configurables y documentados. |
| P-05 | Puntuación, bonos y descarte del intento perdido | [DOCUMENTACION.md](DOCUMENTACION.md); diseño adoptado | Campaña | No se acumulan puntos al repetir un intento perdido. |
| P-06 | Visor GUÍA, código GUÍA/GUIA, una carga por combate y desbloqueo local | [EASTER_EGG.md](EASTER_EGG.md); diseño adoptado | Archivo, combate, almacenamiento | Consulta ataque real; persiste el hallazgo, no la carga. |
| P-07 | Avisos visuales, foco, silencio, reducción de destellos y pausa por pestaña | [DOCUMENTACION.md](DOCUMENTACION.md); diseño adoptado | UI, combate, audio | Amenazas legibles sin sonido/color único y sin avance al ocultar pestaña. |
| P-08 | NULL impone cuatro validaciones por una regla defectuosa; se corrige en biblioteca | [LORE.md](LORE.md); diseño adoptado | Narrativa, campaña | Cuatro marcas, tres estudiantes presentes y final que restaura al asistente. |

## Recorrido narrativo único

| Acto y lugar | Estado de entrada | Duelo y registro | Estado de salida |
|---|---|---|---|
| 1. Estacionamiento | Cero marcas; NULL bloquea la ruta. | Chilo acepta un duelo amistoso; **NULL registra la primera marca**. | Se abre la cancha; Chilo apoya por radio. |
| 2. Cancha | Una marca; el marcador sigue la orden de NULL. | Vera participa voluntariamente para liberar el acceso; **NULL registra la segunda marca**. | Se abre el laboratorio; Vera pasa a aliada. |
| 3. Laboratorio | Dos marcas; CÁTODO-3 protege el registro. | El autómata vuelve a modo seguro; **NULL registra la tercera marca**. | Se conoce la falla y se abre la biblioteca. |
| 4. Biblioteca | Tres marcas; el avatar de NULL protege la recuperación. | Al vencerlo, **NULL registra la cuarta marca** y se detiene la rutina. | La recuperación queda editable; Alma corrige, Nadia explica el propósito y Diego asegura la reapertura. |

El estudiante elegido combate y tiene una línea propia; los tres conservan su función en las escenas. Una derrota no registra marca ni repite consecuencias de victoria. La **terminal de mantenimiento del Archivo** se puede abrir desde Cómo jugar y sólo desbloquea el Visor. La **terminal de recuperación de la biblioteca** se alcanza después de las tres primeras marcas y sólo se puede editar tras vencer a NULL. Son terminales diferentes.

## Decisiones de interpretación para producir el juego

| Tema | Decisión documentada | Límite de la decisión |
|---|---|---|
| WASD en arena lateral | A/D desplazan, W salta, S cubre/agacha. | Es propuesta de diseño; el requisito confirmado sólo especificó WASD como conjunto de control. |
| Obstáculos | Conos y bordes limitan el pasillo; balón, líneas de carrera, sensores y barrido son obstáculos/peligros jugables. Autos, mesones, estantes y personas de referencia son decorado sin colisión. | El tutorial no añade daño ambiental; las amenazas tienen aviso y respuesta. La ficha espacial 1.3 fijará cajas y zonas exactas. |
| Intentos | Hay tres derrotas permitidas para toda la campaña; **Reiniciar nivel** desde pausa cuenta como abandonar el intento actual. Si era el tercero, muestra Game Over. | No crea puntos ni marca de victoria. El contrato 1.2 fijará el orden de actualización. |
| Puntos al abandonar | **Menú** desde pausa, tras confirmación, abandona la campaña activa y descarta sus puntos no consolidados; conserva sólo récord ya guardado de una campaña terminada. | No afecta el desbloqueo opcional del Visor. El contrato 1.2 fijará la operación exacta. |
| Bono de tiempo | Usar segundos completos restantes (`floor`) al cerrar una victoria de nivel. | Parámetro de diseño ajustable; evita que fracciones de fotograma cambien puntos. |
| Guardado | No se exige autoguardado de campaña activa. Preferencias, récord y desbloqueo del Visor se definen por separado. | No se agrega PWA, móvil jugable ni guardado a mitad de golpe por sugerencias genéricas de perfiles. |

## Casos de aceptación documental

Estos IDs reservan futuros casos jugables; aquí sólo se comprueba que su requisito, dueño y resultado esperado estén escritos.

| ID | Revisión documental esperada | Requisitos |
|---|---|---|
| AT-01 | Nombre, género, tecnología y estado de Canvas/librerías clasificados correctamente. | C-01, C-02, P-02 |
| AT-02 | Tres opciones; identidades creativas no presentadas como confirmación original. | C-03, P-01 |
| AT-03 | WASD/R/Shift trazados; W/S/E/Esc etiquetados como diseño adoptado. | C-04, P-03 |
| AT-04 | Cuatro niveles y jefes en orden; Vera/CÁTODO-3 identificados como originales. | C-05, C-06, P-01 |
| AT-05 | Cada uno de los cuatro fondos finales declarado pixel art. | C-13 |
| AT-06 | Intentos, derrota, victoria, Game Over y reinicio con salida explícita. | C-07, C-08, C-10 |
| AT-07 | Obstáculos, colisiones, efectos, HUD e interfaz adaptable tienen dueño y resultado. | C-10, C-11, C-12 |
| AT-08 | Secreto opcional confirmado y forma concreta del Visor clasificada como diseño. | C-09, P-06 |
| AT-09 | NULL registra marcas por regla defectuosa y no controla mentes. | P-08 |
| AT-10 | Chilo/Vera participan voluntariamente; CÁTODO-3 y NULL mantienen sus roles; los tres estudiantes actúan. | P-01, P-08 |
| AT-11 | Archivo y terminal final tienen funciones separadas; Visor no abre niveles. | C-09, P-06, P-08 |

**Puerta 1.1:** los 13 requisitos confirmados y las ocho decisiones de diseño están clasificados, tienen dueño y resultado esperado. Las ambigüedades detectadas se resolvieron como decisiones documentadas, sin atribuirlas al creador. La revisión de esta página no equivale a haber probado el juego.
