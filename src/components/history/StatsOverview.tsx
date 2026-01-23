/**
 * @file StatsOverview.tsx
 * @description Overall statistics display showing aggregated metrics across all sessions.
 */

'use client';

import type { SessionStatistics } from '@/hooks';
import { cn } from '@/lib/utils/cn';

export interface StatsOverviewProps {
  /** Aggregated statistics */
  stats: SessionStatistics;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format duration for display (ms to human readable)
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format large numbers with K suffix
 */
function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Individual stat card component
 */
function StatCard({
  label,
  value,
  sublabel,
  icon,
  colorClass,
  trend,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  colorClass?: string;
  trend?: number;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          colorClass || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 tabular-nums truncate">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
        )}
        {trend !== undefined && trend !== 0 && (
          <p
            className={cn(
              'text-xs',
              trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {trend > 0 ? '+' : ''}{trend.toFixed(1)} vs older sessions
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * StatsOverview - Displays aggregated statistics across all sessions
 *
 * Features:
 * - Total practice time
 * - Total sessions
 * - Average WPM and accuracy
 * - Best WPM ever achieved
 * - WPM and accuracy trends
 */
export function StatsOverview({ stats, className = '' }: StatsOverviewProps) {
  if (stats.totalSessions === 0) {
    return (
      <div
        className={cn(
          'p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700',
          className
        )}
      >
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No Statistics Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Complete your first typing session to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Practice"
          value={formatDuration(stats.totalTime)}
          sublabel={`${stats.totalSessions} sessions`}
          colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Average WPM"
          value={stats.averageWpm.toFixed(1)}
          sublabel="words per minute"
          colorClass="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          trend={stats.wpmTrend}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="Average Accuracy"
          value={`${stats.averageAccuracy.toFixed(1)}%`}
          sublabel="overall accuracy"
          colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          trend={stats.accuracyTrend}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Best WPM"
          value={stats.bestWpm.toFixed(1)}
          sublabel="personal record"
          colorClass="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Characters Typed"
          value={formatNumber(stats.totalCharacters)}
          colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          sublabel="completed"
          colorClass="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          label="Best Accuracy"
          value={`${stats.bestAccuracy.toFixed(1)}%`}
          sublabel="personal record"
          colorClass="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        {stats.mostProblematicChars.length > 0 && (
          <StatCard
            label="Focus On"
            value={stats.mostProblematicChars.slice(0, 3).map(c => c === ' ' ? '\u2423' : c).join(', ')}
            sublabel="most missed chars"
            colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
}

export default StatsOverview;
