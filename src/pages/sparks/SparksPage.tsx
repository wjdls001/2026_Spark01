import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchSparks, fetchSports } from '@/features/sparks/api'
import { MapView } from '@/features/map/MapView'
import { MOCK_SPARKS, MOCK_NEARBY_SPARKS, MOCK_SPORTS, SPORT_EMOJI } from '@/lib/mockData'
import { distanceKm, getFilterRadiusKm, REFERENCE_LOCATION } from '@/lib/utils/geo'
import { useDragScroll } from '@/lib/utils/useDragScroll'
import { SparkFilterSheet, getDefaultFilters, type SparkDetailFilters } from './SparkFilterPage'
import type { Sport, Profile } from '@/types/database'

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert']

type SparkRow = {
  id: string
  title: string
  description?: string | null
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

const LEVEL_LABEL: Record<string, string> = { beginner: '초급', intermediate: '중급', advanced: '고급', expert: '전문가' }
const GENDER_LABEL: Record<string, string> = { male: '남성', female: '여성', any: '성별무관' }

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
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [detailFilters, setDetailFilters] = useState<SparkDetailFilters | null>(null)
  const radiusKm = detailFilters?.radiusKm ?? getFilterRadiusKm()

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
    const selectedSportCode = sports.find(sp => sp.id === selectedSport)?.code as string | undefined
    const nearby = selectedSportCode
      ? MOCK_NEARBY_SPARKS.filter(s => s.sport.code === selectedSportCode)
      : MOCK_NEARBY_SPARKS
    fetchSparks(selectedSport ? { sport_id: selectedSport } : undefined)
      .then(({ data }) => {
        if (data && (data as unknown[]).length > 0) {
          setSparks([...(data as unknown as SparkRow[]), ...(nearby as unknown as SparkRow[])])
        } else {
          const filtered = selectedSport
            ? MOCK_SPARKS.filter(s => s.sport_id === selectedSport)
            : MOCK_SPARKS
          setSparks([...filtered, ...nearby] as unknown as SparkRow[])
        }
      })
      .catch(() => setSparks([...MOCK_SPARKS, ...nearby] as unknown as SparkRow[]))
      .finally(() => setLoading(false))
  }, [selectedSport, sports])

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

  function matchesDetailFilters(spark: SparkRow) {
    if (!detailFilters) return true
    const sportCode = (spark.sport as { code?: string } | null)?.code ?? ''
    if (detailFilters.category === 'custom') {
      if (detailFilters.customCategory && !spark.title.includes(detailFilters.customCategory)) return false
    } else if (detailFilters.category !== 'all' && sportCode !== detailFilters.category) {
      return false
    }
    const scheduled = new Date(spark.scheduled_at)
    const now = new Date()
    if (detailFilters.timeOption === 'today') {
      if (scheduled.toDateString() !== now.toDateString()) return false
    } else if (detailFilters.timeOption === 'week') {
      const weekLater = new Date(now)
      weekLater.setDate(now.getDate() + 7)
      if (scheduled < now || scheduled > weekLater) return false
    } else if (detailFilters.timeOption === 'custom' && detailFilters.customDate) {
      if (scheduled.toISOString().slice(0, 10) !== detailFilters.customDate) return false
    }
    return true
  }

  const visibleSparks = sparks.filter(s => matchesQuickFilter(s) && matchesDistance(s) && matchesDetailFilters(s))

  const mapPins = visibleSparks
    .filter(s => s.latitude && s.longitude)
    .map(s => ({
      id: s.id,
      lat: s.latitude!,
      lng: s.longitude!,
      label: s.title,
      selected: s.id === selectedPinId,
      onClick: () => setSelectedPinId(current => (current === s.id ? null : s.id)),
    }))

  const selectedSpark = visibleSparks.find(s => s.id === selectedPinId) ?? null

  const sheetQuickFilterDrag = useDragScroll<HTMLDivElement>()
  const mapQuickFilterDrag = useDragScroll<HTMLDivElement>()

  const quickFilterRow = (
    <div
      ref={sheetQuickFilterDrag.ref}
      onMouseDown={sheetQuickFilterDrag.onMouseDown}
      onMouseMove={sheetQuickFilterDrag.onMouseMove}
      onMouseUp={sheetQuickFilterDrag.onMouseUp}
      onMouseLeave={sheetQuickFilterDrag.onMouseLeave}
      onClickCapture={sheetQuickFilterDrag.onClickCapture}
      className="touch-pan-x mb-3 flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
      {([
        { value: 'all', label: '전체' },
        { value: 'age', label: '나이' },
        { value: 'level', label: '레벨' },
        { value: 'gender', label: '성별' },
      ] as const).map(f => (
        <button
          key={f.value}
          onClick={() => setQuickFilter(f.value)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
            quickFilter === f.value
              ? 'border-spark-lime bg-spark-lime text-spark-dark'
              : 'border-gray-200 text-spark-text-secondary'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )

  if (tab === 'list') {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] flex-col bg-white">
        <div className="sticky top-0 z-10 bg-white px-5 pt-5 pb-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => navigate('/sparks')} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm">←</button>
            <h1 className="text-base font-bold text-spark-dark">번개 모임 리스트</h1>
            <Link to="/sparks/new" className="rounded-full bg-spark-lime px-4 py-2 text-xs font-bold text-spark-dark">+ 만들기</Link>
          </div>
          <SportFilterRow sports={sports} selectedSport={selectedSport} setSelectedSport={setSelectedSport} />
        </div>
        <div className="flex-1 px-5 py-4">
          <SparkListBody loading={loading} visibleSparks={visibleSparks} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative h-[calc(100dvh-64px)] overflow-hidden bg-spark-dark"
      onClick={() => setSelectedPinId(null)}
    >
      {/* 지도 영역 (전체화면) */}
      <MapView center={[REFERENCE_LOCATION.lat, REFERENCE_LOCATION.lng]} zoom={12} pins={mapPins} />

      <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 shadow-spark-card">
        <span className="text-spark-gray">🔍</span>
        <span className="flex-1 truncate text-sm text-spark-gray">Search meetups near you...</span>
        <button onClick={() => setFilterSheetOpen(true)} className="text-spark-purple" aria-label="상세 필터">☰</button>
      </div>

      <div
        ref={mapQuickFilterDrag.ref}
        onMouseDown={mapQuickFilterDrag.onMouseDown}
        onMouseMove={mapQuickFilterDrag.onMouseMove}
        onMouseUp={mapQuickFilterDrag.onMouseUp}
        onMouseLeave={mapQuickFilterDrag.onMouseLeave}
        onClickCapture={mapQuickFilterDrag.onClickCapture}
        className="touch-pan-x absolute inset-x-4 top-[68px] flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {([
          { value: 'all', label: '전체' },
          { value: 'age', label: '나이' },
          { value: 'level', label: '레벨' },
          { value: 'gender', label: '성별' },
        ] as const).map(f => (
          <button
            key={f.value}
            onClick={() => setQuickFilter(f.value)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm ${
              quickFilter === f.value ? 'border-spark-lime bg-spark-lime text-spark-dark' : 'border-transparent bg-white/95 text-spark-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm" aria-label="현재 위치">◎</button>
      </div>

      {/* 마커 선택 시 요약 카드 — 다른 곳을 누르면 닫힌다 */}
      {selectedSpark && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute inset-x-4 bottom-[76px] z-20 rounded-2xl bg-white p-3 shadow-spark-card"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-spark-dark">
                {SPORT_EMOJI[(selectedSpark.sport as { code?: string } | null)?.code ?? ''] ?? '⚡'} {selectedSpark.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-spark-text-secondary">
                📍 {selectedSpark.place_name ?? '장소 미정'} · {formatTimeOnly(selectedSpark.scheduled_at)}
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-spark-purple">
              {selectedSpark.participants?.[0]?.count ?? 0}/{selectedSpark.capacity}
            </span>
          </div>
          <button
            onClick={() => navigate(`/sparks/${selectedSpark.id}`)}
            className="mt-2 w-full rounded-full bg-spark-lime py-2 text-xs font-bold text-spark-dark"
          >
            모임 상세보기
          </button>
        </div>
      )}

      {/* 리스트로 확인 핸들 — 클릭하면 풀스크린 리스트가 슬라이드업 */}
      <button
        onClick={e => { e.stopPropagation(); setListOpen(true) }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-spark-dark px-5 py-2.5 text-sm font-bold text-white shadow-spark-card"
      >
        리스트로 확인
      </button>

      <div onClick={e => e.stopPropagation()} className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        {fabOpen && (
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-spark-card">
            <button onClick={() => navigate('/sparks/new')} className="whitespace-nowrap rounded-xl px-3 py-2 text-left text-xs font-bold text-spark-dark hover:bg-spark-soft-purple">
              번개 생성
            </button>
            <button onClick={() => navigate('/mypage/activity')} className="whitespace-nowrap rounded-xl px-3 py-2 text-left text-xs font-bold text-spark-dark hover:bg-spark-soft-purple">
              내 번개 바로 가기
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(open => !open)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-spark-lime text-xl font-bold text-spark-dark shadow-spark-card"
          aria-label="번개 모임 메뉴"
        >
          {fabOpen ? '×' : '+'}
        </button>
      </div>

      {/* 리스트로 확인 → 풀스크린 슬라이드업 리스트 */}
      {listOpen && (
        <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-black/0">
          <div
            className="flex w-full max-w-[440px] flex-col rounded-t-[28px] bg-white"
            style={{ height: '92dvh', animation: 'spark-sheet-up 220ms ease-out' }}
          >
            <button onClick={() => setListOpen(false)} className="flex items-center justify-center py-3" aria-label="지도로 접기">
              <span className="h-1.5 w-12 rounded-full bg-gray-200" />
            </button>
            <div className="px-5 pb-3">
              {quickFilterRow}
              <SportFilterRow sports={sports} selectedSport={selectedSport} setSelectedSport={setSelectedSport} />
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <SparkListBody loading={loading} visibleSparks={visibleSparks} />
            </div>
          </div>
        </div>
      )}

      {filterSheetOpen && (
        <SparkFilterSheet
          initial={detailFilters ?? getDefaultFilters()}
          onClose={() => setFilterSheetOpen(false)}
          onApply={filters => { setDetailFilters(filters); setFilterSheetOpen(false) }}
        />
      )}
    </div>
  )
}

function SportFilterRow({ sports, selectedSport, setSelectedSport }: { sports: Sport[]; selectedSport: string | null; setSelectedSport: (id: string | null) => void }) {
  const drag = useDragScroll<HTMLDivElement>()
  return (
    <div
      ref={drag.ref}
      onMouseDown={drag.onMouseDown}
      onMouseMove={drag.onMouseMove}
      onMouseUp={drag.onMouseUp}
      onMouseLeave={drag.onMouseLeave}
      onClickCapture={drag.onClickCapture}
      className="touch-pan-x flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => setSelectedSport(null)}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
          !selectedSport ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-200 text-spark-text-secondary'
        }`}
      >
        전체
      </button>
      {sports.map(sport => (
        <button
          key={sport.id}
          onClick={() => setSelectedSport(sport.id === selectedSport ? null : sport.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
            selectedSport === sport.id ? 'border-spark-purple bg-spark-purple text-white' : 'border-gray-200 text-spark-text-secondary'
          }`}
        >
          {SPORT_EMOJI[(sport as { code?: string }).code ?? ''] ?? ''} {sport.name}
        </button>
      ))}
    </div>
  )
}

function SparkListBody({ loading, visibleSparks }: { loading: boolean; visibleSparks: SparkRow[] }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" />
      </div>
    )
  }
  if (visibleSparks.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="mb-3 text-4xl">⚡</div>
        <p className="text-sm text-spark-text-secondary">근처에 열린 번개가 아직 없어요.</p>
        <p className="mt-1 text-xs text-spark-gray">직접 번개를 만들어볼까요?</p>
        <Link to="/sparks/new" className="mt-4 rounded-full bg-spark-lime px-6 py-2.5 text-sm font-bold text-spark-dark">
          번개 만들기
        </Link>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {visibleSparks.map(spark => (
        <SparkCard key={spark.id} spark={spark} />
      ))}
    </div>
  )
}

function SparkCard({ spark }: { spark: SparkRow }) {
  const participantCount = spark.participants?.[0]?.count ?? 0
  const full = participantCount >= spark.capacity
  const sportCode = (spark.sport as { code?: string } | null)?.code ?? ''
  const emoji = SPORT_EMOJI[sportCode] ?? '⚡'
  const levelLabel = spark.min_level ? LEVEL_LABEL[spark.min_level] ?? spark.min_level : '레벨무관'
  const genderLabel = GENDER_LABEL[spark.gender_condition ?? 'any'] ?? '성별무관'
  const ageLabel = spark.age_min || spark.age_max ? `${spark.age_min ?? '0'}~${spark.age_max ?? '99'}세` : '나이무관'

  return (
    <Link
      to={`/sparks/${spark.id}`}
      className="block rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 truncate text-base font-bold text-spark-dark leading-tight">{emoji} {spark.title}</h3>
        <span className="shrink-0 text-sm font-bold text-spark-purple">{formatTimeOnly(spark.scheduled_at)}</span>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-xs text-spark-text-secondary">
        <span className="flex items-center gap-1 truncate">📍 {spark.place_name ?? '장소 미정'}</span>
        <span className={`shrink-0 font-medium ${full ? 'text-red-400' : 'text-spark-purple'}`}>({participantCount}/{spark.capacity})</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-spark-text-secondary">{levelLabel}</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-spark-text-secondary">{genderLabel}</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-spark-text-secondary">{ageLabel}</span>
        {full && <span className="rounded-full bg-spark-soft-purple px-2.5 py-1 text-[11px] font-bold text-spark-purple">마감</span>}
      </div>

      {spark.description && (
        <p className="mt-2 line-clamp-2 text-xs text-spark-text-secondary">{spark.description}</p>
      )}
    </Link>
  )
}

function formatTimeOnly(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

