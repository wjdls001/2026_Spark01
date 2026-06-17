import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchMyParticipations, fetchMySparks } from '@/features/sparks/api'
import { SPORT_EMOJI } from '@/lib/mockData'

type Item = {
  sparkId: string
  title: string
  placeName: string | null
  scheduledAt: string
  sportCode?: string
  role: 'host' | 'member'
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export function SparkExerciseSelectPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([fetchMyParticipations(user.id), fetchMySparks(user.id)])
      .then(([participationsRes, hostedRes]) => {
        const memberItems: Item[] = ((participationsRes.data ?? []) as unknown as {
          status: string
          spark: { id: string; title: string; place_name: string | null; scheduled_at: string; status: string; sport?: { code: string } | null } | null
        }[])
          .filter(p => p.status === 'approved' && p.spark && ['recruiting', 'in_progress'].includes(p.spark.status) && isToday(p.spark.scheduled_at))
          .map(p => ({
            sparkId: p.spark!.id,
            title: p.spark!.title,
            placeName: p.spark!.place_name,
            scheduledAt: p.spark!.scheduled_at,
            sportCode: p.spark!.sport?.code,
            role: 'member' as const,
          }))

        const hostItems: Item[] = ((hostedRes.data ?? []) as unknown as {
          id: string; title: string; place_name: string | null; scheduled_at: string; status: string; sport?: { code: string } | null
        }[])
          .filter(s => ['recruiting', 'in_progress'].includes(s.status) && isToday(s.scheduled_at))
          .map(s => ({
            sparkId: s.id,
            title: s.title,
            placeName: s.place_name,
            scheduledAt: s.scheduled_at,
            sportCode: s.sport?.code,
            role: 'host' as const,
          }))

        setItems([...hostItems, ...memberItems])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  function handleSelect(item: Item) {
    const path = item.role === 'host'
      ? `/exercise/spark/host-ready/${item.sparkId}`
      : `/exercise/spark/member-ready/${item.sparkId}`
    navigate(path)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">같이 운동</h1>
      </div>

      <div className="flex-1 px-5 py-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 text-4xl">⚡</div>
            <p className="text-sm text-[#777777]">오늘 예정된 번개가 없어요.</p>
            <Link to="/sparks" className="mt-4 rounded-full bg-[#C8FF3E] px-6 py-2.5 text-sm font-bold text-[#111111]">
              번개 찾아보기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <button
                key={item.sparkId}
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-left"
              >
                <span className="text-2xl">{SPORT_EMOJI[item.sportCode ?? ''] ?? '⚡'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111111]">{item.title}</span>
                    {item.role === 'host' && (
                      <span className="rounded-full bg-[#C8FF3E] px-2 py-0.5 text-[10px] font-bold text-[#111111]">모임장</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-[#777777]">{item.placeName} · {formatTime(item.scheduledAt)}</div>
                </div>
                <svg className="h-5 w-5 text-[#9B8FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
