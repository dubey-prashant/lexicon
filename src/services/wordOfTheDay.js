import * as storage from './storage';

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

// Every YYYY-MM-DD key for the last `days` days (including today).
const getLastNDaysKeys = (days) => {
  const today = new Date();
  const keys = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    keys.push(dateKey(date));
  }
  return keys;
};

// Enhanced Word of the Day service with smart daily caching
class WordOfTheDayService {
  constructor() {
    this.WOTD_CACHE_KEY = 'wotd_cache';
  }

  // Get cached WOTD for today
  async getCachedWOTD() {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.WOTD_CACHE_KEY)) || '{}'
      );
      return cache[dateKey(new Date())] || null;
    } catch (error) {
      console.error('Error reading WOTD cache:', error);
      return null;
    }
  }

  // Cache WOTD for today, trimming to the last 7 days at the same time
  async cacheWOTD(wordData) {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.WOTD_CACHE_KEY)) || '{}'
      );
      cache[dateKey(new Date())] = {
        ...wordData,
        cachedAt: Date.now(),
      };

      const validKeys = getLastNDaysKeys(7);
      const cleanCache = {};
      validKeys.forEach((key) => {
        if (cache[key]) {
          cleanCache[key] = cache[key];
        }
      });

      await storage.setItem(this.WOTD_CACHE_KEY, JSON.stringify(cleanCache));
    } catch (error) {
      console.error('Error caching WOTD:', error);
    }
  }

  async fetchFromWordnik() {
    try {
      const response = await fetch(
        'https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'
      );

      if (!response.ok) {
        throw new Error(`Wordnik API failed: ${response.status}`);
      }

      const data = await response.json();

      // Format the data to match our structure
      return {
        word: data.word,
        definition:
          data.definitions?.[0]?.text ||
          data.note ||
          'A fascinating word to explore today',
        example:
          data.examples?.[0]?.text ||
          `Discover how to use "${data.word}" in context`,
        partOfSpeech: data.definitions?.[0]?.partOfSpeech || 'word',
        source: 'wordnik',
      };
    } catch (error) {
      console.error('Error fetching from Wordnik:', error);
      throw error;
    }
  }

  // Main fetch method with fallback chain
  async fetchWordOfTheDay() {
    // Opportunistic cleanup of stale cache entries
    await this.cleanupCache();

    // First check cache
    const cached = await this.getCachedWOTD();
    if (cached) {
      return cached;
    }

    // Try API first, fallback if needed
    try {
      const wotd = await this.fetchFromWordnik();
      await this.cacheWOTD(wotd);
      return wotd;
    } catch {
      return this.getFallbackWordOfTheDay();
    }
  }

  // Clean up old cache entries
  async cleanupCache() {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.WOTD_CACHE_KEY)) || '{}'
      );
      const validKeys = getLastNDaysKeys(7);

      const cleanCache = {};
      validKeys.forEach((key) => {
        if (cache[key]) {
          cleanCache[key] = cache[key];
        }
      });

      await storage.setItem(this.WOTD_CACHE_KEY, JSON.stringify(cleanCache));
    } catch (err) {
      console.error('Error cleaning WOTD cache:', err);
    }
  }
}

// Export singleton instance
export const wordOfTheDayService = new WordOfTheDayService();
