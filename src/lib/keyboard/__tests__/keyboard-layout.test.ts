/**
 * @file keyboard-layout.test.ts
 * @description Comprehensive TDD test suite for the LATAM keyboard layout mapping.
 *
 * These tests are written BEFORE implementation (TDD red phase).
 * All tests are expected to FAIL until the keyboard layout is implemented.
 *
 * Tests cover:
 * - US Physical Key to LATAM Character mapping
 * - Modifier layer handling (normal, Shift, AltGr, Shift+AltGr)
 * - Reverse lookup (character to key)
 * - Dead key position identification
 * - Spanish-specific characters
 * - Programming symbols with AltGr
 *
 * @see docs/sparc/03-pseudocode-keyboard.md Section 2-4 (Key Mapping and Layout)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Types to be implemented
import type {
  KeyDefinition,
  KeyboardLayout,
  ModifierState,
  KeyLookupResult,
  CharacterLookupResult,
} from '../types';

import {
  mapUSKeyToLATAM,
  findKeyForCharacter,
  getKeyDefinition,
  buildReverseLookupMap,
  LATAMKeyboardLayout,
  getCharacterForModifiers,
} from '../keyboard-layout';

// =============================================================================
// Test Constants
// =============================================================================

/**
 * Expected LATAM keyboard mappings for validation
 * Based on docs/sparc/03-pseudocode-keyboard.md Section 4.2
 */
const EXPECTED_MAPPINGS = {
  // Number row differences from US layout
  numberRow: {
    Backquote: { normal: '|', shift: '°', altGr: '¬' },
    Digit1: { normal: '1', shift: '!', altGr: '|' },
    Digit2: { normal: '2', shift: '"', altGr: '@' },
    Digit3: { normal: '3', shift: '#', altGr: '#' },
    Digit4: { normal: '4', shift: '$', altGr: '~' },
    Digit5: { normal: '5', shift: '%', altGr: '€' },
    Digit6: { normal: '6', shift: '&', altGr: '¬' },
    Digit7: { normal: '7', shift: '/', altGr: '{' },
    Digit8: { normal: '8', shift: '(', altGr: '[' },
    Digit9: { normal: '9', shift: ')', altGr: ']' },
    Digit0: { normal: '0', shift: '=', altGr: '}' },
    Minus: { normal: "'", shift: '?', altGr: '\\' },
    Equal: { normal: '¿', shift: '¡', altGr: '¿' },
  },

  // Special Spanish characters
  spanish: {
    Semicolon: { normal: '\u00F1', shift: '\u00D1' }, // ñ/Ñ (n with tilde) - direct key
    BracketLeft: { normal: '´', shift: '¨', altGr: '[', isDeadKey: true },
    Equal: { normal: '¿', shift: '¡' }, // Inverted punctuation
  },

  // Programming characters with AltGr
  programming: {
    KeyQ: { altGr: '@' },
    KeyE: { altGr: '€' },
    Quote: { normal: '{', shift: '[', altGr: '^' },
    Backslash: { normal: '}', shift: ']', altGr: '`' },
  },
} as const;

// =============================================================================
// Test Fixtures and Helpers
// =============================================================================

/**
 * Create modifier state
 */
function createModifiers(
  options: Partial<ModifierState> = {}
): ModifierState {
  return {
    shift: options.shift ?? false,
    altGr: options.altGr ?? false,
    ctrl: options.ctrl ?? false,
    meta: options.meta ?? false,
  };
}

// =============================================================================
// LATAMKeyboardLayout Tests
// =============================================================================

describe('LATAMKeyboardLayout', () => {
  describe('key mapping', () => {
    // =========================================================================
    // Spanish-Specific Characters
    // =========================================================================

    it('should map US semicolon to n with tilde', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('Semicolon', modifiers);

      // Assert
      expect(result.character).toBe('\u00F1'); // ñ (n with tilde)
    });

    it('should map Shift+Semicolon to uppercase N with tilde', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('Semicolon', modifiers);

      // Assert
      expect(result.character).toBe('\u00D1'); // Ñ (N with tilde)
    });

    // =========================================================================
    // Number Row with Shift
    // =========================================================================

    it('should map Shift+2 to double quote (")', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('Digit2', modifiers);

      // Assert
      expect(result.character).toBe('"');
    });

    it('should map Shift+7 to forward slash (/)', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('Digit7', modifiers);

      // Assert
      expect(result.character).toBe('/');
    });

    it('should map Shift+0 to equals (=)', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('Digit0', modifiers);

      // Assert
      expect(result.character).toBe('=');
    });

    // =========================================================================
    // AltGr Layer (Programming Characters)
    // =========================================================================

    it('should map AltGr+2 to @', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('Digit2', modifiers);

      // Assert
      expect(result.character).toBe('@');
    });

    it('should map AltGr+q to @', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('KeyQ', modifiers);

      // Assert
      expect(result.character).toBe('@');
    });

    it('should map AltGr+e to Euro symbol (€)', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('KeyE', modifiers);

      // Assert
      expect(result.character).toBe('€');
    });

    it('should map AltGr+7 to open brace ({)', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('Digit7', modifiers);

      // Assert
      expect(result.character).toBe('{');
    });

    it('should map AltGr+8 to open bracket ([)', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('Digit8', modifiers);

      // Assert
      expect(result.character).toBe('[');
    });

    it('should map AltGr+9 to close bracket (])', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('Digit9', modifiers);

      // Assert
      expect(result.character).toBe(']');
    });

    it('should map AltGr+0 to close brace (})', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('Digit0', modifiers);

      // Assert
      expect(result.character).toBe('}');
    });

    // =========================================================================
    // Dead Key Identification
    // =========================================================================

    it('should identify dead key positions', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('BracketLeft', modifiers);

      // Assert
      expect(result.isDeadKey).toBe(true);
      expect(result.deadKeyType).toBe('acute');
    });

    it('should identify Shift+BracketLeft as dieresis dead key', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('BracketLeft', modifiers);

      // Assert
      expect(result.isDeadKey).toBe(true);
      expect(result.deadKeyType).toBe('dieresis');
    });

    it('should NOT identify BracketLeft as dead key with AltGr (produces [)', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const result = mapUSKeyToLATAM('BracketLeft', modifiers);

      // Assert
      expect(result.isDeadKey).toBe(false);
      expect(result.character).toBe('[');
    });

    // =========================================================================
    // Inverted Punctuation
    // =========================================================================

    it('should map Equal key to inverted question mark (¿)', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('Equal', modifiers);

      // Assert
      expect(result.character).toBe('¿');
    });

    it('should map Shift+Equal to inverted exclamation (¡)', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('Equal', modifiers);

      // Assert
      expect(result.character).toBe('¡');
    });

    // =========================================================================
    // Punctuation Differences
    // =========================================================================

    it('should map Minus key to apostrophe (\')', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('Minus', modifiers);

      // Assert
      expect(result.character).toBe("'");
    });

    it('should map Shift+Minus to question mark (?)', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('Minus', modifiers);

      // Assert
      expect(result.character).toBe('?');
    });

    it('should map Quote key to open brace ({)', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('Quote', modifiers);

      // Assert
      expect(result.character).toBe('{');
    });

    it('should map Backslash key to close brace (})', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('Backslash', modifiers);

      // Assert
      expect(result.character).toBe('}');
    });

    // =========================================================================
    // Standard Letter Keys
    // =========================================================================

    it('should map standard letter keys correctly', () => {
      const letterTests = [
        { code: 'KeyA', expected: 'a' },
        { code: 'KeyB', expected: 'b' },
        { code: 'KeyZ', expected: 'z' },
      ];

      for (const { code, expected } of letterTests) {
        // Arrange
        const modifiers = createModifiers();

        // Act
        const result = mapUSKeyToLATAM(code, modifiers);

        // Assert
        expect(result.character).toBe(expected);
      }
    });

    it('should map Shift+letter to uppercase', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const result = mapUSKeyToLATAM('KeyA', modifiers);

      // Assert
      expect(result.character).toBe('A');
    });

    // =========================================================================
    // Edge Cases
    // =========================================================================

    it('should return null for unknown key codes', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('UnknownKey', modifiers);

      // Assert
      expect(result.character).toBeNull();
      expect(result.keyDefinition).toBeNull();
    });

    it('should handle empty code gracefully', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM('', modifiers);

      // Assert
      expect(result.character).toBeNull();
    });

    it('should handle null code gracefully', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const result = mapUSKeyToLATAM(null as any, modifiers);

      // Assert
      expect(result.character).toBeNull();
    });
  });

  // ===========================================================================
  // Character Lookup (Reverse Mapping)
  // ===========================================================================

  describe('character lookup', () => {
    it('should find key for n with tilde character', () => {
      // Act
      const result = findKeyForCharacter('\u00F1'); // ñ (n with tilde)

      // Assert
      expect(result).not.toBeNull();
      expect(result?.keyDefinition.code).toBe('Semicolon');
      expect(result?.modifiers.shift).toBe(false);
      expect(result?.modifiers.altGr).toBe(false);
      expect(result?.layer).toBe('normal');
    });

    it('should find key for uppercase N with tilde', () => {
      // Act
      const result = findKeyForCharacter('\u00D1'); // Ñ (N with tilde)

      // Assert
      expect(result).not.toBeNull();
      expect(result?.keyDefinition.code).toBe('Semicolon');
      expect(result?.modifiers.shift).toBe(true);
      expect(result?.layer).toBe('shift');
    });

    it('should find key and modifiers for a with acute (dead key composition)', () => {
      // Act
      const result = findKeyForCharacter('\u00E1'); // a with acute

      // Assert
      expect(result).not.toBeNull();
      expect(result?.layer).toBe('composed');
      expect(result?.deadKeySequence).toBeDefined();
      expect(result?.deadKeySequence?.deadKeyType).toBe('acute');
      expect(result?.deadKeySequence?.baseChar).toBe('a');
    });

    it('should find key and modifiers for u with dieresis (dead key composition)', () => {
      // Act
      const result = findKeyForCharacter('\u00FC'); // u with dieresis

      // Assert
      expect(result).not.toBeNull();
      expect(result?.layer).toBe('composed');
      expect(result?.deadKeySequence?.deadKeyType).toBe('dieresis');
      expect(result?.deadKeySequence?.baseChar).toBe('u');
    });

    it('should find key for @ symbol (AltGr layer)', () => {
      // Act
      const result = findKeyForCharacter('@');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.modifiers.altGr).toBe(true);
      expect(result?.layer).toBe('altGr');
      // Could be KeyQ or Digit2
      expect(['KeyQ', 'Digit2']).toContain(result?.keyDefinition.code);
    });

    it('should find key for Euro symbol (€)', () => {
      // Act
      const result = findKeyForCharacter('€');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.modifiers.altGr).toBe(true);
      // Could be KeyE or Digit5
      expect(['KeyE', 'Digit5']).toContain(result?.keyDefinition.code);
    });

    it('should find key for inverted question mark (¿)', () => {
      // Act
      const result = findKeyForCharacter('¿');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.keyDefinition.code).toBe('Equal');
      expect(result?.modifiers.shift).toBe(false);
    });

    it('should find key for inverted exclamation (¡)', () => {
      // Act
      const result = findKeyForCharacter('¡');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.keyDefinition.code).toBe('Equal');
      expect(result?.modifiers.shift).toBe(true);
    });

    it('should return null for unmapped characters', () => {
      // Act - character not on LATAM keyboard
      const result = findKeyForCharacter('\u4E00'); // Chinese character

      // Assert
      expect(result).toBeNull();
    });

    it('should handle standard ASCII characters', () => {
      const testChars = ['a', 'A', '1', ' ', '.', ','];

      for (const char of testChars) {
        // Act
        const result = findKeyForCharacter(char);

        // Assert
        expect(result).not.toBeNull();
      }
    });
  });

  // ===========================================================================
  // getKeyDefinition Tests
  // ===========================================================================

  describe('getKeyDefinition', () => {
    it('should return key definition for valid key code', () => {
      // Act
      const keyDef = getKeyDefinition('KeyA');

      // Assert
      expect(keyDef).not.toBeNull();
      expect(keyDef?.code).toBe('KeyA');
      expect(keyDef?.normal).toBe('a');
      expect(keyDef?.shift).toBe('A');
    });

    it('should return key definition with finger assignment', () => {
      // Act
      const keyDef = getKeyDefinition('KeyF');

      // Assert
      expect(keyDef?.finger).toBe('left-index');
      expect(keyDef?.isHomeRow).toBe(true);
    });

    it('should return key definition with row and position', () => {
      // Act
      const keyDef = getKeyDefinition('KeyA');

      // Assert
      expect(keyDef?.row).toBe(2); // Home row
      expect(keyDef?.position).toBeDefined();
    });

    it('should return null for non-existent key', () => {
      // Act
      const keyDef = getKeyDefinition('NonExistentKey');

      // Assert
      expect(keyDef).toBeNull();
    });
  });

  // ===========================================================================
  // getCharacterForModifiers Tests
  // ===========================================================================

  describe('getCharacterForModifiers', () => {
    let keyDef: KeyDefinition;

    beforeEach(() => {
      keyDef = {
        code: 'Digit2',
        row: 0,
        position: 2,
        width: 1.0,
        normal: '2',
        shift: '"',
        altGr: '@',
        shiftAltGr: null,
        isDeadKey: false,
        deadKeyType: null,
        finger: 'left-ring',
        isHomeRow: false,
      };
    });

    it('should return normal character with no modifiers', () => {
      // Arrange
      const modifiers = createModifiers();

      // Act
      const char = getCharacterForModifiers(keyDef, modifiers);

      // Assert
      expect(char).toBe('2');
    });

    it('should return shift character with Shift modifier', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true });

      // Act
      const char = getCharacterForModifiers(keyDef, modifiers);

      // Assert
      expect(char).toBe('"');
    });

    it('should return altGr character with AltGr modifier', () => {
      // Arrange
      const modifiers = createModifiers({ altGr: true });

      // Act
      const char = getCharacterForModifiers(keyDef, modifiers);

      // Assert
      expect(char).toBe('@');
    });

    it('should prioritize Shift+AltGr over AltGr', () => {
      // Arrange
      const keyDefWithShiftAltGr: KeyDefinition = {
        ...keyDef,
        shiftAltGr: 'X',
      };
      const modifiers = createModifiers({ shift: true, altGr: true });

      // Act
      const char = getCharacterForModifiers(keyDefWithShiftAltGr, modifiers);

      // Assert
      expect(char).toBe('X');
    });

    it('should fallback to AltGr if Shift+AltGr is null', () => {
      // Arrange
      const modifiers = createModifiers({ shift: true, altGr: true });

      // Act
      const char = getCharacterForModifiers(keyDef, modifiers);

      // Assert
      expect(char).toBe('@'); // Falls back to altGr
    });

    it('should fallback to normal if altGr is null', () => {
      // Arrange
      const keyDefNoAltGr: KeyDefinition = {
        ...keyDef,
        altGr: null,
      };
      const modifiers = createModifiers({ altGr: true });

      // Act
      const char = getCharacterForModifiers(keyDefNoAltGr, modifiers);

      // Assert
      expect(char).toBe('2'); // Falls back to normal
    });
  });

  // ===========================================================================
  // buildReverseLookupMap Tests
  // ===========================================================================

  describe('buildReverseLookupMap', () => {
    it('should build map with all printable characters', () => {
      // Act
      const map = buildReverseLookupMap(LATAMKeyboardLayout);

      // Assert - check some expected entries
      expect(map.get('a')).toBeDefined();
      expect(map.get('A')).toBeDefined();
      expect(map.get('n')).toBeDefined(); // n with tilde
      expect(map.get('@')).toBeDefined();
    });

    it('should include correct modifier information', () => {
      // Act
      const map = buildReverseLookupMap(LATAMKeyboardLayout);
      const atSign = map.get('@');

      // Assert
      expect(atSign?.modifiers.altGr).toBe(true);
    });

    it('should include correct layer information', () => {
      // Act
      const map = buildReverseLookupMap(LATAMKeyboardLayout);

      // Assert
      expect(map.get('a')?.layer).toBe('normal');
      expect(map.get('A')?.layer).toBe('shift');
      expect(map.get('@')?.layer).toBe('altGr');
    });
  });

  // ===========================================================================
  // Layout Structure Tests
  // ===========================================================================

  describe('layout structure', () => {
    it('should have 5 rows', () => {
      expect(LATAMKeyboardLayout.rows.length).toBe(5);
    });

    it('should have correct locale', () => {
      expect(LATAMKeyboardLayout.locale).toBe('es-419');
    });

    it('should have home row keys marked', () => {
      // Home row is row 2
      const homeRow = LATAMKeyboardLayout.rows[2];

      // A, S, D, F, J, K, L, N should be home row
      const homeRowKeys = homeRow.filter(k => k.isHomeRow);
      expect(homeRowKeys.length).toBeGreaterThan(0);

      // Check specific home row keys
      const aKey = homeRow.find(k => k.code === 'KeyA');
      expect(aKey?.isHomeRow).toBe(true);

      const fKey = homeRow.find(k => k.code === 'KeyF');
      expect(fKey?.isHomeRow).toBe(true);
    });

    it('should have finger assignments for all keys', () => {
      for (const row of LATAMKeyboardLayout.rows) {
        for (const key of row) {
          expect(key.finger).toBeDefined();
          expect([
            'left-pinky', 'left-ring', 'left-middle', 'left-index',
            'right-index', 'right-middle', 'right-ring', 'right-pinky',
            'thumb'
          ]).toContain(key.finger);
        }
      }
    });

    it('should have correct key widths for special keys', () => {
      // Tab should be 1.5 width
      const tabKey = LATAMKeyboardLayout.rows[1].find(k => k.code === 'Tab');
      expect(tabKey?.width).toBe(1.5);

      // Backspace should be 2.0 width
      const backspaceKey = LATAMKeyboardLayout.rows[0].find(k => k.code === 'Backspace');
      expect(backspaceKey?.width).toBe(2.0);

      // Space should be 6.25 width
      const spaceKey = LATAMKeyboardLayout.rows[4].find(k => k.code === 'Space');
      expect(spaceKey?.width).toBe(6.25);
    });
  });

  // ===========================================================================
  // Complete Mapping Verification
  // ===========================================================================

  describe('complete mapping verification', () => {
    it('should map all number row keys correctly', () => {
      const expectedMappings = EXPECTED_MAPPINGS.numberRow;

      for (const [code, expected] of Object.entries(expectedMappings)) {
        // Normal
        if (expected.normal) {
          const result = mapUSKeyToLATAM(code, createModifiers());
          expect(result.character).toBe(expected.normal);
        }

        // Shift
        if (expected.shift) {
          const result = mapUSKeyToLATAM(code, createModifiers({ shift: true }));
          expect(result.character).toBe(expected.shift);
        }

        // AltGr
        if (expected.altGr !== undefined) {
          const result = mapUSKeyToLATAM(code, createModifiers({ altGr: true }));
          expect(result.character).toBe(expected.altGr);
        }
      }
    });

    it('should have all Spanish-specific characters accessible', () => {
      const spanishChars = [
        'n', 'N', // n with tilde (direct)
        '¿', '¡', // Inverted punctuation
      ];

      for (const char of spanishChars) {
        const result = findKeyForCharacter(char);
        expect(result).not.toBeNull();
      }
    });

    it('should have all common programming symbols accessible via AltGr', () => {
      const programmingChars = ['@', '#', '~', '{', '}', '[', ']', '|', '\\', '€'];

      for (const char of programmingChars) {
        const result = findKeyForCharacter(char);
        expect(result).not.toBeNull();
      }
    });
  });

  // ===========================================================================
  // Performance Tests
  // ===========================================================================

  describe('performance', () => {
    it('should perform key lookup in O(1) time', () => {
      // Act
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        mapUSKeyToLATAM('KeyA', createModifiers());
      }
      const end = performance.now();

      // Assert - 10000 lookups should be very fast (under 100ms)
      expect(end - start).toBeLessThan(100);
    });

    it('should perform character reverse lookup efficiently', () => {
      // First build the map
      const map = buildReverseLookupMap(LATAMKeyboardLayout);

      // Act
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        map.get('a');
        map.get('@');
        map.get('n');
      }
      const end = performance.now();

      // Assert - 30000 lookups should be very fast
      expect(end - start).toBeLessThan(50);
    });
  });
});
