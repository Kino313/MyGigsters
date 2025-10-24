import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { ShieldCheck, UserCog } from 'lucide-react'

export default function TopNav() {
  const { role, setRole } = useRole()
  const nav = useNavigate()

  const switchRole = (r: 'worker' | 'admin') => {
    setRole(r)
    nav(r === 'worker' ? '/worker/dashboard' : '/admin/rules')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">MyGigsters Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Role: <b className="capitalize">{role}</b>
          </span>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => switchRole('worker')}
              className={role === 'worker' ? 'btn-primary' : 'btn-outline'}
            >
              Worker
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={role === 'admin' ? 'btn-primary' : 'btn-outline'}
            >
              <UserCog className="inline h-4 w-4" /> Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
