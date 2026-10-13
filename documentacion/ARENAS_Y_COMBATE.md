# Chilos Fighters — arenas y combate

**Estado:** reglas base del combate y valores iniciales de la implementación. Respeta los cuatro niveles, personajes, jefes y controles de [DOCUMENTACION.md](DOCUMENTACION.md). La IA vigente, sus probabilidades y los combos se detallan en [IA_JEFES_Y_BALANCE.md](IA_JEFES_Y_BALANCE.md); los números seguirán sujetos a ajuste al jugar una campaña completa.

## Reglas comunes

- **Vista:** arena lateral de una pantalla, resolución lógica de 960 × 540. El suelo está en `y = 430`; el corredor de combate va de `x = 80` a `x = 880`.
- **Velocidad horizontal inicial:** Alma recorre 240 px/s; Diego, 204 px/s; Nadia, 288 px/s. Equivale a las velocidades relativas 1,0 / 0,85 / 1,2 del documento principal. Para el barrido final, la franja segura se elige al empezar el aviso según la ruta alcanzable más corta. Con el cuerpo completo dentro, Diego recorre como máximo 138 px desde cualquier centro legal: unos 0,68 s de movimiento, dentro de un aviso de 1,50 s incluso al reservar reacción. Véase [FASE_1_3_FICHAS_ARENAS.md](FASE_1_3_FICHAS_ARENAS.md).
- **Aparición:** estudiante en `x = 210` y jefe en `x = 750`, ambos mirando hacia el centro. Después de cada golpe se mantienen dentro del corredor.
- **Fondo:** los cuatro escenarios finales deben ser pixel art, según el requisito confirmado por el creador. Las fotos del campus son referencias; los objetos reales que aparecen en ellas no generan colisiones por sí mismos.
- **Lectura de ataques:** toda amenaza muestra nombre, señal visual y sonido opcional antes del daño. El aviso permanece visible también con sonido desactivado. Un mismo ataque sólo puede golpear una vez.
- **Defensa:** `S` inmoviliza y reduce un 70 % el daño frontal o de proyectiles; no evita zonas de suelo. `W` permite un salto: los sensores de suelo no aciertan con los pies fuera del suelo, mientras los rasantes y carreras exigen al menos 30 px de despeje. El barrido final de NULL sólo se evita con el cuerpo completo en la franja SEGURA, incluso al saltar. Alejarse evita ataques de corto alcance.
- **Golpe normal:** `R` alcanza 100 px hacia el jefe; el ciclo dura 0,62 s (0,06 s de inicio, 0,14 s activo y 0,42 s de recuperación). Conserva el daño por personaje de la tabla principal. Tras recibir daño, el estudiante tiene 0,45 s de invulnerabilidad; cada proyectil de Nadia conserva su propio contacto.
- **Puntuación:** un golpe normal acertado suma 10 puntos; una habilidad especial acertada suma 25 por activación, aunque tenga varios proyectiles. Los puntos de un intento perdido se descartan.

### Habilidades especiales iniciales

| Estudiante | Efecto de Shift | Alcance | Enfriamiento |
|---|---|---:|---:|
| Alma | Pulso de circuito: 22 de daño e interrumpe un ataque durante su aviso. | 165 px | 8 s |
| Diego | Carga Chila: avanza hasta 110 px, causa 28 de daño y reduce un 60 % el daño recibido durante el avance. | 120 px tras avanzar | 10 s |
| Nadia | Ráfaga de notas: tres proyectiles de 8, 7 y 7 de daño; cada proyectil puede golpear una vez. | 220 px | 7 s |

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

| Jefe y ataque | Aviso | Activo del patrón | Recuperación | Daño | Alcance o zona | Respuesta esperada |
|---|---:|---:|---:|---:|---|---|
| Chilo — Aletazo frontal | 0,88 s | 0,20 s | 0,56 s | 16 | 125 px delante | Retroceder o cubrirse para reducir daño. |
| Chilo — Salto anunciado | 0,80 s | 0,24 s al caer | 0,62 s | 20 | Círculo de 112 px marcado bajo la caída | Salir del círculo antes de que caiga. |
| Chilo — Envión rompeguardia | 0,78 s | 0,22 s | 0,62 s | 22 | Golpe frontal de 142 px que avanza durante el aviso | Esquivar; la guardia no reduce este ataque. |
| Chilo — Picado de cresta (fase 2) | 0,72 s | 0,24 s al caer | 0,62 s | 24 | Círculo de 132 px marcado bajo la caída | Salir del círculo antes de que caiga. |
| Vera — Bote de retorno | 0,66 s | 0,01 s de emisión | 0,50 s | 18 | Proyectil rasante a 260 px/s; vida independiente tras salir | Saltar sobre ida y regreso o cubrirse para reducir daño. |
| Vera — Carrera de línea | 0,76 s | 0,36 s | 0,56 s | 23 | Franja recta marcada desde Vera | Saltar cuando se ilumina la línea. |
| Vera — Pase a media altura | 0,76 s | 0,01 s de emisión | 0,55 s | 21 | Proyectil dirigido a la altura del jugador al iniciar el aviso | Cambiar de posición o cubrirse. |
| Vera — Remate de línea (fase 2) | 0,72 s | 0,20 s | 0,62 s | 25 | Golpe frontal rompeguardia | Esquivar antes de que termine el aviso. |
| CÁTODO-3 — Pulso de luz | 0,66 s | 0,10 s de emisión | 0,50 s | 19 | Esfera rasante a 200 px/s; vuelo independiente | Saltar sobre el pulso o cubrirse para reducir daño. |
| CÁTODO-3 — Pulso de sobrecarga | 0,95 s | 0,10 s de emisión | 0,68 s | 25 | Esfera rasante a 245 px/s; vuelo independiente | Saltar o cubrirse; su trayectoria se anuncia antes del disparo. |
| CÁTODO-3 — Sensor izquierdo o derecho | 0,88 s | 0,44 s | 0,58 s | 22 | Una franja del laboratorio | Entrar en una franja apagada o saltar. |
| CÁTODO-3 — Descarga de proximidad (fase 2) | 0,68 s | 0,20 s | 0,64 s | 26 | Golpe frontal rompeguardia | Mantener distancia o esquivar durante el aviso. |
| NULL — Eco de Chilo | 0,88 s | 0,18 s | 0,42 s | 21 | 135 px delante; rompeguardia | Esquivar antes del impacto. |
| NULL — Eco de Vera | 0,72 s | 0,34 s | 0,46 s | 22 | Línea rasante marcada | Saltar como en la cancha. |
| NULL — Eco de CÁTODO-3 | 0,82 s | 0,42 s | 0,48 s | 23 | Franja de sensor marcada | Cambiar a la franja apagada o saltar. |
| NULL — Barrido final (fase 2) | 1,22 s | 0,55 s | 0,65 s | 28 | Toda la franja salvo la zona segura visible | Entrar con el cuerpo completo en la franja indicada; saltar no evita daño. |
| NULL — Sello de memoria (fase 2) | 0,92 s | 0,24 s | 0,58 s | 25 | Círculo de 148 px | Salir del círculo antes de la activación. |

Los proyectiles se emiten al terminar el aviso y conservan su propio ciclo de vida. El valor activo de 0,01–0,10 s describe la ventana de emisión del patrón, no el tiempo que tarda el proyectil en cruzar la arena.

### Orden y ritmo de los ataques

Cada jefe conserva su ataque inicial para enseñar la arena. Después elige entre sus patrones disponibles con pesos que cambian según distancia, guardia, salto reciente y avance del jugador; evita repetir los dos últimos patrones cuando existe otra opción. Hay una probabilidad limitada de que un ataque habilite **un solo seguimiento de combo**, con aviso propio y una pausa menor. El daño de combo se calcula con el multiplicador configurado para ese jefe.

El tiempo normal entre ataques parte de la pausa de la ficha y recibe una variación pequeña para que el ritmo no sea idéntico en cada ciclo. Las señales permanecen visibles durante los avisos y el Visor GUÍA consulta el ataque que la IA ya dejó planificado.

La vida y los umbrales de fase son: Chilo 100/62, Vera 136/82, CÁTODO-3 164/98 y NULL 204/108. Al cruzar el umbral, cada jefe termina su patrón en curso y luego avanza; anuncia la transición y abre su lista de fase 2. NULL incorpora el barrido y el Sello de memoria. Al iniciar cada barrido se fija el lado seguro alcanzable más cercano, que no cambia durante el aviso. El Visor actualiza su predicción a la secuencia planificada sin gastar otra carga.

## Revisión de balance prevista

Una campaña debe poder completarse con Alma, Diego o Nadia sin el Visor GUÍA. Si un ataque no deja tiempo suficiente para usar su respuesta prevista, se amplía el aviso antes de aumentar daño o velocidad. El nivel 1 enseña distancia y salto; los niveles siguientes reutilizan esas respuestas con señales distintas. Los números de este documento se revisarán con pruebas del combate, manteniendo como referencia tres intentos para cuatro jefes.
