/**
 * @file FingerGuide.tsx
 * @description Optional finger placement overlay for the virtual keyboard.
 * Shows color-coded finger assignments with home row indicators.
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 4.7 (Finger Guide Overlay)
 */

'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { Finger } from '@/lib/typing-engine/types';

export interface FingerGuideProps {
  /** Whether the guide is visible */
  visible?: boolean;
}

/**
 * Finger color mapping - colorblind-friendly palette
 */
const FINGER_INFO: Record<Finger, { color: string; label: string; borderColor: string }> = {
  'left-pinky': {
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    label: 'Left Pinky',
  },
  'left-ring': {
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    label: 'Left Ring',
  },
  'left-middle': {
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    label: 'Left Middle',
  },
  'left-index': {
    color: 'bg-amber-500',
    borderColor: 'border-amber-500',
    label: 'Left Index',
  },
  'right-index': {
    color: 'bg-amber-500',
    borderColor: 'border-amber-500',
    label: 'Right Index',
  },
  'right-middle': {
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    label: 'Right Middle',
  },
  'right-ring': {
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    label: 'Right Ring',
  },
  'right-pinky': {
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    label: 'Right Pinky',
  },
  'thumb': {
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
    label: 'Thumbs',
  },
};

/**
 * Finger display order for legend
 */
const FINGER_ORDER: Finger[] = [
  'left-pinky',
  'left-ring',
  'left-middle',
  'left-index',
  'thumb',
  'right-index',
  'right-middle',
  'right-ring',
  'right-pinky',
];

/**
 * FingerGuide component - shows finger position legend
 */
export const FingerGuide = memo(function FingerGuide({
  visible = true,
}: FingerGuideProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-center gap-3',
        'p-3 mt-3',
        'bg-neutral-900/50 rounded-lg',
        'text-xs text-neutral-400',
      )}
      role="complementary"
      aria-label="Finger guide legend"
    >
      {/* Left hand */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-neutral-300">Left:</span>
        {FINGER_ORDER.slice(0, 4).map((finger) => {
          const info = FINGER_INFO[finger];
          return (
            <div
              key={finger}
              className="flex items-center gap-1"
              title={info.label}
            >
              <span
                className={clsx(
                  'w-3 h-3 rounded-sm',
                  info.color,
                )}
              />
              <span className="hidden sm:inline">
                {info.label.replace('Left ', '')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Thumb */}
      <div className="flex items-center gap-1" title="Thumbs">
        <span
          className={clsx(
            'w-3 h-3 rounded-sm',
            FINGER_INFO.thumb.color,
          )}
        />
        <span>Thumbs</span>
      </div>

      {/* Right hand */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-neutral-300">Right:</span>
        {FINGER_ORDER.slice(5).map((finger) => {
          const info = FINGER_INFO[finger];
          return (
            <div
              key={finger}
              className="flex items-center gap-1"
              title={info.label}
            >
              <span
                className={clsx(
                  'w-3 h-3 rounded-sm',
                  info.color,
                )}
              />
              <span className="hidden sm:inline">
                {info.label.replace('Right ', '')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Home row hint */}
      <div className="flex items-center gap-1 border-l border-neutral-700 pl-3">
        <span className="text-neutral-500">Home row:</span>
        <kbd className="px-1 bg-neutral-800 rounded text-neutral-300">F</kbd>
        <span className="text-neutral-500">&</span>
        <kbd className="px-1 bg-neutral-800 rounded text-neutral-300">J</kbd>
        <span className="text-neutral-500">(bumps)</span>
      </div>
    </div>
  );
});

FingerGuide.displayName = 'FingerGuide';
