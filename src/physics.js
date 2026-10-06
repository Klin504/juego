import {
  AIR_CONTROL_FACTOR,
  COLLISION_EPSILON_PX,
  GRAVITY_PX_PER_SEC_SQUARED,
  GROUND_FRICTION_PX_PER_SEC_SQUARED,
  HORIZONTAL_ACCELERATION_PX_PER_SEC_SQUARED,
  JUMP_INITIAL_VELOCITY_PX_PER_SEC,
  JUMP_RELEASE_VELOCITY_FACTOR,
  MAX_FALL_SPEED_PX_PER_SEC,
  PLAYER_BODY_HEIGHT_PX,
  PLAYER_BODY_WIDTH_PX,
} from "./physics-config.js";

function overlapsHorizontally(body, solid) {
  return body.x < solid.x + solid.width && body.x + body.width > solid.x;
}

function overlapsVertically(body, solid) {
  return body.y < solid.y + solid.height && body.y + body.height > solid.y;
}

function moveTowardZero(value, amount) {
  if (value > 0) return Math.max(0, value - amount);
  if (value < 0) return Math.min(0, value + amount);
  return 0;
}

export class PhysicsWorld {
  update(entity, actions, dt, solids) {
    this.#updateHorizontalVelocity(entity, actions, dt);
    this.#updateJumpBuffer(entity, actions, dt);

    let jumpedThisStep = this.#tryJump(
      entity,
      actions.jump.held,
      actions.guard.held,
    );
    this.#moveOnX(entity, entity.velocity.x * dt, solids);

    if (!jumpedThisStep && actions.jump.released && entity.velocity.y < 0) {
      entity.velocity.y *= JUMP_RELEASE_VELOCITY_FACTOR;
    }

    entity.velocity.y = Math.min(
      entity.velocity.y + GRAVITY_PX_PER_SEC_SQUARED * dt,
      MAX_FALL_SPEED_PX_PER_SEC,
    );
    const landed = this.#moveOnY(entity, entity.velocity.y * dt, solids);
    if (!jumpedThisStep && landed) {
      jumpedThisStep = this.#tryJump(
        entity,
        actions.jump.held,
        actions.guard.held,
      );
    }
  }

  #updateHorizontalVelocity(entity, actions, dt) {
    const moveX = actions.moveX;
    if (actions.guard.held && entity.grounded) {
      entity.velocity.x = 0;
      return;
    }

    if (moveX === 0) {
      if (entity.grounded) {
        entity.velocity.x = moveTowardZero(
          entity.velocity.x,
          GROUND_FRICTION_PX_PER_SEC_SQUARED * dt,
        );
      }
      return;
    }

    const airControl = entity.grounded ? 1 : AIR_CONTROL_FACTOR;
    const nextVelocity =
      entity.velocity.x +
      moveX * HORIZONTAL_ACCELERATION_PX_PER_SEC_SQUARED * airControl * dt;
    entity.velocity.x = Math.max(
      -entity.maxSpeedPxPerSec,
      Math.min(entity.maxSpeedPxPerSec, nextVelocity),
    );
    entity.facing = moveX;
  }

  #updateJumpBuffer(entity, actions, dt) {
    if (actions.jump.pressed) {
      entity.jumpBufferRemainingSeconds = actions.jump.bufferRemainingSeconds;
      return;
    }
    entity.jumpBufferRemainingSeconds = Math.max(
      0,
      entity.jumpBufferRemainingSeconds - dt,
    );
  }

  #tryJump(entity, jumpHeld, guardHeld) {
    if (
      !entity.grounded ||
      guardHeld ||
      entity.jumpBufferRemainingSeconds <= 0
    ) {
      return false;
    }
    entity.velocity.y = JUMP_INITIAL_VELOCITY_PX_PER_SEC;
    if (!jumpHeld) entity.velocity.y *= JUMP_RELEASE_VELOCITY_FACTOR;
    entity.grounded = false;
    entity.jumpBufferRemainingSeconds = 0;
    return true;
  }

  #moveOnX(entity, deltaX, solids) {
    if (deltaX === 0) return;

    const startingBody = entity.bodyBox;
    let nextX = entity.position.x + deltaX;
    if (deltaX > 0) {
      for (const solid of solids) {
        if (!overlapsVertically(startingBody, solid)) continue;
        const bodyRight = startingBody.x + startingBody.width;
        const nextRight = nextX + PLAYER_BODY_WIDTH_PX / 2;
        if (
          bodyRight <= solid.x + COLLISION_EPSILON_PX &&
          nextRight > solid.x
        ) {
          nextX = Math.min(nextX, solid.x - PLAYER_BODY_WIDTH_PX / 2);
        }
      }
    } else {
      for (const solid of solids) {
        if (!overlapsVertically(startingBody, solid)) continue;
        const solidRight = solid.x + solid.width;
        if (
          startingBody.x >= solidRight - COLLISION_EPSILON_PX &&
          nextX - PLAYER_BODY_WIDTH_PX / 2 < solidRight
        ) {
          nextX = Math.max(nextX, solidRight + PLAYER_BODY_WIDTH_PX / 2);
        }
      }
    }

    const collided = nextX !== entity.position.x + deltaX;
    entity.position.x = nextX;
    if (collided) entity.velocity.x = 0;
  }

  #moveOnY(entity, deltaY, solids) {
    const startingFeetY = entity.position.y;
    const targetFeetY = startingFeetY + deltaY;
    const bodyAtTargetX = entity.bodyBox;
    let resolvedFeetY = targetFeetY;
    let landed = false;

    if (deltaY > 0) {
      for (const solid of solids) {
        if (!overlapsHorizontally(bodyAtTargetX, solid)) continue;
        if (
          startingFeetY <= solid.y + COLLISION_EPSILON_PX &&
          targetFeetY >= solid.y - COLLISION_EPSILON_PX &&
          solid.y < resolvedFeetY
        ) {
          resolvedFeetY = solid.y;
          landed = true;
        }
      }
    } else if (deltaY < 0) {
      const startingTopY = startingFeetY - PLAYER_BODY_HEIGHT_PX;
      const targetTopY = targetFeetY - PLAYER_BODY_HEIGHT_PX;
      for (const solid of solids) {
        if (!overlapsHorizontally(bodyAtTargetX, solid)) continue;
        const solidBottom = solid.y + solid.height;
        if (
          startingTopY >= solidBottom - COLLISION_EPSILON_PX &&
          targetTopY <= solidBottom + COLLISION_EPSILON_PX &&
          solidBottom + PLAYER_BODY_HEIGHT_PX > resolvedFeetY
        ) {
          resolvedFeetY = solidBottom + PLAYER_BODY_HEIGHT_PX;
        }
      }
    }

    entity.position.y = resolvedFeetY;
    entity.grounded = landed;
    if (landed || resolvedFeetY !== targetFeetY) entity.velocity.y = 0;
    return landed;
  }
}
