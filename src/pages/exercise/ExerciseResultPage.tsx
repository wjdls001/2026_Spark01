import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { createExerciseSession } from '@/features/exercise/api'
import { fetchProfile } from '@/features/mypage/api'
import { MOCK_USER_PROFILE } from '@/lib/mockData'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { getLevelTier, levelNumberFromExerciseLevel } from '@/lib/utils/level'
import type { Profile, Sport } from '@/types/database'

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

  const [profile, setProfile] = useState<Profile | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [xp] = useState(() => Math.floor(Math.random() * 50) + 20)

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => data && setProfile(data)).catch(() => {})
  }, [user])

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

  const nickname = profile?.nickname ?? MOCK_USER_PROFILE.nickname
  const levelNumber = levelNumberFromExerciseLevel(profile?.exercise_level)
  const currentExp = 1320
  const nextLevelExp = 2083
  const expPct = Math.min(100, Math.round((currentExp / nextLevelExp) * 100))
  const goalPct = s.distanceMeters ? Math.min(100, Math.round((s.distanceMeters / 5000) * 100)) : 25
  const calories = s.calories ? Math.round(Number(s.calories)) : 426

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'SPARK', text: `${nickname}님이 운동을 완료했어요! 🔥` }).catch(() => {})
    }
  }

  return (
    <div className="spark-page-background flex min-h-[calc(100dvh-72px)] flex-col px-5 py-10 text-spark-dark">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{nickname}님, 오늘도 해냈어요!</h1>
        <p className="mt-1 text-sm text-spark-text-secondary">어제보다 더 멋져지는 중!</p>
      </div>

      <div className="rounded-spark-lg bg-white p-6 text-center shadow-spark-card">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-spark-purple to-spark-lime">
          <SparkCharacter size="md" mood="happy" />
        </div>
        <strong className="mt-4 block text-base">SPARK</strong>
        <span className="text-xs text-spark-text-secondary">{getLevelTier(levelNumber)} · Lv.{levelNumber}</span>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-spark-md bg-spark-soft-purple p-4 text-left">
            <span className="block text-xs text-spark-text-secondary">소모한 칼로리</span>
            <strong className="mt-1 block text-lg text-spark-purple">{calories} Kcal</strong>
          </div>
          <div className="rounded-spark-md bg-spark-soft-lime p-4 text-left">
            <span className="block text-xs text-spark-text-secondary">목표 달성률</span>
            <strong className="mt-1 block text-lg text-spark-dark">{goalPct}%</strong>
          </div>
        </div>

        <div className="mt-6 text-left">
          <div className="flex items-center justify-between text-xs text-spark-text-secondary">
            <span>NEXT LEVEL</span>
            <span>{currentExp} / {nextLevelExp}</span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-spark-muted">
            <div className="h-full rounded-full bg-spark-purple" style={{ width: `${expPct}%` }} />
          </div>
        </div>
      </div>

      {loading && <p className="mt-4 text-center text-xs text-spark-text-secondary">기록 저장 중...</p>}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <button onClick={() => navigate('/home')} className="h-[52px] w-full rounded-full bg-spark-purple text-base font-bold text-white">
          리워드 받기 <span className="text-spark-lime">+{xp} XP</span>
        </button>
        <button onClick={handleShare} className="text-sm font-bold text-spark-text-secondary">
          친구에게 공유하기
        </button>
      </div>
    </div>
  )
}
