import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { Tabs } from '../components/Tabs'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { api } from '../api/client'

export default function AdminUsersLogs() {
  const [tab, setTab] = useState<'Users' | 'Audit Logs'>('Users')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Users & Audit Logs</h2>
      <Tabs tabs={['Users', 'Audit Logs']} current={tab} onChange={(t) => setTab(t as any)} />
      {tab === 'Users' ? <UsersTab /> : <LogsTab />}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [curr, setCurr] = useState<any | null>(null)

  const load = async (keyword = '') => {
    const rows = await api.admin.users(keyword)
    setUsers(rows)
  }
  useEffect(() => { load('') }, [])

  const filtered = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())),
    [q, users]
  )

  return (
    <>
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <input
            className="w-full max-w-xs rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Search name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(q)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="py-2">Name</th>
                <th>Level</th>
                <th>Points</th>
                <th>Completed Orders 30d</th>
                <th>On-time Rate</th>
                <th>Last Benefit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u._id}
                  className="cursor-pointer border-t hover:bg-gray-50"
                  onClick={() => { setCurr(u); setOpen(true) }}
                >
                  <td className="py-2">{u.name}</td>
                  <td>{u.level}</td>
                  <td>{u.points}</td>
                  <td>{u.metrics?.completed_orders_30d ?? '-'}</td>
                  <td>{u.metrics?.on_time_rate != null ? (u.metrics.on_time_rate * 100).toFixed(0) + '%' : '-'}</td>
                  <td>{u.lastBenefit ?? '-'}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={curr ? curr.name : 'Profile'} side>
        {curr && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Level</div><div className="font-medium">{curr.level}</div>
              <div>Points</div><div className="font-medium">{curr.points}</div>
              <div>Completed (30d)</div><div className="font-medium">{curr.metrics?.completed_orders_30d ?? '-'}</div>
              <div>On-time</div><div className="font-medium">{curr.metrics?.on_time_rate != null ? (curr.metrics.on_time_rate * 100).toFixed(0) + '%' : '-'}</div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Recent benefits</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <span>Insurance Discount 20%</span>
                  <Badge tone="blue">Issued</Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <span>Tax Consultation</span>
                  <Badge tone="gray">Queued</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function LogsTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [action, setAction] = useState<'all' | 'benefit_issued' | 'rule_updated' | 'recompute'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = async () => {
    const params: Record<string, string> = {}
    if (action !== 'all') params.action = action
    if (from) params.from = from
    if (to) params.to = to
    const rows = await api.admin.logs(params)
    setLogs(rows)
  }

  useEffect(() => { load() }, []) // 初始加载
  useEffect(() => { load() }, [action]) // 切换 action 自动刷新

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-gray-600">Action</label>
          <select value={action} onChange={(e) => setAction(e.target.value as any)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="benefit_issued">benefit_issued</option>
            <option value="rule_updated">rule_updated</option>
            <option value="recompute">recompute</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-600">From</label>
          <input type="date" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-600">To</label>
          <input type="date" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={load} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">Apply</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="py-2">Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>User</th>
              <th>Rule</th>
              <th>Benefit</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="py-2">{l.time}</td>
                <td>{l.actor}</td>
                <td>{l.action}</td>
                <td>{l.userName}</td>
                <td>{l.ruleName ?? '-'}</td>
                <td>{l.benefitTitle ?? '-'}</td>
                <td className="max-w-[280px] truncate">{l.details ?? '-'}</td>
              </tr>
            ))}
            {!logs.length && (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={7}>
                  No logs match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}