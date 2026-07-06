// Key/value storage adapter: uses chrome.storage.local when available (extension
// contexts share this across popup, background, and content scripts), otherwise
// falls back to localStorage (plain web build). Values are treated as opaque
// strings on both backends, matching localStorage semantics.

const hasChromeStorage = typeof chrome !== 'undefined' && !!chrome.storage?.local;

export async function getItem(key) {
  if (hasChromeStorage) {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  }
  return localStorage.getItem(key);
}

export async function setItem(key, value) {
  if (hasChromeStorage) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function removeItem(key) {
  if (hasChromeStorage) {
    await chrome.storage.local.remove(key);
    return;
  }
  localStorage.removeItem(key);
}
