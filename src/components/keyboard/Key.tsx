/**
 * @file Key.tsx
 * @description Individual key component for the virtual keyboard.
 * Shows all three character layers, handles highlight states,
 * dead key indicators, finger color coding, and proper sizing.
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 4 (Key Highlighting)
 * @see docs/sparc/02-architecture.md Section 6.2 (VirtualKeyboard)
 */

'use client';

import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import type { KeyDefinition, Finger, ModifierState } from '@/lib/typing-engine/types';
import { KeyLabel } from './KeyLabel';

/** Highlight states for a key */
export type KeyHighlightState = 'default' | 'next' | 'pressed' | 'error' | 'modifier';

export interface KeyProps {
  /** Key definition from layout */
  keyDefinition: KeyDefinition;
  /** Current highlight state */
  highlightState?: KeyHighlightState;
  /** Whether this key is currently pressed */
  isPressed?: boolean;
  /** Whether to show finger color coding */
  showFingerColors?: boolean;
  /** Whether shift is active (to show correct layer) */
  shiftActive?: boolean;
  /** Whether AltGr is active */
  altGrActive?: boolean;
  /** Base unit size in pixels */
  unitSize?: number;
  /** Optional click handler */
  onClick?: (keyDef: KeyDefinition) => void;
}

/**
 * Color mapping for finger positions
 * Using a colorblind-friendly palette
 */
const FINGER_COLORS: Record<Finger, string> = {
  'left-pinky': 'bg-purple-500/20',
  'left-ring': 'bg-blue-500/20',
  'left-middle': 'bg-emerald-500/20',
  'left-index': 'bg-amber-500/20',
  'right-index': 'bg-amber-500/20',
  'right-middle': 'bg-emerald-500/20',
  'right-ring': 'bg-blue-500/20',
  'right-pinky': 'bg-purple-500/20',
  'thumb': 'bg-gray-500/20',
};

/**
 * Border colors for finger positions (for finger guide)
 */
const FINGER_BORDER_COLORS: Record<Finger, string> = {
  'left-pinky': 'border-purple-500/50',
  'left-ring': 'border-blue-500/50',
  'left-middle': 'border-emerald-500/50',
  'left-index': 'border-amber-500/50',
  'right-index': 'border-amber-500/50',
  'right-middle': 'border-emerald-500/50',
  'right-ring': 'border-blue-500/50',
  'right-pinky': 'border-purple-500/50',
  'thumb': 'border-gray-500/50',
};

/**
 * Special key labels
 */
const SPECIAL_KEY_LABELS: Record<string, string> = {
  'Backspace': '\u232B',     // Backspace symbol
  'Tab': '\u21E5',           // Tab symbol
  'CapsLock': '\u21EA',      // Caps lock symbol
  'Enter': '\u21B5',         // Return symbol
  'ShiftLeft': '\u21E7',     // Shift symbol
  'ShiftRight': '\u21E7',    // Shift symbol
  'ControlLeft': 'Ctrl',
  'ControlRight': 'Ctrl',
  'MetaLeft': '\u2318',      // Command symbol
  'MetaRight': '\u2318',     // Command symbol
  'AltLeft': 'Alt',
  'AltRight': 'AltGr',
  'Space': '',               // Empty for space bar
  'ContextMenu': '\u2630',   // Menu symbol
};

/**
 * Checks if key is a special/modifier key
 */
function isSpecialKey(code: string): boolean {
  return code in SPECIAL_KEY_LABELS ||
    code.startsWith('Shift') ||
    code.startsWith('Control') ||
    code.startsWith('Alt') ||
    code.startsWith('Meta') ||
    code === 'Backspace' ||
    code === 'Tab' ||
    code === 'CapsLock' ||
    code === 'Enter' ||
    code === 'Space' ||
    code === 'ContextMenu';
}

/**
 * Key component - individual keyboard key
 */
export const Key = memo(function Key({
  keyDefinition,
  highlightState = 'default',
  isPressed = false,
  showFingerColors = false,
  shiftActive = false,
  altGrActive = false,
  unitSize = 48,
  onClick,
}: KeyProps) {
  const {
    code,
    width,
    normal,
    shift,
    altGr,
    isDeadKey,
    finger,
    isHomeRow,
  } = keyDefinition;

  // Calculate key dimensions
  const keyWidth = useMemo(() => width * unitSize, [width, unitSize]);
  const keyHeight = unitSize;
  const gap = 4; // Gap between keys

  // Determine if this is a special key
  const special = isSpecialKey(code);
  const specialLabel = SPECIAL_KEY_LABELS[code];

  // Build class names based on state
  const keyClasses = useMemo(() => {
    return clsx(
      // Base styles
      'relative flex items-center justify-center',
      'rounded-md border select-none',
      'transition-all duration-100 ease-out',

      // Default background
      'bg-neutral-800 border-neutral-700',

      // Finger color coding (subtle background)
      showFingerColors && FINGER_COLORS[finger],
      showFingerColors && FINGER_BORDER_COLORS[finger],

      // Home row indicator (subtle bump on F and J)
      isHomeRow && (code === 'KeyF' || code === 'KeyJ') && 'after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-0.5 after:bg-neutral-500 after:rounded-full',

      // Highlight states
      highlightState === 'next' && [
        'bg-blue-600/30 border-blue-500',
        'ring-2 ring-blue-500/50',
        'shadow-lg shadow-blue-500/20',
      ],
      highlightState === 'modifier' && [
        'bg-cyan-600/20 border-cyan-500/70',
        'ring-1 ring-cyan-500/30',
      ],
      highlightState === 'pressed' && [
        'bg-emerald-600/30 border-emerald-500',
        'scale-95 translate-y-0.5',
      ],
      highlightState === 'error' && [
        'bg-red-600/30 border-red-500',
        'animate-shake',
      ],

      // Physical press state
      isPressed && [
        'scale-95 translate-y-0.5',
        'bg-neutral-700',
      ],

      // Dead key indicator
      isDeadKey && [
        'ring-1 ring-orange-500/30',
      ],

      // Interactive states
      onClick && 'cursor-pointer hover:bg-neutral-700 active:scale-95',
    );
  }, [
    highlightState,
    isPressed,
    showFingerColors,
    finger,
    isHomeRow,
    isDeadKey,
    onClick,
    code,
  ]);

  // Text color based on state
  const textClasses = useMemo(() => {
    return clsx(
      'text-neutral-200',
      highlightState === 'next' && 'text-blue-200',
      highlightState === 'modifier' && 'text-cyan-200',
      highlightState === 'pressed' && 'text-emerald-200',
      highlightState === 'error' && 'text-red-200',
    );
  }, [highlightState]);

  const handleClick = () => {
    if (onClick) {
      onClick(keyDefinition);
    }
  };

  return (
    <button
      type="button"
      className={keyClasses}
      style={{
        width: `${keyWidth - gap}px`,
        height: `${keyHeight - gap}px`,
        minWidth: `${keyWidth - gap}px`,
      }}
      onClick={handleClick}
      disabled={!onClick}
      aria-label={`Key ${normal || specialLabel || code}`}
      aria-pressed={isPressed}
      data-key-code={code}
      data-highlight={highlightState}
    >
      {/* Dead key indicator dot */}
      {isDeadKey && (
        <span
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500"
          aria-label="Dead key"
        />
      )}

      {/* Key label */}
      <div className={clsx('w-full h-full', textClasses)}>
        <KeyLabel
          primary={normal}
          shift={shift}
          altGr={altGr}
          showAllLayers={!special}
          isSpecialKey={special}
          specialLabel={specialLabel}
          shiftActive={shiftActive}
          altGrActive={altGrActive}
        />
      </div>
    </button>
  );
});

Key.displayName = 'Key';
