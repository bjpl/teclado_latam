/**
 * @file useCustomTexts.ts
 * @description Hook for managing saved custom texts in localStorage.
 *
 * Provides CRUD operations for custom practice texts with:
 * - Persistence via localStorage
 * - Usage tracking (lastUsedAt, timesUsed)
 * - Limits enforcement (max texts, max length)
 * - SSR-safe implementation
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  CustomText,
  MAX_CUSTOM_TEXTS,
  MAX_CUSTOM_TEXT_LENGTH,
  CUSTOM_TEXTS_STORAGE_KEY,
} from '../types/customText';

// =============================================================================
// Types
// =============================================================================

export interface UseCustomTextsReturn {
  /** All saved custom texts */
  texts: CustomText[];
  /** Add a new custom text, returns the new text's ID or null if limit reached */
  addText: (title: string, content: string) => string | null;
  /** Delete a custom text by ID */
  deleteText: (id: string) => void;
  /** Update the lastUsedAt timestamp and increment timesUsed */
  updateLastUsed: (id: string) => void;
  /** Update an existing text's title and/or content */
  updateText: (id: string, updates: { title?: string; content?: string }) => void;
  /** Check if the maximum number of texts has been reached */
  isAtLimit: boolean;
  /** Get a text by ID */
  getTextById: (id: string) => CustomText | undefined;
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Generate a unique ID for a new custom text
 */
function generateId(): string {
  return `ct_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Truncate content if it exceeds the maximum length
 */
function truncateContent(content: string): string {
  if (content.length <= MAX_CUSTOM_TEXT_LENGTH) {
    return content;
  }
  return content.substring(0, MAX_CUSTOM_TEXT_LENGTH);
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing saved custom texts
 *
 * @returns Object with texts array and CRUD operations
 *
 * @example
 * ```tsx
 * const { texts, addText, deleteText, updateLastUsed } = useCustomTexts();
 *
 * // Add a new text
 * const id = addText('My Practice Text', 'The quick brown fox...');
 *
 * // Mark as used when starting practice
 * updateLastUsed(id);
 *
 * // Delete when no longer needed
 * deleteText(id);
 * ```
 */
export function useCustomTexts(): UseCustomTextsReturn {
  const [texts, setTexts] = useLocalStorage<CustomText[]>(
    CUSTOM_TEXTS_STORAGE_KEY,
    []
  );

  /**
   * Add a new custom text
   */
  const addText = useCallback(
    (title: string, content: string): string | null => {
      // Check if at limit
      if (texts.length >= MAX_CUSTOM_TEXTS) {
        return null;
      }

      const trimmedTitle = title.trim() || 'Untitled';
      const trimmedContent = truncateContent(content.trim());

      if (!trimmedContent) {
        return null;
      }

      const newText: CustomText = {
        id: generateId(),
        title: trimmedTitle,
        content: trimmedContent,
        createdAt: Date.now(),
        lastUsedAt: null,
        timesUsed: 0,
      };

      setTexts((prev) => [newText, ...prev]);
      return newText.id;
    },
    [texts.length, setTexts]
  );

  /**
   * Delete a custom text by ID
   */
  const deleteText = useCallback(
    (id: string): void => {
      setTexts((prev) => prev.filter((text) => text.id !== id));
    },
    [setTexts]
  );

  /**
   * Update the lastUsedAt timestamp and increment timesUsed
   */
  const updateLastUsed = useCallback(
    (id: string): void => {
      setTexts((prev) =>
        prev.map((text) =>
          text.id === id
            ? {
                ...text,
                lastUsedAt: Date.now(),
                timesUsed: text.timesUsed + 1,
              }
            : text
        )
      );
    },
    [setTexts]
  );

  /**
   * Update an existing text's title and/or content
   */
  const updateText = useCallback(
    (id: string, updates: { title?: string; content?: string }): void => {
      setTexts((prev) =>
        prev.map((text) => {
          if (text.id !== id) {
            return text;
          }

          const newText = { ...text };

          if (updates.title !== undefined) {
            newText.title = updates.title.trim() || 'Untitled';
          }

          if (updates.content !== undefined) {
            newText.content = truncateContent(updates.content.trim());
          }

          return newText;
        })
      );
    },
    [setTexts]
  );

  /**
   * Check if the maximum number of texts has been reached
   */
  const isAtLimit = useMemo(() => texts.length >= MAX_CUSTOM_TEXTS, [texts.length]);

  /**
   * Get a text by ID
   */
  const getTextById = useCallback(
    (id: string): CustomText | undefined => {
      return texts.find((text) => text.id === id);
    },
    [texts]
  );

  return {
    texts,
    addText,
    deleteText,
    updateLastUsed,
    updateText,
    isAtLimit,
    getTextById,
  };
}

export default useCustomTexts;
