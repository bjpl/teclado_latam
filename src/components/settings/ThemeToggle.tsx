'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Theme } from '@/types/settings';
import { THEME_INFO } from '@/types/settings';

export interface ThemeToggleProps {
  /** Currently selected theme */
  value: Theme;
  /** Callback when theme selection changes */
  onChange: (theme: Theme) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
}

const themeOptions: Theme[] = ['light', 'dark', 'system'];

/**
 * Theme selector component with three options: Light, Dark, System.
 * Displays visual preview icons for each theme option.
 *
 * @example
 * <ThemeToggle
 *   value={settings.theme}
 *   onChange={(theme) => updateSettings({ theme })}
 * />
 */
export const ThemeToggle = forwardRef<HTMLDivElement, ThemeToggleProps>(
  ({ value, onChange, className, disabled = false }, ref) => {
    const groupId = useId();

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-3', className)}
        role="radiogroup"
        aria-label="Theme selection"
      >
        <div className="flex flex-wrap gap-3">
          {themeOptions.map((theme) => {
            const isSelected = value === theme;
            const info = THEME_INFO[theme];
            const optionId = `${groupId}-${theme}`;

            return (
              <button
                key={theme}
                id={optionId}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onChange(theme)}
                className={cn(
                  // Base styles
                  'flex flex-col items-center gap-2 p-4',
                  'rounded-xl border-2 transition-all duration-200',
                  'min-w-[100px]',
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
                <ThemeIcon theme={theme} isSelected={isSelected} />
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-foreground' : 'text-foreground/70'
                    )}
                  >
                    {info.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {/* Description for selected theme */}
        <p className="text-sm text-foreground/60">
          {THEME_INFO[value].description}
        </p>
      </div>
    );
  }
);

ThemeToggle.displayName = 'ThemeToggle';

/**
 * Visual icon for each theme option
 */
function ThemeIcon({
  theme,
  isSelected,
}: {
  theme: Theme;
  isSelected: boolean;
}) {
  const iconClass = cn(
    'w-10 h-10 transition-colors',
    isSelected ? 'text-foreground' : 'text-foreground/50'
  );

  switch (theme) {
    case 'light':
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
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case 'dark':
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'system':
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
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

export default ThemeToggle;
