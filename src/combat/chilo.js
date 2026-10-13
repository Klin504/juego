/** Implementa saltos, embestidas y avisos propios de Chilo. */

import { EnemyCombatant } from "./enemy-combatant.js";

// PROVISIONAL: colores y opacidad de la sombra son de lectura visual, no cifras del contrato.
const SHADOW_FILL = "rgba(12, 15, 20, 0.45)";
const SHADOW_EDGE = "#ffe294";
const WING_CONTACT_GAP_PX = 72;
const LUNGE_CONTACT_GAP_PX = 18;

export class Chilo extends EnemyCombatant {
  #combatReady = false;

  setCombatReady(ready) { this.#combatReady = ready; }

  canMoveWhileIdle() { return this.#combatReady; }

  /** Mantiene a Chilo pasivo hasta terminar el tutorial y entrar en alcance. */
  canStartAttack(target) {
    if (!this.#combatReady) return false;
    const frontsGap = Math.abs(target.position.x - this.position.x)
      - target.bodyBox.width / 2
      - this.bodySize.width / 2;
    return frontsGap <= this.data.attackStartDistancePx;
  }

  /** Fija el destino del salto o envión antes de mostrar su aviso. */
  onAttackStarted(attack, target) {
    if (["CHILO_WING", "CHILO_LUNGE"].includes(attack.data.patternId)) {
      const side = Math.sign(this.position.x - target.position.x) || -attack.facing;
      const safetyGap = attack.data.patternId === "CHILO_WING" ? WING_CONTACT_GAP_PX : LUNGE_CONTACT_GAP_PX;
      const separation = (target.bodyBox.width + this.bodySize.width) / 2 + safetyGap;
      const desiredX = target.position.x + side * separation;
      const destinationX = side > 0 ? Math.min(this.position.x, desiredX) : Math.max(this.position.x, desiredX);
      attack.startPosition = { x: this.position.x, y: this.position.y };
      attack.destinationPosition = {
        x: Math.max(this.data.arenaCenterMinX, Math.min(this.data.arenaCenterMaxX, destinationX)),
        y: this.position.y,
      };
      return;
    }
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
    if (["CHILO_WING", "CHILO_LUNGE"].includes(attack.data.patternId)) {
      const warningSec = attack.data.startupSec + (attack.extraWarningSec ?? 0);
      const progress = Math.min(1, attack.elapsedSec / warningSec);
      this.position.x = attack.startPosition.x
        + (attack.destinationPosition.x - attack.startPosition.x) * progress;
      return;
    }
    if (attack.data.kind !== "jump") return;
    if (attack.phase !== "warning") {
      this.position.x = attack.destinationPosition.x;
      this.position.y = attack.destinationPosition.y;
      return;
    }
    const warningSec = attack.data.startupSec + (attack.extraWarningSec ?? 0);
    const progress = Math.min(1, attack.elapsedSec / warningSec);
    const arc = 4 * this.data.jumpArcHeightPx * progress * (1 - progress);
    this.position.x = attack.startPosition.x
      + (attack.destinationPosition.x - attack.startPosition.x) * progress;
    this.position.y = this.data.y - arc;
  }

  onAttackFinished(attack) {
    if (!["jump", "melee"].includes(attack.data.kind)) return;
    if (!attack.destinationPosition) return;
    this.position.x = attack.destinationPosition.x;
    this.position.y = attack.destinationPosition.y;
  }

  onAttackCancelled(attack) {
    if (!attack.startPosition) return;
    this.position.x = attack.startPosition.x;
    this.position.y = attack.startPosition.y;
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
