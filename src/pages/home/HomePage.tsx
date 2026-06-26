import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchSparks } from '@/features/sparks/api'
import { fetchRecentExerciseSessions, fetchWeeklyExerciseSessions, formatDuration } from '@/features/exercise/api'
import { PermissionPromptModal } from '@/components/common/PermissionPromptModal'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { MOCK_EXERCISE_SESSIONS, MOCK_NEARBY_SPARKS, MOCK_NOTIFICATIONS, MOCK_SPARKS, MOCK_USER_PROFILE, SPORT_EMOJI } from '@/lib/mockData'
import sparkLogo from '@/assets/spark-logo.png'
import { useDragScroll } from '@/lib/utils/useDragScroll'
import type { ExerciseSession, Profile } from '@/types/database'

const PERMISSION_SEEN_KEY = 'spark_permission_seen'
const ROUTINES = [
  { code: 'running', label: '러닝' },
  { code: 'badminton', label: '배구' },
  { code: 'soccer', label: '풋살' },
  { code: 'fitness', label: 'GYM' },
]

type SparkRow = {
  id: string
  title: string
  place_name: string | null
  scheduled_at: string
  capacity: number
  sport: { name: string; code?: string } | null
  participants: { count: number }[]
}

type SessionRow = ExerciseSession & { sport: { code: string; name: string } | null }

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sparks, setSparks] = useState<SparkRow[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [activeRoutine, setActiveRoutine] = useState(ROUTINES[0].code)
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter(item => !item.read_at).length

  useEffect(() => {
    if (!localStorage.getItem(PERMISSION_SEEN_KEY)) setShowPermissionPrompt(true)
  }, [])

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => data && setProfile(data)).catch(() => {})
    fetchSparks()
      .then(({ data }) => {
        const base = data?.length ? data as unknown as SparkRow[] : MOCK_SPARKS as unknown as SparkRow[]
        setSparks([...base, ...MOCK_NEARBY_SPARKS as unknown as SparkRow[]])
      })
      .catch(() => setSparks([...MOCK_SPARKS, ...MOCK_NEARBY_SPARKS] as unknown as SparkRow[]))
    fetchRecentExerciseSessions(user.id, 4)
      .then(({ data }) => setSessions(data?.length ? data as SessionRow[] : MOCK_EXERCISE_SESSIONS as unknown as SessionRow[]))
      .catch(() => setSessions(MOCK_EXERCISE_SESSIONS as unknown as SessionRow[]))
    fetchWeeklyExerciseSessions(user.id)
      .then(({ data }) => setWeeklyCount(data?.length ?? MOCK_USER_PROFILE.weekly_count))
      .catch(() => setWeeklyCount(MOCK_USER_PROFILE.weekly_count))
  }, [user])

  const nickname = profile?.nickname ?? MOCK_USER_PROFILE.nickname
  const upcomingSparks = sparks.slice(0, 3)
  const recommendedSparks = sparks.slice(0, 8)
  const recommendedDrag = useDragScroll<HTMLDivElement>()
  const routineDrag = useDragScroll<HTMLDivElement>()

  function dismissPermissionPrompt() {
    localStorage.setItem(PERMISSION_SEEN_KEY, '1')
    setShowPermissionPrompt(false)
  }

  return (
    <div className="spark-page-background min-h-dvh text-spark-dark">
      <header className="flex h-16 items-center justify-between px-5 pt-2">
        <SparkLogoMark />
        <button onClick={() => navigate('/notifications')} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-label="알림">
          <BellIcon />
          {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-spark-error" />}
        </button>
      </header>

      <main className="space-y-7 px-5 pb-8 pt-2">
        <section>
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-[3px] ring-spark-lime shadow-[0_0_10px_2px_rgba(209,255,76,0.65)]" />
            ) : (
              <SparkCharacter size="sm" ring="lime" />
            )}
            <div className="min-w-0">
              <h1 className="max-w-full truncate break-keep text-[19px] font-bold leading-[1.3]">안녕하세요 {nickname}님,</h1>
              <p className="mt-0.5 truncate text-xs text-spark-text-secondary">이번 주에 {Math.max(3, upcomingSparks.length)}개의 번개 모임이 기다리고 있어요</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-spark-lime px-3 py-1.5 text-xs font-bold text-spark-dark">연속 {50 + weeklyCount}일</span>
            <span className="rounded-full bg-spark-lime px-3 py-1.5 text-xs font-bold text-spark-dark">총 운동 {85 + weeklyCount}회</span>
          </div>
        </section>

        <button
          onClick={() => navigate('/exercise')}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-spark-dark text-base font-bold text-white shadow-spark-card"
        >
          <span className="text-spark-lime">⚡</span>
          지금 운동 시작하기
        </button>

        <section className="grid grid-cols-2 gap-2.5">
          {upcomingSparks.map(spark => (
            <button
              key={spark.id}
              onClick={() => navigate(`/sparks/${spark.id}`)}
              className="flex flex-col rounded-spark-lg bg-spark-soft-purple p-3 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{formatShortDate(spark.scheduled_at)}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-spark-purple text-[11px] text-white">→</span>
              </div>
              <span className="mt-2 truncate text-[11px] text-spark-text-secondary">{spark.place_name ?? '장소 미정'}</span>
              <strong className="mt-0.5 text-xs">{formatTimeOnly(spark.scheduled_at)}</strong>
            </button>
          ))}
          <button onClick={() => navigate('/sparks')} className="flex flex-col items-center justify-center gap-1 rounded-spark-lg border border-dashed border-spark-purple/40 bg-white p-3 text-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-spark-soft-purple text-xs text-spark-purple">+</span>
            <span className="text-[11px] font-bold text-spark-purple">새로운 모임 찾기</span>
          </button>
        </section>

        <section>
          <SectionHeader title="추천 모임" action="View all" onClick={() => navigate('/sparks')} />
          <div
            ref={recommendedDrag.ref}
            onMouseDown={recommendedDrag.onMouseDown}
            onMouseMove={recommendedDrag.onMouseMove}
            onMouseUp={recommendedDrag.onMouseUp}
            onMouseLeave={recommendedDrag.onMouseLeave}
            onClickCapture={recommendedDrag.onClickCapture}
            className="touch-pan-x -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden"
          >
            {recommendedSparks.map(spark => (
              <Link
                key={spark.id}
                to={`/sparks/${spark.id}`}
                className="block w-36 shrink-0 overflow-hidden rounded-spark-md shadow-spark-card"
              >
                <div className="relative flex h-28 flex-col justify-end bg-gradient-to-br from-spark-dark via-spark-purple to-spark-lime p-3 text-white">
                  <span className="absolute right-2 top-2 rounded-full bg-spark-lime px-2 py-0.5 text-[9px] font-bold text-spark-dark">
                    {spark.sport?.name ?? 'Running'}
                  </span>
                  <strong className="line-clamp-2 text-[11px] leading-tight">{spark.title}</strong>
                  <p className="mt-1 text-[10px] opacity-90">📅 {formatShortDate(spark.scheduled_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="자주 하는 루틴 추천" action="" onClick={() => {}} />
          <div
            ref={routineDrag.ref}
            onMouseDown={routineDrag.onMouseDown}
            onMouseMove={routineDrag.onMouseMove}
            onMouseUp={routineDrag.onMouseUp}
            onMouseLeave={routineDrag.onMouseLeave}
            onClickCapture={routineDrag.onClickCapture}
            className="touch-pan-x -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden"
          >
            {ROUTINES.map(item => (
              <button
                key={item.code}
                onClick={() => {
                  setActiveRoutine(item.code)
                  navigate('/exercise/solo/setup', { state: { sportCode: item.code } })
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeRoutine === item.code ? 'bg-spark-dark text-white' : 'bg-white text-spark-text-secondary'
                }`}
              >
                {SPORT_EMOJI[item.code] ?? '⚡'} {item.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="최근 기록" action="전체보기" onClick={() => navigate('/mypage/workout')} />
          <div className="mt-3 flex flex-col gap-2.5">
            {sessions.slice(0, 4).map(session => (
              <button
                key={session.id}
                onClick={() => navigate(`/mypage/workout/${session.id}`)}
                className="flex items-center justify-between gap-3 rounded-spark-lg bg-white p-3 text-left shadow-spark-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spark-soft-purple text-lg">
                    {SPORT_EMOJI[session.sport?.code ?? ''] ?? '🏃'}
                  </span>
                  <div className="min-w-0">
                    <span className="block shrink-0 rounded-full bg-spark-soft-purple px-2 py-0.5 text-[10px] font-bold text-spark-purple w-fit">
                      {session.sport?.name ?? '운동'}
                    </span>
                    <strong className="mt-1 block truncate text-sm">{Number(session.distance_meters ?? 0) > 0 ? `${(Number(session.distance_meters) / 1000).toFixed(1)} Km` : `${Math.round(Number(session.calories ?? 0))} kcal`}</strong>
                    <span className="text-[11px] text-spark-text-secondary">{formatShortDate(session.started_at)} · {session.duration_seconds ? formatDuration(session.duration_seconds) : '-'}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-spark-text-secondary">{Math.round(Number(session.calories ?? 0))} kcal</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {showPermissionPrompt && <PermissionPromptModal onClose={dismissPermissionPrompt} />}
    </div>
  )
}

function SparkLogoMark() {
  return <img src={sparkLogo} alt="SPARK" className="h-9 w-8 object-contain" />
}

function SectionHeader({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      {action && <button onClick={onClick} className="text-xs font-bold text-spark-purple">{action} ›</button>}
    </div>
  )
}

function BellIcon() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h11zm0 0v1a3 3 0 11-6 0v-1" /></svg>
}

function formatShortDate(iso: string) {
  const date = new Date(iso)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function formatTimeOnly(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
