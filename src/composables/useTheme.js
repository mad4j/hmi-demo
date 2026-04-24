import { ref, onMounted } from 'vue'

// ── Singleton state ───────────────────────────────────────
const isDark = ref(true)

export const useTheme = () => {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.body.dataset.theme = isDark.value ? 'dark' : 'light'
  }

  onMounted(() => {
    document.body.dataset.theme = isDark.value ? 'dark' : 'light'
  })

  return { isDark, toggleTheme }
}
