import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'

export function AppLayout() {
  return (
    <div className="spark-page-background flex min-h-dvh flex-col">
      <main className="flex-1 pb-[72px]">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
