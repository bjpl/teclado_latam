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
