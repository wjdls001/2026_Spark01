import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById } from '@/features/sparks/api'
import { MOCK_SPARKS } from '@/lib/mockData'
import { formatDuration } from '@/features/exercise/api'

type Participant = { id: string; profile: { id: string; nickname: string } | null }
type SparkInfo = { id: string; title: string; sport: { id: string; name: string } | null; participants: Participant[] }

export function SparkExerciseSessionPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkInfo | null>(null)

  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<Date>(new Date())

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

  const tick = useCallback(() => setElapsed(e => e + 1), [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  function handleEnd() {
    if (!window.confirm('운동을 종료할까요? 진행 상황이 저장되지 않아요.')) return
    setRunning(false)
    const endTime = new Date()
    navigate('/exercise/result', {
      state: {
        mode: 'spark',
        sparkId,
        sport: spark?.sport,
        startedAt: startTimeRef.current.toISOString(),
        endedAt: endTime.toISOString(),
        durationSeconds: elapsed,
        distanceMeters: distance ? Number(distance) * 1000 : null,
        calories: calories ? Number(calories) : null,
      },
    })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-[#111111] px-5 py-10">
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[#2A2A2A] px-3 py-1 text-xs text-[#AAAAAA]">
            {spark?.title ?? '같이 운동 중'}
          </span>
        </div>
        {spark && spark.participants.length > 0 && (
          <div className="flex -space-x-2">
            {spark.participants.slice(0, 6).map(p => (
              <div key={p.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111111] bg-[#9B8FFF] text-xs font-bold text-white">
                {p.profile?.nickname?.[0] ?? '?'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 타이머 */}
      <div className="flex flex-col items-center">
        <div className="text-6xl font-bold tracking-widest text-white">
          {formatDuration(elapsed)}
        </div>
        <p className="mt-2 text-sm text-[#AAAAAA]">경과 시간</p>
      </div>

      {/* 입력 */}
      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#2A2A2A] px-4 py-3">
          <label className="block text-xs text-[#AAAAAA]">거리 (km)</label>
          <input type="number" step="0.1" placeholder="0.0"
            value={distance} onChange={e => setDistance(e.target.value)}
            className="mt-1 w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-[#555555]" />
        </div>
        <div className="rounded-2xl bg-[#2A2A2A] px-4 py-3">
          <label className="block text-xs text-[#AAAAAA]">칼로리</label>
          <input type="number" placeholder="0"
            value={calories} onChange={e => setCalories(e.target.value)}
            className="mt-1 w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-[#555555]" />
        </div>
      </div>

      {/* 버튼들 */}
      <div className="mt-8 flex w-full gap-3">
        <button
          onClick={() => setRunning(r => !r)}
          className="flex-1 rounded-full border border-white/20 py-4 text-base font-bold text-white"
        >
          {running ? '일시정지' : '재개'}
        </button>
        <button
          onClick={handleEnd}
          className="flex-1 rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          운동 종료
        </button>
      </div>
    </div>
  )
}
