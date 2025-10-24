import { useEffect, useMemo, useState, useCallback } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Modal from '../components/Modal.tsx'
import { useToast } from '../components/Toast'
import { api } from '../api/client'

type Activity = {
  date: string
  type: 'order' | 'shift' | 'delivery'
  onTime: boolean
  rating: number
  distanceKm?: number
  incidents?: number
}

export default function WorkerActivity() {
  const [typeFilter, setTypeFilter] =
    useState<'all' | 'order' | 'shift' | 'delivery'>('all')
  const [queryDates, setQueryDates] = useState<{ from?: string; to?: string }>({})
  const [uploadOpen, setUploadOpen] = useState(false)
  const [items, setItems] = useState<Activity[]>([])
  const toast = useToast()

  const load = async (params: Record<string, string> = {}) => {
    const rows = await api.worker.activities(params)
    setItems(rows)
  }

  useEffect(() => { load() }, [])

  const applyFilters = () => {
    const p: Record<string, string> = {}
    if (typeFilter !== 'all') p.type = typeFilter
    if (queryDates.from) p.from = queryDates.from
    if (queryDates.to) p.to = queryDates.to
    load(p)
  }

  const weekStats = useMemo(() => {
    const week = items.slice(0, 5)
    const done = week.length
    const onTimePct = week.length ? week.filter((w) => w.onTime).length / week.length : 0
    const avgRating = week.length ? week.reduce((s, w) => s + (w.rating || 0), 0) / week.length : 0
    return { done, onTimePct, avgRating }
  }, [items])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Activity</h2>
          <p className="text-gray-600">Your orders, shifts and deliveries</p>
        </div>
        <div className="toolbar">
          <button onClick={() => setUploadOpen(true)} className="btn-primary">
            Upload JSON
          </button>
          {/* 可选的 API Ping，快速确认后端通 */}
          <PingButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 md:col-span-2">
          <div className="mb-3 auth-group">
            <div className="mb-3 text-sm font-medium text-gray-700">Filters</div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="select"
                >
                  <option value="all">All</option>
                  <option value="order">Order</option>
                  <option value="shift">Shift</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">From</label>
                <input
                  type="date"
                  className="input"
                  value={queryDates.from || ''}
                  onChange={(e) => setQueryDates((s) => ({ ...s, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">To</label>
                <input
                  type="date"
                  className="input"
                  value={queryDates.to || ''}
                  onChange={(e) => setQueryDates((s) => ({ ...s, to: e.target.value }))}
                />
              </div>
              <button onClick={applyFilters} className="btn-outline">Apply</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>On-time</th>
                  <th>Rating</th>
                  <th>Distance</th>
                  <th>Incidents</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a, i) => (
                  <tr key={i}>
                    <td className="py-2">{a.date}</td>
                    <td className="capitalize">{a.type}</td>
                    <td>{a.onTime ? <Badge tone="green">Yes</Badge> : <Badge tone="red">No</Badge>}</td>
                    <td>{a.rating}</td>
                    <td>{a.distanceKm ?? '-'}</td>
                    <td>{a.incidents ?? 0}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={6}>
                      No activity in this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-500">This week</div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between"><span>Orders done</span><b>{weekStats.done}</b></div>
            <div className="flex justify-between"><span>On-time %</span><b>{(weekStats.onTimePct * 100).toFixed(0)}%</b></div>
            <div className="flex justify-between"><span>Avg rating</span><b>{weekStats.avgRating.toFixed(1)}</b></div>
          </div>
        </Card>
      </div>

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={async () => { await applyFilters(); toast.show('Uploaded') }}
      />
    </div>
  )
}

/** ---- 可选：API Ping 按钮 ---- */
function PingButton() {
  const toast = useToast()
  const ping = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:3000/api') + '/health')
      toast.show(res.ok ? 'API OK' : 'API ERR')
    } catch {
      toast.show('API ERR')
    }
  }
  return (
    <button onClick={ping} className="btn-outline">
      Ping API
    </button>
  )
}

/** ---- 上传对话框（拖拽 + 校验 + 预览） ---- */
function UploadDialog({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean
  onClose: () => void
  onUploaded: () => Promise<void> | void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  const reset = () => { setFile(null); setRows(null); setError(null) }

  const parseAndValidate = async (f: File) => {
    setError(null)
    const text = await f.text()
    let parsed: any
    try { parsed = JSON.parse(text) } catch { setError('Invalid JSON format'); return }
    if (!Array.isArray(parsed)) { setError('Root must be an array'); return }
    // 轻量校验字段
    const required = ['date', 'type', 'onTime', 'rating']
    const bad = parsed.find((r: any) => !required.every((k) => k in r))
    if (bad) { setError('Missing required fields in some rows (need: date,type,onTime,rating)'); return }
    setRows(parsed)
  }

  const onFile = async (f: File) => {
    setFile(f)
    await parseAndValidate(f)
  }

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await onFile(f)
  }

  // 拖拽支持
  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) await onFile(f)
  }, [])

  const prevent = (e: React.DragEvent) => { e.preventDefault() }

  const upload = async () => {
    if (!rows?.length) return
    try {
      setSubmitting(true)
      await api.worker.uploadActivity(rows)
      reset()
      onClose()
      await onUploaded()
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Upload Activity">
      <div
        onDrop={onDrop}
        onDragOver={prevent}
        onDragEnter={prevent}
        className="mb-3 grid place-items-center rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"
      >
        <div>
          
          <div className="text-sm font-medium">Drag & drop JSON here</div>
          <div className="text-xs text-gray-500">or</div>
          <label className="mt-2 inline-block cursor-pointer rounded-xl border border-gray-200 px-3 py-2 text-sm">
            Choose file
            <input type="file" accept=".json,application/json" className="hidden" onChange={onInputChange} />
          </label>
        </div>
      </div>

      {file && (
        <div className="mb-3 rounded-xl border border-gray-100 p-3">
          <div className="text-sm">
            File: <b>{file.name}</b> <span className="text-gray-500">({Math.ceil(file.size / 1024)} KB)</span>
          </div>
        </div>
      )}

      {rows && (
        <div className="mb-3">
          <div className="mb-1 text-sm text-gray-600">Preview (first 3 rows)</div>
          <pre className="max-h-40 overflow-auto rounded-xl bg-gray-50 p-3 text-xs">
{JSON.stringify(rows.slice(0, 3), null, 2)}
          </pre>
        </div>
      )}

      {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="sticky bottom-0 bg-white pt-3 mt-4 flex justify-end gap-2">
        <a
          className="btn-outline"
          href="data:application/json;charset=utf-8,%5B%7B%22date%22%3A%222025-08-28%22%2C%22type%22%3A%22order%22%2C%22onTime%22%3Atrue%2C%22rating%22%3A5%2C%22distanceKm%22%3A6%2C%22incidents%22%3A0%7D%2C%7B%22date%22%3A%222025-08-27%22%2C%22type%22%3A%22order%22%2C%22onTime%22%3Atrue%2C%22rating%22%3A4.9%7D%2C%7B%22date%22%3A%222025-08-26%22%2C%22type%22%3A%22shift%22%2C%22onTime%22%3Atrue%2C%22rating%22%3A4.8%7D%5D"
          download="sample-activities.json"
        >
          Sample JSON
        </a>
        <button onClick={() => { reset(); onClose() }} className="btn-outline">
          Cancel
        </button>
        <button
          onClick={upload}
          disabled={!rows?.length || isSubmitting}
          className={`btn ${!rows?.length || isSubmitting ? 'bg-blue-300 text-white' : 'btn-primary'}`}
        >
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </Modal>
  )
}
