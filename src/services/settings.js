import * as storage from './storage';

// Extension-only: whether the in-page selection pill shows up when text is
// selected on a webpage. Off by user choice still leaves the right-click
// "Search in Lexicon" menu item available — that one's independent of this.
const PILL_ENABLED_KEY = 'selection_pill_enabled';

export async function isPillEnabled() {
  const value = await storage.getItem(PILL_ENABLED_KEY);
  return value !== 'false'; // default on unless explicitly turned off
}

export async function setPillEnabled(enabled) {
  await storage.setItem(PILL_ENABLED_KEY, String(enabled));
}
