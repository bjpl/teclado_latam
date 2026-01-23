/**
 * @file typing-engine.ts
 * @description Core typing engine implementation for Teclado LATAM.
 *
 * STUB IMPLEMENTATION - TDD Red Phase
 * All functions throw or return minimal values to make tests run.
 *
 * @see docs/sparc/03-pseudocode.md Section 2 (Typing Engine Core)
 */

import type {
  SessionState,
  SessionSettings,
  CharacterResult,
  UIFeedback,
  KeyboardEvent as TypingKeyboardEvent,
  DeadKeyState,
  KeyDefinition,
  ModifierState,
} from './types';

// =============================================================================
// Constants
// =============================================================================

// TODO: Implement minimum debounce interval
const MIN_KEYSTROKE_INTERVAL_MS = 20;

// =============================================================================
// Session Creation
// =============================================================================

/**
 * Create a new typing session
 *
 * TODO: Implement session creation with:
 * - Initialize characters array from text
 * - Set initial state (not started, not paused, not complete)
 * - Apply settings
 *
 * @param text - Text to type
 * @param settings - Session settings
 * @returns New session state
 */
export function createSession(
  text: string,
  settings: Partial<SessionSettings> = {}
): SessionState {
  // TODO: Implement session creation
  const defaultSettings: SessionSettings = {
    mode: settings.mode ?? 'lenient',
    caseSensitive: settings.caseSensitive ?? true,
    strictAccents: settings.strictAccents ?? true,
    allowWordDeletion: settings.allowWordDeletion ?? false,
  };

  return {
    text,
    characters: initializeCharacters(text),
    currentIndex: 0,
    mode: defaultSettings.mode,
    isStarted: false,
    isPaused: false,
    isComplete: false,
    startTime: null,
    pauseTime: null,
    totalPausedTime: 0,
    settings: defaultSettings,
  };
}

// =============================================================================
// Character Initialization
// =============================================================================

/**
 * Initialize character result array from text
 *
 * TODO: Implement character initialization with:
 * - Create CharacterResult for each character
 * - Mark first character as current
 * - Mark rest as pending
 * - Handle Unicode characters properly
 *
 * @param text - Text to initialize
 * @returns Array of character results
 */
export function initializeCharacters(text: string): CharacterResult[] {
  // TODO: Implement proper Unicode-aware character splitting
  if (!text) {
    return [];
  }

  const chars = Array.from(text); // Unicode-aware splitting
  return chars.map((char, index) => ({
    index,
    expected: char,
    actual: null,
    state: index === 0 ? 'current' : 'pending',
    timestamp: null,
    isCurrent: index === 0,
  }));
}

// =============================================================================
// Keystroke Processing
// =============================================================================

/**
 * Process a keystroke event
 *
 * TODO: Implement keystroke processing with:
 * - Filter modifier-only keys
 * - Debounce rapid keystrokes
 * - Check if session is active
 * - Start timer on first keystroke
 * - Validate character
 * - Update state based on mode
 * - Calculate next key highlight
 *
 * @param event - Keyboard event
 * @param sessionState - Current session state
 * @param deadKeyState - Current dead key state
 * @param keyboardMapper - Keyboard layout mapper
 * @returns Updated state and feedback
 */
export function processKeystroke(
  event: TypingKeyboardEvent,
  sessionState: SessionState,
  deadKeyState: DeadKeyState,
  keyboardMapper: { getKeyDefinition: (code: string) => KeyDefinition | null; findKeyForCharacter: (char: string) => any }
): { updatedState: SessionState; feedback: UIFeedback } {
  // TODO: Implement full keystroke processing algorithm

  // Filter modifier-only keys
  const modifierCodes = [
    'ShiftLeft', 'ShiftRight',
    'AltLeft', 'AltRight',
    'ControlLeft', 'ControlRight',
    'MetaLeft', 'MetaRight',
  ];

  if (modifierCodes.includes(event.code)) {
    return {
      updatedState: sessionState,
      feedback: createRejectedFeedback('modifier-only'),
    };
  }

  // Check if session is complete
  if (sessionState.isComplete) {
    return {
      updatedState: sessionState,
      feedback: createRejectedFeedback('session-complete'),
    };
  }

  // Check if session is paused
  if (sessionState.isPaused) {
    return {
      updatedState: sessionState,
      feedback: createRejectedFeedback('session-paused'),
    };
  }

  // Handle Escape key
  if (event.code === 'Escape') {
    return {
      updatedState: sessionState,
      feedback: {
        accepted: true,
        isCorrect: null,
        composedChar: null,
        highlightKey: null,
        requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
        sessionComplete: false,
      },
    };
  }

  // Handle Tab key
  if (event.code === 'Tab') {
    return {
      updatedState: sessionState,
      feedback: {
        accepted: false,
        isCorrect: null,
        composedChar: null,
        highlightKey: null,
        requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
        sessionComplete: false,
      },
    };
  }

  // Debounce rapid keystrokes
  if (event.repeat) {
    return {
      updatedState: sessionState,
      feedback: createRejectedFeedback('debounced'),
    };
  }

  // Empty text edge case
  if (sessionState.characters.length === 0) {
    return {
      updatedState: sessionState,
      feedback: createRejectedFeedback('empty-text'),
    };
  }

  // Get current character
  const currentChar = sessionState.characters[sessionState.currentIndex];
  if (!currentChar) {
    return {
      updatedState: sessionState,
      feedback: createRejectedFeedback('no-current-char'),
    };
  }

  // Validate character
  const isCorrect = validateCharacter(event.key, currentChar.expected);

  // Start session on first keystroke
  let newState = { ...sessionState };
  if (!sessionState.isStarted) {
    newState.isStarted = true;
    newState.startTime = event.timestamp;
  }

  // Update character state
  const updatedCharacters = [...newState.characters];
  updatedCharacters[newState.currentIndex] = {
    ...currentChar,
    actual: event.key,
    state: isCorrect ? 'correct' : 'incorrect',
    timestamp: event.timestamp,
    isCurrent: false,
  };

  // Determine if we should advance position
  const shouldAdvance = isCorrect || newState.mode !== 'strict';

  if (shouldAdvance) {
    newState.currentIndex++;

    // Mark next character as current if exists
    if (newState.currentIndex < updatedCharacters.length) {
      updatedCharacters[newState.currentIndex] = {
        ...updatedCharacters[newState.currentIndex],
        isCurrent: true,
        state: 'current',
      };
    }
  }

  newState.characters = updatedCharacters;

  // Check for session completion
  const isSessionComplete = newState.currentIndex >= newState.characters.length;
  newState.isComplete = isSessionComplete;

  return {
    updatedState: newState,
    feedback: {
      accepted: true,
      isCorrect,
      composedChar: event.key,
      highlightKey: null, // TODO: Implement key highlighting
      requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
      sessionComplete: isSessionComplete,
    },
  };
}

/**
 * Create a rejected feedback object
 */
function createRejectedFeedback(reason: string): UIFeedback {
  return {
    accepted: false,
    isCorrect: null,
    composedChar: null,
    highlightKey: null,
    requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
    sessionComplete: false,
    reason,
  };
}

// =============================================================================
// Position Management
// =============================================================================

/**
 * Advance the current position
 *
 * TODO: Implement position advancement with:
 * - Increment currentIndex
 * - Update isCurrent flags
 * - Update character states
 *
 * @param state - Current session state
 * @returns Updated session state
 */
export function advancePosition(state: SessionState): SessionState {
  // TODO: Implement position advancement
  const newIndex = state.currentIndex + 1;
  const updatedCharacters = state.characters.map((char, index) => ({
    ...char,
    isCurrent: index === newIndex,
    state: index === newIndex ? 'current' as const : char.state,
  }));

  // Mark previous character as no longer current
  if (state.currentIndex < updatedCharacters.length) {
    updatedCharacters[state.currentIndex] = {
      ...updatedCharacters[state.currentIndex],
      isCurrent: false,
    };
  }

  return {
    ...state,
    currentIndex: newIndex,
    characters: updatedCharacters,
  };
}

// =============================================================================
// Backspace Handling
// =============================================================================

/**
 * Process backspace key
 *
 * TODO: Implement backspace handling with:
 * - Check mode allows backspace
 * - Prevent going below index 0
 * - Reset character state
 * - Handle corrected errors
 * - Clear isComplete flag if going back
 *
 * @param state - Current session state
 * @returns Updated state and feedback
 */
export function processBackspace(
  state: SessionState
): { updatedState: SessionState; feedback: UIFeedback } {
  // TODO: Implement full backspace processing

  // Check if backspace is disabled
  if (state.mode === 'no-backspace') {
    return {
      updatedState: state,
      feedback: {
        accepted: false,
        isCorrect: null,
        composedChar: null,
        highlightKey: null,
        requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
        sessionComplete: false,
        reason: 'backspace-disabled',
      },
    };
  }

  // Prevent going below index 0
  if (state.currentIndex === 0) {
    return {
      updatedState: state,
      feedback: {
        accepted: false,
        isCorrect: null,
        composedChar: null,
        highlightKey: null,
        requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
        sessionComplete: false,
        reason: 'at-start',
      },
    };
  }

  const newIndex = state.currentIndex - 1;
  const updatedCharacters = [...state.characters];

  // Reset the character we're going back to
  const prevChar = updatedCharacters[newIndex];
  updatedCharacters[newIndex] = {
    ...prevChar,
    actual: null,
    state: prevChar.state === 'incorrect' ? 'corrected' : 'pending',
    isCurrent: true,
  };

  // Mark current position as pending
  if (state.currentIndex < updatedCharacters.length) {
    updatedCharacters[state.currentIndex] = {
      ...updatedCharacters[state.currentIndex],
      state: 'pending',
      isCurrent: false,
    };
  }

  return {
    updatedState: {
      ...state,
      currentIndex: newIndex,
      characters: updatedCharacters,
      isComplete: false, // Clear completion flag when going back
    },
    feedback: {
      accepted: true,
      isCorrect: null,
      composedChar: null,
      highlightKey: null,
      requiredModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
      sessionComplete: false,
    },
  };
}

// =============================================================================
// Character Validation
// =============================================================================

/**
 * Validate if typed character matches expected
 *
 * TODO: Implement character validation with:
 * - Handle null inputs
 * - Unicode normalization (NFC)
 * - Space variations (regular and NBSP)
 * - Case sensitivity option
 * - Accent strictness option
 *
 * @param typed - Character that was typed
 * @param expected - Character that was expected
 * @returns Whether the characters match
 */
export function validateCharacter(typed: string | null, expected: string | null): boolean {
  // TODO: Implement proper Unicode normalization and comparison

  // Handle null inputs
  if (typed === null || typed === undefined || expected === null || expected === undefined) {
    return false;
  }

  // Normalize both strings to NFC (canonical decomposition followed by canonical composition)
  const normalizedTyped = typed.normalize('NFC');
  const normalizedExpected = expected.normalize('NFC');

  // Direct comparison after normalization
  if (normalizedTyped === normalizedExpected) {
    return true;
  }

  // Handle space variations
  const REGULAR_SPACE = ' ';
  const NBSP = '\u00A0';

  if (
    (normalizedTyped === REGULAR_SPACE && normalizedExpected === NBSP) ||
    (normalizedTyped === NBSP && normalizedExpected === REGULAR_SPACE)
  ) {
    return true;
  }

  return false;
}
