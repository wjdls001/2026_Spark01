import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchMyParticipations, fetchMySparks } from '@/features/sparks/api'
import { MOCK_SPARKS, SPORT_EMOJI } from '@/lib/mockData'

type ParticipationRow = {
  id: string
  status: string
  spark: {
    id: string
    title: string
    place_name: string | null
    scheduled_at: string
    status: string
    sport: { code: string; name: string } | null
    host: { id: string; nickname: string; avatar_url: string | null } | null
  } | null
}

type MySparkRow = {
  id: string
  title: string
  place_name: string | null
  scheduled_at: string
  status: string
  capacity: number
  sport: { code: string; name: string } | null
  participants: { count: number }[]
}

type Tab = 'joined' | 'hosted'
type Sort = 'latest' | 'oldest'
type HostedFilter = 'all' | 'recruiting' | 'closed'

export function MyActivityPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('joined')
  const [participations, setParticipations] = useState<ParticipationRow[]>([])
  const [hosted, setHosted] = useState<MySparkRow[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('latest')
  const [filter, setFilter] = useState<HostedFilter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([fetchMyParticipations(user.id), fetchMySparks(user.id)]).then(([joinedResult, hostedResult]) => {
      const joinedRows = joinedResult.data as unknown as ParticipationRow[] | null
      const hostedRows = hostedResult.data as unknown as MySparkRow[] | null
      setParticipations(joinedRows?.length ? joinedRows : mockParticipations())
      setHosted(hostedRows?.length ? hostedRows : MOCK_SPARKS.slice(0, 4) as unknown as MySparkRow[])
    }).catch(() => {
      setParticipations(mockParticipations())
      setHosted(MOCK_SPARKS.slice(0, 4) as unknown as MySparkRow[])
    }).finally(() => setLoading(false))
  }, [user])

  const joinedItems = useMemo(() => {
    return participations
      .filter(item => item.spark?.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortDates(a.spark?.scheduled_at, b.spark?.scheduled_at, sort))
  }, [participations, search, sort])

  const hostedItems = useMemo(() => {
    return hosted
      .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
      .filter(item => filter === 'all' || (filter === 'recruiting' ? item.status === 'recruiting' : ['closed', 'completed', 'canceled'].includes(item.status)))
      .sort((a, b) => sortDates(a.scheduled_at, b.scheduled_at, sort))
  }, [hosted, search, filter, sort])

  return (
    <div className="spark-page-background min-h-dvh text-spark-dark">
      <header className="flex h-16 items-center px-5">
        <button onClick={() => navigate(-1)} className="mr-3 text-3xl">‹</button>
        <h1 className="text-xl font-bold">활동 관리</h1>
      </header>

      <nav className="mx-5 grid grid-cols-2 rounded-full bg-white p-1 shadow-sm">
        <button onClick={() => { setTab('joined'); setFilter('all') }} className={`rounded-full py-3 text-sm font-bold ${tab === 'joined' ? 'bg-spark-purple text-white' : 'text-spark-text-secondary'}`}>참여한 번개</button>
        <button onClick={() => { setTab('hosted'); setFilter('all') }} className={`rounded-full py-3 text-sm font-bold ${tab === 'hosted' ? 'bg-spark-purple text-white' : 'text-spark-text-secondary'}`}>개설한 번개</button>
      </nav>

      <main className="px-5 pb-8 pt-6">
        <section className="rounded-spark-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><span className="text-xs text-spark-text-secondary">총 {tab === 'joined' ? '참여' : '개설'} 번개</span><strong className="ml-2 text-xl">{tab === 'joined' ? joinedItems.length : hostedItems.length}</strong></div>
            <button onClick={() => setSort(current => current === 'latest' ? 'oldest' : 'latest')} className="rounded-full bg-spark-muted px-4 py-2 text-xs font-bold text-spark-purple">{sort === 'latest' ? '최신순 ↓' : '오래된순 ↑'}</button>
          </div>
          <div className="mt-4 flex h-12 items-center rounded-full bg-spark-muted px-4">
            <span className="mr-2">⌕</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="번개 이름을 검색해 주세요" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            {search && <button onClick={() => setSearch('')} className="text-spark-gray">×</button>}
          </div>
        </section>

        {tab === 'hosted' && (
          <div className="mt-4 flex gap-2">
            {([{ key: 'all', label: '전체' }, { key: 'recruiting', label: '모집중' }, { key: 'closed', label: '마감' }] as const).map(item => (
              <button key={item.key} onClick={() => setFilter(item.key)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === item.key ? 'bg-spark-lime text-spark-dark' : 'bg-white text-spark-text-secondary'}`}>{item.label}</button>
            ))}
          </div>
        )}

        <section className="mt-5 space-y-3">
          {loading ? <Loading /> : tab === 'joined'
            ? joinedItems.map(item => item.spark && <ActivityCard key={item.id} spark={item.spark} badge={participantLabel(item.status)} onClick={() => navigate(`/sparks/${item.spark?.id}`)} />)
            : hostedItems.map(item => <ActivityCard key={item.id} spark={item} badge={sparkLabel(item.status)} hosted onClick={() => navigate(`/sparks/${item.id}/manage`)} />)}
          {!loading && (tab === 'joined' ? joinedItems.length === 0 : hostedItems.length === 0) && <EmptyState tab={tab} onClick={() => navigate(tab === 'joined' ? '/sparks' : '/sparks/new')} />}
        </section>
      </main>
    </div>
  )
}

function ActivityCard({ spark, badge, hosted, onClick }: { spark: ParticipationRow['spark'] | MySparkRow; badge: string; hosted?: boolean; onClick: () => void }) {
  if (!spark) return null
  const code = spark.sport?.code ?? ''
  const participantCount = 'participants' in spark ? spark.participants?.[0]?.count ?? 0 : null
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 rounded-spark-lg bg-white p-4 text-left shadow-spark-card">
      <span className="flex h-14 w-14 items-center justify-center rounded-spark-md bg-spark-soft-purple text-2xl">{SPORT_EMOJI[code] ?? '⚡'}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2"><span className="rounded-full bg-spark-soft-purple px-2 py-1 text-[10px] font-bold text-spark-purple">{spark.sport?.name ?? '운동'}</span><span className="rounded-full bg-spark-soft-lime px-2 py-1 text-[10px] font-bold">{badge}</span></span>
        <strong className="mt-2 block truncate text-sm">{spark.title}</strong>
        <span className="mt-1 block truncate text-xs text-spark-text-secondary">{formatSchedule(spark.scheduled_at)} · {spark.place_name ?? '장소 미정'}</span>
      </span>
      <span className="text-right text-xs text-spark-purple">{hosted ? '관리 →' : '상세 →'}{participantCount !== null && <small className="mt-1 block text-spark-gray">👥 {participantCount}</small>}</span>
    </button>
  )
}

function Loading() {
  return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" /></div>
}

function EmptyState({ tab, onClick }: { tab: Tab; onClick: () => void }) {
  return <div className="rounded-spark-lg bg-white p-8 text-center"><div className="text-4xl">⚡</div><p className="mt-3 text-sm text-spark-text-secondary">{tab === 'joined' ? '참여한 번개가 없어요.' : '개설한 번개가 없어요.'}</p><button onClick={onClick} className="mt-5 rounded-full bg-spark-lime px-6 py-3 text-sm font-bold">{tab === 'joined' ? '번개 탐색' : '번개 만들기'}</button></div>
}

function mockParticipations(): ParticipationRow[] {
  return MOCK_SPARKS.slice(0, 4).map((spark, index) => ({ id: `mock-participation-${index}`, status: index === 0 ? 'approved' : index === 3 ? 'attended' : 'requested', spark: { ...spark, host: spark.host ? { id: spark.host.id, nickname: spark.host.nickname, avatar_url: spark.host.avatar_url } : null } })) as unknown as ParticipationRow[]
}

function sortDates(a: string | undefined, b: string | undefined, sort: Sort) {
  const difference = new Date(a ?? 0).getTime() - new Date(b ?? 0).getTime()
  return sort === 'latest' ? -difference : difference
}

function participantLabel(status: string) {
  return ({ requested: '승인 대기', approved: '참여 확정', attended: '운동 완료', rejected: '거절됨', canceled: '취소됨' } as Record<string, string>)[status] ?? status
}

function sparkLabel(status: string) {
  return ({ recruiting: '모집중', closed: '마감', in_progress: '진행중', completed: '완료', canceled: '취소' } as Record<string, string>)[status] ?? status
}

function formatSchedule(iso: string) {
  const date = new Date(iso)
  return `${date.getMonth() + 1}.${date.getDate()} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
}
