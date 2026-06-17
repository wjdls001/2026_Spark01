const PERMISSIONS = [
  { icon: '🔔', title: '푸시 알림', desc: '번개 신청, 승인, 챌린지 소식을 받아보세요' },
  { icon: '❤️', title: '건강 데이터 접근', desc: '운동 기록을 더 정확하게 남길 수 있어요' },
  { icon: '📍', title: '위치 데이터 접근', desc: '내 주변 번개 모임을 추천해드려요' },
]

export function PermissionPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[430px] rounded-t-3xl bg-white px-6 pb-8 pt-6">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
        <h2 className="text-lg font-bold text-[#111111]">SPARK 이용을 위해<br />권한을 허용해주세요</h2>
        <div className="mt-5 flex flex-col gap-4">
          {PERMISSIONS.map(p => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <div className="text-sm font-bold text-[#111111]">{p.title}</div>
                <div className="mt-0.5 text-xs text-[#777777]">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
          >
            모두 허용
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm text-[#999999]">
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  )
}
