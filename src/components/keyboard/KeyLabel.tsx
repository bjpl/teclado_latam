/**
 * @file KeyLabel.tsx
 * @description Character label component for keyboard keys.
 * Shows primary character (large, center), shift character (top-left),
 * and AltGr character (bottom-right).
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 4 (Key Highlighting)
 */

'use client';

import { memo } from 'react';
import { clsx } from 'clsx';

export interface KeyLabelProps {
  /** Primary character (no modifiers) */
  primary: string;
  /** Shift character */
  shift?: string | null;
  /** AltGr character */
  altGr?: string | null;
  /** Whether to show all layers or just primary */
  showAllLayers?: boolean;
  /** Whether this is a special/modifier key */
  isSpecialKey?: boolean;
  /** Custom label for special keys (Tab, Enter, etc.) */
  specialLabel?: string;
  /** Whether shift layer is active */
  shiftActive?: boolean;
  /** Whether AltGr layer is active */
  altGrActive?: boolean;
}

/**
 * Formats special characters for display
 */
function formatCharacter(char: string | null | undefined): string {
  if (!char) return '';

  // Handle whitespace and special characters
  switch (char) {
    case ' ':
      return '\u2423'; // Open box symbol for space
    case '\t':
      return '\u21E5'; // Tab symbol
    case '\n':
      return '\u21B5'; // Return symbol
    case '':
      return '';
    default:
      return char;
  }
}

/**
 * Determines if a character needs smaller font
 */
function needsSmallerFont(char: string | null | undefined): boolean {
  if (!char) return false;
  // Multi-character labels like "AltGr", "Ctrl", etc.
  return char.length > 2;
}

/**
 * KeyLabel component - displays character labels on a key
 */
export const KeyLabel = memo(function KeyLabel({
  primary,
  shift,
  altGr,
  showAllLayers = true,
  isSpecialKey = false,
  specialLabel,
  shiftActive = false,
  altGrActive = false,
}: KeyLabelProps) {
  // For special keys, show custom label
  if (isSpecialKey && specialLabel) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span
          className={clsx(
            'text-center font-medium transition-colors duration-100',
            needsSmallerFont(specialLabel) ? 'text-[9px]' : 'text-xs'
          )}
        >
          {specialLabel}
        </span>
      </div>
    );
  }

  const formattedPrimary = formatCharacter(primary);
  const formattedShift = formatCharacter(shift);
  const formattedAltGr = formatCharacter(altGr);

  // Determine which character to highlight based on active modifiers
  const highlightPrimary = !shiftActive && !altGrActive;
  const highlightShift = shiftActive && !altGrActive;
  const highlightAltGr = altGrActive;

  // Single layer mode - just show primary large
  if (!showAllLayers || (!formattedShift && !formattedAltGr)) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span
          className={clsx(
            'text-base font-medium transition-colors duration-100',
            needsSmallerFont(formattedPrimary) && 'text-xs'
          )}
        >
          {formattedPrimary}
        </span>
      </div>
    );
  }

  // Multi-layer mode - show all character layers
  return (
    <div className="relative w-full h-full p-0.5">
      {/* Shift character - top left */}
      {formattedShift && formattedShift !== formattedPrimary && (
        <span
          className={clsx(
            'absolute top-0.5 left-1 text-[9px] leading-none transition-all duration-100',
            highlightShift
              ? 'opacity-100 font-semibold'
              : 'opacity-50'
          )}
        >
          {formattedShift}
        </span>
      )}

      {/* Primary character - center */}
      <span
        className={clsx(
          'absolute inset-0 flex items-center justify-center',
          'text-sm font-medium transition-all duration-100',
          highlightPrimary ? 'opacity-100' : 'opacity-70',
          needsSmallerFont(formattedPrimary) && 'text-xs'
        )}
      >
        {formattedPrimary}
      </span>

      {/* AltGr character - bottom right */}
      {formattedAltGr && (
        <span
          className={clsx(
            'absolute bottom-0.5 right-1 text-[9px] leading-none transition-all duration-100',
            highlightAltGr
              ? 'opacity-100 font-semibold text-blue-400'
              : 'opacity-40'
          )}
        >
          {formattedAltGr}
        </span>
      )}
    </div>
  );
});

KeyLabel.displayName = 'KeyLabel';
