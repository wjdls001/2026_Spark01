import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
