'use client'

interface Segment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: Segment[]
  title: string
  onSegmentClick?: (label: string) => void
}

export default function DonutChart({ segments, title, onSegmentClick }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  const size = 160
  const center = size / 2
  const radius = 60
  const strokeWidth = 20
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const arcs = segments.map(seg => {
    const pct = seg.value / total
    const dashLen = pct * circumference
    const dashOffset = -offset
    offset += dashLen
    return { ...seg, dashLen, dashOffset, pct }
  })

  return (
    <div className="panel p-4 space-y-3">
      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-tertiary">{title}</h4>
      <div className="flex items-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dashLen} ${circumference - arc.dashLen}`}
              strokeDashoffset={arc.dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
              className={`transition-all duration-300 ${onSegmentClick ? 'cursor-pointer hover:opacity-75' : ''}`}
              onClick={onSegmentClick ? () => onSegmentClick(arc.label) : undefined}
            />
          ))}
          <text x={center} y={center - 6} textAnchor="middle" className="fill-text-primary text-lg font-mono font-bold">{total}</text>
          <text x={center} y={center + 12} textAnchor="middle" className="fill-text-tertiary text-[10px] font-mono uppercase">total</text>
        </svg>
        <div className="space-y-1.5 min-w-0">
          {arcs.map((arc, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 ${onSegmentClick ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
              onClick={onSegmentClick ? () => onSegmentClick(arc.label) : undefined}
            >
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: arc.color }} />
              <span className="text-xs text-text-secondary truncate capitalize">{arc.label}</span>
              <span className="text-xs font-mono text-text-primary ml-auto">{arc.value}</span>
              <span className="text-xs font-mono text-text-tertiary w-10 text-right">{Math.round(arc.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
