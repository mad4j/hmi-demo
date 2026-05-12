import LinkWidget from './LinkWidget.jsx'

export default function HmiLinkGridPage({ items, onNavigate }) {
  return (
    <div className="widget-grid">
      {items.map((item) => (
        <LinkWidget
          key={item.id}
          label={item.label}
          icon={item.icon}
          onNavigate={() => onNavigate(item.id)}
        />
      ))}
    </div>
  )
}
