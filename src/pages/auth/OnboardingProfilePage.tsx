import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { createProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import { MOCK_SPORTS } from '@/lib/mockData'
import type { Sport } from '@/types/database'

const TOTAL_STEPS = 7

const GENDERS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'none', label: '선택 안 함' },
]

const EXERCISE_GOALS = [
  { value: 'health', label: '건강 유지', emoji: '💪' },
  { value: 'diet', label: '다이어트', emoji: '🔥' },
  { value: 'stress', label: '스트레스 해소', emoji: '😌' },
  { value: 'social', label: '사람들과 교류', emoji: '👥' },
  { value: 'competition', label: '대회/경쟁', emoji: '🏆' },
]

const EXERCISE_TRAITS = ['혼자 하는 편', '같이 하는 편', '새벽형', '야간형', '주말형', '규칙적', '즉흥적', '조용한 편', '활발한 편', '초보환영']

const WEEKLY_FREQ = [
  { value: '1', label: '주 1회' },
  { value: '2-3', label: '주 2~3회' },
  { value: '4-5', label: '주 4~5회' },
  { value: '6+', label: '거의 매일' },
]

const AVG_DURATION = [
  { value: 'under30', label: '30분 이내' },
  { value: '30to60', label: '30분~1시간' },
  { value: '60to120', label: '1~2시간' },
  { value: 'over120', label: '2시간 이상' },
]

export function OnboardingProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)

  // Step 1
  const [nickname, setNickname] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [gender, setGender] = useState('')

  // Step 2~7
  const [goal, setGoal] = useState<string>('')
  const [traits, setTraits] = useState<string[]>([])
  const [favoriteSports, setFavoriteSports] = useState<string[]>([])
  const [frequentSports, setFrequentSports] = useState<string[]>([])
  const [weeklyFreq, setWeeklyFreq] = useState<string>('')
  const [avgDuration, setAvgDuration] = useState<string>('')

  const [level] = useState('beginner')
  const [sports, setSports] = useState<Sport[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSports()
      .then(({ data }) => {
        if (data && data.length > 0) setSports(data)
        else setSports(MOCK_SPORTS as unknown as Sport[])
      })
      .catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [])

  function toggleIn(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  function nextStep() {
    if (step === 1) {
      if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
      if (birthYear && (Number(birthYear) < 1920 || Number(birthYear) > new Date().getFullYear())) {
        setError('출생연도를 정확히 입력해주세요.')
        return
      }
    }
    setError('')
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    if (!user) return
    setLoading(true)
    const sportName = (id: string) => sports.find(s => s.id === id)?.name ?? id
    const workoutTraits = [
      ...(goal ? [EXERCISE_GOALS.find(g => g.value === goal)?.label ?? ''] : []),
      ...traits,
      ...frequentSports.map(id => `자주: ${sportName(id)}`),
      ...(weeklyFreq ? [`주 ${weeklyFreq}회`] : []),
      ...(avgDuration ? [`회당 ${AVG_DURATION.find(d => d.value === avgDuration)?.label}`] : []),
    ].filter(Boolean)

    const { error: err } = await createProfile({
      id: user.id,
      nickname: nickname.trim(),
      gender: gender || null,
      birth_year: birthYear ? Number(birthYear) : null,
      exercise_level: level,
      preferred_sports: favoriteSports,
      workout_traits: workoutTraits,
    })
    if (err) {
      if (err.message.includes('unique') || err.message.includes('duplicate')) {
        setError('이미 사용 중인 닉네임이에요.')
        setStep(1)
      } else {
        setError('프로필 저장에 실패했어요.')
      }
      setLoading(false)
      return
    }
    setLoading(false)
    navigate('/onboarding/result', {
      replace: true,
      state: { nickname: nickname.trim(), level, weeklyFreq },
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white px-6 py-8">
      {/* 브랜드 */}
      <div className="mb-6 text-xl font-bold text-[#111111]">⚡ SPARK</div>

      {/* 진행 바 */}
      <div className="mb-6">
        <div className="mb-2 flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-[#9B8FFF]' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-[#999999]">{step} / {TOTAL_STEPS}</p>
      </div>

      {/* Step 1: 기본 정보 (닉네임/나이/성별) */}
      {step === 1 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">기본 정보를 알려주세요</h1>
            <p className="mt-1 text-sm text-[#777777]">다른 사용자에게 보여질 정보예요</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">닉네임</label>
            <input
              value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="닉네임 입력 (2~12자)" maxLength={12}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">출생연도 <span className="text-[#999999] font-normal">(선택)</span></label>
            <input
              type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)}
              placeholder="예: 1995"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">성별 <span className="text-[#999999] font-normal">(선택)</span></label>
            <div className="flex gap-2">
              {GENDERS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={`flex-1 rounded-full border py-2.5 text-sm font-medium ${
                    gender === g.value ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]' : 'border-gray-200 text-[#555555]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {/* Step 2: 운동 목표 */}
      {step === 2 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">운동의 목표가 뭐예요?</h1>
            <p className="mt-1 text-sm text-[#777777]">가장 중요한 이유 하나를 골라주세요</p>
          </div>
          <div className="flex flex-col gap-3">
            {EXERCISE_GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors ${
                  goal === g.value ? 'border-[#9B8FFF] bg-[#EEE8FF]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-xl">{g.emoji}</span>
                <span className="font-medium text-[#111111]">{g.label}</span>
                {goal === g.value && <span className="ml-auto text-[#9B8FFF]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: 운동 성향 태그 */}
      {step === 3 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">나의 운동 성향</h1>
            <p className="mt-1 text-sm text-[#777777]">나를 잘 표현하는 태그를 골라주세요 (복수 선택)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXERCISE_TRAITS.map(t => (
              <button
                key={t}
                onClick={() => toggleIn(traits, setTraits, t)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  traits.includes(t) ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-200 bg-gray-50 text-[#555555]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: 좋아하는 운동 선택 */}
      {step === 4 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">좋아하는 운동이 뭔가요?</h1>
            <p className="mt-1 text-sm text-[#777777]">복수 선택 가능해요</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => {
              const emoji = (sport as { emoji?: string }).emoji ?? '🏃'
              return (
                <button
                  key={sport.id}
                  onClick={() => toggleIn(favoriteSports, setFavoriteSports, sport.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    favoriteSports.includes(sport.id)
                      ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                      : 'border-gray-200 bg-gray-50 text-[#555555]'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{sport.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 5: 자주 하는 운동 선택 */}
      {step === 5 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">자주 하는 운동이 뭔가요?</h1>
            <p className="mt-1 text-sm text-[#777777]">평소 가장 많이 하는 운동을 골라주세요 (복수 선택)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => {
              const emoji = (sport as { emoji?: string }).emoji ?? '🏃'
              return (
                <button
                  key={sport.id}
                  onClick={() => toggleIn(frequentSports, setFrequentSports, sport.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    frequentSports.includes(sport.id)
                      ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                      : 'border-gray-200 bg-gray-50 text-[#555555]'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{sport.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 6: 주간 운동 빈도 */}
      {step === 6 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">한 주 운동 빈도가 어떻게 되세요?</h1>
            <p className="mt-1 text-sm text-[#777777]">주간 목표 설정에 활용돼요</p>
          </div>
          <div className="flex flex-col gap-3">
            {WEEKLY_FREQ.map(f => (
              <button
                key={f.value}
                onClick={() => setWeeklyFreq(f.value)}
                className={`rounded-2xl border-2 px-4 py-4 text-left font-medium transition-colors ${
                  weeklyFreq === f.value ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]' : 'border-gray-100 bg-gray-50 text-[#555555]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 7: 회당 평균 운동 시간 */}
      {step === 7 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">한 번 운동할 때 보통 얼마나 하세요?</h1>
            <p className="mt-1 text-sm text-[#777777]">회당 평균 운동 시간이에요</p>
          </div>
          <div className="flex flex-col gap-3">
            {AVG_DURATION.map(d => (
              <button
                key={d.value}
                onClick={() => setAvgDuration(d.value)}
                className={`rounded-2xl border-2 px-4 py-4 text-left font-medium transition-colors ${
                  avgDuration === d.value ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]' : 'border-gray-100 bg-gray-50 text-[#555555]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-auto pt-8">
        {step < TOTAL_STEPS ? (
          <button onClick={nextStep} className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]">
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60"
          >
            {loading ? '저장 중...' : '시작하기 ⚡'}
          </button>
        )}
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-3 w-full py-2 text-sm text-[#777777]">
            이전
          </button>
        )}
      </div>
    </div>
  )
}
