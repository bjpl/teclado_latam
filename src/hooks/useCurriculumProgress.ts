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
import { useLocalStorage } from './useLocalStorage';
import {
  LESSONS_BY_ID,
  CURRICULUM_MODULES,
  isLessonUnlocked as checkUnlocked,
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
 */
function createInitialProgress(): CurriculumProgress {
  const lessons: Record<string, LessonProgress> = {};

  Object.values(LESSONS_BY_ID).forEach((lesson) => {
    lessons[lesson.id] = {
      lessonId: lesson.id,
      unlocked: lesson.prerequisites.length === 0,
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
  const [storedProgress, setStoredProgress] = useLocalStorage<CurriculumProgress | null>(
    STORAGE_KEY,
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize progress if not exists
  useEffect(() => {
    if (storedProgress === null) {
      setStoredProgress(createInitialProgress());
    }
    setIsLoading(false);
  }, [storedProgress, setStoredProgress]);

  // Derive completed lessons set
  const completedLessons = new Set<string>(
    storedProgress
      ? Object.entries(storedProgress.lessons)
          .filter(([, progress]) => progress.completed)
          .map(([id]) => id)
      : []
  );

  // Derive lesson scores map
  const lessonScores = new Map<string, LessonScore>(
    storedProgress
      ? Object.entries(storedProgress.lessons)
          .filter(([, progress]) => progress.completed && progress.completedAt)
          .map(([id, progress]) => [
            id,
            {
              wpm: progress.bestWPM,
              accuracy: progress.bestAccuracy,
              stars: progress.stars,
              completedAt: progress.completedAt!,
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
      const isNewCompletion = !existingProgress?.completed && stars >= 1;

      const updatedLessonProgress: LessonProgress = {
        lessonId,
        unlocked: true,
        completed: existingProgress?.completed || stars >= 1,
        attempts: (existingProgress?.attempts || 0) + 1,
        bestWPM: Math.max(existingProgress?.bestWPM || 0, wpm),
        bestAccuracy: Math.max(existingProgress?.bestAccuracy || 0, accuracy),
        lastAttempt: Date.now(),
        completedAt: existingProgress?.completedAt || (stars >= 1 ? Date.now() : null),
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

      setStoredProgress({
        ...storedProgress,
        lessons: updatedLessons,
        lessonsCompleted,
        averageWPM,
        averageAccuracy,
        lastPracticeAt: Date.now(),
      });
    },
    [storedProgress, setStoredProgress]
  );

  /**
   * Check if a lesson is unlocked based on prerequisites
   */
  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      if (!storedProgress) return false;
      return checkUnlocked(lessonId, storedProgress);
    },
    [storedProgress]
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
    setStoredProgress(createInitialProgress());
  }, [setStoredProgress]);

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
