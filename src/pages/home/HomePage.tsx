import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchSparks } from '@/features/sparks/api'
import { fetchRecentExerciseSessions, fetchWeeklyExerciseSessions, formatDuration } from '@/features/exercise/api'
import { fetchChallenges, fetchChallengeProgress } from '@/features/challenges/api'
import {
  MOCK_SPARKS, MOCK_EXERCISE_SESSIONS, MOCK_CHALLENGES,
  MOCK_NOTIFICATIONS, MOCK_USER_PROFILE, SPORT_EMOJI,
} from '@/lib/mockData'
import type { Profile, ExerciseSession, Challenge, ChallengeProgress } from '@/types/database'

type SparkRow = {
  id: string
  title: string
  place_name: string | null
  scheduled_at: string
  capacity: number
  sport: { name: string; code?: string } | null
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
  const [showNotif, setShowNotif] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read_at).length

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id)
      .then(({ data }) => { if (data) setProfile(data) })
      .catch(() => {})
    fetchSparks()
      .then(({ data }) => {
        if (data && (data as unknown[]).length > 0)
          setSparks((data as unknown as SparkRow[]).slice(0, 4))
        else
          setSparks(MOCK_SPARKS.slice(0, 4) as unknown as SparkRow[])
      })
      .catch(() => setSparks(MOCK_SPARKS.slice(0, 4) as unknown as SparkRow[]))
    fetchRecentExerciseSessions(user.id, 3)
      .then(({ data }) => {
        if (data && data.length > 0)
          setRecentSessions(data as (ExerciseSession & { sport: { code: string; name: string } | null })[])
        else
          setRecentSessions(MOCK_EXERCISE_SESSIONS as unknown as (ExerciseSession & { sport: { code: string; name: string } | null })[])
      })
      .catch(() => setRecentSessions(MOCK_EXERCISE_SESSIONS as unknown as (ExerciseSession & { sport: { code: string; name: string } | null })[]))
    fetchWeeklyExerciseSessions(user.id)
      .then(({ data }) => {
        if (data) setWeeklyCount(data.length)
        else setWeeklyCount(MOCK_USER_PROFILE.weekly_count)
      })
      .catch(() => setWeeklyCount(MOCK_USER_PROFILE.weekly_count))
    fetchChallenges()
      .then(async ({ data: cList }) => {
        if (!cList || cList.length === 0) {
          setChallenges(MOCK_CHALLENGES.slice(0, 3) as unknown as (Challenge & { progress?: ChallengeProgress })[])
          return
        }
        const { data: prog } = await fetchChallengeProgress(user.id)
        const merged = cList.slice(0, 3).map(c => ({ ...c, progress: prog?.find(p => p.challenge_id === c.id) }))
        setChallenges(merged)
      })
      .catch(() => setChallenges(MOCK_CHALLENGES.slice(0, 3) as unknown as (Challenge & { progress?: ChallengeProgress })[]))
  }, [user])

  const nickname = profile?.nickname ?? MOCK_USER_PROFILE.nickname
  const exerciseLevel = profile?.exercise_level ?? MOCK_USER_PROFILE.exercise_level

  const weeklyGoal = 5
  const weeklyPct = Math.min(100, Math.round((weeklyCount / weeklyGoal) * 100))
  const totalCalories = recentSessions.reduce((sum, s) => sum + (Number(s.calories) || 0), 0)
  const totalKm = recentSessions.reduce((sum, s) => sum + ((s.distance_meters ?? 0) / 1000), 0)

  const greetTime = () => {
    const h = new Date().getHours()
    if (h < 12) return '좋은 아침이에요 ☀️'
    if (h < 18) return '좋은 오후예요 🌤'
    return '좋은 저녁이에요 🌙'
  }

  return (
    <div className="flex flex-col">
      {/* 상단 라이트 구역 */}
      <div className="bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-5 pb-6 pt-5">
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xl font-bold text-[#111111]">⚡ SPARK</span>
          <div className="relative">
            <button
              onClick={() => setShowNotif(v => !v)}
              className="relative rounded-full p-2 bg-white/60 shadow-sm"
            >
              <svg className="h-5 w-5 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* 알림 드롭다운 */}
            {showNotif && (
              <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <span className="text-sm font-bold text-[#111111]">알림</span>
                  <button onClick={() => setShowNotif(false)} className="text-[#999999] text-xs">닫기</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.read_at ? 'bg-[#F8F6FF]' : ''}`}>
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.read_at ? 'bg-[#9B8FFF]' : 'bg-gray-200'}`} />
                        <div>
                          <p className="text-xs font-bold text-[#111111]">{n.title}</p>
                          <p className="text-xs text-[#777777] mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-[#AAAAAA] mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 인사말 */}
        <div className="mb-5">
          <p className="text-sm text-[#777777]">{greetTime()}</p>
          <h1 className="text-2xl font-bold text-[#111111]">{nickname}님 👋</h1>
          <p className="mt-1 text-sm text-[#555555]">오늘도 운동할 준비가 되셨나요?</p>
        </div>

        {/* 운동 목표 링 카드 */}
        <div className="mb-5 rounded-3xl bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-[#111111]">이번 주 운동 목표</span>
            <span className="text-xs text-[#9B8FFF]">{weeklyCount}/{weeklyGoal}회</span>
          </div>
          <div className="flex items-center justify-around">
            <ActivityRing
              label="운동 횟수"
              value={weeklyCount}
              unit="회"
              color="#9B8FFF"
              pct={weeklyPct}
            />
            <ActivityRing
              label="칼로리"
              value={Math.round(totalCalories)}
              unit="kcal"
              color="#C8FF3E"
              pct={Math.min(100, Math.round((totalCalories / 1500) * 100))}
            />
            <ActivityRing
              label="거리"
              value={parseFloat(totalKm.toFixed(1))}
              unit="km"
              color="#FF8FA3"
              pct={Math.min(100, Math.round((totalKm / 20) * 100))}
            />
          </div>
        </div>

        {/* 운동 시작 CTA */}
        <button
          onClick={() => navigate('/exercise')}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          지금 운동 시작하기 ⚡
        </button>

        {/* 자주 하는 운동 */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111111]">자주 하는 운동</h2>
            <Link to="/exercise" className="text-xs text-[#9B8FFF]">전체보기</Link>
          </div>
          <div className="flex gap-4">
            {(['running', 'fitness', 'cycling', 'tennis', 'badminton'] as const).map(code => (
              <button
                key={code}
                onClick={() => navigate('/exercise')}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-xl">
                  {SPORT_EMOJI[code]}
                </div>
                <span className="text-[10px] text-[#555555]">{sportName(code)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 추천 번개 */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111111]">추천 번개 모임</h2>
            <Link to="/sparks" className="text-sm text-[#9B8FFF]">전체 보기</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sparks.slice(0, 3).map(spark => (
              <Link
                key={spark.id}
                to={`/sparks/${spark.id}`}
                className="rounded-2xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-1 text-lg">{SPORT_EMOJI[(spark.sport as { code?: string } | null)?.code ?? ''] ?? '⚡'}</div>
                <div className="text-xs font-medium text-[#9B8FFF]">
                  {formatScheduleShort(spark.scheduled_at)}
                </div>
                <div className="mt-1 text-sm font-bold text-[#111111] leading-tight line-clamp-2">
                  {spark.title}
                </div>
                <div className="mt-1 text-xs text-[#777777] truncate">{spark.place_name}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#999999]">{spark.sport?.name}</span>
                  <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">
                    {spark.participants?.[0]?.count ?? 0}/{spark.capacity}
                  </span>
                </div>
              </Link>
            ))}
            <Link
              to="/sparks/new"
              className="flex min-h-[110px] flex-col items-center justify-center rounded-2xl bg-[#EEE8FF] p-3"
            >
              <span className="text-2xl text-[#9B8FFF]">+</span>
              <span className="mt-1 text-xs font-medium text-[#9B8FFF]">새 번개 만들기</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 하단 다크 구역 */}
      <div className="bg-[#111111] px-5 py-6">
        {/* 레벨/신뢰도 배지 */}
        <div className="mb-5 flex gap-3">
          <div className="flex-1 rounded-2xl bg-[#2A2A2A] p-3">
            <div className="text-xs text-[#AAAAAA] mb-1">운동 레벨</div>
            <div className="text-base font-bold text-white">{levelLabel(exerciseLevel)}</div>
            <div className="mt-2 h-1 w-full rounded-full bg-[#444]">
              <div className="h-full rounded-full bg-[#9B8FFF]" style={{ width: '60%' }} />
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-[#2A2A2A] p-3">
            <div className="text-xs text-[#AAAAAA] mb-1">신뢰도</div>
            <div className="text-base font-bold text-[#C8FF3E]">{MOCK_USER_PROFILE.trust_score}</div>
            <div className="mt-2 h-1 w-full rounded-full bg-[#444]">
              <div className="h-full rounded-full bg-[#C8FF3E]" style={{ width: `${MOCK_USER_PROFILE.trust_score}%` }} />
            </div>
          </div>
        </div>

        {/* 챌린지 진행률 */}
        {challenges.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">진행 중인 챌린지</h2>
              <Link to="/challenges" className="text-sm text-[#9B8FFF]">전체 보기</Link>
            </div>
            <div className="flex flex-col gap-3">
              {challenges.map(c => {
                const prog = (c as { progress?: { current_count: number; completed_at?: string | null } }).progress
                const goal = c.goal_count
                const pct = prog ? Math.min(100, Math.round((prog.current_count / goal) * 100)) : 0
                const done = !!prog?.completed_at
                return (
                  <div key={c.id} className="rounded-2xl bg-[#2A2A2A] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <span className="text-sm font-medium text-white">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {done && <span className="rounded-full bg-[#C8FF3E] px-2 py-0.5 text-[10px] font-bold text-[#111]">완료</span>}
                        <span className="text-xs text-[#9B8FFF]">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#444444]">
                      <div className="h-full rounded-full bg-[#C8FF3E]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-[#AAAAAA]">
                      {prog?.current_count ?? 0} / {goal} · +{c.reward_xp} XP
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
            <h2 className="text-base font-bold text-white">최근 운동 기록</h2>
            <Link to="/mypage/exercise" className="text-sm text-[#9B8FFF]">전체 보기</Link>
          </div>
          {recentSessions.length === 0 ? (
            <div className="rounded-2xl bg-[#2A2A2A] px-4 py-6 text-center">
              <p className="text-sm text-[#999999]">첫 운동 기록을 만들어보세요.</p>
              <button
                onClick={() => navigate('/exercise')}
                className="mt-2 text-sm font-bold text-[#C8FF3E]"
              >
                운동 시작하기 →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentSessions.map(s => (
                <div key={s.id} className="rounded-2xl bg-[#2A2A2A] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">
                      {SPORT_EMOJI[s.sport?.code ?? ''] ?? '🏃'}
                    </span>
                    <span className="rounded-full bg-[#333333] px-3 py-0.5 text-xs font-medium text-white">
                      {s.sport?.name ?? '운동'}
                    </span>
                    <span className="text-xs text-[#AAAAAA]">{formatDateShort(s.started_at)}</span>
                    {s.mode === 'spark' && (
                      <span className="ml-auto rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">번개</span>
                    )}
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

        <button
          onClick={() => navigate('/exercise')}
          className="mt-6 w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          새로운 운동 도전하기 ⚡
        </button>
      </div>
    </div>
  )
}

function ActivityRing({
  label, value, unit, color, pct,
}: {
  label: string; value: number; unit: string; color: string; pct: number
}) {
  const r = 28
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-16 w-16">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#EEEEEE" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-[#111111]">{value}</span>
          <span className="text-[9px] text-[#777777]">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] text-[#555555]">{label}</span>
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

function sportName(code: string) {
  const map: Record<string, string> = {
    running: '러닝', fitness: '헬스', cycling: '자전거', tennis: '테니스', badminton: '배드민턴',
  }
  return map[code] ?? code
}

function formatScheduleShort(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (days === 0) return `오늘 ${timeStr}`
  if (days === 1) return `내일 ${timeStr}`
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}분 전`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

