import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { getUsers } from "@/lib/userService"
import { SettingsProvider } from "@/contexts/settings-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "POS System",
  description: "Modern Point of Sale System with Receipt Printing",
    generator: 'v0.app'
}


// เปลี่ยนเป็น async function เพื่อโหลด users
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const users = await getUsers()
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          <AuthProvider users={users}>{children}</AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
