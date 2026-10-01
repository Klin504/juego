# Fase 1.5 — contrato del Archivo y el Visor GUÍA

**Estado:** diseño documental, sin implementación. Entradas: [secreto](EASTER_EGG.md), [combate](FASE_1_2_COMBATE_Y_DATOS.md), [fichas](FASE_1_3_FICHAS_ARENAS.md) y [pantallas](FASE_1_4_PANTALLAS_Y_ESCENAS.md). Los valores de tiempo son propuestas iniciales. El secreto es opcional y nunca concede marcas, niveles, puntos ni victoria.

## Descubrimiento y terminal

Ruta `MENU → HOW_TO_PLAY → ARCHIVE`, disponible antes de iniciar campaña. El encabezado indica leer los cuatro folios según el recorrido. Estacionamiento `M-01 · G`, cancha `M-02 · U`, laboratorio `M-03 · Í`, biblioteca `M-04 · A` forman **GUÍA**. Letras y orden constan en texto accesible, no sólo en imágenes. La cuarta ficha no anticipa la revelación del registro del laboratorio.

El panel «Terminal de mantenimiento» está dentro de `ARCHIVE`. Su campo «Palabra de mantenimiento» aclara «Consulta ayudas del recorrido; no modifica el progreso». `normalizarPalabra(raw)` aplica recorte de espacios exteriores, conversión a mayúsculas y equivalencia de `Í`/`I` para aceptar `GUÍA` y `GUIA`; otras letras no se corrigen. Vacío e incorrecto reciben los mensajes de [EASTER_EGG.md](EASTER_EGG.md), sin penalización ni límite de consultas. Una palabra válida fija `visorUnlocked=true` y ofrece el mensaje de primer desbloqueo; una consulta posterior ofrece «Visor GUÍA disponible». El mismo estado se escribe en almacenamiento local. Si guardar falla, el desbloqueo funciona durante la sesión y se informa: «El Visor funciona esta sesión, pero no se pudo guardar en este navegador». Al recargar en ese caso no se promete persistencia.

Abrir panel enfoca el campo; Enter consulta una vez; error conserva el texto y el foco; cerrar con botón o Escape devuelve foco a «Abrir terminal». Un anuncio accesible comunica cada resultado una vez y permanece visible. En el campo, las letras E/R/WASD son escritura normal. La terminal de recuperación de la biblioteca es **otra** pieza narrativa: aparece después de tres marcas, sólo deja editar tras la cuarta y la derrota de NULL; no acepta GUÍA.

## Dueños y ciclo de la carga

| Dueño | Estado y función |
|---|---|
| Archivo/almacenamiento | Únicamente `visorUnlocked` persistente. `localStorage` es una dependencia reemplazable; fallo de lectura equivale a bloqueado sin bloquear el juego. |
| Combate | `VisorState` efímero por encuentro: `LOCKED`, `READY`, `PENDING`, `REVEALING`, `USED`; posee carga, enlace a ataque, extensión y respuesta real. |
| Planificador del jefe | Cola/revisión y `peekNextAttack()` de sólo lectura; crea `attackInstanceId`, fija dirección y `safeGeometry` al iniciar `WARNING`. |
| Entrada | Convierte E o activación del botón en una solicitud `visor` sin buffer ni repetición. |
| UI/HUD | Muestra estado, patrón y zona que recibe; no calcula daño, cola, carga ni persistencia. |

Cada entrada nueva a `FIGHT`, incluido reintento o reinicio, crea `READY` si el hallazgo existe, o `LOCKED` si no. Pausa no recarga. `READY → REVEALING` durante aviso o `READY → PENDING` fuera de aviso gasta la única carga. Al acabar el aviso revelado, pasa a `USED`; si el duelo acaba antes, el estado se descarta. En `LOCKED/PENDING/REVEALING/USED`, solicitudes repetidas no cambian estado. E y botón en el mismo paso cuentan como una solicitud. `Tab` permite llegar al botón listo; el botón bloqueado o usado no solicita combate.

## Consulta de ataque → texto → efecto

1. El paso de simulación procesa la solicitud antes de avanzar el patrón. Cuenta como «durante aviso» sólo si al inicio de ese paso el patrón está en `WARNING` y `remainingWarningSec > 0`. Si ya está en `ACTIVE`, se consulta el próximo ataque.
2. En `WARNING`, Combate vincula el `attackInstanceId` presente, muestra «Ataque actual», `patternId`, respuesta y `safeGeometry` ya fijada. Suma **0,8 s una sola vez** al aviso restante. El reloj del nivel sigue corriendo.
3. En `INTER_ATTACK_DELAY`, `ACTIVE` o `RECOVERY`, `peekNextAttack()` devuelve patrón/revisión sin consumir ni sortear la cola. El Visor muestra «Próximo ataque» y una respuesta general; queda `PENDING`. Al empezar el `WARNING` de la instancia programada, vincula ID, fija geometría real, añade 0,8 s una vez y muestra la respuesta específica. Nunca extiende el ataque activo, la recuperación ni otro aviso.
4. Si NULL cruza media vida, termina acción y recuperación y reinicia la secuencia de fase 2. Un `PENDING` actualiza su patrón a la nueva cola, conserva su extensión pendiente y no cobra otra carga. Un `REVEALING` ya unido al aviso actual termina normalmente. No aparece un patrón descartado como futuro.
5. El Barrido final elige lado **al comenzar WARNING** por la ruta alcanzable más corta según [1.3](FASE_1_3_FICHAS_ARENAS.md). Antes sólo se anuncia «Ve a la franja marcada SEGURA cuando aparezca»; después se muestra el lado exacto con borde, símbolo, texto y trama diferente del peligro. Otras orientaciones dinámicas siguen la misma regla. UI no inventa un lado antes de fijarlo.
6. Pausa, pestaña oculta o pérdida de foco congelan aviso, extensión y estado del Visor. E no actúa en `PAUSE`. Si Alma cancela el ataque anunciado o termina el duelo, se muestra cancelación o se retira el aviso; la carga no se devuelve ni se ejecuta un ataque fantasma.

Salida de sólo lectura para UI: `{visorState, patternId, attackInstanceId?, predictionKind, responseText, safeGeometry?, warningExtraSecApplied}`. `attackInstanceId` y `safeGeometry` sólo existen cuando el aviso concreto los fija. Los telegráficos normales permanecen aunque el Visor siga bloqueado. El HUD distingue «Visor no descubierto», «Visor listo: una carga» y «Visor usado en este combate»; con `PENDING/REVEALING` indica consulta ya gastada.

## Matriz de aceptación futura, sin ejecutar

| IDs | Escenarios a verificar en fase 3 | Resultado observable |
|---|---|---|
| EE-01–04 | Orden G/U/Í/A, ambas grafías y variantes de caja/espacios, vacío, error y consulta repetida. | Pistas legibles; una sola adquisición; mensajes y foco correctos; cero penalización. |
| EE-05–06 | Recarga/nueva campaña/fallo de almacenamiento; E/botón sin desbloqueo. | Sólo hallazgo persiste si se pudo guardar; ningún uso de carga inexistente. |
| EE-07–09 | Uso durante/fuera del aviso, solicitudes repetidas, reintento y pausa. | Cola no se consume al consultar; +0,8 s una vez; una carga por combate y reinicio correcto. |
| EE-10–12 | Tres estudiantes × cuatro jefes, cambio de fase de NULL y Barrido final. | Mensaje corresponde al patrón real y a la zona fijada, sin predicción obsoleta. |
| EE-13–15 | Pestaña oculta, campaña sin secreto, teclado/sonido apagado/destellos reducidos. | Reloj congelado al pausar; final normal sin Visor; avisos accesibles. |
| EE-16–17 | Cancelación del ataque por Alma, KO o fin del duelo con predicción pendiente. | Sin daño ni ataque fantasma, sin devolución ni arrastre de carga. |

Cada ejecución futura registrará navegador, estado inicial, pasos, `patternId` anunciado/ejecutado o causa de cancelación, segundos de aviso antes/después, carga y evidencia. **Puerta 1.5:** la ayuda tiene recorrido, fuente de verdad, respuesta, efecto y errores definidos; los casos no convierten la ayuda en requisito para completar la campaña.
