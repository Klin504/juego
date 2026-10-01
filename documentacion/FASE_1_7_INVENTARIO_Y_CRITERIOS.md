# Fase 1.7 — inventario y puerta de producción

**Estado:** inventario y objetivos propuestos; no hay recursos finales de producción integrados ni mediciones de rendimiento. Entradas: [referencias](REFERENCIAS_VISUALES.md), [pantallas y recursos](PANTALLAS_Y_RECURSOS.md), y contratos [1.1](FASE_1_1_REQUISITOS_Y_CANON.md)–[1.6](FASE_1_6_ARQUITECTURA.md). Los fondos de escenario finales deben ser **pixel art**; las fotos y capturas se conservan sólo como referencias.

## Recursos visuales y estado comprobado

Se inventariaron **17 archivos** bajo `img/`: cuatro referencias del estacionamiento (1280×960 JPEG), cuatro de la cancha (PNG, 1913–1917×1066–1097), tres del laboratorio (PNG, 1917×1095–1098), tres de la biblioteca (PNG, 1913–1917×1091–1097), una foto de Chilo (1080×1551 JPEG), un concepto PNG de Vera (1199×1312) y uno de CÁTODO-3 (1222×1287). El icono NULL aparece dentro de capturas y no existe como sprite independiente. Los tamaños de archivo van aproximadamente de 0,17 a 3,03 MiB. Metadatos describen archivos actuales, no autorización de publicación.

| Entregable de producción | Especificación inicial | Estado y condición |
|---|---|---|
| Fondo estacionamiento | Pixel art, PNG, lienzo nativo 480×270; adoquines, fachada, palmeras y vehículos genéricos; corredor central despejado. | Falta crear. Omitir matrículas y detalles identificables. |
| Fondo cancha | Pixel art, PNG, 480×270; cerca, canasta, gradas azules y líneas fijas tenues. | Falta crear. Omitir toda interfaz de captura. |
| Fondo laboratorio | Pixel art, PNG, 480×270; techo de madera, mesones, fregaderos y modelos didácticos. | Falta crear. Omitir interfaz de captura. |
| Fondo biblioteca | Pixel art, PNG, 480×270; mostrador, estantes, puestos y techo de madera; corredor despejado. | Falta crear. Omitir interfaz e icono NULL incrustados. |
| Alma, Diego, Nadia | Atlas PNG con transparencia; tamaño de referencia hasta 32×48 nativo por cuadro, sujeto a silueta legible. | Faltan diseños/sprites finales. |
| Chilo | Atlas PNG original que conserva ave blanca, pico amarillo y ropa azul; hasta 48×56 nativo como referencia inicial. | Existe una foto de referencia; sprite pendiente. |
| Vera | Atlas PNG basado en el concepto aportado; hasta 48×56 nativo inicial. | Hay concept art; faltan sprites/animación. |
| CÁTODO-3 | Atlas PNG basado en el concepto; hasta 48×56 nativo inicial. | Hay concept art; faltan sprites/animación. |
| NULL | Atlas PNG original violeta/cian, silueta legible; hasta 48×56 nativo inicial. Variación visible de fase 2. | Sólo hay icono en referencias; diseño de combate pendiente. |
| Señales y efectos | Dibujadas por Renderer o recursos pixel art transparentes; formas, trama, texto y símbolo separados del fondo. | Contrato 1.3; arte final pendiente. |

Al escalar fondos nativos 480×270 al mundo lógico 960×540 se desactiva suavizado. No se fijan atlas finales ni dimensiones rígidas antes de ver las siluetas. Manifiesto por recurso: `assetId`, ruta relativa, tipo, dimensiones nativas, escala prevista, personaje/arena, autor, origen, licencia o permiso, atribución, transformaciones, fecha, versión y estado (`referencia`, `pendiente`, `aprobado`, `integrado`). Las cajas, pivotes y tiempos de daño provienen de contratos de combate; los cuadros de animación no mueven hitboxes.

La responsabilidad futura de arte corresponde a **Pixel Art Animator / responsable de arte**; la carga y manifiesto de imágenes, a **Canvas Engine Developer / Renderer**; el coordinador documenta procedencia y pide al creador confirmar derechos de aportes propios antes de distribuir derivados. Audio Web Engineer posee el catálogo sonoro; Game UI Developer/Renderer, equivalentes visuales; Game Tester Web, evidencia funcional; Performance Optimizer Web, mediciones. Estos roles no afirman que esos recursos estén encargados o producidos.

## Animaciones que deberá registrar el manifiesto

Los metadatos JSON indicarán hoja, rectángulo por cuadro, secuencia, duración en milisegundos, modo (`loop`, `once`, `hold`) y pivote de pies. Las dimensiones respetan las fichas de [1.3](FASE_1_3_FICHAS_ARENAS.md); el estado de animación sigue el estado de combate y no lo decide.

| Tipo | Estados mínimos previstos |
|---|---|
| Alma, Diego, Nadia | Reposo, caminar, salto, cobertura, golpe normal, especial, daño y derrota. Cada especial identifica su efecto visual propio. |
| Chilo, Vera, CÁTODO-3 | Reposo, aviso/anticipación, ejecución por patrón, recuperación, daño y derrota. El patrón conserva telegráfico visible aunque falte animación. |
| NULL | Reposo, tres ecos, barrido final, daño y derrota; transición visual distinguible al activar fase 2. |

Los cuatro fondos finales y los siete conjuntos de personajes son recursos **pendientes**. Los conceptos existentes de Vera y CÁTODO-3 sólo orientan su arte. Aunque las imágenes se aportaron o generaron para el proyecto, la autorización específica de cualquier material de origen y las condiciones para distribuir derivados se registran antes del paquete final; no se presupone una licencia.

## Audio: eventos, procedencia y equivalentes

No hay archivos de audio en las carpetas inventariadas. Cada recurso futuro necesita ID, evento, categoría, prioridad, ruta relativa, duración, formato/fallback, autor, fuente, licencia/permiso, atribución y estado. Propuesta inicial: OGG Vorbis con MP3 alternativo si la matriz de navegadores lo confirma; WAV como fuente de trabajo. No introducir bibliotecas externas sin decisión documentada. El Audio consume eventos y preferencias; no cambia combate. La primera interacción del jugador habilita sonido. Un fallo de carga, decodificación o política de reproducción deja el juego funcional y presenta aviso no bloqueante si hace falta.

| Evento | Audio opcional | Señal visual que siempre permanece |
|---|---|---|
| `screenChanged`, confirmar menú | Clic/confirmación breve; sin tono por cada Tab. | Pantalla, selección y foco visibles. |
| `warningStarted` frontal/proyectil/sensor/rasante/barrido | Cuatro familias cortas distinguibles. | Nombre, forma, trama y cuenta durante todo WARNING. |
| Ataque, salto, aterrizaje, golpe o especial | Pasos e impactos breves, voces limitadas; una firma por personaje. | Animación, zona de impacto, número de daño y barra. |
| `attackCancelled` por Alma | Corte breve. | Aviso se cierra y zona activa no aparece. |
| `visorRevealed` | Tono ascendente. | Patrón, respuesta y señal **SEGURA** con borde/símbolo/texto. |
| Cambio de fase NULL | Motivo corto. | Cambio de forma y nuevo aviso del patrón. |
| `fightFinished` | Motivo de victoria/derrota. | Título y resumen legibles. |
| Pausa/reanudar | Tono opcional. | Panel PAUSE y simulación congelada. |
| Mensaje Archivo / `storageFailed` | Nunca necesario. | Texto persistente y anuncio accesible. |

El Audio inicia tras gesto explícito, respeta silencio/volumen y suspende salida al ocultar pestaña o pausar. Los `AudioBuffer` decodificados pueden mantenerse; las fuentes `AudioBufferSourceNode` se crean por reproducción y no se reutilizan tras arrancar. La carga o permiso faltante queda registrado y no bloquea juego. No se proyectan música adaptativa, audio espacial ni streaming para esta primera versión.

## Matriz y objetivos iniciales de revisión

| Entorno | Revisión futura | Estado |
|---|---|---|
| RV-01…RV-06, Chrome, Edge y Firefox de escritorio | Seis recorridos completos: a 1366×768, uno por estudiante sin Visor; a 1920×1080, un recorrido por estudiante con Visor. Cada corrida cubre cuatro jefes, diez pantallas, teclado, foco, pausa, resultado y sonido apagado; variar/revisar destellos reducidos. Registrar navegador y versión exacta. | Matriz futura; sin ejecución. |
| RV-07…RV-09, Chrome, Edge y Firefox en 390×844 | Sólo lectura/navegación por diez pantallas, selección, Archivo, terminal, confirmaciones, foco y aviso de teclado/ventana horizontal; observar pausa al girar a retrato. | No es objetivo de combate táctil ni certificación móvil. |
| Equipo de rendimiento mínimo propuesto | CPU 4 núcleos, 8 GB RAM, gráfica integrada y pantalla 60 Hz como piso inicial; registrar modelo/CPU/GPU/RAM/SO/DPR/energía exactos antes de medir. El equipo real sigue pendiente. | Perfil propuesto, aún no identificado ni medido. |

Asignación para cubrir personajes con y sin ayuda:

| ID | Navegador y ventana | Campaña de escritorio |
|---|---|---|
| RV-01 | Chrome, 1366×768 | Alma, sin Visor |
| RV-02 | Edge, 1366×768 | Diego, sin Visor |
| RV-03 | Firefox, 1366×768 | Nadia, sin Visor |
| RV-04 | Chrome, 1920×1080 | Diego, con Visor |
| RV-05 | Edge, 1920×1080 | Nadia, con Visor |
| RV-06 | Firefox, 1920×1080 | Alma, con Visor |
| RV-07 | Chrome, 390×844 | Sólo lectura, navegación y foco |
| RV-08 | Edge, 390×844 | Sólo lectura, navegación y foco |
| RV-09 | Firefox, 390×844 | Sólo lectura, navegación y foco |

Cada una de RV-01…RV-06 cubre los cuatro jefes; sonido apagado y reducción de destellos se recorren en todos. Registrar versión exacta del navegador, sistema/equipo, build, ventana/DPR, configuración, personaje/nivel, pasos, esperado/observado y captura o registro por celda. Para EE/INT añadir `patternId`, `attackInstanceId`/sub-ID, fase, geometría segura, carga y segundos de aviso; una captura de UI no demuestra por sí sola el estado único del dominio.

Objetivos provisionales para contrastar, no resultados alcanzados:

| ID | Medida | Objetivo inicial | Método futuro |
|---|---|---:|---|
| PF-01 | Inicio local interactivo | ≤3 s desde carga fría | 5 cargas frías por navegador; reportar mediana y máximo. |
| PF-02 | Combate listo tras Continuar | ≤2 s | 5 repeticiones con recursos locales; informar fallos/caché. |
| PF-03 | Recursos iniciales transferidos | ≤5 MiB | Sumar bytes realmente cargados antes del primer combate. |
| PF-04 | Trabajo de juego por cuadro, p95 | ≤12 ms | `performance.now()` durante cinco minutos de combate exigente. |
| PF-05 | Intervalo rAF p95 | ≤20 ms | Medir por separado del trabajo de actualización/dibujo. |
| PF-06 | Pasos descartados por tope | 0 en cinco minutos | Contador del bucle; si ocurre, registrar carga y causa. |
| PF-07 | Heap Chromium tras cinco minutos y 10 cambios | ≤96 MiB orientativo y crecimiento pos-GC ≤10 MiB o ≤10 % | Registrar heap/GC antes/después; objetivo no se atribuye a Firefox/Edge sin métrica equivalente. |

El valor medido en la máquina disponible se documentará junto al navegador y condiciones; la línea base empieza con carga/arena de prueba en 2.1, se completa con duelo desde 2.4, se actualiza con campaña conectada en 2.8 y se compara en fase 3.8. Si las métricas o el equipo contradicen estos topes, se justifica la revisión con datos antes de declarar aceptación. Presupuesto de audio, peso final de arte, frame p95, heap y perfiles reales **no están medidos**.

## Trazabilidad y puerta documental

| Conjunto | Cobertura | Fase que lo verifica |
|---|---|---|
| C-01…C-13 | Alcance, entorno, cuatro fondos pixel art, niveles y finales; responsables están en [1.1](FASE_1_1_REQUISITOS_Y_CANON.md). | AT-01…AT-11 son revisión documental; comportamiento y recursos se verifican en fases 2–3. |
| P-01…P-08 | Historia, controles, balance, persistencia y accesibilidad; propietarios listados en [1.1](FASE_1_1_REQUISITOS_Y_CANON.md). | Contratos 1.2–1.6 y revisión 3.7. |
| EE-01…EE-17 | Pistas, normalización, almacenamiento, predicción, carga y campaña sin Visor. | Diseño 1.5; revisión funcional 3.7. |
| INT-01…INT-08 | Dependencias, pausa, colisiones, resultados, interfaz y errores; dueños en [1.6](FASE_1_6_ARQUITECTURA.md). | Integración 2.1–2.8. |
| RV-01…RV-09 | Seis campañas escritorio con/sin Visor y tres pasadas de lectura estrecha en navegadores objetivo. | Revisión visual/accesible 3.7–3.8. |
| PF-01…PF-07 | Carga, presupuesto inicial, tiempo de cuadro, rAF, heap y memoria. | Línea base 2.1 y regresión 3.8. |

**Puerta 1.7:** cada recurso previsto tiene formato, dimensiones, estado, responsable y campo de permiso; todos los eventos críticos tienen equivalente visual; los entornos y topes tienen método, versión y estado propuesto/medido; IDs futuros tienen fase responsable. Los permisos particulares de las referencias y el equipo real permanecen como pendientes con responsable antes de producción/medición. La matriz asigna los tres personajes entre ejecuciones con/sin Visor, cada campaña cubre cuatro jefes y 390×844 sólo cubre lectura/foco. No se han creado recursos ni ejecutado pruebas.
