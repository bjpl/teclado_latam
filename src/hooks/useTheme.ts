/**
 * @file useTheme.ts
 * @description Theme management hook for Teclado LATAM.
 *
 * Manages light/dark/system theme with persistence and system preference detection.
 * Applies theme class to document.documentElement for CSS styling.
 *
 * Can be used standalone with localStorage persistence, or with a settings context.
 *
 * @see docs/sparc/02-architecture.md - Theme Context specification
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Theme } from '@/types/settings';
import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';

/**
 * Available theme options
 */
export type ThemeOption = Theme;

/**
 * Resolved theme (actual visual theme)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Return type for useTheme hook
 */
export interface UseThemeReturn {
  /** Current theme setting (light, dark, or system) */
  theme: ThemeOption;
  /** Actual resolved theme being displayed */
  resolvedTheme: ResolvedTheme;
  /** System preference (light or dark) */
  systemTheme: ResolvedTheme;
  /** Update theme setting */
  setTheme: (theme: ThemeOption) => void;
  /** Toggle between light and dark (ignoring system) */
  toggleTheme: () => void;
  /** Whether the theme is dark */
  isDark: boolean;
  /** Whether we're using system preference */
  isSystem: boolean;
}

/**
 * Get the system color scheme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme class to document
 */
function applyThemeToDocument(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);

  // Also set color-scheme for native elements
  root.style.colorScheme = theme;
}

/**
 * Custom hook for theme management (standalone with localStorage)
 *
 * @returns Theme state and controls
 *
 * @example
 * ```tsx
 * const { theme, resolvedTheme, setTheme, toggleTheme, isDark } = useTheme();
 *
 * return (
 *   <button onClick={toggleTheme}>
 *     {isDark ? 'Switch to Light' : 'Switch to Dark'}
 *   </button>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn;

/**
 * Custom hook for theme management (with external preference)
 *
 * @param preferredTheme - The user's preferred theme setting from settings
 * @returns Theme state and controls
 *
 * @example
 * ```tsx
 * const { settings, updateSettings } = useSettings();
 * const { resolvedTheme, setTheme } = useTheme(settings.theme);
 * ```
 */
export function useTheme(preferredTheme: ThemeOption): UseThemeReturn;

export function useTheme(preferredTheme?: ThemeOption): UseThemeReturn {
  // Use localStorage if no external preference provided
  const [storedTheme, setStoredTheme] = useLocalStorage<ThemeOption>(
    STORAGE_KEYS.THEME,
    'system'
  );

  // Determine which theme source to use
  const theme = preferredTheme ?? storedTheme;

  // Track system preference
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate resolved theme
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Apply theme to document when resolved theme changes
  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  /**
   * Set theme - uses localStorage if standalone, otherwise just returns value
   */
  const setTheme = useCallback(
    (newTheme: ThemeOption) => {
      if (preferredTheme === undefined) {
        // Standalone mode - use localStorage
        setStoredTheme(newTheme);
      }
      // When using external preference, caller must update via settings
    },
    [preferredTheme, setStoredTheme]
  );

  /**
   * Toggle between light and dark (sets explicit theme, not system)
   */
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isSystem: theme === 'system',
  };
}

export default useTheme;
