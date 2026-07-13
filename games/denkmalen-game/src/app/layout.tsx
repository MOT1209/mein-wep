import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GameProvider } from '@/components/GameProvider'
import { SocketProvider } from '@/components/SocketProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Draw Battle - Multiplayer Drawing Game',
  description: 'A modern multiplayer drawing game with offline and online modes',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
