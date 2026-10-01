# Requisitos — Chilos Fighters

Este archivo resume los requisitos del creador. El diseño detallado está en [DOCUMENTACION.md](DOCUMENTACION.md), el canon narrativo en [LORE.md](LORE.md) y la presentación interactiva en `index.html`.

## Confirmado

- **Nombre:** Chilos Fighters.
- **Género:** lucha 2D con estética pixel art.
- **Tecnología:** HTML, CSS y JavaScript; se pueden usar librerías JavaScript si aportan valor al desarrollo.
- **Personajes:** tres estudiantes seleccionables.
- **Controles:** WASD para movimiento, **R** para golpe normal y **Shift** para habilidad especial. La asignación exacta de W/S dentro de una arena lateral está propuesta en la documentación.
- **Objetivo:** superar al rival de cada nivel y vencer al jefe final.
- **Niveles según las carpetas de imágenes recibidas:** 1) estacionamiento, 2) cancha, 3) laboratorio de química, 4) biblioteca.
- **Escenarios finales:** las imágenes de los cuatro escenarios deben tener estética pixel art. Las fotos y capturas recibidas sirven como referencia para adaptarlas.
- **Jefes definidos por el creador:** nivel 1, mascota de la UJCV; nivel 4, una IA. Se pidió crear los jefes 2 y 3.
- **Intentos:** el jugador dispone de tres intentos para la campaña.
- **Secreto en la documentación del juego:** incluir un easter egg opcional que permita descubrir y obtener una herramienta útil durante los combates. El tipo de herramienta y su efecto concreto son decisiones de diseño.

## Funciones requeridas

- Pantalla de inicio con botón **Iniciar**.
- Selección de personaje y personaje controlable durante el combate.
- Rivales, obstáculos, colisiones y efectos visuales.
- Barras de vida, sistema de puntuación e intentos restantes.
- Condiciones explícitas de victoria y derrota.
- Pantalla de **Game Over** y botón **Reiniciar**.
- Diseño con CSS, lógica con JavaScript e interfaz adaptable.

## Decisiones creativas adoptadas para la documentación

- Los protagonistas se llaman Alma Reyes, Diego Cruz y Nadia Solís.
- El primer jefe se llama **Chilo**, palabra visible en la camisa de la mascota fotografiada.
- El segundo jefe es **Vera «La Capitana» Pineda**, estudiante deportista de la cancha.
- El tercer jefe es **CÁTODO-3**, autómata ficticio de demostración del laboratorio.
- La IA final se llama **NULL**, tomando como inspiración el icono visible en varias capturas; se enfrenta al jugador en la biblioteca.
- W salta y S permite cubrirse; Esc pausa el juego.
- La campaña usa un estudiante elegido al inicio. Cada derrota consume un intento y repite el nivel; la victoria se logra al derrotar a la IA del nivel 4.
- Las fotos y capturas ya recibidas se usan como referencias para crear fondos pixel art que conserven los rasgos de cada lugar.
- El easter egg se ha desarrollado como **Visor GUÍA**: cuatro folios del Archivo forman una palabra que lo desbloquea. Su contenido y reglas están en [EASTER_EGG.md](EASTER_EGG.md).

Estas propuestas están marcadas para revisión en [DOCUMENTACION.md](DOCUMENTACION.md). La mención inicial de tres niveles se actualizó a **cuatro** y el orden se corrigió según los nombres de las carpetas `img/nivel 1/` a `img/nivel 4/`.

Las decisiones de detalle delegadas al diseño están en [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md) y [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md). Son propuestas de producción, no requisitos originalmente confirmados por el creador.

El orden de desarrollo y el uso de las guías de agentes están en [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md).
