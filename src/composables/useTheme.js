import { ref, computed, onMounted } from 'vue'

// ── Singleton state ───────────────────────────────────────
// Supported themes: 'dark' | 'light' | 'nvis'
// 'nvis' is a Night Vision Imaging System-safe low-luminance red palette
// (MIL-L-85762 / MIL-STD-1472H §5.3.5). Hardware photometric validation
// is still required for full MIL-L-85762 certification.
const theme = ref('dark')

export const useTheme = () => {
  // true for both 'dark' and 'nvis' themes (NVIS is dark-based)
  const isDark = computed(() => theme.value !== 'light')
  const isNvis = computed(() => theme.value === 'nvis')

  const toggleTheme = () => {
    // NVIS mode: toggling the dark switch exits NVIS back to dark
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.body.dataset.theme = theme.value
  }

  const toggleNvisMode = () => {
    theme.value = theme.value === 'nvis' ? 'dark' : 'nvis'
    document.body.dataset.theme = theme.value
  }

  onMounted(() => {
    document.body.dataset.theme = theme.value
  })

  return { isDark, isNvis, theme, toggleTheme, toggleNvisMode }
}
