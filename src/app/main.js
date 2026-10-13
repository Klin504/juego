/** Punto de entrada: conecta Canvas, entrada, audio, estados y bucle del juego. */

import { fitCanvas } from "../core/canvas-viewport.js";
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  STATE,
} from "../core/constants.js";
import { GameClock } from "../core/game-clock.js";
import { GameLoop } from "../core/game-loop.js";
import { InputController } from "../input/input-controller.js";
import { StateMachine } from "../core/state-machine.js";
import { createStates } from "./states.js";
import { VALID_STATE_TRANSITIONS } from "../campaign/campaign-transitions.js";

const canvas = document.querySelector("#arena");
const context = canvas.getContext("2d", { alpha: false });
const errorMessage = document.querySelector("#error-canvas");

// El juego solo se inicia si el navegador pudo crear un contexto Canvas 2D.
if (!context) {
  errorMessage.hidden = false;
} else {
  canvas.width = LOGICAL_WIDTH;
  canvas.height = LOGICAL_HEIGHT;
  canvas.setAttribute("aria-label", "Chilos Fighters. Menú: J nueva campaña, H guía, B archivo y S sonido. A/D o flechas para elegir y Enter para abrir.");

  // Estos controladores comparten el mismo reloj y la misma máquina de estados.
  const clock = new GameClock();
  const input = new InputController();
  let stateMachine;
  const states = createStates(clock, input, (nextState) => stateMachine.transition(nextState));
  stateMachine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  const btnVisor = document.querySelector("#btn-visor");

  const render = (_framesPerSecond, alpha) => {
    stateMachine.render(context, stateMachine.snapshot, alpha);
    if (btnVisor) btnVisor.hidden = stateMachine.currentName !== STATE.PLAYING;
  };

  // La lógica avanza a paso fijo; el dibujo se ejecuta cada fotograma visible.
  const loop = new GameLoop(
    (dt) => stateMachine.update(dt),
    (framesPerSecond, alpha) => render(framesPerSecond, alpha),
  );
  input.connect({ stateMachine, clock, loop, commands: states.commands });

  // El botón táctil reutiliza la misma acción de teclado que activa el Visor.
  if (btnVisor) {
    btnVisor.addEventListener("click", () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyE", key: "e" }));
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyE", key: "e" }));
      }, 50);
    });
  }

  const resize = () => fitCanvas(canvas, context);
  window.addEventListener("resize", resize);
  input.mount();
  resize();
  loop.start();
}
