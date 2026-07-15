import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GameProvider } from '@/components/GameProvider'
import { SocketProvider } from '@/components/SocketProvider'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

const APP_URL = 'https://rashid-wep.vercel.app/denkmalen'
const OG_IMAGE = `${APP_URL}/og.svg`

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
    images: [OG_IMAGE],
  },

  // Misc
  manifest: '/denkmalen/manifest.json',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/denkmalen/favicon.svg',
    apple: '/denkmalen/favicon.svg',
  },
  metadataBase: new URL(APP_URL),
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
                {children}
              </GameProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
