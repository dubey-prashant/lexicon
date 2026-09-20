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

// Extension-only: any selection on a page (drag, double-click, triple-click,
// keyboard) looks it up immediately, skipping the pill. Off by default —
// selecting text is used constantly for unrelated reasons (copying, editing
// form fields), so this should only fire for someone who's deliberately
// opted in.
const INSTANT_LOOKUP_ENABLED_KEY = 'instant_lookup_enabled';

export async function isInstantLookupEnabled() {
  const value = await storage.getItem(INSTANT_LOOKUP_ENABLED_KEY);
  return value === 'true'; // default off unless explicitly turned on
}

export async function setInstantLookupEnabled(enabled) {
  await storage.setItem(INSTANT_LOOKUP_ENABLED_KEY, String(enabled));
}
