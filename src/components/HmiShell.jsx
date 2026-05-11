import './HmiShell.css'

export const HmiShell = ({ theme, header, notification, children, footer }) => {
  return (
    <div className="hmi-shell" data-theme={theme}>
      {header}
      {notification}
      <main className="content">
        {children}
      </main>
      {footer}
    </div>
  )
}