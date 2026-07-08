import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { useWordNavigation } from '../hooks/useWordNavigation';
import WordList from './WordList';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { isLoading, handleWordClick } = useWordNavigation();

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteWords = await searchService.getFavorites();
      setFavorites(favoriteWords);
    };
    loadFavorites();
  }, []);

  const clearFavorites = async () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      await searchService.clearFavorites();
      setFavorites([]);
    }
  };

  return (
    <div className=''>
      {/* Header with Back Button */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
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
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <h1 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Favorites
          </h1>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-ring'
          >
            Clear All
          </button>
        )}
      </div>

      <WordList
        items={favorites}
        isLoading={isLoading}
        onItemClick={handleWordClick}
        searchPlaceholder='Search favorites...'
        emptyIconPath='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
        emptyTitle='No favorites yet'
        emptySubtitle='Star a word from its results to save it here'
      />
    </div>
  );
};

export default Favorites;
