import { useState } from 'react'
import ParameterWidget from './ParameterWidget.jsx'
import EnumEditorModal from './EnumEditorModal.jsx'
import { useTheme, VALID_THEMES } from '../composables/useTheme.js'

export default function HmiThemeSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="settings-page">
      <div className="settings-widget">
        <ParameterWidget
          name="Theme"
          type="enum"
          value={theme.toUpperCase()}
          options={VALID_THEMES.map((t) => t.toUpperCase())}
          onEdit={() => setIsEditing(true)}
        />
      </div>
      {isEditing && (
        <EnumEditorModal
          name="Theme"
          value={theme.toUpperCase()}
          options={VALID_THEMES.map((t) => t.toUpperCase())}
          onConfirm={(v) => { setTheme(v.toLowerCase()); setIsEditing(false) }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}
