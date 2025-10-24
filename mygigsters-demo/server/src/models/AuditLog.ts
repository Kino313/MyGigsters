import { Schema, model } from 'mongoose'

const AuditLogSchema = new Schema({
  actor: { type: String, enum: ['engine','admin'] },
  action: { type: String, enum: ['benefit_issued','rule_updated','recompute'] },
  userName: String,
  ruleName: String,
  benefitTitle: String,
  details: String,
  time: String // 'YYYY-MM-DD HH:mm'
}, { timestamps: true })

export default model('AuditLog', AuditLogSchema)