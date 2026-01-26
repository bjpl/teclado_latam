/**
 * @file dead-keys.ts
 * @description Dead key state machine for Spanish accent composition.
 *
 * STUB IMPLEMENTATION - TDD Red Phase
 * All functions throw or return minimal values to make tests run.
 *
 * @see docs/sparc/03-pseudocode.md Section 3 (Dead Key State Machine)
 * @see docs/sparc/03-pseudocode-keyboard.md Section 6 (Dead Key State Machine)
 */

import type {
  DeadKeyState,
  DeadKeyType,
  DeadKeyResult,
  ModifierState,
} from './types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Timeout for dead key composition (5 seconds)
 */
export const DEAD_KEY_TIMEOUT = 5000;

/**
 * Dead key status enum
 */
export enum DeadKeyStatus {
  IDLE = 'IDLE',
  AWAITING_BASE = 'AWAITING_BASE',
}

/**
 * Dead key visual representations
 */
const DEAD_KEY_VISUALS: Record<DeadKeyType, string> = {
  acute: '\u00B4',     // Acute accent
  dieresis: '\u00A8', // Dieresis
  grave: '\u0060',     // Grave accent
  circumflex: '\u005E', // Circumflex
  tilde: '\u007E',     // Tilde
};

/**
 * Dead key composition lookup table
 * Maps dead key type -> base character -> composed character
 */
const COMPOSITIONS: Record<DeadKeyType, Record<string, string>> = {
  acute: {
    a: '\u00E1', // a with acute
    e: '\u00E9', // e with acute
    i: '\u00ED', // i with acute
    o: '\u00F3', // o with acute
    u: '\u00FA', // u with acute
    A: '\u00C1', // A with acute
    E: '\u00C9', // E with acute
    I: '\u00CD', // I with acute
    O: '\u00D3', // O with acute
    U: '\u00DA', // U with acute
    ' ': '\u00B4', // Acute accent itself
  },
  dieresis: {
    a: '\u00E4', // a with dieresis
    e: '\u00EB', // e with dieresis
    i: '\u00EF', // i with dieresis
    o: '\u00F6', // o with dieresis
    u: '\u00FC', // u with dieresis
    A: '\u00C4', // A with dieresis
    E: '\u00CB', // E with dieresis
    I: '\u00CF', // I with dieresis
    O: '\u00D6', // O with dieresis
    U: '\u00DC', // U with dieresis
    ' ': '\u00A8', // Dieresis itself
  },
  grave: {
    a: '\u00E0', // a with grave
    e: '\u00E8', // e with grave
    i: '\u00EC', // i with grave
    o: '\u00F2', // o with grave
    u: '\u00F9', // u with grave
    A: '\u00C0', // A with grave
    E: '\u00C8', // E with grave
    I: '\u00CC', // I with grave
    O: '\u00D2', // O with grave
    U: '\u00D9', // U with grave
    ' ': '\u0060', // Grave accent itself
  },
  circumflex: {
    a: '\u00E2', // a with circumflex
    e: '\u00EA', // e with circumflex
    i: '\u00EE', // i with circumflex
    o: '\u00F4', // o with circumflex
    u: '\u00FB', // u with circumflex
    A: '\u00C2', // A with circumflex
    E: '\u00CA', // E with circumflex
    I: '\u00CE', // I with circumflex
    O: '\u00D4', // O with circumflex
    U: '\u00DB', // U with circumflex
    ' ': '\u005E', // Circumflex itself
  },
  tilde: {
    a: '\u00E3', // a with tilde
    n: '\u00F1', // n with tilde
    o: '\u00F5', // o with tilde
    A: '\u00C3', // A with tilde
    N: '\u00D1', // N with tilde
    O: '\u00D5', // O with tilde
    ' ': '\u007E', // Tilde itself
  },
};

// =============================================================================
// Dead Key State Machine
// =============================================================================

/**
 * Handle a key event in the dead key state machine
 *
 * TODO: Implement dead key handling with:
 * - IDLE state: detect dead key press, transition to AWAITING_BASE
 * - AWAITING_BASE state: compose with base char or output both
 * - Timeout handling
 * - Escape/Backspace cancellation
 * - Double dead key press outputs literal
 * - Different dead key in sequence
 *
 * @param code - Physical key code
 * @param char - Character produced
 * @param state - Current dead key state
 * @param isDeadKey - Whether current key is a dead key
 * @param deadKeyType - Type of dead key if applicable
 * @returns Dead key result
 */
export function handleDeadKey(
  code: string,
  char: string,
  state: DeadKeyState,
  isDeadKey: boolean,
  deadKeyType: DeadKeyType | null
): DeadKeyResult {
  // TODO: Implement full dead key state machine

  const currentTime = Date.now();

  // Handle IDLE state
  if (state.status === DeadKeyStatus.IDLE) {
    if (isDeadKey && deadKeyType) {
      // Enter AWAITING_BASE state
      return {
        newState: {
          status: DeadKeyStatus.AWAITING_BASE,
          type: deadKeyType,
          pendingChar: DEAD_KEY_VISUALS[deadKeyType],
          timestamp: currentTime,
        },
        outputChar: null,
        consumed: true,
      };
    }

    // Pass through normal characters
    return {
      newState: state,
      outputChar: char,
      consumed: false,
    };
  }

  // Handle AWAITING_BASE state
  if (state.status === DeadKeyStatus.AWAITING_BASE) {
    const pendingType = state.type!;
    const pendingChar = DEAD_KEY_VISUALS[pendingType];

    // Check for timeout
    if (state.timestamp && (currentTime - state.timestamp > DEAD_KEY_TIMEOUT)) {
      // Timeout: output dead key + new char
      return {
        newState: createIdleState(),
        outputChar: pendingChar + char,
        consumed: true,
      };
    }

    // Handle Escape - cancel dead key
    if (code === 'Escape') {
      return {
        newState: createIdleState(),
        outputChar: null,
        consumed: true,
      };
    }

    // Handle Backspace - cancel dead key
    if (code === 'Backspace') {
      return {
        newState: createIdleState(),
        outputChar: null,
        consumed: true,
        isBackspace: true,
      };
    }

    // Handle Enter - non-composable
    if (code === 'Enter') {
      return {
        newState: createIdleState(),
        outputChar: pendingChar,
        consumed: true,
      };
    }

    // Handle another dead key
    if (isDeadKey && deadKeyType) {
      // Same dead key pressed twice - output literal
      if (deadKeyType === pendingType) {
        return {
          newState: createIdleState(),
          outputChar: pendingChar,
          consumed: true,
        };
      }

      // Different dead key - output pending and start new
      return {
        newState: {
          status: DeadKeyStatus.AWAITING_BASE,
          type: deadKeyType,
          pendingChar: DEAD_KEY_VISUALS[deadKeyType],
          timestamp: currentTime,
        },
        outputChar: pendingChar,
        consumed: true,
      };
    }

    // Check if the OS already composed the character (Windows Spanish keyboard behavior)
    // If the incoming char is already an accented character that would result from our pending dead key,
    // accept it directly instead of trying to compose again
    if (isAlreadyComposedWith(char, pendingType)) {
      return {
        newState: createIdleState(),
        outputChar: char,
        consumed: true,
        wasComposition: true,
      };
    }

    // Try to compose
    const composed = composeWithDeadKey(pendingType, char);
    if (composed) {
      return {
        newState: createIdleState(),
        outputChar: composed,
        consumed: true,
        wasComposition: true,
      };
    }

    // Non-composable character - output both
    return {
      newState: createIdleState(),
      outputChar: pendingChar + char,
      consumed: true,
    };
  }

  // Fallback
  return {
    newState: state,
    outputChar: char,
    consumed: false,
  };
}

/**
 * Create an idle dead key state
 */
function createIdleState(): DeadKeyState {
  return {
    status: DeadKeyStatus.IDLE,
    type: null,
    pendingChar: null,
    timestamp: null,
  };
}

// =============================================================================
// Dead Key Detection
// =============================================================================

/**
 * Check if a key code represents a dead key
 *
 * LATAM Keyboard Layout Dead Keys (from kbdlayout.info/KBDLA):
 * - Scancode 1A (BracketLeft/VK_OEM_1): base = acute (´), shift = dieresis (¨)
 * - Scancode 1B (BracketRight/VK_OEM_PLUS) + AltGr: tilde (~)
 * - Scancode 28 (Quote/VK_OEM_7) + AltGr: circumflex (^)
 * - Scancode 2B (Backslash/VK_OEM_2) + AltGr: grave (`)
 *
 * Detection priority:
 * 1. Physical key position + modifiers (most reliable for LATAM)
 * 2. Browser's key value ("Dead" signal)
 * 3. Accent character values (´, ¨, `, ^, ~)
 *
 * @param code - Physical key code (e.g., "BracketLeft")
 * @param modifiers - Current modifier state
 * @param key - The key value from the browser
 * @returns Whether this is a dead key and its type
 */
export function isDeadKeyCode(
  code: string,
  modifiers: ModifierState,
  key?: string
): { isDeadKey: boolean; deadKeyType: DeadKeyType | null } {
  // ==========================================================================
  // LATAM PHYSICAL KEY POSITIONS (Primary detection)
  // Based on kbdlayout.info/KBDLA scancodes and virtual keys
  // ==========================================================================

  // Scancode 1A (BracketLeft / VK_OEM_1): acute and dieresis
  if (code === 'BracketLeft') {
    // AltGr+BracketLeft produces '[' on LATAM - NOT a dead key
    if (modifiers.altGr) {
      return { isDeadKey: false, deadKeyType: null };
    }

    // Shift+BracketLeft = dieresis (¨)
    if (modifiers.shift) {
      return { isDeadKey: true, deadKeyType: 'dieresis' };
    }

    // BracketLeft alone = acute (´)
    return { isDeadKey: true, deadKeyType: 'acute' };
  }

  // Scancode 1B (BracketRight / VK_OEM_PLUS) + AltGr: tilde (~)
  if (code === 'BracketRight' && modifiers.altGr) {
    return { isDeadKey: true, deadKeyType: 'tilde' };
  }

  // Scancode 28 (Quote / VK_OEM_7) + AltGr: circumflex (^)
  if (code === 'Quote' && modifiers.altGr) {
    return { isDeadKey: true, deadKeyType: 'circumflex' };
  }

  // Scancode 2B (Backslash / VK_OEM_2) + AltGr: grave (`)
  if (code === 'Backslash' && modifiers.altGr) {
    return { isDeadKey: true, deadKeyType: 'grave' };
  }

  // ==========================================================================
  // BROWSER "Dead" KEY SIGNAL
  // Trust the browser when it explicitly signals a dead key
  // ==========================================================================

  if (key === 'Dead') {
    // Infer type from physical position for LATAM layout
    // Only recognize known dead key positions - do NOT default to treating
    // unknown positions as dead keys, as this causes issues with keys like
    // Shift+2 (quotation mark) which may incorrectly report 'Dead' on some systems
    if (code === 'BracketLeft') {
      if (modifiers.shift) {
        return { isDeadKey: true, deadKeyType: 'dieresis' };
      }
      return { isDeadKey: true, deadKeyType: 'acute' };
    }

    if (code === 'BracketRight' && modifiers.altGr) {
      return { isDeadKey: true, deadKeyType: 'tilde' };
    }

    if (code === 'Quote' && modifiers.altGr) {
      return { isDeadKey: true, deadKeyType: 'circumflex' };
    }

    if (code === 'Backslash' && modifiers.altGr) {
      return { isDeadKey: true, deadKeyType: 'grave' };
    }

    // Unknown dead key position - do NOT treat as dead key
    // This prevents keys like Shift+2 from being incorrectly treated as dead keys
    // when the browser erroneously reports key='Dead'
    return { isDeadKey: false, deadKeyType: null };
  }

  // ==========================================================================
  // ACCENT CHARACTER VALUES
  // Some browsers/OS report the accent character directly
  // ==========================================================================

  if (key === '\u00B4' || key === '´') {
    return { isDeadKey: true, deadKeyType: 'acute' };
  }
  if (key === '\u00A8' || key === '¨') {
    return { isDeadKey: true, deadKeyType: 'dieresis' };
  }
  if (key === '`' || key === '\u0060') {
    return { isDeadKey: true, deadKeyType: 'grave' };
  }
  if (key === '^' || key === '\u005E') {
    return { isDeadKey: true, deadKeyType: 'circumflex' };
  }
  if (key === '~' || key === '\u007E') {
    return { isDeadKey: true, deadKeyType: 'tilde' };
  }

  // Not a dead key
  return { isDeadKey: false, deadKeyType: null };
}

// =============================================================================
// Composition
// =============================================================================

/**
 * Reverse lookup: check if a character is a composed form of a given dead key type
 * This handles the case where the OS has already composed the character
 * (e.g., Windows Spanish keyboard produces 'á' directly)
 *
 * @param char - Character to check
 * @param deadKeyType - Dead key type to check against
 * @returns True if char is a composed form of the dead key type
 */
function isAlreadyComposedWith(char: string, deadKeyType: DeadKeyType): boolean {
  const typeCompositions = COMPOSITIONS[deadKeyType];
  if (!typeCompositions) {
    return false;
  }

  // Check if this char is in the composition output values
  return Object.values(typeCompositions).includes(char);
}

/**
 * Compose a dead key with a base character
 *
 * TODO: Implement composition lookup with all valid combinations
 *
 * @param deadKeyType - Type of dead key
 * @param baseChar - Base character to compose with
 * @returns Composed character or null if not composable
 */
export function composeWithDeadKey(
  deadKeyType: DeadKeyType,
  baseChar: string
): string | null {
  // TODO: Implement full composition table lookup

  const typeCompositions = COMPOSITIONS[deadKeyType];
  if (!typeCompositions) {
    return null;
  }

  return typeCompositions[baseChar] ?? null;
}

// =============================================================================
// Visual Representation
// =============================================================================

/**
 * Get the visual representation of a dead key type
 *
 * @param type - Dead key type
 * @returns Visual character for the dead key
 */
export function getDeadKeyVisual(type: DeadKeyType): string {
  return DEAD_KEY_VISUALS[type] ?? '';
}
