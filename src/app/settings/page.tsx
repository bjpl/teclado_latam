'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSettings, useTheme, useSessionHistory, useCurriculumProgress } from '@/hooks';
import { SettingsPanel } from '@/components/settings';
import { Button, Modal } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

/**
 * Settings page for Teclado LATAM.
 *
 * Allows users to configure:
 * - Appearance (theme, font size)
 * - Practice mode behavior
 * - Display options (keyboard visibility, metrics)
 * - Sound settings (future)
 *
 * All settings are automatically persisted to localStorage.
 */
export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, hasCustomSettings } =
    useSettings();
  const { clearHistory } = useSessionHistory();
  const { resetProgress } = useCurriculumProgress();
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Apply theme based on settings
  useTheme(settings.theme);

  // Reset ALL application data
  const handleResetAllData = () => {
    setIsResetting(true);

    // Clear session history (includes the session counter)
    clearHistory();

    // Clear curriculum progress
    resetProgress();

    // Clear all localStorage keys related to this app
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'teclado-session-history',
        'teclado-total-sessions-count',
        'teclado-curriculum-progress',
        'teclado-custom-texts',
        'teclado-latam-settings',
      ];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`[Reset] Removed: ${key}`);
      });
    }

    setIsResetting(false);
    setShowResetModal(false);

    // Reload to apply changes
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" passHref legacyBehavior>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<BackIcon />}
                aria-label="Back to practice"
              >
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-foreground/60">
            Customize your typing practice experience
          </p>
        </header>

        {/* Settings Panel */}
        <main className="relative z-0">
          <SettingsPanel
            settings={settings}
            onSettingsChange={updateSettings}
            onReset={resetSettings}
            hasCustomSettings={hasCustomSettings}
          />

          {/* Danger Zone - Reset All Data */}
          <div className="mt-8 p-6 border border-red-500/30 rounded-lg bg-red-500/5">
            <h3 className="text-lg font-semibold text-red-500 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-foreground/60 mb-4">
              Reset all application data including session history, curriculum progress,
              custom texts, and settings. This action cannot be undone.
            </p>
            <Button
              variant="ghost"
              onClick={() => setShowResetModal(true)}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30"
            >
              Reset All Data
            </Button>
          </div>
        </main>

        {/* Reset Confirmation Modal */}
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Reset All Data?"
        >
          <div className="space-y-4">
            <p className="text-foreground/70">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-foreground/60 space-y-1 ml-2">
              <li>All session history and statistics</li>
              <li>Session counter (will restart from #1)</li>
              <li>Curriculum progress</li>
              <li>Custom saved texts</li>
              <li>All settings</li>
            </ul>
            <p className="text-red-500 font-medium">
              This action cannot be undone!
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowResetModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetAllData}
                disabled={isResetting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {isResetting ? 'Resetting...' : 'Reset Everything'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-foreground/10">
          <p className="text-center text-sm text-foreground/50">
            Teclado LATAM - Latin American Keyboard Typing Practice
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Back arrow icon
 */
function BackIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
