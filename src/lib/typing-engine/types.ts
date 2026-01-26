/**
 * @file types.ts
 * @description Type definitions for the Teclado LATAM typing engine.
 *
 * These types are based on the pseudocode specifications in:
 * - docs/sparc/03-pseudocode.md
 * - docs/sparc/03-pseudocode-keyboard.md
 */

// =============================================================================
// Session State Types
// =============================================================================

/**
 * Typing mode determines how errors are handled
 */
export type TypingMode = 'strict' | 'lenient' | 'no-backspace';

/**
 * State of a single character in the typing session
 */
export type CharacterState = 'pending' | 'current' | 'correct' | 'incorrect' | 'corrected';

/**
 * Result for a single character being tracked
 */
export interface CharacterResult {
  /** Index in the text */
  index: number;
  /** Expected character */
  expected: string;
  /** Actual character typed (null if not yet typed) */
  actual: string | null;
  /** Current state of this character */
  state: CharacterState;
  /** Timestamp when typed (null if not yet typed) */
  timestamp: number | null;
  /** Whether this is the current position */
  isCurrent: boolean;
}

/**
 * Session settings
 */
export interface SessionSettings {
  /** Typing mode (strict, lenient, no-backspace) */
  mode: TypingMode;
  /** Whether case must match */
  caseSensitive: boolean;
  /** Whether accents must match exactly */
  strictAccents: boolean;
  /** Whether Ctrl+Backspace deletes words */
  allowWordDeletion: boolean;
}

/**
 * Complete session state
 */
export interface SessionState {
  /** Original text to type */
  text: string;
  /** Array of character results */
  characters: CharacterResult[];
  /** Current typing position */
  currentIndex: number;
  /** Typing mode */
  mode: TypingMode;
  /** Whether session has started (first keystroke) */
  isStarted: boolean;
  /** Whether session is paused */
  isPaused: boolean;
  /** Whether session is complete */
  isComplete: boolean;
  /** Timestamp when session started */
  startTime: number | null;
  /** Timestamp when session ended (for freezing metrics) */
  endTime: number | null;
  /** Timestamp when paused */
  pauseTime: number | null;
  /** Total time spent paused (ms) */
  totalPausedTime: number;
  /** Session settings */
  settings: SessionSettings;
}

// =============================================================================
// Keyboard Event Types
// =============================================================================

/**
 * Keyboard event data (normalized from browser event)
 */
export interface KeyboardEvent {
  /** Physical key code (e.g., "KeyA", "Digit1") */
  code: string;
  /** Character produced */
  key: string;
  /** Shift key pressed */
  shiftKey: boolean;
  /** Alt key pressed */
  altKey: boolean;
  /** Control key pressed */
  ctrlKey: boolean;
  /** Meta/Windows key pressed */
  metaKey: boolean;
  /** High-precision timestamp */
  timestamp: number;
  /** Whether this is a key repeat */
  repeat?: boolean;
}

/**
 * Modifier key state
 */
export interface ModifierState {
  /** Shift key pressed */
  shift: boolean;
  /** AltGr (Right Alt) pressed */
  altGr: boolean;
  /** Control key pressed (without AltGr) */
  ctrl: boolean;
  /** Meta/Windows key pressed */
  meta: boolean;
}

// =============================================================================
// UI Feedback Types
// =============================================================================

/**
 * Feedback returned after processing a keystroke
 */
export interface UIFeedback {
  /** Whether the keystroke was accepted for processing */
  accepted: boolean;
  /** Whether the character was correct (null if dead key pending) */
  isCorrect: boolean | null;
  /** Composed character if any */
  composedChar: string | null;
  /** Key to highlight for next character */
  highlightKey: KeyDefinition | null;
  /** Required modifiers for next character */
  requiredModifiers: ModifierState;
  /** Whether session is now complete */
  sessionComplete: boolean;
  /** Reason if not accepted */
  reason?: string;
  /** Whether dead key is pending */
  deadKeyPending?: boolean;
}

// =============================================================================
// Session Lifecycle Types
// =============================================================================

/**
 * Session action types
 */
export interface SessionAction {
  type:
    | 'LOAD_TEXT'
    | 'START'
    | 'KEYSTROKE'
    | 'BACKSPACE'
    | 'PAUSE'
    | 'RESUME'
    | 'RESET'
    | 'COMPLETE'
    | 'BLUR'
    | 'FOCUS';
  payload: any;
}

/**
 * Side effects from session state changes
 */
export interface SideEffect {
  type:
    | 'START_TIMER'
    | 'PAUSE_TIMER'
    | 'RESUME_TIMER'
    | 'CALCULATE_FINAL_METRICS'
    | 'SAVE_SESSION'
    | 'AUTO_SAVE'
    | 'CLEAR_METRICS'
    | 'CLEAR_AUTO_SAVE';
  data?: any;
}

// =============================================================================
// Dead Key Types
// =============================================================================

/**
 * Dead key types supported
 */
export type DeadKeyType = 'acute' | 'dieresis' | 'grave' | 'circumflex' | 'tilde';

/**
 * Dead key state machine states
 */
export type DeadKeyStatus = 'IDLE' | 'AWAITING_BASE';

/**
 * Dead key state
 */
export interface DeadKeyState {
  /** Current state */
  status: DeadKeyStatus;
  /** Type of pending dead key */
  type: DeadKeyType | null;
  /** Visual representation of pending dead key */
  pendingChar: string | null;
  /** Timestamp when dead key was pressed */
  timestamp: number | null;
}

/**
 * Result from dead key processing
 */
export interface DeadKeyResult {
  /** New dead key state */
  newState: DeadKeyState;
  /** Character to output (null if still waiting) */
  outputChar: string | null;
  /** Whether event was consumed */
  consumed: boolean;
  /** Whether composition was successful */
  wasComposition?: boolean;
  /** Whether backspace was requested */
  isBackspace?: boolean;
}

// =============================================================================
// Keyboard Layout Types
// =============================================================================

/**
 * Finger used for touch typing
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

/**
 * Complete definition of a keyboard key
 */
export interface KeyDefinition {
  /** Physical key code */
  code: string;
  /** Row index (0-4) */
  row: number;
  /** Position in row */
  position: number;
  /** Key width in standard units */
  width: number;
  /** Character with no modifiers */
  normal: string;
  /** Character with Shift */
  shift: string;
  /** Character with AltGr (null if none) */
  altGr: string | null;
  /** Character with Shift+AltGr (null if none) */
  shiftAltGr: string | null;
  /** Whether this is a dead key */
  isDeadKey: boolean;
  /** Dead key type if applicable */
  deadKeyType: DeadKeyType | null;
  /** Recommended finger for touch typing */
  finger: Finger;
  /** Whether this is a home row key */
  isHomeRow: boolean;
}

/**
 * Complete keyboard layout
 */
export interface KeyboardLayout {
  /** Human-readable layout name */
  name: string;
  /** Locale code */
  locale: string;
  /** Keys organized by row */
  rows: KeyDefinition[][];
}

/**
 * Result from mapping a key
 */
export interface KeyLookupResult {
  /** Character produced */
  character: string | null;
  /** Whether this is a dead key */
  isDeadKey: boolean;
  /** Dead key type if applicable */
  deadKeyType: DeadKeyType | null;
  /** Full key definition */
  keyDefinition: KeyDefinition | null;
}

/**
 * Result from finding a key for a character
 */
export interface CharacterLookupResult {
  /** Key definition */
  keyDefinition: KeyDefinition;
  /** Required modifiers */
  modifiers: ModifierState;
  /** Layer (normal, shift, altGr, shiftAltGr, composed) */
  layer: string;
  /** Dead key sequence for composed characters */
  deadKeySequence?: {
    deadKeyType: DeadKeyType;
    deadKeyModifiers: ModifierState;
    baseChar: string;
    baseCharModifiers: ModifierState;
  };
}
