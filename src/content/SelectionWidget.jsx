import { useState, useEffect, useCallback } from 'react';
import { searchService, NotFoundError } from '../services/search';
import { isPillEnabled, isInstantLookupEnabled } from '../services/settings';
import * as storage from '../services/storage';
import DefinitionCard from '../components/DefinitionCard';
import AskAI from '../components/AskAI';
import { LOGO_ICON_PATH } from '../components/icons';

// caps this to a word/short-phrase tool, not a paragraph one
const MAX_SELECTION_LENGTH = 100;

// Matches the expanded card's own w-80/max-h-96 — clamping against this
// worst-case size up front (rather than the pill's small collapsed size)
// means the position never needs to jump when it expands later, e.g. once
// Ask AI adds its card and the content grows taller than it was when first
// positioned.
const WIDGET_WIDTH = 320;
const WIDGET_MAX_HEIGHT = 384;
const VIEWPORT_MARGIN = 8;

function clampToViewport(rect) {
  const maxLeft = window.innerWidth - WIDGET_WIDTH - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - WIDGET_MAX_HEIGHT - VIEWPORT_MARGIN;
  return {
    left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)),
    top: Math.max(VIEWPORT_MARGIN, Math.min(rect.bottom + 8, maxTop)),
  };
}

// Pill is icon-only once a user has seen what it does — shown with a
// "Lookup" label the very first time so it isn't a mystery glyph on debut.
const COACH_MARK_KEY = 'selection_pill_coachmark_seen';

// hostElement (the shadow host from index.jsx) lets us detect clicks originating inside our own widget
const SelectionWidget = ({ hostElement }) => {
  const [pillPosition, setPillPosition] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCoachMark, setShowCoachMark] = useState(false);

  const dismiss = useCallback(() => {
    setPillPosition(null);
    setExpanded(false);
    setResult(null);
    setError(null);
  }, []);

  const performSearch = useCallback(async (word) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchService.searchDictionary(word);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof NotFoundError
          ? { type: 'not_found', message: err.message, word }
          : { type: 'network', message: err.message },
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSelectionInfo = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (
        !text ||
        selection.isCollapsed ||
        text.length > MAX_SELECTION_LENGTH
      ) {
        return null;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return null;
      return { text, rect };
    };

    const handleMouseUp = async (event) => {
      // composedPath() sees inside the shadow root, unlike the retargeted event.target
      if (event.composedPath().includes(hostElement)) return;

      let instantEnabled;
      try {
        instantEnabled = await isInstantLookupEnabled();
      } catch (err) {
        console.error('Lexicon: could not read instant-lookup setting:', err);
        instantEnabled = false;
      }

      // Opt-in: any selection (drag, double/triple-click, keyboard) jumps
      // straight to the result, skipping the pill entirely.
      if (instantEnabled) {
        const selectionInfo = getSelectionInfo();
        if (!selectionInfo) {
          dismiss();
          return;
        }
        setSelectedText(selectionInfo.text);
        setPillPosition(clampToViewport(selectionInfo.rect));
        setExpanded(true);
        performSearch(selectionInfo.text);
        return;
      }

      let pillEnabled;
      try {
        pillEnabled = await isPillEnabled();
      } catch (err) {
        console.error('Lexicon: could not read selection-pill setting:', err);
        return;
      }
      if (!pillEnabled) return;

      const selectionInfo = getSelectionInfo();
      if (!selectionInfo) {
        dismiss();
        return;
      }

      setSelectedText(selectionInfo.text);
      setExpanded(false);
      setResult(null);
      setError(null);
      setPillPosition(clampToViewport(selectionInfo.rect));

      storage.getItem(COACH_MARK_KEY).then((seen) => {
        if (!seen) {
          setShowCoachMark(true);
          storage.setItem(COACH_MARK_KEY, true);
        }
      });
    };

    // Independent of selection state on purpose — some sites preventDefault()
    // on their own click handlers, which suppresses the browser's default
    // "click collapses any selection" behavior, so relying on getSelection()
    // alone to detect "clicked away" isn't reliable across arbitrary pages.
    const handleClickOutside = (event) => {
      if (!event.composedPath().includes(hostElement)) dismiss();
    };

    const handleScroll = () => dismiss();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hostElement, dismiss, performSearch]);

  const handlePillClick = () => {
    setExpanded(true);
    performSearch(selectedText);
  };

  if (!pillPosition) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: pillPosition.top,
        left: pillPosition.left,
      }}
      className='animate-fade-in'
    >
      {!expanded ? (
        <button
          onClick={handlePillClick}
          title='Look up in Lexicon'
          className={`classic-box flex items-center gap-1.5 bg-indigo-600 classic:bg-[var(--classic-accent)] text-white classic:text-[var(--classic-panel)] text-xs font-medium rounded-full classic:rounded-none shadow-elevated hover:bg-indigo-700 classic:hover:bg-[var(--classic-accent)] classic:hover:opacity-90 transition-colors ${
            showCoachMark ? 'px-3 py-1.5' : 'w-8 h-8 justify-center'
          }`}
        >
          <svg
            className='w-3.5 h-3.5 shrink-0'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d={LOGO_ICON_PATH}
            />
          </svg>
          {showCoachMark && 'Lookup'}
        </button>
      ) : (
        <div className='relative'>
          <div className='classic-panel w-80 max-h-96 overflow-y-auto rounded-lg shadow-elevated bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2'>
            <button
              onClick={dismiss}
              title='Close'
              className='absolute top-1.5 right-1.5 z-10 text-gray-400 dark:text-gray-500 classic:text-[var(--classic-ink)] hover:text-gray-700 dark:hover:text-gray-300 classic:hover:text-[var(--classic-accent)] transition-colors'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <div className='space-y-2'>
              {isLoading && (
                <div className='text-center text-sm text-gray-500 dark:text-gray-400 p-2'>
                  Searching…
                </div>
              )}
              {error && (
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300 classic:text-[var(--classic-ink)] p-2'>
                    {error.type === 'not_found'
                      ? `"${error.word}" not found`
                      : 'Connection error — check your internet connection'}
                  </p>
                  {error.type === 'not_found' && <AskAI word={error.word} />}
                </div>
              )}
              {!isLoading && !error && result && (
                <DefinitionCard result={result} compact />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionWidget;
