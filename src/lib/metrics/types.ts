/**
 * @file types.ts
 * @description Type definitions for the Teclado LATAM metrics calculator.
 *
 * These types are based on the pseudocode specifications in:
 * - docs/sparc/03-pseudocode.md Section 4-5
 */

// =============================================================================
// WPM Types
// =============================================================================

/**
 * Result from WPM calculation
 */
export interface WPMResult {
  /** Raw speed without error penalty */
  grossWPM: number;
  /** Speed adjusted for errors */
  netWPM: number;
  /** Characters per minute */
  cpm: number;
}

// =============================================================================
// Accuracy Types
// =============================================================================

/**
 * Attempts for a single character
 */
export interface CharacterAttempts {
  /** Number of correct attempts */
  correct: number;
  /** Total number of attempts */
  total: number;
}

/**
 * Result from accuracy calculation
 */
export interface AccuracyResult {
  /** Overall accuracy percentage (0-100) */
  overall: number;
  /** Per-character accuracy map */
  perCharacter: Map<string, number>;
  /** Characters below threshold (problematic) */
  problematicChars: string[];
  /** Top 5 most missed characters */
  mostMissed: string[];
}

/**
 * Tracker for character attempts
 */
export interface CharacterTracker {
  /** Map of character to attempts */
  attempts: Map<string, CharacterAttempts>;
  /** Total correct keystrokes */
  totalCorrect: number;
  /** Total keystrokes */
  totalAttempts: number;
}

// =============================================================================
// Keystroke Types
// =============================================================================

/**
 * Single keystroke for rolling WPM calculation
 */
export interface Keystroke {
  /** Timestamp of keystroke */
  timestamp: number;
  /** Whether keystroke was correct */
  isCorrect: boolean;
  /** Character typed (optional) */
  character?: string;
}

// =============================================================================
// Error Pattern Types
// =============================================================================

/**
 * Single error entry
 */
export interface ErrorEntry {
  /** Expected character */
  expected: string;
  /** Actual character typed */
  actual: string;
  /** Timestamp of error */
  timestamp: number;
  /** Position in text (optional) */
  position?: number;
}

/**
 * Identified error pattern
 */
export interface ErrorPattern {
  /** Expected character */
  expected: string;
  /** Most common mistakes */
  commonMistakes: string[];
  /** How often this error occurs */
  frequency: number;
  /** Suggestion for improvement */
  suggestion: string;
}

/**
 * Error tracker state
 */
export interface ErrorTracker {
  /** Error log */
  errors: ErrorEntry[];
  /** Error count by character */
  byCharacter: Map<string, number>;
  /** Substitution patterns: expected -> (actual -> count) */
  substitutions: Map<string, Map<string, number>>;
}

// =============================================================================
// Improvement Suggestion Types
// =============================================================================

/**
 * Priority level for suggestions
 */
export type SuggestionPriority = 'high' | 'medium' | 'low';

/**
 * Category of suggestion
 */
export type SuggestionCategory =
  | 'character-practice'
  | 'modifier-keys'
  | 'special-characters'
  | 'accents'
  | 'finger-positioning'
  | 'pacing';

/**
 * Improvement suggestion
 */
export interface Suggestion {
  /** Priority level */
  priority: SuggestionPriority;
  /** Category */
  category: SuggestionCategory;
  /** Human-readable message */
  message: string;
  /** Characters to practice */
  practiceChars: string[];
}

// =============================================================================
// Session Metrics Types
// =============================================================================

/**
 * Complete session metrics
 */
export interface SessionMetrics {
  /** Words per minute result */
  wpm: WPMResult;
  /** Accuracy result */
  accuracy: AccuracyResult;
  /** Session duration in ms */
  duration: number;
  /** Total characters typed */
  totalCharacters: number;
  /** Total errors */
  totalErrors: number;
  /** Errors corrected */
  correctedErrors: number;
  /** Uncorrected errors */
  uncorrectedErrors: number;
}
