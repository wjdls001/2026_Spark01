import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SPARK_FILTER_RADIUS_KEY, getFilterRadiusKm } from '@/lib/utils/geo'

export type SparkDetailFilters = {
  radiusKm: number
  category: string
  customCategory: string
  timeOption: 'today' | 'week' | 'custom'
  customDate: string
}

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'running', label: '러닝' },
  { value: 'walking', label: '걷기' },
  { value: 'cycling', label: '사이클' },
]

const TIME_OPTIONS = [
  { value: 'today' as const, label: '오늘', icon: '📅' },
  { value: 'week' as const, label: '이번 주', icon: '📋' },
  { value: 'custom' as const, label: '날짜 설정', icon: '📆' },
]

export function getDefaultFilters(): SparkDetailFilters {
  return { radiusKm: getFilterRadiusKm(), category: 'all', customCategory: '', timeOption: 'today', customDate: '' }
}

export function SparkFilterSheet({
  initial,
  onClose,
  onApply,
}: {
  initial: SparkDetailFilters
  onClose: () => void
  onApply: (filters: SparkDetailFilters) => void
}) {
  const [radius, setRadius] = useState(initial.radiusKm)
  const [category, setCategory] = useState(initial.category)
  const [customCategory, setCustomCategory] = useState(initial.customCategory)
  const [timeOption, setTimeOption] = useState<SparkDetailFilters['timeOption']>(initial.timeOption)
  const [customDate, setCustomDate] = useState(initial.customDate)

  function handleReset() {
    setRadius(5)
    setCategory('all')
    setCustomCategory('')
    setTimeOption('today')
    setCustomDate('')
  }

  function handleApply() {
    localStorage.setItem(SPARK_FILTER_RADIUS_KEY, String(radius))
    onApply({ radiusKm: radius, category, customCategory, timeOption, customDate })
  }

  return (
    <div className="fixed inset-0 z-[1600] flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-[440px] max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[max(env(safe-area-inset-bottom),32px)] pt-5 shadow-spark-sheet" style={{ animation: 'spark-sheet-up 220ms ease-out' }} onClick={event => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-spark-dark">상세 필터</h1>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-xl text-spark-gray" aria-label="닫기">×</button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-spark-dark">거리 설정</h2>
            <span className="text-base font-bold text-spark-purple">{radius}km</span>
          </div>
          <input
            type="range" min={0} max={5} step={0.5}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className="mt-3 w-full accent-spark-purple"
          />
          <div className="mt-1 flex justify-between text-xs text-spark-gray"><span>0km</span><span>5km</span></div>
        </div>

        <div className="mt-7">
          <h2 className="mb-3 text-sm font-bold text-spark-dark">카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${category === c.value ? 'bg-spark-dark text-white' : 'border border-gray-200 text-spark-text-secondary'}`}
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={() => setCategory('custom')}
              className={`rounded-full px-4 py-2 text-sm font-bold ${category === 'custom' ? 'bg-spark-dark text-white' : 'border border-gray-200 text-spark-text-secondary'}`}
            >
              직접입력
            </button>
            {category === 'custom' && (
              <input
                autoFocus value={customCategory} maxLength={10}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="종목을 입력해 주세요"
                className="h-10 flex-1 min-w-[120px] rounded-full border border-gray-200 px-4 text-sm outline-none focus:border-spark-purple"
              />
            )}
          </div>
        </div>

        <div className="mt-7">
          <h2 className="mb-3 text-sm font-bold text-spark-dark">시간</h2>
          <div className="space-y-2">
            {TIME_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setTimeOption(option.value)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${
                  timeOption === option.value ? 'border-2 border-spark-dark text-spark-dark' : 'border border-gray-200 text-spark-text-secondary'
                }`}
              >
                {option.label}
                <span>{option.icon}</span>
              </button>
            ))}
            {timeOption === 'custom' && (
              <input
                type="date" value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-spark-purple"
              />
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button onClick={handleReset} className="h-12 rounded-full bg-spark-muted text-sm font-bold text-spark-text-secondary">초기화</button>
          <button onClick={handleApply} className="h-12 rounded-full bg-spark-lime text-sm font-bold text-spark-dark">필터 적용하기</button>
        </div>
      </div>
    </div>
  )
}

export function SparkFilterPage() {
  const navigate = useNavigate()
  return (
    <SparkFilterSheet
      initial={getDefaultFilters()}
      onClose={() => navigate(-1)}
      onApply={() => navigate(-1)}
    />
  )
}
