import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsSubpageHeader } from '@/components/common/SettingsSubpageHeader'
import { Toast } from '@/components/common/Toast'
import { useToast } from '@/lib/utils/useToast'

export function HelpNewPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()

  function handleSubmit() {
    if (!subject.trim() || !message.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }
    setError('')
    toast.show('문의가 접수되었어요. 빠르게 답변드릴게요!')
    setTimeout(() => navigate('/mypage/settings/help', { replace: true }), 900)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SettingsSubpageHeader title="문의하기" />
      <div className="flex-1 px-5 py-5">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">제목</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="문의 제목을 입력해주세요"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333333]">내용</label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              rows={6} placeholder="문의 내용을 자세히 적어주세요"
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-spark-purple focus:bg-white"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-spark-error">{error}</p>}
      </div>
      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleSubmit}
          className="w-full rounded-full bg-spark-lime py-4 text-base font-bold text-spark-dark"
        >
          문의 등록하기
        </button>
      </div>
      {toast.message && <Toast message={toast.message} onDone={toast.clear} />}
    </div>
  )
}
