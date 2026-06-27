// Phase 2: Supabase adapter
// Each character/session is stored as { id, data: <rest of object> }.
// The store calls these functions exclusively — no Supabase imports elsewhere.
//
// Phase 3 note: when multiplayer lands, replace these with Supabase Realtime
// subscriptions so mutations broadcast to all connected clients automatically.

import { supabase } from './supabase'
import type { Character, Session } from '../types'

// ── Characters ────────────────────────────────────────────────────────────────

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase.from('characters').select('id, data').order('created_at')
  if (error) throw error
  return data.map((row) => ({ id: row.id, ...row.data } as Character))
}

export async function upsertCharacter(char: Character): Promise<void> {
  const { id, ...data } = char
  const { error } = await supabase.from('characters').upsert({ id, data })
  if (error) throw error
}

export async function deleteCharacterById(id: string): Promise<void> {
  const { error } = await supabase.from('characters').delete().eq('id', id)
  if (error) throw error
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase.from('sessions').select('id, data').order('created_at')
  if (error) throw error
  return data.map((row) => ({ id: row.id, ...row.data } as Session))
}

export async function upsertSession(session: Session): Promise<void> {
  const { id, ...data } = session
  const { error } = await supabase.from('sessions').upsert({ id, data })
  if (error) throw error
}

export async function deleteSessionById(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}
