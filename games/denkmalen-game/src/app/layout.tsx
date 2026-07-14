import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GameProvider } from '@/components/GameProvider'
import { SocketProvider } from '@/components/SocketProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Denkmalen - Drawing Battle Game',
  description: 'Drawing battle game with AI judge. Draw words, vote, and compete with friends!',
  // next.config.js basePath is not applied to metadata URLs, so prefix manually
  manifest: '/denkmalen/manifest.json',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/denkmalen/favicon.svg',
    apple: '/denkmalen/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SocketProvider>
            <GameProvider>
              {children}
            </GameProvider>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
