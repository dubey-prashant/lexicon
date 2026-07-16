import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { isExtensionContext } from '../services/storage';
import { isPillEnabled, setPillEnabled } from '../services/settings';
import { STAR_ICON_PATH, LOGO_ICON_PATH } from './icons';

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
  system: 'Theme: System',
  light: 'Theme: Light',
  dark: 'Theme: Dark',
};

const Header = () => {
  const navigate = useNavigate();
  const { theme, cycleTheme } = useTheme();
  const [pillEnabled, setPillEnabledState] = useState(true);

  // The selection pill only exists in the extension (content scripts don't
  // run on the plain web app), so this toggle only renders there.
  const showPillToggle = isExtensionContext();

  useEffect(() => {
    if (showPillToggle) {
      isPillEnabled().then(setPillEnabledState);
    }
  }, [showPillToggle]);

  const togglePill = async () => {
    const next = !pillEnabled;
    await setPillEnabled(next);
    setPillEnabledState(next);
  };

  return (
    <>
      {/* Minimalist Header */}
      <div className='flex items-center justify-between mb-4'>
        {/* Logo - Clean and Minimal */}
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-card'>
            <svg
              className='w-5 h-5 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d={LOGO_ICON_PATH}
              ></path>
            </svg>
          </div>
          <h1 className='text-lg font-bold text-indigo-900 dark:text-indigo-300 tracking-tight'>
            LEXICON
          </h1>
        </div>

        {/* Action Buttons - Clean Design */}
        <div className='flex items-center space-x-1'>
          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            className='bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 p-2 rounded-lg transition-all duration-200 group shadow-minimal hover:shadow-card focus-ring'
            title={THEME_LABEL[theme]}
          >
            <span className='text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 block'>
              {THEME_ICON[theme]}
            </span>
          </button>

          {/* Favorites Button */}
          <button
            onClick={() => navigate('/favorites')}
            className='bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 p-2 rounded-lg transition-all duration-200 group shadow-minimal hover:shadow-card focus-ring'
            title='Favorites'
          >
            <svg
              className='w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                d={STAR_ICON_PATH}
              ></path>
            </svg>
          </button>

          {/* History Button */}
          <button
            onClick={() => navigate('/history')}
            className='bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 p-2 rounded-lg transition-all duration-200 group shadow-minimal hover:shadow-card focus-ring'
            title='Search History'
          >
            <svg
              className='w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
          </button>

          {/* Selection Pill Toggle (extension only) */}
          {showPillToggle && (
            <button
              onClick={togglePill}
              className={`p-2 rounded-lg transition-all duration-200 group shadow-minimal hover:shadow-card focus-ring border ${
                pillEnabled
                  ? 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 opacity-50'
              }`}
              title={
                pillEnabled
                  ? 'Selection lookup: On (click to disable)'
                  : 'Selection lookup: Off (click to enable)'
              }
            >
              <svg
                className='w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <rect x='4' y='4' width='16' height='16' rx='2' strokeDasharray='4 3' strokeWidth='1.5' />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
