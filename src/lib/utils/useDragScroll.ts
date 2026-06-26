import { useRef } from 'react'

// 모바일 터치는 기본 가로 스와이프로 스크롤되지만, 데스크톱 브라우저에서
// 마우스로는 휠 외에는 가로 스크롤 수단이 없다. 마우스 드래그로도
// 가로 스크롤 칩 목록을 넘겨볼 수 있게 해주는 핸들러.
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const state = useRef({ dragging: false, startX: 0, startScrollLeft: 0, moved: false })

  function onMouseDown(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    state.current = { dragging: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false }
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el || !state.current.dragging) return
    const delta = e.clientX - state.current.startX
    if (Math.abs(delta) > 3) state.current.moved = true
    el.scrollLeft = state.current.startScrollLeft - delta
  }

  function endDrag() {
    state.current.dragging = false
  }

  // 드래그로 살짝이라도 움직였다면 그 다음 클릭(버튼 onClick)은 무시해
  // 칩을 누르는 동작과 드래그 동작이 충돌하지 않게 한다.
  function onClickCapture(e: React.MouseEvent) {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    onClickCapture,
  }
}
