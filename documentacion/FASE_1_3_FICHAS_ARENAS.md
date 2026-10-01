# Fase 1.3 — cuatro fichas espaciales de arenas

**Estado:** planos y valores iniciales ajustables; esta subfase no creó recursos. Fuentes: [contrato de combate](FASE_1_2_COMBATE_Y_DATOS.md), [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md). La arena lógica mide 960 × 540 px, suelo `y = 430`, corredor de centros `x = 80…880` antes de limitar por semiancho de cuerpo; aparición estudiante `(210,430)` y jefe `(750,430)`. Las fotos/capturas son referencias para **cuatro fondos finales pixel art**; los conceptos de Vera y CÁTODO-3 se inventarían sin sustituir los sprites.

## Geometría y salto comunes

| Dato ajustable | Valor inicial | Función |
|---|---:|---|
| `bodyBox` de estudiante | 36 × 84 px, centrada en ancla de pies | Límite, suelo y separación. |
| `hurtBox` de estudiante | 32 × 78 px, centrada en ancla de pies | Recepción de golpes. |
| `bodyBox` de jefe | Chilo 56 × 96; Vera 44 × 88; CÁTODO-3 52 × 92; NULL 56 × 96 px | Separación. La proyección de NULL mantiene cuerpo sólido para ser golpeable; la ruta segura final no lo cruza. |
| `hurtBox` de jefe | Chilo 50 × 88; Vera 40 × 82; CÁTODO-3 48 × 86; NULL 52 × 88 px | Recepción de golpes; no sustituye la silueta del sprite. |
| Salto del estudiante | impulso inicial `−600 px/s`, gravedad `1200 px/s²` | Arco inicial de 1,00 s en aire y ápice de 150 px; **propuesta**, ajustar con animación y juego. |
| Despeje mínimo para rasantes | pies elevados al menos 30 px | Con el arco inicial, se supera de aprox. `t=0,053` a `t=0,947` después del despegue: ventana de 0,894 s para activos de hasta 0,60 s, si se sincroniza el salto. |

El actor se limita por el **borde de `bodyBox`**, no sólo por su ancla. Con semiancho de 18 px, los centros legales del estudiante son `x = 98…862`. Ataques se dibujan según su volumen real; ni los sprites ni el decorado deciden colisión. Los cuerpos se separan sin daño por simple solapamiento. Cada zona activa usa el `attackInstanceId` del [contrato 1.2](FASE_1_2_COMBATE_Y_DATOS.md).

## Nivel 1 — estacionamiento y Chilo

**Bloqueo:** cono izquierdo en `x=80`, cono derecho en `x=880`; son indicadores de los límites sólidos, no trampas. Adoquines, fachada, palmeras y vehículos van detrás del corredor, sin matrícula legible ni colisión. No hay daño ambiental independiente de Chilo. Chilo empieza en `x=750`, vida 80 y límite inicial 150 s.

| Patrón y `patternId` | Zona fijada al iniciar WARNING | Aviso → activo → recuperación → intervalo | Respuesta y cuenta con Diego |
|---|---|---|---|
| Aletazo `CHILO_WING` | Chilo fija posición/orientación; rectángulo frontal de 125 px desde borde del cuerpo, `y=335…425`; ala elevada, trama y nombre. | **1,15 → 0,18 → 0,65 → 2,4 s**. Daño 12, categoría frontal; S reduce a 4. | Desde contacto cercano, el centro del estudiante sale de la zona recorriendo aprox. 125 px: `0,25 reacción + 125/204 + 0,15 margen = 1,013 s < 1,15`. También puede cubrirse para reducir daño. |
| Salto anunciado `CHILO_JUMP` | Destino fijado al aviso, hacia la posición del estudiante y limitado a 280 px desde Chilo; sombra circular de **100 px de diámetro** (radio 50) que no sigue al jugador. | **1,00 → 0,25 al aterrizar → 0,85 → 2,4 s**. Daño 16, categoría aterrizaje; S no mitiga. | Con radio 50, semiancho vulnerable 16 y margen 4, desplazar el centro 70 px: `0,25 + 70/204 + 0,15 = 0,743 s < 1,00`. Cerca de borde se huye hacia el centro. |

El primer aletazo se anuncia al entrar Chilo en distancia de combate (frentes a ≤250 px); un rótulo tutorial precede el inicio del ciclo. Luego alterna aletazo → salto. Durante el arco de Chilo no hay daño ni empuje; al aterrizar se aplica sólo el volumen anunciado y se separan cuerpos. **Capas pixel art:** cielo/fachada/palmeras → vehículos estilizados → adoquines → conos → señales dinámicas → luchadores/sombra/efectos → HUD separado.

## Nivel 2 — cancha y Vera

**Bloqueo:** suelo y bordes; cerca, canasta, gradas y líneas pintadas son decorado. Las líneas de ataque dinámicas deben contrastar con las líneas permanentes. Vera empieza en `x=750`, vida 110 y límite 210 s.

| Patrón y `patternId` | Geometría y secuencia | Aviso → activo → recuperación → intervalo | Respuesta |
|---|---|---|---|
| Bote de retorno `VERA_BALL` | Balón de radio 12 px, centro `y=412`, nace delante de Vera, viaja a 260 px/s hacia el borde opuesto, rebota **una vez** y sale por el borde de origen. Ida, rebote y regreso se señalan antes de lanzarlo. Un mismo ID en ambos trayectos. | **0,80 → hasta salir tras rebote → 0,65 → 2,1 s**. Daño 15, proyectil; S reduce a 5. | Saltar cada pasada o cubrirse. En `x=210`, dos cruces se separan aprox. `2×(210−80)/260 = 1,00 s`: el salto inicial dura 1,00 s y permite volver a saltar al aterrizar. Cerca del borde, un salto sincronizado puede cubrir ambas pasadas. |
| Carrera de línea `VERA_RUN` | Línea rasante de Vera al borde opuesto, fijada durante WARNING; volumen `y=400…430`, con detección de trayectoria barrida para no atravesar al jugador entre pasos. | **0,95 → 0,40 → 0,75 → 2,1 s**. Daño 20, barrido; S no mitiga. | W eleva pies ≥30 px antes del contacto y mantiene despeje durante el paso; la respuesta no requiere correr más rápido que Vera. |

Las señales muestran nombre, sentido, punto de rebote y cuenta sin depender de audio. **Capas pixel art:** cielo → cerca/canasta/gradas → suelo con líneas tenues → trayectoria y línea dinámica → personajes/balón → efectos → HUD. Se omite toda interfaz del recorrido virtual visible en la captura fuente.

## Nivel 3 — laboratorio y CÁTODO-3

**Bloqueo:** suelo, límites y cuerpos; mesones, fregaderos, sillas, modelos y techo de madera son decoración sin colisión. CÁTODO-3 empieza en `x=750`, vida 130 y límite 270 s. Franjas de sensor: izquierda `[260,380]`, derecha `[580,700]`; nunca están activas a la vez. Para `hurtBox` de 32 px de ancho, el corredor central seguro para el centro del estudiante es `[396,564]`.

| Patrón y `patternId` | Geometría y secuencia | Aviso → activo → recuperación → intervalo | Respuesta |
|---|---|---|---|
| Pulso de luz `CATODO_PULSE` | Círculo de radio 16 px, origen inicial aprox. `(710,410)`, viaja a 200 px/s hasta salir por el borde opuesto; trayectoria baja visible. | **0,85 → hasta salir → 0,70 → 1,9 s**. Daño 16, proyectil; S reduce a 5. | Saltar al acercarse la esfera o cubrirse. Desde aparición `x=210` tarda cerca de 2,5 s en llegar después del lanzamiento; no exige saltar al inicio del aviso. |
| Sensor izquierdo/derecho `CATODO_SENSOR_L/R` | La franja activa se fija antes de WARNING, se muestra con trama/nombre/cuenta; la otra y el centro se marcan seguros. Secuencia pulso → izquierda → pulso → derecha. | **1,15 → 0,50 → 0,80 → 1,9 s**. Daño 19, barrido de suelo; S no mitiga. | Desde el borde externo de una franja hasta estar enteramente en el centro seguro se recorren como máximo `120+16=136 px`; Diego: `0,25+136/204+0,15=1,067 s < 1,15`. W también evita el suelo si se sincroniza. |

La geometría de evasión se recalcula si cambia la anchura vulnerable. **Capas pixel art:** techo/pared/ventanas → mesones y modelos al fondo → suelo despejado → señales de franjas/pulso → personajes/proyectil → efectos → HUD. Ningún mueble ni elemento de la interfaz incrustada tapa el corredor.

## Nivel 4 — biblioteca y NULL

**Bloqueo:** suelo, límites y cuerpos; mostrador, estanterías, puestos de consulta y terminal son fondo. NULL empieza en `x=750`, vida 160 y límite 360 s. Los tres ecos conservan respuestas aprendidas en niveles 1–3. En fase 1 sigue `CHILO → VERA → CATODO` con intervalo 1,8 s. Al llegar a ≤80 HP, termina el ataque y recuperación actuales; fase 2 reinicia tres ecos y añade el barrido final, con intervalo 1,5 s. Cada eco y barrido tiene aviso propio.

| Patrón y `patternId` | Zona y respuesta | Aviso → activo → recuperación | Daño |
|---|---|---|---:|
| Eco Chilo `NULL_ECHO_CHILO` | Frontal de 135 px desde borde del avatar; fijar orientación, retroceder o S reduce a 6. Aviso inicial ampliado a 1,20 s para salida completa de Diego desde cercanía. | **1,20 → 0,20 → 0,55 s** | 18 |
| Eco Vera `NULL_ECHO_VERA` | Línea rasante fijada durante aviso; W evita al alcanzar ≥30 px de despeje. | **0,90 → 0,40 → 0,60 s** | 19 |
| Eco CÁTODO `NULL_ECHO_CATODO` | Una franja `[260,380]` o `[580,700]`, alterna; centro seguro o W. Aviso ampliado a 1,15 s para despejar con Diego. | **1,15 → 0,50 → 0,65 s** | 20 |
| Barrido final `NULL_FINAL_SWEEP` | Peligro en toda la columna de juego excepto zona segura izquierda `[120,360]` o derecha `[600,840]`, con texto **SEGURA**, símbolo y borde. La zona se decide al **iniciar WARNING**: se elige la que requiere menos recorrido del estudiante; sólo en empate alterna. No persigue al jugador durante el aviso. Entrar con cuerpo completo; saltar fuera de la franja no evita el daño. | **1,50 → 0,60 → 0,90 s** | 24 |

**Corrección de evitabilidad:** con alternancia rígida, desde el extremo opuesto hay unos 520 px y Diego necesitaría `520/204 ≈ 2,55 s`, más reacción; 1,50 s sería imposible. La selección por **lado alcanzable** mantiene el aviso actual y no obliga a cruzar el cuerpo de NULL. Con semiancho corporal de 18 px, los centros totalmente seguros son `[138,342]` y `[618,822]`. Para cualquier centro legal `x=98…862`, la distancia a la **zona segura más próxima** alcanza su máximo en `x=480`: `138 px`. Diego necesita `0,25 + 138/204 + 0,15 ≈ 1,076 s < 1,50`; Alma `≈0,975 s`, Nadia `≈0,879 s`. La elección se fija antes de mostrar la señal. Si un aturdimiento o el cuerpo del jefe bloquea una ruta concreta, la selección debe usar la ruta libre más corta; si no existe, ese inicio de barrido se retrasa hasta recuperar control. La franja segura completa es la respuesta principal y no depende del Visor.

**Capas pixel art:** techo y luz → estanterías/puestos/mostrador/terminal → pasillo despejado → señales independientes de ecos y barrido → avatar/personajes → efectos → HUD. El peligro usa trama distinta; la franja segura dice **SEGURA**. La interfaz e icono de NULL incrustados en capturas no se copian como fondo.

## Lenguaje visual común y revisión posterior

Los cuatro fondos pueden partir de capas PNG de **480 × 270 px nativos** dibujadas a escala 2× dentro de la arena 960 × 540, sin suavizado. Fondo lejano, arquitectura y suelo se separan de telegráficos, personajes, efectos y HUD. Señales dinámicas usan borde, trama, nombre y cuenta durante todo WARNING; seguridad usa borde/símbolo/texto, además de color. El manifiesto de recursos registrará ruta, tamaño, autor, origen y permiso. Las fotografías y capturas sólo guían el redibujo; no se reproducen matrículas, personas identificables ni controles incrustados.

Los cálculos son **pruebas en papel** con 0,25 s de reacción y 0,15 s de margen; no demuestran aún el comportamiento de un juego ejecutable. En fase 2 se revisarán con Alma, Diego y Nadia sin Visor, audio apagado, desde el centro, ambos extremos y cerca de cada zona. También se medirán duración real de duelos y posibilidad de superar la campaña: con R cada 0,35 s y jefes sin invulnerabilidad genérica, los objetivos narrativos de 1–5 minutos pueden resultar demasiado largos frente al daño disponible; se ajustarán según evidencia, no elevando vida a ciegas.

**Puerta 1.3:** cuatro fichas individuales con límites, apariciones, colisiones/decorado, dos o más patrones con ID, zonas y señales, capas pixel art y cálculo de respuesta para Diego. El barrido final ya no depende de un cálculo desde el centro solamente ni de un secreto opcional.
