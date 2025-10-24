import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type ToastItem = { id: number; msg: string }

const ToastCtx = createContext<{ show: (msg: string) => void }>({
  show: () => {},
})

export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = (msg: string) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      2200
    )
  }

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-gray-900 text-white rounded-xl px-4 py-2 shadow-soft"
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}