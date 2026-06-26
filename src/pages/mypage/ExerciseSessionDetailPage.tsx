import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchExerciseSessionById, formatDuration } from '@/features/exercise/api'
import { MOCK_EXERCISE_SESSIONS } from '@/lib/mockData'
import { WorkoutMapPreview } from '@/components/common/WorkoutMapPreview'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import type { ExerciseSession } from '@/types/database'

type SessionDetail = ExerciseSession & {
  sport: { code: string; name: string } | null
  spark: { id: string; title: string; place_name: string | null } | null
}

export function ExerciseSessionDetailPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    fetchExerciseSessionById(sessionId).then(({ data }) => {
      if (data) setSession(data as unknown as SessionDetail)
      else setSession(getMock(sessionId))
    }).catch(() => setSession(getMock(sessionId))).finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return <div className="spark-page-background flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-purple border-t-transparent" /></div>
  if (!session) return <div className="spark-page-background flex min-h-dvh flex-col items-center justify-center gap-3"><p>운동 기록을 찾을 수 없어요.</p><button onClick={() => navigate(-1)} className="font-bold text-spark-purple">뒤로 가기</button></div>

  const code = session.sport?.code ?? 'running'
  const isFitness = code === 'fitness'
  const isBadminton = code === 'badminton' || session.mode === 'spark'
  const metrics = isFitness
    ? [['시간', displayDuration(session)], ['칼로리', `${Math.round(Number(session.calories ?? 450))}kcal`], ['세트 수', '12세트']]
    : isBadminton
      ? [['시간', displayDuration(session)], ['칼로리', `${Math.round(Number(session.calories ?? 380))}kcal`], ['경기 수', '4경기']]
      : [['시간', displayDuration(session)], ['칼로리', `${Math.round(Number(session.calories ?? 320))}kcal`], ['거리', `${(Number(session.distance_meters ?? 5200) / 1000).toFixed(1)}km`]]

  const details = isFitness
    ? [['시작 시간', '18:20'], ['종료 시간', '19:20'], ['운동 강도', '중강도'], ['운동 부위', '상체 · 코어'], ['총 볼륨', '4,820kg']]
    : isBadminton
      ? [['시작 시간', '14:10'], ['종료 시간', '15:20'], ['운동 강도', '중강도'], ['플레이 형태', '복식'], ['경기 결과', '3승 1패'], ['세트 수', '8세트']]
      : [['시작 시간', '06:30'], ['종료 시간', '07:15'], ['운동 강도', '중강도'], ['평균 페이스', '6′12″/km'], ['평균 속도', '9.7km/h'], ['고도 상승', '42m']]

  return (
    <div className="spark-page-background min-h-dvh text-spark-dark">
      <header className="flex h-16 items-center px-5"><button onClick={() => navigate(-1)} className="mr-3 text-3xl">‹</button><h1 className="text-xl font-bold">운동 상세</h1></header>
      <main className="space-y-5 px-5 pb-8">
        <section>
          <p className="text-xs text-spark-text-secondary">{formatDateTime(session.started_at)}</p>
          <div className="mt-2 flex items-center gap-2"><h2 className="text-xl font-bold">#{session.sport?.name ?? '운동'}</h2><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${session.mode === 'spark' ? 'bg-spark-lime text-spark-dark' : 'bg-spark-purple text-white'}`}>{session.mode === 'spark' ? '번개운동' : '개인운동'}</span></div>
        </section>

        <WorkoutMapPreview route={!isFitness} />

        <section className="grid grid-cols-3 divide-x divide-gray-200 rounded-spark-lg bg-white p-5 shadow-spark-card">
          {metrics.map(([label, value]) => <div key={label} className="text-center"><span className="text-[10px] text-spark-gray">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>)}
        </section>

        <section className="rounded-spark-lg bg-white p-5 shadow-spark-card">
          <h3 className="font-bold">오늘의 기록 상세</h3>
          <div className="mt-4 divide-y divide-gray-100">{details.map(([label, value]) => <div key={label} className="flex justify-between py-3 text-sm"><span className="text-spark-text-secondary">{label}</span><strong>{value}</strong></div>)}</div>
        </section>

        <section className="rounded-spark-lg bg-spark-soft-purple p-5">
          <h3 className="font-bold">운동 메모</h3>
          <p className="mt-2 text-sm leading-6 text-spark-text-secondary">{session.memo ?? (isFitness ? '자세에 집중해서 천천히 진행했어요.' : isBadminton ? '동네 이웃들과 즐겁게 운동했어요!' : '아침 공기가 좋아서 평소보다 가볍게 달렸어요.')}</p>
        </section>

        {isBadminton && (
          <section>
            <h3 className="font-bold">함께한 사람</h3>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{['민지', '철수', '하늘'].map((name, index) => <div key={name} className="flex min-w-[120px] items-center gap-3 rounded-spark-lg bg-white p-3 shadow-sm"><SparkCharacter size="sm" mood={index === 1 ? 'active' : 'happy'} /><div><strong className="text-xs">{name}</strong><span className="block text-[10px] text-spark-purple">LV.{12 + index * 4} · {320 + index * 45} XP</span></div></div>)}</div>
          </section>
        )}
      </main>
    </div>
  )
}

function getMock(id: string) {
  const found = MOCK_EXERCISE_SESSIONS.find(item => item.id === id) ?? MOCK_EXERCISE_SESSIONS[0]
  return { ...found, spark_id: found.mode === 'spark' ? 'spark1' : null, memo: null, spark: found.mode === 'spark' ? { id: 'spark1', title: '동네 운동 번개', place_name: '한강공원' } : null } as unknown as SessionDetail
}

function displayDuration(session: SessionDetail) {
  return session.duration_seconds ? formatDuration(session.duration_seconds) : '45분'
}

function formatDateTime(iso: string) {
  const date = new Date(iso)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} · ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
}
