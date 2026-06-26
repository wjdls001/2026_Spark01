import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchExerciseSessions } from '@/features/exercise/api'
import { MOCK_EXERCISE_SESSIONS, MOCK_SPORTS, SPORT_EMOJI } from '@/lib/mockData'
import type { ExerciseSession } from '@/types/database'

type MainTab = 'quick' | 'history' | 'stats'
type Period = 'week' | 'month' | 'year'
type SessionRow = ExerciseSession & { sport: { code: string; name: string } | null }

const MOCK_BARS = [32, 55, 42, 78, 61, 88, 46, 70, 58, 84, 66, 92]

// 날짜(연/월/주) 단위로 결정적인 더미 값을 만들어, 이전/다음 화살표로 기간을 옮기면
// 차트·통계 값도 함께 바뀌는 것처럼 보이게 한다(실제 더미 데이터는 고정 1세트뿐이라 시드 기반으로 변주).
function seededValues(seed: number, count: number, min: number, max: number) {
  return Array.from({ length: count }, (_, i) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    const frac = x - Math.floor(x)
    return Math.round(min + frac * (max - min))
  })
}

function periodSeed(cursor: Date, period: Period) {
  if (period === 'week') return cursor.getFullYear() * 1000 + weekOfYear(cursor)
  if (period === 'month') return cursor.getFullYear() * 100 + cursor.getMonth()
  return cursor.getFullYear()
}

function weekOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

export function MyExercisePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<MainTab>('history')
  const [period, setPeriod] = useState<Period>('year')
  const [cursor, setCursor] = useState(new Date(2026, 4, 31))
  const [sessions, setSessions] = useState<SessionRow[]>([])

  useEffect(() => {
    if (!user) return
    fetchExerciseSessions(user.id)
      .then(({ data }) => setSessions(data?.length ? data as SessionRow[] : MOCK_EXERCISE_SESSIONS as unknown as SessionRow[]))
      .catch(() => setSessions(MOCK_EXERCISE_SESSIONS as unknown as SessionRow[]))
  }, [user])

  const totals = useMemo(() => ({
    calories: sessions.reduce((sum, item) => sum + Number(item.calories ?? 0), 0),
    distance: sessions.reduce((sum, item) => sum + Number(item.distance_meters ?? 0), 0) / 1000,
    seconds: sessions.reduce((sum, item) => sum + Number(item.duration_seconds ?? 0), 0),
  }), [sessions])

  const seed = periodSeed(cursor, period)
  const barCount = period === 'year' ? 12 : 7
  const distanceBars = useMemo(() => seededValues(seed, barCount, 15, 95), [seed, barCount])
  const timeBars = useMemo(() => seededValues(seed + 1, barCount, 15, 95), [seed, barCount])
  const caloriesValue = useMemo(() => seededValues(seed + 2, 1, 1200, 26000)[0], [seed])
  const paceValue = useMemo(() => {
    const sec = seededValues(seed + 3, 1, 320, 400)[0]
    return `${Math.floor(sec / 60)}′${String(sec % 60).padStart(2, '0')}″`
  }, [seed])

  function movePeriod(direction: number) {
    setCursor(current => {
      const next = new Date(current)
      if (period === 'week') next.setDate(next.getDate() + direction * 7)
      if (period === 'month') next.setMonth(next.getMonth() + direction)
      if (period === 'year') next.setFullYear(next.getFullYear() + direction)
      return next
    })
  }

  return (
    <div className="spark-page-background min-h-dvh text-spark-dark">
      <div className="h-[env(safe-area-inset-top)]" />
      <header className="relative flex h-16 items-center justify-center px-5">
        <button onClick={() => navigate(-1)} className="absolute left-5 flex h-11 w-11 items-center justify-center text-3xl">‹</button>
        <h1 className="text-base font-bold">운동 관리</h1>
      </header>

      <nav className="grid grid-cols-3 border-b border-white/60 px-4">
        {([{ key: 'quick', label: '빠른 기록' }, { key: 'history', label: '기간별 히스토리' }, { key: 'stats', label: '통계' }] as const).map(item => (
          <button key={item.key} onClick={() => setTab(item.key)} className={`relative h-14 text-sm font-bold ${tab === item.key ? 'text-spark-purple' : 'text-spark-text-secondary'}`}>{item.label}{tab === item.key && <span className="absolute bottom-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-spark-purple" />}</button>
        ))}
      </nav>

      <main className="px-4 pb-10 pt-5">
        {tab === 'quick' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold">최근 운동</h2>
              <div className="mt-4 space-y-3">
                {sessions.map(session => (
                  <button key={session.id} onClick={() => navigate(`/mypage/workout/${session.id}`)} className="w-full rounded-spark-lg bg-white p-4 text-left shadow-spark-card">
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-spark-sm bg-spark-soft-purple text-xl">{SPORT_EMOJI[session.sport?.code ?? ''] ?? '🏃'}</span>
                      <span className="min-w-0 flex-1">
                        <span className="rounded-full bg-spark-soft-purple px-3 py-1 text-[10px] font-bold text-spark-purple">{session.sport?.name ?? '운동'}</span>
                        <strong className="mt-2 block truncate text-sm">{session.title ?? session.sport?.name ?? '운동 기록'}</strong>
                        <span className="mt-1 block text-xs text-spark-text-secondary">{formatSessionMeta(session)}</span>
                      </span>
                      <span className="text-spark-purple">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">자주 하는 운동</h2>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {MOCK_SPORTS.slice(0, 6).map(sport => <button key={sport.id} onClick={() => navigate('/exercise/solo/setup')} className="shrink-0 rounded-full bg-white px-4 py-3 text-xs font-bold shadow-sm">{sport.emoji} {sport.name}</button>)}
              </div>
            </section>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-5">
            <div className="mx-auto grid w-[220px] grid-cols-3 rounded-full bg-spark-soft-lime p-1">
              {([{ key: 'week', label: '주간' }, { key: 'month', label: '월간' }, { key: 'year', label: '연간' }] as const).map(item => <button key={item.key} onClick={() => setPeriod(item.key)} className={`rounded-full py-2 text-xs font-bold ${period === item.key ? 'bg-white text-spark-purple shadow-sm' : 'text-spark-text-secondary'}`}>{item.label}</button>)}
            </div>
            <PeriodNavigator label={periodLabel(cursor, period)} onPrev={() => movePeriod(-1)} onNext={() => movePeriod(1)} />
            {period === 'week' && <WeekCalendar cursor={cursor} />}
            {period === 'month' && <MonthCalendar cursor={cursor} />}
            {period === 'year' && <YearCountGrid cursor={cursor} />}
            <ChartCard
              title="거리 (km)"
              total={`${(distanceBars.reduce((a, b) => a + b, 0) / 10).toFixed(1)}km`}
              average="평균 4.1km"
              values={distanceBars}
            />
            <ChartCard
              title="시간 (h:m:s)"
              total={formatHours(timeBars.reduce((a, b) => a + b, 0) * 60)}
              average="평균 42분"
              values={timeBars}
            />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="칼로리" value={caloriesValue.toLocaleString()} unit="Kcal" filled />
              <MetricCard label="페이스" value={paceValue} unit="지난 기간 대비 향상" />
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-bold">이번 달 요약</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <SummaryCard label="운동 횟수" value={`${Math.max(sessions.length, 12)}회`} />
                <SummaryCard label="칼로리" value={`${Math.max(totals.calories / 1000, 4.8).toFixed(1)}K`} />
                <SummaryCard label="총 운동시간" value={`${Math.max(Math.round(totals.seconds / 3600), 9)}H`} />
              </div>
            </section>
            <section className="rounded-spark-lg bg-white p-5 shadow-spark-card">
              <div className="flex justify-between"><h2 className="font-bold">목표 달성 현황</h2><strong className="text-spark-purple">78%</strong></div>
              <div className="mt-4 h-3 rounded-full bg-spark-soft-purple"><div className="h-full w-[78%] rounded-full bg-spark-purple" /></div>
            </section>
            <section className="rounded-spark-lg bg-white p-5 shadow-spark-card">
              <h2 className="font-bold">운동 종목별 분포</h2>
              <div className="mt-5 space-y-4"><Distribution label="러닝" value={40} /><Distribution label="헬스" value={35} /><Distribution label="배드민턴" value={25} /></div>
            </section>
            <ChartCard title="월별 운동시간 비교" total="64시간" average="월 평균 5.3시간" values={MOCK_BARS} />
          </div>
        )}
      </main>
    </div>
  )
}

function PeriodNavigator({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return <div className="flex items-center justify-center gap-8 py-1"><button onClick={onPrev} className="flex h-10 w-10 items-center justify-center text-2xl">‹</button><strong className="min-w-24 text-center text-sm">{label}</strong><button onClick={onNext} className="flex h-10 w-10 items-center justify-center text-2xl">›</button></div>
}

function WeekCalendar({ cursor }: { cursor: Date }) {
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(cursor); date.setDate(cursor.getDate() + index); return date })
  return <div className="grid grid-cols-7 rounded-spark-lg bg-white p-4 shadow-sm">{days.map((date, index) => <div key={date.toISOString()} className="text-center"><span className="text-[10px] text-spark-gray">{['일', '월', '화', '수', '목', '금', '토'][index]}</span><strong className="mt-2 block text-sm">{date.getDate()}</strong>{[1, 3, 5, 6].includes(index) && <span className="mx-auto mt-2 block h-2 w-2 rounded-full bg-spark-purple" />}</div>)}</div>
}

function MonthCalendar({ cursor }: { cursor: Date }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)]
  return <div className="rounded-spark-lg bg-white p-4 shadow-sm"><div className="mb-3 grid grid-cols-7 text-center text-[10px] text-spark-gray">{['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day}>{day}</span>)}</div><div className="grid grid-cols-7 gap-y-3">{cells.map((day, index) => <div key={index} className="h-8 text-center text-xs">{day}<span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${day && day % 3 === 0 ? 'bg-spark-purple' : 'bg-transparent'}`} /></div>)}</div></div>
}

function YearCountGrid({ cursor }: { cursor: Date }) {
  const isCurrentYear = cursor.getFullYear() === new Date(2026, 4, 31).getFullYear()
  const bars = seededValues(cursor.getFullYear(), 12, 2, 16)
  return <section className="rounded-[22px] border border-gray-200 bg-white p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-base font-bold">{cursor.getFullYear()}년 월별 운동 횟수</h2><span className="flex items-center gap-1 rounded-lg bg-spark-muted px-3 py-2 text-[10px] text-spark-text-secondary">색 설명 <b>?</b></span></div><div className="grid grid-cols-4 gap-2.5">{bars.map((value, index) => {
    const noData = isCurrentYear && index === 0
    return <div key={index} className={`min-h-[76px] rounded-xl p-3 ${noData ? 'bg-gray-200' : index % 4 === 0 ? 'bg-spark-soft-lime' : index % 3 === 0 ? 'bg-spark-lime' : 'bg-spark-lime/60'}`}><span className="text-[10px] text-spark-text-secondary">{index + 1}월</span><strong className="mt-2 block text-base">{noData ? '–' : `${value}회`}</strong></div>
  })}</div></section>
}

function ChartCard({ title, total, average, values }: { title: string; total: string; average: string; values: number[] }) {
  const isDistance = title.includes('거리')
  return (
    <section className="rounded-[22px] border border-gray-200 bg-white p-5">
      <div className="flex justify-between">
        <h2 className="text-base font-bold">{title}</h2>
        <span className="flex items-center gap-1 text-[10px] text-spark-text-secondary">
          <i className="inline-block h-2 w-2 bg-gray-400" />이전 평균
        </span>
      </div>
      <div className="relative mt-7 flex h-40 items-end gap-3 border-b border-gray-200">
        <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-300" />
        {values.map((value, index) => <div key={index} className={`flex-1 rounded-t ${isDistance ? 'bg-spark-lime' : 'bg-spark-purple'}`} style={{ height: `${Math.max(value, 8)}%` }} />)}
      </div>
      <div className="mt-5 grid grid-cols-2 text-center">
        <div><span className="block text-xs text-spark-text-secondary">총 {isDistance ? '거리' : '시간'}</span><strong className="mt-2 block">{total}</strong></div>
        <div className="border-l border-gray-200"><span className="block text-xs text-spark-text-secondary">평균</span><strong className="mt-2 block">{average.replace('평균 ', '')}</strong></div>
      </div>
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-spark-lg bg-white p-4 text-center shadow-sm"><strong className="text-xl">{value}</strong><span className="mt-2 block text-[10px] text-spark-text-secondary">{label}</span></div>
}

function MetricCard({ label, value, unit, filled }: { label: string; value: string; unit: string; filled?: boolean }) {
  return <section className={`min-h-32 rounded-[18px] border-2 border-spark-purple p-5 ${filled ? 'bg-spark-purple text-white' : 'bg-white'}`}><span className="text-sm font-bold">{label}</span><strong className="mt-5 block text-2xl">{value}</strong><span className={`mt-2 block text-xs ${filled ? 'text-white/75' : 'text-spark-purple'}`}>{unit}</span></section>
}

function Distribution({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-xs"><span>{label}</span><strong>{value}%</strong></div><div className="h-2 rounded-full bg-spark-soft-purple"><div className="h-full rounded-full bg-spark-purple" style={{ width: `${value}%` }} /></div></div>
}

function periodLabel(date: Date, period: Period) {
  if (period === 'year') return `${date.getFullYear()}년`
  if (period === 'month') return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  const end = new Date(date); end.setDate(end.getDate() + 6)
  return `${date.getMonth() + 1}.${date.getDate()} - ${end.getMonth() + 1}.${end.getDate()}`
}

function formatSessionMeta(session: SessionRow) {
  const date = new Date(session.started_at)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}.${dd} / ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} / ${session.mode === 'spark' ? '번개 모임 장소' : '내 주변'}`
}

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}
