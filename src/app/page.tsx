/**
 * @file page.tsx
 * @description Main practice page for Teclado LATAM.
 *
 * Combines all components into a cohesive typing practice experience:
 * - Header with app title and settings
 * - PracticeArea for text display and input
 * - VirtualKeyboard for visual feedback
 * - MetricsPanel for real-time stats
 * - Results modal on session completion
 * - Session history tracking
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 7 (Integration)
 */

'use client';

import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PracticeArea, TextSelector, type SessionMetrics } from '@/components/practice';
import { VirtualKeyboard } from '@/components/keyboard';
import { MetricsPanel } from '@/components/metrics';
import { Modal } from '@/components/ui';
import { useSessionHistory, useCustomTexts, useCurriculumProgress } from '@/hooks';
import { LESSONS_BY_ID, getNextLesson, type Lesson } from '@/lib/curriculum';
import type { SessionState, ModifierState } from '@/lib/typing-engine/types';

// =============================================================================
// Component
// =============================================================================

function HomeContent() {
  // Hooks
  const searchParams = useSearchParams();
  const { addSession, statistics, bestSession } = useSessionHistory();
  const { texts: savedTexts, addText, deleteText, updateLastUsed } = useCustomTexts();
  const { markLessonComplete, progress } = useCurriculumProgress();

  // State
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showTextSelector, setShowTextSelector] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentLessonName, setCurrentLessonName] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [completedSession, setCompletedSession] = useState<SessionState | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [modifierState, setModifierState] = useState<ModifierState>({
    shift: false,
    altGr: false,
    ctrl: false,
    meta: false,
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [practiceKey, setPracticeKey] = useState(0); // Key to force PracticeArea reset

  // Refs
  const mainRef = useRef<HTMLElement>(null);
  const finalMetricsRef = useRef<SessionMetrics | null>(null); // Frozen metrics for results modal

  // Track personal best WPM for comparison
  const previousBestWpm = useMemo(() => bestSession?.wpm.netWPM ?? 0, [bestSession]);

  // ==========================================================================
  // Handle lessonId from URL (curriculum integration)
  // ==========================================================================

  useEffect(() => {
    const lessonId = searchParams.get('lessonId');
    if (lessonId) {
      const lesson = LESSONS_BY_ID[lessonId];
      if (lesson && lesson.exercises.length > 0) {
        // Get the first exercise text from the lesson
        const firstExercise = lesson.exercises[0];
        setCurrentText(firstExercise.text);
        setCurrentLessonId(lessonId);
        setCurrentLessonName(lesson.name);
        setShowTextSelector(false);
        setSessionMetrics(null);
        setSessionStartTime(null);
        setNextLesson(null);
      }
    }
  }, [searchParams]);

  // ==========================================================================
  // Key Event Tracking for Virtual Keyboard
  // ==========================================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Track pressed keys for visual feedback
      setPressedKeys((prev) => new Set(prev).add(event.code));

      // Track modifier state
      setModifierState({
        shift: event.shiftKey,
        altGr: event.getModifierState('AltGraph'),
        ctrl: event.ctrlKey,
        meta: event.metaKey,
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Remove from pressed keys
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });

      // Update modifier state
      setModifierState({
        shift: event.shiftKey,
        altGr: event.getModifierState('AltGraph'),
        ctrl: event.ctrlKey,
        meta: event.metaKey,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ==========================================================================
  // Callbacks
  // ==========================================================================

  const handleMetricsUpdate = useCallback((metrics: SessionMetrics) => {
    // Don't update metrics if results modal is showing (preserves final metrics)
    if (showResults) return;

    setSessionMetrics(metrics);
    // Track when session actually starts (first keystroke)
    if (metrics.elapsedTime > 0 && !sessionStartTime) {
      setSessionStartTime(Date.now() - metrics.elapsedTime);
    }
  }, [sessionStartTime, showResults]);

  const handleSessionComplete = useCallback((session: SessionState, finalMetrics: SessionMetrics) => {
    // CRITICAL: Store frozen metrics in ref FIRST - this prevents any timing issues
    finalMetricsRef.current = finalMetrics;

    setCompletedSession(session);
    setSessionMetrics(finalMetrics); // Also update state for MetricsPanel
    setShowResults(true);

    // Use passed metrics directly (reliable) instead of state (race condition prone)
    const now = Date.now();
    const startTime = sessionStartTime ?? (now - finalMetrics.elapsedTime);
    const currentWpm = finalMetrics.estimatedWPM;

    // Check if this is a new personal best
    const newBest = currentWpm > previousBestWpm;
    setIsNewPersonalBest(newBest);

    // Get problematic characters (characters that were typed incorrectly)
    const problematicChars = session.characters
      .filter((c) => c.state === 'incorrect' || c.state === 'corrected')
      .map((c) => c.expected)
      .filter((char, idx, arr) => arr.indexOf(char) === idx); // unique

    addSession({
      startTime,
      endTime: now,
      duration: finalMetrics.elapsedTime,
      text: session.text,
      textLength: session.text.length,
      wpm: {
        grossWPM: finalMetrics.estimatedWPM,
        netWPM: finalMetrics.estimatedWPM,
        cpm: Math.round((finalMetrics.correctCharacters / (finalMetrics.elapsedTime / 60000))),
      },
      accuracy: finalMetrics.accuracy,
      errors: finalMetrics.errors,
      correctedErrors: session.characters.filter((c) => c.state === 'corrected').length,
      mode: session.mode,
      problematicChars,
    });

    // If this was a curriculum lesson, mark it as complete and find next lesson
    if (currentLessonId) {
      markLessonComplete(currentLessonId, currentWpm, finalMetrics.accuracy);

      // Get the updated progress to find next lesson
      // We need to simulate what the progress will look like after marking complete
      if (progress) {
        const updatedProgress = {
          ...progress,
          lessons: {
            ...progress.lessons,
            [currentLessonId]: {
              ...progress.lessons[currentLessonId],
              completed: true,
            },
          },
        };
        const next = getNextLesson(updatedProgress);
        setNextLesson(next);
      }
    }
  }, [sessionStartTime, previousBestWpm, addSession, currentLessonId, markLessonComplete, progress]);

  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setCompletedSession(null);
    setSessionStartTime(null);
    setIsNewPersonalBest(false);
    setNextLesson(null);
    setSessionMetrics(null);
    finalMetricsRef.current = null; // Clear frozen metrics
    // Increment key to force PracticeArea re-mount for fresh session
    setPracticeKey((k) => k + 1);
    // Re-focus main area for keyboard navigation
    mainRef.current?.focus();
  }, []);

  // Handle starting the next lesson
  const handleNextLesson = useCallback(() => {
    if (nextLesson && nextLesson.exercises.length > 0) {
      setShowResults(false);
      setCompletedSession(null);
      setSessionStartTime(null);
      setIsNewPersonalBest(false);
      setSessionMetrics(null);
      finalMetricsRef.current = null; // Clear frozen metrics

      // Set up the next lesson
      const firstExercise = nextLesson.exercises[0];
      setCurrentText(firstExercise.text);
      setCurrentLessonId(nextLesson.id);
      setCurrentLessonName(nextLesson.name);
      setNextLesson(null);
      // Increment key to force PracticeArea re-mount for fresh session
      setPracticeKey((k) => k + 1);

      // Update URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', `/?lessonId=${encodeURIComponent(nextLesson.id)}`);
      }

      // Re-focus main area
      mainRef.current?.focus();
    }
  }, [nextLesson]);


  // Handle text selection from TextSelector
  const handleSelectText = useCallback((text: string) => {
    setCurrentText(text);
    setShowTextSelector(false);
    setSessionMetrics(null);
    setSessionStartTime(null);
    // Increment key to ensure fresh PracticeArea
    setPracticeKey((k) => k + 1);
  }, []);

  // Handle saving custom text
  const handleSaveText = useCallback((title: string, content: string) => {
    addText(title, content);
  }, [addText]);

  // Handle deleting saved text
  const handleDeleteSavedText = useCallback((id: string) => {
    deleteText(id);
  }, [deleteText]);

  // Handle changing text (show selector again)
  const handleChangeText = useCallback(() => {
    setShowTextSelector(true);
    setCurrentText(null);
    setCurrentLessonId(null);
    setCurrentLessonName(null);
    setNextLesson(null);
    setSessionMetrics(null);
    setCompletedSession(null);
    setSessionStartTime(null);
    // Clear URL params when changing text
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - fixed positioning */}
      <Header />

      {/* Main Content - pt-20 accounts for fixed header height */}
      <main
        ref={mainRef}
        className="
          flex-1
          flex flex-col
          items-center
          px-4 sm:px-6 lg:px-8
          pt-20 pb-6 sm:pt-24 sm:pb-8 lg:pt-24 lg:pb-12
          gap-6 lg:gap-8
        "
        tabIndex={-1}
      >
        {/* Text Selector - shown when no text is selected */}
        {showTextSelector ? (
          <div className="w-full max-w-4xl animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Choose Your Practice Text
            </h2>
            <TextSelector
              onSelectText={handleSelectText}
              savedTexts={savedTexts.map(t => ({
                id: t.id,
                title: t.title,
                text: t.content,
                savedAt: new Date(t.createdAt),
                charCount: t.content.length,
              }))}
              onDeleteSaved={handleDeleteSavedText}
              onSaveText={handleSaveText}
            />
          </div>
        ) : currentText ? (
          <>
            {/* Metrics Panel - Top - ONLY show during active session, NOT when results are showing */}
            {sessionMetrics && !showResults && (
              <MetricsPanel
                grossWPM={sessionMetrics.estimatedWPM}
                netWPM={sessionMetrics.estimatedWPM}
                accuracy={sessionMetrics.accuracy}
                errorCount={sessionMetrics.errors}
                startTime={sessionMetrics.elapsedTime > 0 ? Date.now() - sessionMetrics.elapsedTime : null}
                layout="horizontal"
                className="w-full max-w-4xl animate-fade-in"
              />
            )}

            {/* Lesson Name and Change Text Button */}
            <div className="w-full max-w-4xl flex justify-between items-center">
              {currentLessonName && (
                <span className="text-sm text-foreground/60">
                  Leccion: <span className="font-medium text-foreground">{currentLessonName}</span>
                </span>
              )}
              <button
                onClick={handleChangeText}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors ml-auto"
              >
                Change Text
              </button>
            </div>

            {/* Practice Area */}
            <div className="w-full max-w-4xl animate-slide-up">
              <PracticeArea
                key={practiceKey}
                initialText={currentText}
                onComplete={handleSessionComplete}
                onMetricsUpdate={handleMetricsUpdate}
              />
            </div>

            {/* Virtual Keyboard */}
            <div className="w-full max-w-4xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              <VirtualKeyboard
                pressedKeys={pressedKeys}
                modifierState={modifierState}
                showFingerGuide={true}
                showLegend={true}
                size="standard"
              />
            </div>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <Footer />

      {/* Results Modal - Uses finalMetricsRef to ensure frozen metrics display */}
      <Modal
        isOpen={showResults}
        onClose={handleCloseResults}
        title={isNewPersonalBest ? "New Personal Best!" : "Session Complete!"}
        size="lg"
      >
        {completedSession && finalMetricsRef.current && (
          <div className="space-y-6">
            {/* Personal Best Banner */}
            {isNewPersonalBest && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  You beat your previous best of {previousBestWpm} WPM!
                </span>
              </div>
            )}

            {/* Hero Stats - Read from frozen ref, NOT state */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-surface-1 rounded-lg">
                <div className="text-3xl font-bold text-accent-primary tabular-nums">
                  {finalMetricsRef.current.estimatedWPM}
                </div>
                <div className="text-sm text-foreground/50 uppercase tracking-wider">
                  WPM
                </div>
              </div>
              <div className="p-4 bg-surface-1 rounded-lg">
                <div className={`text-3xl font-bold tabular-nums ${
                  finalMetricsRef.current.accuracy >= 95
                    ? 'text-accent-success'
                    : finalMetricsRef.current.accuracy >= 85
                    ? 'text-accent-warning'
                    : 'text-accent-error'
                }`}>
                  {finalMetricsRef.current.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-foreground/50 uppercase tracking-wider">
                  Accuracy
                </div>
              </div>
              <div className="p-4 bg-surface-1 rounded-lg">
                <div className="text-3xl font-bold text-foreground tabular-nums">
                  {Math.floor(finalMetricsRef.current.elapsedTime / 1000)}s
                </div>
                <div className="text-sm text-foreground/50 uppercase tracking-wider">
                  Time
                </div>
              </div>
            </div>

            {/* Comparison to Personal Stats */}
            {statistics.totalSessions > 0 && (
              <div className="p-4 bg-surface-1 rounded-lg space-y-2">
                <h4 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                  Compared to Your Stats
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">vs. Average WPM</span>
                    <span className={`font-medium ${
                      finalMetricsRef.current.estimatedWPM >= statistics.averageWpm
                        ? 'text-accent-success'
                        : 'text-accent-error'
                    }`}>
                      {finalMetricsRef.current.estimatedWPM >= statistics.averageWpm ? '+' : ''}
                      {(finalMetricsRef.current.estimatedWPM - statistics.averageWpm).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">vs. Best WPM</span>
                    <span className={`font-medium ${
                      finalMetricsRef.current.estimatedWPM >= statistics.bestWpm
                        ? 'text-accent-success'
                        : 'text-foreground/70'
                    }`}>
                      {finalMetricsRef.current.estimatedWPM >= statistics.bestWpm ? '+' : ''}
                      {(finalMetricsRef.current.estimatedWPM - statistics.bestWpm).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">vs. Avg Accuracy</span>
                    <span className={`font-medium ${
                      finalMetricsRef.current.accuracy >= statistics.averageAccuracy
                        ? 'text-accent-success'
                        : 'text-accent-error'
                    }`}>
                      {finalMetricsRef.current.accuracy >= statistics.averageAccuracy ? '+' : ''}
                      {(finalMetricsRef.current.accuracy - statistics.averageAccuracy).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Total Sessions</span>
                    <span className="font-medium text-foreground/70">
                      {statistics.totalSessions + 1}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border-muted">
                <span className="text-foreground/60">Characters</span>
                <span className="font-medium">{completedSession.characters.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-muted">
                <span className="text-foreground/60">Correct</span>
                <span className="font-medium text-accent-success">{finalMetricsRef.current.correctCharacters}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-muted">
                <span className="text-foreground/60">Errors</span>
                <span className="font-medium text-accent-error">{finalMetricsRef.current.errors}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-muted">
                <span className="text-foreground/60">Total Typed</span>
                <span className="font-medium">{finalMetricsRef.current.charactersTyped}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              {/* Next Lesson Button - Primary action when available */}
              {nextLesson && (
                <button
                  onClick={handleNextLesson}
                  className="
                    w-full px-4 py-3
                    bg-accent-primary hover:bg-accent-primary/90
                    text-white font-medium
                    rounded-lg
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                  "
                >
                  Next Lesson: {nextLesson.name}
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCloseResults}
                  className={`
                    flex-1 px-4 py-3
                    ${nextLesson ? 'bg-surface-2 hover:bg-surface-2/80 text-foreground' : 'bg-accent-primary hover:bg-accent-primary/90 text-white'}
                    font-medium
                    rounded-lg
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                  `}
                >
                  Practice Again
                </button>
                <button
                  onClick={() => {
                    handleCloseResults();
                    handleChangeText();
                  }}
                  className="
                    px-4 py-3
                    bg-surface-2 hover:bg-surface-2/80
                    text-foreground font-medium
                    rounded-lg
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                  "
                >
                  New Text
                </button>
              </div>

              {/* Link to curriculum */}
              {currentLessonId && (
                <a
                  href="/curriculum"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseResults();
                    window.location.href = '/curriculum';
                  }}
                  className="
                    text-center text-sm text-foreground/60 hover:text-foreground
                    transition-colors cursor-pointer
                  "
                >
                  View All Lessons
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
        </main>
        <Footer />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
