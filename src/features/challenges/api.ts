import { supabase } from '@/lib/supabase/client'

export async function fetchChallenges(type?: 'exercise' | 'spark' | 'event') {
  let query = supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (type) query = query.eq('challenge_type', type)
  return query
}

export async function fetchChallengeProgress(userId: string) {
  return supabase
    .from('challenge_progress')
    .select('*')
    .eq('user_id', userId)
}

export async function joinChallenge(challengeId: string, userId: string) {
  return supabase.from('challenge_progress').insert({
    challenge_id: challengeId,
    user_id: userId,
    current_count: 0,
  })
}
