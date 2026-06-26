import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSparkById } from '@/features/sparks/api'
import { ALL_MOCK_SPARKS, buildMockParticipants } from '@/lib/mockData'
import { formatDuration } from '@/features/exercise/api'
import { MapView } from '@/features/map/MapView'
import { ConfirmModal } from '@/components/common/ConfirmModal'

type Participant = { id: string; profile: { id: string; nickname: string } | null }
type SparkInfo = {
  id: string
  title: string
  place_name?: string | null
  scheduled_at?: string
  duration_minutes?: number | null
  sport: { id: string; name: string } | null
  participants: Participant[]
}

export function SparkExerciseSessionPage() {
  const { sparkId } = useParams<{ sparkId: string }>()
  const navigate = useNavigate()
  const [spark, setSpark] = useState<SparkInfo | null>(null)

  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [endConfirmOpen, setEndConfirmOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<Date>(new Date())

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
    setEndConfirmOpen(true)
  }

  function finishSession() {
    setEndConfirmOpen(false)
    setRunning(false)
    const endTime = new Date()
    navigate(`/sparks/${sparkId}/review`, {
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

  const participants = spark?.participants ?? []

  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] flex-col bg-spark-dark">
      {/* 다크 지도 + 타이머 (전체 화면) */}
      <div className="relative flex-1 w-full overflow-hidden">
        <MapView center={[37.5283, 126.9342]} zoom={13} pins={[]} />
        <div className="absolute inset-0 bg-spark-dark/35" />

        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">‹</button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-5xl font-bold tracking-widest text-white">{formatDuration(elapsed)}</div>
          <p className="mt-1 text-xs text-white/70">경과 시간</p>
        </div>

        <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button onClick={() => setRunning(r => !r)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-lg text-white">
            {running ? '❙❙' : '▶'}
          </button>
          <button onClick={handleEnd} className="flex h-14 w-14 items-center justify-center rounded-full bg-spark-lime text-base font-bold text-spark-dark">
            종료
          </button>
        </div>

        {/* 슬라이드 카드 peek 핸들 — 탭하면 아래에서 올라옴 */}
        <button
          onClick={() => setSheetOpen(true)}
          className="absolute bottom-0 left-1/2 flex w-full max-w-[440px] -translate-x-1/2 flex-col items-center gap-1 rounded-t-[28px] bg-spark-card/95 px-5 py-3 text-white"
        >
          <span className="h-1.5 w-12 rounded-full bg-white/20" />
          <span className="flex w-full items-center justify-between text-left">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-spark-lime px-2 py-0.5 text-[10px] text-spark-dark">번개 모임</span>
              {spark?.title ?? '올림픽공원 러닝 크루'}
            </span>
            <span className="text-xs text-spark-gray">참여자 보기</span>
          </span>
        </button>
      </div>

      {/* 참여자 페이스 리스트 — 슬라이드업 시트 */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-black/30" onClick={() => setSheetOpen(false)}>
          <div className="spark-bottom-sheet px-5 pt-5" onClick={event => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-spark-lime px-3 py-1 text-xs font-bold text-spark-dark">번개 모임</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-spark-gray">{participants.length || 4}</span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">{spark?.title ?? '올림픽공원 러닝 크루'}</h3>
            <p className="mt-1 text-xs text-spark-gray">{spark?.scheduled_at ? formatRange(spark.scheduled_at, spark.duration_minutes) : '19:00 - 19:30'} · 📍 {spark?.place_name ?? '송파구 올림픽공원'}</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <label className="block text-xs text-spark-gray">거리 (km)</label>
                <input type="number" step="0.1" placeholder="0.0" value={distance} onChange={e => setDistance(e.target.value)}
                  className="mt-1 w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-spark-text-secondary" />
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <label className="block text-xs text-spark-gray">칼로리</label>
                <input type="number" placeholder="0" value={calories} onChange={e => setCalories(e.target.value)}
                  className="mt-1 w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-spark-text-secondary" />
              </div>
            </div>

            <div className="mt-5 space-y-1">
              {(participants.length ? participants : MOCK_PARTICIPANT_PACE).map((p, index) => (
                <div key={p.id ?? index} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-spark-purple text-xs font-bold text-white">
                    {(p.profile?.nickname ?? MOCK_PARTICIPANT_PACE[index % MOCK_PARTICIPANT_PACE.length].profile?.nickname)?.[0] ?? '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-white">{p.profile?.nickname ?? MOCK_PARTICIPANT_PACE[index % MOCK_PARTICIPANT_PACE.length].profile?.nickname}</strong>
                    <span className="text-[11px] text-spark-gray">{MOCK_PARTICIPANT_PACE[index % MOCK_PARTICIPANT_PACE.length].tag}</span>
                  </div>
                  <div className="text-right text-xs text-spark-gray">
                    <strong className="block text-sm text-white">{MOCK_PARTICIPANT_PACE[index % MOCK_PARTICIPANT_PACE.length].distance}</strong>
                    {MOCK_PARTICIPANT_PACE[index % MOCK_PARTICIPANT_PACE.length].pace}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {endConfirmOpen && (
        <ConfirmModal
          title="운동을 종료할까요?"
          message="후기 작성 화면으로 이동해요."
          confirmLabel="종료"
          danger
          onConfirm={finishSession}
          onCancel={() => setEndConfirmOpen(false)}
        />
      )}
    </div>
  )
}

const MOCK_PARTICIPANT_PACE = [
  { id: 'p1', profile: { id: 'p1', nickname: '지현' }, tag: '모임장', distance: '5.24 km', pace: "5'48\"/km" },
  { id: 'p2', profile: { id: 'p2', nickname: '민성' }, tag: '러닝 3년차', distance: '5.10 km', pace: "5'52\"/km" },
  { id: 'p3', profile: { id: 'p3', nickname: '예린' }, tag: '오늘 첫참여', distance: '4.88 km', pace: "6'10\"/km" },
  { id: 'p4', profile: { id: 'p4', nickname: '현민' }, tag: '러닝 6개월차', distance: '5.64 km', pace: "5'28\"/km" },
] as { id: string; profile: { id: string; nickname: string } | null; tag: string; distance: string; pace: string }[]

function formatRange(iso: string, durationMinutes?: number | null) {
  const start = new Date(iso)
  const end = new Date(start.getTime() + (durationMinutes ?? 30) * 60000)
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${fmt(start)} - ${fmt(end)}`
}
