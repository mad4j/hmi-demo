import { useSelector, useDispatch } from 'react-redux'
import { setTheme as setThemeAction } from '../store/themeSlice.js'
export { VALID_THEMES } from '../store/themeSlice.js'

export const useTheme = () => {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.theme.theme)
  const setTheme = (value) => dispatch(setThemeAction(value))
  return { theme, setTheme }
}