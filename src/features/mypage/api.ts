import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function fetchProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function createProfile(data: ProfileInsert) {
  return supabase.from('profiles').upsert(data, { onConflict: 'id' })
}

export async function checkNicknameAvailability(nickname: string, currentUserId?: string) {
  let query = supabase.from('profiles').select('id').eq('nickname', nickname)
  if (currentUserId) query = query.neq('id', currentUserId)
  const { data, error } = await query.maybeSingle()
  return { available: !data && !error, error }
}

export async function updateProfile(userId: string, data: ProfileUpdate) {
  return supabase.from('profiles').update(data).eq('id', userId)
}

export async function checkProfileExists(userId: string) {
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).single()
  return !!data
}

export async function checkOnboardingCompleted(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('workout_traits')
    .eq('id', userId)
    .maybeSingle()

  if (error) return { completed: false, error }

  const traits = data?.workout_traits ?? []
  const requiredMarkers = ['운동목표:', '자주하는운동:', '주간빈도:', '평균운동시간:']
  return {
    completed: requiredMarkers.every(marker => traits.some(trait => trait.startsWith(marker))),
    error: null,
  }
}

export async function saveTermsAgreements(userId: string) {
  const terms = [
    { user_id: userId, terms_type: 'service', version: '1.0', agreed_at: new Date().toISOString() },
    { user_id: userId, terms_type: 'privacy', version: '1.0', agreed_at: new Date().toISOString() },
  ]
  return supabase.from('terms_agreements').upsert(terms, { onConflict: 'user_id,terms_type,version' })
}
