import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchExerciseSessionById, formatDuration } from '@/features/exercise/api'
import { MOCK_EXERCISE_SESSIONS, SPORT_EMOJI } from '@/lib/mockData'
import type { ExerciseSession } from '@/types/database'

type SessionDetail = ExerciseSession & {
  sport: { code: string; name: string } | null
  spark: { id: string; title: string; place_name: string | null } | null
}

export function ExerciseSessionDetailPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    fetchExerciseSessionById(sessionId)
      .then(({ data }) => {
        if (data) {
          setSession(data as unknown as SessionDetail)
          return
        }
        const mock = MOCK_EXERCISE_SESSIONS.find(m => m.id === sessionId)
        if (mock) setSession(mockToSessionDetail(mock))
        else setNotFound(true)
      })
      .catch(() => {
        const mock = MOCK_EXERCISE_SESSIONS.find(m => m.id === sessionId)
        if (mock) setSession(mockToSessionDetail(mock))
        else setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-5 text-center">
        <div className="text-4xl">🏃</div>
        <p className="text-sm text-[#777777]">운동 기록을 찾을 수 없어요.</p>
        <button onClick={() => navigate(-1)} className="text-sm font-bold text-[#9B8FFF]">뒤로 가기</button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">운동 상세</h1>
      </div>

      <div className="flex-1 px-5 py-5">
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{SPORT_EMOJI[session.sport?.code ?? ''] ?? '🏃'}</span>
            <span className="rounded-full bg-[#EEE8FF] px-3 py-1 text-xs font-medium text-[#9B8FFF]">
              {session.sport?.name ?? '운동'}
            </span>
            {session.mode === 'spark' && (
              <span className="rounded-full bg-[#FFF8D6] px-2 py-0.5 text-xs text-[#B8A020]">번개</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-[#111111]">{session.title ?? '운동 기록'}</h2>
          <p className="mt-1 text-xs text-[#999999]">{formatDateTime(session.started_at)}</p>

          {session.spark && (
            <div className="mt-3 rounded-xl bg-[#EEE8FF] px-3 py-2 text-xs text-[#9B8FFF]">
              ⚡ {session.spark.title}{session.spark.place_name ? ` · ${session.spark.place_name}` : ''}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            <DetailStat label="시간" value={session.duration_seconds ? formatDuration(session.duration_seconds) : '-'} />
            <DetailStat
              label="거리"
              value={session.distance_meters ? `${(Number(session.distance_meters) / 1000).toFixed(1)}km` : '-'}
            />
            <DetailStat label="칼로리" value={session.calories ? `${Math.round(Number(session.calories))}kcal` : '-'} />
          </div>

          {session.memo && (
            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-[#555555]">{session.memo}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-[#999999]">{label}</div>
      <div className="mt-1 text-base font-bold text-[#111111]">{value}</div>
    </div>
  )
}

function mockToSessionDetail(mock: typeof MOCK_EXERCISE_SESSIONS[number]): SessionDetail {
  return {
    ...mock,
    spark_id: null,
    memo: null,
    spark: null,
  } as unknown as SessionDetail
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]}) ${timeStr}`
}
