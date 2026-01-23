/**
 * @file session-state-machine.ts
 * @description Session lifecycle state machine for Teclado LATAM.
 *
 * STUB IMPLEMENTATION - TDD Red Phase
 * All functions throw or return minimal values to make tests run.
 *
 * @see docs/sparc/03-pseudocode.md Section 2 (Session Lifecycle)
 */

import type {
  SessionAction,
  SideEffect,
  CharacterResult,
} from './types';

import { initializeCharacters } from './typing-engine';

// =============================================================================
// Session Status Enum
// =============================================================================

/**
 * Session lifecycle states
 */
export enum SessionStatus {
  IDLE = 'IDLE',
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

// =============================================================================
// Session Lifecycle State
// =============================================================================

/**
 * Session lifecycle state type
 */
export interface SessionLifecycleState {
  status: SessionStatus;
  text: string | null;
  characters: CharacterResult[];
  currentIndex: number;
  startTime?: number | null;
  pauseTime?: number | null;
  totalPausedTime?: number;
}

// =============================================================================
// Session Lifecycle State Machine
// =============================================================================

/**
 * Process session lifecycle action
 *
 * TODO: Implement state machine transitions:
 * - IDLE -> READY (on LOAD_TEXT with valid text)
 * - READY -> ACTIVE (on first KEYSTROKE)
 * - ACTIVE -> PAUSED (on PAUSE or BLUR)
 * - PAUSED -> ACTIVE (on RESUME)
 * - ACTIVE -> COMPLETED (when all characters typed)
 * - ANY -> IDLE (on RESET)
 *
 * @param state - Current session lifecycle state
 * @param action - Action to process
 * @returns New state and side effects
 */
export function sessionLifecycle(
  state: SessionLifecycleState,
  action: SessionAction
): { newState: SessionLifecycleState; sideEffects: SideEffect[] } {
  // TODO: Implement full state machine logic
  const sideEffects: SideEffect[] = [];

  switch (action.type) {
    case 'LOAD_TEXT': {
      const text = action.payload?.text;

      // Reject empty text
      if (!text || text.length === 0) {
        return { newState: state, sideEffects: [] };
      }

      return {
        newState: {
          ...state,
          status: SessionStatus.READY,
          text,
          characters: initializeCharacters(text),
          currentIndex: 0,
        },
        sideEffects: [],
      };
    }

    case 'KEYSTROKE': {
      if (state.status === SessionStatus.READY) {
        // Transition to ACTIVE on first keystroke
        const newState: SessionLifecycleState = {
          ...state,
          status: SessionStatus.ACTIVE,
          startTime: Date.now(),
        };

        // Check if this completes the session (single character)
        if (state.characters.length === 1) {
          return {
            newState: {
              ...newState,
              status: SessionStatus.COMPLETED,
              currentIndex: 1,
            },
            sideEffects: [{ type: 'CALCULATE_FINAL_METRICS' }],
          };
        }

        return {
          newState,
          sideEffects: [{ type: 'START_TIMER' }],
        };
      }

      if (state.status === SessionStatus.ACTIVE) {
        // Check if this completes the session
        const nextIndex = state.currentIndex + 1;
        if (nextIndex >= state.characters.length) {
          return {
            newState: {
              ...state,
              status: SessionStatus.COMPLETED,
              currentIndex: nextIndex,
            },
            sideEffects: [{ type: 'CALCULATE_FINAL_METRICS' }],
          };
        }

        return {
          newState: {
            ...state,
            currentIndex: nextIndex,
          },
          sideEffects: [],
        };
      }

      return { newState: state, sideEffects: [] };
    }

    case 'PAUSE': {
      if (state.status === SessionStatus.ACTIVE) {
        return {
          newState: {
            ...state,
            status: SessionStatus.PAUSED,
            pauseTime: Date.now(),
          },
          sideEffects: [{ type: 'PAUSE_TIMER' }],
        };
      }
      return { newState: state, sideEffects: [] };
    }

    case 'RESUME': {
      if (state.status === SessionStatus.PAUSED && state.pauseTime) {
        const pausedDuration = Date.now() - state.pauseTime;
        return {
          newState: {
            ...state,
            status: SessionStatus.ACTIVE,
            pauseTime: null,
            totalPausedTime: (state.totalPausedTime ?? 0) + pausedDuration,
          },
          sideEffects: [{ type: 'RESUME_TIMER' }],
        };
      }
      return { newState: state, sideEffects: [] };
    }

    case 'BLUR': {
      if (state.status === SessionStatus.ACTIVE) {
        return {
          newState: {
            ...state,
            status: SessionStatus.PAUSED,
            pauseTime: Date.now(),
          },
          sideEffects: [{ type: 'AUTO_SAVE' }],
        };
      }
      return { newState: state, sideEffects: [] };
    }

    case 'RESET': {
      return {
        newState: {
          status: SessionStatus.IDLE,
          text: null,
          characters: [],
          currentIndex: 0,
          startTime: null,
          pauseTime: null,
          totalPausedTime: 0,
        },
        sideEffects: [{ type: 'CLEAR_METRICS' }],
      };
    }

    default:
      return { newState: state, sideEffects: [] };
  }
}
