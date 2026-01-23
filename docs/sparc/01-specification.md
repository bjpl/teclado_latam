# SPARC Specification: Teclado LATAM

**Project:** Teclado LATAM - LATAM Spanish Keyboard Typing Practice Application
**Version:** 1.0.0
**Status:** Specification Phase
**Created:** 2026-01-23
**Author:** Strategic Planning Agent

---

## 1. Executive Summary

### 1.1 Problem Statement

Users with US English physical keyboards who want to practice typing with the Latin American (LATAM) Spanish keyboard layout face a significant challenge. While Windows allows switching keyboard layouts, the physical key labels do not match the expected characters, making it difficult to build muscle memory and typing proficiency without constant reference to a layout diagram.

### 1.2 Proposed Solution

**Teclado LATAM** is a web-based typing practice application that provides:
- Real-time visual keyboard overlay showing the LATAM Spanish layout
- Custom text input for personalized practice sessions
- Dynamic key highlighting to guide finger placement
- Performance metrics to track progress over time
- A modern, elegant user interface optimized for focused practice

### 1.3 Target User

- Primary: Individual user with US English physical keyboard
- Secondary: Any user wanting to learn/practice LATAM Spanish typing
- Future: Multi-user support for broader audience

### 1.4 Success Criteria

| Metric | Target |
|--------|--------|
| Initial page load | < 2 seconds |
| Typing input latency | < 16ms (60fps) |
| Keyboard highlight response | < 8ms |
| Lighthouse Performance Score | > 90 |
| User can start practicing | < 30 seconds from landing |

---

## 2. Functional Requirements

### 2.1 Text Input System

#### FR-2.1.1: Custom Text Paste
- **Description:** Users can paste any text they want to practice typing
- **Input:** Text via clipboard paste or direct typing into input area
- **Validation:**
  - Accept Unicode text including Spanish characters
  - Handle special characters: n with tilde, accented vowels, inverted punctuation
  - Maximum text length: 10,000 characters per session
  - Minimum text length: 1 character
- **Behavior:**
  - Preserve line breaks and formatting
  - Strip potentially harmful content (script tags, etc.)
  - Display character count

#### FR-2.1.2: Sample Text Library
- **Description:** Pre-loaded sample texts for quick practice
- **Categories:**
  - Spanish pangrams
  - Common phrases
  - Technical vocabulary
  - Literature excerpts
  - Custom difficulty levels (beginner, intermediate, advanced)
- **Behavior:**
  - One-click load into practice area
  - Category filtering
  - Random selection option

#### FR-2.1.3: Text Preprocessing
- **Description:** Prepare text for typing practice
- **Operations:**
  - Normalize whitespace
  - Handle special Unicode characters
  - Split into manageable chunks for display
  - Generate character-by-character mapping for tracking

### 2.2 Typing Practice Engine

#### FR-2.2.1: Real-Time Character Tracking
- **Description:** Track each keystroke against expected character
- **Input:** Keyboard events
- **Processing:**
  - Compare input character to expected character
  - Handle LATAM layout character mapping
  - Account for dead keys (accent composition)
- **Output:**
  - Correct/incorrect status per character
  - Current position in text
  - Error count

#### FR-2.2.2: Visual Feedback System
- **Description:** Provide immediate visual feedback on typing
- **States:**
  - **Pending:** Character not yet typed (neutral styling)
  - **Current:** Character to type next (highlighted, cursor)
  - **Correct:** Successfully typed (green/success color)
  - **Incorrect:** Mistyped character (red/error color with strike-through)
  - **Corrected:** Error fixed with backspace (yellow/warning indicator)
- **Behavior:**
  - Smooth transitions between states
  - Clear visual distinction between states
  - Accessible color choices (colorblind-friendly)

#### FR-2.2.3: Error Handling
- **Description:** Manage typing mistakes
- **Modes:**
  - **Strict Mode:** Must correct errors before proceeding
  - **Lenient Mode:** Can continue past errors (marked but not blocking)
  - **No Backspace Mode:** Errors counted but no correction allowed
- **Tracking:**
  - Total errors
  - Errors by character
  - Error patterns (common mistakes)

#### FR-2.2.4: Session Control
- **Description:** Manage practice session lifecycle
- **Actions:**
  - Start session
  - Pause session
  - Resume session
  - Reset session
  - Complete session
- **State Persistence:**
  - Current position
  - Time elapsed
  - Errors accumulated
  - Auto-save on pause/blur

### 2.3 Keyboard Visualization

#### FR-2.3.1: LATAM Layout Display
- **Description:** Visual representation of LATAM Spanish keyboard
- **Layout Specification:**
  ```
  Row 1: | 1! 2" 3# 4$ 5% 6& 7/ 8( 9) 0= '? backquote-cedilla
  Row 2: Q W E R T Y U I O P accent-grave +*
  Row 3: A S D F G H J K L N-tilde { }
  Row 4: < Z X C V B N M ,; .: -_
  Row 5: Ctrl Win Alt [Spacebar] AltGr Ctrl
  ```
- **Character Mapping:**
  - Primary character (no modifier)
  - Shift character
  - AltGr character (where applicable)
- **Display Features:**
  - All three character levels visible on each key
  - Clear key boundaries
  - Proper key sizing (space bar, shift, etc.)

#### FR-2.3.2: Key Highlighting
- **Description:** Highlight keys as user types
- **Highlight Types:**
  - **Next Key:** Key to press next (primary highlight)
  - **Modifier Needed:** If Shift/AltGr required (secondary highlight)
  - **Pressed Key:** Visual feedback on keypress (flash effect)
  - **Error Key:** Wrong key pressed (error indication)
- **Animation:**
  - Smooth highlight transitions
  - Press animation (scale down/up)
  - 60fps minimum

#### FR-2.3.3: Finger Guide (Optional)
- **Description:** Show recommended finger for each key
- **Visualization:**
  - Color coding by finger
  - Home row indicator
  - Finger path suggestion
- **Toggle:** User can enable/disable

### 2.4 Performance Metrics

#### FR-2.4.1: Words Per Minute (WPM)
- **Calculation:** (Characters typed / 5) / Minutes elapsed
- **Display:**
  - Real-time WPM during session
  - Final WPM at completion
  - Rolling average (last 30 seconds)
- **Gross vs Net:**
  - Gross WPM: Total characters regardless of errors
  - Net WPM: Adjusted for errors (standard metric)

#### FR-2.4.2: Accuracy Metrics
- **Calculations:**
  - Overall accuracy: (Correct / Total) * 100
  - Per-character accuracy
  - Per-word accuracy
- **Tracking:**
  - Session accuracy
  - Historical accuracy trend
  - Problem character identification

#### FR-2.4.3: Error Analysis
- **Data Collected:**
  - Error frequency by character
  - Error frequency by key position
  - Common substitution patterns
  - Time-of-session error distribution
- **Insights:**
  - Most problematic characters
  - Suggested practice focus
  - Improvement areas

#### FR-2.4.4: Time Tracking
- **Metrics:**
  - Total practice time
  - Active typing time
  - Time per character (average, median)
  - Session duration

### 2.5 Session History

#### FR-2.5.1: Session Storage
- **Data Persisted:**
  - Session ID and timestamp
  - Text practiced (or reference)
  - Final WPM and accuracy
  - Error details
  - Duration
  - Settings used
- **Storage:**
  - Local storage (primary)
  - Optional: Cloud sync (future)

#### FR-2.5.2: Progress Visualization
- **Charts:**
  - WPM over time (line chart)
  - Accuracy over time (line chart)
  - Practice frequency (calendar heatmap)
  - Character difficulty (bar chart)
- **Timeframes:**
  - Daily
  - Weekly
  - Monthly
  - All time

#### FR-2.5.3: Statistics Dashboard
- **Metrics Displayed:**
  - Total practice time
  - Total characters typed
  - Average WPM (all time)
  - Average accuracy (all time)
  - Best WPM
  - Current streak
  - Most practiced days/times

---

## 3. Technical Requirements

### 3.1 Technology Stack

#### TR-3.1.1: Framework
- **Next.js 14+** with App Router
- Server Components for static content
- Client Components for interactive elements
- Route handlers for any API needs

#### TR-3.1.2: Language
- **TypeScript** with strict mode
- Comprehensive type definitions
- No `any` types in production code

#### TR-3.1.3: Styling
- **Tailwind CSS** for utility-first styling
- CSS custom properties for theming
- CSS animations for smooth transitions

#### TR-3.1.4: State Management
- React hooks for local state
- Context API for global state (theme, settings)
- Optional: Zustand for complex state if needed

#### TR-3.1.5: Data Persistence
- Local Storage for settings and history
- IndexedDB for larger datasets (session history)
- Optional: Supabase/Planetscale for cloud sync (future)

### 3.2 Architecture

#### TR-3.2.1: Component Architecture
```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing/practice page
│   ├── history/
│   │   └── page.tsx        # Session history page
│   └── settings/
│       └── page.tsx        # User settings page
├── components/
│   ├── ui/                 # Base UI components
│   ├── keyboard/           # Keyboard visualization
│   ├── practice/           # Typing practice components
│   ├── metrics/            # Statistics and charts
│   └── layout/             # Layout components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript definitions
└── stores/                 # State management
```

#### TR-3.2.2: Key Modules

| Module | Responsibility |
|--------|---------------|
| `keyboard-layout` | LATAM layout definition and mapping |
| `typing-engine` | Core typing logic and tracking |
| `metrics-calculator` | WPM, accuracy calculations |
| `session-manager` | Session lifecycle and persistence |
| `theme-provider` | Dark/light mode management |

### 3.3 Performance Requirements

#### TR-3.3.1: Load Performance
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

#### TR-3.3.2: Runtime Performance
- Keystroke processing: < 16ms (60fps)
- UI update per keystroke: < 8ms
- No dropped frames during typing
- Smooth animations at 60fps minimum

#### TR-3.3.3: Bundle Size
- Initial JS bundle: < 100KB gzipped
- Total page weight: < 500KB
- Code splitting for non-critical paths

### 3.4 Deployment

#### TR-3.4.1: Platform
- **Vercel** for hosting
- Automatic deployments from Git
- Preview deployments for PRs

#### TR-3.4.2: Environment
- Production: Main branch
- Staging: Develop branch (optional)
- Preview: PR deployments

#### TR-3.4.3: Domain
- Default: `*.vercel.app`
- Custom domain: To be determined

---

## 4. User Experience Requirements

### 4.1 Visual Design

#### UX-4.1.1: Design System
- **Style:** Modern, minimal, focused
- **Typography:**
  - Primary: Inter or similar sans-serif
  - Monospace: JetBrains Mono for typing area
- **Colors:**
  - Light mode: Clean whites, subtle grays, accent colors
  - Dark mode: Deep grays, not pure black, reduced contrast
- **Spacing:** Consistent 4px/8px grid system

#### UX-4.1.2: Theme Support
- Light mode (default based on system)
- Dark mode
- System preference detection
- Manual toggle with persistence

#### UX-4.1.3: Animations
- Key press feedback: 100ms
- State transitions: 200ms
- Page transitions: 300ms
- Easing: ease-out for most, spring for playful elements

### 4.2 Responsive Design

#### UX-4.2.1: Breakpoints
- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px - 1279px
- Large Desktop: 1280px+

#### UX-4.2.2: Layout Adaptations
- **Mobile:**
  - Stacked layout
  - Simplified keyboard (optional hide)
  - Touch-friendly targets (44px minimum)
- **Tablet:**
  - Side-by-side possible
  - Full keyboard visible
- **Desktop:**
  - Optimal layout
  - All features accessible

#### UX-4.2.3: Keyboard Scaling
- Dynamic sizing based on viewport
- Maintain aspect ratio
- Readable labels at all sizes

### 4.3 Accessibility

#### UX-4.3.1: WCAG Compliance
- Target: WCAG 2.1 AA
- Color contrast: 4.5:1 minimum
- Focus indicators: Visible and clear
- Screen reader support

#### UX-4.3.2: Keyboard Navigation
- Full app navigable by keyboard
- Logical tab order
- Skip links for main content
- Escape to cancel/close

#### UX-4.3.3: Visual Accessibility
- Colorblind-friendly palette
- Don't rely solely on color
- Adjustable text size
- High contrast mode option

### 4.4 Interaction Design

#### UX-4.4.1: Keyboard-First
- All primary actions via keyboard
- Shortcuts for common actions
- No mouse required for core flow

#### UX-4.4.2: Feedback
- Every action has feedback
- Loading states for async operations
- Error states are clear and actionable
- Success states are celebratory but not intrusive

#### UX-4.4.3: Onboarding
- First-time user guidance
- Feature discovery tooltips
- Progressive disclosure of advanced features

---

## 5. LATAM Keyboard Layout Specification

### 5.1 Character Mapping

#### Layer 0: No Modifier
```
` 1 2 3 4 5 6 7 8 9 0 ' backquote
  q w e r t y u i o p ` +
  a s d f g h j k l n-tilde { }
  < z x c v b n m , . -
```

#### Layer 1: Shift Modifier
```
| ! " # $ % & / ( ) = ? cedilla
  Q W E R T Y U I O P ^ *
  A S D F G H J K L N-TILDE [ ]
  > Z X C V B N M ; : _
```

#### Layer 2: AltGr Modifier
```
  | @ # ~ euro yen { [ ] } \ backquote
  @ W euro R T Y U I O P [ ]
  A S D F G H J K L ~ { }
  | Z X C V B N M < > _
```

### 5.2 Dead Keys

The LATAM layout uses dead keys for accents:

| Dead Key | + Vowel | Result |
|----------|---------|--------|
| ` (accent) | a,e,i,o,u | acute accent (a with acute, etc.) |
| Shift+` | a,e,i,o,u | dieresis (u with umlaut, etc.) |

### 5.3 Special Characters

| Character | Key Combination |
|-----------|----------------|
| n with tilde | Direct key (next to L) |
| Inverted ! | AltGr + 1 |
| Inverted ? | AltGr + - |
| @ | AltGr + Q |
| Euro sign | AltGr + E |

---

## 6. Data Models

### 6.1 Session Model

```typescript
interface TypingSession {
  id: string;
  createdAt: Date;
  completedAt: Date | null;
  text: string;
  textLength: number;
  mode: 'strict' | 'lenient' | 'no-backspace';

  // Progress
  currentPosition: number;
  isComplete: boolean;

  // Metrics
  totalTime: number;        // milliseconds
  activeTime: number;       // milliseconds (excluding pauses)
  grossWPM: number;
  netWPM: number;
  accuracy: number;         // 0-100

  // Errors
  totalErrors: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  errorsByCharacter: Record<string, number>;

  // Keystroke log (optional, for detailed analysis)
  keystrokes?: Keystroke[];
}

interface Keystroke {
  timestamp: number;
  expected: string;
  actual: string;
  isCorrect: boolean;
  isBackspace: boolean;
}
```

### 6.2 User Settings Model

```typescript
interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  showFingerGuide: boolean;
  keyboardSize: 'compact' | 'standard' | 'large';

  // Practice
  defaultMode: 'strict' | 'lenient' | 'no-backspace';
  showRealTimeWPM: boolean;
  showRealTimeAccuracy: boolean;
  soundEffects: boolean;

  // Advanced
  highlightNextKey: boolean;
  highlightModifiers: boolean;
  autoStartOnPaste: boolean;
}
```

### 6.3 Keyboard Layout Model

```typescript
interface KeyDefinition {
  code: string;           // Physical key code (e.g., 'KeyQ')
  row: number;            // 0-4
  position: number;       // Position in row
  width: number;          // Width units (1 = standard key)

  // Characters by modifier state
  normal: string;         // No modifier
  shift: string;          // Shift pressed
  altGr: string | null;   // AltGr pressed

  // Special properties
  isDeadKey: boolean;
  deadKeyType: 'acute' | 'dieresis' | null;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' |
          'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
}

interface KeyboardLayout {
  name: string;
  locale: string;
  rows: KeyDefinition[][];
}
```

---

## 7. User Flows

### 7.1 Primary Flow: Quick Practice

```
1. User lands on homepage
2. User pastes text into input area (or selects sample)
3. User clicks "Start Practice" (or presses Enter)
4. Typing area activates, keyboard displays
5. User types, receiving real-time feedback
6. User completes text or stops session
7. Results displayed with metrics
8. Option to retry, new text, or view history
```

### 7.2 Settings Flow

```
1. User clicks settings icon
2. Settings panel opens (modal or page)
3. User adjusts preferences
4. Changes apply immediately (preview)
5. User saves or cancels
6. Returns to practice
```

### 7.3 History Review Flow

```
1. User navigates to history page
2. Session list displays with key metrics
3. User can filter/sort sessions
4. User clicks session for details
5. Detailed breakdown shown
6. Option to retry same text
```

---

## 8. Non-Functional Requirements

### 8.1 Security

- No sensitive data collection
- Sanitize all user input
- Content Security Policy headers
- HTTPS only

### 8.2 Privacy

- All data stored locally by default
- No tracking or analytics without consent
- Clear data option available
- Transparent about any data usage

### 8.3 Reliability

- Offline capability (PWA consideration)
- Graceful degradation
- Auto-save to prevent data loss
- Error boundaries for React components

### 8.4 Maintainability

- Comprehensive test coverage (>80%)
- Clear code documentation
- Consistent code style (ESLint, Prettier)
- Modular architecture

---

## 9. Constraints and Assumptions

### 9.1 Constraints

1. **Browser Support:** Modern browsers only (Chrome, Firefox, Safari, Edge - last 2 versions)
2. **Physical Keyboard Required:** Touch typing not the focus
3. **Single Language Initially:** LATAM Spanish only (extensible design for future)
4. **Single User:** No authentication system initially

### 9.2 Assumptions

1. User has Windows OS with ability to switch keyboard layouts
2. User has basic familiarity with typing practice concept
3. User has stable internet for initial load (offline after)
4. Screen size minimum 320px width

### 9.3 Dependencies

1. Next.js framework and ecosystem
2. Vercel deployment platform
3. Modern browser keyboard event APIs
4. Local Storage / IndexedDB browser APIs

---

## 10. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Dead key handling complexity | High | Medium | Research and prototype early; fallback to simple mode |
| Performance issues with long text | Medium | Low | Implement virtualization; chunk text display |
| Keyboard layout variations | Medium | Medium | Document exact layout; allow user override |
| Browser keyboard event inconsistencies | High | Medium | Test across browsers; use established libraries |
| Accessibility compliance | Medium | Low | Include a11y testing from start; use semantic HTML |

---

## 11. Success Metrics

### 11.1 Technical Metrics

- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Core Web Vitals: All green
- Test coverage: > 80%
- Zero critical bugs in production

### 11.2 User Experience Metrics

- Time to first practice: < 30 seconds
- Session completion rate: > 70%
- Return user rate: > 50% (within 7 days)
- User satisfaction: Positive feedback

---

## 12. Future Considerations

### Phase 2 (Post-MVP)

1. **Additional Layouts:** Spanish (Spain), Portuguese (Brazil)
2. **Cloud Sync:** Account system with data persistence
3. **Gamification:** Achievements, streaks, leaderboards
4. **Custom Lessons:** Guided curriculum for beginners
5. **Multiplayer:** Race mode with others

### Phase 3 (Long-term)

1. **Mobile Apps:** Native iOS/Android
2. **API:** Public API for integrations
3. **Enterprise:** Team features for organizations
4. **AI Tutor:** Personalized practice recommendations

---

## 13. Glossary

| Term | Definition |
|------|------------|
| LATAM | Latin American Spanish keyboard layout |
| Dead Key | Key that doesn't produce output until next key is pressed |
| WPM | Words Per Minute (standard: 5 characters = 1 word) |
| AltGr | Alt Graph key, used for third-level characters |
| Gross WPM | Raw typing speed without error penalty |
| Net WPM | Adjusted typing speed accounting for errors |

---

## 14. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | - | - | Pending |
| Technical Lead | - | - | Pending |
| UX Designer | - | - | Pending |

---

## Appendix A: LATAM vs US Keyboard Comparison

### Physical Key Position Reference

The LATAM layout on a US physical keyboard means:
- The semicolon key (`;`) becomes N with tilde
- The apostrophe key (`'`) becomes `{` and `[`
- The bracket keys change significantly
- Number row symbols differ substantially

### Character Production Guide

| US Key | LATAM Normal | LATAM Shift | LATAM AltGr |
|--------|--------------|-------------|-------------|
| ` | | | ` (dead - accent) | cedilla | |
| 1 | 1 | ! | | |
| 2 | 2 | " | @ |
| - | ' | ? | |
| = | inverted ? | inverted ! | |
| [ | ` (dead) | ^ | [ |
| ] | + | * | ] |
| ; | n with tilde | N with tilde | |
| ' | { | [ | |
| \ | } | ] | |

---

## Appendix B: References

1. [LATAM Keyboard Layout - Wikipedia](https://en.wikipedia.org/wiki/Spanish_keyboard)
2. [Next.js Documentation](https://nextjs.org/docs)
3. [Vercel Deployment](https://vercel.com/docs)
4. [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
5. [Keyboard Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)

---

*End of Specification Document*
