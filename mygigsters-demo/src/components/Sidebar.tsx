import { NavLink } from 'react-router-dom'
import { Settings2, Users } from 'lucide-react'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/15'
      : 'text-gray-700 hover:bg-gray-50'
  }`

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-100 bg-white/70 backdrop-blur p-4 md:block">
      <div className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
        Admin
      </div>
      <nav className="space-y-1">
        <NavLink to="/admin/rules" className={linkCls}>
          <Settings2 className="h-4 w-4" /> Rules
        </NavLink>
        <NavLink to="/admin/users-logs" className={linkCls}>
          <Users className="h-4 w-4" /> Users & Logs
        </NavLink>
        <div className="mt-6 border-t pt-3 text-xs text-gray-500">
          Use top role switch to return to Worker
        </div>
      </nav>
    </aside>
  )
}
