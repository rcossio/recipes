import React from "react";

const recipe = {
  emoji: "🍚",
  title: "Risotto con durelli, calabaza y hongos",
  ingredients: [
    { emoji: "🍚", name: "Arroz" },
    { emoji: "🐔", name: "Durelli de pollo" },
    { emoji: "🧅", name: "Cebolla" },
    { emoji: "🎃", name: "Calabaza en cubitos chicos (mismo volumen que el arroz, en crudo)" },
    { emoji: "🍄", name: "Champignones fileteados" },
    { emoji: "🧈", name: "Manteca" },
    { emoji: "🧀", name: "Pecorino o queso rallado" },
    { emoji: "🥣", name: "Caldo de verduras" },
  ],
  steps: [
    "Se cortan los durelli lo más chico posible o se los procesa.",
    "Se cortan las cebollas chicas, la calabaza en cubitos chicos y los champignones fileteados.",
    "Se rehogan los durellis y la cebolla en un poco de aceite de oliva.",
    "Se agregan los champignones y la calabaza y se siguen rehogando unos minutos.",
    "Al mismo tiempo se pone a hervir el caldo por separado.",
    "Una vez cocinados los durellis y las verduras se agrega el arroz y se lo blanquea.",
    "De a poco se va agregando el caldo caliente a medida que se cocina el arroz. La calabaza se irá deshaciendo parcialmente y dará color al risotto.",
    "Una vez en su punto el arroz se hace el mantecado rallando queso y agregando un poco de manteca mezclando todo.",
  ],
  serving: "Se sirve en el momento.",
};

export default function RecipeCard() {
  return (
    <article className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <header className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-hidden="true">
            {recipe.emoji}
          </span>
          <h2 className="text-2xl font-semibold text-gray-900">
            {recipe.title}
          </h2>
        </div>
      </header>

      <section className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Ingredientes
        </h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-800">
              <span className="text-lg leading-tight" role="img" aria-hidden="true">
                {ing.emoji}
              </span>
              <span>{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-5 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Preparación
        </h3>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-gray-800">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="px-6 py-4 border-t border-gray-100 bg-orange-50">
        <p className="text-gray-800 flex items-center gap-2">
          <span role="img" aria-hidden="true">🍽️</span>
          <span className="italic">{recipe.serving}</span>
        </p>
      </footer>
    </article>
  );
}