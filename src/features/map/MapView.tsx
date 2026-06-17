export type MapPin = {
  id: string
  lat: number
  lng: number
  label?: string
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
      className={`absolute inset-0 overflow-hidden bg-[#E4ECE0] ${className}`}
    >
      {/* 임의의 지도 배경: 실제 지도 API 호출 없이 도로/구획 느낌만 표현 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 2px, transparent 2px, transparent 64px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 2px, transparent 2px, transparent 64px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 16px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 16px)
          `,
        }}
      />
      <div className="absolute left-[12%] top-[18%] h-16 w-24 rounded-md bg-[#CFE3C8]" />
      <div className="absolute right-[15%] top-[28%] h-12 w-12 rounded-full bg-[#C9E6F2]" />
      <div className="absolute bottom-[20%] left-[22%] h-10 w-20 rounded-md bg-[#D9D2EE]" />

      {myLocation && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={project(myLocation[0], myLocation[1], effectiveCenter, spanDeg)}
        >
          <div className="h-4 w-4 rounded-full border-[3px] border-white bg-[#9B8FFF] shadow-[0_0_0_4px_rgba(155,143,255,0.3)]" />
        </div>
      )}

      {pins.map(pin => {
        const pos = project(pin.lat, pin.lng, effectiveCenter, spanDeg)
        return (
          <button
            key={pin.id}
            onClick={pin.onClick}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={pos}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-[50%_50%_50%_0] border-2 border-[#111] shadow-md"
              style={{ background: '#C8FF3E', transform: 'rotate(-45deg)' }}
            >
              <span style={{ transform: 'rotate(45deg)', fontSize: '13px' }}>⚡</span>
            </div>
            {pin.label && (
              <span className="mt-1 block max-w-[120px] truncate rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-[#333]" style={{ transform: 'translateX(-32%)' }}>
                {pin.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
