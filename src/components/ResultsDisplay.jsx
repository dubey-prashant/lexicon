import React, { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';

// Normalize data to ensure consistent rendering
const normalizeWordData = (data) => {
  if (!data) return null;

  // Always expect new schema format now
  return {
    word: data.word,
    pronunciation: data.pronunciation,
    meanings: data.meanings || [],
    source: data.source || 'dictionaryapi',
  };
};

// Minimalist Loading Component
const LoadingState = () => (
  <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-fade-in'>
    <div className='flex items-center justify-center py-6'>
      <div className='relative'>
        <div className='w-8 h-8 border-2 border-gray-200 dark:border-gray-600 rounded-full animate-spin'>
          <div className='absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin'></div>
        </div>
      </div>
    </div>
    <div className='text-center'>
      <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
        Searching dictionary...
      </p>
      <div className='flex items-center justify-center space-x-1 mt-2'>
        <div className='w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-gentle-pulse'></div>
        <div
          className='w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-gentle-pulse'
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className='w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-gentle-pulse'
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  </div>
);

// Simple Error Component
const ErrorState = ({ error }) => {
  if (error.type === 'not_found') {
    return (
      <div className='bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 animate-slide-up'>
        <div className='flex items-center'>
          <svg
            className='w-7 h-7 text-yellow-600 dark:text-yellow-500 mr-3'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <div>
            <h3 className='text-sm font-medium text-yellow-800 dark:text-yellow-300'>
              Word "{error.word}" not found
            </h3>
            <p className='text-sm text-yellow-700 dark:text-yellow-400 mt-1'>
              Check spelling or try a different word
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Connection error
  return (
    <div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-slide-up'>
      <div className='flex items-center'>
        <svg
          className='w-5 h-5 text-red-600 dark:text-red-500 mr-3'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
            clipRule='evenodd'
          />
        </svg>
        <div>
          <h3 className='text-sm font-medium text-red-800 dark:text-red-300'>Connection Error</h3>
          <p className='text-sm text-red-700 dark:text-red-400 mt-1'>
            Check your internet connection and try again
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Results Display Component - Handles both legacy and new schema formats
const ResultsDisplay = ({ result, isLoading, error }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Computed unconditionally (before any early returns) so the favorite-status
  // effect below can depend on it without violating the rules of hooks.
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

  // Pronounce word using Web Speech API
  const pronounceWord = (word) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      setIsPlaying(true);
      setSpeechError(false);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7; // Slightly slower for clarity
      utterance.pitch = 1.2;
      utterance.volume = 0.8;

      // Reset playing state when finished
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

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // If no result, don't render anything
  if (!result) {
    return null;
  }

  if (!wordData || !wordData.word) {
    return null;
  }

  return (
    <div className='animate-slide-up'>
      {/* Traditional Dictionary Layout */}
      <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
        {/* Word Header - Traditional Style */}
        <div className='border-b border-gray-100 dark:border-gray-700 px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-baseline space-x-3'>
              <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                {wordData.word}
              </h1>

              {/* Pronunciation */}
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
                    d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
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
                <svg
                  className='w-4 h-4 animate-pulse'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
                </svg>
              ) : (
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
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

        {/* Definitions - Simplified Design */}
        <div className='px-4 py-4'>
          {wordData.meanings && wordData.meanings.length > 0 && (
            <div className='space-y-4'>
              {wordData.meanings.map((meaning, meaningIndex) => (
                <div key={meaningIndex} className='mb-4'>
                  {/* Part of Speech Header - Smaller */}
                  <h2 className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3'>
                    {meaning.partOfSpeech}
                  </h2>

                  {/* Definitions for this part of speech */}
                  <div className='space-y-3'>
                    {meaning.definitions.map((definition, defIndex) => (
                      <div key={defIndex} className=''>
                        {/* Definition with left border */}
                        <div className='border-l-3 border-gray-300 dark:border-gray-600 pl-3'>
                          <p className='text-gray-900 dark:text-gray-100 text-sm leading-relaxed mb-1'>
                            {definition.definition}
                          </p>

                          {/* Example - just italic, no prefix */}
                          {definition.example && (
                            <p className='text-gray-600 dark:text-gray-400 italic text-xs leading-relaxed'>
                              {definition.example}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
