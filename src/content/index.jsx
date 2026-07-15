import { createRoot } from 'react-dom/client';
import SelectionWidget from './SelectionWidget';
// The `?inline` suffix tells Vite not to inject this stylesheet into the
// page's own <head> (which is what happens by default) — instead it hands
// back the compiled CSS as a plain string, which we inject into the shadow
// root ourselves below. A shadow root can't see <head> stylesheets anyway.
import contentStyles from '../style.css?inline';

function init() {
  const host = document.createElement('div');
  host.style.all = 'initial'; // stop the host page's CSS inheriting into us
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.zIndex = '2147483647'; // max z-index, sit above the page's own UI

  // Attached to <html>, not <body>: some pages set a `transform` (or
  // `filter`/`perspective`) on <body> or a high-level wrapper for effects
  // like parallax, which quietly changes what `position: fixed` descendants
  // are positioned relative to (the transformed ancestor instead of the
  // viewport). <html> having one of those is far rarer, so this is safer,
  // if not airtight — a page transforming <html> itself would still break it.
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = contentStyles;
  shadowRoot.appendChild(styleEl);

  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  createRoot(container).render(<SelectionWidget hostElement={host} />);
}

init();
