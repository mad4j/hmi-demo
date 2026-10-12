import EnumEditorModal from './EnumEditorModal.jsx'
import PercentageEditorModal from './PercentageEditorModal.jsx'
import TextEditorModal from './TextEditorModal.jsx'
import DateEditorModal from './DateEditorModal.jsx'

// Registry of parameter editors: parameter `type` -> modal editor.
// To support a new editable type, add the modal component and register it here.
//   Component      editor modal component
//   getProps       extra props computed from the parameter and the current values
//   supportsNext   whether the editor offers "confirm and edit next parameter"
//   keyed          remount the editor when the edited parameter changes
const textEditor = {
  Component: TextEditorModal,
  supportsNext: true,
  keyed: true,
  getProps: (param, { textValue }) => ({
    value: textValue,
    inputType: param.type === 'password' ? 'password' : 'text',
  }),
}

export const editorRegistry = {
  enum: {
    Component: EnumEditorModal,
    supportsNext: false,
    getProps: (param, { value }) => ({ value, options: param.options ?? [] }),
  },
  percentage: {
    Component: PercentageEditorModal,
    supportsNext: true,
    getProps: (param, { value }) => ({ value: Number(value ?? 0) }),
  },
  text: textEditor,
  password: textEditor,
  date: {
    Component: DateEditorModal,
    supportsNext: true,
    getProps: (param, { value }) => ({ value: value ?? '' }),
  },
}

export const EDITABLE_TYPES = Object.keys(editorRegistry)
