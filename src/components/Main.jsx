import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SearchForm from './SearchForm';
import ResultsDisplay from './ResultsDisplay';
import WordOfTheDay from './WordOfTheDay';
import { searchService } from '../services/search';
import { consumePendingLookup } from '../services/pendingLookup';

function Main() {
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Handle state passed from History component
  useEffect(() => {
    if (location.state?.searchResult) {
      setSearchResult(location.state.searchResult);
      setError(null);
      // Clear the state to prevent it from persisting on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.error) {
      setError(location.state.error);
      setSearchResult(null);
      // Clear the state to prevent it from persisting on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Shared by Word of the Day clicks and the context-menu "Search in
  // Lexicon" handoff below.
  const performSearch = useCallback(async (word) => {
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await searchService.searchDictionary(word);
      setSearchResult(result);
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setError({
          type: 'not_found',
          message: err.message,
          word: word,
        });
      } else {
        setError({
          type: 'network',
          message: err.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pick up a word queued by the right-click "Search in Lexicon" context
  // menu (extension only — consumePendingLookup resolves to null on web,
  // since storage.js falls back to plain localStorage there and nothing
  // ever writes this key outside the extension's background script).
  useEffect(() => {
    consumePendingLookup().then((word) => {
      if (word) performSearch(word);
    });
  }, [performSearch]);

  return (
    <div className=''>
      {/* Header with Logo, History, and Settings */}
      <Header />

      {/* Search Form */}
      <SearchForm
        onSearch={(result) => {
          setSearchResult(result);
        }}
        onLoading={(loading) => {
          setIsLoading(loading);
        }}
        onError={(err) => {
          setError(err);
        }}
      />

      <ResultsDisplay
        result={searchResult}
        isLoading={isLoading}
        error={error}
        onSearch={setSearchResult}
        onLoading={setIsLoading}
        onError={setError}
      />

      {/* Word of the Day - Always visible */}
      <div className='mt-3'>
        <WordOfTheDay onWordClick={performSearch} />
      </div>
    </div>
  );
}

export default Main;
