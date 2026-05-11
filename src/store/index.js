import { configureStore } from '@reduxjs/toolkit'
import navigationReducer from './navigationSlice.js'
import parametersReducer from './parametersSlice.js'
import themeReducer from './themeSlice.js'
import notificationReducer from './notificationSlice.js'
import connectionReducer from './connectionSlice.js'

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    parameters: parametersReducer,
    theme: themeReducer,
    notification: notificationReducer,
    connection: connectionReducer,
  },
})