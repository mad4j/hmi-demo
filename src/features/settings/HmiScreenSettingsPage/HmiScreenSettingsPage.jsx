import { useState } from 'react'
import EnumParameterWidget from '@/features/parameters/widgets/EnumParameterWidget/EnumParameterWidget.jsx'
import EnumEditorModal from '@/features/parameters/modals/EnumEditorModal/EnumEditorModal.jsx'
import { useScreenProfile, SCREEN_PROFILES } from './useScreenProfile.js'

export default function HmiScreenSettingsPage() {
  const { screenProfile, setScreenProfile } = useScreenProfile()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="settings-page">
      <div className="settings-widget">
        <EnumParameterWidget
          name="Screen"
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
