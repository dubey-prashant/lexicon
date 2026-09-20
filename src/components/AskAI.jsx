import { useState } from 'react';
import { askAI } from '../services/ai';
import { SPARKLE_ICON_PATH } from './icons';

const SparkleIcon = ({ className }) => (
  <svg className={className} fill='currentColor' viewBox='0 0 24 24'>
    <path d={SPARKLE_ICON_PATH} />
  </svg>
);

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
        title={`Ask AI about "${word}"`}
        className='classic-box mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-sm font-medium text-violet-700 dark:text-violet-300 classic:text-[var(--classic-accent)] hover:bg-violet-100 dark:hover:bg-violet-900 classic:hover:opacity-80 transition-colors'
      >
        <SparkleIcon className='w-3.5 h-3.5 shrink-0' />
        <span>Ask AI instead</span>
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <div className='classic-box mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-sm font-medium text-violet-700 dark:text-violet-300 classic:text-[var(--classic-accent)]'>
        <div className='flex items-center gap-1'>
          <div className='w-1.5 h-1.5 bg-violet-600 dark:bg-violet-400 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'></div>
          <div
            className='w-1.5 h-1.5 bg-violet-600 dark:bg-violet-400 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className='w-1.5 h-1.5 bg-violet-600 dark:bg-violet-400 classic:bg-[var(--classic-accent)] rounded-full classic:rounded-none animate-gentle-pulse'
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
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
          className='text-violet-600 dark:text-violet-400 classic:text-[var(--classic-accent)] hover:underline font-medium'
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
          className='text-violet-600 dark:text-violet-400 classic:text-[var(--classic-accent)] hover:underline font-medium'
        >
          Try again
        </button>
      </div>
    );
  }

  // done
  return (
    <div className='classic-box mt-3 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-lg p-3'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 classic:text-[var(--classic-accent)] mb-2'>
        <SparkleIcon className='w-3 h-3 shrink-0' />
        <span>AI-generated — may not be fully accurate</span>
      </div>
      <p className='text-sm text-violet-900 dark:text-violet-200 classic:text-[var(--classic-ink)] leading-relaxed classic:[font-family:var(--classic-font-body)]'>
        {result.explanation}
      </p>
      {result.example && (
        <p className='text-sm text-violet-700 dark:text-violet-400 classic:text-[var(--classic-ink)] italic mt-2 leading-relaxed classic:[font-family:var(--classic-font-body)]'>
          {result.example}
        </p>
      )}
    </div>
  );
};

export default AskAI;
