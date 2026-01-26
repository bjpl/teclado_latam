/**
 * @file SessionDetail.tsx
 * @description Detailed session view with full metrics and error highlighting.
 */

'use client';

import { useMemo } from 'react';
import type { SessionRecord } from '@/hooks';
import { cn } from '@/lib/utils/cn';

export interface SessionDetailProps {
  /** Session data */
  session: SessionRecord;
  /** Callback when retry button clicked */
  onRetry?: () => void;
  /** Callback when close button clicked */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format timestamp for display
 */
function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration for display (ms to human readable)
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} seconds`;
  }
  return `${minutes} min ${seconds} sec`;
}

/**
 * Get color class based on accuracy
 */
function getAccuracyColorClass(accuracy: number): string {
  if (accuracy >= 95) return 'text-accent-success';
  if (accuracy >= 85) return 'text-accent-warning';
  return 'text-accent-error';
}

/**
 * Metric display component
 */
function MetricDisplay({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        highlight ? 'bg-accent-primary/10' : 'bg-surface-1/50'
      )}
    >
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sublabel && <p className="text-xs text-foreground/40">{sublabel}</p>}
    </div>
  );
}

/**
 * SessionDetail - Comprehensive session view
 *
 * Features:
 * - Full timestamp and duration
 * - All metrics (WPM, accuracy, characters, errors)
 * - Problematic characters highlighting
 * - Full practice text display
 * - Retry same text option
 */
export function SessionDetail({
  session,
  onRetry,
  onClose,
  className = '',
}: SessionDetailProps) {
  // Get problematic characters for highlighting
  const problematicChars = useMemo(() => {
    return new Set(session.problematicChars || []);
  }, [session.problematicChars]);

  // Calculate error rate
  const errorRate = useMemo(() => {
    if (session.textLength === 0) return 0;
    return (session.errors / session.textLength) * 100;
  }, [session.errors, session.textLength]);

  return (
    <div
      className={cn(
        'bg-surface-0',
        'border border-border-muted',
        'rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-muted bg-surface-1/50">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Session Details
          </h2>
          <p className="text-sm text-foreground/60">
            {formatFullDate(session.startTime)}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-foreground/40 hover:text-foreground/70 rounded-lg hover:bg-surface-1 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Hero metrics */}
      <div className="p-6 border-b border-border-muted">
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-foreground tabular-nums">
              {session.wpm.netWPM.toFixed(1)}
            </p>
            <p className="text-sm text-foreground/60 mt-1">WPM (Net)</p>
          </div>
          <div className="text-center">
            <p
              className={cn(
                'text-5xl font-bold tabular-nums',
                getAccuracyColorClass(session.accuracy)
              )}
            >
              {session.accuracy.toFixed(1)}%
            </p>
            <p className="text-sm text-foreground/60 mt-1">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-foreground tabular-nums">
              {formatDuration(session.duration).split(' ')[0]}
            </p>
            <p className="text-sm text-foreground/60 mt-1">
              {formatDuration(session.duration).split(' ').slice(1).join(' ')}
            </p>
          </div>
        </div>

        {/* Detailed metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricDisplay label="Gross WPM" value={session.wpm.grossWPM.toFixed(1)} />
          <MetricDisplay label="CPM" value={session.wpm.cpm.toFixed(0)} sublabel="chars/min" />
          <MetricDisplay label="Characters" value={session.textLength} />
          <MetricDisplay label="Mode" value={session.mode.replace('-', ' ')} />
          <MetricDisplay
            label="Total Errors"
            value={session.errors}
            sublabel={`${errorRate.toFixed(1)}% error rate`}
          />
          <MetricDisplay label="Corrected" value={session.correctedErrors} />
          <MetricDisplay
            label="Characters/Error"
            value={session.errors > 0
              ? Math.round(session.textLength / session.errors)
              : 'Perfect!'}
          />
          {session.label && (
            <MetricDisplay label="Label" value={session.label} />
          )}
        </div>
      </div>

      {/* Problematic characters */}
      {session.problematicChars && session.problematicChars.length > 0 && (
        <div className="p-6 border-b border-border-muted">
          <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-4">
            Characters to Practice
          </h3>
          <div className="flex flex-wrap gap-2">
            {session.problematicChars.slice(0, 10).map((char, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-4 py-2 bg-accent-error/10 rounded-lg font-mono text-lg text-accent-error"
              >
                {char === ' ' ? '\u2423' : char}
              </span>
            ))}
          </div>

          {/* Suggestion */}
          <div className="mt-4 p-4 bg-accent-primary/10 rounded-xl">
            <p className="text-sm font-medium text-accent-primary mb-1">
              Suggestion
            </p>
            <p className="text-sm text-foreground/80">
              Focus on practicing these characters: {' '}
              <span className="font-mono font-bold">
                {session.problematicChars.slice(0, 5).map(c =>
                  c === ' ' ? 'space' : c
                ).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Practice text with highlighting */}
      <div className="p-6 border-b border-border-muted">
        <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-3">
          Practice Text
        </h3>
        <div className="font-mono text-sm leading-relaxed p-4 bg-surface-1/50 rounded-xl">
          {session.text.split('').map((char, idx) => {
            const isProblematic = problematicChars.has(char);
            return (
              <span
                key={idx}
                className={cn(
                  isProblematic && 'bg-accent-error/20 text-accent-error rounded px-0.5'
                )}
              >
                {char}
              </span>
            );
          })}
        </div>
        {problematicChars.size > 0 && (
          <p className="text-xs text-foreground/40 mt-2">
            Characters with errors are highlighted
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 flex items-center justify-end gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/80 bg-surface-1 hover:bg-surface-2 rounded-lg transition-colors"
          >
            Close
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry This Text
          </button>
        )}
      </div>
    </div>
  );
}

export default SessionDetail;
