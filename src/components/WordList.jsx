import React, { useState } from 'react';

// Shared list UI for History and Favorites: search filter, loading indicator,
// empty states, and the clickable word list itself.
const WordList = ({
  items,
  isLoading,
  onItemClick,
  searchPlaceholder,
  emptyIconPath,
  emptyTitle,
  emptySubtitle,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredItems = items.filter((item) =>
    item.displayWord.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      {items.length > 0 && (
        <div className='mb-3'>
          <input
            type='text'
            placeholder={searchPlaceholder}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className='w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 text-sm'
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className='text-center py-4'>
          <div className='relative'>
            <div className='w-6 h-6 border-2 border-gray-200 dark:border-gray-600 rounded-full animate-spin mx-auto'>
              <div className='absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin'></div>
            </div>
          </div>
          <p className='text-gray-600 dark:text-gray-300 text-sm mt-2'>Loading...</p>
        </div>
      )}

      <div className='space-y-2 max-h-[350px] overflow-y-auto'>
        {items.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-6 h-6 text-gray-400 dark:text-gray-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d={emptyIconPath}
                />
              </svg>
            </div>
            <p className='text-gray-600 dark:text-gray-300 text-sm font-medium mb-1'>
              {emptyTitle}
            </p>
            <p className='text-gray-500 dark:text-gray-400 text-sm'>
              {emptySubtitle}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-6 h-6 text-gray-400 dark:text-gray-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <p className='text-gray-600 dark:text-gray-300 text-sm font-medium mb-1'>
              No matches found
            </p>
            <p className='text-gray-500 dark:text-gray-400 text-sm'>Try a different search term</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={index}
              className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200 cursor-pointer group'
              onClick={() => onItemClick(item)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <span className='text-gray-900 dark:text-gray-100 font-medium text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'>
                      {item.displayWord}
                    </span>
                    {!item.found && (
                      <span className='text-gray-500 dark:text-gray-400 text-xs'>Not found</span>
                    )}
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <svg
                  className='w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default WordList;
