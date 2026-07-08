import React from 'react';

const SkeletonSuggestion = ({ delay = 0 }) => (
  <div
    className='px-3 py-2 animate-pulse'
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className='flex items-center space-x-2'>
      {/* Word skeleton */}
      <div
        className='h-3.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer bg-[length:200%_100%]'
        style={{ width: `${60 + Math.random() * 40}px` }}
      ></div>

      {/* Optional icon placeholder */}
      <div className='w-2.5 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer'></div>
    </div>
  </div>
);

const AutocompleteShimmer = ({ minimal = false }) => {
  if (minimal) {
    // Minimal shimmer for when we have suggestions but API is loading
    return (
      <div className='px-3 py-1.5 border-t border-gray-100 dark:border-gray-700'>
        <div className='flex items-center justify-center space-x-2'>
          <div className='w-1.5 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-pulse'></div>
          <div className='w-16 h-1.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer bg-[length:200%_100%]'></div>
          <div
            className='w-1.5 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-pulse'
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className='py-1'>
      {/* Generate 3-4 skeleton suggestions with different widths and delays */}
      {[0, 100, 200].map((delay, index) => (
        <SkeletonSuggestion key={index} delay={delay} />
      ))}
    </div>
  );
};

export default AutocompleteShimmer;
