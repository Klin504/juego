export const CAMPAIGN_RECORD_STORAGE_KEY = "chilos-fighters:campaign-record:v1";

export function readCampaignRecord(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const value = Number(target?.getItem(CAMPAIGN_RECORD_STORAGE_KEY) ?? 0);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

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
