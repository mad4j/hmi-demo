import './HmiFooter.css'
import IconBack from '@/icons/IconBack.jsx'
import IconHome from '@/icons/IconHome.jsx'
import { getIconByName } from '@/icons/iconRegistry.js'

export default function HmiFooter({ level1Items, activeLevel1Id, isAtHome, canGoToPreviousPage, onGoBack, onGoHome, onSelectItem }) {


  return (
    <footer className="bar bottom-bar">
      <button
        className="tab-button tab-button--back"
        type="button"
        aria-label="Back"
        disabled={!canGoToPreviousPage}
        onClick={onGoBack}
      >
        <IconBack size={50} />
      </button>
      <button
        className={`tab-button tab-button--home${isAtHome ? ' tab-button--active' : ''}`}
        type="button"
        aria-label="Home"
        onClick={onGoHome}
      >
        <IconHome size={20} />
        <span className="tab-label">Home</span>
      </button>
      {level1Items.map((item) => {
        const ItemIcon = item.icon ? getIconByName(item.icon) : null
        return (
          <button
            key={item.id}
            className={`tab-button${item.id === activeLevel1Id ? ' tab-button--active' : ''}`}
            type="button"
            onClick={() => onSelectItem(item)}
          >
            {ItemIcon && <ItemIcon size={20} />}
            <span className="tab-label">{item.label}</span>
          </button>
        )
      })}
    </footer>
  )
}
