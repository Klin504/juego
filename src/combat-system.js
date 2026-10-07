import { LOGICAL_WIDTH } from "./constants.js";
import { PLAYER_ATTACKS, TRAINING_DUMMY_DATA } from "./combat-data.js";
import {
  DEBUG_ATTACKBOX_COLOR,
  DEBUG_ENEMY_ATTACKBOX_COLOR,
  DEBUG_ENEMY_HURTBOX_COLOR,
  DEBUG_PLAYER_HURTBOX_COLOR,
  DEBUG_PROJECTILE_COLOR,
  ENEMY_HEALTH_COLOR,
  GUARD_DAMAGE_FACTOR,
  HEALTH_BACKGROUND_COLOR,
  HEALTH_BORDER_COLOR,
  PLAYER_HEALTH_COLOR,
  PLAYER_SPECIALS,
  PROJECTILE_CLEANUP_MARGIN_PX,
  MAX_ACTIVE_PROJECTILES,
  COMBAT_OUTCOME,
} from "./combat-config.js";
import { createPlayerCombatant } from "./combatant.js";
import { orientedAttackBox, rectanglesOverlap } from "./attack-geometry.js";
import { EnemyCombatant } from "./enemy-combatant.js";
import { Projectile } from "./projectile.js";
import { playerClearsGroundHazard, renderSensorWarning } from "./laboratory-mechanics.js";

const HUD_FONT = "bold 14px 'Courier New', monospace";
const DEBUG_FONT = "12px 'Courier New', monospace";
const BAR_HEIGHT = 14;
const BAR_WIDTH = 284;
const BAR_Y = 70;
const PLAYER_BAR_X = 24;
const ENEMY_BAR_X = LOGICAL_WIDTH - PLAYER_BAR_X - BAR_WIDTH;
const BAR_TEXT_OFFSET = 7;
const TELEGRAPH_COLOR = "#ffb04d";
const PROJECTILE_FILL = "#ffd95a";
const SPECIAL_STATUS_Y = BAR_Y + BAR_HEIGHT + BAR_TEXT_OFFSET + 14;

function phaseOf(attack) {
  const { startupSec, activeSec, recoverySec } = attack.data;
  if (attack.elapsedSec < startupSec) return "warning";
  if (attack.elapsedSec < startupSec + activeSec) return "active";
  if (attack.elapsedSec < startupSec + activeSec + recoverySec) return "recovery";
  return "finished";
}

function circleOverlapsRectangle(circle, rectangle) {
  const nearestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
  const nearestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

function drawBox(ctx, box, color, label) {
  if (!box) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.fillStyle = color;
  ctx.font = DEBUG_FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, box.x, box.y - 2);
  ctx.restore();
}

export class CombatSystem {
  #playerCombatant;
  #enemy;
  #solids;
  #playerAttack = null;
  #playerAttackSerial = 1;
  #specialSerial = 1;
  #specialCooldownRemainingSec = 0;
  #specialDamageFactor = 1;
  #specialAttack = null;
  #step = 0;
  #eventSerial = 1;
  #projectiles = [];
  #events = [];
  #outcome = COMBAT_OUTCOME.IN_PROGRESS;

  constructor({ player, enemyData = TRAINING_DUMMY_DATA, enemyFactory = (data) => new EnemyCombatant(data), solids }) {
    this.player = player;
    this.#playerCombatant = createPlayerCombatant(player.fighterId);
    this.#enemy = enemyFactory(enemyData);
    this.#solids = solids;
    this.playerAttackDamage = PLAYER_ATTACKS.normal.damageByFighter[player.fighterId];
  }

  get playerCombatant() { return this.#playerCombatant; }
  get enemy() { return this.#enemy; }
  get projectiles() { return this.#projectiles; }
  get playerAttack() { return this.#playerAttack; }
  get specialCooldownRemainingSec() { return this.#specialCooldownRemainingSec; }
  get outcome() { return this.#outcome; }

  get snapshot() {
    const attackView = (attack) => attack
      ? Object.freeze({
          patternId: attack.data.patternId,
          attackInstanceId: attack.id,
          phase: attack.phase,
          elapsedSec: attack.elapsedSec,
        })
      : null;
    return Object.freeze({
      step: this.#step,
      player: Object.freeze({
        id: this.player.fighterId,
        hp: this.#playerCombatant.hp,
        maxHp: this.#playerCombatant.maxHp,
        invulnerable: this.#playerCombatant.invulnerable,
        invulnerabilityRemainingSec: this.#playerCombatant.invulnerabilityRemainingSec,
      }),
      enemy: Object.freeze({
        id: this.#enemy.id,
        hp: this.#enemy.hp,
        maxHp: this.#enemy.maxHp,
        state: this.#enemy.state,
        phaseIndex: this.#enemy.phaseIndex,
        currentAttack: attackView(this.#enemy.attack),
        nextPatternId: this.#enemy.peekNextAttack()?.patternId ?? null,
      }),
      playerAttack: attackView(this.#playerAttack),
      specialCooldownRemainingSec: this.#specialCooldownRemainingSec,
      projectiles: Object.freeze(this.#projectiles.map((projectile) => Object.freeze({
        id: projectile.id,
        patternId: projectile.patternId,
        attackInstanceId: projectile.attackInstanceId,
        owner: projectile.owner,
        x: projectile.position.x,
        y: projectile.position.y,
        lifetimeRemainingSec: projectile.lifetimeRemainingSec,
      }))),
    });
  }

  update(dt, actions) {
    if (this.#outcome !== COMBAT_OUTCOME.IN_PROGRESS) return Object.freeze([]);
    this.#step += 1;
    this.#events = [];
    this.#playerCombatant.update(dt);
    this.#specialCooldownRemainingSec = Math.max(0, this.#specialCooldownRemainingSec - dt);
    this.#specialDamageFactor = 1;
    if (this.#specialAttack) {
      this.#specialAttack.remainingSec -= dt;
      if (this.#specialAttack.remainingSec <= 0) this.#specialAttack = null;
    }
    const previousEnemyAttackId = this.#enemy.attack?.id;
    const enemyActions = this.#enemy.update(dt, this.#playerCombatant.hp > 0 ? this.player : this.#enemy);
    if (!previousEnemyAttackId && this.#enemy.attack) {
      this.#emit("warningStarted", {
        sourceId: this.#enemy.id,
        patternId: this.#enemy.attack.data.patternId,
        attackInstanceId: this.#enemy.attack.id,
      });
    }
    for (const action of enemyActions) {
      if (action.kind === "patternProjectile") this.#fireEnemyProjectile(action.attack);
    }

    const specialStarted = this.#startSpecial(actions.specialTap.pressed);
    if (!specialStarted) this.#startPlayerAttack(actions.normalAttack.pressed);
    this.#advancePlayerAttack(dt);
    this.#resolvePlayerAttack();
    this.#resolveSpecialAttack();
    this.#resolveEnemyMelee(actions);
    this.#updateProjectiles(actions, dt);
    this.#collectCombatantEvents();
    this.#resolveOutcome();
    return Object.freeze([...this.#events]);
  }

  #resolveOutcome() {
    if (this.#enemy.hp <= 0) this.#outcome = COMBAT_OUTCOME.PLAYER_VICTORY;
    else if (this.#playerCombatant.hp <= 0) this.#outcome = COMBAT_OUTCOME.PLAYER_DEFEAT;
    if (this.#outcome !== COMBAT_OUTCOME.IN_PROGRESS) {
      this.#emit("combatFinished", { outcome: this.#outcome });
    }
  }

  finishForTimeout() {
    if (this.#outcome !== COMBAT_OUTCOME.IN_PROGRESS) return this.#outcome;
    this.#step += 1;
    this.#events = [];
    if (this.#enemy.hp <= 0) this.#outcome = COMBAT_OUTCOME.PLAYER_VICTORY;
    else this.#outcome = COMBAT_OUTCOME.PLAYER_DEFEAT;
    this.#emit("combatFinished", { outcome: this.#outcome, reason: "time-limit" });
    return this.#outcome;
  }

  spawnProjectile(specification) {
    if (this.#projectiles.length >= MAX_ACTIVE_PROJECTILES) return false;
    this.#projectiles.push(new Projectile(specification));
    return true;
  }

  renderTelegraphs(ctx) {
    const attack = this.#enemy.attack;
    if (!attack || !["warning", "active"].includes(attack.phase)) return;
    if (attack.data.kind === "jump") {
      ctx.save();
      // PROVISIONAL: relleno del impacto al aterrizar, distinto del aviso.
      ctx.fillStyle = attack.phase === "active" ? "rgba(255, 120, 82, 0.24)" : "rgba(255, 226, 148, 0.12)";
      ctx.strokeStyle = TELEGRAPH_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(attack.targetPosition.x, attack.targetPosition.y, attack.data.diameterPx / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.setLineDash([7, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TELEGRAPH_COLOR;
      ctx.font = DEBUG_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${attack.data.name} · ${Math.max(0, attack.data.startupSec - attack.elapsedSec).toFixed(1)} s`, attack.targetPosition.x, attack.targetPosition.y - attack.data.diameterPx / 2 - 6);
      ctx.restore();
    } else if (attack.phase !== "warning") return;
    else if (attack.data.category === "groundSweep" && attack.sweepBox) {
      ctx.save();
      ctx.strokeStyle = TELEGRAPH_COLOR;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(attack.sweepBox.x, attack.sweepBox.y, attack.sweepBox.width, attack.sweepBox.height);
      ctx.setLineDash([]);
      ctx.fillStyle = TELEGRAPH_COLOR;
      ctx.font = DEBUG_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${attack.data.name} · salta · ${Math.max(0, attack.data.startupSec - attack.elapsedSec).toFixed(1)} s`, LOGICAL_WIDTH / 2, attack.sweepBox.y - 6);
      ctx.restore();
    } else if (attack.data.category === "floorSensor") {
      renderSensorWarning(ctx, attack.data.sensorId);
      ctx.save();
      ctx.fillStyle = TELEGRAPH_COLOR;
      ctx.font = DEBUG_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${attack.data.name} · centro o salto · ${Math.max(0, attack.data.startupSec - attack.elapsedSec).toFixed(1)} s`, LOGICAL_WIDTH / 2, 392);
      ctx.restore();
    } else if (attack.data.patternId === "CATODO_PULSE" && attack.projectileSpecification) {
      const route = attack.projectileSpecification;
      ctx.save();
      ctx.strokeStyle = TELEGRAPH_COLOR;
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 6]);
      ctx.beginPath();
      ctx.moveTo(route.x, route.y);
      ctx.lineTo(route.endX, route.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(route.x, route.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = TELEGRAPH_COLOR;
      ctx.font = DEBUG_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${attack.data.name} · salta o cúbrete · ${Math.max(0, attack.data.startupSec - attack.elapsedSec).toFixed(1)} s`, LOGICAL_WIDTH / 2, route.y - 22);
      ctx.restore();
    } else if (attack.data.patternId === "VERA_BALL" && attack.projectileSpecification) {
      const route = attack.projectileSpecification;
      ctx.save();
      ctx.strokeStyle = TELEGRAPH_COLOR;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(route.x, route.y);
      ctx.lineTo(route.routeLeftX, route.y);
      ctx.lineTo(route.routeRightX, route.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TELEGRAPH_COLOR;
      ctx.beginPath();
      ctx.arc(route.routeLeftX, route.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = DEBUG_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${attack.data.name} · ida ← rebote → regreso · ${Math.max(0, attack.data.startupSec - attack.elapsedSec).toFixed(1)} s`, LOGICAL_WIDTH / 2, route.y - 13);
      ctx.restore();
    }
    else if (attack.data.kind === "melee") {
      const box = this.#enemy.currentAttackBox();
      ctx.save();
      ctx.strokeStyle = TELEGRAPH_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = TELEGRAPH_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(this.#enemy.position.x, this.#enemy.position.y - this.#enemy.bodySize.height / 2);
      ctx.lineTo(attack.targetPosition.x, attack.targetPosition.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  renderHud(ctx) {
    this.#drawHealthBar(ctx, PLAYER_BAR_X, this.player.fighterId.toUpperCase(), this.#playerCombatant.hp, this.#playerCombatant.maxHp, PLAYER_HEALTH_COLOR, "left");
    this.#drawHealthBar(ctx, ENEMY_BAR_X, (this.#enemy.data.name ?? "MUÑECO").toUpperCase(), this.#enemy.hp, this.#enemy.maxHp, ENEMY_HEALTH_COLOR, "right");
  }

  renderDebug(ctx) {
    drawBox(ctx, this.player.hurtBox, DEBUG_PLAYER_HURTBOX_COLOR, "hurtbox jugador");
    drawBox(ctx, this.#enemy.hurtBox, DEBUG_ENEMY_HURTBOX_COLOR, "hurtbox enemigo");
    drawBox(ctx, this.#activePlayerAttackBox(), DEBUG_ATTACKBOX_COLOR, "hitbox jugador");
    drawBox(ctx, this.#specialAttack?.hitbox, "#ffd34e", "hitbox especial");
    drawBox(ctx, this.#enemy.activeAttackBox(), DEBUG_ENEMY_ATTACKBOX_COLOR, "hitbox enemigo");
    for (const projectile of this.#projectiles) {
      drawBox(ctx, projectile.box, DEBUG_PROJECTILE_COLOR, `${projectile.owner}: ${projectile.patternId}`);
    }

    ctx.save();
    ctx.font = DEBUG_FONT;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = DEBUG_ATTACKBOX_COLOR;
    ctx.fillText(`Ataque jugador: ${this.#playerAttack?.phase ?? "inactivo"}`, PLAYER_BAR_X, BAR_Y + BAR_HEIGHT + BAR_TEXT_OFFSET);
    ctx.fillStyle = DEBUG_ENEMY_ATTACKBOX_COLOR;
    ctx.fillText(`Ataque enemigo: ${this.#enemy.state}${this.#enemy.attack ? ` / ${this.#enemy.attack.phase}` : ""}`, ENEMY_BAR_X, BAR_Y + BAR_HEIGHT + BAR_TEXT_OFFSET);
    ctx.restore();
  }

  renderProjectiles(ctx) {
    for (const projectile of this.#projectiles) {
      const box = projectile.box;
      ctx.fillStyle = projectile.owner === "player" ? "#68e8ff" : PROJECTILE_FILL;
      ctx.strokeStyle = "#fff7d0";
      ctx.lineWidth = 1;
      if (projectile.radius) {
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }
    }
  }

  renderSpecialStatus(ctx) {
    const available = this.#specialCooldownRemainingSec <= 0;
    ctx.save();
    ctx.fillStyle = available ? "#ffffff" : "#d8b7ff";
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Shift: ${available ? "listo" : `${this.#specialCooldownRemainingSec.toFixed(1)} s`}`, PLAYER_BAR_X, SPECIAL_STATUS_Y);
    ctx.restore();
  }

  #startPlayerAttack(pressed) {
    if (!pressed || this.#playerAttack) return;
    this.#playerAttack = {
      id: `${this.player.fighterId}-normal-${this.#playerAttackSerial++}`,
      data: PLAYER_ATTACKS.normal,
      elapsedSec: 0,
      contactedTargets: new Set(),
    };
    this.#emit("attackStarted", {
      sourceId: this.player.fighterId,
      patternId: this.#playerAttack.data.patternId,
      attackInstanceId: this.#playerAttack.id,
    });
  }

  #startSpecial(pressed) {
    if (!pressed || this.#playerAttack || this.#specialCooldownRemainingSec > 0) return false;
    const special = PLAYER_SPECIALS[this.player.fighterId];
    if (!special) return false;
    this.#specialCooldownRemainingSec = special.cooldownSec;
    const attackInstanceId = `${this.player.fighterId}-special-${this.#specialSerial++}`;
    let hitbox = null;

    if (special.kind === "pulse") {
      hitbox = orientedAttackBox(this.player, special);
    } else if (special.kind === "charge") {
      this.#specialDamageFactor = special.damageReceivedFactor;
      this.#advanceCharge(special.dashDistancePx);
      hitbox = orientedAttackBox(this.player, special);
    } else if (special.kind === "volley") {
      this.#firePlayerVolley(special, attackInstanceId);
    }

    this.#specialAttack = hitbox
      ? { id: attackInstanceId, data: special, hitbox, contactedTargets: new Set(), remainingSec: special.activeSec }
      : null;
    this.#emit("specialActivated", {
      sourceId: this.player.fighterId,
      patternId: special.patternId,
      attackInstanceId,
      projectileCount: special.kind === "volley" ? special.projectileCount : 0,
    });
    return true;
  }

  #advanceCharge(distance) {
    const direction = this.player.facing;
    const body = this.player.bodyBox;
    let nextX = this.player.position.x + direction * distance;
    for (const solid of [...this.#solids, this.#enemy.bodyBox]) {
      if (body.y >= solid.y + solid.height || body.y + body.height <= solid.y) continue;
      const bodyRight = body.x + body.width;
      if (direction > 0 && bodyRight <= solid.x && nextX + body.width / 2 > solid.x) {
        nextX = Math.min(nextX, solid.x - body.width / 2);
      } else if (direction < 0 && body.x >= solid.x + solid.width && nextX - body.width / 2 < solid.x + solid.width) {
        nextX = Math.max(nextX, solid.x + solid.width + body.width / 2);
      }
    }
    this.player.position.x = nextX;
  }

  #firePlayerVolley(special, parentAttackInstanceId) {
    const projectileData = special.projectile;
    const offsets = [-projectileData.spreadPx, 0, projectileData.spreadPx];
    for (let index = 0; index < special.projectileCount; index += 1) {
      const projectileId = `${parentAttackInstanceId}-projectile-${index + 1}`;
      const x = this.player.position.x + this.player.facing * (this.player.bodyBox.width / 2 + projectileData.width / 2);
      const y = this.player.hurtBox.y + this.player.hurtBox.height / 2 + offsets[index];
      this.spawnProjectile({
        id: projectileId,
        patternId: special.patternId,
        attackInstanceId: projectileId,
        owner: "player",
        x,
        y,
        velocityX: this.player.facing * projectileData.speedPxPerSec,
        velocityY: 0,
        width: projectileData.width,
        height: projectileData.height,
        damage: special.damage,
        lifetimeSec: projectileData.lifetimeSec,
      });
    }
  }

  #advancePlayerAttack(dt) {
    if (!this.#playerAttack) return;
    this.#playerAttack.elapsedSec += dt;
    this.#playerAttack.phase = phaseOf(this.#playerAttack);
    if (this.#playerAttack.phase === "finished") this.#playerAttack = null;
  }

  #activePlayerAttackBox() {
    if (!this.#playerAttack || this.#playerAttack.phase !== "active") return null;
    return orientedAttackBox(this.player, this.#playerAttack.data);
  }

  #resolvePlayerAttack() {
    const attackBox = this.#activePlayerAttackBox();
    if (!attackBox || this.#enemy.hp <= 0 || this.#playerAttack.contactedTargets.has(this.#enemy.id)) return;
    if (!rectanglesOverlap(attackBox, this.#enemy.hurtBox)) return;
    this.#playerAttack.contactedTargets.add(this.#enemy.id);
    this.#applyDamage(this.#enemy, this.playerAttackDamage, this.player.fighterId, this.#playerAttack.id);
  }

  #resolveSpecialAttack() {
    const attack = this.#specialAttack;
    if (!attack?.hitbox || this.#enemy.hp <= 0 || attack.contactedTargets.has(this.#enemy.id)) return;
    if (!rectanglesOverlap(attack.hitbox, this.#enemy.hurtBox)) return;
    attack.contactedTargets.add(this.#enemy.id);
    if (attack.data.kind === "pulse" && this.#enemy.attack?.phase === "warning") {
      const currentAttack = this.#enemy.attack;
      currentAttack.elapsedSec = currentAttack.data.startupSec + currentAttack.data.activeSec;
      currentAttack.phase = "recovery";
      this.#emit("attackCancelled", {
        sourceId: this.player.fighterId,
        targetId: this.#enemy.id,
        attackInstanceId: currentAttack.id,
        patternId: currentAttack.data.patternId,
      });
    }
    this.#applyDamage(this.#enemy, attack.data.damage, this.player.fighterId, attack.id);
  }

  #resolveEnemyMelee(actions) {
    const attackBox = this.#enemy.activeAttackBox();
    const attack = this.#enemy.attack;
    if (!attackBox || !attack || attack.contactedTargets.has(this.player.fighterId)) return;
    if (this.#enemy.isPlayerSafeFromAttack(this.player, attack)) return;
    const floorY = this.#enemy.data.arenaGroundY ?? this.#enemy.data.court?.groundY;
    if (["groundSweep", "floorSensor"].includes(attack.data.category)
      && floorY !== undefined
      && playerClearsGroundHazard(this.player, floorY)) return;
    const overlaps = attack.data.shape === "circle"
      ? circleOverlapsRectangle({ x: attack.targetPosition.x, y: attack.targetPosition.y, radius: attack.data.diameterPx / 2 }, this.player.hurtBox)
      : rectanglesOverlap(attackBox, this.player.hurtBox);
    if (!overlaps) return;
    attack.contactedTargets.add(this.player.fighterId);
    const frontal = attack.data.category === "frontal" && actions.guard.held && this.player.grounded && this.player.facing === Math.sign(this.#enemy.position.x - this.player.position.x);
    const reductionFactor = this.#specialDamageFactor < 1
      ? this.#specialDamageFactor
      : frontal ? GUARD_DAMAGE_FACTOR : 1;
    this.#applyDamage(this.#playerCombatant, attack.data.damage, this.#enemy.id, attack.id, reductionFactor);
  }

  #updateProjectiles(actions, dt) {
    for (const projectile of this.#projectiles) {
      const target = projectile.owner === "enemy" ? this.#playerCombatant : this.#enemy;
      const targetEntity = projectile.owner === "enemy" ? this.player : this.#enemy;
      const collision = projectile.update(
        dt,
        projectile.courtReturn ? [] : this.#solids,
        target,
        targetEntity.hurtBox,
        PROJECTILE_CLEANUP_MARGIN_PX,
      );
      if (!collision) continue;
      const floorY = this.#enemy.data.arenaGroundY ?? this.#enemy.data.court?.groundY;
      if (target === this.#playerCombatant && projectile.category === "lowProjectile"
        && floorY !== undefined && playerClearsGroundHazard(this.player, floorY)) {
        this.#emit("projectileContact", { projectileId: projectile.id, owner: projectile.owner, targetId: target.id, avoided: true });
        continue;
      }
      const guarded = target === this.#playerCombatant && actions.guard.held && this.player.grounded;
      const reductionFactor = target === this.#playerCombatant && this.#specialDamageFactor < 1
        ? this.#specialDamageFactor
        : guarded ? GUARD_DAMAGE_FACTOR : 1;
      this.#applyDamage(target, projectile.damage, projectile.owner === "enemy" ? this.#enemy.id : this.player.fighterId, projectile.attackInstanceId, reductionFactor);
      this.#emit("projectileContact", { projectileId: projectile.id, owner: projectile.owner, targetId: target.id });
    }
    this.#projectiles = this.#projectiles.filter((projectile) => projectile.active);
  }

  #fireEnemyProjectile(attack) {
    const customSpecification = this.#enemy.createProjectileSpecification(attack);
    if (customSpecification) {
      const spawned = this.spawnProjectile(customSpecification);
      if (spawned) this.#emit("projectileLaunched", { projectileId: customSpecification.id, owner: "enemy", attackInstanceId: attack.id, patternId: attack.data.patternId });
      return;
    }
    const config = this.#enemy.data.projectile;
    const originX = this.#enemy.position.x + this.#enemy.facing * (this.#enemy.bodySize.width / 2 + config.width / 2);
    const originY = this.#enemy.position.y - this.#enemy.bodySize.height / 2;
    const dx = attack.targetPosition.x - originX;
    const dy = attack.targetPosition.y - originY;
    const length = Math.hypot(dx, dy) || 1;
    const projectileId = `${attack.id}-projectile`;
    const spawned = this.spawnProjectile({
      id: projectileId,
      patternId: attack.data.patternId,
      attackInstanceId: projectileId,
      owner: "enemy",
      x: originX,
      y: originY,
      velocityX: (dx / length) * config.speedPxPerSec,
      velocityY: (dy / length) * config.speedPxPerSec,
      width: config.width,
      height: config.height,
      damage: attack.data.damage,
      lifetimeSec: config.lifetimeSec,
      category: attack.data.category,
    });
    if (spawned) this.#emit("projectileLaunched", { projectileId, owner: "enemy", attackInstanceId: attack.id, patternId: attack.data.patternId });
  }

  #applyDamage(target, baseDamage, sourceId, attackInstanceId, reductionFactor = 1) {
    target.applyDamage(baseDamage, {
      sourceId,
      attackInstanceId,
      step: this.#step,
      reductionFactor,
    });
  }

  #collectCombatantEvents() {
    for (const event of [...this.#playerCombatant.drainEvents(), ...this.#enemy.drainEvents()]) {
      this.#emit(event.kind, event);
    }
  }

  #emit(kind, payload) {
    const event = Object.freeze({ eventId: this.#eventSerial++, step: this.#step, kind, ...payload });
    this.#events.push(event);
    return event;
  }

  #drawHealthBar(ctx, x, label, hp, maxHp, fillColor, align) {
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = "bottom";
    ctx.font = HUD_FONT;
    ctx.fillStyle = "#ffffff";
    const textX = align === "left" ? x : x + BAR_WIDTH;
    ctx.fillText(`${label}  ${hp} / ${maxHp}`, textX, BAR_Y - 3);
    ctx.fillStyle = HEALTH_BACKGROUND_COLOR;
    ctx.fillRect(x, BAR_Y, BAR_WIDTH, BAR_HEIGHT);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, BAR_Y, BAR_WIDTH * (hp / maxHp), BAR_HEIGHT);
    ctx.strokeStyle = HEALTH_BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, BAR_Y + 0.5, BAR_WIDTH - 1, BAR_HEIGHT - 1);
    ctx.restore();
  }
}
