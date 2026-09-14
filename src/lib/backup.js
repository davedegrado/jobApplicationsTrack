import { applications, files, newId } from './db.js'

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64, type) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: type || 'application/octet-stream' })
}

export async function exportBackup() {
  const [apps, attachments] = await Promise.all([applications.all(), files.all()])
  const payload = {
    format: 'candidature-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    applications: apps,
    files: await Promise.all(
      attachments.map(async (file) => ({
        id: file.id,
        applicationId: file.applicationId,
        name: file.name,
        kind: file.kind,
        type: file.type,
        size: file.size,
        addedAt: file.addedAt,
        data: await blobToBase64(file.blob),
      })),
    ),
  }

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `candidature-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  return payload.applications.length
}

/** Unisce il backup ai dati esistenti: le candidature già presenti vengono sostituite. */
export async function importBackup(file) {
  const payload = JSON.parse(await file.text())
  if (payload.format !== 'candidature-backup') {
    throw new Error('Il file non è un backup delle candidature.')
  }

  const existing = await applications.all()
  const known = new Set(existing.map((item) => item.id))
  const remap = new Map()

  for (const application of payload.applications || []) {
    const id = known.has(application.id) ? application.id : application.id || newId()
    remap.set(application.id, id)
    await applications.put({ ...application, id })
  }

  const currentFiles = await files.all()
  const knownFiles = new Set(currentFiles.map((item) => item.id))
  for (const file of payload.files || []) {
    if (knownFiles.has(file.id)) continue
    await files.put({
      id: file.id || newId(),
      applicationId: remap.get(file.applicationId) || file.applicationId,
      name: file.name,
      kind: file.kind,
      type: file.type,
      size: file.size,
      addedAt: file.addedAt,
      blob: base64ToBlob(file.data, file.type),
    })
  }

  return (payload.applications || []).length
}
