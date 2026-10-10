import { VERA_DATA } from "./vera-data.js";

const freezeRectangles = (rectangles) => Object.freeze(rectangles.map((rectangle) => Object.freeze(rectangle)));

export const LEVEL_2_DATA = Object.freeze({
  id: "nivel-2",
  name: "Nivel 2 · Cancha",
  objective: "Lee las líneas del suelo y gana el pase de Vera",
  introLines: Object.freeze([
    "NULL: «Prueba 2 de 4. Control del espacio pendiente».",
    "Vera: «El marcador cerró la cancha. Yo elijo competir para abrirles paso».",
    "Chilo: «Miren la línea y el regreso del balón».",
  ]),
  studentLines: Object.freeze({
    intro: Object.freeze({
      alma: "El marcador registra el resultado. Leeré sus señales.",
      diego: "Sólo tú y yo dentro de las líneas, Vera.",
      nadia: "Competiremos por elección, no por obligación.",
    }),
    victory: Object.freeze({
      alma: "Allí podremos averiguar qué cambió.",
      diego: "Mantengamos libre el paso hacia el laboratorio.",
      nadia: "Seguimos las pistas, ahora con Vera de nuestro lado.",
    }),
  }),
  victoryLines: Object.freeze([
    "NULL: «Victoria registrada. Segunda marca obtenida».",
    "Vera: «Bien jugado. El laboratorio guarda el registro de esa orden».",
    "Vera mantiene despejado el acceso y se vuelve aliada.",
  ]),
  timeLimitSec: 210,
  arena: Object.freeze({
    width: 960,
    height: 540,
    groundY: 430,
    bounds: Object.freeze({ left: 80, right: 880 }),
    solids: freezeRectangles([
      { id: "level-2-left-wall", kind: "wall", x: 80, y: 0, width: 18, height: 430 },
      { id: "level-2-right-wall", kind: "wall", x: 862, y: 0, width: 18, height: 430 },
      { id: "level-2-floor", kind: "floor", x: 80, y: 430, width: 800, height: 110 },
    ]),
    backgroundColor: "#142333",
    // PROVISIONAL: composición y colores aproximan la cancha hasta disponer del fondo pixel art final.
    background: freezeRectangles([
      { id: "court-floor", color: "#496f79", x: 0, y: 260, width: 960, height: 280 },
      { id: "stands", color: "#42566c", x: 55, y: 130, width: 850, height: 125 },
      { id: "stands-upper", color: "#586b80", x: 75, y: 105, width: 810, height: 32 },
      { id: "fence", color: "#263d4c", x: 60, y: 220, width: 840, height: 8 },
      { id: "backboard", color: "#d8e7e4", x: 480, y: 158, width: 68, height: 8 },
      { id: "basket", color: "#e89155", x: 495, y: 176, width: 38, height: 5 },
      { id: "court-mid-line", color: "#90b3a1", x: 478, y: 270, width: 4, height: 160 },
      { id: "court-circle-top", color: "#90b3a1", x: 410, y: 300, width: 140, height: 3 },
      { id: "court-circle-bottom", color: "#90b3a1", x: 410, y: 370, width: 140, height: 3 },
      { id: "court-edge-left", color: "#90b3a1", x: 98, y: 298, width: 3, height: 132 },
      { id: "court-edge-right", color: "#90b3a1", x: 859, y: 298, width: 3, height: 132 },
    ]),
    // Decorado fijo de cancha; no añade colisiones ni peligros ambientales.
    mechanics: Object.freeze({ paintedLinesAreDecorative: true }),
  }),
  playerStart: Object.freeze({ x: 210, y: 430, facing: 1 }),
  enemy: VERA_DATA,
  enemyType: "vera",
  tutorialSteps: Object.freeze([]),
});
