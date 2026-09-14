import { useNavigate } from 'react-router-dom';
import { STAR_ICON_PATH } from './icons';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-between mb-4'>
      <h1 className='text-lg font-bold text-indigo-900 dark:text-indigo-300 tracking-tight'>
        LEXICON
      </h1>

      <div className='flex items-center space-x-1'>
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

        {/* Settings Button */}
        <button
          onClick={() => navigate('/settings')}
          className='bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 p-2 rounded-lg transition-all duration-200 group shadow-minimal hover:shadow-card focus-ring'
          title='Settings'
        >
          <svg
            className='w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <line x1='4' y1='6' x2='20' y2='6' strokeWidth='1.5' strokeLinecap='round' />
            <line x1='4' y1='12' x2='20' y2='12' strokeWidth='1.5' strokeLinecap='round' />
            <line x1='4' y1='18' x2='20' y2='18' strokeWidth='1.5' strokeLinecap='round' />
            <circle cx='8' cy='6' r='2' strokeWidth='1.5' />
            <circle cx='16' cy='12' r='2' strokeWidth='1.5' />
            <circle cx='8' cy='18' r='2' strokeWidth='1.5' />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
