import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';

// Shared by History and Favorites: clicking an item searches (or reuses a
// cached result) and navigates back to the main page with the outcome.
export function useWordNavigation() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleWordClick = async (item) => {
    setIsLoading(true);

    try {
      let result;
      if (item.dictionaryResult) {
        result = item.dictionaryResult;
      } else {
        result = await searchService.searchDictionary(item.displayWord);
      }

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
