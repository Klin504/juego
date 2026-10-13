# Referencias visuales y recursos del juego

El proyecto conserva dos grupos distintos: imágenes de referencia recibidas durante la fase de diseño y recursos pixel art que el juego carga desde `assets/`.

## Referencias originales de diseño

Las imágenes originales se guardan bajo `documentacion/referencias-visuales/originales/`; sirven para consultar el lugar y el concepto del personaje, no se cargan durante la partida.

| Nivel | Escenario | Ejemplo de referencia |
|---|---|---|
| 1 | Estacionamiento | [Foto frontal](<referencias-visuales/originales/nivel 1/WhatsApp Image 2026-09-30 at 1.31.28 PM.jpeg>) |
| 2 | Cancha | [Vista de la canasta](<referencias-visuales/originales/nivel 2/Captura de pantalla 2026-09-30 133430.png>) |
| 3 | Laboratorio de química | [Vista de los mesones](<referencias-visuales/originales/nivel 3/Captura de pantalla 2026-09-30 133804.png>) |
| 4 | Biblioteca | [Vista del mostrador](<referencias-visuales/originales/nivel 4/Captura de pantalla 2026-09-30 133116.png>) |

Hay cuatro imágenes del estacionamiento, cuatro de la cancha, tres del laboratorio y tres de la biblioteca. La carpeta también conserva una foto de Chilo y conceptos de Vera y CÁTODO-3. No se usan directamente como sprites; los escenarios en el juego son ilustraciones pixel art diseñadas para la resolución lógica de pantalla.

## Fondos activos del juego

| Nivel | Escenario | Fondo activo | Fondo anterior |
|---|---|---|---|
| 1 | Estacionamiento | [estacionamiento-v2.png](../assets/arenas/estacionamiento-v2.png) | [nivel-1.png](../assets/arenas/nivel-1.png) |
| 2 | Cancha | [cancha-v2.png](../assets/arenas/cancha-v2.png) | [nivel-2.png](../assets/arenas/nivel-2.png) |
| 3 | Laboratorio de química | [laboratorio-v2.png](../assets/arenas/laboratorio-v2.png) | [nivel-3.png](../assets/arenas/nivel-3.png) |
| 4 | Biblioteca | [biblioteca-v2.png](../assets/arenas/biblioteca-v2.png) | [nivel-4.png](../assets/arenas/nivel-4.png) |

Los fondos activos son PNG de 480×270 píxeles. Las versiones `*-v2.png` son las que se dibujan en el juego; los fondos `nivel-*.png` son versiones anteriores conservadas para comparar cambios.

## Hojas de personajes

| Personaje | Archivo |
|---|---|
| Alma | [alma.png](../assets/sprites/fighting-v4/alma.png) |
| Chilo | [chilo.png](../assets/sprites/fighting-v4/chilo.png) |
| Diego | [diego.png](../assets/sprites/fighting-v4/diego.png) |
| Nadia | [nadia.png](../assets/sprites/fighting-v4/nadia.png) |
| Vera | [vera.png](../assets/sprites/fighting-v4/vera.png) |
| CÁTODO-3 | [catodo3.png](../assets/sprites/fighting-v4/catodo3.png) |
| NULL | [null.png](../assets/sprites/fighting-v4/null.png) |

Cada hoja activa v4 mide 2170×725 píxeles y contiene ocho poses ilustradas en una fila con fondo transparente. Los cuadros se recortan con los límites de [fighting-atlas.js](../src/rendering/fighting-atlas.js), porque su altura cambia según el salto, ataque o derrota. Ese módulo conserva la proporción y el pivote en los pies al dibujar dentro de 128×160 píxeles lógicos; el suavizado está desactivado. Alma usa cobre y guantes mecánicos, Diego uniforme verde y vendas, Nadia comunicador y energía magenta, y Vera uniforme turquesa con líneas de cancha. Los jefes tienen siluetas propias: Chilo es un ave guardia con chaleco naranja; CÁTODO-3 es un autómata de monitor CRT; NULL combina capucha, cristal y vacío violeta. Las hojas v2 y v3 quedan en `assets/sprites/` como versiones anteriores. [asset-manifest.js](../src/rendering/asset-manifest.js) registra las rutas activas.

Las ocho columnas de las hojas v4 corresponden a reposo, desplazamiento, salto, golpe rápido, ataque especial, reacción al daño, guardia y pose final. Se crearon con generación de imágenes a partir de cada sprite anterior como referencia de identidad y de una hoja detallada común como referencia de acabado. Para reemplazar una hoja, mantén las ocho poses en una sola fila, el fondo transparente y las separaciones; si cambian la altura o las dimensiones, actualiza sus límites en `fighting-atlas.js` y los tamaños declarados en `asset-manifest.js`.

En el menú principal, las tarjetas de los tres estudiantes muestran su oficio, nombre y un motivo visual distinto. La pose de presentación usa la primera celda de cada hoja. La pantalla de selección amplía el mismo retrato y repite su motivo visual para conservar la identidad entre ambas vistas.

## Audio

La música y los efectos de combate se sintetizan con Web Audio API en tiempo real. No dependen de archivos externos. El navegador los activa después de la primera interacción del jugador.

## Añadir o reemplazar un recurso

1. Coloca el archivo final bajo `assets/arenas/` o `assets/sprites/`.
2. Actualiza las rutas correspondientes en [asset-manifest.js](../src/rendering/asset-manifest.js).
3. Conserva las referencias originales en `documentacion/referencias-visuales/originales/` para no mezclar fuentes con recursos de runtime.
4. Actualiza esta tabla con dimensiones y uso en juego.
