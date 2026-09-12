import { useState, useEffect, useCallback } from 'react';
import { searchService, NotFoundError } from '../services/search';
import { isPillEnabled } from '../services/settings';
import DefinitionCard from '../components/DefinitionCard';
import AskAI from '../components/AskAI';
import { LOGO_ICON_PATH } from '../components/icons';

// caps this to a word/short-phrase tool, not a paragraph one
const MAX_SELECTION_LENGTH = 60;

// hostElement (the shadow host from index.jsx) lets us detect clicks originating inside our own widget
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
      // composedPath() sees inside the shadow root, unlike the retargeted event.target
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
        err instanceof NotFoundError
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
              d={LOGO_ICON_PATH}
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
            <div className='space-y-2'>
              <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300'>
                {error.type === 'not_found'
                  ? `"${error.word}" not found`
                  : 'Connection error — check your internet connection'}
              </div>
              {error.type === 'not_found' && <AskAI word={error.word} />}
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
