import React, { useState } from 'react'
import recipes from '../recipes.json'
import RecipeCard from './RecipeCard.jsx'

export default function App() {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="recetas">🍴</span>
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
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-20 text-sm">
            No se encontraron recetas para "{query}"
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
