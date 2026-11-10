import { configureStore } from '@reduxjs/toolkit'
import { memberDashboardReducer } from './slices/member-dashboard.slice'
import { memberFormReducer } from './slices/member-form.slice'
import { memberDeletionReducer } from './slices/member-deletion.slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      memberDashboard: memberDashboardReducer,
      memberForm: memberFormReducer,
      memberDeletion: memberDeletionReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
