import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchMyParticipations, fetchMySparks } from '@/features/sparks/api'

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

const SPARK_STATUS_MAP: Record<string, string> = {
  recruiting: '모집 중', closed: '마감', in_progress: '진행 중', completed: '완료', canceled: '취소',
}

const PARTICIPANT_STATUS_MAP: Record<string, string> = {
  requested: '승인 대기', approved: '참여 확정', rejected: '거절됨', canceled: '취소됨', attended: '운동 완료', no_show: '노쇼',
}

export function MyActivityPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<'joined' | 'hosted'>('joined')
  const [participations, setParticipations] = useState<ParticipationRow[]>([])
  const [mySparks, setMySparks] = useState<MySparkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    if (tab === 'joined') {
      fetchMyParticipations(user.id).then(({ data }) => {
        if (data) setParticipations(data as unknown as ParticipationRow[])
        setLoading(false)
      })
    } else {
      fetchMySparks(user.id).then(({ data }) => {
        if (data) setMySparks(data as unknown as MySparkRow[])
        setLoading(false)
      })
    }
  }, [tab, user])

  const filterStatuses = {
    all: null,
    active: ['requested', 'approved', 'recruiting', 'closed', 'in_progress'],
    done: ['attended', 'completed'],
  }

  const filteredParticipations = participations.filter(p => {
    if (filter === 'all') return true
    const statuses = filterStatuses[filter as keyof typeof filterStatuses]
    return statuses ? statuses.includes(p.status) || statuses.includes(p.spark?.status ?? '') : true
  })

  const filteredSparks = mySparks.filter(s => {
    if (filter === 'all') return true
    if (filter === 'active') return ['recruiting', 'closed', 'in_progress'].includes(s.status)
    if (filter === 'done') return ['completed', 'canceled'].includes(s.status)
    return true
  })

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">활동 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-100 bg-white">
        <button onClick={() => { setTab('joined'); setFilter('all') }}
          className={`flex-1 py-3 text-sm font-medium ${tab === 'joined' ? 'border-b-2 border-[#9B8FFF] text-[#9B8FFF]' : 'text-[#999999]'}`}>
          참여한 번개
        </button>
        <button onClick={() => { setTab('hosted'); setFilter('all') }}
          className={`flex-1 py-3 text-sm font-medium ${tab === 'hosted' ? 'border-b-2 border-[#9B8FFF] text-[#9B8FFF]' : 'text-[#999999]'}`}>
          개설한 번개
        </button>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 bg-white px-5 py-3 border-b border-gray-100">
        {[{ k: 'all', l: '전체' }, { k: 'active', l: '진행 중' }, { k: 'done', l: '완료' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`rounded-full border px-3 py-1 text-xs ${filter === f.k ? 'border-[#9B8FFF] bg-[#9B8FFF] text-white' : 'border-gray-300 text-[#555555]'}`}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B8FFF] border-t-transparent" />
          </div>
        ) : tab === 'joined' ? (
          filteredParticipations.length === 0 ? (
            <EmptyState text="참여한 번개가 없어요." subText="번개를 찾아볼까요?" linkTo="/sparks" linkText="번개 탐색" />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredParticipations.map(p => {
                if (!p.spark) return null
                return (
                  <Link key={p.id} to={`/sparks/${p.spark.id}`}
                    className="block rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                    <div className="mb-2 flex items-center gap-2">
                      {p.spark.sport && (
                        <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">{p.spark.sport.name}</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${participantStatusColor(p.status)}`}>
                        {PARTICIPANT_STATUS_MAP[p.status] ?? p.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#111111]">{p.spark.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#777777]">
                      <span>📅 {formatSchedule(p.spark.scheduled_at)}</span>
                      {p.spark.place_name && <span>📍 {p.spark.place_name}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        ) : (
          filteredSparks.length === 0 ? (
            <EmptyState text="개설한 번개가 없어요." subText="번개를 만들어볼까요?" linkTo="/sparks/new" linkText="번개 만들기" />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSparks.map(spark => (
                <Link key={spark.id} to={`/sparks/${spark.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {spark.sport && (
                        <span className="rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#9B8FFF]">{spark.sport.name}</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${sparkStatusColor(spark.status)}`}>
                        {SPARK_STATUS_MAP[spark.status] ?? spark.status}
                      </span>
                    </div>
                    <Link to={`/sparks/${spark.id}/manage`} onClick={e => e.stopPropagation()}
                      className="text-xs text-[#9B8FFF] font-medium">관리 →</Link>
                  </div>
                  <h3 className="text-sm font-bold text-[#111111]">{spark.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#777777]">
                    <span>📅 {formatSchedule(spark.scheduled_at)}</span>
                    {spark.place_name && <span>📍 {spark.place_name}</span>}
                    <span className="ml-auto">👥 {spark.participants?.[0]?.count ?? 0}/{spark.capacity}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function EmptyState({ text, subText, linkTo, linkText }: { text: string; subText: string; linkTo: string; linkText: string }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="text-4xl mb-3">⚡</div>
      <p className="text-sm text-[#777777]">{text}</p>
      <p className="text-xs text-[#AAAAAA] mt-1">{subText}</p>
      <Link to={linkTo} className="mt-4 rounded-full bg-[#C8FF3E] px-6 py-2.5 text-sm font-bold text-[#111111]">
        {linkText}
      </Link>
    </div>
  )
}

function participantStatusColor(status: string) {
  const map: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-500',
    canceled: 'bg-gray-100 text-[#777777]',
    attended: 'bg-[#C8FF3E] text-[#111111]',
    no_show: 'bg-gray-100 text-[#777777]',
  }
  return map[status] ?? 'bg-gray-100 text-[#777777]'
}

function sparkStatusColor(status: string) {
  const map: Record<string, string> = {
    recruiting: 'bg-[#C8FF3E] text-[#111111]',
    closed: 'bg-gray-100 text-[#777777]',
    in_progress: 'bg-[#EEE8FF] text-[#9B8FFF]',
    completed: 'bg-gray-100 text-[#777777]',
    canceled: 'bg-red-100 text-red-500',
  }
  return map[status] ?? 'bg-gray-100 text-[#777777]'
}

function formatSchedule(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
