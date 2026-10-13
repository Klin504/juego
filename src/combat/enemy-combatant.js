/** Gestiona el ciclo común de aviso, ataque y recuperación de un jefe. */

import { Combatant } from "./combatant.js";
import { BossAI } from "./boss-ai.js";

const ENEMY_STATE = Object.freeze({ IDLE: "inactivo", ATTACKING: "atacando", DODGING: "esquivando", HURT: "herido", DEAD: "muerto" });
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
  #phaseNoticeRemainingSec = 0;
  #nextAttackSerial = 1;
  #bossAI;
  #plannedAttackData = null;
  #plannedAttackIsCombo = false;
  #dodgeVisualRemainingSec = 0;

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
    this.#bossAI = data.ai ? new BossAI(data.id, data.ai) : null;
    if (this.#bossAI) this.#plannedAttackData = this.#phaseData().attacks[0] ?? null;
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
  get phaseNoticeRemainingSec() { return this.#phaseNoticeRemainingSec; }
  get dodging() { return this.state === ENEMY_STATE.DODGING; }

  peekNextAttack() {
    if (this.#bossAI && this.#plannedAttackData) return this.#plannedAttackData;
    return this.#phaseData().attacks[this.#nextAttackIndex] ?? null;
  }

  /** Avanza la fase, la IA y la secuencia de aviso, golpe y recuperación. */
  update(dt, target, playerContext = {}) {
    const fired = [];
    const previousX = this.position.x;
    const previousY = this.position.y;
    this.#combatant.update(dt);
    this.#hurtRemainingSec = Math.max(0, this.#hurtRemainingSec - dt);
    this.#phaseNoticeRemainingSec = Math.max(0, this.#phaseNoticeRemainingSec - dt);
    this.#dodgeVisualRemainingSec = Math.max(0, this.#dodgeVisualRemainingSec - dt);
    if (this.hp <= 0) {
      this.state = ENEMY_STATE.DEAD;
      this.attack = null;
      this.velocity.x = 0;
      this.velocity.y = 0;
      return fired;
    }

    const canMoveWhileIdle = !this.attack && this.canMoveWhileIdle(target);
    const aiFrame = this.#bossAI?.update(dt, {
      boss: this,
      target,
      threats: playerContext.threats ?? [],
      playerBehavior: playerContext.behavior ?? {},
      canMove: canMoveWhileIdle,
      canDodge: canMoveWhileIdle || this.attack?.phase === "warning",
      phaseIndex: this.#phaseIndex,
    });
    // Esquivar durante un aviso cancela ese ataque y exige una breve recuperación.
    if (aiFrame?.dodged) {
      this.#dodgeVisualRemainingSec = this.#bossAI.dodgeDurationSec;
      this.#domainEvents.push({ kind: "bossDodged", sourceId: this.id });
      if (this.attack?.phase === "warning") {
        const interrupted = this.attack;
        const dodgePosition = { x: this.position.x, y: this.position.y };
        this.attack = null;
        this.#plannedAttackIsCombo = false;
        this.onAttackCancelled(interrupted);
        this.position.x = dodgePosition.x;
        this.position.y = dodgePosition.y;
        this.#interAttackRemainingSec = this.#bossAI.dodgeRecoveryDelaySec;
        this.#domainEvents.push({
          kind: "bossAttackEvaded",
          sourceId: this.id,
          patternId: interrupted.data.patternId,
        });
        this.#advancePhaseIfPending();
      }
    }

    if (!this.attack) {
      this.facing = target.position.x < this.position.x ? -1 : 1;
      this.onIdleAdvanced(dt, target);
      if (!aiFrame?.isDodging && this.canStartAttack(target)) {
        this.#interAttackRemainingSec -= dt;
        if (this.#interAttackRemainingSec <= 0) this.#beginAttack(target);
      }
    } else {
      const before = this.attack.phase;
      const previousElapsedSec = this.attack.elapsedSec;
      this.attack.elapsedSec += dt;
      this.#setPhase();
      this.onAttackAdvanced(this.attack, dt, before);
      // El proyectil nace al pasar del aviso a la fase activa, una sola vez.
      const activeStartSec = this.attack.data.startupSec + (this.attack.extraWarningSec ?? 0);
      if (previousElapsedSec < activeStartSec && this.attack.elapsedSec >= activeStartSec
        && this.attack.data.kind === "projectile") {
        fired.push({ kind: "patternProjectile", owner: "enemy", target, attack: this.attack });
      }
      if (this.attack.phase === "finished") {
        const finishedAttack = this.attack;
        this.attack = null;
        this.onAttackFinished(finishedAttack);
        if (!this.#advancePhaseIfPending()) {
          if (this.#plannedAttackIsCombo) {
            this.#interAttackRemainingSec = this.#bossAI.comboDelaySec;
          } else {
            const baseDelay = this.#phaseData().interAttackDelaySec ?? this.data.interAttackDelaySec;
            this.#interAttackRemainingSec = this.#bossAI?.nextInterAttackDelay(baseDelay) ?? baseDelay;
          }
        }
      }
    }

    this.state = this.#hurtRemainingSec > 0
      ? ENEMY_STATE.HURT
      : this.attack ? ENEMY_STATE.ATTACKING
        : aiFrame?.isDodging || this.#dodgeVisualRemainingSec > 0 ? ENEMY_STATE.DODGING : ENEMY_STATE.IDLE;
    this.velocity.x = dt > 0 ? (this.position.x - previousX) / dt : 0;
    this.velocity.y = dt > 0 ? (this.position.y - previousY) / dt : 0;
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

  /** Registra un impacto, activa la reacción de daño y prepara la fase siguiente. */
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

  // Los jefes concretos sobrescriben estos puntos para aportar reglas propias.
  canStartAttack() { return true; }
  canMoveWhileIdle() { return true; }
  onIdleAdvanced() {}
  onAttackStarted() {}
  onAttackAdvanced() {}
  onAttackFinished() {}
  onAttackCancelled() {}
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
    if (this.#phaseNoticeRemainingSec > 0) {
      ctx.fillStyle = "rgba(12, 18, 34, 0.94)";
      ctx.fillRect(320, 134, 320, 46);
      ctx.strokeStyle = "#ffd37b";
      ctx.lineWidth = 3;
      ctx.strokeRect(320, 134, 320, 46);
      ctx.fillStyle = "#fff1c5";
      ctx.font = "bold 17px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${this.data.name} · FASE ${this.#phaseIndex + 1}`, 480, 157);
    }
  }

  /** Convierte el patrón elegido por la IA en un ataque con identidad propia. */
  #beginAttack(target) {
    const baseData = this.peekNextAttack();
    if (!baseData) return;
    const attacks = this.#phaseData().attacks;
    if (!this.#bossAI) this.#nextAttackIndex = (this.#nextAttackIndex + 1) % attacks.length;
    const isComboFinisher = this.#plannedAttackIsCombo;
    const data = isComboFinisher
      ? Object.freeze({
          ...baseData,
          damage: Math.ceil(baseData.damage * this.#bossAI.comboDamageMultiplier),
          name: `${baseData.name} · COMBO`,
        })
      : baseData;
    this.attack = {
      id: `${this.id}-attack-${this.#nextAttackSerial++}`,
      data,
      isComboFinisher,
      elapsedSec: 0,
      phase: "warning",
      facing: this.facing,
      targetPosition: { x: target.position.x, y: target.position.y - target.hurtBox.height / 2 },
      contactedTargets: new Set(),
      extraWarningSec: 0,
    };
    this.#setPhase();
    this.onAttackStarted(this.attack, target);

    if (this.#bossAI) {
      this.#bossAI.noteAttackStarted(baseData.patternId);
      const context = this.#bossAI.tacticalContext(this, target);
      const followUp = isComboFinisher
        ? null
        : this.#bossAI.chooseComboFollowUp(baseData, attacks, context);
      this.#plannedAttackIsCombo = Boolean(followUp);
      this.#plannedAttackData = followUp ?? this.#bossAI.chooseAttack(attacks, context);
    }
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
    this.onAttackCancelled(cancelled);
    this.#plannedAttackIsCombo = false;
    return true;
  }

  cancelPlannedCombo(target) {
    if (!this.#bossAI || !this.#plannedAttackIsCombo) return false;
    this.#plannedAttackIsCombo = false;
    this.#plannedAttackData = this.#bossAI.chooseAttack(
      this.#phaseData().attacks,
      this.#bossAI.tacticalContext(this, target),
    );
    return true;
  }

  replanNextAttack(target, excludedPatternIds = []) {
    if (!this.#bossAI) return false;
    const excluded = new Set(excludedPatternIds);
    const availableAttacks = this.#phaseData().attacks.filter((attack) => !excluded.has(attack.patternId));
    const replacement = this.#bossAI.chooseAttack(
      availableAttacks,
      this.#bossAI.tacticalContext(this, target),
    );
    if (!replacement) return false;
    this.#plannedAttackData = replacement;
    this.#plannedAttackIsCombo = false;
    return true;
  }

  #setPhase() {
    const attack = this.attack;
    if (!attack) return;
    const { startupSec, activeSec, recoverySec } = attack.data;
    const effectiveActive = attack.activeSec ?? activeSec;
    const effectiveStartup = startupSec + (attack.extraWarningSec ?? 0);
    if (attack.elapsedSec < effectiveStartup) attack.phase = "warning";
    else if (attack.elapsedSec < effectiveStartup + effectiveActive) attack.phase = "active";
    else if (attack.elapsedSec < effectiveStartup + effectiveActive + recoverySec) attack.phase = "recovery";
    else attack.phase = "finished";
  }

  #phaseData() {
    return this.data.phases?.[this.#phaseIndex] ?? this.data;
  }

  /** Cambia de fase entre acciones para no cortar un ataque en curso. */
  #advancePhaseIfPending() {
    if (!this.#phaseChangePending || this.#phaseIndex + 1 >= (this.data.phases?.length ?? 0)) return false;
    this.#phaseIndex += 1;
    this.#phaseNoticeRemainingSec = 1.5;
    this.#nextAttackIndex = 0;
    this.#plannedAttackData = this.#phaseData().attacks[0] ?? null;
    this.#plannedAttackIsCombo = false;
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
