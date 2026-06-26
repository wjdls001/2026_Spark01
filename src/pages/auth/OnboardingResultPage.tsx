import { useLocation, useNavigate } from 'react-router-dom'
import { getLevelTier, levelNumberFromExerciseLevel } from '@/lib/utils/level'

const LEVEL_LABEL: Record<string, string> = {
  beginner: '운동 초보자',
  intermediate: '운동 루틴 메이커',
  advanced: '운동 마스터',
}
const FREQ_LABEL: Record<string, string> = {
  rarely: '주 0~1회',
  '1-2': '주 1~2회',
  '3-4': '주 3~4회',
  '5+': '주 5회 이상',
}

export function OnboardingResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as { nickname?: string; level?: string; weeklyFreq?: string; goal?: string }
  const nickname = state.nickname ?? '회원'
  const level = state.level ?? 'beginner'
  const levelNumber = levelNumberFromExerciseLevel(level)
  const levelBadge = `${getLevelTier(levelNumber)} · LV.${levelNumber}`

  return (
    <div className="flex min-h-dvh flex-col bg-white text-spark-dark">
      <header className="relative flex h-16 items-center justify-center border-b border-gray-100">
        <h1 className="text-lg font-bold">프로필 생성</h1>
        <button type="button" onClick={() => navigate('/home', { replace: true })} className="absolute right-6 text-sm font-bold text-spark-purple">완료</button>
      </header>
      <main className="flex flex-1 flex-col px-5 pb-5 pt-8">
        <div className="relative mx-auto h-48 w-48">
          <div className="absolute inset-0 rounded-full border-4 border-[#e8e8e8]" />
          <div className="absolute inset-4 rounded-full border-2 border-[#dedede]" />
          <div className="absolute inset-8 flex items-center justify-center rounded-full bg-gradient-to-br from-spark-soft-lime to-spark-soft-purple text-6xl">⚡</div>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-spark-purple px-5 py-1 text-sm font-bold text-white shadow">{levelBadge}</span>
        </div>

        <section className="mt-5 text-center">
          <h2 className="text-[27px] font-bold">SPARK 이시네요!</h2>
          <p className="mt-2 text-base leading-6 text-[#555a6c]">오늘부터 시작하는 작은 습관이<br />내일의 건강한 변화를 만들어낼 거예요.</p>
        </section>

        <section className="mt-8">
          <h3 className="mb-4 text-base font-bold">내 프로필 요약</h3>
          <div className="rounded-2xl bg-spark-soft-lime p-4">
            <div className="flex gap-4">
              <span className="text-2xl">🏋</span>
              <div>
                <strong className="block text-sm">{LEVEL_LABEL[level] ?? level}</strong>
                <p className="mt-1 text-sm leading-5 text-[#555a6c]">매일 조금씩 움직이는 즐거움,<br />{nickname}님과 함께 가볍게 몸을 깨워볼까요?</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="min-h-[106px] rounded-2xl bg-spark-soft-purple p-4">
              <span className="text-xl">◴</span>
              <span className="mt-3 block text-xs">운동 취향</span>
              <strong className="mt-1 block text-xs">{state.goal ?? '근력 및 지구력'}</strong>
            </div>
            <div className="min-h-[106px] rounded-2xl bg-spark-muted p-4">
              <span className="text-xl">▣</span>
              <span className="mt-3 block text-xs">빈도</span>
              <strong className="mt-1 block text-xs">{FREQ_LABEL[state.weeklyFreq ?? ''] ?? '주 1~2회'}</strong>
            </div>
          </div>
        </section>

        <button type="button" onClick={() => navigate('/home', { replace: true })} className="mt-auto h-[52px] w-full rounded-full bg-spark-lime text-sm font-bold text-spark-dark shadow-spark-card">
          SPARK 시작하기 ▷
        </button>
      </main>
    </div>
  )
}
