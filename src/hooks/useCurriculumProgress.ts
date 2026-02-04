/**
 * @file useCurriculumProgress.ts
 * @description Hook for tracking user's curriculum progress in localStorage.
 *
 * Features:
 * - Track completed lessons with scores
 * - Check lesson unlock status based on prerequisites
 * - Calculate module completion percentage
 * - Persist progress across sessions
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  LESSONS_BY_ID,
  CURRICULUM_MODULES,
  calculateStars,
  type LessonProgress,
  type CurriculumProgress,
} from '@/lib/curriculum';

const STORAGE_KEY = 'teclado-curriculum-progress';

export interface LessonScore {
  wpm: number;
  accuracy: number;
  stars: number;
  completedAt: number;
}

export interface UseCurriculumProgressReturn {
  /** Full curriculum progress object */
  progress: CurriculumProgress | null;
  /** Set of completed lesson IDs */
  completedLessons: Set<string>;
  /** Map of lesson scores by lesson ID */
  lessonScores: Map<string, LessonScore>;
  /** Mark a lesson as complete with score */
  markLessonComplete: (lessonId: string, wpm: number, accuracy: number) => void;
  /** Check if a lesson is unlocked */
  isLessonUnlocked: (lessonId: string) => boolean;
  /** Get module completion percentage (0-100) */
  getModuleProgress: (moduleId: string) => number;
  /** Get total stars earned */
  getTotalStars: () => number;
  /** Reset all progress */
  resetProgress: () => void;
  /** Whether progress is loading */
  isLoading: boolean;
}

/**
 * Create initial progress structure
 * NOTE: All lessons are unlocked by default (no progress gating)
 */
function createInitialProgress(): CurriculumProgress {
  const lessons: Record<string, LessonProgress> = {};

  Object.values(LESSONS_BY_ID).forEach((lesson) => {
    lessons[lesson.id] = {
      lessonId: lesson.id,
      unlocked: true, // All lessons unlocked by default
      completed: false,
      attempts: 0,
      bestWPM: 0,
      bestAccuracy: 0,
      lastAttempt: null,
      completedAt: null,
      stars: 0,
    };
  });

  return {
    userId: 'local-user',
    lessons,
    currentLessonId: null,
    lessonsCompleted: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    totalPracticeTime: 0,
    lastPracticeAt: null,
  };
}

/**
 * Hook for managing curriculum progress
 */
export function useCurriculumProgress(): UseCurriculumProgressReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [progress, setProgress] = useState<CurriculumProgress | null>(null);

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
      } else {
        // No saved progress - initialize fresh
        const initial = createInitialProgress();
        setProgress(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (error) {
      console.warn('Error reading curriculum progress:', error);
      const initial = createInitialProgress();
      setProgress(initial);
    }

    setIsHydrated(true);
    setIsLoading(false);
  }, []);

  // Helper to save progress
  const saveProgress = (newProgress: CurriculumProgress) => {
    setProgress(newProgress);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      } catch (error) {
        console.warn('Error saving curriculum progress:', error);
      }
    }
  };

  // Alias for compatibility
  const storedProgress = progress;

  // Derive completed lessons set
  const completedLessons = new Set<string>(
    storedProgress
      ? Object.entries(storedProgress.lessons)
          .filter(([, progress]) => progress.completed)
          .map(([id]) => id)
      : []
  );

  // Derive lesson scores map
  // Include all completed lessons, using lastAttempt as fallback for completedAt
  const lessonScores = new Map<string, LessonScore>(
    storedProgress
      ? Object.entries(storedProgress.lessons)
          .filter(([, progress]) => progress.completed)
          .map(([id, progress]) => [
            id,
            {
              wpm: progress.bestWPM,
              accuracy: progress.bestAccuracy,
              stars: progress.stars,
              // Use completedAt if available, otherwise fall back to lastAttempt or now
              completedAt: progress.completedAt || progress.lastAttempt || Date.now(),
            },
          ])
      : []
  );

  /**
   * Mark a lesson as complete with the given score
   */
  const markLessonComplete = useCallback(
    (lessonId: string, wpm: number, accuracy: number) => {
      if (!storedProgress) return;

      const lesson = LESSONS_BY_ID[lessonId];
      if (!lesson) return;

      const stars = calculateStars(wpm, accuracy);
      const existingProgress = storedProgress.lessons[lessonId];
      // Always mark as completed when user finishes the lesson - stars are for achievement display only
      const isNewCompletion = !existingProgress?.completed;

      const updatedLessonProgress: LessonProgress = {
        lessonId,
        unlocked: true,
        completed: true, // Always mark completed when lesson is finished
        attempts: (existingProgress?.attempts || 0) + 1,
        bestWPM: Math.max(existingProgress?.bestWPM || 0, wpm),
        bestAccuracy: Math.max(existingProgress?.bestAccuracy || 0, accuracy),
        lastAttempt: Date.now(),
        completedAt: existingProgress?.completedAt || Date.now(),
        stars: Math.max(existingProgress?.stars || 0, stars),
      };

      const updatedLessons = {
        ...storedProgress.lessons,
        [lessonId]: updatedLessonProgress,
      };

      // Unlock dependent lessons if this is a new completion
      if (isNewCompletion) {
        Object.values(LESSONS_BY_ID).forEach((nextLesson) => {
          if (nextLesson.prerequisites.includes(lessonId)) {
            const allPrereqsMet = nextLesson.prerequisites.every(
              (prereqId) => updatedLessons[prereqId]?.completed
            );
            if (allPrereqsMet && updatedLessons[nextLesson.id]) {
              updatedLessons[nextLesson.id] = {
                ...updatedLessons[nextLesson.id],
                unlocked: true,
              };
            }
          }
        });
      }

      // Calculate new statistics
      const completedLessonsList = Object.values(updatedLessons).filter((l) => l.completed);
      const lessonsCompleted = completedLessonsList.length;
      const averageWPM =
        lessonsCompleted > 0
          ? completedLessonsList.reduce((sum, l) => sum + l.bestWPM, 0) / lessonsCompleted
          : 0;
      const averageAccuracy =
        lessonsCompleted > 0
          ? completedLessonsList.reduce((sum, l) => sum + l.bestAccuracy, 0) / lessonsCompleted
          : 0;

      saveProgress({
        ...storedProgress,
        lessons: updatedLessons,
        lessonsCompleted,
        averageWPM,
        averageAccuracy,
        lastPracticeAt: Date.now(),
      });
    },
    [storedProgress, saveProgress]
  );

  /**
   * Check if a lesson is unlocked
   * NOTE: All lessons are unlocked by default (no progress gating)
   */
  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      // All lessons are always unlocked
      return LESSONS_BY_ID[lessonId] !== undefined;
    },
    []
  );

  /**
   * Get module completion percentage
   */
  const getModuleProgress = useCallback(
    (moduleId: string): number => {
      if (!storedProgress) return 0;

      const module = CURRICULUM_MODULES.find((m) => m.id === moduleId);
      if (!module || module.lessonIds.length === 0) return 0;

      const completedCount = module.lessonIds.filter(
        (lessonId) => storedProgress.lessons[lessonId]?.completed
      ).length;

      return Math.round((completedCount / module.lessonIds.length) * 100);
    },
    [storedProgress]
  );

  /**
   * Get total stars earned across all lessons
   */
  const getTotalStars = useCallback((): number => {
    if (!storedProgress) return 0;
    return Object.values(storedProgress.lessons).reduce((sum, lesson) => sum + lesson.stars, 0);
  }, [storedProgress]);

  /**
   * Reset all progress
   */
  const resetProgress = useCallback(() => {
    saveProgress(createInitialProgress());
  }, [saveProgress]);

  return {
    progress: storedProgress,
    completedLessons,
    lessonScores,
    markLessonComplete,
    isLessonUnlocked,
    getModuleProgress,
    getTotalStars,
    resetProgress,
    isLoading,
  };
}

export default useCurriculumProgress;
