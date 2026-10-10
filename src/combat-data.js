import { CHILO_WING_ATTACK, PLAYER_NORMAL_ATTACK, TRAINING_DUMMY, TRAINING_ORB_ATTACK } from "./combat-config.js";

export const PLAYER_ATTACKS = Object.freeze({ normal: PLAYER_NORMAL_ATTACK });

export const TRAINING_DUMMY_DATA = Object.freeze({
  ...TRAINING_DUMMY,
  attacks: Object.freeze([
    Object.freeze({
      ...TRAINING_ORB_ATTACK,
    }),
    CHILO_WING_ATTACK,
  ]),
});
