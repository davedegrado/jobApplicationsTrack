import { useEffect, useRef, useState } from 'react'
import { STATUSES, STATUS_BY_ID, WORK_MODES, formatDate } from '../lib/model.js'
import { newId } from '../lib/db.js'
import Attachments from './Attachments.jsx'
import { IconClose, IconLink, IconTrash } from './Icons.jsx'

export default function Drawer({ application, attachments, isNew, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(application)
  const [items, setItems] = useState(attachments)
  const [removed, setRemoved] = useState([])
  const [error, setError] = useState('')
  const firstField = useRef(null)

  useEffect(() => {
    firstField.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function addFiles(entries) {
    setItems((current) => [
      ...current,
      ...entries.map(({ file, kind }) => ({
        id: newId(),
        applicationId: draft.id,
        name: file.name,
        kind,
        type: file.type,
        size: file.size,
        addedAt: new Date().toISOString(),
        blob: file,
        isNew: true,
      })),
    ])
  }

  function removeFile(id) {
    setItems((current) => current.filter((item) => item.id !== id))
    setRemoved((current) => [...current, id])
  }

  function changeKind(id, kind) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, kind } : item)))
  }

  function submit(event) {
    event.preventDefault()
    if (!draft.company.trim() && !draft.role.trim()) {
      setError('Inserisci almeno l’azienda o il ruolo per salvare.')
      return
    }

    const history = [...(draft.history || [])]
    if (draft.status !== application.status || isNew) {
      history.push({ status: draft.status, at: new Date().toISOString() })
    }

    onSave({ ...draft, history }, items, removed)
  }

  const statusColor = `var(--st-${draft.status})`

  return (
    <>
      <button className="scrim" onClick={onClose} aria-label="Chiudi il pannello" />
      <form className="drawer" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Dettaglio candidatura">
        <header className="drawer-head">
          <h2>{isNew ? 'Nuova candidatura' : draft.company || draft.role || 'Candidatura'}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} title="Chiudi">
            <IconClose />
            <span className="visually-hidden">Chiudi</span>
          </button>
        </header>

        <div className="drawer-body">
          <div className="field">
            <label htmlFor="role">Ruolo</label>
            <input
              id="role"
              ref={firstField}
              value={draft.role}
              onChange={(event) => set('role', event.target.value)}
              placeholder="Frontend Developer"
            />
          </div>

          <div className="field">
            <label htmlFor="company">Azienda</label>
            <input
              id="company"
              value={draft.company}
              onChange={(event) => set('company', event.target.value)}
              placeholder="Nome dell’azienda"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="status">Stato</label>
              <select
                id="status"
                value={draft.status}
                onChange={(event) => set('status', event.target.value)}
                style={{ borderLeft: `4px solid ${statusColor}` }}
              >
                {STATUSES.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="appliedAt">Data candidatura</label>
              <input
                id="appliedAt"
                type="date"
                value={draft.appliedAt}
                onChange={(event) => set('appliedAt', event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="url">Link all’annuncio</label>
            <input
              id="url"
              type="url"
              inputMode="url"
              value={draft.url}
              onChange={(event) => set('url', event.target.value)}
              placeholder="https://…"
            />
            {draft.url && (
              <a href={draft.url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 13 }}>
                <IconLink width={13} height={13} /> Apri l’annuncio in una nuova scheda
              </a>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="location">Luogo</label>
              <input
                id="location"
                value={draft.location}
                onChange={(event) => set('location', event.target.value)}
                placeholder="Milano"
              />
            </div>
            <div className="field">
              <label htmlFor="workMode">Modalità</label>
              <select
                id="workMode"
                value={draft.workMode}
                onChange={(event) => set('workMode', event.target.value)}
              >
                <option value="">—</option>
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="source">Dove l’hai trovata</label>
              <input
                id="source"
                value={draft.source}
                onChange={(event) => set('source', event.target.value)}
                placeholder="LinkedIn, referral, sito…"
              />
            </div>
            <div className="field">
              <label htmlFor="salary">RAL / compenso</label>
              <input
                id="salary"
                value={draft.salary}
                onChange={(event) => set('salary', event.target.value)}
                placeholder="35–40k"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="contact">Referente</label>
            <input
              id="contact"
              value={draft.contact}
              onChange={(event) => set('contact', event.target.value)}
              placeholder="Nome, email o telefono"
            />
          </div>

          <div className="section-rule">Prossima azione</div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="nextActionAt">Quando</label>
              <input
                id="nextActionAt"
                type="date"
                value={draft.nextActionAt}
                onChange={(event) => set('nextActionAt', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="nextActionNote">Cosa</label>
              <input
                id="nextActionNote"
                value={draft.nextActionNote}
                onChange={(event) => set('nextActionNote', event.target.value)}
                placeholder="Sollecito via email"
              />
            </div>
          </div>

          <div className="section-rule">Allegati</div>
          <Attachments
            items={items}
            onAdd={addFiles}
            onRemove={removeFile}
            onKindChange={changeKind}
          />

          <div className="section-rule">Note</div>
          <div className="field">
            <label className="visually-hidden" htmlFor="notes">
              Note
            </label>
            <textarea
              id="notes"
              value={draft.notes}
              onChange={(event) => set('notes', event.target.value)}
              placeholder="Domande poste al colloquio, nome del recruiter, impressioni…"
            />
          </div>

          {(draft.history || []).length > 0 && (
            <>
              <div className="section-rule">Cronologia</div>
              <ul className="timeline">
                {[...draft.history].reverse().map((entry, index) => (
                  <li key={`${entry.at}-${index}`}>
                    <time>{formatDate(entry.at.slice(0, 10))}</time>
                    <span>{STATUS_BY_ID[entry.status]?.label || entry.status}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13.5, marginTop: 16 }} role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="drawer-foot">
          {isNew ? (
            <span />
          ) : (
            <button type="button" className="btn btn-danger" onClick={() => onDelete(draft.id)}>
              <IconTrash /> Elimina
            </button>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              Salva
            </button>
          </div>
        </footer>
      </form>
    </>
  )
}
