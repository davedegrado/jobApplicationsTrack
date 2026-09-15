import {
  PIPELINE,
  STATUS_BY_ID,
  formatDate,
  isOpen,
  needsFollowUp,
  reachedStage,
  domainOf,
} from '../lib/model.js'
import { IconBell, IconClip, IconLink, IconPin, IconCalendar } from './Icons.jsx'

export default function ApplicationCard({ application, attachmentCount, onOpen }) {
  const status = STATUS_BY_ID[application.status]
  const spine = `var(--st-${application.status})`
  const stage = reachedStage(application)
  const open = isOpen(application)

  function handleKey(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <div
      className="card"
      style={{ '--spine': spine }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKey}
      aria-label={`${application.role || 'Ruolo da definire'} — ${application.company || 'Azienda da definire'}`}
    >
      <div>
        <div className="card-title">
          {application.role || 'Ruolo da definire'}
          <small>{application.company || 'Azienda da definire'}</small>
        </div>

        <div className="card-meta">
          {application.appliedAt && (
            <span>
              <IconCalendar width={13} height={13} />
              {formatDate(application.appliedAt)}
            </span>
          )}
          {application.location && (
            <span>
              <IconPin width={13} height={13} />
              {application.location}
              {application.workMode ? ` · ${application.workMode}` : ''}
            </span>
          )}
          {!application.location && application.workMode && <span>{application.workMode}</span>}
          {application.salary && (
            <span title="RAL / compenso">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <rect x="3" y="6" width="18" height="13" rx="2.5" />
                <path d="M3 10h18M16.5 14.5h.01" />
              </svg>
              {application.salary}
            </span>
          )}
          {application.source && <span>{application.source}</span>}
          {attachmentCount > 0 && (
            <span>
              <IconClip width={13} height={13} />
              {attachmentCount}
            </span>
          )}
          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(event) => event.stopPropagation()}
            >
              <IconLink width={13} height={13} /> {domainOf(application.url)}
            </a>
          )}
        </div>
      </div>

      <div className="card-side">
        <span className="status-tag" style={{ color: spine }}>
          {status?.label || application.status}
        </span>
        <div className="steps" style={{ '--spine': spine }} aria-hidden="true">
          {PIPELINE.map((step) => (
            <i
              key={step.id}
              className={[step.stage <= stage ? 'on' : '', open ? '' : 'closed'].join(' ').trim()}
            />
          ))}
        </div>
        {needsFollowUp(application) && (
          <span className="flag">
            <IconBell width={12} height={12} />
            Da seguire
          </span>
        )}
      </div>
    </div>
  )
}
