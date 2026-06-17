import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Sport } from '@/types/database'
import { formatDuration } from '@/features/exercise/api'

type SessionState = {
  mode?: string
  quick?: boolean
  sport?: Sport | null
  goalType?: string
  goalValue?: number | null
}

export function ExerciseSessionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as SessionState) ?? {}
  const { mode = 'solo', quick = false, sport, goalType, goalValue } = state

  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(!quick)
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goalValue ?? ''))
  const [currentGoalValue, setCurrentGoalValue] = useState(goalValue ?? null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<Date>(new Date())

  const tick = useCallback(() => setElapsed(e => e + 1), [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  function handleEnd() {
    if (!quick && !window.confirm('운동을 종료할까요? 진행 상황이 저장되지 않아요.')) return
    setRunning(false)
    const endTime = new Date()
    navigate('/exercise/result', {
      state: {
        mode,
        sport,
        startedAt: startTimeRef.current.toISOString(),
        endedAt: endTime.toISOString(),
        durationSeconds: quick ? (goalType === 'time' && currentGoalValue ? currentGoalValue * 60 : elapsed) : elapsed,
        distanceMeters: distance ? Number(distance) * 1000 : null,
        calories: calories ? Number(calories) : null,
      },
    })
  }

  const goalPct = (() => {
    if (!currentGoalValue || goalType === 'free') return null
    if (goalType === 'time') return Math.min(100, Math.round((elapsed / (currentGoalValue * 60)) * 100))
    if (goalType === 'distance' && distance) return Math.min(100, Math.round((Number(distance) / currentGoalValue) * 100))
    if (goalType === 'calories' && calories) return Math.min(100, Math.round((Number(calories) / currentGoalValue) * 100))
    return 0
  })()

  function handleSaveGoal() {
    setCurrentGoalValue(goalInput ? Number(goalInput) : null)
    setEditingGoal(false)
  }

  if (quick) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#111111] px-5 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">운동 기록 입력</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-[#2A2A2A] px-4 py-4">
            <label className="mb-1 block text-xs text-[#AAAAAA]">종목</label>
            <p className="text-white">{sport?.name ?? '선택 안 함'}</p>
          </div>
          <div className="rounded-2xl bg-[#2A2A2A] px-4 py-4">
            <label className="mb-2 block text-xs text-[#AAAAAA]">운동 시간 (분)</label>
            <input type="number" placeholder="30"
              value={distance} onChange={e => setDistance(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-[#555555]" />
          </div>
          <div className="rounded-2xl bg-[#2A2A2A] px-4 py-4">
            <label className="mb-2 block text-xs text-[#AAAAAA]">거리 (km, 선택)</label>
            <input type="number" step="0.1" placeholder="0.0"
              className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-[#555555]"
              onChange={() => {/* stored in distance field */}}
            />
          </div>
          <div className="rounded-2xl bg-[#2A2A2A] px-4 py-4">
            <label className="mb-2 block text-xs text-[#AAAAAA]">칼로리 (kcal, 선택)</label>
            <input type="number" placeholder="0"
              value={calories} onChange={e => setCalories(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-[#555555]" />
          </div>
        </div>

        <div className="mt-auto pt-8">
          <button onClick={handleEnd}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]">
            기록 저장하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-[#111111] px-5 py-10">
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[#2A2A2A] px-3 py-1 text-xs text-[#AAAAAA]">
            {sport?.name ?? '운동 중'}
          </span>
          <div className="flex items-center gap-2">
            {goalPct !== null && (
              <span className="text-sm font-bold text-[#C8FF3E]">{goalPct}%</span>
            )}
            {goalType !== 'free' && (
              <button
                onClick={() => { setGoalInput(String(currentGoalValue ?? '')); setEditingGoal(true) }}
                className="rounded-full bg-[#2A2A2A] px-2 py-1 text-xs text-[#AAAAAA]"
              >
                목표 수정 ✏️
              </button>
            )}
          </div>
        </div>
        {goalPct !== null && (
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
            <div className="h-full rounded-full bg-[#C8FF3E] transition-all" style={{ width: `${goalPct}%` }} />
          </div>
        )}
      </div>

      {/* 타이머 */}
      <div className="flex flex-col items-center">
        <div className="text-6xl font-bold tracking-widest text-white">
          {formatDuration(elapsed)}
        </div>
        <p className="mt-2 text-sm text-[#AAAAAA]">경과 시간</p>

        {currentGoalValue && goalType === 'time' && (
          <p className="mt-1 text-sm text-[#9B8FFF]">목표: {currentGoalValue}분</p>
        )}
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

      {editingGoal && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50">
          <div className="w-full max-w-[430px] rounded-t-3xl bg-[#1A1A1A] px-6 pb-8 pt-6">
            <h3 className="mb-3 text-base font-bold text-white">목표 수정</h3>
            <input
              type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)}
              placeholder="목표값 입력"
              className="w-full rounded-2xl bg-[#2A2A2A] px-4 py-3 text-sm text-white outline-none placeholder:text-[#666666]"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingGoal(false)}
                className="flex-1 rounded-full border border-white/20 py-3 text-sm font-medium text-white"
              >
                취소
              </button>
              <button
                onClick={handleSaveGoal}
                className="flex-1 rounded-full bg-[#C8FF3E] py-3 text-sm font-bold text-[#111111]"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
