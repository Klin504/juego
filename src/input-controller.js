import {
  ACTION,
  BUFFERED_ACTIONS,
  CONTINUOUS_ACTIONS,
  DEFAULT_ACTION_BINDINGS,
} from "./action-map.js";
import { MAX_INPUT_BUFFER_MS } from "./physics-config.js";
import { STATE } from "./constants.js";

const SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Space",
]);

export class InputController {
  #bindings;
  #heldCodes = new Set();
  #commandHeldCodes = new Set();
  #pendingPressed = new Map();
  #pendingReleased = new Set();
  #shiftUsedAsModifier = false;
  #stateMachine = null;
  #clock = null;
  #loop = null;
  #mounted = false;
  #handleKeyDown;
  #handleKeyUp;
  #handleVisibilityChange;
  #handleBlur;
  #commands = {};

  constructor(bindings = DEFAULT_ACTION_BINDINGS) {
    this.#bindings = new Map(
      Object.entries(bindings).map(([action, codes]) => [action, new Set(codes)]),
    );
    this.#handleKeyDown = this.handleKeyDown.bind(this);
    this.#handleKeyUp = this.handleKeyUp.bind(this);
    this.#handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.#handleBlur = this.handleBlur.bind(this);
  }

  connect({ stateMachine, clock, loop, commands = {} }) {
    this.#stateMachine = stateMachine;
    this.#clock = clock;
    this.#loop = loop;
    this.#commands = commands;
  }

  bindAction(action, codes) {
    if (!this.#bindings.has(action) || codes.length === 0) {
      throw new Error(`Acción o asignación de teclado no válida: ${action}.`);
    }
    this.#bindings.set(action, new Set(codes));
    this.clear();
  }

  mount() {
    if (this.#mounted) return;
    window.addEventListener("keydown", this.#handleKeyDown);
    window.addEventListener("keyup", this.#handleKeyUp);
    window.addEventListener("blur", this.#handleBlur);
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);
    this.#mounted = true;
  }

  unmount() {
    if (!this.#mounted) return;
    window.removeEventListener("keydown", this.#handleKeyDown);
    window.removeEventListener("keyup", this.#handleKeyUp);
    window.removeEventListener("blur", this.#handleBlur);
    document.removeEventListener("visibilitychange", this.#handleVisibilityChange);
    this.#mounted = false;
    this.clear();
  }

  clear() {
    this.#heldCodes.clear();
    this.#commandHeldCodes.clear();
    this.#pendingPressed.clear();
    this.#pendingReleased.clear();
    this.#shiftUsedAsModifier = false;
  }

  snapshotForStep() {
    const nowMs = performance.now();
    const pressed = new Set();
    let jumpBufferRemainingSeconds = 0;

    for (const [action, pressedAtMs] of this.#pendingPressed) {
      const ageMs = nowMs - pressedAtMs;
      if (BUFFERED_ACTIONS.has(action) && ageMs > MAX_INPUT_BUFFER_MS) continue;
      pressed.add(action);
      if (action === ACTION.JUMP) {
        jumpBufferRemainingSeconds = Math.max(
          0,
          (MAX_INPUT_BUFFER_MS - ageMs) / 1000,
        );
      }
    }

    const held = this.#getHeldActions();
    const released = new Set(this.#pendingReleased);
    this.#pendingPressed.clear();
    this.#pendingReleased.clear();

    const stateFor = (action) =>
      Object.freeze({
        pressed: pressed.has(action),
        held: held.has(action),
        released: released.has(action),
      });
    const leftHeld = held.has(ACTION.MOVE_LEFT);
    const rightHeld = held.has(ACTION.MOVE_RIGHT);

    return Object.freeze({
      moveX: leftHeld === rightHeld ? 0 : leftHeld ? -1 : 1,
      moveLeft: stateFor(ACTION.MOVE_LEFT),
      moveRight: stateFor(ACTION.MOVE_RIGHT),
      jump: Object.freeze({
        ...stateFor(ACTION.JUMP),
        bufferRemainingSeconds: jumpBufferRemainingSeconds,
      }),
      guard: stateFor(ACTION.GUARD),
      normalAttack: stateFor(ACTION.NORMAL_ATTACK),
      specialTap: stateFor(ACTION.SPECIAL_TAP),
      visor: stateFor(ACTION.VISOR),
      pause: stateFor(ACTION.PAUSE_TOGGLE),
      debugToggle: stateFor(ACTION.DEBUG_TOGGLE),
      restartLevel: stateFor(ACTION.RESTART_LEVEL),
    });
  }

  handleKeyDown(event) {
    if (event.isComposing) return;
    if (event.ctrlKey || event.altKey || event.metaKey) {
      if (this.#isShiftHeld()) this.#shiftUsedAsModifier = true;
      return;
    }

    const code = event.code;
    if (code === "Tab" && this.#isShiftHeld()) {
      this.#shiftUsedAsModifier = true;
      return;
    }
    if (event.repeat || this.#heldCodes.has(code) || this.#commandHeldCodes.has(code)) return;

    if (["Digit2", "Digit3", "Digit4"].includes(code) && this.#stateMachine.currentName === STATE.SELECT_FIGHTER) {
      event.preventDefault();
      const action = ({ Digit2: ACTION.LEVEL_TWO_HARNESS, Digit3: ACTION.LEVEL_THREE_HARNESS, Digit4: ACTION.LEVEL_FOUR_HARNESS })[code];
      this.#commands.handle?.(action, STATE.SELECT_FIGHTER, (next, resetClock = false) => this.#transition(next, resetClock));
      this.#commandHeldCodes.add(code);
      return;
    }

    const actions = this.#actionsForCode(code);
    if (actions.length === 0) return;

    const currentState = this.#stateMachine.currentName;
    if (SCROLL_KEYS.has(code) && currentState !== STATE.PLAYING) {
      event.preventDefault();
    }
    if (this.#handleStateCommand(event, actions, currentState)) {
      this.#commandHeldCodes.add(code);
      return;
    }
    if (currentState !== STATE.PLAYING) return;

    const heldBefore = this.#getHeldActions();
    this.#heldCodes.add(code);
    const heldAfter = this.#getHeldActions();
    for (const action of actions) {
      if (action === ACTION.SPECIAL_TAP) continue;
      if (CONTINUOUS_ACTIONS.has(action)) {
        if (!heldBefore.has(action) && heldAfter.has(action)) {
          this.#queuePress(action);
        }
      } else if (!heldBefore.has(action)) {
        this.#queuePress(action);
      }
    }

    if (this.#isShiftCode(code) && !this.#otherShiftIsHeld(code)) {
      this.#shiftUsedAsModifier = false;
    }
  }

  handleKeyUp(event) {
    const code = event.code;
    if (this.#commandHeldCodes.delete(code)) return;
    if (!this.#heldCodes.has(code)) return;

    const actions = this.#actionsForCode(code);
    const heldBefore = this.#getHeldActions();
    this.#heldCodes.delete(code);
    const heldAfter = this.#getHeldActions();
    for (const action of actions) {
      if (
        action !== ACTION.SPECIAL_TAP &&
        heldBefore.has(action) &&
        !heldAfter.has(action)
      ) {
        this.#pendingReleased.add(action);
      }
    }

    if (actionIncludes(actions, ACTION.SPECIAL_TAP) && !this.#isShiftHeld()) {
      if (!this.#shiftUsedAsModifier) {
        this.#queuePress(ACTION.SPECIAL_TAP);
        this.#pendingReleased.add(ACTION.SPECIAL_TAP);
      }
      this.#shiftUsedAsModifier = false;
    }
  }

  handleVisibilityChange() {
    if (document.hidden) this.pauseForLostFocus();
  }

  handleBlur() {
    this.pauseForLostFocus();
  }

  pauseForLostFocus() {
    this.clear();
    if (this.#stateMachine.currentName === STATE.PLAYING) {
      this.#transition(STATE.PAUSED);
    }
  }

  #handleStateCommand(event, actions, currentState) {
    const command = (action) => this.#commands.handle?.(action, currentState, (next, resetClock = false) => this.#transition(next, resetClock));
    if (currentState === STATE.MENU && actionIncludes(actions, ACTION.CONFIRM)) {
      event.preventDefault(); command(ACTION.CONFIRM); return true;
    }
    if (currentState === STATE.SELECT_FIGHTER) {
      if (event.code === "Digit2") { event.preventDefault(); command(ACTION.LEVEL_TWO_HARNESS); return true; }
      if (actionIncludes(actions, ACTION.SELECT_PREVIOUS)) { event.preventDefault(); command(ACTION.SELECT_PREVIOUS); return true; }
      if (actionIncludes(actions, ACTION.SELECT_NEXT)) { event.preventDefault(); command(ACTION.SELECT_NEXT); return true; }
      if (actionIncludes(actions, ACTION.CONFIRM)) { event.preventDefault(); command(ACTION.CONFIRM); return true; }
      if (actionIncludes(actions, ACTION.MENU_TEST)) { event.preventDefault(); command(ACTION.MENU_TEST); return true; }
      if (actionIncludes(actions, ACTION.LEVEL_TWO_HARNESS)) { event.preventDefault(); command(ACTION.LEVEL_TWO_HARNESS); return true; }
      if (actionIncludes(actions, ACTION.LEVEL_THREE_HARNESS)) { event.preventDefault(); command(ACTION.LEVEL_THREE_HARNESS); return true; }
    }
    if (currentState === STATE.LEVEL_INTRO) {
      if (actionIncludes(actions, ACTION.CONFIRM)) { event.preventDefault(); command(ACTION.CONFIRM); return true; }
      if (actionIncludes(actions, ACTION.MENU_TEST)) { event.preventDefault(); command(ACTION.MENU_TEST); return true; }
    }
    if (currentState === STATE.PAUSED) {
      if (actionIncludes(actions, ACTION.RESTART_LEVEL)) { event.preventDefault(); command(ACTION.RESTART_LEVEL); return true; }
      if (actionIncludes(actions, ACTION.MENU_TEST)) { event.preventDefault(); command(ACTION.MENU_TEST); return true; }
      if (actionIncludes(actions, ACTION.CONFIRM)) { event.preventDefault(); command(ACTION.CONFIRM); return true; }
      if (actionIncludes(actions, ACTION.PAUSE_TOGGLE)) {
        event.preventDefault();
        if (this.#commands.cancelAbandon?.()) return true;
        this.#transition(STATE.PLAYING);
        return true;
      }
    }
    if (currentState === STATE.GAME_OVER) {
      if (actionIncludes(actions, ACTION.RESTART_LEVEL)) { event.preventDefault(); command(ACTION.RESTART_LEVEL); return true; }
      if (actionIncludes(actions, ACTION.CONFIRM)) { event.preventDefault(); command(ACTION.CONFIRM); return true; }
      if (actionIncludes(actions, ACTION.MENU_TEST)) { event.preventDefault(); command(ACTION.MENU_TEST); return true; }
    }
    if (currentState === STATE.VICTORY) {
      if (actionIncludes(actions, ACTION.CONFIRM)) { event.preventDefault(); command(ACTION.CONFIRM); return true; }
      if (actionIncludes(actions, ACTION.MENU_TEST)) { event.preventDefault(); command(ACTION.MENU_TEST); return true; }
    }
    if (
      actionIncludes(actions, ACTION.RESTART_LEVEL) &&
      (currentState === STATE.PAUSED || currentState === STATE.GAME_OVER)
    ) {
      event.preventDefault();
      this.#transition(STATE.MENU);
      this.#transition(STATE.PLAYING, true);
      return true;
    }
    if (actionIncludes(actions, ACTION.RESTART_LEVEL) && currentState === STATE.PLAYING) return false;
    if (actionIncludes(actions, ACTION.CONFIRM)) {
      event.preventDefault();
      if (currentState === STATE.MENU) this.#transition(STATE.PLAYING, true);
      else if (currentState === STATE.GAME_OVER) this.#transition(STATE.MENU);
      return true;
    }
    if (actionIncludes(actions, ACTION.PAUSE_TOGGLE)) {
      event.preventDefault();
      if (currentState === STATE.PLAYING) this.#transition(STATE.PAUSED);
      else if (currentState === STATE.PAUSED) this.#transition(STATE.PLAYING);
      return true;
    }
    if (actionIncludes(actions, ACTION.GAME_OVER_TEST)) {
      event.preventDefault();
      if (this.#commands.handle?.(ACTION.GAME_OVER_TEST, currentState) !== true) this.#transition(STATE.GAME_OVER);
      return true;
    }
    if (actionIncludes(actions, ACTION.MENU_TEST)) {
      event.preventDefault();
      if (currentState === STATE.PAUSED) this.#transition(STATE.MENU);
      return true;
    }
    return false;
  }

  #transition(nextState, resetClock = false) {
    const changed = this.#stateMachine.transition(nextState);
    if (!changed) return false;

    this.clear();
    if (resetClock) this.#clock.reset();
    if (nextState === STATE.PAUSED || nextState === STATE.PLAYING) {
      this.#loop.resetTiming();
    }
    return true;
  }

  #queuePress(action) {
    this.#pendingPressed.set(action, performance.now());
  }

  #actionsForCode(code) {
    const actions = [];
    for (const [action, codes] of this.#bindings) {
      if (codes.has(code)) actions.push(action);
    }
    return actions;
  }

  #getHeldActions() {
    const heldActions = new Set();
    for (const [action, codes] of this.#bindings) {
      if (action === ACTION.SPECIAL_TAP) continue;
      if ([...codes].some((code) => this.#heldCodes.has(code))) {
        heldActions.add(action);
      }
    }
    return heldActions;
  }

  #isShiftHeld() {
    const shiftCodes = this.#bindings.get(ACTION.SPECIAL_TAP) ?? new Set();
    return [...shiftCodes].some((code) => this.#heldCodes.has(code));
  }

  #isShiftCode(code) {
    return (this.#bindings.get(ACTION.SPECIAL_TAP) ?? new Set()).has(code);
  }

  #otherShiftIsHeld(code) {
    const shiftCodes = this.#bindings.get(ACTION.SPECIAL_TAP) ?? new Set();
    return [...shiftCodes].some(
      (shiftCode) => shiftCode !== code && this.#heldCodes.has(shiftCode),
    );
  }
}

function actionIncludes(actions, soughtAction) {
  return actions.includes(soughtAction);
}
