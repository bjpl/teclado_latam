/**
 * @file MetricsPanel.tsx
 * @description Real-time metrics display panel during typing practice.
 *
 * Combines WPM, accuracy, error count, and time elapsed in a compact,
 * non-distracting layout. Updates every 500ms during practice.
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 5 (Real-time Metrics Update)
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { WPMDisplay, type TrendDirection } from './WPMDisplay';
import { AccuracyDisplay, type CharacterBreakdown } from './AccuracyDisplay';
import { TimeDisplay } from './TimeDisplay';

export interface MetricsPanelProps {
  /** Gross WPM (all characters) */
  grossWPM: number;
  /** Net WPM (adjusted for errors) */
  netWPM: number;
  /** Accuracy percentage (0-100) */
  accuracy: number;
  /** Total error count */
  errorCount: number;
  /** Session start time (null if not started) */
  startTime: number | null;
  /** Whether session is paused */
  isPaused?: boolean;
  /** Total paused duration in ms */
  pausedDuration?: number;
  /** WPM trend direction */
  wpmTrend?: TrendDirection;
  /** Optional character breakdown for accuracy tooltip */
  characterBreakdown?: CharacterBreakdown[];
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical' | 'compact';
  /** Whether to show gross WPM alongside net */
  showGrossWPM?: boolean;
  /** Callback when metrics should update (every 500ms) */
  onMetricsUpdate?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Metrics update interval in milliseconds
 */
const UPDATE_INTERVAL_MS = 500;

/**
 * MetricsPanel - Real-time metrics display during practice
 *
 * Features:
 * - Combined WPM, accuracy, errors, and time display
 * - Updates every 500ms during active practice
 * - Compact, non-distracting design
 * - Horizontal, vertical, and compact layouts
 * - Dark/light mode support
 * - Accessibility-friendly with proper ARIA labels
 */
export function MetricsPanel({
  grossWPM,
  netWPM,
  accuracy,
  errorCount,
  startTime,
  isPaused = false,
  pausedDuration = 0,
  wpmTrend,
  characterBreakdown,
  layout = 'horizontal',
  showGrossWPM = false,
  onMetricsUpdate,
  className = '',
}: MetricsPanelProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set up metrics update interval
  const startUpdateInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (onMetricsUpdate && startTime !== null && !isPaused) {
      intervalRef.current = setInterval(() => {
        onMetricsUpdate();
      }, UPDATE_INTERVAL_MS);
    }
  }, [onMetricsUpdate, startTime, isPaused]);

  useEffect(() => {
    startUpdateInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startUpdateInterval]);

  // Layout-specific classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex-row items-center gap-8 px-6 py-4';
      case 'vertical':
        return 'flex-col items-center gap-4 px-4 py-6';
      case 'compact':
        return 'flex-row items-center gap-4 px-4 py-2';
    }
  };

  // Size variant based on layout
  const getSize = (): 'sm' | 'md' | 'lg' => {
    switch (layout) {
      case 'horizontal':
        return 'md';
      case 'vertical':
        return 'lg';
      case 'compact':
        return 'sm';
    }
  };

  const size = getSize();

  return (
    <div
      className={`
        flex ${getLayoutClasses()}
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-sm
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-sm
        ${className}
      `}
      role="region"
      aria-label="Typing metrics"
    >
      {/* WPM Section */}
      <div className="flex flex-col items-center">
        <WPMDisplay
          value={netWPM}
          label={showGrossWPM ? 'Net WPM' : 'WPM'}
          trend={wpmTrend}
          showTrend={!!wpmTrend}
          size={size}
          animate={true}
        />
        {showGrossWPM && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Gross: {grossWPM.toFixed(1)}
          </div>
        )}
      </div>

      {/* Divider */}
      {layout !== 'compact' && (
        <div
          className={`
            ${layout === 'horizontal' ? 'w-px h-12' : 'h-px w-12'}
            bg-gray-200 dark:bg-gray-700
          `}
          aria-hidden="true"
        />
      )}

      {/* Accuracy Section */}
      <AccuracyDisplay
        value={accuracy}
        size={size}
        showDecimal={layout !== 'compact'}
        characterBreakdown={characterBreakdown}
        showBreakdownOnHover={layout !== 'compact'}
      />

      {/* Divider */}
      {layout !== 'compact' && (
        <div
          className={`
            ${layout === 'horizontal' ? 'w-px h-12' : 'h-px w-12'}
            bg-gray-200 dark:bg-gray-700
          `}
          aria-hidden="true"
        />
      )}

      {/* Errors Section */}
      <div
        className={`
          flex flex-col items-center
          ${layout === 'compact' ? 'gap-0' : 'gap-1'}
        `}
        role="status"
        aria-label={`${errorCount} errors`}
      >
        <span
          className={`
            tabular-nums font-bold
            ${size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-6xl'}
            ${errorCount === 0
              ? 'text-green-600 dark:text-green-400'
              : errorCount <= 5
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }
          `}
        >
          {errorCount}
        </span>
        <span
          className={`
            ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
            text-gray-500 dark:text-gray-400
            uppercase tracking-wider
          `}
        >
          Errors
        </span>
      </div>

      {/* Divider */}
      {layout !== 'compact' && (
        <div
          className={`
            ${layout === 'horizontal' ? 'w-px h-12' : 'h-px w-12'}
            bg-gray-200 dark:bg-gray-700
          `}
          aria-hidden="true"
        />
      )}

      {/* Time Section */}
      <TimeDisplay
        startTime={startTime}
        isPaused={isPaused}
        pausedDuration={pausedDuration}
        size={size}
      />
    </div>
  );
}

export default MetricsPanel;
