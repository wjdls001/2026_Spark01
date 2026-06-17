import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { fetchProfile } from '@/features/mypage/api'
import { fetchWeeklyExerciseSessions } from '@/features/exercise/api'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase/client'

export function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [weeklyCount, setWeeklyCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id).then(({ data }) => { if (data) setProfile(data) })
    fetchWeeklyExerciseSessions(user.id).then(({ data }) => { if (data) setWeeklyCount(data.length) })
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const levelLabel = (l: string) => {
    const map: Record<string, string> = { beginner: '초보자', intermediate: '중급자', advanced: '고급자', expert: '전문가' }
    return map[l] ?? l
  }

  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col">
      {/* 프로필 상단 */}
      <div className="bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-5 pb-6 pt-5">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111111]">마이페이지</h1>
          <Link to="/settings" className="p-1">
            <svg className="h-5 w-5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#EEE8FF] flex items-center justify-center text-2xl font-bold text-[#9B8FFF]">
            {profile?.nickname?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-[#111111]">{profile?.nickname ?? '-'}</div>
            <div className="mt-0.5 text-sm text-[#777777]">
              {profile ? levelLabel(profile.exercise_level) : '-'}
              {profile?.activity_area && ` · ${profile.activity_area}`}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-[#9B8FFF]">신뢰도 {profile?.trust_score ?? 50}</span>
              <span className="text-xs text-[#AAAAAA]">· 이번 주 {weeklyCount}회</span>
            </div>
          </div>
          <Link to="/mypage/profile"
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-[#333333]">
            편집
          </Link>
        </div>

        {/* 선호 운동 태그 */}
        {profile?.preferred_sports && profile.preferred_sports.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.preferred_sports.map(s => (
              <span key={s} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-[#555555]">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 메뉴 */}
      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <div className="flex flex-col gap-3">
          <MenuSection title="운동">
            <MenuItem icon="📊" label="운동 기록" to="/mypage/exercise" />
            <MenuItem icon="📈" label="운동 통계" to="/mypage/exercise" />
          </MenuSection>

          <MenuSection title="번개 모임">
            <MenuItem icon="⚡" label="활동 관리" to="/mypage/activity" />
          </MenuSection>

          <MenuSection title="계정">
            <MenuItem icon="⚙️" label="설정" to="/settings" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <span className="text-base">🚪</span>
              <span className="text-sm text-red-500">로그아웃</span>
            </button>
          </MenuSection>
        </div>
      </div>
    </div>
  )
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-xs font-bold text-[#999999]">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function MenuItem({ icon, label, to }: { icon: string; label: string; to: string }) {
  return (
    <Link to={to}
      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className="text-sm text-[#111111]">{label}</span>
      </div>
      <svg className="h-4 w-4 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
