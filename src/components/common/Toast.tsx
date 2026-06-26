import { useEffect } from 'react'

// 짧은 완료/성공 메시지를 화면 하단에 잠깐 띄운다("신청이 완료되었습니다" 등).
// window.alert() 대신 사용한다.
export function Toast({ message, onDone, duration = 1800 }: { message: string; onDone: () => void; duration?: number }) {
  useEffect(() => {
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [onDone, duration])

  return (
    <div className="fixed inset-x-0 bottom-24 z-[2100] flex justify-center px-6">
      <div className="flex items-center gap-2 rounded-full bg-spark-dark px-5 py-3 text-sm font-bold text-white shadow-spark-floating">
        <span className="text-spark-lime">✓</span>
        {message}
      </div>
    </div>
  )
}
