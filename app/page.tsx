<div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
  <button
    type="button"
    onClick={() => setTypeFilter('all')}
    className={`shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
      typeFilter === 'all'
        ? 'bg-neutral-900 text-white'
        : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
    }`}
  >
    All
  </button>

  <button
    type="button"
    onClick={() => setTypeFilter('restaurant')}
    className={`shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
      typeFilter === 'restaurant'
        ? 'bg-red-600 text-white'
        : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
    }`}
  >
    Restaurants
  </button>

  <button
    type="button"
    onClick={() => setTypeFilter('grocery')}
    className={`shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
      typeFilter === 'grocery'
        ? 'bg-green-600 text-white'
        : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
    }`}
  >
    Grocery
  </button>

  <button
    type="button"
    onClick={handleLocateMe}
    className="shrink-0 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
  >
    Locate Me
  </button>

  <button
    type="button"
    onClick={handleReset}
    className="shrink-0 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
  >
    Reset
  </button>
</div>