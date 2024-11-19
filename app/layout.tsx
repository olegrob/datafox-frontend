import { GeistSans } from 'geist/font/sans'
import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'DataFox - Tech Products',
  description: 'Your trusted source for technology products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white border-t">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              2024 DataFox. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
