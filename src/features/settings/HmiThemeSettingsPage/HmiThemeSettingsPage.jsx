import { useState } from 'react'
import EnumParameterWidget from '@/features/parameters/widgets/EnumParameterWidget/EnumParameterWidget.jsx'
import EnumEditorModal from '@/features/parameters/modals/EnumEditorModal/EnumEditorModal.jsx'
import { useTheme, VALID_THEMES } from './useTheme.js'

export default function HmiThemeSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="settings-page">
      <div className="settings-widget">
        <EnumParameterWidget
          name="Theme"
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
