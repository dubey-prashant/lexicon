import * as storage from './storage';
import * as freeDictionaryApi from './providers/freeDictionaryApi';
import * as dictionaryApi from './providers/dictionaryApi';
import { NotFoundError } from './NotFoundError';

// merges a differently-cased variant's meanings into the base result, grouped by partOfSpeech
function mergeMeanings(base, extra) {
  const meanings = base.meanings.map((m) => ({
    ...m,
    definitions: [...m.definitions],
  }));
  const byPartOfSpeech = new Map(meanings.map((m) => [m.partOfSpeech, m]));

  for (const extraMeaning of extra.meanings) {
    const existing = byPartOfSpeech.get(extraMeaning.partOfSpeech);
    if (existing) {
      existing.definitions.push(...extraMeaning.definitions);
    } else {
      const copy = {
        ...extraMeaning,
        definitions: [...extraMeaning.definitions],
      };
      meanings.push(copy);
      byPartOfSpeech.set(copy.partOfSpeech, copy);
    }
  }

  return { ...base, meanings };
}

class SearchService {
  constructor() {
    this.DICTIONARY_CACHE_KEY = 'dictionary_cache';
    this.SEARCH_HISTORY_KEY = 'search_history';
    this.FAVORITES_KEY = 'favorites';
    this.CACHE_EXPIRY_DAYS = 365;
    this.MAX_HISTORY_ITEMS = 500;
  }

  /**
   * Our standardized dictionary schema (each provider in ./providers/
   * transforms its own API's response into this shape):
   * {
   *   word: string,
   *   pronunciation: {
   *     text: string,
   *     audio?: string
   *   },
   *   meanings: [
   *     {
   *       partOfSpeech: string,
   *       definitions: [
   *         {
   *           definition: string,
   *           example?: string,
   *           synonyms?: string[],
   *           antonyms?: string[]
   *         }
   *       ]
   *     }
   *   ],
   *   attribution: {
   *     url?: string,
   *     license?: string,
   *     licenseUrl?: string
   *   } | null, // required by the CC BY-SA data sources — see DefinitionCard
   *   source: string, // 'freedictionaryapi' | 'dictionaryapi' | 'wordsapi'
   *   timestamp: number
   * }
   */

  // Get cached dictionary result
  async getCachedWord(word) {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.DICTIONARY_CACHE_KEY)) || '{}',
      );
      const cached = cache[word.toLowerCase()];

      if (!cached) return null;

      // Check if cache is expired
      const now = Date.now();
      const cacheAge = now - cached.timestamp;
      const expiryTime = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (cacheAge > expiryTime) {
        // Remove expired entry
        delete cache[word.toLowerCase()];
        await storage.setItem(this.DICTIONARY_CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error reading dictionary cache:', error);
      return null;
    }
  }

  // Cache dictionary result
  async cacheWord(word, data) {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.DICTIONARY_CACHE_KEY)) || '{}',
      );
      cache[word.toLowerCase()] = {
        data,
        timestamp: Date.now(),
      };

      // Limit cache size (keep only last 100 entries)
      const entries = Object.entries(cache);
      if (entries.length > 100) {
        // Sort by timestamp and keep only the 80 most recent
        const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        const trimmed = Object.fromEntries(sorted.slice(0, 80));
        await storage.setItem(
          this.DICTIONARY_CACHE_KEY,
          JSON.stringify(trimmed),
        );
      } else {
        await storage.setItem(this.DICTIONARY_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Error caching dictionary result:', error);
    }
  }

  // stores word + metadata only, no embedded result — the dictionary cache is the source of truth for definitions
  async addToHistory(word, result) {
    try {
      let history = JSON.parse(
        (await storage.getItem(this.SEARCH_HISTORY_KEY)) || '[]',
      );

      // Remove existing entry if present
      history = history.filter(
        (item) => item.word.toLowerCase() !== word.toLowerCase(),
      );

      history.unshift({
        word: word.toLowerCase(),
        displayWord: word,
        timestamp: Date.now(),
        found: !!result,
      });

      // Limit history size
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history = history.slice(0, this.MAX_HISTORY_ITEMS);
      }

      await storage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error updating search history:', error);
    }
  }

  // Get search history
  async getSearchHistory() {
    try {
      return JSON.parse(
        (await storage.getItem(this.SEARCH_HISTORY_KEY)) || '[]',
      );
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  // Clear search history
  async clearHistory() {
    await storage.removeItem(this.SEARCH_HISTORY_KEY);
  }

  // Get favorited words (word only — re-fetches via the dictionary cache on open)
  async getFavorites() {
    try {
      return JSON.parse((await storage.getItem(this.FAVORITES_KEY)) || '[]');
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  }

  async isFavorite(word) {
    const favorites = await this.getFavorites();
    return favorites.some((item) => item.word === word.toLowerCase());
  }

  async addFavorite(word) {
    try {
      const favorites = await this.getFavorites();
      const key = word.toLowerCase();
      if (favorites.some((item) => item.word === key)) return;

      favorites.unshift({
        word: key,
        displayWord: word,
        timestamp: Date.now(),
        found: true,
      });
      await storage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  async removeFavorite(word) {
    try {
      const favorites = await this.getFavorites();
      const key = word.toLowerCase();
      const filtered = favorites.filter((item) => item.word !== key);
      await storage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  // Toggles favorite status for a word, returning the new favorited state
  async toggleFavorite(word) {
    const isFav = await this.isFavorite(word);
    if (isFav) {
      await this.removeFavorite(word);
      return false;
    }
    await this.addFavorite(word);
    return true;
  }

  async clearFavorites() {
    await storage.removeItem(this.FAVORITES_KEY);
  }

  // Free Dictionary API primary, dictionaryapi.dev as fallback (only on the primary erroring out, not a clean not-found)
  async searchDictionary(word) {
    const trimmedWord = word.trim();

    if (!trimmedWord) {
      throw new Error('Please enter a word to search');
    }

    // lowercased for cache key + fetch; trimmedWord's original casing is kept only for history display
    const lookupWord = trimmedWord.toLowerCase();

    // Opportunistic cleanup of expired cache entries
    await this.cleanupCache();

    // Check cache first
    const cached = await this.getCachedWord(lookupWord);
    if (cached) {
      await this.addToHistory(trimmedWord, cached);
      return cached;
    }

    try {
      let standardData;
      try {
        standardData = await freeDictionaryApi.search(lookupWord);
      } catch (primaryError) {
        if (primaryError instanceof NotFoundError) {
          throw primaryError;
        }
        standardData = await dictionaryApi.search(lookupWord);
      }

      // e.g. "Free" vs "free" can be genuinely different entries (surname vs adjective) — best-effort merge, ok to fail
      if (trimmedWord !== lookupWord) {
        try {
          const casedVariant = await freeDictionaryApi.search(trimmedWord);
          standardData = mergeMeanings(standardData, casedVariant);
        } catch {
          // no distinct entry for this casing — the lowercase result stands on its own
        }
      }

      // Cache in our standard format
      await this.cacheWord(lookupWord, standardData);

      // Add to history (original casing preserved for display)
      await this.addToHistory(trimmedWord, standardData);

      return standardData;
    } catch (error) {
      // Add failed search to history
      await this.addToHistory(trimmedWord, null);

      // If it fails, throw the error
      if (error instanceof NotFoundError) {
        throw new NotFoundError(
          `"${trimmedWord}" could not be found in the dictionary.`,
        );
      }

      // For network errors, throw a general error
      throw new Error(
        'Unable to fetch word definition. Please check your internet connection and try again.',
      );
    }
  }

  // Clean up old cache entries
  async cleanupCache() {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.DICTIONARY_CACHE_KEY)) || '{}',
      );
      const now = Date.now();
      const expiryTime = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      let cleaned = false;
      for (const word in cache) {
        const cacheAge = now - cache[word].timestamp;
        if (cacheAge > expiryTime) {
          delete cache[word];
          cleaned = true;
        }
      }

      if (cleaned) {
        await storage.setItem(this.DICTIONARY_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();
export { NotFoundError };
