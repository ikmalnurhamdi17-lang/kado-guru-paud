import type { Metadata, Viewport } from 'next'
import './globals.css'
import LayoutContent from "@/components/shared/layout-content";

export const metadata: Metadata = {
  title: 'Ruang Shifa',
  description: 'Asisten Digital Shifa',
  manifest: '/manifest.json',
  icons: {
    icon: '/paud.png', // Menambahkan v=6 untuk memastikan logo terbaru muncul
    apple: '/paud.png',
  },
}

// Menambahkan Viewport agar tampilan di HP pas (tidak bisa di-zoom/geser berantakan)
export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/paud.png" />
        <link rel="apple-touch-icon" href="/paud.png" />
      </head>
      {/* Pastikan menggunakan antialiased agar font terlihat lebih halus */}
      <body className="antialiased bg-slate-50">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}