import { Link } from 'react-router-dom'
import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

const FAQS = [
  '번개 모임은 어떻게 참여하나요?',
  '취소 패널티가 있나요?',
  '신뢰도 점수는 어떻게 계산되나요?',
]

export function HelpSettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="고객센터" />
      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <h2 className="mb-2 px-1 text-xs font-bold text-[#999999]">자주 묻는 질문</h2>
        <div className="mb-5 flex flex-col gap-0 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {FAQS.map(q => (
            <button key={q} onClick={() => alert('FAQ 준비 중이에요.')} className="flex w-full items-center px-4 py-3.5 text-left">
              <span className="text-sm text-[#111111]">{q}</span>
            </button>
          ))}
        </div>
        <Link
          to="/mypage/settings/help/new"
          className="block w-full rounded-full bg-[#C8FF3E] py-4 text-center text-base font-bold text-[#111111]"
        >
          문의하기
        </Link>
        <p className="mt-4 text-center text-xs text-[#AAAAAA]">앱 버전 0.1.0</p>
      </div>
    </div>
  )
}
