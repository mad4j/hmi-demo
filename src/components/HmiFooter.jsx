import { AppIcon } from './AppIcon.jsx'
import './HmiFooter.css'

export const HmiFooter = ({ 
  level1Items, 
  activeLevel1Id, 
  isAtHome = false, 
  canGoToPreviousPage = false,
  onGoBack,
  onGoHome,
  onSelectItem 
}) => {
  return (
    <footer className="bar bottom-bar">
      <button
        className="tab-button tab-button--back"
        type="button"
        aria-label="Back"
        disabled={!canGoToPreviousPage}
        onClick={onGoBack}
      >
        <AppIcon name="back" size={22} />
      </button>
      <button
        className={`tab-button tab-button--home ${isAtHome ? 'tab-button--active' : ''}`}
        type="button"
        aria-label="Home"
        onClick={onGoHome}
      >
        <AppIcon name="home" size={22} />
        <span className="tab-label">Home</span>
      </button>
      {level1Items.map((item) => (
        <button
          key={item.id}
          className={`tab-button ${item.id === activeLevel1Id ? 'tab-button--active' : ''}`}
          type="button"
          onClick={() => onSelectItem(item)}
        >
          {item.icon && <AppIcon name={item.icon} size={22} />}
          <span className="tab-label">{item.label}</span>
        </button>
      ))}
    </footer>
  )
}