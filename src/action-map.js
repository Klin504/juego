export const ACTION = Object.freeze({
  MOVE_LEFT: "moveLeft",
  MOVE_RIGHT: "moveRight",
  JUMP: "jump",
  GUARD: "guard",
  NORMAL_ATTACK: "normalAttack",
  SPECIAL_TAP: "specialTap",
  VISOR: "visor",
  PAUSE_TOGGLE: "pauseToggle",
  DEBUG_TOGGLE: "debugToggle",
  RESTART_LEVEL: "restartLevel",
  CONFIRM: "confirm",
  GAME_OVER_TEST: "gameOverTest",
  MENU_TEST: "menuTest",
  SELECT_PREVIOUS: "selectPrevious",
  SELECT_NEXT: "selectNext",
});

export const DEFAULT_ACTION_BINDINGS = Object.freeze({
  [ACTION.MOVE_LEFT]: Object.freeze(["KeyA", "ArrowLeft"]),
  [ACTION.MOVE_RIGHT]: Object.freeze(["KeyD", "ArrowRight"]),
  [ACTION.JUMP]: Object.freeze(["KeyW", "ArrowUp", "Space"]),
  [ACTION.GUARD]: Object.freeze(["KeyS", "ArrowDown"]),
  [ACTION.NORMAL_ATTACK]: Object.freeze(["KeyR"]),
  [ACTION.SPECIAL_TAP]: Object.freeze(["ShiftLeft", "ShiftRight"]),
  [ACTION.VISOR]: Object.freeze(["KeyE"]),
  [ACTION.PAUSE_TOGGLE]: Object.freeze(["KeyP", "Escape"]),
  [ACTION.DEBUG_TOGGLE]: Object.freeze(["F2"]),
  [ACTION.RESTART_LEVEL]: Object.freeze(["KeyT"]),
  [ACTION.CONFIRM]: Object.freeze(["Enter"]),
  [ACTION.GAME_OVER_TEST]: Object.freeze(["KeyG"]),
  [ACTION.MENU_TEST]: Object.freeze(["KeyM"]),
  [ACTION.SELECT_PREVIOUS]: Object.freeze(["KeyA", "ArrowLeft"]),
  [ACTION.SELECT_NEXT]: Object.freeze(["KeyD", "ArrowRight"]),
});

export const BUFFERED_ACTIONS = new Set([
  ACTION.JUMP,
  ACTION.NORMAL_ATTACK,
  ACTION.SPECIAL_TAP,
]);

export const CONTINUOUS_ACTIONS = new Set([
  ACTION.MOVE_LEFT,
  ACTION.MOVE_RIGHT,
  ACTION.JUMP,
  ACTION.GUARD,
  ACTION.NORMAL_ATTACK,
  ACTION.VISOR,
]);
