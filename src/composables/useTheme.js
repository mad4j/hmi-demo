import { ref, computed, onMounted } from 'vue'

// ── Singleton state ───────────────────────────────────────
// Supported themes: 'dark' | 'light' | 'nvis'
// 'nvis' is a Night Vision Imaging System-safe low-luminance red palette
// (MIL-L-85762 / MIL-STD-1472H §5.3.5). Hardware photometric validation
// is still required for full MIL-L-85762 certification.
const VALID_THEMES = ['dark', 'light', 'nvis']
const STORAGE_KEY = 'hmi-theme'

const _stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const theme = ref(VALID_THEMES.includes(_stored) ? _stored : 'dark')

const _applyTheme = (value) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value)
  if (typeof document !== 'undefined') document.body.dataset.theme = value
}

export const useTheme = () => {
  // true for both 'dark' and 'nvis' themes (NVIS is dark-based)
  const isDark = computed(() => theme.value !== 'light')
  const isNvis = computed(() => theme.value === 'nvis')

  const toggleTheme = () => {
    // When in NVIS mode, toggling the dark switch exits NVIS back to dark.
    // Otherwise toggle between dark and light.
    if (theme.value === 'light') {
      theme.value = 'dark'
    } else if (theme.value === 'nvis') {
      theme.value = 'dark'
    } else {
      theme.value = 'light'
    }
    _applyTheme(theme.value)
  }

  const toggleNvisMode = () => {
    theme.value = theme.value === 'nvis' ? 'dark' : 'nvis'
    _applyTheme(theme.value)
  }

  onMounted(() => {
    _applyTheme(theme.value)
  })

  return { isDark, isNvis, theme, toggleTheme, toggleNvisMode }
}
