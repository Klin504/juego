/** Dibuja menús, selección, guía y pantallas entre combates. */

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../core/constants.js";
import { drawFighterFrame } from "../rendering/fighting-atlas.js";

const INK = "#f4ecdb";
const GOLD = "#ffd37b";
const CYAN = "#72e4df";
const PALE = "#a8b7c9";
const DEEP = "#0b101e";
const ARENA_ASSET_BY_LEVEL = Object.freeze({
  "nivel-1": "estacionamiento",
  "nivel-2": "cancha",
  "nivel-3": "laboratorio",
  "nivel-4": "biblioteca",
});

const GLYPHS = Object.freeze({
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10011", "10101", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
});

const portraits = new Map();
const arenaImages = new Map();
const fighterColors = Object.freeze({
  alma: { main: "#f3985a", dark: "#672d33", bg: "#442d3a", label: "INGENIERÍA", ability: "PULSO DE CIRCUITO", alias: "LA CHISPA DE COBRE" },
  diego: { main: "#8ee09d", dark: "#234936", bg: "#29463c", label: "DEPORTES", ability: "CARGA CHILA", alias: "EL MURO DE CHILA" },
  nadia: { main: "#d9a1fa", dark: "#593467", bg: "#433557", label: "COMUNICACIÓN", ability: "RÁFAGA DE NOTAS", alias: "LA VOZ VIOLETA" },
});

function portrait(id) {
  if (typeof Image === "undefined") return null;
  if (!portraits.has(id)) {
    const image = new Image();
    image.src = new URL(`../../assets/sprites/fighting-v4/${id}.png`, import.meta.url).href;
    portraits.set(id, image);
  }
  return portraits.get(id);
}

function arenaImage(levelId) {
  if (typeof Image === "undefined") return null;
  const arenaId = ARENA_ASSET_BY_LEVEL[levelId];
  if (!arenaId) return null;
  if (!arenaImages.has(arenaId)) {
    const image = new Image();
    image.src = new URL(`../../assets/arenas/${arenaId}-v2.png`, import.meta.url).href;
    arenaImages.set(arenaId, image);
  }
  return arenaImages.get(arenaId);
}

function drawScreenSprite(ctx, characterId, frameIndex, x, baselineY, width, height, flipX = false) {
  return drawFighterFrame(ctx, portrait(characterId), characterId,
    frameIndex, x, baselineY, width, height, flipX);
}

/** Convierte cada letra en una matriz de bloques para títulos de estilo pixel art. */
export function drawPixelText(ctx, value, x, y, size, color, align = "left") {
  const message = value.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const width = (message.length * 6 - 1) * size;
  let left = align === "center" ? x - Math.floor(width / 2) : x;
  if (align === "right") left = x - width;
  ctx.fillStyle = color;
  for (const character of message) {
    const glyph = GLYPHS[character] ?? GLYPHS[" "];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        if (glyph[row][column] === "1") ctx.fillRect(left + column * size, y + row * size, size, size);
      }
    }
    left += size * 6;
  }
}

function corner(ctx, x, y, dx, dy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, dx * 18, dy * 4);
  ctx.fillRect(x, y, dx * 4, dy * 18);
}

function frame(ctx, x, y, width, height, color = CYAN) {
  ctx.fillStyle = "#142136";
  ctx.fillRect(x + 6, y + 6, width, height);
  ctx.fillStyle = "#111a2b";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#355470";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  corner(ctx, x, y, 1, 1, color);
  corner(ctx, x + width, y, -1, 1, color);
  corner(ctx, x, y + height, 1, -1, color);
  corner(ctx, x + width, y + height, -1, -1, color);
}

export function drawMenuBackdrop(ctx) {
  ctx.fillStyle = DEEP;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.fillStyle = "#101a2b";
  ctx.fillRect(0, 280, LOGICAL_WIDTH, 260);

  // Bloques, rejas y edificios usan bordes enteros para conservar píxeles nítidos.
  ctx.fillStyle = "#233449";
  for (let i = 0; i < 20; i += 1) {
    const x = i * 51 - 10;
    const height = 48 + ((i * 37) % 72);
    ctx.fillRect(x, 390 - height, 42, height + 150);
    ctx.fillStyle = "#426070";
    for (let row = 0; row < 4; row += 1) {
      ctx.fillRect(x + 7 + (row % 2) * 14, 400 - height + row * 18, 4, 5);
      ctx.fillRect(x + 24, 400 - height + row * 18, 4, 5);
    }
    ctx.fillStyle = "#233449";
  }
  ctx.fillStyle = "#121f32";
  ctx.fillRect(0, 413, LOGICAL_WIDTH, 127);
  ctx.fillStyle = "#29485a";
  for (let y = 438; y < LOGICAL_HEIGHT; y += 24) ctx.fillRect(0, y, LOGICAL_WIDTH, 2);
  for (let x = 28; x < LOGICAL_WIDTH; x += 56) ctx.fillRect(x, 416, 2, 124);

  const twinkle = Math.floor(Date.now() / 650) % 3;
  for (let i = 0; i < 32; i += 1) {
    const x = (i * 167 + 37) % LOGICAL_WIDTH;
    const y = 24 + ((i * 61) % 250);
    ctx.fillStyle = i % 3 === twinkle ? "#64a0ad" : "#294257";
    ctx.fillRect(x, y, i % 4 === 0 ? 4 : 2, 2);
  }
  ctx.fillStyle = "#3c6777";
  ctx.fillRect(0, 20, LOGICAL_WIDTH, 2);
  ctx.fillRect(0, LOGICAL_HEIGHT - 20, LOGICAL_WIDTH, 2);
}

function keyLabel(ctx, x, y, key, color = GOLD) {
  const width = Math.max(30, key.length * 10 + 12);
  ctx.fillStyle = "#172132";
  ctx.fillRect(x, y, width, 28);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, width - 2, 26);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillText(key, x + width / 2, y + 14);
  return width;
}

function drawMenuOption(ctx, { x, y, width, label, hint, selected, accent = GOLD }) {
  ctx.fillStyle = selected ? "#26394d" : "#142136";
  ctx.fillRect(x, y, width, 48);
  ctx.fillStyle = selected ? accent : "#35506a";
  ctx.fillRect(x, y, selected ? 5 : 2, 48);
  ctx.fillStyle = selected ? accent : "#48627a";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(hint, x + 18, y + 24);
  ctx.fillStyle = selected ? INK : PALE;
  ctx.font = `bold ${label.length > 24 ? 14 : 16}px 'Courier New', monospace`;
  ctx.fillText(label, x + 82, y + 24);
  if (selected) {
    ctx.fillStyle = accent;
    ctx.fillRect(x + width - 20, y + 18, 8, 12);
  }
}

function drawShowcaseMotif(ctx, id, x, y, color) {
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = color;
  if (id === "alma") {
    // Las pistas de circuito rodean a Alma sin tapar su silueta.
    ctx.fillRect(x + 16, y + 50, 4, 70);
    ctx.fillRect(x + 16, y + 50, 25, 4);
    ctx.fillRect(x + 12, y + 116, 24, 4);
    ctx.fillRect(x + 36, y + 116, 4, 24);
    ctx.fillRect(x + 68, y + 60, 4, 31);
    ctx.fillRect(x + 68, y + 60, 22, 4);
    ctx.fillRect(x + 86, y + 56, 8, 8);
  } else if (id === "diego") {
    // Las franjas deportivas dan a Diego un fondo ancho y firme.
    ctx.fillRect(x + 13, y + 46, 7, 75);
    ctx.fillRect(x + 23, y + 60, 4, 53);
    ctx.fillRect(x + 82, y + 46, 7, 75);
    ctx.fillRect(x + 75, y + 60, 4, 53);
    ctx.fillRect(x + 13, y + 126, 76, 4);
  } else {
    // Las barras desplazadas refuerzan el motivo de comunicación de Nadia.
    ctx.fillRect(x + 13, y + 62, 5, 70);
    ctx.fillRect(x + 22, y + 52, 5, 82);
    ctx.fillRect(x + 80, y + 51, 5, 82);
    ctx.fillRect(x + 89, y + 62, 5, 70);
    ctx.fillRect(x + 14, y + 48, 18, 4);
    ctx.fillRect(x + 76, y + 48, 18, 4);
  }
  ctx.restore();
}

function drawShowcaseCard(ctx, id, index) {
  const colors = fighterColors[id];
  const x = 508 + index * 116;
  const y = 120;
  ctx.fillStyle = "#0d1727";
  ctx.fillRect(x - 2, y - 2, 112, 210);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(x, y, 108, 206);
  ctx.fillStyle = colors.main;
  ctx.fillRect(x, y, 108, 4);
  ctx.fillStyle = colors.dark;
  ctx.fillRect(x + 8, y + 32, 92, 139);
  drawShowcaseMotif(ctx, id, x, y, colors.main);

  ctx.fillStyle = "#0d1727";
  ctx.fillRect(x + 8, y + 10, 92, 18);
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 8, y + 10, 3, 18);
  ctx.fillStyle = INK;
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`0${index + 1}  ${colors.label}`, x + 16, y + 20, 80);

  drawScreenSprite(ctx, id, 0, x + 54, y + 180, 100, 125);
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 14, y + 181, 80, 3);
  ctx.fillStyle = "#101b2a";
  ctx.fillRect(x + 21, y + 185, 66, 6);
  ctx.fillStyle = colors.main;
  ctx.fillRect(x, y + 202, 108, 4);

  ctx.textAlign = "center";
  ctx.fillStyle = colors.main;
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.fillText(id.toUpperCase(), x + 54, 371);
  ctx.fillStyle = INK;
  ctx.font = "bold 8px 'Courier New', monospace";
  ctx.fillText(colors.alias, x + 54, 389, 106);
}

function drawSelectionMotif(ctx, id, color) {
  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = color;
  if (id === "alma") {
    ctx.fillRect(112, 158, 7, 122);
    ctx.fillRect(112, 158, 52, 7);
    ctx.fillRect(119, 273, 41, 7);
    ctx.fillRect(153, 273, 7, 52);
    ctx.fillRect(327, 163, 7, 127);
    ctx.fillRect(294, 163, 40, 7);
    ctx.fillRect(294, 284, 40, 7);
  } else if (id === "diego") {
    ctx.fillRect(112, 154, 12, 170);
    ctx.fillRect(134, 174, 7, 130);
    ctx.fillRect(333, 154, 12, 170);
    ctx.fillRect(316, 174, 7, 130);
    ctx.fillRect(112, 323, 233, 6);
  } else {
    for (let offset = 0; offset < 3; offset += 1) {
      ctx.fillRect(112 + offset * 13, 175 - offset * 12, 6, 108 + offset * 23);
      ctx.fillRect(339 - offset * 13, 175 - offset * 12, 6, 108 + offset * 23);
    }
  }
  ctx.restore();
}

/** Compone las opciones principales, el escaparate de personajes y el récord. */
export function drawMainMenu(ctx, { soundEnabled, record, selectedIndex = 0 }) {
  drawMenuBackdrop(ctx);
  frame(ctx, 48, 38, 864, 464, "#48718a");

  drawPixelText(ctx, "CHILOS", 76, 58, 6, GOLD);
  drawPixelText(ctx, "FIGHTERS", 76, 105, 4, INK);
  ctx.fillStyle = CYAN;
  ctx.fillRect(76, 145, 330, 3);
  ctx.fillStyle = PALE;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.fillText("CRÓNICAS DEL CAMPUS", 78, 164);
  ctx.fillStyle = "#9aabc0";
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillText("Cuatro duelos. Una historia.", 78, 184);

  const menuOptions = [
    { label: "NUEVA CAMPAÑA", hint: "J", accent: GOLD },
    { label: "CÓMO SE JUEGA", hint: "H", accent: CYAN },
    { label: "ARCHIVO DEL CAMPUS", hint: "B", accent: "#d9a1fa" },
    { label: `SONIDO: ${soundEnabled ? "ACTIVADO" : "SILENCIADO"}`, hint: "S", accent: "#8ee09d" },
  ];
  menuOptions.forEach((option, index) => drawMenuOption(ctx, {
    x: 76,
    y: 207 + index * 57,
    width: 360,
    ...option,
    selected: index === selectedIndex,
  }));

  // Cada tarjeta presenta una silueta, un oficio y un motivo pixel art propio.
  ctx.fillStyle = "#14283d";
  ctx.fillRect(472, 58, 406, 354);
  ctx.strokeStyle = "#355470";
  ctx.lineWidth = 2;
  ctx.strokeRect(473, 59, 404, 352);
  ctx.fillStyle = PALE;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("LOS RETADORES", 494, 82);
  ctx.textAlign = "right";
  ctx.fillStyle = CYAN;
  ctx.fillText("CAMPUS · 01", 856, 82);

  ctx.fillStyle = "#1c3043";
  ctx.fillRect(492, 101, 366, 266);
  ctx.fillStyle = "#2c4858";
  ctx.fillRect(504, 330, 342, 20);
  ctx.fillStyle = "#648a91";
  ctx.fillRect(504, 330, 342, 3);
  ctx.fillStyle = "#152638";
  ctx.fillRect(504, 346, 342, 4);
  ["alma", "diego", "nadia"].forEach((id, index) => drawShowcaseCard(ctx, id, index));
  ctx.fillStyle = "#0d1727";
  ctx.fillRect(492, 422, 366, 48);
  ctx.fillStyle = GOLD;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("RÉCORD DE CAMPAÑA", 508, 439);
  ctx.fillStyle = INK;
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${record ?? 0} PTS`, 842, 445);

  ctx.fillStyle = "#122033";
  ctx.fillRect(76, 451, 360, 38);
  ctx.fillStyle = CYAN;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("A / D · ← / → ELEGIR", 88, 470);
  ctx.fillStyle = INK;
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("ENTER ABRIR", 424, 470);
}

/** Dibuja un valor real y su proporción respecto al mejor luchador de esa categoría. */
function statBar(ctx, x, y, label, value, maximum, color, unit) {
  const labelWidth = 100;
  const barWidth = 245;
  ctx.save();
  ctx.fillStyle = value === maximum ? GOLD : PALE;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y + 5);
  ctx.fillStyle = "#1c2b3b";
  ctx.fillRect(x + labelWidth, y, barWidth, 10);
  ctx.fillStyle = color;
  ctx.fillRect(x + labelWidth, y, Math.round(barWidth * value / maximum), 10);
  ctx.fillStyle = value === maximum ? GOLD : INK;
  ctx.textAlign = "right";
  ctx.fillText(`${value} ${unit}`, x + 410, y + 5);
  ctx.restore();
}

/** Presenta la comparación de atributos antes de confirmar al estudiante. */
export function drawFighterSelect(ctx, fighters, selectedIndex) {
  drawMenuBackdrop(ctx);
  frame(ctx, 48, 38, 864, 464, "#48718a");
  drawPixelText(ctx, "ELIGE TU LUCHADOR", 76, 58, 4, GOLD);
  ctx.fillStyle = PALE;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("FICHA DE ESTUDIANTE", 882, 74);

  const fighter = fighters[selectedIndex];
  const palette = fighterColors[fighter.id];

  ctx.fillStyle = "#142136";
  ctx.fillRect(76, 100, 322, 338);
  ctx.strokeStyle = "#355470";
  ctx.lineWidth = 2;
  ctx.strokeRect(77, 101, 320, 336);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(94, 118, 286, 274);
  drawSelectionMotif(ctx, fighter.id, palette.main);
  ctx.fillStyle = "#0d1727";
  ctx.fillRect(108, 130, 146, 23);
  ctx.fillStyle = palette.main;
  ctx.fillRect(108, 130, 4, 23);
  ctx.fillStyle = INK;
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`FICHA 0${selectedIndex + 1} · ${fighter.role.split(" · ")[0].toUpperCase()}`, 119, 143, 128);
  ctx.fillStyle = palette.dark;
  ctx.fillRect(114, 355, 246, 21);
  ctx.fillStyle = palette.main;
  ctx.fillRect(114, 355, 246, 4);
  drawScreenSprite(ctx, fighter.id, 0, 237, 380, 192, 240);
  ctx.fillStyle = "#0d1727";
  ctx.fillRect(94, 397, 286, 25);
  ctx.fillStyle = palette.main;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${String(selectedIndex + 1).padStart(2, "0")} / ${String(fighters.length).padStart(2, "0")}   ·   ${fighter.role.split(" · ")[0].toUpperCase()}`, 237, 410);

  ctx.fillStyle = "#142136";
  ctx.fillRect(418, 100, 466, 338);
  ctx.fillStyle = palette.main;
  ctx.fillRect(418, 100, 5, 338);
  ctx.fillStyle = PALE;
  ctx.textAlign = "left";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("ALIAS DE COMBATE", 446, 128);
  ctx.fillStyle = INK;
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillText(palette.alias, 446, 164, 410);
  ctx.fillStyle = palette.main;
  ctx.font = "bold 17px 'Courier New', monospace";
  ctx.fillText(fighter.name.toUpperCase(), 446, 198);
  ctx.fillStyle = PALE;
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillText(fighter.role, 446, 224);

  ctx.fillStyle = "#0d1727";
  ctx.fillRect(446, 244, 410, 63);
  ctx.fillStyle = CYAN;
  ctx.fillRect(446, 244, 4, 63);
  ctx.fillStyle = PALE;
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText("HABILIDAD ESPECIAL", 462, 264);
  ctx.fillStyle = INK;
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText(fighter.special.toUpperCase(), 462, 286, 378);

  ctx.fillStyle = PALE;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("PERFIL", 446, 332);
  // Los máximos salen de la lista seleccionable; no se duplican cifras de balance en la UI.
  const highest = (attribute) => Math.max(...fighters.map((option) => option[attribute]));
  statBar(ctx, 446, 351, "VIDA", fighter.maxHp, highest("maxHp"), palette.main, "PV");
  statBar(ctx, 446, 373, "DAÑO", fighter.normalDamage, highest("normalDamage"), palette.main, "PTS");
  statBar(ctx, 446, 395, "MOVILIDAD", fighter.speed, highest("speed"), palette.main, "PX/S");
  ctx.fillStyle = PALE;
  ctx.font = "10px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  // El especial de Nadia se muestra por proyectil: tres impactos no están garantizados.
  const specialDamage = fighter.specialProjectileDamages
    ? `${fighter.specialProjectileDamages.join(" + ")} (HASTA ${fighter.specialDamage})`
    : `${fighter.specialDamage} POR IMPACTO`;
  ctx.fillText(`ESPECIAL: ${specialDamage} · RECARGA ${fighter.specialCooldownSec} S`, 446, 427, 410);

  const tabY = 450;
  fighters.forEach((option, index) => {
    const selected = index === selectedIndex;
    const optionPalette = fighterColors[option.id];
    const x = 76 + index * 272;
    ctx.fillStyle = selected ? "#26394d" : "#142136";
    ctx.fillRect(x, tabY, 260, 36);
    ctx.fillStyle = selected ? optionPalette.main : "#355470";
    ctx.fillRect(x, tabY, 4, 36);
    ctx.fillStyle = selected ? INK : PALE;
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText(option.name.split(" ")[0].toUpperCase(), x + 14, tabY + 19);
    ctx.fillStyle = optionPalette.main;
    ctx.font = "bold 8px 'Courier New', monospace";
    ctx.fillText(optionPalette.alias, x + 92, tabY + 19, 156);
  });

  ctx.fillStyle = INK;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("A / D · ← / → CAMBIAR   ·   ENTER ELEGIR   ·   ESC / M VOLVER", 882, 489);
}

function guideCard(ctx, x, y, width, height, title, accent = CYAN) {
  ctx.fillStyle = "#142136";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#355470";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, 4, height);
  ctx.fillStyle = accent;
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(title, x + 16, y + 18);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  // x siempre es el borde izquierdo del párrafo, aunque el título esté centrado.
  const previousAlign = ctx.textAlign;
  ctx.textAlign = "left";
  lines.slice(0, maxLines).forEach((entry, index) =>
    ctx.fillText(entry, x, y + index * lineHeight, maxWidth));
  ctx.textAlign = previousAlign;
}

/** Presenta las páginas del archivo y el terminal del secreto. */
export function drawArchiveScreen(ctx, archive) {
  drawMenuBackdrop(ctx);
  frame(ctx, 48, 38, 864, 464, "#48718a");

  if (archive.terminalOpen) {
    drawPixelText(ctx, "TERMINAL DEL ARCHIVO", 76, 57, 4, GOLD);
    ctx.fillStyle = PALE;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("RECUPERACIÓN DE REGISTROS", 882, 73);

    ctx.fillStyle = "#142136";
    ctx.fillRect(112, 105, 736, 318);
    ctx.strokeStyle = "#355470";
    ctx.lineWidth = 2;
    ctx.strokeRect(113, 106, 734, 316);
    ctx.fillStyle = "#d9a1fa";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("PALABRA DE MANTENIMIENTO", 480, 144);
    ctx.fillStyle = PALE;
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("Revisa los folios del campus y escribe la respuesta.", 480, 175);

    ctx.fillStyle = "#0b101e";
    ctx.fillRect(272, 205, 416, 54);
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    ctx.strokeRect(273, 206, 414, 52);
    ctx.fillStyle = INK;
    ctx.font = "bold 20px 'Courier New', monospace";
    const cursor = Math.floor(Date.now() / 500) % 2 === 0 ? "_" : "";
    ctx.fillText(`${archive.inputText}${cursor}`, 480, 232);

    ctx.fillStyle = archive.unlocked ? "#8ee09d" : GOLD;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillText(archive.unlocked ? "VISOR GUÍA · DISPONIBLE" : "REGISTRO · AÚN SIN VERIFICAR", 480, 290);
    if (archive.message) {
      ctx.fillStyle = archive.unlocked ? "#8ee09d" : INK;
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillText(archive.message, 480, 329, 680);
    } else {
      ctx.fillStyle = PALE;
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillText("Este terminal no altera tus marcas ni tu récord.", 480, 329);
    }

    ctx.fillStyle = "#122033";
    ctx.fillRect(76, 451, 808, 38);
    ctx.fillStyle = CYAN;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("ESCRIBIR · BACKSPACE BORRAR · ENTER CONSULTAR", 92, 470);
    ctx.fillStyle = INK;
    ctx.textAlign = "right";
    ctx.fillText("ESC CERRAR", 868, 470);
    return;
  }

  drawPixelText(ctx, "ARCHIVO DEL CAMPUS", 76, 57, 4, GOLD);
  ctx.fillStyle = PALE;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("CUATRO FOLIOS · RUTA DEL RECORRIDO", 882, 73);

  archive.sheets.forEach((sheet, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 76 + column * 408;
    const y = 98 + row * 150;
    const width = 400;
    const height = 136;
    const selected = index === archive.sheetIndex;

    ctx.fillStyle = selected ? "#1d3044" : "#142136";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = selected ? GOLD : "#355470";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    ctx.fillStyle = selected ? GOLD : CYAN;
    ctx.fillRect(x, y, 4, height);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(sheet.place.toUpperCase(), x + 16, y + 23);
    ctx.textAlign = "right";
    ctx.fillStyle = selected ? GOLD : PALE;
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillText(`FOLIO ${sheet.folio}`, x + width - 14, y + 23);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = PALE;
    ctx.font = "11px 'Courier New', monospace";
    drawWrappedText(ctx, sheet.text, x + 16, y + 46, width - 32, 16, 5);
  });

  ctx.fillStyle = "#122033";
  ctx.fillRect(76, 408, 808, 81);
  ctx.fillStyle = CYAN;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("← / → ELEGIR FOLIO", 92, 428);
  ctx.fillStyle = INK;
  ctx.fillText("ENTER / T  ABRIR TERMINAL", 92, 464);
  ctx.textAlign = "right";
  ctx.fillText("ESC / M  VOLVER AL MENÚ", 868, 446);
}

/** Organiza las instrucciones por acciones y muestra sus teclas. */
export function drawHowToPlay(ctx) {
  drawMenuBackdrop(ctx);
  frame(ctx, 48, 38, 864, 464, "#48718a");
  drawPixelText(ctx, "GUÍA DE JUEGO", 76, 57, 4, GOLD);
  ctx.fillStyle = PALE;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText("CONTROLES · OBJETIVO · CONSEJOS", 882, 73);

  guideCard(ctx, 76, 98, 390, 217, "CONTROLES", CYAN);
  const controls = [
    ["A / D O FLECHAS", "Moverse en combate"],
    ["W · ↑ · ESPACIO", "Saltar"],
    ["S · ↓", "Cubrirse; reduce golpes frontales"],
    ["R", "Golpe normal; recupera en 0,62 s"],
    ["SHIFT", "Pulsa y suelta para usar tu especial"],
    ["P · ESC", "Pausar o reanudar el combate"],
  ];
  controls.forEach(([key, description], index) => {
    const y = 133 + index * 28;
    ctx.fillStyle = index % 2 === 0 ? "#1a2a3e" : "#142136";
    ctx.fillRect(92, y - 10, 358, 24);
    ctx.fillStyle = GOLD;
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText(key, 102, y + 2);
    ctx.fillStyle = INK;
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillText(description, 218, y + 2, 220);
  });

  guideCard(ctx, 76, 327, 390, 111, "ANTES Y DURANTE EL DUELO", "#d9a1fa");
  ctx.fillStyle = INK;
  ctx.font = "11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("1. El primer nivel inicia con una práctica guiada.", 94, 367);
  ctx.fillText("2. Acércate al rival para entrar en alcance.", 94, 390);
  ctx.fillText("3. Mira avisos; alterna salto, defensa y movimiento.", 94, 413, 350);
  ctx.fillStyle = "#9b73bd";
  ctx.fillText("4. No repitas R: los jefes leen y esquivan tus golpes.", 94, 429, 350);

  guideCard(ctx, 486, 98, 398, 151, "OBJETIVO DE CAMPAÑA", GOLD);
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillText("Gana los cuatro duelos del campus.", 504, 142);
  ctx.fillStyle = PALE;
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("Cuida tu barra de vida y vigila el reloj del combate.", 504, 170, 350);
  ctx.fillText("Al vencer, avanzas al siguiente desafío; la campaña", 504, 194, 350);
  ctx.fillText("registra tus marcas y tu mejor puntuación.", 504, 216, 350);

  guideCard(ctx, 486, 261, 398, 177, "ARCHIVO Y VISOR GUÍA", "#8ee09d");
  ctx.fillStyle = INK;
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("El Archivo reúne cuatro folios con pistas del recorrido.", 504, 305, 360);
  ctx.fillStyle = PALE;
  ctx.fillText("Léelos en orden y revisa la terminal para descubrir", 504, 329, 360);
  ctx.fillText("la función original de NULL. Al desbloquear el Visor,", 504, 351, 360);
  ctx.fillText("pulsa E durante el combate para anticipar un ataque.", 504, 373, 360);
  ctx.fillStyle = "#8ee09d";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText("EL VISOR SE PUEDE USAR UNA VEZ POR COMBATE", 504, 411, 360);

  ctx.fillStyle = "#122033";
  ctx.fillRect(76, 451, 808, 38);
  ctx.fillStyle = CYAN;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("ENTER / A  ABRIR ARCHIVO", 92, 470);
  ctx.fillStyle = INK;
  ctx.textAlign = "right";
  ctx.fillText("ESC / M  VOLVER AL MENÚ", 868, 470);
}

export function drawInfoScreen(ctx, title, lines) {
  drawMenuBackdrop(ctx);
  frame(ctx, 70, 48, 820, 444, GOLD);
  ctx.fillStyle = "#162338";
  ctx.fillRect(84, 62, 792, 100);
  ctx.fillStyle = CYAN;
  ctx.fillRect(84, 157, 792, 3);
  ctx.fillStyle = PALE;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("CHILOS  /  CAMPUS", 101, 80);
  ctx.textAlign = "right";
  ctx.fillText("SISTEMA DE CAMPAÑA", 858, 80);
  const cleanTitle = title.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const scale = Math.max(2, Math.min(5, Math.floor(750 / Math.max(1, cleanTitle.length * 6 - 1))));
  drawPixelText(ctx, title, 480, 101, scale, GOLD, "center");

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, index) => {
    const y = 195 + index * 34;
    if (!line) return;
    const isControl = /^(Enter|Escape|P o Escape|M:|T:|H o C:|G:|A\/D|2 \/ 3 \/ 4:)/i.test(line);
    if (isControl) {
      ctx.fillStyle = "#24364b";
      ctx.fillRect(106, y - 14, 748, 28);
      ctx.fillStyle = CYAN;
      ctx.fillRect(106, y - 14, 4, 28);
    }
    ctx.fillStyle = isControl ? INK : PALE;
    ctx.font = `${isControl ? "bold " : ""}15px 'Courier New', monospace`;
    ctx.fillText(line, 480, y, 722);
  });
}

/** Compone introducciones, reintentos y victorias entre niveles. */
export function drawCampaignInterlude(ctx, {
  variant,
  levelData,
  levelNumber,
  fighterId,
  fighterName,
  marks,
  attempts,
  score,
  nextLevelName = null,
  narrativeLines = [],
  retry = false,
}) {
  drawMenuBackdrop(ctx);
  // La escena conserva la arena del nivel para relacionar relato y combate.
  const scene = arenaImage(levelData.id);
  if (scene?.complete && scene.naturalWidth > 0) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scene, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.restore();
  }
  ctx.fillStyle = "rgba(7, 12, 23, 0.72)";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const accent = variant === "victory" ? "#8ee09d" : "#ffd37b";
  frame(ctx, 30, 22, 900, 496, accent);

  ctx.fillStyle = "#0c1424";
  ctx.fillRect(62, 48, 836, 74);
  ctx.fillStyle = accent;
  ctx.fillRect(62, 116, 836, 3);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALE;
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText(variant === "victory" ? "COMBATE CERRADO · MARCA CONFIRMADA" : "SIGUIENTE COMBATE · PREPARA TU ESTRATEGIA", 82, 68);
  ctx.textAlign = "right";
  ctx.fillText(`NIVEL ${String(levelNumber).padStart(2, "0")} / 04`, 878, 68);
  drawPixelText(ctx, retry ? "REINTENTO" : variant === "victory" ? "VICTORIA" : "DUELO", 82, 83, 4, accent);
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.fillText(levelData.name.toUpperCase(), 326, 102, 548);

  ctx.fillStyle = "rgba(11, 17, 31, 0.9)";
  ctx.fillRect(315, 145, 330, 250);
  ctx.strokeStyle = "#526982";
  ctx.lineWidth = 2;
  ctx.strokeRect(316, 146, 328, 248);
  ctx.fillStyle = accent;
  ctx.fillRect(315, 145, 5, 250);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent;
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillText(variant === "victory" ? "EL RIVAL CEDE EL PASO" : "OBJETIVO DEL ENCUENTRO", 480, 169);
  ctx.fillStyle = INK;
  ctx.font = "bold 12px 'Courier New', monospace";
  drawWrappedText(ctx, levelData.objective, 336, 190, 288, 17, 3);

  ctx.fillStyle = PALE;
  ctx.font = "11px 'Courier New', monospace";
  ctx.textAlign = "left";
  let storyY = 247;
  // Se limita el texto a tres líneas narrativas para reservar espacio a los luchadores.
  narrativeLines.slice(0, 3).forEach((line) => {
    drawWrappedText(ctx, line, 338, storyY, 282, 15, 2);
    storyY += 35;
  });
  if (variant !== "victory") {
    ctx.fillStyle = "#fff1c5";
    ctx.font = "bold 10px 'Courier New', monospace";
    drawWrappedText(ctx, "LEE EL AVISO. ESQUIVA EL CÍRCULO O LA LÍNEA MARCADA Y CASTIGA LA RECUPERACIÓN.", 338, 354, 282, 13, 2);
  } else if (nextLevelName) {
    ctx.fillStyle = "#c7fff0";
    ctx.font = "bold 10px 'Courier New', monospace";
    drawWrappedText(ctx, `PRÓXIMA PARADA · ${nextLevelName}`, 338, 355, 282, 13, 2);
  }

  const playerX = 204;
  const bossX = 756;
  const spriteBaseline = 413;
  const spriteWidth = 128;
  const spriteHeight = 160;
  drawScreenSprite(ctx, fighterId, variant === "victory" ? 7 : 0, playerX, spriteBaseline, spriteWidth, spriteHeight);
  drawScreenSprite(ctx, levelData.enemyType, variant === "victory" ? 7 : 0, bossX, spriteBaseline, spriteWidth, spriteHeight);
  ctx.fillStyle = "#0c1424";
  ctx.fillRect(playerX - 91, 417, 182, 28);
  ctx.fillRect(bossX - 91, 417, 182, 28);
  ctx.fillStyle = variant === "victory" ? "#8ee09d" : accent;
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(variant === "victory" ? `${fighterName.toUpperCase()} · VENCEDOR` : fighterName.toUpperCase(), playerX, 431, 170);
  ctx.fillStyle = INK;
  ctx.fillText(variant === "victory"
    ? `${levelData.enemy.name.toUpperCase()} · SUPERADO`
    : levelData.enemy.name.toUpperCase(), bossX, 431, 170);

  ctx.fillStyle = "#0c1424";
  ctx.fillRect(64, 458, 832, 38);
  ctx.strokeStyle = "#355470";
  ctx.lineWidth = 1;
  ctx.strokeRect(64.5, 458.5, 831, 37);
  for (let index = 0; index < 4; index += 1) {
    const x = 82 + index * 28;
    ctx.fillStyle = index < marks ? accent : "#26364c";
    ctx.fillRect(x, 470, 18, 14);
    ctx.fillStyle = "#0c1424";
    ctx.fillRect(x + 4, 474, 10, 6);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText(`MARCAS ${marks}/4  ·  INTENTOS ${attempts}`, 208, 477);
  ctx.textAlign = "right";
  ctx.fillStyle = accent;
  ctx.fillText(`${score} PTS`, 876, 477);
  ctx.textAlign = "center";
  ctx.fillStyle = PALE;
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText(variant === "victory" ? "ENTER · CONTINUAR   /   M · MENÚ" : "ENTER · COMENZAR   /   M · SELECCIÓN", 480, 507);
}

export function drawCombatRibbon(ctx, { levelName, time, marks, attempts, score, tutorial }) {
  ctx.fillStyle = "rgba(9, 17, 30, 0.91)";
  ctx.fillRect(0, 506, LOGICAL_WIDTH, 34);
  ctx.fillStyle = CYAN;
  ctx.fillRect(0, 506, LOGICAL_WIDTH, 3);
  ctx.fillStyle = INK;
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(levelName.toUpperCase(), 16, 524, 280);
  ctx.fillStyle = GOLD;
  ctx.fillText(tutorial
    ? `PRÁCTICA ${tutorial.current}/${tutorial.total}  ·  CHILO EN ESPERA`
    : `MARCAS ${marks}/4    INTENTOS ${attempts}`, 345, 524);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.fillText(`${time}   ·   ${score} PTS`, 940, 524);
}
