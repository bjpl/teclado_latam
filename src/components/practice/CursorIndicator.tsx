/**
 * @file CursorIndicator.tsx
 * @description Blinking cursor component for typing practice.
 *
 * Features:
 * - Positioned before current character
 * - Blinks when idle (1s interval)
 * - Stops blinking during active typing
 * - Smooth position transitions (80ms ease-out)
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 3 (Cursor/Caret Animation)
 */

import { useEffect, useRef, useState, useCallback, memo } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface CursorPosition {
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** Cursor height in pixels */
  height: number;
}

export interface CursorIndicatorProps {
  /** Current character index */
  targetPosition: number;
  /** Reference to the text display container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether typing is currently active (disables blinking) */
  isTyping: boolean;
  /** Delay before cursor starts blinking after typing stops (ms) */
  blinkDelay?: number;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_LINE_HEIGHT = 24;
const BLINK_INTERVAL = 1000; // 1 second per blink cycle
const BLINK_DELAY = 500; // 500ms delay before blinking starts
const ANIMATION_DURATION = 80; // 80ms ease-out transition
const LINE_WRAP_THRESHOLD = 10; // Pixels to consider a line wrap

// =============================================================================
// Hook: useCursorPosition
// =============================================================================

/**
 * Hook to calculate and track cursor position
 */
function useCursorPosition(
  targetPosition: number,
  containerRef: React.RefObject<HTMLDivElement | null>
): CursorPosition {
  const [position, setPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    height: DEFAULT_LINE_HEIGHT,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get all character elements
    const charElements = container.querySelectorAll('[data-index]');

    // Handle empty text case
    if (charElements.length === 0) {
      setPosition({ x: 0, y: 0, height: DEFAULT_LINE_HEIGHT });
      return;
    }

    // Handle position at end of text
    if (targetPosition >= charElements.length) {
      const lastElement = charElements[charElements.length - 1] as HTMLElement;
      const rect = lastElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setPosition({
        x: rect.right - containerRect.left,
        y: rect.top - containerRect.top,
        height: rect.height,
      });
      return;
    }

    // Get target character element
    const targetElement = charElements[targetPosition] as HTMLElement;
    if (!targetElement) {
      setPosition({ x: 0, y: 0, height: DEFAULT_LINE_HEIGHT });
      return;
    }

    // Calculate position relative to container
    const rect = targetElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setPosition({
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      height: rect.height,
    });
  }, [targetPosition, containerRef]);

  return position;
}

// =============================================================================
// Hook: useCursorBlink
// =============================================================================

/**
 * Hook to manage cursor blinking state
 */
function useCursorBlink(isTyping: boolean, blinkDelay: number): boolean {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop blinking when typing, start after delay when idle
  useEffect(() => {
    // Clear any existing timer
    if (blinkTimerRef.current) {
      clearTimeout(blinkTimerRef.current);
      blinkTimerRef.current = null;
    }

    if (isTyping) {
      // Stop blinking immediately when typing
      setIsBlinking(false);
    } else {
      // Start blinking after delay when idle
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
      }, blinkDelay);
    }

    return () => {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }
    };
  }, [isTyping, blinkDelay]);

  return isBlinking;
}

// =============================================================================
// Component
// =============================================================================

/**
 * CursorIndicator - Animated typing cursor
 *
 * Features:
 * - Smooth position transitions
 * - Blinking when idle
 * - Hardware-accelerated animations via CSS transforms
 */
function CursorIndicatorComponent({
  targetPosition,
  containerRef,
  isTyping,
  blinkDelay = BLINK_DELAY,
}: CursorIndicatorProps) {
  const position = useCursorPosition(targetPosition, containerRef);
  const isBlinking = useCursorBlink(isTyping, blinkDelay);

  const cursorStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    height: `${position.height}px`,
    transition: `transform ${ANIMATION_DURATION}ms ease-out, height ${ANIMATION_DURATION}ms ease-out`,
    willChange: 'transform',
  };

  return (
    <div
      className={`
        cursor-indicator
        absolute
        left-0
        top-0
        w-0.5
        bg-blue-500
        dark:bg-blue-400
        pointer-events-none
        ${isBlinking ? 'animate-cursor-blink' : 'opacity-100'}
      `}
      style={cursorStyle}
      aria-hidden="true"
    />
  );
}

export const CursorIndicator = memo(CursorIndicatorComponent);

export default CursorIndicator;
