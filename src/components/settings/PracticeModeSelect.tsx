'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';
import type { PracticeMode } from '@/types/settings';
import { PRACTICE_MODE_INFO } from '@/types/settings';

export interface PracticeModeSelectProps {
  /** Currently selected practice mode */
  value: PracticeMode;
  /** Callback when practice mode changes */
  onChange: (mode: PracticeMode) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
}

const modeOptions: PracticeMode[] = ['strict', 'lenient', 'no-backspace'];

/**
 * Practice mode selector with descriptions for each option.
 *
 * Modes:
 * - Strict: Must correct errors before continuing
 * - Lenient: Can continue past errors without correction
 * - No Backspace: Errors counted, cannot be corrected
 *
 * @example
 * <PracticeModeSelect
 *   value={settings.practiceMode}
 *   onChange={(mode) => updateSettings({ practiceMode: mode })}
 * />
 */
export const PracticeModeSelect = forwardRef<HTMLDivElement, PracticeModeSelectProps>(
  ({ value, onChange, className, disabled = false }, ref) => {
    const groupId = useId();

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2', className)}
        role="radiogroup"
        aria-label="Practice mode selection"
      >
        {modeOptions.map((mode) => {
          const isSelected = value === mode;
          const info = PRACTICE_MODE_INFO[mode];
          const optionId = `${groupId}-${mode}`;

          return (
            <button
              key={mode}
              id={optionId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(mode)}
              className={cn(
                // Base styles
                'flex items-start gap-3 p-4 text-left',
                'rounded-xl border-2 transition-all duration-200',
                // Focus styles
                'outline-none',
                'focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                // Selected state
                isSelected
                  ? 'border-foreground bg-foreground/5'
                  : 'border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5',
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center',
                  'rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-foreground bg-foreground'
                    : 'border-foreground/40'
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-background" />
                )}
              </div>

              {/* Mode info */}
              <div className="flex flex-col gap-1">
                <span
                  className={cn(
                    'font-medium',
                    isSelected ? 'text-foreground' : 'text-foreground/80'
                  )}
                >
                  {info.title}
                </span>
                <span className="text-sm text-foreground/60">
                  {info.description}
                </span>
              </div>

              {/* Mode icon */}
              <ModeIcon mode={mode} isSelected={isSelected} />
            </button>
          );
        })}
      </div>
    );
  }
);

PracticeModeSelect.displayName = 'PracticeModeSelect';

/**
 * Visual icon for each practice mode
 */
function ModeIcon({
  mode,
  isSelected,
}: {
  mode: PracticeMode;
  isSelected: boolean;
}) {
  const iconClass = cn(
    'ml-auto w-6 h-6 shrink-0 transition-colors',
    isSelected ? 'text-foreground' : 'text-foreground/40'
  );

  switch (mode) {
    case 'strict':
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'lenient':
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      );
    case 'no-backspace':
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      );
  }
}

export default PracticeModeSelect;
