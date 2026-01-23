'use client';

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { cn } from '@/lib/utils/cn';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'children'> {
  /** Content to display in the tooltip */
  content: ReactNode;
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Position of the tooltip relative to trigger */
  position?: TooltipPosition;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Maximum width of tooltip */
  maxWidth?: number;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: '-translate-x-1/2 -translate-y-full left-1/2 bottom-full mb-2',
  bottom: '-translate-x-1/2 translate-y-0 left-1/2 top-full mt-2',
  left: '-translate-x-full -translate-y-1/2 right-full top-1/2 mr-2',
  right: 'translate-x-0 -translate-y-1/2 left-full top-1/2 ml-2',
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-foreground border-x-transparent border-b-transparent',
  bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-foreground border-x-transparent border-t-transparent',
  left: 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-foreground border-y-transparent border-r-transparent',
  right: 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-foreground border-y-transparent border-l-transparent',
};

/**
 * Tooltip component for contextual hints and information.
 * Used for keyboard key hints and metric explanations.
 *
 * @example
 * <Tooltip content="Words Per Minute" position="top">
 *   <span>WPM</span>
 * </Tooltip>
 *
 * <Tooltip content="Press Shift+A for capital A" position="bottom">
 *   <KeyDisplay keyCode="KeyA" />
 * </Tooltip>
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      className,
      content,
      children,
      position = 'top',
      delay = 200,
      disabled = false,
      maxWidth = 250,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Adjust position if tooltip would be off-screen
    const adjustPosition = useCallback(() => {
      if (!tooltipRef.current || !triggerRef.current) return;

      const tooltip = tooltipRef.current.getBoundingClientRect();
      const trigger = triggerRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let newPosition = position;

      // Check if tooltip would be cut off
      if (position === 'top' && trigger.top - tooltip.height < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && trigger.bottom + tooltip.height > viewport.height) {
        newPosition = 'top';
      } else if (position === 'left' && trigger.left - tooltip.width < 0) {
        newPosition = 'right';
      } else if (position === 'right' && trigger.right + tooltip.width > viewport.width) {
        newPosition = 'left';
      }

      setAdjustedPosition(newPosition);
    }, [position]);

    useEffect(() => {
      if (isVisible) {
        adjustPosition();
      }
    }, [isVisible, adjustPosition]);

    const showTooltip = () => {
      if (disabled) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsVisible(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const tooltipStyle: CSSProperties = {
      maxWidth: `${maxWidth}px`,
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        {...props}
      >
        {/* Trigger element */}
        <div ref={triggerRef}>{children}</div>

        {/* Tooltip */}
        {isVisible && !disabled && (
          <div
            ref={tooltipRef}
            role="tooltip"
            style={tooltipStyle}
            className={cn(
              // Base styles
              'absolute z-50',
              'px-2.5 py-1.5',
              'text-sm text-background',
              'bg-foreground',
              'rounded-md shadow-md',
              'whitespace-normal break-words',
              // Animation
              'animate-in fade-in-0 zoom-in-95 duration-150',
              // Position
              positionStyles[adjustedPosition]
            )}
          >
            {content}
            {/* Arrow */}
            <span
              className={cn(
                'absolute',
                'border-4',
                arrowStyles[adjustedPosition]
              )}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
