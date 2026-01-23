/**
 * @file KeyboardRow.tsx
 * @description Single row of keyboard keys.
 * Maps key definitions to Key components with proper spacing.
 *
 * @see docs/sparc/02-architecture.md Section 6.1 (Component Hierarchy)
 */

'use client';

import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import type { KeyDefinition, ModifierState } from '@/lib/typing-engine/types';
import { Key, type KeyHighlightState } from './Key';

export interface KeyboardRowProps {
  /** Array of key definitions for this row */
  keys: KeyDefinition[];
  /** Row index (0-4) */
  rowIndex: number;
  /** Map of key codes to their highlight state */
  highlightedKeys?: Map<string, KeyHighlightState>;
  /** Set of currently pressed key codes */
  pressedKeys?: Set<string>;
  /** Whether to show finger color coding */
  showFingerColors?: boolean;
  /** Current modifier state */
  modifierState?: ModifierState;
  /** Base unit size in pixels */
  unitSize?: number;
  /** Optional key click handler */
  onKeyClick?: (keyDef: KeyDefinition) => void;
}

/**
 * KeyboardRow component - renders a single row of keys
 */
export const KeyboardRow = memo(function KeyboardRow({
  keys,
  rowIndex,
  highlightedKeys = new Map(),
  pressedKeys = new Set(),
  showFingerColors = false,
  modifierState = { shift: false, altGr: false, ctrl: false, meta: false },
  unitSize = 48,
  onKeyClick,
}: KeyboardRowProps) {
  // Calculate row offset for staggered layout (like real keyboards)
  const rowOffset = useMemo(() => {
    // Standard keyboard row offsets in units
    const offsets = [0, 0.5, 0.75, 1.25, 1.5];
    return (offsets[rowIndex] ?? 0) * unitSize;
  }, [rowIndex, unitSize]);

  return (
    <div
      className={clsx(
        'flex flex-row items-center',
        'gap-1', // 4px gap between keys
      )}
      style={{
        paddingLeft: `${rowOffset}px`,
      }}
      role="row"
      aria-label={`Keyboard row ${rowIndex + 1}`}
    >
      {keys.map((keyDef) => {
        const highlightState = highlightedKeys.get(keyDef.code) ?? 'default';
        const isPressed = pressedKeys.has(keyDef.code);

        return (
          <Key
            key={keyDef.code}
            keyDefinition={keyDef}
            highlightState={highlightState}
            isPressed={isPressed}
            showFingerColors={showFingerColors}
            shiftActive={modifierState.shift}
            altGrActive={modifierState.altGr}
            unitSize={unitSize}
            onClick={onKeyClick}
          />
        );
      })}
    </div>
  );
});

KeyboardRow.displayName = 'KeyboardRow';
