import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  MAX_DEVICE_PIXEL_RATIO,
} from "./constants.js";

export function fitCanvas(canvas, context) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const scale = Math.min(
    viewportWidth / LOGICAL_WIDTH,
    viewportHeight / LOGICAL_HEIGHT,
  );
  const cssWidth = LOGICAL_WIDTH * scale;
  const cssHeight = LOGICAL_HEIGHT * scale;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  context.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio, 0, 0);
  context.imageSmoothingEnabled = false;
}
