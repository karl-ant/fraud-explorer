import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <main className="container mx-auto px-4 py-6 max-w-[1600px]">
          {children}
        </main>
      </body>
    </html>
  )
}
