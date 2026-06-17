import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { createProfile } from '@/features/mypage/api'
import { fetchSports } from '@/features/exercise/api'
import type { Sport } from '@/types/database'

const EXERCISE_LEVELS = [
  { value: 'beginner', label: '초보자', desc: '운동을 이제 막 시작했어요' },
  { value: 'intermediate', label: '중급자', desc: '규칙적으로 운동하고 있어요' },
  { value: 'advanced', label: '고급자', desc: '꾸준히 높은 강도로 운동해요' },
  { value: 'expert', label: '전문가', desc: '선수급 실력을 갖추고 있어요' },
]

export function OnboardingProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [level, setLevel] = useState('beginner')
  const [preferredSports, setPreferredSports] = useState<string[]>([])
  const [activityArea, setActivityArea] = useState('')
  const [sports, setSports] = useState<Sport[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSports().then(({ data }) => { if (data) setSports(data) })
  }, [])

  function toggleSport(id: string) {
    setPreferredSports(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    if (!user) return
    if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    setError('')
    setLoading(true)
    const { error: err } = await createProfile({
      id: user.id,
      nickname: nickname.trim(),
      exercise_level: level,
      preferred_sports: preferredSports,
      activity_area: activityArea || null,
    })
    if (err) {
      if (err.message.includes('unique') || err.message.includes('duplicate')) {
        setError('이미 사용 중인 닉네임이에요.')
      } else {
        setError('프로필 저장에 실패했어요.')
      }
      setLoading(false)
      return
    }
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-6 py-8">
      <div className="mb-2 text-2xl font-bold text-[#111111]">⚡ SPARK</div>

      <div className="mb-6 mt-6">
        <div className="mb-2 flex gap-1">
          {[1, 2, 3].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? 'bg-[#9B8FFF]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-xs text-[#999999]">{step} / 3</p>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="mb-1 text-xl font-bold text-[#111111]">닉네임을 알려주세요</h1>
            <p className="text-sm text-[#777777]">다른 사용자에게 보여질 이름이에요</p>
          </div>
          <div>
            <input
              value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="닉네임 입력 (2~12자)"
              maxLength={12}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]">활동 지역 (선택)</label>
            <input
              value={activityArea} onChange={e => setActivityArea(e.target.value)}
              placeholder="예: 마포구, 서울숲 근처"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="mb-1 text-xl font-bold text-[#111111]">운동 레벨이 어떻게 되세요?</h1>
            <p className="text-sm text-[#777777]">번개 모임 참여 조건에 활용돼요</p>
          </div>
          <div className="flex flex-col gap-3">
            {EXERCISE_LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                  level === l.value
                    ? 'border-[#9B8FFF] bg-[#EEE8FF]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="font-bold text-[#111111]">{l.label}</div>
                <div className="mt-0.5 text-sm text-[#777777]">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="mb-1 text-xl font-bold text-[#111111]">좋아하는 운동을 골라주세요</h1>
            <p className="text-sm text-[#777777]">복수 선택 가능해요</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => toggleSport(sport.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  preferredSports.includes(sport.id)
                    ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                    : 'border-gray-300 bg-white text-[#333333]'
                }`}
              >
                {sport.name}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      <div className="mt-auto pt-8">
        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && !nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
              setError('')
              setStep(s => s + 1)
            }}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60"
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>
        )}
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="mt-3 w-full py-2 text-sm text-[#777777]"
          >
            이전
          </button>
        )}
      </div>
    </div>
  )
}
