import {
  FIGHTER_MAX_SPEED_PX_PER_SEC,
  PLAYER_BODY_HEIGHT_PX,
  PLAYER_BODY_WIDTH_PX,
} from "./physics-config.js";
import { INVULNERABILITY_BLINK_INTERVAL_SEC, PLAYER_HURTBOX, PLAYER_INVULNERABLE_ALPHA } from "./combat-config.js";

const PLAYER_FILL = "#83c9ff";
const PLAYER_EDGE = "#e9f6ff";
const PLAYER_MARK = "#173b5c";
const DEBUG_EDGE = "#ff70d0";
const DEBUG_TEXT = "#ffffff";
const DEBUG_FONT = "14px 'Courier New', monospace";
const DEBUG_LABEL_OFFSET_PX = 8;

export class FighterEntity {
  constructor({ fighterId, x, y }) {
    const maxSpeed = FIGHTER_MAX_SPEED_PX_PER_SEC[fighterId];
    if (maxSpeed === undefined) {
      throw new Error(`No hay velocidad configurada para ${fighterId}.`);
    }

    this.fighterId = fighterId;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.maxSpeedPxPerSec = maxSpeed;
    this.facing = 1;
    this.grounded = false;
    this.jumpBufferRemainingSeconds = 0;
  }

  get bodyBox() {
    return {
      x: this.position.x - PLAYER_BODY_WIDTH_PX / 2,
      y: this.position.y - PLAYER_BODY_HEIGHT_PX,
      width: PLAYER_BODY_WIDTH_PX,
      height: PLAYER_BODY_HEIGHT_PX,
    };
  }

  get hurtBox() {
    return {
      x: this.position.x - PLAYER_HURTBOX.width / 2,
      y: this.position.y - PLAYER_HURTBOX.height,
      width: PLAYER_HURTBOX.width,
      height: PLAYER_HURTBOX.height,
    };
  }

  render(ctx, debugEnabled, combatant = null) {
    const body = this.bodyBox;
    const blink = combatant?.invulnerable &&
      Math.floor(combatant.invulnerabilityRemainingSec / INVULNERABILITY_BLINK_INTERVAL_SEC) % 2 === 0;
    ctx.globalAlpha = blink ? PLAYER_INVULNERABLE_ALPHA : 1;
    ctx.fillStyle = PLAYER_FILL;
    ctx.fillRect(body.x, body.y, body.width, body.height);
    ctx.strokeStyle = PLAYER_EDGE;
    ctx.lineWidth = 2;
    ctx.strokeRect(body.x + 1, body.y + 1, body.width - 2, body.height - 2);
    ctx.globalAlpha = 1;

    const markX = this.facing > 0 ? body.x + body.width - 9 : body.x + 5;
    ctx.fillStyle = PLAYER_MARK;
    ctx.fillRect(markX, body.y + 16, 4, 4);

    if (!debugEnabled) return;

    ctx.strokeStyle = DEBUG_EDGE;
    ctx.lineWidth = 2;
    ctx.strokeRect(body.x, body.y, body.width, body.height);
    ctx.fillStyle = DEBUG_TEXT;
    ctx.font = DEBUG_FONT;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `vx ${this.velocity.x.toFixed(1)}  vy ${this.velocity.y.toFixed(1)} px/s`,
      body.x,
      body.y - DEBUG_LABEL_OFFSET_PX,
    );
    ctx.textBaseline = "top";
    ctx.fillText(
      `Suelo: ${this.grounded ? "sí" : "no"}`,
      body.x,
      body.y + body.height + DEBUG_LABEL_OFFSET_PX,
    );
  }
}
