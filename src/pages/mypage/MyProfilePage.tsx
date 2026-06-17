import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile, updateProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import type { Sport } from '@/types/database'

const LEVELS = [
  { value: 'beginner', label: '초보자' },
  { value: 'intermediate', label: '중급자' },
  { value: 'advanced', label: '고급자' },
  { value: 'expert', label: '전문가' },
]

const TRAITS = ['열정적', '꼼꼼한', '느긋한', '사교적', '조용한', '경쟁적', '협력적', '도전적']

export function MyProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    nickname: '',
    exercise_level: 'beginner',
    preferred_sports: [] as string[],
    workout_traits: [] as string[],
    activity_area: '',
    gender: '',
    birth_year: '',
  })

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => {
      if (data) {
        setForm({
          nickname: data.nickname,
          exercise_level: data.exercise_level,
          preferred_sports: data.preferred_sports ?? [],
          workout_traits: data.workout_traits ?? [],
          activity_area: data.activity_area ?? '',
          gender: data.gender ?? '',
          birth_year: data.birth_year ? String(data.birth_year) : '',
        })
      }
    })
    fetchSports().then(({ data }) => { if (data) setSports(data) })
  }, [user])

  function toggleSport(id: string) {
    setForm(f => ({
      ...f,
      preferred_sports: f.preferred_sports.includes(id)
        ? f.preferred_sports.filter(s => s !== id)
        : [...f.preferred_sports, id],
    }))
  }

  function toggleTrait(t: string) {
    setForm(f => ({
      ...f,
      workout_traits: f.workout_traits.includes(t)
        ? f.workout_traits.filter(tr => tr !== t)
        : [...f.workout_traits, t],
    }))
  }

  async function handleSave() {
    if (!user) return
    if (!form.nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await updateProfile(user.id, {
      nickname: form.nickname.trim(),
      exercise_level: form.exercise_level,
      preferred_sports: form.preferred_sports,
      workout_traits: form.workout_traits,
      activity_area: form.activity_area || null,
      gender: form.gender || null,
      birth_year: form.birth_year ? Number(form.birth_year) : null,
    })
    if (err) {
      setError(err.message.includes('unique') ? '이미 사용 중인 닉네임이에요.' : '저장에 실패했어요.')
    } else {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); navigate(-1) }, 1000)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">프로필 편집</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* 아바타 */}
        <div className="mb-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-[#EEE8FF] flex items-center justify-center text-3xl font-bold text-[#9B8FFF]">
            {form.nickname?.[0] ?? '?'}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <Field label="닉네임 *">
            <input value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
              maxLength={12}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </Field>

          <Field label="활동 지역">
            <input value={form.activity_area} onChange={e => setForm(f => ({ ...f, activity_area: e.target.value }))}
              placeholder="예: 마포구"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </Field>

          <Field label="운동 레벨">
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map(l => (
                <button key={l.value} onClick={() => setForm(f => ({ ...f, exercise_level: l.value }))}
                  className={`rounded-2xl border py-2.5 text-sm ${form.exercise_level === l.value ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]' : 'border-gray-200 text-[#555555]'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="선호 운동">
            <div className="flex flex-wrap gap-2">
              {sports.map(sport => (
                <button key={sport.id} onClick={() => toggleSport(sport.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${form.preferred_sports.includes(sport.id) ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-300 text-[#555555]'}`}>
                  {sport.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="운동 성향">
            <div className="flex flex-wrap gap-2">
              {TRAITS.map(t => (
                <button key={t} onClick={() => toggleTrait(t)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${form.workout_traits.includes(t) ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-300 text-[#555555]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="성별 (선택)">
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#9B8FFF]">
                <option value="">선택 안 함</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </Field>
            <Field label="출생연도 (선택)">
              <input type="number" value={form.birth_year}
                onChange={e => setForm(f => ({ ...f, birth_year: e.target.value }))}
                placeholder="예: 1995" min="1950" max="2010"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
            </Field>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-3">
        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
        {success && <p className="mb-2 text-center text-sm text-green-600">저장되었어요!</p>}
        <button onClick={handleSave} disabled={loading}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60">
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#111111]">{label}</label>
      {children}
    </div>
  )
}
