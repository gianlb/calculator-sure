"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookmakerCard } from "@/components/bookmaker-card"
import { ResultsPanel } from "@/components/results-panel"
import { SpreadsheetPanel } from "@/components/spreadsheet-panel"
import { RadarAnimation } from "@/components/radar-animation"
import { calculateArbitrage } from "@/lib/arbitrage-calculations"
import { PerformanceMonitor } from "@/components/performance-monitor"

interface ArbitrageResults {
  arbitragePercentage: number
  isArbitrage: boolean
  totalInvestment: number
  distributedStakes: number[]
  returns: number[]
  profit: number
  profitPercentage: number
}

export function ArbitrageCalculator() {
  const [activeTab, setActiveTab] = useState("calculator")
  const [bookmakerCount, setBookmakerCount] = useState(2)
  const [spreadsheetData, setSpreadsheetData] = useState<any[]>([])
  const [bookmakers, setBookmakers] = useState([
    {
      id: 1,
      odd: "",
      increase: 0,
      stake: 100,
      commission: false,
      freebet: false,
      finalOdd: 0,
      isStakeFixed: false,
      isLayBet: false,
      commissionRate: 4.5,
      manualStake: null,
    },
    {
      id: 2,
      odd: "",
      increase: 0,
      stake: 100,
      commission: false,
      freebet: false,
      finalOdd: 0,
      isStakeFixed: false,
      
      isLayBet: false,
      commissionRate: 4.5,
      manualStake: null,
    },
    {
      id: 3,
      odd: "",
      increase: 0,
      stake: 100,
      commission: false,
      freebet: false,
      finalOdd: 0,
      isStakeFixed: false,
    
      isLayBet: false,
      commissionRate: 4.5,
      manualStake: null,
    },
    {
      id: 4,
      odd: "",
      increase: 0,
      stake: 100,
      commission: false,
      freebet: false,
      finalOdd: 0,
      isStakeFixed: false,
     
      isLayBet: false,
      commissionRate: 4.5,
      manualStake: null,
    },
    {
      id: 5,
      odd: "",
      increase: 0,
      stake: 100,
      commission: false,
      freebet: false,
      finalOdd: 0,
      isStakeFixed: false,
      isLayBet: false,
      commissionRate: 4.5,
      manualStake: null,
    },
  ])
  const [results, setResults] = React.useState<ArbitrageResults>({
  arbitragePercentage: 0,
  isArbitrage: false,
  totalInvestment: 0,
  distributedStakes: [],
  returns: [],
  profit: 0,
  profitPercentage: 0,
})

  // Helper function to safely parse numbers
  const safeParseFloat = (value: any): number => {

    if (value === "" || value === null || value === undefined) {
      return 0
    }
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  // Função para carregar dados compartilhados da URL
  const loadSharedData = useCallback(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const sharedData = urlParams.get("shared")

      if (sharedData) {
        console.log("🔗 Carregando dados compartilhados...")
        const decodedData = JSON.parse(atob(decodeURIComponent(sharedData)))
        console.log("📊 Dados decodificados:", decodedData)

        // Restaurar bookmakers
        if (decodedData.bookmakers) {
          setBookmakerCount(decodedData.bookmakerCount || decodedData.bookmakers.length)
          setBookmakers((prev) =>
            prev.map((bm, index) => {
              const sharedBm = decodedData.bookmakers[index]
              if (sharedBm) {
                const updatedBm = { ...bm, ...sharedBm }
                // Recalcular finalOdd
                const odd = safeParseFloat(updatedBm.odd)
                const increase = safeParseFloat(updatedBm.increase)
                updatedBm.finalOdd = odd > 0 ? odd * (1 + increase / 100) : 0
                return updatedBm
              }
              return bm
            }),
          )
        }

        console.log("✅ Dados compartilhados carregados!")

        // Limpar URL após carregar
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados compartilhados:", error)
    }
  }, [])

  // Carregar dados compartilhados na inicialização
  useEffect(() => {
    loadSharedData()
  }, [loadSharedData])

  // Update bookmaker data
  const updateBookmaker = useCallback((id: number, field: string, value: any) => {
    setBookmakers((prevBookmakers) => {
      return prevBookmakers.map((bm) => {
        if (bm.id === id) {
          const updatedBm = { ...bm, [field]: value }

          // Recalculate final odd when odd or increase changes
          if (field === "odd" || field === "increase") {
            const odd = safeParseFloat(updatedBm.odd)
            const increase = safeParseFloat(updatedBm.increase)
            updatedBm.finalOdd = odd > 0 ? odd * (1 + increase / 100) : 0
          }

          return updatedBm
        }
        return bm
      })
    })
  }, [])

  // Handle adding data to spreadsheet - CORRIGIDA
  const handleAddToSpreadsheet = useCallback((data: any) => {
    console.log("🚀 handleAddToSpreadsheet (ArbitrageCalculator) chamado")
    console.log("📊 Dados recebidos:", data)

    try {
      if (!data || !data.operationName) {
        console.error("❌ Dados inválidos recebidos:", data)
        alert("Erro: dados inválidos para adicionar à planilha!")
        return
      }

      console.log("✅ Dados válidos, adicionando à planilha...")

      setSpreadsheetData((prev) => {
        const newData = [data, ...prev]
        console.log("📋 Nova lista da planilha:", newData)
        return newData
      })

      // Mudar para a aba da planilha
      console.log("🔄 Mudando para aba da planilha...")
      setActiveTab("spreadsheet")

      console.log("🎉 Sucesso! Operação adicionada à planilha")
    } catch (error) {
  if (error instanceof Error) {
    alert(error.message)
  } else {
    alert("Erro desconhecido")
  }
}
  }, [])

  // Handle updating spreadsheet data - CORRIGIDA
  const handleUpdateSpreadsheetData = useCallback((index: number, newData: any) => {
    console.log("🚀 handleUpdateSpreadsheetData chamado")
    console.log("📍 Index:", index)
    console.log("📊 Novos dados:", newData)

    try {
      if (index === -1) {
        // Adicionar novo item
        console.log("➕ Adicionando novo item...")
        setSpreadsheetData((prev) => {
          const updated = [newData, ...prev]
          console.log("📋 Lista atualizada:", updated)
          return updated
        })
      } else {
        // Atualizar item existente
        console.log("✏️ Atualizando item existente...")
        setSpreadsheetData((prev) => {
          const updated = prev.map((item, i) => (i === index ? newData : item))
          console.log("📋 Lista atualizada:", updated)
          return updated
        })
      }
      console.log("✅ Dados da planilha atualizados com sucesso!")
    } catch (error) {
  if (error instanceof Error) {
    alert(error.message)
  } else {
    alert("Erro ao atualizar a planilha")
  }
}

  }, [])

  // Main effect that handles both calculation and stake redistribution
  useEffect(() => {
    const active = bookmakers.slice(0, bookmakerCount)
    const valid = active.filter((bm) => safeParseFloat(bm.odd) > 0)

    if (valid.length !== bookmakerCount) {
      setResults({
        arbitragePercentage: 0,
        profit: 0,
        profitPercentage: 0,
        totalInvestment: 0,
        isArbitrage: false,
        distributedStakes: [],
        returns: [],
      })
      return
    }

    // Calculate results with the new lay bet logic including commission
    setResults(calculateArbitrage(valid))
  }, [bookmakers, bookmakerCount])

  return (
    <div className="bg-card-gradient backdrop-blur-xl rounded-2xl shadow-radar-glow border border-logo-medium/50 overflow-hidden relative">
      {/* Sistema ativo no canto superior direito - ESTÁTICO */}
      <div className="absolute top-4 right-4 opacity-80 pointer-events-none">
        <div className="flex items-center gap-2 bg-logo-dark/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-logo-neon/30">
          <div className="w-2 h-2 bg-logo-neon rounded-full shadow-glow"></div>
          <span className="text-xs text-logo-neon font-mono">ONLINE</span>
        </div>
      </div>

      {/* Indicador de sistema ativo */}
      <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-logo-neon bg-logo-dark/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-logo-neon/30">
        <div className="w-2 h-2 bg-logo-neon rounded-full shadow-glow"></div>
        <span className="font-mono">SISTEMA ATIVO</span>
      </div>

      <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-logo-dark/60 backdrop-blur-sm border-b border-logo-medium/50 rounded-none">
          <TabsTrigger
            value="calculator"
            className="text-sm md:text-base data-[state=active]:bg-logo-medium/50 data-[state=active]:text-logo-neon data-[state=active]:shadow-glow transition-all duration-300"
          >
            Radar de Arbitragem
          </TabsTrigger>
          <TabsTrigger
            value="spreadsheet"
            className="text-sm md:text-base data-[state=active]:bg-logo-medium/50 data-[state=active]:text-logo-neon data-[state=active]:shadow-glow transition-all duration-300 relative"
          >
            Planilha de Análise
            {spreadsheetData.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-xs rounded-full flex items-center justify-center text-black font-bold">
                {spreadsheetData.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="p-6 md:p-8">
          <div className="space-y-8">
            {/* Configuration Section */}
            <div className="bg-logo-dark/40 backdrop-blur-sm rounded-xl p-6 border border-logo-medium/50 shadow-inner-glow relative">
              {/* Mini radar no header */}
              <div className="absolute top-2 right-2 opacity-60">
                <RadarAnimation size={50} intensity="medium" />
              </div>

              <h2 className="text-xl text-logo-neon font-semibold mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-logo-bright rounded-full animate-pulse shadow-glow"></div>
                Sistema de Detecção
              </h2>

              <div>
                <h3 className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">Alvos de Monitoramento:</h3>
                <RadioGroup
                  defaultValue="2"
                  value={bookmakerCount.toString()}
                  onValueChange={(value) => setBookmakerCount(Number.parseInt(value))}
                  className="flex flex-wrap gap-4"
                >
                  {[2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={num.toString()}
                        id={`casas-${num}`}
                        className="border-logo-bright/60 text-logo-neon data-[state=checked]:bg-logo-medium/50 data-[state=checked]:border-logo-neon"
                      />
                      <Label htmlFor={`casas-${num}`} className="text-foreground text-sm font-medium cursor-pointer">
                        {num} Casas
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Bookmakers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookmakers.slice(0, bookmakerCount).map((bookmaker, idx) => (
                <BookmakerCard
                  key={bookmaker.id}
                  bookmaker={bookmaker}
                  computedStake={results.distributedStakes[idx] || 0}
                  onChange={updateBookmaker}
                />
              ))}
            </div>

            {/* Results Section */}
            <ResultsPanel
  results={results}
  bookmakers={bookmakers.slice(0, bookmakerCount).map(bm => ({
    ...bm,
    manualStake: bm.manualStake ?? undefined, // força `undefined` no lugar de `null`
  }))}
  onAddToSpreadsheet={handleAddToSpreadsheet}
/>
          </div>
        </TabsContent>

        <TabsContent value="spreadsheet">
          <SpreadsheetPanel
            data={spreadsheetData}
            onClearData={() => {
              console.log("🗑️ Limpando dados da planilha...")
              setSpreadsheetData([])
            }}
            onUpdateData={handleUpdateSpreadsheetData}
          />
        </TabsContent>
      </Tabs>

      {/* Monitor de performance (apenas em desenvolvimento) */}
      <PerformanceMonitor />
    </div>
  )
}
