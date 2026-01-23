/**
 * @file SessionResults.tsx
 * @description End-of-session results panel with comprehensive analysis.
 *
 * Displays final metrics, error breakdown, comparison to previous sessions,
 * and action buttons for retry/new text.
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 6 (Results Screen Generation)
 */

'use client';

import { useMemo } from 'react';
import type { ErrorPattern, Suggestion, SessionMetrics } from '@/lib/metrics/types';

export interface SessionComparison {
  /** Previous average WPM */
  previousAvgWPM: number;
  /** Previous average accuracy */
  previousAvgAccuracy: number;
  /** WPM change from average */
  wpmChange: number;
  /** Accuracy change from average */
  accuracyChange: number;
  /** Whether this is a new personal best WPM */
  isNewWPMRecord: boolean;
  /** Whether this is a new personal best accuracy */
  isNewAccuracyRecord: boolean;
  /** Total sessions completed */
  totalSessions: number;
}

export interface SessionResultsProps {
  /** Session metrics */
  metrics: SessionMetrics;
  /** Session duration in ms */
  duration: number;
  /** Total characters in text */
  totalCharacters: number;
  /** Total words typed */
  wordsTyped: number;
  /** Error patterns identified */
  errorPatterns?: ErrorPattern[];
  /** Improvement suggestions */
  suggestions?: Suggestion[];
  /** Comparison to previous sessions */
  comparison?: SessionComparison;
  /** Callback when retry button clicked */
  onRetry?: () => void;
  /** Callback when new text button clicked */
  onNewText?: () => void;
  /** Callback when view history button clicked */
  onViewHistory?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Get accuracy color class
 */
function getAccuracyColorClass(value: number): string {
  if (value >= 95) return 'text-green-600 dark:text-green-400';
  if (value >= 85) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get change indicator
 */
function getChangeIndicator(change: number, isPercentage: boolean = false): {
  text: string;
  color: string;
} {
  const suffix = isPercentage ? '%' : '';
  if (change > 0) {
    return {
      text: `+${change.toFixed(1)}${suffix}`,
      color: 'text-green-600 dark:text-green-400',
    };
  } else if (change < 0) {
    return {
      text: `${change.toFixed(1)}${suffix}`,
      color: 'text-red-600 dark:text-red-400',
    };
  }
  return {
    text: `0${suffix}`,
    color: 'text-gray-500 dark:text-gray-400',
  };
}

/**
 * Hero stat component
 */
function HeroStat({
  value,
  label,
  sublabel,
  colorClass,
  change,
  isRecord,
}: {
  value: string;
  label: string;
  sublabel?: string;
  colorClass?: string;
  change?: { text: string; color: string };
  isRecord?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span
          className={`
            text-5xl font-bold tabular-nums
            ${colorClass || 'text-gray-900 dark:text-gray-100'}
          `}
        >
          {value}
        </span>
        {isRecord && (
          <span className="text-2xl" role="img" aria-label="New record">
            🏆
          </span>
        )}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      {sublabel && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {sublabel}
        </span>
      )}
      {change && (
        <span className={`text-sm ${change.color}`}>
          {change.text} vs avg
        </span>
      )}
    </div>
  );
}

/**
 * Secondary stat component
 */
function SecondaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">
        {value}
      </span>
    </div>
  );
}

/**
 * Error breakdown component
 */
function ErrorBreakdown({ patterns }: { patterns: ErrorPattern[] }) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-4 text-green-600 dark:text-green-400">
        Perfect! No errors made.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {patterns.slice(0, 5).map((pattern, index) => (
        <div
          key={`${pattern.expected}-${index}`}
          className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {pattern.expected === ' ' ? '\u2423' : pattern.expected}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {'\u2192'} {pattern.commonMistakes.slice(0, 2).map(m =>
                m === ' ' ? '\u2423' : m
              ).join(', ')}
            </span>
          </div>
          <span className="text-red-600 dark:text-red-400 font-medium">
            {pattern.frequency}x
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Suggestion component
 */
function SuggestionItem({ suggestion }: { suggestion: Suggestion }) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20',
    medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20',
    low: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20',
  };

  return (
    <div
      className={`
        p-3 rounded-lg border
        ${priorityColors[suggestion.priority]}
      `}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">
          {suggestion.priority === 'high' ? '⚠️' : suggestion.priority === 'medium' ? '💡' : 'ℹ️'}
        </span>
        <div>
          <p className="text-gray-900 dark:text-gray-100">
            {suggestion.message}
          </p>
          {suggestion.practiceChars.length > 0 && (
            <div className="mt-2 flex gap-1">
              {suggestion.practiceChars.map((char, i) => (
                <span
                  key={i}
                  className="font-mono text-sm bg-white dark:bg-gray-800 px-2 py-0.5 rounded"
                >
                  {char === ' ' ? '\u2423' : char}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SessionResults - End-of-session results panel
 *
 * Features:
 * - Final WPM (gross and net)
 * - Final accuracy with color coding
 * - Total time, characters, words
 * - Error breakdown (most missed characters)
 * - Comparison to previous sessions
 * - Improvement suggestions
 * - Retry and New Text buttons
 */
export function SessionResults({
  metrics,
  duration,
  totalCharacters,
  wordsTyped,
  errorPatterns = [],
  suggestions = [],
  comparison,
  onRetry,
  onNewText,
  onViewHistory,
  className = '',
}: SessionResultsProps) {
  // Calculate change indicators if comparison available
  const wpmChange = useMemo(() => {
    if (!comparison) return undefined;
    return getChangeIndicator(comparison.wpmChange);
  }, [comparison]);

  const accuracyChange = useMemo(() => {
    if (!comparison) return undefined;
    return getChangeIndicator(comparison.accuracyChange, true);
  }, [comparison]);

  return (
    <div
      className={`
        max-w-2xl mx-auto
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-2xl shadow-lg
        overflow-hidden
        ${className}
      `}
      role="region"
      aria-label="Session results"
    >
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Session Complete!
        </h2>
        {comparison && comparison.totalSessions > 1 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Session #{comparison.totalSessions}
          </p>
        )}
      </div>

      {/* Hero Stats */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center gap-12">
          <HeroStat
            value={metrics.wpm.netWPM.toFixed(1)}
            label="WPM"
            sublabel="(Net)"
            change={wpmChange}
            isRecord={comparison?.isNewWPMRecord}
          />
          <HeroStat
            value={`${metrics.accuracy.overall.toFixed(1)}%`}
            label="Accuracy"
            colorClass={getAccuracyColorClass(metrics.accuracy.overall)}
            change={accuracyChange}
            isRecord={comparison?.isNewAccuracyRecord}
          />
          <HeroStat
            value={formatDuration(duration)}
            label="Time"
          />
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Details
        </h3>
        <div className="grid grid-cols-2 gap-x-8">
          <SecondaryStat label="Gross WPM" value={metrics.wpm.grossWPM.toFixed(1)} />
          <SecondaryStat label="Characters" value={totalCharacters} />
          <SecondaryStat label="Words" value={wordsTyped} />
          <SecondaryStat label="Total Errors" value={metrics.totalErrors} />
          <SecondaryStat label="Corrected" value={metrics.correctedErrors} />
          <SecondaryStat label="Uncorrected" value={metrics.uncorrectedErrors} />
        </div>
      </div>

      {/* Error Breakdown */}
      {(errorPatterns.length > 0 || metrics.totalErrors === 0) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Error Breakdown
          </h3>
          <ErrorBreakdown patterns={errorPatterns} />
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Suggestions
          </h3>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <SuggestionItem key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 flex gap-3">
        <button
          onClick={onRetry}
          className="
            flex-1 px-4 py-3
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
          "
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </span>
        </button>

        <button
          onClick={onNewText}
          className="
            flex-1 px-4 py-3
            bg-gray-100 hover:bg-gray-200
            dark:bg-gray-800 dark:hover:bg-gray-700
            text-gray-900 dark:text-gray-100 font-medium
            rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
          "
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            New Text
          </span>
        </button>

        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="
              px-4 py-3
              bg-gray-100 hover:bg-gray-200
              dark:bg-gray-800 dark:hover:bg-gray-700
              text-gray-900 dark:text-gray-100 font-medium
              rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-900
            "
            aria-label="View history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default SessionResults;
