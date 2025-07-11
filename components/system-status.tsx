"use client"

import { useState, useEffect } from "react"

export function SystemStatus() {
  const [status, setStatus] = useState({
    online: true,
    calculations: 0,
    lastUpdate: new Date().toLocaleTimeString("pt-BR"),
  })

  useEffect(() => {
    // Simular atualizações de status
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        calculations: prev.calculations + Math.floor(Math.random() * 3),
        lastUpdate: new Date().toLocaleTimeString("pt-BR"),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status.online ? "bg-green-400" : "bg-red-400"}`}></div>
        <span>Status: {status.online ? "Online" : "Offline"}</span>
      </div>
      <div>Cálculos: {status.calculations}</div>
      <div>Última atualização: {status.lastUpdate}</div>
    </div>
  )
}
