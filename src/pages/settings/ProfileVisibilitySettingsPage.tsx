import { useState } from 'react'
import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

const VISIBILITY_KEY = 'spark_profile_visibility'

export function ProfileVisibilitySettingsPage() {
  const [visibility, setVisibility] = useState(() => localStorage.getItem(VISIBILITY_KEY) ?? 'public')

  function select(v: string) {
    setVisibility(v)
    localStorage.setItem(VISIBILITY_KEY, v)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="프로필 공개" />
      <div className="flex-1 px-5 py-5">
        <p className="mb-4 text-sm text-[#777777]">번개 모임에서 다른 사용자에게 내 프로필이 보이는 범위를 설정해요.</p>
        <div className="flex flex-col gap-3">
          {[
            { v: 'public', label: '전체 공개', desc: '모든 사용자에게 프로필이 보여요' },
            { v: 'hosts', label: '번개 호스트에게만', desc: '신청한 번개의 모임장에게만 보여요' },
          ].map(opt => (
            <button
              key={opt.v}
              onClick={() => select(opt.v)}
              className={`rounded-2xl border-2 px-4 py-3.5 text-left ${
                visibility === opt.v ? 'border-[#9B8FFF] bg-[#EEE8FF]' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="font-bold text-[#111111]">{opt.label}</div>
              <div className="mt-0.5 text-xs text-[#777777]">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
