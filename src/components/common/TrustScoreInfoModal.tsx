interface TrustStats {
  exerciseCount: number
  sparkCount: number
  noShowCount: number
  mannerScore: number
}

// 신뢰도 BPM(하트) 탭 시 뜨는 설명 팝업 — 운동 횟수/모임 횟수/노쇼 횟수/모임 매너를 보여준다.
export function TrustScoreInfoModal({ score, stats, onClose }: { score: number; stats: TrustStats; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 px-6" onClick={onClose}>
      <div className="spark-modal-panel w-full rounded-spark-xl bg-white p-6 shadow-spark-floating" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl text-spark-error">♥</span>
          <span className="text-2xl font-bold text-spark-dark">{score} BPM</span>
        </div>
        <p className="mt-2 text-center text-sm text-spark-text-secondary">신뢰도는 운동 활동과 매너를 기반으로 계산돼요.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatBox label="운동 횟수" value={`${stats.exerciseCount}회`} />
          <StatBox label="참여 모임" value={`${stats.sparkCount}회`} />
          <StatBox label="노쇼 횟수" value={`${stats.noShowCount}회`} />
          <StatBox label="모임 매너" value={`${stats.mannerScore}점`} />
        </div>

        <button onClick={onClose} className="mt-6 h-12 w-full rounded-full bg-spark-lime text-sm font-bold text-spark-dark">
          확인
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-spark-muted p-3 text-center">
      <div className="text-xs text-spark-text-secondary">{label}</div>
      <div className="mt-1 text-base font-bold text-spark-dark">{value}</div>
    </div>
  )
}
