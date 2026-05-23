import React from 'react'

function SectionHeader({ subtitle, subtitleEmoji }) {
  if (!subtitle) return null
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
      {subtitleEmoji && <span>{subtitleEmoji}</span>}
      {subtitle}
    </p>
  )
}

function IngredientsSection({ section }) {
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
            <span>{ing.name}</span>
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

export default function RecipeCard({ recipe }) {
  const ingredientSections = recipe.sections.filter(s => s.type === 'ingredients')
  const stepSections = recipe.sections.filter(s => s.type === 'steps')

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <header className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-hidden="true">
            {recipe.emoji}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              {recipe.title}
            </h2>
            {recipe.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{recipe.subtitle}</p>
            )}
          </div>
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-500 mt-2">{recipe.description}</p>
        )}
      </header>

      {ingredientSections.length > 0 && (
        <section className="px-5 py-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Ingredientes
          </h3>
          {ingredientSections.map((sec, i) => (
            <IngredientsSection key={i} section={sec} />
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
