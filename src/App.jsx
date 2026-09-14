import { useEffect, useMemo, useRef, useState } from 'react'
import { applications as appStore, files as fileStore, removeApplication } from './lib/db.js'
import { exportBackup, importBackup } from './lib/backup.js'
import { emptyApplication, isOpen, STATUS_BY_ID } from './lib/model.js'
import ApplicationCard from './components/ApplicationCard.jsx'
import Drawer from './components/Drawer.jsx'
import Rail from './components/Rail.jsx'
import { IconDownload, IconPlus } from './components/Icons.jsx'

const emptyFilters = { query: '', statuses: [], sort: 'recenti' }

export default function App() {
  const [items, setItems] = useState([])
  const [attachments, setAttachments] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const importRef = useRef(null)

  async function refresh() {
    const [apps, allFiles] = await Promise.all([appStore.all(), fileStore.all()])
    setItems(apps)
    setAttachments(allFiles)
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => {
      setLoading(false)
      setToast('Il browser non permette di salvare i dati in locale.')
    })
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const countByApplication = useMemo(() => {
    const map = {}
    for (const file of attachments) {
      map[file.applicationId] = (map[file.applicationId] || 0) + 1
    }
    return map
  }, [attachments])

  const visible = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const filtered = items.filter((item) => {
      if (filters.statuses.length && !filters.statuses.includes(item.status)) return false
      if (!query) return true
      return [item.company, item.role, item.notes, item.location, item.source, item.contact]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    })

    const byDate = (a, b) => (a.appliedAt || '').localeCompare(b.appliedAt || '')
    return filtered.sort((a, b) => {
      if (filters.sort === 'vecchie') return byDate(a, b)
      if (filters.sort === 'azienda') return (a.company || '').localeCompare(b.company || '', 'it')
      if (filters.sort === 'follow') {
        const left = a.nextActionAt || '9999-12-31'
        const right = b.nextActionAt || '9999-12-31'
        return left.localeCompare(right) || byDate(b, a)
      }
      return byDate(b, a)
    })
  }, [items, filters])

  function openNew() {
    setEditing({ application: emptyApplication(), attachments: [], isNew: true })
  }

  function openExisting(application) {
    setEditing({
      application,
      attachments: attachments.filter((file) => file.applicationId === application.id),
      isNew: false,
    })
  }

  async function save(application, files, removedIds) {
    await appStore.put({ ...application, updatedAt: new Date().toISOString() })
    for (const id of removedIds) await fileStore.remove(id)
    for (const file of files) {
      const { isNew, ...record } = file
      await fileStore.put({ ...record, applicationId: application.id })
    }
    await refresh()
    setEditing(null)
    setToast(
      `${application.role || application.company}: salvata come "${
        STATUS_BY_ID[application.status]?.label ?? application.status
      }"`,
    )
  }

  async function destroy(id) {
    const target = items.find((item) => item.id === id)
    const name = target?.company || target?.role || 'questa candidatura'
    if (!window.confirm(`Eliminare ${name} e i suoi allegati? L’operazione non è reversibile.`)) {
      return
    }
    await removeApplication(id)
    await refresh()
    setEditing(null)
    setToast('Candidatura eliminata')
  }

  async function handleExport() {
    const count = await exportBackup()
    setToast(`Esportate ${count} candidature con i relativi allegati`)
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const count = await importBackup(file)
      await refresh()
      setToast(`Importate ${count} candidature`)
    } catch (error) {
      setToast(error.message || 'Importazione non riuscita')
    }
  }

  const openCount = items.filter(isOpen).length

  return (
    <div className="shell">
      <header className="masthead">
        <div>
          <h1>Candidature</h1>
          <p>
            {loading
              ? 'Carico i dati salvati…'
              : `${items.length} in archivio, ${openCount} ancora aperte. Tutto resta su questo dispositivo.`}
          </p>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => importRef.current?.click()}>
            Importa
          </button>
          <button type="button" className="btn" onClick={handleExport}>
            <IconDownload /> Esporta
          </button>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <IconPlus /> Nuova candidatura
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImport}
          />
        </div>
      </header>

      <div className="layout">
        <Rail applications={items} filters={filters} onChange={setFilters} />

        <main>
          <div className="list-head">
            <p>
              {visible.length === items.length
                ? `${items.length} candidature`
                : `${visible.length} su ${items.length} candidature`}
            </p>
            {(filters.query !== '' || filters.statuses.length > 0) && (
              <button type="button" className="btn btn-sm" onClick={() => setFilters(emptyFilters)}>
                Azzera i filtri
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="empty">
              <h3>{items.length === 0 ? 'Nessuna candidatura, per ora' : 'Nessun risultato'}</h3>
              <p>
                {items.length === 0
                  ? 'Aggiungi la prima: bastano ruolo e azienda, poi allega il CV e incolla il link dell’annuncio.'
                  : 'Prova a cambiare i filtri o a cercare un altro termine.'}
              </p>
              {items.length === 0 ? (
                <button type="button" className="btn btn-primary" onClick={openNew}>
                  <IconPlus /> Aggiungi una candidatura
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => setFilters(emptyFilters)}>
                  Azzera i filtri
                </button>
              )}
            </div>
          ) : (
            <div className="list">
              {visible.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  attachmentCount={countByApplication[application.id] || 0}
                  onOpen={() => openExisting(application)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {editing && (
        <Drawer
          key={editing.application.id}
          application={editing.application}
          attachments={editing.attachments}
          isNew={editing.isNew}
          onSave={save}
          onDelete={destroy}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
