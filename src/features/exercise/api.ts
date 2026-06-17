import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ExerciseInsert = Database['public']['Tables']['exercise_sessions']['Insert']

export async function createExerciseSession(data: ExerciseInsert) {
  return supabase.from('exercise_sessions').insert(data).select().single()
}

export async function fetchExerciseSessions(userId: string, limit = 20) {
  return supabase
    .from('exercise_sessions')
    .select('*, sport:sports(code, name)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit)
}

export async function fetchRecentExerciseSessions(userId: string, limit = 5) {
  return supabase
    .from('exercise_sessions')
    .select('*, sport:sports(code, name)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit)
}

export async function fetchWeeklyExerciseSessions(userId: string) {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  return supabase
    .from('exercise_sessions')
    .select('id, duration_seconds, distance_meters, calories, started_at, sport:sports(code, name)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('started_at', weekStart.toISOString())
}

export async function fetchSports() {
  return supabase.from('sports').select('*').eq('is_active', true).order('name')
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
