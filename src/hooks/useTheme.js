import { useState, useEffect, useCallback } from 'react';
import * as storage from '../services/storage';

// Exported for the content script (src/content/index.jsx): the selection
// card lives in a shadow root where the <html> .dark class can't reach
// (CSS selectors don't cross shadow boundaries), so it re-applies the same
// stored theme to its own shadow container using these.
export const THEME_KEY = 'theme_preference';

const THEMES = ['system', 'light', 'dark'];

export function themeIsDark(theme) {
  return (
    theme === 'dark' ||
    (theme !== 'light' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', themeIsDark(theme));
}

// Theme preference: 'system' (default, follows OS) | 'light' | 'dark' (manual override).
// Persisted via storage.js so it works in both the web app and the extension.
export function useTheme() {
  const [theme, setThemeState] = useState('system');

  useEffect(() => {
    let cancelled = false;
    storage.getItem(THEME_KEY).then((stored) => {
      const initial = THEMES.includes(stored) ? stored : 'system';
      if (!cancelled) {
        setThemeState(initial);
        applyTheme(initial);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    applyTheme(next);
    storage.setItem(THEME_KEY, next);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
  }, [theme, setTheme]);

  return { theme, setTheme, cycleTheme };
}
