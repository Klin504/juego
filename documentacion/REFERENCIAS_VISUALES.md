# Chilos Fighters — referencias visuales recibidas

**Fuente:** archivos colocados por el creador en `img/`. El nombre de cada carpeta fija el número del nivel. Las imágenes se muestran en la documentación interactiva como referencias. El creador confirmó que los cuatro escenarios finales deben tener estética pixel art.

| Nivel | Lugar observado | Archivos | Rasgos que deben conservarse |
|---|---|---:|---|
| 1 | Estacionamiento de la UJCV | 4 fotos JPEG en `img/nivel 1/` | Pavimento adoquinado, fachada, palmeras, filas de vehículos y pasillo despejado al centro. |
| 2 | Cancha | 4 capturas PNG en `img/nivel 2/` | Cercado, canasta, líneas del piso, gradas azules y cielo abierto. |
| 3 | Laboratorio de química | 3 capturas PNG en `img/nivel 3/` | Techo de madera, mesones blancos, fregaderos, sillas y modelos didácticos. |
| 4 | Biblioteca | 3 capturas PNG en `img/nivel 4/` | Mostrador claro, estanterías, puestos de consulta y techo de madera. |

## Personajes y jefes

| Personaje | Archivo | Uso actual |
|---|---|---|
| Chilo | [Foto de jefe 1](<../img/jefe 1/WhatsApp Image 2026-09-30 at 1.41.52 PM.jpeg>) | Referencia aportada: mascota de cabeza blanca de ave, pico amarillo, camisa azul con «CHILO» y pantalón azul. |
| Vera «La Capitana» Pineda | [Concepto de jefe 2](<../img/jefe 2/vera-la-capitana.png>) | Arte original generado para el proyecto: estudiante deportista con balón y uniforme azul/turquesa. |
| CÁTODO-3 | [Concepto de jefe 3](<../img/jefe 3/catodo-3.png>) | Arte original generado para el proyecto: autómata blanco y azul con visor y efectos cian. |
| NULL | Icono visible en varias capturas de niveles 2–4 | Referencia de nombre y motivo visual; hace falta un sprite de combate independiente. |

## Selección inicial de imagen por arena

| Arena | Archivo sugerido para la vista previa | Razón |
|---|---|---|
| Estacionamiento | [Foto frontal](<../img/nivel 1/WhatsApp Image 2026-09-30 at 1.31.28 PM.jpeg>) | Hay espacio central para los dos luchadores y la fachada identifica el lugar. |
| Cancha | [Vista de la canasta](<../img/nivel 2/Captura de pantalla 2026-09-30 133430.png>) | Líneas y aro sitúan el duelo sin cargar los lados. |
| Laboratorio | [Vista de los mesones](<../img/nivel 3/Captura de pantalla 2026-09-30 133804.png>) | El mobiliario y el techo dan una silueta reconocible. |
| Biblioteca | [Vista del mostrador](<../img/nivel 4/Captura de pantalla 2026-09-30 133116.png>) | Mostrador y estanterías permiten que la IA se proyecte en el fondo. |

## Tratamiento para producción

- Las capturas de los niveles 2–4 incluyen la interfaz del recorrido virtual: logo, selector de lugar, flecha, icono de NULL, botón de información y un círculo inferior. Esos elementos **no** son la interfaz del juego y se omiten al adaptar los fondos a pixel art.
- Las fotografías del estacionamiento muestran matrículas y detalles de vehículos. Esos datos no deben ser reconocibles en el fondo pixel art final.
- Los conceptos de Vera y CÁTODO-3 tienen fondo transparente y funcionan para documentación y selección de jefe. Todavía necesitan sprites de reposo, ataque, daño y derrota si se construye el combate.
- El sprite de Chilo debe respetar la referencia recibida. El icono pequeño de NULL sirve de inspiración, pero el jefe final requiere una silueta propia y legible a escala de juego.

## Prompts usados para el arte original

- **Vera:** concepto pixel art de una estudiante capitana de baloncesto, uniforme genérico azul marino y turquesa, balón, postura de combate, sin logos ni texto, fondo transparente.
- **CÁTODO-3:** concepto pixel art de autómata ficticio de laboratorio, armadura blanca y azul, visor y bobinas cian, pulso de luz, sin logos ni texto, fondo transparente.

Ambas imágenes se generaron con la herramienta integrada de ImageGen y se guardaron en el proyecto como conceptos originales.
