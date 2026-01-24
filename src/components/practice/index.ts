/**
 * @file index.ts
 * @description Export all practice components for Teclado LATAM.
 *
 * Components:
 * - CharacterSpan: Individual character display with state styling
 * - CursorIndicator: Blinking cursor with smooth animation
 * - TextDisplay: Main text display area with character highlighting
 * - TextInput: Hidden input for keyboard capture
 * - SessionControls: Control buttons and text input
 * - PracticeArea: Main container combining all components
 * - SavedTextsList: List of user-saved practice texts
 * - TextInputModal: Modal for entering custom practice text
 * - TextSelector: Component for selecting practice text from multiple sources
 */

// Core display components
export { CharacterSpan, type CharacterSpanProps } from './CharacterSpan';
export {
  CursorIndicator,
  type CursorIndicatorProps,
  type CursorPosition,
} from './CursorIndicator';
export {
  TextDisplay,
  type TextDisplayProps,
  type CharacterRenderData,
} from './TextDisplay';

// Input components
export { TextInput, type TextInputProps, type TextInputRef } from './TextInput';

// Control components
export {
  SessionControls,
  type SessionControlsProps,
  type SessionStatus,
} from './SessionControls';

// Main container
export {
  PracticeArea,
  type PracticeAreaProps,
  type SessionMetrics,
} from './PracticeArea';

// Saved texts list
export {
  SavedTextsList,
  type SavedTextsListProps,
} from './SavedTextsList';

// Custom text input components
export {
  TextInputModal,
  type TextInputModalProps,
  type SaveOption,
} from './TextInputModal';

export {
  TextSelector,
  type TextSelectorProps,
  type TextSelectorTab,
  type SampleText,
  type SavedText,
} from './TextSelector';
