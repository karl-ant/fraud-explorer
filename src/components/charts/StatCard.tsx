'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
}

export default function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="panel p-4 space-y-2">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-terminal-400" />
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-tertiary">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-mono font-bold text-text-primary">{value}</span>
        {sub && <span className="text-xs text-text-tertiary">{sub}</span>}
      </div>
    </div>
  )
}
