import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchSparkById, createSparkReview } from '@/features/sparks/api'
import { MOCK_SPARKS } from '@/lib/mockData'

const KEYWORDS = [
  '시간약속을 잘 지켜요',
  '친절해요',
  '운동 실력이 좋아요',
  '분위기가 좋아요',
  '다시 만나고 싶어요',
]

type Participant = { user_id: string; role: string; status: string; profile: { id: string; nickname: string } | null }

export function SparkReviewPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [keywordsByUser, setKeywordsByUser] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!sparkId) return
    fetchSparkById(sparkId)
      .then(({ data }) => {
        const spark = (data ?? MOCK_SPARKS.find(s => s.id === sparkId)) as unknown as { participants?: Participant[] } | undefined
        setParticipants((spark?.participants ?? []).filter(
          p => (p.status === 'approved' || p.status === 'attended') && p.user_id !== user?.id
        ))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [sparkId, user])

  function toggleKeyword(userId: string, keyword: string) {
    setKeywordsByUser(prev => {
      const current = prev[userId] ?? []
      return {
        ...prev,
        [userId]: current.includes(keyword) ? current.filter(k => k !== keyword) : [...current, keyword],
      }
    })
  }

  async function handleSubmit() {
    if (!user || !sparkId) return
    setSubmitting(true)
    await Promise.all(
      participants.map(p =>
        createSparkReview({
          spark_id: sparkId,
          reviewer_id: user.id,
          reviewee_id: p.user_id,
          keywords: keywordsByUser[p.user_id] ?? [],
        })
      )
    )
    setSubmitting(false)
    navigate(`/sparks/${sparkId}`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">후기 남기기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="mb-4 text-sm text-[#777777]">함께 운동한 분들에게 키워드로 후기를 남겨주세요.</p>

        {participants.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#999999]">후기를 남길 참여자가 없어요.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {participants.map(p => (
              <div key={p.user_id} className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <h3 className="mb-3 text-sm font-bold text-[#111111]">{p.profile?.nickname ?? '참여자'}</h3>
                <div className="flex flex-wrap gap-2">
                  {KEYWORDS.map(k => (
                    <button
                      key={k}
                      onClick={() => toggleKeyword(p.user_id, k)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        (keywordsByUser[p.user_id] ?? []).includes(k)
                          ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                          : 'border-gray-200 text-[#555555]'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || participants.length === 0}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60"
        >
          {submitting ? '제출 중...' : '후기 남기기 ⚡'}
        </button>
      </div>
    </div>
  )
}
