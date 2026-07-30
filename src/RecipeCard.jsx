import React, { useState, useMemo } from 'react'

// ---------- servings parsing ----------
function parseBaseServings(base) {
  if (!base) return null
  const paren = base.match(/\((\d+)/)
  const first = base.match(/\d+/)
  const n = paren ? parseInt(paren[1], 10) : first ? parseInt(first[0], 10) : null
  if (!n) return null
  const unit = /porci/i.test(base) ? 'porciones' : 'personas'
  return { n, unit }
}
function unitLabel(unit, n) {
  if (unit === 'porciones') return n === 1 ? 'porción' : 'porciones'
  return n === 1 ? 'persona' : 'personas'
}

// ---------- quantity formatting / scaling ----------
const FRACTIONS = [
  [1 / 8, '⅛'], [1 / 5, '⅕'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'],
  [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [4 / 5, '⅘'], [7 / 8, '⅞'],
]
function formatQty(x) {
  if (!isFinite(x)) return String(x)
  const whole = Math.round(x)
  if (Math.abs(x - whole) < 0.04) return String(whole)
  const intPart = Math.floor(x)
  const frac = x - intPart
  for (const [val, glyph] of FRACTIONS) {
    if (Math.abs(frac - val) < 0.04) return (intPart > 0 ? intPart : '') + glyph
  }
  return parseFloat(x.toFixed(2)).toString()
}
const num = s => parseFloat(String(s).replace(',', '.'))
function scaleName(name, factor) {
  if (factor === 1) return name
  if (factor === 0) return name // handled by caller (struck through)
  const s = name.trimStart()
  let m
  m = s.match(/^(\d+)\s+(\d+)\/(\d+)(\s.*|)$/)
  if (m) return formatQty((parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3])) * factor) + m[4]
  m = s.match(/^(\d+)\/(\d+)(.*)$/)
  if (m) return formatQty((parseInt(m[1]) / parseInt(m[2])) * factor) + m[3]
  m = s.match(/^(\d+(?:[.,]\d+)?)\s+a\s+(\d+(?:[.,]\d+)?)(\s.*|)$/i)
  if (m) return `${formatQty(num(m[1]) * factor)} a ${formatQty(num(m[2]) * factor)}${m[3]}`
  m = s.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)(\s.*|)$/)
  if (m) return `${formatQty(num(m[1]) * factor)}-${formatQty(num(m[2]) * factor)}${m[3]}`
  m = s.match(/^(\d+(?:[.,]\d+)?)(.*)$/)
  if (m) return formatQty(num(m[1]) * factor) + m[2]
  return name
}

// ---------- nutrition ----------
// ingredient.n = per 100 g -> [kcal, protein, carbs, fat, fiber]; ingredient.g = grams at base servings
const round = (x, d = 0) => {
  const p = Math.pow(10, d)
  return Math.round(x * p) / p
}
function ingredientBaseMacros(it) {
  const g = it.g || 0
  const n = it.n || [0, 0, 0, 0, 0]
  return n.map(v => (v * g) / 100) // macros for this ingredient at base servings, editFactor 1
}

// ---------- icons ----------
function GearIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#c2410c' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function Stepper({ value, onDec, onInc, decDisabled }) {
  return (
    <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 overflow-hidden">
      <button type="button" onClick={onDec} disabled={decDisabled} aria-label="Menos"
        className="w-6 h-6 flex items-center justify-center text-orange-700 font-semibold hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed">−</button>
      <span className="min-w-[2.2ch] px-1 text-center text-xs font-semibold text-gray-800 tabular-nums">{value}</span>
      <button type="button" onClick={onInc} aria-label="Más"
        className="w-6 h-6 flex items-center justify-center text-orange-700 font-semibold hover:bg-orange-100">+</button>
    </div>
  )
}

function MacroPanel({ totals, servings, unit }) {
  const per = v => round(v / servings)
  const Cell = ({ label, val, u, strong }) => (
    <div className="flex flex-col items-center">
      <span className={`tabular-nums ${strong ? 'text-base font-bold text-gray-900' : 'text-sm font-semibold text-gray-800'}`}>{val}{u}</span>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  )
  return (
    <div className="rounded-xl bg-orange-50/70 border border-orange-100 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-5 gap-2 flex-1">
          <Cell label="kcal" val={per(totals[0])} strong />
          <Cell label="Prot" val={per(totals[1])} u="g" />
          <Cell label="Carb" val={per(totals[2])} u="g" />
          <Cell label="Grasa" val={per(totals[3])} u="g" />
          <Cell label="Fibra" val={per(totals[4])} u="g" />
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 text-center">
        por porción · plato entero {round(totals[0])} kcal ({servings} {unitLabel(unit, servings)})
      </p>
    </div>
  )
}

function SectionHeader({ subtitle, subtitleEmoji }) {
  if (!subtitle) return null
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
      {subtitleEmoji && <span>{subtitleEmoji}</span>}{subtitle}
    </p>
  )
}

function StepsSection({ section }) {
  return (
    <div className="mb-4">
      <SectionHeader subtitle={section.subtitle} subtitleEmoji={section.subtitleEmoji} />
      <ol className="space-y-2">
        {section.items.map((step, i) => (
          <li key={i} className="flex gap-2 text-gray-800 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-semibold text-xs flex items-center justify-center">{i + 1}</span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function RecipeCard({ recipe }) {
  const base = parseBaseServings(recipe.base)
  const [servings, setServings] = useState(base ? base.n : 1)
  const [editMode, setEditMode] = useState(false)
  const [factors, setFactors] = useState({}) // key "s-i" -> per-ingredient multiplier

  const servingsFactor = base ? servings / base.n : 1
  const getF = key => (factors[key] === undefined ? 1 : factors[key])
  const stepF = (key, delta) => setFactors(f => {
    const cur = f[key] === undefined ? 1 : f[key]
    return { ...f, [key]: Math.max(0, round(cur + delta, 2)) }
  })
  const anyTweak = Object.values(factors).some(v => v !== 1)
  const resetTweaks = () => setFactors({})

  const ingredientSections = recipe.sections.filter(s => s.type === 'ingredients')
  const stepSections = recipe.sections.filter(s => s.type === 'steps')

  // live totals (scaled by servings + per-ingredient tweaks)
  const totals = useMemo(() => {
    const t = [0, 0, 0, 0, 0]
    recipe.sections.forEach((sec, si) => {
      if (sec.type !== 'ingredients') return
      sec.items.forEach((it, ii) => {
        const eff = servingsFactor * getF(`${si}-${ii}`)
        const bm = ingredientBaseMacros(it)
        for (let k = 0; k < 5; k++) t[k] += bm[k] * eff
      })
    })
    return t
  }, [recipe, servingsFactor, factors])

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <header className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" role="img" aria-hidden="true">{recipe.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">{recipe.title}</h2>
            {recipe.subtitle && <p className="text-xs text-gray-500 mt-0.5">{recipe.subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button type="button" onClick={() => setEditMode(e => !e)}
              aria-pressed={editMode} aria-label="Editar receta"
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${editMode ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <GearIcon active={editMode} />
            </button>
            {recipe.tag && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">⚠️ {recipe.tag}</span>
            )}
          </div>
        </div>
        {recipe.description && <p className="text-sm text-gray-500 mt-2">{recipe.description}</p>}

        {base && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Porciones</span>
            <Stepper value={servings} decDisabled={servings <= 1}
              onDec={() => setServings(s => Math.max(1, s - 1))}
              onInc={() => setServings(s => s + 1)} />
            <span className="text-xs text-gray-500">{unitLabel(base.unit, servings)}</span>
            {editMode && anyTweak && (
              <button type="button" onClick={resetTweaks}
                className="ml-auto text-xs text-orange-700 underline decoration-dotted hover:text-orange-900">Reiniciar ajustes</button>
            )}
          </div>
        )}

        <div className="mt-3">
          <MacroPanel totals={totals} servings={servings} unit={base ? base.unit : 'porciones'} />
          <p className="text-[10px] text-gray-400 mt-1 text-center">valores aproximados · referencia USDA FoodData Central</p>
        </div>
      </header>

      {ingredientSections.length > 0 && (
        <section className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ingredientes</h3>
            {editMode && <span className="text-[10px] text-orange-600">tocá − / + para calibrar</span>}
          </div>
          {recipe.sections.map((sec, si) => {
            if (sec.type !== 'ingredients') return null
            return (
              <div key={si} className="mb-4">
                <SectionHeader subtitle={sec.subtitle} subtitleEmoji={sec.subtitleEmoji} />
                <ul className="space-y-1.5">
                  {sec.items.map((ing, ii) => {
                    const key = `${si}-${ii}`
                    const f = getF(key)
                    const eff = servingsFactor * f
                    const kcal = round(ingredientBaseMacros(ing)[0] * eff)
                    const display = eff === 0 ? ing.name : scaleName(ing.name, eff)
                    return (
                      <li key={ii} className="flex items-start gap-2 text-gray-800 text-sm">
                        {editMode && (
                          <span className="mt-0.5">
                            <Stepper value={f === 1 ? '1×' : `${f}×`} decDisabled={f <= 0}
                              onDec={() => stepF(key, -0.25)} onInc={() => stepF(key, 0.25)} />
                          </span>
                        )}
                        {ing.emoji && <span className="text-base leading-tight" role="img" aria-hidden="true">{ing.emoji}</span>}
                        <span className={`flex-1 ${eff === 0 ? 'line-through text-gray-400' : ''}`}>{display}</span>
                        {editMode && <span className="text-[11px] text-gray-400 tabular-nums whitespace-nowrap">{kcal} kcal</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </section>
      )}

      {stepSections.length > 0 && (
        <section className="px-5 py-4 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preparación</h3>
          {stepSections.map((sec, i) => <StepsSection key={i} section={sec} />)}
        </section>
      )}

      {(recipe.serving || recipe.notes) && (
        <footer className="px-5 py-3 border-t border-gray-100 bg-orange-50 mt-auto">
          {recipe.serving && (
            <p className="text-sm text-gray-700 flex items-start gap-2"><span role="img" aria-hidden="true">🍽️</span><span className="italic">{recipe.serving}</span></p>
          )}
          {recipe.notes && (
            <p className="text-sm text-gray-600 flex items-start gap-2 mt-1"><span role="img" aria-hidden="true">💡</span><span>{recipe.notes}</span></p>
          )}
        </footer>
      )}
    </article>
  )
}
