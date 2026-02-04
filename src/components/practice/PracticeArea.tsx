/**
 * @file PracticeArea.tsx
 * @description Container combining all practice components.
 *
 * Features:
 * - TextDisplay + CursorIndicator
 * - TextInput (hidden)
 * - SessionControls
 * - Manages session state
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 7 (Integration and Orchestration)
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { TextDisplay } from './TextDisplay';
import { TextInput, type TextInputRef } from './TextInput';
import { SessionControls, type SessionStatus } from './SessionControls';
import {
  createSession,
  processKeystroke,
  processBackspace,
} from '@/lib/typing-engine/typing-engine';
import type {
  SessionState,
  CharacterState,
  KeyboardEvent as TypingKeyboardEvent,
  DeadKeyState,
} from '@/lib/typing-engine/types';
import { useDeadKeys } from '@/hooks/useDeadKeys';

// =============================================================================
// Types
// =============================================================================

export interface PracticeAreaProps {
  /** Initial text to practice (optional) */
  initialText?: string;
  /** Callback when session completes - includes final metrics for reliability */
  onComplete?: (session: SessionState, finalMetrics: SessionMetrics) => void;
  /** Callback when metrics update */
  onMetricsUpdate?: (metrics: SessionMetrics) => void;
}

export interface SessionMetrics {
  /** Characters typed */
  charactersTyped: number;
  /** Correct characters */
  correctCharacters: number;
  /** Error count */
  errors: number;
  /** Elapsed time in ms */
  elapsedTime: number;
  /** Current WPM (estimated) */
  estimatedWPM: number;
  /** Accuracy percentage */
  accuracy: number;
}

// =============================================================================
// Constants
// =============================================================================

const METRICS_UPDATE_INTERVAL = 500; // Update metrics every 500ms

// =============================================================================
// Initial States
// =============================================================================

const initialDeadKeyState: DeadKeyState = {
  status: 'IDLE',
  type: null,
  pendingChar: null,
  timestamp: null,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map SessionState to SessionStatus for controls
 */
function getSessionStatus(state: SessionState | null): SessionStatus {
  if (!state) return 'idle';
  if (state.isComplete) return 'completed';
  if (state.isPaused) return 'paused';
  if (state.isStarted) return 'active';
  if (state.text) return 'ready';
  return 'idle';
}

/**
 * Calculate current metrics from session state
 * Uses endTime for completed sessions to freeze metrics
 */
function calculateMetrics(state: SessionState): SessionMetrics {
  const now = performance.now();
  const startTime = state.startTime ?? now;
  // Use endTime for completed sessions to freeze metrics, otherwise use current time
  const endPoint = state.isComplete && state.endTime ? state.endTime : now;
  const elapsedTime = state.isStarted
    ? endPoint - startTime - state.totalPausedTime
    : 0;

  const correctCharacters = state.characters.filter(
    (c) => c.state === 'correct' || c.state === 'corrected'
  ).length;

  const errors = state.characters.filter(
    (c) => c.state === 'incorrect'
  ).length;

  const charactersTyped = correctCharacters + errors;
  const accuracy =
    charactersTyped > 0 ? (correctCharacters / charactersTyped) * 100 : 100;

  // Estimate WPM: (characters / 5) / minutes
  const minutes = elapsedTime / 60000;
  const estimatedWPM =
    minutes > 0.01 ? Math.round((correctCharacters / 5) / minutes) : 0;

  return {
    charactersTyped,
    correctCharacters,
    errors,
    elapsedTime,
    estimatedWPM,
    accuracy: Math.round(accuracy * 10) / 10,
  };
}

/**
 * Build error map and corrected set from characters
 */
function buildErrorMaps(
  characters: SessionState['characters']
): { errorMap: Map<number, string>; correctedSet: Set<number> } {
  const errorMap = new Map<number, string>();
  const correctedSet = new Set<number>();

  for (const char of characters) {
    if (char.state === 'incorrect' && char.actual) {
      errorMap.set(char.index, char.actual);
    }
    if (char.state === 'corrected') {
      correctedSet.add(char.index);
    }
  }

  return { errorMap, correctedSet };
}

// =============================================================================
// Mock Keyboard Mapper (for MVP)
// =============================================================================

const mockKeyboardMapper = {
  getKeyDefinition: () => null,
  findKeyForCharacter: () => null,
};

// =============================================================================
// Component
// =============================================================================

/**
 * PracticeArea - Main typing practice container
 *
 * Manages session state, handles keyboard input, and coordinates
 * all child components for a complete typing practice experience.
 */
export function PracticeArea({
  initialText,
  onComplete,
  onMetricsUpdate,
}: PracticeAreaProps) {
  // Session state
  const [session, setSession] = useState<SessionState | null>(
    initialText ? createSession(initialText) : null
  );
  const [previousStates, setPreviousStates] = useState<CharacterState[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTyped, setLastTyped] = useState<{ char: string; correct: boolean } | null>(null);

  // Dead key handling via hook (fixes stale closure issue with useRef internally)
  const {
    processRawKey,
    isPending: deadKeyPending,
    pendingChar: deadKeyPendingChar,
    reset: resetDeadKeys,
  } = useDeadKeys();

  // Refs
  const inputRef = useRef<TextInputRef>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state
  const status = getSessionStatus(session);
  const { errorMap, correctedSet } = useMemo(
    () => buildErrorMaps(session?.characters ?? []),
    [session?.characters]
  );

  // ==========================================================================
  // Metrics Update
  // ==========================================================================

  useEffect(() => {
    if (!session || !session.isStarted || session.isPaused || session.isComplete) {
      return;
    }

    const interval = setInterval(() => {
      if (onMetricsUpdate && session) {
        const metrics = calculateMetrics(session);
        onMetricsUpdate(metrics);
      }
    }, METRICS_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [session, onMetricsUpdate]);

  // ==========================================================================
  // Session Complete Handler
  // ==========================================================================

  useEffect(() => {
    if (session?.isComplete && onComplete) {
      // Calculate final metrics and pass directly to onComplete for reliability
      const finalMetrics = calculateMetrics(session);
      // Also update metrics state for any components that depend on it
      if (onMetricsUpdate) {
        onMetricsUpdate(finalMetrics);
      }
      // Pass both session and metrics to ensure parent has all data
      onComplete(session, finalMetrics);
    }
  }, [session?.isComplete, session, onComplete, onMetricsUpdate]);

  // ==========================================================================
  // Typing Activity Tracking
  // ==========================================================================

  const markTypingActive = useCallback(() => {
    setIsTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to mark typing as inactive
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // Keyboard Event Handler
  // ==========================================================================

  const handleKeyDown = useCallback(
    (event: TypingKeyboardEvent) => {
      if (!session) return;

      // Mark typing as active
      markTypingActive();

      // Handle Escape - pause session or cancel dead key
      if (event.code === 'Escape') {
        if (deadKeyPending) {
          resetDeadKeys();
          return;
        }
        if (session.isStarted && !session.isPaused) {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  isPaused: true,
                  pauseTime: performance.now(),
                }
              : null
          );
        }
        return;
      }

      // Don't process input if paused
      if (session.isPaused) return;

      // Handle backspace - also cancels pending dead key
      if (event.code === 'Backspace') {
        if (deadKeyPending) {
          resetDeadKeys();
          return;
        }
        const { updatedState } = processBackspace(session);
        setSession(updatedState);
        return;
      }

      // Extract modifiers from event
      const modifiers = {
        shift: event.shiftKey ?? false,
        altGr: event.altKey ?? false,
        ctrl: event.ctrlKey ?? false,
        meta: event.metaKey ?? false,
      };

      // Process through dead key handler first
      // This uses useRef internally to avoid stale closure issues
      const deadKeyResult = processRawKey(event.code, event.key, modifiers);

      // If consumed by dead key but no output yet, wait for base character
      if (deadKeyResult.consumed && !deadKeyResult.outputChar) {
        return;
      }

      // Get the character to process (composed character or original key)
      const charToProcess = deadKeyResult.outputChar ?? event.key;

      // Skip non-printable characters (except space)
      if (charToProcess.length !== 1 && charToProcess !== ' ') {
        return;
      }

      // Create typing event with the composed character
      const typingEvent: TypingKeyboardEvent = {
        ...event,
        key: charToProcess,
      };

      // Process keystroke with composed character
      const { updatedState, feedback } = processKeystroke(
        typingEvent,
        session,
        initialDeadKeyState, // Dead key already handled above
        mockKeyboardMapper
      );

      if (feedback.accepted) {
        setSession(updatedState);
        // Update last typed indicator
        setLastTyped({
          char: charToProcess,
          correct: feedback.isCorrect ?? true,
        });
      }
    },
    [session, deadKeyPending, markTypingActive, processRawKey, resetDeadKeys]
  );

  // ==========================================================================
  // Session Control Handlers
  // ==========================================================================

  const handleLoadText = useCallback((text: string) => {
    const newSession = createSession(text);
    setSession(newSession);
    setPreviousStates([]);
    resetDeadKeys();
    setLastTyped(null);

    // Focus input after loading
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [resetDeadKeys]);

  const handleStart = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handlePause = useCallback(() => {
    setSession((prev) =>
      prev && prev.isStarted
        ? {
            ...prev,
            isPaused: true,
            pauseTime: performance.now(),
          }
        : prev
    );
  }, []);

  const handleResume = useCallback(() => {
    setSession((prev) => {
      if (!prev || !prev.isPaused || !prev.pauseTime) return prev;

      const pausedDuration = performance.now() - prev.pauseTime;
      return {
        ...prev,
        isPaused: false,
        pauseTime: null,
        totalPausedTime: prev.totalPausedTime + pausedDuration,
      };
    });

    // Re-focus input
    inputRef.current?.focus();
  }, []);

  const handleReset = useCallback(() => {
    if (session?.text) {
      const newSession = createSession(session.text);
      setSession(newSession);
      setPreviousStates([]);
      resetDeadKeys();
      setLastTyped(null);
    } else {
      setSession(null);
      setLastTyped(null);
    }
  }, [session?.text, resetDeadKeys]);

  const handleFocus = useCallback(() => {
    // Resume if paused when re-focused
    if (session?.isPaused) {
      handleResume();
    }
  }, [session?.isPaused, handleResume]);

  const handleBlur = useCallback(() => {
    // Auto-pause when focus lost during active session
    if (session?.isStarted && !session?.isPaused && !session?.isComplete) {
      handlePause();
    }
  }, [session, handlePause]);

  // Track previous states for animation optimization
  const handleStatesChange = useCallback((states: CharacterState[]) => {
    setPreviousStates(states);
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="practice-area w-full max-w-4xl mx-auto h-full flex flex-col gap-4">
      {/* Session Controls */}
      <SessionControls
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onLoadText={handleLoadText}
        className="flex-shrink-0"
      />

      {/* Real-time typing indicator */}
      {session && session.isStarted && !session.isPaused && lastTyped && (
        <div className="flex items-center justify-center gap-3 py-2 flex-shrink-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last typed:</span>
          <span
            className={`
              inline-flex items-center justify-center
              min-w-[2.5rem] h-10
              px-3
              font-mono text-xl font-medium
              rounded-lg
              border-2
              transition-all duration-150
              ${lastTyped.correct
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
              }
            `}
          >
            {lastTyped.char === ' ' ? '␣' : lastTyped.char}
          </span>
        </div>
      )}

      {/* Text Display (only show when session exists) - flex-1 to fill remaining space */}
      {session && (
        <div
          className="relative cursor-text z-0 isolate flex-1 min-h-0 flex flex-col"
          onClick={() => inputRef.current?.focus()}
        >
          <TextDisplay
            characters={session.characters}
            currentIndex={session.currentIndex}
            errorMap={errorMap}
            correctedSet={correctedSet}
            isActive={session.isStarted && !session.isPaused}
            previousStates={previousStates}
            onStatesChange={handleStatesChange}
          />

          {/* Hidden text input for keyboard capture */}
          <TextInput
            ref={inputRef}
            autoFocus={status === 'ready' || status === 'active'}
            disabled={session.isComplete}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Start prompt overlay - clean, no blur */}
          {status === 'ready' && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-gradient-to-b
                from-gray-900/60
                to-gray-900/80
                dark:from-black/60
                dark:to-black/80
                rounded-lg
                pointer-events-none
                transition-opacity
                duration-200
              "
            >
              <div className="text-center">
                <p className="text-white text-xl font-semibold mb-2">
                  Ready to type
                </p>
                <p className="text-white/70 text-sm">
                  Click here or press any key to begin
                </p>
              </div>
            </div>
          )}

          {/* Paused overlay - clean, no blur */}
          {status === 'paused' && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-gradient-to-b
                from-amber-900/60
                to-amber-900/80
                dark:from-amber-950/60
                dark:to-amber-950/80
                rounded-lg
                pointer-events-none
                transition-opacity
                duration-200
              "
            >
              <div className="text-center">
                <p className="text-white text-xl font-semibold mb-2">
                  Paused
                </p>
                <p className="text-white/70 text-sm">
                  Click or press any key to resume
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion message */}
      {status === 'completed' && session && (
        <div
          className="
            p-6
            bg-green-50
            dark:bg-green-900/20
            border
            border-green-200
            dark:border-green-800
            rounded-lg
            text-center
            flex-shrink-0
          "
        >
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
            Session Complete!
          </h3>
          <p className="text-green-600 dark:text-green-500">
            You typed {session.characters.length} characters.
            {onComplete && ' Check your results below.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default PracticeArea;
