import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/**
 * Inter font for UI elements
 * Clean, modern sans-serif with excellent readability
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

/**
 * JetBrains Mono for typing practice
 * Monospace font with clear character distinction
 */
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Teclado LATAM - Latin American Keyboard Typing Practice',
  description:
    'Master typing on Latin American Spanish keyboards. Practice with dead keys, special characters like n, and improve your WPM with real-time feedback.',
  keywords: [
    'typing practice',
    'LATAM keyboard',
    'Spanish typing',
    'keyboard trainer',
    'WPM test',
    'touch typing',
    'teclado latinoamericano',
  ],
  authors: [{ name: 'Teclado LATAM' }],
  openGraph: {
    title: 'Teclado LATAM - Typing Practice',
    description: 'Master typing on Latin American Spanish keyboards',
    type: 'website',
    locale: 'es_419',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
