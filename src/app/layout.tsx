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
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('teclado-theme');
                  if (theme) {
                    theme = JSON.parse(theme);
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // System preference
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
