import { useState } from 'react'
import type { Character, RandomSkill } from '../types'
import { useStore } from '../store/useStore'
import { statModifier } from '../lib/dice'
import randomSkillsData from '../data/random_skills.json'

interface Props {
  character: Character
  onClose: () => void
}

const STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

export default function CharacterSheetModal({ character, onClose }: Props) {
  const { updateCharacter } = useStore()
  const [urlInput, setUrlInput] = useState(character.image_url ?? '')

  const handleUrlBlur = () => {
    const trimmed = urlInput.trim()
    if (trimmed !== (character.image_url ?? '')) {
      updateCharacter(character.id, { image_url: trimmed || undefined })
    }
  }

  const imageUrl = urlInput.trim()

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #char-print-area, #char-print-area * { visibility: visible; }
          #char-print-area { position: fixed; top: 0; left: 0; width: 100%; }
          @page { size: landscape; margin: 0.4in; }
        }
      `}</style>

      <div
        className="no-print fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-8 px-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="w-full max-w-5xl">

          {/* Toolbar */}
          <div className="no-print flex items-center gap-3 mb-3">
            <input
              type="url"
              placeholder="Portrait URL — paste a hosted image link (e.g. https://i.imgur.com/...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlBlur}
              className="flex-1 px-3 py-2 text-sm border border-stone-600 rounded-lg bg-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm font-semibold bg-stone-700 text-stone-100 rounded-lg hover:bg-stone-600 border border-stone-500 whitespace-nowrap"
            >
              Print Sheet
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white text-xl leading-none px-1"
            >
              ✕
            </button>
          </div>

          {/* ── PRINTABLE SHEET ── */}
          <div
            id="char-print-area"
            className="bg-[#f5f0e8] text-stone-900 shadow-2xl rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: '#3a4b20' }}>
              <div>
                <h1 className="text-2xl font-bold text-stone-100 uppercase tracking-widest">
                  {character.name}
                </h1>
                <p className="text-stone-400 text-sm italic">
                  {character.class} — Level {character.level}
                </p>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Armor Class</div>
                  <div className="text-3xl font-bold text-stone-100">{character.armor_class}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Hit Points</div>
                  <div className="text-3xl font-bold text-stone-100">
                    {character.hit_points.current}
                    <span className="text-stone-400 text-base">/{character.hit_points.max}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Stamina</div>
                  <div className="text-xl text-stone-100 tracking-widest mt-1">
                    {Array.from({ length: character.stamina.max }).map((_, i) =>
                      i < character.stamina.current ? '●' : '○'
                    ).join(' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-[420px]">

              {/* Left column: portrait + stat block + background */}
              <div className="w-44 shrink-0 border-r border-stone-400/40 flex flex-col">

                {/* Portrait */}
                <div
                  className="h-44 flex items-center justify-center overflow-hidden border-b border-stone-400/40 bg-stone-300/20"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={character.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-10 select-none">⚔</span>
                  )}
                </div>

                {/* 6-stat block */}
                <div className="grid grid-cols-3 border-b border-stone-400/40">
                  {STATS.map((stat, i) => (
                    <div
                      key={stat}
                      className="text-center py-2 border-stone-400/40"
                      style={{
                        borderRight: (i + 1) % 3 !== 0 ? '1px solid rgba(87,83,78,0.4)' : 'none',
                        borderBottom: i < 3 ? '1px solid rgba(87,83,78,0.4)' : 'none',
                      }}
                    >
                      <div className="text-[9px] font-bold uppercase text-stone-500">{stat}</div>
                      <div className="text-sm font-bold text-stone-900">{character.stats[stat]}</div>
                      <div className="text-[10px] text-stone-500">{statModifier(character.stats[stat])}</div>
                    </div>
                  ))}
                </div>

                {/* Background */}
                <div className="p-3 flex-1">
                  <div className="text-[9px] font-bold uppercase text-stone-500 tracking-wider mb-1.5">Background</div>
                  <p className="text-[10px] text-stone-600 italic leading-relaxed">
                    "{character.background}"
                  </p>
                </div>
              </div>

              {/* Right section: abilities + random skills */}
              <div className="flex-1 flex flex-col">

                {/* Ability categories */}
                <div className="flex-1 p-4 grid grid-cols-3 gap-3 content-start">
                  {character.ability_categories.map((cat, ci) => (
                    <div
                      key={ci}
                      className="border border-stone-400/40 rounded p-2.5 bg-white/40"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className="text-[11px] font-bold uppercase tracking-wide leading-tight"
                          style={{ color: '#3a4b20' }}
                        >
                          {cat.name}
                        </h4>
                        <div className="text-[10px] text-stone-500 leading-none ml-1 shrink-0">
                          {Array.from({ length: cat.xp.max }).map((_, i) =>
                            i < cat.xp.current ? '●' : '○'
                          ).join('')}
                        </div>
                      </div>
                      <p className="text-[9px] text-stone-500 italic mb-2">"{cat.flavor}"</p>
                      <div className="space-y-1">
                        {cat.abilities.map((ability) => (
                          <div key={ability.name} className="text-[10px] leading-snug">
                            <span className="font-semibold text-stone-800">{ability.name}: </span>
                            <span className="text-stone-600">{ability.description}</span>
                            {ability.stamina_cost > 0 && (
                              <span className="ml-1 font-bold" style={{ color: '#92400e' }}>
                                [{ability.stamina_cost} ST]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Random skills */}
                {character.random_skills.length > 0 && (
                  <div className="px-4 pb-4 pt-3 border-t border-stone-400/40">
                    <div className="text-[9px] font-bold uppercase text-stone-500 tracking-wider mb-2">
                      Random Skills
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {character.random_skills.map((assigned) => {
                        const skill = (randomSkillsData.skills as RandomSkill[]).find(
                          (s) => s.id === assigned.skill_id
                        )
                        return skill ? (
                          <div
                            key={assigned.skill_id}
                            className="text-[10px] border border-stone-400/50 rounded px-2 py-1 bg-white/50 leading-snug"
                          >
                            <span className="font-semibold text-stone-800">{skill.name}: </span>
                            <span className="text-stone-600">{skill.effect}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
