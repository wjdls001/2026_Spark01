import { useState, useEffect } from 'react'
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
  emoji: string
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
  const { user } = useAuth()
  const [tab, setTab] = useState<TabKey>('all')
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MockChallenge | null>(null)

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

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col bg-gray-50">
      {/* 상단 배너 카드 */}
      <div className="bg-white px-5 pt-5 pb-4 shadow-sm">
        <h1 className="mb-4 text-xl font-bold text-[#111111]">챌린지</h1>

        {/* 진행 중 배너 */}
        <div className="mb-4 rounded-3xl bg-gradient-to-r from-[#9B8FFF] to-[#C8FF3E] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#111111] opacity-80">오늘도</p>
              <p className="text-lg font-bold text-[#111111]">챌린지 진행중! 🔥</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-white/40">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#111111]">{overallPct}%</span>
              </div>
              <p className="mt-1 text-xs text-[#333333]">
                챌린지 달성도 {overallPct} / 100
              </p>
            </div>
            <div className="text-5xl opacity-80">🏆</div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-medium transition-colors ${
                tab === t.key
                  ? 'bg-[#EEE8FF] text-[#9B8FFF]'
                  : 'text-[#999999]'
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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 text-4xl">🏆</div>
            <p className="text-sm text-[#777777]">진행 중인 챌린지가 없어요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c as unknown as MockChallenge}
                joining={joining === c.id}
                onJoin={() => handleJoin(c.id)}
                onEventClick={() => setSelectedEvent(c as unknown as MockChallenge)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 이벤트 상세 모달 */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="max-h-[80dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111111]">이벤트 상세보기</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-[#999999]">✕</button>
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#111111]">{selectedEvent.title}</h3>
            <p className="mb-4 text-sm text-[#555555]">{selectedEvent.description}</p>
            <button className="mb-5 w-full rounded-full bg-[#9B8FFF] py-3 text-sm font-bold text-white">
              참여하기
            </button>
            <p className="mb-3 text-xs font-bold text-[#333333]">스파크와 함께<br />건강도, 선물도 모두 챙겨가세요</p>
            {selectedEvent.event_rewards?.map((r, i) => (
              <div key={i} className="mb-3 rounded-xl bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{i === 0 ? '🥇' : '🥈'}</span>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">{r.rank}</p>
                    <p className="text-xs text-[#555555]">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
            {selectedEvent.event_date && (
              <div className="mt-3 rounded-xl bg-[#EEE8FF] p-3 text-xs text-[#555555]">
                <p>일시: {selectedEvent.event_date}</p>
                {selectedEvent.event_place && <p>장소: {selectedEvent.event_place}</p>}
              </div>
            )}
          </div>
        </div>
      )}
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
    exercise: 'bg-[#EEE8FF] text-[#9B8FFF]',
    spark: 'bg-[#FFF8D6] text-[#B8A020]',
    event: 'bg-[#FFE8F0] text-[#D04070]',
  }
  const typeLabels: Record<string, string> = { exercise: '운동', spark: '번개', event: '이벤트' }

  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${!isActive ? 'opacity-60' : ''}`}
      onClick={isEvent ? onEventClick : undefined}
    >
      <div className="flex items-start gap-3">
        {/* 트로피 아이콘 */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          completed ? 'bg-[#C8FF3E]' : 'bg-[#EEE8FF]'
        }`}>
          <span className="text-2xl">{completed ? '🏆' : c.emoji}</span>
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[c.challenge_type]}`}>
              {typeLabels[c.challenge_type]}
            </span>
            {completed && (
              <span className="rounded-full bg-[#C8FF3E] px-2 py-0.5 text-xs font-bold text-[#111111]">완료 ✓</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-[#111111]">{c.title}</h3>
          {c.description && (
            <p className="mt-0.5 text-xs text-[#777777] line-clamp-1">{c.description}</p>
          )}
        </div>

        <div className="shrink-0">
          <span className="rounded-full bg-[#111111] px-2 py-1 text-xs font-bold text-[#C8FF3E]">
            +{c.reward_xp} XP
          </span>
        </div>
      </div>

      {/* 진행률 바 */}
      {!isEvent && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-[#777777]">
            <span>달성 {prog?.current_count ?? 0} / {c.goal_count}</span>
            <span className="font-medium text-[#9B8FFF]">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${completed ? 'bg-[#C8FF3E]' : 'bg-[#9B8FFF]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* 마감일 */}
      {c.ends_at && (
        <p className="mt-2 text-xs text-[#BBBBBB]">
          마감: {new Date(c.ends_at).toLocaleDateString('ko-KR')}
        </p>
      )}

      {/* 버튼 */}
      {isEvent ? (
        <button className="mt-3 w-full rounded-full bg-[#9B8FFF] py-2.5 text-sm font-bold text-white">
          이벤트 상세보기 →
        </button>
      ) : !joined && isActive ? (
        <button
          onClick={e => { e.stopPropagation(); onJoin() }}
          disabled={joining}
          className="mt-3 w-full rounded-full bg-[#C8FF3E] py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60"
        >
          {joining ? '참여 중...' : '챌린지 참여하기'}
        </button>
      ) : null}
    </div>
  )
}
