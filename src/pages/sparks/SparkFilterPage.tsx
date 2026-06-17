import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SPARK_FILTER_RADIUS_KEY, getFilterRadiusKm } from '@/lib/utils/geo'

export function SparkFilterPage() {
  const navigate = useNavigate()
  const [radius, setRadius] = useState(getFilterRadiusKm())

  function handleApply() {
    localStorage.setItem(SPARK_FILTER_RADIUS_KEY, String(radius))
    navigate(-1)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">상세 필터</h1>
      </div>

      <div className="flex-1 px-5 py-6">
        <h2 className="mb-1 text-sm font-bold text-[#111111]">거리 설정</h2>
        <p className="mb-6 text-xs text-[#777777]">내 위치를 기준으로 번개 모임을 찾을 범위예요</p>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-[#555555]">반경</span>
          <span className="text-lg font-bold text-[#9B8FFF]">{radius}km</span>
        </div>
        <input
          type="range" min={1} max={20} step={1}
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          className="w-full accent-[#9B8FFF]"
        />
        <div className="mt-1 flex justify-between text-xs text-[#999999]">
          <span>1km</span>
          <span>20km</span>
        </div>
      </div>

      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleApply}
          className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111]"
        >
          적용하기
        </button>
      </div>
    </div>
  )
}
