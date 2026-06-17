import { useNavigate, useLocation } from 'react-router-dom'
import { MOCK_ROUTINES } from '@/lib/mockData'

export function SoloRoutineLoadPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const sportCode = (location.state as { sportCode?: string } | null)?.sportCode ?? 'fitness'

  const routines = MOCK_ROUTINES.filter(r => r.sportCode === sportCode)

  function handleSelect(routine: typeof MOCK_ROUTINES[number]) {
    navigate('/exercise/solo/setup', {
      replace: true,
      state: { mode: 'solo', prefillRoutine: { name: routine.name, sets: routine.sets, reps: routine.reps, sportCode } },
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">루틴 불러오기</h1>
      </div>

      <div className="flex-1 px-5 py-2">
        {routines.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#999999]">불러올 루틴이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {routines.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 text-left"
              >
                <div>
                  <div className="text-sm font-bold text-[#111111]">{r.name}</div>
                  <div className="mt-0.5 text-xs text-[#777777]">{r.sets}세트 × {r.reps}회</div>
                </div>
                <svg className="h-5 w-5 text-[#9B8FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
