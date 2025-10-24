import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import Card from '../components/Card'
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleSel, setRoleSel] = useState<'worker' | 'admin'>('worker')
  const { setRole } = useRole()
  const nav = useNavigate()

  const go = (r: 'worker' | 'admin') => {
    setRole(r)
    nav(r === 'worker' ? '/worker/dashboard' : '/admin/rules')
  }

  return (
    <div className="auth-shell">
      <div className="auth-container">
        <Card className="bg-white/95 p-6 sm:p-7 backdrop-blur">
          {/* Brand and tagline */}
          <div className="mb-4 text-center">
            <img src="/MyGigsters-.png" alt="MyGigsters" className="brand-logo" />
            <p className="mt-2 text-xs sm:text-sm text-gray-600">Sign in to MyGigsters Rewards Engine</p>
          </div>

          {/* Grouped form section */}
          <div className="auth-group">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Email</label>
                <div className="input-icon">
                  <Mail className="icon" />
                  <input
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Password</label>
                <div className="input-icon">
                  <Lock className="icon" />
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Segmented role toggle */}
              <div>
                <label className="mb-1 block text-sm text-gray-700">Role</label>
                <div className="seg-toggle">
                  {(['worker', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleSel(r)}
                      className={roleSel === r ? 'active' : ''}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Primary action */}
          <div className="mt-4 flex justify-center">
            <button onClick={() => go(roleSel)} className="btn-primary btn-mdw">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {/* Social sign-in (secondary) */}
          <div className="mt-4 auth-grid-2">
            <button onClick={() => go('worker')} className="btn-outline btn-sm w-full">
              <GoogleIcon />
              Google
            </button>
            <button onClick={() => go('worker')} className="btn-outline btn-sm w-full">
              <MicrosoftIcon />
              Microsoft
            </button>
          </div>

          {/* Demo actions (secondary) */}
          <div className="mt-3 auth-grid-2">
            <button onClick={() => go('worker')} className="btn-outline btn-sm">Demo Worker</button>
            <button onClick={() => go('admin')} className="btn-outline btn-sm">Demo Admin</button>
          </div>

          {/* Footer */}
          <div className="mt-5 auth-footer">Powered by Team 7UP • © 2025</div>
        </Card>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" className="mr-2">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.8-2.6-5.8-5.9s2.6-5.9 5.8-5.9c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.3 14.5 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c6.9 0 8.4-4.8 8.4-7.2 0-.5-.1-.8-.1-1.1H12z"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" className="mr-2">
      <rect width="10" height="10" x="2" y="2" fill="#F25022" />
      <rect width="10" height="10" x="12" y="2" fill="#7FBA00" />
      <rect width="10" height="10" x="2" y="12" fill="#00A4EF" />
      <rect width="10" height="10" x="12" y="12" fill="#FFB900" />
    </svg>
  )
}
