export function Tabs({
  tabs,
  current,
  onChange,
}: {
  tabs: string[]
  current: string
  onChange: (t: string) => void
}) {
  return (
    <div className="mb-4 flex gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`btn text-sm ${
            current === t
              ? 'bg-blue-600 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
