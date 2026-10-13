/** Lleva el tiempo transcurrido de la simulación. */

export class GameClock {
  #elapsedSeconds = 0;

  reset() {
    this.#elapsedSeconds = 0;
  }

  /** Suma solo el tiempo de simulación entregado por el bucle. */
  update(dt) {
    this.#elapsedSeconds += dt;
  }

  get elapsedSeconds() {
    return this.#elapsedSeconds;
  }
}
