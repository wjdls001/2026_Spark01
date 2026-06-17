import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById } from '@/features/sparks/api'
import { MOCK_SPARKS } from '@/lib/mockData'

type SparkInfo = { id: string; title: string; place_name: string | null; host: { nickname: string } | null }

export function SparkExerciseMemberReadyPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkInfo | null>(null)

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

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEE8FF] text-3xl">
        ⏳
      </div>
      <h1 className="text-lg font-bold text-[#111111]">{spark?.title ?? '모임 준비 중'}</h1>
      <p className="mt-2 text-sm text-[#777777]">
        {spark?.host?.nickname ?? '모임장'}님이 운동을 시작하면 알려드릴게요.
      </p>
      {spark?.place_name && (
        <p className="mt-1 text-xs text-[#999999]">📍 {spark.place_name}</p>
      )}

      <button
        onClick={() => navigate(`/exercise/spark/session/${sparkId}`)}
        className="mt-10 w-full max-w-xs rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
      >
        지금 참여하기 ⚡
      </button>
      <button onClick={() => navigate(-1)} className="mt-3 text-sm text-[#999999]">
        뒤로 가기
      </button>
    </div>
  )
}
