/**
 * @file customText.ts
 * @description Type definitions for saved custom texts in Teclado LATAM.
 *
 * Custom texts allow users to save and reuse their own practice content.
 * Each text tracks usage statistics for personalized practice recommendations.
 */

/**
 * Represents a saved custom text for typing practice
 */
export interface CustomText {
  /** Unique identifier for the text */
  id: string;
  /** User-provided title for the text */
  title: string;
  /** The actual text content to practice */
  content: string;
  /** Timestamp when the text was created */
  createdAt: number;
  /** Timestamp when the text was last used for practice (null if never used) */
  lastUsedAt: number | null;
  /** Number of times this text has been used for practice */
  timesUsed: number;
}

/**
 * Maximum number of saved custom texts allowed
 */
export const MAX_CUSTOM_TEXTS = 20;

/**
 * Maximum character length for custom text content
 */
export const MAX_CUSTOM_TEXT_LENGTH = 5000;

/**
 * Storage key for custom texts in localStorage
 */
export const CUSTOM_TEXTS_STORAGE_KEY = 'teclado-custom-texts';
