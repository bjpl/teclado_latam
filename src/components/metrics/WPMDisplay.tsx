/**
 * @file WPMDisplay.tsx
 * @description Words per minute counter with animated value changes and trend indicator.
 *
 * Displays a large, prominent WPM number with optional trend direction
 * (up, down, stable) and smooth value transition animations.
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 5 (Real-time Metrics Update)
 */

'use client';

import { useEffect, useRef, useState } from 'react';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface WPMDisplayProps {
  /** Current words per minute value */
  value: number;
  /** Optional label (defaults to "WPM") */
  label?: string;
  /** Optional trend indicator */
  trend?: TrendDirection;
  /** Whether to show trend indicator */
  showTrend?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to animate value changes */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get trend indicator arrow
 */
function getTrendArrow(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '\u2191'; // Up arrow
    case 'down':
      return '\u2193'; // Down arrow
    case 'stable':
      return '\u2192'; // Right arrow
  }
}

/**
 * Get trend color class
 */
function getTrendColorClass(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return 'text-green-500 dark:text-green-400';
    case 'down':
      return 'text-red-500 dark:text-red-400';
    case 'stable':
      return 'text-gray-500 dark:text-gray-400';
  }
}

/**
 * Get size classes for the component
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg'): {
  container: string;
  value: string;
  label: string;
  trend: string;
} {
  switch (size) {
    case 'sm':
      return {
        container: 'gap-0.5',
        value: 'text-2xl font-bold',
        label: 'text-xs',
        trend: 'text-sm',
      };
    case 'md':
      return {
        container: 'gap-1',
        value: 'text-4xl font-bold',
        label: 'text-sm',
        trend: 'text-base',
      };
    case 'lg':
      return {
        container: 'gap-1.5',
        value: 'text-6xl font-bold',
        label: 'text-base',
        trend: 'text-lg',
      };
  }
}

/**
 * WPMDisplay - Words per minute counter component
 *
 * Features:
 * - Large, prominent number display
 * - Optional trend indicator (up/down/stable arrows)
 * - Animated value transitions
 * - Multiple size variants
 * - Dark/light mode support
 */
export function WPMDisplay({
  value,
  label = 'WPM',
  trend,
  showTrend = true,
  size = 'md',
  animate = true,
  className = '',
}: WPMDisplayProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || value === previousValue.current) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    // Animate value change
    const startValue = previousValue.current;
    const endValue = value;
    const duration = 300; // ms
    const startTime = performance.now();

    setIsAnimating(true);

    const animateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(Math.round(currentValue * 10) / 10);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate]);

  const sizeClasses = getSizeClasses(size);

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        ${sizeClasses.container}
        ${className}
      `}
      role="status"
      aria-label={`${displayValue.toFixed(1)} words per minute`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span
          className={`
            ${sizeClasses.value}
            tabular-nums
            text-gray-900 dark:text-gray-100
            transition-transform duration-150
            ${isAnimating ? 'scale-105' : 'scale-100'}
          `}
        >
          {displayValue.toFixed(1)}
        </span>

        {showTrend && trend && (
          <span
            className={`
              ${sizeClasses.trend}
              ${getTrendColorClass(trend)}
              transition-opacity duration-200
            `}
            aria-label={`Trend: ${trend}`}
          >
            {getTrendArrow(trend)}
          </span>
        )}
      </div>

      <span
        className={`
          ${sizeClasses.label}
          text-gray-500 dark:text-gray-400
          uppercase tracking-wider
        `}
      >
        {label}
      </span>
    </div>
  );
}

export default WPMDisplay;
