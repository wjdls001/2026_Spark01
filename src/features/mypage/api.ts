import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function fetchProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function createProfile(data: ProfileInsert) {
  return supabase.from('profiles').insert(data)
}

export async function updateProfile(userId: string, data: ProfileUpdate) {
  return supabase.from('profiles').update(data).eq('id', userId)
}

export async function checkProfileExists(userId: string) {
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).single()
  return !!data
}

export async function saveTermsAgreements(userId: string) {
  const terms = [
    { user_id: userId, terms_type: 'service', version: '1.0', agreed_at: new Date().toISOString() },
    { user_id: userId, terms_type: 'privacy', version: '1.0', agreed_at: new Date().toISOString() },
  ]
  return supabase.from('terms_agreements').upsert(terms, { onConflict: 'user_id,terms_type,version' })
}
