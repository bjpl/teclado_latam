/**
 * @file useSessionHistory.ts
 * @description Session history management hook for Teclado LATAM.
 *
 * REWRITTEN: Simplified architecture with single source of truth.
 * - totalSessionsEver: The ONLY count that matters, persisted separately
 * - sessions: Array of recent sessions (max 100, oldest trimmed)
 * - statistics: Calculated from stored sessions for averages/trends
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  /** Count of sessions in storage (max 100) - use for averages/trends */
  storedSessionCount: number;
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
  /** Total sessions ever completed - THE primary count to display */
  totalSessionsEver: number;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'teclado-session-history';
const COUNTER_KEY = 'teclado-total-sessions-count';
const MAX_STORED_SESSIONS = 100;

// =============================================================================
// Storage Functions (Direct localStorage access)
// =============================================================================

function readSessions(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: SessionRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('[SessionHistory] Failed to write sessions:', e);
  }
}

function readCounter(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    if (!raw) return 0;
    const num = parseInt(raw, 10);
    return isNaN(num) || num < 0 ? 0 : num;
  } catch {
    return 0;
  }
}

function writeCounter(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COUNTER_KEY, String(Math.max(0, count)));
  } catch (e) {
    console.error('[SessionHistory] Failed to write counter:', e);
  }
}

// =============================================================================
// Statistics Calculator
// =============================================================================

function calculateStatistics(sessions: SessionRecord[]): SessionStatistics {
  const empty: SessionStatistics = {
    storedSessionCount: 0,
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

  if (sessions.length === 0) return empty;

  const count = sessions.length;
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalCharacters = sessions.reduce((sum, s) => sum + s.textLength, 0);

  const wpms = sessions.map((s) => s.wpm.netWPM);
  const accuracies = sessions.map((s) => s.accuracy);

  const averageWpm = Math.round((wpms.reduce((a, b) => a + b, 0) / count) * 10) / 10;
  const bestWpm = Math.max(...wpms);
  const worstWpm = Math.min(...wpms);

  const averageAccuracy = Math.round((accuracies.reduce((a, b) => a + b, 0) / count) * 10) / 10;
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

  // Calculate trends (newer vs older half)
  let wpmTrend = 0;
  let accuracyTrend = 0;

  if (count >= 4) {
    const midpoint = Math.floor(count / 2);
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
    storedSessionCount: count,
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
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [totalSessionsEver, setTotalSessionsEver] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedSessions = readSessions();
    let storedCounter = readCounter();

    // Sanity check: detect corrupted counter using total typing time
    // Calculate max possible sessions based on total time (minimum 5 sec per session)
    const totalTimeMs = storedSessions.reduce((sum, s) => sum + s.duration, 0);
    const MIN_SESSION_MS = 5000; // 5 seconds minimum per session
    const maxPossibleSessions = Math.max(
      storedSessions.length,
      Math.ceil(totalTimeMs / MIN_SESSION_MS) + storedSessions.length
    );

    if (storedCounter > maxPossibleSessions) {
      console.warn(
        `[SessionHistory] Corrupted counter: ${storedCounter} exceeds max possible ${maxPossibleSessions} ` +
        `(${storedSessions.length} sessions, ${Math.round(totalTimeMs / 1000)}s total). Resetting.`
      );
      storedCounter = storedSessions.length;
      writeCounter(storedCounter);
    }

    // Sync counter with sessions if needed (counter should be >= sessions.length)
    const syncedCounter = Math.max(storedCounter, storedSessions.length);
    if (syncedCounter !== storedCounter) {
      writeCounter(syncedCounter);
    }

    setSessions(storedSessions);
    setTotalSessionsEver(syncedCounter);
    setIsLoaded(true);
  }, []);

  // Add a new session
  const addSession = useCallback((session: Omit<SessionRecord, 'id'>): string => {
    // Read fresh from localStorage to avoid stale closure issues
    const currentSessions = readSessions();
    const currentCounter = readCounter();

    // Defense-in-depth: Detect and reject duplicate rapid-fire additions
    // If the most recent session has identical text and was added within 2 seconds,
    // it's almost certainly a duplicate call from React re-renders
    const mostRecent = currentSessions[0];
    if (mostRecent) {
      const timeSinceLastSession = Date.now() - mostRecent.endTime;
      const sameText = mostRecent.text === session.text;
      const rapidFire = timeSinceLastSession < 2000; // 2 seconds threshold

      if (sameText && rapidFire) {
        console.warn(
          `[SessionHistory] Rejected duplicate session: same text added ${timeSinceLastSession}ms ago`
        );
        return mostRecent.id; // Return existing ID, don't add duplicate
      }
    }

    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSession: SessionRecord = { ...session, id };

    // Add new session at the beginning, trim if over limit
    const updatedSessions = [newSession, ...currentSessions].slice(0, MAX_STORED_SESSIONS);
    const newCounter = currentCounter + 1;

    // Write to localStorage immediately
    writeSessions(updatedSessions);
    writeCounter(newCounter);

    // Update state
    setSessions(updatedSessions);
    setTotalSessionsEver(newCounter);

    return id;
  }, []);

  // Remove a session by ID
  const removeSession = useCallback((id: string): void => {
    const currentSessions = readSessions();
    const updatedSessions = currentSessions.filter((s) => s.id !== id);

    writeSessions(updatedSessions);
    setSessions(updatedSessions);
    // Note: We don't decrement the counter - it tracks "ever completed"
  }, []);

  // Clear all history and reset counter
  const clearHistory = useCallback((): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COUNTER_KEY);
    }
    setSessions([]);
    setTotalSessionsEver(0);
  }, []);

  // Get a session by ID
  const getSession = useCallback(
    (id: string): SessionRecord | undefined => sessions.find((s) => s.id === id),
    [sessions]
  );

  // Filter sessions
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

  // Get statistics for given sessions
  const getStatistics = useCallback(
    (targetSessions: SessionRecord[] = sessions): SessionStatistics =>
      calculateStatistics(targetSessions),
    [sessions]
  );

  // Update session label
  const updateSessionLabel = useCallback((id: string, label: string): void => {
    const currentSessions = readSessions();
    const updatedSessions = currentSessions.map((s) =>
      s.id === id ? { ...s, label } : s
    );
    writeSessions(updatedSessions);
    setSessions(updatedSessions);
  }, []);

  // Derived values
  const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);

  const bestSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.reduce((best, current) =>
      current.wpm.netWPM > best.wpm.netWPM ? current : best
    );
  }, [sessions]);

  const statistics = useMemo(() => calculateStatistics(sessions), [sessions]);

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
    totalSessionsEver,
  };
}
