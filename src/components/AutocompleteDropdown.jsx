import React from 'react';
import AutocompleteShimmer from './AutocompleteShimmer';

const AutocompleteDropdown = ({
  suggestions,
  isVisible,
  selectedIndex,
  isLoading,
  onSelect,
}) => {
  if (!isVisible) return null;

  return (
    <div className='absolute z-50 w-full top-full left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-elevated animate-fade-in mt-1'>
      {/* Show shimmer when loading and no suggestions yet */}
      {isLoading && suggestions.length === 0 && <AutocompleteShimmer />}

      {/* No suggestions found (when not loading) */}
      {!isLoading && suggestions.length === 0 && (
        <div className='px-3 py-2 text-center text-gray-500 dark:text-gray-400 text-xs'>
          No suggestions found
        </div>
      )}

      {/* Show suggestions */}
      {suggestions.length > 0 && (
        <div className='py-1'>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              className={`w-full px-3 py-2 text-left text-sm transition-all duration-200 flex items-center justify-between ${
                index === selectedIndex
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              onClick={() => onSelect(suggestion)}
            >
              <span className='font-medium'>{suggestion}</span>
              {index === selectedIndex && (
                <svg
                  className='w-3 h-3 text-indigo-500 dark:text-indigo-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 5l7 7-7 7'
                  ></path>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Show minimal shimmer when API is enhancing existing suggestions */}
      {isLoading && suggestions.length > 0 && (
        <AutocompleteShimmer minimal={true} />
      )}

      {/* Controls help */}
      {suggestions.length > 0 && (
        <div className='px-3 py-1.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'>
          <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteDropdown;
