'use client';

import { forwardRef, useId, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Whether the toggle is on */
  checked?: boolean;
  /** Callback when toggle state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Size of the toggle */
  size?: ToggleSize;
  /** Position of label relative to toggle */
  labelPosition?: 'left' | 'right';
}

const sizeStyles: Record<
  ToggleSize,
  { track: string; thumb: string; translate: string }
> = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'h-7 w-14',
    thumb: 'h-6 w-6',
    translate: 'translate-x-7',
  },
};

/**
 * Toggle switch component for boolean settings.
 * Accessible with proper ARIA labels and keyboard support.
 *
 * @example
 * <Toggle
 *   label="Sound Effects"
 *   description="Play sounds on keypress"
 *   checked={soundEnabled}
 *   onCheckedChange={setSoundEnabled}
 * />
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      label,
      description,
      size = 'md',
      labelPosition = 'right',
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const toggleId = providedId ?? generatedId;
    const descriptionId = `${toggleId}-description`;

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    const styles = sizeStyles[size];

    const toggleButton = (
      <button
        ref={ref}
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base track styles
          'relative inline-flex shrink-0 cursor-pointer',
          'rounded-full',
          'transition-colors duration-200 ease-in-out',
          // Focus styles
          'outline-none',
          'focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          // Disabled styles
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Track size
          styles.track,
          // Track color based on state
          checked ? 'bg-foreground' : 'bg-foreground/20',
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            // Thumb styles
            'pointer-events-none inline-block',
            'rounded-full bg-background',
            'shadow-sm',
            'transform transition-transform duration-200 ease-in-out',
            // Thumb size
            styles.thumb,
            // Position - accounts for 2px padding
            'translate-x-0.5',
            checked && styles.translate
          )}
        />
      </button>
    );

    if (!label) {
      return toggleButton;
    }

    return (
      <div
        className={cn(
          'flex items-start gap-3',
          labelPosition === 'left' && 'flex-row-reverse'
        )}
      >
        {toggleButton}
        <div className="flex flex-col">
          <label
            htmlFor={toggleId}
            className={cn(
              'font-medium text-foreground cursor-pointer',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
          {description && (
            <p
              id={descriptionId}
              className={cn(
                'text-foreground/60 mt-0.5',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
