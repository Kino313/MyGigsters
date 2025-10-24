import type { ReactNode, KeyboardEvent, CSSProperties } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({
  open,
  onClose,
  title,
  children,
  side = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  side?: boolean
}) {
  if (!open) return null

  useEffect(() => {
    const htmlPrev = document.documentElement.style.overflow
    const bodyPrev = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = htmlPrev; document.body.style.overflow = bodyPrev }
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Escape') onClose() }

  const overlayStyle: CSSProperties = {
    position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.4)',
  }
  const rootStyle: CSSProperties = {
    position: 'fixed', inset: 0 as any, zIndex: 99999,
  }
  const centerWrapStyle: CSSProperties = {
    position: 'fixed', inset: 0 as any, overflowY: 'auto', padding: 16,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  }
  const panelStyle: CSSProperties = {
    background: '#fff', borderRadius: 16, border: '1px solid #eee',
    boxShadow: '0 10px 40px rgba(0,0,0,.15)', maxWidth: 720, width: '100%',
    maxHeight: '80vh', overflowY: 'auto',
  }
  const headerStyle: CSSProperties = {
    position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)',
    borderBottom: '1px solid #eee', padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
  }
  const contentStyle: CSSProperties = { padding: 16 }

  const node = (
    <div role="dialog" aria-modal="true" aria-label={title} onKeyDown={onKeyDown} style={rootStyle}>
      <div style={overlayStyle} onClick={onClose} />
      {side ? (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '420px', padding: 16, zIndex: 100000 }}>
          <div style={{ ...panelStyle, maxHeight: '100%' }}>
            <div style={headerStyle}>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <button onClick={onClose} aria-label="Close">✕</button>
            </div>
            <div style={{ ...contentStyle, height: 'calc(100% - 48px)', overflowY: 'auto' }}>{children}</div>
          </div>
        </div>
      ) : (
        <div style={centerWrapStyle}>
          <div style={panelStyle}>
            <div style={headerStyle}>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <button onClick={onClose} aria-label="Close">✕</button>
            </div>
            <div style={contentStyle}>{children}</div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(node, document.body)
}
