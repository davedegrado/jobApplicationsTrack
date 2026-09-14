// Persistenza locale con IndexedDB: i dati e i file restano nel browser
// dell'utente, non viene inviato nulla in rete.

const DB_NAME = 'candidature'
const DB_VERSION = 1
const APPS = 'applications'
const FILES = 'files'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(APPS)) {
        db.createObjectStore(APPS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(FILES)) {
        const store = db.createObjectStore(FILES, { keyPath: 'id' })
        store.createIndex('applicationId', 'applicationId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

function tx(store, mode, run) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(store, mode)
        const request = run(transaction.objectStore(store))
        transaction.onerror = () => reject(transaction.error)
        transaction.oncomplete = () => resolve(request ? request.result : undefined)
      }),
  )
}

export function newId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const applications = {
  all: () => tx(APPS, 'readonly', (s) => s.getAll()),
  put: (record) => tx(APPS, 'readwrite', (s) => s.put(record)),
  remove: (id) => tx(APPS, 'readwrite', (s) => s.delete(id)),
  clear: () => tx(APPS, 'readwrite', (s) => s.clear()),
}

export const files = {
  all: () => tx(FILES, 'readonly', (s) => s.getAll()),
  byApplication: (applicationId) =>
    tx(FILES, 'readonly', (s) => s.index('applicationId').getAll(applicationId)),
  put: (record) => tx(FILES, 'readwrite', (s) => s.put(record)),
  remove: (id) => tx(FILES, 'readwrite', (s) => s.delete(id)),
  clear: () => tx(FILES, 'readwrite', (s) => s.clear()),
}

export async function removeApplication(id) {
  const attachments = await files.byApplication(id)
  await Promise.all(attachments.map((file) => files.remove(file.id)))
  await applications.remove(id)
}
