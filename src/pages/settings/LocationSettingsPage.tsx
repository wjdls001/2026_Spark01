import { useNavigate } from 'react-router-dom'
import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'

export function LocationSettingsPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="위치 설정" />
      <div className="flex-1 px-5 py-5">
        <p className="mb-4 text-sm text-[#777777]">
          활동 지역을 설정하면 내 주변 번개 모임을 더 정확하게 추천받을 수 있어요.
        </p>
        <button
          onClick={() => navigate('/mypage/profile')}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          활동 지역 수정하기
        </button>
      </div>
    </div>
  )
}
