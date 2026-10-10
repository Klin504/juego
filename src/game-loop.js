import { FIXED_STEP_SECONDS, MAX_STEPS_PER_FRAME } from "./constants.js";

const FPS_SAMPLE_INTERVAL_SECONDS = 0.5;

export class GameLoop {
  #updateFixed;
  #render;
  #requestFrameId = null;
  #running = false;
  #lastTimestampMs = null;
  #accumulatorSeconds = 0;
  #fpsElapsedSeconds = 0;
  #fpsFrames = 0;
  #framesPerSecond = 0;

  constructor(updateFixed, render) {
    this.#updateFixed = updateFixed;
    this.#render = render;
    this.frame = this.frame.bind(this);
  }

  start() {
    if (this.#running) return;
    this.#running = true;
    this.#lastTimestampMs = null;
    this.#requestFrameId = requestAnimationFrame(this.frame);
  }

  resetTiming() {
    this.#lastTimestampMs = null;
    this.#accumulatorSeconds = 0;
  }

  frame(timestampMs) {
    if (!this.#running) return;

    if (this.#lastTimestampMs === null) {
      this.#lastTimestampMs = timestampMs;
    } else {
      const frameDeltaSeconds = Math.max(
        0,
        (timestampMs - this.#lastTimestampMs) / 1000,
      );
      this.#lastTimestampMs = timestampMs;
      this.#accumulatorSeconds += frameDeltaSeconds;
      this.#updateFps(frameDeltaSeconds);

      let steps = 0;
      while (
        this.#accumulatorSeconds >= FIXED_STEP_SECONDS &&
        steps < MAX_STEPS_PER_FRAME
      ) {
        this.#updateFixed(FIXED_STEP_SECONDS);
        this.#accumulatorSeconds -= FIXED_STEP_SECONDS;
        steps += 1;
      }

      if (this.#accumulatorSeconds >= FIXED_STEP_SECONDS) {
        const discardedSeconds =
          this.#accumulatorSeconds -
          (this.#accumulatorSeconds % FIXED_STEP_SECONDS);
        this.#accumulatorSeconds %= FIXED_STEP_SECONDS;
        console.warn(
          `[bucle] Se descartaron ${discardedSeconds.toFixed(3)} s ` +
            `tras alcanzar ${MAX_STEPS_PER_FRAME} pasos en un fotograma.`,
        );
      }
    }

    this.#render(
      this.#framesPerSecond,
      this.#accumulatorSeconds / FIXED_STEP_SECONDS,
    );
    this.#requestFrameId = requestAnimationFrame(this.frame);
  }

  stop() {
    this.#running = false;
    if (this.#requestFrameId !== null) {
      cancelAnimationFrame(this.#requestFrameId);
      this.#requestFrameId = null;
    }
    this.resetTiming();
  }

  #updateFps(frameDeltaSeconds) {
    if (frameDeltaSeconds <= 0) return;
    this.#fpsElapsedSeconds += frameDeltaSeconds;
    this.#fpsFrames += 1;
    if (this.#fpsElapsedSeconds >= FPS_SAMPLE_INTERVAL_SECONDS) {
      this.#framesPerSecond = Math.round(this.#fpsFrames / this.#fpsElapsedSeconds);
      this.#fpsElapsedSeconds = 0;
      this.#fpsFrames = 0;
    }
  }
}
