import User from '../models/User'
import Rule from '../models/Rule'
import Benefit from '../models/Benefit'
import AuditLog from '../models/AuditLog'

function cmp(a: number, op: string, b: number) {
  if (op === '≥') return a >= b
  if (op === '≤') return a <= b
  if (op === '=') return a === b
  return false
}

// 与 worker.ts 中保持一致：把 reward 转成展示字段
function formatReward(reward: any, fallbackName: string) {
  const type = reward?.type as ('insurance_discount'|'tax_consultation'|'early_pay_limit'|undefined)
  const value = reward?.value
  const durationDays = reward?.durationDays

  const title =
    type === 'insurance_discount' ? `Insurance Discount ${value ?? ''}%` :
    type === 'tax_consultation'   ? `Tax Consultation` :
    type === 'early_pay_limit'    ? `Early Pay Limit +$${value ?? ''}` :
    fallbackName

  const partner =
    type === 'insurance_discount' ? 'SafeCover' :
    type === 'tax_consultation'   ? 'Taxie' :
    type === 'early_pay_limit'    ? 'QuickPay' : ''

  const validity = durationDays ? `${durationDays} days` : ''

  return { title, partner, validity }
}

export async function evaluateUserByRules(userId: string) {
  const user = await User.findById(userId)
  if (!user) return

  const rules = await Rule.find({ status: true })
  const m = (user as any).metrics || {}

  for (const r of rules) {
    const conds = ((r as any)?.conditions ?? []).map((c: any) => {
      const v = Number(m?.[c?.metric] ?? 0)
      const target = Number(c?.val)
      return cmp(v, c?.op, target)
    })
    if (conds.length === 0) continue

    const ok = ((r as any)?.groupLogic === 'OR') ? conds.some(Boolean) : conds.every(Boolean)
    if (!ok) continue

    // 已有同源规则的有效福利就不重复发放（Unlocked/Claimed 都视为已发）
    const exists = await Benefit.findOne({
      userId: user._id,
      sourceRuleId: (r as any)._id,
      state: { $in: ['Unlocked', 'Claimed'] }
    })
    if (exists) continue

    // 生成展示字段
    const { title, partner, validity } = formatReward((r as any)?.reward, (r as any)?.name)

    // upsert（此处已前置 exists 判断；如果你想无条件 upsert，也可直接用 upsert:true）
    const b = await Benefit.create({
      userId: user._id,
      title,
      partner,
      validity,
      state: 'Unlocked',
      sourceRuleId: (r as any)._id
    })

    await AuditLog.create({
      actor: 'engine',
      action: 'benefit_issued',
      userName: (user as any)?.name ?? String(user._id),
      ruleName: (r as any)?.name,
      benefitTitle: title,
      details: 'Auto-issued on evaluation',
      time: new Date().toISOString().slice(0,16).replace('T',' ')
    })
  }
}

export async function recomputeAll() {
  const all = await User.find({ role: 'worker' }).select('_id')
  for (const u of all) {
    await evaluateUserByRules(String(u._id))
  }
  await AuditLog.create({
    actor: 'engine',
    action: 'recompute',
    userName: '-',
    ruleName: '-',
    benefitTitle: '-',
    details: 'Nightly recompute',
    time: new Date().toISOString().slice(0,16).replace('T',' ')
  })
}