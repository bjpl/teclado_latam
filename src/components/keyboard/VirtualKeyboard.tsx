/**
 * @file VirtualKeyboard.tsx
 * @description Main keyboard container component for Teclado LATAM.
 * Renders all 5 rows of the LATAM keyboard layout with key highlighting,
 * modifier state display, and responsive sizing.
 *
 * @see docs/sparc/02-architecture.md Section 6.2 (VirtualKeyboard)
 * @see docs/sparc/03-pseudocode-ui.md Section 4 (Keyboard Key Highlighting)
 */

'use client';

import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import type { KeyboardLayout, KeyDefinition, ModifierState } from '@/lib/typing-engine/types';
import { LATAMKeyboardLayout } from '@/lib/keyboard/keyboard-layout';
import { KeyboardRow } from './KeyboardRow';
import { FingerGuide } from './FingerGuide';
import type { KeyHighlightState } from './Key';

export interface VirtualKeyboardProps {
  /** Keyboard layout to render (defaults to LATAM) */
  layout?: KeyboardLayout;
  /** Key code to highlight as "next" key */
  highlightedKeyCode?: string | null;
  /** Additional keys to highlight (e.g., modifiers needed) */
  highlightedModifiers?: Set<string>;
  /** Set of currently pressed key codes */
  pressedKeys?: Set<string>;
  /** Current modifier state */
  modifierState?: ModifierState;
  /** Whether to show finger color guide */
  showFingerGuide?: boolean;
  /** Keyboard size preset */
  size?: 'compact' | 'standard' | 'large';
  /** Whether to show the finger guide legend */
  showLegend?: boolean;
  /** Whether dead key is pending */
  deadKeyPending?: boolean;
  /** Type of pending dead key */
  deadKeyType?: string | null;
  /** Error key to flash (wrong key pressed) */
  errorKeyCode?: string | null;
  /** Callback when a key is clicked */
  onKeyClick?: (keyDef: KeyDefinition) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size presets in pixels (base unit size)
 */
const SIZE_PRESETS = {
  compact: 36,
  standard: 48,
  large: 56,
} as const;

/**
 * Builds a map of key codes to their highlight states
 */
function buildHighlightMap(
  nextKeyCode: string | null | undefined,
  highlightedModifiers: Set<string> | undefined,
  errorKeyCode: string | null | undefined,
  pressedKeys: Set<string> | undefined,
): Map<string, KeyHighlightState> {
  const map = new Map<string, KeyHighlightState>();

  // Error state takes highest priority
  if (errorKeyCode) {
    map.set(errorKeyCode, 'error');
  }

  // Pressed keys
  if (pressedKeys) {
    for (const code of pressedKeys) {
      if (!map.has(code)) {
        map.set(code, 'pressed');
      }
    }
  }

  // Modifier keys needed for next character
  if (highlightedModifiers) {
    for (const code of highlightedModifiers) {
      if (!map.has(code)) {
        map.set(code, 'modifier');
      }
    }
  }

  // Next key to type
  if (nextKeyCode && !map.has(nextKeyCode)) {
    map.set(nextKeyCode, 'next');
  }

  return map;
}

/**
 * VirtualKeyboard component - main keyboard visualization
 */
export const VirtualKeyboard = memo(function VirtualKeyboard({
  layout = LATAMKeyboardLayout,
  highlightedKeyCode,
  highlightedModifiers = new Set(),
  pressedKeys = new Set(),
  modifierState = { shift: false, altGr: false, ctrl: false, meta: false },
  showFingerGuide = false,
  size = 'standard',
  showLegend = false,
  deadKeyPending = false,
  deadKeyType = null,
  errorKeyCode = null,
  onKeyClick,
  className,
}: VirtualKeyboardProps) {
  // Track viewport width for responsive sizing
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Update viewport width on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate unit size based on size preset and viewport
  const unitSize = useMemo(() => {
    const baseSize = SIZE_PRESETS[size];

    // Calculate total keyboard width needed (approximately 15 units wide)
    const keyboardUnits = 15.5;
    const maxWidth = keyboardUnits * baseSize + 100; // Extra for padding and offsets

    // Scale down if viewport is too narrow
    if (viewportWidth < maxWidth) {
      const scaleFactor = (viewportWidth - 40) / (keyboardUnits * baseSize);
      return Math.floor(baseSize * Math.min(scaleFactor, 1));
    }

    return baseSize;
  }, [size, viewportWidth]);

  // Build highlight map from props
  const highlightMap = useMemo(() => {
    return buildHighlightMap(
      highlightedKeyCode,
      highlightedModifiers,
      errorKeyCode,
      pressedKeys,
    );
  }, [highlightedKeyCode, highlightedModifiers, errorKeyCode, pressedKeys]);

  // Handle key click
  const handleKeyClick = useCallback((keyDef: KeyDefinition) => {
    if (onKeyClick) {
      onKeyClick(keyDef);
    }
  }, [onKeyClick]);

  return (
    <div
      className={clsx(
        'flex flex-col items-center',
        'p-4 rounded-xl',
        'bg-neutral-900/80 backdrop-blur-sm',
        'border border-neutral-800',
        'shadow-xl',
        className,
      )}
      role="img"
      aria-label={`${layout.name} keyboard layout`}
    >
      {/* Dead key indicator */}
      {deadKeyPending && deadKeyType && (
        <div
          className={clsx(
            'mb-2 px-3 py-1 rounded-full',
            'bg-orange-500/20 border border-orange-500/50',
            'text-orange-300 text-sm',
          )}
          role="status"
          aria-live="polite"
        >
          Dead key: {deadKeyType} (press a vowel to compose)
        </div>
      )}

      {/* Modifier state indicators */}
      <div className="flex gap-2 mb-2">
        {modifierState.shift && (
          <span
            className={clsx(
              'px-2 py-0.5 rounded text-xs',
              'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
            )}
          >
            Shift
          </span>
        )}
        {modifierState.altGr && (
          <span
            className={clsx(
              'px-2 py-0.5 rounded text-xs',
              'bg-blue-500/20 text-blue-300 border border-blue-500/30',
            )}
          >
            AltGr
          </span>
        )}
        {modifierState.ctrl && (
          <span
            className={clsx(
              'px-2 py-0.5 rounded text-xs',
              'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30',
            )}
          >
            Ctrl
          </span>
        )}
      </div>

      {/* Keyboard rows */}
      <div
        className="flex flex-col gap-1"
        role="group"
        aria-label="Keyboard keys"
      >
        {layout.rows.map((row, rowIndex) => (
          <KeyboardRow
            key={`row-${rowIndex}`}
            keys={row}
            rowIndex={rowIndex}
            highlightedKeys={highlightMap}
            pressedKeys={pressedKeys}
            showFingerColors={showFingerGuide}
            modifierState={modifierState}
            unitSize={unitSize}
            onKeyClick={onKeyClick ? handleKeyClick : undefined}
          />
        ))}
      </div>

      {/* Finger guide legend */}
      {showLegend && <FingerGuide visible={showFingerGuide} />}

      {/* Layout name */}
      <div className="mt-3 text-xs text-neutral-500">
        {layout.name} ({layout.locale})
      </div>
    </div>
  );
});

VirtualKeyboard.displayName = 'VirtualKeyboard';
