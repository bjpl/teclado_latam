/**
 * @file index.ts
 * @description Curriculum module exports and utilities.
 *
 * This module provides the complete typing curriculum for LATAM Spanish,
 * including lesson definitions, progress tracking utilities, and
 * curriculum organization helpers.
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  LessonCategory,
  DifficultyLevel,
  Finger,
  ExerciseType,
  Exercise,
  Lesson,
  LessonProgress,
  CurriculumProgress,
  CurriculumModule,
  Curriculum,
  UnlockCriteria,
  StarThresholds,
} from './types';

export { DEFAULT_STAR_THRESHOLDS } from './types';

// =============================================================================
// Lesson Exports
// =============================================================================

export {
  ALL_LESSONS,
  LESSONS_BY_ID,
  RECOMMENDED_PATH,
  // Individual lessons for direct import if needed
  LESSON_HOME_ROW_LEFT,
  LESSON_HOME_ROW_RIGHT,
  LESSON_HOME_ROW_COMBINED,
  LESSON_HOME_ROW_GH,
  LESSON_TOP_ROW_LEFT,
  LESSON_TOP_ROW_RIGHT,
  LESSON_TOP_ROW_COMBINED,
  LESSON_BOTTOM_ROW_LEFT,
  LESSON_BOTTOM_ROW_RIGHT,
  LESSON_BOTTOM_ROW_COMBINED,
  LESSON_FULL_ALPHABET,
  LESSON_SHIFT_BASIC,
  LESSON_SHIFT_FULL,
  LESSON_NUMBERS_LEFT,
  LESSON_NUMBERS_RIGHT,
  LESSON_NUMBERS_COMBINED,
  LESSON_ACCENTS_ACUTE,
  LESSON_ACCENTS_DIERESIS,
  LESSON_INVERTED_PUNCTUATION,
  LESSON_SPECIAL_SYMBOLS,
  LESSON_COMMON_WORDS_1,
  LESSON_COMMON_WORDS_2,
  LESSON_SENTENCES_BASIC,
  LESSON_SENTENCES_INTERMEDIATE,
  LESSON_SENTENCES_ADVANCED,
  LESSON_PROGRAMMING_BASIC,
  LESSON_PROGRAMMING_INTERMEDIATE,
} from './lessons';

// =============================================================================
// Curriculum Utilities
// =============================================================================

import type { Lesson, LessonProgress, CurriculumProgress, CurriculumModule, Curriculum } from './types';
import { ALL_LESSONS, LESSONS_BY_ID, RECOMMENDED_PATH } from './lessons';

/**
 * Get a lesson by its ID
 */
export function getLessonById(id: string): Lesson | undefined {
  return LESSONS_BY_ID[id];
}

/**
 * Get all lessons in a specific category
 */
export function getLessonsByCategory(category: Lesson['category']): Lesson[] {
  return ALL_LESSONS.filter((lesson) => lesson.category === category);
}

/**
 * Get all lessons at a specific difficulty level
 */
export function getLessonsByDifficulty(difficulty: Lesson['difficulty']): Lesson[] {
  return ALL_LESSONS.filter((lesson) => lesson.difficulty === difficulty);
}

/**
 * Check if a lesson is unlocked based on progress
 */
export function isLessonUnlocked(
  lessonId: string,
  _progress: CurriculumProgress
): boolean {
  // All lessons are always unlocked (no progress gating)
  // Just verify the lesson exists
  return LESSONS_BY_ID[lessonId] !== undefined;
}

/**
 * Get the next recommended lesson based on progress
 */
export function getNextLesson(progress: CurriculumProgress): Lesson | null {
  for (const lessonId of RECOMMENDED_PATH) {
    const lessonProgress = progress.lessons[lessonId];

    // Skip completed lessons
    if (lessonProgress?.completed) continue;

    // Check if this lesson is unlocked
    if (isLessonUnlocked(lessonId, progress)) {
      return LESSONS_BY_ID[lessonId];
    }
  }

  return null;
}

/**
 * Get all available (unlocked but not completed) lessons
 */
export function getAvailableLessons(progress: CurriculumProgress): Lesson[] {
  return ALL_LESSONS.filter((lesson) => {
    const lessonProgress = progress.lessons[lesson.id];
    return (
      !lessonProgress?.completed &&
      isLessonUnlocked(lesson.id, progress)
    );
  });
}

/**
 * Calculate stars earned based on WPM and accuracy
 */
export function calculateStars(
  wpm: number,
  accuracy: number,
  thresholds = { oneStar: { wpm: 15, accuracy: 85 }, twoStars: { wpm: 25, accuracy: 92 }, threeStars: { wpm: 35, accuracy: 97 } }
): number {
  if (wpm >= thresholds.threeStars.wpm && accuracy >= thresholds.threeStars.accuracy) {
    return 3;
  }
  if (wpm >= thresholds.twoStars.wpm && accuracy >= thresholds.twoStars.accuracy) {
    return 2;
  }
  if (wpm >= thresholds.oneStar.wpm && accuracy >= thresholds.oneStar.accuracy) {
    return 1;
  }
  return 0;
}

/**
 * Create initial progress for a new user
 */
export function createInitialProgress(userId: string): CurriculumProgress {
  const lessons: Record<string, LessonProgress> = {};

  for (const lesson of ALL_LESSONS) {
    lessons[lesson.id] = {
      lessonId: lesson.id,
      unlocked: true, // All lessons unlocked by default (no progress gating)
      completed: false,
      attempts: 0,
      bestWPM: 0,
      bestAccuracy: 0,
      lastAttempt: null,
      completedAt: null,
      stars: 0,
    };
  }

  return {
    userId,
    lessons,
    currentLessonId: RECOMMENDED_PATH[0],
    lessonsCompleted: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    totalPracticeTime: 0,
    lastPracticeAt: null,
  };
}

/**
 * Update progress after completing a lesson attempt
 */
export function updateLessonProgress(
  progress: CurriculumProgress,
  lessonId: string,
  wpm: number,
  accuracy: number,
  practiceTime: number
): CurriculumProgress {
  const lesson = LESSONS_BY_ID[lessonId];
  if (!lesson) return progress;

  const existingProgress = progress.lessons[lessonId] || {
    lessonId,
    unlocked: true,
    completed: false,
    attempts: 0,
    bestWPM: 0,
    bestAccuracy: 0,
    lastAttempt: null,
    completedAt: null,
    stars: 0,
  };

  const stars = calculateStars(wpm, accuracy);
  const isCompleted = stars >= 1;
  const wasFirstCompletion = !existingProgress.completed && isCompleted;

  const updatedLessonProgress: LessonProgress = {
    ...existingProgress,
    attempts: existingProgress.attempts + 1,
    bestWPM: Math.max(existingProgress.bestWPM, wpm),
    bestAccuracy: Math.max(existingProgress.bestAccuracy, accuracy),
    lastAttempt: Date.now(),
    completed: existingProgress.completed || isCompleted,
    completedAt: existingProgress.completedAt || (isCompleted ? Date.now() : null),
    stars: Math.max(existingProgress.stars, stars),
  };

  // Create updated lessons object
  const updatedLessons = {
    ...progress.lessons,
    [lessonId]: updatedLessonProgress,
  };

  // Unlock lessons that now have all prerequisites met
  if (wasFirstCompletion) {
    for (const nextLesson of ALL_LESSONS) {
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
    }
  }

  // Calculate new averages
  const completedLessons = Object.values(updatedLessons).filter((l) => l.completed);
  const lessonsCompleted = completedLessons.length;
  const averageWPM = lessonsCompleted > 0
    ? completedLessons.reduce((sum, l) => sum + l.bestWPM, 0) / lessonsCompleted
    : 0;
  const averageAccuracy = lessonsCompleted > 0
    ? completedLessons.reduce((sum, l) => sum + l.bestAccuracy, 0) / lessonsCompleted
    : 0;

  return {
    ...progress,
    lessons: updatedLessons,
    lessonsCompleted,
    averageWPM,
    averageAccuracy,
    totalPracticeTime: progress.totalPracticeTime + practiceTime,
    lastPracticeAt: Date.now(),
  };
}

// =============================================================================
// Curriculum Modules Definition
// =============================================================================

/**
 * Organized curriculum modules
 */
export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'home-row',
    name: 'Fila Base',
    nameEn: 'Home Row',
    description: 'Domina las teclas fundamentales donde descansan tus dedos',
    descriptionEn: 'Master the fundamental keys where your fingers rest',
    order: 1,
    lessonIds: ['home-row-left', 'home-row-right', 'home-row-combined', 'home-row-gh'],
    category: 'home-row',
  },
  {
    id: 'top-row',
    name: 'Fila Superior',
    nameEn: 'Top Row',
    description: 'Expande tu alcance a las teclas QWERTY',
    descriptionEn: 'Expand your reach to the QWERTY keys',
    order: 2,
    lessonIds: ['top-row-left', 'top-row-right', 'top-row-combined'],
    category: 'top-row',
  },
  {
    id: 'bottom-row',
    name: 'Fila Inferior',
    nameEn: 'Bottom Row',
    description: 'Completa el alfabeto con la fila inferior',
    descriptionEn: 'Complete the alphabet with the bottom row',
    order: 3,
    lessonIds: ['bottom-row-left', 'bottom-row-right', 'bottom-row-combined'],
    category: 'bottom-row',
  },
  {
    id: 'alphabet',
    name: 'Alfabeto Completo',
    nameEn: 'Full Alphabet',
    description: 'Practica todas las letras juntas',
    descriptionEn: 'Practice all letters together',
    order: 4,
    lessonIds: ['full-alphabet'],
    category: 'words',
  },
  {
    id: 'capitals',
    name: 'Mayusculas',
    nameEn: 'Capitals',
    description: 'Aprende a usar la tecla Shift eficientemente',
    descriptionEn: 'Learn to use the Shift key efficiently',
    order: 5,
    lessonIds: ['shift-basic', 'shift-full'],
    category: 'punctuation',
  },
  {
    id: 'numbers',
    name: 'Numeros',
    nameEn: 'Numbers',
    description: 'Domina la fila de numeros',
    descriptionEn: 'Master the number row',
    order: 6,
    lessonIds: ['numbers-left', 'numbers-right', 'numbers-combined'],
    category: 'numbers',
  },
  {
    id: 'special-latam',
    name: 'Caracteres LATAM',
    nameEn: 'LATAM Characters',
    description: 'Caracteres especiales del teclado latinoamericano',
    descriptionEn: 'Special characters of the Latin American keyboard',
    order: 7,
    lessonIds: ['accents-acute', 'accents-dieresis', 'inverted-punctuation', 'special-symbols'],
    category: 'special',
  },
  {
    id: 'vocabulary',
    name: 'Vocabulario',
    nameEn: 'Vocabulary',
    description: 'Palabras comunes del espanol',
    descriptionEn: 'Common Spanish words',
    order: 8,
    lessonIds: ['common-words-1', 'common-words-2'],
    category: 'words',
  },
  {
    id: 'sentences',
    name: 'Oraciones',
    nameEn: 'Sentences',
    description: 'Practica con oraciones completas',
    descriptionEn: 'Practice with complete sentences',
    order: 9,
    lessonIds: ['sentences-basic', 'sentences-intermediate', 'sentences-advanced'],
    category: 'sentences',
  },
  {
    id: 'programming',
    name: 'Programacion',
    nameEn: 'Programming',
    description: 'Simbolos y patrones para programadores',
    descriptionEn: 'Symbols and patterns for programmers',
    order: 10,
    lessonIds: ['programming-basic', 'programming-intermediate'],
    category: 'programming',
  },
];

/**
 * Complete curriculum object
 */
export const CURRICULUM: Curriculum = {
  version: '1.0.0',
  updatedAt: '2026-01-23',
  lessons: LESSONS_BY_ID,
  modules: CURRICULUM_MODULES,
  recommendedPath: RECOMMENDED_PATH,
};
