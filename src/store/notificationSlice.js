import { createSlice } from '@reduxjs/toolkit'

const PRIORITY = { ERROR: 4, WARNING: 3, SUCCESS: 2, NORMAL: 1, MENU: 0 }

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    status: 'NORMAL',
    message: '',
    isAcknowledged: true,
    displayMode: 'AUTO',
  },
  reducers: {
    setNotification(state, action) {
      const { status, message, options = {} } = action.payload
      const incoming = PRIORITY[status] ?? 0
      const current = PRIORITY[state.status] ?? 0
      
      // Always update if not acknowledged, otherwise check priority
      if (!state.isAcknowledged || incoming >= current) {
        state.status = status
        state.message = message
        state.displayMode = options.displayMode ?? 'AUTO'
        state.isAcknowledged = options.displayMode === 'ACKNOWLEDGED' ? false : true
      }
    },
    clearNotification(state) {
      state.status = 'NORMAL'
      state.message = ''
      state.isAcknowledged = true
      state.displayMode = 'AUTO'
    },
    acknowledgeNotification(state) {
      state.isAcknowledged = true
    },
  },
})

export const { setNotification, clearNotification, acknowledgeNotification } = notificationSlice.actions
export default notificationSlice.reducer