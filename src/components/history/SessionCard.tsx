/**
 * @file SessionCard.tsx
 * @description Individual session card showing key metrics and preview.
 */

'use client';

import { useState } from 'react';
import type { SessionRecord } from '@/hooks';
import { cn } from '@/lib/utils/cn';

export interface SessionCardProps {
  /** Session data */
  session: SessionRecord;
  /** Whether this card is expanded */
  isExpanded?: boolean;
  /** Toggle expansion callback */
  onToggleExpand?: () => void;
  /** Callback when retry button clicked */
  onRetry?: (session: SessionRecord) => void;
  /** Callback when delete button clicked */
  onDelete?: (sessionId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format timestamp for display
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format duration for display (ms to human readable)
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
 * Get color class based on accuracy
 */
function getAccuracyColorClass(accuracy: number): string {
  if (accuracy >= 95) return 'text-accent-success';
  if (accuracy >= 85) return 'text-accent-warning';
  return 'text-accent-error';
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * SessionCard - Individual session display card
 *
 * Features:
 * - Date and time display
 * - Key metrics (WPM, accuracy, duration)
 * - Text preview (truncated)
 * - Expandable for full details
 * - Retry and delete actions
 */
export function SessionCard({
  session,
  isExpanded = false,
  onToggleExpand,
  onRetry,
  onDelete,
  className = '',
}: SessionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.(session.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={cn(
        'bg-surface-0',
        'border border-border-muted',
        'rounded-xl overflow-hidden',
        'transition-all duration-200',
        isExpanded && 'ring-2 ring-accent-primary/20',
        className
      )}
    >
      {/* Main card content (always visible) */}
      <button
        className={cn(
          'w-full text-left p-4',
          'hover:bg-surface-1/50',
          'transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset'
        )}
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Date and metrics */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-foreground/60">
                {formatDate(session.startTime)}
              </span>
              <span className="text-foreground/30">|</span>
              <span className="text-sm text-foreground/60">
                {formatDuration(session.duration)}
              </span>
              {session.label && (
                <>
                  <span className="text-foreground/30">|</span>
                  <span className="text-sm text-accent-primary font-medium">
                    {session.label}
                  </span>
                </>
              )}
            </div>

            {/* Metrics row */}
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {session.wpm.netWPM.toFixed(1)}
                </span>
                <span className="text-sm text-foreground/60">WPM</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'text-xl font-semibold tabular-nums',
                    getAccuracyColorClass(session.accuracy)
                  )}
                >
                  {session.accuracy.toFixed(1)}%
                </span>
                <span className="text-sm text-foreground/60">accuracy</span>
              </div>
            </div>

            {/* Text preview */}
            <p className="mt-2 text-sm text-foreground/60 font-mono truncate">
              {truncateText(session.text, 60)}
            </p>
          </div>

          {/* Right side: Expand indicator */}
          <div className="flex items-center">
            <svg
              className={cn(
                'w-5 h-5 text-foreground/40 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border-muted">
          {/* Detailed metrics */}
          <div className="p-4 bg-surface-1/50">
            <h4 className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-3">
              Session Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Gross WPM</p>
                <p className="font-medium text-foreground tabular-nums">
                  {session.wpm.grossWPM.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Characters</p>
                <p className="font-medium text-foreground tabular-nums">
                  {session.textLength}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total Errors</p>
                <p className="font-medium text-foreground tabular-nums">
                  {session.errors}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Mode</p>
                <p className="font-medium text-foreground capitalize">
                  {session.mode.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Full text */}
          <div className="p-4 border-t border-border-muted">
            <h4 className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">
              Practice Text
            </h4>
            <p className="text-sm text-foreground/80 font-mono whitespace-pre-wrap break-words">
              {session.text}
            </p>
          </div>

          {/* Problematic characters if available */}
          {session.problematicChars && session.problematicChars.length > 0 && (
            <div className="p-4 border-t border-border-muted">
              <h4 className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-3">
                Characters to Practice
              </h4>
              <div className="flex flex-wrap gap-2">
                {session.problematicChars.slice(0, 10).map((char, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 bg-accent-error/10 rounded-lg font-mono text-accent-error"
                  >
                    {char === ' ' ? '\u2423' : char}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-border-muted flex items-center justify-between">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/60">Delete this session?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-accent-error hover:bg-accent-error/90 rounded-lg transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-1.5 text-sm font-medium text-foreground/80 bg-surface-1 hover:bg-surface-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="text-sm text-accent-error hover:text-accent-error/80 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => onRetry?.(session)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry this text
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionCard;
