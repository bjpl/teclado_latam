'use client';

import Link from 'next/link';
import { useSettings, useTheme } from '@/hooks';
import { SettingsPanel } from '@/components/settings';
import { Button } from '@/components/ui';
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

  // Apply theme based on settings
  useTheme(settings.theme);

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
        <main>
          <SettingsPanel
            settings={settings}
            onSettingsChange={updateSettings}
            onReset={resetSettings}
            hasCustomSettings={hasCustomSettings}
          />
        </main>

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
