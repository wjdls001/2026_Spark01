import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchSparkById, updateParticipantStatus, updateSparkStatus } from '@/features/sparks/api'

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
  host_id: string
  capacity: number
  status: string
  participants: Participant[]
}

export function SparkManagePage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [spark, setSpark] = useState<SparkManage | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function load() {
    if (!sparkId) return
    const { data } = await fetchSparkById(sparkId)
    if (data) setSpark(data as unknown as SparkManage)
    setLoading(false)
  }

  useEffect(() => { load() }, [sparkId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" /></div>
  }

  if (!spark || spark.host_id !== user?.id) {
    return <div className="flex min-h-dvh items-center justify-center"><p className="text-[#777777]">접근 권한이 없어요</p></div>
  }

  const requested = spark.participants.filter(p => p.status === 'requested')
  const approved = spark.participants.filter(p => (p.status === 'approved' || p.status === 'attended') && p.role !== 'host')
  const others = spark.participants.filter(p => ['rejected', 'canceled', 'no_show'].includes(p.status))

  async function handleParticipant(id: string, status: 'approved' | 'rejected' | 'canceled') {
    setActionLoading(id)
    await updateParticipantStatus(id, status)
    await load()
    setActionLoading(null)
  }

  async function handleSparkStatus(status: 'closed' | 'in_progress' | 'completed' | 'canceled') {
    if (!sparkId) return
    setActionLoading('spark')
    await updateSparkStatus(sparkId, status)
    await load()
    setActionLoading(null)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-[#111111]">번개 관리</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* 번개 상태 관리 */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <h2 className="mb-3 text-sm font-bold text-[#111111]">번개 상태: <StatusText status={spark.status} /></h2>
          <div className="flex flex-wrap gap-2">
            {spark.status === 'recruiting' && (
              <button onClick={() => handleSparkStatus('closed')} disabled={actionLoading === 'spark'}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-[#555555]">
                모집 마감
              </button>
            )}
            {(spark.status === 'recruiting' || spark.status === 'closed') && (
              <button onClick={() => handleSparkStatus('in_progress')} disabled={actionLoading === 'spark'}
                className="rounded-full bg-[#9B8FFF] px-4 py-2 text-sm font-medium text-white">
                운동 시작
              </button>
            )}
            {spark.status === 'in_progress' && (
              <button onClick={() => handleSparkStatus('completed')} disabled={actionLoading === 'spark'}
                className="rounded-full bg-[#C8FF3E] px-4 py-2 text-sm font-bold text-[#111111]">
                운동 완료
              </button>
            )}
            {spark.status !== 'canceled' && spark.status !== 'completed' && (
              <button onClick={() => handleSparkStatus('canceled')} disabled={actionLoading === 'spark'}
                className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-500">
                번개 취소
              </button>
            )}
          </div>
        </div>

        {/* 승인 대기 */}
        {requested.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-3 text-sm font-bold text-[#111111]">승인 대기 ({requested.length})</h2>
            <div className="flex flex-col gap-3">
              {requested.map(p => (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  loading={actionLoading === p.id}
                  actions={
                    <div className="flex gap-2">
                      <button onClick={() => handleParticipant(p.id, 'rejected')}
                        className="flex-1 rounded-full border border-gray-300 py-2 text-sm text-[#555555]">
                        거절
                      </button>
                      <button onClick={() => handleParticipant(p.id, 'approved')}
                        className="flex-1 rounded-full bg-[#C8FF3E] py-2 text-sm font-bold text-[#111111]">
                        승인
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* 승인된 참여자 */}
        {approved.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-3 text-sm font-bold text-[#111111]">참여 확정 ({approved.length}/{spark.capacity - 1})</h2>
            <div className="flex flex-col gap-3">
              {approved.map(p => (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  loading={actionLoading === p.id}
                  actions={
                    <button onClick={() => handleParticipant(p.id, 'canceled')}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500">
                      취소
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* 거절/취소 */}
        {others.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold text-[#777777]">거절/취소 ({others.length})</h2>
            <div className="flex flex-col gap-2">
              {others.map(p => (
                <ParticipantCard key={p.id} participant={p} loading={false} />
              ))}
            </div>
          </div>
        )}

        {spark.participants.filter(p => p.role !== 'host').length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm text-[#999999]">아직 신청자가 없어요.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ParticipantCard({
  participant: p,
  loading,
  actions,
}: {
  participant: { id: string; profile: { nickname: string; exercise_level: string } | null; status: string; requested_at: string }
  loading: boolean
  actions?: React.ReactNode
}) {
  const statusMap: Record<string, string> = {
    requested: '대기 중',
    approved: '확정',
    rejected: '거절',
    canceled: '취소',
    attended: '참석',
    no_show: '노쇼',
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[#EEE8FF] flex items-center justify-center text-sm font-bold text-[#9B8FFF]">
          {p.profile?.nickname?.[0] ?? '?'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[#111111]">{p.profile?.nickname ?? '알 수 없음'}</div>
          <div className="text-xs text-[#777777]">{levelLabel(p.profile?.exercise_level ?? '')} · {formatTime(p.requested_at)} 신청</div>
        </div>
        <span className="text-xs text-[#AAAAAA]">{statusMap[p.status] ?? p.status}</span>
      </div>
      {loading ? (
        <div className="flex justify-center py-1">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
        </div>
      ) : actions}
    </div>
  )
}

function StatusText({ status }: { status: string }) {
  const map: Record<string, string> = {
    recruiting: '모집 중', closed: '마감', in_progress: '진행 중', completed: '완료', canceled: '취소',
  }
  return <span className="text-[#9B8FFF]">{map[status] ?? status}</span>
}

function levelLabel(level: string) {
  const map: Record<string, string> = { beginner: '초보자', intermediate: '중급자', advanced: '고급자', expert: '전문가' }
  return map[level] ?? level
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
