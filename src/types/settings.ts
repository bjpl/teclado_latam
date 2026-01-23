/**
 * Settings type definitions for Teclado LATAM
 *
 * These types define user preferences that persist across sessions
 * and control the behavior and appearance of the typing practice application.
 */

/**
 * Available theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Font size preferences for text display
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * Practice mode determines error handling behavior:
 * - strict: Must correct errors before continuing
 * - lenient: Can continue past errors without correction
 * - no-backspace: Errors are counted but cannot be corrected
 */
export type PracticeMode = 'strict' | 'lenient' | 'no-backspace';

/**
 * Keyboard display size options
 */
export type KeyboardSize = 'small' | 'medium' | 'large';

/**
 * Complete user settings interface
 */
export interface UserSettings {
  /** UI theme preference */
  theme: Theme;
  /** Font size for practice text */
  fontSize: FontSize;
  /** Practice mode for error handling */
  practiceMode: PracticeMode;
  /** Show real-time metrics (WPM, accuracy) during practice */
  showMetrics: boolean;
  /** Show virtual keyboard */
  showKeyboard: boolean;
  /** Show finger placement guide on keyboard */
  showFingerGuide: boolean;
  /** Enable sound effects (for future implementation) */
  soundEnabled: boolean;
  /** Size of the virtual keyboard */
  keyboardSize: KeyboardSize;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  fontSize: 'medium',
  practiceMode: 'strict',
  showMetrics: true,
  showKeyboard: true,
  showFingerGuide: true,
  soundEnabled: false,
  keyboardSize: 'medium',
};

/**
 * Settings storage key for localStorage
 */
export const SETTINGS_STORAGE_KEY = 'teclado-latam-settings';

/**
 * Font size to CSS class mapping
 */
export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: 'text-lg',
  medium: 'text-xl',
  large: 'text-2xl',
};

/**
 * Font size to pixel value mapping (approximate)
 */
export const FONT_SIZE_VALUES: Record<FontSize, number> = {
  small: 18,
  medium: 20,
  large: 24,
};

/**
 * Keyboard size scale factors
 */
export const KEYBOARD_SIZE_SCALE: Record<KeyboardSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
};

/**
 * Practice mode descriptions for UI display
 */
export const PRACTICE_MODE_INFO: Record<PracticeMode, { title: string; description: string }> = {
  strict: {
    title: 'Strict',
    description: 'Must correct all errors before moving forward. Best for accuracy training.',
  },
  lenient: {
    title: 'Lenient',
    description: 'Can continue past errors. Errors are tracked but not required to fix.',
  },
  'no-backspace': {
    title: 'No Backspace',
    description: 'Cannot use backspace. Errors are counted permanently. Tests raw typing flow.',
  },
};

/**
 * Theme descriptions for UI display
 */
export const THEME_INFO: Record<Theme, { title: string; description: string }> = {
  light: {
    title: 'Light',
    description: 'Light background with dark text',
  },
  dark: {
    title: 'Dark',
    description: 'Dark background with light text',
  },
  system: {
    title: 'System',
    description: 'Follow your system preference',
  },
};
