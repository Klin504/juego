import { fitCanvas } from "./canvas-viewport.js";
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  STATE,
} from "./constants.js";
import { GameClock } from "./game-clock.js";
import { GameLoop } from "./game-loop.js";
import { InputController } from "./input-controller.js";
import { StateMachine } from "./state-machine.js";
import { createStates } from "./states.js";

const FPS_POSITION_X = 18;
const FPS_POSITION_Y = 26;
const FPS_FONT = "16px 'Courier New', monospace";
const FPS_COLOR = "#f2f4f8";

const canvas = document.querySelector("#arena");
const context = canvas.getContext("2d", { alpha: false });
const errorMessage = document.querySelector("#error-canvas");

if (!context) {
  errorMessage.hidden = false;
} else {
  canvas.width = LOGICAL_WIDTH;
  canvas.height = LOGICAL_HEIGHT;

  const clock = new GameClock();
  const input = new InputController();
  const states = createStates(clock, input);
  const transitions = new Map([
    [STATE.MENU, new Set([STATE.PLAYING])],
    [STATE.PLAYING, new Set([STATE.PAUSED, STATE.GAME_OVER])],
    [STATE.PAUSED, new Set([STATE.PLAYING, STATE.MENU])],
    [STATE.GAME_OVER, new Set([STATE.MENU])],
  ]);
  const stateMachine = new StateMachine(states, transitions, STATE.MENU);

  const render = (framesPerSecond, alpha) => {
    stateMachine.render(context, stateMachine.snapshot, alpha);
    context.textAlign = "left";
    context.textBaseline = "top";
    context.font = FPS_FONT;
    context.fillStyle = FPS_COLOR;
    context.fillText(`FPS: ${framesPerSecond || "…"}`, FPS_POSITION_X, FPS_POSITION_Y);
  };

  const loop = new GameLoop(
    (dt) => stateMachine.update(dt),
    (framesPerSecond, alpha) => render(framesPerSecond, alpha),
  );
  input.connect({ stateMachine, clock, loop });

  const resize = () => fitCanvas(canvas, context);
  window.addEventListener("resize", resize);
  input.mount();
  resize();
  loop.start();
}
