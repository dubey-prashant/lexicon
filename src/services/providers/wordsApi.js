import { NotFoundError } from '../NotFoundError';

// Words API (RapidAPI) — NOT currently wired into search.js's fallback
// chain. Live in this repo's early history, replaced by dictionaryapi.dev
// and then by freeDictionaryApi.js. Kept here, in the same shape as its
// sibling providers, for when a third fallback tier is wanted — to activate,
// import { search as wordsApiSearch } from './providers/wordsApi' in
// search.js and add a call to it, and set VITE_RAPIDAPI_HOST/KEY in .env.
function transform(data) {
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

export async function search(word) {
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

    return transform(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Unable to fetch from Words API: ' + error.message);
  }
}
