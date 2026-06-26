import { useCallback, useState } from 'react'

// window.alert() 대신 인앱 Toast를 띄우기 위한 작은 상태 훅.
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const show = useCallback((msg: string) => setMessage(msg), [])
  const clear = useCallback(() => setMessage(null), [])
  return { message, show, clear }
}
