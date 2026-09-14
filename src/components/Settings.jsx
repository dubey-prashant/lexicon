import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { isExtensionContext } from '../services/storage';
import { isPillEnabled, setPillEnabled } from '../services/settings';

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

// One row: label/description on the left, a control on the right. Shared
// layout so every setting (theme, pill toggle, favorites link) lines up
// consistently without repeating the same wrapper markup three times.
const SettingRow = ({ title, description, children }) => (
  <div className='flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3'>
    <div>
      <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>{title}</p>
      {description && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{description}</p>
      )}
    </div>
    {children}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { theme, cycleTheme } = useTheme();
  const [pillEnabled, setPillEnabledState] = useState(true);

  // The selection pill only exists in the extension (content scripts don't
  // run on the plain web app), so this row only renders there.
  const showPillSetting = isExtensionContext();

  useEffect(() => {
    if (showPillSetting) {
      isPillEnabled().then(setPillEnabledState);
    }
  }, [showPillSetting]);

  const togglePill = async () => {
    const next = !pillEnabled;
    await setPillEnabled(next);
    setPillEnabledState(next);
  };

  return (
    <div className=''>
      {/* Header with Back Button */}
      <div className='flex items-center space-x-2 mb-4'>
        <button
          onClick={() => navigate('/')}
          className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 p-2 rounded-lg transition-all duration-200 focus-ring group'
          title='Back to Search'
        >
          <svg
            className='w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
          </svg>
        </button>
        <h1 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Settings</h1>
      </div>

      <div className='space-y-2'>
        <SettingRow title='Theme' description='System, light, or dark'>
          <button
            onClick={cycleTheme}
            className='flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 focus-ring'
          >
            {THEME_ICON[theme]}
            {THEME_LABEL[theme]}
          </button>
        </SettingRow>

        {showPillSetting && (
          <SettingRow
            title='Selection Lookup'
            description='Show a lookup button when you select text on a page'
          >
            <button
              onClick={togglePill}
              role='switch'
              aria-checked={pillEnabled}
              className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus-ring ${
                pillEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  pillEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </SettingRow>
        )}
      </div>
    </div>
  );
};

export default Settings;
