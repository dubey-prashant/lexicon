import { NotFoundError } from '../NotFoundError';

// dictionaryapi.dev — fallback only. search.js only calls this when the
// primary provider itself errors out, not for a clean "not found" from it,
// since both ultimately source from Wiktionary and would likely agree.
function transform(data) {
  const meanings = [];

  if (data.meanings && Array.isArray(data.meanings)) {
    data.meanings.forEach((meaning) => {
      const meaningObj = {
        partOfSpeech: meaning.partOfSpeech,
        definitions: [],
      };

      if (meaning.definitions && Array.isArray(meaning.definitions)) {
        meaning.definitions.forEach((def) => {
          const definition = {
            definition: def.definition,
          };

          if (def.example) {
            definition.example = def.example;
          }

          if (def.synonyms && def.synonyms.length > 0) {
            definition.synonyms = def.synonyms;
          }

          if (def.antonyms && def.antonyms.length > 0) {
            definition.antonyms = def.antonyms;
          }

          meaningObj.definitions.push(definition);
        });
      }

      meanings.push(meaningObj);
    });
  }

  // Extract pronunciation
  let pronunciation = null;
  if (
    data.phonetics &&
    Array.isArray(data.phonetics) &&
    data.phonetics.length > 0
  ) {
    const phonetic = data.phonetics.find((p) => p.text) || data.phonetics[0];
    if (phonetic) {
      pronunciation = {
        text: phonetic.text,
      };
      if (phonetic.audio) {
        pronunciation.audio = phonetic.audio;
      }
    }
  }

  // CC BY-SA data — its terms are attribution-based, so this is surfaced in
  // the UI (DefinitionCard), not just kept for our own records.
  const attribution = data.license
    ? {
        url: data.sourceUrls?.[0],
        license: data.license.name,
        licenseUrl: data.license.url,
      }
    : null;

  return {
    word: data.word,
    pronunciation,
    meanings,
    attribution,
    source: 'dictionaryapi',
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
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        trimmedWord
      )}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(
          `"${trimmedWord}" could not be found in Dictionary API.`
        );
      }
      throw new Error(`Dictionary API HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new NotFoundError(
        `"${trimmedWord}" could not be found in Dictionary API.`
      );
    }

    return transform(data[0]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`Unable to fetch from Dictionary API: ${error.message}`);
  }
}
