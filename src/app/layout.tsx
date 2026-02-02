import type { Metadata } from 'next'
import './globals.css'
import { TransactionProvider } from '@/context/TransactionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Fraud Explorer | Mission Control',
  description: 'Unified transaction analysis and fraud detection across payment processors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('fraud-explorer-theme');if(t&&['mission','neobank','arctic'].includes(t))document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <TransactionProvider>
            <main className="container mx-auto px-4 py-6 max-w-[1600px]">
              <Navigation />
              {children}
            </main>
          </TransactionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
