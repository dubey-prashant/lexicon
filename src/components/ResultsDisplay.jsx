import DefinitionCard from './DefinitionCard';
import AskAI from './AskAI';

// Minimalist Loading Component
const LoadingState = () => (
  <div className='classic-panel bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-fade-in'>
    <div className='flex items-center justify-center py-6'>
      <div className='relative'>
        <div className='w-8 h-8 border-2 border-gray-200 dark:border-gray-600 classic:border-[var(--classic-edge-dark)] rounded-full animate-spin'>
          <div className='absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 classic:border-t-[var(--classic-accent)] rounded-full animate-spin'></div>
        </div>
      </div>
    </div>
    <div className='text-center'>
      <p className='text-gray-600 dark:text-gray-300 text-sm font-medium classic:[font-family:var(--classic-font-body)]'>
        Searching dictionary...
      </p>
      <div className='flex items-center justify-center space-x-1 mt-2'>
        <div className='w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'></div>
        <div
          className='w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className='w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  </div>
);

// Simple Error Component
const ErrorState = ({ error }) => {
  if (error.type === 'not_found') {
    // "check spelling" is wrong advice for a phrase query
    const isPhrase = error.word.trim().includes(' ');

    return (
      <div className='animate-slide-up'>
        <div className='classic-box bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
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
                {isPhrase ? 'Phrase' : 'Word'} "{error.word}" not found
              </h3>
              <p className='text-sm text-yellow-700 dark:text-yellow-400 mt-1'>
                {isPhrase
                  ? "This looks like a phrase or idiom — not something a standard dictionary covers"
                  : 'Check spelling or try a different word'}
              </p>
            </div>
          </div>
        </div>
        {/* sibling, not nested inside the box above */}
        <AskAI word={error.word} />
      </div>
    );
  }

  // Connection error
  return (
    <div className='classic-box bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-slide-up'>
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

// Main Results Display Component
const ResultsDisplay = ({ result, isLoading, error }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!result) {
    return null;
  }

  return (
    <div className='animate-slide-up'>
      <DefinitionCard result={result} />
    </div>
  );
};

export default ResultsDisplay;
