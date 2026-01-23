/**
 * @file types.ts
 * @description Type definitions for the session history feature.
 * Re-exports and extends types from the main hooks.
 */

// Re-export types from hooks
export type {
  SessionRecord,
  SessionFilter,
  SessionStatistics,
  UseSessionHistoryReturn,
} from '@/hooks';

/**
 * Sort options for session list
 */
export type SessionSortField = 'date' | 'wpm' | 'accuracy' | 'duration';
export type SessionSortOrder = 'asc' | 'desc';

export interface SessionSortOptions {
  field: SessionSortField;
  order: SessionSortOrder;
}
