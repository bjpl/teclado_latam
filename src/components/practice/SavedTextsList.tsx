/**
 * @file SavedTextsList.tsx
 * @description List component for displaying and managing saved custom texts.
 *
 * Features:
 * - Shows title, preview (first 100 chars), and creation date
 * - Click to select a text for practice
 * - Delete button with confirmation
 * - Empty state message when no saved texts
 * - Sorted by lastUsedAt descending (most recently used first)
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { Trash2, FileText, Clock, Hash } from 'lucide-react';
import type { CustomText } from '../../types/customText';

// =============================================================================
// Types
// =============================================================================

export interface SavedTextsListProps {
  /** Array of saved custom texts */
  texts: CustomText[];
  /** Callback when a text is selected */
  onSelect: (text: CustomText) => void;
  /** Callback when a text is deleted */
  onDelete: (id: string) => void;
  /** Optional class name for the container */
  className?: string;
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Format a timestamp to a readable date string
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get a preview of the text content (first 100 characters)
 */
function getPreview(content: string, maxLength = 100): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * Sort texts by lastUsedAt descending, then by createdAt descending
 */
function sortTexts(texts: CustomText[]): CustomText[] {
  return [...texts].sort((a, b) => {
    // Most recently used first
    if (a.lastUsedAt && b.lastUsedAt) {
      return b.lastUsedAt - a.lastUsedAt;
    }
    // Used texts come before unused
    if (a.lastUsedAt && !b.lastUsedAt) {
      return -1;
    }
    if (!a.lastUsedAt && b.lastUsedAt) {
      return 1;
    }
    // For unused texts, sort by creation date (newest first)
    return b.createdAt - a.createdAt;
  });
}

// =============================================================================
// Sub-components
// =============================================================================

interface TextItemProps {
  text: CustomText;
  onSelect: (text: CustomText) => void;
  onDelete: (id: string) => void;
}

const TextItem = memo(function TextItem({
  text,
  onSelect,
  onDelete,
}: TextItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirmDelete) {
        onDelete(text.id);
        setConfirmDelete(false);
      } else {
        setConfirmDelete(true);
        // Reset confirmation after 3 seconds
        setTimeout(() => setConfirmDelete(false), 3000);
      }
    },
    [confirmDelete, onDelete, text.id]
  );

  const handleSelect = useCallback(() => {
    onSelect(text);
  }, [onSelect, text]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      className="
        group
        flex
        flex-col
        gap-2
        p-4
        rounded-lg
        border
        border-gray-200
        dark:border-gray-700
        bg-white
        dark:bg-gray-800
        hover:border-blue-300
        dark:hover:border-blue-600
        hover:bg-blue-50
        dark:hover:bg-gray-750
        cursor-pointer
        transition-colors
        duration-150
      "
    >
      {/* Header row with title and delete button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText
            size={18}
            className="flex-shrink-0 text-gray-400 dark:text-gray-500"
          />
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {text.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleDeleteClick}
          className={`
            flex-shrink-0
            p-1.5
            rounded
            transition-colors
            duration-150
            focus:outline-none
            focus:ring-2
            focus:ring-offset-1
            ${
              confirmDelete
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 focus:ring-red-500'
                : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500'
            }
          `}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete text'}
          aria-label={confirmDelete ? 'Confirm delete' : 'Delete text'}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Preview text */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {getPreview(text.content)}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatDate(text.createdAt)}
        </span>
        {text.timesUsed > 0 && (
          <span className="flex items-center gap-1">
            <Hash size={12} />
            {text.timesUsed} {text.timesUsed === 1 ? 'use' : 'uses'}
          </span>
        )}
        <span className="text-gray-400 dark:text-gray-600">
          {text.content.length} chars
        </span>
      </div>
    </div>
  );
});

// =============================================================================
// Component
// =============================================================================

/**
 * SavedTextsList - Display a list of saved custom texts
 */
function SavedTextsListComponent({
  texts,
  onSelect,
  onDelete,
  className = '',
}: SavedTextsListProps) {
  // Sort texts by most recently used
  const sortedTexts = useMemo(() => sortTexts(texts), [texts]);

  // Empty state
  if (texts.length === 0) {
    return (
      <div
        className={`
          flex
          flex-col
          items-center
          justify-center
          gap-3
          py-8
          px-4
          text-center
          ${className}
        `}
      >
        <FileText size={48} className="text-gray-300 dark:text-gray-600" />
        <div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No saved texts yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Save your custom practice texts to access them anytime
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {sortedTexts.map((text) => (
        <TextItem
          key={text.id}
          text={text}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export const SavedTextsList = memo(SavedTextsListComponent);

export default SavedTextsList;
