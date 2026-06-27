// Phase 1: localStorage adapter
// Phase 2: Replace these with Supabase calls.
//   - getCharacters  → supabase.from('characters').select()
//   - saveCharacter  → supabase.from('characters').upsert(char)
//   - getSessions    → supabase.from('sessions').select()
//   - saveSession    → supabase.from('sessions').upsert(session)
// The Zustand store calls only these functions, so the swap is isolated here.

import type { Character, Session } from '../types'

const CHARACTERS_KEY = 'dnd_characters'
const SESSIONS_KEY = 'dnd_sessions'

export function getCharacters(): Character[] {
  try {
    return JSON.parse(localStorage.getItem(CHARACTERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCharacters(characters: Character[]): void {
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters))
}

export function getSessions(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}
