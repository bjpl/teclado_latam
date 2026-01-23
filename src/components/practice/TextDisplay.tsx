/**
 * @file TextDisplay.tsx
 * @description Main text display area for typing practice.
 *
 * Features:
 * - Shows practice text with character-by-character highlighting
 * - States per character: pending, current, correct, incorrect, corrected
 * - Smooth caret/cursor animation (80ms ease-out)
 * - Auto-scroll to keep current position visible
 * - Wrap long lines properly
 * - Monospace font (JetBrains Mono or similar)
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 2 (Text Display Rendering)
 */

import { useRef, useEffect, useMemo, memo } from 'react';
import { CharacterSpan } from './CharacterSpan';
import { CursorIndicator } from './CursorIndicator';
import type { CharacterResult, CharacterState } from '@/lib/typing-engine/types';

// =============================================================================
// Types
// =============================================================================

export interface CharacterRenderData {
  char: string;
  index: number;
  state: CharacterState;
  shouldAnimate: boolean;
}

export interface TextDisplayProps {
  /** Array of character results from typing session */
  characters: CharacterResult[];
  /** Current position in the text */
  currentIndex: number;
  /** Map of positions with errors */
  errorMap?: Map<number, string>;
  /** Set of positions that were corrected */
  correctedSet?: Set<number>;
  /** Whether session is active (affects cursor blinking) */
  isActive: boolean;
  /** Previous character states for diffing (optimization) */
  previousStates?: CharacterState[];
  /** Callback when character states change */
  onStatesChange?: (states: CharacterState[]) => void;
}

// =============================================================================
// Constants
// =============================================================================

const SCROLL_THRESHOLD = 50; // Pixels from edge to trigger scroll

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Determine character state based on position and error/correction data
 */
function determineCharacterState(
  index: number,
  currentPosition: number,
  errorMap: Map<number, string>,
  correctedSet: Set<number>
): CharacterState {
  // Characters before current position have been typed
  if (index < currentPosition) {
    // Check if this position had an error that was corrected
    if (correctedSet.has(index)) {
      return 'corrected';
    }
    // Check if there's an uncorrected error at this position
    if (errorMap.has(index)) {
      return 'incorrect';
    }
    // Successfully typed
    return 'correct';
  }

  // Current character to type
  if (index === currentPosition) {
    return 'current';
  }

  // Characters not yet reached
  return 'pending';
}

/**
 * Generate render data for all characters
 */
function generateRenderData(
  characters: CharacterResult[],
  currentIndex: number,
  errorMap: Map<number, string>,
  correctedSet: Set<number>,
  previousStates: CharacterState[]
): { renderData: CharacterRenderData[]; changedIndices: number[] } {
  const renderData: CharacterRenderData[] = [];
  const changedIndices: number[] = [];

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const state = determineCharacterState(i, currentIndex, errorMap, correctedSet);
    const shouldAnimate = previousStates[i] !== state;

    if (shouldAnimate) {
      changedIndices.push(i);
    }

    renderData.push({
      char: char.expected,
      index: i,
      state,
      shouldAnimate,
    });
  }

  return { renderData, changedIndices };
}

// =============================================================================
// Hook: useAutoScroll
// =============================================================================

/**
 * Hook to auto-scroll container to keep cursor visible
 */
function useAutoScroll(
  containerRef: React.RefObject<HTMLDivElement | null>,
  currentIndex: number
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the current character element
    const currentElement = container.querySelector(
      `[data-index="${currentIndex}"]`
    ) as HTMLElement;

    if (!currentElement) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = currentElement.getBoundingClientRect();

    // Check if element is above visible area
    if (elementRect.top < containerRect.top + SCROLL_THRESHOLD) {
      const targetScroll =
        container.scrollTop + (elementRect.top - containerRect.top) - SCROLL_THRESHOLD;
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }

    // Check if element is below visible area
    if (elementRect.bottom > containerRect.bottom - SCROLL_THRESHOLD) {
      const targetScroll =
        container.scrollTop +
        (elementRect.bottom - containerRect.bottom) +
        SCROLL_THRESHOLD;
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [containerRef, currentIndex]);
}

// =============================================================================
// Component
// =============================================================================

/**
 * TextDisplay - Main text display area for typing practice
 *
 * Renders text character-by-character with state-based styling,
 * cursor animation, and auto-scrolling.
 */
function TextDisplayComponent({
  characters,
  currentIndex,
  errorMap = new Map(),
  correctedSet = new Set(),
  isActive,
  previousStates = [],
  onStatesChange,
}: TextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate render data with memoization
  const { renderData, currentStates } = useMemo(() => {
    const { renderData } = generateRenderData(
      characters,
      currentIndex,
      errorMap,
      correctedSet,
      previousStates
    );

    const states = renderData.map((r) => r.state);

    return { renderData, currentStates: states };
  }, [characters, currentIndex, errorMap, correctedSet, previousStates]);

  // Notify parent of state changes for next render optimization
  useEffect(() => {
    if (onStatesChange) {
      onStatesChange(currentStates);
    }
  }, [currentStates, onStatesChange]);

  // Auto-scroll to keep cursor visible
  useAutoScroll(containerRef, currentIndex);

  return (
    <div
      ref={containerRef}
      className="
        text-display
        relative
        w-full
        min-h-[200px]
        max-h-[400px]
        overflow-y-auto
        p-4
        bg-gray-50
        dark:bg-gray-900
        rounded-lg
        border
        border-gray-200
        dark:border-gray-700
        font-mono
        text-lg
        leading-relaxed
        tracking-wide
        select-none
      "
      role="textbox"
      aria-label="Typing practice text"
      aria-readonly="true"
    >
      {/* Cursor indicator */}
      <CursorIndicator
        targetPosition={currentIndex}
        containerRef={containerRef}
        isTyping={isActive}
      />

      {/* Character spans */}
      <div className="text-content whitespace-pre-wrap break-words">
        {renderData.map((data) => (
          <CharacterSpan
            key={data.index}
            char={data.char}
            index={data.index}
            state={data.state}
            shouldAnimate={data.shouldAnimate}
          />
        ))}
      </div>
    </div>
  );
}

export const TextDisplay = memo(TextDisplayComponent);

export default TextDisplay;
