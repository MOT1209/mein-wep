import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WorkspaceProvider } from '@/store/workspace-store'
import { TopNav } from '@/components/shared/TopNav'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alking Dashboard',
  description: 'Elite Developer & Content Studio Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="alking-theme"
        >
          <WorkspaceProvider>
            <TopNav />
            <main className="pt-14">
              {children}
            </main>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
