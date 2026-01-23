'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Toggle } from '@/components/ui';

export interface SoundSettingsProps {
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** Callback when sound setting changes */
  onSoundEnabledChange: (enabled: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * Sound settings component for audio preferences.
 * Currently includes sound effects toggle (for future implementation).
 *
 * @example
 * <SoundSettings
 *   soundEnabled={settings.soundEnabled}
 *   onSoundEnabledChange={(enabled) => updateSettings({ soundEnabled: enabled })}
 * />
 */
export const SoundSettings = forwardRef<HTMLDivElement, SoundSettingsProps>(
  (
    {
      soundEnabled,
      onSoundEnabledChange,
      className,
      disabled = false,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-4', className)}>
        <Toggle
          label="Enable Sound Effects"
          description="Play typing sounds and feedback (coming soon)"
          checked={soundEnabled}
          onCheckedChange={onSoundEnabledChange}
          disabled={disabled}
          labelPosition="left"
        />

        {/* Placeholder for future sound settings */}
        {soundEnabled && (
          <div className="p-4 rounded-xl border border-foreground/10 bg-foreground/5">
            <p className="text-sm text-foreground/60">
              Sound effects will be available in a future update. This setting
              will be saved for when the feature is released.
            </p>
          </div>
        )}
      </div>
    );
  }
);

SoundSettings.displayName = 'SoundSettings';

export default SoundSettings;
