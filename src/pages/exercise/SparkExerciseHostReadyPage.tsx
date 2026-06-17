import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById } from '@/features/sparks/api'
import { MOCK_SPARKS } from '@/lib/mockData'

type Participant = { id: string; user_id: string; role: string; status: string; profile: { id: string; nickname: string } | null }
type SparkInfo = { id: string; title: string; participants: Participant[] }

export function SparkExerciseHostReadyPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkInfo | null>(null)
  const [notified, setNotified] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!sparkId) return
    fetchSparkById(sparkId)
      .then(({ data }) => {
        const found = (data ?? MOCK_SPARKS.find(s => s.id === sparkId)) as unknown as SparkInfo | undefined
        if (found) setSpark(found)
      })
      .catch(() => {
        const mock = MOCK_SPARKS.find(s => s.id === sparkId) as unknown as SparkInfo | undefined
        if (mock) setSpark(mock)
      })
  }, [sparkId])

  const members = (spark?.participants ?? []).filter(p => p.role !== 'host' && (p.status === 'approved' || p.status === 'attended'))

  function handleNotify(userId: string) {
    setNotified(prev => ({ ...prev, [userId]: true }))
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-[#111111]">{spark?.title ?? '모임 준비'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="mb-4 text-sm text-[#777777]">모임원이 모이면 운동을 시작해주세요.</p>
        <div className="flex flex-col gap-3">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEE8FF] text-sm font-bold text-[#9B8FFF]">
                  {m.profile?.nickname?.[0] ?? '?'}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111111]">{m.profile?.nickname ?? '참여자'}</div>
                  <div className="text-xs text-[#999999]">{notified[m.user_id] ? '알림 보냄' : '대기 중'}</div>
                </div>
              </div>
              {!notified[m.user_id] && (
                <button
                  onClick={() => handleNotify(m.user_id)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#9B8FFF]"
                >
                  알림 보내기
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <p className="py-6 text-center text-sm text-[#999999]">참여 확정된 모임원이 없어요.</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 pt-3">
        <button
          onClick={() => navigate(`/exercise/spark/session/${sparkId}`)}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          운동 시작 ⚡
        </button>
      </div>
    </div>
  )
}
