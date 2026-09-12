import * as storage from './storage';

// One-time migration from v2.0.1's localStorage to chrome.storage.local; must run in the popup (the only context that can see the extension origin's localStorage), and is self-terminating since each key is removed from localStorage after copying
const LEGACY_KEYS = ['dictionary_cache', 'search_history', 'wotd_cache'];

export async function migrateLegacyLocalStorage() {
  try {
    for (const key of LEGACY_KEYS) {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue === null) continue;

      // Don't clobber chrome.storage data that already exists (e.g. written
      // by the selection card before the popup was first opened post-update).
      const current = await storage.getItem(key);
      if (current === null) {
        await storage.setItem(key, migrateValue(key, legacyValue));
      }

      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error migrating legacy localStorage data:', error);
  }
}

// strips v2.0.1's embedded `dictionaryResult` blobs — the current format stores word + metadata only
function migrateValue(key, value) {
  if (key !== 'search_history') return value;
  try {
    const history = JSON.parse(value);
    if (!Array.isArray(history)) return value;
    return JSON.stringify(
      history.map((entry) => {
        const slim = { ...entry };
        delete slim.dictionaryResult;
        return slim;
      })
    );
  } catch {
    return value;
  }
}
