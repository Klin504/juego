/** Elige desplazamiento, esquivas, ataques y combos de los jefes. */

import { rectanglesOverlap } from "./attack-geometry.js";

// Valores base de movimiento y reacción; cada jefe puede sobrescribirlos.
const DEFAULTS = Object.freeze({
  leftBoundX: 92,
  rightBoundX: 868,
  minRangePx: 110,
  maxRangePx: 235,
  moveSpeedPxPerSec: 92,
  strafeMinSec: 0.45,
  strafeMaxSec: 1.15,
  dodgeDistancePx: 126,
  dodgeSpeedPxPerSec: 780,
  dodgeDurationSec: 0.17,
  dodgeCooldownSec: 1.5,
  dodgeChance: 0.52,
  comboChance: 0.24,
  comboDelaySec: 0.42,
  comboDamageMultiplier: 1.18,
  intervalJitterSec: 0.28,
  jumpMemorySec: 1.8,
  guardMemorySec: 0.7,
});

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

export class BossAI {
  #settings;
  #randomState;
  #recentPatterns = [];
  #handledThreatIds = new Set();
  #dodgeCooldownSec = 0;
  #dodgeRemainingSec = 0;
  #dodgeDirection = 0;
  #strafeDirection = 1;
  #strafeRemainingSec = 0;
  #jumpMemoryRemainingSec = 0;
  #guardMemoryRemainingSec = 0;
  #normalAttackMemorySec = 0;
  #normalAttackStreak = 0;
  #specialMemoryRemainingSec = 0;

  constructor(bossId, settings = {}) {
    this.#settings = { ...DEFAULTS, ...settings };
    this.#randomState = (hashSeed(bossId) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 || 1;
  }

  /**
   * Conserva una memoria corta de saltos, guardia y ataques del jugador.
   * Usa esa información para variar el desplazamiento y reaccionar a amenazas.
   */
  update(dt, {
    boss,
    target,
    threats = [],
    playerBehavior = {},
    canMove = true,
    canDodge = canMove,
    phaseIndex = 0,
  }) {
    const aggression = Math.max(0, phaseIndex);
    this.#dodgeCooldownSec = Math.max(0, this.#dodgeCooldownSec - dt * (1 + aggression * 0.22));
    this.#jumpMemoryRemainingSec = playerBehavior.jumpPressed
      ? this.#settings.jumpMemorySec
      : Math.max(0, this.#jumpMemoryRemainingSec - dt);
    this.#guardMemoryRemainingSec = playerBehavior.guardHeld
      ? this.#settings.guardMemorySec
      : Math.max(0, this.#guardMemoryRemainingSec - dt * 1.5);
    if (playerBehavior.normalAttackPressed) {
      this.#normalAttackStreak = this.#normalAttackMemorySec > 0
        ? Math.min(5, this.#normalAttackStreak + 1)
        : 1;
      this.#normalAttackMemorySec = 0.9;
    } else {
      this.#normalAttackMemorySec = Math.max(0, this.#normalAttackMemorySec - dt);
      if (this.#normalAttackMemorySec === 0) this.#normalAttackStreak = 0;
    }
    this.#specialMemoryRemainingSec = playerBehavior.specialPressed
      ? 1.1
      : Math.max(0, this.#specialMemoryRemainingSec - dt);

    const dodge = canDodge
      ? this.#advanceDodge(dt, boss, target, threats, aggression)
      : null;
    if (dodge) return dodge;
    if (!canMove) return { isDodging: false, dodged: false };

    const targetGap = this.#edgeDistance(boss, target);
    const minimumGap = (boss.bodySize.width + target.bodyBox.width) / 2 + 10;
    let direction = 0;

    if (targetGap > this.#settings.maxRangePx) {
      direction = Math.sign(target.position.x - boss.position.x);
    } else if (targetGap < this.#settings.minRangePx) {
      direction = Math.sign(boss.position.x - target.position.x);
    } else {
      this.#strafeRemainingSec -= dt;
      if (this.#strafeRemainingSec <= 0) {
        this.#strafeDirection = this.#random() < 0.5 ? -1 : 1;
        this.#strafeRemainingSec = this.#randomBetween(
          this.#settings.strafeMinSec,
          this.#settings.strafeMaxSec,
        );
      }
      direction = this.#strafeDirection;
    }

    let nextX = clamp(
      boss.position.x + direction * this.#settings.moveSpeedPxPerSec * (1 + aggression * 0.18) * dt,
      this.#settings.leftBoundX,
      this.#settings.rightBoundX,
    );
    if (Math.abs(nextX - target.position.x) < minimumGap) {
      nextX = clamp(
        target.position.x + Math.sign(boss.position.x - target.position.x || -boss.facing) * minimumGap,
        this.#settings.leftBoundX,
        this.#settings.rightBoundX,
      );
    }
    boss.position.x = nextX;
    return { isDodging: false, dodged: false };
  }

  tacticalContext(boss, target) {
    const distancePx = this.#edgeDistance(boss, target);
    const playerDirection = Math.sign(boss.position.x - target.position.x);
    const velocityDirection = Math.sign(target.velocity?.x ?? 0);
    return {
      distancePx,
      playerGuarding: this.#guardMemoryRemainingSec > 0,
      playerAirborne: !target.grounded,
      playerRecentlyJumped: this.#jumpMemoryRemainingSec > 0,
      playerAdvancing: velocityDirection !== 0 && velocityDirection === playerDirection,
      playerAttackingRecently: this.#normalAttackMemorySec > 0,
      playerAttackStreak: this.#normalAttackStreak,
      playerUsedSpecialRecently: this.#specialMemoryRemainingSec > 0,
    };
  }

  /** Pondera patrones según distancia, fase y acciones recientes del jugador. */
  chooseAttack(attacks, context) {
    if (!attacks?.length) return null;
    // Primero descarta los dos patrones recientes para reducir secuencias repetidas.
    const lastPatterns = this.#recentPatterns.slice(-2);
    let candidates = attacks.filter((attack) => !lastPatterns.includes(attack.patternId));
    const mostRecentPattern = this.#recentPatterns[this.#recentPatterns.length - 1];
    if (!candidates.length) candidates = attacks.filter((attack) => attack.patternId !== mostRecentPattern);
    if (!candidates.length) candidates = attacks;

    // Después sortea entre los restantes con pesos adaptados al contexto del jugador.
    const weighted = candidates.map((attack) => ({
      attack,
      weight: this.#attackWeight(attack, context),
    }));
    const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
    let choice = this.#random() * totalWeight;
    for (const item of weighted) {
      choice -= item.weight;
      if (choice <= 0) return item.attack;
    }
    return weighted[weighted.length - 1].attack;
  }

  /** Decide si enlaza otro patrón al terminar el ataque actual. */
  chooseComboFollowUp(attack, availableAttacks, context) {
    const patternIds = attack.comboFollowUpIds ?? [];
    if (!patternIds.length) return null;
    const candidates = availableAttacks.filter((candidate) => patternIds.includes(candidate.patternId));
    if (!candidates.length) return null;

    // La presión y el uso repetido de ataques elevan la posibilidad de un combo.
    const pressureBonus = context.playerGuarding || context.playerRecentlyJumped ? 0.12 : 0;
    const spamBonus = context.playerAttackStreak >= 3 || context.playerUsedSpecialRecently ? 0.12 : 0;
    const chance = Math.min(0.82, (attack.comboChance ?? this.#settings.comboChance) + pressureBonus + spamBonus);
    if (this.#random() >= chance) return null;
    return this.chooseAttack(candidates, context);
  }

  noteAttackStarted(patternId) {
    this.#recentPatterns.push(patternId);
    if (this.#recentPatterns.length > 4) this.#recentPatterns.shift();
  }

  nextInterAttackDelay(baseDelaySec) {
    const jitter = this.#settings.intervalJitterSec;
    return Math.max(0.45, baseDelaySec + this.#randomBetween(-jitter, jitter));
  }

  get comboDelaySec() { return this.#settings.comboDelaySec; }
  get comboDamageMultiplier() { return this.#settings.comboDamageMultiplier; }
  get dodgeDurationSec() { return this.#settings.dodgeDurationSec; }
  get dodgeRecoveryDelaySec() { return this.#settings.dodgeRecoveryDelaySec ?? 0.38; }

  /** Detecta amenazas activas y aplica el desplazamiento de evasión. */
  #advanceDodge(dt, boss, target, threats, aggression) {
    if (this.#dodgeRemainingSec > 0) {
      const before = boss.position.x;
      boss.position.x = clamp(
        boss.position.x + this.#dodgeDirection * this.#settings.dodgeSpeedPxPerSec * dt,
        this.#settings.leftBoundX,
        this.#settings.rightBoundX,
      );
      this.#dodgeRemainingSec = Math.max(0, this.#dodgeRemainingSec - dt);
      return { isDodging: true, dodged: false, deltaX: boss.position.x - before };
    }

    const hurtBox = {
      x: boss.position.x - boss.hurtSize.width / 2,
      y: boss.position.y - boss.hurtSize.height,
      width: boss.hurtSize.width,
      height: boss.hurtSize.height,
    };
    const threat = threats.find((candidate) =>
      !this.#handledThreatIds.has(candidate.id) && rectanglesOverlap(hurtBox, candidate.box));
    if (!threat) return null;
    this.#rememberThreat(threat.id);

    const threatBonus = threat.kind === "normal"
      ? Math.min(0.2, Math.max(0, this.#normalAttackStreak - 1) * 0.06)
      : threat.kind === "special" ? 0.12 : 0.06;
    const dodgeChance = clamp(this.#settings.dodgeChance + threatBonus + aggression * 0.08, 0, 0.9);
    if (this.#dodgeCooldownSec > 0 || this.#random() >= dodgeChance) return null;
    this.#dodgeDirection = this.#chooseDodgeDirection(boss, target, threats);
    this.#dodgeCooldownSec = Math.max(0.38, this.#settings.dodgeCooldownSec / (1 + aggression * 0.18));
    this.#dodgeRemainingSec = this.#settings.dodgeDurationSec;
    const before = boss.position.x;
    boss.position.x = clamp(
      boss.position.x + this.#dodgeDirection * this.#settings.dodgeSpeedPxPerSec * dt,
      this.#settings.leftBoundX,
      this.#settings.rightBoundX,
    );
    this.#dodgeRemainingSec = Math.max(0, this.#dodgeRemainingSec - dt);
    return { isDodging: true, dodged: true, deltaX: boss.position.x - before };
  }

  #chooseDodgeDirection(boss, target, threats) {
    const directions = [-1, 1];
    const awayFromPlayer = Math.sign(boss.position.x - target.position.x) || -boss.facing;
    // Penaliza más una nueva colisión que la cercanía al borde de la arena.
    const scoreDirection = (direction) => {
      const x = clamp(
        boss.position.x + direction * this.#settings.dodgeDistancePx,
        this.#settings.leftBoundX,
        this.#settings.rightBoundX,
      );
      const projectedHurtBox = {
        x: x - boss.hurtSize.width / 2,
        y: boss.position.y - boss.hurtSize.height,
        width: boss.hurtSize.width,
        height: boss.hurtSize.height,
      };
      const hits = threats.filter((candidate) => rectanglesOverlap(projectedHurtBox, candidate.box)).length;
      const spaceScore = Math.min(x - this.#settings.leftBoundX, this.#settings.rightBoundX - x);
      return -hits * 10000 + spaceScore + (direction === awayFromPlayer ? 20 : 0);
    };
    return scoreDirection(directions[0]) >= scoreDirection(directions[1]) ? directions[0] : directions[1];
  }

  /** Ajusta la probabilidad de un patrón según alcance y hábitos recientes. */
  #attackWeight(attack, context) {
    const style = attack.ai ?? {};
    let weight = style.weight ?? 1;
    const distance = context.distancePx;
    if (style.range === "close" && distance > 235) weight *= 0.42;
    else if (style.range === "close" && distance < 48) weight *= 0.7;
    else if (style.range === "mid" && (distance < 80 || distance > 390)) weight *= 0.58;
    else if (style.range === "far" && distance < 130) weight *= 0.62;
    else if (style.range && distance >= 130) weight *= 1.2;

    if (context.playerGuarding) weight *= style.countersGuard ? 2.1 : 0.82;
    if (context.playerAirborne || context.playerRecentlyJumped) {
      weight *= style.countersJump ? 2.3 : 0.86;
    }
    if (context.playerAdvancing && style.countersApproach) weight *= 1.8;
    if (context.playerAttackingRecently) weight *= style.countersAttack ? 2.4 : 0.72;
    if (context.playerAttackStreak >= 3 && style.countersAttack) weight *= 1.45;
    if (context.playerUsedSpecialRecently) weight *= style.countersSpecial ? 1.75 : 0.88;
    if (this.#recentPatterns.slice(-2).includes(attack.patternId)) weight *= 0.08;
    return Math.max(0.05, weight);
  }

  #edgeDistance(boss, target) {
    return Math.max(0, Math.abs(target.position.x - boss.position.x)
      - (boss.bodySize.width + target.bodyBox.width) / 2);
  }

  #rememberThreat(id) {
    this.#handledThreatIds.add(id);
    if (this.#handledThreatIds.size > 48) {
      this.#handledThreatIds.delete(this.#handledThreatIds.values().next().value);
    }
  }

  #random() {
    let value = this.#randomState;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.#randomState = value >>> 0 || 1;
    return this.#randomState / 0x100000000;
  }

  #randomBetween(minimum, maximum) {
    return minimum + (maximum - minimum) * this.#random();
  }
}
