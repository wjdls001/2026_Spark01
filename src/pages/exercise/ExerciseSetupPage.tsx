import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchSports } from '@/features/exercise/api'
import { MOCK_SPORTS, SPORT_EMOJI } from '@/lib/mockData'
import type { Sport } from '@/types/database'

const GOAL_OPTIONS = [
  { key: 'time', label: '시간', unit: '분', icon: '⏱' },
  { key: 'distance', label: '거리', unit: 'km', icon: '📍' },
  { key: 'calories', label: '칼로리', unit: 'kcal', icon: '🔥' },
  { key: 'free', label: '자유', unit: '', icon: '🏃' },
]

export function ExerciseSetupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const mode = (location.state as { mode?: string; quick?: boolean } | null)?.mode ?? 'solo'
  const quick = (location.state as { mode?: string; quick?: boolean } | null)?.quick ?? false

  const [sports, setSports] = useState<Sport[]>([])
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [goalType, setGoalType] = useState('time')
  const [goalValue, setGoalValue] = useState('')

  useEffect(() => {
    fetchSports()
      .then(({ data }) => {
        if (data && data.length > 0) setSports(data)
        else setSports(MOCK_SPORTS as unknown as Sport[])
      })
      .catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [])

  function handleStart() {
    navigate('/exercise/session', {
      state: {
        mode,
        quick,
        sport: selectedSport,
        goalType,
        goalValue: goalValue ? Number(goalValue) : null,
      },
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6]">
      <div className="flex items-center gap-3 px-5 pt-5">
        <button onClick={() => navigate(-1)} className="p-1">
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">운동 설정</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* 종목 선택 */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-[#111111]">종목 선택</h2>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => {
              const code = (sport as { code?: string }).code ?? ''
              const emoji = SPORT_EMOJI[code] ?? '🏃'
              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSport?.id === sport.id
                      ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                      : 'border-gray-200 bg-white text-[#333333]'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{sport.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 목표 설정 */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-[#111111]">목표 설정</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map(g => (
              <button
                key={g.key}
                onClick={() => setGoalType(g.key)}
                className={`rounded-2xl border py-3 text-sm font-medium transition-colors ${
                  goalType === g.key
                    ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]'
                    : 'border-gray-200 bg-white text-[#333333]'
                }`}
              >
                <span className="text-base">{g.icon}</span>
                <span className="ml-1">{g.label}</span>
              </button>
            ))}
          </div>
          {goalType !== 'free' && (
            <div className="flex items-center gap-2">
              <input
                type="number" value={goalValue} onChange={e => setGoalValue(e.target.value)}
                placeholder="목표값 입력"
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
              />
              <span className="text-sm text-[#777777]">
                {GOAL_OPTIONS.find(g => g.key === goalType)?.unit}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-8">
        <button
          onClick={handleStart}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          {quick ? '기록 입력하기' : '운동 시작하기 ⚡'}
        </button>
      </div>
    </div>
  )
}
