"use client"

import { useEffect, useState } from "react"

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  })

  useEffect(() => {
    // Monitor de performance
    const startTime = performance.now()

    // Calcular tempo de carregamento
    window.addEventListener("load", () => {
      const loadTime = performance.now() - startTime
      setPerformanceData((prev) => ({ ...prev, loadTime }))
    })

    // Monitor de memória (se disponível)
    if ("memory" in performance) {
      const memory = (performance as any).memory
      setPerformanceData((prev) => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
      }))
    }

    // Monitor de renderização
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === "measure") {
          setPerformanceData((prev) => ({
            ...prev,
            renderTime: entry.duration,
          }))
        }
      })
    })

    observer.observe({ entryTypes: ["measure"] })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>Load: {performanceData.loadTime.toFixed(2)}ms</div>
      <div>Render: {performanceData.renderTime.toFixed(2)}ms</div>
      <div>Memory: {performanceData.memoryUsage.toFixed(2)}MB</div>
    </div>
  )
}
