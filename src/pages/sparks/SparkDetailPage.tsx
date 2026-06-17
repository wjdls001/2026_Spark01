import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchSparkById, applyToSpark } from '@/features/sparks/api'
import { MapView } from '@/features/map/MapView'
import { MOCK_SPARKS, SPORT_EMOJI } from '@/lib/mockData'

type ParticipantWithProfile = {
  id: string
  user_id: string
  role: string
  status: string
  profile: { id: string; nickname: string; avatar_url: string | null; exercise_level: string } | null
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

  useEffect(() => {
    if (!sparkId) return
    fetchSparkById(sparkId)
      .then(({ data }) => {
        if (data) {
          setSpark(data as unknown as SparkDetail)
        } else {
          const mock = MOCK_SPARKS.find(s => s.id === sparkId)
          if (mock) setSpark(mock as unknown as SparkDetail)
        }
        setLoading(false)
      })
      .catch(() => {
        const mock = MOCK_SPARKS.find(s => s.id === sparkId)
        if (mock) setSpark(mock as unknown as SparkDetail)
        setLoading(false)
      })
  }, [sparkId])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
      </div>
    )
  }

  if (!spark) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5">
        <p className="text-[#777777]">번개를 찾을 수 없어요.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#9B8FFF]">뒤로 가기</button>
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
    if (!user || !sparkId) return
    setApplying(true)
    setError('')
    const { error: err } = await applyToSpark(sparkId, user.id)
    if (err) {
      setError('신청에 실패했어요.')
    } else {
      const { data } = await fetchSparkById(sparkId)
      if (data) setSpark(data as unknown as SparkDetail)
    }
    setApplying(false)
  }

  const myStatusLabel = () => {
    if (isHost) return '내가 개설한 번개'
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
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-[#111111]">{spark.title}</h1>
        {isHost && (
          <button onClick={() => navigate(`/sparks/${sparkId}/manage`)}
            className="text-sm font-medium text-[#9B8FFF]">관리</button>
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
              <span className="rounded-full bg-[#EEE8FF] px-3 py-1 text-xs text-[#9B8FFF]">
                {emoji} {spark.sport.name}
              </span>
            )}
            <StatusBadge status={spark.status} />
          </div>
          <h2 className="text-lg font-bold text-[#111111]">{spark.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#777777]">
            <span>📅 {formatFull(spark.scheduled_at)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 px-4">
          {/* 핵심 정보 */}
          <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h3 className="mb-3 text-sm font-bold text-[#111111]">모임 정보</h3>
            <div className="flex flex-col gap-2">
              {spark.duration_minutes && (
                <InfoRow icon="⏱" label="진행 시간" value={`약 ${spark.duration_minutes}분`} />
              )}
              {spark.place_name && (
                <InfoRow icon="📍" label="장소" value={spark.place_name} />
              )}
              {spark.address && (
                <div className="pl-7 text-xs text-[#999999]">{spark.address}</div>
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
              <h3 className="mb-2 text-sm font-bold text-[#111111]">상세 설명</h3>
              <p className="whitespace-pre-line text-sm text-[#555555]">{spark.description}</p>
            </div>
          )}

          {/* 호스트 */}
          {spark.host && (
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h3 className="mb-3 text-sm font-bold text-[#111111]">모임장</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE8FF] text-xl font-bold text-[#9B8FFF]">
                  {spark.host.nickname[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#111111]">{spark.host.nickname}</div>
                  <div className="text-xs text-[#777777]">
                    {levelLabel(spark.host.exercise_level)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#999999]">신뢰도</div>
                  <div className="text-lg font-bold text-[#C8FF3E]">{spark.host.trust_score}</div>
                </div>
              </div>
            </div>
          )}

          {/* 참여자 */}
          {spark.participants.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <h3 className="mb-3 text-sm font-bold text-[#111111]">
                참여자 <span className="text-[#9B8FFF]">{approvedCount}/{spark.capacity}</span>
              </h3>
              <div className="flex gap-3">
                {spark.participants
                  .filter(p => p.status === 'approved' || p.status === 'attended' || p.role === 'host')
                  .map(p => (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEE8FF] text-sm font-bold text-[#9B8FFF]">
                        {p.profile?.nickname?.[0] ?? '?'}
                      </div>
                      <span className="text-xs text-[#555555] truncate max-w-[50px]">
                        {p.role === 'host' ? '👑' : ''}{p.profile?.nickname ?? '?'}
                      </span>
                    </div>
                  ))}
                {/* 빈 슬롯 */}
                {Array.from({ length: Math.max(0, spark.capacity - approvedCount) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-200">
                      <span className="text-lg text-gray-300">+</span>
                    </div>
                    <span className="text-xs text-[#CCCCCC]">모집 중</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 bg-white px-5 pb-8 pt-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        {myStatusLabel() && !canApply && (
          <div className="mb-3 rounded-full bg-[#EEE8FF] py-2 text-center text-sm font-medium text-[#9B8FFF]">
            {myStatusLabel()}
          </div>
        )}
        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
        {canApply && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60"
          >
            {applying ? '신청 중...' : '참여 신청하기 ⚡'}
          </button>
        )}
        {isFull && !myParticipation && !isHost && (
          <p className="text-center text-sm text-[#999999]">정원이 마감됐어요</p>
        )}
        {canReview && (
          <button
            onClick={() => navigate(`/sparks/${sparkId}/review`)}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
          >
            후기 작성하기 ✍️
          </button>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    recruiting: { label: '모집 중', cls: 'bg-[#C8FF3E] text-[#111111]' },
    closed: { label: '마감', cls: 'bg-gray-200 text-[#777777]' },
    in_progress: { label: '진행 중', cls: 'bg-[#9B8FFF] text-white' },
    completed: { label: '완료', cls: 'bg-gray-200 text-[#777777]' },
    canceled: { label: '취소됨', cls: 'bg-red-100 text-red-500' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-[#777777]' }
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
      <span className="w-20 shrink-0 text-xs text-[#999999]">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-[#9B8FFF]' : 'text-[#333333]'}`}>{value}</span>
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
