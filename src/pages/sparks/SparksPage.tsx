import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchSparks, fetchSports } from '@/features/sparks/api'
import { MapView } from '@/features/map/MapView'
import { MOCK_SPARKS, MOCK_SPORTS, SPORT_EMOJI } from '@/lib/mockData'
import { distanceKm, getFilterRadiusKm, REFERENCE_LOCATION } from '@/lib/utils/geo'
import type { Sport, Profile } from '@/types/database'

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert']

type SparkRow = {
  id: string
  title: string
  place_name: string | null
  address: string | null
  scheduled_at: string
  capacity: number
  duration_minutes: number | null
  min_level: string | null
  max_level: string | null
  age_min?: number | null
  age_max?: number | null
  gender_condition?: string | null
  status: string
  latitude?: number | null
  longitude?: number | null
  host: { id: string; nickname: string; avatar_url: string | null; trust_score: number } | null
  sport: { id: string; code: string; name: string } | null
  participants: { count: number }[]
}

type QuickFilter = 'all' | 'age' | 'level' | 'gender'

export function SparksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sparks, setSparks] = useState<SparkRow[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [tab, setTab] = useState<'list' | 'map'>(location.pathname === '/sparks/list' ? 'list' : 'map')
  const [loading, setLoading] = useState(true)
  const [selectedMapSpark, setSelectedMapSpark] = useState<SparkRow | null>(null)
  const radiusKm = getFilterRadiusKm()

  useEffect(() => {
    setTab(location.pathname === '/sparks/list' ? 'list' : 'map')
  }, [location.pathname])

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => { if (data) setProfile(data) }).catch(() => {})
  }, [user])

  useEffect(() => {
    fetchSports()
      .then(({ data }) => {
        if (data && data.length > 0) setSports(data)
        else setSports(MOCK_SPORTS as unknown as Sport[])
      })
      .catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchSparks(selectedSport ? { sport_id: selectedSport } : undefined)
      .then(({ data }) => {
        if (data && (data as unknown[]).length > 0) {
          setSparks(data as unknown as SparkRow[])
        } else {
          const filtered = selectedSport
            ? MOCK_SPARKS.filter(s => s.sport_id === selectedSport)
            : MOCK_SPARKS
          setSparks(filtered as unknown as SparkRow[])
        }
      })
      .catch(() => setSparks(MOCK_SPARKS as unknown as SparkRow[]))
      .finally(() => setLoading(false))
  }, [selectedSport])

  function matchesQuickFilter(spark: SparkRow) {
    if (quickFilter === 'all' || !profile) return true
    if (quickFilter === 'age') {
      if (!profile.birth_year) return true
      const age = new Date().getFullYear() - profile.birth_year
      if (spark.age_min != null && age < spark.age_min) return false
      if (spark.age_max != null && age > spark.age_max) return false
      return true
    }
    if (quickFilter === 'level') {
      const myRank = LEVEL_ORDER.indexOf(profile.exercise_level)
      const minRank = spark.min_level ? LEVEL_ORDER.indexOf(spark.min_level) : -1
      const maxRank = spark.max_level ? LEVEL_ORDER.indexOf(spark.max_level) : LEVEL_ORDER.length - 1
      if (myRank === -1) return true
      return myRank >= minRank && myRank <= maxRank
    }
    if (quickFilter === 'gender') {
      if (!spark.gender_condition || spark.gender_condition === 'any') return true
      if (!profile.gender) return true
      return spark.gender_condition === profile.gender
    }
    return true
  }

  function matchesDistance(spark: SparkRow) {
    if (!spark.latitude || !spark.longitude) return true
    return distanceKm(REFERENCE_LOCATION.lat, REFERENCE_LOCATION.lng, spark.latitude, spark.longitude) <= radiusKm
  }

  const visibleSparks = sparks.filter(s => matchesQuickFilter(s) && matchesDistance(s))

  const mapPins = visibleSparks
    .filter(s => s.latitude && s.longitude)
    .map(s => ({
      id: s.id,
      lat: s.latitude!,
      lng: s.longitude!,
      label: s.title,
      onClick: () => setSelectedMapSpark(s),
    }))

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white px-5 pt-5 pb-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111111]">번개 모임</h1>
          <Link
            to="/sparks/new"
            className="rounded-full bg-[#C8FF3E] px-4 py-2 text-sm font-bold text-[#111111]"
          >
            + 번개 만들기
          </Link>
        </div>

        {/* 지도/리스트 전환 */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => navigate(tab === 'map' ? '/sparks/list' : '/sparks')}
            className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-[#555555]"
          >
            {tab === 'map' ? '리스트로 확인' : '지도로 보기'}
          </button>
          <button
            onClick={() => navigate('/sparks/filter')}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#555555]"
          >
            상세 필터 (반경 {radiusKm}km)
          </button>
        </div>

        {/* 빠른 필터 */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {([
            { value: 'all', label: '전체' },
            { value: 'age', label: '내 나이' },
            { value: 'level', label: '내 레벨' },
            { value: 'gender', label: '내 성별' },
          ] as const).map(f => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                quickFilter === f.value
                  ? 'border-[#C8FF3E] bg-[#C8FF3E] text-[#111111]'
                  : 'border-gray-200 text-[#555555]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 종목 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedSport(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
              !selectedSport
                ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                : 'border-gray-200 text-[#555555]'
            }`}
          >
            전체
          </button>
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id === selectedSport ? null : sport.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedSport === sport.id
                  ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white'
                  : 'border-gray-200 text-[#555555]'
              }`}
            >
              {SPORT_EMOJI[(sport as { code?: string }).code ?? ''] ?? ''} {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* 지도 탭 */}
      {tab === 'map' ? (
        <div className="relative flex-1" style={{ height: 'calc(100dvh - 220px)' }}>
          <MapView
            center={[37.5283, 126.9342]}
            zoom={12}
            pins={mapPins}
          />
          {/* 지도 위 선택된 번개 카드 */}
          {selectedMapSpark && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div
                className="rounded-2xl bg-white p-4 shadow-lg cursor-pointer"
                onClick={() => navigate(`/sparks/${selectedMapSpark.id}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {selectedMapSpark.sport && (
                    <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">
                      {selectedMapSpark.sport.name}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-[#111111] text-sm">{selectedMapSpark.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#777777]">
                  <span>📅 {formatSchedule(selectedMapSpark.scheduled_at)}</span>
                  <span>📍 {selectedMapSpark.place_name}</span>
                  <span className="ml-auto">👥 {selectedMapSpark.participants?.[0]?.count ?? 0}/{selectedMapSpark.capacity}</span>
                </div>
                <button className="mt-2 w-full rounded-full bg-[#C8FF3E] py-2 text-xs font-bold text-[#111111]">
                  상세 보기 →
                </button>
              </div>
              <button
                className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center"
                onClick={e => { e.stopPropagation(); setSelectedMapSpark(null) }}
              >
                ✕
              </button>
            </div>
          )}
          {/* 내 위치 핀 카운트 */}
          <div className="absolute top-3 right-3 z-[1000] rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#333333] shadow">
            총 {visibleSparks.length}개의 번개
          </div>
        </div>
      ) : (
        /* 리스트 탭 */
        <div className="flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
            </div>
          ) : visibleSparks.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-3 text-4xl">⚡</div>
              <p className="text-sm text-[#777777]">근처에 열린 번개가 아직 없어요.</p>
              <p className="mt-1 text-xs text-[#999999]">직접 번개를 만들어볼까요?</p>
              <Link
                to="/sparks/new"
                className="mt-4 rounded-full bg-[#C8FF3E] px-6 py-2.5 text-sm font-bold text-[#111111]"
              >
                번개 만들기
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleSparks.map(spark => (
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
  const sportCode = (spark.sport as { code?: string } | null)?.code ?? ''
  const emoji = SPORT_EMOJI[sportCode] ?? '⚡'

  return (
    <Link
      to={`/sparks/${spark.id}`}
      className="block rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {spark.sport && (
              <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">
                {emoji} {spark.sport.name}
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#777777]">
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span className="font-medium text-[#9B8FFF]">{formatSchedule(spark.scheduled_at)}</span>
        </span>
        {spark.place_name && (
          <span className="flex items-center gap-1">
            <span>📍</span>
            <span className="truncate max-w-[120px]">{spark.place_name}</span>
          </span>
        )}
        {spark.duration_minutes && (
          <span className="flex items-center gap-1">
            <span>⏱</span> {spark.duration_minutes}분
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <span>👥</span>
          <span className={full ? 'text-red-400' : 'text-[#9B8FFF]'}>
            {participantCount}/{spark.capacity}
          </span>
        </span>
      </div>

      {spark.host && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEE8FF] text-xs font-bold text-[#9B8FFF]">
            {spark.host.nickname[0]}
          </div>
          <span className="text-xs text-[#999999]">{spark.host.nickname}</span>
          <span className="ml-auto text-xs font-medium text-[#C8FF3E]">
            신뢰도 {spark.host.trust_score}
          </span>
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
  if (diff < 0) return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`
  if (days === 0) return `오늘 ${timeStr}`
  if (days === 1) return `내일 ${timeStr}`
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`
}
