/**
 * @file useDeadKeys.ts
 * @description Dead key state management hook for Teclado LATAM.
 *
 * Wraps the dead-keys module to provide React state management
 * for dead key composition (acute, dieresis, etc.).
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 * @see docs/sparc/03-pseudocode.md - Dead Key State Machine
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import type { DeadKeyState, DeadKeyType, DeadKeyResult, ModifierState } from '@/lib/typing-engine/types';
import { handleDeadKey, isDeadKeyCode, DeadKeyStatus } from '@/lib/typing-engine/dead-keys';
import type { NormalizedKeyEvent } from './useKeyboardEvents';

/**
 * Initial dead key state (idle)
 */
const INITIAL_DEAD_KEY_STATE: DeadKeyState = {
  status: 'IDLE',
  type: null,
  pendingChar: null,
  timestamp: null,
};

/**
 * Result from processing a key through the dead key handler
 */
export interface DeadKeyProcessResult {
  /** Character to output (null if still waiting for base char) */
  outputChar: string | null;
  /** Whether the key was consumed by dead key handling */
  consumed: boolean;
  /** Whether this was a successful composition */
  wasComposition: boolean;
  /** Whether this was a backspace that cancelled dead key */
  wasBackspaceCancellation: boolean;
  /** Whether dead key is currently pending */
  isPending: boolean;
}

/**
 * Return type for useDeadKeys hook
 */
export interface UseDeadKeysReturn {
  /** Current dead key state */
  deadKeyState: DeadKeyState;
  /** Whether a dead key is currently pending */
  isPending: boolean;
  /** Type of pending dead key (if any) */
  pendingType: DeadKeyType | null;
  /** Visual representation of pending dead key */
  pendingChar: string | null;
  /** Process a key event through the dead key handler */
  processKey: (event: NormalizedKeyEvent) => DeadKeyProcessResult;
  /** Process a raw key code and character */
  processRawKey: (
    code: string,
    char: string,
    modifiers: ModifierState
  ) => DeadKeyProcessResult;
  /** Reset dead key state to idle */
  reset: () => void;
  /** Check if a key code is a dead key with given modifiers */
  isDeadKey: (code: string, modifiers: ModifierState) => boolean;
}

/**
 * Custom hook for dead key state management
 *
 * @returns Dead key state and handlers
 *
 * @example
 * ```tsx
 * const { processKey, isPending, pendingChar, reset } = useDeadKeys();
 *
 * const handleKeyDown = (event: NormalizedKeyEvent) => {
 *   const result = processKey(event);
 *
 *   if (result.consumed) {
 *     if (result.outputChar) {
 *       // Character produced (either composed or fallback)
 *       handleCharacter(result.outputChar);
 *     }
 *     // If no outputChar, dead key is pending
 *   } else {
 *     // Normal key, handle directly
 *     handleCharacter(event.key);
 *   }
 * };
 *
 * // Show pending indicator
 * {isPending && <span className="pending-accent">{pendingChar}</span>}
 * ```
 */
export function useDeadKeys(): UseDeadKeysReturn {
  const [state, setState] = useState<DeadKeyState>(INITIAL_DEAD_KEY_STATE);

  /**
   * Check if a key code is a dead key with given modifiers
   */
  const isDeadKey = useCallback((code: string, modifiers: ModifierState): boolean => {
    const result = isDeadKeyCode(code, modifiers);
    return result.isDeadKey;
  }, []);

  /**
   * Process a raw key code and character through the dead key handler
   */
  const processRawKey = useCallback(
    (code: string, char: string, modifiers: ModifierState): DeadKeyProcessResult => {
      // Check if this key is a dead key
      const deadKeyInfo = isDeadKeyCode(code, modifiers);

      // Process through the state machine
      const result: DeadKeyResult = handleDeadKey(
        code,
        char,
        state,
        deadKeyInfo.isDeadKey,
        deadKeyInfo.deadKeyType
      );

      // Update state
      setState(result.newState);

      // Build result
      return {
        outputChar: result.outputChar,
        consumed: result.consumed,
        wasComposition: result.wasComposition ?? false,
        wasBackspaceCancellation: result.isBackspace ?? false,
        isPending: result.newState.status === DeadKeyStatus.AWAITING_BASE,
      };
    },
    [state]
  );

  /**
   * Process a normalized key event through the dead key handler
   */
  const processKey = useCallback(
    (event: NormalizedKeyEvent): DeadKeyProcessResult => {
      return processRawKey(event.code, event.key, event.modifiers);
    },
    [processRawKey]
  );

  /**
   * Reset dead key state to idle
   */
  const reset = useCallback(() => {
    setState(INITIAL_DEAD_KEY_STATE);
  }, []);

  // Memoized derived state
  const isPending = useMemo(
    () => state.status === DeadKeyStatus.AWAITING_BASE,
    [state.status]
  );

  const pendingType = useMemo(
    () => state.type,
    [state.type]
  );

  const pendingChar = useMemo(
    () => state.pendingChar,
    [state.pendingChar]
  );

  return {
    deadKeyState: state,
    isPending,
    pendingType,
    pendingChar,
    processKey,
    processRawKey,
    reset,
    isDeadKey,
  };
}
