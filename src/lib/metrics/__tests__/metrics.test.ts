/**
 * @file metrics.test.ts
 * @description Comprehensive TDD test suite for WPM and accuracy calculations.
 *
 * These tests are written BEFORE implementation (TDD red phase).
 * All tests are expected to FAIL until the metrics calculator is implemented.
 *
 * Tests cover:
 * - Gross WPM calculation (characters / 5 / minutes)
 * - Net WPM calculation (with error penalty)
 * - Rolling WPM over sliding time window
 * - Overall accuracy calculation
 * - Per-character accuracy tracking
 * - Problem character identification
 * - Edge cases and error handling
 *
 * @see docs/sparc/03-pseudocode.md Section 4-5 (WPM and Accuracy Calculator)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Types to be implemented
import type {
  WPMResult,
  AccuracyResult,
  Keystroke,
  CharacterTracker,
  CharacterAttempts,
  ErrorPattern,
} from '../types';

import {
  calculateWPM,
  calculateRollingWPM,
  calculateAccuracy,
  trackCharacterAttempt,
  identifyErrorPatterns,
  generateImprovementSuggestions,
  CHARS_PER_WORD,
  PROBLEMATIC_THRESHOLD,
  MIN_ATTEMPTS_FOR_FLAG,
  ROLLING_WPM_WINDOW_MS,
} from '../metrics';

// =============================================================================
// Test Constants
// =============================================================================

/**
 * Standard characters per word (industry standard)
 */
const EXPECTED_CHARS_PER_WORD = 5;

/**
 * Rolling WPM window size (30 seconds)
 */
const EXPECTED_WINDOW_MS = 30000;

// =============================================================================
// Test Fixtures and Helpers
// =============================================================================

/**
 * Create a mock keystroke
 */
function createKeystroke(
  timestamp: number,
  isCorrect: boolean = true
): Keystroke {
  return {
    timestamp,
    isCorrect,
    character: 'a', // Default character
  };
}

/**
 * Create a series of keystrokes for rolling WPM testing
 */
function createKeystrokeSequence(
  count: number,
  startTime: number,
  intervalMs: number,
  correctRate: number = 1.0
): Keystroke[] {
  const keystrokes: Keystroke[] = [];
  for (let i = 0; i < count; i++) {
    const isCorrect = Math.random() < correctRate;
    keystrokes.push(createKeystroke(startTime + i * intervalMs, isCorrect));
  }
  return keystrokes;
}

/**
 * Create a character tracker for testing
 */
function createCharacterTracker(): CharacterTracker {
  return {
    attempts: new Map<string, CharacterAttempts>(),
    totalCorrect: 0,
    totalAttempts: 0,
  };
}

// =============================================================================
// WPM Calculation Tests
// =============================================================================

describe('MetricsCalculator', () => {
  describe('calculateWPM', () => {
    // =========================================================================
    // Standard WPM Calculation
    // =========================================================================

    it('should calculate gross WPM correctly (chars/5/minutes)', () => {
      // Arrange
      const charactersTyped = 50; // 10 words
      const errors = 0;
      const elapsedMs = 60000; // 1 minute

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(10.0);
    });

    it('should calculate net WPM with error penalty', () => {
      // Arrange
      const charactersTyped = 50; // 10 words
      const errors = 5; // 1 word penalty
      const elapsedMs = 60000; // 1 minute

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(10.0);
      expect(result.netWPM).toBe(9.0); // 10 - 1 error penalty
    });

    it('should calculate CPM (characters per minute) correctly', () => {
      // Arrange
      const charactersTyped = 300;
      const errors = 0;
      const elapsedMs = 60000; // 1 minute

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.cpm).toBe(300);
    });

    it('should handle 30 seconds of typing', () => {
      // Arrange
      const charactersTyped = 100; // 20 words
      const errors = 0;
      const elapsedMs = 30000; // 30 seconds = 0.5 minutes

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(40.0); // 20 words / 0.5 minutes = 40 WPM
    });

    it('should round WPM to one decimal place', () => {
      // Arrange: 47 chars / 5 = 9.4 words in 1 minute
      const charactersTyped = 47;
      const errors = 0;
      const elapsedMs = 60000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(9.4);
    });

    // =========================================================================
    // Edge Cases
    // =========================================================================

    it('should handle zero time edge case', () => {
      // Arrange
      const charactersTyped = 50;
      const errors = 0;
      const elapsedMs = 0;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(0);
      expect(result.netWPM).toBe(0);
      expect(result.cpm).toBe(0);
    });

    it('should handle zero characters typed', () => {
      // Arrange
      const charactersTyped = 0;
      const errors = 0;
      const elapsedMs = 60000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(0);
      expect(result.netWPM).toBe(0);
    });

    it('should handle negative time gracefully', () => {
      // Arrange
      const charactersTyped = 50;
      const errors = 0;
      const elapsedMs = -1000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(0);
      expect(result.netWPM).toBe(0);
    });

    it('should never return negative net WPM (more errors than words)', () => {
      // Arrange: 10 characters = 2 words, but 10 errors
      const charactersTyped = 10;
      const errors = 100;
      const elapsedMs = 60000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.netWPM).toBeGreaterThanOrEqual(0);
    });

    it('should use standard 5 characters per word', () => {
      // Verify constant
      expect(CHARS_PER_WORD).toBe(5);
    });

    // =========================================================================
    // Real-World Scenarios
    // =========================================================================

    it('should calculate typical beginner speed (20-30 WPM)', () => {
      // Arrange: Beginner types 125 chars in 1 minute with 5 errors
      const charactersTyped = 125; // 25 words
      const errors = 5; // 1 word penalty (5 errors / 5 chars per word)
      const elapsedMs = 60000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(25.0);
      expect(result.netWPM).toBe(24.0); // 25 - 1 word penalty
    });

    it('should calculate typical intermediate speed (40-60 WPM)', () => {
      // Arrange: Intermediate types 250 chars in 1 minute with 3 errors
      const charactersTyped = 250; // 50 words
      const errors = 3; // 0.6 word penalty (3 errors / 5 chars per word)
      const elapsedMs = 60000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(50.0);
      expect(result.netWPM).toBe(49.4); // 50 - 0.6 word penalty
    });

    it('should calculate expert speed (80+ WPM)', () => {
      // Arrange: Expert types 400 chars in 1 minute with 2 errors
      const charactersTyped = 400; // 80 words
      const errors = 2; // 0.4 word penalty (2 errors / 5 chars per word)
      const elapsedMs = 60000;

      // Act
      const result = calculateWPM(charactersTyped, errors, elapsedMs);

      // Assert
      expect(result.grossWPM).toBe(80.0);
      expect(result.netWPM).toBe(79.6); // 80 - 0.4 word penalty
    });
  });

  // ===========================================================================
  // Rolling WPM Tests
  // ===========================================================================

  describe('calculateRollingWPM', () => {
    it('should calculate rolling WPM over 30-second window', () => {
      // Arrange: 100 keystrokes over 30 seconds
      const currentTime = Date.now();
      const keystrokes = createKeystrokeSequence(100, currentTime - 30000, 300);

      // Act
      const result = calculateRollingWPM(keystrokes, EXPECTED_WINDOW_MS, currentTime);

      // Assert
      expect(result.grossWPM).toBeGreaterThan(0);
    });

    it('should return zero with fewer than 2 keystrokes', () => {
      // Arrange
      const keystrokes = [createKeystroke(Date.now())];

      // Act
      const result = calculateRollingWPM(keystrokes, EXPECTED_WINDOW_MS, Date.now());

      // Assert
      expect(result.grossWPM).toBe(0);
      expect(result.netWPM).toBe(0);
    });

    it('should return zero with empty keystrokes array', () => {
      // Arrange
      const keystrokes: Keystroke[] = [];

      // Act
      const result = calculateRollingWPM(keystrokes, EXPECTED_WINDOW_MS, Date.now());

      // Assert
      expect(result.grossWPM).toBe(0);
    });

    it('should only include keystrokes within the window', () => {
      // Arrange: Old keystrokes + recent keystrokes
      const currentTime = Date.now();
      const oldKeystrokes = createKeystrokeSequence(50, currentTime - 60000, 200); // 60s ago
      const recentKeystrokes = createKeystrokeSequence(50, currentTime - 15000, 300); // 15s ago
      const allKeystrokes = [...oldKeystrokes, ...recentKeystrokes];

      // Act
      const result = calculateRollingWPM(allKeystrokes, EXPECTED_WINDOW_MS, currentTime);

      // Assert - should only consider recent keystrokes
      // 50 chars over ~15 seconds = 200 CPM = 40 WPM
      // If all 100 were counted over 60s, that would be 100 CPM = 20 WPM (lower due to longer time)
      // So we verify we're seeing the recent-only rate, not all-keystrokes rate
      expect(result.grossWPM).toBeLessThanOrEqual(40); // Would be ~20 WPM if calculated over full 60s span
      expect(result.grossWPM).toBeGreaterThan(20); // Confirms we're using recent window, not full span
    });

    it('should return zero if all keystrokes are outside window', () => {
      // Arrange: All keystrokes from 60 seconds ago
      const currentTime = Date.now();
      const oldKeystrokes = createKeystrokeSequence(100, currentTime - 60000, 200);

      // Act
      const result = calculateRollingWPM(oldKeystrokes, EXPECTED_WINDOW_MS, currentTime);

      // Assert
      expect(result.grossWPM).toBe(0);
    });

    it('should account for errors in rolling WPM', () => {
      // Arrange: 100 keystrokes, 50% error rate
      const currentTime = Date.now();
      const keystrokes = createKeystrokeSequence(100, currentTime - 30000, 300, 0.5);
      const errorCount = keystrokes.filter(k => !k.isCorrect).length;

      // Act
      const result = calculateRollingWPM(keystrokes, EXPECTED_WINDOW_MS, currentTime);

      // Assert
      expect(result.netWPM).toBeLessThan(result.grossWPM);
    });

    it('should handle default window size of 30 seconds', () => {
      expect(ROLLING_WPM_WINDOW_MS).toBe(30000);
    });
  });

  // ===========================================================================
  // Accuracy Calculation Tests
  // ===========================================================================

  describe('calculateAccuracy', () => {
    it('should return 100% for no errors', () => {
      // Arrange
      const correctKeystrokes = 100;
      const totalKeystrokes = 100;
      const characterAttempts = new Map<string, CharacterAttempts>();

      // Act
      const result = calculateAccuracy(correctKeystrokes, totalKeystrokes, characterAttempts);

      // Assert
      expect(result.overall).toBe(100.0);
    });

    it('should calculate percentage correctly', () => {
      // Arrange: 90 correct out of 100
      const correctKeystrokes = 90;
      const totalKeystrokes = 100;
      const characterAttempts = new Map<string, CharacterAttempts>();

      // Act
      const result = calculateAccuracy(correctKeystrokes, totalKeystrokes, characterAttempts);

      // Assert
      expect(result.overall).toBe(90.0);
    });

    it('should handle zero total keystrokes', () => {
      // Arrange
      const correctKeystrokes = 0;
      const totalKeystrokes = 0;
      const characterAttempts = new Map<string, CharacterAttempts>();

      // Act
      const result = calculateAccuracy(correctKeystrokes, totalKeystrokes, characterAttempts);

      // Assert
      expect(result.overall).toBe(100.0); // No errors possible
    });

    it('should round accuracy to one decimal place', () => {
      // Arrange: 87/100 = 87.0%
      const correctKeystrokes = 87;
      const totalKeystrokes = 100;
      const characterAttempts = new Map<string, CharacterAttempts>();

      // Act
      const result = calculateAccuracy(correctKeystrokes, totalKeystrokes, characterAttempts);

      // Assert
      expect(result.overall).toBe(87.0);
    });

    // =========================================================================
    // Per-Character Accuracy
    // =========================================================================

    it('should track per-character accuracy', () => {
      // Arrange
      const characterAttempts = new Map<string, CharacterAttempts>([
        ['a', { correct: 9, total: 10 }],
        ['e', { correct: 10, total: 10 }],
        ['n', { correct: 5, total: 10 }], // n with tilde - problematic
      ]);

      // Act
      const result = calculateAccuracy(24, 30, characterAttempts);

      // Assert
      expect(result.perCharacter.get('a')).toBe(90.0);
      expect(result.perCharacter.get('e')).toBe(100.0);
      expect(result.perCharacter.get('n')).toBe(50.0);
    });

    // =========================================================================
    // Problem Character Identification
    // =========================================================================

    it('should identify problem characters (below 90% threshold)', () => {
      // Arrange
      const characterAttempts = new Map<string, CharacterAttempts>([
        ['a', { correct: 9, total: 10 }], // 90% - at threshold
        ['e', { correct: 10, total: 10 }], // 100%
        ['n', { correct: 5, total: 10 }], // 50% - problematic
        ['o', { correct: 7, total: 10 }], // 70% - problematic
      ]);

      // Act
      const result = calculateAccuracy(31, 40, characterAttempts);

      // Assert
      expect(result.problematicChars).toContain('n');
      expect(result.problematicChars).toContain('o');
      expect(result.problematicChars).not.toContain('a');
      expect(result.problematicChars).not.toContain('e');
    });

    it('should require minimum attempts before flagging as problematic', () => {
      // Arrange: Character with only 2 attempts (below MIN_ATTEMPTS_FOR_FLAG = 3)
      const characterAttempts = new Map<string, CharacterAttempts>([
        ['x', { correct: 0, total: 2 }], // 0% but only 2 attempts
      ]);

      // Act
      const result = calculateAccuracy(0, 2, characterAttempts);

      // Assert
      expect(result.problematicChars).not.toContain('x');
    });

    it('should flag character with 3+ attempts and low accuracy', () => {
      // Arrange: Character with 3 attempts
      const characterAttempts = new Map<string, CharacterAttempts>([
        ['x', { correct: 1, total: 3 }], // 33% with 3 attempts
      ]);

      // Act
      const result = calculateAccuracy(1, 3, characterAttempts);

      // Assert
      expect(result.problematicChars).toContain('x');
    });

    it('should identify top 5 most missed characters', () => {
      // Arrange: Multiple characters with varying accuracy
      const characterAttempts = new Map<string, CharacterAttempts>([
        ['a', { correct: 3, total: 10 }], // 30%
        ['b', { correct: 4, total: 10 }], // 40%
        ['c', { correct: 5, total: 10 }], // 50%
        ['d', { correct: 6, total: 10 }], // 60%
        ['e', { correct: 7, total: 10 }], // 70%
        ['f', { correct: 8, total: 10 }], // 80%
        ['g', { correct: 9, total: 10 }], // 90%
      ]);

      // Act
      const result = calculateAccuracy(42, 70, characterAttempts);

      // Assert
      expect(result.mostMissed.length).toBeLessThanOrEqual(5);
      expect(result.mostMissed[0]).toBe('a'); // Worst first
    });

    it('should use correct thresholds', () => {
      expect(PROBLEMATIC_THRESHOLD).toBe(90.0);
      expect(MIN_ATTEMPTS_FOR_FLAG).toBe(3);
    });
  });

  // ===========================================================================
  // Character Tracking Tests
  // ===========================================================================

  describe('trackCharacterAttempt', () => {
    let tracker: CharacterTracker;

    beforeEach(() => {
      tracker = createCharacterTracker();
    });

    it('should create new entry for first attempt', () => {
      // Arrange
      const expectedChar = 'a';
      const actualChar = 'a';
      const isCorrect = true;

      // Act
      const updated = trackCharacterAttempt(tracker, expectedChar, actualChar, isCorrect);

      // Assert
      expect(updated.attempts.get('a')).toEqual({ correct: 1, total: 1 });
    });

    it('should increment counts for correct attempt', () => {
      // Arrange
      tracker.attempts.set('a', { correct: 5, total: 8 });
      tracker.totalCorrect = 5;
      tracker.totalAttempts = 8;

      // Act
      const updated = trackCharacterAttempt(tracker, 'a', 'a', true);

      // Assert
      expect(updated.attempts.get('a')).toEqual({ correct: 6, total: 9 });
      expect(updated.totalCorrect).toBe(6);
      expect(updated.totalAttempts).toBe(9);
    });

    it('should increment only total for incorrect attempt', () => {
      // Arrange
      tracker.attempts.set('a', { correct: 5, total: 8 });
      tracker.totalCorrect = 5;
      tracker.totalAttempts = 8;

      // Act
      const updated = trackCharacterAttempt(tracker, 'a', 'b', false);

      // Assert
      expect(updated.attempts.get('a')).toEqual({ correct: 5, total: 9 });
      expect(updated.totalCorrect).toBe(5);
      expect(updated.totalAttempts).toBe(9);
    });

    it('should track multiple characters independently', () => {
      // Act
      let updated = trackCharacterAttempt(tracker, 'a', 'a', true);
      updated = trackCharacterAttempt(updated, 'b', 'b', true);
      updated = trackCharacterAttempt(updated, 'a', 'a', true);

      // Assert
      expect(updated.attempts.get('a')).toEqual({ correct: 2, total: 2 });
      expect(updated.attempts.get('b')).toEqual({ correct: 1, total: 1 });
    });
  });

  // ===========================================================================
  // Error Pattern Identification Tests
  // ===========================================================================

  describe('identifyErrorPatterns', () => {
    it('should group errors by expected character', () => {
      // Arrange
      const errorLog = [
        { expected: 'a', actual: 's', timestamp: 1000 },
        { expected: 'a', actual: 's', timestamp: 2000 },
        { expected: 'a', actual: 'd', timestamp: 3000 },
        { expected: 'b', actual: 'v', timestamp: 4000 },
      ];

      // Act
      const patterns = identifyErrorPatterns(errorLog);

      // Assert
      const patternA = patterns.find(p => p.expected === 'a');
      expect(patternA?.frequency).toBe(3);
      expect(patternA?.commonMistakes).toContain('s');
    });

    it('should identify most common substitution', () => {
      // Arrange
      const errorLog = [
        { expected: 'n', actual: 'm', timestamp: 1000 },
        { expected: 'n', actual: 'm', timestamp: 2000 },
        { expected: 'n', actual: 'b', timestamp: 3000 },
      ];

      // Act
      const patterns = identifyErrorPatterns(errorLog);

      // Assert
      const patternN = patterns.find(p => p.expected === 'n');
      expect(patternN?.commonMistakes[0]).toBe('m');
    });

    it('should sort patterns by frequency (most problematic first)', () => {
      // Arrange
      const errorLog = [
        { expected: 'a', actual: 'x', timestamp: 1000 },
        { expected: 'b', actual: 'x', timestamp: 2000 },
        { expected: 'b', actual: 'x', timestamp: 3000 },
        { expected: 'b', actual: 'x', timestamp: 4000 },
      ];

      // Act
      const patterns = identifyErrorPatterns(errorLog);

      // Assert
      expect(patterns[0].expected).toBe('b'); // Most frequent errors
      expect(patterns[1].expected).toBe('a');
    });

    it('should limit to top 3 common mistakes per character', () => {
      // Arrange
      const errorLog = [
        { expected: 'a', actual: 'b', timestamp: 1000 },
        { expected: 'a', actual: 'c', timestamp: 2000 },
        { expected: 'a', actual: 'd', timestamp: 3000 },
        { expected: 'a', actual: 'e', timestamp: 4000 },
        { expected: 'a', actual: 'f', timestamp: 5000 },
      ];

      // Act
      const patterns = identifyErrorPatterns(errorLog);

      // Assert
      expect(patterns[0].commonMistakes.length).toBeLessThanOrEqual(3);
    });

    it('should handle empty error log', () => {
      // Act
      const patterns = identifyErrorPatterns([]);

      // Assert
      expect(patterns).toEqual([]);
    });
  });

  // ===========================================================================
  // Improvement Suggestions Tests
  // ===========================================================================

  describe('generateImprovementSuggestions', () => {
    it('should suggest practice for problematic characters', () => {
      // Arrange
      const errorTracker = {
        byCharacter: new Map([['n', 10]]), // 10 errors on n-tilde
        substitutions: new Map(),
        errors: [],
      };
      const metrics = { wpm: 30, accuracy: 85, duration: 60000 };

      // Act
      const suggestions = generateImprovementSuggestions(errorTracker, metrics);

      // Assert
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.category === 'character-practice')).toBe(true);
    });

    it('should suggest slowing down when WPM high but accuracy low', () => {
      // Arrange
      const errorTracker = { byCharacter: new Map(), substitutions: new Map(), errors: [] };
      const metrics = { wpm: 50, accuracy: 75, duration: 60000 };

      // Act
      const suggestions = generateImprovementSuggestions(errorTracker, metrics);

      // Assert
      expect(suggestions.some(s => s.category === 'pacing')).toBe(true);
      expect(suggestions.some(s => s.message.includes('slowing down'))).toBe(true);
    });

    it('should detect shift key issues', () => {
      // Arrange
      const errorTracker = {
        byCharacter: new Map([
          ['A', 5],
          ['B', 3],
          ['C', 4],
        ]),
        substitutions: new Map([
          ['A', new Map([['a', 5]])], // Lowercase instead of uppercase
          ['B', new Map([['b', 3]])],
          ['C', new Map([['c', 4]])],
        ]),
        errors: [],
      };
      const metrics = { wpm: 30, accuracy: 85, duration: 60000 };

      // Act
      const suggestions = generateImprovementSuggestions(errorTracker, metrics);

      // Assert
      expect(suggestions.some(s => s.category === 'modifier-keys')).toBe(true);
    });

    it('should detect accent/dead key issues', () => {
      // Arrange
      const errorTracker = {
        byCharacter: new Map([
          ['\u00E1', 5], // a with acute
          ['\u00E9', 3], // e with acute
        ]),
        substitutions: new Map(),
        errors: [],
      };
      const metrics = { wpm: 30, accuracy: 85, duration: 60000 };

      // Act
      const suggestions = generateImprovementSuggestions(errorTracker, metrics);

      // Assert
      expect(suggestions.some(s => s.category === 'accents')).toBe(true);
    });

    it('should sort suggestions by priority', () => {
      // Arrange
      const errorTracker = {
        byCharacter: new Map([['a', 20]]),
        substitutions: new Map(),
        errors: [],
      };
      const metrics = { wpm: 50, accuracy: 70, duration: 60000 };

      // Act
      const suggestions = generateImprovementSuggestions(errorTracker, metrics);

      // Assert - high priority should come first
      if (suggestions.length > 1) {
        expect(['high', 'medium', 'low'].indexOf(suggestions[0].priority))
          .toBeLessThanOrEqual(['high', 'medium', 'low'].indexOf(suggestions[1].priority));
      }
    });
  });

  // ===========================================================================
  // Performance Tests
  // ===========================================================================

  describe('performance', () => {
    it('should calculate WPM in under 1ms', () => {
      // Act
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        calculateWPM(500, 10, 60000);
      }
      const end = performance.now();

      // Assert - 1000 calculations should take less than 100ms
      expect(end - start).toBeLessThan(100);
    });

    it('should calculate rolling WPM efficiently for large keystroke arrays', () => {
      // Arrange
      const currentTime = Date.now();
      const keystrokes = createKeystrokeSequence(10000, currentTime - 600000, 60);

      // Act
      const start = performance.now();
      calculateRollingWPM(keystrokes, EXPECTED_WINDOW_MS, currentTime);
      const end = performance.now();

      // Assert - should handle 10000 keystrokes in under 50ms
      expect(end - start).toBeLessThan(50);
    });

    it('should calculate accuracy in under 1ms', () => {
      // Arrange
      const characterAttempts = new Map<string, CharacterAttempts>();
      for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(97 + i);
        characterAttempts.set(char, { correct: 90, total: 100 });
      }

      // Act
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        calculateAccuracy(2340, 2600, characterAttempts);
      }
      const end = performance.now();

      // Assert
      expect(end - start).toBeLessThan(100);
    });
  });

  // ===========================================================================
  // Integration Scenarios
  // ===========================================================================

  describe('integration scenarios', () => {
    it('should handle complete typing session metrics', () => {
      // Arrange: Simulate a 2-minute typing session
      const sessionDuration = 120000; // 2 minutes
      const totalChars = 400; // 80 WPM gross
      const errors = 20; // 5% error rate
      const correctChars = totalChars - errors;

      // Act
      const wpmResult = calculateWPM(totalChars, errors, sessionDuration);
      const accuracyResult = calculateAccuracy(correctChars, totalChars, new Map());

      // Assert
      expect(wpmResult.grossWPM).toBe(40.0); // 400/5/2 = 40
      expect(wpmResult.netWPM).toBe(38.0); // 40 - (20/5/2) = 40 - 2 word penalty
      expect(accuracyResult.overall).toBe(95.0);
    });

    it('should track progress during session with rolling WPM', () => {
      // Arrange: Build up keystrokes over time
      const currentTime = Date.now();
      const keystrokes: Keystroke[] = [];

      // First 10 seconds: slow typing (50 chars)
      for (let i = 0; i < 50; i++) {
        keystrokes.push(createKeystroke(currentTime - 30000 + i * 200, true));
      }

      // Last 20 seconds: faster typing (100 chars)
      for (let i = 0; i < 100; i++) {
        keystrokes.push(createKeystroke(currentTime - 20000 + i * 200, true));
      }

      // Act
      const rollingWPM = calculateRollingWPM(keystrokes, EXPECTED_WINDOW_MS, currentTime);

      // Assert - should show recent performance
      expect(rollingWPM.grossWPM).toBeGreaterThan(0);
    });
  });
});
