import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./constants.js";

const ROOM_BACKGROUND = "#101622";
const WALL_COLOR = "#35465c";
const FLOOR_COLOR = "#50677f";
const PLATFORM_COLOR = "#47d7c8";
const EDGE_COLOR = "#d7e1ec";
const LABEL_COLOR = "#f2f4f8";
const LABEL_FONT = "14px 'Courier New', monospace";
const LABEL_X = 24;
const LABEL_Y = 24;

export const TEST_ROOM_START = Object.freeze({ x: 210, y: 430 });

// PROVISIONALES de prueba: alturas alcanzables con el salto configurado, no son la arena final.
export const TEST_ROOM_SOLIDS = Object.freeze([
  Object.freeze({ id: "wall-left", kind: "wall", x: 80, y: 0, width: 18, height: 430 }),
  Object.freeze({ id: "wall-right", kind: "wall", x: 862, y: 0, width: 18, height: 430 }),
  Object.freeze({ id: "ceiling", kind: "wall", x: 80, y: 0, width: 800, height: 16 }),
  Object.freeze({ id: "floor", kind: "floor", x: 80, y: 430, width: 800, height: 110 }),
  Object.freeze({ id: "platform-1", kind: "platform", x: 300, y: 320, width: 150, height: 16 }),
  Object.freeze({ id: "platform-2", kind: "platform", x: 500, y: 290, width: 150, height: 16 }),
  Object.freeze({ id: "platform-3", kind: "platform", x: 730, y: 320, width: 130, height: 16 }),
]);

export class TestRoom {
  get solids() {
    return TEST_ROOM_SOLIDS;
  }

  render(ctx, showControls = true) {
    ctx.fillStyle = ROOM_BACKGROUND;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    for (const solid of TEST_ROOM_SOLIDS) {
      ctx.fillStyle =
        solid.kind === "floor"
          ? FLOOR_COLOR
          : solid.kind === "platform"
            ? PLATFORM_COLOR
            : WALL_COLOR;
      ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      ctx.strokeStyle = EDGE_COLOR;
      ctx.lineWidth = 1;
      ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
    }

    if (!showControls) return;
    ctx.fillStyle = LABEL_COLOR;
    ctx.font = LABEL_FONT;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      "A/D o ←/→ mover · W/↑/Espacio saltar · S cubrir · R atacar · Shift especial · F2 combate",
      LABEL_X,
      LABEL_Y,
    );
  }
}
