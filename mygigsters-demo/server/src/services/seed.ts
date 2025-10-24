import 'dotenv/config'
import { connectDB } from '../config/db'
import User from '../models/User'
import Activity from '../models/Activity'
import Rule from '../models/Rule'
import Benefit from '../models/Benefit'
import AuditLog from '../models/AuditLog'

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing')
  await connectDB(process.env.MONGO_URI)

  await Promise.all([User.deleteMany({}), Activity.deleteMany({}), Rule.deleteMany({}), Benefit.deleteMany({}), AuditLog.deleteMany({})])

  const user = await User.create({
    email: 'worker@demo.com',
    role: 'worker',
    name: 'Alex Chen',
    level: 2,
    points: 1870,
    metrics: { completed_orders_30d: 52, on_time_rate: 0.97, rating_avg_30d: 4.8, incidents_30d: 0 },
    lastBenefit: 'Insurance Discount 20%'
  })

  const rule = await Rule.create({
    name: 'Silver Insurance',
    conditions: [
      { metric: 'completed_orders_30d', op: '≥', val: '50' },
      { metric: 'on_time_rate', op: '≥', val: '0.95' }
    ],
    groupLogic: 'AND',
    reward: { type: 'insurance_discount', value: '20', durationDays: 30 },
    status: true,
    updatedAt: new Date().toISOString().slice(0,10)
  })

  console.log('[seed] done. userId=', user._id, 'ruleId=', rule._id)
  process.exit(0)
}

main()