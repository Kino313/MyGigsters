export type Role = 'worker' | 'admin'

export type Activity = {
  date: string
  type: 'order' | 'shift' | 'delivery'
  onTime: boolean
  rating: number
  distanceKm?: number
  incidents?: number
}

export type Benefit = {
  id: string
  title: string
  description: string
  partner: string
  validity: string
  state: 'Unlocked' | 'Claimed' | 'Expired' | 'AvailableSoon'
}

export type Rule = {
  id: string
  name: string
  condition: string // human-readable
  reward: string
  status: boolean
  updatedAt: string
}

export type UserRow = {
  id: string
  name: string
  level: number
  points: number
  completed30d: number
  onTimeRate: number
  lastBenefit?: string
}

export type AuditLog = {
  id: string
  time: string
  actor: 'engine' | 'admin'
  action: 'benefit_issued' | 'rule_updated' | 'recompute'
  user: string
  rule?: string
  benefit?: string
  details?: string
}