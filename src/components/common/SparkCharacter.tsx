import sparkCharacterImg from '@/assets/spark-character.png'

interface SparkCharacterProps {
  size?: 'sm' | 'md' | 'lg'
  mood?: 'active' | 'calm' | 'happy'
  /** 굵은 네온 테두리 색상. 모임장/내 프로필/참여 완료처럼 강조가 필요한 자리에 사용한다. */
  ring?: 'lime' | 'purple' | 'none'
  className?: string
}

// SPARK 마스코트 — 투명 배경으로 정리한 캐릭터 이미지 한 장을 모든 화면에서 원형으로 공유한다.
export function SparkCharacter({ size = 'md', ring = 'none', className = '' }: SparkCharacterProps) {
  const dimensions = { sm: 'h-10 w-10', md: 'h-20 w-20', lg: 'h-28 w-28' }
  const ringClass =
    ring === 'lime'
      ? 'ring-[3px] ring-spark-lime shadow-[0_0_10px_2px_rgba(209,255,76,0.65)]'
      : ring === 'purple'
        ? 'ring-[3px] ring-spark-purple shadow-[0_0_10px_2px_rgba(140,108,255,0.55)]'
        : 'ring-1 ring-black/5'

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-[2%] shadow-spark-card ${ringClass} ${dimensions[size]} ${className}`}>
      <img src={sparkCharacterImg} alt="SPARK 캐릭터" className="h-full w-full object-contain" />
    </div>
  )
}
