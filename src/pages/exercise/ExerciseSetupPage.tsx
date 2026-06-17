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

const CARDIO_CODES = ['walking', 'running', 'cycling']
const STRENGTH_CODES = ['fitness']

type SetupState = {
  mode?: string
  quick?: boolean
  prefillRoutine?: { name: string; sets: string; reps: string; sportCode: string }
}

export function ExerciseSetupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as SetupState | null) ?? null
  const mode = state?.mode ?? 'solo'
  const quick = state?.quick ?? false

  const [sports, setSports] = useState<Sport[]>([])
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [goalType, setGoalType] = useState('time')
  const [goalValue, setGoalValue] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [routineName, setRoutineName] = useState('')
  const [showCustomSportModal, setShowCustomSportModal] = useState(false)
  const [customSportName, setCustomSportName] = useState('')

  useEffect(() => {
    fetchSports()
      .then(({ data }) => {
        if (data && data.length > 0) setSports(data)
        else setSports(MOCK_SPORTS as unknown as Sport[])
      })
      .catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [])

  useEffect(() => {
    if (!state?.prefillRoutine || sports.length === 0) return
    const { name, sets: prefillSets, reps: prefillReps, sportCode } = state.prefillRoutine
    const sport = sports.find(s => (s as { code?: string }).code === sportCode)
    if (sport) setSelectedSport(sport)
    setRoutineName(name)
    setSets(prefillSets)
    setReps(prefillReps)
  }, [state?.prefillRoutine, sports])

  const sportCode = (selectedSport as { code?: string } | null)?.code ?? ''
  const isCardio = CARDIO_CODES.includes(sportCode)
  const isStrength = STRENGTH_CODES.includes(sportCode)

  function handleSelectCustomSport() {
    if (!customSportName.trim()) return
    setSelectedSport({ id: 'custom', code: 'custom', name: customSportName.trim() } as unknown as Sport)
    setShowCustomSportModal(false)
  }

  function handleStart() {
    navigate('/exercise/solo/session', {
      state: {
        mode,
        quick,
        sport: selectedSport,
        goalType: isStrength ? 'sets' : goalType,
        goalValue: goalValue ? Number(goalValue) : null,
        sets: isStrength ? sets : null,
        reps: isStrength ? reps : null,
        routineName: routineName || null,
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111111]">종목 선택</h2>
            <button
              onClick={() => setShowCustomSportModal(true)}
              className="text-xs font-medium text-[#9B8FFF]"
            >
              직접 입력 +
            </button>
          </div>
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
            {selectedSport?.id === 'custom' && (
              <span className="flex items-center gap-1.5 rounded-full border border-[#9B8FFF] bg-[#9B8FFF] px-4 py-2 text-sm font-medium text-white">
                🏃 {selectedSport.name}
              </span>
            )}
          </div>
        </div>

        {/* 걷기/러닝/자전거: 거리·시간 강조 + 경로 placeholder */}
        {isCardio && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-bold text-[#111111]">목표 설정</h2>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.filter(g => g.key === 'time' || g.key === 'distance').map(g => (
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
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number" value={goalValue} onChange={e => setGoalValue(e.target.value)}
                placeholder="목표값 입력"
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
              />
              <span className="text-sm text-[#777777]">
                {GOAL_OPTIONS.find(g => g.key === goalType)?.unit}
              </span>
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 py-8 text-center">
              <p className="text-xs text-[#999999]">경로/지도는 추후 지원돼요 🗺</p>
            </div>
          </div>
        )}

        {/* 헬스/홈트: 루틴 중심 입력 */}
        {isStrength && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#111111]">루틴/세트 설정</h2>
              <button
                onClick={() => navigate('/exercise/solo/routine', { state: { sportCode } })}
                className="text-xs font-medium text-[#9B8FFF]"
              >
                루틴 불러오기
              </button>
            </div>
            {routineName && (
              <div className="mb-3 rounded-2xl bg-[#EEE8FF] px-4 py-2 text-sm font-medium text-[#9B8FFF]">
                선택한 루틴: {routineName}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-[#777777]">세트 수</label>
                <input
                  type="number" value={sets} onChange={e => setSets(e.target.value)}
                  placeholder="3"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#777777]">반복 횟수</label>
                <input
                  type="number" value={reps} onChange={e => setReps(e.target.value)}
                  placeholder="12"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 그 외 종목: 기존 4종 목표 그리드 */}
        {!isCardio && !isStrength && (
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
        )}
      </div>

      <div className="px-5 pb-8">
        <button
          onClick={handleStart}
          disabled={!selectedSport}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-40"
        >
          {quick ? '기록 입력하기' : '운동 시작하기 ⚡'}
        </button>
      </div>

      {/* 종목 직접 입력 모달 */}
      {showCustomSportModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-3xl bg-white p-5">
            <h3 className="mb-3 text-base font-bold text-[#111111]">종목 직접 입력</h3>
            <input
              value={customSportName}
              onChange={e => setCustomSportName(e.target.value)}
              placeholder="예: 클라이밍, 필라테스"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowCustomSportModal(false)}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-[#555555]"
              >
                취소
              </button>
              <button
                onClick={handleSelectCustomSport}
                className="flex-1 rounded-full bg-[#C8FF3E] py-3 text-sm font-bold text-[#111111]"
              >
                선택
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
