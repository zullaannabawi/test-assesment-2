import { configureStore } from '@reduxjs/toolkit'
import { memberDashboardReducer } from './slices/member-dashboard.slice'
import { memberFormReducer } from './slices/member-form.slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      memberDashboard: memberDashboardReducer,
      memberForm: memberFormReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
