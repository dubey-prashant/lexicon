import React, { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import AutocompleteDropdown from './AutocompleteDropdown';
import { searchService, NotFoundError } from '../services/searchService';

const SearchForm = ({ onSearch, onLoading, onError }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const formRef = useRef(null);

  const {
    suggestions,
    isVisible,
    selectedIndex,
    isLoading: suggestionsLoading,
    fetchSuggestions,
    handleKeyDown,
    selectSuggestion,
    hideSuggestions,
  } = useAutocomplete();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        hideSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value.trim()); // Instant local suggestions, no debouncing needed
  };

  const handleKeyDownEvent = (e) => {
    const handled = handleKeyDown(e, query, handleSuggestionSelect);
    if (!handled && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    selectSuggestion(suggestion, (word) => {
      performSearch(word);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const word = query.trim();

    if (!word) {
      inputRef.current?.focus();
      return;
    }

    hideSuggestions();
    performSearch(word);
  };

  const performSearch = async (word) => {
    onLoading(true);
    onError(null);

    try {
      const result = await searchService.searchDictionary(word);
      onSearch(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        // Pass the word and error to parent for handling "Search with AI" option
        onError({
          type: 'not_found',
          message: error.message,
          word: word,
        });
      } else {
        onError({
          type: 'network',
          message: error.message,
        });
      }
    } finally {
      onLoading(false);
    }
  };

  return (
    <div ref={formRef} className='relative mb-4'>
      {/* Minimalist Search Form */}
      <form onSubmit={handleSubmit}>
        <div className='group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-500 focus-within:shadow-card rounded-xl p-1 flex items-center gap-1 transition-all duration-200'>
          <div className='flex-1 relative flex items-center'>
            <input
              ref={inputRef}
              type='text'
              name='word'
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownEvent}
              placeholder='Search any word...'
              className='w-full pl-3 pr-10 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm bg-transparent'
              autoComplete='off'
              spellCheck='false'
            />

            {suggestionsLoading && (
              <div className='absolute right-0'>
                <div className='w-3.5 h-3.5 border-2 border-gray-200 dark:border-gray-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin'></div>
              </div>
            )}
          </div>

          <button
            type='submit'
            className='text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 focus-ring'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              ></path>
            </svg>
          </button>
        </div>
      </form>

      <AutocompleteDropdown
        suggestions={suggestions}
        isVisible={isVisible}
        selectedIndex={selectedIndex}
        isLoading={suggestionsLoading}
        onSelect={handleSuggestionSelect}
      />
    </div>
  );
};

export default SearchForm;
