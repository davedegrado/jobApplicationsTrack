const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconSearch = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
)

export const IconPlus = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconClose = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconLink = (props) => (
  <svg {...base} {...props}>
    <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.3 1.3" />
    <path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1.3-1.3" />
  </svg>
)

export const IconClip = (props) => (
  <svg {...base} {...props}>
    <path d="M20 11.5 12.2 19.3a5 5 0 0 1-7-7L12.9 4.4a3.3 3.3 0 1 1 4.7 4.7l-7.7 7.8a1.7 1.7 0 0 1-2.4-2.4l7.2-7.2" />
  </svg>
)

export const IconDownload = (props) => (
  <svg {...base} {...props}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
    <path d="M5 19h14" />
  </svg>
)

export const IconTrash = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M9.5 7V5h5v2M6.5 7l.8 12h9.4l.8-12" />
  </svg>
)

export const IconBell = (props) => (
  <svg {...base} {...props}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
    <path d="M13.7 20a2 2 0 0 1-3.4 0" />
  </svg>
)

export const IconPin = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
)

export const IconCalendar = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
    <path d="M8 3.5v4M16 3.5v4M4 10.5h16" />
  </svg>
)
