'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';
import { Toggle } from '@/components/ui';
import type { FontSize, KeyboardSize } from '@/types/settings';

export interface DisplaySettingsProps {
  /** Current font size setting */
  fontSize: FontSize;
  /** Callback when font size changes */
  onFontSizeChange: (size: FontSize) => void;
  /** Whether to show metrics during practice */
  showMetrics: boolean;
  /** Callback when showMetrics changes */
  onShowMetricsChange: (show: boolean) => void;
  /** Whether to show virtual keyboard */
  showKeyboard: boolean;
  /** Callback when showKeyboard changes */
  onShowKeyboardChange: (show: boolean) => void;
  /** Whether to show finger placement guide */
  showFingerGuide: boolean;
  /** Callback when showFingerGuide changes */
  onShowFingerGuideChange: (show: boolean) => void;
  /** Keyboard size setting */
  keyboardSize?: KeyboardSize;
  /** Callback when keyboard size changes */
  onKeyboardSizeChange?: (size: KeyboardSize) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether controls are disabled */
  disabled?: boolean;
}

const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const keyboardSizeOptions: { value: KeyboardSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
];

/**
 * Display settings component for controlling visual preferences.
 *
 * Includes:
 * - Font size selection (small/medium/large)
 * - Toggle for showing metrics during practice
 * - Toggle for showing virtual keyboard
 * - Toggle for showing finger placement guide
 * - Keyboard size selection (when keyboard is shown)
 *
 * @example
 * <DisplaySettings
 *   fontSize={settings.fontSize}
 *   onFontSizeChange={(size) => updateSettings({ fontSize: size })}
 *   showMetrics={settings.showMetrics}
 *   onShowMetricsChange={(show) => updateSettings({ showMetrics: show })}
 *   showKeyboard={settings.showKeyboard}
 *   onShowKeyboardChange={(show) => updateSettings({ showKeyboard: show })}
 *   showFingerGuide={settings.showFingerGuide}
 *   onShowFingerGuideChange={(show) => updateSettings({ showFingerGuide: show })}
 * />
 */
export const DisplaySettings = forwardRef<HTMLDivElement, DisplaySettingsProps>(
  (
    {
      fontSize,
      onFontSizeChange,
      showMetrics,
      onShowMetricsChange,
      showKeyboard,
      onShowKeyboardChange,
      showFingerGuide,
      onShowFingerGuideChange,
      keyboardSize = 'medium',
      onKeyboardSizeChange,
      className,
      disabled = false,
    },
    ref
  ) => {
    const fontSizeGroupId = useId();
    const keyboardSizeGroupId = useId();

    return (
      <div ref={ref} className={cn('flex flex-col gap-6', className)}>
        {/* Font Size */}
        <div className="flex flex-col gap-3">
          <label className="font-medium text-foreground">
            Font Size
          </label>
          <div
            role="radiogroup"
            aria-label="Font size selection"
            className="flex gap-2"
          >
            {fontSizeOptions.map((option) => {
              const isSelected = fontSize === option.value;
              const optionId = `${fontSizeGroupId}-${option.value}`;

              return (
                <button
                  key={option.value}
                  id={optionId}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={disabled}
                  onClick={() => onFontSizeChange(option.value)}
                  className={cn(
                    // Base styles
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                    // Focus styles
                    'outline-none',
                    'focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    // Selected state
                    isSelected
                      ? 'bg-foreground text-background'
                      : 'bg-foreground/5 text-foreground hover:bg-foreground/10',
                    // Disabled state
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {/* Font size preview */}
          <div className="p-3 rounded-lg bg-foreground/5">
            <p
              className={cn(
                'text-foreground/70 font-mono',
                fontSize === 'small' && 'text-lg',
                fontSize === 'medium' && 'text-xl',
                fontSize === 'large' && 'text-2xl'
              )}
            >
              La nina espanola
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-4">
          <Toggle
            label="Show Real-time Metrics"
            description="Display WPM, accuracy, and time during practice"
            checked={showMetrics}
            onCheckedChange={onShowMetricsChange}
            disabled={disabled}
            labelPosition="left"
          />

          <Toggle
            label="Show Virtual Keyboard"
            description="Display on-screen keyboard with highlighted keys"
            checked={showKeyboard}
            onCheckedChange={onShowKeyboardChange}
            disabled={disabled}
            labelPosition="left"
          />

          <Toggle
            label="Show Finger Guide"
            description="Color-code keys by finger assignment"
            checked={showFingerGuide}
            onCheckedChange={onShowFingerGuideChange}
            disabled={disabled || !showKeyboard}
            labelPosition="left"
          />
        </div>

        {/* Keyboard Size (only shown when keyboard is enabled) */}
        {showKeyboard && onKeyboardSizeChange && (
          <div className="flex flex-col gap-3">
            <label className="font-medium text-foreground">
              Keyboard Size
            </label>
            <div
              role="radiogroup"
              aria-label="Keyboard size selection"
              className="flex gap-2"
            >
              {keyboardSizeOptions.map((option) => {
                const isSelected = keyboardSize === option.value;
                const optionId = `${keyboardSizeGroupId}-${option.value}`;

                return (
                  <button
                    key={option.value}
                    id={optionId}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={disabled}
                    onClick={() => onKeyboardSizeChange(option.value)}
                    className={cn(
                      // Base styles
                      'w-12 h-10 rounded-lg font-medium transition-all duration-200',
                      // Focus styles
                      'outline-none',
                      'focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      // Selected state
                      isSelected
                        ? 'bg-foreground text-background'
                        : 'bg-foreground/5 text-foreground hover:bg-foreground/10',
                      // Disabled state
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

DisplaySettings.displayName = 'DisplaySettings';

export default DisplaySettings;
