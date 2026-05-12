import './HmiShell.css'

export default function HmiShell({ theme, header, notification, footer, children }) {
  return (
    <div className="hmi-shell" data-theme={theme}>
      {header}
      <main className="content">
        {children}
      </main>
      {notification}
      {footer}
    </div>
  )
}
