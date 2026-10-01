# Fase 1.2 — contrato común de combate y datos

**Estado:** especificación inicial ajustable. Fuentes: [requisitos y canon](FASE_1_1_REQUISITOS_Y_CANON.md), [DOCUMENTACION.md](DOCUMENTACION.md) y [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md). Las geometrías específicas de cada patrón se cierran en la [subfase 1.3](PLAN_DESARROLLO.md). Este documento fija dueños, unidades y resultados para evitar reglas duplicadas.

## Dueños de estado y unidades

| Dueño | Datos y cambios permitidos | Salida para otros sistemas |
|---|---|---|
| Entrada | Teclas físicas, instantánea `pressed/held/released`, buffer limitado | Acciones abstractas, sin calcular daño ni puntos. |
| Simulación de combate | Reloj de duelo, posición, vida, defensas, colisiones, ataques y enfriamientos | Eventos de contacto, daño, cancelación y resultado; estado de lectura para HUD. |
| Campaña | Estudiante elegido, nivel, marcas, intentos, puntos consolidados y del intento | Estado de progreso y transición. Sólo campaña registra marcas y confirma puntos. |
| UI/Canvas/audio | Presentación del estado y eventos recibidos | Acciones de menú o reproducción; nunca altera directamente vida/puntos/cola. |
| Almacenamiento | Récord de campaña terminada, preferencias, desbloqueo del Visor | Lectura/escritura delimitada; no persiste combate ni carga del Visor. |

Coordenadas lógicas de **960 × 540 px**, origen arriba a la izquierda, `x` hacia la derecha y `y` hacia abajo. El punto de anclaje del actor es el centro de sus pies. Suelo inicial `y = 430`, corredor `x = 80…880`, jugador en `x = 210` y jefe en `x = 750`. Velocidad en `px/s`, tiempo en segundos del **reloj de simulación** y puntos/vida/daño en enteros. Paso fijo inicial `1/60 s`; pausar u ocultar pestaña congela el reloj y evita saltos de tiempo al reanudar. Todos estos números de juego son configurables y ajustables.

## Esquemas de datos, sin código implementado

| Entidad | Campos mínimos y significado |
|---|---|
| `FighterState` | `id`, `anchorPx`, `facing` (`-1` o `+1`), `velocityPxPerSec`, `grounded`, `bodyBox`, `hurtBox`, `hp`, `maxHp`, `invulnerableSec`, `actionState`. |
| `AttackPattern` | `patternId` estable, `owner`, `warningSec`, `activeSec` o regla de salida, `recoverySec`, `interAttackDelaySec`, forma/desplazamiento, `damage`, `category`, `blockable`, respuesta segura. |
| `AttackInstance` | `attackInstanceId` nuevo por ejecución, `patternId`, fase, tiempo transcurrido, origen, dirección, objetivos ya contactados. Un proyectil de Nadia tiene subidentificador propio. |
| `LevelConfig` | Lugar, jefe, vida máxima, límite de tiempo, secuencia de patrones, geometría de arena y recursos visuales. |
| `CampaignState` | `selectedFighterId`, `levelIndex`, marcas obtenidas, `attemptsRemaining`, `campaignScore`, `attemptScore`, estado terminal. |

Valores iniciales: vida de Alma/Diego/Nadia **100/120/85**, velocidades **240/204/288 px/s** y daño de R **10/12/8**; jefes **80/110/130/160** de vida; tiempos límite **150/210/270/360 s**. El golpe R alcanza **100 px desde el borde delantero del cuerpo**, está activo **0,12 s** y admite otro inicio tras **0,35 s**. Enfriamientos especiales **8/10/7 s**. Todos los valores de patrones y especiales restantes se toman de [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), con una sola tabla configurada para combate, HUD y Visor.

## Movimiento, volúmenes y ataque

- Cada actor tiene `bodyBox` sólido para suelo, límites y separación; `hurtBox` vulnerable unida a su pose; `attackBox` rectangular o circular sólo cuando el patrón está activo. Las cajas usan coordenadas locales reflejadas por `facing`, independientes del dibujo. Un rectángulo contacta sólo con **solapamiento positivo**; tocar bordes no causa daño.
- Los cuerpos no atraviesan el suelo ni los límites. Los fondos, autos, mesones y estantes no generan colisiones. Balón, pulso, sensor, línea de carrera y barrido sí son peligros declarados.
- El jefe recorre `INTER_ATTACK_DELAY → WARNING → ACTIVE → RECOVERY → INTER_ATTACK_DELAY`; la pausa global del juego no es `INTER_ATTACK_DELAY`. Cada aviso muestra nombre/forma antes de ACTIVE. El intervalo entre ataques empieza después de RECOVERY.
- Un `attackInstanceId` registra objetivos contactados. Un objetivo contactado durante una instancia activa no puede recibir daño de esa misma instancia después, aunque al primer contacto estuviera invulnerable. El balón de Vera conserva el mismo ID durante ida y vuelta. Tres proyectiles de Nadia tienen sub-ID distintos y pueden acertar cada uno una vez.
- El estudiante recibe **0,45 s de invulnerabilidad tras daño aplicado**. El jefe no adquiere esa invulnerabilidad genérica: así pueden impactar los tres proyectiles de Nadia; sigue protegido contra contactos duplicados de una misma instancia. El especial de Nadia puntúa +25 una vez por activación con al menos un impacto, aunque acierten varios proyectiles.
- `S` en suelo inmoviliza y multiplica por **0,30** el daño frontal o de proyectil. No protege zonas de suelo. `W` permite un salto por aterrizaje. Un `floorSensor` no acierta con los pies fuera del suelo; un `lowProjectile` o `lineRun` exige despeje de pies ≥30 px; el `fullFloorSweep` final de NULL sólo se evita dentro de la franja SEGURA, incluso al saltar. La cobertura no se acumula con la carga de Diego. Durante esa carga Diego multiplica por **0,40** el daño recibido; sólo una mitigación se aplica. Daño positivo reducido: `max(1, ceil(dañoBase × factor))`.
- El especial de Alma interrumpe una instancia del jefe sólo durante WARNING; esa instancia pasa a RECOVERY sin entrar en ACTIVE. Shift consume disponibilidad al iniciarse aunque falle. NULL termina el ataque en curso y su RECOVERY antes de activar la fase 2 al llegar a **80/160** de vida; después comienza nueva secuencia de tres ecos y barrido.

Los tamaños/offsets de cajas por luchador y pose, radio de la sombra de Chilo, gravedad/salto, tamaño/velocidad de proyectiles y anchos de zonas se fijan por arena y patrón en 1.3. Allí deben quedar como datos ajustables antes de construir el juego; este contrato no los oculta como valores implícitos.

## Orden único de resolución por paso

1. Entrada obtiene una instantánea de acciones; si se solicita pausa, congela el paso y descarta las demás pulsaciones de ese paso.
2. Combate procesa `visor` sobre el estado de aviso al inicio del paso, antes de avanzar el patrón; después integra movimiento/salto, limita posición y separa cuerpos.
3. Avanza la fase del patrón, mueve proyectiles y resuelve solapamientos.
4. Aplica daño y eventos mediante un solo camino. El objetivo queda marcado como contactado por esa instancia; la invulnerabilidad se inicia sólo si entró daño positivo.
5. Si el jefe llega a cero, resuelve **victoria**. Si en ese mismo paso también cae el estudiante o llega el reloj a cero, prevalece la victoria como decisión de diseño. Si el jefe sigue vivo y el estudiante llega a cero o se agota el tiempo, resuelve **derrota**. Un resultado terminal se emite una vez.
6. Campaña recibe el resultado terminal y actualiza una sola vez marcas, intentos, puntos y transición. UI y audio consumen el evento, sin recalcularlo.

La misma entrada y el mismo paso deben producir la misma secuencia de posición y daño. Pausar durante 60 pasos no cambia aviso, proyectil, invulnerabilidad, enfriamiento o reloj.

## Intentos y puntuación

Una campaña empieza con **3 intentos restantes**. Entrar a duelo no resta. Perder por vida, tiempo o **Reiniciar nivel** desde pausa consume exactamente uno y descarta `attemptScore`; con intentos restantes se repite el mismo nivel y ambas vidas se restauran, con cero se va a Game Over. Vencer registra una marca y confirma puntos una sola vez, sin consumir intento. Vencer al cuarto jefe lleva a Victoria. Menú confirmado desde pausa abandona la campaña activa y descarta sus puntos; récord previo y desbloqueo del Visor permanecen. Game Over y Victoria cuentan como campañas terminadas para comparar el récord; no se guarda un récord al abandonar por Menú.

`attemptScore = 10 × golpes normales acertados + 25 × especiales con ≥1 impacto`. En victoria de nivel: `levelScore = attemptScore + 500 + 5 × vidaRestante + floor(max(0, segundosRestantes))`; se suma una vez a `campaignScore`. Vida y segundos se capturan en el mismo paso de victoria. Una derrota no añade `attemptScore` a lo consolidado. La puntuación no altera marcas ni condición de victoria.

## Contrato de entrada de teclado

| Tecla física | Acción | Modo | Estado permitido |
|---|---|---|---|
| `KeyA` / `KeyD` | `moveX` -1/+1 | `held` | FIGHT |
| `KeyW` | `jump` | `pressed`, buffer máximo 100 ms | FIGHT |
| `KeyS` | `guard` | `held` | FIGHT |
| `KeyR` | `normalAttack` | `pressed`, buffer máximo 100 ms | FIGHT |
| `ShiftLeft` / `ShiftRight` | `specialTap` | pulso al soltar si no formó parte de `Shift+Tab` ni de otro atajo; buffer máximo 100 ms | FIGHT |
| `KeyE` o botón HUD | `visor` | `pressed`, sin buffer | FIGHT; combate valida desbloqueo/carga |
| `Escape` | `pauseToggle` | `pressed`, sin buffer | FIGHT/PAUSE sin diálogo modal |

`pressed` ocurre sólo en transición suelta→pulsada; se ignora repetición automática. `held` dura mientras se mantiene y `released` al soltar. **Shift se confirma al soltar** para distinguir la habilidad de `Shift+Tab`: si se pulsó Tab u otro atajo modificador durante esa retención, no genera `specialTap`. Las dos teclas Shift forman una acción lógica; soltar una mientras la otra sigue retenida no la activa. El buffer se consume una vez o caduca; se limpia al pausar, cambiar pantalla, perder foco o iniciar otro encuentro. Entrada no decide enfriamiento, daño o carga del Visor. En FIGHT, A+D se neutralizan; S en suelo domina movimiento y nuevo salto; Esc domina todo; si R y `specialTap` llegan en el mismo paso se intenta primero especial disponible y, si no, R, nunca dos ataques en un paso. E puede coexistir con movimiento. W puede coexistir con movimiento cuando no se cubre. La cobertura no cancela un ataque ya iniciado.

El foco en un campo editable, modal o terminal GUÍA reserva teclado para la interfaz; no se interceptan combinaciones Ctrl/Alt/Meta ni composición de texto. `Tab` conserva siempre el foco DOM y nunca recibe `preventDefault`. Sólo se evita el efecto del navegador para una tecla de juego efectivamente consumida. `blur`/pestaña oculta limpian estados y buffer, pausan y requieren reanudación explícita. Los escuchadores se instalan una vez y se retiran al desmontar. No se incluyen controles táctiles ni gamepad en esta versión.

**Puerta 1.2:** vida, daño, defensa, tiempo, intentos y puntos tienen un único dueño y orden de actualización; cada estado y salida terminal tiene regla explícita. Los valores de patrón/arena pendientes se transfieren a 1.3 como datos ajustables. Estas son especificaciones, no resultados de pruebas jugables.
