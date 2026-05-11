import { createSlice } from '@reduxjs/toolkit'

const HOME_PAGE_ID = '__home__'

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    currentPageId: HOME_PAGE_ID,
    pageHistory: [],
  },
  reducers: {
    navigateToPage(state, action) {
      const pageId = action.payload
      if (pageId === state.currentPageId) return
      state.pageHistory.push(state.currentPageId)
      state.currentPageId = pageId
    },
    goHome(state) {
      state.pageHistory.push(state.currentPageId)
      state.currentPageId = HOME_PAGE_ID
    },
    goToPreviousPage(state) {
      const prev = state.pageHistory.pop()
      if (prev != null) {
        state.currentPageId = prev
      }
    },
  },
})

export const { navigateToPage, goHome, goToPreviousPage } = navigationSlice.actions
export default navigationSlice.reducer