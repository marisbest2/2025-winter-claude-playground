import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Teaneck Tracker - Government Records Research',
  description:
    'Ask questions about Teaneck Township government meetings, boards, and committees',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
