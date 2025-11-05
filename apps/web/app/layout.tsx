import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { ClerkProvider } from "@clerk/nextjs"
import { AuthGuard } from "@/module/auth/ui/components/auth-guard"
import { Toaster } from "@workspace/ui/components/sonner"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#7033ff"
            }
          }}
        >
          <Providers>
            <AuthGuard>
              <Toaster richColors />
              {children}
            </AuthGuard>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
