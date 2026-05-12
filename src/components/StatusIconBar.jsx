import './StatusIconBar.css'
import AppIcon from './AppIcon.jsx'
import { menuConfig } from '../composables/useMenuConfig.js'
import { useParameterStore } from '../composables/useParameterStore.js'
import { useMenuNavigation } from '../composables/useMenuNavigation.js'

export default function StatusIconBar() {
  const { parameterValues } = useParameterStore()
  const { navigateToPage } = useMenuNavigation()

  const getTargetPageId = (icon) => {
    const currentState = parameterValues[icon.parameterId]
    const mappedPageId = icon.pageIdByState && typeof icon.pageIdByState === 'object'
      ? icon.pageIdByState[currentState]
      : ''
    return mappedPageId || icon.pageId
  }

  const stateClass = (parameterId) => {
    const val = parameterValues[parameterId]
    if (val === 'ok') return 'si--ok'
    if (val === 'warning') return 'si--warning'
    if (val === 'error') return 'si--error'
    return 'si--off'
  }

  return (
    <div className="status-icon-bar">
      {menuConfig.statusIcons.map((icon) => (
        <button
          key={icon.id}
          className={`si-btn ${stateClass(icon.parameterId)}`}
          type="button"
          aria-label={icon.label}
          title={icon.label}
          onClick={() => navigateToPage(getTargetPageId(icon))}
        >
          <AppIcon name={icon.icon} size={22} />
        </button>
      ))}
    </div>
  )
}
