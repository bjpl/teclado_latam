# SPARC Architecture: Teclado LATAM

**Project:** Teclado LATAM - LATAM Spanish Keyboard Typing Practice Application
**Version:** 1.0.0
**Status:** Architecture Phase
**Created:** 2026-01-23
**Author:** Strategic Planning Agent

---

## 1. Architecture Overview

### 1.1 High-Level System Architecture

Teclado LATAM follows a **clean, modular architecture** built on Next.js 14+ App Router, emphasizing:

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data
- **Unidirectional Data Flow**: Predictable state management
- **Performance First**: Optimized for sub-16ms keystroke processing
- **Progressive Enhancement**: Core functionality works without JavaScript enhancements

```
+------------------------------------------------------------------+
|                        PRESENTATION LAYER                         |
|  +------------+  +----------------+  +-------------+  +--------+  |
|  | TextDisplay|  |VirtualKeyboard |  | MetricsPanel|  |Settings|  |
|  +-----+------+  +-------+--------+  +------+------+  +----+---+  |
|        |                 |                  |              |      |
+--------|-----------------|------------------|--------------|------+
         |                 |                  |              |
+--------|-----------------|------------------|--------------|------+
|        v                 v                  v              v      |
|                      APPLICATION LAYER                            |
|  +------------------+  +-------------------+  +-----------------+ |
|  | useTypingSession |  | useKeyboardEvents |  | useSessionStore | |
|  +--------+---------+  +---------+---------+  +--------+--------+ |
|           |                      |                     |          |
+-----------|----------------------|---------------------|----------+
            |                      |                     |
+-----------|----------------------|---------------------|----------+
|           v                      v                     v          |
|                        DOMAIN LAYER                               |
|  +----------------+  +----------------+  +----------------------+ |
|  | TypingEngine   |  | KeyboardLayout |  | MetricsCalculator    | |
|  | - validate()   |  | - mapKey()     |  | - calculateWPM()     | |
|  | - process()    |  | - handleDead() |  | - calculateAccuracy()| |
|  +----------------+  +----------------+  +----------------------+ |
|                                                                   |
+-------------------------------------------------------------------+
            |                      |                     |
+-----------|----------------------|---------------------|----------+
|           v                      v                     v          |
|                    INFRASTRUCTURE LAYER                           |
|  +----------------+  +----------------+  +--------------------+   |
|  | LocalStorage   |  | IndexedDB      |  | BrowserKeyboardAPI |   |
|  | Adapter        |  | SessionStore   |  | EventCapture       |   |
|  +----------------+  +----------------+  +--------------------+   |
+-------------------------------------------------------------------+
```

### 1.2 Design Principles

1. **Single Responsibility**: Each module handles one concern
2. **Dependency Inversion**: Core logic independent of frameworks
3. **Interface Segregation**: Small, focused interfaces
4. **Open/Closed**: Extensible for new layouts without modification
5. **Zero External Runtime Dependencies**: Core typing engine is pure TypeScript

---

## 2. Directory Structure

```
teclado_latam/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Main practice page
│   │   ├── loading.tsx               # Loading skeleton
│   │   ├── error.tsx                 # Error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   ├── globals.css               # Global styles
│   │   ├── history/
│   │   │   └── page.tsx              # Session history page
│   │   └── settings/
│   │       └── page.tsx              # User settings page
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # Base UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── keyboard/                 # Keyboard visualization
│   │   │   ├── VirtualKeyboard.tsx   # Main keyboard component
│   │   │   ├── KeyboardRow.tsx       # Row of keys
│   │   │   ├── Key.tsx               # Individual key
│   │   │   ├── KeyLabel.tsx          # Key character labels
│   │   │   ├── FingerGuide.tsx       # Optional finger hints
│   │   │   └── index.ts
│   │   │
│   │   ├── practice/                 # Typing practice
│   │   │   ├── TextDisplay.tsx       # Practice text with highlighting
│   │   │   ├── TextInput.tsx         # Hidden input for capture
│   │   │   ├── CharacterSpan.tsx     # Individual character display
│   │   │   ├── CursorIndicator.tsx   # Typing cursor
│   │   │   ├── SessionControls.tsx   # Start/pause/reset buttons
│   │   │   └── index.ts
│   │   │
│   │   ├── metrics/                  # Statistics display
│   │   │   ├── MetricsPanel.tsx      # Real-time metrics
│   │   │   ├── WPMDisplay.tsx        # Words per minute
│   │   │   ├── AccuracyDisplay.tsx   # Accuracy percentage
│   │   │   ├── SessionResults.tsx    # End-of-session results
│   │   │   ├── ProgressChart.tsx     # Historical charts
│   │   │   └── index.ts
│   │   │
│   │   ├── settings/                 # Settings UI
│   │   │   ├── SettingsPanel.tsx     # Settings container
│   │   │   ├── ThemeToggle.tsx       # Light/dark mode
│   │   │   ├── PracticeModeSelect.tsx
│   │   │   ├── DisplaySettings.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── history/                  # Session history
│   │   │   ├── SessionList.tsx       # List of past sessions
│   │   │   ├── SessionCard.tsx       # Individual session summary
│   │   │   ├── SessionDetail.tsx     # Detailed session view
│   │   │   └── index.ts
│   │   │
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Navigation.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTypingSession.ts       # Main session hook
│   │   ├── useKeyboardEvents.ts      # Keyboard event handling
│   │   ├── useDeadKeys.ts            # Dead key state machine
│   │   ├── useMetrics.ts             # Real-time metrics calculation
│   │   ├── useLocalStorage.ts        # Persistent settings
│   │   ├── useSessionHistory.ts      # IndexedDB session storage
│   │   ├── useTheme.ts               # Theme management
│   │   └── index.ts
│   │
│   ├── lib/                          # Core business logic
│   │   ├── typing-engine/            # Typing engine module
│   │   │   ├── TypingEngine.ts       # Main engine class
│   │   │   ├── CharacterValidator.ts # Character comparison
│   │   │   ├── PositionTracker.ts    # Cursor position
│   │   │   ├── ErrorTracker.ts       # Error management
│   │   │   ├── types.ts              # Engine types
│   │   │   └── index.ts
│   │   │
│   │   ├── keyboard/                 # Keyboard layout module
│   │   │   ├── layouts/
│   │   │   │   └── latam.ts          # LATAM layout definition
│   │   │   ├── KeyboardMapper.ts     # Key code to character
│   │   │   ├── DeadKeyHandler.ts     # Dead key state machine
│   │   │   ├── ModifierTracker.ts    # Shift/AltGr tracking
│   │   │   ├── types.ts              # Keyboard types
│   │   │   └── index.ts
│   │   │
│   │   ├── metrics/                  # Metrics calculation module
│   │   │   ├── WPMCalculator.ts      # WPM algorithms
│   │   │   ├── AccuracyCalculator.ts # Accuracy algorithms
│   │   │   ├── ErrorAnalyzer.ts      # Error pattern analysis
│   │   │   ├── TimeTracker.ts        # Time management
│   │   │   ├── types.ts              # Metrics types
│   │   │   └── index.ts
│   │   │
│   │   ├── session/                  # Session management module
│   │   │   ├── SessionManager.ts     # Session lifecycle
│   │   │   ├── SessionSerializer.ts  # Serialization for storage
│   │   │   ├── types.ts              # Session types
│   │   │   └── index.ts
│   │   │
│   │   ├── storage/                  # Storage adapters
│   │   │   ├── LocalStorageAdapter.ts
│   │   │   ├── IndexedDBAdapter.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── utils/                    # Utility functions
│   │       ├── textProcessing.ts     # Text sanitization/normalization
│   │       ├── debounce.ts
│   │       ├── throttle.ts
│   │       └── index.ts
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── session.ts                # Session types
│   │   ├── keyboard.ts               # Keyboard types
│   │   ├── metrics.ts                # Metrics types
│   │   ├── settings.ts               # Settings types
│   │   └── index.ts
│   │
│   ├── stores/                       # State management
│   │   ├── SettingsContext.tsx       # Settings context provider
│   │   ├── ThemeContext.tsx          # Theme context provider
│   │   └── index.ts
│   │
│   └── data/                         # Static data
│       └── sampleTexts.ts            # Pre-loaded practice texts
│
├── public/                           # Static assets
│   ├── fonts/
│   └── icons/
│
├── tests/                            # Test files (mirrors src/)
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── typing-engine/
│   │   │   ├── keyboard/
│   │   │   └── metrics/
│   │   └── hooks/
│   ├── integration/
│   └── e2e/
│
├── docs/                             # Documentation
│   └── sparc/
│       ├── 01-specification.md
│       ├── 02-architecture.md        # This document
│       ├── 03-pseudocode.md
│       └── 04-refinement.md
│
├── config/                           # Configuration files
│   └── tailwind.config.ts
│
├── scripts/                          # Build/utility scripts
│
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Core Modules

### 3.1 Typing Engine Module (`src/lib/typing-engine/`)

The typing engine is the heart of the application, responsible for processing keystrokes and tracking user progress.

#### 3.1.1 Module Structure

```typescript
// src/lib/typing-engine/types.ts

export type CharacterState = 'pending' | 'current' | 'correct' | 'incorrect' | 'corrected';

export interface CharacterResult {
  index: number;
  expected: string;
  actual: string | null;
  state: CharacterState;
  timestamp: number | null;
}

export interface TypingState {
  text: string;
  characters: CharacterResult[];
  currentIndex: number;
  isComplete: boolean;
  isStarted: boolean;
  isPaused: boolean;
}

export interface TypingEngineConfig {
  mode: 'strict' | 'lenient' | 'no-backspace';
  allowCorrections: boolean;
}

export interface ProcessResult {
  accepted: boolean;
  newState: TypingState;
  isCorrect: boolean;
  isComplete: boolean;
}
```

#### 3.1.2 TypingEngine Class

```typescript
// src/lib/typing-engine/TypingEngine.ts

export class TypingEngine {
  private state: TypingState;
  private config: TypingEngineConfig;
  private validator: CharacterValidator;
  private errorTracker: ErrorTracker;

  constructor(text: string, config: TypingEngineConfig) {
    this.config = config;
    this.validator = new CharacterValidator();
    this.errorTracker = new ErrorTracker();
    this.state = this.initializeState(text);
  }

  private initializeState(text: string): TypingState {
    const characters: CharacterResult[] = text.split('').map((char, index) => ({
      index,
      expected: char,
      actual: null,
      state: index === 0 ? 'current' : 'pending',
      timestamp: null,
    }));

    return {
      text,
      characters,
      currentIndex: 0,
      isComplete: false,
      isStarted: false,
      isPaused: false,
    };
  }

  /**
   * Process an incoming character
   * Returns result indicating if character was accepted and new state
   */
  public processCharacter(char: string, timestamp: number): ProcessResult {
    if (this.state.isComplete || this.state.isPaused) {
      return { accepted: false, newState: this.state, isCorrect: false, isComplete: false };
    }

    if (!this.state.isStarted) {
      this.state = { ...this.state, isStarted: true };
    }

    const currentChar = this.state.characters[this.state.currentIndex];
    const isCorrect = this.validator.validate(currentChar.expected, char);

    if (this.config.mode === 'strict' && !isCorrect) {
      // In strict mode, mark as incorrect but don't advance
      this.state.characters[this.state.currentIndex] = {
        ...currentChar,
        actual: char,
        state: 'incorrect',
        timestamp,
      };
      this.errorTracker.recordError(currentChar.expected, char);
      return { accepted: true, newState: this.state, isCorrect: false, isComplete: false };
    }

    // Update current character
    this.state.characters[this.state.currentIndex] = {
      ...currentChar,
      actual: char,
      state: isCorrect ? 'correct' : 'incorrect',
      timestamp,
    };

    if (!isCorrect) {
      this.errorTracker.recordError(currentChar.expected, char);
    }

    // Advance to next character
    const nextIndex = this.state.currentIndex + 1;
    const isComplete = nextIndex >= this.state.characters.length;

    if (!isComplete) {
      this.state.characters[nextIndex] = {
        ...this.state.characters[nextIndex],
        state: 'current',
      };
    }

    this.state = {
      ...this.state,
      currentIndex: nextIndex,
      isComplete,
    };

    return { accepted: true, newState: this.state, isCorrect, isComplete };
  }

  /**
   * Handle backspace - only in modes that allow correction
   */
  public processBackspace(): ProcessResult {
    if (this.config.mode === 'no-backspace' || this.state.currentIndex === 0) {
      return { accepted: false, newState: this.state, isCorrect: false, isComplete: false };
    }

    const prevIndex = this.state.currentIndex - 1;
    const prevChar = this.state.characters[prevIndex];

    // Mark current as pending
    if (this.state.currentIndex < this.state.characters.length) {
      this.state.characters[this.state.currentIndex] = {
        ...this.state.characters[this.state.currentIndex],
        state: 'pending',
      };
    }

    // Mark previous as current (corrected if it was incorrect)
    this.state.characters[prevIndex] = {
      ...prevChar,
      actual: null,
      state: prevChar.state === 'incorrect' ? 'corrected' : 'current',
      timestamp: null,
    };

    this.state = {
      ...this.state,
      currentIndex: prevIndex,
      isComplete: false,
    };

    return { accepted: true, newState: this.state, isCorrect: false, isComplete: false };
  }

  public getState(): TypingState {
    return this.state;
  }

  public getErrorStats(): ErrorStats {
    return this.errorTracker.getStats();
  }

  public pause(): void {
    this.state = { ...this.state, isPaused: true };
  }

  public resume(): void {
    this.state = { ...this.state, isPaused: false };
  }

  public reset(): void {
    this.state = this.initializeState(this.state.text);
    this.errorTracker.reset();
  }
}
```

#### 3.1.3 Character Validator

```typescript
// src/lib/typing-engine/CharacterValidator.ts

export class CharacterValidator {
  /**
   * Validates if the typed character matches the expected character
   * Handles normalization for Unicode equivalence
   */
  public validate(expected: string, actual: string): boolean {
    // Normalize both to NFC form for consistent comparison
    const normalizedExpected = expected.normalize('NFC');
    const normalizedActual = actual.normalize('NFC');

    return normalizedExpected === normalizedActual;
  }

  /**
   * Check if character is a special character requiring modifiers
   */
  public requiresModifier(char: string): boolean {
    // Characters that typically require Shift or AltGr on LATAM layout
    const shiftChars = '!"#$%&/()=?QWERTYUIOPASDFGHJKLZXCVBNM*;:_>';
    const altGrChars = '@#~|\\[]{}';

    return shiftChars.includes(char) || altGrChars.includes(char);
  }
}
```

#### 3.1.4 Error Tracker

```typescript
// src/lib/typing-engine/ErrorTracker.ts

export interface ErrorStats {
  totalErrors: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  errorsByCharacter: Map<string, number>;
  errorPatterns: Map<string, string[]>; // expected -> [actual attempts]
}

export class ErrorTracker {
  private errors: Map<string, number> = new Map();
  private patterns: Map<string, string[]> = new Map();
  private correctedCount: number = 0;

  public recordError(expected: string, actual: string): void {
    // Track error count per character
    const count = this.errors.get(expected) || 0;
    this.errors.set(expected, count + 1);

    // Track substitution patterns
    const attempts = this.patterns.get(expected) || [];
    attempts.push(actual);
    this.patterns.set(expected, attempts);
  }

  public recordCorrection(): void {
    this.correctedCount++;
  }

  public getStats(): ErrorStats {
    let totalErrors = 0;
    this.errors.forEach(count => totalErrors += count);

    return {
      totalErrors,
      correctedErrors: this.correctedCount,
      uncorrectedErrors: totalErrors - this.correctedCount,
      errorsByCharacter: new Map(this.errors),
      errorPatterns: new Map(this.patterns),
    };
  }

  public reset(): void {
    this.errors.clear();
    this.patterns.clear();
    this.correctedCount = 0;
  }
}
```

---

### 3.2 Keyboard Layout Module (`src/lib/keyboard/`)

Handles LATAM keyboard layout definition, key mapping, and dead key composition.

#### 3.2.1 Module Structure

```typescript
// src/lib/keyboard/types.ts

export type FingerPosition =
  | 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index'
  | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky'
  | 'thumb';

export type DeadKeyType = 'acute' | 'dieresis' | 'grave' | 'circumflex' | null;

export interface KeyDefinition {
  code: string;           // Physical key code (KeyQ, KeyA, etc.)
  row: number;            // 0-4 (top to bottom)
  position: number;       // Position in row (0-based)
  width: number;          // Width in units (1 = standard key)

  // Characters by modifier state
  normal: string;
  shift: string;
  altGr: string | null;
  shiftAltGr: string | null;

  // Special properties
  isDeadKey: boolean;
  deadKeyType: DeadKeyType;
  finger: FingerPosition;
}

export interface KeyboardLayout {
  name: string;
  locale: string;
  rows: KeyDefinition[][];
}

export interface ModifierState {
  shift: boolean;
  altGr: boolean;
  ctrl: boolean;
  meta: boolean;
}

export interface DeadKeyState {
  active: boolean;
  type: DeadKeyType;
  baseKey: string | null;
}
```

#### 3.2.2 LATAM Layout Definition

```typescript
// src/lib/keyboard/layouts/latam.ts

import { KeyboardLayout, KeyDefinition } from '../types';

export const LATAM_LAYOUT: KeyboardLayout = {
  name: 'Latin American Spanish',
  locale: 'es-419',
  rows: [
    // Row 0: Number row
    [
      { code: 'Backquote', row: 0, position: 0, width: 1, normal: '|', shift: '°', altGr: '¬', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'Digit1', row: 0, position: 1, width: 1, normal: '1', shift: '!', altGr: '|', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'Digit2', row: 0, position: 2, width: 1, normal: '2', shift: '"', altGr: '@', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-ring' },
      { code: 'Digit3', row: 0, position: 3, width: 1, normal: '3', shift: '#', altGr: '#', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-middle' },
      { code: 'Digit4', row: 0, position: 4, width: 1, normal: '4', shift: '$', altGr: '~', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'Digit5', row: 0, position: 5, width: 1, normal: '5', shift: '%', altGr: '€', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'Digit6', row: 0, position: 6, width: 1, normal: '6', shift: '&', altGr: '¬', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'Digit7', row: 0, position: 7, width: 1, normal: '7', shift: '/', altGr: '{', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'Digit8', row: 0, position: 8, width: 1, normal: '8', shift: '(', altGr: '[', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-middle' },
      { code: 'Digit9', row: 0, position: 9, width: 1, normal: '9', shift: ')', altGr: ']', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-ring' },
      { code: 'Digit0', row: 0, position: 10, width: 1, normal: '0', shift: '=', altGr: '}', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'Minus', row: 0, position: 11, width: 1, normal: "'", shift: '?', altGr: '\\', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'Equal', row: 0, position: 12, width: 1, normal: '¿', shift: '¡', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'Backspace', row: 0, position: 13, width: 2, normal: '⌫', shift: '⌫', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
    ],
    // Row 1: QWERTY row
    [
      { code: 'Tab', row: 1, position: 0, width: 1.5, normal: '⇥', shift: '⇥', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'KeyQ', row: 1, position: 1, width: 1, normal: 'q', shift: 'Q', altGr: '@', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'KeyW', row: 1, position: 2, width: 1, normal: 'w', shift: 'W', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-ring' },
      { code: 'KeyE', row: 1, position: 3, width: 1, normal: 'e', shift: 'E', altGr: '€', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-middle' },
      { code: 'KeyR', row: 1, position: 4, width: 1, normal: 'r', shift: 'R', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'KeyT', row: 1, position: 5, width: 1, normal: 't', shift: 'T', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'KeyY', row: 1, position: 6, width: 1, normal: 'y', shift: 'Y', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'KeyU', row: 1, position: 7, width: 1, normal: 'u', shift: 'U', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'KeyI', row: 1, position: 8, width: 1, normal: 'i', shift: 'I', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-middle' },
      { code: 'KeyO', row: 1, position: 9, width: 1, normal: 'o', shift: 'O', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-ring' },
      { code: 'KeyP', row: 1, position: 10, width: 1, normal: 'p', shift: 'P', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'BracketLeft', row: 1, position: 11, width: 1, normal: '´', shift: '¨', altGr: '[', shiftAltGr: null, isDeadKey: true, deadKeyType: 'acute', finger: 'right-pinky' },
      { code: 'BracketRight', row: 1, position: 12, width: 1, normal: '+', shift: '*', altGr: ']', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
    ],
    // Row 2: Home row (ASDF)
    [
      { code: 'CapsLock', row: 2, position: 0, width: 1.75, normal: '⇪', shift: '⇪', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'KeyA', row: 2, position: 1, width: 1, normal: 'a', shift: 'A', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'KeyS', row: 2, position: 2, width: 1, normal: 's', shift: 'S', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-ring' },
      { code: 'KeyD', row: 2, position: 3, width: 1, normal: 'd', shift: 'D', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-middle' },
      { code: 'KeyF', row: 2, position: 4, width: 1, normal: 'f', shift: 'F', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'KeyG', row: 2, position: 5, width: 1, normal: 'g', shift: 'G', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'KeyH', row: 2, position: 6, width: 1, normal: 'h', shift: 'H', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'KeyJ', row: 2, position: 7, width: 1, normal: 'j', shift: 'J', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'KeyK', row: 2, position: 8, width: 1, normal: 'k', shift: 'K', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-middle' },
      { code: 'KeyL', row: 2, position: 9, width: 1, normal: 'l', shift: 'L', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-ring' },
      { code: 'Semicolon', row: 2, position: 10, width: 1, normal: 'ñ', shift: 'Ñ', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'Quote', row: 2, position: 11, width: 1, normal: '{', shift: '[', altGr: '^', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'Backslash', row: 2, position: 12, width: 1, normal: '}', shift: ']', altGr: '`', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'Enter', row: 2, position: 13, width: 1.25, normal: '↵', shift: '↵', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
    ],
    // Row 3: Bottom letter row (ZXCV)
    [
      { code: 'ShiftLeft', row: 3, position: 0, width: 1.25, normal: '⇧', shift: '⇧', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'IntlBackslash', row: 3, position: 1, width: 1, normal: '<', shift: '>', altGr: '|', shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'KeyZ', row: 3, position: 2, width: 1, normal: 'z', shift: 'Z', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'KeyX', row: 3, position: 3, width: 1, normal: 'x', shift: 'X', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-ring' },
      { code: 'KeyC', row: 3, position: 4, width: 1, normal: 'c', shift: 'C', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-middle' },
      { code: 'KeyV', row: 3, position: 5, width: 1, normal: 'v', shift: 'V', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'KeyB', row: 3, position: 6, width: 1, normal: 'b', shift: 'B', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-index' },
      { code: 'KeyN', row: 3, position: 7, width: 1, normal: 'n', shift: 'N', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'KeyM', row: 3, position: 8, width: 1, normal: 'm', shift: 'M', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-index' },
      { code: 'Comma', row: 3, position: 9, width: 1, normal: ',', shift: ';', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-middle' },
      { code: 'Period', row: 3, position: 10, width: 1, normal: '.', shift: ':', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-ring' },
      { code: 'Slash', row: 3, position: 11, width: 1, normal: '-', shift: '_', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'ShiftRight', row: 3, position: 12, width: 2.75, normal: '⇧', shift: '⇧', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
    ],
    // Row 4: Space bar row
    [
      { code: 'ControlLeft', row: 4, position: 0, width: 1.5, normal: 'Ctrl', shift: 'Ctrl', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'MetaLeft', row: 4, position: 1, width: 1.25, normal: '⊞', shift: '⊞', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'left-pinky' },
      { code: 'AltLeft', row: 4, position: 2, width: 1.25, normal: 'Alt', shift: 'Alt', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'thumb' },
      { code: 'Space', row: 4, position: 3, width: 6.25, normal: ' ', shift: ' ', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'thumb' },
      { code: 'AltRight', row: 4, position: 4, width: 1.25, normal: 'AltGr', shift: 'AltGr', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'thumb' },
      { code: 'MetaRight', row: 4, position: 5, width: 1.25, normal: '⊞', shift: '⊞', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'ContextMenu', row: 4, position: 6, width: 1.25, normal: '☰', shift: '☰', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
      { code: 'ControlRight', row: 4, position: 7, width: 1.5, normal: 'Ctrl', shift: 'Ctrl', altGr: null, shiftAltGr: null, isDeadKey: false, deadKeyType: null, finger: 'right-pinky' },
    ],
  ],
};
```

#### 3.2.3 Dead Key Handler

```typescript
// src/lib/keyboard/DeadKeyHandler.ts

import { DeadKeyState, DeadKeyType } from './types';

// Dead key composition mappings
const DEAD_KEY_COMPOSITIONS: Record<DeadKeyType, Record<string, string>> = {
  acute: {
    'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
    'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú',
    ' ': '´', // Space produces the accent itself
  },
  dieresis: {
    'a': 'ä', 'e': 'ë', 'i': 'ï', 'o': 'ö', 'u': 'ü',
    'A': 'Ä', 'E': 'Ë', 'I': 'Ï', 'O': 'Ö', 'U': 'Ü',
    ' ': '¨',
  },
  grave: {
    'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù',
    'A': 'À', 'E': 'È', 'I': 'Ì', 'O': 'Ò', 'U': 'Ù',
    ' ': '`',
  },
  circumflex: {
    'a': 'â', 'e': 'ê', 'i': 'î', 'o': 'ô', 'u': 'û',
    'A': 'Â', 'E': 'Ê', 'I': 'Î', 'O': 'Ô', 'U': 'Û',
    ' ': '^',
  },
};

export class DeadKeyHandler {
  private state: DeadKeyState = {
    active: false,
    type: null,
    baseKey: null,
  };

  /**
   * Process a key press, handling dead key composition
   * Returns the composed character or null if still in dead key state
   */
  public processKey(key: string, isDeadKey: boolean, deadKeyType: DeadKeyType): string | null {
    // If this is a dead key, enter dead key state
    if (isDeadKey && deadKeyType) {
      this.state = {
        active: true,
        type: deadKeyType,
        baseKey: key,
      };
      return null; // No output yet
    }

    // If we're in dead key state, try to compose
    if (this.state.active && this.state.type) {
      const compositions = DEAD_KEY_COMPOSITIONS[this.state.type];
      const composed = compositions?.[key];

      // Reset state
      this.state = { active: false, type: null, baseKey: null };

      if (composed) {
        return composed; // Successfully composed
      } else {
        // No composition possible - output dead key + current key
        return (this.state.baseKey || '') + key;
      }
    }

    // Normal key press
    return key;
  }

  public isActive(): boolean {
    return this.state.active;
  }

  public getState(): DeadKeyState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = { active: false, type: null, baseKey: null };
  }
}
```

#### 3.2.4 Keyboard Mapper

```typescript
// src/lib/keyboard/KeyboardMapper.ts

import { KeyboardLayout, KeyDefinition, ModifierState } from './types';
import { LATAM_LAYOUT } from './layouts/latam';

export class KeyboardMapper {
  private layout: KeyboardLayout;
  private keyCodeMap: Map<string, KeyDefinition>;

  constructor(layout: KeyboardLayout = LATAM_LAYOUT) {
    this.layout = layout;
    this.keyCodeMap = this.buildKeyCodeMap();
  }

  private buildKeyCodeMap(): Map<string, KeyDefinition> {
    const map = new Map<string, KeyDefinition>();
    for (const row of this.layout.rows) {
      for (const key of row) {
        map.set(key.code, key);
      }
    }
    return map;
  }

  /**
   * Get the character produced by a key code with given modifiers
   */
  public getCharacter(code: string, modifiers: ModifierState): string | null {
    const key = this.keyCodeMap.get(code);
    if (!key) return null;

    if (modifiers.altGr && modifiers.shift && key.shiftAltGr) {
      return key.shiftAltGr;
    }
    if (modifiers.altGr && key.altGr) {
      return key.altGr;
    }
    if (modifiers.shift) {
      return key.shift;
    }
    return key.normal;
  }

  /**
   * Find the key(s) needed to produce a given character
   * Returns key definition and required modifiers
   */
  public findKeyForCharacter(char: string): { key: KeyDefinition; modifiers: ModifierState } | null {
    for (const [, key] of this.keyCodeMap) {
      if (key.normal === char) {
        return { key, modifiers: { shift: false, altGr: false, ctrl: false, meta: false } };
      }
      if (key.shift === char) {
        return { key, modifiers: { shift: true, altGr: false, ctrl: false, meta: false } };
      }
      if (key.altGr === char) {
        return { key, modifiers: { shift: false, altGr: true, ctrl: false, meta: false } };
      }
      if (key.shiftAltGr === char) {
        return { key, modifiers: { shift: true, altGr: true, ctrl: false, meta: false } };
      }
    }
    return null;
  }

  /**
   * Check if a key is a dead key
   */
  public isDeadKey(code: string): boolean {
    const key = this.keyCodeMap.get(code);
    return key?.isDeadKey ?? false;
  }

  /**
   * Get the key definition by code
   */
  public getKeyDefinition(code: string): KeyDefinition | null {
    return this.keyCodeMap.get(code) ?? null;
  }

  /**
   * Get all keys in the layout
   */
  public getAllKeys(): KeyDefinition[] {
    return Array.from(this.keyCodeMap.values());
  }

  /**
   * Get keys by row
   */
  public getRow(rowIndex: number): KeyDefinition[] {
    return this.layout.rows[rowIndex] ?? [];
  }
}
```

---

### 3.3 Metrics Calculator Module (`src/lib/metrics/`)

#### 3.3.1 WPM Calculator

```typescript
// src/lib/metrics/WPMCalculator.ts

export interface WPMResult {
  grossWPM: number;
  netWPM: number;
  rawCharactersPerMinute: number;
}

export class WPMCalculator {
  private static readonly CHARS_PER_WORD = 5; // Standard WPM definition

  /**
   * Calculate Words Per Minute
   * @param totalCharacters Total characters typed
   * @param errors Number of uncorrected errors
   * @param elapsedMs Time elapsed in milliseconds
   */
  public calculate(totalCharacters: number, errors: number, elapsedMs: number): WPMResult {
    if (elapsedMs <= 0) {
      return { grossWPM: 0, netWPM: 0, rawCharactersPerMinute: 0 };
    }

    const elapsedMinutes = elapsedMs / 60000;
    const words = totalCharacters / WPMCalculator.CHARS_PER_WORD;

    const grossWPM = words / elapsedMinutes;
    const errorPenalty = errors / WPMCalculator.CHARS_PER_WORD;
    const netWPM = Math.max(0, (words - errorPenalty) / elapsedMinutes);

    return {
      grossWPM: Math.round(grossWPM * 10) / 10,
      netWPM: Math.round(netWPM * 10) / 10,
      rawCharactersPerMinute: Math.round(totalCharacters / elapsedMinutes),
    };
  }

  /**
   * Calculate rolling WPM over a time window
   * @param keystrokes Recent keystrokes with timestamps
   * @param windowMs Window size in milliseconds (default 30s)
   */
  public calculateRolling(
    keystrokes: Array<{ timestamp: number; isCorrect: boolean }>,
    windowMs: number = 30000
  ): WPMResult {
    if (keystrokes.length < 2) {
      return { grossWPM: 0, netWPM: 0, rawCharactersPerMinute: 0 };
    }

    const now = keystrokes[keystrokes.length - 1].timestamp;
    const windowStart = now - windowMs;

    const recentKeystrokes = keystrokes.filter(k => k.timestamp >= windowStart);
    if (recentKeystrokes.length < 2) {
      return { grossWPM: 0, netWPM: 0, rawCharactersPerMinute: 0 };
    }

    const duration = recentKeystrokes[recentKeystrokes.length - 1].timestamp - recentKeystrokes[0].timestamp;
    const errors = recentKeystrokes.filter(k => !k.isCorrect).length;

    return this.calculate(recentKeystrokes.length, errors, duration);
  }
}
```

#### 3.3.2 Accuracy Calculator

```typescript
// src/lib/metrics/AccuracyCalculator.ts

export interface AccuracyResult {
  overall: number;          // 0-100 percentage
  perCharacter: Map<string, number>;
  problematicChars: string[]; // Characters below 90% accuracy
}

export class AccuracyCalculator {
  /**
   * Calculate overall accuracy
   * @param correct Number of correct characters
   * @param total Total characters attempted
   */
  public calculateOverall(correct: number, total: number): number {
    if (total === 0) return 100;
    return Math.round((correct / total) * 1000) / 10; // One decimal place
  }

  /**
   * Calculate per-character accuracy
   * @param attempts Map of character to [correct, total] counts
   */
  public calculatePerCharacter(
    attempts: Map<string, { correct: number; total: number }>
  ): AccuracyResult {
    const perCharacter = new Map<string, number>();
    const problematicChars: string[] = [];
    let totalCorrect = 0;
    let totalAttempts = 0;

    attempts.forEach(({ correct, total }, char) => {
      const accuracy = total > 0 ? (correct / total) * 100 : 100;
      perCharacter.set(char, Math.round(accuracy * 10) / 10);

      if (accuracy < 90 && total >= 3) { // Only flag if enough attempts
        problematicChars.push(char);
      }

      totalCorrect += correct;
      totalAttempts += total;
    });

    // Sort problematic chars by accuracy (worst first)
    problematicChars.sort((a, b) => {
      return (perCharacter.get(a) ?? 100) - (perCharacter.get(b) ?? 100);
    });

    return {
      overall: this.calculateOverall(totalCorrect, totalAttempts),
      perCharacter,
      problematicChars,
    };
  }
}
```

#### 3.3.3 Time Tracker

```typescript
// src/lib/metrics/TimeTracker.ts

export interface TimeStats {
  totalTime: number;        // Total elapsed time (ms)
  activeTime: number;       // Time spent actively typing (ms)
  pausedTime: number;       // Time spent paused (ms)
  averageCharTime: number;  // Average time between characters (ms)
  medianCharTime: number;   // Median time between characters (ms)
}

export class TimeTracker {
  private startTime: number | null = null;
  private pauseTime: number | null = null;
  private totalPausedTime: number = 0;
  private charTimestamps: number[] = [];

  public start(): void {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
  }

  public pause(): void {
    if (this.startTime && !this.pauseTime) {
      this.pauseTime = Date.now();
    }
  }

  public resume(): void {
    if (this.pauseTime) {
      this.totalPausedTime += Date.now() - this.pauseTime;
      this.pauseTime = null;
    }
  }

  public recordKeystroke(timestamp: number = Date.now()): void {
    this.charTimestamps.push(timestamp);
  }

  public getStats(): TimeStats {
    const now = Date.now();
    const totalTime = this.startTime ? now - this.startTime : 0;
    const currentPause = this.pauseTime ? now - this.pauseTime : 0;
    const pausedTime = this.totalPausedTime + currentPause;
    const activeTime = totalTime - pausedTime;

    // Calculate character timing stats
    const intervals: number[] = [];
    for (let i = 1; i < this.charTimestamps.length; i++) {
      intervals.push(this.charTimestamps[i] - this.charTimestamps[i - 1]);
    }

    const averageCharTime = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 0;

    const sortedIntervals = [...intervals].sort((a, b) => a - b);
    const medianCharTime = sortedIntervals.length > 0
      ? sortedIntervals[Math.floor(sortedIntervals.length / 2)]
      : 0;

    return {
      totalTime,
      activeTime,
      pausedTime,
      averageCharTime: Math.round(averageCharTime),
      medianCharTime: Math.round(medianCharTime),
    };
  }

  public reset(): void {
    this.startTime = null;
    this.pauseTime = null;
    this.totalPausedTime = 0;
    this.charTimestamps = [];
  }
}
```

---

## 4. State Management

### 4.1 Architecture Overview

State is managed at three levels:

```
+----------------------------------------------------------+
|                    GLOBAL STATE                           |
|  (React Context - Settings, Theme)                        |
|  - User preferences                                       |
|  - Theme (light/dark)                                     |
|  - Persisted to localStorage                              |
+----------------------------------------------------------+
           |
           v
+----------------------------------------------------------+
|                   SESSION STATE                           |
|  (Component Local State - Lifted to Practice Page)        |
|  - Current typing session                                 |
|  - Real-time metrics                                      |
|  - Keyboard state                                         |
+----------------------------------------------------------+
           |
           v
+----------------------------------------------------------+
|                   COMPONENT STATE                         |
|  (useState within components)                             |
|  - UI interactions                                        |
|  - Animations                                             |
|  - Form inputs                                            |
+----------------------------------------------------------+
```

### 4.2 Settings Context

```typescript
// src/stores/SettingsContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserSettings } from '@/types/settings';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  fontSize: 'medium',
  showFingerGuide: false,
  keyboardSize: 'standard',
  defaultMode: 'lenient',
  showRealTimeWPM: true,
  showRealTimeAccuracy: true,
  soundEffects: false,
  highlightNextKey: true,
  highlightModifiers: true,
  autoStartOnPaste: false,
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('teclado-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('teclado-settings', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
```

### 4.3 Theme Context

```typescript
// src/stores/ThemeContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;  // Actual theme when 'system' is selected
  setTheme: (theme: Theme | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme | 'system'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('teclado-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## 5. Data Flow

### 5.1 Keystroke Processing Flow

```
+------------------+     +------------------+     +------------------+
|   Browser        |     |   Event Handler  |     |   Dead Key       |
|   KeyboardEvent  | --> |   useKeyboard    | --> |   Handler        |
|                  |     |   Events()       |     |                  |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +------------------+     +------------------+
|   UI Update      |     |   Metrics        |     |   Typing         |
|   - TextDisplay  | <-- |   Calculator     | <-- |   Engine         |
|   - Keyboard     |     |                  |     |   process()      |
+------------------+     +------------------+     +------------------+
```

### 5.2 Detailed Keystroke Sequence

```typescript
// Sequence diagram as code flow

// 1. Browser fires keydown event
document.addEventListener('keydown', (event: KeyboardEvent) => {

  // 2. Event handler captures
  const { code, key, shiftKey, altKey, ctrlKey, metaKey } = event;

  // 3. Check for control keys (Tab, Escape, etc.)
  if (isControlKey(code)) {
    handleControlKey(code);
    return;
  }

  // 4. Get modifier state
  const modifiers: ModifierState = {
    shift: shiftKey,
    altGr: altKey && !ctrlKey, // AltGr detected
    ctrl: ctrlKey && !altKey,
    meta: metaKey,
  };

  // 5. Map key code to LATAM character
  const keyDef = keyboardMapper.getKeyDefinition(code);

  // 6. Handle dead keys
  if (keyDef?.isDeadKey) {
    deadKeyHandler.processKey(key, true, keyDef.deadKeyType);
    setDeadKeyActive(true);
    return; // Wait for next key
  }

  // 7. Compose character (may use dead key state)
  const composedChar = deadKeyHandler.processKey(key, false, null);

  // 8. Process through typing engine
  const timestamp = performance.now();
  const result = typingEngine.processCharacter(composedChar, timestamp);

  // 9. Update metrics
  if (result.accepted) {
    timeTracker.recordKeystroke(timestamp);
    const wpm = wpmCalculator.calculateRolling(keystrokes, 30000);
    setCurrentWPM(wpm);
  }

  // 10. Update UI state
  setTypingState(result.newState);

  // 11. Highlight next key on virtual keyboard
  const nextChar = result.newState.characters[result.newState.currentIndex]?.expected;
  const nextKeyInfo = keyboardMapper.findKeyForCharacter(nextChar);
  setHighlightedKey(nextKeyInfo);

  // 12. Check for completion
  if (result.isComplete) {
    finishSession();
  }
});
```

### 5.3 Dead Key Composition Flow

```
User types: ' (dead acute) then 'a'

Step 1: ' key pressed
+------------------+
| Dead Key Handler |
| state: {         |
|   active: true,  |
|   type: 'acute', |
|   baseKey: '´'   |
| }                |
+------------------+
UI: Shows pending accent indicator

Step 2: 'a' key pressed
+------------------+
| Dead Key Handler |
| Lookup: acute[a] |
| Result: 'á'      |
| state: reset     |
+------------------+
Output: 'á' to typing engine

Alternative - Non-composable:
Step 2: 'b' key pressed (no composition)
+------------------+
| Dead Key Handler |
| Lookup: acute[b] |
| Result: null     |
| Output: '´' + 'b'|
+------------------+
Output: '´b' (accent + letter separately)
```

### 5.4 Session Lifecycle

```
                    +-------------+
                    |   IDLE      |
                    | (No text)   |
                    +------+------+
                           |
                           v  User pastes text
                    +-------------+
                    |   READY     |
                    | (Text set)  |
                    +------+------+
                           |
                           v  First keystroke
                    +-------------+
                    |   ACTIVE    |<-----------+
                    | (Typing)    |            |
                    +------+------+            |
                           |                   |
              +------------+------------+      |
              |            |            |      |
              v            v            v      |
        +---------+  +---------+  +---------+  |
        | PAUSED  |  | ERROR   |  | (continue) |
        +---------+  +---------+  +---------+  |
              |            |                   |
              +------------+-------------------+
                           |
                           v  Text complete
                    +-------------+
                    |  COMPLETE   |
                    | (Results)   |
                    +------+------+
                           |
                           v  Save/Reset
                    +-------------+
                    |   IDLE      |
                    +-------------+
```

---

## 6. Component Architecture

### 6.1 Component Hierarchy Diagram

```
App (layout.tsx)
│
├── ThemeProvider
│   └── SettingsProvider
│       │
│       ├── Header
│       │   ├── Logo
│       │   ├── Navigation
│       │   └── ThemeToggle
│       │
│       └── Main Content (page.tsx)
│           │
│           ├── TextInputArea
│           │   ├── TextArea (paste target)
│           │   ├── SampleTextSelector
│           │   └── StartButton
│           │
│           ├── PracticeArea (when active)
│           │   │
│           │   ├── TextDisplay
│           │   │   ├── CharacterSpan (×N)
│           │   │   │   └── state: pending|current|correct|incorrect
│           │   │   └── CursorIndicator
│           │   │
│           │   ├── HiddenInput (captures keystrokes)
│           │   │
│           │   ├── MetricsPanel
│           │   │   ├── WPMDisplay
│           │   │   │   ├── Current WPM
│           │   │   │   └── Rolling Average
│           │   │   ├── AccuracyDisplay
│           │   │   └── TimeDisplay
│           │   │
│           │   └── SessionControls
│           │       ├── PauseButton
│           │       ├── ResetButton
│           │       └── StopButton
│           │
│           └── VirtualKeyboard
│               ├── KeyboardRow (×5)
│               │   └── Key (×N per row)
│               │       ├── KeyLabel (normal)
│               │       ├── KeyLabel (shift)
│               │       ├── KeyLabel (altGr)
│               │       └── state: default|highlighted|pressed|error
│               │
│               └── FingerGuide (optional)
│
└── Footer
```

### 6.2 Key Component Specifications

#### TextDisplay Component

```typescript
// src/components/practice/TextDisplay.tsx

interface TextDisplayProps {
  characters: CharacterResult[];
  currentIndex: number;
  showCursor: boolean;
}

/**
 * Displays the practice text with visual feedback for each character.
 *
 * Performance considerations:
 * - Uses React.memo for CharacterSpan to prevent unnecessary re-renders
 * - Only re-renders changed characters (leverages React reconciliation)
 * - CSS transitions for smooth state changes
 */
export function TextDisplay({ characters, currentIndex, showCursor }: TextDisplayProps);
```

#### VirtualKeyboard Component

```typescript
// src/components/keyboard/VirtualKeyboard.tsx

interface VirtualKeyboardProps {
  layout: KeyboardLayout;
  highlightedKey: KeyDefinition | null;
  requiredModifiers: ModifierState;
  pressedKeys: Set<string>;  // Currently pressed key codes
  showFingerGuide: boolean;
  size: 'compact' | 'standard' | 'large';
}

/**
 * Renders the LATAM keyboard layout with highlighting.
 *
 * Features:
 * - Responsive sizing
 * - Key press animations
 * - Modifier key highlighting
 * - Optional finger guide overlay
 */
export function VirtualKeyboard(props: VirtualKeyboardProps);
```

#### MetricsPanel Component

```typescript
// src/components/metrics/MetricsPanel.tsx

interface MetricsPanelProps {
  wpm: WPMResult;
  accuracy: number;
  timeStats: TimeStats;
  isActive: boolean;
  showWPM: boolean;
  showAccuracy: boolean;
}

/**
 * Real-time metrics display during typing session.
 *
 * Updates at 100ms intervals to balance accuracy and performance.
 */
export function MetricsPanel(props: MetricsPanelProps);
```

---

## 7. Performance Optimization Strategies

### 7.1 Critical Path Optimization

The keystroke-to-UI-update path must complete within 16ms (60fps):

```
Keystroke Detection     [~1ms]
├── Event Handler       [~0.5ms]
├── Dead Key Check      [~0.1ms]
├── Typing Engine       [~0.5ms]
├── Metrics Update      [~0.5ms]
└── React Re-render     [~8ms max]
    ├── TextDisplay     [~3ms]
    ├── VirtualKeyboard [~2ms]
    └── MetricsPanel    [~1ms]
                        ========
Total Target:           [<12ms]
Buffer:                 [4ms]
```

### 7.2 Optimization Techniques

1. **Memoization**
   - `React.memo()` on CharacterSpan, Key components
   - `useMemo()` for derived calculations
   - `useCallback()` for event handlers

2. **Virtualization** (for long texts)
   - Only render visible characters
   - Window of ~200 characters around cursor

3. **Batched Updates**
   - Metrics calculated on requestAnimationFrame
   - Debounced localStorage writes

4. **CSS Optimizations**
   - Use `transform` and `opacity` for animations
   - Avoid layout-triggering properties
   - Use `will-change` sparingly

### 7.3 Bundle Optimization

```typescript
// next.config.js optimization

module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Split keyboard layout data
  webpack: (config) => {
    config.optimization.splitChunks.cacheGroups.keyboard = {
      name: 'keyboard-layout',
      test: /[\\/]keyboard[\\/]layouts[\\/]/,
      chunks: 'all',
      priority: 10,
    };
    return config;
  },
};
```

---

## 8. Testing Strategy

### 8.1 Test Pyramid

```
        /\
       /  \      E2E Tests (Playwright)
      /----\     - Full user flows
     /      \    - ~5 critical paths
    /--------\
   /          \  Integration Tests
  /   ------   \ - Component + Hook combos
 /              \- ~20 tests
/----------------\
|  Unit Tests    | - Pure functions
|  ~100 tests    | - Isolated components
|________________| - Engine logic
```

### 8.2 Test Categories

| Category | Coverage Target | Tools |
|----------|-----------------|-------|
| Typing Engine | 95% | Vitest |
| Keyboard Mapper | 95% | Vitest |
| Metrics Calculator | 95% | Vitest |
| React Hooks | 80% | React Testing Library |
| Components | 70% | React Testing Library |
| E2E Flows | Critical paths | Playwright |

### 8.3 Key Test Scenarios

```typescript
// Example: Typing Engine Tests

describe('TypingEngine', () => {
  describe('processCharacter', () => {
    it('should mark correct character and advance', () => {});
    it('should mark incorrect character in lenient mode and advance', () => {});
    it('should mark incorrect character in strict mode and NOT advance', () => {});
    it('should handle Unicode characters correctly', () => {});
    it('should complete session when text finished', () => {});
  });

  describe('processBackspace', () => {
    it('should move cursor back in lenient mode', () => {});
    it('should do nothing in no-backspace mode', () => {});
    it('should mark previously incorrect character as corrected', () => {});
  });

  describe('dead key handling', () => {
    it('should compose acute accent with vowel', () => {});
    it('should output raw dead key when followed by non-composable', () => {});
  });
});
```

---

## 9. Error Handling

### 9.1 Error Boundaries

```typescript
// src/app/error.tsx

'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>Your progress has been saved.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 9.2 Graceful Degradation

| Failure | Fallback |
|---------|----------|
| localStorage unavailable | In-memory state only |
| IndexedDB unavailable | No history persistence |
| Keyboard API issues | Basic text input mode |
| Animation performance | Reduce motion |

---

## 10. Security Considerations

### 10.1 Input Sanitization

```typescript
// src/lib/utils/textProcessing.ts

export function sanitizeText(input: string): string {
  // Remove potential XSS vectors
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  // Normalize whitespace but preserve line breaks
  return sanitized
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
```

### 10.2 Content Security Policy

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      font-src 'self';
      img-src 'self' data:;
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];
```

---

## 11. Deployment Architecture

### 11.1 Vercel Deployment

```
                     +------------------+
                     |   Vercel Edge    |
                     |   Network        |
                     +--------+---------+
                              |
              +---------------+---------------+
              |                               |
    +---------v---------+          +----------v---------+
    |   Static Assets   |          |   Edge Functions   |
    |   (CDN Cached)    |          |   (if needed)      |
    |   - HTML          |          |                    |
    |   - CSS           |          |                    |
    |   - JS Bundles    |          |                    |
    +-------------------+          +--------------------+
              |
              v
    +-------------------+
    |   Browser         |
    |   - React SPA     |
    |   - localStorage  |
    |   - IndexedDB     |
    +-------------------+
```

### 11.2 Build Output

```
.next/
├── static/
│   ├── chunks/
│   │   ├── main-[hash].js        (~30KB gzip)
│   │   ├── keyboard-[hash].js    (~15KB gzip)
│   │   └── [page]-[hash].js      (~10KB each)
│   └── css/
│       └── [hash].css            (~8KB gzip)
└── server/
    └── app/
        ├── page.js               (Server Component)
        └── history/page.js       (Server Component)

Total JS: ~70KB gzipped
Total CSS: ~10KB gzipped
```

---

## 12. Future Extensibility

### 12.1 Adding New Keyboard Layouts

The architecture supports adding new layouts by:

1. Creating new layout file in `src/lib/keyboard/layouts/`
2. Implementing `KeyboardLayout` interface
3. Adding layout to layout registry
4. UI automatically adapts

```typescript
// Example: Adding Spanish (Spain) layout
// src/lib/keyboard/layouts/spanish-spain.ts

export const SPANISH_SPAIN_LAYOUT: KeyboardLayout = {
  name: 'Spanish (Spain)',
  locale: 'es-ES',
  rows: [
    // ... key definitions
  ],
};
```

### 12.2 Plugin Architecture (Future)

```typescript
// Future plugin system
interface TecladoPlugin {
  name: string;
  version: string;

  // Hooks into typing engine
  onKeystroke?: (keystroke: Keystroke) => void;
  onSessionComplete?: (session: Session) => void;

  // UI extensions
  renderMetrics?: () => ReactNode;
  renderSettings?: () => ReactNode;
}
```

---

## 13. Appendix

### 13.1 Glossary

| Term | Definition |
|------|------------|
| Dead Key | Key that doesn't produce output until next key is pressed |
| AltGr | Right Alt key, used for third-level characters |
| WPM | Words Per Minute (5 characters = 1 word) |
| NFC | Unicode Normalization Form Canonical Composition |

### 13.2 References

1. [Next.js App Router Documentation](https://nextjs.org/docs/app)
2. [React Performance Optimization](https://react.dev/reference/react/memo)
3. [Keyboard Event API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
4. [LATAM Keyboard Layout Reference](https://en.wikipedia.org/wiki/Spanish_keyboard)

---

*End of Architecture Document*
