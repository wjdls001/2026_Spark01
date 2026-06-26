import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById } from '@/features/sparks/api'
import { ALL_MOCK_SPARKS, buildMockParticipants } from '@/lib/mockData'
import { SparkCharacter } from '@/components/common/SparkCharacter'

type Participant = { id: string; user_id: string; role: string; status: string; checked_in?: boolean; profile: { id: string; nickname: string } | null }
type SparkInfo = { id: string; title: string; place_name: string | null; capacity: number; host: { nickname: string } | null; participants: Participant[] }

export function SparkExerciseMemberReadyPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkInfo | null>(null)

  useEffect(() => {
    if (!sparkId) return
    fetchSparkById(sparkId)
      .then(({ data }) => {
        if (data) {
          setSpark(data as unknown as SparkInfo)
          return
        }
        const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
        if (mock) setSpark({ ...mock, participants: buildMockParticipants(mock) } as unknown as SparkInfo)
      })
      .catch(() => {
        const mock = ALL_MOCK_SPARKS.find(s => s.id === sparkId)
        if (mock) setSpark({ ...mock, participants: buildMockParticipants(mock) } as unknown as SparkInfo)
      })
  }, [sparkId])

  const members = (spark?.participants ?? []).filter(p => p.status === 'approved' || p.status === 'attended')
  const totalSlots = Math.max(1, spark?.capacity ?? 1)

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 px-6 py-8 text-center">
      <h1 className="text-lg font-bold text-spark-dark">{spark?.title ?? '모임 준비 중'}</h1>
      <p className="mt-2 text-sm text-spark-text-secondary">
        {spark?.host?.nickname ?? '모임장'}님이 운동을 시작하면 알려드릴게요.
      </p>
      {spark?.place_name && (
        <p className="mt-1 text-xs text-spark-gray">📍 {spark.place_name}</p>
      )}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-spark-dark">모임원 준비 현황</span>
          <span className="rounded-full bg-spark-soft-purple px-3 py-1 text-xs font-bold text-spark-purple">{members.length}/{totalSlots} 참여중</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {members.map(m => (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <SparkCharacter size="sm" ring={m.checked_in ? 'lime' : 'none'} />
              <span className="max-w-[64px] truncate text-xs text-spark-text-secondary">{m.profile?.nickname ?? '참여자'}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate(`/exercise/spark/session/${sparkId}`)}
        className="mt-8 w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark"
      >
        지금 참여하기 ⚡
      </button>
      <button onClick={() => navigate(-1)} className="mt-3 text-sm text-spark-gray">
        뒤로 가기
      </button>
    </div>
  )
}
