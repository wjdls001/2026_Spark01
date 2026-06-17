import { useState } from 'react'
import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

const REASONS = ['더 이상 사용하지 않아요', '운동 메이트를 찾지 못했어요', '다른 앱을 사용해요', '기타']

export function DeleteAccountSettingsPage() {
  const [reason, setReason] = useState('')

  function handleDelete() {
    if (!reason) {
      alert('탈퇴 사유를 선택해주세요.')
      return
    }
    const confirmed = window.confirm('정말 탈퇴하시겠어요? 모든 데이터가 삭제되며 복구할 수 없어요.')
    if (!confirmed) return
    alert('회원탈퇴는 고객센터를 통해 진행해주세요.')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="회원탈퇴" />
      <div className="flex-1 px-5 py-5">
        <p className="mb-4 text-sm text-[#777777]">탈퇴 사유를 알려주시면 서비스 개선에 참고할게요.</p>
        <div className="flex flex-col gap-2">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`rounded-2xl border-2 px-4 py-3.5 text-left text-sm ${
                reason === r ? 'border-[#9B8FFF] bg-[#EEE8FF] text-[#9B8FFF]' : 'border-gray-100 bg-gray-50 text-[#555555]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleDelete}
          className="w-full rounded-full border border-red-300 py-4 text-base font-bold text-red-500"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  )
}
