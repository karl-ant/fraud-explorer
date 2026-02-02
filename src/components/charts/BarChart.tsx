'use client'

interface Bar {
  label: string
  value: number
  color: string
}

interface BarChartProps {
  bars: Bar[]
  title: string
  formatValue?: (v: number) => string
}

export default function BarChart({ bars, title, formatValue = String }: BarChartProps) {
  if (bars.length === 0) return null

  const max = Math.max(...bars.map(b => b.value), 1)
  const chartHeight = 180
  const barWidth = Math.min(40, Math.max(12, Math.floor(600 / bars.length) - 8))
  const gap = 4
  const totalWidth = bars.length * (barWidth + gap) - gap
  const padding = { left: 50, right: 16, top: 16, bottom: 40 }
  const svgWidth = totalWidth + padding.left + padding.right
  const svgHeight = chartHeight + padding.top + padding.bottom

  // Y-axis ticks
  const ticks = 4
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i))

  return (
    <div className="panel p-4 space-y-3">
      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-tertiary">{title}</h4>
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="min-w-full">
          {/* Y-axis gridlines */}
          {tickValues.map((tv, i) => {
            const y = padding.top + chartHeight - (tv / max) * chartHeight
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="rgba(40,52,70,0.6)" strokeDasharray="3 3" />
                <text x={padding.left - 6} y={y + 4} textAnchor="end" className="fill-text-tertiary text-[9px] font-mono">
                  {formatValue(tv)}
                </text>
              </g>
            )
          })}

          {/* Bars */}
          {bars.map((bar, i) => {
            const barHeight = (bar.value / max) * chartHeight
            const x = padding.left + i * (barWidth + gap)
            const y = padding.top + chartHeight - barHeight
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={bar.color}
                  rx={2}
                  className="transition-all duration-300"
                />
                {/* Label */}
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 14}
                  textAnchor="middle"
                  className="fill-text-tertiary text-[8px] font-mono"
                  transform={bars.length > 14 ? `rotate(-45, ${x + barWidth / 2}, ${padding.top + chartHeight + 14})` : undefined}
                >
                  {bar.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
