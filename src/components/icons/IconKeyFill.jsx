export default function IconKeyFill({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* head of key */}
      <circle cx="7" cy="12" r="4" />

      {/* hole in key head (simulato) */}
      <circle cx="7" cy="12" r="1.5" fill="#fff" />

      {/* shaft */}
      <rect x="11" y="11" width="10" height="2.5" rx="1" />

      {/* teeth */}
      <rect x="17" y="11" width="2" height="4" />
      <rect x="20" y="11" width="2" height="3" />
    </svg>
  )
}