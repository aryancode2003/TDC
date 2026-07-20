import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The DABBA Company - Partner Dashboard',
  description: 'Manage your home-cooked tiffin subscription business, menus, orders, and payouts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#080b11] min-h-screen text-slate-100 select-none">
        {children}
      </body>
    </html>
  )
}
