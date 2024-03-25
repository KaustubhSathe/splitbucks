import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Group, User } from '../../types/types'

export const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    value: [] as Group[],
  },
  reducers: {
    setValue: (state, action: PayloadAction<Group[]>) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setValue } = groupsSlice.actions

export default groupsSlice.reducer