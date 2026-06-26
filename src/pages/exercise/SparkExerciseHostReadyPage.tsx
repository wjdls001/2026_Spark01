import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById } from '@/features/sparks/api'
import { ALL_MOCK_SPARKS, buildMockParticipants } from '@/lib/mockData'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { Toast } from '@/components/common/Toast'
import { useToast } from '@/lib/utils/useToast'

type Participant = { id: string; user_id: string; role: string; status: string; checked_in?: boolean; profile: { id: string; nickname: string } | null }
type SparkInfo = { id: string; title: string; capacity: number; participants: Participant[] }

export function SparkExerciseHostReadyPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkInfo | null>(null)
  const toast = useToast()

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

  const members = (spark?.participants ?? []).filter(p => p.role !== 'host' && (p.status === 'approved' || p.status === 'attended'))
  const totalSlots = Math.max(0, (spark?.capacity ?? 1) - 1)

  function handleNotifyAll() {
    toast.show('모임원에게 운동 시작 알림을 보냈어요')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-spark-dark">{spark?.title ?? '모임 준비'}</h1>
        <button onClick={handleNotifyAll} aria-label="알림 보내기" className="flex h-9 w-9 items-center justify-center rounded-full bg-spark-soft-purple text-spark-purple">
          🔔
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-spark-text-secondary">모임원 준비 현황</p>
          <span className="rounded-full bg-spark-soft-purple px-3 py-1 text-xs font-bold text-spark-purple">{members.length}/{totalSlots} 참여중</span>
        </div>
        <div className="flex flex-col gap-3">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <SparkCharacter size="sm" ring={m.checked_in ? 'lime' : 'none'} />
              <div>
                <div className="text-sm font-bold text-spark-dark">{m.profile?.nickname ?? '참여자'}</div>
                <div className={`text-xs ${m.checked_in ? 'text-spark-lime' : 'text-spark-gray'}`}>{m.checked_in ? '참여 완료' : '아직 안 옴'}</div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="py-6 text-center text-sm text-spark-gray">참여 확정된 모임원이 없어요.</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-3">
        <button
          onClick={() => navigate(`/exercise/spark/session/${sparkId}`)}
          className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark"
        >
          운동 시작 ⚡
        </button>
      </div>

      {toast.message && <Toast message={toast.message} onDone={toast.clear} />}
    </div>
  )
}
