import { createRoot } from 'react-dom/client';
import SelectionWidget from './SelectionWidget';
import * as storage from '../services/storage';
import { THEME_KEY, themeIsDark } from '../hooks/useTheme';
// ?inline gives us the compiled CSS as a string instead of injecting it into <head>, which a shadow root can't see anyway
import contentStyles from '../style.css?inline';

// mirrors the stored theme onto the shadow container, since its CSS can't reach the page's <html>.dark class; stays live via storage + media-query listeners
function syncTheme(container) {
  let currentTheme = 'system';

  const apply = () =>
    container.classList.toggle('dark', themeIsDark(currentTheme));

  storage.getItem(THEME_KEY).then((stored) => {
    currentTheme = stored || 'system';
    apply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[THEME_KEY]) {
      currentTheme = changes[THEME_KEY].newValue || 'system';
      apply();
    }
  });

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', apply);
}

function init() {
  const host = document.createElement('div');
  host.style.all = 'initial'; // stop the host page's CSS inheriting into us
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.zIndex = '2147483647'; // max z-index, sit above the page's own UI

  // attached to <html> not <body> — a transformed <body> would break position:fixed descendants, <html> rarely is
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = contentStyles;
  shadowRoot.appendChild(styleEl);

  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  syncTheme(container);

  createRoot(container).render(<SelectionWidget hostElement={host} />);
}

init();
