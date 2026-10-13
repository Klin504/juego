/**
 * Recortes de las ocho poses ilustradas de cada luchador.
 * Las hojas v4 tienen 2170×725 píxeles. Cada columna ocupa un octavo de la
 * imagen, mientras que el margen vertical varía según la postura y el efecto.
 * El recorte se mantiene aquí para que menú, combate y cierre usen la misma
 * figura sin deformarla ni calcular píxeles durante cada fotograma.
 */

const SHEET_WIDTH = 2170;
const SHEET_HEIGHT = 725;

const VERTICAL_BOUNDS = Object.freeze({
  alma: [[208, 541], [208, 546], [168, 488], [213, 541], [213, 541], [175, 541], [208, 541], [294, 536]],
  diego: [[208, 570], [208, 579], [158, 571], [215, 571], [215, 571], [159, 571], [175, 571], [331, 571]],
  nadia: [[224, 627], [204, 626], [128, 628], [228, 628], [229, 629], [242, 629], [228, 629], [148, 640]],
  chilo: [[219, 573], [221, 582], [162, 572], [223, 572], [188, 573], [204, 578], [238, 572], [307, 573]],
  vera: [[231, 629], [238, 620], [130, 628], [253, 629], [248, 629], [233, 628], [246, 628], [331, 627]],
  catodo3: [[226, 579], [223, 588], [155, 579], [239, 579], [242, 579], [244, 579], [261, 579], [351, 585]],
  null: [[203, 594], [260, 594], [135, 592], [263, 595], [105, 595], [142, 595], [253, 594], [286, 600]],
});

/** Dibuja una pose con el mismo tamaño relativo y pivote en los pies. */
export function drawFighterFrame(ctx, image, characterId, frameIndex, x, baselineY, maxWidth, maxHeight, flipX = false) {
  if (!image?.complete || image.naturalWidth !== SHEET_WIDTH || image.naturalHeight !== SHEET_HEIGHT) return false;
  const bounds = VERTICAL_BOUNDS[characterId]?.[frameIndex];
  if (!bounds) return false;

  const sourceX = Math.round(frameIndex * SHEET_WIDTH / 8);
  const sourceRight = Math.round((frameIndex + 1) * SHEET_WIDTH / 8);
  const sourceY = bounds[0];
  const sourceWidth = sourceRight - sourceX;
  const sourceHeight = bounds[1] - sourceY;
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(baselineY));
  if (flipX) ctx.scale(-1, 1);
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight,
    -Math.round(width / 2), -height, width, height);
  ctx.restore();
  return true;
}
