import { useState, useCallback, useRef, useEffect } from 'react';
import { localWordList } from '../services/localWordList';

export const useAutocomplete = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef(new Map());
  const apiTimeoutRef = useRef(null);
  const currentQueryRef = useRef('');

  // Instant local suggestions + background API enhancement
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsVisible(false);
      setSelectedIndex(-1);
      return;
    }

    const cacheKey = query.toLowerCase();
    currentQueryRef.current = cacheKey;

    // Check cache first
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setSuggestions(cached);
      setIsVisible(cached.length > 0);
      return;
    }

    // Get local suggestions INSTANTLY (no loading state)
    const localSuggestions = localWordList.getSuggestions(query, 6);

    // Show local suggestions immediately
    setSuggestions(localSuggestions);
    setIsVisible(true);

    // If we have enough local suggestions (4+), skip API call
    if (localSuggestions.length >= 4) {
      cacheRef.current.set(cacheKey, localSuggestions);
      return;
    }

    // Clear any pending API call
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current);
    }

    // Debounce API call for enhancement (only if local suggestions are few)
    apiTimeoutRef.current = setTimeout(async () => {
      // Double-check we're still on the same query
      if (currentQueryRef.current !== cacheKey) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=6`
        );

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const apiSuggestions = data.map((item) => item.word);

        // Only update if we're still on the same query
        if (currentQueryRef.current === cacheKey) {
          // Combine suggestions: local first, then API (avoiding duplicates)
          const combined = [...localSuggestions];
          for (const apiWord of apiSuggestions) {
            if (!combined.includes(apiWord) && combined.length < 6) {
              combined.push(apiWord);
            }
          }

          setSuggestions(combined);

          // Cache the enhanced results
          cacheRef.current.set(cacheKey, combined);

          // Limit cache size
          if (cacheRef.current.size > 100) {
            const firstKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(firstKey);
          }
        }
      } catch {
        // Keep the local suggestions we already have
        if (currentQueryRef.current === cacheKey) {
          cacheRef.current.set(cacheKey, localSuggestions);
        }
      } finally {
        if (currentQueryRef.current === cacheKey) {
          setIsLoading(false);
        }
      }
    }, 300); // Slightly longer debounce since local suggestions show instantly
  }, []);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e, query, onSelect) => {
      if (!isVisible || suggestions.length === 0) return false;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          return true;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          return true;

        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault();
            onSelect(suggestions[selectedIndex]);
            setIsVisible(false);
            return true;
          }
          return false;

        case 'Escape':
          setIsVisible(false);
          setSelectedIndex(-1);
          return true;

        default:
          return false;
      }
    },
    [isVisible, suggestions, selectedIndex]
  );

  // Select suggestion
  const selectSuggestion = useCallback((suggestion, onSelect) => {
    onSelect(suggestion);
    setIsVisible(false);
    setSelectedIndex(-1);
  }, []);

  // Hide suggestions
  const hideSuggestions = useCallback(() => {
    setIsVisible(false);
    setSelectedIndex(-1);
  }, []);

  return {
    suggestions,
    isVisible,
    selectedIndex,
    isLoading,
    fetchSuggestions, // Direct call, no debouncing for instant local suggestions
    handleKeyDown,
    selectSuggestion,
    hideSuggestions,
  };
};
