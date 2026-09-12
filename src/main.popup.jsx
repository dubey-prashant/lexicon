import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { migrateLegacyLocalStorage } from './services/migrateLegacyStorage';

// Migration must finish BEFORE first render: components read history/WOTD
// cache on mount, and racing them against the copy would show a fresh-
// install state to an existing user on their first post-update open.
migrateLegacyLocalStorage().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App variant='popup' />
    </StrictMode>
  );
});
