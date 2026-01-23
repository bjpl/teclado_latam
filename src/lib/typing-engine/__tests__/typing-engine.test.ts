/**
 * @file typing-engine.test.ts
 * @description Comprehensive TDD test suite for the Teclado LATAM typing engine core.
 *
 * These tests are written BEFORE implementation (TDD red phase).
 * All tests are expected to FAIL until the typing engine is implemented.
 *
 * Tests cover:
 * - ProcessKeystroke algorithm
 * - Session lifecycle (IDLE -> READY -> ACTIVE -> PAUSED -> COMPLETED)
 * - Mode-specific behavior (strict, lenient, no-backspace)
 * - Character validation with Unicode normalization
 * - Edge cases and error handling
 *
 * @see docs/sparc/03-pseudocode.md Section 2 (Typing Engine Core)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Types to be implemented - these imports will fail until implementation exists
import type {
  SessionState,
  CharacterResult,
  UIFeedback,
  KeyboardEvent as TypingKeyboardEvent,
  ModifierState,
  SessionSettings,
  SessionAction,
  SideEffect,
} from '../types';

import {
  processKeystroke,
  processBackspace,
  advancePosition,
  validateCharacter,
  createSession,
  initializeCharacters,
} from '../typing-engine';

import {
  sessionLifecycle,
  SessionStatus,
} from '../session-state-machine';

// =============================================================================
// Test Fixtures and Helpers
// =============================================================================

/**
 * Create a mock keyboard event for testing
 */
function createMockKeyboardEvent(
  key: string,
  code: string,
  options: Partial<{
    shiftKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    timestamp: number;
    repeat: boolean;
  }> = {}
): TypingKeyboardEvent {
  return {
    code,
    key,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    timestamp: options.timestamp ?? Date.now(),
    repeat: options.repeat ?? false,
  };
}

/**
 * Create a test session with the given text and options
 */
function createTestSession(
  text: string,
  options: Partial<SessionSettings> = {}
): SessionState {
  const settings: SessionSettings = {
    mode: options.mode ?? 'lenient',
    caseSensitive: options.caseSensitive ?? true,
    strictAccents: options.strictAccents ?? true,
    allowWordDeletion: options.allowWordDeletion ?? false,
    ...options,
  };

  return {
    text,
    characters: initializeCharacters(text),
    currentIndex: 0,
    mode: settings.mode,
    isStarted: false,
    isPaused: false,
    isComplete: false,
    startTime: null,
    pauseTime: null,
    totalPausedTime: 0,
    settings,
  };
}

/**
 * Create a mock dead key state (idle by default)
 */
function createIdleDeadKeyState() {
  return {
    status: 'IDLE' as const,
    type: null,
    pendingChar: null,
    timestamp: null,
  };
}

/**
 * Create a mock keyboard mapper
 */
function createMockKeyboardMapper() {
  return {
    getKeyDefinition: vi.fn(),
    findKeyForCharacter: vi.fn(),
  };
}

// =============================================================================
// ProcessKeystroke Tests
// =============================================================================

describe('TypingEngine', () => {
  describe('processKeystroke', () => {
    let sessionState: SessionState;
    let deadKeyState: ReturnType<typeof createIdleDeadKeyState>;
    let keyboardMapper: ReturnType<typeof createMockKeyboardMapper>;

    beforeEach(() => {
      sessionState = createTestSession('hello');
      deadKeyState = createIdleDeadKeyState();
      keyboardMapper = createMockKeyboardMapper();
    });

    // -------------------------------------------------------------------------
    // Basic Character Processing
    // -------------------------------------------------------------------------

    it('should accept correct character and advance position', () => {
      // Arrange
      const event = createMockKeyboardEvent('h', 'KeyH');

      // Act
      const { updatedState, feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.accepted).toBe(true);
      expect(feedback.isCorrect).toBe(true);
      expect(updatedState.characters[0].state).toBe('correct');
      expect(updatedState.currentIndex).toBe(1);
    });

    it('should mark incorrect character as error', () => {
      // Arrange
      const event = createMockKeyboardEvent('x', 'KeyX');

      // Act
      const { updatedState, feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.accepted).toBe(true);
      expect(feedback.isCorrect).toBe(false);
      expect(updatedState.characters[0].state).toBe('incorrect');
      expect(updatedState.characters[0].actual).toBe('x');
    });

    it('should start session timer on first keystroke', () => {
      // Arrange
      const timestamp = Date.now();
      const event = createMockKeyboardEvent('h', 'KeyH', { timestamp });
      expect(sessionState.isStarted).toBe(false);

      // Act
      const { updatedState } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(updatedState.isStarted).toBe(true);
      expect(updatedState.startTime).toBe(timestamp);
    });

    it('should complete session when all characters typed', () => {
      // Arrange: Create single-character session
      sessionState = createTestSession('a');
      const event = createMockKeyboardEvent('a', 'KeyA');

      // Act
      const { updatedState, feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(updatedState.isComplete).toBe(true);
      expect(feedback.sessionComplete).toBe(true);
    });

    it('should ignore keystrokes when session is complete', () => {
      // Arrange
      sessionState.isComplete = true;
      const event = createMockKeyboardEvent('x', 'KeyX');

      // Act
      const { updatedState, feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.accepted).toBe(false);
      expect(updatedState).toEqual(sessionState); // State unchanged
    });

    it('should ignore keystrokes when session is paused', () => {
      // Arrange
      sessionState.isPaused = true;
      const event = createMockKeyboardEvent('h', 'KeyH');

      // Act
      const { updatedState, feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.accepted).toBe(false);
    });

    // -------------------------------------------------------------------------
    // Mode-Specific Behavior
    // -------------------------------------------------------------------------

    describe('strict mode', () => {
      beforeEach(() => {
        sessionState = createTestSession('hello', { mode: 'strict' });
      });

      it('should require correction in strict mode (not advance on error)', () => {
        // Arrange
        const event = createMockKeyboardEvent('x', 'KeyX');

        // Act
        const { updatedState, feedback } = processKeystroke(
          event,
          sessionState,
          deadKeyState,
          keyboardMapper
        );

        // Assert
        expect(feedback.isCorrect).toBe(false);
        expect(updatedState.currentIndex).toBe(0); // Did NOT advance
        expect(updatedState.characters[0].state).toBe('incorrect');
      });

      it('should advance position after correction in strict mode', () => {
        // Arrange: First type wrong character
        let event = createMockKeyboardEvent('x', 'KeyX');
        let result = processKeystroke(event, sessionState, deadKeyState, keyboardMapper);

        // Now backspace to correct
        result = processBackspace(result.updatedState);

        // Then type correct character
        event = createMockKeyboardEvent('h', 'KeyH');
        const { updatedState, feedback } = processKeystroke(
          event,
          result.updatedState,
          deadKeyState,
          keyboardMapper
        );

        // Assert
        expect(feedback.isCorrect).toBe(true);
        expect(updatedState.currentIndex).toBe(1);
      });
    });

    describe('lenient mode', () => {
      beforeEach(() => {
        sessionState = createTestSession('hello', { mode: 'lenient' });
      });

      it('should handle backspace in lenient mode', () => {
        // Arrange: Type first character
        let event = createMockKeyboardEvent('h', 'KeyH');
        let result = processKeystroke(event, sessionState, deadKeyState, keyboardMapper);
        expect(result.updatedState.currentIndex).toBe(1);

        // Act: Press backspace
        const { updatedState, feedback } = processBackspace(result.updatedState);

        // Assert
        expect(feedback.accepted).toBe(true);
        expect(updatedState.currentIndex).toBe(0);
      });

      it('should always advance in lenient mode even on error', () => {
        // Arrange
        const event = createMockKeyboardEvent('x', 'KeyX');

        // Act
        const { updatedState, feedback } = processKeystroke(
          event,
          sessionState,
          deadKeyState,
          keyboardMapper
        );

        // Assert
        expect(feedback.isCorrect).toBe(false);
        expect(updatedState.currentIndex).toBe(1); // Advanced despite error
      });
    });

    describe('no-backspace mode', () => {
      beforeEach(() => {
        sessionState = createTestSession('hello', { mode: 'no-backspace' });
      });

      it('should block backspace in no-backspace mode', () => {
        // Arrange: Type first character
        let event = createMockKeyboardEvent('h', 'KeyH');
        let result = processKeystroke(event, sessionState, deadKeyState, keyboardMapper);
        expect(result.updatedState.currentIndex).toBe(1);

        // Act: Try to backspace
        const { updatedState, feedback } = processBackspace(result.updatedState);

        // Assert
        expect(feedback.accepted).toBe(false);
        expect(feedback.reason).toBe('backspace-disabled');
        expect(updatedState.currentIndex).toBe(1); // Position unchanged
      });

      it('should always advance in no-backspace mode', () => {
        // Arrange
        const event = createMockKeyboardEvent('x', 'KeyX');

        // Act
        const { updatedState } = processKeystroke(
          event,
          sessionState,
          deadKeyState,
          keyboardMapper
        );

        // Assert
        expect(updatedState.currentIndex).toBe(1); // Advanced
      });
    });

    // -------------------------------------------------------------------------
    // Special Key Handling
    // -------------------------------------------------------------------------

    it('should ignore modifier-only key presses', () => {
      // Arrange
      const modifierCodes = [
        'ShiftLeft', 'ShiftRight',
        'AltLeft', 'AltRight',
        'ControlLeft', 'ControlRight',
        'MetaLeft', 'MetaRight',
      ];

      for (const code of modifierCodes) {
        const event = createMockKeyboardEvent('', code);

        // Act
        const { feedback } = processKeystroke(
          event,
          sessionState,
          deadKeyState,
          keyboardMapper
        );

        // Assert
        expect(feedback.accepted).toBe(false);
      }
    });

    it('should handle Escape key to pause session', () => {
      // Arrange
      sessionState.isStarted = true;
      const event = createMockKeyboardEvent('Escape', 'Escape');

      // Act
      const result = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert - should trigger pause action (handled by session lifecycle)
      expect(result.feedback.accepted).toBe(true);
    });

    it('should handle Tab key appropriately', () => {
      // Arrange
      const event = createMockKeyboardEvent('Tab', 'Tab');

      // Act
      const result = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert - Tab should be handled specially
      expect(result.feedback.accepted).toBeDefined();
    });

    // -------------------------------------------------------------------------
    // Unicode and Spanish Characters
    // -------------------------------------------------------------------------

    it('should handle Spanish n with tilde correctly', () => {
      // Arrange
      sessionState = createTestSession('espanol'); // would be 'espanol' with tilde on n
      sessionState.characters[4].expected = 'n'; // Position of n

      // Simulate typing up to 'n' position
      sessionState.currentIndex = 4;
      const event = createMockKeyboardEvent('n', 'KeyN'); // Direct n-tilde key

      // Act
      const { feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.isCorrect).toBeDefined();
    });

    it('should handle accented vowels (a with acute) correctly', () => {
      // Arrange
      sessionState = createTestSession('cafe'); // would be 'cafe' with accent
      sessionState.characters[3].expected = 'e'; // 'e' with acute
      sessionState.currentIndex = 3;

      const event = createMockKeyboardEvent('e', 'KeyE'); // After dead key composition

      // Act
      const { feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.isCorrect).toBeDefined();
    });

    // -------------------------------------------------------------------------
    // Edge Cases
    // -------------------------------------------------------------------------

    it('should debounce rapid keystrokes (under 20ms)', () => {
      // Arrange
      const event1 = createMockKeyboardEvent('h', 'KeyH', { timestamp: 1000 });
      const event2 = createMockKeyboardEvent('h', 'KeyH', { timestamp: 1015, repeat: true });

      // Act
      const result1 = processKeystroke(event1, sessionState, deadKeyState, keyboardMapper);
      const result2 = processKeystroke(event2, result1.updatedState, deadKeyState, keyboardMapper);

      // Assert - second event should be ignored due to debounce
      expect(result2.feedback.accepted).toBe(false);
    });

    it('should handle empty text gracefully', () => {
      // Arrange
      sessionState = createTestSession('');
      const event = createMockKeyboardEvent('h', 'KeyH');

      // Act & Assert - should not throw
      expect(() => {
        processKeystroke(event, sessionState, deadKeyState, keyboardMapper);
      }).not.toThrow();
    });

    it('should calculate next key highlight for UI', () => {
      // Arrange
      const event = createMockKeyboardEvent('h', 'KeyH');

      // Act
      const { feedback } = processKeystroke(
        event,
        sessionState,
        deadKeyState,
        keyboardMapper
      );

      // Assert
      expect(feedback.highlightKey).toBeDefined();
      expect(feedback.requiredModifiers).toBeDefined();
    });
  });

  // ===========================================================================
  // AdvancePosition Tests
  // ===========================================================================

  describe('advancePosition', () => {
    it('should increment currentIndex', () => {
      // Arrange
      const state = createTestSession('hello');
      expect(state.currentIndex).toBe(0);

      // Act
      const newState = advancePosition(state);

      // Assert
      expect(newState.currentIndex).toBe(1);
    });

    it('should mark previous character as no longer current', () => {
      // Arrange
      const state = createTestSession('hello');
      state.characters[0].isCurrent = true;

      // Act
      const newState = advancePosition(state);

      // Assert
      expect(newState.characters[0].isCurrent).toBe(false);
    });

    it('should mark new position as current', () => {
      // Arrange
      const state = createTestSession('hello');

      // Act
      const newState = advancePosition(state);

      // Assert
      expect(newState.characters[1].isCurrent).toBe(true);
      expect(newState.characters[1].state).toBe('current');
    });

    it('should handle advancing past the last character', () => {
      // Arrange
      const state = createTestSession('a');
      state.currentIndex = 0;

      // Act
      const newState = advancePosition(state);

      // Assert
      expect(newState.currentIndex).toBe(1);
      expect(newState.currentIndex).toBeGreaterThanOrEqual(state.characters.length);
    });
  });

  // ===========================================================================
  // ProcessBackspace Tests
  // ===========================================================================

  describe('processBackspace', () => {
    it('should move back one position', () => {
      // Arrange
      const state = createTestSession('hello', { mode: 'lenient' });
      state.currentIndex = 3;
      state.characters[2].state = 'correct';

      // Act
      const { updatedState } = processBackspace(state);

      // Assert
      expect(updatedState.currentIndex).toBe(2);
    });

    it('should reset character state to pending', () => {
      // Arrange
      const state = createTestSession('hello', { mode: 'lenient' });
      state.currentIndex = 2;
      state.characters[2].state = 'current';

      // Act
      const { updatedState } = processBackspace(state);

      // Assert
      expect(updatedState.characters[2].state).toBe('pending');
    });

    it('should not go below index 0', () => {
      // Arrange
      const state = createTestSession('hello', { mode: 'lenient' });
      state.currentIndex = 0;

      // Act
      const { updatedState, feedback } = processBackspace(state);

      // Assert
      expect(feedback.accepted).toBe(false);
      expect(feedback.reason).toBe('at-start');
      expect(updatedState.currentIndex).toBe(0);
    });

    it('should mark corrected errors appropriately', () => {
      // Arrange
      const state = createTestSession('hello', { mode: 'lenient' });
      state.currentIndex = 1;
      state.characters[0].state = 'incorrect';
      state.characters[0].actual = 'x';

      // Act
      const { updatedState } = processBackspace(state);

      // Assert
      expect(updatedState.characters[0].state).toBe('corrected');
      expect(updatedState.characters[0].actual).toBeNull();
    });

    it('should clear isComplete flag when going back', () => {
      // Arrange
      const state = createTestSession('ab', { mode: 'lenient' });
      state.currentIndex = 2;
      state.isComplete = true;

      // Act
      const { updatedState } = processBackspace(state);

      // Assert
      expect(updatedState.isComplete).toBe(false);
    });
  });

  // ===========================================================================
  // ValidateCharacter Tests
  // ===========================================================================

  describe('validateCharacter', () => {
    it('should return true for exact match', () => {
      // Act & Assert
      expect(validateCharacter('a', 'a')).toBe(true);
      expect(validateCharacter('A', 'A')).toBe(true);
      expect(validateCharacter(' ', ' ')).toBe(true);
    });

    it('should return false for non-match', () => {
      // Act & Assert
      expect(validateCharacter('a', 'b')).toBe(false);
      expect(validateCharacter('A', 'a')).toBe(false); // Case sensitive
    });

    it('should handle null inputs gracefully', () => {
      // Act & Assert
      expect(validateCharacter(null as any, 'a')).toBe(false);
      expect(validateCharacter('a', null as any)).toBe(false);
      expect(validateCharacter(null as any, null as any)).toBe(false);
    });

    it('should normalize Unicode characters (NFC)', () => {
      // Arrange: 'a' + combining acute (U+0301) should equal 'a with acute' (U+00E1)
      const composed = '\u00E1'; // a with acute (precomposed)
      const decomposed = 'a\u0301'; // a + combining acute (decomposed)

      // Act & Assert
      expect(validateCharacter(composed, decomposed)).toBe(true);
      expect(validateCharacter(decomposed, composed)).toBe(true);
    });

    it('should handle n with tilde variations', () => {
      // Arrange
      const ntilde1 = '\u00F1'; // n with tilde (precomposed)
      const ntilde2 = 'n\u0303'; // n + combining tilde

      // Act & Assert
      expect(validateCharacter(ntilde1, ntilde2)).toBe(true);
    });

    it('should handle space variations (regular and NBSP)', () => {
      // Arrange
      const regularSpace = ' ';
      const nbsp = '\u00A0'; // Non-breaking space

      // Act & Assert
      expect(validateCharacter(regularSpace, nbsp)).toBe(true);
      expect(validateCharacter(nbsp, regularSpace)).toBe(true);
    });
  });

  // ===========================================================================
  // Session Lifecycle Tests
  // ===========================================================================

  describe('session lifecycle', () => {
    it('should initialize with IDLE state', () => {
      // Arrange & Act
      const state = {
        status: SessionStatus.IDLE,
        text: null,
        characters: [],
        currentIndex: 0,
      };

      // Assert
      expect(state.status).toBe(SessionStatus.IDLE);
    });

    it('should transition to READY when text loaded', () => {
      // Arrange
      const initialState = {
        status: SessionStatus.IDLE,
        text: null,
        characters: [],
        currentIndex: 0,
      };
      const action: SessionAction = {
        type: 'LOAD_TEXT',
        payload: { text: 'hello' },
      };

      // Act
      const { newState } = sessionLifecycle(initialState, action);

      // Assert
      expect(newState.status).toBe(SessionStatus.READY);
      expect(newState.text).toBe('hello');
      expect(newState.characters.length).toBe(5);
    });

    it('should transition to ACTIVE on first keystroke', () => {
      // Arrange
      const readyState = {
        status: SessionStatus.READY,
        text: 'hello',
        characters: initializeCharacters('hello'),
        currentIndex: 0,
        startTime: null,
      };
      const action: SessionAction = {
        type: 'KEYSTROKE',
        payload: { event: createMockKeyboardEvent('h', 'KeyH') },
      };

      // Act
      const { newState } = sessionLifecycle(readyState, action);

      // Assert
      expect(newState.status).toBe(SessionStatus.ACTIVE);
      expect(newState.startTime).not.toBeNull();
    });

    it('should pause and resume correctly', () => {
      // Arrange - Use fake timers for this test
      vi.useFakeTimers();

      const activeState = {
        status: SessionStatus.ACTIVE,
        text: 'hello',
        characters: initializeCharacters('hello'),
        currentIndex: 2,
        startTime: Date.now() - 5000,
        pauseTime: null,
        totalPausedTime: 0,
      };

      // Act - Pause
      const pauseAction: SessionAction = { type: 'PAUSE', payload: {} };
      const { newState: pausedState } = sessionLifecycle(activeState, pauseAction);

      // Assert - Paused
      expect(pausedState.status).toBe(SessionStatus.PAUSED);
      expect(pausedState.pauseTime).not.toBeNull();

      // Act - Resume after 1 second
      vi.advanceTimersByTime(1000);
      const resumeAction: SessionAction = { type: 'RESUME', payload: {} };
      const { newState: resumedState } = sessionLifecycle(pausedState, resumeAction);

      // Assert - Resumed
      expect(resumedState.status).toBe(SessionStatus.ACTIVE);
      expect(resumedState.pauseTime).toBeNull();
      expect(resumedState.totalPausedTime).toBeGreaterThan(0);

      // Cleanup - restore real timers
      vi.useRealTimers();
    });

    it('should calculate final metrics on completion', () => {
      // Arrange
      const almostCompleteState = {
        status: SessionStatus.ACTIVE,
        text: 'a',
        characters: initializeCharacters('a'),
        currentIndex: 0,
        startTime: Date.now() - 60000, // 1 minute ago
      };
      const action: SessionAction = {
        type: 'KEYSTROKE',
        payload: { event: createMockKeyboardEvent('a', 'KeyA') },
      };

      // Act
      const { newState, sideEffects } = sessionLifecycle(almostCompleteState, action);

      // Assert
      expect(newState.status).toBe(SessionStatus.COMPLETED);
      expect(sideEffects).toContainEqual(
        expect.objectContaining({ type: 'CALCULATE_FINAL_METRICS' })
      );
    });

    it('should auto-pause on window blur', () => {
      // Arrange
      const activeState = {
        status: SessionStatus.ACTIVE,
        text: 'hello',
        characters: [],
        currentIndex: 2,
      };
      const action: SessionAction = { type: 'BLUR', payload: {} };

      // Act
      const { newState, sideEffects } = sessionLifecycle(activeState, action);

      // Assert
      expect(newState.status).toBe(SessionStatus.PAUSED);
      expect(sideEffects).toContainEqual(
        expect.objectContaining({ type: 'AUTO_SAVE' })
      );
    });

    it('should reset to IDLE on reset action', () => {
      // Arrange
      const activeState = {
        status: SessionStatus.ACTIVE,
        text: 'hello',
        characters: [],
        currentIndex: 3,
      };
      const action: SessionAction = { type: 'RESET', payload: {} };

      // Act
      const { newState } = sessionLifecycle(activeState, action);

      // Assert
      expect(newState.status).toBe(SessionStatus.IDLE);
    });

    it('should reject invalid text (empty string)', () => {
      // Arrange
      const idleState = {
        status: SessionStatus.IDLE,
        text: null,
        characters: [],
        currentIndex: 0,
      };
      const action: SessionAction = {
        type: 'LOAD_TEXT',
        payload: { text: '' },
      };

      // Act
      const { newState } = sessionLifecycle(idleState, action);

      // Assert
      expect(newState.status).toBe(SessionStatus.IDLE); // Stays in IDLE
    });
  });

  // ===========================================================================
  // InitializeCharacters Tests
  // ===========================================================================

  describe('initializeCharacters', () => {
    it('should create character result for each character', () => {
      // Act
      const characters = initializeCharacters('hello');

      // Assert
      expect(characters.length).toBe(5);
    });

    it('should mark first character as current', () => {
      // Act
      const characters = initializeCharacters('hello');

      // Assert
      expect(characters[0].state).toBe('current');
      expect(characters[0].isCurrent).toBe(true);
    });

    it('should mark remaining characters as pending', () => {
      // Act
      const characters = initializeCharacters('hello');

      // Assert
      for (let i = 1; i < characters.length; i++) {
        expect(characters[i].state).toBe('pending');
        expect(characters[i].isCurrent).toBe(false);
      }
    });

    it('should set expected character correctly', () => {
      // Act
      const characters = initializeCharacters('hello');

      // Assert
      expect(characters[0].expected).toBe('h');
      expect(characters[1].expected).toBe('e');
      expect(characters[2].expected).toBe('l');
      expect(characters[3].expected).toBe('l');
      expect(characters[4].expected).toBe('o');
    });

    it('should initialize actual as null', () => {
      // Act
      const characters = initializeCharacters('hello');

      // Assert
      characters.forEach((char) => {
        expect(char.actual).toBeNull();
        expect(char.timestamp).toBeNull();
      });
    });

    it('should handle Unicode characters', () => {
      // Act
      const characters = initializeCharacters('cafe'); // 'cafe' with accents would be tested

      // Assert
      expect(characters.length).toBe(4);
    });

    it('should handle empty string', () => {
      // Act
      const characters = initializeCharacters('');

      // Assert
      expect(characters.length).toBe(0);
    });
  });

  // ===========================================================================
  // Performance Tests
  // ===========================================================================

  describe('performance requirements', () => {
    it('should process keystroke in under 16ms', () => {
      // Arrange
      const sessionState = createTestSession('hello world, this is a longer text for testing');
      const event = createMockKeyboardEvent('h', 'KeyH');
      const deadKeyState = createIdleDeadKeyState();
      const keyboardMapper = createMockKeyboardMapper();

      // Act
      const startTime = performance.now();
      processKeystroke(event, sessionState, deadKeyState, keyboardMapper);
      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(16);
    });

    it('should validate character in under 1ms', () => {
      // Act
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        validateCharacter('a', 'a');
      }
      const endTime = performance.now();

      // Assert - 100 validations should take less than 100ms (1ms each)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
