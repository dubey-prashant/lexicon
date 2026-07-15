import { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { isPillEnabled } from '../services/settings';
import DefinitionCard from '../components/DefinitionCard';

// Longer selections are almost certainly a copy/paste, not a lookup —
// keeps this feeling like a word/short-phrase tool, not a paragraph one.
const MAX_SELECTION_LENGTH = 60;

// hostElement is the shadow host div created in index.jsx — used only to
// detect "did this event originate from inside our own widget", since a
// mouseup on our pill/card would otherwise bubble to document and trigger
// the same dismiss logic that's supposed to react to clicks elsewhere.
const SelectionWidget = ({ hostElement }) => {
  const [pillPosition, setPillPosition] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dismiss = useCallback(() => {
    setPillPosition(null);
    setExpanded(false);
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    const handleMouseUp = async (event) => {
      // composedPath() includes shadow-DOM-internal nodes, unlike
      // event.target (which gets retargeted to hostElement from outside the
      // shadow root) — this is how we tell "click was inside our widget".
      if (event.composedPath().includes(hostElement)) return;

      let enabled;
      try {
        enabled = await isPillEnabled();
      } catch (err) {
        console.error('Lexicon: could not read selection-pill setting:', err);
        return;
      }
      if (!enabled) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || selection.isCollapsed || text.length > MAX_SELECTION_LENGTH) {
        dismiss();
        return;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        dismiss();
        return;
      }

      setSelectedText(text);
      setExpanded(false);
      setResult(null);
      setError(null);
      setPillPosition({ top: rect.bottom + 8, left: rect.left });
    };

    const handleScroll = () => dismiss();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hostElement, dismiss]);

  const handlePillClick = async () => {
    setExpanded(true);
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchService.searchDictionary(selectedText);
      setResult(data);
    } catch (err) {
      setError(
        err.name === 'NotFoundError'
          ? { type: 'not_found', message: err.message, word: selectedText }
          : { type: 'network', message: err.message }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!pillPosition) return null;

  return (
    <div
      style={{ position: 'fixed', top: pillPosition.top, left: pillPosition.left }}
      className='animate-fade-in'
    >
      {!expanded ? (
        <button
          onClick={handlePillClick}
          className='flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-elevated hover:bg-indigo-700 transition-colors'
        >
          <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
            />
          </svg>
          Lookup
        </button>
      ) : (
        <div className='w-80 max-h-96 overflow-y-auto rounded-lg shadow-elevated'>
          {isLoading && (
            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400'>
              Searching…
            </div>
          )}
          {error && (
            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300'>
              {error.type === 'not_found'
                ? `"${error.word}" not found`
                : 'Connection error — check your internet connection'}
            </div>
          )}
          {!isLoading && !error && result && (
            <DefinitionCard result={result} compact />
          )}
        </div>
      )}
    </div>
  );
};

export default SelectionWidget;
