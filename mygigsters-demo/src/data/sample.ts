import type { Activity, Benefit, Rule, UserRow, AuditLog } from '../types'

export const workerSummary = {
  points: 1870,
  level: 2,
  nextLevelAt: 2200,
  kpis: {
    completed30d: 52,
    onTimeRate: 0.97,
    avgRating: 4.8,
    incidents: 0,
  },
  nextUnlock: {
    title: 'Insurance Discount 20%',
    note: 'Need 8 more orders',
  },
}

export const recentActivities: Activity[] = [
  { date: '2025-08-28', type: 'order', onTime: true, rating: 5, distanceKm: 12, incidents: 0 },
  { date: '2025-08-27', type: 'delivery', onTime: true, rating: 5, distanceKm: 6, incidents: 0 },
  { date: '2025-08-26', type: 'shift', onTime: true, rating: 4.7, incidents: 0 },
  { date: '2025-08-25', type: 'order', onTime: true, rating: 4.8, distanceKm: 9, incidents: 0 },
  { date: '2025-08-24', type: 'order', onTime: false, rating: 4.5, distanceKm: 4, incidents: 0 },
]

export const activities: Activity[] = [
  ...recentActivities,
  { date: '2025-08-23', type: 'order', onTime: true, rating: 4.9, distanceKm: 8, incidents: 0 },
  { date: '2025-08-22', type: 'shift', onTime: true, rating: 4.6, incidents: 0 },
]

export const benefits: Benefit[] = [
  { id: 'b1', title: 'Insurance Discount 20%', description: 'Save on partner insurance premiums for 30 days.', partner: 'SafeCover', validity: '30 days', state: 'Unlocked' },
  { id: 'b2', title: 'Tax Consultation', description: '30-minute tax consult for gig workers.', partner: 'Taxie', validity: '1 session', state: 'AvailableSoon' },
  { id: 'b3', title: 'Early Pay Limit +$200', description: 'Increase early pay limit.', partner: 'QuickPay', validity: '14 days', state: 'AvailableSoon' },
]

export const rules: Rule[] = [
  { id: 'r1', name: 'Silver Insurance', condition: 'completed_orders_30d ≥ 50 AND on_time_rate ≥ 0.95', reward: 'Insurance Discount 20% (30 days)', status: true, updatedAt: '2025-08-20' },
  { id: 'r2', name: 'Tax Helper', condition: 'rating_avg_30d ≥ 4.7', reward: 'Tax Consultation', status: false, updatedAt: '2025-08-18' },
]

export const users: UserRow[] = [
  { id: 'u1', name: 'Alex Chen', level: 2, points: 1870, completed30d: 52, onTimeRate: 0.97, lastBenefit: 'Insurance Discount 20%' },
  { id: 'u2', name: 'Priya Singh', level: 1, points: 940, completed30d: 28, onTimeRate: 0.92 },
  { id: 'u3', name: 'Tom Nguyen', level: 3, points: 2430, completed30d: 60, onTimeRate: 0.98, lastBenefit: 'Tax Consultation' },
]

export const logs: AuditLog[] = [
  { id: 'l1', time: '2025-08-27 10:12', actor: 'engine', action: 'benefit_issued', user: 'Alex Chen', rule: 'Silver Insurance', benefit: 'Insurance Discount 20%', details: 'Auto-issued on recompute' },
  { id: 'l2', time: '2025-08-26 16:02', actor: 'admin', action: 'rule_updated', user: '-', rule: 'Tax Helper', details: 'Status toggled OFF' },
  { id: 'l3', time: '2025-08-25 09:00', actor: 'engine', action: 'recompute', user: '-', details: 'Nightly recompute OK' },
]