export class GameClock {
  #elapsedSeconds = 0;

  reset() {
    this.#elapsedSeconds = 0;
  }

  update(dt) {
    this.#elapsedSeconds += dt;
  }

  get elapsedSeconds() {
    return this.#elapsedSeconds;
  }
}
