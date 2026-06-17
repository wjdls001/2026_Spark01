import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function OnboardingPhonePage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSendCode() {
    if (!/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ''))) {
      setError('휴대폰 번호를 정확히 입력해주세요.')
      return
    }
    setError('')
    setSent(true)
  }

  function handleVerify() {
    if (code.trim().length !== 6) {
      setError('인증번호 6자리를 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    navigate('/onboarding/profile', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white px-6 py-8">
      <div className="mb-8">
        <div className="mb-1 text-2xl font-bold text-[#111111]">⚡ SPARK</div>
        <h1 className="mt-6 text-xl font-bold text-[#111111]">전화번호 인증을<br />진행해주세요</h1>
        <p className="mt-2 text-sm text-[#777777]">안전한 번개 모임을 위해 본인 확인이 필요해요</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333333]">휴대폰 번호</label>
          <div className="flex gap-2">
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              disabled={sent}
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white disabled:opacity-60"
            />
            <button
              onClick={handleSendCode}
              disabled={sent}
              className="shrink-0 rounded-2xl bg-[#EEE8FF] px-4 text-sm font-bold text-[#9B8FFF] disabled:opacity-60"
            >
              {sent ? '전송됨' : '인증번호 받기'}
            </button>
          </div>
        </div>

        {sent && (
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">인증번호</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="6자리 숫자 입력"
              maxLength={6}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
            />
            <p className="mt-1 text-xs text-[#999999]">테스트 환경에서는 임의의 6자리 숫자를 입력하면 인증돼요.</p>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleVerify}
          disabled={!sent || loading}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-40"
        >
          인증하고 계속하기
        </button>
      </div>
    </div>
  )
}
