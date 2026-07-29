import React, { useState } from 'react'

// --- Servings parsing & scaling helpers ---

// Parse a numeric base + unit from the free-text `base` field.
// Prefers a number inside parentheses (e.g. "1 pizza (2 porciones)" -> 2),
// otherwise the first number (e.g. "3-4 personas" -> 3).
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

const FRACTIONS = [
  [1 / 8, '⅛'], [1 / 5, '⅕'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'],
  [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [4 / 5, '⅘'], [7 / 8, '⅞'],
]

// Format a scaled quantity into something human-friendly:
// whole numbers stay whole, common fractions become glyphs, else up to 2 decimals.
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

// Scale the leading quantity of an ingredient string by `factor`, leaving the
// rest (unit + name) untouched. Handles glued units ("300g"), spaced units
// ("300 g"), fractions ("1/2"), mixed ("1 1/2") and ranges ("1 a 2", "3-4").
// Strings with no leading number are returned unchanged.
function scaleName(name, factor) {
  if (!factor || factor === 1) return name
  const s = name.trimStart()
  let m

  // mixed fraction: "1 1/2 rest"
  m = s.match(/^(\d+)\s+(\d+)\/(\d+)(\s.*|)$/)
  if (m) return formatQty((parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3])) * factor) + m[4]

  // simple fraction: "1/2 rest" or "1/2rest"
  m = s.match(/^(\d+)\/(\d+)(.*)$/)
  if (m) return formatQty((parseInt(m[1]) / parseInt(m[2])) * factor) + m[3]

  // range with "a": "1 a 2 rest"
  m = s.match(/^(\d+(?:[.,]\d+)?)\s+a\s+(\d+(?:[.,]\d+)?)(\s.*|)$/i)
  if (m) return `${formatQty(num(m[1]) * factor)} a ${formatQty(num(m[2]) * factor)}${m[3]}`

  // range with "-": "3-4 rest"
  m = s.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)(\s.*|)$/)
  if (m) return `${formatQty(num(m[1]) * factor)}-${formatQty(num(m[2]) * factor)}${m[3]}`

  // plain number, possibly glued to a unit: "300 rest" / "300g rest" / "1,5 rest"
  m = s.match(/^(\d+(?:[.,]\d+)?)(.*)$/)
  if (m) return formatQty(num(m[1]) * factor) + m[2]

  return name
}

function SectionHeader({ subtitle, subtitleEmoji }) {
  if (!subtitle) return null
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
      {subtitleEmoji && <span>{subtitleEmoji}</span>}
      {subtitle}
    </p>
  )
}

function IngredientsSection({ section, factor }) {
  return (
    <div className="mb-4">
      <SectionHeader subtitle={section.subtitle} subtitleEmoji={section.subtitleEmoji} />
      <ul className="space-y-1.5">
        {section.items.map((ing, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-800 text-sm">
            {ing.emoji && (
              <span className="text-base leading-tight" role="img" aria-hidden="true">
                {ing.emoji}
              </span>
            )}
            <span>{scaleName(ing.name, factor)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepsSection({ section }) {
  return (
    <div className="mb-4">
      <SectionHeader subtitle={section.subtitle} subtitleEmoji={section.subtitleEmoji} />
      <ol className="space-y-2">
        {section.items.map((step, i) => (
          <li key={i} className="flex gap-2 text-gray-800 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-semibold text-xs flex items-center justify-center">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ServingsControl({ base, servings, setServings }) {
  const factor = servings / base.n
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs text-gray-500">Porciones</span>
      <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 overflow-hidden">
        <button
          type="button"
          onClick={() => setServings(s => Math.max(1, s - 1))}
          disabled={servings <= 1}
          aria-label="Menos porciones"
          className="w-7 h-7 flex items-center justify-center text-orange-700 font-semibold hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="min-w-[2ch] px-1 text-center text-sm font-semibold text-gray-800 tabular-nums">
          {servings}
        </span>
        <button
          type="button"
          onClick={() => setServings(s => s + 1)}
          aria-label="Más porciones"
          className="w-7 h-7 flex items-center justify-center text-orange-700 font-semibold hover:bg-orange-100"
        >
          +
        </button>
      </div>
      <span className="text-xs text-gray-500">{unitLabel(base.unit, servings)}</span>
      {factor !== 1 && (
        <span className="text-xs text-gray-400">(×{parseFloat(factor.toFixed(2))})</span>
      )}
    </div>
  )
}

export default function RecipeCard({ recipe }) {
  const base = parseBaseServings(recipe.base)
  const [servings, setServings] = useState(base ? base.n : 1)
  const factor = base ? servings / base.n : 1

  const ingredientSections = recipe.sections.filter(s => s.type === 'ingredients')
  const stepSections = recipe.sections.filter(s => s.type === 'steps')

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <header className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-hidden="true">
            {recipe.emoji}
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              {recipe.title}
            </h2>
            {recipe.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{recipe.subtitle}</p>
            )}
          </div>
          {recipe.tag && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
              ⚠️ {recipe.tag}
            </span>
          )}
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-500 mt-2">{recipe.description}</p>
        )}
        {base && (
          <ServingsControl base={base} servings={servings} setServings={setServings} />
        )}
      </header>

      {ingredientSections.length > 0 && (
        <section className="px-5 py-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Ingredientes
          </h3>
          {ingredientSections.map((sec, i) => (
            <IngredientsSection key={i} section={sec} factor={factor} />
          ))}
        </section>
      )}

      {stepSections.length > 0 && (
        <section className="px-5 py-4 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Preparación
          </h3>
          {stepSections.map((sec, i) => (
            <StepsSection key={i} section={sec} />
          ))}
        </section>
      )}

      {(recipe.serving || recipe.notes) && (
        <footer className="px-5 py-3 border-t border-gray-100 bg-orange-50 mt-auto">
          {recipe.serving && (
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <span role="img" aria-hidden="true">🍽️</span>
              <span className="italic">{recipe.serving}</span>
            </p>
          )}
          {recipe.notes && (
            <p className="text-sm text-gray-600 flex items-start gap-2 mt-1">
              <span role="img" aria-hidden="true">💡</span>
              <span>{recipe.notes}</span>
            </p>
          )}
        </footer>
      )}
    </article>
  )
}
