/**
 * @file useMetrics.ts
 * @description Real-time metrics calculation hook for Teclado LATAM.
 *
 * Calculates WPM, accuracy, and other metrics in real-time during typing sessions.
 * Updates on a configurable interval (default 500ms).
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 * @see docs/sparc/03-pseudocode.md - Metrics calculation
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SessionState, CharacterResult } from '@/lib/typing-engine/types';
import type {
  WPMResult,
  AccuracyResult,
  CharacterAttempts,
  CharacterTracker,
  Keystroke,
} from '@/lib/metrics/types';
import {
  calculateWPM,
  calculateRollingWPM,
  calculateAccuracy,
  ROLLING_WPM_WINDOW_MS,
} from '@/lib/metrics/metrics';

/**
 * Hook options
 */
export interface UseMetricsOptions {
  /** Update interval in milliseconds (default: 500) */
  updateInterval?: number;
  /** Rolling WPM window size in milliseconds (default: 30000) */
  rollingWindowMs?: number;
  /** Whether to calculate rolling WPM (default: true) */
  calculateRolling?: boolean;
}

/**
 * Metrics snapshot
 */
export interface MetricsSnapshot {
  /** Words per minute */
  wpm: WPMResult;
  /** Rolling WPM (over last N seconds) */
  rollingWpm: WPMResult;
  /** Overall accuracy percentage (0-100) */
  accuracy: number;
  /** Detailed accuracy metrics */
  accuracyDetails: AccuracyResult;
  /** Total errors */
  errors: number;
  /** Corrected errors */
  correctedErrors: number;
  /** Elapsed time in milliseconds */
  elapsedTime: number;
  /** Total characters typed */
  totalCharacters: number;
  /** Characters remaining */
  remainingCharacters: number;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Return type for useMetrics hook
 */
export interface UseMetricsReturn extends MetricsSnapshot {
  /** Record a keystroke */
  recordKeystroke: (character: string, isCorrect: boolean) => void;
  /** Start metrics tracking */
  start: () => void;
  /** Pause metrics tracking */
  pause: () => void;
  /** Resume metrics tracking */
  resume: () => void;
  /** Reset all metrics */
  reset: () => void;
  /** Get final metrics snapshot */
  getSnapshot: () => MetricsSnapshot;
  /** Whether metrics are currently being tracked */
  isActive: boolean;
}

/**
 * Initial WPM result
 */
const INITIAL_WPM: WPMResult = { grossWPM: 0, netWPM: 0, cpm: 0 };

/**
 * Initial accuracy result
 */
const INITIAL_ACCURACY: AccuracyResult = {
  overall: 100,
  perCharacter: new Map(),
  problematicChars: [],
  mostMissed: [],
};

/**
 * Initial character tracker
 */
const INITIAL_TRACKER: CharacterTracker = {
  attempts: new Map(),
  totalCorrect: 0,
  totalAttempts: 0,
};

/**
 * Custom hook for real-time metrics calculation
 *
 * @param session - Current typing session state (optional for standalone use)
 * @param options - Configuration options
 * @returns Metrics state and controls
 *
 * @example
 * ```tsx
 * // With session state
 * const metrics = useMetrics(session, { updateInterval: 500 });
 *
 * // Standalone
 * const metrics = useMetrics();
 * metrics.start();
 * metrics.recordKeystroke('a', true);
 *
 * return (
 *   <div>
 *     <span>WPM: {metrics.wpm.netWPM}</span>
 *     <span>Accuracy: {metrics.accuracy}%</span>
 *   </div>
 * );
 * ```
 */
export function useMetrics(
  session?: SessionState | null,
  options: UseMetricsOptions = {}
): UseMetricsReturn {
  const {
    updateInterval = 500,
    rollingWindowMs = ROLLING_WPM_WINDOW_MS,
    calculateRolling = true,
  } = options;

  // Core state
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Keystroke tracking
  const keystrokesRef = useRef<Keystroke[]>([]);
  const characterTrackerRef = useRef<CharacterTracker>(INITIAL_TRACKER);

  // Metrics state
  const [wpm, setWpm] = useState<WPMResult>(INITIAL_WPM);
  const [rollingWpm, setRollingWpm] = useState<WPMResult>(INITIAL_WPM);
  const [accuracy, setAccuracy] = useState(100);
  const [accuracyDetails, setAccuracyDetails] = useState<AccuracyResult>(INITIAL_ACCURACY);
  const [errors, setErrors] = useState(0);
  const [correctedErrors, setCorrectedErrors] = useState(0);

  /**
   * Calculate metrics from current state
   */
  const calculateMetrics = useCallback(() => {
    const now = performance.now();
    const tracker = characterTrackerRef.current;
    const keystrokes = keystrokesRef.current;

    // Calculate elapsed time
    let elapsed = 0;
    if (startTime !== null) {
      const pauseOffset = pauseTime !== null ? now - pauseTime : 0;
      elapsed = now - startTime - totalPausedTime - pauseOffset;
    }
    setElapsedTime(elapsed);

    // Calculate WPM
    const totalChars = tracker.totalAttempts;
    const errorCount = tracker.totalAttempts - tracker.totalCorrect;
    const wpmResult = calculateWPM(totalChars, errorCount, elapsed);
    setWpm(wpmResult);

    // Calculate rolling WPM
    if (calculateRolling && keystrokes.length >= 2) {
      const rollingResult = calculateRollingWPM(keystrokes, rollingWindowMs, now);
      setRollingWpm(rollingResult);
    }

    // Calculate accuracy
    const accResult = calculateAccuracy(
      tracker.totalCorrect,
      tracker.totalAttempts,
      tracker.attempts
    );
    setAccuracy(accResult.overall);
    setAccuracyDetails(accResult);
    setErrors(tracker.totalAttempts - tracker.totalCorrect);
  }, [startTime, pauseTime, totalPausedTime, calculateRolling, rollingWindowMs]);

  /**
   * Update timer interval
   */
  useEffect(() => {
    if (!isActive || pauseTime !== null) {
      return;
    }

    const interval = setInterval(calculateMetrics, updateInterval);
    return () => clearInterval(interval);
  }, [isActive, pauseTime, updateInterval, calculateMetrics]);

  /**
   * Sync with session state if provided
   */
  useEffect(() => {
    if (!session) {
      return;
    }

    // Start tracking when session starts
    if (session.isStarted && !isActive) {
      setIsActive(true);
      setStartTime(session.startTime ?? performance.now());
    }

    // Pause/resume based on session state
    if (session.isPaused && pauseTime === null) {
      setPauseTime(performance.now());
    } else if (!session.isPaused && pauseTime !== null) {
      setTotalPausedTime((prev) => prev + (performance.now() - pauseTime));
      setPauseTime(null);
    }

    // Calculate metrics from session characters
    if (session.characters.length > 0) {
      const tracker: CharacterTracker = {
        attempts: new Map(),
        totalCorrect: 0,
        totalAttempts: 0,
      };

      let corrected = 0;

      for (const char of session.characters) {
        if (char.state === 'correct' || char.state === 'incorrect' || char.state === 'corrected') {
          tracker.totalAttempts++;

          if (char.state === 'correct') {
            tracker.totalCorrect++;
          }

          if (char.state === 'corrected') {
            corrected++;
          }

          // Track per-character attempts
          const existing = tracker.attempts.get(char.expected) ?? { correct: 0, total: 0 };
          tracker.attempts.set(char.expected, {
            correct: existing.correct + (char.state === 'correct' ? 1 : 0),
            total: existing.total + 1,
          });
        }
      }

      characterTrackerRef.current = tracker;
      setCorrectedErrors(corrected);
      calculateMetrics();
    }
  }, [session, isActive, pauseTime, calculateMetrics]);

  /**
   * Record a keystroke
   */
  const recordKeystroke = useCallback((character: string, isCorrect: boolean) => {
    const timestamp = performance.now();

    // Add to keystrokes array
    keystrokesRef.current.push({
      timestamp,
      isCorrect,
      character,
    });

    // Update character tracker
    const tracker = characterTrackerRef.current;
    const existing = tracker.attempts.get(character) ?? { correct: 0, total: 0 };

    characterTrackerRef.current = {
      attempts: new Map(tracker.attempts).set(character, {
        correct: existing.correct + (isCorrect ? 1 : 0),
        total: existing.total + 1,
      }),
      totalCorrect: tracker.totalCorrect + (isCorrect ? 1 : 0),
      totalAttempts: tracker.totalAttempts + 1,
    };

    // Immediate recalculation
    calculateMetrics();
  }, [calculateMetrics]);

  /**
   * Start metrics tracking
   */
  const start = useCallback(() => {
    setIsActive(true);
    setStartTime(performance.now());
    setPauseTime(null);
    setTotalPausedTime(0);
  }, []);

  /**
   * Pause metrics tracking
   */
  const pause = useCallback(() => {
    if (isActive && pauseTime === null) {
      setPauseTime(performance.now());
    }
  }, [isActive, pauseTime]);

  /**
   * Resume metrics tracking
   */
  const resume = useCallback(() => {
    if (pauseTime !== null) {
      setTotalPausedTime((prev) => prev + (performance.now() - pauseTime));
      setPauseTime(null);
    }
  }, [pauseTime]);

  /**
   * Reset all metrics
   */
  const reset = useCallback(() => {
    setIsActive(false);
    setStartTime(null);
    setPauseTime(null);
    setTotalPausedTime(0);
    setElapsedTime(0);
    setWpm(INITIAL_WPM);
    setRollingWpm(INITIAL_WPM);
    setAccuracy(100);
    setAccuracyDetails(INITIAL_ACCURACY);
    setErrors(0);
    setCorrectedErrors(0);
    keystrokesRef.current = [];
    characterTrackerRef.current = INITIAL_TRACKER;
  }, []);

  // Calculate derived values
  const totalCharacters = characterTrackerRef.current.totalAttempts;
  const textLength = session?.text.length ?? totalCharacters;
  const remainingCharacters = Math.max(0, textLength - (session?.currentIndex ?? totalCharacters));
  const progress = textLength > 0 ? Math.round(((session?.currentIndex ?? totalCharacters) / textLength) * 100) : 0;

  /**
   * Get a snapshot of current metrics
   */
  const getSnapshot = useCallback((): MetricsSnapshot => {
    return {
      wpm,
      rollingWpm,
      accuracy,
      accuracyDetails,
      errors,
      correctedErrors,
      elapsedTime,
      totalCharacters,
      remainingCharacters,
      progress,
    };
  }, [wpm, rollingWpm, accuracy, accuracyDetails, errors, correctedErrors, elapsedTime, totalCharacters, remainingCharacters, progress]);

  return {
    wpm,
    rollingWpm,
    accuracy,
    accuracyDetails,
    errors,
    correctedErrors,
    elapsedTime,
    totalCharacters,
    remainingCharacters,
    progress,
    recordKeystroke,
    start,
    pause,
    resume,
    reset,
    getSnapshot,
    isActive,
  };
}
