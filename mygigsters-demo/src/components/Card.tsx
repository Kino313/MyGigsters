import type { ReactNode } from 'react'
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-gray-100 transition-shadow hover:shadow-md ${className}`}>{children}</div>
  )
}
