import type { ReactNode } from 'react'
export default function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: 'green' | 'red' | 'gray' | 'blue' }) {
  const map: Record<string, string> = {
    green: 'bg-green-50 text-green-700 ring-green-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
    gray: 'bg-gray-100 text-gray-700 ring-gray-500/10',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${map[tone]}`}>{children}</span>
  )
}