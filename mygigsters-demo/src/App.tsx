import { useLocation } from 'react-router-dom'
import { AppRoutes } from './router'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isWorker = pathname.startsWith('/worker')
  const isLogin = pathname === '/'

  return (
    <div className="min-h-screen">
      {!isLogin && <TopNav />}
      <div className="flex">
        {isAdmin && <Sidebar />}
        <main className={`w-full ${isAdmin ? 'pl-0 md:pl-64' : ''}`}>
          <div className={`mx-auto ${isWorker ? 'max-w-4xl' : 'max-w-7xl'} p-4 sm:p-6 lg:p-8`}>
            <AppRoutes />
          </div>
        </main>
      </div>
    </div>
  )
}
