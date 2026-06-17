import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchSparks } from '@/features/sparks/api'
import { fetchRecentExerciseSessions, fetchWeeklyExerciseSessions, formatDuration } from '@/features/exercise/api'
import { fetchChallenges, fetchChallengeProgress } from '@/features/challenges/api'
import type { Profile, ExerciseSession, Challenge, ChallengeProgress } from '@/types/database'

type SparkRow = {
  id: string
  title: string
  place_name: string | null
  scheduled_at: string
  capacity: number
  sport: { name: string } | null
  participants: { count: number }[]
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sparks, setSparks] = useState<SparkRow[]>([])
  const [recentSessions, setRecentSessions] = useState<(ExerciseSession & { sport: { code: string; name: string } | null })[]>([])
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [challenges, setChallenges] = useState<(Challenge & { progress?: ChallengeProgress })[]>([])

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => { if (data) setProfile(data) })
    fetchSparks().then(({ data }) => { if (data) setSparks((data as unknown as SparkRow[]).slice(0, 4)) })
    fetchRecentExerciseSessions(user.id, 3).then(({ data }) => { if (data) setRecentSessions(data as (ExerciseSession & { sport: { code: string; name: string } | null })[]) })
    fetchWeeklyExerciseSessions(user.id).then(({ data }) => { if (data) setWeeklyCount(data.length) })
    fetchChallenges().then(async ({ data: cList }) => {
      if (!cList) return
      const { data: prog } = await fetchChallengeProgress(user.id)
      const merged = cList.slice(0, 3).map(c => ({
        ...c,
        progress: prog?.find(p => p.challenge_id === c.id),
      }))
      setChallenges(merged)
    })
  }, [user])

  const greetTime = () => {
    const h = new Date().getHours()
    if (h < 12) return '좋은 아침이에요'
    if (h < 18) return '좋은 오후예요'
    return '좋은 저녁이에요'
  }

  return (
    <div className="flex flex-col">
      {/* 상단 라이트 구역 */}
      <div className="bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-5 pb-6 pt-5">
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xl font-bold text-[#111111]">⚡ SPARK</span>
          <Link to="/mypage" className="relative p-1">
            <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
        </div>

        {/* 인사말 + 배지 */}
        <div className="mb-5">
          <p className="text-sm text-[#777777]">{greetTime()},</p>
          <h1 className="text-2xl font-bold text-[#111111]">{profile?.nickname ?? ''}님 👋</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-xs text-[#333333]">
              이번 주 운동 {weeklyCount}회
            </span>
            {profile?.exercise_level && (
              <span className="rounded-full border border-[#9B8FFF] px-3 py-1 text-xs text-[#9B8FFF]">
                {levelLabel(profile.exercise_level)}
              </span>
            )}
          </div>
        </div>

        {/* 운동 시작 CTA */}
        <button
          onClick={() => navigate('/exercise')}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          지금 운동 시작하기 ⚡
        </button>

        {/* 번개 모임 카드 그리드 */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111111]">추천 번개 모임</h2>
            <Link to="/sparks" className="text-sm text-[#9B8FFF]">전체 보기</Link>
          </div>
          {sparks.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="text-sm text-[#999999]">근처에 열린 번개가 아직 없어요.</p>
              <Link to="/sparks/new" className="mt-2 block text-sm font-bold text-[#9B8FFF]">직접 만들어볼까요? →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sparks.map(spark => (
                <Link key={spark.id} to={`/sparks/${spark.id}`}
                  className="rounded-2xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <div className="mb-1 text-xs font-medium text-[#9B8FFF]">
                    {formatDate(spark.scheduled_at)}
                  </div>
                  <div className="text-sm font-bold text-[#111111] leading-tight line-clamp-2">{spark.title}</div>
                  <div className="mt-2 text-xs text-[#777777]">{spark.place_name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-[#999999]">{spark.sport?.name}</span>
                    <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">
                      {spark.participants?.[0]?.count ?? 0}/{spark.capacity}
                    </span>
                  </div>
                </Link>
              ))}
              <Link to="/sparks/new"
                className="flex flex-col items-center justify-center rounded-2xl bg-[#EEE8FF] p-3 min-h-[100px]">
                <span className="text-2xl text-[#9B8FFF]">+</span>
                <span className="mt-1 text-xs font-medium text-[#9B8FFF]">새 번개 만들기</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 하단 다크 구역 */}
      <div className="bg-[#111111] px-5 py-6">
        {/* 챌린지 진행률 */}
        {challenges.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">진행 중인 챌린지</h2>
              <Link to="/challenges" className="text-sm text-[#9B8FFF]">전체 보기</Link>
            </div>
            <div className="flex flex-col gap-3">
              {challenges.map(c => {
                const pct = c.progress
                  ? Math.min(100, Math.round((c.progress.current_count / c.goal_count) * 100))
                  : 0
                return (
                  <div key={c.id} className="rounded-2xl bg-[#2A2A2A] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{c.title}</span>
                      <span className="text-xs text-[#9B8FFF]">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#444444]">
                      <div className="h-full rounded-full bg-[#C8FF3E]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-[#AAAAAA]">
                      {c.progress?.current_count ?? 0} / {c.goal_count} · +{c.reward_xp} XP
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 최근 운동 기록 */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">최근 운동 기록 ⏱</h2>
            <Link to="/mypage/exercise" className="text-sm text-[#9B8FFF]">전체 보기</Link>
          </div>
          {recentSessions.length === 0 ? (
            <div className="rounded-2xl bg-[#2A2A2A] px-4 py-6 text-center">
              <p className="text-sm text-[#999999]">첫 운동 기록을 만들어보세요.</p>
              <button onClick={() => navigate('/exercise')}
                className="mt-2 text-sm font-bold text-[#C8FF3E]">운동 시작하기 →</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentSessions.map(s => (
                <div key={s.id} className="rounded-2xl bg-[#2A2A2A] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#333333] px-3 py-1 text-xs font-medium text-white">
                      {s.sport?.name ?? '운동'}
                    </span>
                    <span className="text-xs text-[#AAAAAA]">{formatDateShort(s.started_at)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <StatCell label="시간" value={s.duration_seconds ? formatDuration(s.duration_seconds) : '-'} highlight />
                    <StatCell label="거리" value={s.distance_meters ? `${(s.distance_meters / 1000).toFixed(1)}km` : '-'} />
                    <StatCell label="칼로리" value={s.calories ? `${Math.round(Number(s.calories))}kcal` : '-'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/exercise')}
          className="mt-6 w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          다른 목표 도전하기
        </button>
      </div>
    </div>
  )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 text-center ${highlight ? 'bg-[#C8FF3E]' : 'bg-[#333333]'}`}>
      <div className={`text-xs ${highlight ? 'text-[#111111]' : 'text-[#AAAAAA]'}`}>{label}</div>
      <div className={`text-sm font-bold ${highlight ? 'text-[#111111]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function levelLabel(level: string) {
  const map: Record<string, string> = {
    beginner: '초보자', intermediate: '중급자', advanced: '고급자', expert: '전문가',
  }
  return map[level] ?? level
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
