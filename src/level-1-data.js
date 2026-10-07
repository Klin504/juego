import { CHILO_DATA } from "./boss-data.js";
import { LEVEL_1_TUTORIAL_STEPS } from "./tutorial-data.js";

const freezeRectangles = (rectangles) => Object.freeze(rectangles.map((rectangle) => Object.freeze(rectangle)));

export const LEVEL_1_DATA = Object.freeze({
  id: "nivel-1",
  name: "Nivel 1 · Estacionamiento",
  timeLimitSec: 150,
  arena: Object.freeze({
    width: 960,
    height: 540,
    groundY: 430,
    bounds: Object.freeze({ left: 80, right: 880 }),
    solids: freezeRectangles([
      { id: "level-1-left-wall", kind: "wall", x: 80, y: 0, width: 18, height: 430 },
      { id: "level-1-right-wall", kind: "wall", x: 862, y: 0, width: 18, height: 430 },
      { id: "level-1-floor", kind: "floor", x: 80, y: 430, width: 800, height: 110 },
    ]),
    backgroundColor: "#152132",
    // PROVISIONAL: posiciones, formas y paleta de las figuras de fondo no están especificadas en la ficha.
    background: freezeRectangles([
      { id: "pavement", color: "#394858", x: 0, y: 300, width: 960, height: 240 },
      { id: "campus-building", color: "#56677a", x: 280, y: 70, width: 680, height: 180 },
      { id: "building-shadow", color: "#34465a", x: 280, y: 225, width: 680, height: 25 },
      { id: "building-door", color: "#26394c", x: 700, y: 145, width: 65, height: 105 },
      { id: "car-left-body", color: "#527f91", x: 120, y: 275, width: 112, height: 45 },
      { id: "car-left-window", color: "#9ac6ca", x: 145, y: 281, width: 58, height: 18 },
      { id: "car-right-body", color: "#9b665b", x: 650, y: 270, width: 88, height: 42 },
      { id: "car-right-window", color: "#b7d1ca", x: 669, y: 276, width: 45, height: 16 },
      { id: "cone-left", color: "#ffbc58", x: 75, y: 402, width: 10, height: 28 },
      { id: "cone-right", color: "#ffbc58", x: 875, y: 402, width: 10, height: 28 },
      { id: "palm-left-trunk", color: "#74533d", x: 246, y: 200, width: 12, height: 100 },
      { id: "palm-left-crown", color: "#4a876f", x: 215, y: 180, width: 75, height: 28 },
      { id: "palm-right-trunk", color: "#74533d", x: 810, y: 198, width: 12, height: 100 },
      { id: "palm-right-crown", color: "#4a876f", x: 780, y: 178, width: 75, height: 28 },
    ]),
  }),
  playerStart: Object.freeze({ x: 210, y: 430, facing: 1 }),
  enemy: CHILO_DATA,
  enemyType: "chilo",
  tutorialSteps: LEVEL_1_TUTORIAL_STEPS,
});
