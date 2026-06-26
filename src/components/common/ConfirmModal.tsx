interface ConfirmModalProps {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// 브라우저 기본 window.confirm() 대신 쓰는 인앱 확인 팝업.
// 데스크톱에서 window.confirm()은 모바일 앱처럼 보이는 화면에 OS 다이얼로그가 끼어드는 문제가 있다.
export function ConfirmModal({
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 px-6" onClick={onCancel}>
      <div className="spark-modal-panel w-full rounded-spark-xl bg-white p-6 text-center shadow-spark-floating" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-bold text-spark-dark">{title}</h2>
        {message && <p className="mt-2 text-sm leading-relaxed text-spark-text-secondary">{message}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="h-12 rounded-full bg-spark-muted text-sm font-bold text-spark-text-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`h-12 rounded-full text-sm font-bold ${danger ? 'bg-spark-error text-white' : 'bg-spark-lime text-spark-dark'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
