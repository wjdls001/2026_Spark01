import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
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
        <Route path="/onboarding/terms" element={<ProtectedRoute><OnboardingTermsPage /></ProtectedRoute>} />
        <Route path="/onboarding/phone" element={<ProtectedRoute><OnboardingPhonePage /></ProtectedRoute>} />
        <Route path="/onboarding/profile" element={<ProtectedRoute><OnboardingProfilePage /></ProtectedRoute>} />
        <Route path="/onboarding/result" element={<ProtectedRoute><OnboardingResultPage /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/exercise/solo/session" element={<ExerciseSessionPage />} />
          <Route path="/exercise/spark/session/:sparkId" element={<SparkExerciseSessionPage />} />
          <Route path="/sparks" element={<SparksPage />} />
          <Route path="/sparks/list" element={<SparksPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/profile" element={<MyProfilePage />} />
          <Route path="/mypage/workout" element={<MyExercisePage />} />
          <Route path="/mypage/activity" element={<MyActivityPage />} />
        </Route>

        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/exercise/solo/setup" element={<ProtectedRoute><ExerciseSetupPage /></ProtectedRoute>} />
        <Route path="/exercise/solo/routine" element={<ProtectedRoute><SoloRoutineLoadPage /></ProtectedRoute>} />
        <Route path="/exercise/result" element={<ProtectedRoute><ExerciseResultPage /></ProtectedRoute>} />
        <Route path="/exercise/spark/select" element={<ProtectedRoute><SparkExerciseSelectPage /></ProtectedRoute>} />
        <Route path="/exercise/spark/host-ready/:sparkId" element={<ProtectedRoute><SparkExerciseHostReadyPage /></ProtectedRoute>} />
        <Route path="/exercise/spark/member-ready/:sparkId" element={<ProtectedRoute><SparkExerciseMemberReadyPage /></ProtectedRoute>} />
        <Route path="/sparks/new" element={<ProtectedRoute><SparkNewPage /></ProtectedRoute>} />
        <Route path="/sparks/new/confirm" element={<ProtectedRoute><SparkNewConfirmPage /></ProtectedRoute>} />
        <Route path="/sparks/filter" element={<ProtectedRoute><SparkFilterPage /></ProtectedRoute>} />
        <Route path="/sparks/:sparkId" element={<ProtectedRoute><SparkDetailPage /></ProtectedRoute>} />
        <Route path="/sparks/:sparkId/manage" element={<ProtectedRoute><SparkManagePage /></ProtectedRoute>} />
        <Route path="/sparks/:sparkId/review" element={<ProtectedRoute><SparkReviewPage /></ProtectedRoute>} />
        <Route path="/challenges/:challengeId" element={<ProtectedRoute><ChallengeDetailPage /></ProtectedRoute>} />
        <Route path="/mypage/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/profile-visibility" element={<ProtectedRoute><ProfileVisibilitySettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/social" element={<ProtectedRoute><SocialAccountSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/location" element={<ProtectedRoute><LocationSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/device" element={<ProtectedRoute><DeviceConnectionSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/health" element={<ProtectedRoute><HealthAppSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/terms" element={<ProtectedRoute><TermsSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/help" element={<ProtectedRoute><HelpSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/help/new" element={<ProtectedRoute><HelpNewPage /></ProtectedRoute>} />
        <Route path="/mypage/settings/delete-account" element={<ProtectedRoute><DeleteAccountSettingsPage /></ProtectedRoute>} />
        <Route path="/mypage/workout/:sessionId" element={<ProtectedRoute><ExerciseSessionDetailPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
