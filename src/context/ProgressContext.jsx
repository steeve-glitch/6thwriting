import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { progressService } from '../lib/supabaseClient';

const ProgressContext = createContext(null);

const TABS = ['scramble', 'reading', 'peel', 'expand'];
const BOOKS = ['bug-muldoon', 'number-the-stars', 'sticks-and-stones'];

export function ProgressProvider({ children, studentName }) {
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Load progress from Supabase on mount or when student name changes
  useEffect(() => {
    async function loadStudentProgress() {
      if (!studentName) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const savedProgress = await progressService.loadProgress(studentName);
      if (savedProgress) {
        setProgress(savedProgress);
        lastSavedRef.current = JSON.stringify(savedProgress);
      }
      setIsLoading(false);
    }

    loadStudentProgress();
  }, [studentName]);

  // Debounced save to Supabase
  const saveToSupabase = useCallback((newProgress) => {
    if (!studentName) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      const progressString = JSON.stringify(newProgress);
      // Only save if progress actually changed
      if (progressString !== lastSavedRef.current) {
        await progressService.saveProgress(studentName, newProgress);
        lastSavedRef.current = progressString;
      }
    }, 1000);
  }, [studentName]);

  // Mark a tab as complete for a book
  const markTabComplete = useCallback((bookId, tabId) => {
    setProgress(prev => {
      const bookProgress = prev[bookId] || {
        completedTabs: {},
        lastTab: tabId,
        lastVisit: new Date().toISOString()
      };

      const newProgress = {
        ...prev,
        [bookId]: {
          ...bookProgress,
          completedTabs: {
            ...bookProgress.completedTabs,
            [tabId]: true
          },
          lastTab: tabId,
          lastVisit: new Date().toISOString()
        }
      };

      saveToSupabase(newProgress);
      return newProgress;
    });
  }, [saveToSupabase]);

  // Update last visited tab (without marking complete)
  const setLastTab = useCallback((bookId, tabId) => {
    setProgress(prev => {
      const bookProgress = prev[bookId] || {
        completedTabs: {},
        lastTab: tabId,
        lastVisit: new Date().toISOString()
      };

      const newProgress = {
        ...prev,
        [bookId]: {
          ...bookProgress,
          lastTab: tabId,
          lastVisit: new Date().toISOString()
        }
      };

      saveToSupabase(newProgress);
      return newProgress;
    });
  }, [saveToSupabase]);

  // Get progress for a specific book
  const getBookProgress = useCallback((bookId) => {
    return progress[bookId] || {
      completedTabs: {},
      lastTab: null,
      lastVisit: null
    };
  }, [progress]);

  // Get completion percentage for a book (0-100)
  const getBookPercentage = useCallback((bookId) => {
    const bookProgress = progress[bookId];
    if (!bookProgress) return 0;

    const completedCount = Object.values(bookProgress.completedTabs).filter(Boolean).length;
    return Math.round((completedCount / TABS.length) * 100);
  }, [progress]);

  // Get the book and tab to continue from
  const getContinuePoint = useCallback(() => {
    let mostRecent = null;
    let mostRecentTime = null;

    for (const bookId of BOOKS) {
      const bookProgress = progress[bookId];
      if (bookProgress?.lastVisit) {
        const visitTime = new Date(bookProgress.lastVisit).getTime();
        if (!mostRecentTime || visitTime > mostRecentTime) {
          // Only suggest if not fully complete
          const completedCount = Object.values(bookProgress.completedTabs).filter(Boolean).length;
          if (completedCount < TABS.length) {
            mostRecent = { bookId, tabId: bookProgress.lastTab };
            mostRecentTime = visitTime;
          }
        }
      }
    }

    return mostRecent;
  }, [progress]);

  // Check if any progress exists
  const hasAnyProgress = useCallback(() => {
    return Object.keys(progress).length > 0;
  }, [progress]);

  // Check if a specific tab is complete
  const isTabComplete = useCallback((bookId, tabId) => {
    return progress[bookId]?.completedTabs?.[tabId] || false;
  }, [progress]);

  // Get the next incomplete tab for a book
  const getNextIncompleteTab = useCallback((bookId) => {
    const bookProgress = progress[bookId];
    for (const tabId of TABS) {
      if (!bookProgress?.completedTabs?.[tabId]) {
        return tabId;
      }
    }
    return null; // All complete
  }, [progress]);

  const value = {
    progress,
    isLoading,
    markTabComplete,
    setLastTab,
    getBookProgress,
    getBookPercentage,
    getContinuePoint,
    hasAnyProgress,
    isTabComplete,
    getNextIncompleteTab,
    TABS,
    BOOKS
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
