import {
  CAMPAIGN_LEVELS,
  CAMPAIGN_MARK_COUNT,
  INITIAL_CAMPAIGN_ATTEMPTS,
  LEVEL_SCORE_BASE_BONUS,
  LEVEL_SCORE_HP_BONUS,
  SELECTABLE_FIGHTERS,
} from "./campaign-data.js";

export class CampaignController {
  #settledLevelIndexes = new Set();
  #scoredSpecials = new Set();

  constructor(levels = CAMPAIGN_LEVELS, fighters = SELECTABLE_FIGHTERS) {
    this.levels = levels;
    this.fighters = fighters;
    this.reset();
  }

  reset() {
    this.selectedFighterId = null;
    this.levelIndex = 0;
    this.marks = Array(CAMPAIGN_MARK_COUNT).fill(false);
    this.attemptsRemaining = INITIAL_CAMPAIGN_ATTEMPTS;
    this.campaignScore = 0;
    this.attemptScore = 0;
    this.terminal = null;
    this.#settledLevelIndexes.clear();
    this.#scoredSpecials.clear();
  }

  beginAttempt() {
    this.attemptScore = 0;
    this.#scoredSpecials.clear();
  }

  selectFighter(fighterId) {
    if (!this.fighters.some((fighter) => fighter.id === fighterId)) return false;
    this.selectedFighterId = fighterId;
    return true;
  }

  addCombatEvents(events) {
    for (const event of events) {
      if (event.kind !== "damageApplied" || event.targetId === this.selectedFighterId) continue;
      if (event.sourceId !== this.selectedFighterId) continue;
      if (event.attackInstanceId?.includes("-normal-")) this.attemptScore += 10;
      else if (event.attackInstanceId?.includes("-special-")) {
        const activationId = event.attackInstanceId.split("-projectile-")[0];
        if (!this.#scoredSpecials.has(activationId)) {
          this.#scoredSpecials.add(activationId);
          this.attemptScore += 25;
        }
      }
    }
  }

  settleVictory({ playerHp, remainingSeconds, attemptScore = this.attemptScore }) {
    if (this.#settledLevelIndexes.has(this.levelIndex)) return false;
    this.#settledLevelIndexes.add(this.levelIndex);
    this.marks[this.levelIndex] = true;
    this.attemptScore = attemptScore;
    const levelScore = attemptScore + LEVEL_SCORE_BASE_BONUS
      + LEVEL_SCORE_HP_BONUS * playerHp + Math.floor(Math.max(0, remainingSeconds));
    this.campaignScore += levelScore;
    this.attemptScore = 0;
    this.#scoredSpecials.clear();
    if (this.levelIndex + 1 >= this.levels.length) this.terminal = "VICTORIA";
    return true;
  }

  settleDefeat() {
    if (this.#settledLevelIndexes.has(this.levelIndex) || this.terminal) return false;
    this.attemptsRemaining = Math.max(0, this.attemptsRemaining - 1);
    this.attemptScore = 0;
    this.#scoredSpecials.clear();
    if (this.attemptsRemaining === 0) this.terminal = "GAME OVER";
    return true;
  }

  restartLevel() {
    if (this.attemptsRemaining <= 0 || this.terminal) return false;
    this.attemptsRemaining -= 1;
    this.attemptScore = 0;
    this.#scoredSpecials.clear();
    if (this.attemptsRemaining === 0) {
      this.terminal = "GAME OVER";
      return false;
    }
    return true;
  }

  retryAfterDefeat() {
    if (this.attemptsRemaining <= 0) return false;
    this.terminal = null;
    return true;
  }

  advance() {
    if (this.levelIndex + 1 >= this.levels.length) {
      this.terminal = "VICTORIA";
      return false;
    }
    this.levelIndex += 1;
    this.#settledLevelIndexes.delete(this.levelIndex);
    this.attemptScore = 0;
    return true;
  }

  abandon() {
    this.terminal = "ABANDONED";
    this.attemptScore = 0;
    this.selectedFighterId = null;
    this.#scoredSpecials.clear();
  }

  get currentLevel() { return this.levels[this.levelIndex] ?? null; }
  get snapshot() {
    return Object.freeze({
      selectedFighterId: this.selectedFighterId,
      levelIndex: this.levelIndex,
      marks: Object.freeze([...this.marks]),
      attemptsRemaining: this.attemptsRemaining,
      campaignScore: this.campaignScore,
      attemptScore: this.attemptScore,
      terminal: this.terminal,
    });
  }
}
