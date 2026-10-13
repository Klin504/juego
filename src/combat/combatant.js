/** Representa vida, invulnerabilidad y eventos de daño de un combatiente. */

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

  /** Aplica daño efectivo, concede invulnerabilidad breve y emite el resultado. */
  applyDamage(baseDamage, { sourceId, attackInstanceId, step, reductionFactor = 1 } = {}) {
    // Defensa y carga reducen el daño antes de emitir el único evento de impacto.
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
    // La muerte se anuncia una sola vez, aunque lleguen más impactos después.
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
  // La vida inicial proviene de la tabla compartida con la pantalla de selección.
  const stats = FIGHTER_COMBAT_STATS[fighterId];
  if (stats === undefined) throw new Error(`No hay vida de combate para ${fighterId}.`);
  return new Combatant({ id: fighterId, maxHp: stats.maxHp, invulnerabilitySec: PLAYER_INVULNERABILITY_SEC });
}
