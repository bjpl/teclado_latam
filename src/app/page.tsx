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

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PracticeArea, TextSelector, type SessionMetrics } from '@/components/practice';
import { VirtualKeyboard } from '@/components/keyboard';
import { MetricsPanel } from '@/components/metrics';
import { Modal } from '@/components/ui';
import { useSessionHistory, useCustomTexts } from '@/hooks';
import type { SessionState, ModifierState } from '@/lib/typing-engine/types';

// =============================================================================
// Component
// =============================================================================

export default function Home() {
  // Hooks
  const { addSession, statistics, bestSession } = useSessionHistory();
  const { texts: savedTexts, addText, deleteText, updateLastUsed } = useCustomTexts();

  // State
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showTextSelector, setShowTextSelector] = useState(true);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [completedSession, setCompletedSession] = useState<SessionState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
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

  // Refs
  const mainRef = useRef<HTMLElement>(null);

  // Track personal best WPM for comparison
  const previousBestWpm = useMemo(() => bestSession?.wpm.netWPM ?? 0, [bestSession]);

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
    setSessionMetrics(metrics);
    // Track when session actually starts (first keystroke)
    if (metrics.elapsedTime > 0 && !sessionStartTime) {
      setSessionStartTime(Date.now() - metrics.elapsedTime);
    }
  }, [sessionStartTime]);

  const handleSessionComplete = useCallback((session: SessionState) => {
    setCompletedSession(session);
    setShowResults(true);

    // Save session to history
    if (sessionMetrics) {
      const now = Date.now();
      const startTime = sessionStartTime ?? (now - sessionMetrics.elapsedTime);
      const currentWpm = sessionMetrics.estimatedWPM;

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
        duration: sessionMetrics.elapsedTime,
        text: session.text,
        textLength: session.text.length,
        wpm: {
          grossWPM: sessionMetrics.estimatedWPM,
          netWPM: sessionMetrics.estimatedWPM,
          cpm: Math.round((sessionMetrics.correctCharacters / (sessionMetrics.elapsedTime / 60000))),
        },
        accuracy: sessionMetrics.accuracy,
        errors: sessionMetrics.errors,
        correctedErrors: session.characters.filter((c) => c.state === 'corrected').length,
        mode: session.mode,
        problematicChars,
      });
    }
  }, [sessionMetrics, sessionStartTime, previousBestWpm, addSession]);

  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setCompletedSession(null);
    setSessionStartTime(null);
    setIsNewPersonalBest(false);
    // Re-focus main area for keyboard navigation
    mainRef.current?.focus();
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // Handle text selection from TextSelector
  const handleSelectText = useCallback((text: string) => {
    setCurrentText(text);
    setShowTextSelector(false);
    setSessionMetrics(null);
    setSessionStartTime(null);
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
    setSessionMetrics(null);
    setCompletedSession(null);
    setSessionStartTime(null);
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header onSettingsClick={handleSettingsClick} />

      {/* Main Content */}
      <main
        ref={mainRef}
        className="
          flex-1
          flex flex-col
          items-center
          px-4 sm:px-6 lg:px-8
          py-6 sm:py-8 lg:py-12
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
            {/* Metrics Panel - Top */}
            {sessionMetrics && (
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

            {/* Change Text Button */}
            <div className="w-full max-w-4xl flex justify-end">
              <button
                onClick={handleChangeText}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Change Text
              </button>
            </div>

            {/* Practice Area */}
            <div className="w-full max-w-4xl animate-slide-up">
              <PracticeArea
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

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={handleCloseSettings}
        title="Settings"
        description="Configure your typing practice"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-foreground/60">
            Settings panel coming soon. You will be able to configure:
          </p>
          <ul className="list-disc list-inside text-foreground/60 space-y-1">
            <li>Practice text sources</li>
            <li>Keyboard layout options</li>
            <li>Display preferences</li>
            <li>Sound effects</li>
            <li>Statistics tracking</li>
          </ul>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={showResults}
        onClose={handleCloseResults}
        title={isNewPersonalBest ? "New Personal Best!" : "Session Complete!"}
        size="lg"
      >
        {completedSession && sessionMetrics && (
          <div className="space-y-6">
            {/* Personal Best Banner */}
            {isNewPersonalBest && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  You beat your previous best of {previousBestWpm} WPM!
                </span>
              </div>
            )}

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-surface-1 rounded-lg">
                <div className="text-3xl font-bold text-accent-primary tabular-nums">
                  {sessionMetrics.estimatedWPM}
                </div>
                <div className="text-sm text-foreground/50 uppercase tracking-wider">
                  WPM
                </div>
              </div>
              <div className="p-4 bg-surface-1 rounded-lg">
                <div className={`text-3xl font-bold tabular-nums ${
                  sessionMetrics.accuracy >= 95
                    ? 'text-accent-success'
                    : sessionMetrics.accuracy >= 85
                    ? 'text-accent-warning'
                    : 'text-accent-error'
                }`}>
                  {sessionMetrics.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-foreground/50 uppercase tracking-wider">
                  Accuracy
                </div>
              </div>
              <div className="p-4 bg-surface-1 rounded-lg">
                <div className="text-3xl font-bold text-foreground tabular-nums">
                  {Math.floor(sessionMetrics.elapsedTime / 1000)}s
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
                      sessionMetrics.estimatedWPM >= statistics.averageWpm
                        ? 'text-accent-success'
                        : 'text-accent-error'
                    }`}>
                      {sessionMetrics.estimatedWPM >= statistics.averageWpm ? '+' : ''}
                      {(sessionMetrics.estimatedWPM - statistics.averageWpm).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">vs. Best WPM</span>
                    <span className={`font-medium ${
                      sessionMetrics.estimatedWPM >= statistics.bestWpm
                        ? 'text-accent-success'
                        : 'text-foreground/70'
                    }`}>
                      {sessionMetrics.estimatedWPM >= statistics.bestWpm ? '+' : ''}
                      {(sessionMetrics.estimatedWPM - statistics.bestWpm).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">vs. Avg Accuracy</span>
                    <span className={`font-medium ${
                      sessionMetrics.accuracy >= statistics.averageAccuracy
                        ? 'text-accent-success'
                        : 'text-accent-error'
                    }`}>
                      {sessionMetrics.accuracy >= statistics.averageAccuracy ? '+' : ''}
                      {(sessionMetrics.accuracy - statistics.averageAccuracy).toFixed(1)}%
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
                <span className="font-medium text-accent-success">{sessionMetrics.correctCharacters}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-muted">
                <span className="text-foreground/60">Errors</span>
                <span className="font-medium text-accent-error">{sessionMetrics.errors}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-muted">
                <span className="text-foreground/60">Total Typed</span>
                <span className="font-medium">{sessionMetrics.charactersTyped}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCloseResults}
                className="
                  flex-1 px-4 py-3
                  bg-accent-primary hover:bg-accent-primary/90
                  text-white font-medium
                  rounded-lg
                  transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary
                "
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
          </div>
        )}
      </Modal>
    </div>
  );
}
