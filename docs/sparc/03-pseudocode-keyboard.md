# SPARC Pseudocode: Keyboard Mapping and Event Handling

**Project:** Teclado LATAM - LATAM Spanish Keyboard Typing Practice Application
**Version:** 1.0.0
**Status:** Pseudocode Phase
**Created:** 2026-01-23
**Author:** Strategic Planning Agent

---

## Table of Contents

1. [Overview](#1-overview)
2. [Algorithm 1: US Physical Key to LATAM Character Mapping](#2-algorithm-1-us-physical-key-to-latam-character-mapping)
3. [Algorithm 2: Key Event Interceptor](#3-algorithm-2-key-event-interceptor)
4. [Data Structure: Complete LATAM Keyboard Layout](#4-data-structure-complete-latam-keyboard-layout)
5. [Algorithm 3: Character Validation](#5-algorithm-3-character-validation)
6. [Algorithm 4: Dead Key State Machine](#6-algorithm-4-dead-key-state-machine)
7. [Algorithm 5: Modifier Key Tracking](#7-algorithm-5-modifier-key-tracking)
8. [Integration: Complete Keystroke Processing Pipeline](#8-integration-complete-keystroke-processing-pipeline)

---

## 1. Overview

This document defines the core algorithms and data structures for the Teclado LATAM keyboard mapping and event handling system. The system must:

- Map US physical keyboard codes to LATAM Spanish characters
- Handle three modifier layers: normal, Shift, and AltGr
- Process dead keys for accent composition
- Validate typed characters against expected text
- Maintain sub-16ms response time for 60fps performance

### Design Principles

```
PRINCIPLE 1: Immutability
  - All state transitions produce new state objects
  - Original state never mutated
  - Enables predictable React rendering

PRINCIPLE 2: Pure Functions
  - Mapping functions have no side effects
  - Same inputs always produce same outputs
  - Facilitates testing and debugging

PRINCIPLE 3: Early Exit
  - Check failure conditions first
  - Return immediately when possible
  - Minimize unnecessary computation

PRINCIPLE 4: Lookup Tables
  - Prefer O(1) hash map lookups over O(n) searches
  - Pre-compute mappings at initialization
  - Cache frequently accessed data
```

---

## 2. Algorithm 1: US Physical Key to LATAM Character Mapping

### 2.1 Algorithm Specification

```
================================================================================
ALGORITHM: MapUSKeyToLATAM
================================================================================
PURPOSE:
  Convert a physical US keyboard key press to the corresponding LATAM Spanish
  character based on the current modifier state.

INPUT:
  - code: String       // Physical key code (e.g., "KeyQ", "Digit1", "Semicolon")
  - modifiers: Object  // Current modifier state
    - shift: Boolean   // Is Shift key pressed?
    - altGr: Boolean   // Is AltGr (Right Alt) key pressed?
    - ctrl: Boolean    // Is Control key pressed?
    - meta: Boolean    // Is Meta/Windows key pressed?

OUTPUT:
  - result: Object
    - character: String | null    // The produced character, or null if none
    - isDeadKey: Boolean          // Whether this is a dead key press
    - deadKeyType: String | null  // Type of dead key ('acute', 'dieresis', etc.)
    - keyDefinition: Object       // Full key definition for UI rendering

PRECONDITIONS:
  - KeyboardLayout data structure is initialized
  - Code-to-KeyDefinition lookup map is built

POSTCONDITIONS:
  - Returns consistent character for same inputs
  - Returns null character for non-character keys
================================================================================

ALGORITHM MapUSKeyToLATAM(code, modifiers):

    // STEP 1: Validate input and lookup key definition
    IF code IS empty OR code IS null THEN
        RETURN { character: null, isDeadKey: false, deadKeyType: null, keyDefinition: null }
    END IF

    keyDef <- LookupKeyDefinition(code)

    IF keyDef IS null THEN
        // Unknown key code - may be a function key or special key
        RETURN { character: null, isDeadKey: false, deadKeyType: null, keyDefinition: null }
    END IF

    // STEP 2: Determine character based on modifier state
    // Priority order: Shift+AltGr > AltGr > Shift > Normal

    character <- null

    IF modifiers.altGr AND modifiers.shift THEN
        // Fourth layer: Shift + AltGr combination
        character <- keyDef.shiftAltGr
        IF character IS null THEN
            // Fallback to AltGr only if Shift+AltGr not defined
            character <- keyDef.altGr
        END IF
    ELSE IF modifiers.altGr THEN
        // Third layer: AltGr pressed
        character <- keyDef.altGr
        IF character IS null THEN
            // Fallback to normal if AltGr not defined for this key
            character <- keyDef.normal
        END IF
    ELSE IF modifiers.shift THEN
        // Second layer: Shift pressed
        character <- keyDef.shift
    ELSE
        // First layer: No modifiers
        character <- keyDef.normal
    END IF

    // STEP 3: Check for dead key
    isDeadKey <- keyDef.isDeadKey AND NOT modifiers.altGr  // AltGr may bypass dead key

    // For BracketLeft key: normal press is acute dead key, Shift is dieresis
    IF code = "BracketLeft" THEN
        IF modifiers.shift THEN
            deadKeyType <- "dieresis"
        ELSE IF NOT modifiers.altGr THEN
            deadKeyType <- "acute"
        ELSE
            deadKeyType <- null
            isDeadKey <- false
        END IF
    ELSE
        deadKeyType <- keyDef.deadKeyType
    END IF

    // STEP 4: Return complete result
    RETURN {
        character: character,
        isDeadKey: isDeadKey,
        deadKeyType: deadKeyType,
        keyDefinition: keyDef
    }

END ALGORITHM


HELPER FUNCTION LookupKeyDefinition(code):
    // O(1) lookup from pre-built hash map
    RETURN keyCodeMap.get(code) OR null
END FUNCTION
```

### 2.2 Character Mapping Table

```
================================================================================
TABLE: LATAM_CHARACTER_MAP
================================================================================
Purpose: Define character output for each key across all modifier layers

Format per entry:
  code -> { normal, shift, altGr, shiftAltGr }

--------------------------------------------------------------------------------
NUMBER ROW (Row 0):
--------------------------------------------------------------------------------
"Backquote"      -> { "|", "°", "¬", null }
"Digit1"         -> { "1", "!", "|", null }
"Digit2"         -> { "2", "\"", "@", null }
"Digit3"         -> { "3", "#", "#", null }
"Digit4"         -> { "4", "$", "~", null }
"Digit5"         -> { "5", "%", "€", null }
"Digit6"         -> { "6", "&", "¬", null }
"Digit7"         -> { "7", "/", "{", null }
"Digit8"         -> { "8", "(", "[", null }
"Digit9"         -> { "9", ")", "]", null }
"Digit0"         -> { "0", "=", "}", null }
"Minus"          -> { "'", "?", "\\", null }
"Equal"          -> { "¿", "¡", null, null }

--------------------------------------------------------------------------------
TOP LETTER ROW (Row 1 - QWERTY):
--------------------------------------------------------------------------------
"KeyQ"           -> { "q", "Q", "@", null }
"KeyW"           -> { "w", "W", null, null }
"KeyE"           -> { "e", "E", "€", null }
"KeyR"           -> { "r", "R", null, null }
"KeyT"           -> { "t", "T", null, null }
"KeyY"           -> { "y", "Y", null, null }
"KeyU"           -> { "u", "U", null, null }
"KeyI"           -> { "i", "I", null, null }
"KeyO"           -> { "o", "O", null, null }
"KeyP"           -> { "p", "P", null, null }
"BracketLeft"    -> { "´", "¨", "[", null }    // DEAD KEY: acute / dieresis
"BracketRight"   -> { "+", "*", "]", null }

--------------------------------------------------------------------------------
HOME ROW (Row 2 - ASDF):
--------------------------------------------------------------------------------
"KeyA"           -> { "a", "A", null, null }
"KeyS"           -> { "s", "S", null, null }
"KeyD"           -> { "d", "D", null, null }
"KeyF"           -> { "f", "F", null, null }
"KeyG"           -> { "g", "G", null, null }
"KeyH"           -> { "h", "H", null, null }
"KeyJ"           -> { "j", "J", null, null }
"KeyK"           -> { "k", "K", null, null }
"KeyL"           -> { "l", "L", null, null }
"Semicolon"      -> { "ñ", "Ñ", null, null }    // DIRECT N-TILDE
"Quote"          -> { "{", "[", "^", null }
"Backslash"      -> { "}", "]", "`", null }

--------------------------------------------------------------------------------
BOTTOM LETTER ROW (Row 3 - ZXCV):
--------------------------------------------------------------------------------
"IntlBackslash"  -> { "<", ">", "|", null }
"KeyZ"           -> { "z", "Z", null, null }
"KeyX"           -> { "x", "X", null, null }
"KeyC"           -> { "c", "C", null, null }
"KeyV"           -> { "v", "V", null, null }
"KeyB"           -> { "b", "B", null, null }
"KeyN"           -> { "n", "N", null, null }
"KeyM"           -> { "m", "M", null, null }
"Comma"          -> { ",", ";", null, null }
"Period"         -> { ".", ":", null, null }
"Slash"          -> { "-", "_", null, null }

--------------------------------------------------------------------------------
SPACE BAR ROW (Row 4):
--------------------------------------------------------------------------------
"Space"          -> { " ", " ", null, null }

--------------------------------------------------------------------------------
SPECIAL CHARACTERS SUMMARY:
--------------------------------------------------------------------------------
ñ/Ñ        : Semicolon key (direct, no dead key needed)
Acute (´)  : BracketLeft (dead key for á, é, í, ó, ú)
Dieresis(¨): Shift + BracketLeft (dead key for ü)
¿          : Equal key (normal)
¡          : Shift + Equal key
@          : AltGr + Q or AltGr + Digit2
€          : AltGr + E or AltGr + Digit5
```

### 2.3 Reverse Lookup Algorithm

```
================================================================================
ALGORITHM: FindKeyForCharacter
================================================================================
PURPOSE:
  Given a target character, find which key and modifiers are needed to produce it.
  Used for keyboard highlighting to show user which key to press next.

INPUT:
  - targetChar: String  // The character user needs to type

OUTPUT:
  - result: Object | null
    - keyDefinition: Object   // Key that produces this character
    - modifiers: Object       // Required modifier state
      - shift: Boolean
      - altGr: Boolean
    - layer: String           // "normal", "shift", "altGr", "shiftAltGr"

COMPLEXITY: O(1) average case with reverse lookup map
================================================================================

ALGORITHM FindKeyForCharacter(targetChar):

    // STEP 1: Check pre-built reverse lookup map (O(1))
    IF reverseLookupMap.has(targetChar) THEN
        RETURN reverseLookupMap.get(targetChar)
    END IF

    // STEP 2: Handle composed characters (accented vowels from dead keys)
    IF targetChar IN COMPOSED_CHARACTERS THEN
        decomposition <- GetDeadKeyDecomposition(targetChar)
        RETURN {
            keyDefinition: null,  // Requires dead key sequence
            modifiers: decomposition.modifiers,
            layer: "composed",
            deadKeySequence: decomposition.sequence
        }
    END IF

    // STEP 3: Character not found in layout
    RETURN null

END ALGORITHM


HELPER FUNCTION BuildReverseLookupMap(layout):
    map <- new HashMap()

    FOR EACH row IN layout.rows DO
        FOR EACH keyDef IN row DO
            // Skip non-character keys
            IF keyDef.normal IS printable character THEN
                map.set(keyDef.normal, {
                    keyDefinition: keyDef,
                    modifiers: { shift: false, altGr: false },
                    layer: "normal"
                })
            END IF

            IF keyDef.shift IS printable character THEN
                map.set(keyDef.shift, {
                    keyDefinition: keyDef,
                    modifiers: { shift: true, altGr: false },
                    layer: "shift"
                })
            END IF

            IF keyDef.altGr IS printable character THEN
                map.set(keyDef.altGr, {
                    keyDefinition: keyDef,
                    modifiers: { shift: false, altGr: true },
                    layer: "altGr"
                })
            END IF

            IF keyDef.shiftAltGr IS printable character THEN
                map.set(keyDef.shiftAltGr, {
                    keyDefinition: keyDef,
                    modifiers: { shift: true, altGr: true },
                    layer: "shiftAltGr"
                })
            END IF
        END FOR
    END FOR

    RETURN map
END FUNCTION


// Mapping of composed characters to their dead key sequences
COMPOSED_CHARACTERS <- {
    "á": { deadKey: "acute", baseChar: "a", modifiers: { shift: false } },
    "é": { deadKey: "acute", baseChar: "e", modifiers: { shift: false } },
    "í": { deadKey: "acute", baseChar: "i", modifiers: { shift: false } },
    "ó": { deadKey: "acute", baseChar: "o", modifiers: { shift: false } },
    "ú": { deadKey: "acute", baseChar: "u", modifiers: { shift: false } },
    "Á": { deadKey: "acute", baseChar: "A", modifiers: { shift: true } },
    "É": { deadKey: "acute", baseChar: "E", modifiers: { shift: true } },
    "Í": { deadKey: "acute", baseChar: "I", modifiers: { shift: true } },
    "Ó": { deadKey: "acute", baseChar: "O", modifiers: { shift: true } },
    "Ú": { deadKey: "acute", baseChar: "U", modifiers: { shift: true } },
    "ü": { deadKey: "dieresis", baseChar: "u", modifiers: { shift: false } },
    "Ü": { deadKey: "dieresis", baseChar: "U", modifiers: { shift: true } },
    // Additional dieresis vowels (less common in Spanish)
    "ä": { deadKey: "dieresis", baseChar: "a", modifiers: { shift: false } },
    "ë": { deadKey: "dieresis", baseChar: "e", modifiers: { shift: false } },
    "ï": { deadKey: "dieresis", baseChar: "i", modifiers: { shift: false } },
    "ö": { deadKey: "dieresis", baseChar: "o", modifiers: { shift: false } }
}
```

---

## 3. Algorithm 2: Key Event Interceptor

### 3.1 Event Capture and Normalization

```
================================================================================
ALGORITHM: InterceptKeyEvent
================================================================================
PURPOSE:
  Capture browser keyboard events, prevent default behavior where appropriate,
  normalize data across browsers, and extract relevant information for processing.

INPUT:
  - event: KeyboardEvent  // Browser keyboard event object

OUTPUT:
  - result: Object
    - accepted: Boolean        // Whether event was accepted for processing
    - code: String             // Normalized physical key code
    - key: String              // Reported key character
    - modifiers: Object        // Modifier key state
    - isSpecialKey: Boolean    // Is this a control/navigation key?
    - specialKeyType: String   // Type of special key if applicable
    - timestamp: Number        // High-precision timestamp

SIDE EFFECTS:
  - May call event.preventDefault()
  - May call event.stopPropagation()
================================================================================

ALGORITHM InterceptKeyEvent(event):

    // STEP 1: Extract and normalize key information
    code <- NormalizeKeyCode(event.code)
    key <- event.key
    timestamp <- performance.now()  // High-precision timestamp

    // STEP 2: Extract modifier state with browser normalization
    modifiers <- {
        shift: event.shiftKey,
        altGr: DetectAltGr(event),
        ctrl: event.ctrlKey AND NOT DetectAltGr(event),
        meta: event.metaKey
    }

    // STEP 3: Identify special keys
    specialKeyType <- ClassifySpecialKey(code, key)
    isSpecialKey <- specialKeyType IS NOT null

    // STEP 4: Determine if we should intercept this event
    shouldIntercept <- ShouldInterceptEvent(code, modifiers, specialKeyType)

    IF NOT shouldIntercept THEN
        // Allow browser default behavior (e.g., Ctrl+C for copy)
        RETURN {
            accepted: false,
            code: code,
            key: key,
            modifiers: modifiers,
            isSpecialKey: isSpecialKey,
            specialKeyType: specialKeyType,
            timestamp: timestamp
        }
    END IF

    // STEP 5: Prevent default browser behavior for typing
    event.preventDefault()

    // STEP 6: Stop propagation if in typing mode
    IF isInTypingMode THEN
        event.stopPropagation()
    END IF

    // STEP 7: Return processed event data
    RETURN {
        accepted: true,
        code: code,
        key: key,
        modifiers: modifiers,
        isSpecialKey: isSpecialKey,
        specialKeyType: specialKeyType,
        timestamp: timestamp
    }

END ALGORITHM
```

### 3.2 Helper Functions

```
================================================================================
HELPER FUNCTIONS for Key Event Processing
================================================================================

FUNCTION NormalizeKeyCode(code):
    // Handle browser variations in key codes

    // Some browsers report 'IntlRo' instead of 'IntlBackslash'
    IF code = "IntlRo" THEN
        RETURN "IntlBackslash"
    END IF

    // Handle numpad keys if needed
    IF code.startsWith("Numpad") THEN
        // Map numpad to regular number keys for typing practice
        numpadMap <- {
            "Numpad0": "Digit0", "Numpad1": "Digit1", "Numpad2": "Digit2",
            "Numpad3": "Digit3", "Numpad4": "Digit4", "Numpad5": "Digit5",
            "Numpad6": "Digit6", "Numpad7": "Digit7", "Numpad8": "Digit8",
            "Numpad9": "Digit9", "NumpadDecimal": "Period",
            "NumpadAdd": "Equal", "NumpadSubtract": "Minus",
            "NumpadMultiply": "Digit8", "NumpadDivide": "Slash"
        }
        RETURN numpadMap.get(code) OR code
    END IF

    RETURN code
END FUNCTION


FUNCTION DetectAltGr(event):
    // AltGr detection varies by browser and OS

    // Method 1: Check for Right Alt specifically
    IF event.code = "AltRight" THEN
        RETURN true
    END IF

    // Method 2: On Windows, AltGr sends Ctrl+Alt together
    IF event.altKey AND event.ctrlKey THEN
        // But we need to distinguish from actual Ctrl+Alt
        // AltGr typically has event.location = 2 (right side)
        IF event.location = 2 THEN
            RETURN true
        END IF
        // Heuristic: if both Ctrl and Alt, likely AltGr
        RETURN true
    END IF

    // Method 3: Check getModifierState (modern browsers)
    IF event.getModifierState IS function THEN
        RETURN event.getModifierState("AltGraph")
    END IF

    RETURN false
END FUNCTION


FUNCTION ClassifySpecialKey(code, key):
    // Returns the type of special key, or null for regular characters

    SPECIAL_KEY_MAP <- {
        // Navigation and editing
        "Backspace": "backspace",
        "Delete": "delete",
        "Enter": "enter",
        "Tab": "tab",
        "Escape": "escape",
        "Space": null,  // Space is a character, not special

        // Arrow keys
        "ArrowUp": "arrow",
        "ArrowDown": "arrow",
        "ArrowLeft": "arrow",
        "ArrowRight": "arrow",

        // Modifier keys (key down events, not for character input)
        "ShiftLeft": "modifier",
        "ShiftRight": "modifier",
        "ControlLeft": "modifier",
        "ControlRight": "modifier",
        "AltLeft": "modifier",
        "AltRight": "modifier",
        "MetaLeft": "modifier",
        "MetaRight": "modifier",
        "CapsLock": "modifier",

        // Function keys
        "F1": "function", "F2": "function", "F3": "function",
        "F4": "function", "F5": "function", "F6": "function",
        "F7": "function", "F8": "function", "F9": "function",
        "F10": "function", "F11": "function", "F12": "function",

        // Other special
        "Home": "navigation",
        "End": "navigation",
        "PageUp": "navigation",
        "PageDown": "navigation",
        "Insert": "navigation",
        "ContextMenu": "system"
    }

    RETURN SPECIAL_KEY_MAP.get(code) OR null
END FUNCTION


FUNCTION ShouldInterceptEvent(code, modifiers, specialKeyType):
    // Determine if we should intercept this event or let browser handle it

    // Allow browser shortcuts to work
    IF modifiers.ctrl OR modifiers.meta THEN
        // Common shortcuts to allow:
        allowedShortcuts <- ["KeyC", "KeyV", "KeyX", "KeyA", "KeyZ", "KeyY"]
        IF code IN allowedShortcuts THEN
            RETURN false  // Let browser handle copy/paste/undo
        END IF
    END IF

    // Don't intercept function keys
    IF specialKeyType = "function" THEN
        RETURN false
    END IF

    // Don't intercept system keys
    IF specialKeyType = "system" THEN
        RETURN false
    END IF

    // Don't intercept modifier-only key presses
    IF specialKeyType = "modifier" THEN
        RETURN false
    END IF

    // Don't intercept navigation keys (unless in typing mode)
    IF specialKeyType = "navigation" AND NOT isInTypingMode THEN
        RETURN false
    END IF

    // Intercept everything else for typing practice
    RETURN true
END FUNCTION
```

### 3.3 Special Key Handler

```
================================================================================
ALGORITHM: HandleSpecialKey
================================================================================
PURPOSE:
  Process special key presses (Backspace, Enter, Tab, Escape) during typing.

INPUT:
  - specialKeyType: String  // Type of special key
  - sessionState: Object    // Current typing session state
  - settings: Object        // User settings (mode, etc.)

OUTPUT:
  - action: Object
    - type: String          // Action type to perform
    - payload: Object       // Action-specific data
================================================================================

ALGORITHM HandleSpecialKey(specialKeyType, sessionState, settings):

    SWITCH specialKeyType:

        CASE "backspace":
            IF settings.mode = "no-backspace" THEN
                // No backspace allowed in this mode
                RETURN { type: "BLOCKED", payload: { reason: "no-backspace mode" } }
            END IF

            IF sessionState.currentIndex = 0 THEN
                // Already at start, nothing to delete
                RETURN { type: "NOOP", payload: null }
            END IF

            RETURN { type: "BACKSPACE", payload: { position: sessionState.currentIndex - 1 } }

        CASE "enter":
            // Check if expected character is newline
            expectedChar <- sessionState.text[sessionState.currentIndex]
            IF expectedChar = "\n" THEN
                RETURN { type: "CHARACTER", payload: { character: "\n" } }
            END IF

            // Otherwise, might be used to start/restart session
            IF NOT sessionState.isStarted THEN
                RETURN { type: "START_SESSION", payload: null }
            ELSE IF sessionState.isComplete THEN
                RETURN { type: "RESTART_SESSION", payload: null }
            END IF

            RETURN { type: "BLOCKED", payload: { reason: "enter not expected" } }

        CASE "tab":
            // Check if expected character is tab
            expectedChar <- sessionState.text[sessionState.currentIndex]
            IF expectedChar = "\t" THEN
                RETURN { type: "CHARACTER", payload: { character: "\t" } }
            END IF

            RETURN { type: "BLOCKED", payload: { reason: "tab not expected" } }

        CASE "escape":
            // Escape pauses or exits the session
            IF sessionState.isActive AND NOT sessionState.isPaused THEN
                RETURN { type: "PAUSE_SESSION", payload: null }
            ELSE IF sessionState.isPaused THEN
                RETURN { type: "RESUME_SESSION", payload: null }
            END IF

            RETURN { type: "EXIT_SESSION", payload: null }

        CASE "arrow":
            // Arrow keys might be blocked or used for navigation
            IF settings.allowArrowNavigation THEN
                RETURN { type: "NAVIGATION", payload: { direction: event.code } }
            END IF
            RETURN { type: "BLOCKED", payload: { reason: "arrow navigation disabled" } }

        DEFAULT:
            RETURN { type: "UNKNOWN", payload: { keyType: specialKeyType } }

    END SWITCH

END ALGORITHM
```

---

## 4. Data Structure: Complete LATAM Keyboard Layout

### 4.1 Type Definitions

```
================================================================================
DATA STRUCTURE: KeyDefinition
================================================================================
PURPOSE:
  Complete definition of a single key on the LATAM keyboard layout.

FIELDS:
  code: String          // Physical key code (e.g., "KeyQ", "Digit1")
  row: Integer          // Row index (0 = number row, 4 = space bar row)
  position: Integer     // Position within row (0-based, left to right)
  width: Float          // Key width in standard units (1.0 = normal key)

  // Characters produced by this key
  normal: String        // Character with no modifiers
  shift: String         // Character with Shift modifier
  altGr: String | null  // Character with AltGr modifier (null if none)
  shiftAltGr: String | null  // Character with Shift+AltGr (null if none)

  // Dead key properties
  isDeadKey: Boolean    // Whether this key is a dead key
  deadKeyType: String | null  // Type: "acute", "dieresis", "grave", "circumflex"

  // Touch typing guidance
  finger: String        // Recommended finger for touch typing
                        // Values: "left-pinky", "left-ring", "left-middle",
                        //         "left-index", "right-index", "right-middle",
                        //         "right-ring", "right-pinky", "thumb"
  isHomeRow: Boolean    // Whether this is a home row key (for finger placement)
================================================================================


================================================================================
DATA STRUCTURE: KeyboardLayout
================================================================================
PURPOSE:
  Complete definition of a keyboard layout with all keys organized by row.

FIELDS:
  name: String          // Human-readable layout name
  locale: String        // Locale code (e.g., "es-419" for LATAM Spanish)
  rows: Array<Array<KeyDefinition>>  // Keys organized by row (5 rows)
================================================================================
```

### 4.2 Complete LATAM Layout Data

```
================================================================================
DATA: LATAM_KEYBOARD_LAYOUT
================================================================================

LATAM_KEYBOARD_LAYOUT = {
    name: "Latin American Spanish",
    locale: "es-419",
    rows: [

        // ======================================================================
        // ROW 0: Number Row (13 keys + Backspace)
        // ======================================================================
        [
            {
                code: "Backquote", row: 0, position: 0, width: 1.0,
                normal: "|", shift: "°", altGr: "¬", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "Digit1", row: 0, position: 1, width: 1.0,
                normal: "1", shift: "!", altGr: "|", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "Digit2", row: 0, position: 2, width: 1.0,
                normal: "2", shift: "\"", altGr: "@", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-ring", isHomeRow: false
            },
            {
                code: "Digit3", row: 0, position: 3, width: 1.0,
                normal: "3", shift: "#", altGr: "#", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-middle", isHomeRow: false
            },
            {
                code: "Digit4", row: 0, position: 4, width: 1.0,
                normal: "4", shift: "$", altGr: "~", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "Digit5", row: 0, position: 5, width: 1.0,
                normal: "5", shift: "%", altGr: "€", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "Digit6", row: 0, position: 6, width: 1.0,
                normal: "6", shift: "&", altGr: "¬", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "Digit7", row: 0, position: 7, width: 1.0,
                normal: "7", shift: "/", altGr: "{", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "Digit8", row: 0, position: 8, width: 1.0,
                normal: "8", shift: "(", altGr: "[", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-middle", isHomeRow: false
            },
            {
                code: "Digit9", row: 0, position: 9, width: 1.0,
                normal: "9", shift: ")", altGr: "]", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-ring", isHomeRow: false
            },
            {
                code: "Digit0", row: 0, position: 10, width: 1.0,
                normal: "0", shift: "=", altGr: "}", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "Minus", row: 0, position: 11, width: 1.0,
                normal: "'", shift: "?", altGr: "\\", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "Equal", row: 0, position: 12, width: 1.0,
                normal: "¿", shift: "¡", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "Backspace", row: 0, position: 13, width: 2.0,
                normal: "BACKSPACE", shift: "BACKSPACE", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            }
        ],

        // ======================================================================
        // ROW 1: Top Letter Row (Tab + QWERTY + brackets)
        // ======================================================================
        [
            {
                code: "Tab", row: 1, position: 0, width: 1.5,
                normal: "TAB", shift: "TAB", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "KeyQ", row: 1, position: 1, width: 1.0,
                normal: "q", shift: "Q", altGr: "@", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "KeyW", row: 1, position: 2, width: 1.0,
                normal: "w", shift: "W", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-ring", isHomeRow: false
            },
            {
                code: "KeyE", row: 1, position: 3, width: 1.0,
                normal: "e", shift: "E", altGr: "€", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-middle", isHomeRow: false
            },
            {
                code: "KeyR", row: 1, position: 4, width: 1.0,
                normal: "r", shift: "R", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "KeyT", row: 1, position: 5, width: 1.0,
                normal: "t", shift: "T", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "KeyY", row: 1, position: 6, width: 1.0,
                normal: "y", shift: "Y", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "KeyU", row: 1, position: 7, width: 1.0,
                normal: "u", shift: "U", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "KeyI", row: 1, position: 8, width: 1.0,
                normal: "i", shift: "I", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-middle", isHomeRow: false
            },
            {
                code: "KeyO", row: 1, position: 9, width: 1.0,
                normal: "o", shift: "O", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-ring", isHomeRow: false
            },
            {
                code: "KeyP", row: 1, position: 10, width: 1.0,
                normal: "p", shift: "P", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "BracketLeft", row: 1, position: 11, width: 1.0,
                normal: "´", shift: "¨", altGr: "[", shiftAltGr: null,
                isDeadKey: true, deadKeyType: "acute",  // Shift changes to dieresis
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "BracketRight", row: 1, position: 12, width: 1.0,
                normal: "+", shift: "*", altGr: "]", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            }
        ],

        // ======================================================================
        // ROW 2: Home Row (Caps Lock + ASDF... + Enter)
        // ======================================================================
        [
            {
                code: "CapsLock", row: 2, position: 0, width: 1.75,
                normal: "CAPS", shift: "CAPS", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "KeyA", row: 2, position: 1, width: 1.0,
                normal: "a", shift: "A", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: true
            },
            {
                code: "KeyS", row: 2, position: 2, width: 1.0,
                normal: "s", shift: "S", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-ring", isHomeRow: true
            },
            {
                code: "KeyD", row: 2, position: 3, width: 1.0,
                normal: "d", shift: "D", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-middle", isHomeRow: true
            },
            {
                code: "KeyF", row: 2, position: 4, width: 1.0,
                normal: "f", shift: "F", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: true
            },
            {
                code: "KeyG", row: 2, position: 5, width: 1.0,
                normal: "g", shift: "G", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "KeyH", row: 2, position: 6, width: 1.0,
                normal: "h", shift: "H", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "KeyJ", row: 2, position: 7, width: 1.0,
                normal: "j", shift: "J", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: true
            },
            {
                code: "KeyK", row: 2, position: 8, width: 1.0,
                normal: "k", shift: "K", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-middle", isHomeRow: true
            },
            {
                code: "KeyL", row: 2, position: 9, width: 1.0,
                normal: "l", shift: "L", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-ring", isHomeRow: true
            },
            {
                code: "Semicolon", row: 2, position: 10, width: 1.0,
                normal: "ñ", shift: "Ñ", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: true
            },
            {
                code: "Quote", row: 2, position: 11, width: 1.0,
                normal: "{", shift: "[", altGr: "^", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "Backslash", row: 2, position: 12, width: 1.0,
                normal: "}", shift: "]", altGr: "`", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "Enter", row: 2, position: 13, width: 1.25,
                normal: "ENTER", shift: "ENTER", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            }
        ],

        // ======================================================================
        // ROW 3: Bottom Letter Row (Shift + ZXCV... + Shift)
        // ======================================================================
        [
            {
                code: "ShiftLeft", row: 3, position: 0, width: 1.25,
                normal: "SHIFT", shift: "SHIFT", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "IntlBackslash", row: 3, position: 1, width: 1.0,
                normal: "<", shift: ">", altGr: "|", shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "KeyZ", row: 3, position: 2, width: 1.0,
                normal: "z", shift: "Z", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "KeyX", row: 3, position: 3, width: 1.0,
                normal: "x", shift: "X", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-ring", isHomeRow: false
            },
            {
                code: "KeyC", row: 3, position: 4, width: 1.0,
                normal: "c", shift: "C", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-middle", isHomeRow: false
            },
            {
                code: "KeyV", row: 3, position: 5, width: 1.0,
                normal: "v", shift: "V", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "KeyB", row: 3, position: 6, width: 1.0,
                normal: "b", shift: "B", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-index", isHomeRow: false
            },
            {
                code: "KeyN", row: 3, position: 7, width: 1.0,
                normal: "n", shift: "N", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "KeyM", row: 3, position: 8, width: 1.0,
                normal: "m", shift: "M", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-index", isHomeRow: false
            },
            {
                code: "Comma", row: 3, position: 9, width: 1.0,
                normal: ",", shift: ";", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-middle", isHomeRow: false
            },
            {
                code: "Period", row: 3, position: 10, width: 1.0,
                normal: ".", shift: ":", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-ring", isHomeRow: false
            },
            {
                code: "Slash", row: 3, position: 11, width: 1.0,
                normal: "-", shift: "_", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "ShiftRight", row: 3, position: 12, width: 2.75,
                normal: "SHIFT", shift: "SHIFT", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            }
        ],

        // ======================================================================
        // ROW 4: Space Bar Row (Control + Win + Alt + Space + AltGr + ...)
        // ======================================================================
        [
            {
                code: "ControlLeft", row: 4, position: 0, width: 1.5,
                normal: "CTRL", shift: "CTRL", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "MetaLeft", row: 4, position: 1, width: 1.25,
                normal: "WIN", shift: "WIN", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "left-pinky", isHomeRow: false
            },
            {
                code: "AltLeft", row: 4, position: 2, width: 1.25,
                normal: "ALT", shift: "ALT", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "thumb", isHomeRow: false
            },
            {
                code: "Space", row: 4, position: 3, width: 6.25,
                normal: " ", shift: " ", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "thumb", isHomeRow: true
            },
            {
                code: "AltRight", row: 4, position: 4, width: 1.25,
                normal: "ALTGR", shift: "ALTGR", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "thumb", isHomeRow: false
            },
            {
                code: "MetaRight", row: 4, position: 5, width: 1.25,
                normal: "WIN", shift: "WIN", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "ContextMenu", row: 4, position: 6, width: 1.25,
                normal: "MENU", shift: "MENU", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            },
            {
                code: "ControlRight", row: 4, position: 7, width: 1.5,
                normal: "CTRL", shift: "CTRL", altGr: null, shiftAltGr: null,
                isDeadKey: false, deadKeyType: null,
                finger: "right-pinky", isHomeRow: false
            }
        ]
    ]
}
```

### 4.3 Finger Assignment Guide

```
================================================================================
FINGER ASSIGNMENT VISUALIZATION
================================================================================

Standard touch typing finger assignments for LATAM layout:

LEFT HAND                           RIGHT HAND
=========                           ==========
Pinky: `, 1, Tab, Q, Caps, A, Shift, <, Z
Ring:  2, W, S, X
Middle: 3, E, D, C
Index: 4, 5, R, T, F, G, V, B      6, 7, Y, U, H, J, N, M (Index)
                                    8, I, K, , (Middle)
                                    9, O, L, . (Ring)
                                    0, ', ¿, P, ´, +, Ñ, {, }, -, Shift (Pinky)

Thumbs: Left Alt, Space Bar, Right Alt (AltGr)

================================================================================
HOME ROW KEYS (fingers rest here):
================================================================================
A - Left Pinky
S - Left Ring
D - Left Middle
F - Left Index (has tactile bump)
J - Right Index (has tactile bump)
K - Right Middle
L - Right Ring
Ñ - Right Pinky
Space - Thumbs

================================================================================
```

---

## 5. Algorithm 3: Character Validation

### 5.1 Main Validation Algorithm

```
================================================================================
ALGORITHM: ValidateInput
================================================================================
PURPOSE:
  Compare the typed character against the expected character, handling
  dead key composition, Unicode normalization, and case sensitivity.

INPUT:
  - typedChar: String           // Character that user typed
  - expectedChar: String        // Character that should be typed
  - deadKeyState: Object        // Current dead key state
  - options: Object             // Validation options
    - caseSensitive: Boolean    // Whether to enforce case matching
    - strictAccents: Boolean    // Whether accents must match exactly

OUTPUT:
  - result: Object
    - status: String            // "correct", "incorrect", "pending_dead_key"
    - normalizedExpected: String // Unicode-normalized expected character
    - normalizedTyped: String   // Unicode-normalized typed character
    - matchType: String         // "exact", "case_insensitive", "accent_equivalent"
================================================================================

ALGORITHM ValidateInput(typedChar, expectedChar, deadKeyState, options):

    // STEP 1: Handle dead key pending state
    IF deadKeyState.active THEN
        // User has pressed a dead key, waiting for composable character
        RETURN {
            status: "pending_dead_key",
            normalizedExpected: expectedChar,
            normalizedTyped: null,
            matchType: null
        }
    END IF

    // STEP 2: Unicode normalization (NFC form)
    // This ensures that composed characters (e.g., á) match their
    // decomposed equivalents (a + combining acute accent)
    normalizedExpected <- NormalizeUnicode(expectedChar)
    normalizedTyped <- NormalizeUnicode(typedChar)

    // STEP 3: Exact match check (most common case)
    IF normalizedTyped = normalizedExpected THEN
        RETURN {
            status: "correct",
            normalizedExpected: normalizedExpected,
            normalizedTyped: normalizedTyped,
            matchType: "exact"
        }
    END IF

    // STEP 4: Case-insensitive match (if enabled)
    IF NOT options.caseSensitive THEN
        IF LowerCase(normalizedTyped) = LowerCase(normalizedExpected) THEN
            RETURN {
                status: "correct",
                normalizedExpected: normalizedExpected,
                normalizedTyped: normalizedTyped,
                matchType: "case_insensitive"
            }
        END IF
    END IF

    // STEP 5: Accent-equivalent match (if enabled)
    // This allows 'a' to match 'á' when strictAccents is false
    IF NOT options.strictAccents THEN
        baseExpected <- RemoveAccents(normalizedExpected)
        baseTyped <- RemoveAccents(normalizedTyped)

        IF baseTyped = baseExpected THEN
            RETURN {
                status: "correct",
                normalizedExpected: normalizedExpected,
                normalizedTyped: normalizedTyped,
                matchType: "accent_equivalent"
            }
        END IF
    END IF

    // STEP 6: No match found
    RETURN {
        status: "incorrect",
        normalizedExpected: normalizedExpected,
        normalizedTyped: normalizedTyped,
        matchType: null
    }

END ALGORITHM


HELPER FUNCTION NormalizeUnicode(str):
    // Normalize to NFC (Canonical Decomposition, followed by Canonical Composition)
    RETURN str.normalize("NFC")
END FUNCTION


HELPER FUNCTION RemoveAccents(str):
    // Remove diacritical marks while preserving base characters
    // NFD decomposes, then we strip combining characters
    decomposed <- str.normalize("NFD")
    RETURN decomposed.replaceAll(/[\u0300-\u036f]/g, "")
END FUNCTION
```

### 5.2 Dead Key Composition Validation

```
================================================================================
ALGORITHM: ValidateDeadKeyComposition
================================================================================
PURPOSE:
  Validate that a dead key sequence produces the expected composed character.

INPUT:
  - deadKeyType: String         // "acute", "dieresis", "grave", "circumflex"
  - baseChar: String            // The character typed after dead key
  - expectedChar: String        // The expected composed character

OUTPUT:
  - result: Object
    - isValidComposition: Boolean
    - composedChar: String | null
    - alternativeMatch: Boolean   // If input matches via alternative method
================================================================================

ALGORITHM ValidateDeadKeyComposition(deadKeyType, baseChar, expectedChar):

    // STEP 1: Attempt composition
    composedChar <- ComposeWithDeadKey(deadKeyType, baseChar)

    // STEP 2: Check if composition matches expected
    IF composedChar IS NOT null THEN
        IF NormalizeUnicode(composedChar) = NormalizeUnicode(expectedChar) THEN
            RETURN {
                isValidComposition: true,
                composedChar: composedChar,
                alternativeMatch: false
            }
        END IF
    END IF

    // STEP 3: Check if expected was the composed character we're looking for
    // This handles the case where user types the right keys for expected
    expectedDecomposition <- DecomposeCharacter(expectedChar)
    IF expectedDecomposition IS NOT null THEN
        IF expectedDecomposition.deadKeyType = deadKeyType AND
           expectedDecomposition.baseChar = baseChar THEN
            RETURN {
                isValidComposition: true,
                composedChar: expectedChar,
                alternativeMatch: false
            }
        END IF
    END IF

    // STEP 4: No valid composition
    RETURN {
        isValidComposition: false,
        composedChar: composedChar,
        alternativeMatch: false
    }

END ALGORITHM


// Dead key composition lookup table
DEAD_KEY_COMPOSITIONS <- {
    "acute": {
        "a": "á", "e": "é", "i": "í", "o": "ó", "u": "ú",
        "A": "Á", "E": "É", "I": "Í", "O": "Ó", "U": "Ú",
        " ": "´"
    },
    "dieresis": {
        "a": "ä", "e": "ë", "i": "ï", "o": "ö", "u": "ü",
        "A": "Ä", "E": "Ë", "I": "Ï", "O": "Ö", "U": "Ü",
        " ": "¨"
    },
    "grave": {
        "a": "à", "e": "è", "i": "ì", "o": "ò", "u": "ù",
        "A": "À", "E": "È", "I": "Ì", "O": "Ò", "U": "Ù",
        " ": "`"
    },
    "circumflex": {
        "a": "â", "e": "ê", "i": "î", "o": "ô", "u": "û",
        "A": "Â", "E": "Ê", "I": "Î", "O": "Ô", "U": "Û",
        " ": "^"
    }
}


FUNCTION ComposeWithDeadKey(deadKeyType, baseChar):
    compositions <- DEAD_KEY_COMPOSITIONS.get(deadKeyType)
    IF compositions IS null THEN
        RETURN null
    END IF
    RETURN compositions.get(baseChar) OR null
END FUNCTION


FUNCTION DecomposeCharacter(char):
    // Reverse lookup: find which dead key + base produces this character
    FOR EACH (deadKeyType, compositions) IN DEAD_KEY_COMPOSITIONS DO
        FOR EACH (baseChar, composed) IN compositions DO
            IF composed = char THEN
                RETURN {
                    deadKeyType: deadKeyType,
                    baseChar: baseChar
                }
            END IF
        END FOR
    END FOR
    RETURN null
END FUNCTION
```

---

## 6. Algorithm 4: Dead Key State Machine

### 6.1 State Machine Definition

```
================================================================================
STATE MACHINE: DeadKeyStateMachine
================================================================================
PURPOSE:
  Manage the state of dead key composition, tracking when a dead key is
  pressed and composing the final character when the next key arrives.

STATES:
  - IDLE: No dead key active, normal character processing
  - PENDING: Dead key pressed, waiting for composable character
  - COMPOSING: Processing the composition (transient state)

TRANSITIONS:
  IDLE -> PENDING: Dead key pressed
  PENDING -> IDLE: Composable character pressed (composition complete)
  PENDING -> IDLE: Non-composable character pressed (output both)
  PENDING -> IDLE: Another dead key pressed (output first, start new pending)
  PENDING -> IDLE: Escape pressed (cancel dead key)
================================================================================

DATA STRUCTURE DeadKeyState:
    state: String           // "IDLE", "PENDING", "COMPOSING"
    deadKeyType: String     // "acute", "dieresis", "grave", "circumflex", null
    deadKeyChar: String     // The visual representation of the dead key
    timestamp: Number       // When dead key was pressed (for timeout)
================================================================================
```

### 6.2 State Machine Implementation

```
================================================================================
ALGORITHM: ProcessDeadKeyInput
================================================================================

ALGORITHM ProcessDeadKeyInput(currentState, keyEvent, keyDefinition):

    // Extract key information
    code <- keyEvent.code
    isDeadKey <- keyDefinition.isDeadKey AND NOT keyEvent.modifiers.altGr
    deadKeyType <- GetDeadKeyType(keyDefinition, keyEvent.modifiers)

    // State machine transitions
    SWITCH currentState.state:

        // =============================================
        CASE "IDLE":
        // =============================================
            IF isDeadKey THEN
                // Transition to PENDING state
                newState <- {
                    state: "PENDING",
                    deadKeyType: deadKeyType,
                    deadKeyChar: GetDeadKeyVisual(deadKeyType),
                    timestamp: keyEvent.timestamp
                }
                RETURN {
                    newState: newState,
                    output: null,           // No output yet
                    consumed: true          // Event was consumed
                }
            ELSE
                // Normal character, pass through
                character <- MapUSKeyToLATAM(code, keyEvent.modifiers).character
                RETURN {
                    newState: currentState,
                    output: character,
                    consumed: true
                }
            END IF

        // =============================================
        CASE "PENDING":
        // =============================================

            // Check for timeout (optional, typically 5 seconds)
            IF keyEvent.timestamp - currentState.timestamp > DEAD_KEY_TIMEOUT THEN
                // Timeout: output dead key character and process new key
                resetState <- { state: "IDLE", deadKeyType: null, deadKeyChar: null, timestamp: null }

                IF isDeadKey THEN
                    // New dead key replaces old one, output old
                    newState <- {
                        state: "PENDING",
                        deadKeyType: deadKeyType,
                        deadKeyChar: GetDeadKeyVisual(deadKeyType),
                        timestamp: keyEvent.timestamp
                    }
                    RETURN {
                        newState: newState,
                        output: currentState.deadKeyChar,
                        consumed: true
                    }
                ELSE
                    character <- MapUSKeyToLATAM(code, keyEvent.modifiers).character
                    RETURN {
                        newState: resetState,
                        output: currentState.deadKeyChar + character,
                        consumed: true
                    }
                END IF
            END IF

            // Handle Escape (cancel dead key)
            IF code = "Escape" THEN
                RETURN {
                    newState: { state: "IDLE", deadKeyType: null, deadKeyChar: null, timestamp: null },
                    output: null,           // Cancel without output
                    consumed: true
                }
            END IF

            // Handle Backspace (cancel dead key)
            IF code = "Backspace" THEN
                RETURN {
                    newState: { state: "IDLE", deadKeyType: null, deadKeyChar: null, timestamp: null },
                    output: null,           // Cancel without output
                    consumed: true,
                    isBackspace: true       // Signal that backspace was requested
                }
            END IF

            // Handle another dead key
            IF isDeadKey THEN
                // Output current dead key, start new pending
                newState <- {
                    state: "PENDING",
                    deadKeyType: deadKeyType,
                    deadKeyChar: GetDeadKeyVisual(deadKeyType),
                    timestamp: keyEvent.timestamp
                }
                RETURN {
                    newState: newState,
                    output: currentState.deadKeyChar,
                    consumed: true
                }
            END IF

            // Attempt composition with current key
            baseChar <- MapUSKeyToLATAM(code, keyEvent.modifiers).character
            composedChar <- ComposeWithDeadKey(currentState.deadKeyType, baseChar)

            resetState <- { state: "IDLE", deadKeyType: null, deadKeyChar: null, timestamp: null }

            IF composedChar IS NOT null THEN
                // Successful composition
                RETURN {
                    newState: resetState,
                    output: composedChar,
                    consumed: true,
                    wasComposition: true
                }
            ELSE
                // No composition possible, output both characters
                RETURN {
                    newState: resetState,
                    output: currentState.deadKeyChar + baseChar,
                    consumed: true,
                    wasComposition: false
                }
            END IF

        DEFAULT:
            // Unknown state, reset to IDLE
            RETURN {
                newState: { state: "IDLE", deadKeyType: null, deadKeyChar: null, timestamp: null },
                output: null,
                consumed: false
            }

    END SWITCH

END ALGORITHM


HELPER FUNCTION GetDeadKeyType(keyDefinition, modifiers):
    // BracketLeft is special: normal = acute, shift = dieresis
    IF keyDefinition.code = "BracketLeft" THEN
        IF modifiers.shift THEN
            RETURN "dieresis"
        ELSE
            RETURN "acute"
        END IF
    END IF
    RETURN keyDefinition.deadKeyType
END FUNCTION


HELPER FUNCTION GetDeadKeyVisual(deadKeyType):
    VISUALS <- {
        "acute": "´",
        "dieresis": "¨",
        "grave": "`",
        "circumflex": "^"
    }
    RETURN VISUALS.get(deadKeyType) OR ""
END FUNCTION


CONSTANT DEAD_KEY_TIMEOUT <- 5000  // 5 seconds in milliseconds
```

---

## 7. Algorithm 5: Modifier Key Tracking

### 7.1 Modifier State Management

```
================================================================================
ALGORITHM: TrackModifiers
================================================================================
PURPOSE:
  Track the state of modifier keys (Shift, Alt, AltGr, Ctrl, Meta) across
  keydown and keyup events to determine the current modifier state.

INPUT:
  - event: KeyboardEvent
  - currentModifiers: Object

OUTPUT:
  - newModifiers: Object
    - shift: Boolean
    - altGr: Boolean
    - ctrl: Boolean
    - meta: Boolean
    - leftShift: Boolean    // Detailed tracking
    - rightShift: Boolean
    - leftCtrl: Boolean
    - rightCtrl: Boolean
================================================================================

ALGORITHM TrackModifiers(event, currentModifiers):

    // Create copy of current state
    newModifiers <- ShallowCopy(currentModifiers)

    // Extract event type
    eventType <- event.type  // "keydown" or "keyup"
    code <- event.code

    // Handle based on event type and key code
    SWITCH code:

        CASE "ShiftLeft":
            newModifiers.leftShift <- (eventType = "keydown")
            newModifiers.shift <- newModifiers.leftShift OR newModifiers.rightShift
            BREAK

        CASE "ShiftRight":
            newModifiers.rightShift <- (eventType = "keydown")
            newModifiers.shift <- newModifiers.leftShift OR newModifiers.rightShift
            BREAK

        CASE "ControlLeft":
            newModifiers.leftCtrl <- (eventType = "keydown")
            newModifiers.ctrl <- newModifiers.leftCtrl OR newModifiers.rightCtrl
            // Re-evaluate AltGr (Ctrl+Alt on Windows)
            newModifiers.altGr <- DetectAltGrFromState(newModifiers, event)
            BREAK

        CASE "ControlRight":
            newModifiers.rightCtrl <- (eventType = "keydown")
            newModifiers.ctrl <- newModifiers.leftCtrl OR newModifiers.rightCtrl
            newModifiers.altGr <- DetectAltGrFromState(newModifiers, event)
            BREAK

        CASE "AltLeft":
            newModifiers.leftAlt <- (eventType = "keydown")
            newModifiers.alt <- newModifiers.leftAlt OR newModifiers.rightAlt
            newModifiers.altGr <- DetectAltGrFromState(newModifiers, event)
            BREAK

        CASE "AltRight":
            // Right Alt is AltGr on many international layouts
            newModifiers.rightAlt <- (eventType = "keydown")
            newModifiers.altGr <- newModifiers.rightAlt
            newModifiers.alt <- newModifiers.leftAlt OR newModifiers.rightAlt
            BREAK

        CASE "MetaLeft":
            newModifiers.leftMeta <- (eventType = "keydown")
            newModifiers.meta <- newModifiers.leftMeta OR newModifiers.rightMeta
            BREAK

        CASE "MetaRight":
            newModifiers.rightMeta <- (eventType = "keydown")
            newModifiers.meta <- newModifiers.leftMeta OR newModifiers.rightMeta
            BREAK

    END SWITCH

    // Sync with event state (handles edge cases like window focus loss)
    IF eventType = "keydown" THEN
        // Trust event state for current modifiers
        newModifiers.shift <- event.shiftKey
        newModifiers.ctrl <- event.ctrlKey AND NOT newModifiers.altGr
        newModifiers.meta <- event.metaKey
    END IF

    RETURN newModifiers

END ALGORITHM


FUNCTION DetectAltGrFromState(modifiers, event):
    // AltGr detection heuristic

    // Direct Right Alt
    IF modifiers.rightAlt THEN
        RETURN true
    END IF

    // Windows Ctrl+Alt combo for AltGr
    IF modifiers.leftCtrl AND modifiers.leftAlt THEN
        RETURN true
    END IF

    // Check browser's AltGraph modifier state
    IF event.getModifierState AND event.getModifierState("AltGraph") THEN
        RETURN true
    END IF

    RETURN false
END FUNCTION


FUNCTION InitializeModifierState():
    RETURN {
        shift: false,
        altGr: false,
        ctrl: false,
        alt: false,
        meta: false,
        leftShift: false,
        rightShift: false,
        leftCtrl: false,
        rightCtrl: false,
        leftAlt: false,
        rightAlt: false,
        leftMeta: false,
        rightMeta: false
    }
END FUNCTION
```

### 7.2 Modifier State Reset

```
================================================================================
ALGORITHM: ResetModifiersOnBlur
================================================================================
PURPOSE:
  Reset modifier state when window loses focus to prevent stuck modifiers.

TRIGGER:
  Window blur event or visibility change event.
================================================================================

ALGORITHM ResetModifiersOnBlur():
    // Reset all modifier tracking to false
    modifierState <- InitializeModifierState()
    RETURN modifierState
END ALGORITHM


// Event listeners for modifier reset
ON window.blur:
    modifierState <- ResetModifiersOnBlur()

ON document.visibilitychange:
    IF document.visibilityState = "hidden" THEN
        modifierState <- ResetModifiersOnBlur()
    END IF
```

---

## 8. Integration: Complete Keystroke Processing Pipeline

### 8.1 Full Pipeline Algorithm

```
================================================================================
ALGORITHM: ProcessKeystroke
================================================================================
PURPOSE:
  Complete pipeline for processing a keystroke from browser event to UI update.
  This is the main entry point that orchestrates all other algorithms.

INPUT:
  - event: KeyboardEvent

OUTPUT:
  - result: Object
    - accepted: Boolean           // Was keystroke accepted for processing?
    - character: String | null    // Character to add to typed text
    - action: Object | null       // Special action (backspace, etc.)
    - validation: Object | null   // Validation result against expected
    - uiUpdate: Object            // Information for UI updates
================================================================================

ALGORITHM ProcessKeystroke(event):

    // =========================================================================
    // PHASE 1: Event Interception and Normalization
    // =========================================================================

    interceptResult <- InterceptKeyEvent(event)

    IF NOT interceptResult.accepted THEN
        // Event not relevant for typing (allowed to bubble)
        RETURN {
            accepted: false,
            character: null,
            action: null,
            validation: null,
            uiUpdate: null
        }
    END IF

    // Update modifier tracking
    modifierState <- TrackModifiers(event, currentModifierState)
    currentModifierState <- modifierState

    // =========================================================================
    // PHASE 2: Special Key Handling
    // =========================================================================

    IF interceptResult.isSpecialKey THEN
        specialAction <- HandleSpecialKey(
            interceptResult.specialKeyType,
            typingSessionState,
            userSettings
        )

        SWITCH specialAction.type:
            CASE "BACKSPACE":
                ProcessBackspace()
                RETURN {
                    accepted: true,
                    character: null,
                    action: specialAction,
                    validation: null,
                    uiUpdate: { type: "CURSOR_BACK" }
                }

            CASE "PAUSE_SESSION":
                PauseSession()
                RETURN {
                    accepted: true,
                    character: null,
                    action: specialAction,
                    validation: null,
                    uiUpdate: { type: "SESSION_PAUSED" }
                }

            CASE "CHARACTER":
                // Special key that produces a character (Enter for newline)
                // Continue to character processing with the payload character
                characterToProcess <- specialAction.payload.character
                // Fall through to Phase 3

            DEFAULT:
                RETURN {
                    accepted: true,
                    character: null,
                    action: specialAction,
                    validation: null,
                    uiUpdate: { type: "ACTION_EXECUTED", action: specialAction.type }
                }
        END SWITCH
    END IF

    // =========================================================================
    // PHASE 3: Key Mapping
    // =========================================================================

    mapResult <- MapUSKeyToLATAM(interceptResult.code, modifierState)

    IF mapResult.character IS null THEN
        // No character produced (modifier key, unknown key)
        RETURN {
            accepted: true,
            character: null,
            action: null,
            validation: null,
            uiUpdate: { type: "NO_CHARACTER" }
        }
    END IF

    // =========================================================================
    // PHASE 4: Dead Key Processing
    // =========================================================================

    deadKeyResult <- ProcessDeadKeyInput(
        deadKeyState,
        {
            code: interceptResult.code,
            modifiers: modifierState,
            timestamp: interceptResult.timestamp
        },
        mapResult.keyDefinition
    )

    // Update dead key state
    deadKeyState <- deadKeyResult.newState

    IF deadKeyResult.output IS null THEN
        // Dead key is pending, no output yet
        RETURN {
            accepted: true,
            character: null,
            action: null,
            validation: null,
            uiUpdate: {
                type: "DEAD_KEY_PENDING",
                deadKeyType: deadKeyState.deadKeyType,
                deadKeyVisual: deadKeyState.deadKeyChar
            }
        }
    END IF

    finalCharacter <- deadKeyResult.output

    // =========================================================================
    // PHASE 5: Character Validation
    // =========================================================================

    expectedCharacter <- GetExpectedCharacter(typingSessionState)

    validation <- ValidateInput(
        finalCharacter,
        expectedCharacter,
        { active: false },  // Dead key already resolved
        {
            caseSensitive: userSettings.caseSensitive,
            strictAccents: userSettings.strictAccents
        }
    )

    // =========================================================================
    // PHASE 6: Session State Update
    // =========================================================================

    ProcessTypedCharacter(finalCharacter, validation.status, interceptResult.timestamp)

    // =========================================================================
    // PHASE 7: Prepare UI Update
    // =========================================================================

    nextExpected <- GetExpectedCharacter(typingSessionState)
    nextKeyInfo <- FindKeyForCharacter(nextExpected)

    uiUpdate <- {
        type: "CHARACTER_TYPED",
        character: finalCharacter,
        isCorrect: validation.status = "correct",
        currentPosition: typingSessionState.currentIndex,
        nextKey: nextKeyInfo,
        metrics: CalculateCurrentMetrics()
    }

    // =========================================================================
    // PHASE 8: Return Complete Result
    // =========================================================================

    RETURN {
        accepted: true,
        character: finalCharacter,
        action: null,
        validation: validation,
        uiUpdate: uiUpdate
    }

END ALGORITHM
```

### 8.2 Timing and Performance Targets

```
================================================================================
PERFORMANCE BUDGET: Keystroke Processing Pipeline
================================================================================

Total Budget: 16ms (60fps frame time)

Phase Breakdown:
├── Phase 1: Event Interception         ~0.5ms
├── Phase 2: Special Key Handling       ~0.2ms
├── Phase 3: Key Mapping                ~0.1ms (O(1) lookup)
├── Phase 4: Dead Key Processing        ~0.3ms
├── Phase 5: Character Validation       ~0.2ms
├── Phase 6: Session State Update       ~0.5ms
├── Phase 7: UI Update Preparation      ~0.5ms
├── ─────────────────────────────────────────────
├── Total Algorithm Time                ~2.3ms
├── ─────────────────────────────────────────────
├── React State Update                  ~1.0ms
├── React Reconciliation                ~2.0ms
├── DOM Updates                         ~3.0ms
├── CSS Transitions Start               ~0.5ms
├── ─────────────────────────────────────────────
└── Total Frame Time                    ~8.8ms

Buffer: ~7.2ms (for garbage collection, browser overhead)

================================================================================
OPTIMIZATION STRATEGIES:
================================================================================

1. PRE-COMPUTATION:
   - Build keyCodeMap at initialization
   - Build reverseLookupMap at initialization
   - Cache finger assignments

2. MEMOIZATION:
   - Memoize FindKeyForCharacter results
   - Memoize validation results for repeated characters
   - Cache metrics calculations

3. BATCHING:
   - Batch multiple state updates in single React render
   - Use requestAnimationFrame for metrics display updates

4. VIRTUALIZATION:
   - Only render visible characters in long texts
   - Lazy-load history data

================================================================================
```

### 8.3 Error Recovery

```
================================================================================
ALGORITHM: HandleProcessingError
================================================================================
PURPOSE:
  Gracefully handle errors during keystroke processing to prevent
  application crashes and maintain user experience.

INPUT:
  - error: Error object
  - context: Object with processing context

OUTPUT:
  - recovery: Object
    - recovered: Boolean
    - action: String
    - message: String
================================================================================

ALGORITHM HandleProcessingError(error, context):

    // Log error for debugging
    LogError({
        error: error,
        context: context,
        timestamp: Date.now(),
        sessionId: currentSessionId
    })

    // Determine recovery strategy based on error type

    IF error.type = "KeyMappingError" THEN
        // Unknown key, ignore and continue
        RETURN {
            recovered: true,
            action: "IGNORE",
            message: "Unknown key ignored"
        }
    END IF

    IF error.type = "DeadKeyError" THEN
        // Dead key state corruption, reset state
        deadKeyState <- { state: "IDLE", deadKeyType: null, deadKeyChar: null, timestamp: null }
        RETURN {
            recovered: true,
            action: "RESET_DEAD_KEY",
            message: "Dead key state reset"
        }
    END IF

    IF error.type = "ValidationError" THEN
        // Validation failed, treat as incorrect
        RETURN {
            recovered: true,
            action: "MARK_INCORRECT",
            message: "Character marked as incorrect due to validation error"
        }
    END IF

    IF error.type = "StateCorruption" THEN
        // Session state corrupted, attempt recovery from last checkpoint
        IF lastCheckpoint EXISTS THEN
            RestoreFromCheckpoint(lastCheckpoint)
            RETURN {
                recovered: true,
                action: "RESTORE_CHECKPOINT",
                message: "Session restored from checkpoint"
            }
        ELSE
            RETURN {
                recovered: false,
                action: "SESSION_RESET",
                message: "Session reset required due to state corruption"
            }
        END IF
    END IF

    // Unknown error type
    RETURN {
        recovered: false,
        action: "REPORT",
        message: "Unknown error occurred: " + error.message
    }

END ALGORITHM
```

---

## Appendix A: Quick Reference Tables

### A.1 Key Code to LATAM Character Quick Reference

```
================================================================================
QUICK REFERENCE: Common Characters and Their Keys
================================================================================

SPANISH-SPECIFIC CHARACTERS:
─────────────────────────────────────────────────────────────────────────────────
Character   Key Code        Modifiers       Notes
─────────────────────────────────────────────────────────────────────────────────
ñ           Semicolon       None            Direct (where US has ;)
Ñ           Semicolon       Shift           Direct uppercase
á           BracketLeft     None + KeyA     Dead key acute + a
é           BracketLeft     None + KeyE     Dead key acute + e
í           BracketLeft     None + KeyI     Dead key acute + i
ó           BracketLeft     None + KeyO     Dead key acute + o
ú           BracketLeft     None + KeyU     Dead key acute + u
ü           BracketLeft     Shift + KeyU    Dead key dieresis + u
¿           Equal           None            Inverted question mark
¡           Equal           Shift           Inverted exclamation
─────────────────────────────────────────────────────────────────────────────────

PROGRAMMING CHARACTERS:
─────────────────────────────────────────────────────────────────────────────────
Character   Key Code        Modifiers       Notes
─────────────────────────────────────────────────────────────────────────────────
@           KeyQ            AltGr           Email symbol
@           Digit2          AltGr           Alternative location
{           Quote           None            Open brace (where US has ')
}           Backslash       None            Close brace (where US has \)
[           Quote           Shift           Open bracket
]           Backslash       Shift           Close bracket
|           Backquote       None            Pipe
/           Digit7          Shift           Forward slash
\           Minus           AltGr           Backslash
€           KeyE            AltGr           Euro symbol
~           Digit4          AltGr           Tilde
─────────────────────────────────────────────────────────────────────────────────

NUMBER ROW DIFFERENCES (Shift layer):
─────────────────────────────────────────────────────────────────────────────────
US Key      US Shift        LATAM Shift
─────────────────────────────────────────────────────────────────────────────────
1           !               ! (same)
2           @               "
3           #               # (same)
4           $               $ (same)
5           %               % (same)
6           ^               &
7           &               /
8           *               (
9           (               )
0           )               =
-           _               ?
=           +               ¡
─────────────────────────────────────────────────────────────────────────────────
```

### A.2 Event Flow Summary

```
================================================================================
EVENT FLOW: Keystroke to Screen Update
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BROWSER EVENT                                                             │
│    KeyboardEvent fired                                                       │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. INTERCEPTION                                                              │
│    InterceptKeyEvent() → Extract code, key, modifiers                        │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. MODIFIER TRACKING                                                         │
│    TrackModifiers() → Update Shift, AltGr, Ctrl, Meta state                  │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. KEY MAPPING                                                               │
│    MapUSKeyToLATAM() → Convert physical key to LATAM character               │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. DEAD KEY PROCESSING                                                       │
│    ProcessDeadKeyInput() → Handle accent composition                         │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. VALIDATION                                                                │
│    ValidateInput() → Compare against expected character                      │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. STATE UPDATE                                                              │
│    Update typing session state (position, errors, metrics)                   │
│    ↓                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. UI UPDATE                                                                 │
│    - TextDisplay: Update character state (correct/incorrect)                 │
│    - VirtualKeyboard: Highlight next key                                     │
│    - MetricsPanel: Update WPM, accuracy                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*End of Pseudocode Document*
