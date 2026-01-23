/**
 * @file useTypingSession.ts
 * @description Main session management hook for Teclado LATAM.
 *
 * Orchestrates the typing session lifecycle, integrating:
 * - Typing engine for character processing
 * - Keyboard events for input capture
 * - Dead keys for accent composition
 * - Metrics for real-time statistics
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 */

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import type {
  SessionState,
  SessionSettings,
  CharacterResult,
  UIFeedback,
  KeyDefinition,
  ModifierState,
  TypingMode,
} from '@/lib/typing-engine/types';
import {
  createSession,
  processKeystroke,
  processBackspace,
} from '@/lib/typing-engine/typing-engine';
import { DeadKeyStatus } from '@/lib/typing-engine/dead-keys';
import {
  getKeyDefinition,
  findKeyForCharacter,
} from '@/lib/keyboard/keyboard-layout';
import { useKeyboardEvents, type NormalizedKeyEvent, isModifierKey } from './useKeyboardEvents';
import { useDeadKeys } from './useDeadKeys';
import { useMetrics, type MetricsSnapshot } from './useMetrics';

/**
 * Session options
 */
export interface SessionOptions {
  /** Initial text to type */
  text?: string;
  /** Typing mode */
  mode?: TypingMode;
  /** Case sensitivity */
  caseSensitive?: boolean;
  /** Strict accent matching */
  strictAccents?: boolean;
  /** Allow word deletion with Ctrl+Backspace */
  allowWordDeletion?: boolean;
  /** Auto-start on first keystroke */
  autoStart?: boolean;
  /** Callback when session completes */
  onComplete?: (metrics: MetricsSnapshot) => void;
  /** Callback on each keystroke */
  onKeystroke?: (feedback: UIFeedback) => void;
  /** Callback on error */
  onError?: (expected: string, actual: string) => void;
}

/**
 * Session actions
 */
export interface SessionActions {
  /** Load new text */
  loadText: (text: string) => void;
  /** Start the session */
  startSession: () => void;
  /** Pause the session */
  pauseSession: () => void;
  /** Resume the session */
  resumeSession: () => void;
  /** Reset the session (keep same text) */
  resetSession: () => void;
  /** Reset with new text */
  resetWithText: (text: string) => void;
  /** Update session settings */
  updateSettings: (settings: Partial<SessionSettings>) => void;
}

/**
 * Keyboard state
 */
export interface KeyboardState {
  /** Currently pressed keys */
  pressedKeys: Set<string>;
  /** Key to highlight (next expected character) */
  highlightedKey: KeyDefinition | null;
  /** Required modifiers for highlighted key */
  requiredModifiers: ModifierState;
  /** Whether dead key is pending */
  deadKeyPending: boolean;
  /** Pending dead key character */
  pendingDeadKeyChar: string | null;
}

/**
 * Return type for useTypingSession hook
 */
export interface UseTypingSessionReturn {
  /** Current session state */
  session: SessionState | null;
  /** Current metrics */
  metrics: MetricsSnapshot;
  /** Character states array */
  characterStates: CharacterResult[];
  /** Session actions */
  actions: SessionActions;
  /** Keyboard state */
  keyboardState: KeyboardState;
  /** Whether session is ready (text loaded) */
  isReady: boolean;
  /** Whether session is active (started but not complete) */
  isActive: boolean;
  /** Last feedback from keystroke */
  lastFeedback: UIFeedback | null;
}

/**
 * Initial dead key state
 */
const INITIAL_DEAD_KEY_STATE = {
  status: DeadKeyStatus.IDLE as const,
  type: null,
  pendingChar: null,
  timestamp: null,
};

/**
 * Keyboard mapper interface for processKeystroke
 */
const keyboardMapper = {
  getKeyDefinition,
  findKeyForCharacter,
};

/**
 * Custom hook for typing session management
 *
 * @param options - Session configuration options
 * @returns Session state, metrics, and controls
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   metrics,
 *   characterStates,
 *   actions,
 *   keyboardState,
 *   isActive,
 * } = useTypingSession({
 *   text: 'Hola mundo!',
 *   mode: 'lenient',
 *   onComplete: (metrics) => saveSession(metrics),
 * });
 *
 * return (
 *   <div>
 *     <TextDisplay characters={characterStates} />
 *     <MetricsPanel wpm={metrics.wpm} accuracy={metrics.accuracy} />
 *     <VirtualKeyboard
 *       highlightedKey={keyboardState.highlightedKey}
 *       requiredModifiers={keyboardState.requiredModifiers}
 *     />
 *     <button onClick={actions.resetSession}>Reset</button>
 *   </div>
 * );
 * ```
 */
export function useTypingSession(options: SessionOptions = {}): UseTypingSessionReturn {
  const {
    text: initialText,
    mode = 'lenient',
    caseSensitive = true,
    strictAccents = true,
    allowWordDeletion = false,
    autoStart = true,
    onComplete,
    onKeystroke,
    onError,
  } = options;

  // Session state
  const [session, setSession] = useState<SessionState | null>(
    initialText ? createSession(initialText, { mode, caseSensitive, strictAccents, allowWordDeletion }) : null
  );
  const [lastFeedback, setLastFeedback] = useState<UIFeedback | null>(null);

  // Keyboard state
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [highlightedKey, setHighlightedKey] = useState<KeyDefinition | null>(null);
  const [requiredModifiers, setRequiredModifiers] = useState<ModifierState>({
    shift: false,
    altGr: false,
    ctrl: false,
    meta: false,
  });

  // Dead key handling
  const { processKey: processDeadKey, isPending, pendingChar, reset: resetDeadKeys } = useDeadKeys();

  // Metrics tracking
  const metricsHook = useMetrics(session);

  // Refs for callbacks
  const onCompleteRef = useRef(onComplete);
  const onKeystrokeRef = useRef(onKeystroke);
  const onErrorRef = useRef(onError);

  // Update refs
  onCompleteRef.current = onComplete;
  onKeystrokeRef.current = onKeystroke;
  onErrorRef.current = onError;

  /**
   * Update highlighted key based on current position
   */
  const updateHighlightedKey = useCallback((sessionState: SessionState) => {
    if (sessionState.isComplete || sessionState.currentIndex >= sessionState.characters.length) {
      setHighlightedKey(null);
      setRequiredModifiers({ shift: false, altGr: false, ctrl: false, meta: false });
      return;
    }

    const nextChar = sessionState.characters[sessionState.currentIndex].expected;
    const keyInfo = findKeyForCharacter(nextChar);

    if (keyInfo) {
      setHighlightedKey(keyInfo.keyDefinition);
      setRequiredModifiers(keyInfo.modifiers);
    } else {
      setHighlightedKey(null);
      setRequiredModifiers({ shift: false, altGr: false, ctrl: false, meta: false });
    }
  }, []);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: NormalizedKeyEvent) => {
      // Ignore modifier-only keys
      if (isModifierKey(event)) {
        setPressedKeys((prev) => new Set(prev).add(event.code));
        return;
      }

      // Track pressed keys
      setPressedKeys((prev) => new Set(prev).add(event.code));

      // Need session to process
      if (!session) {
        return;
      }

      // Handle paused state - only allow resume or reset
      if (session.isPaused) {
        return;
      }

      // Handle Escape - pause or cancel
      if (event.code === 'Escape') {
        if (isPending) {
          resetDeadKeys();
        }
        return;
      }

      // Handle Backspace
      if (event.code === 'Backspace') {
        event.preventDefault();

        // If dead key pending, cancel it
        if (isPending) {
          resetDeadKeys();
          return;
        }

        const { updatedState, feedback } = processBackspace(session);
        setSession(updatedState);
        setLastFeedback(feedback);
        updateHighlightedKey(updatedState);

        if (feedback.accepted) {
          metricsHook.recordKeystroke('\b', true);
        }

        onKeystrokeRef.current?.(feedback);
        return;
      }

      // Process through dead key handler
      const deadKeyResult = processDeadKey(event);

      // If consumed by dead key but no output yet, wait
      if (deadKeyResult.consumed && !deadKeyResult.outputChar) {
        return;
      }

      // Get character to process
      const charToProcess = deadKeyResult.outputChar ?? event.key;

      // Skip non-printable characters
      if (charToProcess.length !== 1 && charToProcess !== '\n' && charToProcess !== '\t') {
        return;
      }

      // Create typing event
      const typingEvent = {
        code: event.code,
        key: charToProcess,
        shiftKey: event.modifiers.shift,
        altKey: event.modifiers.altGr,
        ctrlKey: event.modifiers.ctrl,
        metaKey: event.modifiers.meta,
        timestamp: event.timestamp,
        repeat: event.repeat,
      };

      // Process keystroke
      const { updatedState, feedback } = processKeystroke(
        typingEvent,
        session,
        INITIAL_DEAD_KEY_STATE,
        keyboardMapper
      );

      // Update state
      setSession(updatedState);
      setLastFeedback(feedback);
      updateHighlightedKey(updatedState);

      // Track metrics
      if (feedback.accepted && feedback.isCorrect !== null) {
        metricsHook.recordKeystroke(charToProcess, feedback.isCorrect);

        if (!feedback.isCorrect) {
          const expected = session.characters[session.currentIndex]?.expected ?? '';
          onErrorRef.current?.(expected, charToProcess);
        }
      }

      // Notify callback
      onKeystrokeRef.current?.(feedback);

      // Check for completion
      if (feedback.sessionComplete) {
        const snapshot = metricsHook.getSnapshot();
        onCompleteRef.current?.(snapshot);
      }
    },
    [session, isPending, processDeadKey, resetDeadKeys, updateHighlightedKey, metricsHook]
  );

  /**
   * Handle key up events
   */
  const handleKeyUp = useCallback((event: NormalizedKeyEvent) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(event.code);
      return next;
    });
  }, []);

  // Attach keyboard events
  useKeyboardEvents(handleKeyDown, {
    enabled: session !== null && !session.isComplete,
    captureKeyUp: true,
    onKeyUp: handleKeyUp,
  });

  /**
   * Load new text
   */
  const loadText = useCallback(
    (newText: string) => {
      const newSession = createSession(newText, {
        mode,
        caseSensitive,
        strictAccents,
        allowWordDeletion,
      });
      setSession(newSession);
      setLastFeedback(null);
      resetDeadKeys();
      metricsHook.reset();
      updateHighlightedKey(newSession);
    },
    [mode, caseSensitive, strictAccents, allowWordDeletion, resetDeadKeys, metricsHook, updateHighlightedKey]
  );

  /**
   * Start the session
   */
  const startSession = useCallback(() => {
    if (session && !session.isStarted) {
      setSession({
        ...session,
        isStarted: true,
        startTime: performance.now(),
      });
      metricsHook.start();
    }
  }, [session, metricsHook]);

  /**
   * Pause the session
   */
  const pauseSession = useCallback(() => {
    if (session && session.isStarted && !session.isPaused && !session.isComplete) {
      setSession({
        ...session,
        isPaused: true,
        pauseTime: performance.now(),
      });
      metricsHook.pause();
    }
  }, [session, metricsHook]);

  /**
   * Resume the session
   */
  const resumeSession = useCallback(() => {
    if (session && session.isPaused) {
      const pauseDuration = performance.now() - (session.pauseTime ?? 0);
      setSession({
        ...session,
        isPaused: false,
        pauseTime: null,
        totalPausedTime: session.totalPausedTime + pauseDuration,
      });
      metricsHook.resume();
    }
  }, [session, metricsHook]);

  /**
   * Reset the session (keep same text)
   */
  const resetSession = useCallback(() => {
    if (session) {
      const newSession = createSession(session.text, session.settings);
      setSession(newSession);
      setLastFeedback(null);
      resetDeadKeys();
      metricsHook.reset();
      updateHighlightedKey(newSession);
    }
  }, [session, resetDeadKeys, metricsHook, updateHighlightedKey]);

  /**
   * Reset with new text
   */
  const resetWithText = useCallback(
    (newText: string) => {
      loadText(newText);
    },
    [loadText]
  );

  /**
   * Update session settings
   */
  const updateSettings = useCallback(
    (newSettings: Partial<SessionSettings>) => {
      if (session) {
        setSession({
          ...session,
          settings: { ...session.settings, ...newSettings },
          mode: newSettings.mode ?? session.mode,
        });
      }
    },
    [session]
  );

  // Derived state
  const isReady = session !== null;
  const isActive = session !== null && session.isStarted && !session.isComplete && !session.isPaused;
  const characterStates = session?.characters ?? [];

  // Keyboard state object
  const keyboardState: KeyboardState = useMemo(
    () => ({
      pressedKeys,
      highlightedKey,
      requiredModifiers,
      deadKeyPending: isPending,
      pendingDeadKeyChar: pendingChar,
    }),
    [pressedKeys, highlightedKey, requiredModifiers, isPending, pendingChar]
  );

  // Actions object
  const actions: SessionActions = useMemo(
    () => ({
      loadText,
      startSession,
      pauseSession,
      resumeSession,
      resetSession,
      resetWithText,
      updateSettings,
    }),
    [loadText, startSession, pauseSession, resumeSession, resetSession, resetWithText, updateSettings]
  );

  // Metrics snapshot
  const metrics = metricsHook.getSnapshot();

  return {
    session,
    metrics,
    characterStates,
    actions,
    keyboardState,
    isReady,
    isActive,
    lastFeedback,
  };
}
