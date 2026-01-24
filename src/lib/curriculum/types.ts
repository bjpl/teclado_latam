/**
 * @file types.ts
 * @description Type definitions for the Teclado LATAM typing curriculum.
 *
 * This module defines the structure for a progressive typing curriculum
 * specifically designed for the LATAM Spanish keyboard layout, including
 * support for special characters like n with tilde, accented vowels, and
 * inverted punctuation marks.
 */

// =============================================================================
// Lesson Category Types
// =============================================================================

/**
 * Lesson categories organizing the curriculum progression
 */
export type LessonCategory =
  | 'home-row'      // Core home row keys (ASDF JKL;)
  | 'top-row'       // QWERTY row
  | 'bottom-row'    // ZXCV row
  | 'numbers'       // Number row (1-0)
  | 'punctuation'   // Basic punctuation (. , ; : etc.)
  | 'special'       // LATAM-specific (n with tilde, accents, inverted marks)
  | 'words'         // Common Spanish words
  | 'sentences'     // Full sentence practice
  | 'programming';  // Programming symbols and patterns

/**
 * Difficulty levels for lessons
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Finger assignments for touch typing
 */
export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

// =============================================================================
// Exercise Types
// =============================================================================

/**
 * Type of exercise content
 */
export type ExerciseType =
  | 'drill'      // Repetitive key patterns (e.g., "fff jjj fff")
  | 'words'      // Individual words
  | 'sentences'  // Full sentences
  | 'paragraph'  // Multi-sentence text
  | 'code';      // Programming code snippets

/**
 * Single exercise within a lesson
 */
export interface Exercise {
  /** Unique exercise identifier within the lesson */
  id: string;
  /** Exercise type */
  type: ExerciseType;
  /** Text content to practice */
  text: string;
  /** Minimum WPM target for completion (optional) */
  targetWPM?: number;
  /** Minimum accuracy target (0-100, optional) */
  targetAccuracy?: number;
  /** Hint or tip for this exercise */
  hint?: string;
}

// =============================================================================
// Lesson Types
// =============================================================================

/**
 * Complete definition of a typing lesson
 */
export interface Lesson {
  /** Unique lesson identifier */
  id: string;
  /** Display name (in Spanish) */
  name: string;
  /** English name for accessibility/translation */
  nameEn: string;
  /** Description explaining what this lesson covers */
  description: string;
  /** English description */
  descriptionEn: string;
  /** Lesson category for organization */
  category: LessonCategory;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** New keys introduced in this lesson */
  keys: string[];
  /** Physical key codes for keyboard highlighting */
  keyCodes: string[];
  /** Which fingers are used for the keys */
  fingers: Finger[];
  /** Exercises for this lesson */
  exercises: Exercise[];
  /** Lesson IDs that must be completed first */
  prerequisites: string[];
  /** Estimated time to complete (minutes) */
  estimatedMinutes: number;
  /** Whether this lesson includes dead key compositions */
  usesDeadKeys?: boolean;
  /** Which dead key types are used */
  deadKeyTypes?: ('acute' | 'dieresis')[];
  /** Special notes or tips for the lesson */
  tips?: string[];
}

// =============================================================================
// Progress Tracking Types
// =============================================================================

/**
 * User's progress on a single lesson
 */
export interface LessonProgress {
  /** Lesson ID */
  lessonId: string;
  /** Whether the lesson is unlocked */
  unlocked: boolean;
  /** Whether the lesson has been completed */
  completed: boolean;
  /** Number of times attempted */
  attempts: number;
  /** Best WPM achieved */
  bestWPM: number;
  /** Best accuracy achieved (0-100) */
  bestAccuracy: number;
  /** Most recent attempt timestamp */
  lastAttempt: number | null;
  /** Completion timestamp */
  completedAt: number | null;
  /** Stars earned (0-3) based on performance */
  stars: number;
}

/**
 * Complete curriculum progress for a user
 */
export interface CurriculumProgress {
  /** User identifier */
  userId: string;
  /** Progress by lesson ID */
  lessons: Record<string, LessonProgress>;
  /** Currently active lesson ID */
  currentLessonId: string | null;
  /** Total lessons completed */
  lessonsCompleted: number;
  /** Overall average WPM */
  averageWPM: number;
  /** Overall average accuracy */
  averageAccuracy: number;
  /** Total practice time (milliseconds) */
  totalPracticeTime: number;
  /** Last practice session timestamp */
  lastPracticeAt: number | null;
}

// =============================================================================
// Curriculum Organization Types
// =============================================================================

/**
 * A module is a collection of related lessons
 */
export interface CurriculumModule {
  /** Unique module identifier */
  id: string;
  /** Display name */
  name: string;
  /** English name */
  nameEn: string;
  /** Module description */
  description: string;
  /** English description */
  descriptionEn: string;
  /** Order in the curriculum */
  order: number;
  /** Lesson IDs in this module */
  lessonIds: string[];
  /** Category this module focuses on */
  category: LessonCategory;
}

/**
 * Complete curriculum structure
 */
export interface Curriculum {
  /** Curriculum version */
  version: string;
  /** Last updated timestamp */
  updatedAt: string;
  /** All lessons by ID */
  lessons: Record<string, Lesson>;
  /** Modules organizing the lessons */
  modules: CurriculumModule[];
  /** Recommended lesson order */
  recommendedPath: string[];
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Criteria for unlocking a lesson
 */
export interface UnlockCriteria {
  /** Required lessons to complete */
  requiredLessons: string[];
  /** Minimum overall WPM required */
  minWPM?: number;
  /** Minimum overall accuracy required */
  minAccuracy?: number;
}

/**
 * Star rating thresholds
 */
export interface StarThresholds {
  /** WPM for 1 star */
  oneStar: { wpm: number; accuracy: number };
  /** WPM for 2 stars */
  twoStars: { wpm: number; accuracy: number };
  /** WPM for 3 stars */
  threeStars: { wpm: number; accuracy: number };
}

/**
 * Default star thresholds for lessons
 */
export const DEFAULT_STAR_THRESHOLDS: StarThresholds = {
  oneStar: { wpm: 15, accuracy: 85 },
  twoStars: { wpm: 25, accuracy: 92 },
  threeStars: { wpm: 35, accuracy: 97 },
};
