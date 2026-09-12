import { useState } from 'react';
import { askAI } from '../services/ai';

const AskAI = ({ word }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error | quota-exhausted | overloaded
  const [result, setResult] = useState(null);

  const handleAskAI = async () => {
    setStatus('loading');
    try {
      const data = await askAI(word);
      setResult(data);
      setStatus('done');
    } catch (err) {
      console.error('Ask AI failed:', err);
      if (err.isQuotaExhausted) {
        setStatus('quota-exhausted');
      } else if (err.isUpstreamOverloaded) {
        setStatus('overloaded');
      } else {
        setStatus('error');
      }
    }
  };

  if (status === 'idle') {
    return (
      <button
        onClick={handleAskAI}
        className='mt-3 flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors'
      >
        <span>✨</span>
        <span>Ask AI about "{word}"</span>
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <div className='mt-3 flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400'>
        <div className='w-3 h-3 border-2 border-violet-300 dark:border-violet-700 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin'></div>
        <span>Asking AI…</span>
      </div>
    );
  }

  if (status === 'quota-exhausted') {
    return (
      <div className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
        AI lookups have hit their free-tier limit for now — try again later.
      </div>
    );
  }

  if (status === 'overloaded') {
    return (
      <div className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
        The AI service is busy right now.{' '}
        <button
          onClick={handleAskAI}
          className='text-violet-600 dark:text-violet-400 hover:underline font-medium'
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
        AI lookup failed.{' '}
        <button
          onClick={handleAskAI}
          className='text-violet-600 dark:text-violet-400 hover:underline font-medium'
        >
          Try again
        </button>
      </div>
    );
  }

  // done
  return (
    <div className='mt-3 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-lg p-3'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-2'>
        <span>✨</span>
        <span>AI-generated — may not be fully accurate</span>
      </div>
      <p className='text-sm text-violet-900 dark:text-violet-200 leading-relaxed'>
        {result.explanation}
      </p>
      {result.example && (
        <p className='text-sm text-violet-700 dark:text-violet-400 italic mt-2 leading-relaxed'>
          {result.example}
        </p>
      )}
    </div>
  );
};

export default AskAI;
