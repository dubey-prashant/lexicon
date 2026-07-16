// Parked, not deleted: this was the Words API (RapidAPI) integration, live
// in src/services/search.js until it was replaced by dictionaryapi.dev as
// the primary source. Never wired back in as a fallback, so it's been dead
// code — but it's real working logic, kept here for when a multi-API
// fallback chain (dictionaryapi.dev -> Words API -> AI) gets built.
//
// To reactivate: move transformWordsAPIData and searchWordsAPI back into
// the SearchService class in src/services/search.js (as `this.x` methods
// again), and set VITE_RAPIDAPI_HOST / VITE_RAPIDAPI_KEY in .env.
//
// Requires `NotFoundError` from src/services/search.js.

// Transform Words API data to our standardized schema (see search.js for
// the schema shape).
export function transformWordsAPIData(data) {
  const meanings = new Map();

  // Group definitions by part of speech
  if (data.results && Array.isArray(data.results)) {
    data.results.forEach((result) => {
      const partOfSpeech = result.partOfSpeech || 'unknown';

      if (!meanings.has(partOfSpeech)) {
        meanings.set(partOfSpeech, {
          partOfSpeech,
          definitions: [],
        });
      }

      const definition = {
        definition: result.definition,
      };

      if (result.examples && result.examples.length > 0) {
        definition.example = result.examples[0];
      }

      if (result.synonyms && result.synonyms.length > 0) {
        definition.synonyms = result.synonyms;
      }

      if (result.antonyms && result.antonyms.length > 0) {
        definition.antonyms = result.antonyms;
      }

      meanings.get(partOfSpeech).definitions.push(definition);
    });
  }

  return {
    word: data.word,
    pronunciation: data.pronunciation
      ? {
          text: data.pronunciation.all,
        }
      : null,
    meanings: Array.from(meanings.values()),
    source: 'wordsapi',
    timestamp: Date.now(),
  };
}

// Search Words API (RapidAPI). `NotFoundError` must be passed in since this
// file is intentionally outside the active service and can't import it
// without creating a real dependency on parked code.
export async function searchWordsAPI(word, NotFoundError) {
  const trimmedWord = word.trim();

  if (!trimmedWord) {
    throw new Error('Please enter a word to search');
  }

  try {
    const response = await fetch(
      `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(
        trimmedWord
      )}/`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Host': import.meta.env.VITE_RAPIDAPI_HOST,
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(
          `"${trimmedWord}" could not be found in Words API.`
        );
      }
      throw new Error(`Words API HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.word) {
      throw new NotFoundError(
        `"${trimmedWord}" could not be found in Words API.`
      );
    }

    return transformWordsAPIData(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Unable to fetch from Words API: ' + error.message);
  }
}
