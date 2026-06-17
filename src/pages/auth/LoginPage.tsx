import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
      navigate(profile ? '/home' : '/onboarding/terms', { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* 상단 브랜드 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-16 pb-8">
        {/* 로고 */}
        <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#C8FF3E] shadow-lg">
          <span className="text-4xl">⚡</span>
        </div>
        <h1 className="mt-4 text-3xl font-black text-[#111111]">SPARK</h1>
        <p className="mt-2 text-center text-sm text-[#777777] leading-relaxed">
          운동의 시작<br />이웃과 함께 불씨를 키워보세요
        </p>

        <div className="mt-10 w-full max-w-xs">
          {!showEmailForm ? (
            <div className="flex flex-col gap-3">
              {/* 카카오 로그인 */}
              <button className="flex w-full items-center justify-center gap-3 rounded-full bg-[#FEE500] py-3.5 text-sm font-bold text-[#111111]">
                <KakaoIcon />
                카카오로 시작하기
              </button>

              {/* Apple 로그인 */}
              <button className="flex w-full items-center justify-center gap-3 rounded-full bg-[#111111] py-3.5 text-sm font-bold text-white">
                <AppleIcon />
                Apple로 시작하기
              </button>

              {/* 네이버 로그인 */}
              <button className="flex w-full items-center justify-center gap-3 rounded-full bg-[#03C75A] py-3.5 text-sm font-bold text-white">
                <NaverIcon />
                네이버로 시작하기
              </button>

              <div className="relative my-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-[#999999]">또는</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* 이메일 로그인 */}
              <button
                onClick={() => setShowEmailForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-medium text-[#555555]"
              >
                <span>✉️</span>
                이메일로 로그인
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="mb-2 flex items-center gap-1 text-sm text-[#777777]"
              >
                ← 뒤로
              </button>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#555555]">이메일</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요" required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#555555]">비밀번호</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요" required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#9B8FFF] focus:bg-white"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-[#999999]">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="font-bold text-[#9B8FFF]">회원가입</Link>
          </p>
        </div>
      </div>

      {/* 하단 약관 */}
      <div className="px-8 pb-8 text-center text-[11px] text-[#BBBBBB] leading-relaxed">
        로그인 시 SPARK의{' '}
        <span className="underline">이용약관</span>과{' '}
        <span className="underline">개인정보 처리방침</span>에<br />
        동의하게 됩니다.
      </div>
    </div>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5C4.86 1.5 1.5 4.14 1.5 7.38c0 2.1 1.38 3.93 3.48 4.98L4.2 15l3.3-2.16c.48.06.99.09 1.5.09 4.14 0 7.5-2.64 7.5-5.88S13.14 1.5 9 1.5z" fill="#111111"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M14.18 9.57c0-2.35 1.92-3.48 2.01-3.54-1.1-1.6-2.8-1.82-3.4-1.84-1.45-.15-2.83.85-3.57.85-.73 0-1.87-.83-3.07-.81-1.58.02-3.04.92-3.85 2.33-1.64 2.84-.42 7.06 1.17 9.37.78 1.13 1.71 2.39 2.93 2.35 1.18-.05 1.62-.76 3.05-.76s1.83.76 3.07.74c1.26-.02 2.07-1.15 2.84-2.29.9-1.31 1.27-2.59 1.28-2.65-.03-.01-2.46-.95-2.46-3.75z" fill="white"/>
      <path d="M11.77 3.83c.65-.79 1.09-1.88.97-2.97-.93.04-2.07.62-2.74 1.4-.6.69-1.12 1.8-.98 2.87.1.01 2.09-.53 2.75-1.3z" fill="white"/>
    </svg>
  )
}

function NaverIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M10.2 9.54L7.68 6H6v6h1.8V8.46L10.32 12H12V6h-1.8v3.54z" fill="white"/>
    </svg>
  )
}
