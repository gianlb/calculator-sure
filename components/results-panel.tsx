"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FileSpreadsheet, TrendingUp, TrendingDown, Share2, Copy, Check } from "lucide-react"

interface Bookmaker {
  id?: number | string;
  odd?: number | string;
  finalOdd?: number | string;
  increase?: number;
  stake?: number;
  freebet?: boolean;
  isLayBet?: boolean;
  commissionRate?: number;
  isStakeFixed?: boolean;
  manualStake?: number;
}

interface Results {
  arbitragePercentage: number;
  profit: number;
  profitPercentage: number;
  totalInvestment: number;
  isArbitrage: boolean;
  distributedStakes: number[];
  returns: number[];
}

interface SpreadsheetData {
  operationName: string;
  timestamp: string;
  arbitragePercentage: number;
  profit: number;
  profitPercentage: number;
  totalInvestment: number;
  isArbitrage: boolean;
  isManualEntry: boolean;
  bookmakers: Array<{
    id: number | string;
    odd: number;
    finalOdd: number;
    stake: number;
    investment: number;
    isLayBet: boolean;
    freebet: boolean;
    commissionRate: number;
    expectedReturn: number;
  }>;
}

interface ResultsPanelProps {
  results: Results;
  bookmakers: Bookmaker[];
  onAddToSpreadsheet?: (data: SpreadsheetData) => void;
}


export function ResultsPanel({ results, bookmakers, onAddToSpreadsheet }: ResultsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [operationName, setOperationName] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  // Debug: verificar se os dados estão chegando corretamente
  useEffect(() => {
    console.log("ResultsPanel - dados recebidos:", {
      results,
      bookmakers,
      onAddToSpreadsheet: !!onAddToSpreadsheet,
    })
  }, [results, bookmakers, onAddToSpreadsheet])

  const { arbitragePercentage, profit, profitPercentage, totalInvestment, isArbitrage, distributedStakes, returns } =
    results

  // Helper function to safely format numbers
  const formatNumber = (value: number | null | undefined, decimals = 2): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.00"
    }
    return Number(value).toFixed(decimals)
  }

  // Calculate individual investments for each bookmaker
  const individualInvestments = distributedStakes.map((stake: number, index: number) => {
    const bm = bookmakers[index]
    if (bm?.isLayBet) {
      const layOdd = Number.parseFloat(bm.finalOdd as string) || 0
      const liability = stake * (layOdd - 1)
      return liability
    }
    return stake
  })

  // Função para gerar link de compartilhamento
  const generateShareLink = () => {
    console.log("🔗 Gerando link de compartilhamento...")

    try {
      // Preparar dados para URL
      const shareData = {
        // Dados dos bookmakers
        bookmakers: bookmakers.map((bm: Bookmaker, index: number) => ({
          id: bm.id,
          odd: bm.odd || "",
          increase: bm.increase || 0,
          stake: bm.stake || 100,
          freebet: bm.freebet || false,
          isLayBet: bm.isLayBet || false,
          commissionRate: bm.commissionRate || 4.5,
          isStakeFixed: bm.isStakeFixed || false,
          manualStake: bm.manualStake,
        })),
        // Dados dos resultados
        results: {
          arbitragePercentage: Number(arbitragePercentage) || 0,
          profit: Number(profit) || 0,
          profitPercentage: Number(profitPercentage) || 0,
          totalInvestment: Number(totalInvestment) || 0,
          isArbitrage: Boolean(isArbitrage),
        },
        // Metadados
        timestamp: new Date().toISOString(),
        bookmakerCount: bookmakers.length,
      }

      // Comprimir dados para URL
      const compressedData = btoa(JSON.stringify(shareData))

      // Gerar URL
      const baseUrl = "https://surezone.com.br"
      const shareUrl = `${baseUrl}?shared=${encodeURIComponent(compressedData)}`

      console.log("✅ Link gerado:", shareUrl)
      setShareLink(shareUrl)
      setIsShareDialogOpen(true)
    } catch (error) {
      console.error("❌ Erro ao gerar link:", error)
      alert("Erro ao gerar link de compartilhamento!")
    }
  }

  // Função para copiar link
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      console.log("📋 Link copiado!")

      // Reset do estado após 2 segundos
      setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch (error) {
      console.error("❌ Erro ao copiar:", error)
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea")
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  // Função para compartilhar via Web Share API (mobile)
  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SUREZONE - Análise de Arbitragem",
          text: `Confira esta análise de arbitragem: Lucro de R$ ${formatNumber(profit)} com ROI de ${formatNumber(profitPercentage)}%`,
          url: shareLink,
        })
        console.log("📱 Compartilhado via Web Share API")
      } catch (error) {
        console.log("❌ Erro no Web Share API:", error)
        copyShareLink() // Fallback para copiar
      }
    } else {
      copyShareLink() // Fallback para desktop
    }
  }

  // Prepare data for spreadsheet (versão com dialog) - CORRIGIDA
  const handleAddToSpreadsheet = () => {
    console.log("🚀 handleAddToSpreadsheet chamado")
    console.log("📝 Nome da operação:", operationName)
    console.log("🔧 onAddToSpreadsheet existe?", !!onAddToSpreadsheet)

    if (!operationName.trim()) {
      console.log("❌ Nome da operação vazio")
      alert("Por favor, insira um nome para a operação!")
      return
    }

    if (!onAddToSpreadsheet) {
      console.error("❌ onAddToSpreadsheet function not provided")
      alert("Erro: função de adicionar à planilha não encontrada!")
      return
    }

    // Preparar dados com validação mais robusta
    const spreadsheetData = {
      operationName: operationName.trim(),
      timestamp: new Date().toLocaleString("pt-BR"),
      arbitragePercentage: Number(arbitragePercentage) || 0,
      profit: Number(profit) || 0,
      profitPercentage: Number(profitPercentage) || 0,
      totalInvestment: Number(totalInvestment) || 0,
      isArbitrage: Boolean(isArbitrage),
      isManualEntry: false, // Não é entrada manual
      bookmakers: bookmakers.map((bm, index) => ({
        id: bm.id || index + 1,
        odd: Number(bm.odd) || 0,
        finalOdd: Number(bm.finalOdd) || 0,
        stake: Number(distributedStakes[index]) || 0,
        investment: Number(individualInvestments[index]) || 0,
        isLayBet: Boolean(bm.isLayBet),
        freebet: Boolean(bm.freebet),
        commissionRate: Number(bm.commissionRate) || 0,
        expectedReturn: Number(returns[index]) || 0,
      })),
    }

    console.log("📊 Dados preparados para planilha:", spreadsheetData)

    try {
      console.log("🚀 Chamando onAddToSpreadsheet...")
      onAddToSpreadsheet(spreadsheetData)
      console.log("✅ onAddToSpreadsheet executado!")

      // Reset and close dialog
      setOperationName("")
      setIsDialogOpen(false)

      console.log("🎉 Sucesso! Dialog fechado")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("💥 Erro ao adicionar à planilha:", message)
      alert(`Erro ao adicionar à planilha: ${message}`)
    }

  }

  // Determine profit status and colors
  const isProfitable = profit > 0
  const isLoss = profit < 0

  return (
    <div className="bg-card-gradient backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-premium">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-primary font-bold flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow"></div>
          Resultado da Análise
        </h2>

        {totalInvestment > 0 && bookmakers.length > 0 && (
          <div className="flex gap-2">
            {/* Botão de Compartilhar */}
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-400 border border-blue-500/50 hover:border-blue-400 transition-all duration-300 shadow-glow"
                  size="sm"
                  onClick={() => {
                    console.log("🔘 Botão 'Compartilhar' clicado")
                    generateShareLink()
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card-gradient backdrop-blur-xl border border-logo-medium/50">
                <DialogHeader>
                  <DialogTitle className="text-blue-400 flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Compartilhar Análise
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="bg-muted/10 p-4 rounded-lg border border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">Resumo da Análise:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Lucro:</span>
                        <span
                          className={`font-bold ${isProfitable ? "text-green-400" : isLoss ? "text-red-400" : "text-gray-400"
                            }`}
                        >
                          R$ {formatNumber(profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className={profitPercentage >= 0 ? "text-green-400" : "text-red-400"}>
                          {formatNumber(profitPercentage)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investimento:</span>
                        <span>R$ {formatNumber(totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Casas:</span>
                        <span>{bookmakers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Arbitragem:</span>
                        <span className={isArbitrage ? "text-primary" : "text-muted-foreground"}>
                          {isArbitrage ? "✅ Sim" : "❌ Não"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="share-link" className="text-sm text-muted-foreground mb-2 block font-medium">
                      Link de Compartilhamento
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="share-link"
                        type="text"
                        value={shareLink}
                        readOnly
                        className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground font-mono text-xs"
                      />
                      <Button
                        onClick={copyShareLink}
                        className={`px-3 transition-all duration-300 ${linkCopied
                            ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-400/50"
                            : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400/50"
                          }`}
                        size="sm"
                      >
                        {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {linkCopied ? "✅ Link copiado!" : "Clique para copiar o link"}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={shareViaWebAPI}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400/50"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {typeof navigator.share === "function" ? "Compartilhar" : "Copiar Link"}

                    </Button>
                    <Button
                      onClick={() => {
                        setIsShareDialogOpen(false)
                        setLinkCopied(false)
                      }}
                      variant="outline"
                      className="border-border/50 hover:bg-muted/20"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Botão com Dialog - CORRIGIDO */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-logo-medium/30 hover:bg-logo-medium/50 text-logo-neon border border-logo-neon/50 hover:border-logo-neon transition-all duration-300 shadow-glow"
                  size="sm"
                  onClick={() => {
                    console.log("🔘 Botão 'Adicionar à Planilha' clicado")
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Adicionar à Planilha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card-gradient backdrop-blur-xl border border-logo-medium/50">
                <DialogHeader>
                  <DialogTitle className="text-logo-neon flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Adicionar Operação à Planilha
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="operation-name" className="text-sm text-muted-foreground mb-2 block font-medium">
                      Nome da Operação
                    </Label>
                    <Input
                      id="operation-name"
                      type="text"
                      placeholder="Ex: Arsenal vs Chelsea - Over 2.5"
                      value={operationName}
                      onChange={(e) => {
                        console.log("📝 Nome alterado para:", e.target.value)
                        setOperationName(e.target.value)
                      }}
                      className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground focus:ring-primary/50 focus:border-primary/50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          console.log("⌨️ Enter pressionado")
                          handleAddToSpreadsheet()
                        }
                      }}
                    />
                  </div>

                  {/* Preview dos dados */}
                  <div className="bg-muted/10 p-3 rounded-lg border border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">Preview:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Lucro:</span>
                        <span
                          className={`font-bold ${isProfitable ? "text-green-400" : isLoss ? "text-red-400" : "text-gray-400"
                            }`}
                        >
                          R$ {formatNumber(profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investimento:</span>
                        <span>R$ {formatNumber(totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className={profitPercentage >= 0 ? "text-green-400" : "text-red-400"}>
                          {formatNumber(profitPercentage)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        console.log("🔘 Botão 'Adicionar' clicado")
                        handleAddToSpreadsheet()
                      }}
                      className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border-primary/50"
                      disabled={!operationName.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button
                      onClick={() => {
                        console.log("🔘 Botão 'Cancelar' clicado")
                        setOperationName("")
                        setIsDialogOpen(false)
                      }}
                      variant="outline"
                      className="border-border/50 hover:bg-muted/20"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* ROI PERCENTAGE */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              ROI (Retorno sobre Investimento)
            </span>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-xl ${profitPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatNumber(profitPercentage)}%
              </span>
              {profitPercentage > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : profitPercentage < 0 ? (
                <TrendingDown className="w-5 h-5 text-red-400" />
              ) : (
                <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
              )}
            </div>
          </div>

          {/* ROI Visual Indicator */}
          <div
            className={`p-4 rounded-lg backdrop-blur-sm border-2 transition-all duration-300 ${profitPercentage > 0
                ? "bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-400/50"
                : profitPercentage < 0
                  ? "bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-400/50"
                  : "bg-muted/10 border-border/30"
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {profitPercentage > 0
                    ? "🚀 ROI Positivo - Operação Lucrativa"
                    : profitPercentage < 0
                      ? "⚠️ ROI Negativo - Operação com Prejuízo"
                      : "📊 ROI Neutro - Sem Lucro nem Prejuízo"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Para cada R$ 100 investidos, você {profitPercentage >= 0 ? "ganha" : "perde"} R${" "}
                  {formatNumber(Math.abs(profitPercentage))}
                </div>
              </div>
              <div
                className={`text-3xl font-bold ${profitPercentage > 0 ? "text-green-400" : profitPercentage < 0 ? "text-red-400" : "text-gray-400"
                  }`}
                style={{
                  textShadow:
                    profitPercentage > 0
                      ? "0 0 20px rgba(34, 197, 94, 0.5)"
                      : profitPercentage < 0
                        ? "0 0 20px rgba(239, 68, 68, 0.5)"
                        : "none",
                }}
              >
                {profitPercentage >= 0 ? "+" : ""}
                {formatNumber(profitPercentage)}%
              </div>
            </div>
          </div>

          {/* Arbitrage Status */}
          <div
            className={`text-sm font-medium flex items-center gap-2 ${isArbitrage ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isArbitrage ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
            ></div>
            {isArbitrage ? "✅ Arbitragem detectada" : "📊 Análise de investimento"}
            <span className="text-xs text-muted-foreground ml-2">
              (Soma das probabilidades: {formatNumber(arbitragePercentage)}%)
            </span>
          </div>
        </div>

        {/* RESULTADO FINAL */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-surezone-400 rounded-full animate-pulse"></div>
            Resultado Final
          </h3>

          <div
            className={`p-8 rounded-xl backdrop-blur-sm shadow-2xl border-2 transition-all duration-500 ${isProfitable
                ? "bg-gradient-to-r from-green-500/25 via-green-400/15 to-green-500/25 border-green-400/60"
                : isLoss
                  ? "bg-gradient-to-r from-red-500/25 via-red-400/15 to-red-500/25 border-red-400/60"
                  : "bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border-primary/30"
              }`}
            style={{
              boxShadow: isProfitable
                ? "0 0 60px rgba(34, 197, 94, 0.4)"
                : isLoss
                  ? "0 0 60px rgba(239, 68, 68, 0.4)"
                  : "0 0 30px rgba(34, 255, 136, 0.3)",
            }}
          >
            <div className="text-center space-y-4">
              {isProfitable ? (
                <>
                  <div className="text-6xl">🎉</div>
                  <div className="text-2xl font-bold text-green-400">LUCRO GARANTIDO!</div>
                </>
              ) : isLoss ? (
                <>
                  <div className="text-6xl">⚠️</div>
                  <div className="text-2xl font-bold text-red-400">PREJUÍZO DETECTADO</div>
                </>
              ) : (
                <>
                  <div className="text-6xl">📊</div>
                  <div className="text-2xl font-bold text-primary">RESULTADO NEUTRO</div>
                </>
              )}

              <div
                className={`text-6xl font-bold transition-all duration-300 ${isProfitable
                    ? "text-green-400 drop-shadow-2xl"
                    : isLoss
                      ? "text-red-400 drop-shadow-2xl"
                      : "text-primary drop-shadow-lg"
                  }`}
                style={{
                  textShadow: isProfitable
                    ? "0 0 40px rgba(34, 197, 94, 0.8)"
                    : isLoss
                      ? "0 0 40px rgba(239, 68, 68, 0.8)"
                      : "0 0 25px rgba(34, 255, 136, 0.6)",
                }}
              >
                R$ {formatNumber(profit)}
              </div>

              <div className="text-lg text-muted-foreground font-medium">
                {isProfitable
                  ? "🚀 Independente do resultado, você lucra este valor!"
                  : isLoss
                    ? "🔍 Independente do resultado, você perde este valor"
                    : "📈 Operação neutra - sem lucro nem prejuízo significativo"}
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/20">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Investimento Total</div>
                  <div className="text-2xl font-bold text-foreground">R$ {formatNumber(totalInvestment)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">ROI</div>
                  <div
                    className={`text-2xl font-bold ${isProfitable ? "text-green-400" : isLoss ? "text-red-400" : "text-gray-400"
                      }`}
                  >
                    {profitPercentage >= 0 ? "+" : ""}
                    {formatNumber(profitPercentage)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Breakdown */}
        {distributedStakes.length > 0 && distributedStakes.some((stake) => stake > 0) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              Distribuição dos Investimentos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributedStakes.map((stake, index) => {
                const bm = bookmakers[index]
                const investment = individualInvestments[index]

                return (
                  <div
                    key={index}
                    className="bg-muted/10 backdrop-blur-sm rounded-lg p-4 border border-border/20 hover:shadow-glow transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-semibold flex items-center gap-3">
                        Casa {bm?.id || index + 1}
                        {bm?.isLayBet && (
                          <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                            (Lay)
                          </span>
                        )}
                        {bm?.freebet && (
                          <span className="text-accent text-xs bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
                            (Freebet)
                          </span>
                        )}
                      </span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">R$ {formatNumber(investment)}</div>
                        <div className="text-xs text-muted-foreground">
                          Stake: R$ {formatNumber(stake)} | Odd: {formatNumber(Number(bm?.finalOdd) || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
