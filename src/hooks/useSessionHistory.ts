/**
 * @file useSessionHistory.ts
 * @description Session history management hook for Teclado LATAM.
 *
 * Stores completed sessions in localStorage (with IndexedDB as future enhancement).
 * Provides retrieval, filtering, and statistics for past sessions.
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';
import type { WPMResult, AccuracyResult } from '@/lib/metrics/types';

/**
 * Stored session record
 */
export interface SessionRecord {
  /** Unique session ID */
  id: string;
  /** Timestamp when session started */
  startTime: number;
  /** Timestamp when session ended */
  endTime: number;
  /** Duration in milliseconds */
  duration: number;
  /** Text that was typed */
  text: string;
  /** Text length */
  textLength: number;
  /** WPM metrics */
  wpm: WPMResult;
  /** Overall accuracy percentage */
  accuracy: number;
  /** Total errors */
  errors: number;
  /** Corrected errors */
  correctedErrors: number;
  /** Typing mode used */
  mode: 'strict' | 'lenient' | 'no-backspace';
  /** Characters that had errors */
  problematicChars: string[];
  /** Optional session name/label */
  label?: string;
}

/**
 * Session filter options
 */
export interface SessionFilter {
  /** Start date */
  fromDate?: Date;
  /** End date */
  toDate?: Date;
  /** Minimum WPM */
  minWpm?: number;
  /** Maximum WPM */
  maxWpm?: number;
  /** Minimum accuracy */
  minAccuracy?: number;
  /** Typing mode */
  mode?: 'strict' | 'lenient' | 'no-backspace';
  /** Text search */
  textSearch?: string;
}

/**
 * Session statistics
 */
export interface SessionStatistics {
  /** Total sessions */
  totalSessions: number;
  /** Total time spent typing (ms) */
  totalTime: number;
  /** Total characters typed */
  totalCharacters: number;
  /** Average WPM across all sessions */
  averageWpm: number;
  /** Best WPM achieved */
  bestWpm: number;
  /** Worst WPM */
  worstWpm: number;
  /** Average accuracy */
  averageAccuracy: number;
  /** Best accuracy */
  bestAccuracy: number;
  /** Most problematic characters */
  mostProblematicChars: string[];
  /** WPM trend (positive = improving) */
  wpmTrend: number;
  /** Accuracy trend (positive = improving) */
  accuracyTrend: number;
}

/**
 * Return type for useSessionHistory hook
 */
export interface UseSessionHistoryReturn {
  /** All stored sessions */
  sessions: SessionRecord[];
  /** Whether sessions are loaded */
  isLoaded: boolean;
  /** Add a new session */
  addSession: (session: Omit<SessionRecord, 'id'>) => string;
  /** Remove a session by ID */
  removeSession: (id: string) => void;
  /** Clear all session history */
  clearHistory: () => void;
  /** Get a session by ID */
  getSession: (id: string) => SessionRecord | undefined;
  /** Filter sessions */
  filterSessions: (filter: SessionFilter) => SessionRecord[];
  /** Get session statistics */
  getStatistics: (sessions?: SessionRecord[]) => SessionStatistics;
  /** Update session label */
  updateSessionLabel: (id: string, label: string) => void;
  /** Get recent sessions */
  recentSessions: SessionRecord[];
  /** Get best session by WPM */
  bestSession: SessionRecord | null;
  /** Overall statistics */
  statistics: SessionStatistics;
}

/**
 * Maximum sessions to store
 */
const MAX_SESSIONS = 100;

/**
 * Generate unique ID
 */
function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Custom hook for session history management
 *
 * @returns Session history state and controls
 *
 * @example
 * ```tsx
 * const {
 *   sessions,
 *   addSession,
 *   statistics,
 *   recentSessions,
 *   clearHistory,
 * } = useSessionHistory();
 *
 * // Add completed session
 * const handleSessionComplete = (metrics: SessionMetrics) => {
 *   addSession({
 *     startTime: session.startTime,
 *     endTime: Date.now(),
 *     duration: metrics.elapsedTime,
 *     text: session.text,
 *     textLength: session.text.length,
 *     wpm: metrics.wpm,
 *     accuracy: metrics.accuracy,
 *     errors: metrics.errors,
 *     correctedErrors: metrics.correctedErrors,
 *     mode: session.mode,
 *     problematicChars: metrics.accuracyDetails.problematicChars,
 *   });
 * };
 *
 * // Display statistics
 * <p>Average WPM: {statistics.averageWpm}</p>
 * <p>Sessions completed: {statistics.totalSessions}</p>
 * ```
 */
export function useSessionHistory(): UseSessionHistoryReturn {
  const [sessions, setSessions] = useLocalStorage<SessionRecord[]>(
    STORAGE_KEYS.SESSION_HISTORY,
    []
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Mark as loaded after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  /**
   * Add a new session
   */
  const addSession = useCallback(
    (session: Omit<SessionRecord, 'id'>): string => {
      const id = generateId();
      const newSession: SessionRecord = { ...session, id };

      setSessions((prev) => {
        const updated = [newSession, ...prev];
        // Limit to max sessions
        if (updated.length > MAX_SESSIONS) {
          return updated.slice(0, MAX_SESSIONS);
        }
        return updated;
      });

      return id;
    },
    [setSessions]
  );

  /**
   * Remove a session by ID
   */
  const removeSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setSessions]
  );

  /**
   * Clear all session history
   */
  const clearHistory = useCallback(() => {
    setSessions([]);
  }, [setSessions]);

  /**
   * Get a session by ID
   */
  const getSession = useCallback(
    (id: string): SessionRecord | undefined => {
      return sessions.find((s) => s.id === id);
    },
    [sessions]
  );

  /**
   * Filter sessions
   */
  const filterSessions = useCallback(
    (filter: SessionFilter): SessionRecord[] => {
      return sessions.filter((session) => {
        if (filter.fromDate && session.startTime < filter.fromDate.getTime()) {
          return false;
        }
        if (filter.toDate && session.startTime > filter.toDate.getTime()) {
          return false;
        }
        if (filter.minWpm !== undefined && session.wpm.netWPM < filter.minWpm) {
          return false;
        }
        if (filter.maxWpm !== undefined && session.wpm.netWPM > filter.maxWpm) {
          return false;
        }
        if (filter.minAccuracy !== undefined && session.accuracy < filter.minAccuracy) {
          return false;
        }
        if (filter.mode && session.mode !== filter.mode) {
          return false;
        }
        if (filter.textSearch && !session.text.toLowerCase().includes(filter.textSearch.toLowerCase())) {
          return false;
        }
        return true;
      });
    },
    [sessions]
  );

  /**
   * Calculate statistics for a set of sessions
   */
  const getStatistics = useCallback(
    (targetSessions: SessionRecord[] = sessions): SessionStatistics => {
      if (targetSessions.length === 0) {
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

      const totalSessions = targetSessions.length;
      const totalTime = targetSessions.reduce((sum, s) => sum + s.duration, 0);
      const totalCharacters = targetSessions.reduce((sum, s) => sum + s.textLength, 0);

      const wpms = targetSessions.map((s) => s.wpm.netWPM);
      const accuracies = targetSessions.map((s) => s.accuracy);

      const averageWpm = Math.round((wpms.reduce((a, b) => a + b, 0) / totalSessions) * 10) / 10;
      const bestWpm = Math.max(...wpms);
      const worstWpm = Math.min(...wpms);

      const averageAccuracy = Math.round((accuracies.reduce((a, b) => a + b, 0) / totalSessions) * 10) / 10;
      const bestAccuracy = Math.max(...accuracies);

      // Count problematic characters across all sessions
      const charCounts = new Map<string, number>();
      for (const session of targetSessions) {
        for (const char of session.problematicChars) {
          charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
        }
      }
      const mostProblematicChars = Array.from(charCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([char]) => char);

      // Calculate trends (compare first half to second half)
      let wpmTrend = 0;
      let accuracyTrend = 0;

      if (totalSessions >= 4) {
        const midpoint = Math.floor(totalSessions / 2);
        const olderSessions = targetSessions.slice(midpoint);
        const newerSessions = targetSessions.slice(0, midpoint);

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
    },
    [sessions]
  );

  /**
   * Update session label
   */
  const updateSessionLabel = useCallback(
    (id: string, label: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, label } : s))
      );
    },
    [setSessions]
  );

  // Recent sessions (last 5)
  const recentSessions = useMemo(
    () => sessions.slice(0, 5),
    [sessions]
  );

  // Best session by WPM
  const bestSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.reduce((best, current) =>
      current.wpm.netWPM > best.wpm.netWPM ? current : best
    );
  }, [sessions]);

  // Overall statistics
  const statistics = useMemo(
    () => getStatistics(sessions),
    [sessions, getStatistics]
  );

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
