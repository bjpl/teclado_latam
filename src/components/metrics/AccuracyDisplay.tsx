/**
 * @file AccuracyDisplay.tsx
 * @description Accuracy percentage display with color coding and optional breakdown.
 *
 * Shows accuracy as a percentage with visual indicators:
 * - Green: >95% accuracy (excellent)
 * - Yellow: 85-95% accuracy (good)
 * - Red: <85% accuracy (needs improvement)
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 5 (Real-time Metrics Update)
 */

'use client';

import { useState, useCallback } from 'react';

export interface CharacterBreakdown {
  /** Character */
  char: string;
  /** Accuracy percentage for this character */
  accuracy: number;
  /** Total attempts */
  attempts: number;
}

export interface AccuracyDisplayProps {
  /** Accuracy percentage (0-100) */
  value: number;
  /** Optional label (defaults to "Accuracy") */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show decimal place */
  showDecimal?: boolean;
  /** Optional character breakdown for hover */
  characterBreakdown?: CharacterBreakdown[];
  /** Whether to show breakdown on hover */
  showBreakdownOnHover?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get accuracy color class based on value
 */
function getAccuracyColorClass(value: number): string {
  if (value >= 95) {
    return 'text-green-600 dark:text-green-400';
  } else if (value >= 85) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Get accuracy background class for indicator
 */
function getAccuracyBgClass(value: number): string {
  if (value >= 95) {
    return 'bg-green-100 dark:bg-green-900/30';
  } else if (value >= 85) {
    return 'bg-yellow-100 dark:bg-yellow-900/30';
  } else {
    return 'bg-red-100 dark:bg-red-900/30';
  }
}

/**
 * Get size classes for the component
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg'): {
  container: string;
  value: string;
  label: string;
  indicator: string;
} {
  switch (size) {
    case 'sm':
      return {
        container: 'gap-0.5',
        value: 'text-2xl font-bold',
        label: 'text-xs',
        indicator: 'w-2 h-2',
      };
    case 'md':
      return {
        container: 'gap-1',
        value: 'text-4xl font-bold',
        label: 'text-sm',
        indicator: 'w-3 h-3',
      };
    case 'lg':
      return {
        container: 'gap-1.5',
        value: 'text-6xl font-bold',
        label: 'text-base',
        indicator: 'w-4 h-4',
      };
  }
}

/**
 * Character breakdown tooltip component
 */
function BreakdownTooltip({
  breakdown,
  visible,
}: {
  breakdown: CharacterBreakdown[];
  visible: boolean;
}) {
  if (!visible || breakdown.length === 0) {
    return null;
  }

  // Sort by accuracy (worst first) and limit to top 5
  const sortedBreakdown = [...breakdown]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return (
    <div
      className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-lg
        p-3 min-w-[180px]
        z-10
        animate-in fade-in-0 zoom-in-95 duration-200
      "
      role="tooltip"
    >
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Most Missed Characters
      </div>
      <div className="space-y-1">
        {sortedBreakdown.map(({ char, accuracy, attempts }) => (
          <div
            key={char}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-mono text-gray-900 dark:text-gray-100">
              &quot;{char === ' ' ? '\u2423' : char}&quot;
            </span>
            <span className={getAccuracyColorClass(accuracy)}>
              {accuracy.toFixed(1)}%
            </span>
            <span className="text-gray-400 text-xs">
              ({attempts})
            </span>
          </div>
        ))}
      </div>
      {/* Tooltip arrow */}
      <div
        className="
          absolute top-full left-1/2 -translate-x-1/2
          border-8 border-transparent
          border-t-white dark:border-t-gray-800
        "
      />
    </div>
  );
}

/**
 * AccuracyDisplay - Accuracy percentage display component
 *
 * Features:
 * - Color-coded accuracy indicator (green/yellow/red)
 * - Optional decimal precision
 * - Optional character breakdown on hover
 * - Multiple size variants
 * - Dark/light mode support
 */
export function AccuracyDisplay({
  value,
  label = 'Accuracy',
  size = 'md',
  showDecimal = true,
  characterBreakdown,
  showBreakdownOnHover = true,
  className = '',
}: AccuracyDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (showBreakdownOnHover && characterBreakdown && characterBreakdown.length > 0) {
      setShowTooltip(true);
    }
  }, [showBreakdownOnHover, characterBreakdown]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const sizeClasses = getSizeClasses(size);
  const colorClass = getAccuracyColorClass(value);
  const bgClass = getAccuracyBgClass(value);

  const formattedValue = showDecimal ? value.toFixed(1) : Math.round(value).toString();

  return (
    <div
      className={`
        relative
        flex flex-col items-center justify-center
        ${sizeClasses.container}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-label={`${formattedValue} percent accuracy`}
      aria-live="polite"
    >
      {/* Breakdown tooltip */}
      {characterBreakdown && (
        <BreakdownTooltip
          breakdown={characterBreakdown}
          visible={showTooltip}
        />
      )}

      <div className="flex items-center gap-2">
        {/* Accuracy indicator dot */}
        <span
          className={`
            ${sizeClasses.indicator}
            ${bgClass}
            rounded-full
            flex items-center justify-center
          `}
        >
          <span
            className={`
              w-1/2 h-1/2 rounded-full
              ${value >= 95 ? 'bg-green-500' : value >= 85 ? 'bg-yellow-500' : 'bg-red-500'}
            `}
          />
        </span>

        <span
          className={`
            ${sizeClasses.value}
            ${colorClass}
            tabular-nums
            transition-colors duration-200
          `}
        >
          {formattedValue}%
        </span>
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

      {/* Hover hint */}
      {showBreakdownOnHover && characterBreakdown && characterBreakdown.length > 0 && (
        <span className="sr-only">
          Hover for character breakdown
        </span>
      )}
    </div>
  );
}

export default AccuracyDisplay;
