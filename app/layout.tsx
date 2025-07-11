import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SUREZONE - Sistema de Detecção de Arbitragem | Calculadora Profissional",
  description:
    "🎯 SUREZONE: Sistema profissional de detecção de arbitragem em tempo real. Calcule stakes, analise ROI e maximize lucros com precisão. Radar avançado para oportunidades garantidas.",
  keywords: [
    "arbitragem",
    "apostas",
    "surezone",
    "calculadora",
    "odds",
    "lucro garantido",
    "sistema de arbitragem",
    "calculadora de apostas",
    "ROI apostas",
    "radar arbitragem",
  ],
  authors: [{ name: "SUREZONE Team", url: "https://surezone.com.br" }],
  creator: "SUREZONE",
  publisher: "SUREZONE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://surezone.com.br",
    title: "SUREZONE - Sistema de Detecção de Arbitragem",
    description:
      "🎯 Sistema profissional de detecção de arbitragem em tempo real. Calcule stakes, analise ROI e maximize lucros.",
    siteName: "SUREZONE",
    images: [
      {
        url: "https://surezone.com.br/surezone-logo-new.png",
        width: 1200,
        height: 630,
        alt: "SUREZONE - Sistema de Detecção de Arbitragem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SUREZONE - Sistema de Detecção de Arbitragem",
    description:
      "🎯 Sistema profissional de detecção de arbitragem em tempo real. Calcule stakes, analise ROI e maximize lucros.",
    images: ["https://surezone.com.br/surezone-logo-new.png"],
    creator: "@surezone.br",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#22ff88",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://surezone.com.br",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#22ff88" />
        <meta name="google-site-verification" content="your-verification-code" />
        <link rel="canonical" href="https://surezone.com.br" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
