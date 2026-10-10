export const TEST_FIGHTER_ID = "alma";

// Velocidades iniciales documentadas en fase 1.2; quedan configurables por personaje.
export const FIGHTER_MAX_SPEED_PX_PER_SEC = Object.freeze({
  alma: 240,
  diego: 204,
  nadia: 288,
});

// PROVISIONALES: gravedad, salto y cuerpo propuestos en fase 1.3; validar en juego.
export const PLAYER_BODY_WIDTH_PX = 36;
export const PLAYER_BODY_HEIGHT_PX = 84;
export const GRAVITY_PX_PER_SEC_SQUARED = 1200;
export const JUMP_INITIAL_VELOCITY_PX_PER_SEC = -600;

// PROVISIONALES de 2.2: ajustar aquí tras validar el movimiento en la arena real.
export const HORIZONTAL_ACCELERATION_PX_PER_SEC_SQUARED = 2000;
export const GROUND_FRICTION_PX_PER_SEC_SQUARED = 2400;
export const AIR_CONTROL_FACTOR = 0.7;
export const MAX_FALL_SPEED_PX_PER_SEC = 900;
export const JUMP_RELEASE_VELOCITY_FACTOR = 0.5;
export const MAX_INPUT_BUFFER_MS = 100;
export const COLLISION_EPSILON_PX = 0.000001;
