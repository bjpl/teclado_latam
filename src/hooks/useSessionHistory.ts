/**
 * @file useSessionHistory.ts
 * @description Session history management hook for Teclado LATAM.
 *
 * REBUILT: Direct localStorage access for reliability.
 * No abstraction layers - explicit reads and writes.
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { WPMResult } from '@/lib/metrics/types';

// =============================================================================
// Types
// =============================================================================

export interface SessionRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  textLength: number;
  wpm: WPMResult;
  accuracy: number;
  errors: number;
  correctedErrors: number;
  mode: 'strict' | 'lenient' | 'no-backspace';
  problematicChars: string[];
  label?: string;
}

export interface SessionFilter {
  fromDate?: Date;
  toDate?: Date;
  minWpm?: number;
  maxWpm?: number;
  minAccuracy?: number;
  mode?: 'strict' | 'lenient' | 'no-backspace';
  textSearch?: string;
}

export interface SessionStatistics {
  totalSessions: number;
  totalTime: number;
  totalCharacters: number;
  averageWpm: number;
  bestWpm: number;
  worstWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  mostProblematicChars: string[];
  wpmTrend: number;
  accuracyTrend: number;
}

export interface UseSessionHistoryReturn {
  sessions: SessionRecord[];
  isLoaded: boolean;
  addSession: (session: Omit<SessionRecord, 'id'>) => string;
  removeSession: (id: string) => void;
  clearHistory: () => void;
  getSession: (id: string) => SessionRecord | undefined;
  filterSessions: (filter: SessionFilter) => SessionRecord[];
  getStatistics: (sessions?: SessionRecord[]) => SessionStatistics;
  updateSessionLabel: (id: string, label: string) => void;
  recentSessions: SessionRecord[];
  bestSession: SessionRecord | null;
  statistics: SessionStatistics;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'teclado-session-history';
const MAX_SESSIONS = 100;

// =============================================================================
// Helpers
// =============================================================================

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Read sessions directly from localStorage
 */
function readFromStorage(): SessionRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid session data in localStorage, resetting');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (error) {
    console.warn('Error reading sessions from localStorage:', error);
    return [];
  }
}

/**
 * Write sessions directly to localStorage
 */
function writeToStorage(sessions: SessionRecord[]): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.warn('Error writing sessions to localStorage:', error);
  }
}

/**
 * Calculate empty statistics
 */
function emptyStats(): SessionStatistics {
  return {
    totalSessions: 0,
    totalTime: 0,
    totalCharacters: 0,
    averageWpm: 0,
    bestWpm: 0,
    worstWpm: 0,
    averageAccuracy: 100,
    bestAccuracy: 100,
    mostProblematicChars: [],
    wpmTrend: 0,
    accuracyTrend: 0,
  };
}

/**
 * Calculate statistics from sessions
 */
function calculateStats(sessions: SessionRecord[]): SessionStatistics {
  if (sessions.length === 0) return emptyStats();

  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalCharacters = sessions.reduce((sum, s) => sum + s.textLength, 0);

  const wpms = sessions.map((s) => s.wpm.netWPM);
  const accuracies = sessions.map((s) => s.accuracy);

  const averageWpm = Math.round((wpms.reduce((a, b) => a + b, 0) / totalSessions) * 10) / 10;
  const bestWpm = Math.max(...wpms);
  const worstWpm = Math.min(...wpms);

  const averageAccuracy = Math.round((accuracies.reduce((a, b) => a + b, 0) / totalSessions) * 10) / 10;
  const bestAccuracy = Math.max(...accuracies);

  // Count problematic characters
  const charCounts = new Map<string, number>();
  for (const session of sessions) {
    for (const char of session.problematicChars) {
      charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
    }
  }
  const mostProblematicChars = Array.from(charCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([char]) => char);

  // Calculate trends
  let wpmTrend = 0;
  let accuracyTrend = 0;

  if (totalSessions >= 4) {
    const midpoint = Math.floor(totalSessions / 2);
    const olderSessions = sessions.slice(midpoint);
    const newerSessions = sessions.slice(0, midpoint);

    const olderWpm = olderSessions.reduce((sum, s) => sum + s.wpm.netWPM, 0) / olderSessions.length;
    const newerWpm = newerSessions.reduce((sum, s) => sum + s.wpm.netWPM, 0) / newerSessions.length;
    wpmTrend = Math.round((newerWpm - olderWpm) * 10) / 10;

    const olderAccuracy = olderSessions.reduce((sum, s) => sum + s.accuracy, 0) / olderSessions.length;
    const newerAccuracy = newerSessions.reduce((sum, s) => sum + s.accuracy, 0) / newerSessions.length;
    accuracyTrend = Math.round((newerAccuracy - olderAccuracy) * 10) / 10;
  }

  return {
    totalSessions,
    totalTime,
    totalCharacters,
    averageWpm,
    bestWpm,
    worstWpm,
    averageAccuracy,
    bestAccuracy,
    mostProblematicChars,
    wpmTrend,
    accuracyTrend,
  };
}

// =============================================================================
// Hook
// =============================================================================

export function useSessionHistory(): UseSessionHistoryReturn {
  // State: sessions array and loaded flag
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ref to track if we've done initial load
  const initialLoadDone = useRef(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const stored = readFromStorage();
    setSessions(stored);
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever sessions change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    writeToStorage(sessions);
  }, [sessions, isLoaded]);

  /**
   * Add a new session
   */
  const addSession = useCallback((session: Omit<SessionRecord, 'id'>): string => {
    const id = generateId();
    const newSession: SessionRecord = { ...session, id };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      return updated.length > MAX_SESSIONS ? updated.slice(0, MAX_SESSIONS) : updated;
    });

    return id;
  }, []);

  /**
   * Remove a session by ID
   */
  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /**
   * Clear all session history
   */
  const clearHistory = useCallback(() => {
    // Clear state
    setSessions([]);

    // Force clear localStorage directly
    if (isBrowser()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /**
   * Get a session by ID
   */
  const getSession = useCallback(
    (id: string): SessionRecord | undefined => sessions.find((s) => s.id === id),
    [sessions]
  );

  /**
   * Filter sessions
   */
  const filterSessions = useCallback(
    (filter: SessionFilter): SessionRecord[] => {
      return sessions.filter((session) => {
        if (filter.fromDate && session.startTime < filter.fromDate.getTime()) return false;
        if (filter.toDate && session.startTime > filter.toDate.getTime()) return false;
        if (filter.minWpm !== undefined && session.wpm.netWPM < filter.minWpm) return false;
        if (filter.maxWpm !== undefined && session.wpm.netWPM > filter.maxWpm) return false;
        if (filter.minAccuracy !== undefined && session.accuracy < filter.minAccuracy) return false;
        if (filter.mode && session.mode !== filter.mode) return false;
        if (filter.textSearch && !session.text.toLowerCase().includes(filter.textSearch.toLowerCase())) return false;
        return true;
      });
    },
    [sessions]
  );

  /**
   * Get statistics for given sessions (or all if not specified)
   */
  const getStatistics = useCallback(
    (targetSessions: SessionRecord[] = sessions): SessionStatistics => calculateStats(targetSessions),
    [sessions]
  );

  /**
   * Update session label
   */
  const updateSessionLabel = useCallback((id: string, label: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  }, []);

  // Derived values
  const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);

  const bestSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.reduce((best, current) =>
      current.wpm.netWPM > best.wpm.netWPM ? current : best
    );
  }, [sessions]);

  const statistics = useMemo(() => calculateStats(sessions), [sessions]);

  return {
    sessions,
    isLoaded,
    addSession,
    removeSession,
    clearHistory,
    getSession,
    filterSessions,
    getStatistics,
    updateSessionLabel,
    recentSessions,
    bestSession,
    statistics,
  };
}
