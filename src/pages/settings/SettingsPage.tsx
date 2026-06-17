import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/lib/supabase/client'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('정말 탈퇴하시겠어요? 모든 데이터가 삭제되며 복구할 수 없어요.')
    if (!confirmed) return
    alert('회원탈퇴는 고객센터를 통해 진행해주세요.')
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
        <div className="flex flex-col gap-3">
          {/* 계정 */}
          <SettingSection title="계정">
            <SettingItem label="이메일" value={user?.email ?? ''} />
            <SettingItem label="비밀번호 변경" onClick={() => alert('비밀번호 변경 이메일을 발송했어요.')} />
          </SettingSection>

          {/* 위치 */}
          <SettingSection title="위치">
            <SettingItem label="활동 지역 설정" onClick={() => navigate('/mypage/profile')} />
          </SettingSection>

          {/* 기기 연결 */}
          <SettingSection title="기기 연결">
            <SettingItem label="Apple Health" value="연결 안 됨" onClick={() => alert('추후 지원 예정이에요.')} />
            <SettingItem label="Google Fit" value="연결 안 됨" onClick={() => alert('추후 지원 예정이에요.')} />
            <SettingItem label="삼성 헬스" value="연결 안 됨" onClick={() => alert('추후 지원 예정이에요.')} />
          </SettingSection>

          {/* 알림 */}
          <SettingSection title="알림">
            <SettingToggle label="번개 신청 알림" defaultChecked />
            <SettingToggle label="마케팅 알림" defaultChecked={false} />
          </SettingSection>

          {/* 약관 */}
          <SettingSection title="약관 및 정책">
            <SettingItem label="서비스 이용약관" onClick={() => alert('서비스 이용약관')} />
            <SettingItem label="개인정보처리방침" onClick={() => alert('개인정보처리방침')} />
          </SettingSection>

          {/* 고객센터 */}
          <SettingSection title="고객센터">
            <SettingItem label="자주 묻는 질문" onClick={() => alert('FAQ 준비 중이에요.')} />
            <SettingItem label="문의하기" onClick={() => alert('spark@example.com으로 문의해주세요.')} />
            <SettingItem label="앱 버전" value="0.1.0" />
          </SettingSection>

          {/* 로그아웃/탈퇴 */}
          <div className="flex flex-col gap-2">
            <button onClick={handleLogout}
              className="w-full rounded-2xl bg-white px-4 py-3.5 text-left text-sm font-medium text-red-500 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              로그아웃
            </button>
            <button onClick={handleDeleteAccount}
              className="w-full rounded-2xl bg-white px-4 py-3.5 text-left text-sm text-[#AAAAAA] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              회원탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-xs font-bold text-[#999999]">{title}</h2>
      <div className="flex flex-col gap-0 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {children}
      </div>
    </div>
  )
}

function SettingItem({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${onClick ? '' : 'cursor-default'}`}
    >
      <span className="text-sm text-[#111111]">{label}</span>
      <div className="flex items-center gap-1">
        {value && <span className="text-xs text-[#AAAAAA]">{value}</span>}
        {onClick && (
          <svg className="h-4 w-4 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  )
}

function SettingToggle({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between px-4 py-3.5">
      <span className="text-sm text-[#111111]">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-10 cursor-pointer accent-[#9B8FFF]" />
    </label>
  )
}
