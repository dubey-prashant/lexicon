import * as storage from './storage';

// Handoff mechanism: background.js stashes a word here when the user picks
// "Search in Lexicon" from the right-click menu, and the popup consumes it
// on mount. Centralized in one file so background.js and Main.jsx can't
// drift apart on the storage key string.
const PENDING_LOOKUP_KEY = 'pending_lookup_word';

export async function setPendingLookup(word) {
  await storage.setItem(PENDING_LOOKUP_KEY, word);
}

export async function consumePendingLookup() {
  const word = await storage.getItem(PENDING_LOOKUP_KEY);
  if (word) {
    await storage.removeItem(PENDING_LOOKUP_KEY);
  }
  return word;
}
