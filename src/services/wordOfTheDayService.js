import * as storage from './storage';

// Enhanced Word of the Day service with smart daily caching
class WordOfTheDayService {
  constructor() {
    this.WOTD_CACHE_KEY = 'wotd_cache';
  }

  // Get today's date string for cache key
  getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`;
  }

  // Get cached WOTD for today
  async getCachedWOTD() {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.WOTD_CACHE_KEY)) || '{}'
      );
      const todayKey = this.getTodayKey();
      return cache[todayKey] || null;
    } catch (error) {
      console.error('Error reading WOTD cache:', error);
      return null;
    }
  }

  // Cache WOTD for today
  async cacheWOTD(wordData) {
    try {
      const cache = JSON.parse(
        (await storage.getItem(this.WOTD_CACHE_KEY)) || '{}'
      );
      const todayKey = this.getTodayKey();

      // Store today's WOTD
      cache[todayKey] = {
        ...wordData,
        cachedAt: Date.now(),
      };

      // Clean up old entries (keep only last 7 days)
      const today = new Date();
      const validKeys = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        validKeys.push(key);
      }

      // Remove old entries
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
      const today = new Date();
      const validKeys = [];

      // Keep only last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        validKeys.push(key);
      }

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
