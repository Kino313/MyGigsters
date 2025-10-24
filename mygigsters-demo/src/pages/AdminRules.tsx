import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { api } from '../api/client'
import { useToast } from '../components/Toast'

export default function AdminRules() {
  const [rules, setRules] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUsers, setPreviewUsers] = useState<any[]>([])
  const toast = useToast()

  // editor state
  const [name, setName] = useState('')
  const [conditions, setConditions] = useState<{ metric: string; op: string; val: string }[]>([])
  const [groupLogic, setGroupLogic] = useState<'AND' | 'OR'>('AND')
  const [rewardType, setRewardType] =
    useState<'insurance_discount' | 'tax_consultation' | 'early_pay_limit'>('insurance_discount')
  const [rewardValue, setRewardValue] = useState('20')
  const [duration, setDuration] = useState('30')

  const load = () => api.admin.rules().then(setRules)
  useEffect(() => { load() }, [])

  const addCondition = () => setConditions((c) => [...c, { metric: 'completed_orders_30d', op: '≥', val: '50' }])
  const removeCondition = (i: number) => setConditions((c) => c.filter((_, idx) => idx !== i))

  const human = (r: any) => {
    if (!r.conditions?.length) return '(no conditions)'
    return r.conditions.map((c: any) => `${c.metric} ${c.op} ${c.val}`).join(` ${r.groupLogic} `)
  }

  const rewardHuman = (t: string, v: string, d: string) => {
    if (t === 'insurance_discount') return `Insurance Discount ${v}% for ${d} days`
    if (t === 'tax_consultation') return `Tax Consultation (${d} mins)`
    return `Early Pay Limit +$${v} for ${d} days`
  }

  const saveRule = async () => {
    await api.admin.createRule({
      name: name || 'New Rule',
      conditions,
      groupLogic,
      reward: { type: rewardType, value: rewardValue, durationDays: Number(duration) },
    })
    setOpen(false)
    setName(''); setConditions([])
    await load()
    toast.show('Rule created')
  }

  const doPreview = async (ruleId: string) => {
    const res = await api.admin.preview(ruleId)
    setPreviewUsers(res.users || [])
    setPreviewOpen(true)
  }


  const toggleStatus = async (r: any) => {
    await api.admin.toggleRuleStatus(r._id, !r.status)
    await load()
    toast.show(`Rule ${!r.status ? 'activated' : 'deactivated'}`)
  }

  const recompute = async () => {
    await api.admin.recompute()
    toast.show('Recomputed')
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rules</h2>
        <div className="flex gap-2">
          <button onClick={recompute} className="btn-outline">
            Recompute
          </button>
          <button onClick={() => setOpen(true)} className="btn-primary">
            New Rule
          </button>
        </div>
      </div>

      <Card className="overflow-x-auto p-4">
        <table className="table">
          <thead>
            <tr className="text-gray-500">
              <th className="py-2">Name</th>
              <th>Condition</th>
              <th>Reward</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r._id}>
                <td className="py-2">{r.name}</td>
                <td className="max-w-[380px] truncate">{human(r)}</td>
                <td>{rewardHuman(r.reward?.type, r.reward?.value, String(r.reward?.durationDays))}</td>
                <td>
                  <button
                  onClick={() => toggleStatus(r)}
                  className={`chip ${
                    r.status
                      ? 'bg-green-50 text-green-700 ring-green-600/20'
                      : 'bg-gray-100 text-gray-700 ring-gray-300'
                  }`}
                >
                  {r.status ? 'Active' : 'Off'}
                </button>
                </td>
                <td>{r.updatedAt}</td>
                <td>
                  <button onClick={() => doPreview(r._id)} className="btn-outline">
                    Preview impacted
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rules.length && <div className="py-10 text-center text-gray-500">No rules yet.</div>}
      </Card>

      {/* Rule Editor */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Rule">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Silver Insurance" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Conditions</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Group logic</span>
                <select value={groupLogic} onChange={(e) => setGroupLogic(e.target.value as any)} className="select">
                  <option>AND</option><option>OR</option>
                </select>
                <button onClick={addCondition} className="btn-outline">Add</button>
              </div>
            </div>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={c.metric} onChange={(e) => setConditions((arr) => arr.map((x, idx) => (idx === i ? { ...x, metric: e.target.value } : x)))} className="select">
                    <option value="completed_orders_30d">completed_orders_30d</option>
                    <option value="on_time_rate">on_time_rate</option>
                    <option value="rating_avg_30d">rating_avg_30d</option>
                  </select>
                  <select value={c.op} onChange={(e) => setConditions((arr) => arr.map((x, idx) => (idx === i ? { ...x, op: e.target.value } : x)))} className="select">
                    <option>≥</option><option>≤</option><option>=</option>
                  </select>
                  <input value={c.val} onChange={(e) => setConditions((arr) => arr.map((x, idx) => (idx === i ? { ...x, val: e.target.value } : x)))} className="input w-24" />
                  <button onClick={() => removeCondition(i)} className="btn-outline px-2 py-2">Remove</button>
                </div>
              ))}
              {!conditions.length && (
                <div className="rounded-xl border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                  No conditions yet. Click <b>Add</b> to begin.
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Reward</label>
            <div className="flex flex-wrap items-center gap-2">
              <select value={rewardType} onChange={(e) => setRewardType(e.target.value as any)} className="select">
                <option value="insurance_discount">insurance_discount</option>
                <option value="tax_consultation">tax_consultation</option>
                <option value="early_pay_limit">early_pay_limit</option>
              </select>
              <input className="input w-24" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} placeholder="value" />
              <input className="input w-28" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="durationDays" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
            <button onClick={saveRule} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>

      {/* Preview side panel */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Impacted workers" side>
        <div className="space-y-2">
          {previewUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">
                  completed30d: {u.completed30d} • onTime: {(u.onTimeRate * 100).toFixed(0)}%
                </div>
              </div>
              <Badge tone="blue">Potential</Badge>
            </div>
          ))}
          {!previewUsers.length && <div className="text-gray-500">No one matches.</div>}
        </div>
      </Modal>
    </div>
  )
}
