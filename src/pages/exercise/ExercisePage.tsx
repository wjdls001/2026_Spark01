import { useNavigate } from 'react-router-dom'

export function ExercisePage() {
  const navigate = useNavigate()

  return (
    <div className="spark-page-background flex min-h-[calc(100dvh-72px)] flex-col">
      <div className="px-5 pt-5">
        <h1 className="text-xl font-bold text-spark-dark">운동 시작</h1>
        <p className="mt-1 text-sm text-spark-text-secondary">오늘은 어떻게 운동할까요?</p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4 px-5 pb-10">
        <button
          onClick={() => navigate('/exercise/spark/select')}
          className="flex flex-col rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.10)] text-left"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-spark-soft-purple">
            <svg className="h-6 w-6 text-spark-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-spark-dark">함께 운동하기</h2>
          <p className="mt-1 text-sm text-spark-text-secondary">이웃과 함께 번개 모임으로 운동해요</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-spark-purple">
            번개 찾기 <span>→</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/exercise/solo/setup')}
          className="flex flex-col rounded-3xl bg-spark-dark p-6 text-left"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-spark-lime">
            <svg className="h-6 w-6 text-spark-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">혼자 운동하기</h2>
          <p className="mt-1 text-sm text-spark-gray">내 페이스에 맞춰 자유롭게 운동해요</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-spark-lime">
            시작하기 <span>→</span>
          </div>
        </button>
      </div>
    </div>
  )
}
