import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchChallenges, fetchChallengeProgress, joinChallenge } from '@/features/challenges/api'
import { MOCK_CHALLENGES } from '@/lib/mockData'
import type { Challenge, ChallengeProgress } from '@/types/database'

type MockChallenge = {
  id: string
  title: string
  description: string
  challenge_type: string
  goal_count: number
  reward_xp: number
  starts_at: string
  ends_at: string
  is_active: boolean
  emoji?: string
  event_rewards?: { rank: string; desc: string }[]
  event_date?: string
  event_place?: string
  progress: { current_count: number; completed_at: string | null; reward_claimed: boolean } | null
}

type ChallengeWithProgress = Challenge & { progress?: ChallengeProgress }

const TABS = [
  { key: 'all', label: '전체', icon: '🏅' },
  { key: 'exercise', label: '운동', icon: '🏃' },
  { key: 'spark', label: '모임', icon: '⚡' },
  { key: 'event', label: '이벤트', icon: '🎁' },
] as const

type TabKey = 'all' | 'exercise' | 'spark' | 'event'

export function ChallengesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<TabKey>('all')
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const filterType = tab === 'all' ? undefined : tab
      const [{ data: cList }, { data: prog }] = await Promise.all([
        fetchChallenges(filterType as 'exercise' | 'spark' | 'event' | undefined),
        fetchChallengeProgress(user.id),
      ])
      if (cList && cList.length > 0) {
        setChallenges(cList.map(c => ({ ...c, progress: prog?.find(p => p.challenge_id === c.id) })))
      } else {
        const filtered = tab === 'all'
          ? MOCK_CHALLENGES
          : MOCK_CHALLENGES.filter(c => c.challenge_type === tab)
        setChallenges(filtered as unknown as ChallengeWithProgress[])
      }
    } catch {
      const filtered = tab === 'all'
        ? MOCK_CHALLENGES
        : MOCK_CHALLENGES.filter(c => c.challenge_type === tab)
      setChallenges(filtered as unknown as ChallengeWithProgress[])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [tab, user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin(challengeId: string) {
    if (!user) return
    setJoining(challengeId)
    await joinChallenge(challengeId, user.id)
    await load()
    setJoining(null)
  }

  const inProgressChallenges = challenges.filter(c => {
    const prog = (c as unknown as MockChallenge).progress
    return prog && !prog.completed_at
  })
  const overallPct = inProgressChallenges.length > 0
    ? Math.round(
        inProgressChallenges.reduce((sum, c) => {
          const prog = (c as unknown as MockChallenge).progress
          return sum + Math.min(100, ((prog?.current_count ?? 0) / c.goal_count) * 100)
        }, 0) / inProgressChallenges.length
      )
    : 0

  const dateStrip = buildDateStrip()

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col bg-gray-50">
      {/* 상단 배너 카드 */}
      <div className="bg-white px-5 pt-5 pb-4 shadow-sm">
        <h1 className="mb-3 text-xl font-bold text-spark-dark">오픈된 챌린지 목록</h1>

        {/* 날짜 스트립 */}
        <div className="mb-4 flex items-center justify-between text-xs text-spark-text-secondary">
          <span>‹</span>
          {dateStrip.map(d => (
            <span key={d.day} className={`flex h-7 w-7 items-center justify-center rounded-full font-bold ${d.isToday ? 'bg-spark-dark text-white' : ''}`}>{d.day}</span>
          ))}
          <span>›</span>
        </div>

        {/* 진행 중 배너 */}
        <div className="mb-4 rounded-3xl bg-gradient-to-r from-spark-purple to-spark-lime p-4">
          <p className="text-sm font-bold text-spark-dark opacity-80">오늘도 챌린지 진행중! 🔥</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-black text-spark-dark">{overallPct}<span className="text-base"> / 100%</span></span>
          </div>
          <p className="mt-1 text-xs text-[#333333]">
            {100 - overallPct > 0 ? `100%까지 ${100 - overallPct}% 남았어요` : '챌린지를 모두 달성했어요!'}
          </p>
          <div className="mt-3 flex items-center">
            {Array.from({ length: 6 }).map((_, i) => {
              const filled = i < Math.round((overallPct / 100) * 6)
              return (
                <span key={i} className="flex items-center">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-spark-dark text-[11px] ${filled ? 'bg-spark-dark text-spark-lime' : 'bg-white/60 text-spark-dark/40'}`}>
                    {filled ? '●' : ''}
                  </span>
                  {i < 5 && <span className="h-0.5 w-3 bg-spark-dark/50" />}
                </span>
              )
            })}
            <span className="ml-1 text-xl">🏆</span>
          </div>
        </div>

        {/* 탭 */}
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-bold text-spark-dark">챌린지 리스트</h2>
          <span className="text-spark-text-secondary">▤</span>
        </div>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-medium transition-colors ${
                tab === t.key
                  ? 'bg-spark-soft-purple text-spark-purple'
                  : 'text-spark-gray'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 챌린지 리스트 */}
      <div className="flex-1 px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 text-4xl">🏆</div>
            <p className="text-sm text-spark-text-secondary">진행 중인 챌린지가 없어요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c as unknown as MockChallenge}
                joining={joining === c.id}
                onJoin={() => handleJoin(c.id)}
                onEventClick={() => navigate(`/challenges/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ChallengeCard({
  challenge: c,
  joining,
  onJoin,
  onEventClick,
}: {
  challenge: MockChallenge
  joining: boolean
  onJoin: () => void
  onEventClick: () => void
}) {
  const prog = c.progress
  const pct = prog
    ? Math.min(100, Math.round((prog.current_count / c.goal_count) * 100))
    : 0
  const completed = !!prog?.completed_at
  const joined = !!prog
  const isEvent = c.challenge_type === 'event'
  const isActive = (!c.ends_at || new Date(c.ends_at) > new Date()) && c.is_active

  const typeColors: Record<string, string> = {
    exercise: 'bg-spark-soft-purple text-spark-purple',
    spark: 'bg-[#FFF8D6] text-[#B8A020]',
    event: 'bg-[#FFE8F0] text-[#D04070]',
  }
  const typeLabels: Record<string, string> = { exercise: '운동', spark: '번개', event: '이벤트' }
  const typeEmoji: Record<string, string> = { exercise: '🏃', spark: '⚡', event: '🎁' }

  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${!isActive ? 'opacity-60' : ''}`}
      onClick={isEvent ? onEventClick : undefined}
    >
      <div className="flex items-start gap-3">
        {/* 트로피 아이콘 */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          completed ? 'bg-spark-lime' : 'bg-spark-soft-purple'
        }`}>
          <span className="text-2xl">{completed ? '🏆' : c.emoji ?? typeEmoji[c.challenge_type]}</span>
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[c.challenge_type]}`}>
              {typeLabels[c.challenge_type]}
            </span>
            {completed && (
              <span className="rounded-full bg-spark-lime px-2 py-0.5 text-xs font-bold text-spark-dark">완료 ✓</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-spark-dark">{c.title}</h3>
          {c.description && (
            <p className="mt-0.5 text-xs text-spark-text-secondary line-clamp-1">{c.description}</p>
          )}
        </div>

        <div className="shrink-0">
          <span className="rounded-full bg-spark-dark px-2 py-1 text-xs font-bold text-spark-lime">
            +{c.reward_xp} XP
          </span>
        </div>
      </div>

      {/* 진행률 바 */}
      {!isEvent && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-spark-text-secondary">
            <span>달성 {prog?.current_count ?? 0} / {c.goal_count}</span>
            <span className="font-medium text-spark-purple">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${completed ? 'bg-spark-lime' : 'bg-spark-purple'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* 마감일 */}
      {c.ends_at && (
        <p className="mt-2 text-xs text-spark-gray">
          마감: {new Date(c.ends_at).toLocaleDateString('ko-KR')}
        </p>
      )}

      {/* 버튼 */}
      {isEvent ? (
        <button className="mt-3 w-full rounded-full bg-spark-purple py-2.5 text-sm font-bold text-white">
          이벤트 상세보기 →
        </button>
      ) : !joined && isActive ? (
        <button
          onClick={e => { e.stopPropagation(); onJoin() }}
          disabled={joining}
          className="mt-3 w-full rounded-full bg-spark-lime py-2.5 text-sm font-bold text-spark-dark disabled:opacity-60"
        >
          {joining ? '참여 중...' : '챌린지 참여하기'}
        </button>
      ) : null}
    </div>
  )
}

function buildDateStrip() {
  const today = new Date()
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - 2 + index)
    return { day: date.getDate(), isToday: index === 2 }
  })
}
