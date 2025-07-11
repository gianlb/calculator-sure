"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadarAnimation } from "@/components/radar-animation"
import {
  Trash2,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit3,
  Save,
  X,
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface DataItem {
  arbitragePercentage?: number;
  timestamp: string;
  profit?: number;
  isArbitrage?: boolean;
  totalInvestment?: number;
  profitPercentage?: number;
  operationName?: string;
  bookmakers?: any[];
  isManualEntry?: boolean;
  originalIndex?: number; // só se você quiser
  // outros campos que seu objeto tenha
}

export function SpreadsheetPanel({
  data,
  onClearData,
  onUpdateData,
}:{
  data: any[];
  onClearData: () => void;
  onUpdateData: (index: number, newItem: any) => void;
}){
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<DataItem | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({})

  // Estados para adicionar operação manual
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [manualOperationName, setManualOperationName] = useState("")
  const [manualProfit, setManualProfit] = useState("")
  const [manualInvestment, setManualInvestment] = useState("")

  // Debug: Log das props recebidas
  console.log("🔍 SpreadsheetPanel - Props recebidas:", {
    dataLength: data?.length || 0,
    onClearData: !!onClearData,
    onUpdateData: !!onUpdateData,
    data: data,
  })

  // Helper function to safely format numbers
  const formatNumber = (value: number | null | undefined, decimals: number = 2) => {
     if (value === null || value === undefined || isNaN(Number(value))) {
      return "0.00"
    }
    return Number(value).toFixed(decimals)
  }

  // Função para extrair mês/ano de uma data
  const getMonthYear = (timestamp:string) => {
    try {
      // Assumindo formato brasileiro: DD/MM/AAAA HH:MM:SS
      const [datePart] = timestamp.split(" ")
      const [day, month, year] = datePart.split("/")
      return `${month}/${year}`
    } catch (error) {
      console.error("Erro ao processar data:", timestamp, error)
      return "Indefinido"
    }
  }

  // Função para obter nome do mês em português
  const getMonthName = (monthYear: string): string => {
  try {
    const [month, year] = monthYear.split("/")
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  } catch (error) {
    return monthYear
  }
}

  // Organizar dados por mês
  const dataByMonth = useMemo(() => {
    const grouped: { [monthYear: string]: DataItem[] } = {}

    data.forEach((item, originalIndex) => {
      const monthYear = getMonthYear(item.timestamp)
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push({ ...item, originalIndex })
    })

    // Ordenar meses (mais recente primeiro)
    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      const [monthA, yearA] = a.split("/").map(Number)
      const [monthB, yearB] = b.split("/").map(Number)

      if (yearA !== yearB) return yearB - yearA
      return monthB - monthA
    })

    const result: { [month: string]: DataItem[] } = {}

sortedMonths.forEach((month) => {
  result[month] = grouped[month].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})


    return result
  }, [data])

  // Calcular estatísticas por mês
  const monthlyStats = useMemo(() => {
  const stats: { [key: string]: any } = {}

  Object.keys(dataByMonth).forEach((monthYear) => {
    const monthData = dataByMonth[monthYear]
    stats[monthYear] = {
      totalOperations: monthData.length,
      arbitrageOpportunities: monthData.filter((item) => item.isArbitrage).length,
      totalProfit: monthData.reduce((sum, item) => sum + (item.profit ?? 0), 0),
      averageProfit:
        monthData.length > 0
          ? monthData.reduce((sum, item) => sum + (item.profit ?? 0), 0) / monthData.length
          : 0,
      profitableOperations: monthData.filter((item) => (item.profit ?? 0) > 0).length,
      lossOperations: monthData.filter((item) => (item.profit ?? 0) < 0).length,
      totalInvestment: monthData.reduce((sum, item) => sum + (item.totalInvestment ?? 0), 0),
      averageROI:
        monthData.length > 0
          ? monthData.reduce((sum, item) => sum + (item.profitPercentage ?? 0), 0) / monthData.length
          : 0,
    }
  })
 
  return stats
}, [dataByMonth])


  // Calculate overall statistics
  const overallStats = {
    totalAnalyses: data.length,
    arbitrageOpportunities: data.filter((item) => item.isArbitrage).length,
    totalProfit: data.reduce((sum, item) => sum + (item.profit || 0), 0),
    averageProfit: data.length > 0 ? data.reduce((sum, item) => sum + (item.profit || 0), 0) / data.length : 0,
    profitableOperations: data.filter((item) => item.profit > 0).length,
    lossOperations: data.filter((item) => item.profit < 0).length,
  }

  // Toggle month expansion

  
  const toggleMonth = (monthYear: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthYear]: !prev[monthYear],
    }))
  }

  const handleExport = () => {
    console.log("Exportando dados:", data)
    alert("Funcionalidade de exportação em desenvolvimento!")
  }

  const handleEdit = (originalIndex: number) => {
  setEditingIndex(originalIndex)
  setEditingData({ ...data[originalIndex] })
}


  const handleSave = () => {
  if (onUpdateData && editingData && editingIndex !== null) {
    onUpdateData(editingIndex, editingData)
  }
  setEditingIndex(null)
  setEditingData(null)
}

  const handleCancel = () => {
    setEditingIndex(null)
    setEditingData(null)
  }

  

  const handleDelete = (originalIndex:number) => {
    if (confirm("Tem certeza que deseja excluir esta análise?")) {
      const newData = data.filter((_, i) => i !== originalIndex)
      if (onClearData) {
        onClearData()
        newData.forEach((item) => {
          if (onUpdateData) {
            onUpdateData(-1, item)
          }
        })
      }
    }
  }

  // Função para adicionar operação manual - COM LOGS DETALHADOS
    const handleAddManualOperation = () => {
  console.log("🚀 === INÍCIO handleAddManualOperation ===")
  console.log("📝 Estado atual dos campos:", {
    manualOperationName,
    onUpdateData: !!onUpdateData,
  })

  // Validação do nome
  if (!manualOperationName || !manualOperationName.trim()) {
    console.log("❌ Nome da operação vazio")
    alert("Por favor, insira um nome para a operação!")
    return
  }
  console.log("✅ Nome da operação válido:", manualOperationName.trim())

  // Exemplo de dados mock para entrada manual
  const bookmakers = [
    { name: "Casa 1", odd: 3, stake: 100 },
    { name: "Casa 2", odd: 3, stake: 100 },
  ]

  // Validação e cálculo
  const totalInvestment = bookmakers.reduce((sum, bm) => sum + (bm.stake || 0), 0)
  const possibleReturns = bookmakers.map((bm) => (bm.stake || 0) * (bm.odd || 0))
  const maxReturn = Math.max(...possibleReturns)

  const profit = maxReturn - totalInvestment
  const profitPercentage = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0

  console.log("📊 Cálculo baseado em odds/stakes:", {
    totalInvestment,
    maxReturn,
    profit,
    profitPercentage,
  })

  const manualData = {
    operationName: manualOperationName.trim(),
    timestamp: new Date().toLocaleString("pt-BR"),
    arbitragePercentage: 0,
    profit,
    profitPercentage,
    totalInvestment,
    isArbitrage: false,
    bookmakers,
    isManualEntry: true,
  }

  if (!onUpdateData) {
    alert("Função onUpdateData não definida!")
    return
  }

  try {
    onUpdateData(-1, manualData)
    setManualOperationName("")
    setManualProfit("")
    setManualInvestment("")
    setIsManualDialogOpen(false)
    alert("Operação adicionada com sucesso!")
  } catch (error: any) {
    console.error("💥 Erro ao executar onUpdateData:", error)
    alert(`Erro ao adicionar operação: ${error.message}`)
  }
}


  const updateEditingField = (field: keyof DataItem, value: any) => {
  setEditingData((prev) => {
    if (!prev) return null;
    return {
      ...prev,
      [field]: value,
    };
  });
};

const updateBookmakerField = (bmIndex: number, field: string, value: any) => {
  setEditingData((prev) => {
    if (!prev || !prev.bookmakers) return prev;

    const updatedBookmakers = prev.bookmakers.map((bm: any, index: number) =>
      index === bmIndex ? { ...bm, [field]: value } : bm
    );

    return {
      ...prev,
      bookmakers: updatedBookmakers,
    };
  });
};



  // Componente de Dialog Manual (reutilizável)
  const ManualOperationDialog = () => (
    <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-accent/30 hover:bg-accent/50 text-accent border border-accent/50 hover:border-accent transition-all duration-300 shadow-glow"
          size="sm"
          onClick={() => {
            console.log("🔘 Botão 'Manual' clicado - abrindo dialog")
            setIsManualDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card-gradient backdrop-blur-xl border border-logo-medium/50">
        <DialogHeader>
          <DialogTitle className="text-accent flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Operação Manual
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="manual-operation-name" className="text-sm text-muted-foreground mb-2 block font-medium">
              Nome da Operação *
            </Label>
            <Input
              id="manual-operation-name"
              type="text"
              placeholder="Ex: Flamengo vs Palmeiras - Resultado Final"
              value={manualOperationName}
              onChange={(e) => {
                console.log("📝 Nome alterado:", e.target.value)
                setManualOperationName(e.target.value)
              }}
              className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground focus:ring-primary/50 focus:border-primary/50"
            />
          </div>

          <div>
            <Label htmlFor="manual-profit" className="text-sm text-muted-foreground mb-2 block font-medium">
              Lucro/Prejuízo (R$) *
            </Label>
            <Input
              id="manual-profit"
              type="number"
              step="0.01"
              placeholder="Ex: 150.00 (positivo = lucro, negativo = prejuízo)"
              value={manualProfit}
              onChange={(e) => {
                console.log("💰 Lucro alterado:", e.target.value)
                setManualProfit(e.target.value)
              }}
              className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground focus:ring-primary/50 focus:border-primary/50"
            />
          </div>

          <div>
            <Label htmlFor="manual-investment" className="text-sm text-muted-foreground mb-2 block font-medium">
              Investimento Total (R$) - Opcional
            </Label>
            <Input
              id="manual-investment"
              type="number"
              step="0.01"
              placeholder="Ex: 1000.00"
              value={manualInvestment}
              onChange={(e) => {
                console.log("💵 Investimento alterado:", e.target.value)
                setManualInvestment(e.target.value)
              }}
              className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground focus:ring-primary/50 focus:border-primary/50"
            />
          </div>

          {/* Preview dos dados */}
          <div className="bg-muted/10 p-3 rounded-lg border border-border/20">
            <div className="text-sm text-muted-foreground mb-2">Preview:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Nome:</span>
                <span className="font-medium">{manualOperationName || "Não informado"}</span>
              </div>
              <div className="flex justify-between">
                <span>Lucro:</span>
                <span className="font-medium">
                  R$ {manualProfit ? Number.parseFloat(manualProfit).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Investimento:</span>
                <span className="font-medium">
                  R$ {manualInvestment ? Number.parseFloat(manualInvestment).toFixed(2) : "Automático"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                console.log("🔘 Botão 'Adicionar' clicado")
                handleAddManualOperation()
              }}
              className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border-accent/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
            <Button
              onClick={() => {
                console.log("🔘 Botão 'Cancelar' clicado")
                setManualOperationName("")
                setManualProfit("")
                setManualInvestment("")
                setIsManualDialogOpen(false)
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
  )

  if (data.length === 0) {
    return (
      <div className="p-8 text-center relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <RadarAnimation size={300} intensity="medium" />
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="space-y-4">
            <p className="text-xl font-semibold text-foreground">Planilha de Análise Vazia</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Use o botão "Adicionar à Planilha" nos resultados ou "Adicionar Operação Manual" para começar a construir
              seu histórico.
            </p>

            <ManualOperationDialog />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-logo-neon rounded-full shadow-glow"></div>
          <h2 className="text-2xl text-primary font-bold">Planilha de Análise</h2>
        </div>
        <div className="flex gap-2">
          <ManualOperationDialog />

          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-logo-bright/50 text-logo-bright hover:bg-logo-bright/10 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={onClearData}
            variant="outline"
            size="sm"
            className="border-red-400/50 text-red-400 hover:bg-red-400/10 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas gerais */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-muted/10 backdrop-blur-sm border-border/30">
          <CardHeader className="p-4">
            <CardTitle className="text-sm text-muted-foreground">Total Geral</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-foreground">{overallStats.totalAnalyses}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/10 backdrop-blur-sm border-border/30">
          <CardHeader className="p-4">
            <CardTitle className="text-sm text-muted-foreground">Arbitragens</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-primary">{overallStats.arbitrageOpportunities}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-400/50 backdrop-blur-sm shadow-green-400/20">
          <CardHeader className="p-4">
            <CardTitle className="text-sm text-green-300">Lucros</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-green-400 drop-shadow-lg">{overallStats.profitableOperations}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-400/50 backdrop-blur-sm shadow-red-400/20">
          <CardHeader className="p-4">
            <CardTitle className="text-sm text-red-300">Prejuízos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-red-400 drop-shadow-lg">{overallStats.lossOperations}</p>
          </CardContent>
        </Card>

        <Card
          className={`backdrop-blur-sm border-2 ${
            overallStats.totalProfit >= 0
              ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-400/50 shadow-green-400/20"
              : "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-400/50 shadow-red-400/20"
          }`}
        >
          <CardHeader className="p-4">
            <CardTitle className={`text-sm ${overallStats.totalProfit >= 0 ? "text-green-300" : "text-red-300"}`}>
              Lucro Total
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p
              className={`text-2xl font-bold drop-shadow-lg ${
                overallStats.totalProfit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              R$ {formatNumber(overallStats.totalProfit)}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`backdrop-blur-sm border-2 ${
            overallStats.averageProfit >= 0
              ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-400/50 shadow-green-400/20"
              : "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-400/50 shadow-red-400/20"
          }`}
        >
          <CardHeader className="p-4">
            <CardTitle className={`text-sm ${overallStats.averageProfit >= 0 ? "text-green-300" : "text-red-300"}`}>
              Lucro Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p
              className={`text-2xl font-bold drop-shadow-lg ${
                overallStats.averageProfit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              R$ {formatNumber(overallStats.averageProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico organizado por mês */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Histórico por Mês
        </h3>

        {Object.keys(dataByMonth).map((monthYear) => {
          const monthData = dataByMonth[monthYear]
          const stats = monthlyStats[monthYear]
          const isExpanded = expandedMonths[monthYear]

          return (
            <div key={monthYear} className="space-y-4">
              {/* Header do mês */}
              <Card className="bg-logo-dark/40 backdrop-blur-sm border border-logo-medium/50 shadow-inner-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMonth(monthYear)}
                        className="p-2 hover:bg-logo-medium/20"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-logo-neon" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-logo-neon" />
                        )}
                      </Button>
                      <div>
                        <h4 className="text-xl font-bold text-logo-neon">{getMonthName(monthYear)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stats.totalOperations} operações • {stats.arbitrageOpportunities} arbitragens
                        </p>
                      </div>
                    </div>

                    {/* Estatísticas do mês */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Lucro do Mês</div>
                        <div
                          className={`text-lg font-bold ${stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          R$ {formatNumber(stats.totalProfit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">ROI Médio</div>
                        <div
                          className={`text-lg font-bold ${stats.averageROI >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {formatNumber(stats.averageROI)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Investimento</div>
                        <div className="text-lg font-bold text-foreground">
                          R$ {formatNumber(stats.totalInvestment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                        <div className="text-lg font-bold text-primary">
                          {stats.totalOperations > 0
                            ? formatNumber((stats.profitableOperations / stats.totalOperations) * 100, 0)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operações do mês (expansível) */}
              {isExpanded && (
                <div className="space-y-3 ml-8">
                  {monthData.map((item) => {
                   const isProfitable = (item.profit ?? 0) > 0;
const isLoss = (item.profit ?? 0) < 0;

                    const isEditing = editingIndex === item.originalIndex
                    const isManualEntry = item.isManualEntry || false

                    return (
                      <Card
                        key={item.originalIndex}
                        className={`backdrop-blur-sm border-2 hover:shadow-2xl transition-all duration-300 ${
                          isProfitable
                            ? "bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-400/30 hover:border-green-400/60"
                            : isLoss
                              ? "bg-gradient-to-r from-red-500/10 to-red-600/5 border-red-400/30 hover:border-red-400/60"
                              : "bg-muted/10 border-border/30"
                        } ${isEditing ? "ring-2 ring-logo-neon/50" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col gap-2">
                              {isEditing ? (
                                <Input
                                  type="text"
                                  value={editingData?.operationName || ""}
                                  onChange={(e) => updateEditingField("operationName", e.target.value)}
                                  className="text-lg font-bold bg-muted/20 border-primary/50"
                                  placeholder="Nome da operação"
                                />
                              ) : (
                                <h4 className="text-lg font-bold text-primary">
                                  {item.operationName || "Operação sem nome"}
                                </h4>
                              )}

                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground font-mono">
                                  {item.timestamp.split(" ")[1]} {/* Apenas horário */}
                                </span>

                                {isManualEntry && (
                                  <Badge className="bg-accent/30 text-accent border-accent/60">
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    Manual
                                  </Badge>
                                )}

                                {item.isArbitrage ? (
                                  <Badge className="bg-primary/30 text-primary border-primary/60">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Arbitragem
                                  </Badge>
                                ) : isProfitable ? (
                                  <Badge className="bg-green-500/30 text-green-400 border-green-400/60">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Lucro
                                  </Badge>
                                ) : isLoss ? (
                                  <Badge className="bg-red-500/30 text-red-400 border-red-400/60">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    Prejuízo
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-500/30 text-gray-400 border-gray-400/60">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Neutro
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editingData?.profit || 0}
                                    onChange={(e) =>
                                      updateEditingField("profit", Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="w-32 h-8 text-right text-lg font-bold bg-muted/20"
                                  />
                                ) : (
                                  <div
                                    className={`text-xl font-bold transition-all duration-300 ${
                                      isProfitable
                                        ? "text-green-400 drop-shadow-lg"
                                        : isLoss
                                          ? "text-red-400 drop-shadow-lg"
                                          : "text-gray-400"
                                    }`}
                                  >
                                    R$ {formatNumber(item.profit)}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  ROI: {formatNumber(item.profitPercentage)}% | R$ {formatNumber(item.totalInvestment)}
                                </div>
                              </div>

                              {/* Botões de ação */}
                              <div className="flex gap-1">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={handleSave}
                                      className="h-8 w-8 p-0 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/50"
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleCancel}
                                      className="h-8 w-8 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
  size="sm"
  onClick={() => {
    if (item.originalIndex !== undefined) {
      handleEdit(item.originalIndex)
    } else {
      console.warn("OriginalIndex indefinido para este item")
    }
  }}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
  onClick={() => {
    if (item.originalIndex !== undefined) {
      handleDelete(item.originalIndex)
    } else {
      console.warn("originalIndex indefinido para este item")
    }
  }}
                                      className="h-8 w-8 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/50"
                                    > Excluir
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Detalhes resumidos */}
                          {!isEditing && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">{isManualEntry ? "Tipo:" : "Casas:"}</span>
                                <span className="ml-2 font-medium">
                                  {isManualEntry ? "Manual" : item.bookmakers?.length || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Investimento:</span>
                                <span className="ml-2 font-medium">R$ {formatNumber(item.totalInvestment)}</span>
                              </div>
                             <div>
  <span className="text-muted-foreground">ROI:</span>
  <span
    className={`ml-2 font-medium ${
      (item.profitPercentage ?? 0) >= 0 ? "text-green-400" : "text-red-400"
    }`}
  >
    {formatNumber(item.profitPercentage ?? 0)}%
  </span>
</div>

                              <div>
                                <span className="text-muted-foreground">
                                  {isManualEntry ? "Entrada:" : "Arbitragem:"}
                                </span>
                                <span className="ml-2 font-medium">
                                  {isManualEntry ? "Manual" : `${formatNumber(item.arbitragePercentage)}%`}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}