import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

const HEALTH_APPS = ['Apple 건강', 'Google Fit', '삼성 헬스']

export function HealthAppSettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="건강 앱 연결" />
      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <p className="mb-4 text-sm text-[#777777]">건강 앱을 연동하면 운동 기록을 더 정확하게 남길 수 있어요.</p>
        <div className="flex flex-col gap-0 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {HEALTH_APPS.map(app => (
            <button
              key={app}
              onClick={() => alert('추후 지원될 예정이에요.')}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm text-[#111111]">{app}</span>
              <span className="text-xs text-[#AAAAAA]">연결 안 됨</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
