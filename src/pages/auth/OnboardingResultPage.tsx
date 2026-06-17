import { useNavigate, useLocation } from 'react-router-dom'

const LEVEL_LABEL: Record<string, string> = {
  beginner: '초보자', intermediate: '중급자', advanced: '고급자', expert: '전문가',
}

const FREQ_LABEL: Record<string, string> = {
  '1': '주 1회', '2-3': '주 2~3회', '4-5': '주 4~5회', '6+': '거의 매일',
}

export function OnboardingResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as { nickname?: string; level?: string; weeklyFreq?: string }

  const nickname = state.nickname ?? '회원'
  const level = state.level ?? 'beginner'
  const weeklyFreq = state.weeklyFreq

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-8">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#C8FF3E] mb-6">
        <span className="text-5xl">⚡</span>
      </div>
      <h1 className="text-2xl font-bold text-[#111111] mb-2">환영해요!</h1>
      <p className="text-center text-[#777777] text-sm mb-2">{nickname}님,</p>
      <p className="text-center text-[#555555] text-sm mb-8">SPARK와 함께 운동을 시작해볼까요?</p>

      <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-[#999999]">닉네임</span>
          <span className="font-bold text-[#111111]">{nickname}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-[#999999]">운동 레벨</span>
          <span className="font-bold text-[#111111]">{LEVEL_LABEL[level] ?? level}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#999999]">주간 목표</span>
          <span className="font-bold text-[#111111]">{weeklyFreq ? FREQ_LABEL[weeklyFreq] ?? `주 ${weeklyFreq}회` : '미설정'}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/home', { replace: true })}
        className="w-full max-w-xs rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
      >
        SPARK 시작하기 ⚡
      </button>
    </div>
  )
}
