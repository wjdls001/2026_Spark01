import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById, updateParticipantStatus, updateSparkStatus } from '@/features/sparks/api'
import { ALL_MOCK_SPARKS, buildMockParticipants, supplementParticipants } from '@/lib/mockData'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { exerciseLevelLabel } from '@/lib/utils/level'

type Participant = {
  id: string
  user_id: string
  role: string
  status: string
  requested_at: string
  approved_at: string | null
  profile: { id: string; nickname: string; avatar_url: string | null; exercise_level: string } | null
}

type SparkManage = {
  id: string
  title: string
  description: string | null
  place_name: string | null
  scheduled_at: string
  duration_minutes: number | null
  host_id: string
  capacity: number
  status: string
  participants: Participant[]
}

export function SparkManagePage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkManage | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<Participant | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isMock, setIsMock] = useState(false)

  async function load() {
    if (!sparkId) return
    const { data } = await fetchSparkById(sparkId)
    if (data) {
      const real = data as unknown as SparkManage
      // 실제로 만든 번개는 참여자가 거의 없는 경우가 많아 관리 화면이 항상 비어 보인다.
      // 호스트 본인을 제외한 참여자가 적으면 mock 유저로 신청자/확정자를 보충한다.
      setSpark({ ...real, participants: supplementParticipants(real.participants, real) })
      setIsMock(false)
    } else {
      // 테스트 단계: 운영 화면을 mock 번개에서도 확인할 수 있도록 더미 참여자를 채워준다.
      const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
      if (mock) setSpark({ ...mock, participants: buildMockParticipants(mock) } as unknown as SparkManage)
      setIsMock(true)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [sparkId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" /></div>
  }

  // 테스트 구현 단계 — 모임장 본인 확인 없이 누구나 관리 화면의 모든 기능에 접근할 수 있게 둔다.
  if (!spark) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-spark-text-secondary">번개를 찾을 수 없어요.</p>
        <button onClick={() => navigate(-1)} className="text-spark-purple">뒤로 가기</button>
      </div>
    )
  }

  const requested = spark.participants.filter(p => p.status === 'requested')
  const approved = spark.participants.filter(p => (p.status === 'approved' || p.status === 'attended') && p.role !== 'host')

  async function handleParticipant(id: string, status: 'approved' | 'rejected' | 'canceled') {
    setActionLoading(id)
    // mock 번개 전체이거나, 실제 번개에 보충된(실 DB 행이 아닌) 참여자라면 화면 상태만 갱신한다.
    if ((isMock || id.includes('-supp-')) && spark) {
      const approvedAt = status === 'approved' ? new Date().toISOString() : null
      setSpark({
        ...spark,
        participants: spark.participants.map(p => (p.id === id ? { ...p, status, approved_at: approvedAt } : p)),
      })
    } else {
      await updateParticipantStatus(id, status)
      await load()
    }
    setActionLoading(null)
  }

  async function handleRejectSubmit() {
    if (!rejectTarget) return
    await handleParticipant(rejectTarget.id, 'rejected')
    setRejectTarget(null)
    setRejectReason('')
  }

  async function handleSparkStatus(status: 'closed' | 'in_progress' | 'completed' | 'canceled') {
    if (!sparkId) return
    setActionLoading('spark')
    if (isMock && spark) {
      setSpark({ ...spark, status })
    } else {
      await updateSparkStatus(sparkId, status)
      await load()
    }
    setActionLoading(null)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-spark-dark">번개 관리</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* 모임 상세요약 카드 */}
        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <div className="mb-1">
            <h2 className="truncate text-sm font-bold text-spark-dark">{spark.title} · <StatusText status={spark.status} /></h2>
          </div>
          <p className="text-xs text-spark-text-secondary">
            📅 {formatTime(spark.scheduled_at)} · 📍 {spark.place_name ?? '장소 미정'} · 👥 {approved.length}/{spark.capacity - 1}명
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {spark.status === 'recruiting' && (
              <button onClick={() => handleSparkStatus('closed')} disabled={actionLoading === 'spark'}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-spark-text-secondary">
                모집 마감
              </button>
            )}
            {spark.status !== 'canceled' && spark.status !== 'completed' && (
              <button onClick={() => handleSparkStatus('completed')} disabled={actionLoading === 'spark'}
                className="rounded-full bg-spark-lime px-4 py-2 text-sm font-bold text-spark-dark">
                운동 완료
              </button>
            )}
            <button
              onClick={() => setRequestsOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-spark-soft-purple px-4 py-2 text-sm font-bold text-spark-purple"
            >
              신청관리
              {requested.length > 0 && <span className="rounded-full bg-spark-purple px-1.5 text-[10px] text-white">{requested.length}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* 신청관리 시트 — 참여 신청자 + 참여 확정자 */}
      {requestsOpen && (
        <div className="fixed inset-0 z-[1700] flex items-end justify-center bg-black/45" onClick={() => setRequestsOpen(false)}>
          <div className="flex w-full max-w-[440px] flex-col rounded-t-3xl bg-white px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-5" style={{ maxHeight: '85dvh' }} onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 overflow-y-auto">
            <h2 className="mb-4 text-base font-bold text-spark-dark">참여 신청자 ({requested.length})</h2>
            <div className="mb-2">
              {requested.length === 0 ? (
                <p className="py-10 text-center text-sm text-spark-gray">대기 중인 신청이 없어요.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {requested.map(p => (
                    <ParticipantRow
                      key={p.id}
                      participant={p}
                      onClick={() => navigate(`/users/${p.user_id}`)}
                      loading={actionLoading === p.id}
                      actions={
                        <div className="flex shrink-0 gap-2">
                          <button onClick={() => setRejectTarget(p)}
                            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-spark-text-secondary">
                            거절
                          </button>
                          <button onClick={() => handleParticipant(p.id, 'approved')}
                            className="rounded-full bg-spark-lime px-3 py-1.5 text-xs font-bold text-spark-dark">
                            승인
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <h2 className="mb-4 text-base font-bold text-spark-dark">참여 확정</h2>
            <div>
              {approved.length === 0 ? (
                <p className="py-10 text-center text-sm text-spark-gray">아직 참여 확정된 모임원이 없어요.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {approved.map(p => (
                    <ParticipantRow
                      key={p.id}
                      participant={p}
                      onClick={() => navigate(`/users/${p.user_id}`)}
                      loading={actionLoading === p.id}
                      actions={
                        <button onClick={() => handleParticipant(p.id, 'canceled')}
                          className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500">
                          취소
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* 거절 사유 팝업 */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/45 px-6" onClick={() => setRejectTarget(null)}>
          <div className="spark-modal-panel w-full rounded-spark-xl bg-white p-6 shadow-spark-floating" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-spark-dark">{rejectTarget.profile?.nickname ?? '참여자'}님의 신청을 거절할까요?</h2>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력해주세요"
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setRejectTarget(null)} className="h-12 rounded-full bg-spark-muted text-sm font-bold text-spark-text-secondary">취소</button>
              <button onClick={handleRejectSubmit} className="h-12 rounded-full bg-spark-error text-sm font-bold text-white">거절하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ParticipantRow({
  participant: p,
  onClick,
  loading,
  actions,
}: {
  participant: Participant
  onClick: () => void
  loading?: boolean
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <button onClick={onClick} className="flex flex-1 items-center gap-3 text-left">
        <SparkCharacter size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-spark-dark">{p.profile?.nickname ?? '알 수 없음'}</div>
          <div className="truncate text-xs text-spark-text-secondary">{exerciseLevelLabel(p.profile?.exercise_level)} · {formatTime(p.requested_at)} 신청</div>
        </div>
      </button>
      {loading ? (
        <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" />
      ) : actions}
    </div>
  )
}

function StatusText({ status }: { status: string }) {
  const map: Record<string, string> = {
    recruiting: '모집 중', closed: '마감', in_progress: '진행 중', completed: '완료', canceled: '취소',
  }
  return <span className="text-spark-purple">{map[status] ?? status}</span>
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
