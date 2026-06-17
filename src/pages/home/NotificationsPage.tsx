import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_NOTIFICATIONS } from '@/lib/mockData'

export function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const visible = tab === 'unread' ? notifications.filter(n => !n.read_at) : notifications

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)))
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">알림</h1>
      </div>

      <div className="flex gap-1 px-5 pt-3">
        <button
          onClick={() => setTab('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === 'all' ? 'bg-[#111111] text-white' : 'bg-gray-100 text-[#777777]'}`}
        >
          전체
        </button>
        <button
          onClick={() => setTab('unread')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === 'unread' ? 'bg-[#111111] text-white' : 'bg-gray-100 text-[#777777]'}`}
        >
          읽지 않음
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="mb-3 text-4xl">🔔</div>
          <p className="text-sm text-[#777777]">읽지 않은 알림이 없어요.</p>
        </div>
      ) : (
        <div className="flex flex-col px-5 pt-3">
          {visible.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-3 border-b border-gray-50 py-4 text-left ${!n.read_at ? 'bg-[#F8F6FF]' : ''}`}
            >
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read_at ? 'bg-[#9B8FFF]' : 'bg-gray-200'}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#111111]">{n.title}</p>
                <p className="mt-0.5 text-xs text-[#777777]">{n.body}</p>
                <p className="mt-1 text-[10px] text-[#AAAAAA]">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}분 전`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}
