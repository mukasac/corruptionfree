// app/layout.tsx
import type { Metadata } from "next"
import RootLayoutClient from './root-layout-client'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Corruption Awards Kenya",
  description: "Rate and expose corruption in Kenya through citizen participation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
        <Toaster />
      </body>
    </html>
  )
}