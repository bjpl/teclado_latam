/**
 * @file page.tsx
 * @description History page showing past typing sessions, statistics, and progress.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSessionHistory, type SessionRecord } from '@/hooks';
import {
  StatsOverview,
  SessionList,
  SessionDetail,
} from '@/components/history';
import { ProgressChart, type DataPoint } from '@/components/metrics/ProgressChart';
import { Modal, Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

/**
 * History Page - Session history, statistics, and progress visualization
 *
 * Features:
 * - Overall statistics overview
 * - Progress charts (WPM and accuracy over time)
 * - Sortable/filterable session list
 * - Expandable session details
 * - Clear history with confirmation
 * - Navigation back to practice
 */
export default function HistoryPage() {
  const {
    sessions,
    isLoaded,
    removeSession,
    clearHistory,
    filterSessions,
    statistics,
  } = useSessionHistory();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [chartMetric, setChartMetric] = useState<'wpm' | 'accuracy' | 'both'>('both');

  // Convert sessions to chart data points (reverse to show oldest first on chart)
  const chartData: DataPoint[] = useMemo(() => {
    return sessions
      .slice()
      .reverse()
      .slice(-20) // Last 20 sessions for chart
      .map((session, idx) => ({
        label: `#${idx + 1}`,
        wpm: session.wpm.netWPM,
        accuracy: session.accuracy,
        timestamp: session.startTime,
      }));
  }, [sessions]);

  // Handle retry - store text for practice page to pick up
  const handleRetry = useCallback((session: SessionRecord) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('retryText', session.text);
      window.location.href = '/';
    }
  }, []);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    clearHistory();
    setShowClearConfirm(false);
  }, [clearHistory]);

  // Handle delete single session
  const handleDelete = useCallback((sessionId: string) => {
    removeSession(sessionId);
  }, [removeSession]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-0/80 backdrop-blur-sm border-b border-border-muted">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Practice
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Session History
            </h1>
            <div className="w-[140px]" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative z-0">
        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Statistics
          </h2>
          <StatsOverview stats={statistics} />
        </section>

        {/* Progress Chart */}
        {sessions.length > 1 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Progress Over Time
              </h2>
              <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1">
                {(['wpm', 'accuracy', 'both'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setChartMetric(metric)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      chartMetric === metric
                        ? 'bg-surface-0 text-foreground shadow-sm'
                        : 'text-foreground/60 hover:text-foreground'
                    )}
                  >
                    {metric === 'both' ? 'Both' : metric.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <ProgressChart
              data={chartData}
              metric={chartMetric}
              height={280}
              showGrid={true}
              showDots={chartData.length <= 15}
            />
          </section>
        )}

        {/* Session List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Past Sessions
            </h2>
            {sessions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-sm text-accent-error hover:text-accent-error/80 transition-colors"
              >
                Clear All History
              </button>
            )}
          </div>
          <SessionList
            sessions={sessions}
            filterSessions={filterSessions}
            onRetry={handleRetry}
            onDelete={handleDelete}
            isLoading={!isLoaded}
          />
        </section>

        {/* Empty state CTA */}
        {sessions.length === 0 && isLoaded && (
          <section className="text-center py-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start Your First Session
            </Link>
          </section>
        )}
      </main>

      {/* Clear History Confirmation Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All History?"
        description="This action cannot be undone. All your session data and statistics will be permanently deleted."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAll}>
              Yes, Clear All
            </Button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-foreground/60">
            You are about to delete {sessions.length} session{sessions.length !== 1 ? 's' : ''} and all associated statistics.
          </p>
        </div>
      </Modal>

      {/* Session Detail Modal */}
      {selectedSession && (
        <Modal
          isOpen={Boolean(selectedSession)}
          onClose={() => setSelectedSession(null)}
          size="xl"
          showCloseButton={false}
        >
          <SessionDetail
            session={selectedSession}
            onRetry={() => handleRetry(selectedSession)}
            onClose={() => setSelectedSession(null)}
          />
        </Modal>
      )}
    </div>
  );
}
