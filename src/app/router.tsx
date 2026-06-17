import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { OnboardingTermsPage } from '@/pages/auth/OnboardingTermsPage'
import { OnboardingProfilePage } from '@/pages/auth/OnboardingProfilePage'

import { HomePage } from '@/pages/home/HomePage'
import { ExercisePage } from '@/pages/exercise/ExercisePage'
import { ExerciseSetupPage } from '@/pages/exercise/ExerciseSetupPage'
import { ExerciseSessionPage } from '@/pages/exercise/ExerciseSessionPage'
import { ExerciseResultPage } from '@/pages/exercise/ExerciseResultPage'

import { SparksPage } from '@/pages/sparks/SparksPage'
import { SparkDetailPage } from '@/pages/sparks/SparkDetailPage'
import { SparkNewPage } from '@/pages/sparks/SparkNewPage'
import { SparkManagePage } from '@/pages/sparks/SparkManagePage'

import { ChallengesPage } from '@/pages/challenges/ChallengesPage'
import { MyPage } from '@/pages/mypage/MyPage'
import { MyProfilePage } from '@/pages/mypage/MyProfilePage'
import { MyExercisePage } from '@/pages/mypage/MyExercisePage'
import { MyActivityPage } from '@/pages/mypage/MyActivityPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8FF3E] border-t-transparent" /></div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8FF3E] border-t-transparent" /></div>
  if (session) return <Navigate to="/home" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/onboarding/terms" element={<ProtectedRoute><OnboardingTermsPage /></ProtectedRoute>} />
        <Route path="/onboarding/profile" element={<ProtectedRoute><OnboardingProfilePage /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/sparks" element={<SparksPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/profile" element={<MyProfilePage />} />
          <Route path="/mypage/exercise" element={<MyExercisePage />} />
          <Route path="/mypage/activity" element={<MyActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/exercise/setup" element={<ProtectedRoute><ExerciseSetupPage /></ProtectedRoute>} />
        <Route path="/exercise/session" element={<ProtectedRoute><ExerciseSessionPage /></ProtectedRoute>} />
        <Route path="/exercise/result" element={<ProtectedRoute><ExerciseResultPage /></ProtectedRoute>} />
        <Route path="/sparks/new" element={<ProtectedRoute><SparkNewPage /></ProtectedRoute>} />
        <Route path="/sparks/:sparkId" element={<ProtectedRoute><SparkDetailPage /></ProtectedRoute>} />
        <Route path="/sparks/:sparkId/manage" element={<ProtectedRoute><SparkManagePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
