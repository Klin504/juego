import { Combatant } from "./combatant.js";

const ENEMY_STATE = Object.freeze({ IDLE: "inactivo", ATTACKING: "atacando", HURT: "herido", DEAD: "muerto" });
const ENEMY_FILL = "#e68aff";
const ENEMY_HURT_FILL = "#fff1fa";
const ENEMY_EDGE = "#fff1fa";
const ENEMY_MARK = "#51265d";
const ENEMY_TEXT = "#ffffff";
const ENEMY_FONT = "14px 'Courier New', monospace";

export class EnemyCombatant {
  #combatant;
  #phaseIndex = 0;
  #phaseChangePending = false;
  #domainEvents = [];
  #nextAttackIndex = 0;
  #interAttackRemainingSec;
  #hurtRemainingSec = 0;
  #nextAttackSerial = 1;

  constructor(data) {
    this.data = data;
    this.id = data.id;
    this.position = { x: data.x, y: data.y };
    this.facing = data.facing;
    this.bodySize = data.bodyBox;
    this.hurtSize = data.hurtBox;
    this.velocity = { x: 0, y: 0 };
    this.state = ENEMY_STATE.IDLE;
    this.attack = null;
    this.#interAttackRemainingSec = data.initialDelaySec ?? this.#phaseData().interAttackDelaySec ?? data.interAttackDelaySec;
    this.#combatant = new Combatant({ id: data.id, maxHp: data.maxHp });
  }

  get bodyBox() {
    return { x: this.position.x - this.bodySize.width / 2, y: this.position.y - this.bodySize.height, ...this.bodySize };
  }

  get hurtBox() {
    return { x: this.position.x - this.hurtSize.width / 2, y: this.position.y - this.hurtSize.height, ...this.hurtSize };
  }

  get hp() { return this.#combatant.hp; }
  get maxHp() { return this.#combatant.maxHp; }
  get phaseIndex() { return this.#phaseIndex; }

  peekNextAttack() {
    return this.#phaseData().attacks[this.#nextAttackIndex] ?? null;
  }

  update(dt, target) {
    const fired = [];
    this.#combatant.update(dt);
    this.#hurtRemainingSec = Math.max(0, this.#hurtRemainingSec - dt);
    if (this.hp <= 0) {
      this.state = ENEMY_STATE.DEAD;
      this.attack = null;
      return fired;
    }

    this.facing = target.position.x < this.position.x ? -1 : 1;
    if (!this.attack) {
      if (this.canStartAttack(target)) {
        this.#interAttackRemainingSec -= dt;
        if (this.#interAttackRemainingSec <= 0) this.#beginAttack(target);
      }
    } else {
      const before = this.attack.phase;
      this.attack.elapsedSec += dt;
      this.#setPhase();
      this.onAttackAdvanced(this.attack, dt, before);
      if (before === "warning" && this.attack.phase === "active" && this.attack.data.kind === "projectile") {
        fired.push({ kind: "patternProjectile", owner: "enemy", target, attack: this.attack });
      }
      if (this.attack.phase === "finished") {
        const finishedAttack = this.attack;
        this.attack = null;
        this.onAttackFinished(finishedAttack);
        if (!this.#advancePhaseIfPending()) {
          this.#interAttackRemainingSec = this.#phaseData().interAttackDelaySec ?? this.data.interAttackDelaySec;
        }
      }
    }

    this.state = this.#hurtRemainingSec > 0
      ? ENEMY_STATE.HURT
      : this.attack ? ENEMY_STATE.ATTACKING : ENEMY_STATE.IDLE;
    return fired;
  }

  activeAttackBox() {
    if (this.hp <= 0 || !this.attack || this.attack.phase !== "active") return null;
    return this.currentAttackBox();
  }

  createProjectileSpecification() { return null; }
  isPlayerSafeFromAttack() { return false; }

  currentAttackBox() {
    if (!this.attack || !["melee", "jump"].includes(this.attack.data.kind)) return null;
    const attack = this.attack.data;
    if (attack.kind === "jump") {
      const diameter = attack.diameterPx;
      return {
        x: this.attack.targetPosition.x - diameter / 2,
        y: this.attack.targetPosition.y - diameter / 2,
        width: diameter,
        height: diameter,
      };
    }
    const body = this.bodyBox;
    return {
      x: this.attack.facing > 0 ? body.x + body.width + attack.offsetX : body.x - attack.offsetX - attack.width,
      y: this.position.y + attack.offsetY,
      width: attack.width,
      height: attack.height,
    };
  }

  applyDamage(amount, details) {
    const event = this.#combatant.applyDamage(amount, details);
    if (event) this.#hurtRemainingSec = this.data.hurtFlashSec;
    if (this.hp <= 0) this.state = ENEMY_STATE.DEAD;
    else if (event) {
      this.state = ENEMY_STATE.HURT;
      const threshold = this.#phaseData().transitionAtHp;
      if (threshold !== undefined && this.hp <= threshold) {
        this.#phaseChangePending = true;
        if (!this.attack) this.#advancePhaseIfPending();
      }
    }
    return event;
  }

  canStartAttack() { return true; }
  onAttackStarted() {}
  onAttackAdvanced() {}
  onAttackFinished() {}
  onPhaseChanged() {}

  drainEvents() {
    const events = [...this.#combatant.drainEvents(), ...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }

  render(ctx) {
    const body = this.bodyBox;
    ctx.fillStyle = this.hp <= 0 ? "#533956" : this.#hurtRemainingSec > 0 ? ENEMY_HURT_FILL : ENEMY_FILL;
    ctx.fillRect(body.x, body.y, body.width, body.height);
    ctx.strokeStyle = ENEMY_EDGE;
    ctx.lineWidth = 2;
    ctx.strokeRect(body.x + 1, body.y + 1, body.width - 2, body.height - 2);
    ctx.fillStyle = ENEMY_MARK;
    ctx.fillRect(this.facing > 0 ? body.x + body.width - 12 : body.x + 8, body.y + 18, 5, 5);
    if (this.hp <= 0) {
      ctx.strokeStyle = "#ff6173";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(body.x + 8, body.y + 8);
      ctx.lineTo(body.x + body.width - 8, body.y + body.height - 8);
      ctx.moveTo(body.x + body.width - 8, body.y + 8);
      ctx.lineTo(body.x + 8, body.y + body.height - 8);
      ctx.stroke();
    }
    ctx.fillStyle = ENEMY_TEXT;
    ctx.font = ENEMY_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const attackLabel = this.attack
      ? `${this.attack.data.name} · ${this.attack.phase}`
      : `${this.data.name ?? "Muñeco"} · ${this.state}`;
    ctx.fillText(attackLabel, this.position.x, body.y - 7);
  }

  #beginAttack(target) {
    const data = this.peekNextAttack();
    const attacks = this.#phaseData().attacks;
    this.#nextAttackIndex = (this.#nextAttackIndex + 1) % attacks.length;
    this.attack = {
      id: `${this.id}-attack-${this.#nextAttackSerial++}`,
      data,
      elapsedSec: 0,
      phase: "warning",
      facing: this.facing,
      targetPosition: { x: target.position.x, y: target.position.y - target.hurtBox.height / 2 },
      contactedTargets: new Set(),
      extraWarningSec: 0,
    };
    this.#setPhase();
    this.onAttackStarted(this.attack, target);
  }

  extendCurrentWarning(seconds) {
    if (!this.attack || this.attack.phase !== "warning") return false;
    this.attack.extraWarningSec = (this.attack.extraWarningSec ?? 0) + seconds;
    this.#setPhase();
    return true;
  }

  cancelCurrentAttack() {
    if (!this.attack) return false;
    const cancelled = this.attack;
    this.attack = null;
    this.onAttackFinished(cancelled);
    return true;
  }

  #setPhase() {
    const attack = this.attack;
    if (!attack) return;
    const { startupSec, activeSec, recoverySec } = attack.data;
    const effectiveStartup = startupSec + (attack.extraWarningSec ?? 0);
    if (attack.elapsedSec < effectiveStartup) attack.phase = "warning";
    else if (attack.elapsedSec < effectiveStartup + activeSec) attack.phase = "active";
    else if (attack.elapsedSec < effectiveStartup + activeSec + recoverySec) attack.phase = "recovery";
    else attack.phase = "finished";
  }

  #phaseData() {
    return this.data.phases?.[this.#phaseIndex] ?? this.data;
  }

  #advancePhaseIfPending() {
    if (!this.#phaseChangePending || this.#phaseIndex + 1 >= (this.data.phases?.length ?? 0)) return false;
    this.#phaseIndex += 1;
    this.#nextAttackIndex = 0;
    this.#phaseChangePending = false;
    this.#interAttackRemainingSec = this.#phaseData().interAttackDelaySec ?? this.data.interAttackDelaySec;
    this.#domainEvents.push({
      kind: "phaseChanged",
      sourceId: this.id,
      phaseIndex: this.#phaseIndex,
      hp: this.hp,
    });
    this.onPhaseChanged(this.#phaseIndex, this.hp);
    return true;
  }
}

export { ENEMY_STATE };
