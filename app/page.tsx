import { ArbitrageCalculator } from "@/components/arbitrage-calculator"
import { RadarAnimation } from "@/components/radar-animation"
import Image from "next/image"
import Link from "next/link"
import { Instagram, Send } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-logo-gradient relative overflow-hidden">
      {/* Background Effects - Estáticos */}
      <div className="absolute inset-0 bg-radar-gradient opacity-60"></div>
      <div className="absolute inset-0 bg-logo-radial opacity-40"></div>

      {/* Radar central grande - Estático */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-15">
        <RadarAnimation size={500} intensity="medium" />
      </div>

      {/* Efeitos de luz - Estáticos */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-logo-bright/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-logo-neon/6 rounded-full blur-3xl"></div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            {/* Logo Principal com Redes Sociais */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-logo-neon/20 rounded-full blur-3xl scale-110"></div>
                <div className="relative bg-gradient-to-br from-logo-dark/80 to-logo-medium/60 backdrop-blur-sm rounded-2xl p-8 border border-logo-neon/30 shadow-2xl">
                  <Image
                    src="/surezone-logo-new.png"
                    alt="SUREZONE - Sistema de Detecção de Arbitragem"
                    width={200}
                    height={200}
                    className="mx-auto drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-logo-neon/0 via-logo-neon/10 to-logo-neon/0 rounded-3xl blur-xl"></div>
              </div>

              {/* Redes Sociais */}
              <div className="flex items-center gap-6 mb-6">
                <Link
                  href="https://instagram.com/surezone.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300 hover:scale-105 group"
                >
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:text-pink-300" />
                  <span className="text-sm font-medium text-pink-400 group-hover:text-pink-300">@surezone.br</span>
                </Link>

                <Link
                  href="https://t.me/surezoneadm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105 group"
                >
                  <Send className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300">@surezoneadm</span>
                </Link>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-logo-neon via-logo-bright to-logo-neon bg-clip-text text-transparent tracking-tight">
                SUREZONE
              </h1>
              <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-logo-bright to-transparent"></div>
              <h2 className="text-xl md:text-2xl font-medium text-surezone-300 tracking-wide">
                Sistema de Detecção de Arbitragem
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Detecte oportunidades de arbitragem em tempo real com nossa tecnologia de radar avançada. Calcule
                stakes, analise ROI e maximize seus lucros com precisão profissional.
              </p>
            </div>
          </div>

          <ArbitrageCalculator />
        </div>
      </div>
    </main>
  )
}
