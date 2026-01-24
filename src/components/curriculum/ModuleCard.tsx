/**
 * @file ModuleCard.tsx
 * @description Card component displaying a curriculum module with progress.
 *
 * Features:
 * - Module name and description
 * - Progress bar showing completion
 * - Expandable lesson list
 * - Visual state indicators (locked/unlocked/completed)
 */

'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Lock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { CurriculumModule, Lesson } from '@/lib/curriculum';

export interface ModuleCardProps {
  /** Module data */
  module: CurriculumModule;
  /** Lessons in this module */
  lessons: Lesson[];
  /** Completion percentage (0-100) */
  progress: number;
  /** Whether the module is unlocked */
  isUnlocked: boolean;
  /** Whether all lessons are completed */
  isCompleted: boolean;
  /** Initially expanded state */
  defaultExpanded?: boolean;
  /** Children (lesson items) */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModuleCard - Displays a curriculum module with progress
 */
export function ModuleCard({
  module,
  lessons,
  progress,
  isUnlocked,
  isCompleted,
  defaultExpanded = false,
  children,
  className = '',
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (isUnlocked) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        'border transition-all duration-200',
        isUnlocked
          ? 'bg-surface-0 border-border-muted hover:border-foreground/20'
          : 'bg-surface-1/50 border-border-muted/50 opacity-75',
        isExpanded && 'ring-2 ring-accent-primary/20',
        className
      )}
    >
      {/* Module Header */}
      <button
        onClick={toggleExpanded}
        disabled={!isUnlocked}
        className={cn(
          'w-full p-4 text-left',
          'flex items-center gap-4',
          'transition-colors',
          isUnlocked && 'hover:bg-surface-1/50 cursor-pointer',
          !isUnlocked && 'cursor-not-allowed',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset'
        )}
        aria-expanded={isExpanded}
        aria-disabled={!isUnlocked}
      >
        {/* Status Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg',
            'flex items-center justify-center',
            isCompleted
              ? 'bg-green-500/10 text-green-500'
              : isUnlocked
              ? 'bg-accent-primary/10 text-accent-primary'
              : 'bg-foreground/5 text-foreground/40'
          )}
        >
          {!isUnlocked ? (
            <Lock className="w-5 h-5" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'font-semibold truncate',
                isUnlocked ? 'text-foreground' : 'text-foreground/50'
              )}
            >
              {module.name}
            </h3>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                isUnlocked ? 'bg-foreground/5 text-foreground/60' : 'bg-foreground/5 text-foreground/40'
              )}
            >
              {lessons.length} {lessons.length === 1 ? 'leccion' : 'lecciones'}
            </span>
          </div>
          <p
            className={cn(
              'text-sm truncate',
              isUnlocked ? 'text-foreground/60' : 'text-foreground/40'
            )}
          >
            {module.description}
          </p>

          {/* Progress Bar */}
          {isUnlocked && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isCompleted ? 'bg-green-500' : 'bg-accent-primary'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground/60 tabular-nums">
                {progress}%
              </span>
            </div>
          )}
        </div>

        {/* Expand Indicator */}
        {isUnlocked && (
          <div className="flex-shrink-0 text-foreground/40">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && isUnlocked && (
        <div className="border-t border-border-muted">
          <div className="p-2">{children}</div>
        </div>
      )}
    </div>
  );
}

export default ModuleCard;
