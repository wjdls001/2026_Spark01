import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { createSpark } from '@/features/sparks/api'
import { supabase } from '@/lib/supabase/client'
import { LEVELS } from './SparkNewPage'
import type { Sport } from '@/types/database'

type SparkForm = {
  title: string
  sport_id: string
  place_name: string
  address: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: string
  capacity: string
  min_level: string
  max_level: string
  age_min: string
  age_max: string
  gender_condition: string
  description: string
}

const GENDER_LABEL: Record<string, string> = { any: '누구나', male: '남성만', female: '여성만' }

export function SparkNewConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const state = location.state as { form?: SparkForm; sports?: Sport[] } | null

  useEffect(() => {
    if (!state?.form) navigate('/sparks/new', { replace: true })
  }, [state, navigate])

  if (!state?.form) return null
  const { form, sports = [] } = state
  const sportName = sports.find(s => s.id === form.sport_id)?.name

  function levelLabel(value: string) {
    return LEVELS.find(l => l.value === value)?.label ?? value
  }

  async function handleConfirm() {
    if (!user) return
    setLoading(true)
    setError('')

    const scheduledAt = new Date(`${form.scheduled_date}T${form.scheduled_time}`).toISOString()

    const { data, error: err } = await createSpark({
      host_id: user.id,
      title: form.title.trim(),
      sport_id: form.sport_id || null,
      place_name: form.place_name.trim() || null,
      address: form.address.trim() || null,
      scheduled_at: scheduledAt,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      capacity: Number(form.capacity) || 4,
      min_level: form.min_level || null,
      max_level: form.max_level || null,
      age_min: form.age_min ? Number(form.age_min) : null,
      age_max: form.age_max ? Number(form.age_max) : null,
      gender_condition: form.gender_condition || 'any',
      description: form.description.trim() || null,
      status: 'recruiting',
    })

    if (err || !data) {
      setError('번개 생성에 실패했어요.')
      setLoading(false)
      return
    }

    await supabase.from('spark_participants').insert({
      spark_id: (data as { id: string }).id,
      user_id: user.id,
      role: 'host',
      status: 'approved',
    })

    navigate(`/sparks/${(data as { id: string }).id}`, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-spark-dark">입력 내용 확인</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <h2 className="text-lg font-bold text-spark-dark">{form.title}</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Row label="운동 종목" value={sportName ?? '제한 없음'} />
            <Row label="장소" value={form.place_name} />
            {form.address && <Row label="상세 주소" value={form.address} />}
            <Row label="날짜/시간" value={`${form.scheduled_date} ${form.scheduled_time}`} />
            {form.duration_minutes && <Row label="예상 시간" value={`${form.duration_minutes}분`} />}
            <Row label="정원" value={`${form.capacity}명`} />
            <Row
              label="레벨 조건"
              value={form.min_level || form.max_level
                ? `${form.min_level ? levelLabel(form.min_level) : '제한 없음'} ~ ${form.max_level ? levelLabel(form.max_level) : '제한 없음'}`
                : '제한 없음'}
            />
            {(form.age_min || form.age_max) && (
              <Row label="참여 가능 나이" value={`${form.age_min || '0'}세 ~ ${form.age_max || '99'}세`} />
            )}
            <Row label="성별 조건" value={GENDER_LABEL[form.gender_condition] ?? '누구나'} />
            {form.description && <Row label="상세 설명" value={form.description} />}
          </div>
        </div>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-3">
        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-full border border-gray-200 py-4 text-base font-bold text-spark-text-secondary"
          >
            수정하기
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-[2] rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark disabled:opacity-60"
          >
            {loading ? '등록 중...' : '번개 등록하기 ⚡'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-spark-gray">{label}</span>
      <span className="text-right font-medium text-spark-dark">{value}</span>
    </div>
  )
}
