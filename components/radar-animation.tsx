"use client"

export function RadarAnimation({ className = "", size = 200, intensity = "normal" }) {
  const getOpacity = () => {
    switch (intensity) {
      case "high":
        return { base: 0.8, medium: 0.6, low: 0.4 }
      case "medium":
        return { base: 0.6, medium: 0.4, low: 0.3 }
      default:
        return { base: 0.4, medium: 0.3, low: 0.2 }
    }
  }

  const opacity = getOpacity()

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Radar Base - Estático */}
      <svg width={size} height={size} viewBox="0 0 200 200" className="absolute inset-0">
        {/* Círculos concêntricos do radar */}
        <circle cx="100" cy="100" r="90" fill="none" stroke={`rgba(34, 255, 136, ${opacity.base})`} strokeWidth="2" />
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={`rgba(34, 255, 136, ${opacity.base + 0.1})`}
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke={`rgba(34, 255, 136, ${opacity.base + 0.2})`}
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="100"
          r="30"
          fill="none"
          stroke={`rgba(34, 255, 136, ${opacity.base + 0.3})`}
          strokeWidth="2"
        />

        {/* Linhas de grade do radar */}
        <line x1="100" y1="10" x2="100" y2="190" stroke={`rgba(34, 255, 136, ${opacity.medium})`} strokeWidth="1.5" />
        <line x1="10" y1="100" x2="190" y2="100" stroke={`rgba(34, 255, 136, ${opacity.medium})`} strokeWidth="1.5" />

        {/* Linhas diagonais */}
        <line
          x1="35.8"
          y1="35.8"
          x2="164.2"
          y2="164.2"
          stroke={`rgba(34, 255, 136, ${opacity.low + 0.1})`}
          strokeWidth="1.5"
        />
        <line
          x1="164.2"
          y1="35.8"
          x2="35.8"
          y2="164.2"
          stroke={`rgba(34, 255, 136, ${opacity.low + 0.1})`}
          strokeWidth="1.5"
        />

        {/* Centro do radar */}
        <circle cx="100" cy="100" r="4" fill="rgba(34, 255, 136, 0.9)" />

        {/* Marcadores de horas como um relógio */}
        <circle cx="100" cy="20" r="2" fill={`rgba(34, 255, 136, ${opacity.medium})`} />
        <circle cx="180" cy="100" r="2" fill={`rgba(34, 255, 136, ${opacity.medium})`} />
        <circle cx="100" cy="180" r="2" fill={`rgba(34, 255, 136, ${opacity.medium})`} />
        <circle cx="20" cy="100" r="2" fill={`rgba(34, 255, 136, ${opacity.medium})`} />
      </svg>

      {/* Ponteiro estático */}
      <svg width={size} height={size} viewBox="0 0 200 200" className="absolute inset-0">
        <defs>
          <linearGradient id={`clockGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 255, 136, 0.2)" />
            <stop offset="70%" stopColor="rgba(34, 255, 136, 0.8)" />
            <stop offset="90%" stopColor="rgba(34, 255, 136, 1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 1)" />
          </linearGradient>
        </defs>

        {/* Ponteiro principal */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="15"
          stroke={`url(#clockGradient-${size})`}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Ponta do ponteiro */}
        <polygon points="100,15 95,25 105,25" fill="rgba(255, 255, 255, 0.9)" />

        {/* Base do ponteiro */}
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="rgba(34, 255, 136, 0.9)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
        />
      </svg>

      {/* Pontos de detecção estáticos */}
      <svg width={size} height={size} viewBox="0 0 200 200" className="absolute inset-0">
        {/* Alvo detectado 1 */}
        <g>
          <circle cx="130" cy="70" r="3" fill="rgba(255, 68, 68, 0.9)" />
          <circle cx="130" cy="70" r="6" fill="none" stroke="rgba(255, 68, 68, 0.6)" strokeWidth="2" />
          <circle cx="130" cy="70" r="10" fill="none" stroke="rgba(255, 68, 68, 0.3)" strokeWidth="1" />
        </g>

        {/* Alvo detectado 2 */}
        <g>
          <circle cx="80" cy="140" r="3" fill="rgba(255, 68, 68, 0.9)" />
          <circle cx="80" cy="140" r="6" fill="none" stroke="rgba(255, 68, 68, 0.6)" strokeWidth="2" />
          <circle cx="80" cy="140" r="10" fill="none" stroke="rgba(255, 68, 68, 0.3)" strokeWidth="1" />
        </g>

        {/* Alvo detectado 3 */}
        <g>
          <circle cx="150" cy="120" r="3" fill="rgba(255, 68, 68, 0.9)" />
          <circle cx="150" cy="120" r="6" fill="none" stroke="rgba(255, 68, 68, 0.6)" strokeWidth="2" />
          <circle cx="150" cy="120" r="10" fill="none" stroke="rgba(255, 68, 68, 0.3)" strokeWidth="1" />
        </g>

        {/* Oportunidade de arbitragem detectada */}
        <g>
          <circle cx="60" cy="80" r="3" fill="rgba(34, 255, 136, 1)" />
          <circle cx="60" cy="80" r="6" fill="none" stroke="rgba(34, 255, 136, 0.8)" strokeWidth="2" />
          <circle cx="60" cy="80" r="10" fill="none" stroke="rgba(34, 255, 136, 0.4)" strokeWidth="1" />
        </g>

        {/* Mais alvos detectados */}
        <g>
          <circle cx="120" cy="160" r="3" fill="rgba(34, 255, 136, 1)" />
          <circle cx="120" cy="160" r="6" fill="none" stroke="rgba(34, 255, 136, 0.8)" strokeWidth="2" />
          <circle cx="120" cy="160" r="10" fill="none" stroke="rgba(34, 255, 136, 0.4)" strokeWidth="1" />
        </g>
      </svg>

      {/* Indicador de detecção ativa - estático */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        <div className="w-2 h-2 bg-logo-neon rounded-full"></div>
      </div>
    </div>
  )
}
