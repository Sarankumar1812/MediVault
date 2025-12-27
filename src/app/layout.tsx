import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "MediVault - Your Secure Digital Health Wallet",
  description:
    "Store, track, retrieve, and share your medical records and vitals securely.",

  icons: {
    icon: "/icon.ico",
    apple: "/apple-icon.png",
  },

  openGraph: {
    title: "MediVault – Secure Digital Health Wallet",
    description:
      "Access your medical records anytime. Upload reports, track vitals, and share securely.",
    images: ["/medivault_logo.png"],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "MediVault – Secure Digital Health Wallet",
    images: ["/medivault_logo.png"],
  },
}


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2B4570" },
    { media: "(prefers-color-scheme: dark)", color: "#3FC4E2" },
  ],
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
