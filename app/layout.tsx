import type { Metadata, Viewport } from 'next'
import './globals.css'
import LayoutContent from "@/components/shared/layout-content";

export const metadata: Metadata = {
  title: 'Ruang Shifa',
  description: 'Asisten Digital Shifa - Mendidik dengan Hati',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ruang Shifa',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/paud.png',
    apple: '/paud.png',
  },
}

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Ini rahasianya agar tampilan penuh sampai ke area kamera/poni HP
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        {/* Meta tambahan untuk memastikan mode aplikasi aktif di semua jenis HP */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/paud.png" />
        <link rel="apple-touch-icon" href="/paud.png" />
      </head>
      <body className="antialiased bg-slate-50 selection:bg-indigo-100">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}