import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { checkOnboardingCompleted } from '@/features/mypage/api'
import sparkLogo from '@/assets/spark-logo.png'

// TEST-ONLY: 실제 OAuth provider 설정 전까지 소셜 로그인 버튼이 즉시 로그인되도록 연결해둔 데모 계정.
const DEMO_OAUTH_ACCOUNTS: Record<'apple' | 'google' | 'kakao', { email: string; password: string }> = {
  apple: { email: 'demo.runner@spark.local', password: 'demo-password-not-for-login' },
  google: { email: 'demo.fitness@spark.local', password: 'demo-password-not-for-login' },
  kakao: { email: 'demo.cycling@spark.local', password: 'demo-password-not-for-login' },
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [oauthError, setOauthError] = useState('')

  // TEST-ONLY: Apple/Google/Kakao 실제 OAuth는 Supabase Auth Provider 설정(개발자 콘솔 Client ID·Secret 등록)이
  // 필요해 아직 연결되지 않았다. 테스트 빌드에서는 버튼 클릭 시 provider별 데모 계정으로 즉시 로그인 처리한다.
  // 실 자격증명이 준비되면 supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })로 교체할 것.
  async function handleOAuthLogin(provider: 'apple' | 'google' | 'kakao') {
    setOauthError('')
    setLoading(true)
    const demo = DEMO_OAUTH_ACCOUNTS[provider]
    const { error: err } = await supabase.auth.signInWithPassword(demo)
    if (err) {
      setOauthError('소셜 로그인 테스트 계정 연결에 실패했어요.')
      setLoading(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { completed } = await checkOnboardingCompleted(user.id)
      navigate(completed ? '/home' : '/onboarding/terms', { replace: true })
    }
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (password !== confirm) { setError('비밀번호가 일치하지 않아요.'); return }
      if (password.length < 6) { setError('비밀번호는 6자 이상이어야 해요.'); return }
      setLoading(true)
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message.includes('already') ? '이미 사용 중인 이메일이에요.' : '회원가입에 실패했어요.')
      } else {
        navigate('/onboarding/terms', { replace: true })
      }
      setLoading(false)
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { completed } = await checkOnboardingCompleted(user.id)
      navigate(completed ? '/home' : '/onboarding/terms', { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* 상단 브랜드 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-16 pb-8">
        {/* 로고 */}
        <img src={sparkLogo} alt="SPARK" className="mb-2 h-20 w-[71px] object-contain drop-shadow-lg" />
        <h1 className="mt-4 text-3xl font-black text-spark-dark">SPARK</h1>
        <p className="mt-2 text-center text-sm text-spark-text-secondary leading-relaxed">
          운동의 시작<br />이웃과 함께 불씨를 키워보세요
        </p>

        <div className="mt-10 w-full max-w-xs">
          {!showEmailForm ? (
            <div className="flex flex-col gap-3">
              {/* Apple 로그인 */}
              <button
                onClick={() => handleOAuthLogin('apple')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-spark-dark py-3.5 text-sm font-bold text-white disabled:opacity-60"
              >
                <AppleIcon />
                Apple로 시작하기
              </button>

              {/* Google 로그인 */}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-3.5 text-sm font-bold text-spark-dark disabled:opacity-60"
              >
                <GoogleIcon />
                Google로 시작하기
              </button>

              {/* 카카오 로그인 */}
              <button
                onClick={() => handleOAuthLogin('kakao')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#FEE500] py-3.5 text-sm font-bold text-spark-dark disabled:opacity-60"
              >
                <KakaoIcon />
                카카오로 시작하기
              </button>

              {oauthError && <p className="text-center text-xs text-red-500">{oauthError}</p>}

              <div className="relative my-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-spark-gray">또는</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* 이메일 로그인 */}
              <button
                onClick={() => setShowEmailForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-medium text-spark-text-secondary"
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
                className="mb-2 flex items-center gap-1 text-sm text-spark-text-secondary"
              >
                ← 뒤로
              </button>

              <div className="flex gap-1 rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-spark-dark shadow-sm' : 'text-spark-text-secondary'}`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-spark-dark shadow-sm' : 'text-spark-text-secondary'}`}
                >
                  회원가입
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-spark-text-secondary">이메일</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요" required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-spark-text-secondary">비밀번호</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '6자 이상 입력하세요' : '비밀번호를 입력하세요'} required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
                />
              </div>
              {mode === 'signup' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-spark-text-secondary">비밀번호 확인</label>
                  <input
                    type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="비밀번호를 한 번 더 입력하세요" required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
                  />
                </div>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark disabled:opacity-60"
              >
                {loading ? (mode === 'signup' ? '가입 중...' : '로그인 중...') : (mode === 'signup' ? '회원가입' : '로그인')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 하단 약관 */}
      <div className="px-8 pb-8 text-center text-[11px] text-spark-gray leading-relaxed">
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
      <path d="M9 1.5C4.86 1.5 1.5 4.14 1.5 7.38c0 2.1 1.38 3.93 3.48 4.98L4.2 15l3.3-2.16c.48.06.99.09 1.5.09 4.14 0 7.5-2.64 7.5-5.88S13.14 1.5 9 1.5z" fill="currentColor"/>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.87-3.06.87-2.36 0-4.36-1.6-5.08-3.74H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
      <path d="M3.92 10.69A5.4 5.4 0 013.64 9c0-.59.1-1.16.28-1.69V4.98H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.02l2.96-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.51.46 3.44 1.34l2.58-2.58A8.96 8.96 0 009 0 9 9 0 00.96 4.98l2.96 2.33C4.64 5.18 6.64 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
