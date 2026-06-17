import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
}

export function PageHeader({ title, showBack = true, right }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="flex h-14 items-center justify-between px-5">
      {showBack ? (
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : <div className="w-9" />}
      <h1 className="text-base font-bold text-[#111111]">{title}</h1>
      <div className="w-9">{right}</div>
    </header>
  )
}
