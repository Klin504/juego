# IA de jefes y balance de combate

**Estado:** sistema implementado con una curva más exigente. Los valores son una base de balance; todavía requieren partidas manuales para calibrarse.

Esta guía explica las decisiones de la IA, las fases, los ataques y las respuestas disponibles. Complementa [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md) y [ARQUITECTURA_DEL_CODIGO.md](ARQUITECTURA_DEL_CODIGO.md). Las fichas de datos en `src/combat/` son la fuente de verdad para los valores numéricos.

## Bucle de decisión

1. `CombatSystem` inicia y avanza el golpe normal, los especiales y los proyectiles del jugador.
2. Antes de resolver el daño, recoge las hitboxes que están activas. Para golpes y especiales, estima el recorrido de la hitbox durante los próximos **0,14 s** según el movimiento del jugador; para proyectiles considera su posición y un paso futuro de **0,12 s**.
3. `EnemyCombatant` entrega amenazas y acciones recientes a `BossAI`. La IA elige una esquiva posible, decide el desplazamiento lateral y pondera los patrones siguientes.
4. Si la amenaza se cruza con el jefe y la esquiva está disponible, el jefe se mueve fuera de la trayectoria. Si estaba anunciando un ataque, cancela ese aviso de forma explícita, restablece el movimiento propio del patrón y aplica una breve recuperación.
5. Después se resuelven daño, guardia, invulnerabilidad, proyectiles y el resultado del combate. Durante la esquiva el jefe no recibe daño.

La IA se desplaza cuando no está ejecutando un patrón y puede reaccionar durante `warning`; no interrumpe una ventana activa ni la recuperación, para mantener la lectura de los ataques. En una misma amenaza, el identificador de ataque evita intentos de esquiva repetidos. La esquiva compara ambos lados, busca espacio dentro de los límites de la arena y tiende a alejarse del jugador.

## Cómo responde al jugador

- Recuerda salto durante **1,8 s**, guardia durante **0,7 s**, el golpe normal durante **0,9 s** y el especial durante **1,1 s**. También detecta si el jugador avanza hacia el jefe.
- Registra una racha de hasta cinco golpes normales. Repetir R no mantiene una lluvia de golpes: el ciclo normal del jugador dura **0,62 s** (0,06 s de inicio, 0,14 s activa y 0,42 s de recuperación). El jefe eleva su prioridad de esquiva al notar esa racha y aumenta la probabilidad de responder con combo.
- Cada patrón puede declarar respuestas preferidas a guardia, salto, avance, golpes o especiales. Esas etiquetas cambian sus pesos de selección; no fuerzan una respuesta única.
- El selector evita los dos patrones recientes siempre que haya alternativas. La primera secuencia conserva el ataque de presentación definido en cada ficha.
- Los combos son limitados a un seguimiento, con aviso propio y multiplicador por jefe. Aumentan frente a acciones repetidas, pero no se encadenan en una cadena infinita.
- Las fases cambian al cruzar el umbral de vida y terminar el patrón en curso. El juego anuncia el cambio durante **1,5 s**, incorpora patrones nuevos o acorta pausas y eleva la agresión de la IA.

Los especiales del jugador tienen recuperación entre **7 y 10 s**, según el estudiante. El Visor GUÍA conserva el límite de un uso por combate. Alternar golpes, movimiento, salto, guardia y especial forma parte del contrajuego; permanecer frente al jefe y repetir el mismo botón aumenta el riesgo.

## Movimiento y reacción por jefe

Los rangos se miden entre los bordes de los cuerpos. Velocidades y probabilidades son valores base de fase 1; la segunda fase eleva la agresión y acelera la recuperación del enfriamiento de esquiva.

| Jefe | Vida | Rango | Velocidad | Esquiva base | Enfriamiento base | Umbral de fase 2 |
|---|---:|---:|---:|---:|---:|---:|
| Chilo | 100 | 82–168 px | 124 px/s | 70 % | 0,98 s | 62 HP |
| Vera | 136 | 132–246 px | 110 px/s | 70 % | 0,80 s | 82 HP |
| CÁTODO-3 | 164 | 112–214 px | 94 px/s | 72 % | 0,74 s | 98 HP |
| NULL | 204 | 112–228 px | 126 px/s | 84 % | 0,58 s | 108 HP |

Una racha normal suma hasta **20 puntos porcentuales** a la esquiva, un especial suma 12, un proyectil suma 6 y la segunda fase agrega 8. El resultado se limita a 90 %. La probabilidad efectiva también depende de que el enfriamiento haya terminado y de que la trayectoria amenace el cuerpo del jefe; estos valores no significan que esquive cada ataque.

## Fases y patrones

| Jefe | Fase 1 | Fase 2 | Ataques y respuesta principal |
|---|---|---|---|
| **Chilo** | Aletazo, salto anunciado y envión; pausa base 1,32 s. | Añade **Picado de cresta** y baja la pausa a 0,82 s. | Aletazo: 16. Salto: 20 en círculo de 112 px. Envión rompeguardia: 22; esquívalo hacia un lado durante el aviso. Picado: 24 en círculo de 132 px; sal del círculo antes del aterrizaje. La práctica inicial sigue sin ataques. |
| **Vera** | Bote de retorno, carrera de línea y pase a media altura; pausa 1,25 s. | Añade **Remate de línea** y baja la pausa a 0,74 s. | Bote: 18; salta o cúbrete y sigue su recorrido de ida y vuelta. Pase: 21; muévete de la línea o cúbrete. Carrera: 23; salta la franja baja. Remate rompeguardia: 25; esquiva antes de que termine el aviso. |
| **CÁTODO-3** | Pulso, sobrecarga y sensores; pausa 0,98 s. | Añade **Descarga de proximidad** y baja la pausa a 0,62 s. | Pulso: 19 y sobrecarga: 25; salta o cubre el proyectil rasante. Sensor: 22; sal de la franja activa. Descarga rompeguardia: 26; evita quedarse pegado al robot. El vuelo del proyectil ya no bloquea al jefe durante todo el trayecto. |
| **NULL** | Ecos de Chilo, Vera y CÁTODO-3; pausa 0,82 s. | Añade **Barrido final** y **Sello de memoria**, y baja la pausa a 0,56 s. | Ecos: 21, 22 y 23. Barrido: 28 y exige alcanzar la franja segura anunciada. Sello: 25 dentro de un círculo de 148 px; sal de la zona. El eco de Chilo rompeguardia. NULL busca una zona alcanzable para su barrido antes de anunciarlo. |

Los combos de cada ficha elevan el siguiente daño con su multiplicador, hasta 1,28 para NULL. Los avisos conservan una oportunidad de lectura antes del impacto; los patrones no deben volverse más difíciles ocultando su zona o eliminando su respuesta.

## Pantallas de progresión y cierre

La introducción del nivel usa el fondo pixel art de la arena, el retrato del estudiante y del jefe, el objetivo y el contexto de la pelea. Tras una victoria intermedia, la tarjeta confirma el nivel, la marca, los intentos y la puntuación, y anticipa el rival siguiente. La tarjeta de reintento mantiene la arena y comunica que se repite el duelo.

Al terminar la campaña, la pantalla final presenta el epílogo de NULL, al luchador escogido y a los cuatro jefes derrotados, junto con la puntuación y el récord local. Los retratos se dibujan desde las mismas hojas pixel art y con suavizado desactivado.

## Ajuste de dificultad

Al calibrar una pelea, cambiar los valores en este orden:

1. Confirmar que cada aviso identifica su zona y que la respuesta sugerida funciona.
2. Ajustar la esquiva para que sea una respuesta ocasional y visible, no inmunidad constante ni un bloqueo de la IA.
3. Variar patrones y pausa entre ataques para evitar ciclos repetidos, conservando espacio para reaccionar.
4. Ajustar daño y multiplicador de combo si la respuesta ya se entiende y la pelea todavía resulta demasiado fácil o castigadora.
5. Repetir cada pelea con Alma, Diego y Nadia, porque su vida, alcance y especial cambian el balance.

El registro de números es una base implementada, no evidencia de dificultad definitiva: falta validar manualmente las cuatro peleas con los tres estudiantes y ajustar por duración, daño recibido, ataques esquivados y rutas de victoria. No se debe cerrar el balance con una sola partida ni sólo con una simulación.

## Puntos de ajuste en el código

- `src/combat/boss-ai.js`: memoria de acciones, pesos de patrón, esquiva, historial, agresión y pausas.
- `src/combat/enemy-combatant.js`: fases, avisos, cancelación por esquiva, combos y temporización compartida.
- `src/combat/combat-system.js`: amenazas, proyección breve de hitboxes, telegráficos, daño y resultado.
- `src/combat/*-data.js` y `src/combat/combat-config.js`: vida, rangos, ataques, pausas y umbrales por jefe.
- `src/rendering/character-renderer.js`: poses, retratos pixel art y señal visual de cambio de fase.
- `src/ui/menu-ui.js` y `src/campaign/campaign-ending.js`: guía, pantallas entre niveles y cierre narrativo.

El juego conserva Canvas 2D, módulos ES y Web Audio API; la dificultad se implementa en los sistemas existentes sin añadir un motor externo.
