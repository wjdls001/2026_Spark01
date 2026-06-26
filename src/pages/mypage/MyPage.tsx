import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchRecentExerciseSessions, fetchSports } from '@/features/exercise/api'
import { MOCK_EXERCISE_SESSIONS, MOCK_SPORTS, MOCK_USER_PROFILE } from '@/lib/mockData'
import type { ExerciseSession, Profile, Sport } from '@/types/database'
import { SparkCharacter } from '@/components/common/SparkCharacter'
import { WorkoutMapPreview } from '@/components/common/WorkoutMapPreview'
import { DEFAULT_TRUST_SCORE, getLevelTier, levelNumberFromExerciseLevel } from '@/lib/utils/level'

type Tab = 'profile' | 'workout' | 'activity'
type SessionRow = ExerciseSession & { sport: { code: string; name: string } | null }

export function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [sports, setSports] = useState<Sport[]>([])

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => data && setProfile(data)).catch(() => {})
    fetchRecentExerciseSessions(user.id, 6)
      .then(({ data }) => setSessions(data?.length ? data as SessionRow[] : MOCK_EXERCISE_SESSIONS as unknown as SessionRow[]))
      .catch(() => setSessions(MOCK_EXERCISE_SESSIONS as unknown as SessionRow[]))
    fetchSports().then(({ data }) => setSports(data?.length ? data : MOCK_SPORTS as unknown as Sport[])).catch(() => setSports(MOCK_SPORTS as unknown as Sport[]))
  }, [user])

  const nickname = profile?.nickname ?? MOCK_USER_PROFILE.nickname
  const preferredSports = profile?.preferred_sports?.length ? profile.preferred_sports : MOCK_USER_PROFILE.preferred_sports
  const traits = (profile?.workout_traits ?? MOCK_USER_PROFILE.workout_traits).filter(item => item.startsWith('#') || !item.includes(':')).slice(0, 4)

  return (
    <div className="spark-page-background min-h-dvh text-spark-dark">
      <header className="flex h-16 items-center justify-center border-b border-gray-100 px-5">
        <h1 className="text-xl font-bold">마이페이지</h1>
        <button onClick={() => navigate('/mypage/settings')} className="absolute right-5 flex h-10 w-10 items-center justify-center rounded-full hover:bg-spark-muted" aria-label="설정"><SettingsIcon /></button>
      </header>

      <nav className="grid grid-cols-3 border-b border-gray-100">
        {([
          { key: 'profile', label: '프로필' },
          { key: 'workout', label: '운동 관리' },
          { key: 'activity', label: '활동 관리' },
        ] as const).map(item => (
          <button key={item.key} onClick={() => item.key === 'workout' ? navigate('/mypage/workout') : item.key === 'activity' ? navigate('/mypage/activity') : setTab(item.key)} className={`h-12 border-b-2 text-sm font-bold ${tab === item.key ? 'border-spark-purple text-spark-dark' : 'border-transparent text-spark-gray'}`}>{item.label}</button>
        ))}
      </nav>

      <main className="px-5 pb-8 pt-5">
        {tab === 'profile' && (
          <div className="space-y-6">
            <button onClick={() => navigate('/mypage/profile')} className="flex w-full items-center gap-4 rounded-spark-lg bg-spark-soft-purple p-4 text-left transition active:scale-[0.99]">
              <SparkCharacter size="lg" mood="happy" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xl font-bold">{nickname}</h2>
                  <span className="whitespace-nowrap rounded-full bg-spark-purple px-3 py-1 text-[10px] font-bold text-white">{getLevelTier(levelNumberFromExerciseLevel(profile?.exercise_level))} · LV.{levelNumberFromExerciseLevel(profile?.exercise_level)}</span>
                </div>
                <p className="mt-2 text-sm text-spark-text-secondary">건강한 삶을 위해 오늘도 달려요!</p>
              </div>
              <div className="self-start text-right"><span className="block text-xl text-spark-error">♥</span><span className="text-xs font-bold">{profile?.trust_score ?? DEFAULT_TRUST_SCORE}</span></div>
            </button>

            <TagSection title="선호 운동" items={preferredSports.map(id => getSportName(id, sports))} numbered />
            <TagSection title="운동 성향" items={traits.length ? traits : ['#꾸준함', '#계획형', '#아침운동']} purple />

            <section>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">운동 기록</h3>
                <div className="flex gap-1 text-spark-text-secondary">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-spark-muted text-xs">‹</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-spark-muted text-xs">›</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
              {sessions.concat(sessions).slice(0, 6).map((session, index) => (
                <button key={`${session.id}-${index}`} onClick={() => navigate(`/mypage/workout/${session.id}`)} className="overflow-hidden rounded-spark-md bg-white text-left shadow-spark-card">
                  <WorkoutMapPreview compact route={session.sport?.code === 'running' || session.mode === 'spark'} />
                  <div className="p-3">
                    <div className="flex justify-between gap-1"><strong className="truncate text-xs">{session.sport?.name ?? '운동'}</strong><span className="rounded-full border border-gray-200 px-1.5 text-[8px]">{session.mode === 'spark' ? '번개' : '개인'}</span></div>
                    <p className="mt-1 text-[10px] text-spark-gray">{formatDate(session.started_at)}</p>
                  </div>
                </button>
              ))}
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  )
}

function TagSection({ title, items, purple, numbered }: { title: string; items: string[]; purple?: boolean; numbered?: boolean }) {
  return <section><h3 className="mb-3 text-sm text-spark-text-secondary">{title}</h3><div className="flex flex-wrap gap-2">{items.slice(0, 5).map((item, index) => <span key={`${item}-${index}`} className={`rounded-full px-4 py-2 text-xs font-bold ${purple ? 'bg-spark-soft-purple text-spark-purple' : 'bg-spark-muted text-spark-dark'}`}>{item}{numbered && <sup className="ml-1">{index + 1}</sup>}</span>)}</div></section>
}

function getSportName(id: string, sports: Sport[]) {
  return sports.find(item => item.id === id)?.name
    ?? MOCK_SPORTS.find(item => item.id === id)?.name
    ?? id.replace('선호운동:', '')
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

function SettingsIcon() {
  return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21h-4v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 00.3-1.9A1.7 1.7 0 003 14H3v-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5V3h4v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1h.1v4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
}
