import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

export function TermsSettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="약관 및 정책" />
      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <div className="flex flex-col gap-0 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <button onClick={() => alert('서비스 이용약관')} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <span className="text-sm text-[#111111]">서비스 이용약관</span>
          </button>
          <button onClick={() => alert('개인정보처리방침')} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <span className="text-sm text-[#111111]">개인정보처리방침</span>
          </button>
          <button onClick={() => alert('마케팅 정보 수신 동의')} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <span className="text-sm text-[#111111]">마케팅 정보 수신 동의</span>
          </button>
        </div>
      </div>
    </div>
  )
}
