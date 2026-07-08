import { useWordOfTheDay } from '../hooks/useWordOfTheDay';

const WordOfTheDay = ({ onWordClick }) => {
  const { wordOfTheDay, isLoading } = useWordOfTheDay();

  if (isLoading) {
    return (
      <div className='bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border border-indigo-100 dark:border-indigo-900 rounded-lg p-4'>
        <div className='flex items-center justify-center py-3'>
          <div className='flex items-center space-x-2'>
            <div className='w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-gentle-pulse'></div>
            <div
              className='w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-gentle-pulse'
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className='w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-gentle-pulse'
              style={{ animationDelay: '0.4s' }}
            ></div>
            <span className='ml-2 text-sm text-indigo-700 dark:text-indigo-300'>
              Loading word of the day...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!wordOfTheDay) return null;

  return (
    <div className='bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border border-indigo-100 dark:border-indigo-900 rounded-lg p-4 shadow-sm'>
      <div className='flex items-center justify-between mb-3'>
        <span className='text-sm font-semibold text-indigo-600 dark:text-indigo-400'>
          Word of the Day
        </span>
        <span className='text-xs text-indigo-500 dark:text-indigo-400'>
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
            className='text-lg font-semibold text-indigo-900 dark:text-indigo-200 hover:text-indigo-700 dark:hover:text-indigo-100 transition-colors duration-200 cursor-pointer'
          >
            {wordOfTheDay.word}
          </button>
          <span className='bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded font-medium'>
            {wordOfTheDay.partOfSpeech}
          </span>
        </div>

        <div className='bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800 rounded-lg p-3'>
          <p className='text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed font-medium'>
            {wordOfTheDay.definition}
          </p>
        </div>

        {wordOfTheDay.example && (
          <div className='border-l-3 border-indigo-400 dark:border-indigo-600 pl-3 bg-white/50 dark:bg-gray-900/30 rounded-r-md py-2'>
            <p className='text-indigo-800 dark:text-indigo-300 italic text-sm font-medium'>
              {wordOfTheDay.example}
            </p>
          </div>
        )}
      </div>

      <div className='mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800'>
        <p className='text-xs text-indigo-700 dark:text-indigo-400 text-center font-medium'>
          Click the word to search for more details
        </p>
      </div>
    </div>
  );
};

export default WordOfTheDay;
