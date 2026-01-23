/**
 * @file useKeyboardEvents.ts
 * @description Keyboard event handling hook for Teclado LATAM.
 *
 * Attaches/detaches keyboard listeners and normalizes events across browsers.
 * Handles AltGr detection and provides a consistent event interface.
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 * @see docs/sparc/03-pseudocode-keyboard.md - Keyboard event handling
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { ModifierState } from '@/lib/typing-engine/types';

/**
 * Normalized keyboard event
 */
export interface NormalizedKeyEvent {
  /** Physical key code (e.g., "KeyA", "Digit1") */
  code: string;
  /** Character produced by the key */
  key: string;
  /** Timestamp of the event (high resolution) */
  timestamp: number;
  /** Current modifier state */
  modifiers: ModifierState;
  /** Whether this is a key repeat */
  repeat: boolean;
  /** Original browser event for advanced use cases */
  originalEvent: KeyboardEvent;
  /** Prevent default behavior */
  preventDefault: () => void;
  /** Stop propagation */
  stopPropagation: () => void;
}

/**
 * Hook options
 */
export interface UseKeyboardEventsOptions {
  /** Whether keyboard capture is enabled */
  enabled?: boolean;
  /** Target element ref (defaults to window) */
  targetRef?: React.RefObject<HTMLElement>;
  /** Whether to prevent default for handled keys */
  preventDefault?: boolean;
  /** Keys to always prevent default on */
  preventDefaultKeys?: string[];
  /** Keys to never handle (pass through) */
  ignoreKeys?: string[];
  /** Whether to capture on key up as well */
  captureKeyUp?: boolean;
  /** Callback for key up events */
  onKeyUp?: (event: NormalizedKeyEvent) => void;
}

/**
 * Detect AltGr key press
 *
 * AltGr is detected when:
 * - Right Alt is pressed (event.code === 'AltRight')
 * - Or Ctrl+Alt are pressed together (Windows behavior)
 */
function isAltGr(event: KeyboardEvent): boolean {
  // Direct AltGr key
  if (event.code === 'AltRight') {
    return true;
  }

  // Ctrl+Alt combination (Windows AltGr emulation)
  if (event.ctrlKey && event.altKey) {
    return true;
  }

  return false;
}

/**
 * Extract modifier state from keyboard event
 */
function getModifierState(event: KeyboardEvent): ModifierState {
  const altGr = isAltGr(event);

  return {
    shift: event.shiftKey,
    altGr,
    ctrl: event.ctrlKey && !altGr, // Ctrl without AltGr
    meta: event.metaKey,
  };
}

/**
 * Normalize a browser keyboard event
 */
function normalizeEvent(event: KeyboardEvent): NormalizedKeyEvent {
  return {
    code: event.code,
    key: event.key,
    timestamp: performance.now(),
    modifiers: getModifierState(event),
    repeat: event.repeat,
    originalEvent: event,
    preventDefault: () => event.preventDefault(),
    stopPropagation: () => event.stopPropagation(),
  };
}

/**
 * Default keys to prevent default on during typing
 */
const DEFAULT_PREVENT_KEYS = [
  'Tab',
  'Backspace',
  'Enter',
  'Space',
];

/**
 * Default keys to ignore (let browser handle)
 */
const DEFAULT_IGNORE_KEYS = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'PrintScreen', 'ScrollLock', 'Pause',
  'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
];

/**
 * Custom hook for keyboard event handling
 *
 * @param onKeyDown - Callback for normalized key events
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * useKeyboardEvents(
 *   (event) => {
 *     console.log('Key pressed:', event.key, event.code);
 *     if (event.code === 'Escape') {
 *       handleEscape();
 *     }
 *   },
 *   { enabled: isSessionActive }
 * );
 * ```
 */
export function useKeyboardEvents(
  onKeyDown: (event: NormalizedKeyEvent) => void,
  options: UseKeyboardEventsOptions = {}
): void {
  const {
    enabled = true,
    targetRef,
    preventDefault = true,
    preventDefaultKeys = DEFAULT_PREVENT_KEYS,
    ignoreKeys = DEFAULT_IGNORE_KEYS,
    captureKeyUp = false,
    onKeyUp,
  } = options;

  // Store callback refs to avoid re-attaching listeners
  const onKeyDownRef = useRef(onKeyDown);
  const onKeyUpRef = useRef(onKeyUp);

  // Update refs when callbacks change
  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  }, [onKeyDown]);

  useEffect(() => {
    onKeyUpRef.current = onKeyUp;
  }, [onKeyUp]);

  /**
   * Handle keydown event
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if we should ignore this key
      if (ignoreKeys.includes(event.code)) {
        return;
      }

      // Check for system shortcuts (Ctrl+C, Ctrl+V, etc.)
      if (event.ctrlKey || event.metaKey) {
        const systemShortcuts = ['KeyC', 'KeyV', 'KeyX', 'KeyA', 'KeyZ', 'KeyY'];
        if (systemShortcuts.includes(event.code)) {
          return; // Let browser handle
        }
      }

      // Normalize event
      const normalizedEvent = normalizeEvent(event);

      // Prevent default for certain keys
      if (preventDefault && preventDefaultKeys.includes(event.code)) {
        event.preventDefault();
      }

      // Call handler
      onKeyDownRef.current(normalizedEvent);
    },
    [ignoreKeys, preventDefault, preventDefaultKeys]
  );

  /**
   * Handle keyup event
   */
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!onKeyUpRef.current) {
        return;
      }

      if (ignoreKeys.includes(event.code)) {
        return;
      }

      const normalizedEvent = normalizeEvent(event);
      onKeyUpRef.current(normalizedEvent);
    },
    [ignoreKeys]
  );

  // Attach/detach event listeners
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const target = targetRef?.current ?? window;

    target.addEventListener('keydown', handleKeyDown as EventListener);

    if (captureKeyUp) {
      target.addEventListener('keyup', handleKeyUp as EventListener);
    }

    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);

      if (captureKeyUp) {
        target.removeEventListener('keyup', handleKeyUp as EventListener);
      }
    };
  }, [enabled, targetRef, handleKeyDown, handleKeyUp, captureKeyUp]);
}

/**
 * Check if a key event is a printable character
 */
export function isPrintableKey(event: NormalizedKeyEvent): boolean {
  // Single character keys are typically printable
  if (event.key.length === 1) {
    return true;
  }

  // Special cases
  const nonPrintable = [
    'Backspace', 'Tab', 'Enter', 'Escape',
    'Shift', 'Control', 'Alt', 'Meta',
    'CapsLock', 'NumLock', 'ScrollLock',
    'Delete', 'Insert', 'Home', 'End', 'PageUp', 'PageDown',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Dead', 'Unidentified',
  ];

  return !nonPrintable.includes(event.key);
}

/**
 * Check if a key event is a modifier key
 */
export function isModifierKey(event: NormalizedKeyEvent): boolean {
  const modifierCodes = [
    'ShiftLeft', 'ShiftRight',
    'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight',
    'MetaLeft', 'MetaRight',
  ];

  return modifierCodes.includes(event.code);
}

/**
 * Check if a key event is a control key (Backspace, Enter, Tab, Escape)
 */
export function isControlKey(event: NormalizedKeyEvent): boolean {
  const controlCodes = [
    'Backspace', 'Tab', 'Enter', 'Escape',
    'Delete', 'Insert',
  ];

  return controlCodes.includes(event.code);
}
