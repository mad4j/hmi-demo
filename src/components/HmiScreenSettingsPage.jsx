import { useState } from 'react'
import ParameterWidget from './ParameterWidget.jsx'
import EnumEditorModal from './EnumEditorModal.jsx'
import { useScreenProfile, SCREEN_PROFILES } from '../composables/useScreenProfile.js'

export default function HmiScreenSettingsPage() {
  const { screenProfile, setScreenProfile } = useScreenProfile()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="settings-page">
      <div className="settings-widget">
        <ParameterWidget
          name="Screen"
          type="enum"
          value={screenProfile}
          options={SCREEN_PROFILES}
          optionsValue={SCREEN_PROFILES}
          onEdit={() => setIsEditing(true)}
        />
      </div>
      {isEditing && (
        <EnumEditorModal
          name="Screen"
          value={screenProfile}
          options={SCREEN_PROFILES}
          optionsValue={SCREEN_PROFILES}
          onConfirm={(v) => { setScreenProfile(v); setIsEditing(false) }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}
