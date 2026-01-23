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
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 7 (Integration)
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PracticeArea, type SessionMetrics } from '@/components/practice';
import { VirtualKeyboard } from '@/components/keyboard';
import { MetricsPanel } from '@/components/metrics';
import { Modal } from '@/components/ui';
import type { SessionState, ModifierState } from '@/lib/typing-engine/types';

// =============================================================================
// Sample Texts for Practice
// =============================================================================

const SAMPLE_TEXTS = {
  spanish: `El veloz murcielago hindu comia feliz cardillo y kiwi. La ciguena tocaba el saxofon detras del palenque de paja.`,
  pangram: `Jovencillo emponzonado de whisky: que figura exhibe!`,
  programming: `const mensaje = "Hola, mundo!"; console.log(mensaje);`,
  literature: `En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivia un hidalgo de los de lanza en astillero.`,
};

// =============================================================================
// Component
// =============================================================================

export default function Home() {
  // State
  const [currentText] = useState(SAMPLE_TEXTS.spanish);
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

  // Refs
  const mainRef = useRef<HTMLElement>(null);

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
  }, []);

  const handleSessionComplete = useCallback((session: SessionState) => {
    setCompletedSession(session);
    setShowResults(true);
  }, []);

  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setCompletedSession(null);
    // Re-focus main area for keyboard navigation
    mainRef.current?.focus();
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
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
            showLegend={false}
            size="standard"
          />
        </div>
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
        title="Session Complete!"
        size="lg"
      >
        {completedSession && sessionMetrics && (
          <div className="space-y-6">
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
                onClick={handleCloseResults}
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
