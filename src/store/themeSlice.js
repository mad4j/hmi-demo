import { createSlice } from '@reduxjs/toolkit'

export const VALID_THEMES = ['light', 'dark', 'nvis']
const STORAGE_KEY = 'hmi-theme'
const DEFAULT_THEME = 'dark'

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && VALID_THEMES.includes(stored)) return stored
  } catch {}
  return DEFAULT_THEME
}

const applyTheme = (theme) => {
  document.body.setAttribute('data-theme', theme)
  try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: initialTheme },
  reducers: {
    setTheme(state, action) {
      const t = action.payload
      if (!VALID_THEMES.includes(t)) return
      state.theme = t
      applyTheme(t)
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer