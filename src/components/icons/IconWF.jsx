export default function IconWaveform({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="12" x2="5" y2="12" />
      <line x1="7" y1="8" x2="7" y2="16" />
      <line x1="10" y1="5" x2="10" y2="19" />
      <line x1="13" y1="9" x2="13" y2="15" />
      <line x1="16" y1="4" x2="16" y2="20" />
      <line x1="19" y1="10" x2="19" y2="14" />
      <line x1="21" y1="12" x2="21" y2="12" />
    </svg>
  )
}