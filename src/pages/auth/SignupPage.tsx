import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
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
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6] px-6">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10">
          <div className="mb-2 text-3xl font-bold text-[#111111]">⚡ SPARK</div>
          <p className="text-sm text-[#555555]">새 계정을 만들어보세요</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]">이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일을 입력하세요" required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]">비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6자 이상 입력하세요" required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111111]">비밀번호 확인</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="비밀번호를 한 번 더 입력하세요" required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#9B8FFF]" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-full bg-[#C8FF3E] py-4 text-base font-bold text-[#111111] disabled:opacity-60">
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#555555]">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-bold text-[#9B8FFF]">로그인</Link>
        </p>
      </div>
    </div>
  )
}
