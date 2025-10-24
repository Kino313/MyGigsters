import { Schema, model, Types } from 'mongoose'

const ActivitySchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', index: true },
  date: String, // YYYY-MM-DD
  type: { type: String, enum: ['order','shift','delivery'] },
  onTime: Boolean,
  rating: Number,
  distanceKm: Number,
  incidents: Number
}, { timestamps: true })

export default model('Activity', ActivitySchema)