import { FIGHTER_COMBAT_STATS, PLAYER_INVULNERABILITY_SEC } from "./combat-config.js";

export class Combatant {
  #events = [];
  #deathEmitted = false;

  constructor({ id, maxHp, invulnerabilitySec = 0 }) {
    this.id = id;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.invulnerabilityDurationSec = invulnerabilitySec;
    this.invulnerabilityRemainingSec = 0;
  }

  get invulnerable() {
    return this.invulnerabilityRemainingSec > 0;
  }

  update(dt) {
    this.invulnerabilityRemainingSec = Math.max(0, this.invulnerabilityRemainingSec - dt);
  }

  applyDamage(baseDamage, { sourceId, attackInstanceId, step, reductionFactor = 1 } = {}) {
    if (this.hp <= 0 || this.invulnerable) return null;
    const amount = reductionFactor < 1 ? Math.max(1, Math.ceil(baseDamage * reductionFactor)) : baseDamage;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerabilityRemainingSec = this.invulnerabilityDurationSec;
    const damageEvent = this.#emit("damageApplied", {
      targetId: this.id,
      sourceId,
      attackInstanceId,
      amount,
      hp: this.hp,
      maxHp: this.maxHp,
      step,
    });
    if (this.hp === 0 && !this.#deathEmitted) {
      this.#deathEmitted = true;
      this.#emit("combatantDied", { targetId: this.id, sourceId, attackInstanceId, step });
    }
    return damageEvent;
  }

  drainEvents() {
    const events = this.#events;
    this.#events = [];
    return events;
  }

  #emit(kind, payload) {
    const event = Object.freeze({ kind, ...payload });
    this.#events.push(event);
    return event;
  }
}

export function createPlayerCombatant(fighterId) {
  const stats = FIGHTER_COMBAT_STATS[fighterId];
  if (stats === undefined) throw new Error(`No hay vida de combate para ${fighterId}.`);
  return new Combatant({ id: fighterId, maxHp: stats.maxHp, invulnerabilitySec: PLAYER_INVULNERABILITY_SEC });
}
