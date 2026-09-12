import { NotFoundError } from '../NotFoundError';

// freedictionaryapi.com — current primary source. A nonexistent word returns HTTP 200 with an empty `entries` array, not a 404, so "not found" is judged by the array.

// flattens recursively-nested "subsenses" — without this they were silently dropped entirely
function flattenSenses(senses) {
  const flat = [];
  for (const sense of senses || []) {
    flat.push(sense);
    if (sense.subsenses && sense.subsenses.length > 0) {
      flat.push(...flattenSenses(sense.subsenses));
    }
  }
  return flat;
}

// Different shape from dictionaryapi.dev: entries (not meanings) can repeat
// the same partOfSpeech across separate etymologies, so they're grouped by
// partOfSpeech same as the Words API transform does; senses (not
// definitions) carry examples as an array, not a single string.
function transform(data) {
  const meanings = new Map();

  if (data.entries && Array.isArray(data.entries)) {
    data.entries.forEach((entry) => {
      const partOfSpeech = entry.partOfSpeech || 'unknown';

      if (!meanings.has(partOfSpeech)) {
        meanings.set(partOfSpeech, { partOfSpeech, definitions: [] });
      }

      flattenSenses(entry.senses).forEach((sense) => {
        const definition = { definition: sense.definition };

        if (sense.examples && sense.examples.length > 0) {
          definition.example = sense.examples[0];
        }
        if (sense.synonyms && sense.synonyms.length > 0) {
          definition.synonyms = sense.synonyms;
        }
        if (sense.antonyms && sense.antonyms.length > 0) {
          definition.antonyms = sense.antonyms;
        }

        meanings.get(partOfSpeech).definitions.push(definition);
      });
    });
  }

  // Pronunciation lives per-entry here (not once per word like
  // dictionaryapi.dev) — just take the first IPA one found across entries.
  let pronunciation = null;
  for (const entry of data.entries || []) {
    const ipa = entry.pronunciations?.find((p) => p.type === 'ipa');
    if (ipa) {
      pronunciation = { text: ipa.text };
      break;
    }
  }

  // CC BY-SA 4.0 data — its terms are attribution-based, so this is surfaced
  // in the UI (DefinitionCard), not just kept for our own records.
  const attribution = data.source
    ? {
        url: data.source.url,
        license: data.source.license?.name,
        licenseUrl: data.source.license?.url,
      }
    : null;

  return {
    word: data.word,
    pronunciation,
    meanings: Array.from(meanings.values()),
    attribution,
    source: 'freedictionaryapi',
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
      `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(
        trimmedWord
      )}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(
        `Free Dictionary API HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.entries) || data.entries.length === 0) {
      throw new NotFoundError(
        `"${trimmedWord}" could not be found in Free Dictionary API.`
      );
    }

    return transform(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`Unable to fetch from Free Dictionary API: ${error.message}`);
  }
}
