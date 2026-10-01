# Chilos Fighters — easter egg del Archivo

**Estado:** contenido y reglas propuestos para la documentación *dentro del juego*. Este archivo revela la solución para quien produzca el juego. El secreto no está implementado todavía.

## Intención

Quien lea con atención **Cómo jugar → Archivo del recorrido** puede descubrir una herramienta de ayuda. El secreto recuerda que NULL fue creado para guiar, no para decidir quién merece avanzar. Encontrarlo es opcional: no entrega marcas, no abre niveles y no modifica el final.

## Recorrido del jugador

1. Desde el menú de inicio se abre **Cómo jugar** y luego **Archivo del recorrido**. Sus cuatro fichas se pueden leer desde el comienzo, sin revelar la resolución de la historia.
2. El encabezado da una pista de orden: «NULL tenía un oficio antes de los desafíos. Lee sus cuatro notas siguiendo la ruta del campus».
3. Cada ficha contiene un pequeño folio de mantenimiento. Las letras, leídas en el orden estacionamiento → cancha → laboratorio → biblioteca, forman **GUÍA**.
4. Al pie del Archivo hay una terminal con el campo **Palabra de mantenimiento** y el botón **Consultar**. Acepta `GUÍA` o `GUIA`, sin distinguir mayúsculas ni espacios a los lados.
5. La terminal entrega el **Visor GUÍA** y explica su uso. El desbloqueo queda disponible para campañas posteriores en ese navegador.

## Texto exacto de las fichas

Los folios deben parecer pequeñas anotaciones, pero sus letras tienen contraste suficiente y pueden leerse con teclado y lector de pantalla. Cada ficha muestra lugar, explicación breve y folio.

| Ficha | Texto visible para el jugador | Folio visible |
|---|---|---|
| 1 · Estacionamiento | «Chilo enseña el primer paso: observa la señal antes de acercarte. Los conos delimitan el duelo; los vehículos quedan fuera de la arena». | `M-01 · G` |
| 2 · Cancha | «Las líneas muestran por dónde vendrá Vera. Un salto a tiempo evita la carrera; mira también el regreso del balón». | `M-02 · U` |
| 3 · Laboratorio | «Los sensores de CÁTODO-3 se iluminan antes de activarse. La franja apagada marca el camino seguro». | `M-03 · Í` |
| 4 · Biblioteca | «Entre los estantes hay rutas para explorar. Ningún estudiante debe perder la libertad de elegir su camino». | `M-04 · A` |

El encabezado del Archivo y las fichas son la única pista necesaria. El jugador no tiene que encontrar un píxel invisible ni adivinar una combinación aleatoria.

La **terminal de mantenimiento del Archivo** consulta ayudas y no cambia el progreso. Es distinta de la **terminal de recuperación de la biblioteca**: esta última forma parte de la historia, se descubre tras el laboratorio y sólo permite editar la regla después de vencer a NULL.

## Mensajes de la terminal

| Situación | Texto mostrado |
|---|---|
| Campo vacío | «Escribe la palabra que describía el trabajo original de NULL». |
| Código incorrecto | «Registro no encontrado. Revisa los folios en el orden del recorrido». |
| Primer desbloqueo | «Función recuperada: Visor GUÍA. Puedes usarlo una vez por combate para anticipar un ataque». |
| Ya desbloqueado | «Visor GUÍA disponible. Durante un combate, pulsa E o selecciona su botón en el HUD». |

Un error no consume intentos, puntos ni tiempo. La terminal puede abrirse tantas veces como se quiera.

## Recompensa: Visor GUÍA

- **Disponibilidad:** una carga por combate, incluso cuando se repite un nivel después de perder. Aparece un indicador **Visor listo** o **Visor usado** en el HUD.
- **Activación:** tecla `E` o botón accesible del HUD. Si el jugador lo activa durante el aviso de un ataque, muestra el ataque actual y prolonga el aviso restante en 0,8 s. Si lo activa fuera de un aviso, muestra el siguiente ataque y prolonga su aviso en 0,8 s cuando comience.
- **Información:** nombre del patrón y respuesta concreta, por ejemplo «Carrera de línea · salta» o «Barrido final · entra en la franja marcada como SEGURA». La zona segura se marca con borde, símbolo y texto **SEGURA**, además del color; el área peligrosa se distingue con otra trama. Para ataques que se evitan con salto o distancia, el mensaje lo dice explícitamente.
- **Límites:** no causa daño, no evita golpes por sí mismo, no cambia puntuación, no detiene el reloj y no sustituye las señales normales de los jefes.
- **Predicción:** el Visor lee el siguiente ataque realmente programado. Si NULL cambia de fase antes de ejecutarlo, el mensaje se actualiza al nuevo patrón sin gastar otra carga.
- **Geometría dinámica:** si se consulta antes del aviso, el Visor muestra patrón y respuesta general. La dirección o franja segura exacta se añade cuando el aviso fija la geometría real; en el Barrido final de NULL, el lado seguro se elige en ese instante por la ruta alcanzable, nunca se inventa anticipadamente.
- **Persistencia:** guardar sólo el desbloqueo; el estado listo/usado se reinicia al comenzar cada combate. **Nueva partida** no borra el hallazgo. Borrar los datos locales del navegador sí lo reinicia.

El [contrato 1.5](FASE_1_5_ARCHIVO_Y_VISOR.md) define estados, orden temporal, cancelaciones y casos futuros. Si el almacenamiento falla, el Visor funciona en la sesión actual y la terminal informa que no podrá conservarse al recargar.

## Presentación y accesibilidad

La interfaz muestra una pequeña placa cian con un símbolo de brújula; no requiere un recurso visual nuevo para entenderse. El aviso se presenta como texto y marca en la arena; no depende del sonido ni de un destello. La terminal informa el error y el éxito con texto visible y anuncio accesible. El botón del HUD es navegable por teclado. En una futura versión táctil, el mismo botón sustituye a `E`.

## Casos que debe cubrir la futura implementación

1. Las cuatro letras aparecen en el orden correcto y la terminal acepta ambas grafías de la palabra.
2. El código incorrecto no altera progreso ni intentos.
3. El Visor funciona con los tres estudiantes y los cuatro jefes, y sólo una vez por combate.
4. La predicción coincide con el patrón y con la zona o acción segura de [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md).
5. El desbloqueo persiste al recargar; la carga se restaura en cada combate nuevo.
6. La campaña completa se puede terminar sin descubrir el secreto.
