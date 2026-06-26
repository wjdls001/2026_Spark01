import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { TrustScoreInfoModal } from '@/components/common/TrustScoreInfoModal'
import { DEFAULT_TRUST_SCORE, exerciseLevelLabel, getLevelTier, levelNumberFromExerciseLevel } from '@/lib/utils/level'
import { MOCK_PROFILES, MOCK_SPORTS } from '@/lib/mockData'
import type { Profile, Sport } from '@/types/database'

const GENDER_LABEL: Record<string, string> = { male: '남성', female: '여성', other: '이외' }

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [trustOpen, setTrustOpen] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetchProfile(userId)
      .then(({ data }) => {
        if (data) {
          setProfile(data)
        } else {
          const mock = MOCK_PROFILES.find(p => p.id === userId)
          if (mock) setProfile(mock as unknown as Profile)
        }
        setLoading(false)
      })
      .catch(() => {
        const mock = MOCK_PROFILES.find(p => p.id === userId)
        if (mock) setProfile(mock as unknown as Profile)
        setLoading(false)
      })
    fetchSports().then(({ data }) => setSports(data?.length ? data : MOCK_SPORTS as unknown as Sport[])).catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [userId])

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" /></div>
  }

  if (!profile) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-spark-text-secondary">유저를 찾을 수 없어요.</p>
        <button onClick={() => navigate(-1)} className="text-spark-purple">뒤로 가기</button>
      </div>
    )
  }

  const levelNumber = levelNumberFromExerciseLevel(profile.exercise_level)
  const age = profile.birth_year ? new Date().getFullYear() - profile.birth_year : null
  const traits = (profile.workout_traits ?? []).filter(t => t.startsWith('#') || !t.includes(':'))
  const sportNames = (profile.preferred_sports ?? []).map(id => sports.find(s => s.id === id)?.name ?? MOCK_SPORTS.find(s => s.id === id)?.name ?? id.replace('선호운동:', ''))
  const trustScore = profile.trust_score ?? DEFAULT_TRUST_SCORE

  return (
    <div className="spark-page-background flex min-h-dvh flex-col text-spark-dark">
      <div className="flex items-center gap-3 bg-white/70 px-5 py-4">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-spark-dark">프로필</h1>
      </div>

      <main className="flex-1 px-5 py-4">
        <section className="flex flex-col items-center rounded-spark-lg bg-white p-6 text-center shadow-spark-card">
          <SparkCharacter size="lg" />
          <h2 className="mt-3 text-lg font-bold">{profile.nickname}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-spark-text-secondary">
            {age && <span>{age}세</span>}
            {profile.gender && <span>· {GENDER_LABEL[profile.gender] ?? profile.gender}</span>}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="whitespace-nowrap rounded-full bg-spark-purple px-3 py-1 text-xs font-bold text-white">
              {getLevelTier(levelNumber)} · LV.{levelNumber}
            </span>
            <span className="rounded-full bg-spark-soft-purple px-3 py-1 text-xs font-bold text-spark-purple">
              {exerciseLevelLabel(profile.exercise_level)}
            </span>
          </div>
          <button onClick={() => setTrustOpen(true)} className="mt-3 flex items-center gap-1.5 rounded-full bg-spark-muted px-4 py-1.5">
            <span className="text-base text-spark-error">♥</span>
            <span className="text-sm font-bold text-spark-dark">{trustScore} BPM</span>
            <span className="text-xs text-spark-gray">신뢰도 ⓘ</span>
          </button>
          <p className="mt-4 text-sm text-spark-text-secondary">건강한 삶을 위해 오늘도 달려요!</p>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-sm font-bold text-spark-dark">운동 성향</h3>
          <div className="flex flex-wrap gap-2">
            {traits.length > 0 ? traits.map(t => (
              <span key={t} className="rounded-full bg-spark-soft-purple px-3 py-1.5 text-xs font-bold text-spark-purple">{t}</span>
            )) : <span className="text-xs text-spark-gray">등록된 운동 성향이 없어요.</span>}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-sm font-bold text-spark-dark">선호 운동</h3>
          <div className="flex flex-wrap gap-2">
            {sportNames.length > 0 ? sportNames.map((name, i) => (
              <span key={`${name}-${i}`} className="rounded-full bg-spark-muted px-3 py-1.5 text-xs font-bold text-spark-dark">{name}</span>
            )) : <span className="text-xs text-spark-gray">등록된 선호 운동이 없어요.</span>}
          </div>
        </section>
      </main>

      {trustOpen && (
        <TrustScoreInfoModal
          score={trustScore}
          stats={{ exerciseCount: 24, sparkCount: 9, noShowCount: 0, mannerScore: 96 }}
          onClose={() => setTrustOpen(false)}
        />
      )}
    </div>
  )
}
