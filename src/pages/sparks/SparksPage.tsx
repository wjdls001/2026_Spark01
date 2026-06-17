import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchSparks, fetchSports } from '@/features/sparks/api'
import type { Sport } from '@/types/database'

type SparkRow = {
  id: string
  title: string
  place_name: string | null
  address: string | null
  scheduled_at: string
  capacity: number
  duration_minutes: number | null
  min_level: string | null
  status: string
  host: { id: string; nickname: string; avatar_url: string | null; trust_score: number } | null
  sport: { id: string; code: string; name: string } | null
  participants: { count: number }[]
}

export function SparksPage() {
  const [sparks, setSparks] = useState<SparkRow[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [tab, setTab] = useState<'list' | 'map'>('list')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSports().then(({ data }) => { if (data) setSports(data) })
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchSparks(selectedSport ? { sport_id: selectedSport } : undefined)
      .then(({ data }) => {
        if (data) setSparks(data as unknown as SparkRow[])
      })
      .finally(() => setLoading(false))
  }, [selectedSport])

  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white px-5 pt-5 pb-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111111]">번개 모임</h1>
          <Link to="/sparks/new"
            className="rounded-full bg-[#C8FF3E] px-4 py-2 text-sm font-bold text-[#111111]">
            + 번개 만들기
          </Link>
        </div>

        {/* 리스트/지도 탭 */}
        <div className="mb-3 flex gap-1 rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${tab === 'list' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#777777]'}`}
          >
            리스트
          </button>
          <button
            onClick={() => setTab('map')}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${tab === 'map' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#777777]'}`}
          >
            지도
          </button>
        </div>

        {/* 종목 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSport(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${!selectedSport ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-300 text-[#555555]'}`}
          >
            전체
          </button>
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id === selectedSport ? null : sport.id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${selectedSport === sport.id ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-300 text-[#555555]'}`}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {tab === 'map' ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-gray-100">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-sm text-[#999999]">지도 기능은 준비 중이에요</p>
          <p className="text-xs text-[#BBBBBB] mt-1">리스트 보기로 번개를 찾아보세요</p>
        </div>
      ) : (
        <div className="flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
            </div>
          ) : sparks.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-sm text-[#777777]">근처에 열린 번개가 아직 없어요.</p>
              <p className="text-xs text-[#999999] mt-1">직접 번개를 만들어볼까요?</p>
              <Link to="/sparks/new"
                className="mt-4 rounded-full bg-[#C8FF3E] px-6 py-2.5 text-sm font-bold text-[#111111]">
                번개 만들기
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sparks.map(spark => (
                <SparkCard key={spark.id} spark={spark} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SparkCard({ spark }: { spark: SparkRow }) {
  const participantCount = spark.participants?.[0]?.count ?? 0
  const full = participantCount >= spark.capacity

  return (
    <Link to={`/sparks/${spark.id}`}
      className="block rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {spark.sport && (
              <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">
                {spark.sport.name}
              </span>
            )}
            {full && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-[#999999]">마감</span>
            )}
          </div>
          <h3 className="text-base font-bold text-[#111111] leading-tight">{spark.title}</h3>
        </div>
        <svg className="mt-1 h-5 w-5 shrink-0 text-[#9B8FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#777777]">
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span className="text-[#9B8FFF] font-medium">{formatSchedule(spark.scheduled_at)}</span>
        </span>
        {spark.place_name && (
          <span className="flex items-center gap-1">
            <span>📍</span> {spark.place_name}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <span>👥</span> {participantCount}/{spark.capacity}
        </span>
      </div>

      {spark.host && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2">
          <div className="h-5 w-5 rounded-full bg-[#EEE8FF] flex items-center justify-center text-xs">
            {spark.host.nickname[0]}
          </div>
          <span className="text-xs text-[#999999]">{spark.host.nickname}</span>
          <span className="ml-auto text-xs text-[#C8FF3E] font-medium">신뢰도 {spark.host.trust_score}</span>
        </div>
      )}
    </Link>
  )
}

function formatSchedule(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  if (days === 0) return `오늘 ${timeStr}`
  if (days === 1) return `내일 ${timeStr}`
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`
}
