import { CATODO3_DATA } from "./catodo3-data.js";

const freezeRectangles = (rectangles) => Object.freeze(rectangles.map((rectangle) => Object.freeze(rectangle)));

export const LEVEL_3_DATA = Object.freeze({
  id: "nivel-3",
  name: "Nivel 3 · Laboratorio",
  objective: "Evita los sensores de CÁTODO-3 y recupera el registro",
  introLines: Object.freeze([
    "CÁTODO-3: «Acceso al registro: denegado. Iniciando demostración defensiva».",
    "Alma: «Su rutina está recibiendo instrucciones de NULL. Si la detenemos, podremos leer el historial».",
    "Nadia: «Hay señales en el suelo antes de cada pulso. Sí podemos pasar».",
  ]),
  studentLines: Object.freeze({
    intro: Object.freeze({
      alma: "Detendré la defensa sin perder el registro.",
      diego: "Mantengan distancia. Iré por el corredor seguro.",
      nadia: "Seguiré la franja apagada hasta el registro.",
    }),
    victory: Object.freeze({
      alma: "Aquí está: NULL nunca recibió una condición de consentimiento.",
      diego: "Abramos el paso con cuidado. Queda una prueba.",
      nadia: "La copia que necesitamos está en la biblioteca.",
    }),
  }),
  victoryLines: Object.freeze([
    "NULL: «Victoria registrada. Tercera marca obtenida».",
    "CÁTODO-3: «Modo seguro. Registro disponible».",
    "El registro señala la terminal de consulta de la biblioteca.",
  ]),
  timeLimitSec: 270,
  arena: Object.freeze({
    width: 960,
    height: 540,
    groundY: 430,
    bounds: Object.freeze({ left: 80, right: 880 }),
    solids: freezeRectangles([
      { id: "level-3-left-wall", kind: "wall", x: 80, y: 0, width: 18, height: 430 },
      { id: "level-3-right-wall", kind: "wall", x: 862, y: 0, width: 18, height: 430 },
      { id: "level-3-floor", kind: "floor", x: 80, y: 430, width: 800, height: 110 },
    ]),
    backgroundColor: "#182632",
    // PROVISIONAL: composición y paleta son bloqueos geométricos mientras se producen los fondos de fase 3.
    background: freezeRectangles([
      { id: "lab-wall", color: "#526878", x: 0, y: 0, width: 960, height: 260 },
      { id: "lab-wood-ceiling", color: "#7a604a", x: 0, y: 0, width: 960, height: 34 },
      { id: "lab-window-left", color: "#91bdc5", x: 80, y: 65, width: 145, height: 100 },
      { id: "lab-window-right", color: "#91bdc5", x: 735, y: 65, width: 145, height: 100 },
      { id: "lab-model-shelf", color: "#324957", x: 310, y: 148, width: 340, height: 62 },
      { id: "lab-beaker-a", color: "#9ed8d2", x: 360, y: 119, width: 28, height: 29 },
      { id: "lab-beaker-b", color: "#d8c47f", x: 421, y: 128, width: 24, height: 20 },
      { id: "lab-mesón-left", color: "#d9e2df", x: 95, y: 250, width: 230, height: 34 },
      { id: "lab-sink-left", color: "#7aa5ac", x: 152, y: 284, width: 65, height: 18 },
      { id: "lab-mesón-right", color: "#d9e2df", x: 635, y: 250, width: 230, height: 34 },
      { id: "lab-sink-right", color: "#7aa5ac", x: 742, y: 284, width: 65, height: 18 },
      { id: "lab-floor", color: "#344e5a", x: 0, y: 300, width: 960, height: 240 },
    ]),
    // Mesones, fregaderos, modelos y ventanas son decorado; sensores de combate pertenecen a CÁTODO-3.
  }),
  playerStart: Object.freeze({ x: 210, y: 430, facing: 1 }),
  enemy: CATODO3_DATA,
  enemyType: "catodo3",
  tutorialSteps: Object.freeze([]),
});
