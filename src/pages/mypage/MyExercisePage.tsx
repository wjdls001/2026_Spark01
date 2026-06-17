import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchExerciseSessions, fetchWeeklyExerciseSessions, formatDuration } from '@/features/exercise/api'
import type { ExerciseSession } from '@/types/database'

type SessionWithSport = ExerciseSession & { sport: { code: string; name: string } | null }

export function MyExercisePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionWithSport[]>([])
  const [weekSessions, setWeekSessions] = useState<SessionWithSport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchExerciseSessions(user.id),
      fetchWeeklyExerciseSessions(user.id),
    ]).then(([{ data: all }, { data: week }]) => {
      if (all) setSessions(all as SessionWithSport[])
      if (week) setWeekSessions(week as SessionWithSport[])
      setLoading(false)
    })
  }, [user])

  const totalDist = sessions.reduce((s, r) => s + (Number(r.distance_meters) ?? 0), 0)
  const totalCal = sessions.reduce((s, r) => s + (Number(r.calories) ?? 0), 0)
  const weekTime = weekSessions.reduce((s, r) => s + (r.duration_seconds ?? 0), 0)

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">운동 기록</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 주간 통계 */}
        <div className="bg-[#111111] px-5 py-6">
          <h2 className="mb-4 text-sm font-bold text-white">이번 주 운동</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="운동 횟수" value={`${weekSessions.length}회`} highlight />
            <StatCard label="총 시간" value={weekTime > 0 ? formatDuration(weekTime) : '-'} />
            <StatCard label="운동 종류" value={`${new Set(weekSessions.map(s => s.sport_id).filter(Boolean)).size}종`} />
          </div>
        </div>

        {/* 전체 통계 */}
        <div className="bg-[#1A1A1A] px-5 py-5">
          <h2 className="mb-4 text-sm font-bold text-white">누적 기록</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="총 운동" value={`${sessions.length}회`} />
            <StatCard label="총 거리" value={totalDist > 0 ? `${(totalDist / 1000).toFixed(0)}km` : '-'} />
            <StatCard label="소모 칼로리" value={totalCal > 0 ? `${Math.round(totalCal)}` : '-'} unit="kcal" />
          </div>
        </div>

        {/* 기록 리스트 */}
        <div className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-[#111111]">운동 기록</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="text-4xl mb-3">🏃</div>
              <p className="text-sm text-[#777777]">첫 운동 기록을 만들어보세요.</p>
              <button onClick={() => navigate('/exercise')}
                className="mt-4 rounded-full bg-[#C8FF3E] px-6 py-2.5 text-sm font-bold text-[#111111]">
                운동 시작하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map(s => (
                <div key={s.id} className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#EEE8FF] px-3 py-1 text-xs font-medium text-[#9B8FFF]">
                        {s.sport?.name ?? '운동'}
                      </span>
                      {s.mode === 'spark' && (
                        <span className="rounded-full bg-[#FFF8D6] px-2 py-0.5 text-xs text-[#B8A020]">번개</span>
                      )}
                    </div>
                    <span className="text-xs text-[#AAAAAA]">{formatDate(s.started_at)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="시간" value={s.duration_seconds ? formatDuration(s.duration_seconds) : '-'} />
                    <MiniStat label="거리" value={s.distance_meters ? `${(Number(s.distance_meters) / 1000).toFixed(1)}km` : '-'} />
                    <MiniStat label="칼로리" value={s.calories ? `${Math.round(Number(s.calories))}kcal` : '-'} />
                  </div>
                  {s.memo && <p className="mt-2 text-xs text-[#777777] border-t border-gray-100 pt-2">{s.memo}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${highlight ? 'bg-[#C8FF3E]' : 'bg-[#2A2A2A]'}`}>
      <div className={`text-xs ${highlight ? 'text-[#111111]' : 'text-[#AAAAAA]'}`}>{label}</div>
      <div className={`mt-1 text-sm font-bold ${highlight ? 'text-[#111111]' : 'text-white'}`}>
        {value}{unit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-[#AAAAAA]">{label}</div>
      <div className="text-sm font-bold text-[#111111]">{value}</div>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`
}
