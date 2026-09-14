import { STATUSES, isOpen, needsFollowUp, reachedStage } from '../lib/model.js'
import { IconSearch } from './Icons.jsx'

export default function Rail({ applications, filters, onChange }) {
  const total = applications.length
  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, 0]))
  for (const application of applications) {
    if (counts[application.status] !== undefined) counts[application.status] += 1
  }

  const active = applications.filter(isOpen).length
  const interviewed = applications.filter((a) => reachedStage(a) >= 2).length
  const toFollow = applications.filter(needsFollowUp).length
  const max = Math.max(1, ...Object.values(counts))

  function toggleStatus(id) {
    const next = filters.statuses.includes(id)
      ? filters.statuses.filter((item) => item !== id)
      : [...filters.statuses, id]
    onChange({ ...filters, statuses: next })
  }

  return (
    <aside className="rail">
      <section className="panel">
        <h2>Situazione</h2>
        <div className="headline-number">
          {active}
          <span>candidature aperte su {total}</span>
        </div>

        <div className="funnel">
          {STATUSES.map((status) => (
            <div className="funnel-row" key={status.id}>
              <div>
                {status.label}
                <div className="funnel-bar">
                  <i
                    style={{
                      width: `${(counts[status.id] / max) * 100}%`,
                      background: `var(--st-${status.id})`,
                    }}
                  />
                </div>
              </div>
              <span className="funnel-count">{counts[status.id]}</span>
            </div>
          ))}
        </div>

        <p style={{ marginBottom: 0, marginTop: 16, fontSize: 13.5, color: 'var(--muted)' }}>
          {interviewed} {interviewed === 1 ? 'colloquio ottenuto' : 'colloqui ottenuti'}
          {toFollow > 0 && ` · ${toFollow} da seguire`}
        </p>
      </section>

      <section className="panel">
        <h2>Filtri</h2>
        <div className="field search">
          <IconSearch />
          <input
            type="search"
            value={filters.query}
            placeholder="Azienda, ruolo, note…"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            aria-label="Cerca fra le candidature"
          />
        </div>

        <div className="filter-chips">
          {STATUSES.map((status) => (
            <button
              type="button"
              key={status.id}
              className="chip"
              aria-pressed={filters.statuses.includes(status.id)}
              onClick={() => toggleStatus(status.id)}
            >
              <span className="dot" style={{ background: `var(--st-${status.id})` }} />
              {status.label}
            </button>
          ))}
        </div>

        <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
          <label htmlFor="sort">Ordina per</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) => onChange({ ...filters, sort: event.target.value })}
          >
            <option value="recenti">Data candidatura, dalla più recente</option>
            <option value="vecchie">Data candidatura, dalla più vecchia</option>
            <option value="follow">Prossima azione</option>
            <option value="azienda">Azienda A-Z</option>
          </select>
        </div>
      </section>
    </aside>
  )
}
