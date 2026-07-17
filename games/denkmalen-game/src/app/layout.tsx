import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GameProvider } from '@/components/GameProvider'
import { SocketProvider } from '@/components/SocketProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'

const inter = Inter({ subsets: ['latin'] })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

const APP_URL = 'https://rashid-wep.vercel.app/denkmalen'
const OG_IMAGE = `${APP_URL}/og.png`

export const metadata: Metadata = {
  title: 'Denkmalen — Drawing Battle Game with AI Judge',
  description: 'Draw words, get judged by AI, and compete with friends! A creative drawing battle game with instant AI feedback.',
  
  // Open Graph
  openGraph: {
    title: 'Denkmalen — Drawing Battle Game with AI Judge',
    description: 'Draw words, get judged by AI, and compete with friends! A creative drawing battle game with instant AI feedback.',
    url: APP_URL,
    siteName: 'Denkmalen',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Denkmalen - Drawing Battle Game',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Denkmalen — Drawing Battle Game with AI Judge',
    description: 'Draw words, get judged by AI, and compete with friends! A creative drawing battle game with instant AI feedback.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Denkmalen - Drawing Battle Game', type: 'image/png' }],
  },

  // Misc
  manifest: '/denkmalen/manifest.json',
  icons: {
    icon: '/denkmalen/favicon.svg',
    apple: '/denkmalen/favicon.svg',
  },
  metadataBase: new URL(APP_URL),
}

// Next 14 moved themeColor out of metadata; leaving it there logs a warning on
// every build and drops the tag, which the installed PWA needs for its title bar.
export const viewport: Viewport = {
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to English; RTL is applied via client-side SettingsScreen
  const dir = 'ltr'
  const lang = 'en'

  return (
    <html lang={lang} dir={dir} translate="no" suppressHydrationWarning>
      <body className={`${inter.className} ${cairo.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <GameProvider>
                <ServiceWorkerProvider>
                  {children}
                </ServiceWorkerProvider>
              </GameProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
