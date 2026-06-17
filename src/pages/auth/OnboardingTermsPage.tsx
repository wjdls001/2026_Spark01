import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { saveTermsAgreements } from '@/features/mypage/api'

export function OnboardingTermsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [allChecked, setAllChecked] = useState(false)
  const [service, setService] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleAll(checked: boolean) {
    setAllChecked(checked)
    setService(checked)
    setPrivacy(checked)
    setMarketing(checked)
  }

  function handleItem(setter: (v: boolean) => void, value: boolean) {
    setter(value)
    if (!value) setAllChecked(false)
    else if ((value && service && privacy) || (value && service && !marketing) || (value && privacy && !marketing)) {
      setAllChecked(service && privacy)
    }
  }

  async function handleNext() {
    if (!user) return
    setLoading(true)
    await saveTermsAgreements(user.id)
    navigate('/onboarding/phone', { replace: true })
    setLoading(false)
  }

  const canProceed = service && privacy

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-6 py-8">
      <div className="mb-8">
        <div className="mb-1 text-2xl font-bold text-[#111111]">⚡ SPARK</div>
        <h1 className="mt-6 text-xl font-bold text-[#111111]">서비스 이용을 위해<br />약관에 동의해주세요</h1>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <input
            type="checkbox" checked={allChecked}
            onChange={e => handleAll(e.target.checked)}
            className="h-5 w-5 accent-[#9B8FFF]"
          />
          <span className="text-base font-bold text-[#111111]">전체 동의</span>
        </label>

        <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <TermsItem
            label="서비스 이용약관 (필수)"
            checked={service}
            onChange={v => handleItem(setService, v)}
          />
          <TermsItem
            label="개인정보처리방침 (필수)"
            checked={privacy}
            onChange={v => handleItem(setPrivacy, v)}
          />
          <TermsItem
            label="마케팅 정보 수신 동의 (선택)"
            checked={marketing}
            onChange={v => handleItem(setMarketing, v)}
          />
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-40"
        >
          {loading ? '처리 중...' : '동의하고 시작하기'}
        </button>
      </div>
    </div>
  )
}

function TermsItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 py-1">
      <input
        type="checkbox" checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#9B8FFF]"
      />
      <span className="text-sm text-[#333333]">{label}</span>
    </label>
  )
}
