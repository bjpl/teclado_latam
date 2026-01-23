# SPARC Pseudocode: UI Rendering and Visual Feedback

**Project:** Teclado LATAM - LATAM Spanish Keyboard Typing Practice Application
**Version:** 1.0.0
**Status:** Pseudocode Phase
**Created:** 2026-01-23
**Author:** Strategic Planning Agent

---

## 1. Overview

This document details the pseudocode for UI rendering and visual feedback algorithms in the Teclado LATAM application. These algorithms are critical for providing responsive, fluid user experience during typing practice sessions.

### 1.1 Performance Requirements

| Operation | Target Latency | Priority |
|-----------|---------------|----------|
| Keystroke to visual feedback | < 8ms | Critical |
| Character state transition | < 16ms | Critical |
| Cursor animation | 60fps (16.67ms) | High |
| Metrics update | < 100ms | Medium |
| Results generation | < 500ms | Low |

### 1.2 Design Principles

1. **Incremental Updates**: Only re-render changed elements
2. **Hardware Acceleration**: Use CSS transforms for animations
3. **Debounced Calculations**: Batch non-critical updates
4. **Memory Efficiency**: Pool objects, avoid allocations in hot paths

---

## 2. Text Display Rendering Algorithm

### 2.1 Algorithm: RenderTextDisplay

```
ALGORITHM: RenderTextDisplay
PURPOSE: Render practice text with visual state indicators for each character
PERFORMANCE: O(n) initial render, O(1) incremental updates

INPUT:
  - PracticeText: string              // The text to practice typing
  - CurrentPosition: number           // Index of character to type next
  - ErrorMap: Map<number, string>     // Map of position -> incorrect character typed
  - CorrectedMap: Set<number>         // Set of positions that were corrected
  - PreviousState: CharacterState[]   // Previous render state for diffing

OUTPUT:
  - StyledCharacterArray: CharacterRenderData[]
  - ChangedIndices: number[]          // Indices that need DOM update

TYPES:
  CharacterState = 'pending' | 'current' | 'correct' | 'incorrect' | 'corrected'

  CharacterRenderData = {
    char: string,
    index: number,
    state: CharacterState,
    cssClass: string,
    ariaLabel: string,
    shouldAnimate: boolean
  }
```

### 2.2 Main Rendering Logic

```
FUNCTION RenderTextDisplay(PracticeText, CurrentPosition, ErrorMap, CorrectedMap, PreviousState):

  // Initialize output array
  StyledCharacters <- empty array of CharacterRenderData
  ChangedIndices <- empty array

  // Process each character
  FOR index FROM 0 TO LENGTH(PracticeText) - 1:
    char <- PracticeText[index]

    // Determine character state
    state <- DetermineCharacterState(index, CurrentPosition, ErrorMap, CorrectedMap)

    // Check if state changed from previous render
    IF PreviousState[index] IS NULL OR PreviousState[index].state != state:
      APPEND index TO ChangedIndices
      shouldAnimate <- TRUE
    ELSE:
      shouldAnimate <- FALSE
    END IF

    // Generate CSS class based on state
    cssClass <- GenerateCSSClass(state, shouldAnimate)

    // Generate accessible label
    ariaLabel <- GenerateAriaLabel(char, state, index)

    // Create render data
    renderData <- {
      char: char,
      index: index,
      state: state,
      cssClass: cssClass,
      ariaLabel: ariaLabel,
      shouldAnimate: shouldAnimate
    }

    APPEND renderData TO StyledCharacters
  END FOR

  RETURN { StyledCharacters, ChangedIndices }
END FUNCTION
```

### 2.3 Character State Determination

```
FUNCTION DetermineCharacterState(index, CurrentPosition, ErrorMap, CorrectedMap):

  // Characters before current position have been typed
  IF index < CurrentPosition:

    // Check if this position had an error that was corrected
    IF CorrectedMap.CONTAINS(index):
      RETURN 'corrected'
    END IF

    // Check if there's an uncorrected error at this position
    IF ErrorMap.HAS(index):
      RETURN 'incorrect'
    END IF

    // Successfully typed
    RETURN 'correct'

  // Current character to type
  ELSE IF index == CurrentPosition:
    RETURN 'current'

  // Characters not yet reached
  ELSE:
    RETURN 'pending'
  END IF

END FUNCTION
```

### 2.4 CSS Class Generation

```
FUNCTION GenerateCSSClass(state, shouldAnimate):

  // Base class for all characters
  baseClass <- "char"

  // State-specific classes
  stateClass <- SWITCH state:
    CASE 'pending':   "char--pending"
    CASE 'current':   "char--current"
    CASE 'correct':   "char--correct"
    CASE 'incorrect': "char--incorrect"
    CASE 'corrected': "char--corrected"
  END SWITCH

  // Animation class if state just changed
  animationClass <- IF shouldAnimate THEN "char--animate" ELSE ""

  RETURN CONCATENATE(baseClass, " ", stateClass, " ", animationClass)
END FUNCTION

// CSS Variables Reference:
// --char-color-pending: #6b7280 (gray)
// --char-color-current: #1f2937 (dark, with background highlight)
// --char-color-correct: #059669 (green)
// --char-color-incorrect: #dc2626 (red)
// --char-color-corrected: #d97706 (amber/orange)
```

### 2.5 Efficient Re-render Strategy

```
ALGORITHM: IncrementalTextUpdate
PURPOSE: Minimize DOM operations by only updating changed characters

FUNCTION UpdateTextDisplay(PreviousRender, NewRender, ChangedIndices):

  // Skip full re-render if no changes
  IF LENGTH(ChangedIndices) == 0:
    RETURN
  END IF

  // Optimization: If more than 50% changed, do full re-render
  IF LENGTH(ChangedIndices) > LENGTH(NewRender) * 0.5:
    PerformFullRerender(NewRender)
    RETURN
  END IF

  // Batch DOM updates using requestAnimationFrame
  RequestAnimationFrame(() => {

    // Group updates by operation type
    updateBatch <- empty array

    FOR EACH index IN ChangedIndices:
      element <- GetDOMElement("char-" + index)

      IF element IS NOT NULL:
        update <- {
          element: element,
          newClass: NewRender[index].cssClass,
          newAria: NewRender[index].ariaLabel
        }
        APPEND update TO updateBatch
      END IF
    END FOR

    // Apply all updates in single frame
    FOR EACH update IN updateBatch:
      update.element.className <- update.newClass
      update.element.setAttribute("aria-label", update.newAria)
    END FOR

  })
END FUNCTION
```

### 2.6 Special Character Handling

```
FUNCTION RenderSpecialCharacter(char, state):

  // Handle whitespace characters
  IF char == ' ':
    displayChar <- '\u00B7'  // Middle dot for visibility
    cssClass <- APPEND "char--space" TO cssClass

  ELSE IF char == '\n':
    displayChar <- '\u21B5'  // Return symbol
    cssClass <- APPEND "char--newline" TO cssClass

  ELSE IF char == '\t':
    displayChar <- '\u2192'  // Right arrow
    cssClass <- APPEND "char--tab" TO cssClass

  // Handle Spanish special characters (ensure proper rendering)
  ELSE IF char IN ['n with tilde', 'N with tilde', accented vowels, inverted punctuation]:
    displayChar <- char
    cssClass <- APPEND "char--special" TO cssClass

  ELSE:
    displayChar <- char
  END IF

  RETURN { displayChar, cssClass }
END FUNCTION
```

---

## 3. Cursor/Caret Animation Algorithm

### 3.1 Algorithm: AnimateCursor

```
ALGORITHM: AnimateCursor
PURPOSE: Smoothly animate typing cursor between character positions
PERFORMANCE: 60fps, hardware-accelerated CSS transforms

INPUT:
  - TargetPosition: number           // Character index to move cursor to
  - CurrentPosition: number          // Current cursor character index
  - CharacterElements: DOMElement[]  // Array of character DOM elements
  - ContainerElement: DOMElement     // Text display container

OUTPUT:
  - AnimationKeyframes: CSSKeyframeRule[]
  - CursorState: CursorStateData

TYPES:
  CursorStateData = {
    x: number,           // Pixel X position
    y: number,           // Pixel Y position
    height: number,      // Cursor height in pixels
    isAnimating: boolean,
    isBlinking: boolean
  }
```

### 3.2 Position Calculation

```
FUNCTION CalculateCursorPosition(TargetPosition, CharacterElements, Container):

  // Handle empty text case
  IF LENGTH(CharacterElements) == 0:
    RETURN { x: 0, y: 0, height: DEFAULT_LINE_HEIGHT }
  END IF

  // Handle position at end of text
  IF TargetPosition >= LENGTH(CharacterElements):
    lastElement <- CharacterElements[LENGTH(CharacterElements) - 1]
    rect <- lastElement.getBoundingClientRect()
    containerRect <- Container.getBoundingClientRect()

    RETURN {
      x: rect.right - containerRect.left,
      y: rect.top - containerRect.top,
      height: rect.height
    }
  END IF

  // Get target character element
  targetElement <- CharacterElements[TargetPosition]

  IF targetElement IS NULL:
    RETURN GetDefaultCursorPosition(Container)
  END IF

  // Calculate position relative to container
  rect <- targetElement.getBoundingClientRect()
  containerRect <- Container.getBoundingClientRect()

  RETURN {
    x: rect.left - containerRect.left,
    y: rect.top - containerRect.top,
    height: rect.height
  }
END FUNCTION
```

### 3.3 Animation Execution

```
FUNCTION AnimateCursor(TargetPosition, CurrentPosition, CharacterElements, Container):

  // Calculate start and end positions
  startPos <- CalculateCursorPosition(CurrentPosition, CharacterElements, Container)
  endPos <- CalculateCursorPosition(TargetPosition, CharacterElements, Container)

  // Stop blinking during movement
  CursorState.isBlinking <- FALSE
  CursorState.isAnimating <- TRUE

  // Check if we're wrapping to a new line
  isLineWrap <- ABS(endPos.y - startPos.y) > THRESHOLD_LINE_WRAP

  IF isLineWrap:
    // Two-phase animation for line wrap
    keyframes <- GenerateLineWrapKeyframes(startPos, endPos)
    duration <- 120  // milliseconds
  ELSE:
    // Simple horizontal animation
    keyframes <- GenerateLinearKeyframes(startPos, endPos)
    duration <- 80   // milliseconds
  END IF

  // Create animation
  animation <- CursorElement.animate(keyframes, {
    duration: duration,
    easing: 'ease-out',
    fill: 'forwards'
  })

  // Handle animation completion
  animation.onfinish <- () => {
    CursorState.x <- endPos.x
    CursorState.y <- endPos.y
    CursorState.height <- endPos.height
    CursorState.isAnimating <- FALSE

    // Resume blinking after idle period
    StartBlinkAfterDelay(500)  // 500ms delay before blinking starts
  }

  RETURN animation
END FUNCTION
```

### 3.4 Keyframe Generation

```
FUNCTION GenerateLinearKeyframes(startPos, endPos):

  RETURN [
    {
      transform: TRANSLATE(startPos.x, startPos.y),
      height: startPos.height + 'px',
      offset: 0
    },
    {
      transform: TRANSLATE(endPos.x, endPos.y),
      height: endPos.height + 'px',
      offset: 1
    }
  ]
END FUNCTION

FUNCTION GenerateLineWrapKeyframes(startPos, endPos):

  // Intermediate position: fade at end of line
  midPos <- {
    x: startPos.x + 10,  // Slight overshoot
    y: startPos.y,
    opacity: 0
  }

  RETURN [
    // Start position
    {
      transform: TRANSLATE(startPos.x, startPos.y),
      opacity: 1,
      offset: 0
    },
    // Fade out at end of line
    {
      transform: TRANSLATE(midPos.x, midPos.y),
      opacity: 0,
      offset: 0.4
    },
    // Jump to start of new line (invisible)
    {
      transform: TRANSLATE(0, endPos.y),
      opacity: 0,
      offset: 0.5
    },
    // Fade in at new position
    {
      transform: TRANSLATE(endPos.x, endPos.y),
      opacity: 1,
      offset: 1
    }
  ]
END FUNCTION
```

### 3.5 Blink Animation

```
FUNCTION ManageCursorBlink(CursorElement, CursorState):

  // CSS animation for blinking
  blinkKeyframes <- [
    { opacity: 1, offset: 0 },
    { opacity: 1, offset: 0.5 },
    { opacity: 0, offset: 0.5001 },
    { opacity: 0, offset: 1 }
  ]

  blinkAnimation <- NULL
  idleTimer <- NULL

  FUNCTION StartBlinking():
    IF CursorState.isAnimating:
      RETURN  // Don't blink while moving
    END IF

    CursorState.isBlinking <- TRUE
    blinkAnimation <- CursorElement.animate(blinkKeyframes, {
      duration: 1000,    // 1 second per blink cycle
      iterations: Infinity
    })
  END FUNCTION

  FUNCTION StopBlinking():
    IF blinkAnimation IS NOT NULL:
      blinkAnimation.cancel()
      blinkAnimation <- NULL
    END IF
    CursorState.isBlinking <- FALSE
    CursorElement.style.opacity <- 1
  END FUNCTION

  FUNCTION StartBlinkAfterDelay(delayMs):
    // Clear existing timer
    IF idleTimer IS NOT NULL:
      clearTimeout(idleTimer)
    END IF

    idleTimer <- setTimeout(() => {
      StartBlinking()
    }, delayMs)
  END FUNCTION

  // On any keystroke, stop blinking temporarily
  FUNCTION OnKeystroke():
    StopBlinking()
    StartBlinkAfterDelay(500)
  END FUNCTION

  RETURN { StartBlinking, StopBlinking, StartBlinkAfterDelay, OnKeystroke }
END FUNCTION
```

### 3.6 Cursor Visibility During Scroll

```
FUNCTION EnsureCursorVisible(CursorPosition, ContainerElement, ScrollThreshold):

  containerRect <- ContainerElement.getBoundingClientRect()
  cursorY <- CursorPosition.y

  // Check if cursor is above visible area
  IF cursorY < ScrollThreshold:
    targetScroll <- ContainerElement.scrollTop + cursorY - ScrollThreshold
    SmoothScrollTo(ContainerElement, targetScroll)

  // Check if cursor is below visible area
  ELSE IF cursorY > containerRect.height - ScrollThreshold:
    targetScroll <- ContainerElement.scrollTop + (cursorY - containerRect.height + ScrollThreshold)
    SmoothScrollTo(ContainerElement, targetScroll)
  END IF
END FUNCTION

FUNCTION SmoothScrollTo(Element, TargetScrollTop):
  Element.scrollTo({
    top: TargetScrollTop,
    behavior: 'smooth'
  })
END FUNCTION
```

---

## 4. Keyboard Key Highlighting Algorithm

### 4.1 Algorithm: HighlightKeys

```
ALGORITHM: HighlightKeys
PURPOSE: Highlight keyboard keys to guide user input
PERFORMANCE: < 4ms per update, 60fps animations

INPUT:
  - NextExpectedCharacter: string           // Character user should type next
  - ModifiersRequired: ModifierState        // Which modifiers needed (Shift, AltGr)
  - LastPressedKey: KeyPressEvent | null    // Most recent key press
  - KeyboardLayout: KeyboardLayoutData      // LATAM layout definition
  - CurrentHighlightState: KeyHighlightMap  // Previous highlight state

OUTPUT:
  - KeyHighlightStates: Map<KeyCode, KeyHighlightData>
  - TransitionAnimations: KeyAnimation[]

TYPES:
  KeyHighlightType = 'none' | 'next' | 'modifier' | 'pressed' | 'error'

  KeyHighlightData = {
    keyCode: string,
    highlightType: KeyHighlightType,
    intensity: number,      // 0.0 - 1.0 for animation
    cssClass: string
  }

  ModifierState = {
    shift: boolean,
    altGr: boolean,
    ctrl: boolean
  }
```

### 4.2 Main Highlighting Logic

```
FUNCTION HighlightKeys(NextChar, Modifiers, LastPressed, Layout, PreviousState):

  newHighlights <- new Map<KeyCode, KeyHighlightData>()
  animations <- empty array

  // Step 1: Find the key for the next expected character
  nextKeyInfo <- FindKeyForCharacter(NextChar, Layout)

  IF nextKeyInfo IS NOT NULL:
    // Highlight the primary key
    primaryHighlight <- {
      keyCode: nextKeyInfo.keyCode,
      highlightType: 'next',
      intensity: 1.0,
      cssClass: 'key--highlight-next'
    }
    newHighlights.SET(nextKeyInfo.keyCode, primaryHighlight)

    // Step 2: Highlight required modifier keys
    IF nextKeyInfo.requiresShift:
      shiftHighlight <- CreateModifierHighlight('ShiftLeft', 'ShiftRight')
      newHighlights.SET('ShiftLeft', shiftHighlight)
      newHighlights.SET('ShiftRight', shiftHighlight)
    END IF

    IF nextKeyInfo.requiresAltGr:
      altGrHighlight <- CreateModifierHighlight('AltRight')
      newHighlights.SET('AltRight', altGrHighlight)
    END IF
  END IF

  // Step 3: Handle key press feedback
  IF LastPressed IS NOT NULL:
    pressedHighlight <- HandleKeyPress(LastPressed, NextChar, Layout)

    // Merge press state with existing highlight
    existingHighlight <- newHighlights.GET(LastPressed.code)
    IF existingHighlight IS NOT NULL:
      mergedHighlight <- MergeHighlights(existingHighlight, pressedHighlight)
      newHighlights.SET(LastPressed.code, mergedHighlight)
    ELSE:
      newHighlights.SET(LastPressed.code, pressedHighlight)
    END IF
  END IF

  // Step 4: Generate transition animations
  animations <- CalculateTransitions(PreviousState, newHighlights)

  RETURN { KeyHighlightStates: newHighlights, TransitionAnimations: animations }
END FUNCTION
```

### 4.3 Key Lookup for Character

```
FUNCTION FindKeyForCharacter(char, Layout):

  // Search through all keys in layout
  FOR EACH row IN Layout.rows:
    FOR EACH key IN row:

      // Check normal (unmodified) character
      IF key.normal == char:
        RETURN {
          keyCode: key.code,
          requiresShift: FALSE,
          requiresAltGr: FALSE,
          keyDefinition: key
        }
      END IF

      // Check shift character
      IF key.shift == char:
        RETURN {
          keyCode: key.code,
          requiresShift: TRUE,
          requiresAltGr: FALSE,
          keyDefinition: key
        }
      END IF

      // Check AltGr character
      IF key.altGr == char:
        RETURN {
          keyCode: key.code,
          requiresShift: FALSE,
          requiresAltGr: TRUE,
          keyDefinition: key
        }
      END IF

      // Check Shift+AltGr character
      IF key.shiftAltGr == char:
        RETURN {
          keyCode: key.code,
          requiresShift: TRUE,
          requiresAltGr: TRUE,
          keyDefinition: key
        }
      END IF

    END FOR
  END FOR

  // Character not found in layout (special handling needed)
  RETURN HandleSpecialCharacter(char, Layout)
END FUNCTION
```

### 4.4 Key Press Feedback

```
FUNCTION HandleKeyPress(PressEvent, ExpectedChar, Layout):

  keyCode <- PressEvent.code
  typedChar <- PressEvent.key
  timestamp <- PressEvent.timestamp

  // Determine if press was correct or error
  expectedKeyInfo <- FindKeyForCharacter(ExpectedChar, Layout)

  IF expectedKeyInfo IS NOT NULL AND expectedKeyInfo.keyCode == keyCode:
    // Correct key pressed
    RETURN {
      keyCode: keyCode,
      highlightType: 'pressed',
      intensity: 1.0,
      cssClass: 'key--pressed key--correct',
      animationDuration: 100  // Quick flash
    }
  ELSE:
    // Wrong key pressed
    RETURN {
      keyCode: keyCode,
      highlightType: 'error',
      intensity: 1.0,
      cssClass: 'key--pressed key--error',
      animationDuration: 200  // Longer error indication
    }
  END IF
END FUNCTION

FUNCTION CreateModifierHighlight(primaryCode, secondaryCode = NULL):

  highlight <- {
    keyCode: primaryCode,
    highlightType: 'modifier',
    intensity: 0.7,  // Slightly dimmer than primary key
    cssClass: 'key--highlight-modifier'
  }

  RETURN highlight
END FUNCTION
```

### 4.5 Highlight Transitions

```
FUNCTION CalculateTransitions(PreviousState, NewState):

  animations <- empty array
  allKeys <- UNION(PreviousState.keys(), NewState.keys())

  FOR EACH keyCode IN allKeys:
    prevHighlight <- PreviousState.GET(keyCode)
    newHighlight <- NewState.GET(keyCode)

    // Key was highlighted, now isn't
    IF prevHighlight IS NOT NULL AND newHighlight IS NULL:
      animation <- {
        keyCode: keyCode,
        type: 'fadeOut',
        from: prevHighlight,
        to: NULL,
        duration: 150
      }
      APPEND animation TO animations

    // Key wasn't highlighted, now is
    ELSE IF prevHighlight IS NULL AND newHighlight IS NOT NULL:
      animation <- {
        keyCode: keyCode,
        type: 'fadeIn',
        from: NULL,
        to: newHighlight,
        duration: 100
      }
      APPEND animation TO animations

    // Highlight type changed
    ELSE IF prevHighlight.highlightType != newHighlight.highlightType:
      animation <- {
        keyCode: keyCode,
        type: 'transition',
        from: prevHighlight,
        to: newHighlight,
        duration: 80
      }
      APPEND animation TO animations
    END IF
  END FOR

  RETURN animations
END FUNCTION
```

### 4.6 Dead Key State Indication

```
FUNCTION HighlightDeadKeyState(DeadKeyState, Layout, CurrentHighlights):

  IF NOT DeadKeyState.active:
    RETURN CurrentHighlights
  END IF

  // Find composable vowels to highlight as hints
  composableKeys <- ['KeyA', 'KeyE', 'KeyI', 'KeyO', 'KeyU']

  FOR EACH keyCode IN composableKeys:
    hintHighlight <- {
      keyCode: keyCode,
      highlightType: 'hint',
      intensity: 0.4,  // Subtle hint
      cssClass: 'key--hint-composable'
    }

    // Don't override stronger highlights
    existing <- CurrentHighlights.GET(keyCode)
    IF existing IS NULL OR existing.intensity < hintHighlight.intensity:
      CurrentHighlights.SET(keyCode, hintHighlight)
    END IF
  END FOR

  // Show dead key indicator
  deadKeyIndicator <- {
    type: DeadKeyState.type,
    symbol: GetDeadKeySymbol(DeadKeyState.type),
    position: 'top-right'  // UI overlay position
  }

  RETURN { highlights: CurrentHighlights, deadKeyIndicator }
END FUNCTION

FUNCTION GetDeadKeySymbol(deadKeyType):
  SWITCH deadKeyType:
    CASE 'acute':     RETURN 'accent'
    CASE 'dieresis':  RETURN 'dieresis'
    CASE 'grave':     RETURN 'grave accent'
    CASE 'circumflex': RETURN 'circumflex'
    DEFAULT:          RETURN ''
  END SWITCH
END FUNCTION
```

### 4.7 Finger Guide Overlay

```
FUNCTION RenderFingerGuide(Layout, HighlightedKey, ShowGuide):

  IF NOT ShowGuide:
    RETURN NULL
  END IF

  // Define finger colors (colorblind-friendly palette)
  fingerColors <- {
    'left-pinky':  '#7c3aed',  // Purple
    'left-ring':   '#2563eb',  // Blue
    'left-middle': '#059669',  // Green
    'left-index':  '#d97706',  // Amber
    'right-index': '#d97706',  // Amber
    'right-middle':'#059669',  // Green
    'right-ring':  '#2563eb',  // Blue
    'right-pinky': '#7c3aed',  // Purple
    'thumb':       '#6b7280'   // Gray
  }

  fingerGuideData <- empty array

  FOR EACH row IN Layout.rows:
    FOR EACH key IN row:
      guideEntry <- {
        keyCode: key.code,
        finger: key.finger,
        color: fingerColors[key.finger],
        isHighlighted: HighlightedKey IS NOT NULL AND HighlightedKey.keyCode == key.code
      }
      APPEND guideEntry TO fingerGuideData
    END FOR
  END FOR

  RETURN fingerGuideData
END FUNCTION
```

---

## 5. Real-time Metrics Update Algorithm

### 5.1 Algorithm: UpdateMetricsDisplay

```
ALGORITHM: UpdateMetricsDisplay
PURPOSE: Calculate and display real-time typing metrics
PERFORMANCE: Updates every 500ms or on word completion, < 50ms calculation time

INPUT:
  - SessionState: {
      startTime: timestamp,
      charactersTyped: number,
      correctCharacters: number,
      errors: number,
      keystrokes: Keystroke[],
      isPaused: boolean,
      pausedDuration: number
    }
  - PreviousMetrics: MetricsDisplayData
  - UpdateTrigger: 'interval' | 'word' | 'keystroke'

OUTPUT:
  - FormattedMetrics: MetricsDisplayData
  - AnimationDeltas: MetricAnimationData[]

TYPES:
  MetricsDisplayData = {
    grossWPM: string,
    netWPM: string,
    accuracy: string,
    elapsedTime: string,
    errorCount: number,
    wordsTyped: number
  }

  MetricAnimationData = {
    metric: string,
    oldValue: number,
    newValue: number,
    direction: 'up' | 'down' | 'stable'
  }
```

### 5.2 WPM Calculation

```
FUNCTION CalculateWPM(SessionState):

  // Constants
  CHARS_PER_WORD <- 5

  // Calculate elapsed time (excluding pauses)
  currentTime <- NOW()
  totalElapsed <- currentTime - SessionState.startTime
  activeTime <- totalElapsed - SessionState.pausedDuration

  // Convert to minutes
  activeMinutes <- activeTime / 60000

  // Avoid division by zero
  IF activeMinutes < 0.01:  // Less than 0.6 seconds
    RETURN { grossWPM: 0, netWPM: 0 }
  END IF

  // Calculate gross WPM (all characters typed)
  totalWords <- SessionState.charactersTyped / CHARS_PER_WORD
  grossWPM <- totalWords / activeMinutes

  // Calculate net WPM (penalize errors)
  errorPenalty <- SessionState.errors / CHARS_PER_WORD
  netWords <- MAX(0, totalWords - errorPenalty)
  netWPM <- netWords / activeMinutes

  RETURN {
    grossWPM: ROUND(grossWPM, 1),
    netWPM: ROUND(netWPM, 1)
  }
END FUNCTION
```

### 5.3 Rolling WPM Calculation

```
FUNCTION CalculateRollingWPM(Keystrokes, WindowMs = 30000):

  // Need at least 2 keystrokes for calculation
  IF LENGTH(Keystrokes) < 2:
    RETURN { rollingWPM: 0, trend: 'stable' }
  END IF

  // Get keystrokes within window
  currentTime <- NOW()
  windowStart <- currentTime - WindowMs

  recentKeystrokes <- FILTER Keystrokes WHERE keystroke.timestamp >= windowStart

  IF LENGTH(recentKeystrokes) < 2:
    RETURN { rollingWPM: 0, trend: 'stable' }
  END IF

  // Calculate WPM for window
  windowDuration <- recentKeystrokes[LAST].timestamp - recentKeystrokes[0].timestamp
  windowMinutes <- windowDuration / 60000

  IF windowMinutes < 0.01:
    RETURN { rollingWPM: 0, trend: 'stable' }
  END IF

  correctInWindow <- COUNT(recentKeystrokes WHERE keystroke.isCorrect)
  wordsInWindow <- correctInWindow / 5
  rollingWPM <- wordsInWindow / windowMinutes

  // Calculate trend (compare to previous window)
  IF PreviousRollingWPM IS NOT NULL:
    IF rollingWPM > PreviousRollingWPM * 1.05:
      trend <- 'up'
    ELSE IF rollingWPM < PreviousRollingWPM * 0.95:
      trend <- 'down'
    ELSE:
      trend <- 'stable'
    END IF
  ELSE:
    trend <- 'stable'
  END IF

  RETURN { rollingWPM: ROUND(rollingWPM, 1), trend }
END FUNCTION
```

### 5.4 Accuracy Calculation

```
FUNCTION CalculateAccuracy(SessionState):

  totalAttempts <- SessionState.charactersTyped + SessionState.errors

  IF totalAttempts == 0:
    RETURN 100.0
  END IF

  accuracy <- (SessionState.correctCharacters / totalAttempts) * 100

  RETURN ROUND(accuracy, 1)
END FUNCTION
```

### 5.5 Format Metrics for Display

```
FUNCTION FormatMetrics(WPMData, Accuracy, SessionState, PreviousMetrics):

  // Format WPM with 1 decimal place
  grossWPMFormatted <- FORMAT_NUMBER(WPMData.grossWPM, 1)
  netWPMFormatted <- FORMAT_NUMBER(WPMData.netWPM, 1)

  // Format accuracy as percentage
  accuracyFormatted <- FORMAT_NUMBER(Accuracy, 1) + "%"

  // Format elapsed time
  elapsedMs <- NOW() - SessionState.startTime - SessionState.pausedDuration
  elapsedFormatted <- FormatTime(elapsedMs)

  // Calculate animation deltas
  animations <- []

  IF PreviousMetrics IS NOT NULL:
    // WPM animation
    IF WPMData.netWPM != PreviousMetrics.netWPM:
      APPEND {
        metric: 'wpm',
        oldValue: PreviousMetrics.netWPM,
        newValue: WPMData.netWPM,
        direction: IF WPMData.netWPM > PreviousMetrics.netWPM THEN 'up' ELSE 'down'
      } TO animations
    END IF

    // Accuracy animation
    IF Accuracy != PreviousMetrics.accuracy:
      APPEND {
        metric: 'accuracy',
        oldValue: PreviousMetrics.accuracy,
        newValue: Accuracy,
        direction: IF Accuracy > PreviousMetrics.accuracy THEN 'up' ELSE 'down'
      } TO animations
    END IF
  END IF

  RETURN {
    metrics: {
      grossWPM: grossWPMFormatted,
      netWPM: netWPMFormatted,
      accuracy: accuracyFormatted,
      elapsedTime: elapsedFormatted,
      errorCount: SessionState.errors,
      wordsTyped: FLOOR(SessionState.correctCharacters / 5)
    },
    animations: animations
  }
END FUNCTION

FUNCTION FormatTime(milliseconds):
  totalSeconds <- FLOOR(milliseconds / 1000)
  minutes <- FLOOR(totalSeconds / 60)
  seconds <- totalSeconds MOD 60

  RETURN PAD(minutes, 2) + ":" + PAD(seconds, 2)
END FUNCTION
```

### 5.6 Metrics Update Scheduler

```
FUNCTION CreateMetricsUpdateScheduler(OnUpdate):

  intervalId <- NULL
  lastUpdateTime <- 0
  UPDATE_INTERVAL <- 500  // milliseconds

  FUNCTION Start():
    IF intervalId IS NOT NULL:
      RETURN  // Already running
    END IF

    intervalId <- setInterval(() => {
      currentTime <- NOW()

      // Throttle updates
      IF currentTime - lastUpdateTime >= UPDATE_INTERVAL:
        OnUpdate('interval')
        lastUpdateTime <- currentTime
      END IF
    }, UPDATE_INTERVAL)
  END FUNCTION

  FUNCTION Stop():
    IF intervalId IS NOT NULL:
      clearInterval(intervalId)
      intervalId <- NULL
    END IF
  END FUNCTION

  FUNCTION OnWordComplete():
    // Immediate update on word completion
    OnUpdate('word')
    lastUpdateTime <- NOW()
  END FUNCTION

  FUNCTION OnKeystroke():
    // Don't update on every keystroke (too expensive)
    // But record the time for potential immediate update needs
  END FUNCTION

  RETURN { Start, Stop, OnWordComplete, OnKeystroke }
END FUNCTION
```

### 5.7 Value Change Animation

```
FUNCTION AnimateValueChange(Element, OldValue, NewValue, Direction):

  // Determine animation based on direction
  IF Direction == 'up':
    colorClass <- 'metric--increasing'
    icon <- up arrow symbol
  ELSE IF Direction == 'down':
    colorClass <- 'metric--decreasing'
    icon <- down arrow symbol
  ELSE:
    RETURN  // No animation for stable
  END IF

  // Apply animation class
  Element.classList.add(colorClass)
  Element.classList.add('metric--animating')

  // Animate number change
  animationFrames <- 10
  valueDiff <- NewValue - OldValue
  stepValue <- valueDiff / animationFrames
  currentValue <- OldValue

  FOR frame FROM 1 TO animationFrames:
    RequestAnimationFrame(() => {
      currentValue <- currentValue + stepValue
      Element.textContent <- FORMAT_NUMBER(currentValue, 1)
    })
  END FOR

  // Remove animation class after completion
  setTimeout(() => {
    Element.classList.remove(colorClass)
    Element.classList.remove('metric--animating')
    Element.textContent <- FORMAT_NUMBER(NewValue, 1)
  }, 300)
END FUNCTION
```

---

## 6. Results Screen Generation Algorithm

### 6.1 Algorithm: GenerateResults

```
ALGORITHM: GenerateResults
PURPOSE: Compile comprehensive results and analysis after session completion
PERFORMANCE: < 500ms total calculation time

INPUT:
  - CompletedSession: {
      id: string,
      text: string,
      startTime: timestamp,
      endTime: timestamp,
      keystrokes: Keystroke[],
      errors: ErrorRecord[],
      mode: 'strict' | 'lenient' | 'no-backspace',
      pausedDuration: number
    }
  - PreviousSessions: Session[]  // For comparison (last 10 sessions)

OUTPUT:
  - ResultsData: SessionResultsData

TYPES:
  SessionResultsData = {
    summary: ResultsSummary,
    timing: TimingAnalysis,
    errors: ErrorAnalysis,
    comparison: SessionComparison,
    recommendations: PracticeSuggestion[]
  }
```

### 6.2 Summary Calculation

```
FUNCTION CalculateResultsSummary(Session):

  // Calculate final metrics
  totalTime <- Session.endTime - Session.startTime - Session.pausedDuration
  totalMinutes <- totalTime / 60000

  totalCharacters <- LENGTH(Session.text)
  correctCharacters <- CountCorrectCharacters(Session.keystrokes)
  totalErrors <- LENGTH(Session.errors)
  correctedErrors <- CountCorrectedErrors(Session.errors)
  uncorrectedErrors <- totalErrors - correctedErrors

  // WPM calculations
  grossWPM <- (totalCharacters / 5) / totalMinutes
  netWPM <- MAX(0, ((totalCharacters - uncorrectedErrors) / 5) / totalMinutes)

  // Accuracy
  accuracy <- (correctCharacters / (correctCharacters + totalErrors)) * 100

  RETURN {
    grossWPM: ROUND(grossWPM, 1),
    netWPM: ROUND(netWPM, 1),
    accuracy: ROUND(accuracy, 1),
    totalTime: totalTime,
    totalCharacters: totalCharacters,
    totalErrors: totalErrors,
    correctedErrors: correctedErrors,
    uncorrectedErrors: uncorrectedErrors,
    wordsTyped: FLOOR(correctCharacters / 5),
    mode: Session.mode
  }
END FUNCTION
```

### 6.3 Timing Analysis

```
FUNCTION AnalyzeTiming(Session):

  keystrokes <- Session.keystrokes
  intervals <- []

  // Calculate inter-keystroke intervals
  FOR i FROM 1 TO LENGTH(keystrokes) - 1:
    interval <- keystrokes[i].timestamp - keystrokes[i-1].timestamp

    // Filter out pauses (> 2 seconds suggests user paused)
    IF interval < 2000:
      APPEND {
        interval: interval,
        character: keystrokes[i].expected,
        isCorrect: keystrokes[i].isCorrect
      } TO intervals
    END IF
  END FOR

  // Calculate statistics
  allIntervals <- EXTRACT interval FROM intervals
  correctIntervals <- EXTRACT interval FROM intervals WHERE isCorrect == TRUE

  RETURN {
    averageInterval: ROUND(AVERAGE(allIntervals), 0),
    medianInterval: ROUND(MEDIAN(allIntervals), 0),
    fastestInterval: MIN(allIntervals),
    slowestInterval: MAX(allIntervals),

    // By correctness
    averageCorrectInterval: ROUND(AVERAGE(correctIntervals), 0),

    // Consistency (standard deviation)
    consistency: ROUND(STANDARD_DEVIATION(allIntervals), 0),

    // Identify slow characters
    slowCharacters: IdentifySlowCharacters(intervals),

    // Speed distribution
    speedDistribution: CalculateSpeedDistribution(intervals)
  }
END FUNCTION

FUNCTION IdentifySlowCharacters(Intervals):

  // Group by character
  charTimes <- new Map<string, number[]>()

  FOR EACH entry IN Intervals:
    times <- charTimes.GET(entry.character) OR empty array
    APPEND entry.interval TO times
    charTimes.SET(entry.character, times)
  END FOR

  // Calculate average for each character
  charAverages <- []
  FOR EACH [char, times] IN charTimes:
    IF LENGTH(times) >= 3:  // Need enough samples
      avg <- AVERAGE(times)
      APPEND { character: char, averageTime: avg, count: LENGTH(times) } TO charAverages
    END IF
  END FOR

  // Sort by average time (slowest first)
  SORT charAverages BY averageTime DESCENDING

  // Return top 5 slowest
  RETURN FIRST(5, charAverages)
END FUNCTION
```

### 6.4 Error Analysis

```
FUNCTION AnalyzeErrors(Session):

  errors <- Session.errors

  IF LENGTH(errors) == 0:
    RETURN {
      totalErrors: 0,
      errorRate: 0,
      errorsByCharacter: [],
      commonMistakes: [],
      errorTimeline: [],
      problematicKeys: []
    }
  END IF

  // Group errors by expected character
  errorsByChar <- new Map<string, ErrorInfo[]>()

  FOR EACH error IN errors:
    charErrors <- errorsByChar.GET(error.expected) OR empty array
    APPEND error TO charErrors
    errorsByChar.SET(error.expected, charErrors)
  END FOR

  // Convert to sorted array
  errorCharList <- []
  FOR EACH [char, errs] IN errorsByChar:
    APPEND {
      character: char,
      count: LENGTH(errs),
      mistakes: ExtractMistakePatterns(errs)
    } TO errorCharList
  END FOR

  SORT errorCharList BY count DESCENDING

  // Identify common substitution patterns
  substitutionPatterns <- IdentifySubstitutionPatterns(errors)

  // Error timeline (when in session did errors occur)
  errorTimeline <- CreateErrorTimeline(errors, Session)

  // Calculate error rate over time
  errorRate <- (LENGTH(errors) / LENGTH(Session.keystrokes)) * 100

  RETURN {
    totalErrors: LENGTH(errors),
    errorRate: ROUND(errorRate, 1),
    errorsByCharacter: FIRST(10, errorCharList),
    commonMistakes: FIRST(5, substitutionPatterns),
    errorTimeline: errorTimeline,
    problematicKeys: IdentifyProblematicKeys(errorCharList, Session)
  }
END FUNCTION

FUNCTION IdentifySubstitutionPatterns(Errors):

  patterns <- new Map<string, number>()

  FOR EACH error IN Errors:
    patternKey <- error.expected + " -> " + error.actual
    count <- patterns.GET(patternKey) OR 0
    patterns.SET(patternKey, count + 1)
  END FOR

  // Convert to sorted array
  patternList <- []
  FOR EACH [pattern, count] IN patterns:
    APPEND { pattern: pattern, count: count } TO patternList
  END FOR

  SORT patternList BY count DESCENDING

  RETURN patternList
END FUNCTION

FUNCTION CreateErrorTimeline(Errors, Session):

  sessionDuration <- Session.endTime - Session.startTime
  bucketSize <- sessionDuration / 10  // Divide into 10 segments

  buckets <- ARRAY(10, 0)  // 10 buckets initialized to 0

  FOR EACH error IN Errors:
    errorTime <- error.timestamp - Session.startTime
    bucketIndex <- MIN(9, FLOOR(errorTime / bucketSize))
    buckets[bucketIndex] <- buckets[bucketIndex] + 1
  END FOR

  RETURN buckets
END FUNCTION
```

### 6.5 Session Comparison

```
FUNCTION CompareWithPreviousSessions(CurrentResults, PreviousSessions):

  IF LENGTH(PreviousSessions) == 0:
    RETURN {
      isFirstSession: TRUE,
      comparison: NULL,
      trend: NULL
    }
  END IF

  // Calculate averages from previous sessions
  prevWPMs <- EXTRACT netWPM FROM PreviousSessions
  prevAccuracies <- EXTRACT accuracy FROM PreviousSessions

  avgPrevWPM <- AVERAGE(prevWPMs)
  avgPrevAccuracy <- AVERAGE(prevAccuracies)

  // Calculate improvement/decline
  wpmChange <- CurrentResults.netWPM - avgPrevWPM
  wpmChangePercent <- (wpmChange / avgPrevWPM) * 100

  accuracyChange <- CurrentResults.accuracy - avgPrevAccuracy

  // Determine overall trend
  IF wpmChangePercent > 5 AND accuracyChange >= -2:
    trend <- 'improving'
  ELSE IF wpmChangePercent < -5 OR accuracyChange < -5:
    trend <- 'declining'
  ELSE:
    trend <- 'stable'
  END IF

  // Personal bests
  bestWPM <- MAX(prevWPMs)
  bestAccuracy <- MAX(prevAccuracies)

  isNewWPMRecord <- CurrentResults.netWPM > bestWPM
  isNewAccuracyRecord <- CurrentResults.accuracy > bestAccuracy

  // Recent trend (last 5 sessions)
  recentSessions <- LAST(5, PreviousSessions)
  recentWPMs <- EXTRACT netWPM FROM recentSessions
  recentTrend <- CalculateTrendDirection(recentWPMs)

  RETURN {
    isFirstSession: FALSE,
    comparison: {
      previousAvgWPM: ROUND(avgPrevWPM, 1),
      previousAvgAccuracy: ROUND(avgPrevAccuracy, 1),
      wpmChange: ROUND(wpmChange, 1),
      wpmChangePercent: ROUND(wpmChangePercent, 1),
      accuracyChange: ROUND(accuracyChange, 1)
    },
    personalBests: {
      wpm: ROUND(MAX(bestWPM, CurrentResults.netWPM), 1),
      accuracy: ROUND(MAX(bestAccuracy, CurrentResults.accuracy), 1),
      isNewWPMRecord: isNewWPMRecord,
      isNewAccuracyRecord: isNewAccuracyRecord
    },
    trend: trend,
    recentTrend: recentTrend,
    totalSessions: LENGTH(PreviousSessions) + 1
  }
END FUNCTION

FUNCTION CalculateTrendDirection(Values):

  IF LENGTH(Values) < 3:
    RETURN 'insufficient_data'
  END IF

  // Simple linear regression slope
  n <- LENGTH(Values)
  sumX <- (n * (n - 1)) / 2
  sumY <- SUM(Values)
  sumXY <- 0
  sumX2 <- 0

  FOR i FROM 0 TO n - 1:
    sumXY <- sumXY + (i * Values[i])
    sumX2 <- sumX2 + (i * i)
  END FOR

  slope <- (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  IF slope > 0.5:
    RETURN 'up'
  ELSE IF slope < -0.5:
    RETURN 'down'
  ELSE:
    RETURN 'flat'
  END IF
END FUNCTION
```

### 6.6 Practice Recommendations

```
FUNCTION GenerateRecommendations(Results, Errors, Timing, Comparison):

  recommendations <- []

  // Priority 1: Address major error patterns
  IF LENGTH(Errors.errorsByCharacter) > 0:
    topErrorChar <- Errors.errorsByCharacter[0]

    IF topErrorChar.count >= 3:
      recommendation <- {
        type: 'character_practice',
        priority: 'high',
        title: "Practice '" + topErrorChar.character + "'",
        description: "You made " + topErrorChar.count + " errors with this character. " +
                     "Focus on its position on the LATAM keyboard.",
        action: {
          type: 'generate_exercise',
          targetCharacter: topErrorChar.character
        }
      }
      APPEND recommendation TO recommendations
    END IF
  END IF

  // Priority 2: Speed improvement for slow characters
  IF LENGTH(Timing.slowCharacters) > 0:
    slowestChar <- Timing.slowCharacters[0]
    avgTime <- slowestChar.averageTime

    IF avgTime > 500:  // More than 500ms average
      recommendation <- {
        type: 'speed_practice',
        priority: 'medium',
        title: "Speed up '" + slowestChar.character + "'",
        description: "Your average time for this character is " +
                     ROUND(avgTime) + "ms. Practice to build muscle memory.",
        action: {
          type: 'generate_exercise',
          targetCharacter: slowestChar.character,
          focus: 'speed'
        }
      }
      APPEND recommendation TO recommendations
    END IF
  END IF

  // Priority 3: Modifier key practice
  IF HasModifierIssues(Errors):
    recommendation <- {
      type: 'modifier_practice',
      priority: 'medium',
      title: "Practice Shift/AltGr combinations",
      description: "Several errors involved characters requiring modifier keys. " +
                   "Practice shifted and AltGr characters.",
      action: {
        type: 'generate_exercise',
        focus: 'modifiers'
      }
    }
    APPEND recommendation TO recommendations
  END IF

  // Priority 4: Accuracy vs Speed balance
  IF Results.accuracy < 95 AND Results.netWPM > 40:
    recommendation <- {
      type: 'accuracy_focus',
      priority: 'medium',
      title: "Slow down for accuracy",
      description: "Your speed is good (" + Results.netWPM + " WPM) but accuracy " +
                   "(" + Results.accuracy + "%) could improve. Try typing more deliberately.",
      action: NULL
    }
    APPEND recommendation TO recommendations

  ELSE IF Results.accuracy > 98 AND Results.netWPM < 30:
    recommendation <- {
      type: 'speed_focus',
      priority: 'low',
      title: "Push your speed",
      description: "Excellent accuracy! Challenge yourself to type faster. " +
                   "Some errors are acceptable while building speed.",
      action: NULL
    }
    APPEND recommendation TO recommendations
  END IF

  // Priority 5: Consistency
  IF Timing.consistency > 200:  // High standard deviation
    recommendation <- {
      type: 'consistency_practice',
      priority: 'low',
      title: "Work on typing rhythm",
      description: "Your typing speed varies significantly. Practice maintaining " +
                   "a steady rhythm for better overall performance.",
      action: {
        type: 'metronome_exercise'
      }
    }
    APPEND recommendation TO recommendations
  END IF

  // Priority 6: Celebrate achievements
  IF Comparison IS NOT NULL AND Comparison.personalBests.isNewWPMRecord:
    recommendation <- {
      type: 'achievement',
      priority: 'info',
      title: "New personal best! " + trophy symbol,
      description: "You set a new WPM record: " + Results.netWPM + " WPM!",
      action: NULL
    }
    PREPEND recommendation TO recommendations  // Show first
  END IF

  // Limit to top 5 recommendations
  RETURN FIRST(5, recommendations)
END FUNCTION

FUNCTION HasModifierIssues(Errors):

  modifierChars <- ['!', '"', '#', '$', '%', '&', '/', '(', ')', '=', '?',
                   '@', uppercase letters, '{', '[', ']', '}', etc.]

  modifierErrorCount <- 0
  FOR EACH errorEntry IN Errors.errorsByCharacter:
    IF errorEntry.character IN modifierChars:
      modifierErrorCount <- modifierErrorCount + errorEntry.count
    END IF
  END FOR

  RETURN modifierErrorCount >= 3
END FUNCTION
```

### 6.7 Results Formatting for Display

```
FUNCTION FormatResultsForDisplay(ResultsData):

  summary <- ResultsData.summary
  comparison <- ResultsData.comparison

  // Format main stats
  displayData <- {
    // Hero stats (large display)
    heroStats: {
      wpm: {
        value: summary.netWPM,
        label: "WPM",
        subLabel: "(Net)",
        trend: GetTrendIndicator(comparison, 'wpm')
      },
      accuracy: {
        value: summary.accuracy + "%",
        label: "Accuracy",
        subLabel: NULL,
        trend: GetTrendIndicator(comparison, 'accuracy')
      },
      time: {
        value: FormatDuration(summary.totalTime),
        label: "Time",
        subLabel: NULL,
        trend: NULL
      }
    },

    // Secondary stats
    secondaryStats: [
      { label: "Gross WPM", value: summary.grossWPM },
      { label: "Characters", value: summary.totalCharacters },
      { label: "Words", value: summary.wordsTyped },
      { label: "Errors", value: summary.totalErrors },
      { label: "Corrected", value: summary.correctedErrors }
    ],

    // Error breakdown (if errors exist)
    errorSection: FormatErrorSection(ResultsData.errors),

    // Timing insights
    timingSection: FormatTimingSection(ResultsData.timing),

    // Comparison (if available)
    comparisonSection: FormatComparisonSection(comparison),

    // Recommendations
    recommendations: ResultsData.recommendations,

    // Actions
    actions: [
      { id: 'retry', label: "Try Again", icon: "refresh", primary: TRUE },
      { id: 'new', label: "New Text", icon: "document", primary: FALSE },
      { id: 'history', label: "View History", icon: "chart", primary: FALSE }
    ]
  }

  RETURN displayData
END FUNCTION

FUNCTION GetTrendIndicator(Comparison, Metric):

  IF Comparison IS NULL OR Comparison.isFirstSession:
    RETURN NULL
  END IF

  IF Metric == 'wpm':
    change <- Comparison.comparison.wpmChange
    IF change > 2:
      RETURN { direction: 'up', value: "+" + change }
    ELSE IF change < -2:
      RETURN { direction: 'down', value: change }
    ELSE:
      RETURN { direction: 'stable', value: "0" }
    END IF

  ELSE IF Metric == 'accuracy':
    change <- Comparison.comparison.accuracyChange
    IF change > 1:
      RETURN { direction: 'up', value: "+" + change + "%" }
    ELSE IF change < -1:
      RETURN { direction: 'down', value: change + "%" }
    ELSE:
      RETURN { direction: 'stable', value: "0%" }
    END IF
  END IF

  RETURN NULL
END FUNCTION

FUNCTION FormatDuration(Milliseconds):

  totalSeconds <- FLOOR(Milliseconds / 1000)
  minutes <- FLOOR(totalSeconds / 60)
  seconds <- totalSeconds MOD 60

  IF minutes == 0:
    RETURN seconds + "s"
  ELSE:
    RETURN minutes + "m " + seconds + "s"
  END IF
END FUNCTION
```

---

## 7. Integration and Orchestration

### 7.1 UI Update Coordinator

```
FUNCTION CreateUICoordinator():

  // State references
  textDisplayState <- NULL
  cursorState <- NULL
  keyboardState <- NULL
  metricsState <- NULL

  // Pending updates queue
  updateQueue <- new PriorityQueue()

  // Animation frame handle
  rafHandle <- NULL

  FUNCTION QueueUpdate(updateType, data, priority):
    update <- { type: updateType, data: data, priority: priority, timestamp: NOW() }
    updateQueue.ENQUEUE(update, priority)

    // Schedule processing if not already scheduled
    IF rafHandle IS NULL:
      rafHandle <- RequestAnimationFrame(ProcessUpdates)
    END IF
  END FUNCTION

  FUNCTION ProcessUpdates():
    startTime <- performance.now()
    BUDGET <- 12  // milliseconds (leave 4ms headroom for 60fps)

    WHILE updateQueue.IS_NOT_EMPTY() AND (performance.now() - startTime) < BUDGET:
      update <- updateQueue.DEQUEUE()

      SWITCH update.type:
        CASE 'character':
          ApplyTextDisplayUpdate(update.data)
          BREAK

        CASE 'cursor':
          ApplyCursorUpdate(update.data)
          BREAK

        CASE 'keyboard':
          ApplyKeyboardUpdate(update.data)
          BREAK

        CASE 'metrics':
          ApplyMetricsUpdate(update.data)
          BREAK
      END SWITCH
    END WHILE

    // If updates remain, schedule another frame
    IF updateQueue.IS_NOT_EMPTY():
      rafHandle <- RequestAnimationFrame(ProcessUpdates)
    ELSE:
      rafHandle <- NULL
    END IF
  END FUNCTION

  FUNCTION OnKeystroke(KeyEvent, TypingResult):

    // High priority: Character state change
    QueueUpdate('character', {
      position: TypingResult.position,
      state: TypingResult.characterState
    }, PRIORITY_HIGH)

    // High priority: Cursor movement
    QueueUpdate('cursor', {
      targetPosition: TypingResult.newPosition
    }, PRIORITY_HIGH)

    // Medium priority: Keyboard highlighting
    QueueUpdate('keyboard', {
      nextCharacter: TypingResult.nextExpected,
      pressedKey: KeyEvent.code,
      isCorrect: TypingResult.isCorrect
    }, PRIORITY_MEDIUM)

    // Low priority: Metrics (throttled separately)
    // Handled by MetricsUpdateScheduler
  END FUNCTION

  RETURN {
    QueueUpdate,
    OnKeystroke,
    ProcessUpdates
  }
END FUNCTION
```

### 7.2 Performance Monitoring

```
FUNCTION CreatePerformanceMonitor():

  frameTimings <- []
  keystrokeTimings <- []
  MAX_SAMPLES <- 100

  FUNCTION RecordFrameTime(duration):
    APPEND duration TO frameTimings
    IF LENGTH(frameTimings) > MAX_SAMPLES:
      REMOVE_FIRST(frameTimings)
    END IF
  END FUNCTION

  FUNCTION RecordKeystrokeLatency(latency):
    APPEND latency TO keystrokeTimings
    IF LENGTH(keystrokeTimings) > MAX_SAMPLES:
      REMOVE_FIRST(keystrokeTimings)
    END IF
  END FUNCTION

  FUNCTION GetPerformanceReport():
    RETURN {
      averageFrameTime: AVERAGE(frameTimings),
      maxFrameTime: MAX(frameTimings),
      droppedFrames: COUNT(frameTimings WHERE t > 16.67),

      averageKeystrokeLatency: AVERAGE(keystrokeTimings),
      maxKeystrokeLatency: MAX(keystrokeTimings),
      slowKeystrokes: COUNT(keystrokeTimings WHERE t > 16)
    }
  END FUNCTION

  FUNCTION WarnIfPerformanceIssues():
    report <- GetPerformanceReport()

    IF report.averageFrameTime > 12:
      console.warn("Average frame time high:", report.averageFrameTime, "ms")
    END IF

    IF report.droppedFrames > 5:
      console.warn("Dropped frames detected:", report.droppedFrames)
    END IF

    IF report.averageKeystrokeLatency > 10:
      console.warn("Keystroke latency high:", report.averageKeystrokeLatency, "ms")
    END IF
  END FUNCTION

  RETURN {
    RecordFrameTime,
    RecordKeystrokeLatency,
    GetPerformanceReport,
    WarnIfPerformanceIssues
  }
END FUNCTION
```

---

## 8. Accessibility Considerations

### 8.1 Screen Reader Support

```
FUNCTION GenerateAriaLabel(char, state, index):

  // Character description
  charDescription <- GetCharacterDescription(char)

  // State description
  stateDescription <- SWITCH state:
    CASE 'pending':   ""
    CASE 'current':   ", next to type"
    CASE 'correct':   ", typed correctly"
    CASE 'incorrect': ", typed incorrectly"
    CASE 'corrected': ", corrected"
  END SWITCH

  RETURN charDescription + stateDescription
END FUNCTION

FUNCTION GetCharacterDescription(char):

  // Common character names
  charNames <- {
    ' ': "space",
    '\n': "new line",
    '\t': "tab",
    '.': "period",
    ',': "comma",
    'n with tilde': "n with tilde",
    accented vowels: accented vowel description,
    inverted question mark: "inverted question mark",
    inverted exclamation: "inverted exclamation mark"
    // ... etc
  }

  IF char IN charNames:
    RETURN charNames[char]
  ELSE:
    RETURN char
  END IF
END FUNCTION
```

### 8.2 Live Region Updates

```
FUNCTION AnnounceMetricsUpdate(Metrics, PreviousMetrics):

  // Only announce significant changes
  announcements <- []

  IF ABS(Metrics.netWPM - PreviousMetrics.netWPM) >= 5:
    APPEND "Speed: " + Metrics.netWPM + " words per minute" TO announcements
  END IF

  IF ABS(Metrics.accuracy - PreviousMetrics.accuracy) >= 2:
    APPEND "Accuracy: " + Metrics.accuracy + " percent" TO announcements
  END IF

  IF LENGTH(announcements) > 0:
    announcement <- JOIN(announcements, ". ")
    SetAriaLive(announcement, 'polite')
  END IF
END FUNCTION

FUNCTION AnnounceError(ExpectedChar, ActualChar):
  announcement <- "Error: expected " + GetCharacterDescription(ExpectedChar) +
                  ", typed " + GetCharacterDescription(ActualChar)
  SetAriaLive(announcement, 'assertive')
END FUNCTION

FUNCTION AnnounceSessionComplete(Results):
  announcement <- "Session complete. " +
                  "Speed: " + Results.netWPM + " words per minute. " +
                  "Accuracy: " + Results.accuracy + " percent. " +
                  "Time: " + FormatDuration(Results.totalTime) + "."
  SetAriaLive(announcement, 'polite')
END FUNCTION
```

---

## 9. CSS Animation Specifications

### 9.1 Character State Transitions

```css
/* Pseudocode for CSS animations */

.char {
  transition-property: color, background-color, text-decoration;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.char--animate {
  animation: char-state-change 150ms ease-out;
}

@keyframes char-state-change {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.char--correct {
  color: var(--color-success);
}

.char--incorrect {
  color: var(--color-error);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.char--corrected {
  color: var(--color-warning);
  text-decoration: underline;
  text-decoration-style: wavy;
}

.char--current {
  background-color: var(--color-highlight);
  border-radius: 2px;
}
```

### 9.2 Cursor Animations

```css
.cursor {
  position: absolute;
  width: 2px;
  background-color: var(--color-primary);
  transition: transform 80ms ease-out, height 80ms ease-out;
  will-change: transform;
}

.cursor--blinking {
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
```

### 9.3 Key Highlight Animations

```css
.key {
  transition: background-color 100ms ease-out,
              transform 100ms ease-out,
              box-shadow 100ms ease-out;
}

.key--highlight-next {
  background-color: var(--color-primary-light);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.key--highlight-modifier {
  background-color: var(--color-secondary-light);
  box-shadow: 0 0 0 2px var(--color-secondary);
}

.key--pressed {
  transform: scale(0.95) translateY(2px);
  transition-duration: 50ms;
}

.key--error {
  background-color: var(--color-error-light);
  animation: key-error-shake 200ms ease-out;
}

@keyframes key-error-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
```

---

## 10. Summary

This pseudocode document defines five core UI rendering algorithms:

1. **RenderTextDisplay**: Efficient character-by-character rendering with state management and incremental updates
2. **AnimateCursor**: Smooth 60fps cursor animation with line wrap handling and blink management
3. **HighlightKeys**: Intelligent keyboard key highlighting for next character, modifiers, and feedback
4. **UpdateMetricsDisplay**: Real-time metrics calculation with animated value changes
5. **GenerateResults**: Comprehensive session analysis with comparisons and recommendations

**Key Performance Targets:**
- Keystroke to visual feedback: < 8ms
- Character state transitions: < 16ms (60fps)
- Metrics updates: Every 500ms
- Results generation: < 500ms

**Design Principles Applied:**
- Incremental DOM updates
- Hardware-accelerated CSS animations
- Debounced non-critical calculations
- Object pooling in hot paths
- Accessibility-first approach

---

*End of Pseudocode Document*
