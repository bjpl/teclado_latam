/**
 * @file Header.tsx
 * @description Header component for Teclado LATAM.
 *
 * Features:
 * - App title with keyboard icon
 * - Navigation to history page
 * - Settings button
 * - Theme toggle (future)
 * - Minimal, clean design inspired by Monkeytype
 */

'use client';

import Link from 'next/link';
import { Settings, Keyboard, History, BookOpen } from 'lucide-react';
import { useSessionHistory } from '@/hooks';

export interface HeaderProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Header - App header with title and settings
 *
 * Clean, minimal design that stays out of the way during typing practice.
 * Uses Next.js Link components for reliable navigation.
 */
export function Header({ className = '' }: HeaderProps) {
  const { statistics, isLoaded } = useSessionHistory();

  return (
    <header
      className={`
        w-full
        px-4 sm:px-6 lg:px-8
        py-4
        flex items-center justify-between
        border-b border-border-muted
        bg-surface-0
        fixed
        top-0
        left-0
        right-0
        z-[9999]
        pointer-events-auto
        ${className}
      `}
    >
      {/* Logo and Title */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
      </Link>

      {/* Actions - using native anchor tags with direct href for guaranteed navigation */}
      <nav className="flex items-center gap-2">
        {/* Curriculum Link */}
        <a
          href="/curriculum"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/curriculum';
          }}
          className="
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            text-foreground/60
            hover:text-foreground
            hover:bg-surface-2
            transition-colors
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-accent-primary
            cursor-pointer
          "
          aria-label="View curriculum"
        >
          <BookOpen className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Curriculum</span>
        </a>

        {/* History Link */}
        <a
          href="/history"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/history';
          }}
          className="
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            text-foreground/60
            hover:text-foreground
            hover:bg-surface-2
            transition-colors
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-accent-primary
            cursor-pointer
          "
          aria-label="View session history"
        >
          <History className="w-5 h-5" />
          {isLoaded && statistics.totalSessions > 0 && (
            <span className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-foreground/50">{statistics.totalSessions} sessions</span>
              <span className="text-foreground/30">|</span>
              <span className="text-accent-primary font-medium">{statistics.averageWpm} avg</span>
            </span>
          )}
        </a>

        {/* Settings Link */}
        <a
          href="/settings"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/settings';
          }}
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
            cursor-pointer
          "
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </a>
      </nav>
    </header>
  );
}

export default Header;
