import { configureStore } from '@reduxjs/toolkit'
import { memberDashboardReducer } from './slices/member-dashboard.slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      memberDashboard: memberDashboardReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
