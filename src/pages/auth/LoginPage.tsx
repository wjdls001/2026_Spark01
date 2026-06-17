import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
    } else {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', (await supabase.auth.getUser()).data.user!.id).single()
      navigate(profile ? '/home' : '/onboarding/terms', { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-6">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10">
          <div className="mb-2 text-3xl font-bold text-[#111111]">⚡ SPARK</div>
          <p className="text-sm text-[#555555]">이웃과 함께 운동을 시작할 불씨를 키워볼까요?</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]">이메일</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요" required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]">비밀번호</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요" required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#555555]">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-bold text-[#9B8FFF]">회원가입</Link>
        </p>
      </div>
    </div>
  )
}
