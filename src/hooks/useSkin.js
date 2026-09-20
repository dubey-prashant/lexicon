import { useState, useEffect, useCallback } from 'react';
import * as storage from '../services/storage';

export const SKIN_KEY = 'skin_preference';
const SKINS = ['modern', 'classic'];

function applySkin(skin) {
  document.documentElement.classList.toggle('classic', skin === 'classic');
}

// Independent of useTheme's light/dark — a skin (visual style) and a
// brightness preference are different axes, so classic + dark can combine.
export function useSkin() {
  const [skin, setSkinState] = useState('classic');

  useEffect(() => {
    let cancelled = false;
    storage.getItem(SKIN_KEY).then((stored) => {
      const initial = SKINS.includes(stored) ? stored : 'classic';
      if (!cancelled) {
        setSkinState(initial);
        applySkin(initial);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSkin = useCallback((next) => {
    setSkinState(next);
    applySkin(next);
    storage.setItem(SKIN_KEY, next);
  }, []);

  const toggleSkin = useCallback(() => {
    setSkin(skin === 'modern' ? 'classic' : 'modern');
  }, [skin, setSkin]);

  return { skin, setSkin, toggleSkin };
}
