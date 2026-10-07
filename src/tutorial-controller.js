import { LEVEL_1_TUTORIAL_STEPS } from "./tutorial-data.js";

// PROVISIONAL: ubicación, tamaño y paleta del aviso aún no tienen una medida definida por diseño.
const PANEL = Object.freeze({ x: 250, y: 92, width: 460, height: 78 });
const TEXT_COLOR = "#f2f4f8";
const ACCENT_COLOR = "#47d7c8";

function frontsDistance(player, enemy) {
  return Math.max(0, Math.abs(player.position.x - enemy.position.x) - player.bodyBox.width / 2 - enemy.bodySize.width / 2);
}

export class TutorialController {
  #steps;
  #stepIndex = 0;

  constructor(steps = LEVEL_1_TUTORIAL_STEPS) {
    this.#steps = steps;
  }

  get completed() { return this.#stepIndex >= this.#steps.length; }
  get currentStep() { return this.#steps[this.#stepIndex] ?? null; }
  get stepIndex() { return this.#stepIndex; }

  reset() { this.#stepIndex = 0; }

  update(actions, player, enemy) {
    const step = this.currentStep;
    if (!step) return false;
    const completed = step.action === "move" ? actions.moveX !== 0
      : step.action === "jump" ? actions.jump.pressed
        : step.action === "attack" ? actions.normalAttack.pressed
          : step.action === "guard" ? actions.guard.held
            : step.action === "special" ? actions.specialTap.pressed
              : step.action === "approach" && frontsDistance(player, enemy) <= enemy.data.attackStartDistancePx;
    if (!completed) return false;
    this.#stepIndex += 1;
    return true;
  }

  render(ctx) {
    const step = this.currentStep;
    if (!step) return;
    ctx.save();
    ctx.fillStyle = "rgba(12, 20, 31, 0.92)";
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(PANEL.x + 1, PANEL.y + 1, PANEL.width - 2, PANEL.height - 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = ACCENT_COLOR;
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText(`TUTORIAL · ${this.#stepIndex + 1}/${this.#steps.length} · ${step.key}`, PANEL.x + 14, PANEL.y + 10);
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText(step.text, PANEL.x + 14, PANEL.y + 38);
    ctx.restore();
  }
}
