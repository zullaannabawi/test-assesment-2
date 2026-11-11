import { configureStore } from '@reduxjs/toolkit'
import { memberListReducer } from './slices/member-list.slice'
import { memberFormReducer } from './slices/member-form.slice'
import { memberDeletionReducer } from './slices/member-deletion.slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      memberList: memberListReducer,
      memberForm: memberFormReducer,
      memberDeletion: memberDeletionReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
