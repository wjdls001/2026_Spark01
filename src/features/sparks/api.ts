import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type SparkInsert = Database['public']['Tables']['sparks']['Insert']

export async function fetchSparks(filters?: { sport_id?: string; status?: string }) {
  let query = supabase
    .from('sparks')
    .select(`
      *,
      host:profiles!host_id(id, nickname, avatar_url, trust_score, exercise_level),
      sport:sports(id, code, name),
      participants:spark_participants(count)
    `)
    .order('scheduled_at', { ascending: true })

  if (filters?.sport_id) query = query.eq('sport_id', filters.sport_id)
  query = query.eq('status', (filters?.status ?? 'recruiting') as 'recruiting')

  return query
}

export async function fetchSparkById(sparkId: string) {
  return supabase
    .from('sparks')
    .select(`
      *,
      host:profiles!host_id(id, nickname, avatar_url, trust_score, exercise_level),
      sport:sports(id, code, name),
      participants:spark_participants(
        id, user_id, role, status, requested_at, approved_at,
        profile:profiles!user_id(id, nickname, avatar_url, exercise_level)
      )
    `)
    .eq('id', sparkId)
    .single()
}

export async function createSpark(data: SparkInsert) {
  return supabase.from('sparks').insert(data).select().single()
}

export async function updateSparkStatus(sparkId: string, status: Database['public']['Tables']['sparks']['Row']['status']) {
  return supabase.from('sparks').update({ status }).eq('id', sparkId)
}

export async function applyToSpark(sparkId: string, userId: string) {
  return supabase.from('spark_participants').insert({
    spark_id: sparkId,
    user_id: userId,
    role: 'member',
    status: 'requested',
  })
}

export async function updateParticipantStatus(
  participantId: string,
  status: Database['public']['Tables']['spark_participants']['Row']['status']
) {
  const updates: Record<string, unknown> = { status }
  if (status === 'approved') updates.approved_at = new Date().toISOString()
  if (status === 'canceled') updates.canceled_at = new Date().toISOString()
  return supabase.from('spark_participants').update(updates as Database['public']['Tables']['spark_participants']['Update']).eq('id', participantId)
}

export async function fetchMyParticipations(userId: string) {
  return supabase
    .from('spark_participants')
    .select(`
      *,
      spark:sparks(
        id, title, place_name, scheduled_at, status, duration_minutes,
        sport:sports(code, name),
        host:profiles!host_id(id, nickname, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
}

export async function fetchMySparks(userId: string) {
  return supabase
    .from('sparks')
    .select(`*, sport:sports(code, name), participants:spark_participants(count)`)
    .eq('host_id', userId)
    .order('created_at', { ascending: false })
}

export async function fetchSports() {
  return supabase.from('sports').select('*').eq('is_active', true).order('name')
}

export async function createSparkReview(data: {
  spark_id: string
  reviewer_id: string
  reviewee_id: string
  keywords: string[]
  review_type?: 'positive' | 'negative'
}) {
  return supabase.from('spark_reviews').insert({
    spark_id: data.spark_id,
    reviewer_id: data.reviewer_id,
    reviewee_id: data.reviewee_id,
    keywords: data.keywords,
    review_type: data.review_type ?? 'positive',
  })
}
