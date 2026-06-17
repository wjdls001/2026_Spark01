import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchChallenges, fetchChallengeProgress, joinChallenge } from '@/features/challenges/api'
import { MOCK_CHALLENGES } from '@/lib/mockData'

type ChallengeDetail = {
  id: string
  title: string
  description: string | null
  challenge_type: string
  goal_count: number
  reward_xp: number
  ends_at: string | null
  emoji?: string
  event_rewards?: { rank: string; desc: string }[]
  event_date?: string
  event_place?: string
  progress?: { current_count: number; completed_at: string | null } | null
}

export function ChallengeDetailPage() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!challengeId || !user) return
    Promise.all([fetchChallenges(), fetchChallengeProgress(user.id)])
      .then(([{ data: cList }, { data: prog }]) => {
        const found = cList?.find(c => c.id === challengeId)
        if (found) {
          setChallenge({ ...found, progress: prog?.find(p => p.challenge_id === found.id) })
        } else {
          const mock = MOCK_CHALLENGES.find(c => c.id === challengeId)
          if (mock) setChallenge(mock as unknown as ChallengeDetail)
        }
      })
      .catch(() => {
        const mock = MOCK_CHALLENGES.find(c => c.id === challengeId)
        if (mock) setChallenge(mock as unknown as ChallengeDetail)
      })
  }, [challengeId, user])

  async function handleJoin() {
    if (!user || !challengeId) return
    setJoining(true)
    await joinChallenge(challengeId, user.id)
    setJoining(false)
  }

  if (!challenge) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
      </div>
    )
  }

  const isEvent = challenge.challenge_type === 'event'
  const joined = !!challenge.progress
  const pct = challenge.progress
    ? Math.min(100, Math.round((challenge.progress.current_count / challenge.goal_count) * 100))
    : 0

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="flex items-center gap-3 px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">{isEvent ? '이벤트 상세' : '챌린지 상세'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h2 className="mb-2 text-xl font-bold text-[#111111]">{challenge.title}</h2>
        {challenge.description && <p className="mb-4 text-sm text-[#555555]">{challenge.description}</p>}

        {!isEvent && (
          <div className="mb-5">
            <div className="mb-1 flex items-center justify-between text-xs text-[#777777]">
              <span>달성 {challenge.progress?.current_count ?? 0} / {challenge.goal_count}</span>
              <span className="font-medium text-[#9B8FFF]">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#9B8FFF]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining || joined}
          className="mb-5 w-full rounded-full bg-[#9B8FFF] py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {joined ? '참여 중' : joining ? '참여 중...' : '참여하기'}
        </button>

        <div className="mb-5 rounded-xl bg-[#111111] px-4 py-3 text-center">
          <span className="text-[#C8FF3E] font-bold">+{challenge.reward_xp} XP</span>
          <span className="ml-2 text-[#AAAAAA] text-sm">완료 보상</span>
        </div>

        {isEvent && (
          <>
            <p className="mb-3 text-xs font-bold text-[#333333]">스파크와 함께<br />건강도, 선물도 모두 챙겨가세요</p>
            {challenge.event_rewards?.map((r, i) => (
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
            {challenge.event_date && (
              <div className="mt-3 rounded-xl bg-[#EEE8FF] p-3 text-xs text-[#555555]">
                <p>일시: {challenge.event_date}</p>
                {challenge.event_place && <p>장소: {challenge.event_place}</p>}
              </div>
            )}
          </>
        )}

        {challenge.ends_at && (
          <p className="mt-4 text-xs text-[#BBBBBB]">마감: {new Date(challenge.ends_at).toLocaleDateString('ko-KR')}</p>
        )}
      </div>
    </div>
  )
}
