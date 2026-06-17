import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { createProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import { MOCK_SPORTS } from '@/lib/mockData'
import type { Sport } from '@/types/database'

const TOTAL_STEPS = 7

const EXERCISE_PURPOSES = [
  { value: 'health', label: '건강 유지', emoji: '💪' },
  { value: 'diet', label: '다이어트', emoji: '🔥' },
  { value: 'stress', label: '스트레스 해소', emoji: '😌' },
  { value: 'social', label: '사람들과 교류', emoji: '👥' },
  { value: 'competition', label: '대회/경쟁', emoji: '🏆' },
]

const EXERCISE_TRAITS = ['혼자 하는 편', '같이 하는 편', '새벽형', '야간형', '주말형', '규칙적', '즉흥적', '조용한 편', '활발한 편', '초보환영']

const PARTNER_PREFS = [
  { value: 'same_level', label: '비슷한 실력', emoji: '🤝' },
  { value: 'any_level', label: '실력 무관', emoji: '✌️' },
  { value: 'teach', label: '알려줄 수 있음', emoji: '🎓' },
  { value: 'learn', label: '배우고 싶음', emoji: '📚' },
]

const WEEKLY_FREQ = [
  { value: '1', label: '주 1회' },
  { value: '2-3', label: '주 2~3회' },
  { value: '4-5', label: '주 4~5회' },
  { value: '6+', label: '거의 매일' },
]

const EXERCISE_LEVELS = [
  { value: 'beginner', label: '초보자', desc: '운동을 이제 막 시작했어요', emoji: '🌱' },
  { value: 'intermediate', label: '중급자', desc: '규칙적으로 운동하고 있어요', emoji: '🏃' },
  { value: 'advanced', label: '고급자', desc: '꾸준히 높은 강도로 운동해요', emoji: '⚡' },
  { value: 'expert', label: '전문가', desc: '선수급 실력을 갖추고 있어요', emoji: '🏆' },
]

export function OnboardingProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [activityArea, setActivityArea] = useState('')
  const [purpose, setPurpose] = useState<string>('')
  const [level, setLevel] = useState('beginner')
  const [preferredSports, setPreferredSports] = useState<string[]>([])
  const [traits, setTraits] = useState<string[]>([])
  const [partnerPref, setPartnerPref] = useState<string>('')
  const [weeklyFreq, setWeeklyFreq] = useState<string>('')
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

  function toggleSport(id: string) {
    setPreferredSports(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function toggleTrait(t: string) {
    setTraits(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function nextStep() {
    if (step === 1 && !nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    setError('')
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    if (!user) return
    setLoading(true)
    const workoutTraits = [
      ...(purpose ? [EXERCISE_PURPOSES.find(p => p.value === purpose)?.label ?? ''] : []),
      ...traits,
      ...(partnerPref ? [PARTNER_PREFS.find(p => p.value === partnerPref)?.label ?? ''] : []),
      ...(weeklyFreq ? [`주 ${weeklyFreq}회`] : []),
    ].filter(Boolean)

    const { error: err } = await createProfile({
      id: user.id,
      nickname: nickname.trim(),
      exercise_level: level,
      preferred_sports: preferredSports,
      activity_area: activityArea || null,
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
    setStep(TOTAL_STEPS + 1)
    setLoading(false)
  }

  // 완료 화면
  if (step > TOTAL_STEPS) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#C8FF3E] mb-6">
          <span className="text-5xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111111] mb-2">환영해요!</h1>
        <p className="text-center text-[#777777] text-sm mb-2">{nickname}님,</p>
        <p className="text-center text-[#555555] text-sm mb-8">SPARK 시작하기!</p>

        <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-[#999999]">닉네임</span>
            <span className="font-bold text-[#111111]">{nickname}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-[#999999]">운동 레벨</span>
            <span className="font-bold text-[#111111]">{EXERCISE_LEVELS.find(l => l.value === level)?.label}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#999999]">주간 목표</span>
            <span className="font-bold text-[#111111]">{weeklyFreq ? `주 ${weeklyFreq}회` : '미설정'}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/home', { replace: true })}
          className="w-full max-w-xs rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          SPARK 시작하기 ⚡
        </button>
      </div>
    )
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

      {/* Step 1: 닉네임 + 지역 */}
      {step === 1 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">사용자 정보를 알려주세요</h1>
            <p className="mt-1 text-sm text-[#777777]">다른 사용자에게 보여질 정보예요</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">닉네임</label>
            <input
              value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="닉네임 입력 (2~12자)" maxLength={12}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">주요 활동 지역 <span className="text-[#999999] font-normal">(선택)</span></label>
            <input
              value={activityArea} onChange={e => setActivityArea(e.target.value)}
              placeholder="예: 마포구, 서울숲 근처"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* Step 2: 운동 목적 */}
      {step === 2 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">운동의 목적이 뭐예요?</h1>
            <p className="mt-1 text-sm text-[#777777]">가장 중요한 이유 하나를 골라주세요</p>
          </div>
          <div className="flex flex-col gap-3">
            {EXERCISE_PURPOSES.map(p => (
              <button
                key={p.value}
                onClick={() => setPurpose(p.value)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors ${
                  purpose === p.value ? 'border-[#9B8FFF] bg-[#EEE8FF]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="font-medium text-[#111111]">{p.label}</span>
                {purpose === p.value && <span className="ml-auto text-[#9B8FFF]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: 나의 운동 분야 (traits) */}
      {step === 3 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">나의 운동 분야</h1>
            <p className="mt-1 text-sm text-[#777777]">나를 잘 표현하는 태그를 골라주세요 (복수 선택)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXERCISE_TRAITS.map(t => (
              <button
                key={t}
                onClick={() => toggleTrait(t)}
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

      {/* Step 4: 즐기는 운동 */}
      {step === 4 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">즐기는 운동이 뭔가요?</h1>
            <p className="mt-1 text-sm text-[#777777]">복수 선택 가능해요</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => {
              const emoji = (sport as { emoji?: string }).emoji ?? '🏃'
              return (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    preferredSports.includes(sport.id)
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

      {/* Step 5: 운동 레벨 */}
      {step === 5 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">운동 레벨이 어떻게 되세요?</h1>
            <p className="mt-1 text-sm text-[#777777]">번개 모임 참여 조건에 활용돼요</p>
          </div>
          <div className="flex flex-col gap-3">
            {EXERCISE_LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                  level === l.value ? 'border-[#9B8FFF] bg-[#EEE8FF]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-2xl">{l.emoji}</span>
                <div>
                  <div className="font-bold text-[#111111]">{l.label}</div>
                  <div className="mt-0.5 text-xs text-[#777777]">{l.desc}</div>
                </div>
                {level === l.value && <span className="ml-auto text-[#9B8FFF]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 6: 파트너 선호 */}
      {step === 6 && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">어떤 운동을 같이 하고 싶으세요?</h1>
            <p className="mt-1 text-sm text-[#777777]">번개 모임 추천에 반영돼요</p>
          </div>
          <div className="flex flex-col gap-3">
            {PARTNER_PREFS.map(p => (
              <button
                key={p.value}
                onClick={() => setPartnerPref(p.value)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors ${
                  partnerPref === p.value ? 'border-[#9B8FFF] bg-[#EEE8FF]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-medium text-[#111111]">{p.label}</span>
                {partnerPref === p.value && <span className="ml-auto text-[#9B8FFF]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 7: 주간 빈도 */}
      {step === 7 && (
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
