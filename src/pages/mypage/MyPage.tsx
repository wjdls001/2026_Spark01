import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchWeeklyExerciseSessions, formatDuration } from '@/features/exercise/api'
import { fetchMyParticipations, fetchMySparks } from '@/features/sparks/api'
import { MOCK_USER_PROFILE, MOCK_SPORTS } from '@/lib/mockData'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase/client'

type Tab = 'profile' | 'workout' | 'activity'

export function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [weeklySeconds, setWeeklySeconds] = useState(0)
  const [joinedCount, setJoinedCount] = useState(0)
  const [hostedCount, setHostedCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id)
      .then(({ data }) => { if (data) setProfile(data) })
      .catch(() => {})
    fetchWeeklyExerciseSessions(user.id)
      .then(({ data }) => {
        const sessions = data as unknown as { duration_seconds: number | null }[] | null
        if (sessions) {
          setWeeklyCount(sessions.length)
          setWeeklySeconds(sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0))
        } else setWeeklyCount(MOCK_USER_PROFILE.weekly_count)
      })
      .catch(() => setWeeklyCount(MOCK_USER_PROFILE.weekly_count))
    fetchMyParticipations(user.id)
      .then(({ data }) => {
        const participations = data as unknown as { status: string }[] | null
        if (participations) setJoinedCount(participations.filter(p => p.status === 'approved' || p.status === 'attended').length)
      })
      .catch(() => {})
    fetchMySparks(user.id)
      .then(({ data }) => { if (data) setHostedCount(data.length) })
      .catch(() => {})
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const nickname = profile?.nickname ?? MOCK_USER_PROFILE.nickname
  const exerciseLevel = profile?.exercise_level ?? MOCK_USER_PROFILE.exercise_level
  const trustScore = profile?.trust_score ?? MOCK_USER_PROFILE.trust_score
  const activityArea = profile?.activity_area ?? MOCK_USER_PROFILE.activity_area
  const preferredSports = profile?.preferred_sports ?? MOCK_USER_PROFILE.preferred_sports
  const workoutTraits = profile?.workout_traits ?? MOCK_USER_PROFILE.workout_traits
  const xp = MOCK_USER_PROFILE.xp

  const levelLabel = (l: string) => {
    const map: Record<string, string> = { beginner: '초보자', intermediate: '중급자', advanced: '고급자', expert: '전문가' }
    return map[l] ?? l
  }

  const getSportName = (sportId: string) => {
    const sport = MOCK_SPORTS.find(s => s.id === sportId)
    return sport ? `${sport.emoji} ${sport.name}` : sportId
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* 프로필 상단 (공통 헤더) */}
      <div className="bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-5 pb-4 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111111]">마이페이지</h1>
          <Link to="/mypage/settings">
            <svg className="h-5 w-5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>

        {/* 프로필 카드 */}
        <div className="rounded-3xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEE8FF] text-2xl font-bold text-[#9B8FFF] shrink-0">
              {nickname[0]}
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-[#111111]">{nickname}</div>
              <div className="mt-0.5 text-sm text-[#777777]">
                {levelLabel(exerciseLevel)}{activityArea && ` · ${activityArea}`}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full bg-[#EEE8FF] px-2.5 py-0.5 text-xs font-medium text-[#9B8FFF]">
                  신뢰도 {trustScore}
                </span>
                <span className="rounded-full bg-[#FFF8D6] px-2.5 py-0.5 text-xs font-medium text-[#B8A020]">
                  {xp} XP
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-[#111111]">{weeklyCount}</div>
              <div className="text-xs text-[#999999]">이번 주 운동</div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-lg font-bold text-[#111111]">{joinedCount}</div>
              <div className="text-xs text-[#999999]">참여한 번개</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#111111]">{hostedCount}</div>
              <div className="text-xs text-[#999999]">개설한 번개</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3탭 */}
      <div className="flex border-b border-gray-100 bg-white">
        {([
          { key: 'profile', label: '프로필' },
          { key: 'workout', label: '운동 관리' },
          { key: 'activity', label: '활동 관리' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium ${tab === t.key ? 'border-b-2 border-[#9B8FFF] text-[#9B8FFF]' : 'text-[#999999]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 bg-[#F5F5F5] px-5 py-4">
        {tab === 'profile' && (
          <div className="flex flex-col gap-3">
            {/* 선호 운동/성향 태그 */}
            {preferredSports.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                {preferredSports.map(s => (
                  <span key={s} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-[#555555]">
                    {getSportName(s)}
                  </span>
                ))}
                {workoutTraits.slice(0, 3).map(t => (
                  <span key={t} className="rounded-full border border-[#9B8FFF]/30 bg-[#EEE8FF] px-3 py-1 text-xs text-[#9B8FFF]">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <MenuItem icon="✏️" label="프로필 편집" desc="닉네임·운동 취향 수정" to="/mypage/profile" />
            <MenuItem icon="⚙️" label="설정" desc="계정·알림·약관" to="/mypage/settings" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <span className="text-base">🚪</span>
              <span className="text-sm text-red-500 font-medium">로그아웃</span>
            </button>
          </div>
        )}

        {tab === 'workout' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-[#111111] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">이번 주 운동</h2>
                <Link to="/mypage/workout" className="text-xs text-[#C8FF3E]">전체보기</Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#2A2A2A] px-3 py-3 text-center">
                  <div className="text-xs text-[#AAAAAA]">운동 횟수</div>
                  <div className="mt-1 text-sm font-bold text-white">{weeklyCount}회</div>
                </div>
                <div className="rounded-xl bg-[#2A2A2A] px-3 py-3 text-center">
                  <div className="text-xs text-[#AAAAAA]">총 시간</div>
                  <div className="mt-1 text-sm font-bold text-white">{weeklySeconds > 0 ? formatDuration(weeklySeconds) : '-'}</div>
                </div>
              </div>
            </div>
            <MenuItem icon="📊" label="운동 기록" desc="전체 히스토리 및 통계" to="/mypage/workout" />
            <MenuItem icon="⚡" label="빠른 기록" desc="이미 완료한 운동 기록하기" to="/exercise" />
          </div>
        )}

        {tab === 'activity' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <div className="text-lg font-bold text-[#111111]">{joinedCount}</div>
                <div className="text-xs text-[#999999]">참여한 번개</div>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <div className="text-lg font-bold text-[#111111]">{hostedCount}</div>
                <div className="text-xs text-[#999999]">개설한 번개</div>
              </div>
            </div>
            <MenuItem icon="⚡" label="참여한 번개" desc="내가 참여한 모임" to="/mypage/activity" />
            <MenuItem icon="🏠" label="개설한 번개" desc="내가 만든 모임" to="/mypage/activity" />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({ icon, label, desc, to }: { icon: string; label: string; desc: string; to: string }) {
  return (
    <Link to={to}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <span className="text-xl shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-[#111111]">{label}</div>
        <div className="text-xs text-[#AAAAAA]">{desc}</div>
      </div>
      <svg className="h-4 w-4 shrink-0 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
