import { useRef, useState } from 'react'
import { ATTACHMENT_KINDS, formatSize } from '../lib/model.js'
import { IconClip, IconDownload, IconTrash } from './Icons.jsx'

function guessKind(name) {
  const lower = name.toLowerCase()
  if (lower.includes('cv') || lower.includes('curriculum') || lower.includes('resume')) return 'cv'
  if (lower.includes('lettera') || lower.includes('cover') || lower.includes('motivazion'))
    return 'lettera'
  return 'altro'
}

export default function Attachments({ items, onAdd, onRemove, onKindChange }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)

  function addFiles(fileList) {
    const files = Array.from(fileList || [])
    if (files.length) onAdd(files.map((file) => ({ file, kind: guessKind(file.name) })))
  }

  function download(item) {
    const url = URL.createObjectURL(item.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = item.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div>
      <div className="files" style={{ marginBottom: items.length ? 10 : 0 }}>
        {items.map((item) => (
          <div className="file" key={item.id}>
            <select
              className="file-kind"
              value={item.kind}
              onChange={(event) => onKindChange(item.id, event.target.value)}
              aria-label={`Tipo di allegato per ${item.name}`}
              style={{ border: 0, cursor: 'pointer' }}
            >
              {ATTACHMENT_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
            <div className="file-name">
              {item.name}
              <small>{formatSize(item.size)}</small>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => download(item)}
                title="Scarica"
              >
                <IconDownload />
                <span className="visually-hidden">Scarica {item.name}</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onRemove(item.id)}
                title="Rimuovi"
              >
                <IconTrash />
                <span className="visually-hidden">Rimuovi {item.name}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`dropzone${over ? ' over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setOver(false)
          addFiles(event.dataTransfer.files)
        }}
      >
        <IconClip /> Trascina qui CV, lettera o altri file, oppure scegli dal dispositivo
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
