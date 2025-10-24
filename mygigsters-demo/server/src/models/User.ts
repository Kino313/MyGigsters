import { Schema, model, Types } from 'mongoose'

const MetricsSchema = new Schema({
  completed_orders_30d: { type: Number, default: 0 },
  on_time_rate: { type: Number, default: 0 },
  rating_avg_30d: { type: Number, default: 0 },
  incidents_30d: { type: Number, default: 0 }
}, { _id: false })

const UserSchema = new Schema({
  email: { type: String, unique: true, index: true },
  role: { type: String, enum: ['worker','admin'], default: 'worker' },
  name: String,
  level: { type: Number, default: 1 },
  points: { type: Number, default: 0 },
  metrics: { type: MetricsSchema, default: () => ({}) },
  lastBenefit: String
}, { timestamps: true })

export default model('User', UserSchema)