/**
 * @file TextInput.tsx
 * @description Hidden input component for keyboard capture.
 *
 * Features:
 * - Invisible but focusable
 * - Captures all keyboard events
 * - Prevents default browser behavior
 * - Maintains focus during practice
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 2 (Text Display Rendering)
 */

import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { KeyboardEvent as TypingKeyboardEvent } from '@/lib/typing-engine/types';

// =============================================================================
// Types
// =============================================================================

export interface TextInputProps {
  /** Whether the input should auto-focus */
  autoFocus?: boolean;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Callback when a key is pressed */
  onKeyDown?: (event: TypingKeyboardEvent) => void;
  /** Callback when input gains focus */
  onFocus?: () => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
}

export interface TextInputRef {
  /** Focus the input element */
  focus: () => void;
  /** Blur the input element */
  blur: () => void;
  /** Check if input is currently focused */
  isFocused: () => boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert browser KeyboardEvent to our normalized type
 */
function normalizeKeyboardEvent(
  event: React.KeyboardEvent<HTMLTextAreaElement>
): TypingKeyboardEvent {
  return {
    code: event.code,
    key: event.key,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    timestamp: performance.now(),
    repeat: event.repeat,
  };
}

/**
 * Check if a key combination should be allowed (browser shortcuts)
 */
function shouldAllowDefault(event: React.KeyboardEvent): boolean {
  // Allow Ctrl/Cmd + key shortcuts for browser
  if (event.ctrlKey || event.metaKey) {
    const allowedKeys = ['c', 'v', 'x', 'a', 'z', 'y', 'r', 'f'];
    if (allowedKeys.includes(event.key.toLowerCase())) {
      return true;
    }
  }

  // Allow F-keys for browser functionality
  if (event.key.startsWith('F') && !isNaN(parseInt(event.key.slice(1)))) {
    return true;
  }

  // Allow Tab for focus navigation (but still notify handler)
  // Note: We still call onKeyDown for Tab so the app knows about it
  if (event.key === 'Tab') {
    return true;
  }

  return false;
}

// =============================================================================
// Component
// =============================================================================

/**
 * TextInput - Hidden input for keyboard capture
 *
 * This component provides an invisible, focusable textarea that captures
 * all keyboard input during typing practice. It normalizes keyboard events
 * and prevents default browser behavior where appropriate.
 */
export const TextInput = forwardRef<TextInputRef, TextInputProps>(
  function TextInput(
    { autoFocus = true, disabled = false, onKeyDown, onFocus, onBlur },
    ref
  ) {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      isFocused: () => {
        return document.activeElement === inputRef.current;
      },
    }));

    // Auto-focus on mount
    useEffect(() => {
      if (autoFocus && !disabled) {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [autoFocus, disabled]);

    // Handle key down
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Allow some browser shortcuts
        if (shouldAllowDefault(event)) {
          return;
        }

        // Prevent default for most keys
        event.preventDefault();

        // Normalize and forward event
        if (onKeyDown) {
          const normalizedEvent = normalizeKeyboardEvent(event);
          onKeyDown(normalizedEvent);
        }
      },
      [onKeyDown]
    );

    // Handle focus
    const handleFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);

    // Handle blur
    const handleBlur = useCallback(() => {
      onBlur?.();
    }, [onBlur]);

    // Prevent text selection and input
    const handleInput = useCallback(
      (event: React.FormEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        // Clear any input that somehow got through
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
      []
    );

    return (
      <textarea
        ref={inputRef}
        className="
          absolute
          left-0
          top-0
          w-full
          h-full
          p-0
          m-0
          bg-transparent
          text-transparent
          caret-transparent
          border-0
          outline-none
          resize-none
          cursor-default
          z-10
        "
        style={{
          // Make truly invisible but still focusable
          color: 'transparent',
          caretColor: 'transparent',
        }}
        tabIndex={0}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Type here to practice"
        aria-describedby="typing-instructions"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onPaste={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      />
    );
  }
);

export default TextInput;
