/**
 * Settings Components for Teclado LATAM
 *
 * These components provide user preference controls for:
 * - Theme selection (light/dark/system)
 * - Practice mode configuration
 * - Display preferences (font size, keyboard visibility)
 * - Sound settings (future)
 */

// Main panel
export { SettingsPanel } from './SettingsPanel';
export type { SettingsPanelProps } from './SettingsPanel';

// Theme toggle
export { ThemeToggle } from './ThemeToggle';
export type { ThemeToggleProps } from './ThemeToggle';

// Practice mode selector
export { PracticeModeSelect } from './PracticeModeSelect';
export type { PracticeModeSelectProps } from './PracticeModeSelect';

// Display settings
export { DisplaySettings } from './DisplaySettings';
export type { DisplaySettingsProps } from './DisplaySettings';

// Sound settings
export { SoundSettings } from './SoundSettings';
export type { SoundSettingsProps } from './SoundSettings';
