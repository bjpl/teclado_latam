/**
 * @file CharacterSpan.tsx
 * @description Individual character display component with state-based styling.
 *
 * Color coding by state:
 * - Pending: text-gray-500
 * - Current: text-white with underline or highlight
 * - Correct: text-green-400
 * - Incorrect: text-red-400 with optional strikethrough
 * - Corrected: text-yellow-400
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 2 (Text Display Rendering)
 */

import { memo } from 'react';
import type { CharacterState } from '@/lib/typing-engine/types';

// =============================================================================
// Types
// =============================================================================

export interface CharacterSpanProps {
  /** The character to display */
  char: string;
  /** Index in the text (used for DOM identification) */
  index: number;
  /** Current state of the character */
  state: CharacterState;
  /** Whether to animate state transition */
  shouldAnimate?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get display character for special characters
 */
function getDisplayChar(char: string): string {
  switch (char) {
    case ' ':
      return '\u00B7'; // Middle dot for visibility
    case '\n':
      return '\u21B5'; // Return symbol
    case '\t':
      return '\u2192'; // Right arrow
    default:
      return char;
  }
}

/**
 * Get CSS class for character based on state
 */
function getStateClass(state: CharacterState): string {
  switch (state) {
    case 'pending':
      return 'text-gray-500 dark:text-gray-400';
    case 'current':
      return 'text-white bg-blue-500 dark:bg-blue-600 rounded-sm px-0.5';
    case 'correct':
      return 'text-green-500 dark:text-green-400';
    case 'incorrect':
      return 'text-red-500 dark:text-red-400 line-through decoration-2';
    case 'corrected':
      return 'text-yellow-500 dark:text-yellow-400 underline decoration-wavy decoration-1';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get special character CSS class
 */
function getSpecialCharClass(char: string): string {
  switch (char) {
    case ' ':
      return 'char--space';
    case '\n':
      return 'char--newline inline-block w-full';
    case '\t':
      return 'char--tab';
    default:
      // Handle Spanish special characters
      if (/[\u00F1\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00A1\u00BF]/.test(char)) {
        return 'char--special';
      }
      return '';
  }
}

/**
 * Generate accessible label for a character
 */
function generateAriaLabel(char: string, state: CharacterState): string {
  const charNames: Record<string, string> = {
    ' ': 'space',
    '\n': 'new line',
    '\t': 'tab',
    '.': 'period',
    ',': 'comma',
    '\u00F1': 'n with tilde',
    '\u00D1': 'capital N with tilde',
    '\u00E1': 'a with acute',
    '\u00E9': 'e with acute',
    '\u00ED': 'i with acute',
    '\u00F3': 'o with acute',
    '\u00FA': 'u with acute',
    '\u00FC': 'u with dieresis',
    '\u00BF': 'inverted question mark',
    '\u00A1': 'inverted exclamation mark',
  };

  const charDescription = charNames[char] || char;

  const stateDescriptions: Record<CharacterState, string> = {
    pending: '',
    current: ', next to type',
    correct: ', typed correctly',
    incorrect: ', typed incorrectly',
    corrected: ', corrected',
  };

  return charDescription + stateDescriptions[state];
}

// =============================================================================
// Component
// =============================================================================

/**
 * CharacterSpan - Individual character display with state-based styling
 *
 * Memoized for performance to prevent unnecessary re-renders.
 * Only re-renders when props actually change.
 */
function CharacterSpanComponent({
  char,
  index,
  state,
  shouldAnimate = false,
  ariaLabel,
}: CharacterSpanProps) {
  const displayChar = getDisplayChar(char);
  const stateClass = getStateClass(state);
  const specialClass = getSpecialCharClass(char);
  const animateClass = shouldAnimate ? 'char--animate animate-pulse-once' : '';
  const computedAriaLabel = ariaLabel || generateAriaLabel(char, state);

  return (
    <span
      id={`char-${index}`}
      className={`char inline-block transition-colors duration-150 ease-out ${stateClass} ${specialClass} ${animateClass}`}
      aria-label={computedAriaLabel}
      data-index={index}
      data-state={state}
    >
      {displayChar}
    </span>
  );
}

// Memoize to prevent unnecessary re-renders
export const CharacterSpan = memo(CharacterSpanComponent);

export default CharacterSpan;
