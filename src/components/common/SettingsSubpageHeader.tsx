import { useNavigate } from 'react-router-dom'

export function SettingsSubpageHeader({ title }: { title: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
      <button onClick={() => navigate(-1)}>
        <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-[#111111]">{title}</h1>
    </div>
  )
}
