import { useState } from 'react'
import type { Character, RandomSkill, Ability, AbilityCategory } from '../types'
import { useStore } from '../store/useStore'
import { statModifier } from '../lib/dice'
import SkillBadge from './SkillBadge'
import randomSkillsData from '../data/random_skills.json'

interface Props {
  character: Character
  compact?: boolean
  onRemoveFromSession?: () => void
}

const STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

const emptyAbility = (): Ability => ({ name: '', description: '', stamina_cost: 0 })
const emptyCategory = (): Pick<AbilityCategory, 'name' | 'flavor'> => ({ name: '', flavor: '' })

export default function CharacterCard({ character, compact = false, onRemoveFromSession }: Props) {
  const { updateCharacter, assignRandomSkill } = useStore()

  const [editMode, setEditMode] = useState(false)
  const [addingAbilityFor, setAddingAbilityFor] = useState<number | null>(null)
  const [newAbility, setNewAbility] = useState(emptyAbility)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState(emptyCategory)

  // ── Play controls ──────────────────────────────────────────────────────────

  const setHP = (delta: number) => {
    const next = Math.min(character.hit_points.max, Math.max(0, character.hit_points.current + delta))
    updateCharacter(character.id, { hit_points: { ...character.hit_points, current: next } })
  }

  const toggleStamina = (index: number) => {
    const next = index < character.stamina.current ? index : index + 1
    updateCharacter(character.id, { stamina: { ...character.stamina, current: next } })
  }

  const cycleXP = (categoryIndex: number) => {
    const cats = character.ability_categories.map((cat, i) => {
      if (i !== categoryIndex) return cat
      const next = cat.xp.current < cat.xp.max ? cat.xp.current + 1 : 0
      return { ...cat, xp: { ...cat.xp, current: next } }
    })
    updateCharacter(character.id, { ability_categories: cats })
  }

  const removeRandomSkill = (skillId: string) => {
    updateCharacter(character.id, {
      random_skills: character.random_skills.filter((s) => s.skill_id !== skillId),
    })
  }

  // ── Edit controls ──────────────────────────────────────────────────────────

  const removeAbility = (catIndex: number, abilityName: string) => {
    const cats = character.ability_categories.map((cat, i) =>
      i === catIndex
        ? { ...cat, abilities: cat.abilities.filter((a) => a.name !== abilityName) }
        : cat
    )
    updateCharacter(character.id, { ability_categories: cats })
  }

  const removeCategory = (catIndex: number) => {
    updateCharacter(character.id, {
      ability_categories: character.ability_categories.filter((_, i) => i !== catIndex),
    })
  }

  const submitAbility = (catIndex: number) => {
    if (!newAbility.name.trim()) return
    const cats = character.ability_categories.map((cat, i) =>
      i === catIndex
        ? { ...cat, abilities: [...cat.abilities, { ...newAbility, name: newAbility.name.trim(), description: newAbility.description.trim() }] }
        : cat
    )
    updateCharacter(character.id, { ability_categories: cats })
    setNewAbility(emptyAbility())
    setAddingAbilityFor(null)
  }

  const submitCategory = () => {
    if (!newCategory.name.trim()) return
    const cat: AbilityCategory = {
      name: newCategory.name.trim(),
      flavor: newCategory.flavor.trim(),
      xp: { current: 0, max: 5 },
      abilities: [],
    }
    updateCharacter(character.id, {
      ability_categories: [...character.ability_categories, cat],
    })
    setNewCategory(emptyCategory())
    setAddingCategory(false)
  }

  const cancelAbility = () => {
    setNewAbility(emptyAbility())
    setAddingAbilityFor(null)
  }

  const cancelCategory = () => {
    setNewCategory(emptyCategory())
    setAddingCategory(false)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const hpPct = Math.round((character.hit_points.current / character.hit_points.max) * 100)
  const hpColor = hpPct > 60 ? 'bg-green-600' : hpPct > 25 ? 'bg-amber-500' : 'bg-red-600'

  return (
    <div className={`bg-stone-800 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all ${editMode ? 'border-2 border-amber-700' : 'border border-stone-700'}`}>

      {/* Header */}
      <div className="px-5 py-4 flex justify-between items-start" style={{ backgroundColor: '#3a4b20' }}>
        <div>
          <h2 className="text-xl font-bold text-stone-100 uppercase tracking-widest">
            {character.name}
          </h2>
          <p className="text-stone-400 text-sm italic">
            {character.class} — Lvl {character.level}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {!compact && (
            <button
              onClick={() => { setEditMode((e) => !e); setAddingAbilityFor(null); setAddingCategory(false) }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${editMode ? 'bg-amber-800 border-amber-600 text-amber-200' : 'bg-stone-800 border-stone-600 text-stone-400 hover:text-stone-200'}`}
              title={editMode ? 'Exit edit mode' : 'Edit skills'}
            >
              {editMode ? 'Done' : 'Edit'}
            </button>
          )}
          {onRemoveFromSession && (
            <button
              onClick={onRemoveFromSession}
              className="text-stone-500 hover:text-red-400 text-lg leading-none"
              title="Remove from session"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* HP bar */}
      <div className="h-1.5 w-full bg-stone-700">
        <div className={`h-full ${hpColor} transition-all duration-300`} style={{ width: `${hpPct}%` }} />
      </div>

      {/* Core stats row */}
      <div className="grid grid-cols-3 divide-x divide-stone-700 border-b border-stone-700 bg-stone-900">
        <div className="flex flex-col items-center py-3">
          <span className="text-xs font-bold uppercase text-stone-500">AC</span>
          <span className="text-2xl font-bold text-stone-100">{character.armor_class}</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-1">
          <span className="text-xs font-bold uppercase text-stone-500">HP</span>
          <span className="text-2xl font-bold text-stone-100">
            {character.hit_points.current}
            <span className="text-stone-500 text-base">/{character.hit_points.max}</span>
          </span>
          <div className="flex gap-1">
            <button onClick={() => setHP(-1)} className="text-xs px-2 py-0.5 bg-red-900 hover:bg-red-800 text-red-200 rounded">−1</button>
            <button onClick={() => setHP(1)} className="text-xs px-2 py-0.5 bg-green-900 hover:bg-green-800 text-green-200 rounded">+1</button>
          </div>
        </div>
        <div className="flex flex-col items-center py-3 gap-1">
          <span className="text-xs font-bold uppercase text-stone-500">Stamina</span>
          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: character.stamina.max }).map((_, i) => (
              <button
                key={i}
                onClick={() => toggleStamina(i)}
                className={`stamina-bubble ${i < character.stamina.current ? 'filled' : ''}`}
                title={`Stamina ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stat block */}
      <div className="grid grid-cols-6 text-center border-b border-stone-700 bg-stone-950">
        {STATS.map((stat) => (
          <div key={stat} className="py-2 border-r border-stone-800 last:border-r-0">
            <div className="text-[10px] font-bold uppercase text-stone-500">{stat}</div>
            <div className="text-base font-bold text-stone-100">{character.stats[stat]}</div>
            <div className="text-[10px] text-stone-500">{statModifier(character.stats[stat])}</div>
          </div>
        ))}
      </div>

      {/* Background */}
      {!compact && (
        <div className="px-4 py-3 border-b border-stone-700">
          <p className="text-[11px] font-bold uppercase text-stone-500 mb-1">Background</p>
          <p className="text-stone-400 text-xs italic leading-relaxed">"{character.background}"</p>
        </div>
      )}

      {/* Ability categories */}
      {!compact && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {character.ability_categories.map((cat, ci) => (
              <div
                key={`${cat.name}-${ci}`}
                className={`bg-stone-900 rounded-lg p-3 border transition-colors ${editMode ? 'border-amber-900' : 'border-stone-700'}`}
              >
                {/* Category header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-green-400 text-sm truncate">{cat.name}</h4>
                    <p className="text-[11px] text-stone-500 italic truncate">"{cat.flavor}"</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    {/* XP bubbles — hidden in edit mode to reduce clutter */}
                    {!editMode && (
                      <div
                        className="flex gap-0.5 flex-wrap justify-end cursor-pointer mt-0.5"
                        onClick={() => cycleXP(ci)}
                        title="Click to advance XP"
                      >
                        {Array.from({ length: cat.xp.max }).map((_, i) => (
                          <span key={i} className={`xp-bubble ${i < cat.xp.current ? 'filled' : ''}`} />
                        ))}
                      </div>
                    )}
                    {editMode && (
                      <button
                        onClick={() => removeCategory(ci)}
                        className="text-[11px] px-1.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 rounded transition-colors"
                        title="Remove category"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Abilities */}
                <div className="space-y-1.5">
                  {cat.abilities.map((ability) => (
                    <div key={ability.name} className="text-xs flex items-start gap-1.5 group">
                      <div className="flex-1">
                        <span className="font-semibold text-stone-200">{ability.name}: </span>
                        <span className="text-stone-400">{ability.description}</span>
                        {ability.stamina_cost > 0 && (
                          <span className="ml-1 text-amber-400 font-bold">[{ability.stamina_cost} ST]</span>
                        )}
                      </div>
                      {editMode && (
                        <button
                          onClick={() => removeAbility(ci, ability.name)}
                          className="text-stone-600 hover:text-red-400 leading-none mt-0.5 shrink-0 transition-colors"
                          title="Remove ability"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add ability — inline form */}
                {editMode && addingAbilityFor === ci ? (
                  <div className="mt-3 space-y-1.5 border-t border-stone-700 pt-3">
                    <input
                      autoFocus
                      placeholder="Ability name"
                      value={newAbility.name}
                      onChange={(e) => setNewAbility((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
                    />
                    <input
                      placeholder="Description"
                      value={newAbility.description}
                      onChange={(e) => setNewAbility((p) => ({ ...p, description: e.target.value }))}
                      className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-stone-500 whitespace-nowrap">ST cost</label>
                      <input
                        type="number"
                        min={0}
                        max={9}
                        value={newAbility.stamina_cost}
                        onChange={(e) => setNewAbility((p) => ({ ...p, stamina_cost: Number(e.target.value) }))}
                        className="w-14 bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => submitAbility(ci)}
                        disabled={!newAbility.name.trim()}
                        className="text-xs px-3 py-1 bg-green-900 hover:bg-green-800 border border-green-700 text-green-200 rounded-lg transition-colors disabled:opacity-40"
                      >
                        Add
                      </button>
                      <button
                        onClick={cancelAbility}
                        className="text-xs px-3 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-400 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : editMode ? (
                  <button
                    onClick={() => { setAddingAbilityFor(ci); setNewAbility(emptyAbility()) }}
                    className="mt-2 w-full text-xs py-1 border border-dashed border-stone-600 hover:border-amber-700 text-stone-600 hover:text-amber-500 rounded-lg transition-colors"
                  >
                    + Add ability
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Add category */}
          {editMode && (
            addingCategory ? (
              <div className="bg-stone-900 border border-amber-800 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">New Category</p>
                <input
                  autoFocus
                  placeholder="Category name (e.g. Shadow Arts)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
                />
                <input
                  placeholder="Flavor tagline (e.g. Darkness as a shield.)"
                  value={newCategory.flavor}
                  onChange={(e) => setNewCategory((p) => ({ ...p, flavor: e.target.value }))}
                  className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitCategory}
                    disabled={!newCategory.name.trim()}
                    className="text-xs px-3 py-1 bg-green-900 hover:bg-green-800 border border-green-700 text-green-200 rounded-lg transition-colors disabled:opacity-40"
                  >
                    Add Category
                  </button>
                  <button
                    onClick={cancelCategory}
                    className="text-xs px-3 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-400 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCategory(true)}
                className="w-full text-xs py-2 border border-dashed border-stone-600 hover:border-amber-700 text-stone-600 hover:text-amber-500 rounded-lg transition-colors"
              >
                + Add category
              </button>
            )
          )}
        </div>
      )}

      {/* Random skills */}
      {character.random_skills.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-[11px] font-bold uppercase text-stone-500 mb-2">Random Skills</p>
          <div className="flex flex-col gap-2">
            {character.random_skills.map((assigned) => {
              const skill = (randomSkillsData.skills as RandomSkill[]).find(
                (s) => s.id === assigned.skill_id
              )
              return skill ? (
                <SkillBadge
                  key={assigned.skill_id}
                  skill={skill}
                  onRemove={() => removeRandomSkill(assigned.skill_id)}
                />
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Session trigger buttons */}
      {!compact && !editMode && (
        <div className="px-4 pb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => assignRandomSkill(character.id, 'failure')}
            className="text-xs px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg transition-colors"
          >
            Trigger Failure
          </button>
          <button
            onClick={() => assignRandomSkill(character.id, 'random')}
            className="text-xs px-3 py-1.5 bg-stone-900 hover:bg-stone-700 border border-stone-600 text-stone-300 rounded-lg transition-colors"
          >
            Random Event
          </button>
        </div>
      )}
    </div>
  )
}
