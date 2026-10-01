# Chilos Fighters — arenas y combate

**Estado:** propuesta de diseño para producción. Respeta los cuatro niveles, personajes, jefes y controles de [DOCUMENTACION.md](DOCUMENTACION.md). Los valores numéricos son iniciales y se ajustarán cuando se pueda jugar una campaña completa.

## Reglas comunes

- **Vista:** arena lateral de una pantalla, resolución lógica de 960 × 540. El suelo está en `y = 430`; el corredor de combate va de `x = 80` a `x = 880`.
- **Velocidad horizontal inicial:** Alma recorre 240 px/s; Diego, 204 px/s; Nadia, 288 px/s. Equivale a las velocidades relativas 1,0 / 0,85 / 1,2 del documento principal. Para el barrido final, la franja segura se elige al empezar el aviso según la ruta alcanzable más corta. Con el cuerpo completo dentro, Diego recorre como máximo 138 px desde cualquier centro legal: unos 0,68 s de movimiento, dentro de un aviso de 1,50 s incluso al reservar reacción. Véase [FASE_1_3_FICHAS_ARENAS.md](FASE_1_3_FICHAS_ARENAS.md).
- **Aparición:** estudiante en `x = 210` y jefe en `x = 750`, ambos mirando hacia el centro. Después de cada golpe se mantienen dentro del corredor.
- **Fondo:** los cuatro escenarios finales deben ser pixel art, según el requisito confirmado por el creador. Las fotos del campus son referencias; los objetos reales que aparecen en ellas no generan colisiones por sí mismos.
- **Lectura de ataques:** toda amenaza muestra nombre, señal visual y sonido opcional antes del daño. El aviso permanece visible también con sonido desactivado. Un mismo ataque sólo puede golpear una vez.
- **Defensa:** `S` inmoviliza y reduce un 70 % el daño frontal o de proyectiles; no evita zonas de suelo. `W` permite un salto: los sensores de suelo no aciertan con los pies fuera del suelo, mientras los rasantes y carreras exigen al menos 30 px de despeje. El barrido final de NULL sólo se evita con el cuerpo completo en la franja SEGURA, incluso al saltar. Alejarse evita ataques de corto alcance.
- **Golpe normal:** `R` alcanza 100 px hacia el jefe; tiene 0,12 s activos y 0,35 s entre usos. Conserva el daño por personaje de la tabla principal. Tras recibir daño, el estudiante tiene 0,45 s de invulnerabilidad; el jefe usa identificadores de ataque para impedir contactos duplicados sin anular los tres proyectiles de Nadia.
- **Puntuación:** un golpe normal acertado suma 10 puntos; una habilidad especial acertada suma 25 por activación, aunque tenga varios proyectiles. Los puntos de un intento perdido se descartan.

### Habilidades especiales iniciales

| Estudiante | Efecto propuesto de Shift | Alcance | Enfriamiento |
|---|---|---:|---:|
| Alma | Pulso de circuito: 18 de daño e interrumpe un ataque durante su aviso. | 165 px | 8 s |
| Diego | Carga Chila: avanza hasta 110 px, causa 24 de daño y reduce un 60 % el daño recibido durante el avance. | 120 px tras avanzar | 10 s |
| Nadia | Ráfaga de notas: tres proyectiles de 6 de daño cada uno; cada proyectil puede golpear una vez. | 220 px | 7 s |

## Plano funcional de las cuatro arenas

Las coordenadas son de juego, no una afirmación sobre la disposición exacta de las fotografías. La primera versión debe conservar un pasillo despejado para que ambos luchadores se crucen.

| Nivel | Distribución y obstáculos | Zona segura y lectura visual |
|---|---|---|
| 1. Estacionamiento | Conos en `x = 80` y `x = 880` indican los límites. Autos, palmeras y fachada quedan en segundo plano. No hay daño ambiental en el tutorial. | El suelo completo es seguro mientras Chilo no ataca. Una sombra bajo su salto anticipa el punto de caída. |
| 2. Cancha | Canasta, cerca y gradas forman el fondo. Una línea luminosa en el piso indica el recorrido de la carrera de Vera; el balón rebota una vez antes de regresar. | Saltar evita la carrera y el balón rasante. La línea y la trayectoria del balón aparecen antes del contacto. |
| 3. Laboratorio | Mesones, fregaderos y material didáctico son fondo sin colisión. Dos franjas de sensores simulados ocupan `x = 260–380` y `x = 580–700`; se activan alternadamente. | La franja inactiva y el espacio entre ambas permanecen seguros. El barrido muestra una cuenta visual durante su aviso; saltar también lo evita. |
| 4. Biblioteca | Estantes, mostrador y terminal quedan detrás del corredor. NULL se proyecta sobre la arena. En la segunda fase, el barrido final ilumina casi todo el suelo. | El barrido deja una franja segura visible a la izquierda (`x = 120–360`) o a la derecha (`x = 600–840`). Al iniciar el aviso se fija la zona que el estudiante puede alcanzar por la ruta libre más corta; sólo en empate alterna. La señal muestra **SEGURA** y permanece durante el aviso. |

## Fichas de jefes

**Términos:** *aviso* = tiempo para reconocer la señal; *activo* = intervalo en que puede causar daño; *recuperación* = pausa antes del siguiente movimiento. Los daños se aplican antes de la reducción por defensa. Cada jefe respeta la vida y el límite de tiempo de [DOCUMENTACION.md](DOCUMENTACION.md).

| Jefe y ataque | Aviso | Activo | Recuperación | Daño | Alcance o zona | Respuesta esperada |
|---|---:|---:|---:|---:|---|---|
| Chilo — Aletazo frontal | 1,15 s | 0,18 s | 0,65 s | 12 | 125 px delante | Retroceder o cubrirse para reducir daño. |
| Chilo — Salto anunciado | 1,00 s | 0,25 s al caer | 0,85 s | 16 | Círculo de **100 px de diámetro** marcado bajo la caída | Salir de la sombra antes de que caiga. |
| Vera — Bote de retorno | 0,80 s | Hasta que el balón sale de la arena tras un rebote | 0,65 s | 15 | Proyectil rasante a 260 px/s | Saltar sobre su ida y su regreso, o cubrirse para reducir daño. |
| Vera — Carrera de línea | 0,95 s | 0,40 s | 0,75 s | 20 | Franja recta marcada desde Vera | Saltar cuando se ilumina la línea. |
| CÁTODO-3 — Pulso de luz | 0,85 s | Hasta que el pulso sale de la arena | 0,70 s | 16 | Esfera a 200 px/s | Saltar sobre el pulso o cubrirse para reducir daño. |
| CÁTODO-3 — Barrido de sensores | 1,15 s | 0,50 s | 0,80 s | 19 | Una de las dos franjas del laboratorio | Entrar en una franja apagada o saltar. |
| NULL — Eco de Chilo | 1,20 s | 0,20 s | 0,55 s | 18 | 135 px delante | Reconocer el gesto de Chilo y retroceder. |
| NULL — Eco de Vera | 0,90 s | 0,40 s | 0,60 s | 19 | Línea rasante marcada | Saltar como en la cancha. |
| NULL — Eco de CÁTODO-3 | 1,15 s | 0,50 s | 0,65 s | 20 | Franja de sensor marcada | Cambiar a la franja apagada o saltar. |
| NULL — Barrido final | 1,50 s | 0,60 s | 0,90 s | 24 | Columna de juego salvo la franja segura visible | Entrar con el cuerpo completo en la franja indicada antes de la activación; saltar fuera de ella no evita daño. |

### Orden y ritmo de los ataques

| Jefe | Secuencia inicial | Pausa entre ataques | Cambio de fase |
|---|---|---:|---|
| Chilo | Aletazo → salto → repetir | 2,4 s | Ninguno; el primer aletazo sirve de tutorial. |
| Vera | Bote → carrera → repetir | 2,1 s | Ninguno; el balón siempre rebota una vez. |
| CÁTODO-3 | Pulso → barrido izquierdo → pulso → barrido derecho | 1,9 s | Ninguno; nunca activa las dos franjas a la vez. |
| NULL | Eco de Chilo → Vera → CÁTODO-3 → repetir | 1,8 s | Al llegar a 80 de 160 de vida, añade el barrido final después de cada tres ecos y reduce la pausa a 1,5 s. |

El tiempo de *pausa entre ataques* comienza después de la recuperación. NULL nunca encadena un eco y el barrido final sin mostrar dos avisos separados. Si el Visor GUÍA está activo, su predicción debe coincidir con el siguiente ataque de esta secuencia.

Cuando NULL llega a 80 de vida durante un aviso o ataque, termina esa acción y su recuperación antes de cambiar de fase. A continuación inicia una nueva secuencia de tres ecos y barrido final. Al iniciar cada barrido se fija el lado seguro alcanzable más cercano; no cambia durante el aviso. El Visor actualiza su predicción a la secuencia real si estaba pendiente, sin gastar otra carga.

## Revisión de balance prevista

Una campaña debe poder completarse con Alma, Diego o Nadia sin el Visor GUÍA. Si un ataque no deja tiempo suficiente para usar su respuesta prevista, se amplía el aviso antes de aumentar daño o velocidad. El nivel 1 enseña distancia y salto; los niveles siguientes reutilizan esas respuestas con señales distintas. Los números de este documento se revisarán con pruebas del combate, manteniendo como referencia tres intentos para cuatro jefes.
