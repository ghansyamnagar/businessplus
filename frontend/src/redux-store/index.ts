// // Third-party Imports
// import { configureStore } from '@reduxjs/toolkit'

// // Slice Imports
// import chatReducer from '@/redux-store/slices/chat'
// import calendarReducer from '@/redux-store/slices/calendar'
// import kanbanReducer from '@/redux-store/slices/kanban'
// import emailReducer from '@/redux-store/slices/email'

// export const store = configureStore({
//   reducer: {
//     chatReducer,
//     calendarReducer,
//     kanbanReducer,
//     emailReducer
//   },
//   middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
// })

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
// redux-store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

// existing reducers
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'
import userReducer from '@/redux-store/slices/user/user.slice'
import kpiTrackerReducer from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import strategicObjectivesReducer from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import initiativesReducer from '@/redux-store/slices/initiatives/initiatives.slice'
import actionPlansReducer from '@/redux-store/slices/actionplans/actionplans.slice'
import taskTrackersReducer from '@/redux-store/slices/taskTracker/taskTracker.slice'
import projectReducer from '@/redux-store/slices/project/project.slice'
import permissionReducer from '@/redux-store/slices/permissionSlice'
import companyReducer from '@/redux-store/slices/companySlice'


// new saga
import rootSaga from './rootSaga'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    userReducer,
    kpiTrackerReducer,
    strategicObjectivesReducer,
    initiativesReducer,
    actionPlansReducer,
    taskTrackersReducer,
    projectReducer,
    permissionReducer,
    companyReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false // callbacks allowed
    }).concat(sagaMiddleware)
})

// saga start
sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
