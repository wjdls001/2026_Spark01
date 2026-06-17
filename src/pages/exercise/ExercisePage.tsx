import { useNavigate } from 'react-router-dom'

export function ExercisePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6]">
      <div className="px-5 pt-5">
        <h1 className="text-xl font-bold text-[#111111]">운동 시작</h1>
        <p className="mt-1 text-sm text-[#777777]">오늘은 어떻게 운동할까요?</p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4 px-5 pb-10">
        {/* 혼자 운동 */}
        <button
          onClick={() => navigate('/exercise/solo/setup', { state: { mode: 'solo' } })}
          className="flex flex-col rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.10)] text-left"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEE8FF]">
            <svg className="h-6 w-6 text-[#9B8FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#111111]">혼자 운동</h2>
          <p className="mt-1 text-sm text-[#777777]">내 페이스에 맞춰 자유롭게 운동해요</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#9B8FFF]">
            시작하기 <span>→</span>
          </div>
        </button>

        {/* 같이 운동 */}
        <button
          onClick={() => navigate('/exercise/spark/select')}
          className="flex flex-col rounded-3xl bg-[#111111] p-6 text-left"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8FF3E]">
            <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">같이 운동</h2>
          <p className="mt-1 text-sm text-[#AAAAAA]">이웃과 함께 번개 모임으로 운동해요</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[#C8FF3E]">
            번개 찾기 <span>→</span>
          </div>
        </button>

        {/* 빠른 기록 */}
        <button
          onClick={() => navigate('/exercise/solo/setup', { state: { mode: 'solo', quick: true } })}
          className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#111111]">운동 기록만 남기기</div>
              <div className="text-xs text-[#777777]">이미 완료한 운동을 기록해요</div>
            </div>
            <svg className="h-5 w-5 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
