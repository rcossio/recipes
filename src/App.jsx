import React, { useState } from 'react'
import recipes from '../recipes.json'
import fruits from '../fruits.json'
import RecipeCard from './RecipeCard.jsx'
import FruitCard from './FruitCard.jsx'

export default function App() {
  const [view, setView] = useState('platos') // 'platos' | 'frutas'
  const [query, setQuery] = useState('')

  const filtered = query.trim() === ''
    ? recipes
    : recipes.filter(r => {
        const q = query.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        )
      })

  const TabButton = ({ id, emoji, label }) => (
    <button
      type="button"
      onClick={() => setView(id)}
      aria-pressed={view === id}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        view === id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span role="img" aria-hidden="true">{emoji}</span>{label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="cocina">🍴</span>
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <TabButton id="platos" emoji="🍽️" label="Platos" />
              <TabButton id="frutas" emoji="🍓" label="Frutas" />
            </div>
          </div>

          {view === 'platos' && (
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar recetas..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {filtered.length !== recipes.length && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {filtered.length} / {recipes.length}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === 'platos' ? (
          filtered.length === 0 ? (
            <p className="text-center text-gray-400 mt-20 text-sm">
              No se encontraron recetas para "{query}"
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Fruta para complementar fibra. La etiqueta marca la densidad de fibra (g por 100 kcal): alta ≥ 3, media ≥ 1,5.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fruits.map(fruit => (
                <FruitCard key={fruit.id} fruit={fruit} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
