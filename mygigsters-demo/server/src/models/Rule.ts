import { Schema, model, type InferSchemaType } from 'mongoose'

const ConditionSchema = new Schema(
  {
    metric: { type: String, required: true },
    op: { type: String, enum: ['≥', '≤', '='], required: true },
    val: { type: Number, required: true },
  },
  { _id: false }
)

const RewardSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['insurance_discount', 'tax_consultation', 'early_pay_limit'],
    },
    value: { type: String },
    durationDays: { type: Number },
  },
  { _id: false }
)

const RuleSchema = new Schema(
  {
    name: { type: String, required: true },
    conditions: { type: [ConditionSchema], default: [] },
    groupLogic: { type: String, enum: ['AND', 'OR'], default: 'AND' },
    reward: { type: RewardSchema, default: undefined },
    status: { type: Boolean, default: true },

    // ⚠️ 注意：不要在这里再手动声明 updatedAt/createdAt 为 string！
    // 如果你之前写过：
    // updatedAt: { type: String }   ← 请删除这行
  },
  {
    timestamps: true, // 让 Mongoose 自动维护 createdAt/updatedAt（类型为 Date）
  }
)

export type RuleDoc = InferSchemaType<typeof RuleSchema>
export default model('Rule', RuleSchema)