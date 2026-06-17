import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { fetchChallenges, fetchChallengeProgress, joinChallenge } from '@/features/challenges/api'
import type { Challenge, ChallengeProgress } from '@/types/database'

type ChallengeWithProgress = Challenge & { progress?: ChallengeProgress }

const TABS = [
  { key: 'exercise', label: '운동' },
  { key: 'spark', label: '번개' },
  { key: 'event', label: '이벤트' },
] as const

export function ChallengesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'exercise' | 'spark' | 'event'>('exercise')
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  async function load() {
    if (!user) return
    setLoading(true)
    const [{ data: cList }, { data: prog }] = await Promise.all([
      fetchChallenges(tab),
      fetchChallengeProgress(user.id),
    ])
    if (cList) {
      setChallenges(
        cList.map(c => ({
          ...c,
          progress: prog?.find(p => p.challenge_id === c.id),
        }))
      )
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

  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white px-5 pt-5 pb-0 shadow-sm">
        <h1 className="mb-4 text-xl font-bold text-[#111111]">챌린지</h1>
        <div className="flex gap-0 border-b border-gray-100">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-[#9B8FFF] text-[#9B8FFF]'
                  : 'text-[#999999]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-sm text-[#777777]">진행 중인 챌린지가 없어요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                joining={joining === c.id}
                onJoin={() => handleJoin(c.id)}
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
}: {
  challenge: ChallengeWithProgress
  joining: boolean
  onJoin: () => void
}) {
  const pct = c.progress
    ? Math.min(100, Math.round((c.progress.current_count / c.goal_count) * 100))
    : 0
  const completed = !!c.progress?.completed_at
  const joined = !!c.progress

  const typeColors: Record<string, string> = {
    exercise: 'bg-[#EEE8FF] text-[#9B8FFF]',
    spark: 'bg-[#FFF8D6] text-[#B8A020]',
    event: 'bg-[#FFE8E8] text-[#D04040]',
  }

  const typeLabels: Record<string, string> = {
    exercise: '운동', spark: '번개', event: '이벤트',
  }

  const isActive = (!c.ends_at || new Date(c.ends_at) > new Date()) && c.is_active

  return (
    <div className={`rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${!isActive ? 'opacity-60' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[c.challenge_type]}`}>
              {typeLabels[c.challenge_type]}
            </span>
            {completed && (
              <span className="rounded-full bg-[#C8FF3E] px-2 py-0.5 text-xs font-bold text-[#111111]">완료 ✓</span>
            )}
          </div>
          <h3 className="text-base font-bold text-[#111111]">{c.title}</h3>
          {c.description && <p className="mt-1 text-sm text-[#777777]">{c.description}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold text-[#C8FF3E] bg-[#111111] rounded-full px-2 py-0.5">+{c.reward_xp} XP</div>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-[#777777]">
        <span>달성 {c.progress?.current_count ?? 0} / {c.goal_count}</span>
        <span className="font-medium text-[#9B8FFF]">{pct}%</span>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${completed ? 'bg-[#C8FF3E]' : 'bg-[#9B8FFF]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {c.ends_at && (
        <div className="mb-3 text-xs text-[#AAAAAA]">
          마감: {new Date(c.ends_at).toLocaleDateString('ko-KR')}
        </div>
      )}

      {!joined && isActive && (
        <button onClick={onJoin} disabled={joining}
          className="w-full rounded-full bg-[#C8FF3E] py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">
          {joining ? '참여 중...' : '챌린지 참여하기'}
        </button>
      )}
    </div>
  )
}
