import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { createExerciseSession, formatDuration } from '@/features/exercise/api'
import type { Sport } from '@/types/database'

type ResultState = {
  mode?: string
  sparkId?: string
  sport?: Sport | null
  startedAt?: string
  endedAt?: string
  durationSeconds?: number | null
  distanceMeters?: number | null
  calories?: number | null
}

export function ExerciseResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const s = (location.state as ResultState) ?? {}

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [xp] = useState(() => Math.floor(Math.random() * 50) + 20)

  useEffect(() => {
    if (!user || saved) return
    async function save() {
      if (!user) return
      setLoading(true)
      await createExerciseSession({
        user_id: user.id,
        mode: (s.mode === 'spark' ? 'spark' : 'solo') as 'solo' | 'spark',
        spark_id: s.sparkId ?? null,
        sport_id: s.sport?.id && s.sport.id !== 'custom' ? s.sport.id : null,
        title: s.sport?.id === 'custom' ? s.sport.name : null,
        started_at: s.startedAt ?? new Date().toISOString(),
        ended_at: s.endedAt ?? new Date().toISOString(),
        duration_seconds: s.durationSeconds ?? null,
        distance_meters: s.distanceMeters ?? null,
        calories: s.calories ?? null,
        status: 'completed',
      })
      setSaved(true)
      setLoading(false)
    }
    save()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-dvh flex-col bg-[#111111] px-5 py-10">
      {/* 보상 */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#C8FF3E] text-4xl">
          ⚡
        </div>
        <h1 className="text-2xl font-bold text-white">운동 완료!</h1>
        <p className="mt-1 text-[#AAAAAA]">대단해요, 오늘도 불씨를 키웠어요</p>
        <div className="mt-4 rounded-full bg-[#2A2A2A] px-5 py-2">
          <span className="text-[#C8FF3E] font-bold">+{xp} XP</span>
          <span className="ml-2 text-[#AAAAAA] text-sm">획득</span>
        </div>
      </div>

      {/* 운동 통계 */}
      <div className="mb-6 rounded-2xl bg-[#2A2A2A] p-5">
        <div className="mb-4 text-sm font-medium text-[#AAAAAA]">
          {s.sport?.name ?? '운동'} · {s.startedAt ? formatDateShort(s.startedAt) : ''}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="운동 시간"
            value={s.durationSeconds ? formatDuration(s.durationSeconds) : '-'}
            highlight
          />
          <StatCard
            label="거리"
            value={s.distanceMeters ? `${(s.distanceMeters / 1000).toFixed(1)}km` : '-'}
          />
          <StatCard
            label="칼로리"
            value={s.calories ? `${Math.round(Number(s.calories))}` : '-'}
            unit="kcal"
          />
        </div>
      </div>

      {loading && (
        <div className="mb-4 text-center text-sm text-[#AAAAAA]">기록 저장 중...</div>
      )}

      {/* 버튼들 */}
      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={() => navigate('/sparks')}
          className="w-full rounded-full border border-white/20 py-4 text-base font-bold text-white"
        >
          번개 모임 찾아보기
        </button>
        <button
          onClick={() => navigate('/home')}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${highlight ? 'bg-[#C8FF3E]' : 'bg-[#333333]'}`}>
      <div className={`text-xs ${highlight ? 'text-[#111111]' : 'text-[#AAAAAA]'}`}>{label}</div>
      <div className={`mt-1 text-base font-bold ${highlight ? 'text-[#111111]' : 'text-white'}`}>
        {value}{unit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
