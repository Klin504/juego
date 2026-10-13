/** Lee y guarda récord y desbloqueos persistentes en localStorage. */

export const CAMPAIGN_RECORD_STORAGE_KEY = "chilos-fighters:campaign-record:v1";
export const VISOR_STORAGE_KEY = "chilos-fighters:visor-unlocked:v1";

/** Devuelve el récord guardado o null si el almacenamiento no está disponible. */
export function readCampaignRecord(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const value = Number(target?.getItem(CAMPAIGN_RECORD_STORAGE_KEY) ?? 0);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

/** Guarda únicamente puntuaciones superiores al récord existente. */
export function saveCampaignRecord(score, storage) {
  const current = readCampaignRecord(storage);
  if (current === null || !Number.isFinite(score) || score < 0) return null;
  if (score <= current) return current;
  try {
    const target = storage ?? globalThis.localStorage;
    target.setItem(CAMPAIGN_RECORD_STORAGE_KEY, String(score));
    return score;
  } catch {
    return null;
  }
}

/** Consulta si el secreto del Visor ya fue descubierto. */
export function readVisorUnlocked(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    return target?.getItem(VISOR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Conserva el desbloqueo entre sesiones del navegador. */
export function saveVisorUnlocked(unlocked = true, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target?.setItem(VISOR_STORAGE_KEY, unlocked ? "true" : "false");
    return true;
  } catch {
    return null;
  }
}
