import { Schema, model, Types } from 'mongoose'

const BenefitSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', index: true },
  title: String,
  partner: String,
  validity: String,
  state: { type: String, enum: ['Unlocked','Claimed','Expired'], default: 'Unlocked' },
  sourceRuleId: { type: Types.ObjectId, ref: 'Rule' }
}, { timestamps: true })

export default model('Benefit', BenefitSchema)