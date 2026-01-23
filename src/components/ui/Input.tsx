'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message - when present, shows error styling */
  error?: string;
  /** Size variant of the input */
  size?: InputSize;
  /** Icon or element to show on the left side */
  leftElement?: ReactNode;
  /** Icon or element to show on the right side */
  rightElement?: ReactNode;
  /** Full width of container */
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-4 text-lg',
};

const labelSizeStyles: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Input component with label, helper text, and error state support.
 * Designed for integration with keyboard typing practice.
 *
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   helperText="We'll never share your email"
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      size = 'md',
      leftElement,
      rightElement,
      fullWidth = false,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'font-medium text-foreground',
              labelSizeStyles[size],
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base styles
              'w-full rounded-lg',
              'bg-background text-foreground',
              'border border-foreground/20',
              'placeholder:text-foreground/40',
              'transition-colors duration-150',
              // Focus styles
              'outline-none',
              'focus:border-foreground/40',
              'focus:ring-2 focus:ring-foreground/10',
              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Error styles
              hasError && [
                'border-red-500',
                'focus:border-red-500',
                'focus:ring-red-500/20',
              ],
              // Size
              sizeStyles[size],
              // Padding adjustments for elements
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">
              {rightElement}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={hasError ? errorId : helperId}
            className={cn(
              'text-sm',
              hasError ? 'text-red-500' : 'text-foreground/60'
            )}
            role={hasError ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
