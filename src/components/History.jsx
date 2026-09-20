import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/search';
import { useWordNavigation } from '../hooks/useWordNavigation';
import WordList from './WordList';

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const { isLoading, handleWordClick } = useWordNavigation();

  useEffect(() => {
    const loadHistory = async () => {
      const searchHistory = await searchService.getSearchHistory();
      setHistory(searchHistory);
    };
    loadHistory();
  }, []);

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your search history?')) {
      await searchService.clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className=''>
      {/* Header with Back Button */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
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
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <h1 className='classic-heading text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Search History
          </h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className='classic-button bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-ring'
          >
            Clear All
          </button>
        )}
      </div>

      <WordList
        items={history}
        isLoading={isLoading}
        onItemClick={handleWordClick}
        searchPlaceholder='Search history...'
        emptyIconPath='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        emptyTitle='No search history found'
        emptySubtitle='Start searching for words to see them here'
      />
    </div>
  );
};

export default History;
