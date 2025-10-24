import { useEffect, useState } from 'react'
import Card from '../components/Card'
import ProgressRing from '../components/ProgressRing'
import Badge from '../components/Badge'
import { api } from '../api/client'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'

type Summary = {
  points: number
  level: number
  nextLevelAt: number
  kpis: { completed30d: number; onTimeRate: number; avgRating: number; incidents: number }
  nextUnlock: { title: string; note: string }
}

export default function WorkerDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    api.worker.summary().then(setSummary)
    // 取最近活动 5 条（简单：前端截取）
    api.worker.activities({}).then((rows) => setRecent(rows.slice(0, 5)))
  }, [])

  const pct = summary ? Math.min(100, (summary.points / summary.nextLevelAt) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Your Dashboard</div>
          <div className="muted">Track progress and unlock benefits</div>
        </div>
        <div className="toolbar">
          <Link className="btn-outline" to="/worker/benefits">View Benefits</Link>
          <Link className="btn-primary" to="/worker/activity">Upload Activity</Link>
        </div>
      </div>

      {/* Hero */}
      <Card className="p-5">
        {summary ? (
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <ProgressRing value={pct} />
              <div>
                <div className="text-sm text-gray-500">Points</div>
                <div className="text-2xl font-semibold">
                  {summary.points}{' '}
                  <span className="ml-2 text-sm text-gray-500">Level {summary.level}</span>
                </div>
                <div className="text-sm text-gray-500">Next level at {summary.nextLevelAt}</div>
              </div>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-blue-800">
              <div className="text-sm">Next Unlock</div>
              <div className="font-semibold">{summary.nextUnlock.title}</div>
              <div className="text-sm">{summary.nextUnlock.note}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Loading...</div>
        )}
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="kpi">
            <div className="icon">📦</div>
            <div>
              <div className="label">Completed (30d)</div>
              <div className="value">{summary?.kpis.completed30d ?? '--'}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="kpi">
            <div className="icon">⏱️</div>
            <div>
              <div className="label">On-time Rate</div>
              <div className="value">{summary ? `${(summary.kpis.onTimeRate * 100).toFixed(0)}%` : '--'}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="kpi">
            <div className="icon">⭐</div>
            <div>
              <div className="label">Avg Rating</div>
              <div className="value">{summary?.kpis.avgRating ?? '--'}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="kpi">
            <div className="icon">🛡️</div>
            <div>
              <div className="label">Incidents</div>
              <div className="value">{summary?.kpis.incidents ?? '--'}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="muted">Last 5 records</div>
        </div>
        <div className="mx-auto w-full max-w-2xl">
          <ul className="divide-y">
            {recent.map((a, i) => (
              <li
                key={i}
                className="grid items-center gap-4 py-2"
                style={{ gridTemplateColumns: '7rem 8rem 10rem 3rem' }}
              >
                <div className="text-sm text-gray-500">{a.date}</div>
                <div className="capitalize text-sm font-medium">{a.type}</div>
                <div className="text-sm flex items-center gap-1">
                  {a.onTime ? (
                    <span className="inline-flex items-center text-green-600"><CheckCircle2 className="h-4 w-4" /> On-time</span>
                  ) : (
                    <span className="inline-flex items-center text-red-600"><XCircle className="h-4 w-4" /> Late</span>
                  )}
                </div>
                <div className="text-sm text-right">⭐ {a.rating}</div>
              </li>
            ))}
            {!recent.length && (
              <li className="py-6 text-center text-gray-500">No activity yet.</li>
            )}
          </ul>
        </div>
        
      </Card>
    </div>
  )
}
