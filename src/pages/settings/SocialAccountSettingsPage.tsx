import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

const ACCOUNTS = [
  { key: 'apple', label: 'Apple', connected: false },
  { key: 'google', label: 'Google', connected: false },
  { key: 'kakao', label: 'Kakao', connected: false },
]

export function SocialAccountSettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="소셜 계정" />
      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <div className="flex flex-col gap-0 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {ACCOUNTS.map(acc => (
            <button
              key={acc.key}
              onClick={() => alert('소셜 계정 연동은 추후 지원될 예정이에요.')}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm text-[#111111]">{acc.label}</span>
              <span className="text-xs text-[#AAAAAA]">{acc.connected ? '연결됨' : '연결 안 됨'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
