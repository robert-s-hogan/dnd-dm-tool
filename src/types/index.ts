export interface CharacterStats {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface Ability {
  name: string
  description: string
  stamina_cost: number
}

export interface AbilityCategory {
  name: string
  flavor: string
  xp: { current: number; max: number }
  abilities: Ability[]
}

export type SkillTrigger = 'failure' | 'session_start' | 'random'
export type SkillTag = 'combat' | 'exploration' | 'social' | 'mixed'
export type SkillSentiment = 'positive' | 'negative' | 'mixed'

export interface RandomSkill {
  id: string
  name: string
  flavor: string
  trigger: SkillTrigger
  effect: string
  tags: SkillTag[]
  sentiment: SkillSentiment
}

export interface AssignedSkill {
  skill_id: string
  assigned_at: number
  trigger: SkillTrigger
}

export interface Character {
  id: string
  name: string
  class: string
  level: number
  background: string
  stats: CharacterStats
  armor_class: number
  hit_points: { max: number; current: number }
  stamina: { max: number; current: number }
  ability_categories: AbilityCategory[]
  random_skills: AssignedSkill[]
  image_url?: string
}

export interface Session {
  id: string
  name: string
  active_character_ids: string[]
  created_at: string
}

// ── Phase 2: Supabase realtime payload shape ──────────────────────────────────
// When multiplayer lands, the store will emit these events over a Supabase
// Realtime channel. Shape them here now so the migration is a find-replace.
// export interface RealtimeEvent {
//   type: 'CHARACTER_UPDATE' | 'SESSION_UPDATE' | 'SKILL_ASSIGNED' | 'MAP_UPDATE'
//   payload: unknown
//   sender_id: string
//   timestamp: number
// }

// ── Phase 3: Map entity types (React Konva) ───────────────────────────────────
// export type MapEntityKind = 'enemy' | 'item' | 'landmark' | 'trap' | 'player'
// export interface MapEntity {
//   id: string
//   kind: MapEntityKind
//   label: string
//   x: number
//   y: number
//   visible_to_players: boolean
//   metadata?: Record<string, unknown>
// }
// export interface GameMap {
//   id: string
//   name: string
//   width: number
//   height: number
//   background_url?: string
//   entities: MapEntity[]
// }
