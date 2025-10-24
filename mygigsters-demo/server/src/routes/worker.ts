import { Router } from 'express'
import User from '../models/User'
import Activity from '../models/Activity'
import Benefit from '../models/Benefit'
import AuditLog from '../models/AuditLog'
import Rule from '../models/Rule'
import { evaluateUserByRules } from '../services/evaluator'

const r = Router()

// 用一个固定的 demo 用户（真实项目接 auth）
const DEMO_EMAIL = 'worker@demo.com'

/** ------- 辅助函数（availableSoon/命中判断/标题拼装） ------- */

// 判断规则是否命中（与 admin 预览逻辑一致）
const isHit = (metrics: any, rule: any) => {
  const conds = (rule?.conditions ?? []).map((c: any) => {
    const v = Number(metrics?.[c?.metric] ?? 0)
    const t = Number(c?.val)
    if (c?.op === '≥') return v >= t
    if (c?.op === '≤') return v <= t
    if (c?.op === '=') return v === t
    return false
  })
  const logic = rule?.groupLogic === 'OR' ? 'OR' : 'AND'
  return conds.length > 0 && (logic === 'AND' ? conds.every(Boolean) : conds.some(Boolean))
}

// 计算“差一点解锁”的缺口
const gapFor = (op: string, target: number, cur: number) => {
  if (op === '≥') return Math.max(0, target - cur)
  if (op === '≤') return Math.max(0, cur - target)
  if (op === '=') return cur === target ? 0 : 1
  return 0
}

// 从 rule.reward 生成可展示标题（当 reward 没有 title 属性时）
const rewardToTitle = (rule: any): string => {
  const r = (rule as any)?.reward ?? {}
  const type = r?.type as string | undefined
  const value = r?.value as string | undefined
  const days = r?.durationDays as number | undefined

  if (type === 'insurance_discount') return `Insurance discount ${value ?? ''}`.trim()
  if (type === 'tax_consultation') return `Tax consultation ${value ?? ''}`.trim()
  if (type === 'early_pay_limit') return `Early pay limit ${value ?? ''}`.trim()
  if (value || days) return `${String(type ?? 'Benefit')} ${value ?? ''} ${days ? `(${days} days)` : ''}`.trim()
  return (rule as any)?.name ?? 'Benefit'
}

/** ---------------------- 路由 ---------------------- */

r.get('/summary', async (_req, res) => {
  const user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) return res.status(404).json({ error: 'demo user not found' })
  // 计算“下一等级”
  const nextLevelAt = 2200
  const nextUnlock = { title: 'Insurance Discount 20%', note: 'Need 8 more orders' }
  res.json({
    points: user.points,
    level: user.level,
    nextLevelAt,
    kpis: {
      completed30d: user.metrics.completed_orders_30d,
      onTimeRate: user.metrics.on_time_rate,
      avgRating: user.metrics.rating_avg_30d,
      incidents: user.metrics.incidents_30d
    },
    nextUnlock
  })
})

r.get('/activities', async (req, res) => {
  const user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) return res.status(404).json({ error: 'demo user not found' })
  const { from, to, type } = req.query
  const q: any = { userId: user._id }
  if (from) q.date = { ...(q.date||{}), $gte: String(from) }
  if (to) q.date = { ...(q.date||{}), $lte: String(to) }
  if (type && type !== 'all') q.type = type
  const items = await Activity.find(q).sort({ date: -1 }).limit(200)
  res.json(items)
})

// 简化：仅支持 JSON 数组上传
r.post('/upload-activity', async (req, res) => {
  const user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) return res.status(404).json({ error: 'demo user not found' })

  // 读取 body 即为数组
  const data = Array.isArray(req.body) ? req.body : []
  if (!data.length) return res.status(400).json({ error: 'empty payload' })

  // 入库
  const mapped = data.map((a: any) => ({
    userId: user._id,
    date: a.date, type: a.type, onTime: !!a.onTime,
    rating: Number(a.rating || 0),
    distanceKm: Number(a.distanceKm || 0),
    incidents: Number(a.incidents || 0)
  }))
  await Activity.insertMany(mapped)

  // 更新用户 metrics（极简：最近60条）
  const last60 = await Activity.find({ userId: user._id }).sort({ date: -1 }).limit(60)
  const completed = last60.length
  const onTime = last60.filter(a => a.onTime).length
  const avgRating = last60.length ? (last60.reduce((s,a)=>s+(a.rating||0),0)/last60.length) : 0
  const incidents = last60.reduce((s,a)=>s+(a.incidents||0),0)

  user.metrics.completed_orders_30d = completed
  user.metrics.on_time_rate = last60.length ? onTime / last60.length : 0
  user.metrics.rating_avg_30d = Number(avgRating.toFixed(2))
  user.metrics.incidents_30d = incidents
  // 积分随便加一点，演示可见
  user.points = user.points + Math.min(50, completed)
  await user.save()

  await AuditLog.create({
    actor: 'engine',
    action: 'recompute',
    userName: user.name,
    ruleName: '-',
    benefitTitle: '-',
    details: `Uploaded ${mapped.length} activities and recomputed`,
    time: new Date().toISOString().slice(0,16).replace('T',' ')
  })

  // 评估规则 → 可能发福利（服务内需创建 Benefit）
  await evaluateUserByRules(String(user._id))

  res.json({ ok: true })
})

// 兼容旧接口：原样返回 Benefit 列表
r.get('/benefits', async (_req, res) => {
  const user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) return res.status(404).json({ error: 'demo user not found' })
  const items = await Benefit.find({ userId: user._id }).sort({ createdAt: -1 })
  res.json(items)
})

// 新增：汇总接口（前端用这个渲染 Unlocked + Available soon）
r.get('/benefits/summary', async (_req, res) => {
  const user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) return res.status(404).json({ error: 'demo user not found' })

  // 1) 已解锁（从 Benefit 集合里查）
  const unlockedRaw = await Benefit.find({ userId: user._id, state: 'Unlocked' })
    .sort({ createdAt: -1 })
    .lean()

  const unlocked = unlockedRaw.map(b => ({
    id: String(b._id),
    title: b.title,
    status: 'unlocked' as const,
    grantedAt: new Date(b.createdAt ?? Date.now()).toISOString().slice(0,16).replace('T',' ')
  }))

  // 2) 差一点解锁（从启用规则里计算 gap）
  const rules = await Rule.find({ status: true }).lean()
  const metrics = (user as any).metrics || {}

  const availableSoon = rules
    .filter(r => !isHit(metrics, r))
    .map(r => {
      const missing = (r?.conditions ?? [])
        .map((c: any) => {
          const cur = Number(metrics?.[c?.metric] ?? 0)
          const need = Number(c?.val)
          const gap = gapFor(c?.op, need, cur)
          return { metric: String(c?.metric), need, current: cur, gap, op: c?.op }
        })
        .filter(x => x.gap > 0)

      return {
        ruleId: String(r._id),
        title: rewardToTitle(r), // <- 不再访问 r.reward.title，避免类型错误
        missing
      }
    })
    .filter(x => x.missing.length > 0)

  res.json({ unlocked, availableSoon })
})

r.post('/benefits/:id/claim', async (req, res) => {
  const user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) return res.status(404).json({ error: 'demo user not found' })
  const b = await Benefit.findOneAndUpdate(
    { _id: req.params.id, userId: user._id },
    { state: 'Claimed' },
    { new: true }
  )
  if (!b) return res.status(404).json({ error: 'benefit not found' })
  await AuditLog.create({
    actor: 'engine',
    action: 'benefit_issued',
    userName: user.name,
    ruleName: '-',
    benefitTitle: b.title,
    details: 'manual claim',
    time: new Date().toISOString().slice(0,16).replace('T',' ')
  })
  res.json(b)
})

export default r