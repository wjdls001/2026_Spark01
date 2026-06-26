export type MapPin = {
  id: string
  lat: number
  lng: number
  label?: string
  selected?: boolean
  onClick?: () => void
}

type Props = {
  center?: [number, number]
  zoom?: number
  pins?: MapPin[]
  className?: string
  myLocation?: [number, number]
  flyTo?: [number, number]
}

// 실제 지도 API 없이 "건물 단지" 느낌을 주기 위한 고정 배치 블록(임의 좌표, 데이터 아님).
const BUILDING_BLOCKS = [
  { left: '6%', top: '46%', w: '14%', h: '10%' },
  { left: '22%', top: '50%', w: '10%', h: '8%' },
  { left: '34%', top: '8%', w: '12%', h: '9%' },
  { left: '50%', top: '6%', w: '9%', h: '14%' },
  { left: '64%', top: '46%', w: '11%', h: '9%' },
  { left: '78%', top: '52%', w: '13%', h: '11%' },
  { left: '60%', top: '70%', w: '10%', h: '8%' },
  { left: '14%', top: '74%', w: '11%', h: '9%' },
  { left: '36%', top: '64%', w: '8%', h: '7%' },
  { left: '82%', top: '14%', w: '10%', h: '8%' },
]

// 위경도를 컨테이너 내부 %좌표로 변환하는 단순 투영(실제 지도 API 미사용, 시각적 mock 용도).
function project(lat: number, lng: number, center: [number, number], spanDeg: number) {
  const x = 50 + ((lng - center[1]) / spanDeg) * 100
  const y = 50 - ((lat - center[0]) / spanDeg) * 100
  return {
    left: `${Math.min(96, Math.max(4, x))}%`,
    top: `${Math.min(92, Math.max(8, y))}%`,
  }
}

export function MapView({
  center = [37.5283, 126.9342],
  zoom = 13,
  pins = [],
  className = '',
  myLocation,
  flyTo,
}: Props) {
  const effectiveCenter = flyTo ?? center
  // zoom이 클수록(상세 화면) 더 좁은 범위를 보여주도록 단순 스케일링.
  const spanDeg = (360 / 2 ** zoom) * 4

  // 부모(position:relative, 실제 크기를 가진 컨테이너)를 absolute로 꽉 채운다.
  // flex-grow로 크기가 정해지는 부모에 height:100%를 쓰면 일부 브라우저에서
  // 퍼센트 높이가 0으로 계산되는 문제가 있어 absolute inset-0로 우회한다.
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-[#EAE7DC] ${className}`}
    >
      {/* 임의의 지도 배경: 실제 지도 API 호출 없이 실제 지도와 비슷한 느낌(대지/도로/블록/공원/수면)만 CSS로 표현 */}
      {/* 큰 블록(건물 단지) 패턴 */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 58px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 58px)
          `,
          backgroundPosition: '6px 6px',
        }}
      />
      {/* 이면도로(작은 길) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 5px, transparent 5px, transparent 64px),
            repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 5px, transparent 5px, transparent 64px)
          `,
          opacity: 0.9,
        }}
      />
      {/* 큰길(간선도로) — 두 줄만 굵게 */}
      <div className="absolute left-0 right-0 top-[38%] h-3 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]" />
      <div className="absolute bottom-0 top-0 left-[46%] w-3 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]" />
      <div className="absolute left-0 right-0 top-[38%] h-3 bg-white/0" style={{ transform: 'rotate(0deg)' }} />
      <div
        className="absolute h-[3px] w-[140%] bg-white/80"
        style={{ left: '-20%', top: '64%', transform: 'rotate(-6deg)' }}
      />

      {/* 건물 블록 */}
      {BUILDING_BLOCKS.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-[2px] bg-[#DEDACD]"
          style={{ left: b.left, top: b.top, width: b.w, height: b.h }}
        />
      ))}

      {/* 공원(녹지) */}
      <div className="absolute left-[10%] top-[14%] h-20 w-28 rounded-[40%_60%_55%_45%] bg-[#C7DDB5]" />
      <div className="absolute left-[10%] top-[14%] h-20 w-28 rounded-[40%_60%_55%_45%] opacity-40" style={{ backgroundImage: 'radial-gradient(circle, #9FC489 0 2px, transparent 2px)', backgroundSize: '10px 10px' }} />

      {/* 수면(하천/호수) */}
      <div className="absolute right-[8%] top-[24%] h-16 w-16 rounded-[55%_45%_50%_50%] bg-[#AED4E8]" />
      <div
        className="absolute h-5 w-[60%] bg-[#AED4E8]"
        style={{ right: '4%', top: '36%', borderRadius: '999px', transform: 'rotate(8deg)' }}
      />

      {/* 작은 공원 블록 */}
      <div className="absolute bottom-[16%] left-[20%] h-10 w-16 rounded-[35%_65%_45%_55%] bg-[#C7DDB5]" />

      {myLocation && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={project(myLocation[0], myLocation[1], effectiveCenter, spanDeg)}
        >
          <div className="h-4 w-4 rounded-full border-[3px] border-white bg-spark-purple shadow-[0_0_0_4px_rgba(140,108,255,0.3)]" />
        </div>
      )}

      {pins.map(pin => {
        const pos = project(pin.lat, pin.lng, effectiveCenter, spanDeg)
        return (
          <button
            key={pin.id}
            onClick={e => { e.stopPropagation(); pin.onClick?.() }}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={pos}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-[50%_50%_50%_0] border-2 shadow-md ${
                pin.selected ? 'border-spark-dark bg-white' : 'border-white bg-spark-dark'
              }`}
              style={{ transform: 'rotate(-45deg)' }}
            >
              <span style={{ transform: 'rotate(45deg)', fontSize: '13px' }}>⚡</span>
            </div>
            {pin.label && (
              <span className="mt-1 block max-w-[120px] truncate rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-spark-dark" style={{ transform: 'translateX(-32%)' }}>
                {pin.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
