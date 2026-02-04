/**
 * @file LessonItem.tsx
 * @description Row component displaying a single lesson in the curriculum.
 *
 * Features:
 * - Lesson name and difficulty badge
 * - Best score display (stars, WPM)
 * - Lock indicator for locked lessons
 * - Start button to begin practice
 */

'use client';

import { Lock, Star, Play, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Lesson, DifficultyLevel } from '@/lib/curriculum';
import type { LessonScore } from '@/hooks/useCurriculumProgress';

export interface LessonItemProps {
  /** Lesson data */
  lesson: Lesson;
  /** User's progress on this lesson */
  score?: LessonScore;
  /** Whether the lesson is unlocked */
  isUnlocked: boolean;
  /** Callback when start button is clicked */
  onStart: (lesson: Lesson) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get difficulty badge color
 */
function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'intermediate':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'advanced':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'expert':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-foreground/10 text-foreground/60';
  }
}

/**
 * Get difficulty label in Spanish
 */
function getDifficultyLabel(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'beginner':
      return 'Principiante';
    case 'intermediate':
      return 'Intermedio';
    case 'advanced':
      return 'Avanzado';
    case 'expert':
      return 'Experto';
    default:
      return difficulty;
  }
}

/**
 * Render star rating
 */
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i <= stars
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-transparent text-foreground/20'
          )}
        />
      ))}
    </div>
  );
}

/**
 * LessonItem - Displays a single lesson row
 */
export function LessonItem({
  lesson,
  score,
  isUnlocked,
  onStart,
  className = '',
}: LessonItemProps) {
  // A lesson is completed if we have a score (completedAt timestamp exists)
  const isCompleted = !!score;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg',
        'transition-colors',
        isUnlocked
          ? 'hover:bg-surface-1/50'
          : 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full',
          'flex items-center justify-center',
          !isUnlocked
            ? 'bg-foreground/5 text-foreground/40'
            : isCompleted
            ? 'bg-green-500/10 text-green-500'
            : 'bg-accent-primary/10 text-accent-primary'
        )}
      >
        {!isUnlocked ? (
          <Lock className="w-4 h-4" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-medium truncate',
              isUnlocked ? 'text-foreground' : 'text-foreground/50'
            )}
          >
            {lesson.name}
          </span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              getDifficultyColor(lesson.difficulty)
            )}
          >
            {getDifficultyLabel(lesson.difficulty)}
          </span>
        </div>
        <p
          className={cn(
            'text-sm truncate mt-0.5',
            isUnlocked ? 'text-foreground/50' : 'text-foreground/40'
          )}
        >
          {lesson.description}
        </p>
      </div>

      {/* Score Display */}
      {isUnlocked && score && (
        <div className="flex-shrink-0 flex items-center gap-4 mr-2">
          <StarRating stars={score.stars} />
          <div className="text-right">
            <div className="text-sm font-medium text-foreground tabular-nums">
              {score.wpm.toFixed(0)} WPM
            </div>
            <div className="text-xs text-foreground/50 tabular-nums">
              {score.accuracy.toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Time Estimate (for unlocked but not completed) */}
      {isUnlocked && !score && (
        <div className="flex-shrink-0 flex items-center gap-1 text-foreground/40 mr-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{lesson.estimatedMinutes} min</span>
        </div>
      )}

      {/* Start Button */}
      {isUnlocked && (
        <button
          onClick={() => onStart(lesson)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-lg',
            'text-sm font-medium',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
            isCompleted
              ? 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              : 'bg-accent-primary text-white hover:bg-accent-primary/90',
            'opacity-0 group-hover:opacity-100',
            'sm:opacity-100'
          )}
        >
          {isCompleted ? 'Repetir' : 'Iniciar'}
        </button>
      )}
    </div>
  );
}

export default LessonItem;
