interface Bookmaker {
  finalOdd: number | string
  isLayBet?: boolean
  commissionRate?: number
  freebet?: boolean
  isStakeFixed?: boolean
  stake?: number
  manualStake?: number | null
}

const safeParseFloat = (value: number | string | null | undefined): number => {
  if (value === '' || value === null || value === undefined) return 0
  const parsed = Number.parseFloat(String(value))
  return isNaN(parsed) ? 0 : parsed
}

const convertLayToBack = (layOdd: number | string): number => {
  const layValue = safeParseFloat(layOdd)
  if (layValue <= 1) return 0
  return layValue / (layValue - 1)
}

// Function to distribute stakes considering fixed and manual stakes
function distributeStakesWithFixedAndManual(
  bookmakers: Bookmaker[],
  fixedIndex: number,
  fixedStake: number
): number[] {
  const stakes = bookmakers.map(() => 0)
  stakes[fixedIndex] = fixedStake

  const fixedBookmaker = bookmakers[fixedIndex]
  const fixedOdd = safeParseFloat(fixedBookmaker.finalOdd)

  // Calculate the target TOTAL return when the fixed house wins
  let targetTotalReturn: number

  if (fixedBookmaker.isLayBet) {
    // If fixed is lay: when it wins, total return = stake + liability not paid - commission
    const commissionRate = safeParseFloat(fixedBookmaker.commissionRate) / 100
    const liability = fixedStake * (fixedOdd - 1)
    targetTotalReturn = fixedStake + liability - (fixedStake * commissionRate) // Commission applied to win
  } else if (fixedBookmaker.freebet) {
    // If fixed is freebet: when it wins, total return = stake × (odd - 1)
    targetTotalReturn = fixedStake * (fixedOdd - 1)
  } else {
    // If fixed is normal back: when it wins, total return = stake × odd
    targetTotalReturn = fixedStake * fixedOdd
  }

  // Now calculate stakes for each other bookmaker
  bookmakers.forEach((bm, index) => {
    if (index === fixedIndex) return // Skip the fixed one

    // VERIFICAR se tem stake manual primeiro
    if (bm.manualStake !== null && bm.manualStake !== undefined) {
      stakes[index] = safeParseFloat(bm.manualStake)
      return
    }

    // Se não tem stake manual, calcular baseado no retorno da casa fixada
    const finalOdd = safeParseFloat(bm.finalOdd)

    if (finalOdd <= 0) {
      stakes[index] = 0 // Avoid division by zero or negative odds
      return
    }

    if (bm.isLayBet) {
      // For lay: when it wins, total return = stake (our win) + liability (not paid out) - commission on stake
      const commissionRate = safeParseFloat(bm.commissionRate) / 100
      // We are looking for a stake 'S' such that S + S * (finalOdd - 1) - (S * commissionRate) = targetTotalReturn
      // S * finalOdd - S * commissionRate = targetTotalReturn
      // S * (finalOdd - commissionRate) = targetTotalReturn
      const effectiveFactor = finalOdd - commissionRate
      stakes[index] = effectiveFactor > 0 ? targetTotalReturn / effectiveFactor : 0
    } else if (bm.freebet) {
      // For freebet: when it wins, total return = stake × (odd - 1) = targetTotalReturn
      stakes[index] = finalOdd > 1 ? targetTotalReturn / (finalOdd - 1) : 0
    } else {
      // For normal back: when it wins, total return = stake × odd = targetTotalReturn
      stakes[index] = targetTotalReturn / finalOdd
    }
  })

  return stakes.map((stake) => Math.round((stake || 0) * 100) / 100)
}

// Function to calculate stakes when no stake is fixed
function calculateStakesWithNewLayLogic(
  bookmakers: Bookmaker[],
  targetInvestment: number
): number[] {
  // First, calculate the effective probabilities considering lay bets and commissions
  const effectiveProbabilities = bookmakers.map((bm) => {
    const finalOdd = safeParseFloat(bm.finalOdd)

    if (finalOdd <= 0) return 0 // Invalid odd

    if (bm.isLayBet) {
      // For lay bets, convert to back equivalent and account for commission
      // A lay bet of X at odds O means we stake X and win X if the lay bet loses
      // If the lay bet wins, we pay X * (O - 1) (liability)
      // When we "win" a lay bet (i.e., our selection *doesn't* win), we get the backer's stake.
      // So, we want to ensure our *return* after commission equals the target return.
      const commissionRate = safeParseFloat(bm.commissionRate) / 100
      // The probability of a lay bet (win for us) is 1 / Odd_Lay
      // But our effective win is reduced by commission.
      // If we "win" the lay bet, we get the stake S, but pay S * commissionRate.
      // So net win is S * (1 - commissionRate).
      // The probability for a lay bet in arbitrage calculation, converted to back terms:
      // P_lay = 1 - (1 / LayOdd)
      // So, if an outcome has a lay odd O, its implied probability is (O-1)/O.
      // For arbitrage, we use 1/Odd for back bets.
      // For lay bets, effectively, we are looking at the probability of the event *not* happening.
      // The amount we win if the lay bet succeeds is the backer's stake.
      // We want to calculate the probability contribution such that our profit is balanced.
      // The effective probability for a lay bet should consider that if we "win" (the outcome doesn't happen),
      // we receive the stake, and we keep `stake * (1 - commissionRate)`.
      // The back odds equivalent for a lay bet `O` is `O / (O - 1)`.
      // The probability is `1 / (O / (O - 1)) = (O - 1) / O`.
      // When calculating arbitrage, we use 1/Odd.
      // For a lay bet, if it "wins", we get the stake.
      // The cost to place the lay bet if it loses is `stake * (finalOdd - 1)` (liability).
      // The amount received if it wins is `stake`.
      // Let's use the formula: `1 / Odd_Back`.
      // For a lay bet with odd `O_lay`, its equivalent back odd `O_back = O_lay / (O_lay - 1)`.
      // So, its probability contribution is `1 / O_back = (O_lay - 1) / O_lay`.
      // Now, apply commission:
      // If we win, we get `stake * (1 - commissionRate)`.
      // If we lose, we pay `stake * (O_lay - 1)`.
      // The contribution to the sum of probabilities should be adjusted for the commission.
      // A common way to handle commission on lay bets in arbitrage is to effectively increase the lay odd.
      // Effective Lay Odd = 1 + (LayOdd - 1) / (1 - commissionRate)
      // No, this is for calculating returns. For probability sum:
      // The percentage for a lay bet `P_lay = (Odd_lay - 1) / Odd_lay`.
      // The commission reduces the profit. So, `P_effective = P_lay / (1 - commissionRate)`.
      // Let's stick to the common arbitrage formula `1/odd`.
      // For lay bets, if we convert `LayOdd` to `BackOddEquivalent = LayOdd / (LayOdd - 1)`.
      // Then the probability is `1 / BackOddEquivalent = (LayOdd - 1) / LayOdd`.
      // If there's commission, our *effective* return is lower.
      // The standard way to incorporate commission on lay bets into arbitrage calculation
      // is to adjust the lay odds upwards.
      // If you lay at odds O, and win, you get the backer's stake.
      // But you pay commission on your winnings (the backer's stake).
      // So if you win the lay bet, you get stake * (1 - commissionRate).
      // This means the effective odds you got were higher.
      // Effective Lay Odds = O / (1 - commissionRate)
      const adjustedLayOdd = finalOdd / (1 - commissionRate)
      return (adjustedLayOdd - 1) / adjustedLayOdd // P_lay = (O-1)/O
    } else if (bm.freebet) {
      // For freebets, the effective odd is (odd - 1) because the stake is not returned.
      // So the probability contribution is 1 / (odd - 1).
      return finalOdd > 1 ? 1 / (finalOdd - 1) : 0 // Handle odds <= 1 for freebets
    } else {
      // For normal back bets
      return 1 / finalOdd
    }
  })

  const totalProb = effectiveProbabilities.reduce((sum, prob) => sum + prob, 0)

  if (totalProb === 0) return bookmakers.map(() => 0) // Avoid division by zero

  // Calculate initial stakes based on probabilities to achieve equal returns
  // For each outcome, stake_i = (1/Odd_i) / sum(1/Odd_j) * TotalInvestment
  const initialStakes = bookmakers.map((bm, index) => {
    const finalOdd = safeParseFloat(bm.finalOdd)
    if (finalOdd <= 0) return 0

    if (bm.isLayBet) {
      // For lay bets, stake is the amount to lay.
      // If you lay Stake_L at Odd_L, your liability is Stake_L * (Odd_L - 1).
      // Your payout if lay wins is Stake_L.
      // We want to make sure the profit from laying matches the profit from other back bets.
      // The "stake" for a lay bet is the backer's stake you accept.
      // The contribution to the total investment for a lay bet is its liability.
      const commissionRate = safeParseFloat(bm.commissionRate) / 100
      // In a balanced arbitrage, expected return from each leg is the same.
      // Let R be the common return.
      // For a back bet: Stake_B * Odd_B = R => Stake_B = R / Odd_B
      // For a lay bet: If it wins, we get Stake_L * (1 - commissionRate) = R => Stake_L = R / (1 - commissionRate)
      // If it loses, we pay Stake_L * (Odd_L - 1) (liability).
      // The total investment considers all back stakes and lay liabilities.
      // A common approach for distributing stakes with a target investment:
      // Stake_i = (TargetInvestment * (1/Odd_i)) / Sum( (1/Odd_j) for back bets + (1 / (EffectiveLayOdd_j)) for lay bets)
      // EffectiveLayOdd_j = LayOdd_j / (1 - commissionRate_j) for payout calculation
      // For stake distribution: Stake_i = TargetInvestment * (Probability_i / TotalArbitragePercentage)
      // Prob_i = 1/Odd_i for back; (Odd_L-1)/Odd_L for lay (without commission)
      // To factor in commission for lay: (Odd_L-1) / (Odd_L * (1 - commissionRate)) for probability.
      // Or (TargetInvestment * P_i) / sum(P_j)
      // Let's use the effective probabilities calculated earlier.
      return (targetInvestment * effectiveProbabilities[index]) / totalProb
    } else if (bm.freebet) {
      // For freebets, the stake * (odd - 1) needs to yield the desired profit.
      // The stake itself is the "investment" for arbitrage calculation.
      // P = 1 / (Odd - 1)
      return (targetInvestment * effectiveProbabilities[index]) / totalProb
    } else {
      // For normal back bets
      // P = 1 / Odd
      return (targetInvestment * effectiveProbabilities[index]) / totalProb
    }
  })

  // Now we need to adjust these stakes so that the actual investment equals targetInvestment
  // Calculate what the actual investment would be with these initial stakes
  let actualInvestment = 0
  initialStakes.forEach((stake, index) => {
    const bm = bookmakers[index]
    const finalOdd = safeParseFloat(bm.finalOdd)
    if (finalOdd <= 0) return // Skip if odd is invalid

    if (bm.isLayBet) {
      // For lay bets, investment is the liability
      actualInvestment += stake * (finalOdd - 1)
    } else {
      // For back bets, investment is the stake
      actualInvestment += stake
    }
  })

  if (actualInvestment === 0) return bookmakers.map(() => 0) // Avoid division by zero

  // Scale the stakes to match the target investment
  const scaleFactor = targetInvestment / actualInvestment
  const adjustedStakes = initialStakes.map((stake) => stake * scaleFactor)

  return adjustedStakes.map((stake) => Math.round((stake || 0) * 100) / 100)
}

// Function to distribute stakes based on a fixed stake, considering freebets and lay bets
// This function seems to be an alternative to `distributeStakesWithFixedAndManual` or a previous version.
// I'll keep it separate for now as it was in your original code, but note potential redundancy.
function distributeStakesWithLayAndFreebets(
  bookmakers: Bookmaker[],
  convertedOdds: number[],
  fixedIndex: number,
  fixedStake: number
): number[] {
  // Safety checks
  if (
    !convertedOdds ||
    convertedOdds.length === 0 ||
    fixedIndex < 0 ||
    fixedIndex >= convertedOdds.length ||
    fixedStake <= 0
  ) {
    return convertedOdds.map(() => 0)
  }

  // Ensure all odds are valid
  if (convertedOdds.some((odd) => odd <= 0 || isNaN(odd))) {
    return convertedOdds.map(() => 0)
  }

  // Calculate the effective return for the fixed stake
  const fixedBookmaker = bookmakers[fixedIndex]
  const fixedOdd = convertedOdds[fixedIndex] // This is already converted if lay
  let fixedReturn: number

  if (fixedBookmaker.isLayBet) {
    // For lay bets, consider commission on the backer's stake (which is fixedStake)
    const commissionRate = safeParseFloat(fixedBookmaker.commissionRate) / 100
    // If the lay bet wins, we receive fixedStake, and commission applies.
    // So our net receipt is fixedStake * (1 - commissionRate).
    fixedReturn = fixedStake * (1 - commissionRate)
  } else if (fixedBookmaker.freebet) {
    // For freebets, return is only the profit
    fixedReturn = fixedStake * (fixedOdd - 1)
  } else {
    // For normal bets, return includes the stake back
    fixedReturn = fixedStake * fixedOdd
  }

  // Calculate stakes for all other outcomes to match the fixed return
  return bookmakers.map((bm, index) => {
    if (index === fixedIndex) {
      return fixedStake
    } else {
      const odd = convertedOdds[index] // Already converted if lay
      let requiredStake: number

      if (odd <= 0) return 0 // Avoid division by zero

      if (bm.isLayBet) {
        // For lay bets: required stake S, such that if it wins, we get S * (1 - commissionRate) = fixedReturn
        const commissionRate = safeParseFloat(bm.commissionRate) / 100
        requiredStake = (1 - commissionRate) > 0 ? fixedReturn / (1 - commissionRate) : 0
      } else if (bm.freebet) {
        // For freebets, we need: stake * (odd - 1) = fixedReturn
        requiredStake = odd > 1 ? fixedReturn / (odd - 1) : 0
      } else {
        // For normal bets, we need: stake * odd = fixedReturn
        requiredStake = fixedReturn / odd
      }

      // Round to 2 decimal places
      return isNaN(requiredStake) ? 0 : Math.round(requiredStake * 100) / 100
    }
  })
}

// Function to distribute stakes based on a fixed stake (legacy function for backward compatibility)
export function distributeStakes(odds: number[], fixedIndex: number, fixedStake: number): number[] {
  // Safety checks
  if (!odds || odds.length === 0 || fixedIndex < 0 || fixedIndex >= odds.length || fixedStake <= 0) {
    return odds.map(() => 0)
  }

  // Ensure all odds are valid
  if (odds.some((odd) => odd <= 0 || isNaN(odd))) {
    return odds.map(() => 0)
  }

  // Calculate the implied probability for the fixed stake
  const impliedProbability = 1 / odds[fixedIndex]

  // Calculate the ratio of the fixed stake to its implied probability
  const ratio = fixedStake / impliedProbability

  // Calculate stakes for all outcomes based on this ratio
  return odds.map((odd, index) => {
    if (index === fixedIndex) {
      return fixedStake
    } else {
      if (odd <= 0) return 0 // Avoid division by zero
      const stake = (1 / odd) * ratio
      // Round to 2 decimal places
      return isNaN(stake) ? 0 : Math.round(stake * 100) / 100
    }
  })
}
export function calculateArbitrage(bookmakers: Bookmaker[]) {
  // Extract final odds with safety checks and convert lay odds
  const odds = bookmakers.map((bm: Bookmaker): number => {
    const finalOdd = safeParseFloat(bm.finalOdd)
    if (finalOdd <= 0) return 0

    return bm.isLayBet ? convertLayToBack(finalOdd) : finalOdd
  })

  // Ensure all odds are valid before calculating
  if (odds.some((odd) => odd <= 0)) {
    return {
      arbitragePercentage: 0,
      isArbitrage: false,
      totalInvestment: 0,
      distributedStakes: [],
      returns: [],
      profit: 0,
      profitPercentage: 0,
    }
  }

  // Calculate arbitrage percentage considering freebets, lay bets and commission
  const adjustedProbabilities = bookmakers.map((bm, index) => {
    const odd = odds[index] // Already converted if lay bet

    if (odd <= 0) return 0 // Safeguard against invalid odds after conversion

    if (bm.isLayBet) {
      // For lay bets, we need to account for commission reducing our effective return
      // The probability for arbitrage sum should reflect the true cost/return.
      // If you win a lay bet, you get the backer's stake, reduced by commission.
      // So, if backer's stake is S, you net S * (1 - commissionRate).
      // This means the effective odds you got were S / (S * (1 - commissionRate)) = 1 / (1 - commissionRate)
      // The initial odd was O_lay. So the effective LayOdd = O_lay / (1 - commissionRate).
      // The probability for arbitrage sum then becomes (EffectiveLayOdd - 1) / EffectiveLayOdd
      const commissionRate = safeParseFloat(bm.commissionRate) / 100
      const effectiveLayOdd = odd / (1 - commissionRate) // This `odd` is already `layValue / (layValue - 1)` from `convertLayToBack`
      return (effectiveLayOdd - 1) / effectiveLayOdd
    } else if (bm.freebet) {
      // For freebets, the effective odd is (odd - 1) since we don't get the stake back
      return odd > 1 ? 1 / (odd - 1) : 0 // Probability is 1 / (profit_odd)
    } else {
      // For normal back bets
      return 1 / odd
    }
  })

  const arbitragePercentage = adjustedProbabilities.reduce((sum, prob) => sum + prob, 0) * 100

  // Check if this is an arbitrage opportunity
  const isArbitrage = arbitragePercentage < 100

  // Find if there's a fixed stake
  const fixedBookmakerIndex = bookmakers.findIndex((bm) => bm.isStakeFixed)

  let totalInvestment = 0
  let distributedStakes: number[] = []

  if (fixedBookmakerIndex >= 0) {
    // If there's a fixed stake, calculate distribution based on it
    const fixedStake = safeParseFloat(bookmakers[fixedBookmakerIndex].stake)
    if (fixedStake > 0) {
      // LOGIC: Consider manual stakes even with a fixed house
      distributedStakes = distributeStakesWithFixedAndManual(
        bookmakers,
        fixedBookmakerIndex,
        fixedStake
      )

      // Calculate total investment - only liability for lay bets
      totalInvestment = distributedStakes.reduce((sum, stake, index) => {
        const bm = bookmakers[index]
        if (bm.isLayBet) {
          // For lay bets, investment is ONLY the liability (responsibility)
          const layOdd = safeParseFloat(bm.finalOdd)
          const liability = stake * (layOdd - 1)
          return sum + liability
        } else {
          // For back bets, investment is the stake
          return sum + stake
        }
      }, 0)

      // Round total investment
      totalInvestment = Math.round(totalInvestment * 100) / 100
    }
  } else {
    // Check if there are manual stakes
    const hasManualStakes = bookmakers.some(
  (bm) => typeof bm.manualStake === 'number' && !isNaN(bm.manualStake)
)

    if (hasManualStakes) {
      // Use manual stakes where available, calculate others (this logic needs refinement if not all are manual)
      // Assuming if hasManualStakes is true, we should use *only* manual stakes for the total investment
      // and not attempt to calculate others to balance unless a specific "fill-in" logic is required.
      // For simplicity, if manual stakes exist, we assume they are the final stakes.
      distributedStakes = bookmakers.map((bm) =>
        safeParseFloat(bm.manualStake)
      )

      // Calculate total investment with manual stakes
      totalInvestment = distributedStakes.reduce((sum, stake, index) => {
        const bm = bookmakers[index]
        const finalOdd = safeParseFloat(bm.finalOdd)
        if (bm.isLayBet) {
          const liability = stake * (finalOdd - 1)
          return sum + liability
        } else {
          return sum + stake
        }
      }, 0)
    } else {
      // Default calculation when no stake is fixed and no manual stakes
      totalInvestment = 100 // Default target investment for calculation

      // Calculate stakes with new lay logic
      distributedStakes = calculateStakesWithNewLayLogic(bookmakers, totalInvestment)

      // Recalculate total investment based on calculated distributed stakes
      totalInvestment = distributedStakes.reduce((sum, stake, index) => {
        const bm = bookmakers[index]
        const finalOdd = safeParseFloat(bm.finalOdd)
        if (bm.isLayBet) {
          // For lay bets, investment is ONLY the liability
          const liability = stake * (finalOdd - 1)
          return sum + liability
        } else {
          // For back bets, investment is the stake
          return sum + stake
        }
      }, 0)
    }

    totalInvestment = Math.round(totalInvestment * 100) / 100
  }

  // Calculate net result for each scenario
  const returns = bookmakers.map((_, winningIndex) => {
    let totalReturn = 0
    let totalOutlay = 0 // Sum of all stakes/liabilities for non-winning outcomes

    bookmakers.forEach((bm, index) => {
      const stake = distributedStakes[index] || 0
      const finalOdd = safeParseFloat(bm.finalOdd)

      if (index === winningIndex) {
        // This bookmaker wins
        if (bm.isLayBet) {
          // Lay wins: we receive the backer's stake (distributedStake)
          // The commission is on the winnings (backer's stake).
          const commissionRate = safeParseFloat(bm.commissionRate) / 100
          const grossProfit = stake // The stake placed by the backer, which we win
          const commission = grossProfit * commissionRate
          totalReturn += grossProfit - commission // Net winnings from the lay bet
        } else if (bm.freebet) {
          // Freebet wins: we receive only the profit (stake * (odd - 1))
          totalReturn += stake * (finalOdd - 1)
        } else {
          // Normal back wins: we receive stake × odd
          totalReturn += stake * finalOdd
        }
      } else {
        // This bookmaker loses (or the opposite outcome wins)
        if (bm.isLayBet) {
          // Lay loses: we pay the liability
          totalOutlay += stake * (finalOdd - 1)
        } else {
          // Back loses: we lose the stake
          totalOutlay += stake
        }
      }
    })

    // Calculate the profit by subtracting total investment (outlays for losing bets)
    // The `totalReturn` is the payout from the winning bet.
    // The profit is this payout MINUS all the stakes/liabilities from the losing bets.
    const profit = totalReturn - totalOutlay
    return isNaN(profit) ? 0 : Math.round(profit * 100) / 100
  })

  // Calculate absolute profit - In a perfect arbitrage, all returns should be equal.
  // The profit is the consistent result across all scenarios.
  // We can just take the first return as a representative profit, or min return for safety.
  let profit = 0
  if (returns.length > 0) {
    profit = Math.min(...returns) // In a true arbitrage, all returns should be very close. Use min for conservative profit.
  }

  // Round profit to 2 decimal places
  profit = Math.round(profit * 100) / 100

  // Calculate profit percentage based on total investment
  const profitPercentage = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0

  return {
    arbitragePercentage: isNaN(arbitragePercentage) ? 0 : Math.round(arbitragePercentage * 100) / 100,
    isArbitrage,
    totalInvestment: isNaN(totalInvestment) ? 0 : totalInvestment,
    distributedStakes: distributedStakes.map((stake) => (isNaN(stake) ? 0 : Math.round(stake * 100) / 100)), // Ensure stakes are rounded
    returns: returns.map((ret) => (isNaN(ret) ? 0 : ret)),
    profit: isNaN(profit) ? 0 : profit,
    profitPercentage: isNaN(profitPercentage) ? 0 : Math.round(profitPercentage * 100) / 100,
  }
}