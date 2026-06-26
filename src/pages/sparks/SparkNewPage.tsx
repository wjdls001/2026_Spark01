import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSports } from '@/features/sparks/api'
import type { Sport } from '@/types/database'

export const LEVELS = [
  { value: 'beginner', label: '초보자' },
  { value: 'intermediate', label: '중급자' },
  { value: 'advanced', label: '고급자' },
  { value: 'expert', label: '전문가' },
]

export function SparkNewPage() {
  const navigate = useNavigate()
  const [sports, setSports] = useState<Sport[]>([])
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    sport_id: '',
    place_name: '',
    address: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: '',
    capacity: '4',
    min_level: '',
    max_level: '',
    age_min: '20',
    age_max: '39',
    gender_condition: 'any',
    description: '',
  })

  useEffect(() => {
    fetchSports().then(({ data }) => { if (data) setSports(data) })
  }, [])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNext() {
    if (!form.title.trim()) { setError('번개 제목을 입력해주세요.'); return }
    if (!form.scheduled_date || !form.scheduled_time) { setError('날짜와 시간을 입력해주세요.'); return }
    if (!form.place_name.trim()) { setError('장소를 입력해주세요.'); return }
    if (!form.capacity || Number(form.capacity) < 2) { setError('모집 인원을 입력해주세요.'); return }
    if (!form.min_level) { setError('참여 가능한 운동 레벨을 선택해주세요.'); return }
    if (!form.age_min || !form.age_max) { setError('참여 가능한 나이를 입력해주세요.'); return }
    setError('')
    navigate('/sparks/new/confirm', { state: { form, sports } })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-spark-dark">번개 만들기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col gap-5">
          <Field label="번개 제목 *">
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="예: 한강 러닝 같이 뛰실 분"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
          </Field>

          <Field label="운동 종목">
            <div className="flex flex-wrap gap-2">
              {sports.map(sport => (
                <button key={sport.id} onClick={() => set('sport_id', sport.id === form.sport_id ? '' : sport.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${form.sport_id === sport.id ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-300 text-spark-text-secondary'}`}>
                  {sport.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="장소 *">
            <input value={form.place_name} onChange={e => set('place_name', e.target.value)}
              placeholder="예: 한강공원 반포지구"
              className="mb-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="상세 주소 (선택)"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
          </Field>

          <Field label="날짜 및 시간 *">
            <div className="flex gap-2">
              <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
              <input type="time" value={form.scheduled_time} onChange={e => set('scheduled_time', e.target.value)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="예상 시간 (분)">
              <input type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)}
                placeholder="60"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
            </Field>
            <Field label="모집 인원 *">
              <input type="number" min="2" max="20" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
            </Field>
          </div>

          <Field label="운동 레벨 조건 *">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-spark-text-secondary">최소</label>
                <select value={form.min_level} onChange={e => set('min_level', e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-spark-purple">
                  <option value="">선택</option>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-spark-text-secondary">최대</label>
                <select value={form.max_level} onChange={e => set('max_level', e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-spark-purple">
                  <option value="">제한 없음</option>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </Field>

          <Field label="참여 가능 나이 *">
            <div className="flex items-center gap-2">
              <input type="number" min="14" max="99" value={form.age_min} onChange={e => set('age_min', e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
              <span className="shrink-0 text-sm text-spark-text-secondary">세 ~</span>
              <input type="number" min="14" max="99" value={form.age_max} onChange={e => set('age_max', e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple" />
              <span className="shrink-0 text-sm text-spark-text-secondary">세</span>
            </div>
          </Field>

          <Field label="성별 조건">
            <div className="flex gap-2">
              {[{ v: 'any', l: '누구나' }, { v: 'male', l: '남성만' }, { v: 'female', l: '여성만' }].map(g => (
                <button key={g.v} onClick={() => set('gender_condition', g.v)}
                  className={`flex-1 rounded-full border py-2 text-sm ${form.gender_condition === g.v ? 'border-spark-purple bg-spark-soft-purple text-spark-purple' : 'border-gray-300 text-spark-text-secondary'}`}>
                  {g.l}
                </button>
              ))}
            </div>
          </Field>

          <Field label="상세 설명">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="운동 코스, 준비물, 참여 방법 등을 자유롭게 작성해주세요"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-spark-purple resize-none" />
          </Field>
        </div>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-3">
        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
        <button onClick={handleNext}
          className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark">
          다음 ⚡
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-spark-dark">{label}</label>
      {children}
    </div>
  )
}
