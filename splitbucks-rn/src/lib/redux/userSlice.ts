import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { User } from '../../types/types'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    value: {} as User,
  },
  reducers: {
    setValue: (state, action: PayloadAction<User>) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setValue } = userSlice.actions

export default userSlice.reducer