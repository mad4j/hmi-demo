import { ref, onMounted } from 'vue'

// ── Singleton state ───────────────────────────────────────
// Supported themes: 'light' | 'dark' | 'nvis'
// 'nvis' is a Night Vision Imaging System-safe low-luminance red palette
// (MIL-L-85762 / MIL-STD-1472H §5.3.5). Hardware photometric validation
// is still required for full MIL-L-85762 certification.
export const VALID_THEMES = ['light', 'dark', 'nvis']
const STORAGE_KEY = 'hmi-theme'

const _stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const theme = ref(VALID_THEMES.includes(_stored) ? _stored : 'dark')

const _applyTheme = (value) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value)
  if (typeof document !== 'undefined') document.body.dataset.theme = value
}

export const useTheme = () => {
  const setTheme = (value) => {
    if (!VALID_THEMES.includes(value)) return
    theme.value = value
    _applyTheme(theme.value)
  }

  onMounted(() => {
    _applyTheme(theme.value)
  })

  return { theme, setTheme }
}
