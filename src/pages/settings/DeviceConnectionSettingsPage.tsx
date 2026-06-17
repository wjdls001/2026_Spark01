import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

const DEVICES = ['Apple Watch', 'Galaxy Watch', 'Garmin']

export function DeviceConnectionSettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="기기 연결" />
      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <div className="flex flex-col gap-0 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {DEVICES.map(d => (
            <button
              key={d}
              onClick={() => alert('추후 지원될 예정이에요.')}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm text-[#111111]">{d}</span>
              <span className="text-xs text-[#AAAAAA]">연결 안 됨</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
