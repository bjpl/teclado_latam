/**
 * @file types.ts
 * @description Re-export keyboard types from typing-engine for consistency.
 *
 * The keyboard types are defined in typing-engine/types.ts to avoid
 * circular dependencies. This file re-exports them for convenience.
 */

export type {
  KeyDefinition,
  KeyboardLayout,
  KeyLookupResult,
  CharacterLookupResult,
  ModifierState,
  DeadKeyType,
  Finger,
} from '../typing-engine/types';
