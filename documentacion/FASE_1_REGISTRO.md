# Fase 1 — registro de lectura, agentes y entregas

**Inicio:** 30 de septiembre de 2026. **Cierre documental:** 1 de octubre de 2026. **Alcance:** sólo documentación. Fuente de puertas: [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md). Este registro distingue propuestas documentales de implementación y pruebas futuras.

## Preparación de la fase

Se volvió a listar `agentes_juegos_html_css_js/`: `FLUJO_OPERATIVO.md` y quince perfiles distribuidos entre diseño, motor/arte, sistemas, UI y revisión/entrega. WebGL 3D y multijugador se revisaron en el catálogo y no se asignaron porque la primera versión es 2D individual. La regla de un sistema, pantalla, escena o nivel por encargo se mantiene para las siete subfases. Los perfiles no tienen número de versión interno; se identifica su contenido mediante SHA-256 en los registros de lectura.

| Subfase | Entregable | Estado | Puerta documental |
|---|---|---|---|
| 1.1 | [Requisitos y canon](FASE_1_1_REQUISITOS_Y_CANON.md) | Cerrada | Trece requisitos confirmados y ocho decisiones de diseño trazados; canon de cuatro marcas y dos terminales alineado. |
| 1.2 | [Contrato de combate y datos](FASE_1_2_COMBATE_Y_DATOS.md) | Cerrada | Reglas, estados, entrada y resultados con dueño único; geometría específica transferida a 1.3. |
| 1.3 | [Cuatro fichas de arena](FASE_1_3_FICHAS_ARENAS.md) | Cerrada | Diez patrones, capas pixel art y rutas alcanzables calculadas con Diego. |
| 1.4 | [Pantallas, escenas y controles](FASE_1_4_PANTALLAS_Y_ESCENAS.md) | Cerrada | Diez pantallas y rutas/foco completos; cuatro capítulos con variantes y lectura escalable. |
| 1.5 | [Contrato Archivo/Visor](FASE_1_5_ARCHIVO_Y_VISOR.md) | Cerrada | Predicción real, extensión única, persistencia y dos terminales sin contradicciones. |
| 1.6 | [Arquitectura y contratos](FASE_1_6_ARQUITECTURA.md) | Cerrada | Dependencias acíclicas, dueño por regla, entradas/salidas y fallos definidos. |
| 1.7 | [Inventario y criterios](FASE_1_7_INVENTARIO_Y_CRITERIOS.md) | Cerrada | Recursos con estado/propietario, permisos pendientes, matriz de navegadores y metas de rendimiento etiquetadas como propuestas. |

## 1.1 — Alcance, requisitos y canon

**Lectura previa completa:** [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (SHA-256 `6F24CFEF7FA6…BC79553`), [Game Designer Web](../agentes_juegos_html_css_js/diseno_juego/game-designer-web.md) (`2D3137AC12CE…B2E22`), [Narrative Designer Web](../agentes_juegos_html_css_js/diseno_juego/narrative-designer-web.md) (`DECA8F005A04…7333F`), [Game Tester Web](../agentes_juegos_html_css_js/pruebas_y_despliegue/game-tester-web.md) (`E65C3D2CDCE4…30288`); entradas [Requisitos.md](Requisitos.md), [DOCUMENTACION.md](DOCUMENTACION.md), [LORE.md](LORE.md) y el plan. Los tres perfiles se convocaron por separado; ninguno editó archivos ni ejecutó pruebas.

| Agente convocado | Encargo de un sistema/escena | Respuesta recibida | Integración |
|---|---|---|---|
| Game Designer Web | Matriz de requisitos, clasificación, dueño y resultado observable. | 12 grupos confirmados y 8 propuestas; señaló obstáculos, WASD, intentos y puntuación como ambigüedades. | Se desglosó pixel art como requisito confirmado propio, para 13 IDs C y 8 IDs P en [1.1](FASE_1_1_REQUISITOS_Y_CANON.md). |
| Narrative Designer Web | Recorrido de los cuatro actos y coherencia del canon. | NULL registra las marcas; Chilo/Vera participan voluntariamente; dos terminales distintas; variantes según luchador. | Se fijó el recorrido y se alinearon [DOCUMENTACION.md](DOCUMENTACION.md) y [LORE.md](LORE.md). |
| Game Tester Web | Casos documentales para requisitos y canon. | Once casos AT; detectó tabla de nueve pantallas, obstáculos ambiguos y diferencia entre hito fase 2/final fase 3. | Se añadieron AT-01…AT-11; se corrigieron [DOCUMENTACION.md](DOCUMENTACION.md) y [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md). |

**Revisión del coordinador:** las propuestas genéricas de táctil y autoguardado de los perfiles no amplían el alcance fijado por el creador; se conserva teclado de escritorio e interfaz adaptable. Obstáculos, W/S, reiniciar intento, puntos al abandonar y redondeo del bono quedaron explícitos como decisiones de diseño, no como confirmaciones del creador. Se comprobó la coherencia textual de las rutas narrativas; aún no existe juego para verificar comportamiento en navegador.

**Evidencia:** [matriz y casos documentales](FASE_1_1_REQUISITOS_Y_CANON.md), correcciones de canon y pantallas en los documentos enlazados. **Problemas abiertos para subfases siguientes:** fijar geometría exacta de obstáculos y franja segura (1.3), orden de actualización de intentos/puntos (1.2), textos/variantes/foco completos (1.4) y contrato técnico del Visor (1.5). Ninguno exige atribuir una propuesta al creador.

## 1.2 — Reglas comunes de combate y datos

**Lectura previa completa:** se releyeron [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (`6F24CFEF7FA6…BC79553`) y [Game Designer Web](../agentes_juegos_html_css_js/diseno_juego/game-designer-web.md) (`2D3137AC12CE…B2E22`); se leyeron [Physics Engine Developer](../agentes_juegos_html_css_js/sistemas_de_juego/physics-engine-developer.md) (`06445E80B034…10D93A`) e [Input System Developer](../agentes_juegos_html_css_js/sistemas_de_juego/input-system-developer.md) (`B0C1F41F8348…5FB8A9`), además de [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), [Requisitos.md](Requisitos.md), [DOCUMENTACION.md](DOCUMENTACION.md) y 1.1. Los tres perfiles se invocaron por separado; ninguno editó o programó.

| Agente convocado | Encargo | Respuesta e integración |
|---|---|---|
| Game Designer Web | Reglas de vida, daño, tres intentos, puntos y resultados. | Definió propietarios, fórmula de puntos y prioridad de resultado; integrado en [1.2](FASE_1_2_COMBATE_Y_DATOS.md). |
| Physics Engine Developer | Cajas, estados de ataque, contacto y daño único. | Definió `bodyBox`/`hurtBox`/`attackBox`, IDs por ejecución, orden de paso y valores geométricos pendientes para 1.3; integrado en 1.2. |
| Input System Developer | Mapa WASD/R/Shift/E/Esc, foco, buffer y simultaneidad. | Definió acciones y estados `pressed/held/released`, preservando `Tab` y teclado de escritorio; integrado en 1.2. |

**Revisión del coordinador:** se limitó la invulnerabilidad genérica de 0,45 s al estudiante para que los tres proyectiles de Nadia puedan acertar; cada instancia conserva protección contra daño duplicado. Se definió la resolución del KO simultáneo a favor del jugador, daño reducido entero, y récord sólo al terminar por Victoria o Game Over. Son propuestas ajustables, no pruebas. **Evidencia:** [contrato 1.2](FASE_1_2_COMBATE_Y_DATOS.md). **Transferencia a 1.3:** dimensiones de cajas, física de salto y formas/tamaños de cada patrón.

## 1.3 — Cuatro arenas y evitabilidad

**Lectura previa completa:** se releyeron [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (`6F24CFEF7FA6…BC79553`) y [Game Designer Web](../agentes_juegos_html_css_js/diseno_juego/game-designer-web.md) (`2D3137AC12CE…B2E22`); se leyeron [Level Designer Web](../agentes_juegos_html_css_js/diseno_juego/level-designer-web.md) (`6683041AEAF9…B40F3`) y [Pixel Art Animator](../agentes_juegos_html_css_js/motor_y_renderizado/pixel-art-animator.md) (`34E6849E5D0C…2BE7C`), más [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), [DOCUMENTACION.md](DOCUMENTACION.md), [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md) y 1.2.

| Agente convocado | Encargo acotado | Respuesta e integración |
|---|---|---|
| Level Designer Web, invocación 1 | Sólo estacionamiento/Chilo. | Plano, dos ataques y tiempos de evasión; integrado en ficha 1. |
| Level Designer Web, invocación 2 | Sólo cancha/Vera. | Ida y regreso del balón, carrera y capas; integrado en ficha 2. |
| Level Designer Web, invocación 3 | Sólo laboratorio/CÁTODO-3. | Centro seguro, franjas alternas y pulso; integrado en ficha 3. |
| Level Designer Web, invocación 4 | Sólo biblioteca/NULL. | Detectó que alternancia estricta hacía imposible el barrido desde el extremo opuesto; propuso ampliar el aviso. Se adoptó la alternativa de lado alcanzable con aviso de 1,50 s en ficha 4. |
| Game Designer Web | Balance y evitabilidad común, un sistema. | Añadió reacción/margen, valores de salto y riesgo de duración de duelos; integrado en revisión de fichas. |
| Pixel Art Animator | Sistema de capas y señales de los cuatro fondos, sin crear arte. | Propuso capas nativas 480 × 270 escaladas, telegráficos dinámicos y restricciones de referencias; integrado en lenguaje visual común. |

**Revisión del coordinador:** los cálculos se hicieron desde centros legales, extremos y franjas, no sólo desde el centro. Se corrigió [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md) con avisos iniciales ampliados para Chilo y dos ecos de NULL, el diámetro de la sombra y la elección del lado seguro alcanzable. La elección dinámica preserva un aviso final de 1,50 s y evita una pausa de más de tres segundos; está marcada como ajuste de diseño, no como requisito original del creador. Se corrigió en el plan el criterio de «zona segura durante cada pulso» por «durante cada barrido de sensores». **Evidencia:** [cuatro fichas y fórmulas](FASE_1_3_FICHAS_ARENAS.md). **Pendiente de fase 2:** validar sensaciones y tiempos reales; los cálculos actuales son en papel.

## 1.4 — Pantallas, escenas y controles

**Lectura previa completa:** se releyeron [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (`6F24CFEF7FA6…BC79553`), [Narrative Designer Web](../agentes_juegos_html_css_js/diseno_juego/narrative-designer-web.md) (`DECA8F005A04…7333F`), [Game UI Developer](../agentes_juegos_html_css_js/ui_y_hud/game-ui-developer.md) (`A58D05DD3733…ED9322`), [Responsive Game Designer](../agentes_juegos_html_css_js/ui_y_hud/responsive-game-designer.md) (`0B17871D52B2…CA2FDA6`) e [Input System Developer](../agentes_juegos_html_css_js/sistemas_de_juego/input-system-developer.md) (`B0C1F41F8348…5FB8A9`), además de [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md), [LORE.md](LORE.md), [Requisitos.md](Requisitos.md) y los contratos 1.1–1.3.

| Agente convocado | Encargo acotado | Respuesta e integración |
|---|---|---|
| Narrative Designer Web, invocaciones 1–4 | Una escena por nivel: Chilo, Vera, CÁTODO-3 y NULL. | Tarjetas breves y variantes para tres estudiantes; integradas en [1.4](FASE_1_4_PANTALLAS_Y_ESCENAS.md). |
| Game UI Developer | Flujo de las diez pantallas y foco, un sistema. | Estados, salidas, confirmaciones y foco de retorno; integrado en 1.4. |
| Responsive Game Designer | Escalado de arena y lectura en tres tamaños, un sistema. | Ajuste proporcional, HUD DOM, retrato como lectura y pausa; integrado en 1.4. |
| Input System Developer | Teclado y foco entre combate, diálogos y Archivo, un sistema. | `Tab` preservado, teclas de combate desactivadas en campos, eventos sin duplicación; integrado en 1.4. |

**Revisión del coordinador:** se mantuvieron diez pantallas: reintento es variante de `STORY`, y las dos terminales tienen funciones distintas. Se corrigió en [LORE.md](LORE.md) la línea de Diego que mezclaba el caso donde él está seleccionado con aquel donde sólo acompaña; se sincronizaron reintento, confirmaciones y salidas en [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md). **Evidencia:** [mapa de pantallas, escenas y escalado](FASE_1_4_PANTALLAS_Y_ESCENAS.md). **Pendiente de fase 2:** verificar foco, tamaños y ritmo con interfaz real.

## 1.5 — Archivo y Visor GUÍA

**Lectura previa completa:** se releyeron [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (`6F24CFEF7FA6…BC79553`), [Narrative Designer Web](../agentes_juegos_html_css_js/diseno_juego/narrative-designer-web.md) (`DECA8F005A04…7333F`), [Game Designer Web](../agentes_juegos_html_css_js/diseno_juego/game-designer-web.md) (`2D3137AC12CE…B2E22`), [Game UI Developer](../agentes_juegos_html_css_js/ui_y_hud/game-ui-developer.md) (`A58D05DD3733…ED9322`) y [Game Tester Web](../agentes_juegos_html_css_js/pruebas_y_despliegue/game-tester-web.md) (`E65C3D2CDCE4…30288`), junto a [EASTER_EGG.md](EASTER_EGG.md), [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md) y contratos previos.

| Agente convocado | Encargo único | Respuesta e integración |
|---|---|---|
| Narrative Designer Web | Orden y texto de las cuatro pistas. | Confirmó GUÍA y detectó que la cuarta ficha anticipaba la copia de recuperación; se corrigió [EASTER_EGG.md](EASTER_EGG.md). |
| Game Designer Web | Efecto del Visor en un combate. | Definió estado efímero, cola de sólo lectura, extensión de aviso, fase NULL y franja dinámica; integrado en [1.5](FASE_1_5_ARCHIVO_Y_VISOR.md). |
| Game UI Developer | Interacción Archivo/terminal/HUD. | Definió estados visibles, foco, mensajes y frontera UI/dominio; integrado en 1.5. |
| Game Tester Web | Matriz futura del secreto. | EE-01…EE-17, incluidos cancelación, pausa y persistencia; condensados en 1.5 sin ejecutar pruebas. |

**Revisión del coordinador:** se distinguieron terminales de mantenimiento y recuperación, y se evitó mostrar un lado seguro antes de que el ataque lo fije. La carga se consume una vez incluso si un patrón es cancelado. El fallo de `localStorage` queda visible y permite usar el Visor durante esa sesión. **Evidencia:** [contrato y matriz](FASE_1_5_ARCHIVO_Y_VISOR.md), [secreto alineado](EASTER_EGG.md). **Pendiente de fase 2:** comprobar estas transiciones en ejecución; no hay implementación actual.

## 1.6 — Arquitectura e interfaces

**Lectura previa completa:** se releyeron [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (`6F24CFEF7FA6…BC79553`), [Canvas Engine Developer](../agentes_juegos_html_css_js/motor_y_renderizado/canvas-engine-developer.md) (`223ABAC3AC39…70657`), [Physics Engine Developer](../agentes_juegos_html_css_js/sistemas_de_juego/physics-engine-developer.md) (`06445E80B034…10D93A`), [Input System Developer](../agentes_juegos_html_css_js/sistemas_de_juego/input-system-developer.md) (`B0C1F41F8348…5FB8A9`), [Game UI Developer](../agentes_juegos_html_css_js/ui_y_hud/game-ui-developer.md) (`A58D05DD3733…ED9322`) y [Game Tester Web](../agentes_juegos_html_css_js/pruebas_y_despliegue/game-tester-web.md) (`E65C3D2CDCE4…30288`), así como [DOCUMENTACION.md](DOCUMENTACION.md), [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md), [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md) y contratos 1.2/1.4/1.5.

| Agente convocado | Encargo de un sistema | Respuesta e integración |
|---|---|---|
| Canvas Engine Developer | Bucle y render Canvas. | Paso fijo, reloj/pausa, corte tras resultado terminal, escalado, fallos; integrado en [1.6](FASE_1_6_ARQUITECTURA.md). |
| Physics Engine Developer | Frontera colisiones/daño. | Física devuelve contactos; combate aplica daño único. Detectó discrepancia de salto, resuelta por categorías. |
| Input System Developer | Frontera de acciones/foco. | Entrada por paso, limpieza, combinación E/botón y conflicto Shift+Tab. Se eligió activar el especial al soltar Shift sin combinación. |
| Game UI Developer | Comandos, snapshots y foco DOM. | UI recibe lectura y eventos, emite peticiones semánticas; integrado en 1.6. |
| Game Tester Web | Escenarios de integración. | Matriz futura INT-01…INT-17 propuesta; el coordinador la consolidó en ocho cruces de integración INT-01…INT-08 en 1.6. Señaló autoría de la segunda marca por NULL, corregida en [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md). |

**Revisión del coordinador:** `levels` sólo declara datos y `campaign` gobierna progresión; se vinculó el mapa refinado desde [DOCUMENTACION.md](DOCUMENTACION.md). Se unificaron [1.2](FASE_1_2_COMBATE_Y_DATOS.md), [1.3](FASE_1_3_FICHAS_ARENAS.md) y [ARENAS_Y_COMBATE.md](ARENAS_Y_COMBATE.md): sensor de suelo, rasante de 30 px y barrido final de columna tienen evasiones distintas. Shift se confirma al soltar para preservar Shift+Tab; requiere revisión de sensación en la futura implementación. **Evidencia:** [glosario, mapa, diagrama y casos](FASE_1_6_ARQUITECTURA.md). **Pendiente de fase 2:** validar interfaces, foco y telegráficos reales; no se ejecutaron pruebas de código.

## 1.7 — Inventario de recursos y criterios

**Lectura previa completa:** se releyeron [FLUJO_OPERATIVO.md](../agentes_juegos_html_css_js/FLUJO_OPERATIVO.md) (`6F24CFEF7FA6…BC79553`), [Pixel Art Animator](../agentes_juegos_html_css_js/motor_y_renderizado/pixel-art-animator.md) (`34E6849E5D0C…2BE7C`), [Audio Web Engineer](../agentes_juegos_html_css_js/sistemas_de_juego/audio-web-engineer.md) (`05B4BA1EA341…856CA0`), [Performance Optimizer Web](../agentes_juegos_html_css_js/pruebas_y_despliegue/performance-optimizer-web.md) (`E466C4EE5A75…A4BB38`) y [Game Tester Web](../agentes_juegos_html_css_js/pruebas_y_despliegue/game-tester-web.md) (`E65C3D2CDCE4…30288`), además de [REFERENCIAS_VISUALES.md](REFERENCIAS_VISUALES.md), [PANTALLAS_Y_RECURSOS.md](PANTALLAS_Y_RECURSOS.md) y contratos 1.1–1.6. Los archivos actuales de `img/` se contaron y se leyeron sus dimensiones; no se generó ni alteró recurso.

| Agente convocado | Encargo acotado | Respuesta e integración |
|---|---|---|
| Pixel Art Animator (`design_review`) | Especificación de escenarios/sprites, un sistema de arte. | Registró lienzo 480×270, PNG y JSON, capas, pivotes y estados de animación; integrado en [1.7](FASE_1_7_INVENTARIO_Y_CRITERIOS.md). |
| Audio Web Engineer (`engine_review`) | Catálogo de eventos de sonido y fallos. | No hay audio actual; propuso tabla evento→audio→señal visual, formatos sujetos a compatibilidad y permisos por recurso; integrado en 1.7. |
| Performance Optimizer Web (`agent_map`) | Presupuesto y método de medición. | Propuso hardware base y metas de carga/fotograma/heap claramente sin medir; integrado en 1.7 y línea base 2.1. |
| Game Tester Web (`ui_qa_review`) | Matriz de navegadores, accesibilidad y trazabilidad. | Nueve configuraciones (seis campañas y tres recorridos de lectura estrecha) y criterios C/P/EE/INT; integrado en 1.7 sin ejecutar pruebas. |

**Revisión del coordinador:** `img/` contiene 14 referencias de escenarios, la foto de Chilo y conceptos de Vera/CÁTODO-3; no hay fondos finales pixel art, hojas de animación ni audio. Se registró que uso/distribución de referencias requiere confirmar permisos; no se asignó una licencia por suponerla. El equipo real de medición queda por identificar, y los topes de rendimiento son objetivos iniciales. Se definió cobertura de los tres personajes, cuatro jefes, con/sin Visor y sólo lectura en 390×844. **Evidencia:** [inventario, matriz y criterios](FASE_1_7_INVENTARIO_Y_CRITERIOS.md). **Pendiente para producción:** confirmar permisos antes de distribuir derivados, registrar equipo/navegador al medir, producir recursos finales y recalibrar umbrales con datos.

## Cierre documental de fase 1

Las siete subfases tienen entregable documental, perfil leído e invocado, integración registrada y puerta documental cerrada. Se identifican dueños, entradas/salidas, estados, errores y criterios futuros. Ninguna puerta equivale a prueba de una versión ejecutable: fase 2 todavía debe construir e inspeccionar el juego. Los principales pendientes antes del paquete final son permisos específicos de referencias/derivados, arte y audio originales o autorizados, equipo de medición real y ajuste jugable de balance/controles.
