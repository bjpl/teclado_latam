/**
 * @file TimeDisplay.tsx
 * @description Session timer display in MM:SS format.
 *
 * Features:
 * - Starts on first keystroke
 * - Pauses when session is paused
 * - Displays elapsed time in MM:SS format
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 5 (Real-time Metrics Update)
 */

'use client';

import { useEffect, useState, useRef } from 'react';

export interface TimeDisplayProps {
  /** Start time (timestamp) - null if not started */
  startTime: number | null;
  /** Whether the timer is paused */
  isPaused?: boolean;
  /** Total paused duration in ms */
  pausedDuration?: number;
  /** Whether to show hours if over 60 minutes */
  showHours?: boolean;
  /** Optional label (defaults to "Time") */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format milliseconds to MM:SS or HH:MM:SS
 */
function formatTime(ms: number, showHours: boolean): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showHours && hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get size classes for the component
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg'): {
  container: string;
  value: string;
  label: string;
} {
  switch (size) {
    case 'sm':
      return {
        container: 'gap-0.5',
        value: 'text-2xl font-mono font-bold',
        label: 'text-xs',
      };
    case 'md':
      return {
        container: 'gap-1',
        value: 'text-4xl font-mono font-bold',
        label: 'text-sm',
      };
    case 'lg':
      return {
        container: 'gap-1.5',
        value: 'text-6xl font-mono font-bold',
        label: 'text-base',
      };
  }
}

/**
 * TimeDisplay - Session timer component
 *
 * Features:
 * - MM:SS format (HH:MM:SS if showHours and over 1 hour)
 * - Auto-updates every second when running
 * - Pauses when session is paused
 * - Excludes paused duration from display
 * - Multiple size variants
 * - Dark/light mode support
 */
export function TimeDisplay({
  startTime,
  isPaused = false,
  pausedDuration = 0,
  showHours = false,
  label = 'Time',
  size = 'md',
  className = '',
}: TimeDisplayProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Not started yet
    if (startTime === null) {
      setElapsedMs(0);
      return;
    }

    // Calculate current elapsed time
    const calculateElapsed = () => {
      const now = Date.now();
      let elapsed = now - startTime - pausedDuration;

      // If currently paused, freeze the display
      if (isPaused && pausedAtRef.current !== null) {
        elapsed = pausedAtRef.current - startTime - pausedDuration;
      }

      return Math.max(0, elapsed);
    };

    // Update elapsed time
    setElapsedMs(calculateElapsed());

    // Track when we paused
    if (isPaused) {
      pausedAtRef.current = Date.now();
    } else {
      pausedAtRef.current = null;
    }

    // Only run interval if not paused
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedMs(calculateElapsed());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, isPaused, pausedDuration]);

  const sizeClasses = getSizeClasses(size);
  const formattedTime = formatTime(elapsedMs, showHours);

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        ${sizeClasses.container}
        ${className}
      `}
      role="timer"
      aria-label={`Elapsed time: ${formattedTime}`}
      aria-live="off" // Don't announce every second
    >
      <span
        className={`
          ${sizeClasses.value}
          tabular-nums
          text-gray-900 dark:text-gray-100
          ${isPaused ? 'opacity-60' : 'opacity-100'}
          transition-opacity duration-200
        `}
      >
        {formattedTime}
      </span>

      <span
        className={`
          ${sizeClasses.label}
          text-gray-500 dark:text-gray-400
          uppercase tracking-wider
          flex items-center gap-1
        `}
      >
        {label}
        {isPaused && (
          <span className="text-yellow-500 dark:text-yellow-400 normal-case">
            (paused)
          </span>
        )}
      </span>
    </div>
  );
}

export default TimeDisplay;
