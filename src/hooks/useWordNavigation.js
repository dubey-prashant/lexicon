import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/search';

// Shared by History and Favorites: clicking an item searches (or reuses a
// cached result) and navigates back to the main page with the outcome.
export function useWordNavigation() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleWordClick = async (item) => {
    setIsLoading(true);

    try {
      // searchDictionary() already checks the dictionary cache first, so
      // this is instant for anything still cached and only hits the network
      // for words that fell out of the cache's 100-entry window.
      const result = await searchService.searchDictionary(item.displayWord);
      navigate('/', { state: { searchResult: result } });
    } catch (err) {
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

  return { isLoading, handleWordClick };
}
