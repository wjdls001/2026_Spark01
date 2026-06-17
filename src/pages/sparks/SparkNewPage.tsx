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
    setError('')
    navigate('/sparks/new/confirm', { state: { form, sports } })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">번개 만들기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col gap-5">
          <Field label="번개 제목 *">
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="예: 한강 러닝 같이 뛰실 분"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </Field>

          <Field label="운동 종목">
            <div className="flex flex-wrap gap-2">
              {sports.map(sport => (
                <button key={sport.id} onClick={() => set('sport_id', sport.id === form.sport_id ? '' : sport.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${form.sport_id === sport.id ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-300 text-[#555555]'}`}>
                  {sport.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="장소 *">
            <input value={form.place_name} onChange={e => set('place_name', e.target.value)}
              placeholder="예: 한강공원 반포지구"
              className="mb-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="상세 주소 (선택)"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </Field>

          <Field label="날짜 및 시간 *">
            <div className="flex gap-2">
              <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
              <input type="time" value={form.scheduled_time} onChange={e => set('scheduled_time', e.target.value)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="예상 시간 (분)">
              <input type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)}
                placeholder="60"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
            </Field>
            <Field label="정원">
              <input type="number" min="2" max="20" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
            </Field>
          </div>

          <Field label="운동 레벨 조건">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-[#777777]">최소</label>
                <select value={form.min_level} onChange={e => set('min_level', e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9B8FFF]">
                  <option value="">제한 없음</option>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#777777]">최대</label>
                <select value={form.max_level} onChange={e => set('max_level', e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9B8FFF]">
                  <option value="">제한 없음</option>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </Field>

          <Field label="성별 조건">
            <div className="flex gap-2">
              {[{ v: 'any', l: '누구나' }, { v: 'male', l: '남성만' }, { v: 'female', l: '여성만' }].map(g => (
                <button key={g.v} onClick={() => set('gender_condition', g.v)}
                  className={`flex-1 rounded-full border py-2 text-sm ${form.gender_condition === g.v ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]' : 'border-gray-300 text-[#555555]'}`}>
                  {g.l}
                </button>
              ))}
            </div>
          </Field>

          <Field label="상세 설명">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="운동 코스, 준비물, 참여 방법 등을 자유롭게 작성해주세요"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF] resize-none" />
          </Field>
        </div>
      </div>

      <div className="px-5 pb-8 pt-3">
        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
        <button onClick={handleNext}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]">
          다음 ⚡
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
