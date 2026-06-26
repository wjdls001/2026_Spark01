import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { checkOnboardingCompleted } from '@/features/mypage/api'
import { AppLayout } from '@/components/layout/AppLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { OnboardingTermsPage } from '@/pages/auth/OnboardingTermsPage'
import { OnboardingPhonePage } from '@/pages/auth/OnboardingPhonePage'
import { OnboardingProfilePage } from '@/pages/auth/OnboardingProfilePage'
import { OnboardingResultPage } from '@/pages/auth/OnboardingResultPage'

import { HomePage } from '@/pages/home/HomePage'
import { NotificationsPage } from '@/pages/home/NotificationsPage'
import { ExercisePage } from '@/pages/exercise/ExercisePage'
import { ExerciseSetupPage } from '@/pages/exercise/ExerciseSetupPage'
import { SoloRoutineLoadPage } from '@/pages/exercise/SoloRoutineLoadPage'
import { ExerciseSessionPage } from '@/pages/exercise/ExerciseSessionPage'
import { ExerciseResultPage } from '@/pages/exercise/ExerciseResultPage'
import { SparkExerciseSelectPage } from '@/pages/exercise/SparkExerciseSelectPage'
import { SparkExerciseHostReadyPage } from '@/pages/exercise/SparkExerciseHostReadyPage'
import { SparkExerciseMemberReadyPage } from '@/pages/exercise/SparkExerciseMemberReadyPage'
import { SparkExerciseSessionPage } from '@/pages/exercise/SparkExerciseSessionPage'

import { SparksPage } from '@/pages/sparks/SparksPage'
import { SparkDetailPage } from '@/pages/sparks/SparkDetailPage'
import { SparkNewPage } from '@/pages/sparks/SparkNewPage'
import { SparkNewConfirmPage } from '@/pages/sparks/SparkNewConfirmPage'
import { SparkFilterPage } from '@/pages/sparks/SparkFilterPage'
import { SparkReviewPage } from '@/pages/sparks/SparkReviewPage'
import { SparkManagePage } from '@/pages/sparks/SparkManagePage'

import { ChallengesPage } from '@/pages/challenges/ChallengesPage'
import { ChallengeDetailPage } from '@/pages/challenges/ChallengeDetailPage'
import { MyPage } from '@/pages/mypage/MyPage'
import { MyProfilePage } from '@/pages/mypage/MyProfilePage'
import { MyExercisePage } from '@/pages/mypage/MyExercisePage'
import { ExerciseSessionDetailPage } from '@/pages/mypage/ExerciseSessionDetailPage'
import { MyActivityPage } from '@/pages/mypage/MyActivityPage'
import { UserProfilePage } from '@/pages/mypage/UserProfilePage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProfileVisibilitySettingsPage } from '@/pages/settings/ProfileVisibilitySettingsPage'
import { SocialAccountSettingsPage } from '@/pages/settings/SocialAccountSettingsPage'
import { LocationSettingsPage } from '@/pages/settings/LocationSettingsPage'
import { DeviceConnectionSettingsPage } from '@/pages/settings/DeviceConnectionSettingsPage'
import { HealthAppSettingsPage } from '@/pages/settings/HealthAppSettingsPage'
import { TermsSettingsPage } from '@/pages/settings/TermsSettingsPage'
import { HelpSettingsPage } from '@/pages/settings/HelpSettingsPage'
import { HelpNewPage } from '@/pages/settings/HelpNewPage'
import { DeleteAccountSettingsPage } from '@/pages/settings/DeleteAccountSettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-lime border-t-transparent" /></div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

// 세션은 있지만 사용자 조사(workout_traits 마커 4종)가 끝나지 않은 경우 온보딩으로 보낸다.
// /onboarding/* 페이지 자체는 이 가드를 쓰지 않는다 — 그 페이지들에 적용하면 단계 중간에
// 자기 자신으로 리다이렉트되어 진행 중인 온보딩 플로우가 끊긴다.
function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const [onboarded, setOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    if (!session) {
      setOnboarded(null)
      return
    }
    checkOnboardingCompleted(session.user.id).then(({ completed }) => setOnboarded(completed))
  }, [session])

  if (loading || (session && onboarded === null)) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-lime border-t-transparent" /></div>
  if (!session) return <Navigate to="/login" replace />
  if (!onboarded) return <Navigate to="/onboarding/terms" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const [destination, setDestination] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      setDestination(null)
      return
    }
    checkOnboardingCompleted(session.user.id).then(({ completed }) => {
      setDestination(completed ? '/home' : '/onboarding/terms')
    })
  }, [session])

  if (loading || (session && !destination)) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-spark-lime border-t-transparent" /></div>
  if (session && destination) return <Navigate to={destination} replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/onboarding/terms" element={<ProtectedRoute><OnboardingTermsPage /></ProtectedRoute>} />
        <Route path="/onboarding/phone" element={<ProtectedRoute><OnboardingPhonePage /></ProtectedRoute>} />
        <Route path="/onboarding/profile" element={<ProtectedRoute><OnboardingProfilePage /></ProtectedRoute>} />
        <Route path="/onboarding/result" element={<ProtectedRoute><OnboardingResultPage /></ProtectedRoute>} />

        <Route element={<RequireOnboarded><AppLayout /></RequireOnboarded>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/exercise/solo/session" element={<ExerciseSessionPage />} />
          <Route path="/exercise/spark/session/:sparkId" element={<SparkExerciseSessionPage />} />
          <Route path="/exercise/result" element={<ExerciseResultPage />} />
          <Route path="/sparks" element={<SparksPage />} />
          <Route path="/sparks/list" element={<SparksPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/profile" element={<MyProfilePage />} />
          <Route path="/mypage/workout" element={<MyExercisePage />} />
          <Route path="/mypage/activity" element={<MyActivityPage />} />
        </Route>

        <Route path="/notifications" element={<RequireOnboarded><NotificationsPage /></RequireOnboarded>} />
        <Route path="/exercise/solo/setup" element={<RequireOnboarded><ExerciseSetupPage /></RequireOnboarded>} />
        <Route path="/exercise/solo/routine" element={<RequireOnboarded><SoloRoutineLoadPage /></RequireOnboarded>} />
        <Route path="/exercise/spark/select" element={<RequireOnboarded><SparkExerciseSelectPage /></RequireOnboarded>} />
        <Route path="/exercise/spark/host-ready/:sparkId" element={<RequireOnboarded><SparkExerciseHostReadyPage /></RequireOnboarded>} />
        <Route path="/exercise/spark/member-ready/:sparkId" element={<RequireOnboarded><SparkExerciseMemberReadyPage /></RequireOnboarded>} />
        <Route path="/sparks/new" element={<RequireOnboarded><SparkNewPage /></RequireOnboarded>} />
        <Route path="/sparks/new/confirm" element={<RequireOnboarded><SparkNewConfirmPage /></RequireOnboarded>} />
        <Route path="/sparks/filter" element={<RequireOnboarded><SparkFilterPage /></RequireOnboarded>} />
        <Route path="/sparks/:sparkId" element={<RequireOnboarded><SparkDetailPage /></RequireOnboarded>} />
        <Route path="/sparks/:sparkId/manage" element={<RequireOnboarded><SparkManagePage /></RequireOnboarded>} />
        <Route path="/sparks/:sparkId/review" element={<RequireOnboarded><SparkReviewPage /></RequireOnboarded>} />
        <Route path="/users/:userId" element={<RequireOnboarded><UserProfilePage /></RequireOnboarded>} />
        <Route path="/challenges/:challengeId" element={<RequireOnboarded><ChallengeDetailPage /></RequireOnboarded>} />
        <Route path="/mypage/settings" element={<RequireOnboarded><SettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/profile-visibility" element={<RequireOnboarded><ProfileVisibilitySettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/social" element={<RequireOnboarded><SocialAccountSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/location" element={<RequireOnboarded><LocationSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/device" element={<RequireOnboarded><DeviceConnectionSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/health" element={<RequireOnboarded><HealthAppSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/terms" element={<RequireOnboarded><TermsSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/help" element={<RequireOnboarded><HelpSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/help/new" element={<RequireOnboarded><HelpNewPage /></RequireOnboarded>} />
        <Route path="/mypage/settings/delete-account" element={<RequireOnboarded><DeleteAccountSettingsPage /></RequireOnboarded>} />
        <Route path="/mypage/workout/:sessionId" element={<RequireOnboarded><ExerciseSessionDetailPage /></RequireOnboarded>} />
      </Routes>
    </BrowserRouter>
  )
}
