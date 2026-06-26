import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchSparkById, applyToSpark, cancelParticipation } from '@/features/sparks/api'
import { MapView } from '@/features/map/MapView'
import { ALL_MOCK_SPARKS, buildMockParticipants, SPORT_EMOJI } from '@/lib/mockData'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { Toast } from '@/components/common/Toast'
import { useToast } from '@/lib/utils/useToast'
import { exerciseLevelLabel } from '@/lib/utils/level'

const GENDER_LABEL: Record<string, string> = { male: '남성', female: '여성', other: '이외' }

type ParticipantWithProfile = {
  id: string
  user_id: string
  role: string
  status: string
  profile: { id: string; nickname: string; avatar_url: string | null; exercise_level: string; gender?: string | null; birth_year?: number | null } | null
}

type SparkDetail = {
  id: string
  title: string
  description: string | null
  place_name: string | null
  address: string | null
  latitude?: number | null
  longitude?: number | null
  scheduled_at: string
  duration_minutes: number | null
  capacity: number
  min_level: string | null
  max_level: string | null
  gender_condition: string | null
  host_id: string
  status: string
  host: { id: string; nickname: string; avatar_url: string | null; trust_score: number; exercise_level: string } | null
  sport: { id: string; code: string; name: string } | null
  participants: ParticipantWithProfile[]
}

export function SparkDetailPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [spark, setSpark] = useState<SparkDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!sparkId) return
    fetchSparkById(sparkId)
      .then(({ data }) => {
        if (data) {
          setSpark(data as unknown as SparkDetail)
          setIsMock(false)
        } else {
          const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
          if (mock) setSpark({ ...mock, participants: buildMockParticipants(mock) } as unknown as SparkDetail)
          setIsMock(true)
        }
        setLoading(false)
      })
      .catch(() => {
        const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
        if (mock) setSpark({ ...mock, participants: buildMockParticipants(mock) } as unknown as SparkDetail)
        setIsMock(true)
        setLoading(false)
      })
  }, [sparkId])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" />
      </div>
    )
  }

  if (!spark) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5">
        <p className="text-spark-text-secondary">번개를 찾을 수 없어요.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-spark-purple">뒤로 가기</button>
      </div>
    )
  }

  const approvedCount = spark.participants.filter(
    p => p.status === 'approved' || p.status === 'attended' || p.role === 'host'
  ).length
  const myParticipation = spark.participants.find(p => p.user_id === user?.id)
  const isHost = spark.host_id === user?.id
  const isFull = approvedCount >= spark.capacity
  const canApply = !isHost && !myParticipation && !isFull && spark.status === 'recruiting'
  const canReview = spark.status === 'completed' &&
    (isHost || myParticipation?.status === 'approved' || myParticipation?.status === 'attended')
  const sportCode = (spark.sport as { code?: string } | null)?.code ?? ''
  const emoji = SPORT_EMOJI[sportCode] ?? '⚡'

  async function handleApply() {
    if (!user || !sparkId || !spark) return
    setApplying(true)
    setError('')

    // mock 번개(실제 DB row가 없는 더미 데이터)는 실 API를 호출하면 UUID 형식 오류로 항상 실패하므로
    // 화면 상태만 직접 갱신해 신청 흐름을 시연한다.
    if (isMock) {
      setSpark({
        ...spark,
        participants: [
          ...spark.participants,
          {
            id: `${spark.id}-p-self-${Date.now()}`,
            user_id: user.id,
            role: 'member',
            status: 'requested',
            profile: { id: user.id, nickname: '나', avatar_url: null, exercise_level: 'beginner' },
          },
        ],
      })
      toast.show('신청이 완료되었습니다')
      setApplying(false)
      return
    }

    const { error: err } = await applyToSpark(sparkId, user.id)
    if (err) {
      setError('신청에 실패했어요.')
    } else {
      const { data } = await fetchSparkById(sparkId)
      if (data) setSpark(data as unknown as SparkDetail)
      toast.show('신청이 완료되었습니다')
    }
    setApplying(false)
  }

  async function handleCancelRequest() {
    if (!myParticipation || !spark) return
    setCanceling(true)
    if (isMock) {
      setSpark({ ...spark, participants: spark.participants.filter(p => p.id !== myParticipation.id) })
    } else {
      await cancelParticipation(myParticipation.id)
      if (sparkId) {
        const { data } = await fetchSparkById(sparkId)
        if (data) setSpark(data as unknown as SparkDetail)
      }
    }
    setCanceling(false)
    setCancelConfirmOpen(false)
    toast.show('참여 신청을 취소했어요')
  }

  const myStatusLabel = () => {
    if (isHost) return null
    if (!myParticipation) return null
    const map: Record<string, string> = {
      requested: '승인 대기 중', approved: '참여 확정', rejected: '거절됨',
      canceled: '취소됨', attended: '운동 완료', no_show: '노쇼',
    }
    return map[myParticipation.status] ?? myParticipation.status
  }

  const hasMap = spark.latitude && spark.longitude

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-spark-dark">{spark.title}</h1>
        {isHost && (
          <button onClick={() => navigate(`/sparks/${sparkId}/manage`)}
            className="text-sm font-medium text-spark-purple">관리</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* 지도 영역 */}
        {hasMap && (
          <div className="relative h-52 w-full">
            <MapView
              center={[spark.latitude!, spark.longitude!]}
              zoom={15}
              pins={[{ id: spark.id, lat: spark.latitude!, lng: spark.longitude!, label: spark.title }]}
            />
          </div>
        )}

        {/* 타이틀 카드 */}
        <div className="mx-4 -mt-5 relative z-10 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.12)]">
          <div className="mb-2 flex items-center gap-2">
            {spark.sport && (
              <span className="rounded-full bg-spark-soft-purple px-3 py-1 text-xs text-spark-purple">
                {emoji} {spark.sport.name}
              </span>
            )}
            <StatusBadge status={spark.status} />
          </div>
          <h2 className="text-lg font-bold text-spark-dark">{spark.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-spark-text-secondary">
            <span>📅 {formatFull(spark.scheduled_at)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 px-4">
          {/* 핵심 정보 */}
          <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h3 className="mb-3 text-sm font-bold text-spark-dark">모임 정보</h3>
            <div className="flex flex-col gap-2">
              {spark.duration_minutes && (
                <InfoRow icon="⏱" label="진행 시간" value={`약 ${spark.duration_minutes}분`} />
              )}
              {spark.place_name && (
                <InfoRow icon="📍" label="장소" value={spark.place_name} />
              )}
              {spark.address && (
                <div className="pl-7 text-xs text-spark-gray">{spark.address}</div>
              )}
              <InfoRow icon="👥" label="정원"
                value={`${approvedCount}/${spark.capacity}명 참여`}
                highlight={!isFull}
              />
              {spark.min_level && (
                <InfoRow icon="🏅" label="레벨 조건"
                  value={`${levelLabel(spark.min_level)}${spark.max_level && spark.max_level !== spark.min_level ? ` ~ ${levelLabel(spark.max_level)}` : ''} 이상`}
                />
              )}
              {spark.gender_condition && spark.gender_condition !== 'any' && (
                <InfoRow icon="👤" label="성별"
                  value={spark.gender_condition === 'male' ? '남성만' : '여성만'}
                />
              )}
            </div>
          </div>

          {/* 설명 */}
          {spark.description && (
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h3 className="mb-2 text-sm font-bold text-spark-dark">상세 설명</h3>
              <p className="whitespace-pre-line text-sm text-spark-text-secondary">{spark.description}</p>
            </div>
          )}

          {/* 참여자 (모임장 포함) */}
          {spark.participants.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h3 className="mb-3 text-sm font-bold text-spark-dark">
                참여자 <span className="text-spark-purple">{approvedCount}/{spark.capacity}</span>
              </h3>
              <div className="flex flex-col gap-3">
                {spark.participants
                  .filter(p => p.status === 'approved' || p.status === 'attended' || p.role === 'host')
                  .sort((a, b) => (a.role === 'host' ? -1 : b.role === 'host' ? 1 : 0))
                  .map(p => {
                    const age = p.profile?.birth_year ? new Date().getFullYear() - p.profile.birth_year : null
                    const gender = p.profile?.gender ? GENDER_LABEL[p.profile.gender] ?? p.profile.gender : null
                    return (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/users/${p.user_id}`)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <SparkCharacter size="sm" ring={p.role === 'host' ? 'lime' : 'none'} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-bold text-spark-dark">{p.profile?.nickname ?? '참여자'}</span>
                            {p.role === 'host' && (
                              <span className="shrink-0 rounded-full bg-spark-lime px-2 py-0.5 text-[10px] font-bold text-spark-dark">모임장</span>
                            )}
                          </div>
                          <div className="truncate text-xs text-spark-text-secondary">
                            {[age ? `${age}세` : null, gender, exerciseLevelLabel(p.profile?.exercise_level)].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <span className="text-spark-gray">›</span>
                      </button>
                    )
                  })}
                {/* 빈 슬롯 */}
                {Array.from({ length: Math.max(0, spark.capacity - approvedCount) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 opacity-60">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-200">
                      <span className="text-lg text-gray-300">+</span>
                    </div>
                    <span className="text-xs text-spark-gray">모집 중</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 — 모임장은 헤더의 '관리'로 이미 충분하므로, 보여줄 내용이 있을 때만 노출한다 */}
      {(canApply || canReview || error || (myStatusLabel() && !canApply) || (isFull && !myParticipation && !isHost)) && (
      <div className="fixed bottom-0 left-1/2 w-full max-w-[440px] -translate-x-1/2 bg-white px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        {myStatusLabel() && !canApply && (
          <div className="mb-3 rounded-full bg-spark-soft-purple py-2 text-center text-sm font-medium text-spark-purple">
            {myStatusLabel()}
          </div>
        )}
        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
        {canApply && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark disabled:opacity-60"
          >
            {applying ? '신청 중...' : '참여 신청하기 ⚡'}
          </button>
        )}
        {myParticipation?.status === 'requested' && (
          <>
            <p className="mb-2 text-center text-xs text-spark-gray">모임장 승인 전에만 신청을 취소할 수 있어요</p>
            <button
              onClick={() => setCancelConfirmOpen(true)}
              className="w-full rounded-full border border-red-200 py-4 text-base font-bold text-red-500"
            >
              참여 신청 취소
            </button>
          </>
        )}
        {isFull && !myParticipation && !isHost && (
          <p className="text-center text-sm text-spark-gray">정원이 마감됐어요</p>
        )}
        {canReview && (
          <button
            onClick={() => navigate(`/sparks/${sparkId}/review`)}
            className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark"
          >
            후기 작성하기 ✍️
          </button>
        )}
      </div>
      )}

      {cancelConfirmOpen && (
        <ConfirmModal
          title="참여 신청을 취소할까요?"
          confirmLabel={canceling ? '취소 중...' : '신청취소'}
          cancelLabel="돌아가기"
          danger
          onConfirm={handleCancelRequest}
          onCancel={() => setCancelConfirmOpen(false)}
        />
      )}
      {toast.message && <Toast message={toast.message} onDone={toast.clear} />}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    recruiting: { label: '모집 중', cls: 'bg-spark-lime text-spark-dark' },
    closed: { label: '마감', cls: 'bg-gray-200 text-spark-text-secondary' },
    in_progress: { label: '진행 중', cls: 'bg-spark-purple text-white' },
    completed: { label: '완료', cls: 'bg-gray-200 text-spark-text-secondary' },
    canceled: { label: '취소됨', cls: 'bg-red-100 text-red-500' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-spark-text-secondary' }
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
}

function InfoRow({
  icon, label, value, highlight,
}: {
  icon: string; label: string; value: string; highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 shrink-0 text-base">{icon}</span>
      <span className="w-20 shrink-0 text-xs text-spark-gray">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-spark-purple' : 'text-[#333333]'}`}>{value}</span>
    </div>
  )
}

function levelLabel(level: string) {
  const map: Record<string, string> = { beginner: '초보', intermediate: '중급', advanced: '고급', expert: '전문가' }
  return map[level] ?? level
}

function formatFull(iso: string) {
  const d = new Date(iso)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
