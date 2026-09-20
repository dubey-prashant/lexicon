import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useSkin } from '../hooks/useSkin';
import { isExtensionContext } from '../services/storage';
import {
  isPillEnabled,
  setPillEnabled,
  isInstantLookupEnabled,
  setInstantLookupEnabled,
} from '../services/settings';
import { LOGO_ICON_PATH } from './icons';

const COFFEE_URL = 'https://buymeacoffee.com/dubey_prashant';

const THEME_ICON = {
  system: (
    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      />
    </svg>
  ),
  light: (
    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
      />
    </svg>
  ),
  dark: (
    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
      />
    </svg>
  ),
};

const THEME_LABEL = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const THEMES = ['system', 'light', 'dark'];

// One row: label/description on the left, a control on the right. Shared
// layout so every setting (theme, pill toggle, favorites link) lines up
// consistently without repeating the same wrapper markup three times.
const SettingRow = ({ title, description, children }) => (
  <div className='classic-panel flex items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3'>
    <div className='min-w-0 flex-1'>
      <p className='classic-heading text-sm font-medium text-gray-900 dark:text-gray-100'>{title}</p>
      {description && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{description}</p>
      )}
    </div>
    <div className='shrink-0'>{children}</div>
  </div>
);

// A compact on/off switch, restyled per skin (beveled/square in Classic).
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    role='switch'
    aria-checked={checked}
    className={`relative w-10 h-6 rounded-full classic:rounded-none transition-colors duration-200 focus-ring classic-box ${
      checked
        ? 'bg-indigo-600 classic:bg-[var(--classic-accent)]'
        : 'bg-gray-300 dark:bg-gray-600 classic:bg-[var(--classic-panel)]'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white classic:bg-[var(--classic-surface)] rounded-full classic:rounded-none shadow classic:shadow-[inset_1px_1px_0_var(--classic-edge-light),inset_-1px_-1px_0_var(--classic-edge-dark)] transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { skin, toggleSkin } = useSkin();
  const [pillEnabled, setPillEnabledState] = useState(true);
  const [instantLookupEnabled, setInstantLookupEnabledState] = useState(false);

  // The selection pill and instant lookup only exist in the extension
  // (content scripts don't run on the plain web app), so these rows only
  // render there.
  const showPillSetting = isExtensionContext();

  useEffect(() => {
    if (showPillSetting) {
      isPillEnabled().then(setPillEnabledState);
      isInstantLookupEnabled().then(setInstantLookupEnabledState);
    }
  }, [showPillSetting]);

  const togglePill = async () => {
    const next = !pillEnabled;
    await setPillEnabled(next);
    setPillEnabledState(next);
  };

  const toggleInstantLookup = async () => {
    const next = !instantLookupEnabled;
    await setInstantLookupEnabled(next);
    setInstantLookupEnabledState(next);
  };

  return (
    <div className=''>
      {/* Header with Back Button */}
      <div className='flex items-center space-x-2 mb-4'>
        <button
          onClick={() => navigate('/')}
          className='classic-button bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 p-2 rounded-lg transition-all duration-200 focus-ring group'
          title='Back to Search'
        >
          <svg
            className='w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 classic:text-[var(--classic-ink)] classic:group-hover:text-[var(--classic-accent)]'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
          </svg>
        </button>
        <h1 className='classic-heading text-lg font-semibold text-gray-900 dark:text-gray-100'>Settings</h1>
      </div>

      <div className='space-y-2'>
        <SettingRow title='Appearance'>
          <button
            onClick={toggleSkin}
            className='classic-button flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 focus-ring'
          >
            {skin === 'classic' ? 'Classic' : 'Modern'}
          </button>
        </SettingRow>

        <SettingRow title='Theme'>
          <div className='flex items-center gap-1'>
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                title={THEME_LABEL[t]}
                aria-label={THEME_LABEL[t]}
                className={`classic-box p-1.5 rounded-md border transition-colors duration-200 focus-ring ${
                  theme === t
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 classic:bg-[var(--classic-accent)] classic:text-[var(--classic-panel)]'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 classic:bg-[var(--classic-panel)] classic:text-[var(--classic-ink)]'
                }`}
              >
                {THEME_ICON[t]}
              </button>
            ))}
          </div>
        </SettingRow>

        {showPillSetting && (
          <SettingRow
            title='Selection Lookup'
            description='Show a lookup button when you select text on a page'
          >
            <ToggleSwitch checked={pillEnabled} onChange={togglePill} />
          </SettingRow>
        )}

        {showPillSetting && (
          <SettingRow
            title='Instant Lookup'
            description='Show the definition immediately when you select any text on a page'
          >
            <ToggleSwitch checked={instantLookupEnabled} onChange={toggleInstantLookup} />
          </SettingRow>
        )}

        <a
          href={COFFEE_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='classic-panel classic-heading flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 classic:hover:text-[var(--classic-accent)] transition-colors duration-200 focus-ring'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.5'
              d={LOGO_ICON_PATH}
            />
          </svg>
          Buy me a Book
        </a>
      </div>
    </div>
  );
};

export default Settings;
