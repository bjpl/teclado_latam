/**
 * @file dead-keys.test.ts
 * @description Comprehensive TDD test suite for the dead key state machine.
 *
 * These tests are written BEFORE implementation (TDD red phase).
 * All tests are expected to FAIL until the dead key handler is implemented.
 *
 * Tests cover:
 * - Dead key state machine transitions (IDLE -> AWAITING_BASE -> IDLE)
 * - Accent composition (acute, dieresis, grave, circumflex, tilde)
 * - Non-composable character handling
 * - Timeout behavior
 * - Edge cases and special scenarios
 *
 * @see docs/sparc/03-pseudocode.md Section 3 (Dead Key State Machine)
 * @see docs/sparc/03-pseudocode-keyboard.md Section 6 (Dead Key State Machine)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Types to be implemented
import type {
  DeadKeyState,
  DeadKeyType,
  DeadKeyResult,
  ModifierState,
} from '../types';

import {
  handleDeadKey,
  isDeadKeyCode,
  composeWithDeadKey,
  getDeadKeyVisual,
  DeadKeyStatus,
  DEAD_KEY_TIMEOUT,
} from '../dead-keys';

// =============================================================================
// Test Constants
// =============================================================================

/**
 * Dead key composition lookup table for validation
 * Maps dead key type -> base character -> composed character
 */
const EXPECTED_COMPOSITIONS = {
  acute: {
    a: '\u00E1', // a with acute (a)
    e: '\u00E9', // e with acute (e)
    i: '\u00ED', // i with acute (i)
    o: '\u00F3', // o with acute (o)
    u: '\u00FA', // u with acute (u)
    A: '\u00C1', // A with acute
    E: '\u00C9', // E with acute
    I: '\u00CD', // I with acute
    O: '\u00D3', // O with acute
    U: '\u00DA', // U with acute
    ' ': '\u00B4', // Acute accent itself
  },
  dieresis: {
    a: '\u00E4', // a with dieresis
    e: '\u00EB', // e with dieresis
    i: '\u00EF', // i with dieresis
    o: '\u00F6', // o with dieresis
    u: '\u00FC', // u with dieresis (u - common in Spanish)
    A: '\u00C4', // A with dieresis
    E: '\u00CB', // E with dieresis
    I: '\u00CF', // I with dieresis
    O: '\u00D6', // O with dieresis
    U: '\u00DC', // U with dieresis
    ' ': '\u00A8', // Dieresis itself
  },
  grave: {
    a: '\u00E0', // a with grave
    e: '\u00E8', // e with grave
    i: '\u00EC', // i with grave
    o: '\u00F2', // o with grave
    u: '\u00F9', // u with grave
    A: '\u00C0', // A with grave
    E: '\u00C8', // E with grave
    I: '\u00CC', // I with grave
    O: '\u00D2', // O with grave
    U: '\u00D9', // U with grave
    ' ': '\u0060', // Grave accent itself
  },
  circumflex: {
    a: '\u00E2', // a with circumflex
    e: '\u00EA', // e with circumflex
    i: '\u00EE', // i with circumflex
    o: '\u00F4', // o with circumflex
    u: '\u00FB', // u with circumflex
    A: '\u00C2', // A with circumflex
    E: '\u00CA', // E with circumflex
    I: '\u00CE', // I with circumflex
    O: '\u00D4', // O with circumflex
    U: '\u00DB', // U with circumflex
    ' ': '\u005E', // Circumflex itself
  },
  tilde: {
    a: '\u00E3', // a with tilde
    n: '\u00F1', // n with tilde (n - important for Spanish!)
    o: '\u00F5', // o with tilde
    A: '\u00C3', // A with tilde
    N: '\u00D1', // N with tilde
    O: '\u00D5', // O with tilde
    ' ': '\u007E', // Tilde itself
  },
} as const;

/**
 * Dead key character representations
 */
const DEAD_KEY_CHARS = {
  acute: '\u00B4', // Acute accent
  dieresis: '\u00A8', // Dieresis
  grave: '\u0060', // Grave accent
  circumflex: '\u005E', // Circumflex
  tilde: '\u007E', // Tilde
} as const;

// =============================================================================
// Test Fixtures and Helpers
// =============================================================================

/**
 * Create an idle dead key state
 */
function createIdleState(): DeadKeyState {
  return {
    status: DeadKeyStatus.IDLE,
    type: null,
    pendingChar: null,
    timestamp: null,
  };
}

/**
 * Create a pending dead key state
 */
function createPendingState(
  type: DeadKeyType,
  timestamp: number = Date.now()
): DeadKeyState {
  return {
    status: DeadKeyStatus.AWAITING_BASE,
    type,
    pendingChar: DEAD_KEY_CHARS[type],
    timestamp,
  };
}

/**
 * Create modifier state
 */
function createModifiers(
  options: Partial<ModifierState> = {}
): ModifierState {
  return {
    shift: options.shift ?? false,
    altGr: options.altGr ?? false,
    ctrl: options.ctrl ?? false,
    meta: options.meta ?? false,
  };
}

// =============================================================================
// DeadKeyHandler Tests
// =============================================================================

describe('DeadKeyHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Acute Accent Composition Tests
  // ===========================================================================

  describe('acute accent composition', () => {
    it('should compose acute accent with vowel a (acute + a = a with acute)', () => {
      // Arrange
      const state = createPendingState('acute');
      const inputChar = 'a';

      // Act
      const result = handleDeadKey('KeyA', inputChar, state, false, null);

      // Assert
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
      expect(result.outputChar).toBe('\u00E1'); // a with acute
    });

    it('should compose acute accent with vowel e (acute + e = e with acute)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyE', 'e', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00E9'); // e with acute
    });

    it('should compose acute accent with vowel i (acute + i = i with acute)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyI', 'i', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00ED'); // i with acute
    });

    it('should compose acute accent with vowel o (acute + o = o with acute)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyO', 'o', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00F3'); // o with acute
    });

    it('should compose acute accent with vowel u (acute + u = u with acute)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyU', 'u', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00FA'); // u with acute
    });

    it('should compose uppercase vowels with acute accent', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act - uppercase A
      const result = handleDeadKey('KeyA', 'A', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00C1'); // A with acute
    });

    it('should output acute accent on space', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('Space', ' ', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00B4'); // Acute accent
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
    });
  });

  // ===========================================================================
  // Dieresis Composition Tests
  // ===========================================================================

  describe('dieresis composition', () => {
    it('should compose dieresis with u (dieresis + u = u with dieresis)', () => {
      // Arrange
      const state = createPendingState('dieresis');

      // Act
      const result = handleDeadKey('KeyU', 'u', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00FC'); // u with dieresis
    });

    it('should compose dieresis with uppercase U', () => {
      // Arrange
      const state = createPendingState('dieresis');

      // Act
      const result = handleDeadKey('KeyU', 'U', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00DC'); // U with dieresis
    });

    it('should compose dieresis with all vowels', () => {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const expectedResults = ['\u00E4', '\u00EB', '\u00EF', '\u00F6', '\u00FC'];

      for (let i = 0; i < vowels.length; i++) {
        // Arrange
        const state = createPendingState('dieresis');

        // Act
        const result = handleDeadKey(`Key${vowels[i].toUpperCase()}`, vowels[i], state, false, null);

        // Assert
        expect(result.outputChar).toBe(expectedResults[i]);
      }
    });

    it('should output dieresis on space', () => {
      // Arrange
      const state = createPendingState('dieresis');

      // Act
      const result = handleDeadKey('Space', ' ', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00A8'); // Dieresis
    });
  });

  // ===========================================================================
  // Non-Composable Character Handling
  // ===========================================================================

  describe('non-composable characters', () => {
    it('should output both chars for non-composable (acute + b = acute + b)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyB', 'b', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00B4b'); // Acute + b
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
    });

    it('should output both chars for consonants (acute + t = acute + t)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyT', 't', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00B4t');
    });

    it('should output both chars for numbers (acute + 1 = acute + 1)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('Digit1', '1', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00B41');
    });

    it('should output both chars for special characters (acute + @ = acute + @)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('KeyQ', '@', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00B4@');
    });
  });

  // ===========================================================================
  // Double Dead Key Press
  // ===========================================================================

  describe('double dead key press', () => {
    it('should output literal on double dead key (acute + acute = acute)', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act - press acute again while in AWAITING_BASE for acute
      const result = handleDeadKey('BracketLeft', '\u00B4', state, true, 'acute');

      // Assert
      expect(result.outputChar).toBe('\u00B4'); // Just the acute accent
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
    });

    it('should output literal on double dieresis', () => {
      // Arrange
      const state = createPendingState('dieresis');

      // Act
      const result = handleDeadKey('BracketLeft', '\u00A8', state, true, 'dieresis');

      // Assert
      expect(result.outputChar).toBe('\u00A8'); // Dieresis
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
    });
  });

  // ===========================================================================
  // Different Dead Key in Sequence
  // ===========================================================================

  describe('different dead key in sequence', () => {
    it('should output first dead key and start new pending state for different dead key', () => {
      // Arrange - pending acute
      const state = createPendingState('acute');

      // Act - press dieresis (different dead key)
      const result = handleDeadKey('BracketLeft', '\u00A8', state, true, 'dieresis');

      // Assert
      expect(result.outputChar).toBe('\u00B4'); // Output the pending acute
      expect(result.newState.status).toBe(DeadKeyStatus.AWAITING_BASE);
      expect(result.newState.type).toBe('dieresis'); // Now waiting for dieresis composition
    });
  });

  // ===========================================================================
  // Timeout Behavior
  // ===========================================================================

  describe('timeout behavior', () => {
    it('should timeout and reset after 5 seconds', () => {
      // Arrange
      const initialTimestamp = Date.now();
      const state = createPendingState('acute', initialTimestamp);

      // Advance time by 5+ seconds
      vi.advanceTimersByTime(5001);

      // Act - now press any key
      const currentTime = Date.now();
      const result = handleDeadKey('KeyA', 'a', state, false, null);

      // Assert - should output dead key char + new char due to timeout
      expect(result.outputChar).toBe('\u00B4a'); // acute + a (not composed)
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
    });

    it('should compose normally within timeout window', () => {
      // Arrange
      const initialTimestamp = Date.now();
      const state = createPendingState('acute', initialTimestamp);

      // Advance time by less than 5 seconds
      vi.advanceTimersByTime(2000);

      // Act
      const result = handleDeadKey('KeyA', 'a', state, false, null);

      // Assert - should compose normally
      expect(result.outputChar).toBe('\u00E1'); // a with acute (composed)
    });
  });

  // ===========================================================================
  // Idle State Transitions
  // ===========================================================================

  describe('IDLE state transitions', () => {
    it('should enter AWAITING_BASE state on dead key press', () => {
      // Arrange
      const state = createIdleState();

      // Act
      const result = handleDeadKey('BracketLeft', '\u00B4', state, true, 'acute');

      // Assert
      expect(result.newState.status).toBe(DeadKeyStatus.AWAITING_BASE);
      expect(result.newState.type).toBe('acute');
      expect(result.outputChar).toBeNull(); // No output yet
    });

    it('should pass through normal characters in IDLE state', () => {
      // Arrange
      const state = createIdleState();

      // Act
      const result = handleDeadKey('KeyA', 'a', state, false, null);

      // Assert
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
      expect(result.outputChar).toBe('a');
    });
  });

  // ===========================================================================
  // All Spanish Accented Vowels
  // ===========================================================================

  describe('Spanish accented vowels completeness', () => {
    it('should handle all Spanish accented vowels (lowercase)', () => {
      const testCases = [
        { deadKey: 'acute' as const, base: 'a', expected: '\u00E1' },
        { deadKey: 'acute' as const, base: 'e', expected: '\u00E9' },
        { deadKey: 'acute' as const, base: 'i', expected: '\u00ED' },
        { deadKey: 'acute' as const, base: 'o', expected: '\u00F3' },
        { deadKey: 'acute' as const, base: 'u', expected: '\u00FA' },
        { deadKey: 'dieresis' as const, base: 'u', expected: '\u00FC' },
      ];

      for (const { deadKey, base, expected } of testCases) {
        // Arrange
        const state = createPendingState(deadKey);

        // Act
        const result = handleDeadKey(`Key${base.toUpperCase()}`, base, state, false, null);

        // Assert
        expect(result.outputChar).toBe(expected);
      }
    });

    it('should handle all Spanish accented vowels (uppercase)', () => {
      const testCases = [
        { deadKey: 'acute' as const, base: 'A', expected: '\u00C1' },
        { deadKey: 'acute' as const, base: 'E', expected: '\u00C9' },
        { deadKey: 'acute' as const, base: 'I', expected: '\u00CD' },
        { deadKey: 'acute' as const, base: 'O', expected: '\u00D3' },
        { deadKey: 'acute' as const, base: 'U', expected: '\u00DA' },
        { deadKey: 'dieresis' as const, base: 'U', expected: '\u00DC' },
      ];

      for (const { deadKey, base, expected } of testCases) {
        // Arrange
        const state = createPendingState(deadKey);

        // Act
        const result = handleDeadKey(`Key${base}`, base, state, false, null);

        // Assert
        expect(result.outputChar).toBe(expected);
      }
    });
  });

  // ===========================================================================
  // Special Cases
  // ===========================================================================

  describe('special cases', () => {
    it('should handle Escape key to cancel dead key', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('Escape', '', state, false, null);

      // Assert
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
      expect(result.outputChar).toBeNull(); // Cancel without output
    });

    it('should handle Backspace key to cancel dead key', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('Backspace', '', state, false, null);

      // Assert
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
      expect(result.outputChar).toBeNull();
      expect(result.isBackspace).toBe(true);
    });

    it('should handle Enter key after dead key', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const result = handleDeadKey('Enter', '\n', state, false, null);

      // Assert
      // Enter is non-composable, so output dead key + newline behavior
      expect(result.newState.status).toBe(DeadKeyStatus.IDLE);
    });
  });

  // ===========================================================================
  // isDeadKeyCode Tests
  // ===========================================================================

  describe('isDeadKeyCode', () => {
    it('should identify BracketLeft as acute dead key (no modifiers)', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = isDeadKeyCode('BracketLeft', modifiers);

      // Assert
      expect(result.isDeadKey).toBe(true);
      expect(result.deadKeyType).toBe('acute');
    });

    it('should identify Shift+BracketLeft as dieresis dead key', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = isDeadKeyCode('BracketLeft', modifiers);

      // Assert
      expect(result.isDeadKey).toBe(true);
      expect(result.deadKeyType).toBe('dieresis');
    });

    it('should NOT identify BracketLeft as dead key with AltGr', () => {
      // Arrange - AltGr+BracketLeft produces '[', not a dead key
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = isDeadKeyCode('BracketLeft', modifiers);

      // Assert
      expect(result.isDeadKey).toBe(false);
    });

    it('should identify regular keys as non-dead keys', () => {
      // Arrange
      const modifiers = createModifiers();
      const regularKeys = ['KeyA', 'KeyB', 'Digit1', 'Space', 'Enter'];

      for (const code of regularKeys) {
        // Act
        const result = isDeadKeyCode(code, modifiers);

        // Assert
        expect(result.isDeadKey).toBe(false);
        expect(result.deadKeyType).toBeNull();
      }
    });
  });

  // ===========================================================================
  // composeWithDeadKey Tests
  // ===========================================================================

  describe('composeWithDeadKey', () => {
    it('should compose all valid acute combinations', () => {
      const compositions = EXPECTED_COMPOSITIONS.acute;

      for (const [base, expected] of Object.entries(compositions)) {
        // Act
        const result = composeWithDeadKey('acute', base);

        // Assert
        expect(result).toBe(expected);
      }
    });

    it('should compose all valid dieresis combinations', () => {
      const compositions = EXPECTED_COMPOSITIONS.dieresis;

      for (const [base, expected] of Object.entries(compositions)) {
        // Act
        const result = composeWithDeadKey('dieresis', base);

        // Assert
        expect(result).toBe(expected);
      }
    });

    it('should return null for invalid compositions', () => {
      // Act
      const result = composeWithDeadKey('acute', 'b');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for unknown dead key types', () => {
      // Act
      const result = composeWithDeadKey('unknown' as DeadKeyType, 'a');

      // Assert
      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // getDeadKeyVisual Tests
  // ===========================================================================

  describe('getDeadKeyVisual', () => {
    it('should return correct visual for acute', () => {
      expect(getDeadKeyVisual('acute')).toBe('\u00B4');
    });

    it('should return correct visual for dieresis', () => {
      expect(getDeadKeyVisual('dieresis')).toBe('\u00A8');
    });

    it('should return correct visual for grave', () => {
      expect(getDeadKeyVisual('grave')).toBe('\u0060');
    });

    it('should return correct visual for circumflex', () => {
      expect(getDeadKeyVisual('circumflex')).toBe('\u005E');
    });

    it('should return correct visual for tilde', () => {
      expect(getDeadKeyVisual('tilde')).toBe('\u007E');
    });

    it('should return empty string for unknown type', () => {
      expect(getDeadKeyVisual('unknown' as DeadKeyType)).toBe('');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('should handle rapid successive dead key presses', () => {
      // Arrange
      let state = createIdleState();

      // Act - press acute, then immediately dieresis, then a
      const result1 = handleDeadKey('BracketLeft', '\u00B4', state, true, 'acute');
      const result2 = handleDeadKey('BracketLeft', '\u00A8', result1.newState, true, 'dieresis');
      const result3 = handleDeadKey('KeyA', 'a', result2.newState, false, null);

      // Assert
      expect(result1.outputChar).toBeNull(); // Waiting
      expect(result2.outputChar).toBe('\u00B4'); // Output acute
      expect(result3.outputChar).toBe('\u00E4'); // a with dieresis
    });

    it('should handle dead key followed by Enter then continue', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act - Enter doesn't compose
      const result1 = handleDeadKey('Enter', '\n', state, false, null);

      // Assert
      expect(result1.newState.status).toBe(DeadKeyStatus.IDLE);
    });

    it('should maintain composition across modifier changes', () => {
      // Arrange - acute dead key pressed
      const state = createPendingState('acute');

      // Act - press Shift+A (uppercase A)
      const result = handleDeadKey('KeyA', 'A', state, false, null);

      // Assert
      expect(result.outputChar).toBe('\u00C1'); // A with acute
    });
  });

  // ===========================================================================
  // Performance
  // ===========================================================================

  describe('performance', () => {
    it('should process dead key composition in under 1ms', () => {
      // Arrange
      const state = createPendingState('acute');

      // Act
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        handleDeadKey('KeyA', 'a', state, false, null);
      }
      const end = performance.now();

      // Assert - 100 compositions should take less than 100ms
      expect(end - start).toBeLessThan(100);
    });

    it('should perform lookup in constant time', () => {
      // Act
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        composeWithDeadKey('acute', 'a');
        composeWithDeadKey('dieresis', 'u');
        composeWithDeadKey('acute', 'e');
      }
      const end = performance.now();

      // Assert - 3000 lookups should be very fast (O(1))
      expect(end - start).toBeLessThan(50);
    });
  });
});
