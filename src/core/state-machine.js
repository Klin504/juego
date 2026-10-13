/** Valida y ejecuta cambios entre estados del juego. */

export class StateMachine {
  #states;
  #allowedTransitions;
  #snapshot;

  constructor(states, allowedTransitions, initialState) {
    this.#states = states;
    this.#allowedTransitions = allowedTransitions;
    this.currentName = initialState;
    this.currentState = this.#states.get(initialState);
    this.#snapshot = Object.freeze({ state: this.currentName });
    this.currentState.enter();
  }

  get snapshot() {
    return this.#snapshot;
  }

  /** Rechaza rutas no previstas y llama exit/enter al cambiar de pantalla. */
  transition(nextName) {
    const allowed = this.#allowedTransitions.get(this.currentName);
    if (!allowed?.has(nextName)) {
      console.warn(
        `[estados] Transición rechazada: ${this.currentName} → ${nextName}.`,
      );
      return false;
    }

    this.currentState.exit();
    this.currentName = nextName;
    this.currentState = this.#states.get(nextName);
    this.#snapshot = Object.freeze({ state: this.currentName });
    this.currentState.enter();
    return true;
  }

  /** Delega la simulación y el dibujo en el estado que está activo. */
  update(dt) {
    this.currentState.update(dt);
  }

  render(ctx, snapshot, alpha) {
    this.currentState.render(ctx, snapshot, alpha);
  }
}
