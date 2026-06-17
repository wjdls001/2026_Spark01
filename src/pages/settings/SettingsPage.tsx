import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

const ITEMS = [
  { icon: '👁', label: '프로필 공개', desc: '내 프로필 공개 범위 설정', to: '/mypage/settings/profile-visibility' },
  { icon: '🔗', label: '소셜 계정', desc: '연결된 소셜 로그인 관리', to: '/mypage/settings/social' },
  { icon: '📍', label: '위치 설정', desc: '활동 지역 관리', to: '/mypage/settings/location' },
  { icon: '⌚', label: '기기 연결', desc: '웨어러블 기기 연동', to: '/mypage/settings/device' },
  { icon: '❤️', label: '건강 앱 연결', desc: 'Apple 건강, Google Fit 연동', to: '/mypage/settings/health' },
  { icon: '📄', label: '약관 및 정책', desc: '이용약관, 개인정보처리방침', to: '/mypage/settings/terms' },
  { icon: '💬', label: '고객센터', desc: 'FAQ 및 문의하기', to: '/mypage/settings/help' },
]

export function SettingsPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)}>
          <svg className="h-6 w-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#111111]">설정</h1>
      </div>

      <div className="flex-1 bg-[#F5F5F5] px-5 py-5">
        <div className="flex flex-col gap-2 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 border-b border-gray-50 px-4 py-3.5 last:border-b-0"
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#111111]">{item.label}</div>
                <div className="text-xs text-[#AAAAAA]">{item.desc}</div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button onClick={handleLogout}
            className="w-full rounded-2xl bg-white px-4 py-3.5 text-left text-sm font-medium text-red-500 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            로그아웃
          </button>
          <Link to="/mypage/settings/delete-account"
            className="w-full rounded-2xl bg-white px-4 py-3.5 text-left text-sm text-[#AAAAAA] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            회원탈퇴
          </Link>
        </div>
      </div>
    </div>
  )
}
