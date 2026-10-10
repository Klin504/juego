import { EnemyCombatant } from "./enemy-combatant.js";

// PROVISIONAL: colores y opacidad de la sombra son de lectura visual, no cifras del contrato.
const SHADOW_FILL = "rgba(12, 15, 20, 0.45)";
const SHADOW_EDGE = "#ffe294";

export class Chilo extends EnemyCombatant {
  #combatReady = false;

  setCombatReady(ready) { this.#combatReady = ready; }

  canStartAttack(target) {
    if (!this.#combatReady) return false;
    const frontsGap = Math.abs(target.position.x - this.position.x)
      - target.bodyBox.width / 2
      - this.bodySize.width / 2;
    return frontsGap <= this.data.attackStartDistancePx;
  }

  onAttackStarted(attack, target) {
    if (attack.data.kind !== "jump") return;
    const landingSeparation = (target.bodyBox.width + this.bodySize.width) / 2;
    const targetSide = Math.sign(this.position.x - target.position.x) || -this.facing;
    const desiredX = target.position.x + targetSide * landingSeparation;
    const destinationX = Math.max(
      Math.max(this.data.arenaCenterMinX, this.position.x - this.data.jumpRangePx),
      Math.min(Math.min(this.data.arenaCenterMaxX, this.position.x + this.data.jumpRangePx), desiredX),
    );
    attack.startPosition = { x: this.position.x, y: this.position.y };
    attack.destinationPosition = { x: destinationX, y: this.data.y };
    attack.targetPosition = { ...attack.destinationPosition };
  }

  onAttackAdvanced(attack) {
    if (attack.data.kind !== "jump") return;
    if (attack.phase !== "warning") {
      this.position.x = attack.destinationPosition.x;
      this.position.y = attack.destinationPosition.y;
      return;
    }
    const progress = Math.min(1, attack.elapsedSec / attack.data.startupSec);
    const arc = 4 * this.data.jumpArcHeightPx * progress * (1 - progress);
    this.position.x = attack.startPosition.x
      + (attack.destinationPosition.x - attack.startPosition.x) * progress;
    this.position.y = this.data.y - arc;
  }

  onAttackFinished(attack) {
    if (attack.data.kind !== "jump") return;
    this.position.x = attack.destinationPosition.x;
    this.position.y = this.data.y;
  }

  render(ctx) {
    if (this.attack?.data.kind === "jump" && this.attack.phase === "warning") {
      ctx.save();
      ctx.fillStyle = SHADOW_FILL;
      ctx.strokeStyle = SHADOW_EDGE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.attack.targetPosition.x, this.attack.targetPosition.y, this.attack.data.diameterPx / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    super.render(ctx);
  }
}
