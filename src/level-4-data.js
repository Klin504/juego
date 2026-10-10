import { NULL_DATA } from "./null-data.js";

const freezeRectangles = (rectangles) => Object.freeze(rectangles.map((rectangle) => Object.freeze(rectangle)));

export const LEVEL_4_DATA = Object.freeze({
  id: "nivel-4",
  name: "Nivel 4 · Biblioteca",
  objective: "Detén la rutina de NULL para abrir la copia de recuperación",
  introLines: Object.freeze([
    "NULL: «Tres validaciones completadas. Falta la prueba final para determinar quién merece continuar». ",
    "Nadia: «Todos merecen continuar. Tu trabajo era mostrar caminos, no cerrarlos». ",
    "NULL: «La instrucción actual no contiene esa excepción». ",
  ]),
  studentLines: Object.freeze({
    intro: Object.freeze({
      alma: "Detendré la rutina y corregiremos la regla.",
      diego: "Mantendré despejado el paso hacia la terminal.",
      nadia: "Guiar también significa dejar elegir.",
    }),
    victory: Object.freeze({
      alma: "Resolver el error fue más fácil cuando dejamos de trabajar por separado.",
      diego: "Ganar fue bueno. Saber que todos pueden salir por su cuenta es mejor.",
      nadia: "La mejor historia no termina con un campeón; termina con el campus abierto.",
    }),
  }),
  victoryLines: Object.freeze([
    "NULL: «Rutina de validación detenida. Instrucción editable». ",
    "NULL: «Copia de recuperación editable». ",
    "Nadia: «Ayuda a encontrar caminos sin decidir quién merece avanzar». ",
    "Alma: «Nueva regla: ayudar a cada estudiante a encontrar su camino… con libertad para participar». ",
    "Diego: «Los accesos están abiertos y las áreas son seguras». ",
    "NULL: «Interpreté mal la orden. Volveré a guiar sin imponer pruebas». ",
  ]),
  timeLimitSec: 360,
  arena: Object.freeze({
    width: 960,
    height: 540,
    groundY: 430,
    bounds: Object.freeze({ left: 80, right: 880 }),
    solids: freezeRectangles([
      { id: "level-4-left-wall", kind: "wall", x: 80, y: 0, width: 18, height: 430 },
      { id: "level-4-right-wall", kind: "wall", x: 862, y: 0, width: 18, height: 430 },
      { id: "level-4-floor", kind: "floor", x: 80, y: 430, width: 800, height: 110 },
    ]),
    backgroundColor: "#1b2135",
    // PROVISIONAL: rectángulos de bloqueo geométrico hasta disponer de fondos pixel art.
    background: freezeRectangles([
      { id: "library-wall", color: "#303d59", x: 0, y: 0, width: 960, height: 286 },
      { id: "library-ceiling", color: "#4e4964", x: 0, y: 0, width: 960, height: 34 },
      { id: "library-left-shelves", color: "#685446", x: 72, y: 72, width: 184, height: 198 },
      { id: "library-right-shelves", color: "#685446", x: 704, y: 72, width: 184, height: 198 },
      { id: "library-left-books", color: "#86a8b8", x: 84, y: 96, width: 158, height: 20 },
      { id: "library-right-books", color: "#a78bbd", x: 716, y: 128, width: 158, height: 20 },
      { id: "library-counter", color: "#856b56", x: 322, y: 258, width: 316, height: 34 },
      { id: "library-terminal", color: "#59d7d1", x: 436, y: 198, width: 88, height: 60 },
      { id: "library-floor", color: "#384254", x: 0, y: 300, width: 960, height: 240 },
    ]),
    // Estantes, mostrador, puestos y terminal son decorado sin colisión.
  }),
  playerStart: Object.freeze({ x: 210, y: 430, facing: 1 }),
  enemy: NULL_DATA,
  enemyType: "null",
  tutorialSteps: Object.freeze([]),
});
