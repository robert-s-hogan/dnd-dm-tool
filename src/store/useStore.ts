import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Character, Session, SkillTrigger } from '../types'
import {
  getCharacters,
  saveCharacters,
  getSessions,
  saveSessions,
} from '../lib/storage'
import { pickSkillWithFallback } from '../lib/skillPicker'
import randomSkillsData from '../data/random_skills.json'

interface AppStore {
  characters: Character[]
  sessions: Session[]
  activeSessionId: string | null

  // Character actions
  addCharacter: (char: Omit<Character, 'id' | 'random_skills'>) => Character
  removeCharacter: (id: string) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  assignRandomSkill: (characterId: string, trigger: SkillTrigger) => void
  clearRandomSkills: (characterId: string) => void

  // Session actions
  createSession: (name: string) => Session
  setActiveSession: (id: string | null) => void
  addToSession: (sessionId: string, characterId: string) => void
  removeFromSession: (sessionId: string, characterId: string) => void
  deleteSession: (sessionId: string) => void

  // Derived helpers
  getActiveSession: () => Session | null
  getSessionCharacters: (sessionId: string) => Character[]

  // Phase 2: realtime sync will replace _persist with Supabase subscriptions
  _persist: () => void
}

export const useStore = create<AppStore>((set, get) => ({
  characters: getCharacters(),
  sessions: getSessions(),
  activeSessionId: null,

  addCharacter: (charData) => {
    const char: Character = { ...charData, id: uuidv4(), random_skills: [] }
    const characters = [...get().characters, char]
    set({ characters })
    saveCharacters(characters)
    return char
  },

  removeCharacter: (id) => {
    const characters = get().characters.filter((c) => c.id !== id)
    const sessions = get().sessions.map((s) => ({
      ...s,
      active_character_ids: s.active_character_ids.filter((cid) => cid !== id),
    }))
    set({ characters, sessions })
    saveCharacters(characters)
    saveSessions(sessions)
  },

  updateCharacter: (id, updates) => {
    const characters = get().characters.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    )
    set({ characters })
    saveCharacters(characters)
  },

  assignRandomSkill: (characterId, trigger) => {
    const char = get().characters.find((c) => c.id === characterId)
    if (!char) return

    const alreadyAssigned = char.random_skills.map((s) => s.skill_id)
    const skill = pickSkillWithFallback(
      randomSkillsData.skills as never,
      trigger,
      alreadyAssigned
    )
    if (!skill) return

    const assigned = {
      skill_id: skill.id,
      assigned_at: Date.now(),
      trigger,
    }
    get().updateCharacter(characterId, {
      random_skills: [...char.random_skills, assigned],
    })
  },

  clearRandomSkills: (characterId) => {
    get().updateCharacter(characterId, { random_skills: [] })
  },

  createSession: (name) => {
    const session: Session = {
      id: uuidv4(),
      name,
      active_character_ids: [],
      created_at: new Date().toISOString(),
    }
    const sessions = [...get().sessions, session]
    set({ sessions, activeSessionId: session.id })
    saveSessions(sessions)
    return session
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  addToSession: (sessionId, characterId) => {
    const sessions = get().sessions.map((s) =>
      s.id === sessionId && !s.active_character_ids.includes(characterId)
        ? { ...s, active_character_ids: [...s.active_character_ids, characterId] }
        : s
    )
    set({ sessions })
    saveSessions(sessions)
  },

  removeFromSession: (sessionId, characterId) => {
    const sessions = get().sessions.map((s) =>
      s.id === sessionId
        ? { ...s, active_character_ids: s.active_character_ids.filter((id) => id !== characterId) }
        : s
    )
    set({ sessions })
    saveSessions(sessions)
  },

  deleteSession: (sessionId) => {
    const sessions = get().sessions.filter((s) => s.id !== sessionId)
    const activeSessionId =
      get().activeSessionId === sessionId ? null : get().activeSessionId
    set({ sessions, activeSessionId })
    saveSessions(sessions)
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get()
    return sessions.find((s) => s.id === activeSessionId) ?? null
  },

  getSessionCharacters: (sessionId) => {
    const session = get().sessions.find((s) => s.id === sessionId)
    if (!session) return []
    return session.active_character_ids
      .map((id) => get().characters.find((c) => c.id === id))
      .filter(Boolean) as Character[]
  },

  _persist: () => {
    saveCharacters(get().characters)
    saveSessions(get().sessions)
  },
}))
