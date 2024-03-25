import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import friendsReducer from './friendsSlice'
import groupsReducer from './groupsSlice'


const store = configureStore({
  reducer: {
    user: userReducer,
    friends: friendsReducer,
    groups: groupsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  })
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store;