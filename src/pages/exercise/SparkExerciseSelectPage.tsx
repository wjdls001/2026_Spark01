import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchMyParticipations, fetchMySparks } from '@/features/sparks/api'
import { ALL_MOCK_SPARKS, SPORT_EMOJI } from '@/lib/mockData'

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

// 테스트 환경에서는 실제 DB에 "오늘 예정된" 참여/개설 번개가 없을 때가 많아 같이 운동 플로우 자체를
// 확인할 수 없었다. mock 번개 중 가까운 시일 내 몇 개를 host/member 항목으로 보여준다.
function mockFallbackItems(): Item[] {
  return ALL_MOCK_SPARKS.slice(0, 4).map((spark, index) => ({
    sparkId: spark.id,
    title: spark.title,
    placeName: spark.place_name,
    scheduledAt: spark.scheduled_at,
    sportCode: (spark.sport as { code?: string } | null)?.code,
    role: index % 2 === 0 ? 'host' : 'member',
  }))
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

        const realItems = [...hostItems, ...memberItems]
        // 실제 DB에 오늘 예정된 번개가 없으면(테스트 환경 등) mock 번개로 같이 운동 플로우를 시연한다.
        setItems(realItems.length > 0 ? realItems : mockFallbackItems())
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
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-spark-dark">같이 운동</h1>
      </div>

      <div className="flex-1 px-5 py-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 text-4xl">⚡</div>
            <p className="text-sm text-spark-text-secondary">오늘 예정된 번개가 없어요.</p>
            <Link to="/sparks" className="mt-4 rounded-full bg-spark-lime px-6 py-2.5 text-sm font-bold text-spark-dark">
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
                    <span className="text-sm font-bold text-spark-dark">{item.title}</span>
                    {item.role === 'host' && (
                      <span className="rounded-full bg-spark-lime px-2 py-0.5 text-[10px] font-bold text-spark-dark">모임장</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-spark-text-secondary">{item.placeName} · {formatTime(item.scheduledAt)}</div>
                </div>
                <svg className="h-5 w-5 text-spark-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
