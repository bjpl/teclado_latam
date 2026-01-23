/**
 * @file Footer.tsx
 * @description Footer component for Teclado LATAM.
 *
 * Features:
 * - Copyright notice
 * - GitHub link
 * - Help link
 * - Minimal, unobtrusive design
 */

'use client';

import { Github, HelpCircle } from 'lucide-react';

export interface FooterProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Footer - App footer with links and copyright
 *
 * Simple footer that provides essential links without distracting from practice.
 */
export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`
        w-full
        px-4 sm:px-6 lg:px-8
        py-4
        flex flex-col sm:flex-row items-center justify-between gap-4
        border-t border-border-muted
        bg-surface-0/50
        text-sm text-foreground/40
        ${className}
      `}
    >
      {/* Copyright */}
      <div className="flex items-center gap-1">
        <span>&copy; {currentYear}</span>
        <span className="font-medium text-foreground/50">Teclado LATAM</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-4">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-1.5
            hover:text-foreground/60
            transition-colors
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-accent-primary
            rounded
          "
          aria-label="View source on GitHub"
        >
          <Github className="w-4 h-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>

        <a
          href="#help"
          className="
            flex items-center gap-1.5
            hover:text-foreground/60
            transition-colors
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-accent-primary
            rounded
          "
          aria-label="Get help"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Help</span>
        </a>
      </div>

      {/* Keyboard shortcut hints */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        <kbd className="px-1.5 py-0.5 bg-surface-2 rounded text-foreground/50">Esc</kbd>
        <span>pause</span>
        <span className="text-foreground/20">|</span>
        <kbd className="px-1.5 py-0.5 bg-surface-2 rounded text-foreground/50">Tab</kbd>
        <span>restart</span>
      </div>
    </footer>
  );
}

export default Footer;
