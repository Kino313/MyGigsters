import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { Tabs } from '../components/Tabs'
import Badge from '../components/Badge'
import { api } from '../api/client'
import { useToast } from '../components/Toast'

type Benefit = {
  _id: string
  title: string
  partner: string
  validity: string
  state: 'Unlocked' | 'Claimed' | 'Expired'
}

export default function BenefitsCenter() {
  const [tab, setTab] = useState<'Unlocked' | 'Available Soon'>('Unlocked')
  const [items, setItems] = useState<Benefit[]>([])
  const toast = useToast()

  const load = () => api.worker.benefits().then(setItems)
  useEffect(() => { load() }, [])

  const unlocked = items.filter(b => ['Unlocked','Claimed','Expired'].includes(b.state))
  const soon: Benefit[] = [] // 目前后端未返回“AvailableSoon”，留空状态以示意

  const list = tab === 'Unlocked' ? unlocked : soon

  const claim = async (id: string) => {
    await api.worker.claim(id)
    toast.show('Benefit Claimed')
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <div className="page-title">Benefits Center</div>
          <div className="muted">Redeem and preview your rewards</div>
        </div>
      </div>
      <Tabs tabs={['Unlocked', 'Available Soon']} current={tab} onChange={(t) => setTab(t as any)} />

      {!list.length && (
        <Card className="grid place-items-center p-8 text-gray-500">
          {tab === 'Unlocked' ? 'No unlocked benefits yet.' : 'Nothing available soon.'}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => (
          <Card key={b._id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{b.title}</h3>
              {b.state === 'Unlocked' && <Badge tone="blue">Unlocked</Badge>}
              {b.state === 'Claimed' && <Badge tone="gray">Claimed</Badge>}
              {b.state === 'Expired' && <Badge tone="red">Expired</Badge>}
            </div>
            <div className="text-sm text-gray-600">Partner: {b.partner}</div>
            <div className="mt-1 text-xs text-gray-500">Validity: {b.validity}</div>
            <div className="mt-4 flex items-center gap-2">
              {b.state === 'Unlocked' ? (
                <button onClick={() => claim(b._id)} className="btn-primary">Claim</button>
              ) : (
                <button className="btn-outline">Learn More</button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
