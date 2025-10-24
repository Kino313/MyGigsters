import { Router } from 'express'
import Rule from '../models/Rule'
import User from '../models/User'
import AuditLog from '../models/AuditLog'
import { recomputeAll } from '../services/evaluator'

const r = Router()

/** 小工具：把任何值安全地转成 number（无效时为 0） */
const toNum = (x: unknown, fallback = 0): number => {
  const n = Number(x)
  return Number.isFinite(n) ? n : fallback
}

/** 小工具：小写字符串，空时给默认空串 */
const toLower = (s: unknown): string => (typeof s === 'string' ? s.toLowerCase() : '')

/** 小工具：安全读取对象的键（metric 可能为 null/undefined/非字符串） */
const safeGet = (obj: unknown, key: unknown): unknown => {
  if (!obj || typeof obj !== 'object') return undefined
  if (typeof key !== 'string' && typeof key !== 'number') return undefined
  return key in obj ? (obj as Record<string | number, unknown>)[key] : undefined
}

/** 从 rule.reward 构造一个可展示的标题（reward 没有 title 字段时使用） */
const rewardToTitle = (rule: any): string => {
  const r = (rule as any)?.reward ?? {}
  const type = r?.type as string | undefined
  const value = r?.value as string | undefined
  const days = r?.durationDays as number | undefined

  // 根据你的枚举：'insurance_discount' | 'tax_consultation' | 'early_pay_limit'
  if (type === 'insurance_discount') {
    return `Insurance discount ${value ?? ''}`.trim()
  }
  if (type === 'tax_consultation') {
    return `Tax consultation ${value ?? ''}`.trim()
  }
  if (type === 'early_pay_limit') {
    return `Early pay limit ${value ?? ''}`.trim()
  }
  // 泛化：如果有 value / days 也拼一下
  if (value || days) {
    return `${String(type ?? 'Benefit')} ${value ?? ''} ${days ? `(${days} days)` : ''}`.trim()
  }
  // 兜底用规则名
  return (rule as any)?.name ?? 'Benefit'
}

r.get('/rules', async (_req, res) => {
  const rules = await Rule.find().sort({ updatedAt: -1 })
  res.json(rules)
})

r.post('/rules', async (req, res) => {
  const { name, conditions, groupLogic, reward } = req.body || {}
  const rule = await Rule.create({
    name,
    conditions: Array.isArray(conditions) ? conditions : [],
    groupLogic: groupLogic === 'OR' ? 'OR' : 'AND',
    reward,
    status: true,
    updatedAt: new Date(), // <- 用 Date，避免类型错误
  })
  await AuditLog.create({
    actor: 'admin',
    action: 'rule_updated',
    userName: '-',
    ruleName: rule.name,
    benefitTitle: '-',
    details: 'Created rule',
    time: new Date().toISOString().slice(0, 16).replace('T', ' '),
  })
  res.json(rule)
})

// 预览：基于当前 Demo 用户 metrics，是否会命中
r.post('/rules/:id/preview', async (req, res) => {
  const rule = await Rule.findById(req.params.id)
  if (!rule) return res.status(404).json({ error: 'rule not found' })

  const all = await User.find({ role: 'worker' })

  const hits = all
    .filter((u) => {
      const m = (u as any)?.metrics
      const ruleConds = (rule as any)?.conditions as Array<any> | undefined
      if (!Array.isArray(ruleConds) || ruleConds.length === 0) return false

      const conds = ruleConds.map((c) => {
        const metric = c?.metric
        const v = toNum(safeGet(m, metric), 0)
        const t = toNum(c?.val, 0)
        const op = c?.op

        if (op === '≥') return v >= t
        if (op === '≤') return v <= t
        if (op === '=') return v === t
        return false
      })

      const logic = (rule as any)?.groupLogic === 'OR' ? 'OR' : 'AND'
      return logic === 'AND' ? conds.every(Boolean) : conds.some(Boolean)
    })
    .map((u) => ({
      id: u._id,
      name: (u as any)?.name ?? '(no name)',
      completed30d: (u as any)?.metrics?.completed_orders_30d ?? 0,
      onTimeRate: (u as any)?.metrics?.on_time_rate ?? 0,
    }))

  res.json({ count: hits.length, users: hits })
})

r.get('/users', async (req, res) => {
  const q = toLower(req.query.q || '')
  const all = await User.find({ role: 'worker' }).limit(200)
  const filtered = all.filter((u) => toLower((u as any)?.name ?? '').includes(q))
  res.json(filtered)
})

r.get('/logs', async (req, res) => {
  const { from, to, action } = req.query
  const q: any = {}
  if (action && action !== 'all') q.action = action
  if (from || to) q.time = {}
  if (from) q.time.$gte = String(from)
  if (to) q.time.$lte = String(to)
  const items = await AuditLog.find(q).sort({ createdAt: -1 }).limit(200)
  res.json(items)
})

// 切换/设置规则状态：PATCH /api/admin/rules/:id/status
r.patch('/rules/:id/status', async (req, res) => {
  const rule = await Rule.findById(req.params.id)
  if (!rule) return res.status(404).json({ error: 'rule not found' })

  const next = typeof req.body?.status === 'boolean' ? req.body.status : !rule.status
  rule.status = next
  rule.updatedAt = new Date() // <- 用 Date
  await rule.save()

  await AuditLog.create({
    actor: 'admin',
    action: 'rule_updated',
    userName: '-',
    ruleName: rule.name,
    benefitTitle: '-',
    details: next ? 'Enabled rule' : 'Disabled rule',
    time: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  await recomputeAll()  
  res.json({ ok: true, status: rule.status })
})

r.post('/recompute', async (_req, res) => {
  await recomputeAll()
  res.json({ ok: true })
})

export default r