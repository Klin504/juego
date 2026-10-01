# Chilos Fighters — pantallas, recursos y revisión

**Estado:** propuesta de producción. Este documento define textos y criterios para el juego futuro; no representa pantallas ni recursos ya implementados.

## Recorrido de pantallas

| Pantalla | Texto principal propuesto | Acciones y destino |
|---|---|---|
| Inicio | «Cuatro duelos. Una ruta que debe volver a ser libre». | **Iniciar** → Selección; **Cómo jugar** → Controles y Archivo; **Sonido** → preferencia. |
| Cómo jugar | «Observa las señales, elige cuándo atacar y conserva tus tres intentos». | Muestra WASD, R, Shift, Esc y E si el Visor está obtenido; **Archivo del recorrido** → fichas; **Volver** → Inicio. |
| Archivo | «NULL tenía un oficio antes de los desafíos. Lee sus cuatro notas siguiendo la ruta del campus». | Cuatro fichas y terminal descritas en [EASTER_EGG.md](EASTER_EGG.md); **Volver** → Cómo jugar. |
| Selección | «Elige quién lidera; los tres estudiantes participan en la historia». | Tres tarjetas con rol, vida, velocidad y habilidad; **Elegir** → Introducción del nivel 1. |
| Introducción | Nombre del lugar, jefe y una línea de objetivo del nivel. Tras derrota con intentos restantes, variante breve «Reintentar» sin repetir escenas ya vistas. | **Continuar** → Combate; **Volver** → Selección sólo antes del primer nivel; **Reintentar** → mismo duelo. |
| Combate | HUD con ambas vidas, tiempo, nivel, puntuación, intentos, habilidad especial y estado del Visor. | Esc → Pausa; victoria → Resultado o Victoria; derrota → Reintento o Game Over. |
| Pausa | «Combate en pausa». | **Continuar**; **Reiniciar nivel** abre confirmación con Cancelar enfocado, consume un intento al confirmar y lleva a Game Over si era el tercero; **Menú** confirma el abandono y descarta la puntuación de la campaña actual, no el récord previo. Escape cancela primero el diálogo abierto. |
| Resultado | «Marca obtenida» y la pista del siguiente lugar. | **Siguiente nivel** → Introducción; muestra puntos ganados y vida restante. |
| Game Over | «La ruta sigue cerrada. Puedes intentarlo de nuevo». | **Reiniciar campaña** → Selección; **Menú** → Inicio. |
| Victoria | «NULL vuelve a guiar. El recorrido queda abierto para todos». | Muestra personaje elegido, puntuación y línea final de [LORE.md](LORE.md); **Jugar de nuevo** → Selección; **Menú** → Inicio. |

### Introducciones breves por nivel

| Nivel | Objetivo visible antes del duelo | Mensaje tras vencer |
|---|---|---|
| Estacionamiento | «Practica los controles con Chilo y obtén la marca inicial». | «NULL registra la primera marca. La cancha espera». |
| Cancha | «Lee las líneas del suelo y gana el pase de Vera». | «NULL registra la segunda marca y abre el laboratorio; Vera mantiene despejado el paso». |
| Laboratorio | «Evita los sensores de CÁTODO-3 y recupera el registro». | «El registro señala la terminal de la biblioteca». |
| Biblioteca | «Detén la rutina de NULL para abrir la copia de recuperación». | «La regla defectuosa puede corregirse». |

La línea que pronuncia el luchador elegido se puede tomar de las líneas finales ya definidas en [LORE.md](LORE.md). Las viñetas presentan hasta tres líneas de diálogo a la vez, como establece el guion.

## Dirección de arte propuesta

**Requisito confirmado por el creador:** las imágenes finales de los cuatro escenarios deben tener estética pixel art. Se crearán a partir de las fotos y capturas recibidas, conservando los rasgos reconocibles de cada lugar descritos en [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md), sin reproducir matrículas, rótulos de la interfaz del recorrido ni personas identificables. Las fotos siguen siendo referencias del proyecto.

| Recurso | Diseño inicial y lectura en pantalla | Estado actual |
|---|---|---|
| Alma | Chaqueta cian con motivo de circuito y silueta equilibrada; su pulso usa un aro claro. | Nombre y rol documentados; falta arte del personaje. |
| Diego | Chaqueta naranja y postura ancha; la carga se reconoce por una estela horizontal. | Nombre y rol documentados; falta arte del personaje. |
| Nadia | Acentos violetas y silueta ligera; sus notas son tres proyectiles pequeños y separados. | Nombre y rol documentados; falta arte del personaje. |
| Chilo | Cabeza blanca de ave, pico amarillo y ropa azul según la foto recibida. | Foto de referencia recibida; falta sprite. |
| Vera | Uniforme azul marino y turquesa, balón y postura atlética según el concepto. | Concepto recibido; falta sprite. |
| CÁTODO-3 | Cuerpo blanco y azul, visor y bobinas cian según el concepto. | Concepto recibido; falta sprite. |
| NULL | Núcleo geométrico violeta con bordes cian, sin rostro humano; cambia de contorno al pasar a la segunda fase. | Nombre y motivo documentados; falta diseño original de combate. |
| Arenas | Cuatro fondos de 960 × 540 con una zona central despejada y señales sobre una capa separada. | Hay fotos y capturas; faltan fondos finales. |

**Guía inicial de sprites:** reservar cajas de hasta 64 × 96 píxeles lógicos para estudiantes y hasta 96 × 112 para jefes, con variación si la silueta lo necesita. Cada luchador requiere reposo, movimiento, salto, golpe, especial, daño y derrota. Registrar para cada archivo su autor, origen, permiso de uso, versión y estado. Estas dimensiones son una guía de legibilidad, no un límite del dibujo final.

## Sonido y señales accesibles

| Momento | Sonido propuesto | Señal visual equivalente |
|---|---|---|
| Menú y selección | Confirmación breve, sin música obligatoria. | Cambio de foco y selección marcada. |
| Aviso de ataque | Motivo distinto para ataque frontal, proyectil y barrido. | Nombre del ataque, forma de la zona y cuenta de aviso. |
| Golpe recibido | Impacto corto. | Barra de vida, número de daño y sacudida opcional. |
| Visor GUÍA | Tono ascendente breve. | Placa de texto con patrón y respuesta; borde y símbolo sobre la zona segura. |
| Victoria o derrota | Motivos breves diferentes. | Título y resumen del resultado. |

El sonido empieza sólo después de una acción del jugador. Hay control de volumen y silencio, opción de reducir destellos y movimiento, texto legible sobre los fondos y foco visible para todas las acciones de menú. Nunca se comunica una zona peligrosa sólo con color o sonido. Si se considera una versión táctil, tendrá botones equivalentes para todas las acciones antes de llamarla jugable en móvil.

## Revisión futura del diseño

Cuando exista una versión jugable, estas situaciones permitirán revisar si las reglas documentadas funcionan:

1. Completar las cuatro arenas con cada estudiante sin depender del Visor GUÍA.
2. Perder un nivel, comprobar que se consume un intento y que la puntuación de ese intento no se acumula al repetirlo.
3. Perder el tercer intento y llegar a Game Over; reiniciar debe iniciar una campaña nueva.
4. Reconocer cada ataque mediante su aviso visual, con sonido desactivado y con destellos reducidos.
5. Obtener el Visor mediante las cuatro fichas, usarlo una vez por combate y comprobar que su predicción coincide con el jefe y la fase actuales.
6. Recargar después de obtener el Visor: el hallazgo permanece, mientras su carga se reinicia al entrar en un combate nuevo.
7. Abrir todas las pantallas con teclado y comprobar que el foco permanece visible y el texto cabe en una pantalla estrecha.
