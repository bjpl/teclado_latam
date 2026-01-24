/**
 * @file index.ts
 * @description Central export for all Teclado LATAM React hooks.
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 */

// Main session hook
export {
  useTypingSession,
  type SessionOptions,
  type SessionActions,
  type KeyboardState,
  type UseTypingSessionReturn,
} from './useTypingSession';

// Keyboard event handling
export {
  useKeyboardEvents,
  isPrintableKey,
  isModifierKey,
  isControlKey,
  type NormalizedKeyEvent,
  type UseKeyboardEventsOptions,
} from './useKeyboardEvents';

// Dead key handling
export {
  useDeadKeys,
  type DeadKeyProcessResult,
  type UseDeadKeysReturn,
} from './useDeadKeys';

// Metrics calculation
export {
  useMetrics,
  type UseMetricsOptions,
  type MetricsSnapshot,
  type UseMetricsReturn,
} from './useMetrics';

// Local storage
export {
  useLocalStorage,
  STORAGE_KEYS,
  type UseLocalStorageOptions,
  type StorageKey,
} from './useLocalStorage';

// Session history
export {
  useSessionHistory,
  type SessionRecord,
  type SessionFilter,
  type SessionStatistics,
  type UseSessionHistoryReturn,
} from './useSessionHistory';

// Theme management
export {
  useTheme,
  type ThemeOption,
  type ResolvedTheme,
  type UseThemeReturn,
} from './useTheme';

// Settings management
export { useSettings } from './useSettings';

// Custom texts management
export {
  useCustomTexts,
  type UseCustomTextsReturn,
} from './useCustomTexts';

// Curriculum progress
export {
  useCurriculumProgress,
  type LessonScore,
  type UseCurriculumProgressReturn,
} from './useCurriculumProgress';
