# SPARC Pseudocode: Teclado LATAM

**Project:** Teclado LATAM - LATAM Spanish Keyboard Typing Practice Application
**Version:** 1.0.0
**Status:** Pseudocode Phase
**Created:** 2026-01-23
**Author:** Strategic Planning Agent

---

## 1. Overview

This document provides detailed pseudocode for the core algorithms powering the Teclado LATAM typing practice application. Each algorithm is designed for performance (sub-16ms keystroke processing) and correctness.

### Document Structure

1. **Typing Engine Core** - Main keystroke processing loop
2. **Dead Key State Machine** - Accent composition handling
3. **WPM Calculator** - Real-time and final speed calculations
4. **Accuracy Calculator** - Per-character and overall accuracy
5. **Session State Machine** - Session lifecycle management
6. **Keyboard Mapper** - Character-to-key resolution
7. **Error Tracker** - Pattern analysis for improvement suggestions

---

## 2. Typing Engine Core

### 2.1 Algorithm: ProcessKeystroke

The central algorithm that processes each keyboard event and updates session state.

```
ALGORITHM ProcessKeystroke
================================================================================
INPUT:
  - event: KeyboardEvent {
      code: string,        // Physical key code (e.g., "KeyA")
      key: string,         // Character produced (e.g., "a")
      shiftKey: boolean,
      altKey: boolean,
      ctrlKey: boolean,
      metaKey: boolean,
      timestamp: number
    }
  - sessionState: SessionState {
      text: string,
      characters: CharacterResult[],
      currentIndex: number,
      mode: 'strict' | 'lenient' | 'no-backspace',
      isStarted: boolean,
      isPaused: boolean,
      isComplete: boolean
    }
  - deadKeyState: DeadKeyState
  - keyboardMapper: KeyboardMapper

OUTPUT:
  - updatedState: SessionState
  - feedback: UIFeedback {
      accepted: boolean,
      isCorrect: boolean,
      composedChar: string | null,
      highlightKey: KeyDefinition | null,
      requiredModifiers: ModifierState,
      sessionComplete: boolean
    }

PRECONDITIONS:
  - sessionState.text.length > 0
  - keyboardMapper is initialized with LATAM layout

POSTCONDITIONS:
  - If character accepted: currentIndex incremented (in lenient mode)
  - If session complete: isComplete = true
  - Character state updated to reflect correctness

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Early exit conditions
  IF sessionState.isComplete OR sessionState.isPaused THEN
    RETURN (sessionState, {accepted: false, isCorrect: false, ...defaults})
  END IF

  // Step 2: Handle special control keys
  IF event.code IN ['Escape', 'Tab'] THEN
    RETURN HandleControlKey(event, sessionState)
  END IF

  // Step 3: Handle backspace separately
  IF event.code = 'Backspace' THEN
    RETURN ProcessBackspace(sessionState)
  END IF

  // Step 4: Ignore modifier-only key presses
  IF event.code IN ['ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight',
                    'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight'] THEN
    RETURN (sessionState, {accepted: false, ...defaults})
  END IF

  // Step 5: Extract modifier state
  modifiers := {
    shift: event.shiftKey,
    altGr: event.altKey AND NOT event.ctrlKey,  // AltGr = Alt without Ctrl
    ctrl: event.ctrlKey AND NOT event.altKey,
    meta: event.metaKey
  }

  // Step 6: Get key definition from layout
  keyDef := keyboardMapper.GetKeyDefinition(event.code)

  IF keyDef = NULL THEN
    // Unknown key, ignore
    RETURN (sessionState, {accepted: false, ...defaults})
  END IF

  // Step 7: Handle dead keys
  IF keyDef.isDeadKey AND deadKeyState.active = false THEN
    // Entering dead key state
    newDeadKeyState := {
      active: true,
      type: keyDef.deadKeyType,  // 'acute', 'dieresis', etc.
      baseKey: GetCharacterForModifiers(keyDef, modifiers)
    }
    RETURN (sessionState, {
      accepted: true,
      isCorrect: null,  // No validation yet
      composedChar: null,
      deadKeyPending: true,
      ...
    })
  END IF

  // Step 8: Compose character (may resolve dead key)
  composedChar := NULL

  IF deadKeyState.active THEN
    // Try to compose with dead key
    composedChar := ComposeDeadKey(deadKeyState, event.key)
    // Reset dead key state (handled by caller)
  ELSE
    // Normal character
    composedChar := GetCharacterForModifiers(keyDef, modifiers)
  END IF

  IF composedChar = NULL OR composedChar = '' THEN
    RETURN (sessionState, {accepted: false, ...defaults})
  END IF

  // Step 9: Mark session as started if first keystroke
  IF NOT sessionState.isStarted THEN
    sessionState.isStarted := true
    sessionState.startTime := event.timestamp
  END IF

  // Step 10: Get expected character at current position
  currentIndex := sessionState.currentIndex
  expectedChar := sessionState.characters[currentIndex].expected

  // Step 11: Validate character
  isCorrect := ValidateCharacter(expectedChar, composedChar)

  // Step 12: Update character result based on mode
  newCharState := sessionState.characters[currentIndex]
  newCharState.actual := composedChar
  newCharState.timestamp := event.timestamp

  SWITCH sessionState.mode:
    CASE 'strict':
      IF isCorrect THEN
        newCharState.state := 'correct'
        // Advance to next character
        sessionState := AdvancePosition(sessionState)
      ELSE
        newCharState.state := 'incorrect'
        // Do NOT advance - user must correct
        RecordError(expectedChar, composedChar)
      END IF

    CASE 'lenient':
      IF isCorrect THEN
        newCharState.state := 'correct'
      ELSE
        newCharState.state := 'incorrect'
        RecordError(expectedChar, composedChar)
      END IF
      // Always advance in lenient mode
      sessionState := AdvancePosition(sessionState)

    CASE 'no-backspace':
      IF isCorrect THEN
        newCharState.state := 'correct'
      ELSE
        newCharState.state := 'incorrect'
        RecordError(expectedChar, composedChar)
      END IF
      // Always advance, no corrections allowed
      sessionState := AdvancePosition(sessionState)
  END SWITCH

  // Step 13: Update character in state
  sessionState.characters[currentIndex] := newCharState

  // Step 14: Check for session completion
  IF sessionState.currentIndex >= sessionState.characters.length THEN
    sessionState.isComplete := true
    sessionState.completedAt := event.timestamp
  END IF

  // Step 15: Calculate next key highlight
  nextKeyHighlight := NULL
  requiredMods := {shift: false, altGr: false, ctrl: false, meta: false}

  IF NOT sessionState.isComplete THEN
    nextChar := sessionState.characters[sessionState.currentIndex].expected
    keyInfo := keyboardMapper.FindKeyForCharacter(nextChar)
    IF keyInfo != NULL THEN
      nextKeyHighlight := keyInfo.key
      requiredMods := keyInfo.modifiers
    END IF
  END IF

  // Step 16: Build and return feedback
  feedback := {
    accepted: true,
    isCorrect: isCorrect,
    composedChar: composedChar,
    highlightKey: nextKeyHighlight,
    requiredModifiers: requiredMods,
    sessionComplete: sessionState.isComplete
  }

  RETURN (sessionState, feedback)

END ALGORITHM
--------------------------------------------------------------------------------
```

### 2.2 Algorithm: AdvancePosition

Helper algorithm to move cursor to next character.

```
ALGORITHM AdvancePosition
================================================================================
INPUT:
  - state: SessionState

OUTPUT:
  - updatedState: SessionState

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  newIndex := state.currentIndex + 1

  // Mark current position character as no longer "current"
  IF state.currentIndex < state.characters.length THEN
    state.characters[state.currentIndex].isCurrent := false
  END IF

  // Mark new position as "current" if within bounds
  IF newIndex < state.characters.length THEN
    state.characters[newIndex].state := 'current'
    state.characters[newIndex].isCurrent := true
  END IF

  state.currentIndex := newIndex

  RETURN state

END ALGORITHM
--------------------------------------------------------------------------------
```

### 2.3 Algorithm: ProcessBackspace

Handle backspace key for error correction.

```
ALGORITHM ProcessBackspace
================================================================================
INPUT:
  - state: SessionState

OUTPUT:
  - updatedState: SessionState
  - feedback: UIFeedback

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Check if backspace is allowed
  IF state.mode = 'no-backspace' THEN
    RETURN (state, {accepted: false, reason: 'backspace-disabled'})
  END IF

  // Step 2: Check if at start (cannot go back)
  IF state.currentIndex = 0 THEN
    RETURN (state, {accepted: false, reason: 'at-start'})
  END IF

  // Step 3: Move back one position
  prevIndex := state.currentIndex - 1

  // Step 4: Reset current position to pending (if not at end)
  IF state.currentIndex < state.characters.length THEN
    state.characters[state.currentIndex].state := 'pending'
    state.characters[state.currentIndex].isCurrent := false
  END IF

  // Step 5: Mark previous character appropriately
  prevChar := state.characters[prevIndex]

  IF prevChar.state = 'incorrect' THEN
    // Correcting an error - mark as 'corrected' to track
    prevChar.state := 'corrected'
    RecordCorrection()
  ELSE
    // Going back over a correct character
    prevChar.state := 'current'
  END IF

  prevChar.actual := null
  prevChar.timestamp := null
  prevChar.isCurrent := true
  state.characters[prevIndex] := prevChar

  // Step 6: Update index
  state.currentIndex := prevIndex
  state.isComplete := false  // Definitely not complete anymore

  // Step 7: Calculate next key highlight (for the character we're now on)
  nextChar := state.characters[prevIndex].expected
  keyInfo := keyboardMapper.FindKeyForCharacter(nextChar)

  feedback := {
    accepted: true,
    isCorrect: null,
    highlightKey: keyInfo?.key,
    requiredModifiers: keyInfo?.modifiers,
    sessionComplete: false
  }

  RETURN (state, feedback)

END ALGORITHM
--------------------------------------------------------------------------------
```

### 2.4 Algorithm: ValidateCharacter

Compare expected vs actual character with Unicode normalization.

```
ALGORITHM ValidateCharacter
================================================================================
INPUT:
  - expected: string (single character)
  - actual: string (single character)

OUTPUT:
  - isValid: boolean

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Handle null/undefined
  IF expected = NULL OR actual = NULL THEN
    RETURN false
  END IF

  // Step 2: Normalize both to NFC (Canonical Composition)
  // This handles cases like:
  //   - 'a' + combining acute (U+0301) = 'a with acute' (U+00E1)
  normalizedExpected := UnicodeNormalize(expected, 'NFC')
  normalizedActual := UnicodeNormalize(actual, 'NFC')

  // Step 3: Direct comparison
  IF normalizedExpected = normalizedActual THEN
    RETURN true
  END IF

  // Step 4: Special case handling
  // Some keyboards may produce different but equivalent characters

  // Handle n with tilde variations
  IF normalizedExpected = 'n with tilde' THEN
    IF normalizedActual IN ['n with tilde (U+00F1)', 'n + combining tilde'] THEN
      RETURN true
    END IF
  END IF

  // Handle space variations (regular space, non-breaking space)
  IF normalizedExpected = ' ' THEN
    IF normalizedActual IN [' ', '\u00A0'] THEN  // space or NBSP
      RETURN true
    END IF
  END IF

  RETURN false

END ALGORITHM
--------------------------------------------------------------------------------
```

---

## 3. Dead Key State Machine

### 3.1 State Diagram

```
                              +------------------+
                              |                  |
                              |      IDLE        |<-----------------+
                              |                  |                  |
                              +--------+---------+                  |
                                       |                            |
                                       | Dead key pressed           |
                                       | (acute, dieresis, etc.)    |
                                       v                            |
                              +------------------+                  |
                              |                  |                  |
                              | AWAITING_BASE    |                  |
                              |                  |                  |
                              +--------+---------+                  |
                                       |                            |
                       +---------------+---------------+            |
                       |               |               |            |
                       v               v               v            |
               +-------+----+  +-------+----+  +-------+------+    |
               |            |  |            |  |              |    |
               | Vowel      |  | Non-vowel  |  | Same dead    |    |
               | pressed    |  | pressed    |  | key pressed  |    |
               |            |  |            |  |              |    |
               +------+-----+  +------+-----+  +-------+------+    |
                      |               |                |            |
                      v               v                v            |
               +------+-----+  +------+-----+  +-------+------+    |
               |            |  |            |  |              |    |
               | OUTPUT:    |  | OUTPUT:    |  | OUTPUT:      |    |
               | Composed   |  | dead char  |  | literal      |    |
               | char       |  | + new char |  | dead char    |    |
               | (a with    |  | (acute + b)|  | (acute)      |    |
               | acute)     |  |            |  |              |    |
               +------+-----+  +------+-----+  +-------+------+    |
                      |               |                |            |
                      +---------------+----------------+            |
                                      |                             |
                                      +-----------------------------+
                                               Reset to IDLE
```

### 3.2 Algorithm: HandleDeadKey

```
ALGORITHM HandleDeadKey
================================================================================
INPUT:
  - keyCode: string          // Physical key code
  - inputChar: string        // Character from key event
  - currentState: DeadKeyState {
      status: 'IDLE' | 'AWAITING_BASE',
      type: 'acute' | 'dieresis' | 'grave' | 'circumflex' | 'tilde' | null,
      pendingChar: string | null
    }
  - isDeadKeyPress: boolean  // Is this a dead key?
  - deadKeyType: DeadKeyType | null

OUTPUT:
  - newState: DeadKeyState
  - outputChar: string | null  // Character to output (null if still waiting)

CONSTANTS:
  COMPOSITIONS := {
    'acute': {
      'a': 'a with acute', 'e': 'e with acute', 'i': 'i with acute',
      'o': 'o with acute', 'u': 'u with acute',
      'A': 'A with acute', 'E': 'E with acute', 'I': 'I with acute',
      'O': 'O with acute', 'U': 'U with acute',
      ' ': 'acute accent'  // Space outputs the accent itself
    },
    'dieresis': {
      'a': 'a with dieresis', 'e': 'e with dieresis', 'i': 'i with dieresis',
      'o': 'o with dieresis', 'u': 'u with dieresis',
      'A': 'A with dieresis', 'E': 'E with dieresis', 'I': 'I with dieresis',
      'O': 'O with dieresis', 'U': 'U with dieresis',
      ' ': 'dieresis'
    },
    'grave': {
      'a': 'a with grave', 'e': 'e with grave', 'i': 'i with grave',
      'o': 'o with grave', 'u': 'u with grave',
      'A': 'A with grave', 'E': 'E with grave', 'I': 'I with grave',
      'O': 'O with grave', 'U': 'U with grave',
      ' ': 'grave accent'
    },
    'circumflex': {
      'a': 'a with circumflex', 'e': 'e with circumflex', 'i': 'i with circumflex',
      'o': 'o with circumflex', 'u': 'u with circumflex',
      'A': 'A with circumflex', 'E': 'E with circumflex', 'I': 'I with circumflex',
      'O': 'O with circumflex', 'U': 'U with circumflex',
      ' ': 'circumflex'
    },
    'tilde': {
      'a': 'a with tilde', 'n': 'n with tilde', 'o': 'o with tilde',
      'A': 'A with tilde', 'N': 'N with tilde', 'O': 'O with tilde',
      ' ': 'tilde'
    }
  }

  DEAD_KEY_CHARS := {
    'acute': 'acute accent (U+00B4)',
    'dieresis': 'dieresis (U+00A8)',
    'grave': 'grave accent (U+0060)',
    'circumflex': 'circumflex (U+005E)',
    'tilde': 'tilde (U+007E)'
  }

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  SWITCH currentState.status:

    CASE 'IDLE':
      IF isDeadKeyPress AND deadKeyType != null THEN
        // Transition to AWAITING_BASE
        newState := {
          status: 'AWAITING_BASE',
          type: deadKeyType,
          pendingChar: DEAD_KEY_CHARS[deadKeyType]
        }
        RETURN (newState, null)  // No output yet
      ELSE
        // Normal key press, pass through
        RETURN (currentState, inputChar)
      END IF

    CASE 'AWAITING_BASE':
      // We have a pending dead key, now processing the base character

      // Case A: Same dead key pressed again -> output literal dead char
      IF isDeadKeyPress AND deadKeyType = currentState.type THEN
        outputChar := DEAD_KEY_CHARS[currentState.type]
        newState := {status: 'IDLE', type: null, pendingChar: null}
        RETURN (newState, outputChar)
      END IF

      // Case B: Different dead key pressed -> output pending + enter new dead state
      IF isDeadKeyPress AND deadKeyType != currentState.type THEN
        outputChar := DEAD_KEY_CHARS[currentState.type]
        newState := {
          status: 'AWAITING_BASE',
          type: deadKeyType,
          pendingChar: DEAD_KEY_CHARS[deadKeyType]
        }
        // Note: Caller must handle outputting pendingChar AND starting new dead state
        RETURN (newState, outputChar)
      END IF

      // Case C: Try to compose with the input character
      compositions := COMPOSITIONS[currentState.type]
      composedChar := compositions[inputChar]

      IF composedChar != null THEN
        // Successful composition
        newState := {status: 'IDLE', type: null, pendingChar: null}
        RETURN (newState, composedChar)
      ELSE
        // No composition possible - output dead char followed by input char
        outputChars := DEAD_KEY_CHARS[currentState.type] + inputChar
        newState := {status: 'IDLE', type: null, pendingChar: null}
        RETURN (newState, outputChars)
      END IF

  END SWITCH

END ALGORITHM
--------------------------------------------------------------------------------
```

### 3.3 Algorithm: IsDeadKeyCode

Determine if a key code corresponds to a dead key on LATAM layout.

```
ALGORITHM IsDeadKeyCode
================================================================================
INPUT:
  - code: string       // Physical key code
  - modifiers: ModifierState

OUTPUT:
  - isDeadKey: boolean
  - deadKeyType: DeadKeyType | null

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // On LATAM layout, BracketLeft is the dead key position
  IF code = 'BracketLeft' THEN
    IF modifiers.shift THEN
      // Shift + [ = dieresis dead key
      RETURN (true, 'dieresis')
    ELSE
      // [ alone = acute dead key
      RETURN (true, 'acute')
    END IF
  END IF

  // Quote key can produce circumflex with Shift on some configs
  IF code = 'Quote' AND modifiers.shift AND modifiers.altGr THEN
    RETURN (true, 'circumflex')
  END IF

  // Backslash key with AltGr = grave accent
  IF code = 'Backslash' AND modifiers.altGr THEN
    RETURN (true, 'grave')
  END IF

  // Not a dead key
  RETURN (false, null)

END ALGORITHM
--------------------------------------------------------------------------------
```

---

## 4. WPM Calculator

### 4.1 Algorithm: CalculateWPM

Standard Words Per Minute calculation.

```
ALGORITHM CalculateWPM
================================================================================
INPUT:
  - charactersTyped: integer     // Total characters entered
  - uncorrectedErrors: integer   // Errors not fixed with backspace
  - elapsedTimeMs: integer       // Time in milliseconds

OUTPUT:
  - result: WPMResult {
      grossWPM: float,           // Raw speed
      netWPM: float,             // Adjusted for errors
      cpm: integer               // Characters per minute
    }

CONSTANTS:
  CHARS_PER_WORD := 5  // Industry standard

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Handle edge cases
  IF elapsedTimeMs <= 0 THEN
    RETURN {grossWPM: 0, netWPM: 0, cpm: 0}
  END IF

  IF charactersTyped <= 0 THEN
    RETURN {grossWPM: 0, netWPM: 0, cpm: 0}
  END IF

  // Step 2: Convert time to minutes
  elapsedMinutes := elapsedTimeMs / 60000.0

  // Step 3: Calculate gross WPM
  // Formula: (Characters / 5) / Minutes
  words := charactersTyped / CHARS_PER_WORD
  grossWPM := words / elapsedMinutes

  // Step 4: Calculate net WPM (penalize errors)
  // Formula: ((Characters / 5) - Errors) / Minutes
  // Each error counts as one "word" penalty
  errorPenalty := uncorrectedErrors
  adjustedWords := MAX(0, words - errorPenalty)
  netWPM := adjustedWords / elapsedMinutes

  // Step 5: Calculate characters per minute
  cpm := ROUND(charactersTyped / elapsedMinutes)

  // Step 6: Round to one decimal place
  grossWPM := ROUND(grossWPM * 10) / 10
  netWPM := ROUND(netWPM * 10) / 10

  RETURN {
    grossWPM: grossWPM,
    netWPM: netWPM,
    cpm: cpm
  }

END ALGORITHM
--------------------------------------------------------------------------------
```

### 4.2 Algorithm: CalculateRollingWPM

Real-time WPM over a sliding time window for live display.

```
ALGORITHM CalculateRollingWPM
================================================================================
INPUT:
  - keystrokes: Keystroke[] {
      timestamp: integer,
      isCorrect: boolean
    }
  - windowMs: integer  // Window size (default 30000ms = 30 seconds)
  - currentTime: integer

OUTPUT:
  - result: WPMResult

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Minimum data check
  IF LENGTH(keystrokes) < 2 THEN
    RETURN {grossWPM: 0, netWPM: 0, cpm: 0}
  END IF

  // Step 2: Define window boundaries
  windowStart := currentTime - windowMs

  // Step 3: Filter keystrokes within window
  recentKeystrokes := []
  FOR EACH ks IN keystrokes DO
    IF ks.timestamp >= windowStart THEN
      APPEND ks TO recentKeystrokes
    END IF
  END FOR

  // Step 4: Need at least 2 keystrokes in window
  IF LENGTH(recentKeystrokes) < 2 THEN
    RETURN {grossWPM: 0, netWPM: 0, cpm: 0}
  END IF

  // Step 5: Calculate actual duration within window
  firstTimestamp := recentKeystrokes[0].timestamp
  lastTimestamp := recentKeystrokes[LENGTH(recentKeystrokes) - 1].timestamp
  duration := lastTimestamp - firstTimestamp

  IF duration <= 0 THEN
    RETURN {grossWPM: 0, netWPM: 0, cpm: 0}
  END IF

  // Step 6: Count errors in window
  errors := 0
  FOR EACH ks IN recentKeystrokes DO
    IF NOT ks.isCorrect THEN
      errors := errors + 1
    END IF
  END FOR

  // Step 7: Calculate using standard formula
  RETURN CalculateWPM(LENGTH(recentKeystrokes), errors, duration)

END ALGORITHM
--------------------------------------------------------------------------------
```

### 4.3 WPM Calculation State Diagram

```
                    Session Start
                          |
                          v
                 +--------+--------+
                 |                 |
                 |  WPM = 0        |  (No keystrokes yet)
                 |  Waiting...     |
                 |                 |
                 +--------+--------+
                          |
                          | First keystroke
                          v
                 +--------+--------+
                 |                 |
                 |  Accumulating   |  (< 5 seconds or < 10 chars)
                 |  Show: "--"     |
                 |                 |
                 +--------+--------+
                          |
                          | Threshold met
                          v
                 +--------+--------+
                 |                 |
          +----->|  Rolling WPM    |<-----+
          |      |  Update: 100ms  |      |
          |      |                 |      |
          |      +--------+--------+      |
          |               |               |
          | Keystroke     | 100ms tick    | Keystroke
          +---------------+---------------+
                          |
                          | Session complete
                          v
                 +--------+--------+
                 |                 |
                 |  Final WPM      |  (Full session calculation)
                 |  Displayed      |
                 |                 |
                 +-----------------+
```

---

## 5. Accuracy Calculator

### 5.1 Algorithm: CalculateAccuracy

Overall and per-character accuracy calculation.

```
ALGORITHM CalculateAccuracy
================================================================================
INPUT:
  - correctKeystrokes: integer
  - totalKeystrokes: integer
  - characterAttempts: Map<string, {correct: integer, total: integer}>

OUTPUT:
  - result: AccuracyResult {
      overall: float,                    // 0-100 percentage
      perCharacter: Map<string, float>,  // Per-char accuracy
      problematicChars: string[],        // Chars below threshold
      mostMissed: string[]               // Top 5 most missed
    }

CONSTANTS:
  PROBLEMATIC_THRESHOLD := 90.0  // Below this = problematic
  MIN_ATTEMPTS_FOR_FLAG := 3     // Need at least 3 attempts to flag

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Calculate overall accuracy
  IF totalKeystrokes = 0 THEN
    overallAccuracy := 100.0
  ELSE
    overallAccuracy := (correctKeystrokes / totalKeystrokes) * 100
    overallAccuracy := ROUND(overallAccuracy * 10) / 10  // One decimal
  END IF

  // Step 2: Calculate per-character accuracy
  perCharacter := new Map()
  problematicChars := []
  charAccuracyList := []  // For sorting

  FOR EACH (char, attempts) IN characterAttempts DO
    IF attempts.total = 0 THEN
      accuracy := 100.0
    ELSE
      accuracy := (attempts.correct / attempts.total) * 100
      accuracy := ROUND(accuracy * 10) / 10
    END IF

    perCharacter.set(char, accuracy)

    // Track for sorting
    charAccuracyList.APPEND({char: char, accuracy: accuracy, total: attempts.total})

    // Flag problematic characters
    IF accuracy < PROBLEMATIC_THRESHOLD AND attempts.total >= MIN_ATTEMPTS_FOR_FLAG THEN
      problematicChars.APPEND(char)
    END IF
  END FOR

  // Step 3: Sort problematic chars by accuracy (worst first)
  SORT problematicChars BY perCharacter.get(char) ASCENDING

  // Step 4: Find most missed characters (top 5)
  SORT charAccuracyList BY accuracy ASCENDING
  mostMissed := []
  FOR i := 0 TO MIN(5, LENGTH(charAccuracyList)) DO
    IF charAccuracyList[i].total >= MIN_ATTEMPTS_FOR_FLAG THEN
      mostMissed.APPEND(charAccuracyList[i].char)
    END IF
  END FOR

  RETURN {
    overall: overallAccuracy,
    perCharacter: perCharacter,
    problematicChars: problematicChars,
    mostMissed: mostMissed
  }

END ALGORITHM
--------------------------------------------------------------------------------
```

### 5.2 Algorithm: TrackCharacterAttempt

Update character accuracy tracking on each keystroke.

```
ALGORITHM TrackCharacterAttempt
================================================================================
INPUT:
  - tracker: CharacterTracker {
      attempts: Map<string, {correct: integer, total: integer}>,
      totalCorrect: integer,
      totalAttempts: integer
    }
  - expectedChar: string
  - actualChar: string
  - isCorrect: boolean

OUTPUT:
  - updatedTracker: CharacterTracker

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Get or initialize character entry
  IF NOT tracker.attempts.has(expectedChar) THEN
    tracker.attempts.set(expectedChar, {correct: 0, total: 0})
  END IF

  entry := tracker.attempts.get(expectedChar)

  // Step 2: Update counts
  entry.total := entry.total + 1
  IF isCorrect THEN
    entry.correct := entry.correct + 1
    tracker.totalCorrect := tracker.totalCorrect + 1
  END IF
  tracker.totalAttempts := tracker.totalAttempts + 1

  // Step 3: Save back
  tracker.attempts.set(expectedChar, entry)

  RETURN tracker

END ALGORITHM
--------------------------------------------------------------------------------
```

### 5.3 Algorithm: IdentifyErrorPatterns

Analyze common substitution patterns for feedback.

```
ALGORITHM IdentifyErrorPatterns
================================================================================
INPUT:
  - errorLog: ErrorEntry[] {
      expected: string,
      actual: string,
      timestamp: integer
    }

OUTPUT:
  - patterns: ErrorPattern[] {
      expected: string,
      commonMistakes: string[],   // Most common wrong inputs
      frequency: integer,          // How often this error occurs
      suggestion: string           // Helpful tip
    }

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Group errors by expected character
  errorGroups := new Map()  // expected -> [actual characters]

  FOR EACH error IN errorLog DO
    IF NOT errorGroups.has(error.expected) THEN
      errorGroups.set(error.expected, [])
    END IF
    errorGroups.get(error.expected).APPEND(error.actual)
  END FOR

  // Step 2: Analyze each character's errors
  patterns := []

  FOR EACH (expected, actuals) IN errorGroups DO
    // Count frequency of each wrong character
    mistakeCounts := new Map()
    FOR EACH actual IN actuals DO
      count := mistakeCounts.get(actual) OR 0
      mistakeCounts.set(actual, count + 1)
    END FOR

    // Sort by frequency
    sortedMistakes := SORT_BY_VALUE_DESC(mistakeCounts)
    commonMistakes := TOP_N(sortedMistakes, 3)  // Top 3 mistakes

    // Generate suggestion based on pattern
    suggestion := GenerateSuggestion(expected, commonMistakes)

    patterns.APPEND({
      expected: expected,
      commonMistakes: commonMistakes,
      frequency: LENGTH(actuals),
      suggestion: suggestion
    })
  END FOR

  // Step 3: Sort patterns by frequency (most problematic first)
  SORT patterns BY frequency DESCENDING

  RETURN patterns

END ALGORITHM

FUNCTION GenerateSuggestion(expected, commonMistakes):
  // Heuristic-based suggestions

  // Adjacent key confusion
  adjacentKeys := GetAdjacentKeys(expected)
  FOR EACH mistake IN commonMistakes DO
    IF mistake IN adjacentKeys THEN
      RETURN "Focus on finger positioning - hitting adjacent key"
    END IF
  END FOR

  // Shift modifier issues
  IF IsUpperCase(expected) AND commonMistakes[0] = LOWERCASE(expected) THEN
    RETURN "Remember to hold Shift for uppercase"
  END IF

  // Special character hints
  IF expected IN ['n with tilde', 'a with acute', ...] THEN
    RETURN "Practice special character key combinations"
  END IF

  RETURN "Keep practicing this character"
END FUNCTION
--------------------------------------------------------------------------------
```

---

## 6. Session State Machine

### 6.1 Session States Diagram

```
                         +------------------+
                         |                  |
            +----------->|      IDLE        |<-----------+
            |            |   (No session)   |            |
            |            +--------+---------+            |
            |                     |                      |
            |                     | User loads text      |
            |                     v                      |
            |            +--------+---------+            |
            |            |                  |            |
            |            |      READY       |            |
            |            |  (Text loaded)   |            |
            |            +--------+---------+            |
            |                     |                      |
            |                     | First keystroke      |
    Reset   |                     v                      |
    clicked |            +--------+---------+            |
            |            |                  |            | Complete
            |  +-------->|     ACTIVE       |-------+    | or
            |  |         |    (Typing)      |       |    | Reset
            |  |         +--------+---------+       |    |
            |  |                  |                 |    |
            |  | Resume           | Pause/Blur     |    |
            |  |                  v                 |    |
            |  |         +--------+---------+      |    |
            |  |         |                  |      |    |
            |  +---------+     PAUSED       |      |    |
            |            |                  |      |    |
            |            +------------------+      |    |
            |                                      |    |
            |                                      v    |
            |            +------------------+           |
            |            |                  |           |
            +------------+    COMPLETED     |-----------+
                         |   (Show results) |
                         +------------------+
```

### 6.2 Algorithm: SessionLifecycle

Complete session state machine implementation.

```
ALGORITHM SessionLifecycle
================================================================================
INPUT:
  - currentState: SessionState {
      status: 'IDLE' | 'READY' | 'ACTIVE' | 'PAUSED' | 'COMPLETED',
      text: string | null,
      characters: CharacterResult[],
      currentIndex: integer,
      startTime: integer | null,
      pauseTime: integer | null,
      totalPausedTime: integer,
      isComplete: boolean,
      settings: SessionSettings
    }
  - action: SessionAction {
      type: 'LOAD_TEXT' | 'START' | 'KEYSTROKE' | 'BACKSPACE' |
            'PAUSE' | 'RESUME' | 'RESET' | 'COMPLETE' | 'BLUR' | 'FOCUS',
      payload: any
    }

OUTPUT:
  - newState: SessionState
  - sideEffects: SideEffect[]  // e.g., save to storage, calculate metrics

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  sideEffects := []

  SWITCH (currentState.status, action.type):

    // ==================== IDLE STATE ====================
    CASE ('IDLE', 'LOAD_TEXT'):
      text := action.payload.text
      IF text = null OR LENGTH(text) = 0 THEN
        RETURN (currentState, [])  // Invalid, stay idle
      END IF

      // Sanitize and prepare text
      sanitizedText := SanitizeText(text)
      characters := InitializeCharacters(sanitizedText)

      newState := {
        status: 'READY',
        text: sanitizedText,
        characters: characters,
        currentIndex: 0,
        startTime: null,
        pauseTime: null,
        totalPausedTime: 0,
        isComplete: false,
        settings: action.payload.settings OR DEFAULT_SETTINGS
      }
      RETURN (newState, sideEffects)

    // ==================== READY STATE ====================
    CASE ('READY', 'KEYSTROKE'):
      // First keystroke starts the session
      timestamp := action.payload.timestamp

      newState := {
        ...currentState,
        status: 'ACTIVE',
        startTime: timestamp
      }

      // Process the keystroke
      (newState, feedback) := ProcessKeystroke(action.payload.event, newState, ...)

      sideEffects.APPEND({type: 'START_TIMER'})
      RETURN (newState, sideEffects)

    CASE ('READY', 'RESET'):
      RETURN ({...IDLE_STATE}, [])

    // ==================== ACTIVE STATE ====================
    CASE ('ACTIVE', 'KEYSTROKE'):
      (newState, feedback) := ProcessKeystroke(action.payload.event, currentState, ...)

      IF feedback.sessionComplete THEN
        newState.status := 'COMPLETED'
        sideEffects.APPEND({type: 'CALCULATE_FINAL_METRICS'})
        sideEffects.APPEND({type: 'SAVE_SESSION'})
      END IF

      RETURN (newState, sideEffects)

    CASE ('ACTIVE', 'BACKSPACE'):
      (newState, feedback) := ProcessBackspace(currentState)
      RETURN (newState, sideEffects)

    CASE ('ACTIVE', 'PAUSE'):
    CASE ('ACTIVE', 'BLUR'):
      // User explicitly paused or window lost focus
      newState := {
        ...currentState,
        status: 'PAUSED',
        pauseTime: NOW()
      }
      sideEffects.APPEND({type: 'PAUSE_TIMER'})
      sideEffects.APPEND({type: 'AUTO_SAVE', data: newState})
      RETURN (newState, sideEffects)

    CASE ('ACTIVE', 'RESET'):
      RETURN ({...IDLE_STATE}, [{type: 'CLEAR_METRICS'}])

    // ==================== PAUSED STATE ====================
    CASE ('PAUSED', 'RESUME'):
    CASE ('PAUSED', 'FOCUS'):
      // Calculate paused duration
      pausedDuration := NOW() - currentState.pauseTime

      newState := {
        ...currentState,
        status: 'ACTIVE',
        pauseTime: null,
        totalPausedTime: currentState.totalPausedTime + pausedDuration
      }
      sideEffects.APPEND({type: 'RESUME_TIMER'})
      RETURN (newState, sideEffects)

    CASE ('PAUSED', 'RESET'):
      RETURN ({...IDLE_STATE}, [{type: 'CLEAR_METRICS'}, {type: 'CLEAR_AUTO_SAVE'}])

    CASE ('PAUSED', 'KEYSTROKE'):
      // Auto-resume on keystroke
      pausedDuration := NOW() - currentState.pauseTime
      newState := {
        ...currentState,
        status: 'ACTIVE',
        pauseTime: null,
        totalPausedTime: currentState.totalPausedTime + pausedDuration
      }

      // Now process the keystroke
      (newState, feedback) := ProcessKeystroke(action.payload.event, newState, ...)
      sideEffects.APPEND({type: 'RESUME_TIMER'})
      RETURN (newState, sideEffects)

    // ==================== COMPLETED STATE ====================
    CASE ('COMPLETED', 'RESET'):
      RETURN ({...IDLE_STATE}, [{type: 'CLEAR_METRICS'}])

    CASE ('COMPLETED', 'LOAD_TEXT'):
      // Start new session with new text
      RETURN SessionLifecycle({...IDLE_STATE}, action)

    // ==================== DEFAULT ====================
    DEFAULT:
      // Invalid action for current state, ignore
      RETURN (currentState, [])

  END SWITCH

END ALGORITHM
--------------------------------------------------------------------------------
```

### 6.3 Algorithm: InitializeCharacters

Prepare character array for tracking.

```
ALGORITHM InitializeCharacters
================================================================================
INPUT:
  - text: string (sanitized)

OUTPUT:
  - characters: CharacterResult[]

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  characters := []

  FOR i := 0 TO LENGTH(text) - 1 DO
    char := text[i]

    charResult := {
      index: i,
      expected: char,
      actual: null,
      state: IF i = 0 THEN 'current' ELSE 'pending',
      timestamp: null,
      isCurrent: i = 0
    }

    characters.APPEND(charResult)
  END FOR

  RETURN characters

END ALGORITHM
--------------------------------------------------------------------------------
```

### 6.4 Algorithm: AutoSaveSession

Periodic and event-triggered session persistence.

```
ALGORITHM AutoSaveSession
================================================================================
INPUT:
  - session: SessionState
  - trigger: 'PERIODIC' | 'PAUSE' | 'BLUR' | 'BEFOREUNLOAD'

OUTPUT:
  - success: boolean

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Only save if session is meaningful
  IF session.status = 'IDLE' OR session.currentIndex = 0 THEN
    RETURN false  // Nothing to save
  END IF

  // Step 2: Prepare save data
  saveData := {
    id: session.id OR GenerateUUID(),
    savedAt: NOW(),
    trigger: trigger,

    // Core session data
    text: session.text,
    currentIndex: session.currentIndex,
    status: session.status,
    settings: session.settings,

    // Progress
    characters: SerializeCharacters(session.characters),

    // Timing
    startTime: session.startTime,
    totalPausedTime: session.totalPausedTime,

    // Partial metrics
    correctCount: CountCorrect(session.characters),
    errorCount: CountErrors(session.characters)
  }

  // Step 3: Save to localStorage
  TRY
    key := 'teclado-autosave'
    localStorage.setItem(key, JSON.stringify(saveData))
    RETURN true
  CATCH error
    LogError('Auto-save failed', error)
    RETURN false
  END TRY

END ALGORITHM

FUNCTION SerializeCharacters(characters):
  // Optimize storage - only save changed characters
  changed := []
  FOR EACH char IN characters DO
    IF char.state != 'pending' THEN
      changed.APPEND({
        i: char.index,
        s: char.state[0],  // 'c' for correct, 'i' for incorrect, etc.
        a: char.actual,
        t: char.timestamp
      })
    END IF
  END FOR
  RETURN changed
END FUNCTION
--------------------------------------------------------------------------------
```

---

## 7. Keyboard Mapper

### 7.1 Algorithm: FindKeyForCharacter

Reverse lookup: given a character, find which key produces it.

```
ALGORITHM FindKeyForCharacter
================================================================================
INPUT:
  - targetChar: string
  - layout: KeyboardLayout

OUTPUT:
  - result: {key: KeyDefinition, modifiers: ModifierState} | null

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Check for special characters first (dead key compositions)
  compositionResult := FindDeadKeyComposition(targetChar)
  IF compositionResult != null THEN
    RETURN compositionResult
  END IF

  // Step 2: Search through all keys
  FOR EACH row IN layout.rows DO
    FOR EACH key IN row DO

      // Check normal (no modifier)
      IF key.normal = targetChar THEN
        RETURN {
          key: key,
          modifiers: {shift: false, altGr: false, ctrl: false, meta: false}
        }
      END IF

      // Check shift
      IF key.shift = targetChar THEN
        RETURN {
          key: key,
          modifiers: {shift: true, altGr: false, ctrl: false, meta: false}
        }
      END IF

      // Check AltGr
      IF key.altGr = targetChar THEN
        RETURN {
          key: key,
          modifiers: {shift: false, altGr: true, ctrl: false, meta: false}
        }
      END IF

      // Check Shift+AltGr
      IF key.shiftAltGr = targetChar THEN
        RETURN {
          key: key,
          modifiers: {shift: true, altGr: true, ctrl: false, meta: false}
        }
      END IF

    END FOR
  END FOR

  // Step 3: Character not found in layout
  RETURN null

END ALGORITHM
--------------------------------------------------------------------------------
```

### 7.2 Algorithm: FindDeadKeyComposition

Find dead key sequence for composed characters.

```
ALGORITHM FindDeadKeyComposition
================================================================================
INPUT:
  - targetChar: string (e.g., 'a with acute')

OUTPUT:
  - result: {
      deadKey: KeyDefinition,
      deadKeyModifiers: ModifierState,
      baseKey: KeyDefinition,
      baseKeyModifiers: ModifierState
    } | null

CONSTANTS:
  DECOMPOSITIONS := {
    'a with acute': {deadKey: 'acute', base: 'a'},
    'e with acute': {deadKey: 'acute', base: 'e'},
    'i with acute': {deadKey: 'acute', base: 'i'},
    'o with acute': {deadKey: 'acute', base: 'o'},
    'u with acute': {deadKey: 'acute', base: 'u'},
    'A with acute': {deadKey: 'acute', base: 'A'},
    'E with acute': {deadKey: 'acute', base: 'E'},
    'I with acute': {deadKey: 'acute', base: 'I'},
    'O with acute': {deadKey: 'acute', base: 'O'},
    'U with acute': {deadKey: 'acute', base: 'U'},
    'u with dieresis': {deadKey: 'dieresis', base: 'u'},
    'U with dieresis': {deadKey: 'dieresis', base: 'U'},
    // ... other compositions
  }

  DEAD_KEY_LOCATIONS := {
    'acute': {code: 'BracketLeft', shift: false},
    'dieresis': {code: 'BracketLeft', shift: true},
    'grave': {code: 'Backslash', altGr: true},
    'circumflex': {code: 'Quote', shift: true, altGr: true}
  }

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Look up decomposition
  decomp := DECOMPOSITIONS[targetChar]
  IF decomp = null THEN
    RETURN null
  END IF

  // Step 2: Find dead key location
  deadKeyInfo := DEAD_KEY_LOCATIONS[decomp.deadKey]
  deadKeyDef := layout.GetKeyByCode(deadKeyInfo.code)
  deadKeyMods := {
    shift: deadKeyInfo.shift OR false,
    altGr: deadKeyInfo.altGr OR false,
    ctrl: false,
    meta: false
  }

  // Step 3: Find base key location
  baseKeyResult := FindKeyForCharacter(decomp.base, layout)
  IF baseKeyResult = null THEN
    RETURN null
  END IF

  RETURN {
    deadKey: deadKeyDef,
    deadKeyModifiers: deadKeyMods,
    baseKey: baseKeyResult.key,
    baseKeyModifiers: baseKeyResult.modifiers
  }

END ALGORITHM
--------------------------------------------------------------------------------
```

### 7.3 Algorithm: GetCharacterForModifiers

Forward lookup: given key and modifiers, get the character.

```
ALGORITHM GetCharacterForModifiers
================================================================================
INPUT:
  - keyDef: KeyDefinition
  - modifiers: ModifierState

OUTPUT:
  - character: string | null

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Priority order: Shift+AltGr > AltGr > Shift > Normal

  IF modifiers.altGr AND modifiers.shift AND keyDef.shiftAltGr != null THEN
    RETURN keyDef.shiftAltGr
  END IF

  IF modifiers.altGr AND keyDef.altGr != null THEN
    RETURN keyDef.altGr
  END IF

  IF modifiers.shift THEN
    RETURN keyDef.shift
  END IF

  RETURN keyDef.normal

END ALGORITHM
--------------------------------------------------------------------------------
```

---

## 8. Error Tracking and Analysis

### 8.1 Algorithm: RecordError

Log an error for pattern analysis.

```
ALGORITHM RecordError
================================================================================
INPUT:
  - tracker: ErrorTracker {
      errors: ErrorEntry[],
      byCharacter: Map<string, integer>,
      substitutions: Map<string, Map<string, integer>>
    }
  - expected: string
  - actual: string
  - timestamp: integer
  - position: integer

OUTPUT:
  - updatedTracker: ErrorTracker

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Step 1: Log the error
  entry := {
    expected: expected,
    actual: actual,
    timestamp: timestamp,
    position: position
  }
  tracker.errors.APPEND(entry)

  // Step 2: Update character error count
  count := tracker.byCharacter.get(expected) OR 0
  tracker.byCharacter.set(expected, count + 1)

  // Step 3: Update substitution pattern
  IF NOT tracker.substitutions.has(expected) THEN
    tracker.substitutions.set(expected, new Map())
  END IF

  subMap := tracker.substitutions.get(expected)
  subCount := subMap.get(actual) OR 0
  subMap.set(actual, subCount + 1)

  // Step 4: Trim error log if too long (keep last 1000)
  IF LENGTH(tracker.errors) > 1000 THEN
    tracker.errors := tracker.errors.SLICE(-1000)
  END IF

  RETURN tracker

END ALGORITHM
--------------------------------------------------------------------------------
```

### 8.2 Algorithm: GenerateImprovementSuggestions

Analyze errors to provide actionable feedback.

```
ALGORITHM GenerateImprovementSuggestions
================================================================================
INPUT:
  - errorTracker: ErrorTracker
  - sessionMetrics: {wpm: float, accuracy: float, duration: integer}

OUTPUT:
  - suggestions: Suggestion[] {
      priority: 'high' | 'medium' | 'low',
      category: string,
      message: string,
      practiceChars: string[]
    }

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  suggestions := []

  // Step 1: Analyze most problematic characters
  problematicChars := GetMostProblematicCharacters(errorTracker, TOP_N := 5)

  IF LENGTH(problematicChars) > 0 THEN
    suggestions.APPEND({
      priority: 'high',
      category: 'character-practice',
      message: "Focus on these challenging characters",
      practiceChars: problematicChars
    })
  END IF

  // Step 2: Detect shift key issues
  shiftErrors := CountShiftErrors(errorTracker)
  IF shiftErrors > 10 THEN
    suggestions.APPEND({
      priority: 'medium',
      category: 'modifier-keys',
      message: "Practice holding Shift for uppercase and symbols",
      practiceChars: GetShiftCharacters()
    })
  END IF

  // Step 3: Detect AltGr issues (special characters)
  altGrErrors := CountAltGrErrors(errorTracker)
  IF altGrErrors > 5 THEN
    suggestions.APPEND({
      priority: 'medium',
      category: 'special-characters',
      message: "Practice AltGr combinations for special characters (@, #, etc.)",
      practiceChars: GetAltGrCharacters()
    })
  END IF

  // Step 4: Detect dead key composition issues
  accentErrors := CountAccentErrors(errorTracker)
  IF accentErrors > 5 THEN
    suggestions.APPEND({
      priority: 'high',
      category: 'accents',
      message: "Practice accent composition (dead key + vowel)",
      practiceChars: ['a with acute', 'e with acute', 'i with acute', 'o with acute', 'u with acute']
    })
  END IF

  // Step 5: Adjacent key confusion
  adjacentKeyPatterns := DetectAdjacentKeyConfusion(errorTracker)
  FOR EACH pattern IN adjacentKeyPatterns DO
    suggestions.APPEND({
      priority: 'low',
      category: 'finger-positioning',
      message: "Frequently confusing " + pattern.char1 + " and " + pattern.char2,
      practiceChars: [pattern.char1, pattern.char2]
    })
  END FOR

  // Step 6: Speed vs accuracy trade-off
  IF sessionMetrics.wpm > 40 AND sessionMetrics.accuracy < 90 THEN
    suggestions.APPEND({
      priority: 'high',
      category: 'pacing',
      message: "Consider slowing down to improve accuracy",
      practiceChars: []
    })
  END IF

  // Sort by priority
  SORT suggestions BY PriorityValue(priority) DESCENDING

  RETURN suggestions

END ALGORITHM

FUNCTION PriorityValue(priority):
  SWITCH priority:
    CASE 'high': RETURN 3
    CASE 'medium': RETURN 2
    CASE 'low': RETURN 1
  END SWITCH
END FUNCTION
--------------------------------------------------------------------------------
```

---

## 9. Edge Cases and Error Handling

### 9.1 Edge Case Matrix

| Scenario | Expected Behavior | Algorithm |
|----------|-------------------|-----------|
| Empty text | Stay in IDLE, show error | SessionLifecycle |
| Single character text | Normal processing | ProcessKeystroke |
| Very long text (>10K chars) | Truncate with warning | SanitizeText |
| Text with only spaces | Accept but warn | SanitizeText |
| Rapid repeated keys | Debounce if < 20ms apart | ProcessKeystroke |
| Dead key + Enter | Output dead key char, ignore Enter | HandleDeadKey |
| Backspace at position 0 | Ignore, no state change | ProcessBackspace |
| Multiple dead keys in sequence | Output first, start second | HandleDeadKey |
| Browser loses focus mid-session | Auto-pause, auto-save | SessionLifecycle |
| LocalStorage full | Warn user, continue without save | AutoSaveSession |

### 9.2 Algorithm: HandleEdgeCases

Centralized edge case handling.

```
ALGORITHM HandleEdgeCases
================================================================================
INPUT:
  - event: KeyboardEvent
  - state: SessionState
  - context: {
      lastKeystrokeTime: integer,
      deadKeyState: DeadKeyState
    }

OUTPUT:
  - action: 'PROCESS' | 'IGNORE' | 'SPECIAL_HANDLING'
  - reason: string | null
  - modifiedEvent: KeyboardEvent | null

--------------------------------------------------------------------------------
BEGIN ALGORITHM:

  // Edge Case 1: Debounce rapid keystrokes
  timeSinceLastKey := event.timestamp - context.lastKeystrokeTime
  IF timeSinceLastKey < 20 THEN  // 20ms debounce
    // Could be key repeat or accidental double-tap
    IF event.repeat THEN
      RETURN ('IGNORE', 'key-repeat', null)
    END IF
  END IF

  // Edge Case 2: Dead key followed by Enter
  IF context.deadKeyState.active AND event.code = 'Enter' THEN
    // Output the dead key character, then handle Enter normally
    RETURN ('SPECIAL_HANDLING', 'dead-key-enter', {
      outputDeadKey: true,
      thenProcess: event
    })
  END IF

  // Edge Case 3: Dead key followed by Escape
  IF context.deadKeyState.active AND event.code = 'Escape' THEN
    // Cancel dead key state
    RETURN ('SPECIAL_HANDLING', 'dead-key-cancel', {
      cancelDeadKey: true
    })
  END IF

  // Edge Case 4: Ctrl+key combinations (ignore most)
  IF event.ctrlKey AND NOT event.altKey THEN
    // Allow Ctrl+Backspace for word deletion in lenient modes
    IF event.code = 'Backspace' AND state.settings.allowWordDeletion THEN
      RETURN ('SPECIAL_HANDLING', 'word-delete', event)
    END IF
    // Otherwise ignore (Ctrl+C, Ctrl+V, etc. shouldn't affect typing)
    RETURN ('IGNORE', 'ctrl-combination', null)
  END IF

  // Edge Case 5: Function keys
  IF event.code.startsWith('F') AND IsNumeric(event.code.substring(1)) THEN
    RETURN ('IGNORE', 'function-key', null)
  END IF

  // Edge Case 6: Unknown key codes
  IF GetKeyDefinition(event.code) = null AND NOT IsModifierKey(event.code) THEN
    // Log for debugging but don't crash
    LogWarning('Unknown key code: ' + event.code)
    RETURN ('IGNORE', 'unknown-key', null)
  END IF

  // Default: Process normally
  RETURN ('PROCESS', null, event)

END ALGORITHM
--------------------------------------------------------------------------------
```

---

## 10. Performance Considerations

### 10.1 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| ProcessKeystroke | O(1) | O(1) | Constant time operations |
| HandleDeadKey | O(1) | O(1) | Lookup table access |
| CalculateWPM | O(1) | O(1) | Simple arithmetic |
| CalculateRollingWPM | O(n) | O(n) | n = keystrokes in window |
| CalculateAccuracy | O(n) | O(k) | n = attempts, k = unique chars |
| FindKeyForCharacter | O(k) | O(1) | k = keys in layout (~100) |
| IdentifyErrorPatterns | O(e log e) | O(e) | e = errors (sorting) |

### 10.2 Optimization Points

```
PERFORMANCE CRITICAL PATH (must complete in <16ms):
================================================================================

1. Event Capture         [~0.5ms]
   - Browser KeyboardEvent fired
   - React event handler invoked

2. Edge Case Check       [~0.1ms]
   - HandleEdgeCases()
   - Quick rejection of irrelevant events

3. Dead Key Processing   [~0.2ms]
   - HandleDeadKey()
   - Lookup table operation

4. Character Validation  [~0.3ms]
   - ValidateCharacter()
   - Unicode normalization (pre-computed if possible)

5. State Update          [~0.5ms]
   - ProcessKeystroke()
   - Immutable state creation

6. Metrics Update        [~0.5ms]
   - Rolling WPM calculation
   - Accuracy update

7. React Reconciliation  [~8-10ms]
   - Virtual DOM diff
   - DOM updates

8. Paint                 [~2-4ms]
   - Browser layout/paint
   - CSS transitions

TOTAL TARGET: <16ms (60fps)
================================================================================

OPTIMIZATION STRATEGIES:

1. Memoization:
   - Cache keyboard layout lookups
   - Memoize FindKeyForCharacter results
   - Pre-compute dead key compositions

2. Batch Updates:
   - Use requestAnimationFrame for metrics display
   - Batch multiple state updates when possible

3. Selective Rendering:
   - Only re-render changed characters
   - Use React.memo for CharacterSpan components
   - Virtualize for long texts (>500 chars visible)

4. Avoid Expensive Operations:
   - No deep object cloning in hot path
   - Use immer or similar for immutable updates
   - Defer non-critical calculations (error patterns)
```

---

## 11. Testing Scenarios

### 11.1 Unit Test Cases

```
TEST SUITE: Typing Engine
================================================================================

DESCRIBE ProcessKeystroke:
  TEST "should mark correct character and advance":
    state := CreateSession("hello")
    (newState, feedback) := ProcessKeystroke('h', state)
    ASSERT newState.characters[0].state = 'correct'
    ASSERT newState.currentIndex = 1
    ASSERT feedback.isCorrect = true

  TEST "should mark incorrect character in lenient mode":
    state := CreateSession("hello", mode: 'lenient')
    (newState, feedback) := ProcessKeystroke('x', state)
    ASSERT newState.characters[0].state = 'incorrect'
    ASSERT newState.currentIndex = 1  // Still advances
    ASSERT feedback.isCorrect = false

  TEST "should NOT advance on error in strict mode":
    state := CreateSession("hello", mode: 'strict')
    (newState, feedback) := ProcessKeystroke('x', state)
    ASSERT newState.characters[0].state = 'incorrect'
    ASSERT newState.currentIndex = 0  // Does not advance
    ASSERT feedback.isCorrect = false

  TEST "should handle Unicode correctly":
    state := CreateSession("espanol with n-tilde")
    // ... type until n-tilde position
    (newState, feedback) := ProcessKeystroke('n with tilde', state)
    ASSERT feedback.isCorrect = true

  TEST "should complete session on last character":
    state := CreateSession("a")
    (newState, feedback) := ProcessKeystroke('a', state)
    ASSERT newState.isComplete = true
    ASSERT feedback.sessionComplete = true

DESCRIBE HandleDeadKey:
  TEST "should enter AWAITING_BASE state on dead key":
    state := {status: 'IDLE', type: null, pendingChar: null}
    (newState, output) := HandleDeadKey('BracketLeft', 'acute', state, true, 'acute')
    ASSERT newState.status = 'AWAITING_BASE'
    ASSERT newState.type = 'acute'
    ASSERT output = null

  TEST "should compose acute + a = a with acute":
    state := {status: 'AWAITING_BASE', type: 'acute', pendingChar: 'acute'}
    (newState, output) := HandleDeadKey('KeyA', 'a', state, false, null)
    ASSERT newState.status = 'IDLE'
    ASSERT output = 'a with acute'

  TEST "should output dead char + consonant when no composition":
    state := {status: 'AWAITING_BASE', type: 'acute', pendingChar: 'acute'}
    (newState, output) := HandleDeadKey('KeyB', 'b', state, false, null)
    ASSERT output = 'acute accent' + 'b'

  TEST "should output literal dead key on double press":
    state := {status: 'AWAITING_BASE', type: 'acute', pendingChar: 'acute'}
    (newState, output) := HandleDeadKey('BracketLeft', 'acute', state, true, 'acute')
    ASSERT output = 'acute accent'
    ASSERT newState.status = 'IDLE'

DESCRIBE CalculateWPM:
  TEST "should calculate correct WPM for simple case":
    result := CalculateWPM(
      charactersTyped: 50,  // 10 words
      errors: 0,
      elapsedMs: 60000      // 1 minute
    )
    ASSERT result.grossWPM = 10.0
    ASSERT result.netWPM = 10.0

  TEST "should penalize errors in net WPM":
    result := CalculateWPM(
      charactersTyped: 50,
      errors: 5,            // 1 word penalty
      elapsedMs: 60000
    )
    ASSERT result.grossWPM = 10.0
    ASSERT result.netWPM = 9.0

  TEST "should handle zero time gracefully":
    result := CalculateWPM(50, 0, 0)
    ASSERT result.grossWPM = 0
    ASSERT result.netWPM = 0

  TEST "should never return negative net WPM":
    result := CalculateWPM(10, 100, 60000)
    ASSERT result.netWPM >= 0

DESCRIBE SessionLifecycle:
  TEST "should transition IDLE -> READY on LOAD_TEXT":
    state := {status: 'IDLE'}
    (newState, effects) := SessionLifecycle(state, {type: 'LOAD_TEXT', payload: {text: 'hello'}})
    ASSERT newState.status = 'READY'
    ASSERT newState.text = 'hello'

  TEST "should transition READY -> ACTIVE on first keystroke":
    state := {status: 'READY', text: 'hello', characters: [...]}
    (newState, effects) := SessionLifecycle(state, {type: 'KEYSTROKE', payload: {...}})
    ASSERT newState.status = 'ACTIVE'
    ASSERT newState.startTime != null

  TEST "should auto-save on BLUR":
    state := {status: 'ACTIVE', currentIndex: 5}
    (newState, effects) := SessionLifecycle(state, {type: 'BLUR', payload: {}})
    ASSERT newState.status = 'PAUSED'
    ASSERT effects.contains({type: 'AUTO_SAVE'})

================================================================================
```

---

## 12. Summary

This pseudocode document provides the algorithmic foundation for Teclado LATAM's typing practice engine. Key design decisions:

1. **Performance-First Design**: All critical path operations target <16ms total processing time
2. **State Machine Approach**: Clear state transitions for session management and dead key handling
3. **Separation of Concerns**: Each algorithm handles one specific responsibility
4. **Edge Case Coverage**: Comprehensive handling of unusual input scenarios
5. **Testability**: Pure functions with clear inputs/outputs for easy unit testing

The next phase (Refinement) will implement these algorithms in TypeScript with full test coverage.

---

*End of Pseudocode Document*
