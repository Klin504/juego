/**
 * visor-system.js
 * Sistema del Visor GUÍA: estados efímeros por encuentro, predicción de la cola,
 * extensión de 0,8 s de aviso y respuestas documentadas.
 * Fase 3.2 según contratos 1.5 y EASTER_EGG.md.
 */

export const VISOR_STATE = Object.freeze({
  LOCKED: "bloqueado",
  READY: "listo",
  PENDING: "pendiente",
  REVEALING: "revelando",
  USED: "usado",
});

export const VISOR_EXTRA_WARNING_SEC = 0.8;

export const VISOR_RESPONSES = Object.freeze({
  // Chilo (Nivel 1)
  CHILO_WING: "Aletazo frontal · retrocede o cúbrete con S",
  CHILO_JUMP: "Salto con picada · sal del círculo de impacto marcado",
  // Vera (Nivel 2)
  VERA_BALL: "Balón en rebote · cúbrete con S o salta",
  VERA_RUN: "Carrera de línea · salta al menos 30 px para esquivar",
  // CÁTODO-3 (Nivel 3)
  CATODO_PULSE: "Pulso rasante · salta o cúbrete con S",
  CATODO_SENSOR_LEFT: "Sensor de suelo · manténte en el corredor central o salta",
  CATODO_SENSOR_RIGHT: "Sensor de suelo · manténte en el corredor central o salta",
  // NULL (Nivel 4)
  NULL_ECHO_LOW: "Eco bajo · salta para no tocar el suelo",
  NULL_ECHO_HIGH: "Eco alto · permanece agachado o en el suelo",
  NULL_ECHO_CROSS: "Eco cruzado · retrocede al extremo opuesto",
  NULL_ECHO_VERA: "Eco de carrera · salta para elevar los pies de la banda",
  NULL_ECHO_CATODO: "Eco de sensor · manténte en el corredor central o salta",
  NULL_FINAL_SWEEP: "Barrido final · ve a la franja marcada SEGURA cuando aparezca",
  NULL_FINAL_SWEEP_REVEALED: "Barrido final · entra en la franja marcada como SEGURA",
});

export class VisorSystem {
  #state;
  #patternId = null;
  #attackInstanceId = null;
  #predictionKind = null; // "current" | "next" | null
  #responseText = null;
  #safeGeometry = null;
  #warningExtraSecApplied = false;

  constructor({ unlocked = false } = {}) {
    this.#state = unlocked ? VISOR_STATE.READY : VISOR_STATE.LOCKED;
  }

  get state() {
    return this.#state;
  }

  get patternId() {
    return this.#patternId;
  }

  get attackInstanceId() {
    return this.#attackInstanceId;
  }

  get predictionKind() {
    return this.#predictionKind;
  }

  get responseText() {
    return this.#responseText;
  }

  get safeGeometry() {
    return this.#safeGeometry;
  }

  get warningExtraSecApplied() {
    return this.#warningExtraSecApplied;
  }

  get snapshot() {
    return Object.freeze({
      visorState: this.#state,
      patternId: this.#patternId,
      attackInstanceId: this.#attackInstanceId,
      predictionKind: this.#predictionKind,
      responseText: this.#responseText,
      safeGeometry: this.#safeGeometry,
      warningExtraSecApplied: this.#warningExtraSecApplied,
    });
  }

  requestActivation(enemy) {
    if (this.#state !== VISOR_STATE.READY || !enemy) return false;

    // Caso 1: Enemigo ya está en fase de aviso ("warning")
    if (enemy.attack && enemy.attack.phase === "warning") {
      this.#state = VISOR_STATE.REVEALING;
      this.#predictionKind = "current";
      this.#patternId = enemy.attack.data.patternId;
      this.#attackInstanceId = enemy.attack.id;
      this.#warningExtraSecApplied = true;
      enemy.extendCurrentWarning(VISOR_EXTRA_WARNING_SEC);
      this.#resolveGeometryAndText(enemy.attack);
      return true;
    }

    // Caso 2: Fuera de aviso (idle, inter-attack, active, recovery) -> consulta cola sin consumirla
    const nextAttack = enemy.peekNextAttack();
    if (nextAttack) {
      this.#state = VISOR_STATE.PENDING;
      this.#predictionKind = "next";
      this.#patternId = nextAttack.patternId;
      this.#attackInstanceId = null;
      this.#safeGeometry = null;
      this.#warningExtraSecApplied = false;
      this.#responseText = VISOR_RESPONSES[nextAttack.patternId] ?? nextAttack.name;
      return true;
    }

    return false;
  }

  update(dt, enemy) {
    if (!enemy) return;

    // Si está pendiente, sincroniza cambio de fase de NULL si la cola cambió antes del ataque
    if (this.#state === VISOR_STATE.PENDING) {
      const nextAttack = enemy.peekNextAttack();
      if (nextAttack && nextAttack.patternId !== this.#patternId && !enemy.attack) {
        this.#patternId = nextAttack.patternId;
        this.#responseText = VISOR_RESPONSES[nextAttack.patternId] ?? nextAttack.name;
      }

      // Al comenzar el aviso de la instancia programada
      if (enemy.attack && enemy.attack.phase === "warning") {
        this.#state = VISOR_STATE.REVEALING;
        this.#predictionKind = "current";
        this.#patternId = enemy.attack.data.patternId;
        this.#attackInstanceId = enemy.attack.id;
        this.#warningExtraSecApplied = true;
        enemy.extendCurrentWarning(VISOR_EXTRA_WARNING_SEC);
        this.#resolveGeometryAndText(enemy.attack);
      }
    } else if (this.#state === VISOR_STATE.REVEALING) {
      // Si la geometría segura se fija dinámicamente durante el aviso
      if (enemy.attack && enemy.attack.phase === "warning") {
        this.#resolveGeometryAndText(enemy.attack);
      } else {
        // Al terminar el aviso revelado o si el ataque se cancela/termina
        this.#state = VISOR_STATE.USED;
        this.#predictionKind = null;
      }
    }
  }

  onFightFinished() {
    if (this.#state === VISOR_STATE.PENDING || this.#state === VISOR_STATE.REVEALING) {
      this.#state = VISOR_STATE.USED;
      this.#predictionKind = null;
    }
  }

  #resolveGeometryAndText(attack) {
    const patternId = attack.data.patternId;

    if (patternId === "NULL_FINAL_SWEEP") {
      if (attack.safeZone) {
        this.#safeGeometry = Object.freeze({
          type: "safeZone",
          ...attack.safeZone,
        });
        this.#responseText = VISOR_RESPONSES.NULL_FINAL_SWEEP_REVEALED;
      } else {
        this.#safeGeometry = null;
        this.#responseText = VISOR_RESPONSES.NULL_FINAL_SWEEP;
      }
    } else if (patternId === "CATODO_SENSOR_LEFT" || patternId === "CATODO_SENSOR_RIGHT" || patternId === "NULL_ECHO_CATODO") {
      this.#safeGeometry = Object.freeze({
        type: "safeCorridor",
        left: 396,
        right: 564,
        label: "CORREDOR SEGURO",
      });
      this.#responseText = VISOR_RESPONSES[patternId] ?? attack.data.name;
    } else {
      this.#safeGeometry = null;
      this.#responseText = VISOR_RESPONSES[patternId] ?? attack.data.name;
    }
  }
}
