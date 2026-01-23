/**
 * @file metrics.ts
 * @description WPM and accuracy calculator for Teclado LATAM.
 *
 * STUB IMPLEMENTATION - TDD Red Phase
 * All functions throw or return minimal values to make tests run.
 *
 * @see docs/sparc/03-pseudocode.md Section 4-5 (WPM and Accuracy Calculator)
 */

import type {
  WPMResult,
  AccuracyResult,
  CharacterAttempts,
  CharacterTracker,
  Keystroke,
  ErrorEntry,
  ErrorPattern,
  Suggestion,
  ErrorTracker,
} from './types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Standard characters per word (industry standard)
 */
export const CHARS_PER_WORD = 5;

/**
 * Rolling WPM window size in milliseconds (30 seconds)
 */
export const ROLLING_WPM_WINDOW_MS = 30000;

/**
 * Accuracy threshold for flagging problematic characters (90%)
 */
export const PROBLEMATIC_THRESHOLD = 90.0;

/**
 * Minimum attempts before flagging a character as problematic
 */
export const MIN_ATTEMPTS_FOR_FLAG = 3;

// =============================================================================
// WPM Calculation
// =============================================================================

/**
 * Calculate Words Per Minute metrics
 *
 * TODO: Implement WPM calculation with:
 * - Gross WPM = (characters / 5) / minutes
 * - Net WPM = Gross WPM - (errors / minutes)
 * - CPM = characters / minutes
 * - Handle edge cases (zero time, negative time)
 * - Round to one decimal place
 *
 * @param charactersTyped - Total characters typed
 * @param errors - Number of uncorrected errors
 * @param elapsedMs - Elapsed time in milliseconds
 * @returns WPM result
 */
export function calculateWPM(
  charactersTyped: number,
  errors: number,
  elapsedMs: number
): WPMResult {
  // TODO: Implement full WPM calculation

  // Handle edge cases
  if (elapsedMs <= 0) {
    return { grossWPM: 0, netWPM: 0, cpm: 0 };
  }

  if (charactersTyped <= 0) {
    return { grossWPM: 0, netWPM: 0, cpm: 0 };
  }

  const minutes = elapsedMs / 60000;

  // Gross WPM = (characters / 5) / minutes
  const grossWPM = Math.round((charactersTyped / CHARS_PER_WORD / minutes) * 10) / 10;

  // Net WPM = Gross WPM - (error words per minute)
  // Error penalty: each error = 1 word of penalty per minute
  // errors / CHARS_PER_WORD = error words, then divide by minutes
  // But never negative
  const errorPenalty = (errors / CHARS_PER_WORD) / minutes;
  const netWPM = Math.max(0, Math.round((grossWPM - errorPenalty) * 10) / 10);

  // CPM = characters per minute
  const cpm = Math.round(charactersTyped / minutes);

  return { grossWPM, netWPM, cpm };
}

/**
 * Calculate rolling WPM over a sliding time window
 *
 * TODO: Implement rolling WPM with:
 * - Filter keystrokes within window
 * - Calculate WPM for window period
 * - Handle edge cases (empty array, too few keystrokes)
 *
 * @param keystrokes - Array of keystrokes with timestamps
 * @param windowMs - Window size in milliseconds
 * @param currentTime - Current timestamp
 * @returns WPM result for the window
 */
export function calculateRollingWPM(
  keystrokes: Keystroke[],
  windowMs: number,
  currentTime: number
): WPMResult {
  // TODO: Implement full rolling WPM calculation

  // Handle edge cases
  if (!keystrokes || keystrokes.length < 2) {
    return { grossWPM: 0, netWPM: 0, cpm: 0 };
  }

  // Filter keystrokes within the window
  const windowStart = currentTime - windowMs;
  const windowKeystrokes = keystrokes.filter(k => k.timestamp >= windowStart);

  if (windowKeystrokes.length < 2) {
    return { grossWPM: 0, netWPM: 0, cpm: 0 };
  }

  // Calculate metrics for the window
  const charactersTyped = windowKeystrokes.length;
  const errors = windowKeystrokes.filter(k => !k.isCorrect).length;

  // Calculate elapsed time from first keystroke in window to current time
  // This gives proper WPM over the rolling window
  const firstTimestamp = windowKeystrokes[0].timestamp;
  const elapsedMs = Math.max(1, currentTime - firstTimestamp);

  return calculateWPM(charactersTyped, errors, elapsedMs);
}

// =============================================================================
// Accuracy Calculation
// =============================================================================

/**
 * Calculate accuracy metrics
 *
 * TODO: Implement accuracy calculation with:
 * - Overall accuracy percentage
 * - Per-character accuracy map
 * - Problematic character identification
 * - Most missed characters ranking
 *
 * @param correctKeystrokes - Number of correct keystrokes
 * @param totalKeystrokes - Total number of keystrokes
 * @param characterAttempts - Map of character attempts
 * @returns Accuracy result
 */
export function calculateAccuracy(
  correctKeystrokes: number,
  totalKeystrokes: number,
  characterAttempts: Map<string, CharacterAttempts>
): AccuracyResult {
  // TODO: Implement full accuracy calculation

  // Calculate overall accuracy
  let overall = 100.0;
  if (totalKeystrokes > 0) {
    overall = Math.round((correctKeystrokes / totalKeystrokes) * 1000) / 10;
  }

  // Calculate per-character accuracy
  const perCharacter = new Map<string, number>();
  const accuracyList: Array<{ char: string; accuracy: number; total: number }> = [];

  for (const [char, attempts] of characterAttempts.entries()) {
    const charAccuracy = attempts.total > 0
      ? Math.round((attempts.correct / attempts.total) * 1000) / 10
      : 100.0;
    perCharacter.set(char, charAccuracy);
    accuracyList.push({ char, accuracy: charAccuracy, total: attempts.total });
  }

  // Identify problematic characters
  const problematicChars = accuracyList
    .filter(item => item.accuracy < PROBLEMATIC_THRESHOLD && item.total >= MIN_ATTEMPTS_FOR_FLAG)
    .map(item => item.char);

  // Get most missed characters (sorted by accuracy, worst first)
  const mostMissed = accuracyList
    .filter(item => item.total >= MIN_ATTEMPTS_FOR_FLAG)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)
    .map(item => item.char);

  return {
    overall,
    perCharacter,
    problematicChars,
    mostMissed,
  };
}

// =============================================================================
// Character Tracking
// =============================================================================

/**
 * Track a character attempt
 *
 * TODO: Implement character tracking with:
 * - Create new entry if first attempt
 * - Increment correct/total counts
 * - Update totals
 *
 * @param tracker - Current character tracker
 * @param expectedChar - Expected character
 * @param actualChar - Actual character typed
 * @param isCorrect - Whether the attempt was correct
 * @returns Updated character tracker
 */
export function trackCharacterAttempt(
  tracker: CharacterTracker,
  expectedChar: string,
  actualChar: string,
  isCorrect: boolean
): CharacterTracker {
  // TODO: Implement full character tracking

  const newAttempts = new Map(tracker.attempts);

  // Get or create entry for this character
  const existing = newAttempts.get(expectedChar) ?? { correct: 0, total: 0 };

  // Update counts
  const updated: CharacterAttempts = {
    correct: existing.correct + (isCorrect ? 1 : 0),
    total: existing.total + 1,
  };

  newAttempts.set(expectedChar, updated);

  return {
    attempts: newAttempts,
    totalCorrect: tracker.totalCorrect + (isCorrect ? 1 : 0),
    totalAttempts: tracker.totalAttempts + 1,
  };
}

// =============================================================================
// Error Pattern Analysis
// =============================================================================

/**
 * Identify error patterns from error log
 *
 * TODO: Implement error pattern analysis with:
 * - Group errors by expected character
 * - Find most common substitutions
 * - Sort by frequency
 * - Limit to top 3 common mistakes per character
 *
 * @param errorLog - Array of error entries
 * @returns Array of identified patterns
 */
export function identifyErrorPatterns(errorLog: ErrorEntry[]): ErrorPattern[] {
  // TODO: Implement full error pattern analysis

  if (!errorLog || errorLog.length === 0) {
    return [];
  }

  // Group errors by expected character
  const errorsByChar = new Map<string, ErrorEntry[]>();
  for (const entry of errorLog) {
    const existing = errorsByChar.get(entry.expected) ?? [];
    existing.push(entry);
    errorsByChar.set(entry.expected, existing);
  }

  // Build patterns
  const patterns: ErrorPattern[] = [];

  for (const [expected, entries] of errorsByChar.entries()) {
    // Count substitutions
    const substitutions = new Map<string, number>();
    for (const entry of entries) {
      const count = substitutions.get(entry.actual) ?? 0;
      substitutions.set(entry.actual, count + 1);
    }

    // Sort substitutions by frequency
    const sortedSubs = Array.from(substitutions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([char]) => char);

    patterns.push({
      expected,
      commonMistakes: sortedSubs,
      frequency: entries.length,
      suggestion: `Practice typing "${expected}" more carefully`,
    });
  }

  // Sort patterns by frequency (most problematic first)
  patterns.sort((a, b) => b.frequency - a.frequency);

  return patterns;
}

// =============================================================================
// Improvement Suggestions
// =============================================================================

/**
 * Generate improvement suggestions based on error patterns
 *
 * TODO: Implement suggestion generation with:
 * - Character practice suggestions
 * - Pacing suggestions (slow down if high WPM/low accuracy)
 * - Modifier key issue detection
 * - Accent/dead key issue detection
 * - Priority sorting
 *
 * @param errorTracker - Error tracker state
 * @param metrics - Current session metrics
 * @returns Array of suggestions
 */
export function generateImprovementSuggestions(
  errorTracker: {
    byCharacter: Map<string, number>;
    substitutions: Map<string, Map<string, number>>;
    errors: ErrorEntry[];
  },
  metrics: { wpm: number; accuracy: number; duration: number }
): Suggestion[] {
  // TODO: Implement full suggestion generation

  const suggestions: Suggestion[] = [];

  // Check for problematic characters
  for (const [char, errorCount] of errorTracker.byCharacter.entries()) {
    if (errorCount >= 3) {
      suggestions.push({
        priority: 'high',
        category: 'character-practice',
        message: `Practice the character "${char}" - you made ${errorCount} errors`,
        practiceChars: [char],
      });
    }
  }

  // Check for pacing issues (high WPM, low accuracy)
  if (metrics.wpm > 40 && metrics.accuracy < 90) {
    suggestions.push({
      priority: 'high',
      category: 'pacing',
      message: 'Try slowing down to improve accuracy. Speed will come with practice.',
      practiceChars: [],
    });
  }

  // Check for shift key issues (uppercase errors)
  const uppercaseErrors: string[] = [];
  for (const [expected, subs] of errorTracker.substitutions.entries()) {
    if (expected === expected.toUpperCase() && expected !== expected.toLowerCase()) {
      // This is an uppercase letter
      const lowercaseCount = subs.get(expected.toLowerCase()) ?? 0;
      if (lowercaseCount > 0) {
        uppercaseErrors.push(expected);
      }
    }
  }

  if (uppercaseErrors.length >= 3) {
    suggestions.push({
      priority: 'medium',
      category: 'modifier-keys',
      message: 'Practice holding Shift for uppercase letters',
      practiceChars: uppercaseErrors,
    });
  }

  // Check for accent issues
  const accentChars = ['\u00E1', '\u00E9', '\u00ED', '\u00F3', '\u00FA', '\u00FC', '\u00F1'];
  const accentErrors = Array.from(errorTracker.byCharacter.keys())
    .filter(char => accentChars.includes(char));

  if (accentErrors.length >= 2) {
    suggestions.push({
      priority: 'medium',
      category: 'accents',
      message: 'Practice typing accented characters using dead keys',
      practiceChars: accentErrors,
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}
