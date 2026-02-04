/**
 * @file keyboard-layout.ts
 * @description LATAM keyboard layout mapping for Teclado LATAM.
 *
 * STUB IMPLEMENTATION - TDD Red Phase
 * All functions throw or return minimal values to make tests run.
 *
 * @see docs/sparc/03-pseudocode-keyboard.md Section 2-4 (Key Mapping and Layout)
 */

import type {
  KeyDefinition,
  KeyboardLayout,
  ModifierState,
  KeyLookupResult,
  CharacterLookupResult,
  DeadKeyType,
  Finger,
} from '../typing-engine/types';

// =============================================================================
// LATAM Keyboard Layout Definition
// =============================================================================

/**
 * Complete LATAM keyboard layout
 *
 * TODO: Implement full layout with all keys, proper widths,
 * finger assignments, and home row markings
 */
export const LATAMKeyboardLayout: KeyboardLayout = {
  name: 'Spanish - Latin America',
  locale: 'es-419',
  rows: [
    // Row 0: Number row
    [
      createKey('Backquote', 0, 0, 1.0, '|', '\u00B0', '\u00AC', null, 'left-pinky'),
      createKey('Digit1', 0, 1, 1.0, '1', '!', '|', null, 'left-pinky'),
      createKey('Digit2', 0, 2, 1.0, '2', '"', '@', null, 'left-ring'),
      createKey('Digit3', 0, 3, 1.0, '3', '#', '#', null, 'left-middle'),
      createKey('Digit4', 0, 4, 1.0, '4', '$', '~', null, 'left-index'),
      createKey('Digit5', 0, 5, 1.0, '5', '%', '\u20AC', null, 'left-index'),
      createKey('Digit6', 0, 6, 1.0, '6', '&', '\u00AC', null, 'right-index'),
      createKey('Digit7', 0, 7, 1.0, '7', '/', '{', null, 'right-index'),
      createKey('Digit8', 0, 8, 1.0, '8', '(', '[', null, 'right-middle'),
      createKey('Digit9', 0, 9, 1.0, '9', ')', ']', null, 'right-ring'),
      createKey('Digit0', 0, 10, 1.0, '0', '=', '}', null, 'right-pinky'),
      createKey('Minus', 0, 11, 1.0, "'", '?', '\\', null, 'right-pinky'),
      createKey('Equal', 0, 12, 1.0, '\u00BF', '\u00A1', null, null, 'right-pinky'),
      createKey('Backspace', 0, 13, 2.0, '', '', null, null, 'right-pinky'),
    ],
    // Row 1: Top letter row (QWERTY)
    [
      createKey('Tab', 1, 0, 1.5, '\t', '\t', null, null, 'left-pinky'),
      createKey('KeyQ', 1, 1, 1.0, 'q', 'Q', '@', null, 'left-pinky'),
      createKey('KeyW', 1, 2, 1.0, 'w', 'W', null, null, 'left-ring'),
      createKey('KeyE', 1, 3, 1.0, 'e', 'E', '\u20AC', null, 'left-middle'),
      createKey('KeyR', 1, 4, 1.0, 'r', 'R', null, null, 'left-index'),
      createKey('KeyT', 1, 5, 1.0, 't', 'T', null, null, 'left-index'),
      createKey('KeyY', 1, 6, 1.0, 'y', 'Y', null, null, 'right-index'),
      createKey('KeyU', 1, 7, 1.0, 'u', 'U', null, null, 'right-index'),
      createKey('KeyI', 1, 8, 1.0, 'i', 'I', null, null, 'right-middle'),
      createKey('KeyO', 1, 9, 1.0, 'o', 'O', null, null, 'right-ring'),
      createKey('KeyP', 1, 10, 1.0, 'p', 'P', null, null, 'right-pinky'),
      createDeadKey('BracketLeft', 1, 11, 1.0, '\u00B4', '\u00A8', '[', null, 'right-pinky', 'acute', 'dieresis'),
      createKey('BracketRight', 1, 12, 1.0, '+', '*', ']', null, 'right-pinky'),
    ],
    // Row 2: Home row (ASDF)
    [
      createKey('CapsLock', 2, 0, 1.75, '', '', null, null, 'left-pinky'),
      createKey('KeyA', 2, 1, 1.0, 'a', 'A', null, null, 'left-pinky', true),
      createKey('KeyS', 2, 2, 1.0, 's', 'S', null, null, 'left-ring', true),
      createKey('KeyD', 2, 3, 1.0, 'd', 'D', null, null, 'left-middle', true),
      createKey('KeyF', 2, 4, 1.0, 'f', 'F', null, null, 'left-index', true),
      createKey('KeyG', 2, 5, 1.0, 'g', 'G', null, null, 'left-index'),
      createKey('KeyH', 2, 6, 1.0, 'h', 'H', null, null, 'right-index'),
      createKey('KeyJ', 2, 7, 1.0, 'j', 'J', null, null, 'right-index', true),
      createKey('KeyK', 2, 8, 1.0, 'k', 'K', null, null, 'right-middle', true),
      createKey('KeyL', 2, 9, 1.0, 'l', 'L', null, null, 'right-ring', true),
      createKey('Semicolon', 2, 10, 1.0, '\u00F1', '\u00D1', null, null, 'right-pinky', true),
      createKey('Quote', 2, 11, 1.0, '{', '[', '^', null, 'right-pinky'),
      createKey('Backslash', 2, 12, 1.0, '}', ']', '`', null, 'right-pinky'),
      createKey('Enter', 2, 13, 2.25, '\n', '\n', null, null, 'right-pinky'),
    ],
    // Row 3: Bottom letter row (ZXCV) - US ANSI layout (no IntlBackslash key)
    [
      createKey('ShiftLeft', 3, 0, 2.25, '', '', null, null, 'left-pinky'),
      createKey('KeyZ', 3, 1, 1.0, 'z', 'Z', null, null, 'left-pinky'),
      createKey('KeyX', 3, 2, 1.0, 'x', 'X', null, null, 'left-ring'),
      createKey('KeyC', 3, 3, 1.0, 'c', 'C', null, null, 'left-middle'),
      createKey('KeyV', 3, 4, 1.0, 'v', 'V', null, null, 'left-index'),
      createKey('KeyB', 3, 5, 1.0, 'b', 'B', null, null, 'left-index'),
      createKey('KeyN', 3, 6, 1.0, 'n', 'N', null, null, 'right-index'),
      createKey('KeyM', 3, 7, 1.0, 'm', 'M', null, null, 'right-index'),
      createKey('Comma', 3, 8, 1.0, ',', ';', null, null, 'right-middle'),
      createKey('Period', 3, 9, 1.0, '.', ':', null, null, 'right-ring'),
      createKey('Slash', 3, 10, 1.0, '-', '_', null, null, 'right-pinky'),
      createKey('ShiftRight', 3, 11, 2.75, '', '', null, null, 'right-pinky'),
    ],
    // Row 4: Space bar row - Simplified for laptop keyboards
    [
      createKey('ControlLeft', 4, 0, 1.5, '', '', null, null, 'left-pinky'),
      createKey('MetaLeft', 4, 1, 1.25, '', '', null, null, 'left-pinky'),
      createKey('AltLeft', 4, 2, 1.25, '', '', null, null, 'left-pinky'),
      createKey('Space', 4, 3, 6.5, ' ', ' ', null, null, 'thumb'),
      createKey('AltRight', 4, 4, 1.25, '', '', null, null, 'right-pinky'),
      createKey('ControlRight', 4, 5, 1.5, '', '', null, null, 'right-pinky'),
    ],
  ],
};

/**
 * Helper to create a regular key definition
 */
function createKey(
  code: string,
  row: number,
  position: number,
  width: number,
  normal: string,
  shift: string,
  altGr: string | null,
  shiftAltGr: string | null,
  finger: Finger,
  isHomeRow: boolean = false
): KeyDefinition {
  return {
    code,
    row,
    position,
    width,
    normal,
    shift,
    altGr,
    shiftAltGr,
    isDeadKey: false,
    deadKeyType: null,
    finger,
    isHomeRow,
  };
}

/**
 * Helper to create a dead key definition
 */
function createDeadKey(
  code: string,
  row: number,
  position: number,
  width: number,
  normal: string,
  shift: string,
  altGr: string | null,
  shiftAltGr: string | null,
  finger: Finger,
  normalDeadKeyType: DeadKeyType,
  shiftDeadKeyType: DeadKeyType,
  isHomeRow: boolean = false
): KeyDefinition {
  return {
    code,
    row,
    position,
    width,
    normal,
    shift,
    altGr,
    shiftAltGr,
    isDeadKey: true, // Note: isDeadKey varies by modifier
    deadKeyType: normalDeadKeyType,
    finger,
    isHomeRow,
  };
}

// =============================================================================
// Key Mapping Functions
// =============================================================================

/**
 * Map a US physical key code to LATAM character
 *
 * TODO: Implement full key mapping with:
 * - All modifier combinations
 * - Dead key detection
 * - Proper fallback handling
 *
 * @param code - Physical key code (e.g., "KeyA")
 * @param modifiers - Current modifier state
 * @returns Key lookup result
 */
export function mapUSKeyToLATAM(
  code: string,
  modifiers: ModifierState
): KeyLookupResult {
  // TODO: Implement proper key lookup with all layers

  if (!code) {
    return { character: null, isDeadKey: false, deadKeyType: null, keyDefinition: null };
  }

  const keyDef = getKeyDefinition(code);
  if (!keyDef) {
    return { character: null, isDeadKey: false, deadKeyType: null, keyDefinition: null };
  }

  // Handle dead key special case for BracketLeft
  if (code === 'BracketLeft') {
    if (modifiers.altGr) {
      // AltGr+BracketLeft produces '[', not a dead key
      return {
        character: '[',
        isDeadKey: false,
        deadKeyType: null,
        keyDefinition: keyDef,
      };
    }
    if (modifiers.shift) {
      // Shift+BracketLeft is dieresis dead key
      return {
        character: '\u00A8',
        isDeadKey: true,
        deadKeyType: 'dieresis',
        keyDefinition: keyDef,
      };
    }
    // BracketLeft alone is acute dead key
    return {
      character: '\u00B4',
      isDeadKey: true,
      deadKeyType: 'acute',
      keyDefinition: keyDef,
    };
  }

  const char = getCharacterForModifiers(keyDef, modifiers);
  return {
    character: char,
    isDeadKey: false,
    deadKeyType: null,
    keyDefinition: keyDef,
  };
}

/**
 * Get the character produced by a key definition with given modifiers
 *
 * @param keyDef - Key definition
 * @param modifiers - Current modifier state
 * @returns Character produced
 */
export function getCharacterForModifiers(
  keyDef: KeyDefinition,
  modifiers: ModifierState
): string | null {
  // TODO: Implement proper modifier priority handling

  // Priority: Shift+AltGr > AltGr > Shift > Normal
  if (modifiers.shift && modifiers.altGr) {
    return keyDef.shiftAltGr ?? keyDef.altGr ?? keyDef.normal;
  }

  if (modifiers.altGr) {
    return keyDef.altGr ?? keyDef.normal;
  }

  if (modifiers.shift) {
    return keyDef.shift ?? keyDef.normal;
  }

  return keyDef.normal;
}

/**
 * Get key definition for a physical key code
 *
 * @param code - Physical key code
 * @returns Key definition or null
 */
export function getKeyDefinition(code: string): KeyDefinition | null {
  // TODO: Implement O(1) lookup with pre-built map

  for (const row of LATAMKeyboardLayout.rows) {
    for (const key of row) {
      if (key.code === code) {
        return key;
      }
    }
  }

  return null;
}

// =============================================================================
// Reverse Lookup (Character to Key)
// =============================================================================

/**
 * Reverse lookup map cache
 */
let reverseLookupCache: Map<string, CharacterLookupResult> | null = null;

/**
 * Find which key and modifiers produce a given character
 *
 * TODO: Implement reverse lookup with:
 * - All direct characters
 * - Dead key compositions
 * - Proper modifier detection
 *
 * @param char - Character to find
 * @returns Lookup result or null if not found
 */
export function findKeyForCharacter(char: string): CharacterLookupResult | null {
  // TODO: Implement full reverse lookup

  // Build cache if not exists
  if (!reverseLookupCache) {
    reverseLookupCache = buildReverseLookupMap(LATAMKeyboardLayout);
  }

  // Check direct lookup
  const result = reverseLookupCache.get(char);
  if (result) {
    return result;
  }

  // Check for composed characters (dead key sequences)
  const composedResult = findComposedCharacter(char);
  if (composedResult) {
    return composedResult;
  }

  return null;
}

/**
 * Find a composed character (via dead key)
 */
function findComposedCharacter(char: string): CharacterLookupResult | null {
  // TODO: Implement dead key composition reverse lookup

  // Acute vowels
  const acuteCompositions: Record<string, string> = {
    '\u00E1': 'a', '\u00C1': 'A',
    '\u00E9': 'e', '\u00C9': 'E',
    '\u00ED': 'i', '\u00CD': 'I',
    '\u00F3': 'o', '\u00D3': 'O',
    '\u00FA': 'u', '\u00DA': 'U',
  };

  if (acuteCompositions[char]) {
    const baseChar = acuteCompositions[char];
    const baseKeyDef = findKeyForCharacter(baseChar);
    const bracketLeftDef = getKeyDefinition('BracketLeft')!;

    return {
      keyDefinition: bracketLeftDef,
      modifiers: { shift: false, altGr: false, ctrl: false, meta: false },
      layer: 'composed',
      deadKeySequence: {
        deadKeyType: 'acute',
        deadKeyModifiers: { shift: false, altGr: false, ctrl: false, meta: false },
        baseChar,
        baseCharModifiers: baseKeyDef?.modifiers ?? { shift: false, altGr: false, ctrl: false, meta: false },
      },
    };
  }

  // Dieresis vowels
  const dieresisCompositions: Record<string, string> = {
    '\u00FC': 'u', '\u00DC': 'U',
    '\u00E4': 'a', '\u00C4': 'A',
    '\u00EB': 'e', '\u00CB': 'E',
    '\u00EF': 'i', '\u00CF': 'I',
    '\u00F6': 'o', '\u00D6': 'O',
  };

  if (dieresisCompositions[char]) {
    const baseChar = dieresisCompositions[char];
    const bracketLeftDef = getKeyDefinition('BracketLeft')!;

    return {
      keyDefinition: bracketLeftDef,
      modifiers: { shift: true, altGr: false, ctrl: false, meta: false },
      layer: 'composed',
      deadKeySequence: {
        deadKeyType: 'dieresis',
        deadKeyModifiers: { shift: true, altGr: false, ctrl: false, meta: false },
        baseChar,
        baseCharModifiers: { shift: baseChar === baseChar.toUpperCase(), altGr: false, ctrl: false, meta: false },
      },
    };
  }

  return null;
}

/**
 * Build reverse lookup map from keyboard layout
 *
 * @param layout - Keyboard layout
 * @returns Map from character to lookup result
 */
export function buildReverseLookupMap(
  layout: KeyboardLayout
): Map<string, CharacterLookupResult> {
  // TODO: Implement full reverse lookup map building

  const map = new Map<string, CharacterLookupResult>();

  for (const row of layout.rows) {
    for (const key of row) {
      // Normal layer
      if (key.normal && key.normal.length === 1) {
        map.set(key.normal, {
          keyDefinition: key,
          modifiers: { shift: false, altGr: false, ctrl: false, meta: false },
          layer: 'normal',
        });
      }

      // Shift layer
      if (key.shift && key.shift.length === 1) {
        map.set(key.shift, {
          keyDefinition: key,
          modifiers: { shift: true, altGr: false, ctrl: false, meta: false },
          layer: 'shift',
        });
      }

      // AltGr layer
      if (key.altGr && key.altGr.length === 1) {
        map.set(key.altGr, {
          keyDefinition: key,
          modifiers: { shift: false, altGr: true, ctrl: false, meta: false },
          layer: 'altGr',
        });
      }

      // Shift+AltGr layer
      if (key.shiftAltGr && key.shiftAltGr.length === 1) {
        map.set(key.shiftAltGr, {
          keyDefinition: key,
          modifiers: { shift: true, altGr: true, ctrl: false, meta: false },
          layer: 'shiftAltGr',
        });
      }
    }
  }

  return map;
}
