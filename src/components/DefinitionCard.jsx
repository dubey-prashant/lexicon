import { useState, useEffect } from 'react';
import { searchService } from '../services/search';
import { STAR_ICON_PATH } from './icons';

const MAX_DEFINITIONS_BEFORE_COLLAPSE = 3;

// One part-of-speech section. Collapsed to maxVisible definitions by default
// with a "Show N more" toggle (disable via collapsible=false for the compact card).
const MeaningGroup = ({
  meaning,
  maxVisible = MAX_DEFINITIONS_BEFORE_COLLAPSE,
  collapsible = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = collapsible && meaning.definitions.length > maxVisible;
  const visibleDefinitions = expanded
    ? meaning.definitions
    : meaning.definitions.slice(0, maxVisible);

  return (
    <div className='mb-4'>
      <h2 className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3'>
        {meaning.partOfSpeech}
      </h2>

      <div className='space-y-3'>
        {visibleDefinitions.map((definition, defIndex) => (
          <div key={defIndex}>
            <div className='border-l-3 border-gray-300 dark:border-gray-600 pl-3'>
              <p className='text-gray-900 dark:text-gray-100 text-sm leading-relaxed mb-1'>
                {definition.definition}
              </p>

              {definition.example && (
                <p className='text-gray-600 dark:text-gray-400 italic text-xs leading-relaxed'>
                  {definition.example}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className='mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline'
        >
          {expanded
            ? 'Show less'
            : `Show ${meaning.definitions.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
};

const normalizeWordData = (data) => {
  if (!data) return null;
  return {
    word: data.word,
    pronunciation: data.pronunciation,
    meanings: data.meanings || [],
    attribution: data.attribution || null,
    source: data.source || 'dictionaryapi',
  };
};

// Shared between the popup (ResultsDisplay) and the in-page selection card; `compact` trims it down for the small floating card
const DefinitionCard = ({ result, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const wordData = normalizeWordData(result);

  useEffect(() => {
    if (!wordData?.word) {
      setIsFavorited(false);
      return;
    }
    let cancelled = false;
    searchService.isFavorite(wordData.word).then((fav) => {
      if (!cancelled) setIsFavorited(fav);
    });
    return () => {
      cancelled = true;
    };
  }, [wordData?.word]);

  const handleToggleFavorite = async () => {
    const next = await searchService.toggleFavorite(wordData.word);
    setIsFavorited(next);
  };

  const pronounceWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      setIsPlaying(true);
      setSpeechError(false);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
        setSpeechError(true);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported');
      setSpeechError(true);
    }
  };

  if (!wordData || !wordData.word) {
    return null;
  }

  const meanings = compact ? wordData.meanings.slice(0, 1) : wordData.meanings;

  return (
    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
      {/* Word Header */}
      <div className='border-b border-gray-100 dark:border-gray-700 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-baseline space-x-3'>
            <h1 className={`font-bold text-gray-800 dark:text-gray-100 ${compact ? 'text-lg' : 'text-2xl'}`}>
              {wordData.word}
            </h1>

            {wordData.pronunciation?.text && (
              <span className='text-gray-600 dark:text-gray-400 text-sm font-mono'>
                {wordData.pronunciation.text}
              </span>
            )}
          </div>

          <div className='flex items-center gap-1'>
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`px-2 py-1.5 rounded-md transition-all duration-200 focus-ring border ${
                isFavorited
                  ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-500 dark:text-amber-400'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className='w-4 h-4'
                fill={isFavorited ? 'currentColor' : 'none'}
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d={STAR_ICON_PATH}
                />
              </svg>
            </button>

            {/* Pronunciation Button */}
            <button
              onClick={() => pronounceWord(wordData.word)}
              className={`px-2 py-1.5 rounded-md transition-all duration-200 focus-ring ${
                isPlaying
                  ? 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                  : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
              title={isPlaying ? 'Playing...' : 'Pronounce word'}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <svg className='w-4 h-4 animate-pulse' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
                </svg>
              ) : (
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
                </svg>
              )}
            </button>
          </div>
        </div>

        {speechError && (
          <p className='text-xs text-red-500 dark:text-red-400 mt-1'>
            Pronunciation unavailable — no speech voices found on this device
          </p>
        )}
      </div>

      {/* Definitions */}
      <div className='px-4 py-4'>
        {meanings.length > 0 && (
          <div className='space-y-4'>
            {meanings.map((meaning, meaningIndex) => (
              // word-qualified key so an expanded group can't carry its state over onto a new search
              <MeaningGroup
                key={`${wordData.word}-${meaningIndex}`}
                meaning={meaning}
                maxVisible={compact ? 1 : MAX_DEFINITIONS_BEFORE_COLLAPSE}
                collapsible={!compact}
              />
            ))}
          </div>
        )}
      </div>

      {/* CC BY-SA requires attribution; hidden in compact mode to keep the tiny card uncluttered */}
      {!compact && wordData.attribution && (
        <div className='px-4 py-2 border-t border-gray-100 dark:border-gray-700'>
          <p className='text-[11px] text-gray-400 dark:text-gray-500'>
            {wordData.attribution.url ? (
              <a
                href={wordData.attribution.url}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:underline'
              >
                Data from Wiktionary
              </a>
            ) : (
              'Data from Wiktionary'
            )}
            {wordData.attribution.license && (
              <>
                {' · '}
                {wordData.attribution.licenseUrl ? (
                  <a
                    href={wordData.attribution.licenseUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    {wordData.attribution.license}
                  </a>
                ) : (
                  wordData.attribution.license
                )}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default DefinitionCard;
