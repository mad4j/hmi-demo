import { createSlice } from '@reduxjs/toolkit'

const connectionSlice = createSlice({
  name: 'connection',
  initialState: { isConnected: true, isLoading: false },
  reducers: {
    setConnected(state, action) { state.isConnected = action.payload },
    setLoading(state, action) { state.isLoading = action.payload },
  },
})

export const { setConnected, setLoading } = connectionSlice.actions
export default connectionSlice.reducer