import { newId } from './db.js'

export const STATUSES = [
  { id: 'da_inviare', label: 'Da inviare', stage: 0, open: true },
  { id: 'inviata', label: 'Inviata', stage: 1, open: true },
  { id: 'colloquio', label: 'Colloquio', stage: 2, open: true },
  { id: 'offerta', label: 'Offerta', stage: 3, open: true },
  { id: 'rifiutata', label: 'Rifiutata', stage: null, open: false },
  { id: 'ritirata', label: 'Ritirata', stage: null, open: false },
]

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]))

export const PIPELINE = STATUSES.filter((s) => s.stage !== null)

export const ATTACHMENT_KINDS = [
  { id: 'cv', label: 'CV' },
  { id: 'lettera', label: 'Lettera di presentazione' },
  { id: 'annuncio', label: 'Copia annuncio' },
  { id: 'altro', label: 'Altro' },
]

export const WORK_MODES = ['In sede', 'Ibrido', 'Da remoto']

export function emptyApplication() {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: newId(),
    company: '',
    role: '',
    url: '',
    status: 'da_inviare',
    source: '',
    location: '',
    workMode: '',
    salary: '',
    appliedAt: today,
    nextActionAt: '',
    nextActionNote: '',
    contact: '',
    notes: '',
    createdAt: new Date().toISOString(),
    history: [],
  }
}

/** Lo stadio più avanzato raggiunto, anche se poi la candidatura è stata chiusa. */
export function reachedStage(application) {
  const stages = [STATUS_BY_ID[application.status]?.stage ?? -1]
  for (const entry of application.history || []) {
    stages.push(STATUS_BY_ID[entry.status]?.stage ?? -1)
  }
  return Math.max(...stages)
}

export function isOpen(application) {
  return STATUS_BY_ID[application.status]?.open ?? true
}

export function needsFollowUp(application) {
  if (!application.nextActionAt || !isOpen(application)) return false
  const today = new Date().toISOString().slice(0, 10)
  return application.nextActionAt <= today
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'annuncio'
  }
}
