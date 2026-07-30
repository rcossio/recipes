import React from 'react'

const round = (x, d = 0) => {
  const p = Math.pow(10, d)
  return Math.round(x * p) / p
}
// comma decimals for es
const es = x => String(x).replace('.', ',')

function densityTag(dens) {
  if (dens >= 3) return { label: 'fibra alta', cls: 'bg-green-100 text-green-700 border-green-300' }
  if (dens >= 1.5) return { label: 'fibra media', cls: 'bg-amber-100 text-amber-700 border-amber-300' }
  return { label: 'fibra baja', cls: 'bg-gray-100 text-gray-500 border-gray-300' }
}

function Cell({ label, val, u, strong }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`tabular-nums ${strong ? 'text-base font-bold text-gray-900' : 'text-sm font-semibold text-gray-800'}`}>{es(val)}{u}</span>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  )
}

export default function FruitCard({ fruit }) {
  const [kcal, prot, carb, fat, fib] = fruit.n
  const dens = kcal > 0 ? fib / (kcal / 100) : 0
  const tag = densityTag(dens)
  const servK = round(kcal * fruit.unitG / 100)
  const servFib = round(fib * fruit.unitG / 100, 1)

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <header className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" role="img" aria-hidden="true">{fruit.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">{fruit.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">por 100 g</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${tag.cls}`}>{tag.label}</span>
        </div>
      </header>

      <section className="px-5 py-4">
        <div className="rounded-xl bg-orange-50/70 border border-orange-100 px-3 py-2.5">
          <div className="grid grid-cols-5 gap-2">
            <Cell label="kcal" val={round(kcal)} strong />
            <Cell label="Prot" val={round(prot, 1)} u="g" />
            <Cell label="Carb" val={round(carb, 1)} u="g" />
            <Cell label="Grasa" val={round(fat, 1)} u="g" />
            <Cell label="Fibra" val={round(fib, 1)} u="g" />
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-green-50 border border-green-100 px-3 py-2">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <span role="img" aria-hidden="true">🌾</span>
            <span><span className="font-semibold">{es(round(fib, 1))} g de fibra</span> cada 100 g · <span className="font-semibold tabular-nums">{es(round(dens, 1))}</span> g por 100 kcal</span>
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-3 flex items-start gap-2">
          <span role="img" aria-hidden="true">🍽️</span>
          <span>{fruit.unit}: <span className="tabular-nums">{servK}</span> kcal · <span className="tabular-nums">{es(servFib)}</span> g de fibra</span>
        </p>
      </section>

      <footer className="px-5 py-2 border-t border-gray-100 bg-orange-50 mt-auto">
        <p className="text-[10px] text-gray-400 text-center">valores aproximados · referencia USDA FoodData Central</p>
      </footer>
    </article>
  )
}
