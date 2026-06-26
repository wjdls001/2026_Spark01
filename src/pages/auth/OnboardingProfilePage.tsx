import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { checkNicknameAvailability, createProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import { MOCK_SPORTS } from '@/lib/mockData'
import type { Sport } from '@/types/database'

const TOTAL_STEPS = 7
const PROGRESS = [10, 24, 38, 54, 68, 82, 99]

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대 이상']
const GENDERS = [
  { value: 'male', label: '♂ 남성' },
  { value: 'female', label: '♀ 여성' },
  { value: 'other', label: '♙ 이외' },
]
const EXERCISE_GOALS = [
  { value: 'diet', label: '다이어트', description: '체중 감량 및 탄탄한 몸매', icon: '◒' },
  { value: 'muscle', label: '벌크업', description: '근육 증량 및 근력 강화', icon: '✦' },
  { value: 'health', label: '체력 증진/건강 유지', description: '지치지 않는 체력과 건강 유지', icon: '♡' },
]
const EXERCISE_TRAITS = [
  '#꾸준함', '#계획형', '#아침운동', '#저녁운동', '#혼자운동',
  '#그룹운동', '#실내운동', '#야외운동', '#고강도', '#저강도',
  '#유산소', '#근력운동',
]
const FAVORITE_SPORTS = ['러닝', '헬스', '자전거', '테니스', '요가', '필라테스', '배드민턴', '등산', '클라이밍']
const FREQUENT_SPORTS = [
  { value: '러닝', label: '러닝', icon: '🏃' },
  { value: '사이클링', label: '사이클링', icon: '🚲' },
  { value: '웨이트', label: '웨이트\n(헬스/근력 운동)', icon: '🏋' },
  { value: '홈 트레이닝', label: '홈 트레이닝\n(집에서 하는 운동)', icon: '⌂' },
]
const WEEKLY_FREQ = [
  { value: 'rarely', label: '거의 안 함', description: '거의 안 함 (주 0~1회)', icon: '♨' },
  { value: '1-2', label: '주 1-2 회', description: '가벼운 활동', icon: '⚑' },
  { value: '3-4', label: '주 3-4 회', description: '정기적인 루틴', icon: '⚒' },
  { value: '5+', label: '주 5 회 이상', description: '고강도 운동', icon: 'ϟ' },
]
const AVG_DURATION = [
  { value: 'under30', label: '30분 미만', description: '가벼운 스트레칭이나 짧은 고강도 운동 등' },
  { value: '30to60', label: '30분 ~ 60분', description: '가장 일반적인 피트니스 루틴 시간' },
  { value: '60to90', label: '60분 ~ 90분', description: '체계적인 웨이트 트레이닝이나 유산소 병행 시간' },
  { value: 'over90', label: '90분 초과', description: '고강도 장시간 운동 또는 전문적인 훈련 수준' },
]

type FeedbackModal = 'nickname-available' | 'nickname-duplicate' | 'gender-warning' | null
type InputModal = 'trait' | 'favorite' | 'frequent' | null

function getBirthYearFromAgeGroup(ageGroup: string) {
  const currentYear = new Date().getFullYear()
  const age = ageGroup === '60대 이상' ? 65 : Number.parseInt(ageGroup, 10) + 5
  return Number.isNaN(age) ? null : currentYear - age
}

function getExerciseLevel(frequency: string, duration: string) {
  if (frequency === '5+' || duration === 'over90') return 'advanced'
  if (frequency === '3-4' || duration === '60to90') return 'intermediate'
  return 'beginner'
}

export function OnboardingProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [goal, setGoal] = useState('')
  const [traits, setTraits] = useState<string[]>([])
  const [favoriteSports, setFavoriteSports] = useState<string[]>([])
  const [frequentSport, setFrequentSport] = useState('')
  const [weeklyFreq, setWeeklyFreq] = useState('')
  const [avgDuration, setAvgDuration] = useState('')
  const [sports, setSports] = useState<Sport[]>([])
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>(null)
  const [inputModal, setInputModal] = useState<InputModal>(null)
  const [customInput, setCustomInput] = useState('')
  const [error, setError] = useState('')
  const [checkingNickname, setCheckingNickname] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSports()
      .then(({ data }) => setSports(data?.length ? data : (MOCK_SPORTS as unknown as Sport[])))
      .catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [])

  const sportIdsByName = useMemo(() => {
    const ids = new Map(sports.map(sport => [sport.name, sport.id]))
    const running = sports.find(sport => sport.code === 'running')
    if (running) ids.set('러닝', running.id)
    return ids
  }, [sports])

  function toggle(list: string[], setter: (value: string[]) => void, value: string) {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value])
  }

  function selectGender(value: string) {
    setGender(value)
    setError('')
  }

  async function handleNicknameCheck() {
    const normalized = nickname.trim()
    if (normalized.length < 2 || normalized.length > 10) {
      setError('닉네임은 2~10자로 입력해 주세요.')
      return
    }
    setCheckingNickname(true)
    setError('')
    const { available, error: checkError } = await checkNicknameAvailability(normalized, user?.id)
    setCheckingNickname(false)
    if (checkError) {
      setError('닉네임 중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.')
      return
    }
    setNicknameChecked(available)
    setFeedbackModal(available ? 'nickname-available' : 'nickname-duplicate')
  }

  function validateStep() {
    if (step === 1 && (!nicknameChecked || !ageGroup || !gender)) {
      setError(!nicknameChecked ? '닉네임 중복 확인을 완료해 주세요.' : '나이와 성별을 모두 선택해 주세요.')
      return false
    }
    const selections = [goal, traits.length, favoriteSports.length, frequentSport, weeklyFreq, avgDuration]
    if (step > 1 && !selections[step - 2]) {
      setError('항목을 선택한 뒤 다음으로 이동해 주세요.')
      return false
    }
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    if (step === 1 && gender === 'other') {
      setFeedbackModal('gender-warning')
      return
    }
    setError('')
    setStep(current => Math.min(TOTAL_STEPS, current + 1))
  }

  function addCustomValue() {
    const value = customInput.trim()
    if (!value) return
    if (inputModal === 'trait' && !traits.includes(`#${value}`)) setTraits([...traits, `#${value}`])
    if (inputModal === 'favorite' && !favoriteSports.includes(value)) setFavoriteSports([...favoriteSports, value])
    if (inputModal === 'frequent') setFrequentSport(value)
    setCustomInput('')
    setInputModal(null)
  }

  async function handleSubmit() {
    if (!user || !validateStep()) return
    setLoading(true)
    setError('')
    const level = getExerciseLevel(weeklyFreq, avgDuration)
    const preferredSportIds = favoriteSports
      .map(name => sportIdsByName.get(name))
      .filter((id): id is string => Boolean(id))
    const structuredTraits = [
      `연령대:${ageGroup}`,
      `운동목표:${EXERCISE_GOALS.find(item => item.value === goal)?.label ?? goal}`,
      ...traits,
      `자주하는운동:${frequentSport}`,
      `주간빈도:${WEEKLY_FREQ.find(item => item.value === weeklyFreq)?.label ?? weeklyFreq}`,
      `평균운동시간:${AVG_DURATION.find(item => item.value === avgDuration)?.label ?? avgDuration}`,
      ...favoriteSports.filter(name => !sportIdsByName.has(name)).map(name => `선호운동:${name}`),
    ]
    const { error: submitError } = await createProfile({
      id: user.id,
      nickname: nickname.trim(),
      gender,
      birth_year: getBirthYearFromAgeGroup(ageGroup),
      exercise_level: level,
      preferred_sports: preferredSportIds,
      workout_traits: structuredTraits,
    })
    setLoading(false)
    if (submitError) {
      if (submitError.message.includes('unique') || submitError.message.includes('duplicate')) {
        setStep(1)
        setNicknameChecked(false)
        setFeedbackModal('nickname-duplicate')
      } else {
        setError('프로필 저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
      }
      return
    }
    navigate('/onboarding/result', {
      replace: true,
      state: {
        nickname: nickname.trim(),
        level,
        weeklyFreq,
        goal: EXERCISE_GOALS.find(item => item.value === goal)?.label,
      },
    })
  }

  const headerTitle = ['사용자 조사', '운동 목표', '사용자 조사', '사용자 조사', '자주하는 운동 선택', '운동 빈도 조사', '평균 운동 시간'][step - 1]

  return (
    <div className="relative flex min-h-dvh flex-col bg-spark-white text-spark-dark">
      <header className="flex h-16 shrink-0 items-center border-b border-gray-100 px-6">
        {step > 1 && (
          <button type="button" onClick={() => setStep(current => current - 1)} className="text-3xl leading-none text-spark-purple" aria-label="이전 단계">
            ‹
          </button>
        )}
        <h1 className={`text-xl font-bold ${step > 1 ? 'absolute left-1/2 -translate-x-1/2' : 'mx-auto'}`}>{headerTitle}</h1>
      </header>

      <main className="flex flex-1 flex-col px-6 pb-6 pt-9">
        <div className="mb-7">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span className="font-bold text-spark-purple">{PROGRESS[step - 1]}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-spark-soft-purple">
            <div className="h-full bg-spark-purple transition-all" style={{ width: `${PROGRESS[step - 1]}%` }} />
          </div>
        </div>

        {step === 1 && (
          <>
            <section className="text-center">
              <h2 className="text-2xl font-bold">기본 정보 입력</h2>
              <p className="mt-3 text-sm font-medium text-[#575b6b]">맞춤형 추천을 위해 나이와 성별을 알려주세요.</p>
            </section>
            <section className="mt-12 space-y-3">
              <label className="block text-sm font-semibold">닉네임</label>
              <div className="flex h-[58px] items-center rounded-xl border border-gray-200 bg-spark-muted p-1.5 focus-within:border-spark-purple">
                <input
                  value={nickname}
                  maxLength={10}
                  onChange={event => {
                    setNickname(event.target.value)
                    setNicknameChecked(false)
                    setError('')
                  }}
                  placeholder="2~10자 이내 작성"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-[#9699a8]"
                />
                <button type="button" onClick={handleNicknameCheck} disabled={checkingNickname} className="h-10 rounded-xl bg-spark-purple px-4 text-sm font-bold text-white disabled:opacity-60">
                  {checkingNickname ? '확인 중' : '중복확인'}
                </button>
              </div>
              <p className="pt-1 text-sm text-[#7b7f90]">나이가 어떻게 되시나요?</p>
              <div className="grid grid-cols-3 gap-2">
                {AGE_GROUPS.map(item => (
                  <button type="button" key={item} onClick={() => setAgeGroup(item)} className={`h-12 rounded-xl border text-sm font-semibold ${ageGroup === item ? 'border-spark-purple bg-spark-soft-purple text-spark-purple' : 'border-gray-200 bg-spark-muted text-spark-text-secondary'}`}>
                    {item}
                  </button>
                ))}
              </div>
              <p className="pt-5 text-sm text-[#7b7f90]">성별</p>
              <div className="grid grid-cols-3 gap-5">
                {GENDERS.map(item => (
                  <button type="button" key={item.value} onClick={() => selectGender(item.value)} className={`h-11 rounded-full border text-sm font-semibold ${gender === item.value ? 'border-spark-purple bg-spark-soft-purple text-spark-purple' : 'border-gray-200 bg-white text-spark-text-secondary'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {step === 2 && (
          <>
            <section>
              <h2 className="text-[24px] font-bold leading-tight">운동의 목표가 어떻게 되시나요?</h2>
              <p className="mt-3 text-sm leading-6 text-[#575b6b]">목표에 따라 캐릭터가 성장하는 모습이 달라집니다.</p>
            </section>
            <div className="mt-8 rounded-2xl bg-spark-soft-purple p-4 text-xs leading-5 text-spark-text-secondary">
              <span className="mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-spark-purple font-bold text-white">i</span>
              입력하신 정보는 오직 유저님의 운동에 따라 변화하는 개인 맞춤형 캐릭터를 생성하는 데에만 안전하게 사용됩니다.
            </div>
            <div className="mt-8 space-y-3">
              {EXERCISE_GOALS.map(item => (
                <button type="button" key={item.value} onClick={() => setGoal(item.value)} className={`flex min-h-[98px] w-full items-center gap-4 rounded-2xl border p-4 text-left ${goal === item.value ? 'border-spark-purple bg-spark-soft-purple' : 'border-gray-200 bg-white shadow-sm'}`}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl text-spark-purple">{item.icon}</span>
                  <span className="flex-1">
                    <strong className="block text-xl">{item.label}</strong>
                    <span className="mt-1 block text-sm text-[#575b6b]">{item.description}</span>
                  </span>
                  <span className={`h-6 w-6 rounded-full border-2 ${goal === item.value ? 'border-[7px] border-spark-purple' : 'border-gray-300'}`} />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold">나의 운동 성향은?</h2>
            <p className="mt-2 text-sm text-[#575b6b]">가장 잘 어울리는 키워드를 선택해 주세요.</p>
            <div className="mt-20 flex flex-wrap gap-2">
              {EXERCISE_TRAITS.map(item => (
                <button type="button" key={item} onClick={() => toggle(traits, setTraits, item)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${traits.includes(item) ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-200 bg-white text-spark-text-secondary'}`}>
                  {item}
                </button>
              ))}
              {traits.filter(item => !EXERCISE_TRAITS.includes(item)).map(item => (
                <button type="button" key={item} onClick={() => toggle(traits, setTraits, item)} className="rounded-full border border-spark-purple bg-spark-purple px-4 py-2 text-sm font-semibold text-white">{item}</button>
              ))}
              <button type="button" onClick={() => setInputModal('trait')} className="rounded-full border-2 border-[#d3d7df] px-4 py-2 text-sm font-semibold text-[#525767]">+ 직접 입력</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-2xl font-bold">좋아하는 운동</h2>
            <p className="mt-2 text-sm text-[#575b6b]">관심 있는 운동을 1개 이상 선택해 주세요.</p>
            <div className="mt-10 flex flex-wrap gap-2">
              {FAVORITE_SPORTS.map(item => {
                const order = favoriteSports.indexOf(item) + 1
                return (
                  <button type="button" key={item} onClick={() => toggle(favoriteSports, setFavoriteSports, item)} className={`relative rounded-full border px-4 py-2 text-sm font-semibold ${order ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-200 bg-white text-spark-text-secondary'}`}>
                    #{item}
                    {order > 0 && <span className="absolute -right-1 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-spark-lime text-[11px] font-bold text-spark-dark">{order}</span>}
                  </button>
                )
              })}
              {favoriteSports.filter(item => !FAVORITE_SPORTS.includes(item)).map(item => (
                <button type="button" key={item} onClick={() => toggle(favoriteSports, setFavoriteSports, item)} className="rounded-full border border-spark-purple bg-spark-purple px-4 py-2 text-sm font-semibold text-white">#{item}</button>
              ))}
              <button type="button" onClick={() => setInputModal('favorite')} className="rounded-full border-2 border-[#d3d7df] px-4 py-2 text-sm font-semibold text-[#525767]">+ 직접 입력</button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-[24px] font-bold leading-tight">어떤 운동을<br />가장 자주 하시나요?</h2>
            <p className="mt-3 text-sm leading-5 text-[#575b6b]">선택하신 운동을 바탕으로 맞춤형 트레이닝 일정을 짜고,<br />회원님에게 가장 필요한 동네 모임을 추천해 드릴 예정입니다.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {FREQUENT_SPORTS.map(item => (
                <button type="button" key={item.value} onClick={() => setFrequentSport(item.value)} className={`flex h-[108px] flex-col items-center justify-center rounded-2xl border text-center ${frequentSport === item.value ? 'border-spark-purple bg-spark-soft-purple' : 'border-gray-200 bg-white shadow-sm'}`}>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-spark-soft-purple text-xl text-spark-purple">{item.icon}</span>
                  <strong className="whitespace-pre-line text-sm">{item.label}</strong>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setInputModal('frequent')} className={`mt-2 flex h-[52px] w-full items-center rounded-xl border p-1.5 ${frequentSport && !FREQUENT_SPORTS.some(item => item.value === frequentSport) ? 'border-spark-purple bg-spark-soft-purple' : 'border-gray-200 bg-white'}`}>
              <span className="flex-1 px-3 text-left text-sm text-[#575b6b]">{frequentSport && !FREQUENT_SPORTS.some(item => item.value === frequentSport) ? frequentSport : ''}</span>
              <span className="rounded-lg bg-spark-purple px-4 py-2 text-sm font-bold text-white">직접 입력</span>
            </button>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="text-[24px] font-bold leading-tight">평소 주에 운동을<br />얼마나 자주 하시나요?</h2>
            <p className="mt-3 text-sm leading-6 text-[#575b6b]">이 답변은 회원님에게 딱 맞는 운동 여정을 설계하고, 달성 가능한 목표를 설정하는 데 도움이 됩니다.</p>
            <div className="mt-8 space-y-3">
              {WEEKLY_FREQ.map(item => (
                <button type="button" key={item.value} onClick={() => setWeeklyFreq(item.value)} className={`flex min-h-[82px] w-full items-center gap-4 rounded-2xl border p-4 text-left ${weeklyFreq === item.value ? 'border-spark-purple bg-spark-soft-purple' : 'border-gray-200 bg-white shadow-sm'}`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-spark-soft-purple text-2xl font-bold text-spark-purple">{item.icon}</span>
                  <span>
                    <strong className="block text-xl">{item.label}</strong>
                    <span className="mt-1 block text-xs text-[#575b6b]">{item.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <h2 className="text-[24px] font-bold leading-tight">한 번 운동할 때 평균적으로<br />얼마나 오래 하시나요?</h2>
            <p className="mt-1 text-sm">(회당 평균 운동 시간)</p>
            <div className="mt-5 space-y-3">
              {AVG_DURATION.map(item => (
                <button type="button" key={item.value} onClick={() => setAvgDuration(item.value)} className={`min-h-[108px] w-full rounded-2xl border px-6 py-5 text-left ${avgDuration === item.value ? 'border-spark-purple bg-spark-soft-purple' : 'border-gray-200 bg-white shadow-sm'}`}>
                  <strong className="block text-xl">{item.label}</strong>
                  <span className="mt-2 block text-sm text-[#575b6b]">({item.description})</span>
                </button>
              ))}
            </div>
          </>
        )}

        {error && <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-auto pt-8">
          <button type="button" onClick={step === TOTAL_STEPS ? handleSubmit : nextStep} disabled={loading} className="h-14 w-full rounded-full bg-spark-lime text-base font-bold text-spark-dark shadow-spark-card disabled:opacity-60">
            {loading ? '프로필 생성 중...' : '다음'}
          </button>
        </div>
      </main>

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6">
          <div className="spark-modal-panel max-w-[380px] rounded-3xl bg-white px-6 pb-6 pt-8 text-center shadow-2xl">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black ${feedbackModal === 'nickname-available' ? 'bg-[#cffff0] text-[#16b978]' : 'bg-[#ffd5d1] text-[#c6202b]'}`}>!</div>
            <h3 className="mt-6 text-xl font-bold">
              {feedbackModal === 'nickname-available' && '사용가능한 닉네임'}
              {feedbackModal === 'nickname-duplicate' && '중복된 닉네임'}
              {feedbackModal === 'gender-warning' && '성별을 정확하게 공개하는걸 추천해요'}
            </h3>
            <p className="mt-3 whitespace-pre-line text-base leading-6 text-[#555a6c]">
              {feedbackModal === 'nickname-available' && `멋진 닉네임이네요!\n이 닉네임으로 시작할까요?`}
              {feedbackModal === 'nickname-duplicate' && `이미 사용 중인 닉네임입니다.\n다른 닉네임을 입력해 주세요.`}
              {feedbackModal === 'gender-warning' && `성별을 '남성' 또는 '여성'으로 정확하게\n선택하시면 유저님의 성향에 딱 맞는\n맞춤형 운동 모임을 추천받으실 수\n있어요. 이대로 진행하시겠어요?`}
            </p>
            {feedbackModal === 'gender-warning' ? (
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => { setFeedbackModal(null); setStep(2) }} className="h-[52px] rounded-full bg-spark-soft-purple font-bold text-spark-purple">그대로 진행</button>
                <button type="button" onClick={() => setFeedbackModal(null)} className="h-[52px] rounded-full bg-spark-purple font-bold text-white">성별 변경하기</button>
              </div>
            ) : (
              <button type="button" onClick={() => setFeedbackModal(null)} className="mt-8 h-[52px] w-full rounded-full bg-spark-lime font-bold text-spark-dark">확인</button>
            )}
          </div>
        </div>
      )}

      {inputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-9">
          <div className="spark-modal-panel max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold">{inputModal === 'trait' ? '운동 성향 직접 입력' : '운동 직접 입력'}</h3>
            <label className="mt-7 block text-sm text-[#575b6b]">{inputModal === 'trait' ? '운동 성향' : '운동 이름'}</label>
            <input autoFocus value={customInput} maxLength={10} onChange={event => setCustomInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') addCustomValue() }} placeholder={inputModal === 'trait' ? '운동 성향을 입력해 주세요' : '운동 이름을 입력해 주세요'} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-spark-purple" />
            <p className="mt-1 text-right text-xs text-[#575b6b]">{customInput.length}/10</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setInputModal(null); setCustomInput('') }} className="h-[52px] rounded-full bg-spark-muted font-bold text-spark-text-secondary">취소</button>
              <button type="button" onClick={addCustomValue} disabled={!customInput.trim()} className="h-[52px] rounded-full bg-spark-purple font-bold text-white disabled:opacity-50">추가하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
