/**
 * @file Header.tsx
 * @description Header component for Teclado LATAM.
 *
 * Features:
 * - App title with keyboard icon
 * - Settings button
 * - Theme toggle (future)
 * - Minimal, clean design inspired by Monkeytype
 */

'use client';

import { Settings, Keyboard } from 'lucide-react';

export interface HeaderProps {
  /** Callback when settings button is clicked */
  onSettingsClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Header - App header with title and settings
 *
 * Clean, minimal design that stays out of the way during typing practice.
 */
export function Header({ onSettingsClick, className = '' }: HeaderProps) {
  return (
    <header
      className={`
        w-full
        px-4 sm:px-6 lg:px-8
        py-4
        flex items-center justify-between
        border-b border-border-muted
        bg-surface-0/80
        backdrop-blur-sm
        ${className}
      `}
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-lg
            bg-accent-primary/10
            text-accent-primary
          "
          aria-hidden="true"
        >
          <Keyboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Teclado LATAM
          </h1>
          <p className="text-xs text-foreground/50 hidden sm:block">
            Latin American Keyboard Practice
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="
            p-2.5
            rounded-lg
            text-foreground/60
            hover:text-foreground
            hover:bg-surface-2
            transition-colors
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-accent-primary
          "
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default Header;
