"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Lock, Unlock, Gift, TrendingDown, Percent, Calculator, X } from "lucide-react"

interface Bookmaker {
  id: number
  odd: string
  increase: number
  stake: number
  commission: boolean
  freebet: boolean
  finalOdd: number
  isStakeFixed: boolean
  isLayBet: boolean
  commissionRate: number
  manualStake: number | null
}

interface BookmakerCardProps {
  bookmaker: Bookmaker
  computedStake?: number
  onChange: (id: number, field: string, value: any) => void
}
export function BookmakerCard({ bookmaker, computedStake = 0, onChange }: BookmakerCardProps) {
  // Helper function to safely format numbers for display
  const formatValue = (value:any) => {
    if (value === null || value === undefined || isNaN(value)) {
      return ""
    }
    return value.toString()
  }

  // Helper function to safely format final odd
  const formatFinalOdd = (value:number) => {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
      return "0.00"
    }
    return value.toFixed(2)
  }

  // Convert lay odds to back odds equivalent
  // Convert lay odds to back odds equivalent
const convertLayToBack = (layOdd: number) => {
  if (layOdd <= 1) return 0
  return layOdd / (layOdd - 1)
}

// Get the effective odd for calculations (converted if lay)
const getEffectiveOdd = () => {
  const finalOdd = bookmaker.finalOdd ?? 0
  if (bookmaker.isLayBet) {
    return convertLayToBack(finalOdd)
  }
  return finalOdd
}



  // Calculate liability for lay bets
  const calculateLayValues = (backerStake: number, layOdd: number) => {
  const stakeValue = backerStake || 0
  const oddValue = layOdd || 0

  if (oddValue <= 1) return { backerStake: 0, liability: 0 }

  return {
    backerStake: stakeValue,
    liability: stakeValue * (oddValue - 1),
  }
}


  // Determinar se deve usar stake manual ou computada
  const displayStake = bookmaker.isStakeFixed
    ? bookmaker.stake
    : bookmaker.manualStake !== null && bookmaker.manualStake !== undefined
      ? bookmaker.manualStake
      : computedStake

  const isManualMode = bookmaker.manualStake !== null && bookmaker.manualStake !== undefined && !bookmaker.isStakeFixed

  const layValues = bookmaker.isLayBet
    ? calculateLayValues(displayStake, bookmaker.finalOdd)
    : { backerStake: 0, liability: 0 }

  const effectiveOdd = getEffectiveOdd()

  // Função para lidar com mudanças no stake - ATIVA MODO MANUAL AUTOMATICAMENTE
  const handleStakeChange = (value: string) => {
    const numericValue = value === "" ? 0 : Number.parseFloat(value)

    if (bookmaker.isStakeFixed) {
      // Se está fixada, alterar o stake fixo
      onChange(bookmaker.id, "stake", isNaN(numericValue) ? 0 : numericValue)
    } else {
      // Se não está fixada, AUTOMATICAMENTE ativar modo manual
      onChange(bookmaker.id, "manualStake", isNaN(numericValue) ? 0 : numericValue)
    }
  }

  return (
    <div
      className={`bg-card-gradient backdrop-blur-sm rounded-xl p-6 flex flex-col border transition-all duration-300 hover:shadow-glow-lg hover:scale-[1.02] ${
        bookmaker.isStakeFixed ? "ring-2 ring-primary/50 shadow-glow bg-primary/5" : "border-border/30"
      } ${bookmaker.freebet ? "ring-2 ring-accent/50 shadow-glow bg-accent/5" : ""} ${
        bookmaker.isLayBet ? "ring-2 ring-red-500/50 shadow-glow bg-red-500/5" : ""
      } ${isManualMode ? "ring-2 ring-yellow-500/50 shadow-glow bg-yellow-500/5" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary font-bold text-lg">Casa {bookmaker.id}</h3>
        <div className="flex items-center gap-2">
          {bookmaker.isLayBet && (
            <div className="flex items-center text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20 backdrop-blur-sm">
              <TrendingDown className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">Lay</span>
            </div>
          )}
          {bookmaker.freebet && (
            <div className="flex items-center text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 backdrop-blur-sm">
              <Gift className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">Freebet</span>
            </div>
          )}
          {bookmaker.isLayBet && bookmaker.commissionRate > 0 && (
            <div className="flex items-center text-surezone-400 bg-surezone-400/10 px-3 py-1.5 rounded-full border border-surezone-400/20 backdrop-blur-sm">
              <Percent className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">{bookmaker.commissionRate}%</span>
            </div>
          )}
          {bookmaker.isStakeFixed && (
            <div className="flex items-center text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 backdrop-blur-sm">
              <Lock className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">Fixa</span>
            </div>
          )}
          {isManualMode && (
            <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 backdrop-blur-sm">
              <Calculator className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">Manual</span>
            </div>
          )}
        </div>
      </div>

      {/* Premium Odd Input */}
      <div className="mb-4">
        <Label htmlFor={`odd-${bookmaker.id}`} className="text-sm text-muted-foreground mb-2 block font-medium">
          {bookmaker.isLayBet ? "Odd Lay (você oferece)" : "Odd Back"}
        </Label>
        <Input
          id={`odd-${bookmaker.id}`}
          type="number"
          min="1"
          step="0.01"
          placeholder="0.00"
          value={formatValue(bookmaker.odd)}
          onChange={(e) => onChange(bookmaker.id, "odd", e.target.value)}
          className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
        />
      </div>

      {/* Commission Rate for Lay Bets */}
      {bookmaker.isLayBet && (
        <div className="mb-4">
          <Label
            htmlFor={`commission-rate-${bookmaker.id}`}
            className="text-sm text-muted-foreground mb-2 block font-medium"
          >
            Comissão da Exchange (%)
          </Label>
          <div className="relative">
            <Input
              id={`commission-rate-${bookmaker.id}`}
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="4.5"
              value={formatValue(bookmaker.commissionRate || "")}
              onChange={(e) => onChange(bookmaker.id, "commissionRate", e.target.value)}
              className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground pr-8 focus:ring-primary/50 focus:border-primary/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Cobrada apenas quando você ganha</div>
        </div>
      )}

      {/* Increase Percentage */}
      <div className="mb-4">
        <Label htmlFor={`increase-${bookmaker.id}`} className="text-sm text-muted-foreground mb-2 block font-medium">
          Aumento (%)
        </Label>
        <div className="relative">
          <Input
            id={`increase-${bookmaker.id}`}
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={formatValue(bookmaker.increase)}
            onChange={(e) => onChange(bookmaker.id, "increase", e.target.value)}
            className="bg-input/50 backdrop-blur-sm border-border/50 text-foreground pr-8 focus:ring-primary/50 focus:border-primary/50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
        </div>
      </div>

      {/* Premium Final Odd Display */}
      <div className="mb-4 text-sm space-y-2 bg-muted/10 p-3 rounded-lg border border-border/20 backdrop-blur-sm">
        <div className="text-foreground flex items-center justify-between">
          <span>Odd Final:</span>
          <span className="font-bold text-primary text-lg">{formatFinalOdd(bookmaker.finalOdd)}</span>
          {bookmaker.isLayBet && <span className="text-red-400 ml-2 font-semibold">(Lay)</span>}
        </div>

        {bookmaker.isLayBet && bookmaker.finalOdd > 1 && (
          <div className="text-accent flex items-center justify-between">
            <span>Equivalente Back:</span>
            <span className="font-semibold">{formatFinalOdd(effectiveOdd)}</span>
          </div>
        )}

        {bookmaker.freebet && (
          <div className="text-accent flex items-center justify-between">
            <span>Retorno:</span>
            <span className="font-semibold">{(bookmaker.finalOdd - 1).toFixed(2)}x</span>
          </div>
        )}
      </div>

      {/* Premium Stake Input - ATIVA MODO MANUAL AUTOMATICAMENTE */}
      {bookmaker.isLayBet ? (
        <div className="mb-4 space-y-4">
          {/* Backer's Stake */}
          <div>
            <Label htmlFor={`stake-${bookmaker.id}`} className="text-sm text-muted-foreground mb-2 block font-medium">
              Stake do Apostador
              {bookmaker.isStakeFixed && <span className="text-primary font-semibold"> (Fixo)</span>}
              {isManualMode && <span className="text-yellow-400 font-semibold"> (Manual)</span>}
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-muted/30 border border-r-0 border-border/50 rounded-l-lg text-muted-foreground font-medium backdrop-blur-sm">
                R$
              </span>
              <Input
                id={`stake-${bookmaker.id}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={formatValue(displayStake)}
                onChange={(e) => handleStakeChange(e.target.value)}
                className={`bg-input/50 backdrop-blur-sm border-border/50 text-foreground rounded-l-none focus:ring-primary/50 focus:border-primary/50 ${
                  bookmaker.isStakeFixed ? "bg-primary/10" : isManualMode ? "bg-yellow-500/10" : ""
                }`}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {bookmaker.isStakeFixed
                ? "Valor fixo - outras casas serão calculadas com base neste"
                : isManualMode
                  ? "Valor manual - digite para ativar modo manual automaticamente"
                  : "Digite um valor para ativar o modo manual"}
            </div>
          </div>

          {/* Liability */}
          <div>
            <Label htmlFor={`liability-${bookmaker.id}`} className="text-sm text-red-400 mb-2 block font-medium">
              Sua Responsabilidade (se perder)
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-red-500/20 border border-r-0 border-red-500/30 rounded-l-lg text-red-400 font-medium backdrop-blur-sm">
                R$
              </span>
              <Input
                id={`liability-${bookmaker.id}`}
                type="number"
                value={formatValue(layValues.liability.toFixed(2))}
                className="bg-red-500/10 border-red-500/30 text-red-100 rounded-l-none backdrop-blur-sm"
                disabled
                readOnly
              />
            </div>
            <div className="text-xs text-red-400/70 mt-1">
              Stake × (Odd Lay - 1) {bookmaker.commissionRate > 0 ? `- Comissão ${bookmaker.commissionRate}%` : ""}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <Label htmlFor={`stake-${bookmaker.id}`} className="text-sm text-muted-foreground mb-2 block font-medium">
            Stake
            {bookmaker.isStakeFixed && <span className="text-primary font-semibold"> (Fixo)</span>}
            {isManualMode && <span className="text-yellow-400 font-semibold"> (Manual)</span>}
          </Label>
          <div className="flex">
            <span className="inline-flex items-center px-4 bg-muted/30 border border-r-0 border-border/50 rounded-l-lg text-muted-foreground font-medium backdrop-blur-sm">
              R$
            </span>
            <Input
              id={`stake-${bookmaker.id}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="100.00"
              value={formatValue(displayStake)}
              onChange={(e) => handleStakeChange(e.target.value)}
              className={`bg-input/50 backdrop-blur-sm border-border/50 text-foreground rounded-l-none focus:ring-primary/50 focus:border-primary/50 ${
                bookmaker.isStakeFixed ? "bg-primary/10" : isManualMode ? "bg-yellow-500/10" : ""
              }`}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {bookmaker.isStakeFixed
              ? "Valor fixo - outras casas serão calculadas com base neste"
              : isManualMode
                ? "Valor manual - digite para ativar modo manual automaticamente"
                : "Digite um valor para ativar o modo manual"}
          </div>
        </div>
      )}

      {/* Premium Checkboxes - REMOVIDO O CHECKBOX DE COMISSÃO */}
      <div className="flex flex-col space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`freebet-${bookmaker.id}`}
            checked={bookmaker.freebet}
            onCheckedChange={(checked) => onChange(bookmaker.id, "freebet", checked)}
            className="border-border/50 data-[state=checked]:bg-accent/20 data-[state=checked]:border-accent"
          />
          <Label htmlFor={`freebet-${bookmaker.id}`} className="text-sm text-foreground font-medium cursor-pointer">
            Freebet
          </Label>
        </div>
      </div>

      {/* Premium Action Buttons */}
      <div className="flex gap-3 mt-auto">
        <Button
          variant={bookmaker.isStakeFixed ? "default" : "outline"}
          className={`flex-1 transition-all duration-300 ${
            bookmaker.isStakeFixed
              ? "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 shadow-glow"
              : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
          }`}
          onClick={() => {
            // Limpar modo manual quando fixar
            if (!bookmaker.isStakeFixed) {
              onChange(bookmaker.id, "manualStake", null)
            }
            onChange(bookmaker.id, "isStakeFixed", !bookmaker.isStakeFixed)
          }}
        >
          {bookmaker.isStakeFixed ? (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Fixada
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Fixar
            </>
          )}
        </Button>

        {/* Botão para limpar modo manual */}
        {isManualMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(bookmaker.id, "manualStake", null)}
            className="px-4 transition-all duration-300 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            title="Limpar modo manual"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant={bookmaker.isLayBet ? "destructive" : "outline"}
          size="sm"
          onClick={() => onChange(bookmaker.id, "isLayBet", !bookmaker.isLayBet)}
          className={`px-4 transition-all duration-300 ${
            bookmaker.isLayBet
              ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50"
              : "border-border/50 hover:border-red-500/50 hover:bg-red-500/5"
          }`}
        >
          L
        </Button>
      </div>
    </div>
  )
}
