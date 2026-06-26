import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { checkNicknameAvailability, fetchProfile, updateProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import { MOCK_SPORTS } from '@/lib/mockData'
import type { Sport } from '@/types/database'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { getLevelTier, levelNumberFromExerciseLevel } from '@/lib/utils/level'

const TRAITS = ['#꾸준함', '#계획형', '#아침운동', '#저녁운동', '#혼자운동', '#그룹운동', '#실내운동', '#야외운동', '#고강도', '#저강도', '#유산소', '#근력운동']
type Screen = 'edit' | 'sports' | 'traits'

export function MyProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [screen, setScreen] = useState<Screen>('edit')
  const [sports, setSports] = useState<Sport[]>([])
  const [originalNickname, setOriginalNickname] = useState('')
  const [exerciseLevel, setExerciseLevel] = useState<string | null>(null)
  const [nicknameChecked, setNicknameChecked] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [inputType, setInputType] = useState<'sport' | 'trait' | null>(null)
  const [form, setForm] = useState({
    nickname: '',
    gender: '',
    bio: '',
    preferred_sports: [] as string[],
    workout_traits: [] as string[],
  })

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => {
      if (!data) return
      setOriginalNickname(data.nickname)
      setExerciseLevel(data.exercise_level)
      setForm({
        nickname: data.nickname,
        gender: data.gender ?? '',
        bio: '건강한 삶을 위해 달립니다!',
        preferred_sports: data.preferred_sports ?? [],
        workout_traits: data.workout_traits ?? [],
      })
    })
    fetchSports().then(({ data }) => setSports(data?.length ? data : MOCK_SPORTS as unknown as Sport[])).catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [user])

  const visibleTraits = form.workout_traits.filter(item => item.startsWith('#') || !item.includes(':'))

  async function handleNicknameCheck() {
    if (!user || form.nickname.trim().length < 2) {
      setError('닉네임은 2자 이상 입력해 주세요.')
      return
    }
    setChecking(true)
    const { available } = await checkNicknameAvailability(form.nickname.trim(), user.id)
    setChecking(false)
    setNicknameChecked(available)
    setMessage(available ? '사용 가능한 닉네임이에요.' : '')
    setError(available ? '' : '이미 사용 중인 닉네임이에요.')
  }

  function toggleSport(id: string) {
    setForm(current => ({ ...current, preferred_sports: current.preferred_sports.includes(id) ? current.preferred_sports.filter(item => item !== id) : [...current.preferred_sports, id] }))
  }

  function toggleTrait(value: string) {
    setForm(current => ({ ...current, workout_traits: current.workout_traits.includes(value) ? current.workout_traits.filter(item => item !== value) : [...current.workout_traits, value] }))
  }

  function addCustom() {
    const value = customInput.trim()
    if (!value) return
    if (inputType === 'trait') toggleTrait(value.startsWith('#') ? value : `#${value}`)
    if (inputType === 'sport' && !form.preferred_sports.includes(`선호운동:${value}`)) {
      setForm(current => ({ ...current, preferred_sports: [...current.preferred_sports, `선호운동:${value}`] }))
    }
    setCustomInput('')
    setInputType(null)
  }

  async function handleSave() {
    if (!user) return
    if (!form.nickname.trim()) return setError('닉네임을 입력해 주세요.')
    if (form.nickname.trim() !== originalNickname && !nicknameChecked) return setError('닉네임 중복 확인을 완료해 주세요.')
    setLoading(true)
    const { error: saveError } = await updateProfile(user.id, {
      nickname: form.nickname.trim(),
      gender: form.gender || null,
      preferred_sports: form.preferred_sports,
      workout_traits: form.workout_traits,
    })
    setLoading(false)
    if (saveError) return setError(saveError.message.includes('unique') ? '이미 사용 중인 닉네임이에요.' : '저장에 실패했어요.')
    setMessage('프로필이 저장되었어요.')
    setTimeout(() => navigate('/mypage'), 700)
  }

  if (screen !== 'edit') {
    const isSports = screen === 'sports'
    return (
      <div className="spark-page-background flex min-h-dvh flex-col text-spark-dark">
        <SubHeader title={isSports ? '선호 운동 추가' : '운동 성향 추가'} onBack={() => setScreen('edit')} />
        <main className="flex-1 px-5 py-6">
          <p className="text-sm text-spark-text-secondary">{isSports ? '원하는 운동을 선택해 주세요 (복수 선택 가능)' : '원하는 운동 성향을 선택해 주세요 (복수 선택 가능)'}</p>
          {isSports && <p className="mt-2 text-xs text-spark-gray">운동 기록 중 운동 종목이 횟수로 저장됩니다.</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {isSports ? sports.map(sport => {
              const selected = form.preferred_sports.includes(sport.id)
              const order = form.preferred_sports.indexOf(sport.id) + 1
              return <button key={sport.id} onClick={() => toggleSport(sport.id)} className={`relative rounded-full border px-4 py-2 text-sm font-bold ${selected ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-200 bg-white text-spark-text-secondary'}`}>#{sport.name}{order > 0 && <sup className="ml-1">{order}</sup>}</button>
            }) : TRAITS.map(trait => <button key={trait} onClick={() => toggleTrait(trait)} className={`rounded-full border px-4 py-2 text-sm font-bold ${form.workout_traits.includes(trait) ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-200 bg-white text-spark-text-secondary'}`}>{trait}</button>)}
            <button onClick={() => setInputType(isSports ? 'sport' : 'trait')} className="rounded-full border border-dashed border-spark-purple px-4 py-2 text-sm font-bold text-spark-purple">+ 직접 입력</button>
          </div>
        </main>
        <div className="px-5 pb-8"><button onClick={() => setScreen('edit')} className="h-[52px] w-full rounded-full bg-spark-lime font-bold text-spark-dark">저장하기</button></div>
        {inputType && <CustomInputModal title={inputType === 'sport' ? '운동 직접 입력' : '운동 성향 직접 입력'} value={customInput} onChange={setCustomInput} onCancel={() => setInputType(null)} onAdd={addCustom} />}
      </div>
    )
  }

  return (
    <div className="spark-page-background flex min-h-dvh flex-col text-spark-dark">
      <SubHeader title="프로필 관리" onBack={() => navigate(-1)} />
      <main className="flex-1 space-y-6 px-5 py-6">
        <section className="flex flex-col items-center">
          <SparkCharacter size="lg" mood="happy" />
          <span className="mt-3 whitespace-nowrap rounded-full bg-spark-dark px-4 py-1 text-xs font-bold text-white">{getLevelTier(levelNumberFromExerciseLevel(exerciseLevel))} · LV.{levelNumberFromExerciseLevel(exerciseLevel)}</span>
          <div className="mt-3 h-2 w-full rounded-full bg-spark-muted"><div className="h-full w-4/5 rounded-full bg-spark-purple" /></div>
          <span className="mt-1 self-end text-[10px] text-spark-gray">EXP</span>
        </section>

        <Field label="닉네임">
          <div className="flex h-14 items-center rounded-spark-sm border border-gray-200 bg-spark-muted p-1.5 focus-within:border-spark-purple">
            <input value={form.nickname} maxLength={10} onChange={event => { setForm(current => ({ ...current, nickname: event.target.value })); setNicknameChecked(event.target.value === originalNickname); setMessage('') }} placeholder="2자~10자 이내 작성" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
            <button onClick={handleNicknameCheck} disabled={checking} className="h-10 rounded-full bg-spark-purple px-4 text-sm font-bold text-white">{checking ? '확인 중' : '중복확인'}</button>
          </div>
        </Field>

        <Field label="성별">
          <div className="grid grid-cols-3 gap-2">{[{ value: 'male', label: '남성' }, { value: 'female', label: '여성' }, { value: 'other', label: '비공개' }].map(item => <button key={item.value} onClick={() => setForm(current => ({ ...current, gender: item.value }))} className={`h-12 rounded-spark-sm border text-sm font-bold ${form.gender === item.value ? 'border-spark-purple bg-spark-soft-purple text-spark-purple' : 'border-gray-200'}`}>{item.label}</button>)}</div>
        </Field>

        <Field label="자기소개">
          <textarea value={form.bio} maxLength={80} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} className="h-24 w-full resize-none rounded-spark-sm border border-gray-200 p-4 text-sm outline-none focus:border-spark-purple" placeholder="자기소개를 입력하세요." />
        </Field>

        <EditableTags title="운동 성향" items={visibleTraits.slice(0, 3)} onAdd={() => setScreen('traits')} />
        <EditableTags title="선호 운동" items={form.preferred_sports.slice(0, 3).map(id => getSportName(id, sports))} onAdd={() => setScreen('sports')} numbered />
      </main>

      <div className="px-5 pb-8 pt-3">
        {error && <p className="mb-2 text-center text-sm text-spark-error">{error}</p>}
        {message && <p className="mb-2 text-center text-sm font-bold text-spark-purple">{message}</p>}
        <button onClick={handleSave} disabled={loading} className="h-[52px] w-full rounded-full bg-spark-lime font-bold text-spark-dark disabled:opacity-50">{loading ? '저장 중...' : '저장하기'}</button>
      </div>
    </div>
  )
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="relative flex h-16 items-center justify-center border-b border-gray-100"><button onClick={onBack} className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full hover:bg-spark-muted" aria-label="뒤로가기">‹</button><h1 className="text-xl font-bold">{title}</h1></header>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <section><label className="mb-2 block text-sm font-bold">{label}</label>{children}</section>
}

function EditableTags({ title, items, onAdd, numbered }: { title: string; items: string[]; onAdd: () => void; numbered?: boolean }) {
  return <section><h2 className="mb-3 text-sm font-bold">{title}</h2><div className="flex flex-wrap gap-2">{items.map((item, index) => <span key={`${item}-${index}`} className="rounded-full bg-spark-soft-purple px-4 py-2 text-xs font-bold text-spark-purple">{item}{numbered && <sup className="ml-1">{index + 1}</sup>}</span>)}<button onClick={onAdd} className="rounded-full border border-dashed border-spark-purple px-4 py-2 text-xs font-bold text-spark-purple">+ 추가</button></div></section>
}

function CustomInputModal({ title, value, onChange, onCancel, onAdd }: { title: string; value: string; onChange: (value: string) => void; onCancel: () => void; onAdd: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55"><div className="spark-modal-panel rounded-spark-xl bg-white p-6 shadow-spark-floating"><h2 className="text-xl font-bold">{title}</h2><label className="mt-6 block text-sm text-spark-text-secondary">운동 이름</label><input autoFocus value={value} maxLength={10} onChange={event => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-spark-sm border border-gray-200 px-4 outline-none focus:border-spark-purple" placeholder="내용을 입력해 주세요" /><p className="mt-1 text-right text-xs text-spark-gray">{value.length}/10</p><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={onCancel} className="h-12 rounded-full bg-spark-muted font-bold text-spark-text-secondary">취소</button><button onClick={onAdd} disabled={!value.trim()} className="h-12 rounded-full bg-spark-purple font-bold text-white disabled:opacity-40">추가하기</button></div></div></div>
}

function getSportName(id: string, sports: Sport[]) {
  return sports.find(item => item.id === id)?.name
    ?? MOCK_SPORTS.find(item => item.id === id)?.name
    ?? id.replace('선호운동:', '')
}
