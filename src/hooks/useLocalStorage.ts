/**
 * @file useLocalStorage.ts
 * @description Hook for persistent localStorage with SSR safety.
 *
 * Provides a useState-like API for values persisted to localStorage.
 * Handles SSR/hydration safely by only accessing localStorage on the client.
 *
 * @see docs/sparc/02-architecture.md - Hooks specification
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook options
 */
export interface UseLocalStorageOptions<T> {
  /** Custom serializer function */
  serialize?: (value: T) => string;
  /** Custom deserializer function */
  deserialize?: (value: string) => T;
  /** Whether to sync across tabs */
  syncTabs?: boolean;
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Custom hook for localStorage with SSR safety
 *
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @param options - Optional configuration
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage('user-name', 'Guest');
 * const [settings, setSettings] = useLocalStorage('settings', { theme: 'dark' });
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncTabs = true,
  } = options;

  // Initialize state with initialValue (SSR-safe)
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load value from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isBrowser()) {
      setIsHydrated(true);
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserialize(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    setIsHydrated(true);
  }, [key, deserialize]);

  // Sync across tabs via storage event
  useEffect(() => {
    if (!isBrowser() || !syncTabs) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(deserialize(event.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        // Key was removed
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserialize, syncTabs]);

  /**
   * Set value in state and localStorage
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for functional updates
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (isBrowser()) {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue]
  );

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (isBrowser()) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Type-safe localStorage keys for the application
 */
export const STORAGE_KEYS = {
  SETTINGS: 'teclado-latam-settings',
  THEME: 'teclado-theme',
  SESSION_HISTORY: 'teclado-session-history',
  CURRENT_SESSION: 'teclado-current-session',
  CUSTOM_TEXTS: 'teclado-custom-texts',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export default useLocalStorage;
