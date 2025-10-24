import { useId } from 'react'

export default function ProgressRing({ value, size = 128, stroke = 12 }: { value: number; size?: number; stroke?: number }) {
  const id = useId()
  const radius = (size - stroke) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const dash = (clamped / 100) * circumference

  return (
    <div style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        {/* progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* label */}
        <g>
          <text x={center} y={center + 4} textAnchor="middle" fontSize={18} fontWeight={700} fill="#111827">
            {Math.round(clamped)}%
          </text>
          <text x={center} y={center + 22} textAnchor="middle" fontSize={11} fill="#6b7280">
            to next level
          </text>
        </g>
      </svg>
    </div>
  )
}
