import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchSparkById, createSparkReview, reportUser } from '@/features/sparks/api'
import { ALL_MOCK_SPARKS, buildMockParticipants } from '@/lib/mockData'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { Toast } from '@/components/common/Toast'
import { useToast } from '@/lib/utils/useToast'

const KEYWORDS = [
  '열정적이에요', '페이스 잘 맞춰줘요', '포기를 모르는 끈기', '시간 약속 칼같아요',
  '안전하게 운동해요', '말 걸기 편해요', '배려심 있어요', '분위기 메이커예요',
]

type Participant = { user_id: string; role: string; status: string; profile: { id: string; nickname: string } | null }

export function SparkReviewPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [keywordsByUser, setKeywordsByUser] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<Participant | null>(null)
  const [reportTarget, setReportTarget] = useState<Participant | null>(null)
  const [reportReason, setReportReason] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (!sparkId) return
    fetchSparkById(sparkId)
      .then(({ data }) => {
        let spark = data as unknown as { participants?: Participant[] } | undefined
        if (!spark) {
          const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
          if (mock) spark = { participants: buildMockParticipants(mock) as unknown as Participant[] }
        }
        setParticipants((spark?.participants ?? []).filter(
          p => (p.status === 'approved' || p.status === 'attended') && p.user_id !== user?.id
        ))
        setLoading(false)
      })
      .catch(() => {
        const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
        const participants = mock ? (buildMockParticipants(mock) as unknown as Participant[]) : []
        setParticipants(participants.filter(p => (p.status === 'approved' || p.status === 'attended') && p.user_id !== user?.id))
        setLoading(false)
      })
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
    const sessionState = location.state as Record<string, unknown> | null
    if (sessionState?.mode === 'spark') {
      navigate('/exercise/result', { state: sessionState, replace: true })
    } else {
      navigate(`/sparks/${sparkId}`, { replace: true })
    }
  }

  async function handleReportSubmit() {
    if (!user || !reportTarget || !reportReason.trim()) return
    await reportUser({
      reporter_id: user.id,
      target_user_id: reportTarget.user_id,
      spark_id: sparkId,
      reason: reportReason.trim(),
    })
    setReportTarget(null)
    setReportReason('')
    toast.show('신고가 접수되었어요')
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-spark-dark">운동 종료</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="mb-4 text-sm text-spark-text-secondary">함께 운동한 분들의 프로필을 눌러 키워드 후기를 남겨주세요.</p>

        {participants.length === 0 ? (
          <p className="py-10 text-center text-sm text-spark-gray">후기를 남길 참여자가 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {participants.map(p => (
              <div key={p.user_id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <button onClick={() => setReviewTarget(p)} className="flex flex-1 items-center gap-3 text-left">
                  <SparkCharacter size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-spark-dark">{p.profile?.nickname ?? '참여자'}</div>
                    <div className="text-xs text-spark-purple">
                      {(keywordsByUser[p.user_id] ?? []).length > 0 ? `키워드 ${(keywordsByUser[p.user_id] ?? []).length}개 선택됨` : '눌러서 후기 남기기'}
                    </div>
                  </div>
                </button>
                <button onClick={() => setReportTarget(p)} className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-spark-text-secondary">
                  신고
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark disabled:opacity-60"
        >
          {submitting ? '저장 중...' : '후기 저장하기 ⚡'}
        </button>
      </div>

      {reviewTarget && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/45" onClick={() => setReviewTarget(null)}>
          <div className="w-full max-w-[440px] rounded-t-3xl bg-white px-6 pb-[max(env(safe-area-inset-bottom),32px)] pt-6" onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <div className="flex items-center gap-3">
              <SparkCharacter size="sm" />
              <h2 className="text-base font-bold text-spark-dark">{reviewTarget.profile?.nickname ?? '참여자'}님에게 키워드를 남겨주세요</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {KEYWORDS.map(k => (
                <button
                  key={k}
                  onClick={() => toggleKeyword(reviewTarget.user_id, k)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium ${
                    (keywordsByUser[reviewTarget.user_id] ?? []).includes(k)
                      ? 'border-spark-purple bg-spark-purple text-white'
                      : 'border-gray-200 text-spark-text-secondary'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <button onClick={() => setReviewTarget(null)} className="mt-6 h-12 w-full rounded-full bg-spark-lime text-sm font-bold text-spark-dark">
              완료
            </button>
          </div>
        </div>
      )}

      {reportTarget && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 px-6" onClick={() => setReportTarget(null)}>
          <div className="spark-modal-panel w-full rounded-spark-xl bg-white p-6 shadow-spark-floating" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-spark-dark">{reportTarget.profile?.nickname ?? '참여자'}님을 신고할까요?</h2>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="신고 사유를 입력해주세요"
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setReportTarget(null)} className="h-12 rounded-full bg-spark-muted text-sm font-bold text-spark-text-secondary">취소</button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
                className="h-12 rounded-full bg-spark-error text-sm font-bold text-white disabled:opacity-50"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.message && <Toast message={toast.message} onDone={toast.clear} />}
    </div>
  )
}
