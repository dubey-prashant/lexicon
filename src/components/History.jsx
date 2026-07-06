import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      const searchHistory = await searchService.getSearchHistory();
      setHistory(searchHistory);
    };
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.displayWord.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleWordClick = async (item) => {
    setIsLoading(true);

    try {
      let result;
      if (item.dictionaryResult) {
        // Use cached result
        result = item.dictionaryResult;
      } else {
        // Search for the word
        result = await searchService.searchDictionary(item.displayWord);
      }

      // Navigate back to main page with the result
      navigate('/', { state: { searchResult: result } });
    } catch (err) {
      // Navigate back even if there's an error
      const errorState =
        err.name === 'NotFoundError'
          ? {
              type: 'not_found',
              message: err.message,
              word: item.displayWord,
            }
          : {
              type: 'network',
              message: err.message,
            };

      navigate('/', { state: { error: errorState } });
    } finally {
      setIsLoading(false);
    }
  };

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
            className='bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-indigo-200 p-2 rounded-lg transition-all duration-200 focus-ring group'
            title='Back to Search'
          >
            <svg
              className='w-4 h-4 text-gray-600 group-hover:text-indigo-600'
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
          <h1 className='text-lg font-semibold text-gray-900'>
            Search History
          </h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className='bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-indigo-200 text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-ring'
          >
            Clear All
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className='mb-3'>
          <input
            type='text'
            placeholder='Search history...'
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className='w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-300 text-sm'
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className='text-center py-4'>
          <div className='relative'>
            <div className='w-6 h-6 border-2 border-gray-200 rounded-full animate-spin mx-auto'>
              <div className='absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-gray-600 rounded-full animate-spin'></div>
            </div>
          </div>
          <p className='text-gray-600 text-sm mt-2'>Loading...</p>
        </div>
      )}

      <div className='space-y-2 max-h-[350px] overflow-y-auto'>
        {history.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-6 h-6 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <p className='text-gray-600 text-sm font-medium mb-1'>
              No search history found
            </p>
            <p className='text-gray-500 text-sm'>
              Start searching for words to see them here
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-6 h-6 text-gray-400'
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
            <p className='text-gray-600 text-sm font-medium mb-1'>
              No matches found
            </p>
            <p className='text-gray-500 text-sm'>Try a different search term</p>
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <div
              key={index}
              className='bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer group'
              onClick={() => handleWordClick(item)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <span className='text-gray-900 font-medium text-sm group-hover:text-indigo-600 transition-colors'>
                      {item.displayWord}
                    </span>
                    {!item.found && (
                      <span className='text-gray-500 text-xs'>Not found</span>
                    )}
                  </div>
                  <div className='text-xs text-gray-500'>
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
                  className='w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors'
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
    </div>
  );
};

export default History;
