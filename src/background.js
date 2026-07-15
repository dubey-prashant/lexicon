import { setPendingLookup } from './services/pendingLookup';

const MENU_ID = 'lexicon-search-selection';

// Registering the menu on install/update, not on every worker wake-up —
// chrome.contextMenus.create throws if an item with the same id already
// exists, and onInstalled only fires once per install/update.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Lookup "%s" in Lexicon',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;

  await setPendingLookup(info.selectionText);

  try {
    // Requires Chrome 99+. Only works in response to a user gesture, which
    // this context-menu click is — but it can still fail (e.g. no focused
    // window), so this is best-effort: the word stays queued in storage
    // either way, and the user can just open the popup manually instead.
    await chrome.action.openPopup();
  } catch (err) {
    console.error('Could not auto-open the popup:', err);
  }
});
