import { useWordOfTheDay } from '../hooks/useWordOfTheDay';

const WordOfTheDay = ({ onWordClick }) => {
  const { wordOfTheDay, isLoading } = useWordOfTheDay();

  if (isLoading) {
    return (
      <div className='classic-panel bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border border-indigo-100 dark:border-indigo-900 rounded-lg p-4'>
        <div className='flex items-center justify-center py-3'>
          <div className='flex items-center space-x-2'>
            <div className='w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'></div>
            <div
              className='w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className='w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'
              style={{ animationDelay: '0.4s' }}
            ></div>
            <span className='ml-2 text-sm text-indigo-700 dark:text-indigo-300 classic-accent'>
              Loading word of the day...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!wordOfTheDay) return null;

  return (
    <div className='classic-panel bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border border-indigo-100 dark:border-indigo-900 rounded-lg p-4 shadow-sm'>
      <div className='classic-divider flex items-center justify-between mb-3 classic:pb-2'>
        <span className='classic-heading text-sm font-semibold text-indigo-600 dark:text-indigo-400 classic-accent'>
          Word of the Day
        </span>
        <span className='text-xs text-indigo-500 dark:text-indigo-400 classic-accent'>
          {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => onWordClick && onWordClick(wordOfTheDay.word)}
            className='classic-heading text-lg font-semibold text-indigo-900 dark:text-indigo-200 decoration-2 underline-offset-2 hover:underline hover:text-indigo-700 dark:hover:text-indigo-100 hover:decoration-indigo-500 dark:hover:decoration-indigo-400 classic:hover:text-[var(--classic-accent)] classic:hover:decoration-[var(--classic-accent)] transition-colors duration-200 cursor-pointer'
          >
            {wordOfTheDay.word}
          </button>
          <span className='classic-button bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded font-medium'>
            {wordOfTheDay.partOfSpeech}
          </span>
        </div>

        <div className='classic-inset bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800 rounded-lg p-3'>
          <p className='text-indigo-900 dark:text-indigo-200 classic:text-[var(--classic-ink)] text-sm leading-relaxed font-medium classic:[font-family:var(--classic-font-body)]'>
            {wordOfTheDay.definition}
          </p>
        </div>

        {wordOfTheDay.example && (
          <div className='border-l-3 border-indigo-400 dark:border-indigo-600 classic:border-l-[var(--classic-edge-dark)] pl-3 bg-white/50 dark:bg-gray-900/30 rounded-r-md py-2'>
            <p className='text-indigo-800 dark:text-indigo-300 classic:text-[var(--classic-ink)] italic text-sm font-medium classic:[font-family:var(--classic-font-body)]'>
              {wordOfTheDay.example}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordOfTheDay;
