'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  type UserSettings,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from '@/types/settings';

/**
 * Custom hook for managing user settings with localStorage persistence.
 * Provides automatic saving and a way to reset to defaults.
 *
 * @returns Settings value, update function, and reset function
 *
 * @example
 * const { settings, updateSettings, resetSettings } = useSettings();
 *
 * // Update a single setting
 * updateSettings({ theme: 'dark' });
 *
 * // Update multiple settings
 * updateSettings({ showKeyboard: false, showFingerGuide: false });
 *
 * // Reset all settings
 * resetSettings();
 */
export function useSettings() {
  const [settings, setSettings, removeSettings] = useLocalStorage<UserSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  /**
   * Update one or more settings.
   * Merges the provided partial settings with the current settings.
   */
  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [setSettings]
  );

  /**
   * Reset all settings to their default values.
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  /**
   * Check if any settings differ from defaults
   */
  const hasCustomSettings = useMemo(() => {
    return Object.keys(DEFAULT_SETTINGS).some(
      (key) =>
        settings[key as keyof UserSettings] !==
        DEFAULT_SETTINGS[key as keyof UserSettings]
    );
  }, [settings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    hasCustomSettings,
  };
}

export default useSettings;
