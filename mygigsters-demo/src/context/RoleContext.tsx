import { createContext, useContext, useState } from 'react'
import type { Role } from '../types'
import type { ReactNode } from 'react'


const RoleCtx = createContext<{
  role: Role
  setRole: (r: Role) => void
}>({ role: 'worker', setRole: () => {} })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('worker')
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>
}

export const useRole = () => useContext(RoleCtx)