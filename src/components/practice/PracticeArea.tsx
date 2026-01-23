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

// =============================================================================
// Types
// =============================================================================

export interface PracticeAreaProps {
  /** Initial text to practice (optional) */
  initialText?: string;
  /** Callback when session completes */
  onComplete?: (session: SessionState) => void;
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
 */
function calculateMetrics(state: SessionState): SessionMetrics {
  const now = performance.now();
  const startTime = state.startTime ?? now;
  const elapsedTime = state.isStarted
    ? now - startTime - state.totalPausedTime
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
  const [deadKeyState, setDeadKeyState] =
    useState<DeadKeyState>(initialDeadKeyState);
  const [previousStates, setPreviousStates] = useState<CharacterState[]>([]);
  const [isTyping, setIsTyping] = useState(false);

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
      onComplete(session);
    }
  }, [session?.isComplete, session, onComplete]);

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

      // Handle Escape - pause session
      if (event.code === 'Escape') {
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

      // Handle backspace
      if (event.code === 'Backspace') {
        const { updatedState } = processBackspace(session);
        setSession(updatedState);
        return;
      }

      // Process regular keystroke
      const { updatedState, feedback } = processKeystroke(
        event,
        session,
        deadKeyState,
        mockKeyboardMapper
      );

      if (feedback.accepted) {
        setSession(updatedState);

        // Handle dead key state updates if needed
        if (feedback.deadKeyPending) {
          setDeadKeyState({
            status: 'AWAITING_BASE',
            type: null,
            pendingChar: event.key,
            timestamp: event.timestamp,
          });
        } else {
          setDeadKeyState(initialDeadKeyState);
        }
      }
    },
    [session, deadKeyState, markTypingActive]
  );

  // ==========================================================================
  // Session Control Handlers
  // ==========================================================================

  const handleLoadText = useCallback((text: string) => {
    const newSession = createSession(text);
    setSession(newSession);
    setPreviousStates([]);
    setDeadKeyState(initialDeadKeyState);

    // Focus input after loading
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

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
      setDeadKeyState(initialDeadKeyState);
    } else {
      setSession(null);
    }
  }, [session?.text]);

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
    <div className="practice-area w-full max-w-4xl mx-auto space-y-6">
      {/* Session Controls */}
      <SessionControls
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onLoadText={handleLoadText}
      />

      {/* Text Display (only show when session exists) */}
      {session && (
        <div className="relative">
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

          {/* Focus prompt when not focused */}
          {status === 'ready' && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/30
                dark:bg-black/50
                backdrop-blur-[2px]
                rounded-lg
                cursor-pointer
                transition-opacity
              "
              onClick={() => inputRef.current?.focus()}
            >
              <p className="text-white text-lg font-medium">
                Click here or press Tab to start typing
              </p>
            </div>
          )}

          {/* Paused overlay */}
          {status === 'paused' && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/30
                dark:bg-black/50
                backdrop-blur-[2px]
                rounded-lg
                cursor-pointer
              "
              onClick={handleResume}
            >
              <p className="text-white text-lg font-medium">
                Paused - Click here or press any key to resume
              </p>
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
