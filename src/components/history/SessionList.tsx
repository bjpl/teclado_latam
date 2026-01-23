/**
 * @file SessionList.tsx
 * @description Sortable and filterable list of past typing sessions.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import type { SessionRecord, SessionFilter } from '@/hooks';
import type { SessionSortField, SessionSortOptions } from './types';
import { SessionCard } from './SessionCard';
import { cn } from '@/lib/utils/cn';

export interface SessionListProps {
  /** List of sessions to display */
  sessions: SessionRecord[];
  /** Filter sessions callback */
  filterSessions: (filter: SessionFilter) => SessionRecord[];
  /** Callback when retry button clicked on a session */
  onRetry?: (session: SessionRecord) => void;
  /** Callback when delete button clicked on a session */
  onDelete?: (sessionId: string) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const SORT_OPTIONS: { field: SessionSortField; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'wpm', label: 'WPM' },
  { field: 'accuracy', label: 'Accuracy' },
  { field: 'duration', label: 'Duration' },
];

const SESSIONS_PER_PAGE = 10;

/**
 * Sort button component
 */
function SortButton({
  field,
  label,
  currentField,
  currentOrder,
  onClick,
}: {
  field: SessionSortField;
  label: string;
  currentField: SessionSortField;
  currentOrder: 'asc' | 'desc';
  onClick: (field: SessionSortField) => void;
}) {
  const isActive = field === currentField;

  return (
    <button
      onClick={() => onClick(field)}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {label}
      {isActive && (
        <svg
          className={cn('w-3 h-3 transition-transform', currentOrder === 'asc' && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
}

/**
 * Date range filter component
 */
function DateFilter({
  currentFilter,
  onFilterChange,
}: {
  currentFilter: SessionFilter;
  onFilterChange: (filter: SessionFilter) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'All time', fromDate: undefined },
    { label: 'Last 7 days', fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { label: 'Last 30 days', fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { label: 'Last 90 days', fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  ];

  const currentPreset = presets.find(p => {
    if (!p.fromDate && !currentFilter.fromDate) return true;
    if (!p.fromDate || !currentFilter.fromDate) return false;
    return Math.abs(p.fromDate.getTime() - currentFilter.fromDate.getTime()) < 1000 * 60 * 60; // Within an hour
  }) || presets[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {currentPreset.label}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onFilterChange({ ...currentFilter, fromDate: preset.fromDate, toDate: undefined });
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm transition-colors',
                  preset.label === currentPreset.label
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="py-12 text-center">
      <div className="text-4xl mb-3">
        {hasFilters ? '🔍' : '📝'}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        {hasFilters ? 'No sessions match your filters' : 'No sessions yet'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        {hasFilters
          ? 'Try adjusting your filters or date range.'
          : 'Complete your first typing session to see your history here.'}
      </p>
    </div>
  );
}

/**
 * SessionList - Sortable, filterable list of past sessions
 *
 * Features:
 * - Sort by date, WPM, accuracy, duration
 * - Filter by date range
 * - Expandable session cards
 * - Pagination support
 * - Loading and empty states
 */
export function SessionList({
  sessions: allSessions,
  filterSessions,
  onRetry,
  onDelete,
  isLoading = false,
  className = '',
}: SessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortOptions, setSortOptions] = useState<SessionSortOptions>({
    field: 'date',
    order: 'desc',
  });
  const [filter, setFilter] = useState<SessionFilter>({});
  const [page, setPage] = useState(1);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (Object.keys(filter).length === 0 ||
        (!filter.fromDate && !filter.toDate && filter.minWpm === undefined && filter.minAccuracy === undefined)) {
      return allSessions;
    }
    return filterSessions(filter);
  }, [allSessions, filter, filterSessions]);

  // Sort sessions
  const sortedSessions = useMemo(() => {
    const sorted = [...filteredSessions];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortOptions.field) {
        case 'date':
          comparison = a.startTime - b.startTime;
          break;
        case 'wpm':
          comparison = a.wpm.netWPM - b.wpm.netWPM;
          break;
        case 'accuracy':
          comparison = a.accuracy - b.accuracy;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      return sortOptions.order === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredSessions, sortOptions]);

  // Paginate
  const totalPages = Math.ceil(sortedSessions.length / SESSIONS_PER_PAGE);
  const paginatedSessions = useMemo(() => {
    const start = (page - 1) * SESSIONS_PER_PAGE;
    return sortedSessions.slice(start, start + SESSIONS_PER_PAGE);
  }, [sortedSessions, page]);

  const handleSortClick = useCallback((field: SessionSortField) => {
    setSortOptions(prev => {
      if (field === prev.field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'desc' };
    });
    setPage(1);
  }, []);

  const handleToggleExpand = useCallback((sessionId: string) => {
    setExpandedId((current) => (current === sessionId ? null : sessionId));
  }, []);

  const handleFilterChange = useCallback((newFilter: SessionFilter) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  const hasFilters = Boolean(filter.fromDate || filter.toDate || filter.minWpm || filter.minAccuracy);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Sort buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <div className="flex items-center gap-1">
            {SORT_OPTIONS.map((option) => (
              <SortButton
                key={option.field}
                field={option.field}
                label={option.label}
                currentField={sortOptions.field}
                currentOrder={sortOptions.order}
                onClick={handleSortClick}
              />
            ))}
          </div>
        </div>

        {/* Filter */}
        <DateFilter currentFilter={filter} onFilterChange={handleFilterChange} />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {sortedSessions.length === 0 ? (
          'No sessions'
        ) : (
          <>
            Showing {paginatedSessions.length} of {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}
          </>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading sessions...
          </div>
        </div>
      ) : paginatedSessions.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <>
          {/* Session cards */}
          <div className="space-y-3">
            {paginatedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isExpanded={expandedId === session.id}
                onToggleExpand={() => handleToggleExpand(session.id)}
                onRetry={onRetry}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  page > 1
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  page < totalPages
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                )}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SessionList;
