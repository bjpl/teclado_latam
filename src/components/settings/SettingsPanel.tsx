'use client';

import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';
import { PracticeModeSelect } from './PracticeModeSelect';
import { DisplaySettings } from './DisplaySettings';
import { SoundSettings } from './SoundSettings';
import type { UserSettings } from '@/types/settings';

export interface SettingsPanelProps {
  /** Current settings values */
  settings: UserSettings;
  /** Callback to update settings */
  onSettingsChange: (updates: Partial<UserSettings>) => void;
  /** Callback to reset settings to defaults */
  onReset: () => void;
  /** Whether any settings differ from defaults */
  hasCustomSettings?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main settings panel container that groups all settings sections.
 * Provides auto-save functionality and a reset option.
 *
 * @example
 * <SettingsPanel
 *   settings={settings}
 *   onSettingsChange={updateSettings}
 *   onReset={resetSettings}
 *   hasCustomSettings={hasCustomSettings}
 * />
 */
export const SettingsPanel = forwardRef<HTMLDivElement, SettingsPanelProps>(
  (
    {
      settings,
      onSettingsChange,
      onReset,
      hasCustomSettings = false,
      className,
    },
    ref
  ) => {
    // Memoized handlers to avoid prop drilling issues
    const handleThemeChange = useCallback(
      (theme: UserSettings['theme']) => {
        onSettingsChange({ theme });
      },
      [onSettingsChange]
    );

    const handlePracticeModeChange = useCallback(
      (practiceMode: UserSettings['practiceMode']) => {
        onSettingsChange({ practiceMode });
      },
      [onSettingsChange]
    );

    const handleFontSizeChange = useCallback(
      (fontSize: UserSettings['fontSize']) => {
        onSettingsChange({ fontSize });
      },
      [onSettingsChange]
    );

    const handleShowMetricsChange = useCallback(
      (showMetrics: boolean) => {
        onSettingsChange({ showMetrics });
      },
      [onSettingsChange]
    );

    const handleShowKeyboardChange = useCallback(
      (showKeyboard: boolean) => {
        onSettingsChange({ showKeyboard });
      },
      [onSettingsChange]
    );

    const handleShowFingerGuideChange = useCallback(
      (showFingerGuide: boolean) => {
        onSettingsChange({ showFingerGuide });
      },
      [onSettingsChange]
    );

    const handleKeyboardSizeChange = useCallback(
      (keyboardSize: UserSettings['keyboardSize']) => {
        onSettingsChange({ keyboardSize });
      },
      [onSettingsChange]
    );

    const handleSoundEnabledChange = useCallback(
      (soundEnabled: boolean) => {
        onSettingsChange({ soundEnabled });
      },
      [onSettingsChange]
    );

    return (
      <div ref={ref} className={cn('flex flex-col gap-6', className)}>
        {/* Appearance Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle value={settings.theme} onChange={handleThemeChange} />
          </CardContent>
        </Card>

        {/* Practice Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Practice Mode</CardTitle>
            <CardDescription>
              Choose how errors are handled during typing practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PracticeModeSelect
              value={settings.practiceMode}
              onChange={handlePracticeModeChange}
            />
          </CardContent>
        </Card>

        {/* Display Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Display</CardTitle>
            <CardDescription>
              Configure text size and visual aids
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DisplaySettings
              fontSize={settings.fontSize}
              onFontSizeChange={handleFontSizeChange}
              showMetrics={settings.showMetrics}
              onShowMetricsChange={handleShowMetricsChange}
              showKeyboard={settings.showKeyboard}
              onShowKeyboardChange={handleShowKeyboardChange}
              showFingerGuide={settings.showFingerGuide}
              onShowFingerGuideChange={handleShowFingerGuideChange}
              keyboardSize={settings.keyboardSize}
              onKeyboardSizeChange={handleKeyboardSizeChange}
            />
          </CardContent>
        </Card>

        {/* Sound Section */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Sound</CardTitle>
            <CardDescription>
              Audio feedback settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SoundSettings
              soundEnabled={settings.soundEnabled}
              onSoundEnabledChange={handleSoundEnabledChange}
            />
          </CardContent>
        </Card>

        {/* Reset Button */}
        {hasCustomSettings && (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onReset}>
              Reset to Defaults
            </Button>
          </div>
        )}

        {/* Auto-save indicator */}
        <p className="text-center text-sm text-foreground/50">
          Settings are saved automatically
        </p>
      </div>
    );
  }
);

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;
